import { gsap } from "gsap";

/**
 * VisualIdentity - Sistema de identidad visual
 *
 * Define la personalidad visual del portfolio:
 * - Paleta de colores distintiva
 * - Tipografía con carácter
 * - Microinteracciones (ripple, underline, magnetic)
 */
export class VisualIdentity {
  constructor() {
    this.applyBrandColors();
    this.setupMicroInteractions();
    this.applyTypographyRhythm();
  }

  private applyBrandColors(): void {
    const root = document.documentElement;

    const brandColors = {
      primary: "#f59e0b",
      primaryDark: "#d97706",
      primaryLight: "#ffc174",
      secondary: "#b7c8e1",
      secondaryDark: "#64748b",
      secondaryLight: "#d3e4fe",
      accent: "#fbbf24",
      accentDark: "#f59e0b",
      accentLight: "#fde047",
      bgPrimary: "#131313",
      bgSecondary: "#1c1b1b",
      bgTertiary: "#2a2a2a",
      textPrimary: "#e5e2e1",
      textSecondary: "#cbd5e1",
      textTertiary: "#9ca3af",
    };

    Object.entries(brandColors).forEach(([key, value]) => {
      root.style.setProperty(`--brand-${key}`, value);
    });
  }

  private setupMicroInteractions(): void {
    this.setupRippleEffect();
    this.setupLinkAnimations();
    this.setupMagneticEffect();
  }

  private setupRippleEffect(): void {
    const buttons = document.querySelectorAll("button, .btn");

    buttons.forEach((button) => {
      button.addEventListener("click", function (e) {
        const rect = button.getBoundingClientRect();
        const x = (e as MouseEvent).clientX - rect.left;
        const y = (e as MouseEvent).clientY - rect.top;

        const ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  private setupLinkAnimations(): void {
    const links = document.querySelectorAll("a:not(.hero-section__cta-btn)");

    links.forEach((link) => {
      const underline = document.createElement("span");
      underline.className = "animated-underline";
      link.appendChild(underline);

      link.addEventListener("mouseenter", () => {
        gsap.to(underline, {
          scaleX: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      });

      link.addEventListener("mouseleave", () => {
        gsap.to(underline, {
          scaleX: 0,
          duration: 0.3,
          ease: "power2.in",
        });
      });
    });
  }

  private setupMagneticEffect(): void {
    const cards = document.querySelectorAll(".project-card, .skill-card");

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e as MouseEvent).clientX - rect.left - rect.width / 2;
        const y = (e as MouseEvent).clientY - rect.top - rect.height / 2;

        gsap.to(card, {
          x: x * 0.1,
          y: y * 0.1,
          duration: 0.3,
          ease: "power2.out",
        });
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.5)",
        });
      });
    });
  }

  private applyTypographyRhythm(): void {
    const root = document.documentElement;

    const typescale = {
      xs: "0.8rem",
      sm: "1rem",
      md: "1.25rem",
      lg: "1.563rem",
      xl: "1.953rem",
      "2xl": "2.441rem",
      "3xl": "3.052rem",
      "4xl": "3.815rem",
    };

    Object.entries(typescale).forEach(([key, value]) => {
      root.style.setProperty(`--text-${key}`, value);
    });

    root.style.setProperty("--leading-tight", "1.2");
    root.style.setProperty("--leading-normal", "1.6");
    root.style.setProperty("--leading-loose", "2");
  }

  destroy(): void {
    // Cleanup handled by removing event listeners on page unload
  }
}