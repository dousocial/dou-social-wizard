"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const COUNT = 60;
const MOUSE_RADIUS = 140;
const MOUSE_FORCE = 0.4;
const MAX_SPEED = 2.2;
const LINK_DIST = 120;
// Gentle autonomous drift — each particle gets a slow sine/cosine nudge
const DRIFT = 0.012;

const COLORS = [
  "200,35,35",
  "170,15,15",
  "220,55,55",
  "140,8,8",
  "255,80,80",
] as const;

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  opacity: number;
  color: string;
  phase: number; // unique phase for sine drift
}

function make(w: number, h: number): Particle {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.5) * 1.2,
    size: 1.2 + Math.random() * 2.2,
    opacity: 0.25 + Math.random() * 0.45,
    color,
    phase: Math.random() * Math.PI * 2,
  };
}

export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    // Skip on mobile — saves battery and TBT budget
    if (window.innerWidth < 768) return;

    if (!canvasRef.current) return;
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    let raf: number;
    let particles: Particle[] = [];
    let W = 0, H = 0;
    let tick_n = 0;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    }

    function init() {
      resize();
      particles = Array.from({ length: COUNT }, () => make(W, H));
    }

    function tick() {
      tick_n++;
      ctx.clearRect(0, 0, W, H);

      const mx = mouse.current.x;
      const my = mouse.current.y;
      const t = tick_n * 0.008;

      for (const p of particles) {
        // Autonomous sine/cosine drift
        p.vx += Math.cos(t + p.phase) * DRIFT;
        p.vy += Math.sin(t + p.phase * 1.3) * DRIFT;

        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < MOUSE_RADIUS * MOUSE_RADIUS && d2 > 0) {
          const d = Math.sqrt(d2);
          const f = (1 - d / MOUSE_RADIUS) * MOUSE_FORCE;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }

        // Damping
        p.vx *= 0.97;
        p.vy *= 0.97;

        // Speed cap
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > MAX_SPEED) {
          p.vx = (p.vx / spd) * MAX_SPEED;
          p.vy = (p.vy / spd) * MAX_SPEED;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < -12) p.x = W + 12;
        else if (p.x > W + 12) p.x = -12;
        if (p.y < -12) p.y = H + 12;
        else if (p.y > H + 12) p.y = -12;
      }

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * 0.2;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(200,35,35,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Particles
      for (const p of particles) {
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        grad.addColorStop(0, `rgba(${p.color},${p.opacity * 0.6})`);
        grad.addColorStop(1, `rgba(${p.color},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    }

    init();
    tick();

    const onResize = () => resize();
    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 }; };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5]"
    />
  );
}
