"use client";

import React, { useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  clusterId: number;
  hasDiffraction: boolean;
  color: string;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  maxLife: number;
  color: string;
  active: boolean;
}

interface WaterRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  alpha: number;
}

interface WaterDroplet {
  x: number;
  y: number;
  radius: number;
  vy: number;
  wobbleSpeed: number;
  wobblePhase: number;
  wobbleAmp: number;
  alpha: number;
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
      initElements();
    };

    window.addEventListener('resize', handleResize);

    const isDark = resolvedTheme === 'dark';

    // Theme Palette
    const cyanColor = isDark ? '#00e5ff' : '#0284c7';
    const blueColor = isDark ? '#38bdf8' : '#0369a1';
    const indigoColor = isDark ? '#818cf8' : '#6366f1';
    const tealColor = isDark ? '#2dd4bf' : '#0d9488';
    const starWhite = isDark ? '#ffffff' : '#f0f9ff';

    // ========================================================
    // 1. STAR CLUSTERS (Constellations & Deep Space Nebulae)
    // ========================================================
    let stars: Star[] = [];
    const clusterCount = 5;

    // ========================================================
    // 2. METEORS (Cosmic Shooting Stars)
    // ========================================================
    let meteors: Meteor[] = [];

    // ========================================================
    // 3. INTERACTIVE WATER RIPPLES
    // ========================================================
    const ripples: WaterRipple[] = [];

    // ========================================================
    // 4. WATER DROPLETS / BUBBLES
    // ========================================================
    let droplets: WaterDroplet[] = [];

    const initElements = () => {
      // Initialize Star Clusters
      stars = [];
      const clusterCenters = [
        { x: width * 0.16, y: height * 0.22 }, // Cluster 1: Top-left
        { x: width * 0.82, y: height * 0.26 }, // Cluster 2: Top-right
        { x: width * 0.48, y: height * 0.46 }, // Cluster 3: Mid-center
        { x: width * 0.22, y: height * 0.76 }, // Cluster 4: Bottom-left
        { x: width * 0.80, y: height * 0.78 }, // Cluster 5: Bottom-right
      ];

      const starPalette = [cyanColor, blueColor, indigoColor, tealColor, starWhite];
      const totalStars = Math.min(Math.floor((width * height) / 8000), 160);

      for (let i = 0; i < totalStars; i++) {
        const clusterId = i % clusterCount;
        const center = clusterCenters[clusterId];
        // Gaussian radial dispersion around cluster center
        const radiusDist = Math.pow(Math.random(), 1.8) * Math.min(width, height) * 0.38;
        const angle = Math.random() * Math.PI * 2;
        const starX = (center.x + Math.cos(angle) * radiusDist + width) % width;
        const starY = (center.y + Math.sin(angle) * radiusDist + height) % height;

        stars.push({
          x: starX,
          y: starY,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          radius: Math.random() < 0.15 ? Math.random() * 1.8 + 1.4 : Math.random() * 1.2 + 0.6,
          baseAlpha: Math.random() * 0.55 + 0.35,
          twinkleSpeed: 0.015 + Math.random() * 0.03,
          twinklePhase: Math.random() * Math.PI * 2,
          clusterId,
          hasDiffraction: Math.random() < 0.12, // Major stellar beacons have 4-point cross glare
          color: starPalette[Math.floor(Math.random() * starPalette.length)],
        });
      }

      // Initialize Meteors
      meteors = [];
      for (let i = 0; i < 3; i++) {
        meteors.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.5),
          vx: -(3.5 + Math.random() * 4.0),
          vy: 2.2 + Math.random() * 2.8,
          length: 60 + Math.random() * 90,
          life: 0,
          maxLife: 50 + Math.floor(Math.random() * 40),
          color: Math.random() > 0.5 ? cyanColor : starWhite,
          active: false,
        });
      }

      // Initialize Water Droplets / Bubbles
      droplets = [];
      const dropletCount = Math.min(Math.floor(width / 36), 36);
      for (let i = 0; i < dropletCount; i++) {
        droplets.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 4.5 + 2.0,
          vy: -(0.35 + Math.random() * 0.65), // Buoyancy upward drift
          wobbleSpeed: 0.02 + Math.random() * 0.03,
          wobblePhase: Math.random() * Math.PI * 2,
          wobbleAmp: Math.random() * 0.6 + 0.3,
          alpha: Math.random() * 0.35 + 0.2,
        });
      }
    };

    initElements();

    // Mouse Tracking for Interactive Water Ripples & Star Interaction
    let mouseX = width / 2;
    let mouseY = height / 2;
    let mouseActive = false;
    let lastRippleTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;

      // Spawn interactive water ripple from cursor movement
      const now = Date.now();
      if (now - lastRippleTime > 80 && ripples.length < 18) {
        lastRippleTime = now;
        ripples.push({
          x: mouseX,
          y: mouseY,
          radius: 2,
          maxRadius: 80 + Math.random() * 50,
          speed: 1.8 + Math.random() * 0.8,
          alpha: isDark ? 0.45 : 0.3,
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      // Big impact water splash ring on click
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: 160,
        speed: 2.5,
        alpha: isDark ? 0.7 : 0.5,
      });
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 2,
        maxRadius: 100,
        speed: 1.8,
        alpha: isDark ? 0.5 : 0.35,
      });
    };

    const handleMouseLeave = () => {
      mouseActive = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    // ========================================================
    // WATER FLUID WAVES CONFIGURATION
    // ========================================================
    const waveLayers = [
      {
        yBaseRatio: 0.68,
        amplitude: 28,
        wavelength: 0.0035,
        speed: 0.016,
        color: isDark ? 'rgba(0, 229, 255, 0.035)' : 'rgba(2, 132, 199, 0.035)',
      },
      {
        yBaseRatio: 0.78,
        amplitude: 36,
        wavelength: 0.0028,
        speed: -0.012,
        color: isDark ? 'rgba(13, 148, 136, 0.045)' : 'rgba(14, 165, 233, 0.04)',
      },
      {
        yBaseRatio: 0.88,
        amplitude: 44,
        wavelength: 0.0022,
        speed: 0.018,
        color: isDark ? 'rgba(56, 189, 248, 0.05)' : 'rgba(3, 105, 161, 0.045)',
      },
    ];

    let time = 0;
    let nextMeteorCountdown = 120; // Periodic shooting stars

    // ========================================================
    // MAIN COSMIC OCEAN RENDER LOOP
    // ========================================================
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // ------------------------------------------------------
      // 1. DRAW WATER FLUID WAVES (Harmonic Ocean Currents)
      // ------------------------------------------------------
      waveLayers.forEach((layer, lIdx) => {
        ctx.beginPath();
        const baseOffset = height * layer.yBaseRatio;
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 12) {
          const wavePhase = time * layer.speed * 60 + lIdx * 1.5;
          // Harmonic wave equation
          const waveY =
            baseOffset +
            Math.sin(x * layer.wavelength + wavePhase) * layer.amplitude +
            Math.cos(x * layer.wavelength * 0.6 + wavePhase * 0.7) * (layer.amplitude * 0.35);

          if (x === 0) ctx.lineTo(x, waveY);
          else ctx.lineTo(x, waveY);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const waveGrad = ctx.createLinearGradient(0, baseOffset - layer.amplitude, 0, height);
        waveGrad.addColorStop(0, layer.color);
        waveGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = waveGrad;
        ctx.fill();

        // Shimmering Water Crest Line
        ctx.strokeStyle = isDark ? 'rgba(0, 229, 255, 0.08)' : 'rgba(2, 132, 199, 0.07)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // ------------------------------------------------------
      // 2. DRAW INTERACTIVE WATER RIPPLES
      // ------------------------------------------------------
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += rip.speed;
        rip.alpha *= 0.965; // Fade out as it expands

        if (rip.radius >= rip.maxRadius || rip.alpha <= 0.01) {
          ripples.splice(i, 1);
          continue;
        }

        // Outer expanding wave ring
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = isDark
          ? `rgba(0, 229, 255, ${rip.alpha})`
          : `rgba(2, 132, 199, ${rip.alpha})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Inner harmonic secondary ring
        if (rip.radius > 16) {
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, rip.radius * 0.68, 0, Math.PI * 2);
          ctx.strokeStyle = isDark
            ? `rgba(56, 189, 248, ${rip.alpha * 0.55})`
            : `rgba(14, 165, 233, ${rip.alpha * 0.55})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      // ------------------------------------------------------
      // 3. DRAW STAR CLUSTERS & CONSTELLATION LINKAGES
      // ------------------------------------------------------
      // Draw delicate constellation connecting filaments within clusters
      for (let i = 0; i < stars.length; i++) {
        const s1 = stars[i];
        for (let j = i + 1; j < stars.length; j++) {
          const s2 = stars[j];
          if (s1.clusterId === s2.clusterId) {
            const dist = Math.hypot(s1.x - s2.x, s1.y - s2.y);
            if (dist < 95) {
              const lineAlpha = (1 - dist / 95) * (isDark ? 0.16 : 0.1);
              ctx.beginPath();
              ctx.moveTo(s1.x, s1.y);
              ctx.lineTo(s2.x, s2.y);
              ctx.strokeStyle = `rgba(0, 229, 255, ${lineAlpha})`;
              ctx.lineWidth = 0.7;
              ctx.stroke();
            }
          }
        }
      }

      // Update & Draw Stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Drift slowly with cosmic movement
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        // Twinkle luminance calculation
        const twinkle = Math.sin(time * 2 + s.twinklePhase) * 0.3;
        const currentAlpha = Math.max(0.15, Math.min(1.0, s.baseAlpha + twinkle));

        // Draw Star Glow Aura
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = currentAlpha * 0.25;
        ctx.fill();

        // Draw Star Core
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = starWhite;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();

        // Major Star Diffraction Cross Spikes (Cosmic Stellar Glare)
        if (s.hasDiffraction) {
          const spikeLen = s.radius * 6.5;
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 0.8;
          ctx.globalAlpha = currentAlpha * 0.65;

          // Horizontal Spike
          ctx.beginPath();
          ctx.moveTo(s.x - spikeLen, s.y);
          ctx.lineTo(s.x + spikeLen, s.y);
          ctx.stroke();

          // Vertical Spike
          ctx.beginPath();
          ctx.moveTo(s.x, s.y - spikeLen);
          ctx.lineTo(s.x, s.y + spikeLen);
          ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
      }

      // ------------------------------------------------------
      // 4. DRAW SHOOTING STARS (METEORS)
      // ------------------------------------------------------
      nextMeteorCountdown--;
      if (nextMeteorCountdown <= 0) {
        nextMeteorCountdown = 160 + Math.floor(Math.random() * 200);
        // Find an inactive meteor to launch
        const m = meteors.find((met) => !met.active);
        if (m) {
          m.x = width * (0.3 + Math.random() * 0.6);
          m.y = Math.random() * (height * 0.3);
          m.life = 0;
          m.active = true;
        }
      }

      meteors.forEach((m) => {
        if (!m.active) return;
        m.x += m.vx;
        m.y += m.vy;
        m.life++;

        if (m.life >= m.maxLife || m.x < 0 || m.y > height) {
          m.active = false;
          return;
        }

        const headX = m.x;
        const headY = m.y;
        const tailX = m.x - (m.vx / 5) * m.length;
        const tailY = m.y - (m.vy / 5) * m.length;

        const progress = m.life / m.maxLife;
        const meteorAlpha = Math.sin(progress * Math.PI) * (isDark ? 0.85 : 0.65);
        ctx.globalAlpha = meteorAlpha;

        // Radiant fading tail gradient
        const meteorGrad = ctx.createLinearGradient(tailX, tailY, headX, headY);
        meteorGrad.addColorStop(0, 'transparent');
        meteorGrad.addColorStop(0.7, m.color);
        meteorGrad.addColorStop(1, '#ffffff');

        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.stroke();

        // Glowing Starburst Head
        ctx.beginPath();
        ctx.arc(headX, headY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = m.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });

      // ------------------------------------------------------
      // 5. DRAW FLOATING WATER DROPLETS & BUBBLES
      // ------------------------------------------------------
      droplets.forEach((d) => {
        d.y += d.vy;
        d.wobblePhase += d.wobbleSpeed;
        const currentX = d.x + Math.sin(d.wobblePhase) * d.wobbleAmp * 15;

        // Reset to bottom when floating past top
        if (d.y < -20) {
          d.y = height + 20;
          d.x = Math.random() * width;
        }

        // Fluid repulsion from cursor
        if (mouseActive) {
          const dx = mouseX - currentX;
          const dy = mouseY - d.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120 && dist > 10) {
            d.x -= (dx / dist) * 0.8;
            d.y -= (dy / dist) * 0.8;
          }
        }

        // Bubble Outer Rim
        ctx.beginPath();
        ctx.arc(currentX, d.y, d.radius, 0, Math.PI * 2);
        ctx.strokeStyle = isDark
          ? `rgba(0, 229, 255, ${d.alpha})`
          : `rgba(2, 132, 199, ${d.alpha * 0.8})`;
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // Shimmering Inner Fluid Body
        const bubbleGrad = ctx.createRadialGradient(
          currentX - d.radius * 0.3,
          d.y - d.radius * 0.3,
          0,
          currentX,
          d.y,
          d.radius
        );
        bubbleGrad.addColorStop(0, isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.6)');
        bubbleGrad.addColorStop(0.5, isDark ? 'rgba(0, 229, 255, 0.12)' : 'rgba(2, 132, 199, 0.1)');
        bubbleGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = bubbleGrad;
        ctx.fill();

        // Specular Glint Highlight on Top-Left of Bubble
        ctx.beginPath();
        ctx.arc(currentX - d.radius * 0.35, d.y - d.radius * 0.35, d.radius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
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
        opacity: 0.9,
      }}
      aria-hidden="true"
    />
  );
};

export default RoboticsCanvas;
