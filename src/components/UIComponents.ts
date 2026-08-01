import type {
  Project,
  Skill,
  GitHubStats,
  GitHubRepo,
  Profile,
} from "../types";
import { ProjectsManager } from "./ProjectsManager";
import { GitHubAPI } from "../utils/GitHubAPI";
import { i18n } from "../utils/i18n";

export class UIComponents {
  private projectsManager: ProjectsManager;
  private activeSkillCategory: string = "all";
  private skillSearchTerm: string = "";
  private skillViewMode: "detailed" | "compact" = "detailed";
  private skillObserver: IntersectionObserver | null = null;

  constructor(projectsManager: ProjectsManager, _githubAPI: GitHubAPI) {
    this.projectsManager = projectsManager;
    // GitHubAPI is passed but not stored - used externally in main.ts
  }

  /**
   * Render profile/hero section
   */
  renderProfile(): void {
    const profile = this.projectsManager.getProfile();
    if (!profile) return;

    const container = document.querySelector(".hero-section__content");
    if (!container) return;

    const nameElement = container.querySelector<HTMLElement>("#profile-name");
    if (nameElement) {
      nameElement.textContent = profile.name;
    }

    const titleHighlight =
      container.querySelector<HTMLElement>("#profile-title");
    if (titleHighlight) {
      this.createTypingEffect(titleHighlight, profile.title);
    }

    const taglineElement =
      container.querySelector<HTMLElement>("#profile-tagline");
    if (taglineElement) {
      taglineElement.textContent = profile.tagline;
    }

    const bioElement = container.querySelector<HTMLElement>("#profile-bio");
    if (bioElement) {
      bioElement.textContent = profile.bio;
    }

    const imageElement = document.querySelector<HTMLImageElement>(
      "[data-profile-image]"
    );
    if (imageElement) {
      imageElement.src = profile.image;
      imageElement.alt = `Foto de ${profile.name}`;
      

      // Add error handling for image loading
      imageElement.addEventListener("error", () => {
        console.error("❌ Failed to load profile image:", profile.image);
        imageElement.src = "/assets/fallback-avatar.png"; // Fallback image
      });

      imageElement.addEventListener("load", () => {
        
      });
    } else {
      
    }

    this.updateSocialLinks(profile.github, profile.linkedin, profile.email);
    this.updateContactLinks(profile);
  }

  private updateSocialLinks(
    github: string,
    linkedin: string,
    email: string
  ): void {
    const socialLinks =
      document.querySelectorAll<HTMLAnchorElement>("[data-social]");

    socialLinks.forEach((link) => {
      const type = link.dataset.social;
      if (!type) return;

      switch (type) {
        case "github":
          link.href = this.formatSocialLink(github, "github");
          link.target = "_blank";
          break;
        case "linkedin":
          link.href = this.formatSocialLink(linkedin, "linkedin");
          link.target = "_blank";
          break;
        case "email":
          link.href = this.formatSocialLink(email, "email");
          link.removeAttribute("target");
          break;
      }
    });
  }

  private updateContactLinks(profile: Profile): void {
    const contactSelectors: Record<string, string> = {
      linkedin: ".contact__link--linkedin",
      github: ".contact__link--github",
      email: ".contact__link--email",
      whatsapp: ".contact__link--whatsapp",
    };

    Object.entries(contactSelectors).forEach(([type, selector]) => {
      const link = document.querySelector<HTMLAnchorElement>(selector);
      if (!link) return;

      switch (type) {
        case "linkedin":
          link.href = this.formatSocialLink(profile.linkedin, "linkedin");
          link.target = "_blank";
          break;
        case "github":
          link.href = this.formatSocialLink(profile.github, "github");
          link.target = "_blank";
          break;
        case "email":
          link.href = this.formatSocialLink(profile.email, "email");
          link.removeAttribute("target");
          break;
        case "whatsapp":
          link.href = this.formatSocialLink(profile.whatsapp, "whatsapp");
          link.target = "_blank";
          break;
      }
    });
  }

  private formatSocialLink(
    value: string,
    type: "github" | "linkedin" | "email" | "whatsapp"
  ): string {
    if (!value) return "#";

    if (type === "email") {
      return value.startsWith("mailto:") ? value : `mailto:${value}`;
    }

    if (type === "whatsapp") {
      const cleaned = value.replace(/[^0-9+]/g, "");
      return cleaned.startsWith("http")
        ? cleaned
        : `https://wa.me/${cleaned.replace(/^\+/g, "")}`;
    }

    if (value.startsWith("http")) {
      return value;
    }

    switch (type) {
      case "github":
        return `https://github.com/${value}`;
      case "linkedin":
        return `https://www.linkedin.com/in/${value}/`;
      default:
        return value;
    }
  }

  /**
   * Render skills section
   */
  renderSkills(): void {
    const skillsSection = document.querySelector(".skills");
    const skills = this.projectsManager.getSkills();
    const container = document.querySelector(".skills__grid");
    if (!container || !skillsSection) return;

    this.ensureSkillControls(skillsSection, skills);
    this.updateSkillsGrid(skills, container, skillsSection);
  }

  /**
   * Create skill card element
   */
  private createSkillCard(skill: Skill, expand: boolean): HTMLElement {
    const card = document.createElement("div");
    card.className = "skill-card fade-in-up";
    card.style.borderLeft = `4px solid ${skill.color}`;
    card.setAttribute(
      "data-category",
      this.normalizeCategoryForDataset(skill.category)
    );
    if (expand) {
      card.classList.add("skill-card--expanded");
    }

    const detailsId = `skill-details-${this.normalizeCategoryForDataset(
      `${skill.id}-${skill.title}`
    )}`;
    const averageLevel = this.getAverageLevel(skill);
    const summaryHTML = skill.summary
      ? `<p class="skill-summary">${skill.summary}</p>`
      : "";
    const toolsHTML = skill.coreTools?.length
      ? `<div class="skill-tag-list">${skill.coreTools
          .map((tool) => `<span class="skill-tag">${tool}</span>`)
          .join("")}</div>`
      : "";
    const technologiesHTML = skill.technologies
      .map(
        (tech) => `
          <li data-level="${tech.level}">
            <div class="tech-list__header">
              <span class="tech-name">${tech.name}</span>
              <span class="tech-level">${tech.level}%</span>
            </div>
            <div class="skill-bar">
              <div class="skill-bar-fill" data-level="${tech.level}" style="width: 0%; background: ${skill.color}"></div>
            </div>
          </li>
        `
      )
      .join("");

    card.innerHTML = `
      <header class="skill-card__header">
        <h3>
          <span class="skill-icon" style="color: ${skill.color}">${
      skill.icon
    }</span>
          ${skill.title}
        </h3>
        <div class="skill-card__meta">
          <span class="skill-card__category">${skill.category}</span>
          <span class="skill-card__experience">${i18n.t("sections.skills.averageLevel")} ${averageLevel}%</span>
        </div>
      </header>
      <button
        type="button"
        class="skill-card__toggle"
        aria-expanded="${expand}"
        aria-controls="${detailsId}"
      >
        <span class="skill-card__toggle-label">${
          expand ? i18n.t("sections.skills.hideDetails") : i18n.t("sections.skills.viewStack")
        }</span>
        <span class="skill-card__toggle-icon">${expand ? "−" : "+"}</span>
      </button>
      <div class="skill-card__details ${
        expand ? "is-visible" : ""
      }" id="${detailsId}" aria-hidden="${!expand}">
        ${summaryHTML}
        ${toolsHTML}
        <ul class="skill-card__tech-list">
          ${technologiesHTML}
        </ul>
      </div>
    `;

    return card;
  }

  private getAverageLevel(skill: Skill): number {
    if (!skill.technologies.length) return 0;
    const total = skill.technologies.reduce((acc, tech) => acc + tech.level, 0);
    return Math.round(total / skill.technologies.length);
  }

  private ensureSkillControls(section: Element, skills: Skill[]): void {
    let controls = section.querySelector<HTMLDivElement>(".skills__controls");
    if (!controls) {
      controls = document.createElement("div");
      controls.className = "skills__controls";
      controls.innerHTML = `
        <div class="skills__controls-main">
          <div class="skills__filters" role="tablist" aria-label="Filtrar stack tecnológico">
            ${this.buildSkillFilters(skills)}
          </div>
          <div class="skills__actions">
            <label class="skills__search">
              <span class="sr-only">${i18n.t("common.search")}</span>
              <input
                type="search"
                id="skill-search"
                placeholder="${i18n.t("sections.skills.search")}"
                autocomplete="off"
              />
            </label>
            <div class="skills__view-toggle" role="group" aria-label="Modo de visualización">
              <button type="button" class="skill-view-btn" data-view="detailed">${i18n.t("sections.skills.detailed")}</button>
              <button type="button" class="skill-view-btn" data-view="compact">${i18n.t("sections.skills.compact")}</button>
            </div>
          </div>
        </div>
        <div class="skills__status" aria-live="polite"></div>
      `;

      const title = section.querySelector(".section-title");
      title?.insertAdjacentElement("afterend", controls);
      this.bindSkillControlEvents(controls);
    }

    this.updateSkillControlsUI(section);
  }

  private buildSkillFilters(skills: Skill[]): string {
    const categoryMap = new Map<
      string,
      { id: string; label: string; icon: string }
    >();

    skills.forEach((skill) => {
      const id = this.normalizeCategoryForDataset(skill.category);
      if (!categoryMap.has(id)) {
        categoryMap.set(id, {
          id,
          label: skill.category,
          icon: skill.icon,
        });
      }
    });

    const buttons = Array.from(categoryMap.values())
      .map(
        (cat) => `
          <button
            type="button"
            class="skill-filter"
            data-skill-filter="${cat.id}"
          >
            <span class="skill-filter__icon">${cat.icon}</span>
            <span>${cat.label}</span>
          </button>
        `
      )
      .join("");

    return `
      <button type="button" class="skill-filter" data-skill-filter="all">
        <span class="skill-filter__icon">🌐</span>
        <span>${i18n.t("sections.skills.filters.all")}</span>
      </button>
      ${buttons}
    `;
  }

  private bindSkillControlEvents(controls: HTMLElement): void {
    const searchInput =
      controls.querySelector<HTMLInputElement>("#skill-search");
    if (searchInput) {
      searchInput.addEventListener("input", (event) => {
        this.skillSearchTerm = (event.target as HTMLInputElement).value;
        this.refreshSkillsGrid();
      });
    }

    controls.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const filterBtn = target.closest<HTMLButtonElement>(
        "[data-skill-filter]"
      );
      if (filterBtn) {
        const category = filterBtn.dataset.skillFilter ?? "all";
        this.activeSkillCategory = category;
        this.refreshSkillsGrid();
        return;
      }

      const viewBtn = target.closest<HTMLButtonElement>(".skill-view-btn");
      if (viewBtn) {
        const view =
          (viewBtn.dataset.view as "detailed" | "compact") ?? "detailed";
        if (this.skillViewMode !== view) {
          this.skillViewMode = view;
          this.refreshSkillsGrid();
        }
      }
    });
  }

  private refreshSkillsGrid(): void {
    const section = document.querySelector(".skills");
    const container = section?.querySelector(".skills__grid");
    if (!section || !container) return;
    const skills = this.projectsManager.getSkills();
    this.updateSkillsGrid(skills, container, section);
  }

  private updateSkillsGrid(
    skills: Skill[],
    container: Element,
    section: Element
  ): void {
    const filteredSkills = this.getFilteredSkills(skills);
    container.innerHTML = "";

    if (!filteredSkills.length) {
      container.innerHTML = `
        <div class="skills__empty">
          <p>${i18n.t("sections.skills.noResults")}</p>
          <button type="button" class="btn btn--secondary" data-reset-skills>${i18n.t("sections.skills.resetFilters")}</button>
        </div>
      `;

      const resetBtn = container.querySelector<HTMLButtonElement>(
        "[data-reset-skills]"
      );
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          this.activeSkillCategory = "all";
          this.skillSearchTerm = "";
          this.skillViewMode = "detailed";
          this.refreshSkillsGrid();
        });
      }

      this.updateSkillStatus(section, 0, skills.length);
      this.updateSkillControlsUI(section);
      section.setAttribute("data-view-mode", this.skillViewMode);
      return;
    }

    const expandAll = this.skillViewMode === "detailed";

    filteredSkills.forEach((skill, index) => {
      const card = this.createSkillCard(skill, expandAll);
      card.style.animationDelay = `${index * 0.08}s`;
      container.appendChild(card);
      this.applySkillCardState(card, expandAll);
    });

    this.attachSkillCardEvents(container);
    this.setupSkillObserver();

    const fills = container.querySelectorAll<HTMLElement>(".skill-bar-fill");
    fills.forEach((fill) => {
      const level = fill.dataset.level;
      if (!level) return;
      fill.style.width = "0%";
      if (this.skillObserver) {
        this.skillObserver.observe(fill);
      } else {
        this.animateSkillBars([fill]);
      }
    });

    this.updateSkillStatus(section, filteredSkills.length, skills.length);
    this.updateSkillControlsUI(section);
    section.setAttribute("data-view-mode", this.skillViewMode);
  }

  private getFilteredSkills(skills: Skill[]): Skill[] {
    return skills.filter((skill) => {
      const matchesCategory =
        this.activeSkillCategory === "all" ||
        this.normalizeCategoryForDataset(skill.category) ===
          this.activeSkillCategory;

      return matchesCategory && this.matchesSkillSearch(skill);
    });
  }

  private matchesSkillSearch(skill: Skill): boolean {
    const term = this.skillSearchTerm.trim().toLowerCase();
    if (!term) return true;

    const haystack = [
      skill.title,
      skill.category,
      skill.summary ?? "",
      ...(skill.coreTools ?? []),
      ...skill.technologies.map((tech) => tech.name),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(term);
  }

  private updateSkillStatus(
    section: Element,
    visibleCount: number,
    totalCount: number
  ): void {
    const status = section.querySelector<HTMLElement>(".skills__status");
    if (!status) return;

    const visibleLabel =
      visibleCount === 1
        ? i18n.t("sections.skills.availableStackSingular")
        : i18n.t("sections.skills.availableStacks");
    status.textContent = `${visibleCount} ${visibleLabel} · ${totalCount} ${i18n.t("sections.skills.totalStacks")}`;
  }

  private updateSkillControlsUI(section: Element): void {
    const controls = section.querySelector<HTMLDivElement>(".skills__controls");
    if (!controls) return;

    controls
      .querySelectorAll<HTMLButtonElement>("[data-skill-filter]")
      .forEach((button) => {
        const category = button.dataset.skillFilter ?? "all";
        button.classList.toggle(
          "is-active",
          category === this.activeSkillCategory
        );
      });

    const searchInput =
      controls.querySelector<HTMLInputElement>("#skill-search");
    if (searchInput && searchInput.value !== this.skillSearchTerm) {
      searchInput.value = this.skillSearchTerm;
    }

    controls
      .querySelectorAll<HTMLButtonElement>(".skill-view-btn")
      .forEach((button) => {
        const view =
          (button.dataset.view as "detailed" | "compact") ?? "detailed";
        button.classList.toggle("is-active", view === this.skillViewMode);
      });
  }

  private applySkillCardState(card: HTMLElement, expand: boolean): void {
    const toggle = card.querySelector<HTMLButtonElement>(".skill-card__toggle");
    const details = card.querySelector<HTMLElement>(".skill-card__details");

    card.classList.toggle("skill-card--expanded", expand);

    if (toggle) {
      toggle.setAttribute("aria-expanded", String(expand));
      const label = toggle.querySelector<HTMLElement>(
        ".skill-card__toggle-label"
      );
      const icon = toggle.querySelector<HTMLElement>(
        ".skill-card__toggle-icon"
      );
      if (label) {
        label.textContent = expand ? i18n.t("sections.skills.hideDetails") : i18n.t("sections.skills.viewStack");
      }
      if (icon) {
        icon.textContent = expand ? "−" : "+";
      }
    }

    if (details) {
      if (expand) {
        details.classList.add("is-visible");
        details.setAttribute("aria-hidden", "false");
        if (this.skillViewMode === "detailed") {
          details.style.maxHeight = "none";
        } else {
          details.style.maxHeight = `${details.scrollHeight}px`;
        }
        this.animateSkillBars(
          details.querySelectorAll<HTMLElement>(".skill-bar-fill")
        );
      } else {
        details.classList.remove("is-visible");
        details.setAttribute("aria-hidden", "true");
        details.style.maxHeight = "0px";
      }
    }
  }

  private attachSkillCardEvents(container: Element): void {
    container
      .querySelectorAll<HTMLButtonElement>(".skill-card__toggle")
      .forEach((toggle) => {
        toggle.addEventListener("click", () => {
          if (this.skillViewMode === "detailed") return;
          const card = toggle.closest<HTMLElement>(".skill-card");
          if (!card) return;
          const isExpanded = !card.classList.contains("skill-card--expanded");
          this.applySkillCardState(card, isExpanded);
        });
      });
  }

  private setupSkillObserver(): void {
    if (this.skillObserver) return;

    this.skillObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          const level = target.dataset.level;
          if (level) {
            requestAnimationFrame(() => {
              target.style.width = `${level}%`;
              target.classList.add("skill-bar-fill--visible");
            });
          }
          observer.unobserve(target);
        });
      },
      { threshold: 0.45 }
    );
  }

  private animateSkillBars(fills: Iterable<HTMLElement>): void {
    for (const fill of fills) {
      const level = fill.dataset.level;
      if (!level) continue;
      requestAnimationFrame(() => {
        fill.style.width = `${level}%`;
        fill.classList.add("skill-bar-fill--visible");
      });
    }
  }

  private normalizeCategoryForDataset(category: string): string {
    return category
      .toLowerCase()
      .replace(/\+/g, "-plus-")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /**
   * Render projects with filters
   */
  renderProjectsWithFilters(): void {
    const container = document.querySelector(".projects");
    if (!container) return;

    // Add filter controls
    const filtersHTML = `
      <div class="projects__controls">
        <div class="projects__search">
          <input 
            type="text" 
            id="project-search" 
            placeholder="${i18n.t("sections.projects.search")}" 
            class="search-input"
          />
        </div>
        <div class="projects__filters">
          ${this.createCategoryFilters()}
        </div>
        <div class="projects__sort">
          <select id="project-sort" class="sort-select">
            <option value="date-desc">${i18n.t("sections.projects.sort.newest")}</option>
            <option value="date-asc">${i18n.t("sections.projects.sort.oldest")}</option>
            <option value="name-asc">${i18n.t("sections.projects.sort.nameAsc")}</option>
            <option value="name-desc">${i18n.t("sections.projects.sort.nameDesc")}</option>
            <option value="stars-desc">${i18n.t("sections.projects.sort.stars")}</option>
          </select>
        </div>
      </div>
      <div class="projects__grid"></div>
    `;

    const existingTitle = container.querySelector(".section-title");
    const gridContainer = container.querySelector(".projects__grid");

    if (!gridContainer) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = filtersHTML;

      while (tempDiv.firstChild) {
        existingTitle?.insertAdjacentElement(
          "afterend",
          tempDiv.firstChild as Element
        );
      }
    }

    // Setup event listeners
    this.setupFilterListeners();

    // Initial render
    this.renderProjects();
  }

  /**
   * Create category filter buttons
   */
  private createCategoryFilters(): string {
    const categories = [
      { id: "all", label: i18n.t("sections.projects.filters.all"), icon: "📂" },
      { id: "backend", label: i18n.t("sections.projects.filters.backend"), icon: "⚙️" },
      { id: "frontend", label: i18n.t("sections.projects.filters.frontend"), icon: "🎨" },
      { id: "fullstack", label: i18n.t("sections.projects.filters.fullstack"), icon: "🌐" },
      { id: "devops", label: i18n.t("sections.projects.filters.devops"), icon: "🐳" },
      { id: "ai-ml", label: i18n.t("sections.projects.filters.aiMl"), icon: "🧠" },
    ];

    return categories
      .map(
        (cat) => `
      <button 
        class="filter-btn ${cat.id === "all" ? "active" : ""}" 
        data-category="${cat.id}"
      >
        ${cat.icon} ${cat.label}
      </button>
    `
      )
      .join("");
  }

  /**
   * Setup filter event listeners
   */
  private setupFilterListeners(): void {
    // Search
    const searchInput = document.getElementById(
      "project-search"
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const term = (e.target as HTMLInputElement).value;
        this.projectsManager.setFilter({ searchTerm: term });
        this.renderProjects();
      });
    }

    // Category filters
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLElement;
        const category = target.dataset.category as any;

        // Update active state
        document
          .querySelectorAll(".filter-btn")
          .forEach((b) => b.classList.remove("active"));
        target.classList.add("active");

        this.projectsManager.setFilter({ category });
        this.renderProjects();
      });
    });

    // Sort
    const sortSelect = document.getElementById(
      "project-sort"
    ) as HTMLSelectElement;
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        const value = (e.target as HTMLSelectElement).value;
        const [sortBy, sortOrder] = value.split("-");
        this.projectsManager.setFilter({
          sortBy: sortBy as any,
          sortOrder: sortOrder as any,
        });
        this.renderProjects();
      });
    }
  }

  /**
   * Render projects grid
   */
  private renderProjects(): void {
    const grid = document.querySelector(".projects__grid");
    if (!grid) return;

    const projects = this.projectsManager.getFilteredProjects();

    if (projects.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <p>${i18n.t("sections.projects.noResults")}</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = projects
      .map((project) => this.createProjectCard(project))
      .join("");
  }

  /**
   * Create project card HTML
   */
  private createProjectCard(project: Project): string {
    const techBadges = project.technologies
      .map((tech) => `<span class="tech-badge">${tech}</span>`)
      .join("");

    const demoButton = project.demoUrl
      ? `<a href="${project.demoUrl}" target="_blank" class="btn btn--primary">
           ${i18n.t("sections.projects.links.demo")}
         </a>`
      : "";

    const dockerInfo = project.dockerImages
      ? `
      <div class="docker-info">
        <h4>${i18n.t("sections.projects.docker.images")}</h4>
        ${project.dockerImages
          .map(
            (image) => `
          <div class="docker-command">
            <code>docker pull ${image}</code>
            <button class="copy-btn" data-copy="${image}">📋</button>
          </div>
        `
          )
          .join("")}
      </div>
    `
      : "";

    const stats = project.stats
      ? `
      <div class="project-stats">
        <span class="stat">${i18n.t("sections.projects.stats.stars")} ${project.stats.stars}</span>
        <span class="stat">${i18n.t("sections.projects.stats.forks")} ${project.stats.forks}</span>
        <span class="stat">${project.stats.language}</span>
      </div>
    `
      : "";

    return `
      <div class="project-card fade-in-up" data-category="${project.category}">
        <div class="project-card__image-wrapper">
          <img src="${project.image}" alt="${project.title}" class="project-card__image" />
          <div class="project-card__overlay">
            <span class="category-badge">${project.category}</span>
          </div>
        </div>
        <div class="project-card__content">
          <h3 class="project-card__title">${project.title}</h3>
          <p class="project-card__description">${project.shortDescription}</p>
          <div class="tech-tags">${techBadges}</div>
          ${stats}
          ${dockerInfo}
          <div class="project-card__links">
            ${demoButton}
            <a href="${project.repoUrl}" target="_blank" class="btn btn--secondary">
              <span>💻</span> ${i18n.t("sections.projects.links.code")}
            </a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render experience list
   */
renderExperience(): void {
  const experience = this.projectsManager.getExperience();
  const list = document.querySelector(".hero-section__experience-list");
  if (!list) return;

  list.innerHTML = experience
    .map((key) => `<li>${i18n.t(key)}</li>`)
    .join("");
}

  /**
   * Render GitHub stats dashboard
   */
  renderGitHubStats(stats: GitHubStats): void {
    const container = document.getElementById("github-stats");
    if (!container) return;

    const profile = this.projectsManager.getProfile();
    const githubProfileUrl = profile
      ? this.formatSocialLink(profile.github, "github")
      : "https://github.com/";

    const languagesEntries = Object.entries(stats.languages);
    const languagesChart = languagesEntries.length
      ? languagesEntries
          .map(([lang, count]) => {
            const percentage = ((count / stats.totalRepos) * 100).toFixed(1);
            return `
              <div class="language-item">
                <span class="language-name">${lang}</span>
                <div class="language-bar">
                  <div class="language-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="language-count">${count}</span>
              </div>
            `;
          })
          .join("")
      : `<p class="languages-empty">${i18n.t("sections.github.noLanguages")}</p>`;

    const mostPopular = stats.mostPopularRepo
      ? `<a class="github-highlight" href="${stats.mostPopularRepo.html_url}" target="_blank" rel="noopener">${stats.mostPopularRepo.name} · ⭐ ${stats.mostPopularRepo.stargazers_count}</a>`
      : `<span class="github-highlight">${i18n.t("sections.github.exploreProjects")}</span>`;

    container.innerHTML = `
      <div class="github-stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.totalRepos}</div>
          <div class="stat-label">${i18n.t("sections.github.repositories")}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">⭐ ${stats.totalStars}</div>
          <div class="stat-label">${i18n.t("sections.github.totalStars")}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">🔀 ${stats.totalForks}</div>
          <div class="stat-label">${i18n.t("sections.github.totalForks")}</div>
        </div>
        <div class="stat-card stat-card--highlight">
          <div class="stat-label">${i18n.t("sections.github.featuredProject")}</div>
          <div class="stat-value">${mostPopular}</div>
        </div>
      </div>
      <div class="github-stats-secondary">
        <div class="languages-chart">
          <h4>${i18n.t("sections.github.mostUsedLanguages")}</h4>
          ${languagesChart}
        </div>
        <div class="github-repos-section">
          <div class="github-repos-header">
            <h3>${i18n.t("sections.github.latestProjects")}</h3>
            <a class="github-repos-link" href="${githubProfileUrl}" target="_blank" rel="noopener">${i18n.t("sections.github.viewAllProfile")}</a>
          </div>
          <div class="github-repos-grid"></div>
        </div>
      </div>
    `;
  }

  renderGitHubRepositories(repos: GitHubRepo[]): void {
    const grid = document.querySelector<HTMLDivElement>(
      "#github-stats .github-repos-grid"
    );
    if (!grid) return;

    if (!repos.length) {
      grid.innerHTML = `<p class="github-repos-empty">${i18n.t("sections.github.noRepos")}</p>`;
      return;
    }

    const featuredRepos = [...repos]
      .sort((a, b) => {
        if (b.stargazers_count !== a.stargazers_count) {
          return b.stargazers_count - a.stargazers_count;
        }
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      })
      .slice(0, 6);

    grid.innerHTML = featuredRepos
      .map((repo) => this.createGitHubRepoCard(repo))
      .join("");
  }

  renderGitHubError(message: string): void {
    const container = document.getElementById("github-stats");
    if (!container) return;

    container.innerHTML = `
      <div class="github-error">
        <p>${i18n.t("sections.github.error")} ${message}</p>
        <p class="github-error__hint">${i18n.t("sections.github.errorHint")}</p>
      </div>
    `;
  }

  private createGitHubRepoCard(repo: GitHubRepo): string {
    const topics = repo.topics?.slice(0, 4) || [];
    const topicsHTML = topics
      .map((topic) => `<span class="repo-topic">${topic}</span>`)
      .join("");

    const description = repo.description
      ? repo.description
      : "Este proyecto aún no tiene descripción.";

    const language = repo.language
      ? `<span class="repo-language">${repo.language}</span>`
      : "";

    return `
      <article class="github-repo-card">
        <div class="github-repo-card__header">
          <a href="${
            repo.html_url
          }" target="_blank" rel="noopener" class="github-repo-name">
            ${repo.name}
          </a>
          ${language}
        </div>
        <p class="github-repo-description">${description}</p>
        <div class="github-repo-topics">${
          topicsHTML ||
          '<span class="repo-topic repo-topic--empty">Sin etiquetas</span>'
        }</div>
        <div class="github-repo-meta">
          <span>⭐ ${repo.stargazers_count}</span>
          <span>🔀 ${repo.forks_count}</span>
          <span>🕒 ${this.formatRelativeUpdate(repo.updated_at)}</span>
        </div>
      </article>
    `;
  }

  private formatRelativeUpdate(dateString: string): string {
    const updatedDate = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - updatedDate.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} ${days === 1 ? i18n.t("common.dayAgo") : i18n.t("common.daysAgo")}`;
    }

    if (hours > 0) {
      return `${hours} ${hours === 1 ? i18n.t("common.hourAgo") : i18n.t("common.hoursAgo")}`;
    }

    if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? i18n.t("common.minuteAgo") : i18n.t("common.minutesAgo")}`;
    }

    return i18n.t("common.justNow");
  }

  /**
   * Update projects with real GitHub data
   */
  updateProjectsWithGitHubData(repos: GitHubRepo[]): void {
    const projects = this.projectsManager.getAllProjects();

    projects.forEach((project) => {
      const repo = repos.find((r) => r.html_url === project.repoUrl);
      if (repo) {
        project.stats = {
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language || "Unknown",
        };
      }
    });

    this.renderProjects();
  }

  /**
   * Create typing effect for text
   */
  private createTypingEffect(
    element: HTMLElement,
    text: string,
    speed: number = 100
  ): void {
    element.textContent = "";
    let index = 0;

    const type = () => {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(type, speed);
      }
    };

    setTimeout(type, 500);
  }
}
