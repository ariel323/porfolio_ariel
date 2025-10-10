import type {
  PortfolioData,
  Project,
  FilterState,
  ProjectCategory,
} from "../types";

const PORTFOLIO_DATA_URL = new URL(
  "../data/portfolio-data.json",
  import.meta.url
).href;

export class ProjectsManager {
  private data: PortfolioData | null = null;
  private filteredProjects: Project[] = [];
  private filterState: FilterState = {
    category: "all",
    searchTerm: "",
    sortBy: "date",
    sortOrder: "desc",
  };

  /**
   * Load portfolio data from JSON file
   */
  async loadData(dataPath?: string): Promise<void> {
    const resolvedUrl = this.resolveDataUrl(dataPath);

    try {
      const response = await fetch(resolvedUrl, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status}`);
      }

      this.data = (await response.json()) as PortfolioData;
    } catch (error) {
      console.error("Error loading portfolio data:", error);

      if (!this.data) {
        try {
          this.data = await this.loadDataFromBundle();
        } catch (fallbackError) {
          console.error(
            "Fallback portfolio data import failed:",
            fallbackError
          );
          throw fallbackError;
        }
      }
    }

    if (!this.data) {
      throw new Error("Portfolio data is not available");
    }

    this.filteredProjects = this.data.projects || [];
    this.applyFilters();
  }

  private resolveDataUrl(path?: string): string {
    if (!path) {
      return PORTFOLIO_DATA_URL;
    }

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    try {
      return new URL(path, import.meta.url).href;
    } catch {
      return path;
    }
  }

  private async loadDataFromBundle(): Promise<PortfolioData> {
    const module = await import("../data/portfolio-data.json");
    return module.default as PortfolioData;
  }

  /**
   * Get all projects
   */
  getAllProjects(): Project[] {
    return this.data?.projects || [];
  }

  /**
   * Get filtered and sorted projects
   */
  getFilteredProjects(): Project[] {
    return this.filteredProjects;
  }

  /**
   * Get featured projects only
   */
  getFeaturedProjects(): Project[] {
    return this.getAllProjects().filter((project) => project.featured);
  }

  /**
   * Get project by ID
   */
  getProjectById(id: string): Project | undefined {
    return this.getAllProjects().find((project) => project.id === id);
  }

  /**
   * Get projects by category
   */
  getProjectsByCategory(category: ProjectCategory): Project[] {
    if (category === "all") {
      return this.getAllProjects();
    }
    return this.getAllProjects().filter(
      (project) => project.category === category
    );
  }

  /**
   * Get projects by technology
   */
  getProjectsByTechnology(technology: string): Project[] {
    return this.getAllProjects().filter((project) =>
      project.technologies.some((tech) =>
        tech.toLowerCase().includes(technology.toLowerCase())
      )
    );
  }

  /**
   * Search projects by term (searches in title, description, and technologies)
   */
  searchProjects(term: string): Project[] {
    if (!term.trim()) {
      return this.getAllProjects();
    }

    const searchTerm = term.toLowerCase();
    return this.getAllProjects().filter((project) => {
      const matchTitle = project.title.toLowerCase().includes(searchTerm);
      const matchDesc = project.description.toLowerCase().includes(searchTerm);
      const matchTech = project.technologies.some((tech) =>
        tech.toLowerCase().includes(searchTerm)
      );
      return matchTitle || matchDesc || matchTech;
    });
  }

  /**
   * Set filter state and apply filters
   */
  setFilter(updates: Partial<FilterState>): void {
    this.filterState = { ...this.filterState, ...updates };
    this.applyFilters();
  }

  /**
   * Get current filter state
   */
  getFilterState(): FilterState {
    return { ...this.filterState };
  }

  /**
   * Apply all filters
   */
  private applyFilters(): void {
    let projects = this.getAllProjects();

    // Apply category filter
    if (this.filterState.category !== "all") {
      projects = projects.filter(
        (p) => p.category === this.filterState.category
      );
    }

    // Apply search filter
    if (this.filterState.searchTerm.trim()) {
      const term = this.filterState.searchTerm.toLowerCase();
      projects = projects.filter((p) => {
        const matchTitle = p.title.toLowerCase().includes(term);
        const matchDesc = p.description.toLowerCase().includes(term);
        const matchTech = p.technologies.some((tech) =>
          tech.toLowerCase().includes(term)
        );
        return matchTitle || matchDesc || matchTech;
      });
    }

    // Apply sorting
    projects = this.sortProjects(
      projects,
      this.filterState.sortBy,
      this.filterState.sortOrder
    );

    this.filteredProjects = projects;
  }

  /**
   * Sort projects
   */
  private sortProjects(
    projects: Project[],
    sortBy: FilterState["sortBy"],
    order: FilterState["sortOrder"]
  ): Project[] {
    const sorted = [...projects];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          break;
        case "name":
          comparison = a.title.localeCompare(b.title);
          break;
        case "stars":
          comparison = (b.stats?.stars || 0) - (a.stats?.stars || 0);
          break;
      }

      return order === "asc" ? -comparison : comparison;
    });

    return sorted;
  }

  /**
   * Get all unique technologies used across projects
   */
  getAllTechnologies(): string[] {
    const techSet = new Set<string>();
    this.getAllProjects().forEach((project) => {
      project.technologies.forEach((tech) => techSet.add(tech));
    });
    return Array.from(techSet).sort();
  }

  /**
   * Get all unique categories
   */
  getAllCategories(): ProjectCategory[] {
    return ["all", "backend", "frontend", "fullstack", "devops", "ai-ml"];
  }

  /**
   * Get skills data
   */
  getSkills() {
    return this.data?.skills || [];
  }

  /**
   * Get profile data
   */
  getProfile() {
    return this.data?.profile || null;
  }

  /**
   * Get experience list
   */
  getExperience() {
    return this.data?.experience || [];
  }

  /**
   * Get all portfolio data
   */
  getData(): PortfolioData | null {
    return this.data;
  }
}
