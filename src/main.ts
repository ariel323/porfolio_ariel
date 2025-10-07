import { ProjectsManager } from "@components/ProjectsManager";
import { GitHubAPI } from "@utils/GitHubAPI";
import { ParticlesSystem } from "@components/ParticlesSystem";
import { AnimationsController } from "@components/AnimationsController";
import { UIComponents } from "@components/UIComponents";
import "./styles/main.css";

class Portfolio {
  private projectsManager: ProjectsManager;
  private githubAPI: GitHubAPI;
  private particlesSystem: ParticlesSystem | null = null;
  private animationsController: AnimationsController;
  private uiComponents: UIComponents;

  constructor() {
    this.projectsManager = new ProjectsManager();
    this.githubAPI = new GitHubAPI("ariel323");
    this.animationsController = new AnimationsController();
    this.uiComponents = new UIComponents(this.projectsManager, this.githubAPI);
  }

  /**
   * Initialize the portfolio
   */
  async init(): Promise<void> {
    try {
      console.log("🚀 Initializing Portfolio...");

      // Show loading state
      this.showLoader();

      // Load data
      await this.projectsManager.loadData();
      console.log("✅ Portfolio data loaded");

      // Initialize particles background
      this.initParticles();

      // Render all components
      await this.renderComponents();

      // Initialize animations
      this.animationsController.init();
      console.log("✅ Animations initialized");

      // Setup event listeners
      this.setupEventListeners();

      // Hide loader
      this.hideLoader();

      // Fetch GitHub data in background
      this.loadGitHubData();

      console.log("🎉 Portfolio initialized successfully!");
    } catch (error) {
      console.error("❌ Error initializing portfolio:", error);
      this.showError("Failed to load portfolio. Please refresh the page.");
    }
  }

  /**
   * Initialize particles system
   */
  private initParticles(): void {
    const container = document.getElementById("particles-container");
    if (!container) {
      console.warn("Particles container not found");
      return;
    }

    try {
      this.particlesSystem = new ParticlesSystem({
        container,
        particleCount: 100,
        particleColor: 0x64ffda,
        particleSize: 2,
        connectionDistance: 120,
        mouseRadius: 100,
      });
      this.particlesSystem.start();
      console.log("✅ Particles system started");
    } catch (error) {
      console.error("Error initializing particles:", error);
    }
  }

  /**
   * Render all UI components
   */
  private async renderComponents(): Promise<void> {
    // Render profile section
    this.uiComponents.renderProfile();

    // Render skills section
    this.uiComponents.renderSkills();

    // Render projects with filters
    this.uiComponents.renderProjectsWithFilters();

    // Render experience
    this.uiComponents.renderExperience();
  }

  /**
   * Load GitHub data in background
   */
  private async loadGitHubData(): Promise<void> {
    try {
      console.log("📊 Fetching GitHub data...");

      const repos = await this.githubAPI.fetchRepositories();
      const stats = this.githubAPI.buildStatsFromRepos(repos);

      this.uiComponents.renderGitHubStats(stats);
      this.uiComponents.renderGitHubRepositories(repos);
      this.uiComponents.updateProjectsWithGitHubData(repos);

      console.log("✅ GitHub data loaded");
    } catch (error) {
      console.error("Error loading GitHub data:", error);
      const message =
        error instanceof Error
          ? error.message
          : "No pudimos conectar con GitHub. Intentalo más tarde.";
      this.uiComponents.renderGitHubError(message);
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const target = anchor.getAttribute("href");
        if (target) {
          const element = document.querySelector(target);
          element?.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    // Theme toggle (if implemented)
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        this.toggleTheme();
      });
    }

    // Copy to clipboard for code snippets
    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        const code = target.previousElementSibling?.textContent;
        if (code) {
          this.copyToClipboard(code);
          this.showNotification("Copied to clipboard!");
        }
      });
    });
  }

  /**
   * Toggle theme
   */
  private toggleTheme(): void {
    const body = document.body;
    const currentTheme = body.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    this.showNotification(`Switched to ${newTheme} theme`);
  }

  /**
   * Copy text to clipboard
   */
  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Failed to copy:", err);
    });
  }

  /**
   * Show notification
   */
  private showNotification(message: string, duration: number = 3000): void {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, duration);
  }

  /**
   * Show loader
   */
  private showLoader(): void {
    const loader = document.getElementById("loader");
    if (loader) {
      loader.style.display = "flex";
    }
  }

  /**
   * Hide loader
   */
  private hideLoader(): void {
    const loader = document.getElementById("loader");
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = "0";
        setTimeout(() => {
          loader.style.display = "none";
        }, 300);
      }, 500);
    }
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.particlesSystem) {
      this.particlesSystem.destroy();
    }
    this.animationsController.destroy();
  }
}

// Initialize portfolio when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const portfolio = new Portfolio();
  portfolio.init();

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    portfolio.destroy();
  });
});

// Hot module replacement for development
if (import.meta.hot) {
  import.meta.hot.accept();
}
