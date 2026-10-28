"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/Common/ThemeProvider';
import { Cpu, Zap, Activity } from 'lucide-react';
import styles from './PCBCircuitBoard.module.css';

interface Pulse {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  color: string;
}

export const PCBCircuitBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();
  const [activeChip, setActiveChip] = useState<string>('ESP32-S3 MCU');
  const [liveFreq, setLiveFreq] = useState<number>(240);

  const chips = [
    { name: 'ESP32-S3 Dual-Core', role: 'Telemetry & WiFi BLE', clock: '240 MHz', voltage: '3.3V', state: 'ONLINE' },
    { name: 'Pixhawk 6X Autopilot', role: 'Flight Dynamics & EKF', clock: '480 MHz', voltage: '5.0V', state: 'ARMED' },
    { name: 'Arduino Mega 2560', role: 'BLDC Actuator Subsystem', clock: '16 MHz', voltage: '5.0V', state: 'ACTIVE' },
    { name: 'NVIDIA Jetson TX2', role: 'Edge Deep Learning & SLAM', clock: '1.3 GHz', voltage: '12V', state: 'INFERENCE' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    const handleResize = () => {
      if (!canvas || !container) return;
      width = canvas.width = container.clientWidth;
      height = canvas.height = container.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const isDark = resolvedTheme === 'dark';
    const traceBaseColor = isDark ? 'rgba(0, 229, 255, 0.12)' : 'rgba(2, 132, 199, 0.14)';
    const tracePulseColor = isDark ? '#00e5ff' : '#0284c7';
    const goldColor = isDark ? '#f59e0b' : '#d97706';

    // Generate circuit path waypoints
    const nodeCount = 20;
    const nodes: { x: number; y: number }[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.floor((Math.random() * (width - 80) + 40) / 20) * 20,
        y: Math.floor((Math.random() * (height - 80) + 40) / 20) * 20,
      });
    }

    // Generate connected traces
    const traces: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const n1 = nodes[i];
      const n2 = nodes[i + 1];
      // Manhattan 90-degree bend routing
      traces.push({ x1: n1.x, y1: n1.y, x2: n2.x, y2: n1.y });
      traces.push({ x1: n2.x, y1: n1.y, x2: n2.x, y2: n2.y });
    }

    // Active electrical pulses
    const pulses: Pulse[] = [];
    for (let i = 0; i < 12; i++) {
      const trace = traces[Math.floor(Math.random() * traces.length)];
      pulses.push({
        x: trace.x1,
        y: trace.y1,
        targetX: trace.x2,
        targetY: trace.y2,
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.012,
        color: tracePulseColor,
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    container.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Substrate Grid Mesh
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(15, 23, 42, 0.03)';
      ctx.lineWidth = 1;
      const step = 24;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Copper Traces
      traces.forEach((t) => {
        ctx.beginPath();
        ctx.moveTo(t.x1, t.y1);
        ctx.lineTo(t.x2, t.y2);
        ctx.strokeStyle = traceBaseColor;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      });

      // Draw Solder Pads / Vias
      nodes.forEach((n, idx) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = goldColor;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#07090e' : '#ffffff';
        ctx.fill();

        // Label on some vias
        if (idx % 4 === 0) {
          ctx.fillStyle = isDark ? 'rgba(0, 229, 255, 0.5)' : 'rgba(2, 132, 199, 0.6)';
          ctx.font = '9px monospace';
          ctx.fillText(`VIA_${idx}`, n.x + 8, n.y + 3);
        }
      });

      // Update and Draw Electric Current Pulses
      pulses.forEach((p) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          const nextTrace = traces[Math.floor(Math.random() * traces.length)];
          p.x = nextTrace.x1;
          p.y = nextTrace.y1;
          p.targetX = nextTrace.x2;
          p.targetY = nextTrace.y2;
        }

        const currX = p.x + (p.targetX - p.x) * p.progress;
        const currY = p.y + (p.targetY - p.y) * p.progress;

        // Glowing pulse head
        const grad = ctx.createRadialGradient(currX, currY, 0, currX, currY, 12);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(currX, currY, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(currX, currY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Cursor Interactive Logic Probe Ring
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 28, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? 'rgba(0, 229, 255, 0.4)' : 'rgba(2, 132, 199, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = isDark ? '#00e5ff' : '#0284c7';
      ctx.font = '10px monospace';
      ctx.fillText(`PROBE 3.3V`, mouseX + 10, mouseY - 10);

      animId = requestAnimationFrame(render);
    };

    render();

    const freqInterval = setInterval(() => {
      setLiveFreq(240 + Math.floor(Math.random() * 8) - 4);
    }, 1200);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(freqInterval);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [resolvedTheme]);

  return (
    <div className={`glass-panel ${styles.boardCard}`} ref={containerRef}>
      {/* Canvas */}
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* PCB Header Overlay */}
      <div className={styles.boardHeader}>
        <div className={styles.titleCol}>
          <div className={styles.badge}>
            <Zap size={14} className={styles.zapIcon} />
            <span>EMBEDDED HARDWARE ARCHITECTURE</span>
          </div>
          <h3 className={styles.boardTitle}>High-Speed PCB Design &amp; Signal Routing</h3>
        </div>

        <div className={styles.freqBadge}>
          <Activity size={14} />
          <span>BUS CLK: {liveFreq} MHz</span>
        </div>
      </div>

      {/* Interactive Microchip Selector Dock */}
      <div className={styles.chipDock}>
        {chips.map((chip) => (
          <button
            key={chip.name}
            className={`${styles.chipBtn} ${activeChip === chip.name ? styles.activeChipBtn : ''}`}
            onClick={() => setActiveChip(chip.name)}
          >
            <div className={styles.chipPinHeader}>
              <Cpu size={14} />
              <span className={styles.chipName}>{chip.name}</span>
            </div>
            <div className={styles.chipMeta}>
              <span>{chip.role}</span>
              <span className={styles.chipState}>{chip.state}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PCBCircuitBoard;
