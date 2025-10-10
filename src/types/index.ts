// Types for Portfolio Data
export interface Technology {
  name: string;
  level: number;
}

export interface Skill {
  id: string;
  category: string;
  title: string;
  icon: string;
  color: string;
  technologies: Technology[];
  summary?: string;
  coreTools?: string[];
}

export interface ProjectStats {
  stars: number;
  forks: number;
  language: string;
}

export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  image: string;
  technologies: string[];
  category: "backend" | "frontend" | "fullstack" | "devops" | "ai-ml";
  featured: boolean;
  demoUrl: string | null;
  repoUrl: string;
  dockerHub?: string;
  dockerImages?: string[];
  date: string;
  stats: ProjectStats;
}

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  image: string;
  github: string;
  linkedin: string;
  email: string;
  whatsapp: string;
}

// Experience Types
export interface Experience {
  id: string;
  role: string;
  company: string;
  companyUrl?: string;
  location: string;
  period: {
    start: string; // "YYYY-MM"
    end: string | "present";
  };
  description: string;
  achievements: string[];
  technologies: string[];
  type: "full-time" | "freelance" | "contract" | "internship";
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  period: {
    start: string; // "YYYY"
    end: string;
  };
  description?: string;
  achievements?: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string; // "YYYY-MM"
  credentialUrl?: string;
  logo?: string;
}

export interface PortfolioData {
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  experience: string[];
  experiences?: Experience[];
  education?: Education[];
  certifications?: Certification[];
  metadata: {
    lastUpdated: string;
    version: string;
  };
}

// GitHub API Types
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  private: boolean;
  language: string | null;
  topics: string[];
  updated_at: string;
  created_at: string;
  pushed_at: string;
}

export interface GitHubStats {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  languages: Record<string, number>;
  mostPopularRepo: GitHubRepo | null;
}

// Animation Types
export interface ParticleConfig {
  count: number;
  color: string;
  size: number;
  speed: number;
}

export interface AnimationConfig {
  duration: number;
  ease: string;
  delay?: number;
}

// Filter Types
export type ProjectCategory =
  | "all"
  | "backend"
  | "frontend"
  | "fullstack"
  | "devops"
  | "ai-ml";

export interface FilterState {
  category: ProjectCategory;
  searchTerm: string;
  sortBy: "date" | "name" | "stars";
  sortOrder: "asc" | "desc";
}
