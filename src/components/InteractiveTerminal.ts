import type { PortfolioData, Skill } from "@/types";

interface TerminalCommand {
  command: string;
  description: string;
  execute: (args: string[]) => string | Promise<string>;
}

interface TerminalLine {
  type: "input" | "output" | "error" | "success";
  content: string;
  timestamp?: Date;
}

export class InteractiveTerminal {
  private container: HTMLElement;
  private output: HTMLElement;
  private input: HTMLInputElement;
  private history: string[] = [];
  private historyIndex: number = -1;
  private commands: Map<string, TerminalCommand>;
  private data: PortfolioData;
  private lines: TerminalLine[] = [];
  private currentUser: string = "guest";
  private achievements: Set<string> = new Set();

  constructor(containerId: string, data: PortfolioData) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Terminal container #${containerId} not found`);
    }

    this.container = container;
    this.data = data;
    this.commands = new Map();

    this.output = document.createElement("div");
    this.output.className = "terminal__output";

    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.className = "terminal__input";
    this.input.placeholder = 'Type "help" to see available commands...';

    this.registerCommands();
    this.render();
    this.setupEventListeners();
    this.showWelcomeMessage();
  }

  private registerCommands(): void {
    // Basic commands
    this.addCommand({
      command: "help",
      description: "Display available commands",
      execute: () => this.helpCommand(),
    });

    this.addCommand({
      command: "whoami",
      description: "Display information about the developer",
      execute: () => this.whoamiCommand(),
    });

    this.addCommand({
      command: "clear",
      description: "Clear the terminal screen",
      execute: () => {
        this.clearScreen();
        return "";
      },
    });

    this.addCommand({
      command: "ls",
      description: "List projects, skills, or experience",
      execute: (args) => this.lsCommand(args),
    });

    this.addCommand({
      command: "cat",
      description: "Display content of a file (skills.json, about.txt, etc.)",
      execute: (args) => this.catCommand(args),
    });

    this.addCommand({
      command: "projects",
      description: "List all projects with details",
      execute: () => this.projectsCommand(),
    });

    this.addCommand({
      command: "skills",
      description: "Display skills in a formatted way",
      execute: () => this.skillsCommand(),
    });

    this.addCommand({
      command: "experience",
      description: "Show professional experience timeline",
      execute: () => this.experienceCommand(),
    });

    this.addCommand({
      command: "contact",
      description: "Display contact information",
      execute: () => this.contactCommand(),
    });

    this.addCommand({
      command: "github",
      description: "Open GitHub profile",
      execute: () => {
        window.open("https://github.com/ariel323", "_blank");
        return "🚀 Opening GitHub profile...";
      },
    });

    this.addCommand({
      command: "linkedin",
      description: "Open LinkedIn profile",
      execute: () => {
        window.open(
          "https://www.linkedin.com/in/ariel-almada-4a7133346/",
          "_blank"
        );
        return "💼 Opening LinkedIn profile...";
      },
    });

    this.addCommand({
      command: "history",
      description: "Show command history",
      execute: () => this.historyCommand(),
    });

    this.addCommand({
      command: "date",
      description: "Display current date and time",
      execute: () => new Date().toLocaleString(),
    });

    this.addCommand({
      command: "echo",
      description: "Print text to terminal",
      execute: (args) => args.join(" "),
    });

    // Easter eggs
    this.addCommand({
      command: "sudo",
      description: "Try to run commands with superuser privileges",
      execute: (args) => {
        if (args.join(" ").includes("make-me-coffee")) {
          this.unlockAchievement("coffee-lover");
          return "☕ Brewing coffee... Done! *hands you a virtual coffee*";
        }
        return "⚠️  Nice try! But you don't have sudo privileges here 😄";
      },
    });

    this.addCommand({
      command: "vim",
      description: "Open vim editor (just kidding)",
      execute: () => {
        this.unlockAchievement("vim-survivor");
        return `
📝 Opening vim...
Just kidding! Here's how to exit vim:
1. Press ESC
2. Type :q!
3. Press ENTER
4. Question your life choices
5. Use VSCode instead 😄
        `;
      },
    });

    this.addCommand({
      command: "rm",
      description: "Remove files (don't worry, nothing will happen)",
      execute: (args) => {
        if (args.includes("-rf") && args.includes("/")) {
          this.unlockAchievement("chaos-agent");
          return `
⚠️  CRITICAL ERROR: Access Denied!

Just kidding! Did you really think I'd let you delete everything? 😂
Nice try though! Here's a cookie instead: 🍪
          `;
        }
        return "⚠️  Permission denied. Files are safe!";
      },
    });

    this.addCommand({
      command: "hack",
      description: "Activate hacker mode",
      execute: () => {
        this.unlockAchievement("hacker");
        document.body.classList.add("matrix-mode");
        setTimeout(() => {
          document.body.classList.remove("matrix-mode");
        }, 5000);
        return `
🎯 HACKER MODE ACTIVATED!
[████████████████████] 100%

Access Granted to:
- All skills: UNLOCKED ✓
- All projects: ACCESSIBLE ✓
- Hidden easter eggs: REVEALED ✓
- Matrix mode: ENABLED for 5 seconds ✓

"The code is strong with this one..." 🚀
        `;
      },
    });

    this.addCommand({
      command: "achievements",
      description: "Show unlocked achievements",
      execute: () => this.achievementsCommand(),
    });

    this.addCommand({
      command: "matrix",
      description: "Enter the matrix",
      execute: () => {
        this.unlockAchievement("matrix-fan");
        return `
🟢 Welcome to the Matrix, Neo...

Choose your pill:
  🔴 Red pill  : See how deep the rabbit hole goes (type 'projects')
  🔵 Blue pill : Stay in wonderland (type 'clear')

"There is no spoon." - The Matrix
        `;
      },
    });
  }

  private addCommand(command: TerminalCommand): void {
    this.commands.set(command.command, command);
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="terminal">
        <div class="terminal__header">
          <div class="terminal__buttons">
            <span class="terminal__button terminal__button--close"></span>
            <span class="terminal__button terminal__button--minimize"></span>
            <span class="terminal__button terminal__button--maximize"></span>
          </div>
          <div class="terminal__title">
            <span class="terminal__icon">💻</span>
            ariel@portfolio:~$ Interactive Terminal
          </div>
          <div class="terminal__actions">
            <button class="terminal__action" data-action="clear" title="Clear terminal">
              <i class="fas fa-eraser"></i>
            </button>
          </div>
        </div>
        <div class="terminal__body">
          <div class="terminal__output"></div>
          <div class="terminal__input-line">
            <span class="terminal__prompt">
              <span class="terminal__user">${this.currentUser}</span>@<span class="terminal__host">portfolio</span>:<span class="terminal__path">~</span>$
            </span>
            <input type="text" class="terminal__input" spellcheck="false" autocomplete="off" />
          </div>
        </div>
      </div>
    `;

    this.output = this.container.querySelector(".terminal__output")!;
    this.input = this.container.querySelector(".terminal__input")!;
  }

  private setupEventListeners(): void {
    this.input.addEventListener("keydown", (e) => this.handleKeyDown(e));

    // Click to focus
    this.container.addEventListener("click", () => {
      this.input.focus();
    });

    // Clear button
    const clearBtn = this.container.querySelector('[data-action="clear"]');
    clearBtn?.addEventListener("click", () => {
      this.clearScreen();
    });

    // Auto focus on load
    setTimeout(() => this.input.focus(), 100);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === "Enter") {
      e.preventDefault();
      const command = this.input.value.trim();
      if (command) {
        this.executeCommand(command);
        this.history.push(command);
        this.historyIndex = this.history.length;
      }
      this.input.value = "";
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.input.value = this.history[this.historyIndex];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.input.value = this.history[this.historyIndex];
      } else {
        this.historyIndex = this.history.length;
        this.input.value = "";
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      this.autocomplete();
    } else if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      this.clearScreen();
    }
  }

  private async executeCommand(commandString: string): Promise<void> {
    // Add input line
    this.addLine({ type: "input", content: commandString });

    // Parse command
    const parts = commandString.trim().split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Find and execute command
    const command = this.commands.get(commandName);

    if (command) {
      try {
        const result = await command.execute(args);
        if (result) {
          this.addLine({ type: "output", content: result });
        }
      } catch (error) {
        this.addLine({
          type: "error",
          content: `Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        });
      }
    } else {
      this.addLine({
        type: "error",
        content: `Command not found: ${commandName}. Type 'help' for available commands.`,
      });
    }

    this.scrollToBottom();
  }

  private addLine(line: TerminalLine): void {
    const lineElement = document.createElement("div");
    lineElement.className = `terminal__line terminal__line--${line.type}`;

    if (line.type === "input") {
      lineElement.innerHTML = `
        <span class="terminal__prompt">
          <span class="terminal__user">${
            this.currentUser
          }</span>@<span class="terminal__host">portfolio</span>:<span class="terminal__path">~</span>$
        </span>
        <span class="terminal__command">${this.escapeHtml(line.content)}</span>
      `;
    } else {
      lineElement.innerHTML = `<pre>${this.escapeHtml(line.content)}</pre>`;
    }

    this.output.appendChild(lineElement);
    this.lines.push(line);
  }

  private clearScreen(): void {
    this.output.innerHTML = "";
    this.lines = [];
  }

  private scrollToBottom(): void {
    this.output.scrollTop = this.output.scrollHeight;
  }

  private autocomplete(): void {
    const currentInput = this.input.value.toLowerCase();
    const matches = Array.from(this.commands.keys()).filter((cmd) =>
      cmd.startsWith(currentInput)
    );

    if (matches.length === 1) {
      this.input.value = matches[0];
    } else if (matches.length > 1) {
      this.addLine({
        type: "output",
        content: matches.join("  "),
      });
    }
  }

  private showWelcomeMessage(): void {
    const welcome = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     🚀 Welcome to Ariel Almada's Interactive Terminal      ║
║                                                              ║
║     Fullstack Developer | Java | Node.js | React            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

Type 'help' to see available commands.
Type 'whoami' to learn more about me.
Type 'projects' to see my work.

💡 Pro tip: Use TAB for autocomplete, ↑↓ for history

Last login: ${new Date().toLocaleString()}
    `;

    this.addLine({ type: "success", content: welcome });
  }

  // Command implementations
  private helpCommand(): string {
    const commandList = Array.from(this.commands.entries())
      .map(([name, cmd]) => `  ${name.padEnd(15)} - ${cmd.description}`)
      .join("\n");

    return `
Available commands:
${commandList}

💡 Tips:
  - Use TAB for autocomplete
  - Use ↑/↓ to navigate command history
  - Try some easter eggs! (hint: sudo, vim, hack)
    `;
  }

  private whoamiCommand(): string {
    return `
╔════════════════════════════════════════════════════════════╗
║  Developer Profile                                         ║
╚════════════════════════════════════════════════════════════╝

👤 Name:        Ariel Almada
💼 Role:        Fullstack Developer
🎯 Focus:       Java, Spring Boot, Node.js, React
📍 Location:    Argentina
🎓 Education:   Computer Science Student at UNER

📊 Stats:
   ├─ Years coding:     ${new Date().getFullYear() - 2020}+
   ├─ Projects:         ${this.data.projects?.length || 0}
   ├─ Skills:           ${this.data.skills?.length || 0}
   └─ Coffee consumed:  ∞ ☕

🔗 Links:
   ├─ GitHub:    https://github.com/ariel323
   ├─ LinkedIn:  linkedin.com/in/ariel-almada-4a7133346
   └─ Email:     arielalmada861@gmail.com

💬 "Code is poetry in motion" - Ariel
    `;
  }

  private lsCommand(args: string[]): string {
    const target = args[0] || "";

    switch (target.toLowerCase()) {
      case "projects":
      case "-p":
        return (
          this.data.projects
            ?.map(
              (p, i) => `${i + 1}. ${p.title} - ${p.technologies.join(", ")}`
            )
            .join("\n") || "No projects found"
        );

      case "skills":
      case "-s":
        return (
          this.data.skills
            ?.map((s) => `[${s.category}] ${s.title}`)
            .join("\n") || "No skills found"
        );

      case "experience":
      case "-e":
        return (
          this.data.experiences
            ?.map((e) => `${e.role} @ ${e.company} (${e.period})`)
            .join("\n") || "No experience found"
        );

      default:
        return `
📁 Available directories:
   projects/     - My portfolio projects
   skills/       - Technical skills
   experience/   - Work experience
   education/    - Academic background

Usage: ls [projects|skills|experience]
        `;
    }
  }

  private catCommand(args: string[]): string {
    const file = args[0]?.toLowerCase() || "";

    switch (file) {
      case "skills.json":
        return JSON.stringify(
          this.data.skills?.map((s) => ({
            title: s.title,
            category: s.category,
            technologies: s.technologies,
          })),
          null,
          2
        );

      case "about.txt":
        return `
Passionate Fullstack Developer specializing in building robust 
and scalable software solutions.

🎯 Core Competencies:
   • Backend: Java, Spring Boot, Node.js, Express
   • Frontend: React, TypeScript, JavaScript ES6+
   • Database: PostgreSQL, MySQL, MongoDB
   • Tools: Git, Docker, Maven, npm
   • Testing: JUnit, Jest, Integration Testing

🚀 What I Do:
   ✓ Design and develop RESTful APIs
   ✓ Build responsive web applications
   ✓ Implement clean, maintainable code
   ✓ Follow SOLID principles and design patterns
   ✓ Collaborate in agile teams

📈 Always learning, always improving!
        `;

      case "readme.md":
        return `
# 👋 Hi, I'm Ariel Almada

## 🚀 About Me
Fullstack Developer passionate about creating elegant solutions
to complex problems. I love working with modern technologies
and best practices.

## 💻 Tech Stack
- **Backend**: Java, Spring Boot, Node.js
- **Frontend**: React, TypeScript, HTML/CSS
- **Database**: SQL, NoSQL
- **Tools**: Git, Docker, VSCode

## 📫 Get in Touch
- GitHub: @ariel323
- LinkedIn: ariel-almada-4a7133346
- Email: arielalmada861@gmail.com

---
⭐ Don't forget to check out my projects!
        `;

      default:
        return `cat: ${file}: No such file or directory

Available files:
  • skills.json    - Skills in JSON format
  • about.txt      - About me
  • readme.md      - Portfolio README
        `;
    }
  }

  private projectsCommand(): string {
    if (!this.data.projects || this.data.projects.length === 0) {
      return "No projects found.";
    }

    return this.data.projects
      .map(
        (project, index) => `
╔════════════════════════════════════════════════════════════╗
║  Project #${index + 1}: ${project.title.padEnd(47)}║
╚════════════════════════════════════════════════════════════╝

📝 Description: ${project.description}

🛠️  Technologies: ${project.technologies.join(", ")}

🔗 Links:
   ${project.repoUrl ? `├─ GitHub: ${project.repoUrl}` : ""}
   ${project.demoUrl ? `└─ Demo: ${project.demoUrl}` : ""}
      `
      )
      .join("\n");
  }

  private skillsCommand(): string {
    if (!this.data.skills || this.data.skills.length === 0) {
      return "No skills found.";
    }

    const grouped = this.data.skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, Skill[]>);

    return Object.entries(grouped)
      .map(
        ([category, skills]) => `
📦 ${category.toUpperCase()}:
${skills
  .map(
    (s) => `   ├─ ${s.title} [${s.technologies.map((t) => t.name).join(", ")}]`
  )
  .join("\n")}
      `
      )
      .join("\n");
  }

  private experienceCommand(): string {
    if (!this.data.experiences || this.data.experiences.length === 0) {
      return "No experience data available.";
    }

    return this.data.experiences
      .map(
        (exp, index) => `
${index + 1}. ${exp.role} @ ${exp.company}
   📅 ${exp.period}
   
   Achievements:
${exp.achievements?.map((a) => `   • ${a}`).join("\n") || "   N/A"}
   
   Technologies: ${exp.technologies?.join(", ") || "N/A"}
      `
      )
      .join("\n───────────────────────────────────────────────\n");
  }

  private contactCommand(): string {
    return `
╔════════════════════════════════════════════════════════════╗
║  Contact Information                                       ║
╚════════════════════════════════════════════════════════════╝

📧 Email:     arielalmada861@gmail.com
🐙 GitHub:    https://github.com/ariel323
💼 LinkedIn:  linkedin.com/in/ariel-almada-4a7133346
📱 WhatsApp:  +54 9 343 4475095

💡 Feel free to reach out! I'm always open to:
   • New opportunities
   • Collaboration on interesting projects
   • Technical discussions
   • Coffee chats ☕

Quick actions:
   • Type 'github' to open my GitHub
   • Type 'linkedin' to open my LinkedIn
    `;
  }

  private historyCommand(): string {
    if (this.history.length === 0) {
      return "No command history yet.";
    }

    return this.history
      .map((cmd, index) => `${(index + 1).toString().padStart(4)}  ${cmd}`)
      .join("\n");
  }

  private achievementsCommand(): string {
    const allAchievements = {
      "coffee-lover": "☕ Coffee Lover - Tried to make coffee with sudo",
      "vim-survivor": "📝 Vim Survivor - Opened vim and survived",
      "chaos-agent": "💥 Chaos Agent - Attempted rm -rf /",
      hacker: "🎯 Hacker - Activated hacker mode",
      "matrix-fan": "🟢 Matrix Fan - Entered the matrix",
      explorer: "🗺️ Explorer - Used at least 10 different commands",
    };

    if (this.achievements.size === 0) {
      return `
🏆 Achievements: 0/${Object.keys(allAchievements).length}

No achievements unlocked yet! Try exploring the terminal:
${Object.entries(allAchievements)
  .map(([_, desc]) => `  🔒 ${desc}`)
  .join("\n")}
      `;
    }

    const unlocked = Array.from(this.achievements)
      .map(
        (key) => `  ✅ ${allAchievements[key as keyof typeof allAchievements]}`
      )
      .join("\n");

    const locked = Object.entries(allAchievements)
      .filter(([key]) => !this.achievements.has(key))
      .map(([_, desc]) => `  🔒 ${desc}`)
      .join("\n");

    return `
🏆 Achievements: ${this.achievements.size}/${
      Object.keys(allAchievements).length
    }

Unlocked:
${unlocked}

Locked:
${locked}
    `;
  }

  private unlockAchievement(achievementId: string): void {
    if (!this.achievements.has(achievementId)) {
      this.achievements.add(achievementId);
      this.showAchievementNotification(achievementId);
    }
  }

  private showAchievementNotification(achievementId: string): void {
    const notification = document.createElement("div");
    notification.className = "achievement-notification";
    notification.innerHTML = `
      <div class="achievement-notification__icon">🏆</div>
      <div class="achievement-notification__content">
        <div class="achievement-notification__title">Achievement Unlocked!</div>
        <div class="achievement-notification__description">${achievementId
          .replace(/-/g, " ")
          .toUpperCase()}</div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add("show"), 100);
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  public destroy(): void {
    this.container.innerHTML = "";
  }
}
