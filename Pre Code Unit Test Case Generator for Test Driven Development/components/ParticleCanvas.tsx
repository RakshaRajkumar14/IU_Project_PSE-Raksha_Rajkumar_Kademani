"use client";

import { useEffect, useRef } from "react";

/**
 * Renders a highly optimized constellation/particle network effect using a native HTML5 Canvas.
 * No external dependencies like three.js are required, ensuring incredible performance.
 */
export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const config = {
      particleCount: 80,
      particleSize: 1.5,
      linkDistance: 130,
      color: "rgba(124, 92, 255, ", // Base purple color for the effect
      velocityScale: 0.3,
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * config.velocityScale;
        this.vy = (Math.random() - 0.5) * config.velocityScale;
        this.size = Math.random() * config.particleSize + 0.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls seamlessly
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = config.color + "0.6)";
        ctx.fill();
      }
    }

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // Adjust particle count based on screen size so it isn't overwhelming on mobile
      const density = Math.floor((width * height) / 15000);
      config.particleCount = Math.min(density, 120);

      particles = [];
      for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      // Create a slight trailing effect by not fully clearing the canvas
      ctx.fillStyle = "#09090f"; // Match the dark theme background perfectly
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      particles.forEach((p) => p.update());

      // Draw links between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < config.linkDistance) {
            // Opacity fades out as distance approaches maximum
            const opacity = 1 - distance / config.linkDistance;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = config.color + (opacity * 0.35).toString() + ")";
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
        particles[i].draw();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
      init();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        background: "#09090f",
      }}
    />
  );
}
