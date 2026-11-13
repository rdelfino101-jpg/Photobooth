/**
 * Real-time 60 FPS animated particle system for HTML5 Canvas.
 * Supports Snow (Nieve), Festive Confetti (Confeti), Golden Sparkles (Destellos Dorados), or Disabled.
 */

import { ParticleEffect } from '../types/photobooth';

export interface ParticleItem {
  x: number;
  y: number;
  radius: number;
  width: number;
  height: number;
  speedY: number;
  speedX: number;
  swingSpeed: number;
  swingAngle: number;
  opacity: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  tilt: number;
  tiltSpeed: number;
}

const CONFETTI_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#fde047'];
const SPARKLE_COLORS = ['#fde047', '#fbbf24', '#f59e0b', '#ffffff', '#fed7aa'];
const BOKEH_COLORS = ['rgba(224, 242, 254, 0.65)', 'rgba(255, 255, 255, 0.75)', 'rgba(186, 230, 253, 0.5)', 'rgba(241, 245, 249, 0.7)'];

export class LiveParticleSystem {
  private particles: ParticleItem[] = [];
  public enabled: boolean = true;
  public effectType: ParticleEffect = 'snow';
  private maxParticles: number = 90;
  private width: number = 1280;
  private height: number = 720;

  constructor(maxParticles = 90, effectType: ParticleEffect = 'snow') {
    this.maxParticles = maxParticles;
    this.effectType = effectType;
    this.initParticles();
  }

  public setEffectType(type: ParticleEffect) {
    if (this.effectType !== type) {
      this.effectType = type;
      this.initParticles();
    }
  }

  private createParticle(startYRandom = true): ParticleItem {
    const isConfetti = this.effectType === 'confetti';
    const isSparkle = this.effectType === 'sparkles' || this.effectType === 'glitter';
    const isBokeh = this.effectType === 'bokeh';

    const color = isConfetti
      ? CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
      : isSparkle
      ? SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)]
      : isBokeh
      ? BOKEH_COLORS[Math.floor(Math.random() * BOKEH_COLORS.length)]
      : '#ffffff';

    return {
      x: Math.random() * this.width,
      y: startYRandom ? Math.random() * this.height : -20,
      radius: isSparkle ? Math.random() * 4 + 2 : Math.random() * 3.5 + 1.2,
      width: isConfetti ? Math.random() * 10 + 6 : 4,
      height: isConfetti ? Math.random() * 6 + 4 : 4,
      speedY: isConfetti ? Math.random() * 2.8 + 1.2 : isSparkle ? Math.random() * 1.2 + 0.4 : Math.random() * 2.2 + 0.8,
      speedX: Math.random() * 1.2 - 0.6,
      swingSpeed: Math.random() * 0.04 + 0.015,
      swingAngle: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.5 + 0.5,
      color,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.08,
      tilt: Math.random() * Math.PI,
      tiltSpeed: Math.random() * 0.06 + 0.02,
    };
  }

  private initParticles() {
    this.particles = [];
    if (this.effectType === 'none') return;
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  public resize(width: number, height: number) {
    if (this.width !== width || this.height !== height) {
      this.width = width;
      this.height = height;
      this.initParticles();
    }
  }

  public updateAndRender(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!this.enabled || this.effectType === 'none') return;
    this.resize(width, height);

    ctx.save();

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Update positions
      p.swingAngle += p.swingSpeed;
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.swingAngle) * 0.8;
      p.rotation += p.rotSpeed;
      p.tilt += p.tiltSpeed;

      // Wrap around screen boundaries
      if (p.y > height + 20) {
        this.particles[i] = this.createParticle(false);
        continue;
      }
      if (p.x > width + 20) p.x = -20;
      else if (p.x < -20) p.x = width + 20;

      ctx.globalAlpha = p.opacity;

      if (this.effectType === 'confetti') {
        // Fluttering rotating colorful ribbon
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        const scaleY = Math.cos(p.tilt);
        ctx.scale(1, scaleY);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx.restore();
      } else if (this.effectType === 'sparkles') {
        // Golden twinkling 4-point star with soft glow
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        const r = p.radius * (0.8 + Math.sin(p.swingAngle * 2) * 0.4);
        ctx.beginPath();
        ctx.moveTo(0, -r * 2);
        ctx.quadraticCurveTo(0, 0, r * 2, 0);
        ctx.quadraticCurveTo(0, 0, 0, r * 2);
        ctx.quadraticCurveTo(0, 0, -r * 2, 0);
        ctx.quadraticCurveTo(0, 0, 0, -r * 2);
        ctx.fill();

        // Center dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else {
        // Realistic falling snow flake
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

// Export for backwards compatibility
export { LiveParticleSystem as SnowParticleSystem };
