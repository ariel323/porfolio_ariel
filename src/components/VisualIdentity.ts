import { gsap } from "gsap";

/**
 * 🎨 VisualIdentity - Sistema de identidad visual única
 *
 * Define la personalidad visual del portfolio:
 * - Paleta de colores distintiva
 * - Tipografía con carácter
 * - Microinteracciones personalizadas
 * - Cursor reactivo
 */
export class VisualIdentity {
  private customCursor: HTMLElement | null = null;
  private cursorFollower: HTMLElement | null = null;

  constructor() {
    this.applyBrandColors();
    this.setupCustomCursor();
    this.setupMicroInteractions();
    this.applyTypographyRhythm();
  }

  /**
   * 🎨 Paleta de colores única - Inspirada en "Arquitecto del Código"
   */
  private applyBrandColors(): void {
    const root = document.documentElement;

    // Paleta triádica con acento cyan-tech
    const brandColors = {
      // Primario: Cyan tecnológico (protagonista)
      primary: "#00d9ff",
      primaryDark: "#00a8cc",
      primaryLight: "#64ffda",

      // Secundario: Violeta profundo (profundidad)
      secondary: "#8b5cf6",
      secondaryDark: "#6d28d9",
      secondaryLight: "#a78bfa",

      // Acento: Amarillo energético (creatividad)
      accent: "#fbbf24",
      accentDark: "#f59e0b",
      accentLight: "#fde047",

      // Bases: Oscuros espaciales
      bgPrimary: "#0a0e27",
      bgSecondary: "#0f172a",
      bgTertiary: "#1e293b",

      // Textos
      textPrimary: "#f8fafc",
      textSecondary: "#cbd5e1",
      textTertiary: "#94a3b8",
    };

    // Aplicar variables CSS
    Object.entries(brandColors).forEach(([key, value]) => {
      root.style.setProperty(`--brand-${key}`, value);
    });
  }

  /**
   * ✨ Cursor personalizado reactivo
   */
  private setupCustomCursor(): void {
    // Crear cursor custom
    this.customCursor = document.createElement("div");
    this.customCursor.className = "custom-cursor";
    document.body.appendChild(this.customCursor);

    // Crear follower (círculo que sigue al cursor)
    this.cursorFollower = document.createElement("div");
    this.cursorFollower.className = "custom-cursor-follower";
    document.body.appendChild(this.cursorFollower);

    // Tracking del mouse
    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Cursor principal (instantáneo)
      if (this.customCursor) {
        gsap.to(this.customCursor, {
          x: mouseX,
          y: mouseY,
          duration: 0.1,
        });
      }
    });

    // Follower con smooth delay
    const updateFollower = () => {
      followerX += (mouseX - followerX) * 0.1;
      followerY += (mouseY - followerY) * 0.1;

      if (this.cursorFollower) {
        this.cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px)`;
      }

      requestAnimationFrame(updateFollower);
    };
    updateFollower();

    // Efectos hover en elementos interactivos
    this.setupCursorEffects();
  }

  /**
   * 🎯 Efectos de cursor en elementos
   */
  private setupCursorEffects(): void {
    const interactiveElements = document.querySelectorAll(
      "a, button, .project-card, .skill-card"
    );

    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        if (this.customCursor) {
          this.customCursor.classList.add("cursor-hover");
        }
        if (this.cursorFollower) {
          this.cursorFollower.classList.add("cursor-hover");
        }
      });

      el.addEventListener("mouseleave", () => {
        if (this.customCursor) {
          this.customCursor.classList.remove("cursor-hover");
        }
        if (this.cursorFollower) {
          this.cursorFollower.classList.remove("cursor-hover");
        }
      });
    });
  }

  /**
   * 🔮 Microinteracciones que comunican personalidad
   */
  private setupMicroInteractions(): void {
    // Botones con efecto "ripple"
    this.setupRippleEffect();

    // Links con underline animado
    this.setupLinkAnimations();

    // Cards con efecto "magnetic"
    this.setupMagneticEffect();
  }

  /**
   * 💧 Efecto ripple en botones
   */
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

  /**
   * 📏 Underline animado en links
   */
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

  /**
   * 🧲 Efecto magnético en cards
   */
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

  /**
   * 📖 Ritmo tipográfico (vertical rhythm)
   */
  private applyTypographyRhythm(): void {
    const root = document.documentElement;

    // Escala tipográfica modular (proporción 1.25 - Perfect Fourth)
    const typescale = {
      xs: "0.8rem", // 12.8px
      sm: "1rem", // 16px (base)
      md: "1.25rem", // 20px
      lg: "1.563rem", // 25px
      xl: "1.953rem", // 31.25px
      "2xl": "2.441rem", // 39px
      "3xl": "3.052rem", // 48.8px
      "4xl": "3.815rem", // 61px
    };

    Object.entries(typescale).forEach(([key, value]) => {
      root.style.setProperty(`--text-${key}`, value);
    });

    // Line heights proporcionales
    root.style.setProperty("--leading-tight", "1.2");
    root.style.setProperty("--leading-normal", "1.6");
    root.style.setProperty("--leading-loose", "2");
  }

  /**
   * 🧹 Cleanup
   */
  destroy(): void {
    this.customCursor?.remove();
    this.cursorFollower?.remove();
  }
}
