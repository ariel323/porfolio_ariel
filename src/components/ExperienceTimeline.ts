import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Experience, Education, Certification } from "../types";

gsap.registerPlugin(ScrollTrigger);

export class ExperienceTimeline {
  private experiences: Experience[] = [];
  private education: Education[] = [];
  private certifications: Certification[] = [];

  constructor(data: {
    experiences: Experience[];
    education: Education[];
    certifications: Certification[];
  }) {
    this.experiences = data.experiences;
    this.education = data.education;
    this.certifications = data.certifications;
  }

  /**
   * Render all experience sections
   */
  render(): void {
    this.renderTimeline();
    this.renderEducation();
    this.renderCertifications();
    this.setupAnimations();
  }

  /**
   * Render timeline of experiences
   */
  private renderTimeline(): void {
    const container = document.getElementById("experience-timeline");
    if (!container) return;

    container.innerHTML = `
      <div class="timeline">
        <div class="timeline__line"></div>
        ${this.experiences
          .map(
            (exp, index) => `
          <div class="timeline__item" data-index="${index}">
            <div class="timeline__marker">
              <div class="timeline__marker-dot"></div>
              <div class="timeline__marker-pulse"></div>
            </div>
            
            <div class="timeline__content">
              <div class="timeline__header">
                <div class="timeline__period">
                  ${this.formatPeriod(exp.period)}
                  ${
                    exp.type === "freelance"
                      ? '<span class="badge badge--freelance">Freelance</span>'
                      : ""
                  }
                  ${
                    exp.type === "contract"
                      ? '<span class="badge badge--contract">Contrato</span>'
                      : ""
                  }
                  ${
                    exp.type === "internship"
                      ? '<span class="badge badge--internship">Pasantía</span>'
                      : ""
                  }
                </div>
                <div class="timeline__role">${exp.role}</div>
                <div class="timeline__company">
                  ${
                    exp.companyUrl
                      ? `<a href="${exp.companyUrl}" target="_blank" rel="noopener noreferrer">${exp.company}</a>`
                      : exp.company
                  }
                  <span class="timeline__location">📍 ${exp.location}</span>
                </div>
              </div>
              
              <div class="timeline__description">
                ${exp.description}
              </div>
              
              ${
                exp.achievements.length > 0
                  ? `
                <div class="timeline__achievements">
                  <h4>✨ Logros Destacados:</h4>
                  <ul>
                    ${exp.achievements
                      .map((achievement) => `<li>${achievement}</li>`)
                      .join("")}
                  </ul>
                </div>
              `
                  : ""
              }
              
              <div class="timeline__tech">
                ${exp.technologies
                  .map(
                    (tech) => `
                  <span class="tech-pill">${tech}</span>
                `
                  )
                  .join("")}
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  /**
   * Render education section
   */
  private renderEducation(): void {
    const container = document.getElementById("education-grid");
    if (!container) return;

    container.innerHTML = this.education
      .map(
        (edu) => `
      <div class="education-card">
        <div class="education-card__icon">🎓</div>
        <div class="education-card__content">
          <h4 class="education-card__degree">${edu.degree}</h4>
          <p class="education-card__institution">${edu.institution}</p>
          <p class="education-card__period">${this.formatPeriod(edu.period)}</p>
          ${
            edu.description
              ? `<p class="education-card__description">${edu.description}</p>`
              : ""
          }
          ${
            edu.achievements && edu.achievements.length > 0
              ? `
            <ul class="education-card__achievements">
              ${edu.achievements.map((a) => `<li>${a}</li>`).join("")}
            </ul>
          `
              : ""
          }
        </div>
      </div>
    `
      )
      .join("");
  }

  /**
   * Render certifications carousel
   */
  private renderCertifications(): void {
    const container = document.getElementById("certifications-carousel");
    if (!container) return;

    container.innerHTML = `
      <div class="certifications__slider">
        ${this.certifications
          .map(
            (cert) => `
          <div class="certification-card">
            ${
              cert.logo
                ? `<img src="${cert.logo}" alt="${cert.issuer}" class="certification-card__logo">`
                : `<div class="certification-card__icon">🏆</div>`
            }
            <div class="certification-card__content">
              <h4 class="certification-card__name">${cert.name}</h4>
              <p class="certification-card__issuer">${cert.issuer}</p>
              <p class="certification-card__date">${this.formatDate(
                cert.date
              )}</p>
              ${
                cert.credentialUrl
                  ? `
                <a href="${cert.credentialUrl}" target="_blank" rel="noopener noreferrer" class="certification-card__link">
                  Ver Credencial <i class="fas fa-external-link-alt"></i>
                </a>
              `
                  : ""
              }
            </div>
          </div>
        `
          )
          .join("")}
      </div>
      
      ${
        this.certifications.length > 3
          ? `
      <div class="certifications__controls">
        <button class="certifications__btn certifications__btn--prev" aria-label="Anterior">‹</button>
        <button class="certifications__btn certifications__btn--next" aria-label="Siguiente">›</button>
      </div>
      `
          : ""
      }
    `;

    if (this.certifications.length > 3) {
      this.setupCarousel();
    }
  }

  /**
   * Setup carousel controls
   */
  private setupCarousel(): void {
    const slider = document.querySelector(
      ".certifications__slider"
    ) as HTMLElement;
    const prevBtn = document.querySelector(
      ".certifications__btn--prev"
    ) as HTMLButtonElement;
    const nextBtn = document.querySelector(
      ".certifications__btn--next"
    ) as HTMLButtonElement;

    if (!slider || !prevBtn || !nextBtn) return;

    let currentIndex = 0;
    const itemWidth = 320; // Width of each certification card + gap
    const maxIndex = Math.max(0, this.certifications.length - 3);

    const updateSlider = () => {
      gsap.to(slider, {
        x: -currentIndex * itemWidth,
        duration: 0.5,
        ease: "power2.inOut",
      });

      // Update button states
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex >= maxIndex;
    };

    prevBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateSlider();
      }
    });

    nextBtn.addEventListener("click", () => {
      if (currentIndex < maxIndex) {
        currentIndex++;
        updateSlider();
      }
    });

    // Initial state
    updateSlider();
  }

  /**
   * Setup scroll animations
   */
  private setupAnimations(): void {
    // Animate timeline items
    gsap.utils.toArray(".timeline__item").forEach((item: any, index) => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        x: index % 2 === 0 ? -100 : 100,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    });

    // Animate timeline line
    const timelineLine = document.querySelector(".timeline__line");
    if (timelineLine) {
      gsap.fromTo(
        timelineLine,
        { scaleY: 0 },
        {
          scrollTrigger: {
            trigger: ".timeline",
            start: "top center",
            end: "bottom center",
            scrub: 1,
          },
          scaleY: 1,
          transformOrigin: "top",
        }
      );
    }

    // Animate education cards
    gsap.utils.toArray(".education-card").forEach((card: any, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 50,
        opacity: 0,
        duration: 0.6,
        delay: index * 0.1,
        ease: "power2.out",
      });
    });

    // Animate certification cards
    gsap.utils.toArray(".certification-card").forEach((card: any, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        delay: index * 0.08,
        ease: "back.out(1.7)",
      });
    });
  }

  /**
   * Format period from start/end dates
   */
  private formatPeriod(period: {
    start: string;
    end: string | "present";
  }): string {
    const start = this.formatDate(period.start);
    const end =
      period.end === "present" ? "Presente" : this.formatDate(period.end);
    return `${start} - ${end}`;
  }

  /**
   * Format date to readable format
   */
  private formatDate(date: string): string {
    const [year, month] = date.split("-");
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    return month ? `${months[parseInt(month) - 1]} ${year}` : year;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    ScrollTrigger.getAll().forEach((trigger) => {
      if (
        trigger.trigger?.classList.contains("timeline__item") ||
        trigger.trigger?.classList.contains("education-card") ||
        trigger.trigger?.classList.contains("certification-card")
      ) {
        trigger.kill();
      }
    });
  }
}
