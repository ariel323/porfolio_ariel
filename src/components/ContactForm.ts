import emailjs from "@emailjs/browser";
import { i18n } from "../utils/i18n";

/**
 * Contact form component — sends email via EmailJS.
 *
 * Setup:
 * 1. Create an account at https://www.emailjs.com/
 * 2. Add an Email Service (Gmail, Outlook, etc.) and copy the SERVICE_ID
 * 3. Create an Email Template with variables: {{name}}, {{email}}, {{message}}
 *    and copy the TEMPLATE_ID
 * 4. Copy your Public Key from Account → API Keys
 * 5. Set the three values below (or via env vars VITE_EMAILJS_*).
 */

interface ContactFormConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

const DEFAULT_CONFIG: ContactFormConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID ?? "",
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? "",
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? "",
};

export class ContactForm {
  private form: HTMLFormElement | null = null;
  private statusEl: HTMLElement | null = null;
  private submitBtn: HTMLButtonElement | null = null;
  private config: ContactFormConfig;
  private isSending = false;

  constructor(config: ContactFormConfig = DEFAULT_CONFIG) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize the contact form — wire up submit and validation.
   */
  init(): void {
    this.form = document.querySelector<HTMLFormElement>("#contact-form");
    this.statusEl = document.querySelector<HTMLElement>("#contact-form-status");
    this.submitBtn =
      this.form?.querySelector<HTMLButtonElement>("button[type='submit']") ?? null;

    if (!this.form) return;

    this.form.addEventListener("submit", this.handleSubmit.bind(this));

    // Live-clear status when user starts editing again after an error
    this.form.addEventListener("input", () => {
      this.clearStatus();
    });
  }

  /**
   * Update config at runtime (e.g. after async loading keys).
   */
  setConfig(config: Partial<ContactFormConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private async handleSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!this.form || this.isSending) return;

    const formData = new FormData(this.form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    const validationError = this.validate({ name, email, message });
    if (validationError) {
      this.showError(validationError);
      this.focusFirstInvalid({ name, email, message });
      return;
    }

    if (!this.isConfigured()) {
      // Fallback: open mail client with prefilled subject/body
      this.fallbackMailto({ name, email, message });
      return;
    }

    await this.sendViaEmailJS({ name, email, message });
  }

  private validate(data: {
    name: string;
    email: string;
    message: string;
  }): string | null {
    if (!data.name) {
      return i18n.t("sections.contact.form.validation.nameRequired");
    }
    if (!data.email) {
      return i18n.t("sections.contact.form.validation.emailRequired");
    }
    if (!this.isValidEmail(data.email)) {
      return i18n.t("sections.contact.form.validation.emailInvalid");
    }
    if (!data.message) {
      return i18n.t("sections.contact.form.validation.messageRequired");
    }
    return null;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private focusFirstInvalid(data: {
    name: string;
    email: string;
    message: string;
  }): void {
    if (!data.name) {
      document.getElementById("contact-name")?.focus();
    } else if (!data.email || !this.isValidEmail(data.email)) {
      document.getElementById("contact-email")?.focus();
    } else if (!data.message) {
      document.getElementById("contact-message")?.focus();
    }
  }

  private isConfigured(): boolean {
    return Boolean(
      this.config.serviceId && this.config.templateId && this.config.publicKey
    );
  }

  private async sendViaEmailJS(data: {
    name: string;
    email: string;
    message: string;
  }): Promise<void> {
    this.setLoading(true);

    try {
      await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        {
          name: data.name,
          email: data.email,
          message: data.message,
          reply_to: data.email,
        },
        this.config.publicKey
      );

      this.showSuccess();
      this.form?.reset();
    } catch (error) {
      console.error("EmailJS error:", error);
      this.showError(i18n.t("sections.contact.form.error"));
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * If EmailJS isn't configured, fall back to opening the user's mail client
   * with a prefilled message addressed to Ariel's email.
   */
  private fallbackMailto(data: {
    name: string;
    email: string;
    message: string;
  }): void {
    const to = "arielalmada861@gmail.com";
    const subject = encodeURIComponent(`Portfolio contact from ${data.name}`);
    const body = encodeURIComponent(
      `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    this.showSuccess(i18n.t("sections.contact.form.sent"));
  }

  private setLoading(isLoading: boolean): void {
    this.isSending = isLoading;
    if (!this.submitBtn) return;

    if (isLoading) {
      this.submitBtn.classList.add("contact__form-btn--loading");
      this.submitBtn.disabled = true;
    } else {
      this.submitBtn.classList.remove("contact__form-btn--loading");
      this.submitBtn.disabled = false;
    }
  }

  private showSuccess(message?: string): void {
    const text =
      message ?? i18n.t("sections.contact.form.sent");
    if (this.statusEl) {
      this.statusEl.textContent = text;
      this.statusEl.classList.remove("contact__form-status--error");
      this.statusEl.classList.add("contact__form-status--success");
    }
  }

  private showError(message: string): void {
    if (this.statusEl) {
      this.statusEl.textContent = message;
      this.statusEl.classList.remove("contact__form-status--success");
      this.statusEl.classList.add("contact__form-status--error");
    }
  }

  private clearStatus(): void {
    if (!this.statusEl) return;
    if (
      this.statusEl.classList.contains("contact__form-status--error") ||
      this.statusEl.classList.contains("contact__form-status--success")
    ) {
      this.statusEl.textContent = "";
      this.statusEl.classList.remove(
        "contact__form-status--error",
        "contact__form-status--success"
      );
    }
  }
}
