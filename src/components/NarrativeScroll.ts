import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * 🌌 NarrativeScroll - Sistema de scroll narrativo que transforma
 * el portfolio en una experiencia cinematográfica fluida.
 *
 * En lugar de secciones estáticas, el usuario "viaja" por tu historia.
 */
export class NarrativeScroll {
  private scenes: ScrollScene[] = [];
  private currentScene: number = 0;

  constructor() {
    // Disable on mobile for performance
    if (window.innerWidth < 768) {
      console.log("📱 Narrative Scroll disabled on mobile");
      return;
    }

    this.initScenes();
    this.setupNarrativeFlow();
  }

  /**
   * Define las "escenas" narrativas del portfolio
   */
  private initScenes(): void {
    this.scenes = [
      {
        id: "opening",
        element: ".hero-section",
        narrative: "El comienzo de la historia",
        mood: "inspirational",
        cameraMovement: { x: 0, y: 0, scale: 1 },
      },
      {
        id: "journey",
        element: "#skills",
        narrative: "Las herramientas del viaje",
        mood: "technical",
        cameraMovement: { x: -50, y: 0, scale: 1.1 },
      },
      {
        id: "creations",
        element: "#projects",
        narrative: "Lo que he construido",
        mood: "creative",
        cameraMovement: { x: 0, y: -30, scale: 1.05 },
      },
      {
        id: "terminal",
        element: "#terminal",
        narrative: "Explorando el código",
        mood: "immersive",
        cameraMovement: { x: 30, y: 0, scale: 1 },
      },
      {
        id: "future",
        element: "#contact",
        narrative: "Construyamos el futuro juntos",
        mood: "inviting",
        cameraMovement: { x: 0, y: 0, scale: 1 },
      },
    ];
  }

  /**
   * 🎬 Setup del flujo narrativo con transiciones fluidas
   */
  private setupNarrativeFlow(): void {
    this.scenes.forEach((scene, index) => {
      const element = document.querySelector(scene.element);
      if (!element) return;

      ScrollTrigger.create({
        trigger: element as HTMLElement,
        start: "top center",
        end: "bottom center",
        onEnter: () => this.enterScene(scene, index),
        onLeave: () => this.leaveScene(scene, index),
        onEnterBack: () => this.enterScene(scene, index),
        onLeaveBack: () => this.leaveScene(scene, index),
      });

      // Transición de "cámara" suave entre escenas
      gsap.to(element, {
        scrollTrigger: {
          trigger: element as HTMLElement,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
        x: scene.cameraMovement.x,
        y: scene.cameraMovement.y,
        scale: scene.cameraMovement.scale,
        ease: "power2.inOut",
      });

      // Efecto de "mood" - cambiar ambiente según la sección
      this.applyMoodTransition(scene);
    });
  }

  /**
   * 🎨 Al entrar a una escena, aplicamos su "mood" visual
   */
  private enterScene(scene: ScrollScene, index: number): void {
    this.currentScene = index;
    console.log(`📖 Entrando a: ${scene.narrative}`);

    // Cambiar color de fondo según el "mood"
    const body = document.body;
    const moodColors = {
      inspirational: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      technical: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      creative: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
      immersive: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
      inviting: "linear-gradient(135deg, #0f172a 0%, #312e81 100%)",
    };

    gsap.to(body, {
      background: moodColors[scene.mood],
      duration: 1.5,
      ease: "power2.inOut",
    });

    // Partículas reactivas al mood
    this.updateParticlesMood(scene.mood);
  }

  /**
   * 🌊 Al salir de una escena
   */
  private leaveScene(scene: ScrollScene, _index: number): void {
    console.log(`👋 Saliendo de: ${scene.narrative}`);
  }

  /**
   * 🎭 Aplicar transición de ambiente/mood
   */
  private applyMoodTransition(scene: ScrollScene): void {
    const element = document.querySelector(scene.element);
    if (!element) return;

    // Efectos de luz según mood
    const lightIntensity = {
      inspirational: 1.2,
      technical: 0.9,
      creative: 1.5,
      immersive: 0.8,
      inviting: 1.1,
    };

    gsap.to(element, {
      scrollTrigger: {
        trigger: element as HTMLElement,
        start: "top 80%",
        end: "bottom 20%",
        scrub: 0.5,
      },
      filter: `brightness(${lightIntensity[scene.mood]})`,
    });
  }

  /**
   * 💫 Actualizar partículas según el mood de la escena
   */
  private updateParticlesMood(mood: SceneMood): void {
    const particlesContainer = document.getElementById("particles-container");
    if (!particlesContainer) return;

    const moodStyles = {
      inspirational: { opacity: 0.6, filter: "hue-rotate(0deg)" },
      technical: { opacity: 0.4, filter: "hue-rotate(180deg)" },
      creative: { opacity: 0.8, filter: "hue-rotate(280deg)" },
      immersive: { opacity: 0.3, filter: "hue-rotate(120deg)" },
      inviting: { opacity: 0.7, filter: "hue-rotate(320deg)" },
    };

    gsap.to(particlesContainer, {
      ...moodStyles[mood],
      duration: 2,
      ease: "power2.inOut",
    });
  }

  /**
   * 🚀 Navegación programática entre escenas
   */
  goToScene(sceneId: string): void {
    const scene = this.scenes.find((s) => s.id === sceneId);
    if (!scene) return;

    const element = document.querySelector(scene.element);
    if (!element) return;

    gsap.to(window, {
      duration: 1.5,
      scrollTo: {
        y: element,
        offsetY: 80,
      },
      ease: "power3.inOut",
    });
  }

  /**
   * 📊 Get current narrative context
   */
  getCurrentNarrative(): string {
    return this.scenes[this.currentScene]?.narrative || "";
  }

  /**
   * 🧹 Cleanup
   */
  destroy(): void {
    if (window.innerWidth < 768) return;
    ScrollTrigger.getAll().forEach((st) => st.kill());
  }
}

/**
 * Types
 */
interface ScrollScene {
  id: string;
  element: string;
  narrative: string;
  mood: SceneMood;
  cameraMovement: {
    x: number;
    y: number;
    scale: number;
  };
}

type SceneMood =
  | "inspirational"
  | "technical"
  | "creative"
  | "immersive"
  | "inviting";
