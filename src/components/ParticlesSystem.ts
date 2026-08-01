import * as THREE from "three";

export interface ParticleSystemConfig {
  container: HTMLElement;
  particleCount?: number;
  particleColor?: number;
  particleSize?: number;
  connectionDistance?: number;
  mouseRadius?: number;
}

export class ParticlesSystem {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private particles: THREE.Points;
  private particleCount: number;
  private connectionDistance: number;
  private mouseRadius: number;
  private mouse: THREE.Vector2;
  private particlePositions: Float32Array;
  private particleVelocities: Float32Array;
  private animationId: number | null = null;
  private container: HTMLElement;

  constructor(config: ParticleSystemConfig) {
    this.container = config.container;
    this.particleCount = config.particleCount || 150;
    this.connectionDistance = config.connectionDistance || 150;
    this.mouseRadius = config.mouseRadius || 100;
    this.mouse = new THREE.Vector2();

    // Initialize Three.js
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    this.camera.position.z = 400;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    // Create particles
    this.particlePositions = new Float32Array(this.particleCount * 3);
    this.particleVelocities = new Float32Array(this.particleCount * 3);

    const geometry = new THREE.BufferGeometry();
  const material = new THREE.PointsMaterial({
    color: config.particleColor || 0xf59e0b,
    size: config.particleSize || 2,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    // Initialize particle positions and velocities
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      this.particlePositions[i3] = (Math.random() - 0.5) * 800;
      this.particlePositions[i3 + 1] = (Math.random() - 0.5) * 800;
      this.particlePositions[i3 + 2] = (Math.random() - 0.5) * 400;

      this.particleVelocities[i3] = (Math.random() - 0.5) * 0.5;
      this.particleVelocities[i3 + 1] = (Math.random() - 0.5) * 0.5;
      this.particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.5;
    }

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.particlePositions, 3)
    );
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);

    // Create connection lines
    this.createConnectionLines();

    // Event listeners
    this.setupEventListeners();
  }

  private createConnectionLines(): void {
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x64ffda,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });

    const lineGeometry = new THREE.BufferGeometry();
    const linePositions: number[] = [];

    for (let i = 0; i < this.particleCount; i++) {
      for (let j = i + 1; j < this.particleCount; j++) {
        const dx =
          this.particlePositions[i * 3] - this.particlePositions[j * 3];
        const dy =
          this.particlePositions[i * 3 + 1] - this.particlePositions[j * 3 + 1];
        const dz =
          this.particlePositions[i * 3 + 2] - this.particlePositions[j * 3 + 2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < this.connectionDistance) {
          linePositions.push(
            this.particlePositions[i * 3],
            this.particlePositions[i * 3 + 1],
            this.particlePositions[i * 3 + 2],
            this.particlePositions[j * 3],
            this.particlePositions[j * 3 + 1],
            this.particlePositions[j * 3 + 2]
          );
        }
      }
    }

    lineGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3)
    );
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    this.scene.add(lines);
  }

  private setupEventListeners(): void {
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  private onMouseMove(event: MouseEvent): void {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private updateParticles(): void {
    const positions = this.particles.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;

      // Update position
      positions[i3] += this.particleVelocities[i3];
      positions[i3 + 1] += this.particleVelocities[i3 + 1];
      positions[i3 + 2] += this.particleVelocities[i3 + 2];

      // Bounce off boundaries
      if (Math.abs(positions[i3]) > 400) this.particleVelocities[i3] *= -1;
      if (Math.abs(positions[i3 + 1]) > 400)
        this.particleVelocities[i3 + 1] *= -1;
      if (Math.abs(positions[i3 + 2]) > 200)
        this.particleVelocities[i3 + 2] *= -1;

      // Mouse interaction
      const mouseX = this.mouse.x * 400;
      const mouseY = this.mouse.y * 400;
      const dx = positions[i3] - mouseX;
      const dy = positions[i3 + 1] - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.mouseRadius) {
        const force = (this.mouseRadius - distance) / this.mouseRadius;
        this.particleVelocities[i3] += (dx / distance) * force * 0.5;
        this.particleVelocities[i3 + 1] += (dy / distance) * force * 0.5;
      }

      // Add damping
      this.particleVelocities[i3] *= 0.99;
      this.particleVelocities[i3 + 1] *= 0.99;
      this.particleVelocities[i3 + 2] *= 0.99;
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  public animate(): void {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    this.updateParticles();
    this.renderer.render(this.scene, this.camera);
  }

  public start(): void {
    if (!this.animationId) {
      this.animate();
    }
  }

  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public destroy(): void {
    this.stop();
    window.removeEventListener("mousemove", this.onMouseMove.bind(this));
    window.removeEventListener("resize", this.onWindowResize.bind(this));
    this.container.removeChild(this.renderer.domElement);
    this.renderer.dispose();
  }
}
