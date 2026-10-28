"use client";

import React, { useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  pulsePhase: number;
}

interface DataPhoton {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  length: number;
}

export const RoboticsCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // LiDAR & SLAM Nodes
    const particleCount = Math.min(Math.floor((width * height) / 24000), 55);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.2 + 1,
        alpha: Math.random() * 0.5 + 0.25,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // High-speed Data Photons (vibe coding light streams)
    const photons: DataPhoton[] = [];
    for (let i = 0; i < 6; i++) {
      photons.push({
        x: Math.random() * width,
        y: Math.random() * height,
        targetX: Math.random() * width,
        targetY: Math.random() * height,
        progress: Math.random(),
        speed: 0.008 + Math.random() * 0.012,
        length: 40 + Math.random() * 60,
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;
    let mouseActive = false;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;
    };

    const handleMouseLeave = () => {
      mouseActive = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    const isDark = resolvedTheme === 'dark';
    const primaryRgb = isDark ? '0, 229, 255' : '2, 132, 199';
    const secondaryRgb = isDark ? '139, 92, 246' : '99, 102, 241';
    const gridRgb = isDark ? '0, 229, 255' : '2, 132, 199';

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Subtle Isometric Horizon Radar Rings
      const horizonY = height * 0.45;
      ctx.strokeStyle = `rgba(${gridRgb}, ${isDark ? 0.04 : 0.03})`;
      ctx.lineWidth = 1;

      for (let r = 120; r <= 800; r += 160) {
        ctx.beginPath();
        ctx.ellipse(width / 2, horizonY, r, r * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 2. Interactive Cursor Radar Sweep Aura
      if (mouseActive) {
        const radGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 180);
        radGrad.addColorStop(0, `rgba(${primaryRgb}, ${isDark ? 0.12 : 0.08})`);
        radGrad.addColorStop(0.5, `rgba(${secondaryRgb}, ${isDark ? 0.04 : 0.02})`);
        radGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 180, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing Reticle Ring
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 28 + Math.sin(time * 3) * 3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${primaryRgb}, ${isDark ? 0.35 : 0.25})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3. Update & Draw Particles (LiDAR Cloud)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Subtle attraction to mouse cursor
        if (mouseActive) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 180 && dist > 20) {
            p.x += (dx / dist) * 0.3;
            p.y += (dy / dist) * 0.3;
          }
        }

        const currentAlpha = p.alpha + Math.sin(time + p.pulsePhase) * 0.15;

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${primaryRgb}, ${Math.max(0.1, currentAlpha)})`;
        ctx.fill();

        // Connect nearby nodes (sensor mesh)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distance = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const lineOpacity = (1 - distance / 120) * (isDark ? 0.16 : 0.12);
            ctx.strokeStyle = `rgba(${primaryRgb}, ${lineOpacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // 4. Update and Draw High-speed Data Photons
      photons.forEach((photon) => {
        photon.progress += photon.speed;
        if (photon.progress >= 1) {
          photon.progress = 0;
          photon.x = Math.random() * width;
          photon.y = Math.random() * height;
          // Random 45 or 90 degree direction
          const angle = (Math.floor(Math.random() * 8) * Math.PI) / 4;
          const dist = 300 + Math.random() * 400;
          photon.targetX = photon.x + Math.cos(angle) * dist;
          photon.targetY = photon.y + Math.sin(angle) * dist;
        }

        const currX = photon.x + (photon.targetX - photon.x) * photon.progress;
        const currY = photon.y + (photon.targetY - photon.y) * photon.progress;
        const tailX = currX - ((photon.targetX - photon.x) / 300) * photon.length;
        const tailY = currY - ((photon.targetY - photon.y) / 300) * photon.length;

        const grad = ctx.createLinearGradient(tailX, tailY, currX, currY);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, `rgba(${primaryRgb}, ${isDark ? 0.7 : 0.5})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(currX, currY);
        ctx.stroke();

        // Glow head
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(currX, currY, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85,
      }}
      aria-hidden="true"
    />
  );
};

export default RoboticsCanvas;
