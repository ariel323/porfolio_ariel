import type { PortfolioData, Project } from "@/types";
import { i18n } from "../utils/i18n";

interface Tab {
  id: string;
  title: string;
  content: string;
  language: string;
  project?: Project;
  editable?: boolean;
}

interface ConsoleOutput {
  type: "log" | "error" | "warn" | "info";
  message: string;
  timestamp: Date;
}

export class CodeEditor {
  private container: HTMLElement;
  private data: PortfolioData;
  private tabs: Tab[] = [];
  private activeTabId: string | null = null;
  private currentProject: Project | null = null;
  private isEditable: boolean = false;
  private consoleOutputs: ConsoleOutput[] = [];
  public searchQuery: string = "";
  public commandPaletteOpen: boolean = false;
  public lineCount: number = 0;
  public cursorPosition: { line: number; column: number } = {
    line: 1,
    column: 1,
  };
  private sidebarVisible: boolean = true;
  private sidebarWidth: number = 250;
  private bottomPanelVisible: boolean = true;
  private bottomPanelHeight: number = 200;
  private githubRepo: string = "ariel323/porfolio_ariel";
  private githubBranch: string = "main";
  private originalConsole: {
    log: typeof console.log;
    error: typeof console.error;
    warn: typeof console.warn;
    info: typeof console.info;
  };

  constructor(containerId: string, data: PortfolioData) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Code Editor container #${containerId} not found`);
    }

    this.container = container;
    this.data = data;
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
    };

    this.initializeTabs();
    this.render();
    this.setupEventListeners();
    this.setupConsoleInterceptor();
  }

  private initializeTabs(): void {
    // Welcome tab
    this.tabs.push({
      id: "welcome",
      title: "📋 README.md",
      content: this.generateReadmeContent(),
      language: "markdown",
      editable: false,
    });

    // Live Playground tab
    this.tabs.push({
      id: "playground",
      title: "🚀 playground.js",
      content: this.generatePlaygroundCode(),
      language: "javascript",
      editable: true,
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
            editable: false,
          });
        });
    }

    // Skills overview tab
    this.tabs.push({
      id: "skills",
      title: "🛠️ skills.json",
      content: this.generateSkillsJSON(),
      language: "json",
      editable: false,
    });

    this.activeTabId = "welcome";
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="code-editor">
        <div class="code-editor__header">
          <div class="code-editor__header-left">
            <button class="code-editor__sidebar-toggle" data-action="toggle-sidebar" title="${i18n.t("editor.sidebarToggle")}">
              <i class="fas fa-bars"></i>
            </button>
            <div class="code-editor__tabs">
              ${this.tabs.map((tab) => this.renderTab(tab)).join("")}
            </div>
          </div>
          <div class="code-editor__actions">
            <button class="code-editor__action code-editor__action--run" data-action="run" title="${i18n.t("editor.runCode")} (Ctrl+Enter)" style="display: none;">
              <i class="fas fa-play"></i> <span>${i18n.t("editor.run")}</span>
            </button>
            <button class="code-editor__action code-editor__action--edit" data-action="edit" title="${i18n.t("editor.editModeToggle")}" style="display: none;">
              <i class="fas fa-edit"></i>
            </button>
            <button class="code-editor__action" data-action="format" title="${i18n.t("editor.formatCode")} (Shift+Alt+F)">
              <i class="fas fa-align-left"></i>
            </button>
            <button class="code-editor__action" data-action="search" title="${i18n.t("editor.search")} (Ctrl+F)">
              <i class="fas fa-search"></i>
            </button>
            <button class="code-editor__action" data-action="command-palette" title="${i18n.t("editor.commandPalette")} (Ctrl+Shift+P)">
              <i class="fas fa-terminal"></i>
            </button>
            <button class="code-editor__action" data-action="copy" title="${i18n.t("editor.copyCode")} (Ctrl+C)">
              <i class="fas fa-copy"></i>
            </button>
            <button class="code-editor__action" data-action="download" title="${i18n.t("editor.download")}">
              <i class="fas fa-download"></i>
            </button>
            <button class="code-editor__action" data-action="fullscreen" title="${i18n.t("editor.fullscreen")} (F11)">
              <i class="fas fa-expand"></i>
            </button>
          </div>
        </div>

        <div class="code-editor__body">
          <!-- File Explorer -->
          <div class="code-editor__sidebar">
            <div class="code-editor__explorer">
              <div class="code-editor__explorer-header">
                <span>${i18n.t("editor.explorer")}</span>
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
                <span>${i18n.t("editor.stats")}</span>
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

            <!-- Search Bar -->
            <div class="code-editor__search" id="search-bar" style="display: none;">
              <input type="text" class="code-editor__search-input" id="search-input" placeholder="${i18n.t("editor.searchPlaceholder")}" />
              <button class="code-editor__search-btn" data-action="find-next">
                <i class="fas fa-chevron-down"></i>
              </button>
              <button class="code-editor__search-btn" data-action="find-prev">
                <i class="fas fa-chevron-up"></i>
              </button>
              <button class="code-editor__search-btn" data-action="close-search">
                <i class="fas fa-times"></i>
              </button>
              <span class="code-editor__search-results" id="search-results"></span>
            </div>

            <!-- Command Palette -->
            <div class="code-editor__command-palette" id="command-palette" style="display: none;">
              <input type="text" class="code-editor__command-input" id="command-input" placeholder="${i18n.t("editor.commandPlaceholder")}" />
              <div class="code-editor__command-list" id="command-list">
                <!-- Commands will be populated dynamically -->
              </div>
            </div>

            <!-- Code Content -->
            <div class="code-editor__content">
              <div class="code-editor__line-numbers" id="line-numbers">
                <!-- Generated dynamically -->
              </div>
              <pre class="code-editor__code"><code id="code-content" class="language-markdown" contenteditable="false" spellcheck="false"></code></pre>
            </div>

            <!-- Preview Panel -->
            <div class="code-editor__preview" id="code-preview">
              <div class="code-editor__preview-header">
                <span>${i18n.t("editor.preview")}</span>
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
          <div class="code-editor__bottom-panel" style="height: ${
            this.bottomPanelHeight
          }px; display: ${this.bottomPanelVisible ? "flex" : "none"};">
            <div class="code-editor__panel-header">
              <div class="code-editor__panel-tabs">
              <button class="code-editor__panel-tab active" data-panel="output">
                <i class="fas fa-terminal"></i> ${i18n.t("editor.output")}
              </button>
              <button class="code-editor__panel-tab" data-panel="problems">
                <i class="fas fa-exclamation-circle"></i> ${i18n.t("editor.problems")} <span class="badge">0</span>
              </button>
              <button class="code-editor__panel-tab" data-panel="debug">
                <i class="fas fa-bug"></i> ${i18n.t("editor.debug")}
              </button>
              </div>
              <button class="code-editor__panel-close" data-action="toggle-bottom-panel" title="${i18n.t("common.close")}">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="code-editor__panel-content">
              <div class="code-editor__output">
                <div class="output-line">
                  <span class="output-time">[${new Date().toLocaleTimeString()}]</span>
                  <span class="output-text">${i18n.t("editor.portfolioLoaded")}</span>
                </div>
                <div class="output-line">
                  <span class="output-time">[${new Date().toLocaleTimeString()}]</span>
                  <span class="output-text">${i18n.t("editor.projectsCompiled", { count: this.data.projects?.length || 0 })}</span>
                </div>
                <div class="output-line">
                  <span class="output-time">[${new Date().toLocaleTimeString()}]</span>
                  <span class="output-text">${i18n.t("editor.ready")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Bar -->
        <div class="code-editor__statusbar">
          <div class="code-editor__statusbar-left">
            <span class="statusbar-item">
              <i class="fas fa-git-alt"></i> ${i18n.t("editor.gitBranch")}
            </span>
            <span class="statusbar-item">
              <i class="fas fa-sync-alt"></i> 0 ${i18n.t("editor.changes")}
            </span>
            <span class="statusbar-item">
              <i class="fas fa-exclamation-triangle"></i> 0 ${i18n.t("editor.warnings")} 0
            </span>
          </div>
          <div class="code-editor__statusbar-right">
            <span class="statusbar-item">${i18n.t("editor.line")} 1, ${i18n.t("editor.col")} 1</span>
            <span class="statusbar-item">${i18n.t("editor.spaces")}: 2</span>
            <span class="statusbar-item">${i18n.t("editor.encoding")}</span>
            <span class="statusbar-item" id="current-language">${i18n.t("editor.language")}</span>
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
            <div class="file-tree__item file-tree__item--file" data-file="playground">
              <i class="fas fa-play-circle"></i> playground.js
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

    // Run code action
    const runBtn = this.container.querySelector('[data-action="run"]');
    runBtn?.addEventListener("click", () => this.runCode());

    // Edit mode toggle
    const editBtn = this.container.querySelector('[data-action="edit"]');
    editBtn?.addEventListener("click", () => this.toggleEditMode());

    // Format code action
    const formatBtn = this.container.querySelector('[data-action="format"]');
    formatBtn?.addEventListener("click", () => this.formatCode());

    // Search action
    const searchBtn = this.container.querySelector('[data-action="search"]');
    searchBtn?.addEventListener("click", () => this.toggleSearch());

    // Command palette action
    const commandBtn = this.container.querySelector(
      '[data-action="command-palette"]'
    );
    commandBtn?.addEventListener("click", () => this.toggleCommandPalette());

    // Toggle sidebar
    const sidebarToggleBtn = this.container.querySelector(
      '[data-action="toggle-sidebar"]'
    );
    sidebarToggleBtn?.addEventListener("click", () => this.toggleSidebar());

    // Toggle bottom panel
    const bottomPanelToggleBtn = this.container.querySelector(
      '[data-action="toggle-bottom-panel"]'
    );
    bottomPanelToggleBtn?.addEventListener("click", () =>
      this.toggleBottomPanel()
    );

    // Sync with GitHub
    const syncGitHubBtn = this.container.querySelector(
      '[data-action="sync-github"]'
    );
    syncGitHubBtn?.addEventListener("click", () => this.syncWithGitHub());

    // Close tab buttons
    this.container
      .querySelectorAll(".code-editor__tab-close")
      .forEach((closeBtn) => {
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const tabId = (closeBtn as HTMLElement).dataset.closeTab;
          if (tabId) {
            this.closeTab(tabId);
          }
        });
      });

    // Close search
    const closeSearchBtn = this.container.querySelector(
      '[data-action="close-search"]'
    );
    closeSearchBtn?.addEventListener("click", () => this.toggleSearch());

    // Search input
    const searchInput = this.container.querySelector("#search-input");
    searchInput?.addEventListener("input", (e) => {
      const query = (e.target as HTMLInputElement).value;
      this.performSearch(query);
    });

    // Command palette input
    const commandInput = this.container.querySelector("#command-input");
    commandInput?.addEventListener("input", (e) => {
      const query = (e.target as HTMLInputElement).value;
      this.filterCommands(query);
    });

    // Command palette keydown
    commandInput?.addEventListener("keydown", (e: Event) => {
      const keyEvent = e as KeyboardEvent;
      if (keyEvent.key === "Escape") {
        this.toggleCommandPalette();
      }
    });

    // Global keyboard shortcuts
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      // Ctrl+F - Search
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        this.toggleSearch();
      }
      // Ctrl+Shift+P - Command Palette
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        this.toggleCommandPalette();
      }
      // Shift+Alt+F - Format
      if (e.shiftKey && e.altKey && e.key === "F") {
        e.preventDefault();
        this.formatCode();
      }
      // Ctrl+S - Save (show notification)
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        this.showNotification("💾 Code auto-saved!");
      }
      // Ctrl+B - Toggle sidebar
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        this.toggleSidebar();
      }
      // Ctrl+W - Close active tab
      if (e.ctrlKey && e.key === "w") {
        e.preventDefault();
        if (this.activeTabId && this.activeTabId !== "welcome") {
          this.closeTab(this.activeTabId);
        }
      }
      // Ctrl+` - Toggle bottom panel
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        this.toggleBottomPanel();
      }
      // Escape - Close modals
      if (e.key === "Escape") {
        this.closeAllModals();
      }
    });

    // Keyboard shortcuts
    const codeContent = this.container.querySelector("#code-content");
    codeContent?.addEventListener("keydown", (e: Event) => {
      const keyEvent = e as KeyboardEvent;

      // Ctrl+Enter - Run code
      if (keyEvent.ctrlKey && keyEvent.key === "Enter") {
        e.preventDefault();
        this.runCode();
      }

      // Tab key - Insert spaces
      if (keyEvent.key === "Tab") {
        e.preventDefault();
        document.execCommand("insertText", false, "  ");
      }

      // Update cursor position
      this.updateCursorPosition();
    });

    // Update line numbers on input
    codeContent?.addEventListener("input", () => {
      const code = (codeContent as HTMLElement).textContent || "";
      this.updateLineNumbers(code);
      this.updateCursorPosition();
    });

    // Track cursor position on click
    codeContent?.addEventListener("click", () => {
      this.updateCursorPosition();
    });
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

      // Enable/disable editing
      const isEditable = activeTab.editable || false;
      (codeContent as HTMLElement).contentEditable = isEditable.toString();
      codeContent.classList.toggle("editable", isEditable);
      this.isEditable = isEditable;

      // Syntax highlighting (basic)
      this.applySyntaxHighlighting(
        codeContent as HTMLElement,
        activeTab.language
      );
    }

    // Show/hide RUN and EDIT buttons
    const runBtn = this.container.querySelector(
      '[data-action="run"]'
    ) as HTMLElement;
    const editBtn = this.container.querySelector(
      '[data-action="edit"]'
    ) as HTMLElement;

    if (runBtn) {
      runBtn.style.display =
        activeTab.language === "javascript" ? "flex" : "none";
    }

    if (editBtn) {
      editBtn.style.display = activeTab.editable ? "flex" : "none";
      editBtn.classList.toggle("active", this.isEditable);
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
    this.lineCount = lines;
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
        this.showNotification(i18n.t("editor.codeCopied"));
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

  private generatePlaygroundCode(): string {
    return `// 🚀 Live JavaScript Playground
// Edit this code and press RUN (or Ctrl+Enter) to execute!

// Example 1: Basic operations
const greeting = "Hello from Code Laboratory!";
console.log(greeting);

// Example 2: Array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled numbers:", doubled);

// Example 3: Async operations
async function fetchData() {
  console.log("Fetching data...");
  // Simulate API call
  const data = { name: "Ariel", role: "Full Stack Developer" };
  console.log("Data received:", data);
  return data;
}

// Example 4: DOM manipulation demo
function createElements() {
  console.log("Creating elements...");
  const info = {
    projects: 10,
    technologies: ["Java", "Node.js", "React"],
    experience: "2025"
  };
  console.log("Portfolio Info:", info);
}

// Run examples
console.log("=== Code Laboratory Initialized ===" );
createElements();
fetchData();

// Try modifying this code and clicking RUN! 🎨
`;
  }

  private runCode(): void {
    const codeContent = this.container.querySelector(
      "#code-content"
    ) as HTMLElement;
    if (!codeContent) return;

    const code = codeContent.textContent || "";
    const activeTab = this.tabs.find((t) => t.id === this.activeTabId);

    // Only run JavaScript code
    if (activeTab?.language !== "javascript") {
      this.addConsoleOutput(
        "warn",
        i18n.t("editor.onlyJavaScript")
      );
      return;
    }

    // Clear previous outputs
    this.consoleOutputs = [];

    try {
      // Create a safe execution context
      this.addConsoleOutput("info", i18n.t("editor.runCode"));

      // Execute code in try-catch
      const result = new Function(code)();

      // Handle promises
      if (result instanceof Promise) {
        result.catch((error) => {
          this.addConsoleOutput("error", `Promise rejected: ${error.message}`);
        });
      }

      this.addConsoleOutput("info", i18n.t("editor.codeExecuted"));
    } catch (error: any) {
      this.addConsoleOutput("error", `Error: ${error.message}`);
    }

    this.updateConsolePanel();
  }

  private toggleEditMode(): void {
    this.isEditable = !this.isEditable;
    const codeContent = this.container.querySelector(
      "#code-content"
    ) as HTMLElement;
    const editBtn = this.container.querySelector(
      '[data-action="edit"]'
    ) as HTMLElement;

    if (codeContent) {
      codeContent.contentEditable = this.isEditable.toString();
      codeContent.classList.toggle("editable", this.isEditable);
    }

    if (editBtn) {
      editBtn.classList.toggle("active", this.isEditable);
      editBtn.title = this.isEditable
        ? i18n.t("editor.editModeToggle")
        : i18n.t("editor.editModeToggle");
    }

    const activeTab = this.tabs.find((t) => t.id === this.activeTabId);
    if (this.isEditable && activeTab?.language === "javascript") {
      this.addConsoleOutput(
        "info",
        i18n.t("editor.editModeEnabled")
      );
      this.updateConsolePanel();
    }
  }

  private setupConsoleInterceptor(): void {
    const self = this;

    // Intercept console.log
    console.log = function (...args: any[]) {
      self.originalConsole.log.apply(console, args);
      self.addConsoleOutput(
        "log",
        args
          .map((a) =>
            typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)
          )
          .join(" ")
      );
      self.updateConsolePanel();
    };

    // Intercept console.error
    console.error = function (...args: any[]) {
      self.originalConsole.error.apply(console, args);
      self.addConsoleOutput("error", args.map((a) => String(a)).join(" "));
      self.updateConsolePanel();
    };

    // Intercept console.warn
    console.warn = function (...args: any[]) {
      self.originalConsole.warn.apply(console, args);
      self.addConsoleOutput("warn", args.map((a) => String(a)).join(" "));
      self.updateConsolePanel();
    };

    // Intercept console.info
    console.info = function (...args: any[]) {
      self.originalConsole.info.apply(console, args);
      self.addConsoleOutput("info", args.map((a) => String(a)).join(" "));
      self.updateConsolePanel();
    };
  }

  private addConsoleOutput(
    type: "log" | "error" | "warn" | "info",
    message: string
  ): void {
    this.consoleOutputs.push({
      type,
      message,
      timestamp: new Date(),
    });

    // Keep only last 50 outputs
    if (this.consoleOutputs.length > 50) {
      this.consoleOutputs.shift();
    }
  }

  private updateConsolePanel(): void {
    const outputPanel = this.container.querySelector(".code-editor__output");
    if (!outputPanel) return;

    const outputHTML = this.consoleOutputs
      .map((output) => {
        const icon = {
          log: "📝",
          error: "❌",
          warn: "⚠️",
          info: "ℹ️",
        }[output.type];

        const cssClass = `output-${output.type}`;

        return `
        <div class="output-line ${cssClass}">
          <span class="output-time">[${output.timestamp.toLocaleTimeString()}]</span>
          <span class="output-icon">${icon}</span>
          <span class="output-text">${this.escapeHtml(output.message)}</span>
        </div>
      `;
      })
      .join("");

    outputPanel.innerHTML =
      outputHTML ||
      `
      <div class="output-line">
        <span class="output-text">Console output will appear here...</span>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private toggleSearch(): void {
    const searchBar = this.container.querySelector(
      "#search-bar"
    ) as HTMLElement;
    const searchInput = this.container.querySelector(
      "#search-input"
    ) as HTMLInputElement;

    if (searchBar) {
      const isVisible = searchBar.style.display !== "none";
      searchBar.style.display = isVisible ? "none" : "flex";

      if (!isVisible && searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
  }

  private performSearch(query: string): void {
    this.searchQuery = query;
    const codeContent = this.container.querySelector(
      "#code-content"
    ) as HTMLElement;
    const resultsSpan = this.container.querySelector(
      "#search-results"
    ) as HTMLElement;

    if (!codeContent || !query) {
      if (resultsSpan) resultsSpan.textContent = "";
      return;
    }

    const text = codeContent.textContent || "";
    const regex = new RegExp(query, "gi");
    const matches = text.match(regex);

    if (resultsSpan) {
      resultsSpan.textContent = matches
        ? `${matches.length} results`
        : "No results";
    }

    // Highlight matches (basic implementation)
    if (matches && matches.length > 0) {
      this.showNotification(`Found ${matches.length} matches for "${query}"`);
    }
  }

  private toggleCommandPalette(): void {
    const palette = this.container.querySelector(
      "#command-palette"
    ) as HTMLElement;
    const commandInput = this.container.querySelector(
      "#command-input"
    ) as HTMLInputElement;

    if (palette) {
      const isVisible = palette.style.display !== "none";
      palette.style.display = isVisible ? "none" : "block";
      this.commandPaletteOpen = !isVisible;

      if (!isVisible && commandInput) {
        commandInput.focus();
        this.populateCommands();
      }
    }
  }

  private populateCommands(): void {
    const commandList = this.container.querySelector(
      "#command-list"
    ) as HTMLElement;
    if (!commandList) return;

    const commands = [
      {
        icon: "▶️",
        name: i18n.t("editor.run"),
        shortcut: "Ctrl+Enter",
        action: () => this.runCode(),
      },
      {
        icon: "✏️",
        name: i18n.t("editor.edit"),
        shortcut: "Ctrl+E",
        action: () => this.toggleEditMode(),
      },
      {
        icon: "🔍",
        name: i18n.t("editor.search"),
        shortcut: "Ctrl+F",
        action: () => this.toggleSearch(),
      },
      {
        icon: "📋",
        name: i18n.t("editor.copy"),
        shortcut: "Ctrl+C",
        action: () => this.copyCode(),
      },
      {
        icon: "💾",
        name: i18n.t("editor.download"),
        shortcut: "",
        action: () => this.downloadCode(),
      },
      {
        icon: "🎨",
        name: i18n.t("editor.format"),
        shortcut: "Shift+Alt+F",
        action: () => this.formatCode(),
      },
      {
        icon: "🔄",
        name: i18n.t("common.refresh"),
        shortcut: "",
        action: () => this.clearConsole(),
      },
    ];

    commandList.innerHTML = commands
      .map(
        (cmd) => `
      <div class="command-item" data-command="${cmd.name}">
        <span class="command-icon">${cmd.icon}</span>
        <span class="command-name">${cmd.name}</span>
        <span class="command-shortcut">${cmd.shortcut}</span>
      </div>
    `
      )
      .join("");

    // Add click listeners
    commandList.querySelectorAll(".command-item").forEach((item, index) => {
      item.addEventListener("click", () => {
        commands[index].action();
        this.toggleCommandPalette();
      });
    });
  }

  private filterCommands(query: string): void {
    const commandList = this.container.querySelector("#command-list");
    if (!commandList) return;

    const items = commandList.querySelectorAll(".command-item");
    items.forEach((item) => {
      const name = item.getAttribute("data-command")?.toLowerCase() || "";
      const matches = name.includes(query.toLowerCase());
      (item as HTMLElement).style.display = matches ? "flex" : "none";
    });
  }

  private formatCode(): void {
    const codeContent = this.container.querySelector(
      "#code-content"
    ) as HTMLElement;
    const activeTab = this.tabs.find((t) => t.id === this.activeTabId);

    if (!codeContent || !activeTab) return;

    const code = codeContent.textContent || "";

    // Format based on language
    let formatted = code;

    if (activeTab.language === "json") {
      try {
        const parsed = JSON.parse(code);
        formatted = JSON.stringify(parsed, null, 2);
      } catch (e) {
        this.showNotification(i18n.t("editor.invalidJson"));
        return;
      }
    } else if (
      activeTab.language === "javascript" ||
      activeTab.language === "typescript"
    ) {
      // Basic JavaScript formatting
      formatted = this.formatJavaScript(code);
    }

    codeContent.textContent = formatted;
    this.updateLineNumbers(formatted);
    this.applySyntaxHighlighting(codeContent, activeTab.language);
    this.showNotification(i18n.t("editor.formatted"));
  }

  private formatJavaScript(code: string): string {
    // Basic formatting - add proper indentation
    let indentLevel = 0;
    const lines = code.split("\n");
    const formattedLines: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Decrease indent for closing braces
      if (
        trimmed.startsWith("}") ||
        trimmed.startsWith("]") ||
        trimmed.startsWith(")")
      ) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Add indentation
      const indent = "  ".repeat(indentLevel);
      formattedLines.push(indent + trimmed);

      // Increase indent for opening braces
      if (
        trimmed.endsWith("{") ||
        trimmed.endsWith("[") ||
        trimmed.endsWith("(")
      ) {
        indentLevel++;
      }
    });

    return formattedLines.join("\n");
  }

  private clearConsole(): void {
    this.consoleOutputs = [];
    this.updateConsolePanel();
    this.showNotification(i18n.t("common.refresh"));
  }

  private updateCursorPosition(): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    const codeContent = this.container.querySelector("#code-content");

    if (!codeContent) return;

    preCaretRange.selectNodeContents(codeContent);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    const caretOffset = preCaretRange.toString().length;
    const textBefore = (codeContent.textContent || "").substring(
      0,
      caretOffset
    );
    const lines = textBefore.split("\n");

    this.cursorPosition = {
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    };

    // Update status bar
    const statusBar = this.container.querySelector(
      ".code-editor__statusbar-right"
    );
    if (statusBar) {
      const lineColItem = statusBar.querySelector(".statusbar-item");
      if (lineColItem) {
        lineColItem.textContent = `Ln ${this.cursorPosition.line}, Col ${this.cursorPosition.column}`;
      }
    }
  }

  private closeAllModals(): void {
    const searchBar = this.container.querySelector(
      "#search-bar"
    ) as HTMLElement;
    const commandPalette = this.container.querySelector(
      "#command-palette"
    ) as HTMLElement;

    if (searchBar) searchBar.style.display = "none";
    if (commandPalette) {
      commandPalette.style.display = "none";
      this.commandPaletteOpen = false;
    }
  }

  private toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
    const sidebar = this.container.querySelector(
      ".code-editor__sidebar"
    ) as HTMLElement;

    if (sidebar) {
      if (this.sidebarVisible) {
        sidebar.style.display = "flex";
        sidebar.style.width = `${this.sidebarWidth}px`;
      } else {
        sidebar.style.display = "none";
      }
    }

    this.showNotification(
      this.sidebarVisible ? i18n.t("editor.sidebarOpened") : i18n.t("editor.sidebarClosed")
    );
  }

  private toggleBottomPanel(): void {
    this.bottomPanelVisible = !this.bottomPanelVisible;
    const bottomPanel = this.container.querySelector(
      ".code-editor__bottom-panel"
    ) as HTMLElement;

    if (bottomPanel) {
      bottomPanel.style.display = this.bottomPanelVisible ? "flex" : "none";
      if (this.bottomPanelVisible) {
        bottomPanel.style.height = `${this.bottomPanelHeight}px`;
      }
    }

    this.showNotification(
      this.bottomPanelVisible ? i18n.t("editor.panelOpened") : i18n.t("editor.panelClosed")
    );
  }

  private closeTab(tabId: string): void {
    // Don't close if it's the last tab or welcome tab
    if (this.tabs.length <= 1 || tabId === "welcome") {
      this.showNotification(i18n.t("editor.cannotCloseTab"));
      return;
    }

    const tabIndex = this.tabs.findIndex((t) => t.id === tabId);
    if (tabIndex === -1) return;

    // Remove tab
    this.tabs.splice(tabIndex, 1);

    // If we closed the active tab, switch to another one
    if (this.activeTabId === tabId) {
      const newActiveTab = this.tabs[Math.max(0, tabIndex - 1)];
      this.activeTabId = newActiveTab.id;
    }

    // Re-render
    this.render();
    this.setupEventListeners();
    this.setupConsoleInterceptor();

    // Switch to the new active tab
    if (this.activeTabId) {
      this.switchTab(this.activeTabId);
    }

    this.showNotification(i18n.t("editor.tabClosed"));
  }

  private async syncWithGitHub(): Promise<void> {
    this.showNotification(i18n.t("editor.syncing"));

    try {
      // Fetch repository tree from GitHub API
      const response = await fetch(
        `https://api.github.com/repos/${this.githubRepo}/git/trees/${this.githubBranch}?recursive=1`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch repository");
      }

      const data = await response.json();

      // Update file tree with real GitHub files
      this.updateFileTreeFromGitHub(data.tree);

      this.showNotification(i18n.t("editor.syncSuccess"));
    } catch (error) {
      console.error("GitHub sync error:", error);
      this.showNotification(i18n.t("editor.syncFailed"));
    }
  }

  private updateFileTreeFromGitHub(tree: any[]): void {
    const explorerTree = this.container.querySelector("#explorer-tree");
    if (!explorerTree) return;

    // Filter for relevant files
    const relevantFiles = tree.filter(
      (item: any) =>
        item.type === "blob" &&
        (item.path.startsWith("src/") ||
          item.path.endsWith(".md") ||
          item.path.endsWith(".json") ||
          item.path.endsWith(".ts"))
    );

    // Group by folders
    const folders: Record<string, any[]> = {};
    relevantFiles.forEach((file: any) => {
      const parts = file.path.split("/");
      const folder = parts.length > 1 ? parts[0] : "root";

      if (!folders[folder]) {
        folders[folder] = [];
      }
      folders[folder].push(file);
    });

    // Generate HTML
    let html = '<div class="file-tree">';
    html +=
      '<div class="file-tree__item file-tree__item--folder" data-expanded="true">';
    html +=
      '<i class="fas fa-folder-open"></i> ' +
      this.githubRepo.split("/")[1] +
      "/";
    html += '<div class="file-tree__children">';

    Object.keys(folders).forEach((folderName) => {
      html += `<div class="file-tree__item file-tree__item--folder" data-expanded="false">`;
      html += `<i class="fas fa-folder"></i> ${folderName}/`;
      html += '<div class="file-tree__children">';

      folders[folderName].forEach((file: any) => {
        const fileName = file.path.split("/").pop();
        const fileIcon = this.getFileIcon(fileName);
        html += `<div class="file-tree__item file-tree__item--file" data-file-path="${file.path}">`;
        html += `<i class="${fileIcon}"></i> ${fileName}`;
        html += "</div>";
      });

      html += "</div></div>";
    });

    html += "</div></div></div>";

    explorerTree.innerHTML = html;

    // Re-attach event listeners for new files
    this.attachFileTreeListeners();
  }

  private attachFileTreeListeners(): void {
    // Folder toggle
    this.container
      .querySelectorAll(".file-tree__item--folder")
      .forEach((folder) => {
        folder.addEventListener("click", (e) => {
          e.stopPropagation();
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

    // File click to load from GitHub
    this.container.querySelectorAll("[data-file-path]").forEach((item) => {
      item.addEventListener("click", async (e) => {
        e.stopPropagation();
        const filePath = (item as HTMLElement).dataset.filePath;
        if (filePath) {
          await this.loadFileFromGitHub(filePath);
        }
      });
    });
  }

  private async loadFileFromGitHub(filePath: string): Promise<void> {
    this.showNotification(`📂 Loading ${filePath}...`);

    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.githubRepo}/contents/${filePath}?ref=${this.githubBranch}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }

      const data = await response.json();
      const content = atob(data.content); // Decode base64
      const fileName = filePath.split("/").pop() || filePath;
      const language = this.getLanguageFromPath(filePath);

      // Add or update tab
      const existingTab = this.tabs.find((t) => t.id === filePath);
      if (existingTab) {
        existingTab.content = content;
        this.switchTab(filePath);
      } else {
        this.tabs.push({
          id: filePath,
          title: `📄 ${fileName}`,
          content: content,
          language: language,
          editable: false,
        });

        // Re-render to show new tab
        this.render();
        this.setupEventListeners();
        this.setupConsoleInterceptor();
        this.switchTab(filePath);
      }

      this.showNotification(`✅ Loaded ${fileName}`);
    } catch (error) {
      console.error("File load error:", error);
      this.showNotification(`❌ Failed to load ${filePath}`);
    }
  }

  private getLanguageFromPath(path: string): string {
    const ext = path.split(".").pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      json: "json",
      md: "markdown",
      css: "css",
      html: "html",
      py: "python",
      java: "java",
    };
    return langMap[ext || ""] || "text";
  }

  private getFileIcon(fileName: string): string {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      ts: "fab fa-js-square",
      tsx: "fab fa-react",
      js: "fab fa-js-square",
      jsx: "fab fa-react",
      json: "fas fa-file-code",
      md: "fas fa-file-alt",
      css: "fab fa-css3-alt",
      html: "fab fa-html5",
      py: "fab fa-python",
      java: "fab fa-java",
    };
    return iconMap[ext || ""] || "fas fa-file";
  }

  public destroy(): void {
    // Restore original console methods
    console.log = this.originalConsole.log;
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    console.info = this.originalConsole.info;

    this.container.innerHTML = "";
  }
}
