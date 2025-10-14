import { ProjectsManager } from "@components/ProjectsManager";
import { GitHubAPI } from "@utils/GitHubAPI";
import { ParticlesSystem } from "@components/ParticlesSystem";
import { AnimationsController } from "@components/AnimationsController";
import { UIComponents } from "@components/UIComponents";
import { ExperienceTimeline } from "@components/ExperienceTimeline";
import { InteractiveTerminal } from "@components/InteractiveTerminal";
import { CodeEditor } from "@components/CodeEditor";
import { LiveDashboard } from "@components/LiveDashboard";
import { NarrativeScroll } from "@components/NarrativeScroll";
import { VisualIdentity } from "@components/VisualIdentity";
import "./styles/main.css";

class Portfolio {
  private projectsManager: ProjectsManager;
  private githubAPI: GitHubAPI;
  private particlesSystem: ParticlesSystem | null = null;
  private animationsController: AnimationsController;
  private uiComponents: UIComponents;
  private experienceTimeline: ExperienceTimeline | null = null;
  private terminal: InteractiveTerminal | null = null;
  private codeEditor: CodeEditor | null = null;
  private dashboard: LiveDashboard | null = null;
  private narrativeScroll: NarrativeScroll | null = null;
  private visualIdentity: VisualIdentity | null = null;

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

      // Initialize narrative scroll system
      this.narrativeScroll = new NarrativeScroll();
      console.log("✅ Narrative scroll initialized");

      // Initialize visual identity (cursor, microinteractions)
      this.visualIdentity = new VisualIdentity();
      console.log("✅ Visual identity applied");

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

    // Render interactive terminal
    this.renderTerminal();

    // Render code editor
    this.renderCodeEditor();

    // Render live dashboard
    this.renderDashboard();

    // Render experience timeline
    this.renderExperienceTimeline();

    // Render projects with filters
    this.uiComponents.renderProjectsWithFilters();

    // Render experience
    this.uiComponents.renderExperience();
  }

  /**
   * Render interactive terminal
   */
  private renderTerminal(): void {
    const data = this.projectsManager.getData();
    if (data) {
      try {
        this.terminal = new InteractiveTerminal("interactive-terminal", data);
        console.log("✅ Interactive terminal rendered");
      } catch (error) {
        console.warn(
          "⚠️ Terminal container not found, skipping terminal render"
        );
      }
    }
  }

  /**
   * Render code editor
   */
  private renderCodeEditor(): void {
    const data = this.projectsManager.getData();
    if (data) {
      try {
        this.codeEditor = new CodeEditor("code-editor", data);
        console.log("✅ Code editor rendered");
      } catch (error) {
        console.warn(
          "⚠️ Code editor container not found, skipping editor render"
        );
      }
    }
  }

  /**
   * Render live dashboard
   */
  private renderDashboard(): void {
    try {
      this.dashboard = new LiveDashboard("live-dashboard");
      console.log("✅ Live dashboard rendered");
    } catch (error) {
      console.warn(
        "⚠️ Dashboard container not found, skipping dashboard render"
      );
    }
  }

  /**
   * Render experience timeline section
   */
  private renderExperienceTimeline(): void {
    const data = this.projectsManager.getData();

    // Only render if data is available
    if (data?.experiences && data?.education && data?.certifications) {
      this.experienceTimeline = new ExperienceTimeline({
        experiences: data.experiences,
        education: data.education,
        certifications: data.certifications,
      });
      this.experienceTimeline.render();
      console.log("✅ Experience timeline rendered");
    } else {
      console.warn("⚠️ Experience data not available");
    }
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

      // Update dashboard with GitHub data
      if (this.dashboard) {
        this.dashboard.updateStats(stats, repos);
      }

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

    // Mobile menu toggle
    const mobileToggle = document.getElementById("mobile-toggle");
    const mobileMenu = document.querySelector(".header__menu");
    const mobileOverlay = document.getElementById("menu-overlay");

    if (mobileToggle && mobileMenu && mobileOverlay) {
      const closeMobileMenu = () => {
        mobileMenu.classList.remove("header__menu--active");
        mobileOverlay.classList.remove("header__overlay--active");
        mobileToggle.classList.remove("header__mobile-toggle--active");
      };

      const openMobileMenu = () => {
        mobileMenu.classList.add("header__menu--active");
        mobileOverlay.classList.add("header__overlay--active");
        mobileToggle.classList.add("header__mobile-toggle--active");
      };

      mobileToggle.addEventListener("click", () => {
        const isActive = mobileMenu.classList.contains("header__menu--active");

        if (isActive) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });

      // Close menu when clicking overlay
      mobileOverlay.addEventListener("click", closeMobileMenu);

      // Close menu when clicking the X button (pseudo-element area)
      mobileMenu.addEventListener("click", (e) => {
        const mouseEvent = e as MouseEvent;
        const rect = mobileMenu.getBoundingClientRect();
        const closeButtonArea = {
          left: rect.right - 60,
          right: rect.right - 12,
          top: rect.top + 12,
          bottom: rect.top + 60,
        };

        const x = mouseEvent.clientX;
        const y = mouseEvent.clientY;

        if (
          x >= closeButtonArea.left &&
          x <= closeButtonArea.right &&
          y >= closeButtonArea.top &&
          y <= closeButtonArea.bottom
        ) {
          closeMobileMenu();
        }
      });

      // Close menu when clicking a nav link
      document.querySelectorAll(".header__menu__link").forEach((link) => {
        link.addEventListener("click", closeMobileMenu);
      });
    }

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
    if (this.terminal) {
      this.terminal.destroy();
    }
    if (this.codeEditor) {
      this.codeEditor.destroy();
    }
    if (this.dashboard) {
      this.dashboard.destroy();
    }
    if (this.narrativeScroll) {
      this.narrativeScroll.destroy();
    }
    if (this.visualIdentity) {
      this.visualIdentity.destroy();
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
