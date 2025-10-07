import type { GitHubRepo, GitHubStats } from "../types";

export class GitHubAPI {
  private readonly username: string;
  private readonly apiUrl = "https://api.github.com";
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly cacheDuration = 5 * 60 * 1000; // 5 minutes

  constructor(username: string) {
    this.username = username;
  }

  /**
   * Fetch all repositories for the user
   */
  async fetchRepositories(
    options: {
      sort?: "updated" | "created" | "pushed" | "full_name";
      perPage?: number;
      includePrivate?: boolean;
    } = {}
  ): Promise<GitHubRepo[]> {
    const { sort = "updated", perPage = 100, includePrivate = false } = options;
    const cacheKey = `repos-${sort}-${perPage}`;

    // Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.apiUrl}/users/${this.username}/repos?sort=${sort}&per_page=${perPage}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const repos: GitHubRepo[] = await response.json();

      // Filter out forks and optionally private repos
      const filteredRepos = repos.filter((repo) => {
        if (repo.fork) return false;
        if (!includePrivate && repo.private) return false;
        return true;
      });

      this.setCache(cacheKey, filteredRepos);
      return filteredRepos;
    } catch (error) {
      console.error("Error fetching GitHub repositories:", error);
      return [];
    }
  }

  /**
   * Get statistics about all repositories
   */
  async getStats(): Promise<GitHubStats> {
    const repos = await this.fetchRepositories();
    return this.buildStatsFromRepos(repos);
  }

  buildStatsFromRepos(repos: GitHubRepo[]): GitHubStats {
    const stats: GitHubStats = {
      totalRepos: repos.length,
      totalStars: 0,
      totalForks: 0,
      languages: {},
      mostPopularRepo: null,
    };

    let maxStars = 0;

    repos.forEach((repo) => {
      stats.totalStars += repo.stargazers_count;
      stats.totalForks += repo.forks_count;

      if (repo.language) {
        stats.languages[repo.language] =
          (stats.languages[repo.language] || 0) + 1;
      }

      if (repo.stargazers_count > maxStars) {
        maxStars = repo.stargazers_count;
        stats.mostPopularRepo = repo;
      }
    });

    return stats;
  }

  /**
   * Fetch featured repositories (with specific topics)
   */
  async getFeaturedRepos(
    topics: string[] = ["portfolio"]
  ): Promise<GitHubRepo[]> {
    const repos = await this.fetchRepositories();

    return repos.filter((repo) =>
      repo.topics.some((topic: string) => topics.includes(topic))
    );
  }

  /**
   * Search repositories by technology/language
   */
  async searchByTechnology(technology: string): Promise<GitHubRepo[]> {
    const repos = await this.fetchRepositories();

    return repos.filter(
      (repo) =>
        repo.language?.toLowerCase() === technology.toLowerCase() ||
        repo.topics.some((topic: string) =>
          topic.toLowerCase().includes(technology.toLowerCase())
        )
    );
  }

  /**
   * Get recently updated repositories
   */
  async getRecentlyUpdated(limit: number = 5): Promise<GitHubRepo[]> {
    const repos = await this.fetchRepositories({ sort: "updated" });
    return repos.slice(0, limit);
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheDuration) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache manually
   */
  clearCache(): void {
    this.cache.clear();
  }
}
