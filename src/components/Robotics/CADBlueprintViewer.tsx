"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/components/Common/ThemeProvider';
import { Layers, Crosshair, Compass, RotateCw } from 'lucide-react';
import styles from './CADBlueprintViewer.module.css';

interface CADModelSpec {
  id: string;
  name: string;
  software: string;
  tolerance: string;
  material: string;
  mass: string;
  safetyFactor: string;
  dimX: number;
  dimY: number;
  dimZ: number;
}

export const CADBlueprintViewer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();

  const [selectedCAD, setSelectedCAD] = useState<string>('gslv');
  const [showGrid, setShowGrid] = useState(true);
  const [showDims, setShowDims] = useState(true);
  const [isRotating, setIsRotating] = useState(true);

  const cadModels: CADModelSpec[] = [
    {
      id: 'gslv',
      name: 'ISRO GSLV Mk II Payload Shroud & Cryogenic Stage',
      software: 'CATIA V5 Part & Assembly Design',
      tolerance: '± 0.02 mm',
      material: 'Carbon-Carbon Composite & Al-Li 2195',
      mass: '3,200 kg dry',
      safetyFactor: '2.8x',
      dimX: 3.4,
      dimY: 11.2,
      dimZ: 3.4,
    },
    {
      id: 'robogleam',
      name: 'RoboGleam Dual Articulated Arm & Sanitizing Armature',
      software: 'Autodesk Fusion 360 Kinematics',
      tolerance: '± 0.05 mm',
      material: 'Aircraft 6061-T6 Aluminium & PLA-CF',
      mass: '1.85 kg',
      safetyFactor: '3.1x',
      dimX: 0.65,
      dimY: 0.42,
      dimZ: 0.28,
    },
    {
      id: 'drone',
      name: 'Pixhawk 450mm Carbon Quadcopter Airframe',
      software: 'CATIA V5 Aerodynamic Stress Analysis',
      tolerance: '± 0.01 mm',
      material: 'Toray 3K Carbon Fiber Weave',
      mass: '0.94 kg',
      safetyFactor: '4.2x',
      dimX: 0.45,
      dimY: 0.18,
      dimZ: 0.45,
    },
  ];

  const activeSpec = cadModels.find((m) => m.id === selectedCAD) || cadModels[0];

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
    const gridColor = isDark ? 'rgba(0, 229, 255, 0.08)' : 'rgba(2, 132, 199, 0.09)';
    const blueprintColor = isDark ? '#00e5ff' : '#0284c7';
    const dimColor = isDark ? '#f59e0b' : '#d97706';

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw Isometric Technical Grid
      if (showGrid) {
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        const gridSpacing = 26;

        // Diagonal isometric lines (30 degrees)
        for (let i = -width; i < width * 2; i += gridSpacing * 1.5) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + height * 0.866, height);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i - height * 0.866, height);
          ctx.stroke();
        }
      }

      // Rotate angle if active
      if (isRotating) {
        angle += 0.015;
      }

      // 3D Projection Engine for CAD geometry
      const project = (x: number, y: number, z: number) => {
        // Yaw rotation
        const rx = x * Math.cos(angle) - z * Math.sin(angle);
        const rz = x * Math.sin(angle) + z * Math.cos(angle);
        // Isometric pitch (35 degrees)
        const pitch = 0.55;
        const py = y * Math.cos(pitch) - rz * Math.sin(pitch);
        const pz = y * Math.sin(pitch) + rz * Math.cos(pitch);

        const fov = 420;
        const dist = 600;
        const scale = fov / (dist + pz);
        return {
          px: cx + rx * scale,
          py: cy - py * scale,
        };
      };

      // Draw CAD Wireframe Objects
      ctx.strokeStyle = blueprintColor;
      ctx.lineWidth = 2;

      if (selectedCAD === 'gslv') {
        // Draw Multi-stage rocket cylinder & nose cone
        const radius = 60;
        const stages = [-120, -50, 40, 100];
        const segments = 16;

        stages.forEach((sy) => {
          ctx.beginPath();
          for (let s = 0; s <= segments; s++) {
            const th = (s / segments) * Math.PI * 2;
            const pt = project(Math.cos(th) * radius, sy, Math.sin(th) * radius);
            if (s === 0) ctx.moveTo(pt.px, pt.py);
            else ctx.lineTo(pt.px, pt.py);
          }
          ctx.stroke();
        });

        // Vertical ribs
        for (let s = 0; s < segments; s += 2) {
          const th = (s / segments) * Math.PI * 2;
          const p1 = project(Math.cos(th) * radius, -120, Math.sin(th) * radius);
          const p2 = project(Math.cos(th) * radius, 100, Math.sin(th) * radius);
          const pNose = project(0, 180, 0);

          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.lineTo(pNose.px, pNose.py);
          ctx.stroke();
        }
      } else if (selectedCAD === 'robogleam') {
        // Dual-arm articulated kinematics
        const baseRadius = 75;
        ctx.beginPath();
        for (let s = 0; s <= 20; s++) {
          const th = (s / 20) * Math.PI * 2;
          const pt = project(Math.cos(th) * baseRadius, -60, Math.sin(th) * baseRadius);
          if (s === 0) ctx.moveTo(pt.px, pt.py);
          else ctx.lineTo(pt.px, pt.py);
        }
        ctx.stroke();

        // Arm 1 (Top Duster Arm)
        const j0 = project(0, -60, 0);
        const j1 = project(40 * Math.cos(angle), 20, 40 * Math.sin(angle));
        const j2 = project(80 * Math.cos(angle + 0.4), 90, 80 * Math.sin(angle + 0.4));
        const j3 = project(110 * Math.cos(angle + 0.6), 130, 110 * Math.sin(angle + 0.6));

        ctx.beginPath();
        ctx.moveTo(j0.px, j0.py);
        ctx.lineTo(j1.px, j1.py);
        ctx.lineTo(j2.px, j2.py);
        ctx.lineTo(j3.px, j3.py);
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.lineWidth = 2;
      } else {
        // Quadcopter X-Chassis
        const d = 110;
        const arms = [
          { x: d, z: d },
          { x: -d, z: d },
          { x: d, z: -d },
          { x: -d, z: -d },
        ];

        const centerPt = project(0, 0, 0);

        arms.forEach((a) => {
          const armPt = project(a.x, 0, a.z);
          ctx.beginPath();
          ctx.moveTo(centerPt.px, centerPt.py);
          ctx.lineTo(armPt.px, armPt.py);
          ctx.stroke();

          // Rotor Disc
          ctx.beginPath();
          for (let s = 0; s <= 12; s++) {
            const th = (s / 12) * Math.PI * 2;
            const rPt = project(a.x + Math.cos(th) * 35, 12, a.z + Math.sin(th) * 35);
            if (s === 0) ctx.moveTo(rPt.px, rPt.py);
            else ctx.lineTo(rPt.px, rPt.py);
          }
          ctx.stroke();
        });
      }

      // Draw Engineering Dimension Callouts
      if (showDims) {
        ctx.strokeStyle = dimColor;
        ctx.fillStyle = dimColor;
        ctx.font = '10px monospace';

        const dTop = project(0, 110, 0);
        const dBot = project(0, -110, 0);

        ctx.beginPath();
        ctx.moveTo(dTop.px + 50, dTop.py);
        ctx.lineTo(dBot.px + 50, dBot.py);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(dTop.px + 50, dTop.py, 3, 0, Math.PI * 2);
        ctx.arc(dBot.px + 50, dBot.py, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillText(`L = ${activeSpec.dimY}m [±0.02]`, dTop.px + 60, (dTop.py + dBot.py) / 2);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedCAD, showGrid, showDims, isRotating, resolvedTheme, activeSpec]);

  return (
    <div className={`glass-panel ${styles.cadWrapper}`} ref={containerRef}>
      {/* Canvas */}
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Header Bar */}
      <div className={styles.cadHeader}>
        <div className={styles.headerTitleRow}>
          <div className={styles.cadBadge}>
            <Compass size={14} />
            <span>CATIA V5 R21 // CAD WORKSTATION</span>
          </div>
          <h3 className={styles.modelName}>{activeSpec.name}</h3>
        </div>

        <div className={styles.cadControls}>
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`${styles.cadToolBtn} ${isRotating ? styles.activeTool : ''}`}
            title="Toggle 360° Inspection Rotation"
          >
            <RotateCw size={13} />
            <span>Orbit</span>
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`${styles.cadToolBtn} ${showGrid ? styles.activeTool : ''}`}
            title="Toggle Isometric Blueprint Grid"
          >
            <Layers size={13} />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setShowDims(!showDims)}
            className={`${styles.cadToolBtn} ${showDims ? styles.activeTool : ''}`}
            title="Toggle CAD Dimension Callouts"
          >
            <Crosshair size={13} />
            <span>Dims</span>
          </button>
        </div>
      </div>

      {/* Model Selector Pills */}
      <div className={styles.modelTabs}>
        {cadModels.map((m) => (
          <button
            key={m.id}
            className={`${styles.modelTabBtn} ${selectedCAD === m.id ? styles.modelTabActive : ''}`}
            onClick={() => setSelectedCAD(m.id)}
          >
            {m.name.split(' ')[0]} {m.name.split(' ')[1]}
          </button>
        ))}
      </div>

      {/* Engineering Specs Drawer */}
      <div className={styles.specsBar}>
        <div className={styles.specColumn}>
          <span className={styles.specKey}>SOFTWARE</span>
          <span className={styles.specVal}>{activeSpec.software}</span>
        </div>
        <div className={styles.specColumn}>
          <span className={styles.specKey}>MATERIAL MATRIX</span>
          <span className={styles.specVal}>{activeSpec.material}</span>
        </div>
        <div className={styles.specColumn}>
          <span className={styles.specKey}>TOLERANCE</span>
          <span className={styles.specVal}>{activeSpec.tolerance}</span>
        </div>
        <div className={styles.specColumn}>
          <span className={styles.specKey}>SAFETY FACTOR</span>
          <span className={styles.specVal}>{activeSpec.safetyFactor}</span>
        </div>
      </div>
    </div>
  );
};

export default CADBlueprintViewer;
