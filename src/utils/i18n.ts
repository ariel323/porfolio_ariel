import { translations, type Language } from "./translations";

export type { Language } from "./translations";

export class I18n {
  private currentLanguage: Language;
  private listeners: Set<(lang: Language) => void> = new Set();
  public static readonly STORAGE_KEY = "portfolio-language";

  constructor() {
    this.currentLanguage = this.detectLanguage();
  }

  detectLanguage(): Language {
    const stored = localStorage.getItem(I18n.STORAGE_KEY);
    if (stored === "es" || stored === "en") {
      return stored;
    }

    const browserLang = (navigator.language || navigator.languages?.[0] || "es").toLowerCase();

    if (browserLang.startsWith("es")) {
      return "es";
    }

    if (browserLang.startsWith("en")) {
      return "en";
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const spanishTimezones = [
      "America/Argentina",
      "America/Buenos_Aires",
      "America/Mexico_City",
      "America/Santiago",
      "America/Bogota",
      "America/Lima",
      "America/Caracas",
      "America/Montevideo",
      "America/Asuncion",
      "America/La_Paz",
      "America/Havana",
      "Europe/Madrid",
      "Europe/Madrid",
      "Atlantic/Canary",
      "Africa/Ceuta",
      "Africa/Malabo",
    ];

    if (spanishTimezones.some((tz) => timezone.startsWith(tz))) {
      return "es";
    }

    const englishTimezones = [
      "America/New_York",
      "America/Los_Angeles",
      "America/Chicago",
      "America/Denver",
      "America/Anchorage",
      "America/Adak",
      "America/Phoenix",
      "America/Indiana/Indianapolis",
      "America/Detroit",
      "America/Boise",
      "America/Louisville",
      "America/Kentucky/Monticello",
      "America/Noronha",
      "America/Scoresbysund",
      "America/Godthab",
      "America/Danmarkshavn",
      "America/Thule",
      "Atlantic/Bermuda",
      "Atlantic/Cape_Verde",
      "Atlantic/South_Georgia",
      "Europe/London",
      "Europe/Dublin",
      "Europe/Edinburgh",
      "Europe/Guernsey",
      "Europe/Isle_of_Man",
      "Europe/Jersey",
      "Europe/Lisbon",
      "Europe/Madeira",
      "Australia/Sydney",
      "Australia/Melbourne",
      "Australia/Brisbane",
      "Australia/Perth",
      "Australia/Adelaide",
      "Australia/Darwin",
      "Australia/Hobart",
      "Australia/Broken_Hill",
      "Australia/Lord_Howe",
      "Australia/Eucla",
      "Pacific/Auckland",
      "Pacific/Fiji",
      "Pacific/Guadalcanal",
      "Pacific/Guam",
      "Pacific/Honolulu",
      "Pacific/Johnston",
      "Pacific/Midway",
      "Pacific/Pago_Pago",
      "Pacific/Rarotonga",
      "Pacific/Tahiti",
    ];

    if (englishTimezones.some((tz) => timezone.startsWith(tz))) {
      return "en";
    }

    return "en";
  }

  getLanguage(): Language {
    return this.currentLanguage;
  }

  setLanguage(lang: Language): void {
    if (this.currentLanguage === lang) return;
    this.currentLanguage = lang;
    localStorage.setItem(I18n.STORAGE_KEY, lang);
    this.notifyListeners();
  }

  toggleLanguage(): Language {
    const next = this.currentLanguage === "es" ? "en" : "es";
    this.setLanguage(next);
    return next;
  }

  subscribe(listener: (lang: Language) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentLanguage));
  }

  t(key: string, replacements?: Record<string, string | number>): string {
    const keys = key.split(".");
    let result: unknown = translations[this.currentLanguage];

    for (const k of keys) {
      if (result && typeof result === "object" && k in result) {
        result = (result as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }

    if (typeof result !== "string") {
      return key;
    }

    if (replacements) {
      return result.replace(/\{(\w+)\}/g, (_, match) => {
        const value = replacements[match];
        return value !== undefined ? String(value) : `{${match}}`;
      });
    }

    return result;
  }

  isSpanish(): boolean {
    return this.currentLanguage === "es";
  }

  isEnglish(): boolean {
    return this.currentLanguage === "en";
  }
}

export const i18n = new I18n();
