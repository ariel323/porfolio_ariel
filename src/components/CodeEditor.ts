import type { PortfolioData, Project } from "@/types";

interface Tab {
  id: string;
  title: string;
  content: string;
  language: string;
  project?: Project;
}

export class CodeEditor {
  private container: HTMLElement;
  private data: PortfolioData;
  private tabs: Tab[] = [];
  private activeTabId: string | null = null;
  private currentProject: Project | null = null;

  constructor(containerId: string, data: PortfolioData) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Code Editor container #${containerId} not found`);
    }

    this.container = container;
    this.data = data;

    this.initializeTabs();
    this.render();
    this.setupEventListeners();
  }

  private initializeTabs(): void {
    // Welcome tab
    this.tabs.push({
      id: "welcome",
      title: "📋 README.md",
      content: this.generateReadmeContent(),
      language: "markdown",
    });

    // Add tabs for featured projects
    if (this.data.projects && this.data.projects.length > 0) {
      this.data.projects
        .filter((p) => p.featured)
        .slice(0, 3)
        .forEach((project) => {
          this.tabs.push({
            id: project.id,
            title: `💻 ${project.title}.ts`,
            content: this.generateProjectCode(project),
            language: "typescript",
            project: project,
          });
        });
    }

    // Skills overview tab
    this.tabs.push({
      id: "skills",
      title: "🛠️ skills.json",
      content: this.generateSkillsJSON(),
      language: "json",
    });

    this.activeTabId = "welcome";
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="code-editor">
        <div class="code-editor__header">
          <div class="code-editor__tabs">
            ${this.tabs.map((tab) => this.renderTab(tab)).join("")}
          </div>
          <div class="code-editor__actions">
            <button class="code-editor__action" data-action="copy" title="Copy code">
              <i class="fas fa-copy"></i>
            </button>
            <button class="code-editor__action" data-action="download" title="Download">
              <i class="fas fa-download"></i>
            </button>
            <button class="code-editor__action" data-action="fullscreen" title="Toggle fullscreen">
              <i class="fas fa-expand"></i>
            </button>
          </div>
        </div>

        <div class="code-editor__body">
          <!-- File Explorer -->
          <div class="code-editor__sidebar">
            <div class="code-editor__explorer">
              <div class="code-editor__explorer-header">
                <span>📁 EXPLORER</span>
                <button class="code-editor__explorer-toggle">
                  <i class="fas fa-chevron-down"></i>
                </button>
              </div>
              <div class="code-editor__explorer-tree">
                ${this.renderFileTree()}
              </div>
            </div>

            <!-- GitHub Stats Mini Panel -->
            <div class="code-editor__stats">
              <div class="code-editor__stats-header">
                <span>📊 STATS</span>
              </div>
              <div class="code-editor__stats-content" id="editor-stats">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Main Content Area -->
          <div class="code-editor__main">
            <!-- Breadcrumb -->
            <div class="code-editor__breadcrumb">
              <span>portfolio</span>
              <i class="fas fa-chevron-right"></i>
              <span id="current-file">README.md</span>
            </div>

            <!-- Code Content -->
            <div class="code-editor__content">
              <div class="code-editor__line-numbers" id="line-numbers">
                <!-- Generated dynamically -->
              </div>
              <pre class="code-editor__code"><code id="code-content" class="language-markdown"></code></pre>
            </div>

            <!-- Preview Panel -->
            <div class="code-editor__preview" id="code-preview">
              <div class="code-editor__preview-header">
                <span>👁️ PREVIEW</span>
                <button class="code-editor__preview-toggle" data-action="toggle-preview">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="code-editor__preview-content" id="preview-content">
                <!-- Dynamic preview content -->
              </div>
            </div>
          </div>

          <!-- Bottom Panel - Terminal/Console -->
          <div class="code-editor__bottom-panel">
            <div class="code-editor__panel-tabs">
              <button class="code-editor__panel-tab active" data-panel="output">
                <i class="fas fa-terminal"></i> OUTPUT
              </button>
              <button class="code-editor__panel-tab" data-panel="problems">
                <i class="fas fa-exclamation-circle"></i> PROBLEMS <span class="badge">0</span>
              </button>
              <button class="code-editor__panel-tab" data-panel="debug">
                <i class="fas fa-bug"></i> DEBUG CONSOLE
              </button>
            </div>
            <div class="code-editor__panel-content">
              <div class="code-editor__output">
                <div class="output-line">
                  <span class="output-time">[${new Date().toLocaleTimeString()}]</span>
                  <span class="output-text">✓ Portfolio loaded successfully</span>
                </div>
                <div class="output-line">
                  <span class="output-time">[${new Date().toLocaleTimeString()}]</span>
                  <span class="output-text">✓ ${
                    this.data.projects?.length || 0
                  } projects compiled</span>
                </div>
                <div class="output-line">
                  <span class="output-time">[${new Date().toLocaleTimeString()}]</span>
                  <span class="output-text">✓ Code editor ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Bar -->
        <div class="code-editor__statusbar">
          <div class="code-editor__statusbar-left">
            <span class="statusbar-item">
              <i class="fas fa-git-alt"></i> main
            </span>
            <span class="statusbar-item">
              <i class="fas fa-sync-alt"></i> 0 changes
            </span>
            <span class="statusbar-item">
              <i class="fas fa-exclamation-triangle"></i> 0 ⚠️ 0
            </span>
          </div>
          <div class="code-editor__statusbar-right">
            <span class="statusbar-item">Ln 1, Col 1</span>
            <span class="statusbar-item">Spaces: 2</span>
            <span class="statusbar-item">UTF-8</span>
            <span class="statusbar-item" id="current-language">Markdown</span>
            <span class="statusbar-item">
              <i class="fas fa-bell"></i>
            </span>
          </div>
        </div>
      </div>
    `;

    this.updateContent();
  }

  private renderTab(tab: Tab): string {
    const isActive = tab.id === this.activeTabId;
    return `
      <div class="code-editor__tab ${isActive ? "active" : ""}" data-tab-id="${
      tab.id
    }">
        <span class="code-editor__tab-icon">${this.getLanguageIcon(
          tab.language
        )}</span>
        <span class="code-editor__tab-title">${tab.title}</span>
        ${
          tab.id !== "welcome"
            ? '<button class="code-editor__tab-close"><i class="fas fa-times"></i></button>'
            : ""
        }
      </div>
    `;
  }

  private renderFileTree(): string {
    return `
      <div class="file-tree">
        <div class="file-tree__item file-tree__item--folder" data-expanded="true">
          <i class="fas fa-folder-open"></i> portfolio/
          <div class="file-tree__children">
            <div class="file-tree__item file-tree__item--file active" data-file="welcome">
              <i class="fas fa-file-alt"></i> README.md
            </div>
            <div class="file-tree__item file-tree__item--folder" data-expanded="true">
              <i class="fas fa-folder-open"></i> projects/
              <div class="file-tree__children">
                ${
                  this.data.projects
                    ?.filter((p) => p.featured)
                    .slice(0, 3)
                    .map(
                      (p) => `
                  <div class="file-tree__item file-tree__item--file" data-file="${p.id}">
                    <i class="fas fa-file-code"></i> ${p.title}.ts
                  </div>
                `
                    )
                    .join("") || ""
                }
              </div>
            </div>
            <div class="file-tree__item file-tree__item--file" data-file="skills">
              <i class="fas fa-file-code"></i> skills.json
            </div>
            <div class="file-tree__item file-tree__item--folder">
              <i class="fas fa-folder"></i> src/
            </div>
            <div class="file-tree__item file-tree__item--folder">
              <i class="fas fa-folder"></i> components/
            </div>
            <div class="file-tree__item file-tree__item--file">
              <i class="fas fa-file-code"></i> package.json
            </div>
            <div class="file-tree__item file-tree__item--file">
              <i class="fas fa-file-code"></i> tsconfig.json
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    // Tab switching
    this.container.querySelectorAll(".code-editor__tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLElement;
        const tabId = target.dataset.tabId;
        if (tabId) {
          this.switchTab(tabId);
        }
      });
    });

    // File tree navigation
    this.container
      .querySelectorAll(".file-tree__item--file")
      .forEach((item) => {
        item.addEventListener("click", (e) => {
          const target = e.currentTarget as HTMLElement;
          const fileId = target.dataset.file;
          if (fileId) {
            this.switchTab(fileId);
          }
        });
      });

    // Folder toggle
    this.container
      .querySelectorAll(".file-tree__item--folder")
      .forEach((folder) => {
        folder.addEventListener("click", (e) => {
          const target = e.currentTarget as HTMLElement;
          const isExpanded = target.dataset.expanded === "true";
          target.dataset.expanded = (!isExpanded).toString();

          const icon = target.querySelector("i");
          if (icon) {
            icon.className = isExpanded
              ? "fas fa-folder"
              : "fas fa-folder-open";
          }
        });
      });

    // Copy action
    const copyBtn = this.container.querySelector('[data-action="copy"]');
    copyBtn?.addEventListener("click", () => this.copyCode());

    // Download action
    const downloadBtn = this.container.querySelector(
      '[data-action="download"]'
    );
    downloadBtn?.addEventListener("click", () => this.downloadCode());

    // Preview toggle
    const previewToggle = this.container.querySelector(
      '[data-action="toggle-preview"]'
    );
    previewToggle?.addEventListener("click", () => this.togglePreview());
  }

  private switchTab(tabId: string): void {
    this.activeTabId = tabId;
    const tab = this.tabs.find((t) => t.id === tabId);

    if (tab?.project) {
      this.currentProject = tab.project;
    } else {
      this.currentProject = null;
    }

    // Update active tab UI
    this.container.querySelectorAll(".code-editor__tab").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-tab-id") === tabId);
    });

    // Update file tree
    this.container.querySelectorAll(".file-tree__item--file").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-file") === tabId);
    });

    this.updateContent();
  }

  private updateContent(): void {
    const activeTab = this.tabs.find((t) => t.id === this.activeTabId);
    if (!activeTab) return;

    // Update breadcrumb
    const breadcrumb = this.container.querySelector("#current-file");
    if (breadcrumb) {
      breadcrumb.textContent = activeTab.title.replace(/^[^\s]+\s/, "");
    }

    // Update language indicator
    const langIndicator = this.container.querySelector("#current-language");
    if (langIndicator) {
      langIndicator.textContent = this.getLanguageName(activeTab.language);
    }

    // Update code content
    const codeContent = this.container.querySelector("#code-content");
    if (codeContent) {
      codeContent.textContent = activeTab.content;
      codeContent.className = `language-${activeTab.language}`;

      // Syntax highlighting (basic)
      this.applySyntaxHighlighting(
        codeContent as HTMLElement,
        activeTab.language
      );
    }

    // Update line numbers
    this.updateLineNumbers(activeTab.content);

    // Update preview if project
    if (activeTab.project) {
      this.showProjectPreview(activeTab.project);
    } else {
      this.hidePreview();
    }
  }

  private updateLineNumbers(content: string): void {
    const lineNumbers = this.container.querySelector("#line-numbers");
    if (!lineNumbers) return;

    const lines = content.split("\n").length;
    lineNumbers.innerHTML = Array.from(
      { length: lines },
      (_, i) => `<span>${i + 1}</span>`
    ).join("");

    // Log current project for debugging
    if (this.currentProject) {
      console.log(`📝 Viewing project: ${this.currentProject.title}`);
    }
  }

  private applySyntaxHighlighting(
    element: HTMLElement,
    language: string
  ): void {
    // Basic syntax highlighting
    let html = element.textContent || "";

    if (language === "typescript" || language === "javascript") {
      // Keywords
      html = html.replace(
        /\b(const|let|var|function|return|if|else|for|while|class|interface|export|import|async|await|try|catch)\b/g,
        '<span class="keyword">$1</span>'
      );
      // Strings
      html = html.replace(
        /(".*?"|'.*?'|`.*?`)/g,
        '<span class="string">$1</span>'
      );
      // Comments
      html = html.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
      html = html.replace(
        /(\/\*[\s\S]*?\*\/)/g,
        '<span class="comment">$1</span>'
      );
      // Numbers
      html = html.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
    } else if (language === "json") {
      // Keys
      html = html.replace(/"([^"]+)":/g, '"<span class="json-key">$1</span>":');
      // Strings
      html = html.replace(/: "([^"]+)"/g, ': "<span class="string">$1</span>"');
      // Numbers/Booleans
      html = html.replace(
        /: (\d+|true|false|null)/g,
        ': <span class="number">$1</span>'
      );
    }

    element.innerHTML = html;
  }

  private showProjectPreview(project: Project): void {
    const preview = this.container.querySelector("#code-preview");
    const content = this.container.querySelector("#preview-content");

    if (preview && content) {
      preview.classList.add("active");
      content.innerHTML = `
        <div class="project-preview">
          <div class="project-preview__header">
            <h3>${project.title}</h3>
            <span class="project-preview__category">${project.category}</span>
          </div>
          <div class="project-preview__image">
            <img src="${project.image}" alt="${project.title}" />
          </div>
          <div class="project-preview__description">
            <p>${project.description}</p>
          </div>
          <div class="project-preview__tech">
            <h4>Technologies:</h4>
            <div class="tech-tags">
              ${project.technologies
                .map((tech) => `<span class="tech-tag">${tech}</span>`)
                .join("")}
            </div>
          </div>
          <div class="project-preview__stats">
            <div class="stat">
              <i class="fas fa-star"></i>
              <span>${project.stats.stars} stars</span>
            </div>
            <div class="stat">
              <i class="fas fa-code-branch"></i>
              <span>${project.stats.forks} forks</span>
            </div>
            <div class="stat">
              <i class="fas fa-code"></i>
              <span>${project.stats.language}</span>
            </div>
          </div>
          <div class="project-preview__actions">
            ${
              project.repoUrl
                ? `<a href="${project.repoUrl}" target="_blank" class="preview-btn preview-btn--primary">
              <i class="fab fa-github"></i> View Code
            </a>`
                : ""
            }
            ${
              project.demoUrl
                ? `<a href="${project.demoUrl}" target="_blank" class="preview-btn preview-btn--secondary">
              <i class="fas fa-external-link-alt"></i> Live Demo
            </a>`
                : ""
            }
          </div>
        </div>
      `;
    }
  }

  private hidePreview(): void {
    const preview = this.container.querySelector("#code-preview");
    if (preview) {
      preview.classList.remove("active");
    }
  }

  private togglePreview(): void {
    const preview = this.container.querySelector("#code-preview");
    if (preview) {
      preview.classList.toggle("active");
    }
  }

  private copyCode(): void {
    const activeTab = this.tabs.find((t) => t.id === this.activeTabId);
    if (activeTab) {
      navigator.clipboard.writeText(activeTab.content).then(() => {
        this.showNotification("📋 Code copied to clipboard!");
      });
    }
  }

  private downloadCode(): void {
    const activeTab = this.tabs.find((t) => t.id === this.activeTabId);
    if (activeTab) {
      const blob = new Blob([activeTab.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = activeTab.title.replace(/^[^\s]+\s/, "");
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  private showNotification(message: string): void {
    const notification = document.createElement("div");
    notification.className = "editor-notification";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add("show"), 100);
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  private getLanguageIcon(language: string): string {
    const icons: Record<string, string> = {
      typescript: "📘",
      javascript: "📙",
      json: "📋",
      markdown: "📝",
      html: "🌐",
      css: "🎨",
    };
    return icons[language] || "📄";
  }

  private getLanguageName(language: string): string {
    const names: Record<string, string> = {
      typescript: "TypeScript",
      javascript: "JavaScript",
      json: "JSON",
      markdown: "Markdown",
      html: "HTML",
      css: "CSS",
    };
    return names[language] || language;
  }

  private generateReadmeContent(): string {
    return `# 👋 Welcome to My Portfolio

## About Me
${this.data.profile.bio}

## 🎯 What I Do
- **Backend Development**: Java, Spring Boot, Node.js, Express
- **Frontend Development**: React, TypeScript, Modern JavaScript
- **Database**: PostgreSQL, MySQL, MongoDB
- **DevOps**: Docker, Git, CI/CD

## 📊 Portfolio Stats
- **Total Projects**: ${this.data.projects?.length || 0}
- **Featured Projects**: ${
      this.data.projects?.filter((p) => p.featured).length || 0
    }
- **Technologies Mastered**: ${this.data.skills?.length || 0}+
- **Years of Experience**: ${new Date().getFullYear() - 2020}+

## 🚀 Featured Projects

${
  this.data.projects
    ?.filter((p) => p.featured)
    .slice(0, 3)
    .map(
      (project, i) => `
### ${i + 1}. ${project.title}
${project.description}

**Tech Stack**: ${project.technologies.join(", ")}

${project.demoUrl ? `[🔗 Live Demo](${project.demoUrl})` : ""} ${
        project.repoUrl ? `[💻 Source Code](${project.repoUrl})` : ""
      }
`
    )
    .join("\n") || ""
}

## 📫 Get In Touch
- **Email**: ${this.data.profile.email}
- **GitHub**: [@${this.data.profile.github.split("/").pop()}](${
      this.data.profile.github
    })
- **LinkedIn**: [Connect with me](${this.data.profile.linkedin})

---

*This portfolio is built with TypeScript, Vite, and a lot of ☕*
`;
  }

  private generateProjectCode(project: Project): string {
    return `/**
 * Project: ${project.title}
 * Category: ${project.category}
 * Date: ${project.date}
 * 
 * Description:
 * ${project.description}
 */

interface ProjectConfig {
  name: string;
  description: string;
  technologies: string[];
  category: '${project.category}';
  featured: boolean;
}

const projectConfig: ProjectConfig = {
  name: "${project.title}",
  description: "${project.description}",
  technologies: [
    ${project.technologies.map((t) => `"${t}"`).join(",\n    ")}
  ],
  category: "${project.category}",
  featured: ${project.featured}
};

// Project Statistics
const stats = {
  stars: ${project.stats.stars},
  forks: ${project.stats.forks},
  language: "${project.stats.language}",
  lastUpdated: "${project.date}"
};

// Key Features
const features = [
  ${project.technologies
    .map((t, i) => `"Feature ${i + 1}: Implementation using ${t}"`)
    .join(",\n  ")}
];

/**
 * Main project entry point
 */
async function main() {
  console.log(\`Starting \${projectConfig.name}...\`);
  
  // Initialize project
  const app = await initializeApp(projectConfig);
  
  // Configure middleware
  app.use(middleware());
  
  // Start server
  app.listen(3000, () => {
    console.log('🚀 Project running on http://localhost:3000');
  });
}

// Export for use in portfolio
export { projectConfig, stats, features, main };
`;
  }

  private generateSkillsJSON(): string {
    const skillsData = this.data.skills?.map((skill) => ({
      id: skill.id,
      category: skill.category,
      title: skill.title,
      technologies: skill.technologies.map((t) => ({
        name: t.name,
        level: t.level,
      })),
      icon: skill.icon,
      color: skill.color,
    }));

    return JSON.stringify(skillsData, null, 2);
  }

  public destroy(): void {
    this.container.innerHTML = "";
  }
}
