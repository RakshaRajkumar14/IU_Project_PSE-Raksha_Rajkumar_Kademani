"use client";

import { useEffect, useRef } from "react";

export function QACanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    
    // Slow, cinematic speeds
    const fadeAlpha = 0.08;
    const speedMult = 0.3;
    
    // Constants
    const PASS_TERMS = ["✓ PASS", "200 OK", "EXPECT(true)", "TEST MATCH"];
    const FAIL_TERMS = ["✗ FAIL", "EXCEPTION", "NULL", "404 NOT FOUND"];
    const TEST_TERMS = ["TC-042", "describe()", "assert()", "mock", "spyOn()", "100% cov"];
    
    const BADGES = [
      { text: "✓ PASS", color: "#10b981" },
      { text: "✗ FAIL", color: "#ef4444" },
      { text: "⚠ WARN", color: "#f59e0b" },
      { text: "TC-007", color: "#7c5cff" },
      { text: "100% cov", color: "#3b82f6" }
    ];

    let items: BubblingText[] = [];
    let badges: Badge[] = [];
    let scanLineY = 0;

    class BubblingText {
      x: number;
      y: number;
      speed: number;
      term: string;
      color: string;
      alpha: number;
      
      constructor() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 500;
        this.speed = (Math.random() * 1.5 + 0.5) * speedMult;
        this.term = this.getRandomTerm();
        this.color = this.getColorForTerm(this.term);
        this.alpha = Math.random() * 0.4 + 0.1;
      }
      
      getRandomTerm() {
        const rand = Math.random();
        if (rand < 0.25) return PASS_TERMS[Math.floor(Math.random() * PASS_TERMS.length)];
        if (rand < 0.45) return FAIL_TERMS[Math.floor(Math.random() * FAIL_TERMS.length)];
        return TEST_TERMS[Math.floor(Math.random() * TEST_TERMS.length)];
      }

      getColorForTerm(term: string) {
        if (PASS_TERMS.includes(term)) return "#10b981"; // Green
        if (FAIL_TERMS.includes(term)) return "#ef4444"; // Red
        return "#7c5cff"; // Violet
      }

      update() {
        // Float upwards instead of falling matrix style for a more soothing feel
        this.y -= this.speed;
        
        // Reset at bottom when floating off top
        if (this.y < -50) {
          this.y = height + 50;
          this.x = Math.random() * width;
          this.speed = (Math.random() * 1.5 + 0.5) * speedMult;
          this.term = this.getRandomTerm();
          this.color = this.getColorForTerm(this.term);
        }
      }

      draw() {
        if (!ctx) return;
        ctx.font = "12px monospace";
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fillText(this.term, this.x, this.y);
        ctx.globalAlpha = 1.0;
      }
    }

    class Badge {
      x: number;
      y: number;
      vx: number;
      vy: number;
      text: string;
      color: string;
      width: number;
      alpha: number;
      alphaDir: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4 * speedMult;
        this.vy = (Math.random() - 0.5) * 0.4 * speedMult;
        
        const b = BADGES[Math.floor(Math.random() * BADGES.length)];
        this.text = b.text;
        this.color = b.color;
        this.width = 65;
        this.alpha = Math.random() * 0.2 + 0.05;
        this.alphaDir = Math.random() > 0.5 ? 0.001 : -0.001;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < -100) this.x = width + 100;
        if (this.x > width + 100) this.x = -100;
        if (this.y < -100) this.y = height + 100;
        if (this.y > height + 100) this.y = -100;

        this.alpha += this.alphaDir;
        if (this.alpha > 0.35 || this.alpha < 0.05) this.alphaDir *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
        
        // Draw elegant pill
        ctx.beginPath();
        const rad = 12;
        const h = 24;
        ctx.roundRect(this.x - this.width/2, this.y - h/2, this.width, h, rad);
        
        // Subtle glow stroke
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = this.color + "1A"; // 10% opacity fill
        ctx.fill();

        ctx.fillStyle = this.color;
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.text, this.x, this.y);
        
        ctx.restore();
      }
    }

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      items = [];
      badges = [];
      
      const itemCount = Math.min(Math.floor(width / 30), 40);
      for (let i = 0; i < itemCount; i++) {
        items.push(new BubblingText());
      }

      const badgeCount = Math.min(Math.floor(width / 150), 10);
      for (let i = 0; i < badgeCount; i++) {
        badges.push(new Badge());
      }
    };

    const animate = () => {
      // Cinematic slow trail fade
      ctx.fillStyle = `rgba(9, 9, 15, ${fadeAlpha})`;
      ctx.fillRect(0, 0, width, height);

      // Subtle Background Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < width; i += 80) {
        ctx.moveTo(i, 0); ctx.lineTo(i, height);
      }
      for (let i = 0; i < height; i += 80) {
        ctx.moveTo(0, i); ctx.lineTo(width, i);
      }
      ctx.stroke();

      // Slow Scan line
      scanLineY += 1.5 * speedMult;
      if (scanLineY > height + 200) scanLineY = -200;
      
      const scanGrad = ctx.createLinearGradient(0, scanLineY - 100, 0, scanLineY);
      scanGrad.addColorStop(0, "rgba(124, 92, 255, 0)");
      scanGrad.addColorStop(1, "rgba(124, 92, 255, 0.05)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanLineY - 100, width, 100);
      
      ctx.fillStyle = "rgba(124, 92, 255, 0.15)";
      ctx.fillRect(0, scanLineY, width, 1);

      items.forEach(d => {
        d.update();
        d.draw();
      });

      badges.forEach(b => {
        b.update();
        b.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => init();
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
        zIndex: -1,
        pointerEvents: "none",
        background: "#09090f",
      }}
    />
  );
}
