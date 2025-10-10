import type { GitHubStats, GitHubRepo } from "@/types";

export class LiveDashboard {
  private container: HTMLElement;
  private stats: GitHubStats | null = null;
  private repos: GitHubRepo[] = [];
  private commitData: number[] = [];

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Dashboard container #${containerId} not found`);
    }

    this.container = container;
    this.generateMockCommitData();
    this.render();
  }

  private generateMockCommitData(): void {
    // Generate 365 days of mock commit data
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      // Random commits 0-10
      this.commitData.push(Math.floor(Math.random() * 11));
    }
  }

  public updateStats(stats: GitHubStats, repos: GitHubRepo[]): void {
    this.stats = stats;
    this.repos = repos;
    this.updateMetrics();
    this.updateHeatmap();
    console.log(`📊 Dashboard updated with ${repos.length} repositories`);
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="dashboard">
        <!-- Header -->
        <div class="dashboard__header">
          <h3 class="dashboard__title">
            <i class="fas fa-tachometer-alt"></i>
            Live Developer Metrics
          </h3>
          <div class="dashboard__status">
            <span class="status-indicator status-indicator--active"></span>
            <span>System Online</span>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="dashboard__metrics">
          <div class="metric-card metric-card--primary">
            <div class="metric-card__icon">
              <i class="fas fa-code-branch"></i>
            </div>
            <div class="metric-card__content">
              <div class="metric-card__value" id="metric-repos">--</div>
              <div class="metric-card__label">Total Repositories</div>
            </div>
            <div class="metric-card__trend">
              <i class="fas fa-arrow-up"></i> +${Math.floor(Math.random() * 5)}%
            </div>
          </div>

          <div class="metric-card metric-card--success">
            <div class="metric-card__icon">
              <i class="fas fa-star"></i>
            </div>
            <div class="metric-card__content">
              <div class="metric-card__value" id="metric-stars">--</div>
              <div class="metric-card__label">Total Stars</div>
            </div>
            <div class="metric-card__trend">
              <i class="fas fa-arrow-up"></i> +${Math.floor(
                Math.random() * 10
              )}%
            </div>
          </div>

          <div class="metric-card metric-card--warning">
            <div class="metric-card__icon">
              <i class="fas fa-fire"></i>
            </div>
            <div class="metric-card__content">
              <div class="metric-card__value" id="metric-streak">${Math.floor(
                Math.random() * 30
              )}</div>
              <div class="metric-card__label">Day Streak</div>
            </div>
            <div class="metric-card__trend">
              <i class="fas fa-arrow-up"></i> Active
            </div>
          </div>

          <div class="metric-card metric-card--info">
            <div class="metric-card__icon">
              <i class="fas fa-code"></i>
            </div>
            <div class="metric-card__content">
              <div class="metric-card__value" id="metric-commits">${this.commitData.reduce(
                (a, b) => a + b,
                0
              )}</div>
              <div class="metric-card__label">Total Commits (365d)</div>
            </div>
            <div class="metric-card__trend">
              <i class="fas fa-check"></i> Tracked
            </div>
          </div>
        </div>

        <!-- Commit Heatmap -->
        <div class="dashboard__section">
          <h4 class="dashboard__section-title">
            <i class="fas fa-calendar-alt"></i>
            Commit Activity (Last 365 Days)
          </h4>
          <div class="commit-heatmap" id="commit-heatmap">
            <!-- Generated dynamically -->
          </div>
          <div class="heatmap-legend">
            <span>Less</span>
            <div class="legend-scale">
              <span class="legend-cell level-0"></span>
              <span class="legend-cell level-1"></span>
              <span class="legend-cell level-2"></span>
              <span class="legend-cell level-3"></span>
              <span class="legend-cell level-4"></span>
            </div>
            <span>More</span>
          </div>
        </div>

        <!-- Language Distribution -->
        <div class="dashboard__section">
          <h4 class="dashboard__section-title">
            <i class="fas fa-chart-pie"></i>
            Language Distribution
          </h4>
          <div class="language-chart" id="language-chart">
            <!-- Generated dynamically -->
          </div>
        </div>

        <!-- Deploy Status -->
        <div class="dashboard__section">
          <h4 class="dashboard__section-title">
            <i class="fas fa-rocket"></i>
            Deployment Status
          </h4>
          <div class="deploy-status">
            <div class="deploy-item">
              <div class="deploy-item__header">
                <span class="deploy-item__name">Portfolio Website</span>
                <span class="deploy-badge deploy-badge--success">
                  <i class="fas fa-check-circle"></i> Live
                </span>
              </div>
              <div class="deploy-item__info">
                <span>Last deployed: 2 hours ago</span>
                <span>Status: 200 OK</span>
              </div>
              <div class="deploy-progress">
                <div class="deploy-progress__bar" style="width: 100%"></div>
              </div>
            </div>

            <div class="deploy-item">
              <div class="deploy-item__header">
                <span class="deploy-item__name">API Backend</span>
                <span class="deploy-badge deploy-badge--success">
                  <i class="fas fa-check-circle"></i> Live
                </span>
              </div>
              <div class="deploy-item__info">
                <span>Last deployed: 1 day ago</span>
                <span>Status: Healthy</span>
              </div>
              <div class="deploy-progress">
                <div class="deploy-progress__bar" style="width: 100%"></div>
              </div>
            </div>

            <div class="deploy-item">
              <div class="deploy-item__header">
                <span class="deploy-item__name">Docker Services</span>
                <span class="deploy-badge deploy-badge--warning">
                  <i class="fas fa-exclamation-triangle"></i> Staging
                </span>
              </div>
              <div class="deploy-item__info">
                <span>Last deployed: Testing</span>
                <span>Status: Validation</span>
              </div>
              <div class="deploy-progress">
                <div class="deploy-progress__bar deploy-progress__bar--warning" style="width: 65%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Monitoring -->
        <div class="dashboard__section">
          <h4 class="dashboard__section-title">
            <i class="fas fa-server"></i>
            Tech Stack System Status
          </h4>
          <div class="system-monitor">
            ${this.generateSystemServices()}
          </div>
        </div>
      </div>
    `;

    this.renderHeatmap();
  }

  private renderHeatmap(): void {
    const heatmap = this.container.querySelector("#commit-heatmap");
    if (!heatmap) return;

    const weeks = [];
    for (let i = 0; i < 53; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const index = i * 7 + j;
        if (index < this.commitData.length) {
          week.push(this.commitData[index]);
        }
      }
      weeks.push(week);
    }

    heatmap.innerHTML = weeks
      .map(
        (week) => `
      <div class="heatmap-week">
        ${week
          .map((commits) => {
            const level =
              commits === 0 ? 0 : Math.min(Math.ceil(commits / 3), 4);
            return `<div class="heatmap-day level-${level}" data-commits="${commits}" title="${commits} commits"></div>`;
          })
          .join("")}
      </div>
    `
      )
      .join("");

    // Log repos count for debugging
    console.log(`📊 Dashboard tracking ${this.repos.length} repositories`);
  }

  private updateMetrics(): void {
    if (!this.stats) return;

    const reposEl = this.container.querySelector("#metric-repos");
    const starsEl = this.container.querySelector("#metric-stars");

    if (reposEl) reposEl.textContent = this.stats.totalRepos.toString();
    if (starsEl) starsEl.textContent = this.stats.totalStars.toString();
  }

  private updateHeatmap(): void {
    // Update language chart
    if (this.stats && this.stats.languages) {
      const langChart = this.container.querySelector("#language-chart");
      if (langChart) {
        const total = Object.values(this.stats.languages).reduce(
          (a, b) => a + b,
          0
        );
        const sortedLangs = Object.entries(this.stats.languages)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5);

        langChart.innerHTML = sortedLangs
          .map(([lang, count]) => {
            const percentage = ((count / total) * 100).toFixed(1);
            const color = this.getLanguageColor(lang);
            return `
              <div class="language-bar">
                <div class="language-bar__header">
                  <span class="language-bar__name">
                    <span class="language-dot" style="background: ${color}"></span>
                    ${lang}
                  </span>
                  <span class="language-bar__percentage">${percentage}%</span>
                </div>
                <div class="language-bar__progress">
                  <div class="language-bar__fill" style="width: ${percentage}%; background: ${color}"></div>
                </div>
              </div>
            `;
          })
          .join("");
      }
    }
  }

  private getLanguageColor(lang: string): string {
    const colors: Record<string, string> = {
      TypeScript: "#3178c6",
      JavaScript: "#f1e05a",
      Java: "#b07219",
      Python: "#3572A5",
      HTML: "#e34c26",
      CSS: "#563d7c",
      Shell: "#89e051",
      Dockerfile: "#384d54",
    };
    return colors[lang] || "#8b949e";
  }

  private generateSystemServices(): string {
    const services = [
      { name: "Java / Spring Boot", status: "active", uptime: "99.8%" },
      { name: "Node.js / Express", status: "active", uptime: "99.5%" },
      { name: "React / TypeScript", status: "active", uptime: "99.9%" },
      { name: "PostgreSQL", status: "active", uptime: "100%" },
      { name: "Docker", status: "active", uptime: "98.2%" },
      { name: "Git / GitHub", status: "active", uptime: "100%" },
    ];

    return services
      .map(
        (service) => `
      <div class="service-item">
        <div class="service-item__icon">
          <span class="status-dot status-dot--${service.status}"></span>
        </div>
        <div class="service-item__content">
          <div class="service-item__name">${service.name}</div>
          <div class="service-item__meta">
            <span class="service-item__status">${service.status.toUpperCase()}</span>
            <span class="service-item__uptime">Uptime: ${service.uptime}</span>
          </div>
        </div>
        <div class="service-item__pulse">
          <div class="pulse-animation"></div>
        </div>
      </div>
    `
      )
      .join("");
  }

  public destroy(): void {
    this.container.innerHTML = "";
  }
}
