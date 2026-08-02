import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export class AnimationsController {
  private animations: (gsap.core.Tween | gsap.core.Timeline)[] = [];

  /**
   * Initialize all animations
   */
  init(): void {
    this.setupScrollAnimations();
    this.setupHeroAnimations();
    this.setupSkillsAnimations();
    this.setupProjectsAnimations();
    this.setupNavigationAnimation();
  }

  /**
   * Hero section entrance animations
   */
  private setupHeroAnimations(): void {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".hero-section__title", {
      duration: 1,
      y: 100,
      opacity: 0,
      scale: 0.9,
    })
      .from(
        ".hero-section__text",
        {
          duration: 0.8,
          y: 50,
          opacity: 0,
        },
        "-=0.5"
      )
      .from(
        ".hero-section__experience-list li",
        {
          duration: 0.6,
          x: -50,
          opacity: 0,
          stagger: 0.1,
        },
        "-=0.4"
      )
      .fromTo(
        ".hero-section__image",
        {
          scale: 0.3,
          rotation: -45,
          opacity: 0,
          transformOrigin: "center center",
        },
        {
          duration: 1.2,
          scale: 1,
          rotation: 0,
          opacity: 1,
          clearProps: "transform",
        },
        "-=1"
      );

    this.animations.push(tl);
  }

  /**
   * Scroll-based animations
   */
  private setupScrollAnimations(): void {
    // Fade in elements on scroll
    gsap.utils.toArray(".fade-in-up").forEach((element: any) => {
      gsap.from(element, {
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
    });

    // Parallax effect for sections
    gsap.utils.toArray("section").forEach((section: any, index) => {
      if (index > 0) {
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
          y: 100,
          opacity: 0.8,
        });
      }
    });
  }

  /**
   * Skills section animations
   */
  private setupSkillsAnimations(): void {
    const skillCards = gsap.utils.toArray(".skill-card");

    skillCards.forEach((card: any, index) => {
      // Card entrance
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
        },
        scale: 0.8,
        opacity: 0,
        rotation: -10,
        duration: 0.8,
        delay: index * 0.1,
        ease: "back.out(1.7)",
      });

// Animate technology bars
       const techItems = card.querySelectorAll(".skill-bar-fill");
       if (techItems.length > 0) {
         gsap.from(techItems, {
           scrollTrigger: {
             trigger: card,
             start: "top 70%",
           },
           x: -50,
           opacity: 0,
           duration: 0.6,
           stagger: 0.08,
           delay: 0.3 + index * 0.1,
         });
       }

      // Hover animations
      card.addEventListener("mouseenter", () => {
        gsap.to(card, {
          scale: 1.05,
          y: -10,
          duration: 0.3,
          ease: "power2.out",
        });
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      });
    });
  }

  /**
   * Projects section animations
   */
  private setupProjectsAnimations(): void {
    const projectCards = gsap.utils.toArray(".project-card");

    projectCards.forEach((card: any, index) => {
      // Entrance animation
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
        },
        y: 100,
        opacity: 0,
        rotationX: 45,
        duration: 1,
        delay: index * 0.15,
        ease: "power3.out",
      });

      // Image hover effect
      const image = card.querySelector(".project-card__image");
      if (image) {
        card.addEventListener("mouseenter", () => {
          gsap.to(image, {
            scale: 1.1,
            duration: 0.4,
            ease: "power2.out",
          });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(image, {
            scale: 1,
            duration: 0.4,
            ease: "power2.out",
          });
        });
      }
    });
  }

  /**
   * Navigation animations
   */
  private setupNavigationAnimation(): void {
    const nav = document.querySelector(".header");
    if (!nav) return;

    // Hide/show on scroll
    let lastScroll = 0;

    ScrollTrigger.create({
      start: "top -80",
      end: 99999,
      onUpdate: (self) => {
        const currentScroll = self.scroll();

        if (currentScroll > lastScroll && currentScroll > 100) {
          // Scrolling down
          gsap.to(nav, {
            y: -100,
            duration: 0.3,
            ease: "power2.in",
          });
        } else {
          // Scrolling up
          gsap.to(nav, {
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        }

        lastScroll = currentScroll;
      },
    });

    // Smooth scroll for navigation links
    document.querySelectorAll(".header__menu__link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href");
        if (!targetId) return;

        const target = document.querySelector(targetId);
        if (target) {
          gsap.to(window, {
            duration: 1,
            scrollTo: {
              y: target,
              offsetY: 80,
            },
            ease: "power3.inOut",
          });
        }
      });
    });
  }

  /**
   * Animate element with custom config
   */
  animateElement(
    element: HTMLElement | string,
    config: gsap.TweenVars
  ): gsap.core.Tween {
    const tween = gsap.to(element, config);
    this.animations.push(tween);
    return tween;
  }

  /**
   * Create morphing text effect
   */
  morphText(
    element: HTMLElement,
    texts: string[],
    interval: number = 3000
  ): void {
    let currentIndex = 0;

    setInterval(() => {
      currentIndex = (currentIndex + 1) % texts.length;

      gsap.to(element, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        onComplete: () => {
          element.textContent = texts[currentIndex];
          gsap.to(element, {
            opacity: 1,
            y: 0,
            duration: 0.3,
          });
        },
      });
    }, interval);
  }

  /**
   * Create typing effect
   */
  typeText(element: HTMLElement, text: string, speed: number = 50): void {
    element.textContent = "";
    let index = 0;

    const type = () => {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(type, speed);
      }
    };

    type();
  }

  /**
   * Cleanup all animations
   */
  destroy(): void {
    this.animations.forEach((anim) => anim.kill());
    this.animations = [];
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
}
