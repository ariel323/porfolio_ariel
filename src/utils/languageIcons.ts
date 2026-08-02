interface LanguageMeta {
  icon: string;
  color: string;
  category: string;
}

const LANGUAGE_META: Record<string, LanguageMeta> = {
  TypeScript: { icon: "TS", color: "#3178c6", category: "Frontend" },
  JavaScript: { icon: "JS", color: "#f7df1e", category: "Frontend" },
  Java: { icon: "JV", color: "#b07219", category: "Backend" },
  Python: { icon: "PY", color: "#3572a5", category: "Backend" },
  HTML: { icon: "</>", color: "#e34f26", category: "Frontend" },
  CSS: { icon: "#", color: "#563d7c", category: "Frontend" },
  SCSS: { icon: "#", color: "#c6538c", category: "Frontend" },
  Rust: { icon: "RS", color: "#dea584", category: "Systems" },
  Go: { icon: "GO", color: "#00add8", category: "Backend" },
  Ruby: { icon: "RB", color: "#cc342d", category: "Backend" },
  PHP: { icon: "PH", color: "#777bb4", category: "Backend" },
  "C#": { icon: "C#", color: "#68217a", category: "Backend" },
  "C++": { icon: "C+", color: "#f34b7d", category: "Systems" },
  C: { icon: "C", color: "#555555", category: "Systems" },
  Swift: { icon: "SW", color: "#f05138", category: "Mobile" },
  Kotlin: { icon: "KT", color: "#7f52ff", category: "Mobile" },
  Dart: { icon: "DT", color: "#00b4ab", category: "Mobile" },
  Shell: { icon: "SH", color: "#89e051", category: "DevOps" },
  Dockerfile: { icon: "DK", color: "#2496ed", category: "DevOps" },
  HCL: { icon: "TF", color: "#583ccd", category: "DevOps" },
  YAML: { icon: ">", color: "#cb171e", category: "DevOps" },
  PowerShell: { icon: "PW", color: "#012456", category: "DevOps" },
  Jupyter: { icon: "NB", color: "#f05a1f", category: "AI-ML" },
  Vue: { icon: "VU", color: "#4fc08d", category: "Frontend" },
  Elixir: { icon: "EX", color: "#6e4a7e", category: "Backend" },
  "MDX": { color: "#fcb323", icon: "MD", category: "Frontend" },
  Markdown: { color: "#083fa1", icon: "MD", category: "Docs" },
};

export function getLanguageMeta(language: string): { icon: string; color: string; category: string } {
  return LANGUAGE_META[language] ?? { icon: language.slice(0, 2).toUpperCase(), color: "#535353", category: "Other" };
}

export function getTopLanguages(languages: Record<string, number>, limit = 6): { name: string; icon: string; color: string; category: string; repoCount: number }[] {
  return Object.entries(languages)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, repoCount]) => {
      const meta = getLanguageMeta(name);
      return { name, icon: meta.icon, color: meta.color, category: meta.category, repoCount };
    });
}