"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/Common/ThemeProvider';
import { Crosshair, Target, Zap } from 'lucide-react';
import styles from './VisualServoingSimulator.module.css';

interface TargetPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const VisualServoingSimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();

  // VSS Simulation State
  const [servoMode, setServoMode] = useState<'IBVS' | 'PBVS'>('IBVS'); // Image-Based vs Position-Based Visual Servoing
  const [controlGain, setControlGain] = useState<number>(0.65); // Lambda controller gain
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [isManualTarget, setIsManualTarget] = useState<boolean>(false);
  const [vssTelemetry, setVssTelemetry] = useState({
    errorNorm: 0.12,
    velocityVector: '[0.04, -0.02, 0.15] m/s',
    jacobianRank: 6,
    fps: 60,
    trackingConfidence: 99.2,
  });

  const targetRef = useRef<TargetPoint>({ x: 280, y: 180, vx: 1.8, vy: 1.2 });
  const cameraEndEffectorRef = useRef<{ x: number; y: number }>({ x: 260, y: 170 });
  const manualMousePos = useRef<{ x: number; y: number } | null>(null);

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
    const primaryColor = isDark ? '#00e5ff' : '#0284c7';
    const alertColor = isDark ? '#f43f5e' : '#e11d48';
    const targetColor = isDark ? '#10b981' : '#059669';

    const handleCanvasMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      manualMousePos.current = { x, y };
      if (isManualTarget) {
        targetRef.current.x = x;
        targetRef.current.y = y;
      }
    };

    canvas.addEventListener('mousemove', handleCanvasMouseMove);

    let frameCount = 0;
    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      frameCount++;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Optical Sensor Coordinate Grid (HUD)
      ctx.strokeStyle = isDark ? 'rgba(0, 229, 255, 0.06)' : 'rgba(2, 132, 199, 0.08)';
      ctx.lineWidth = 1;
      const step = 32;
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

      // 2. Optical Center Crosshairs
      const cx = width / 2;
      const cy = height / 2;
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Update Target Position (Autonomous Lissajous or Manual)
      if (!isManualTarget) {
        targetRef.current.x = cx + Math.sin(time * 0.0018) * (width * 0.32);
        targetRef.current.y = cy + Math.cos(time * 0.0024) * (height * 0.28);
      }

      // 4. Closed-Loop Visual Servoing Law: v = -lambda * L_e^+ * e
      // End-effector camera follows target to minimize error to desired center
      const errorX = targetRef.current.x - cameraEndEffectorRef.current.x;
      const errorY = targetRef.current.y - cameraEndEffectorRef.current.y;
      const errorMagnitude = Math.hypot(errorX, errorY);

      if (isLocked) {
        // Closed loop kinematic velocity update
        const speed = controlGain * 6;
        cameraEndEffectorRef.current.x += (errorX / Math.max(1, errorMagnitude)) * Math.min(speed, errorMagnitude * 0.1);
        cameraEndEffectorRef.current.y += (errorY / Math.max(1, errorMagnitude)) * Math.min(speed, errorMagnitude * 0.1);
      }

      const camX = cameraEndEffectorRef.current.x;
      const camY = cameraEndEffectorRef.current.y;

      // 5. Draw Target Object (Recognized SKU / Feature Matrix)
      const tx = targetRef.current.x;
      const ty = targetRef.current.y;

      // Bounding Box (YOLO / Vision Model)
      const boxW = 84;
      const boxH = 84;
      ctx.strokeStyle = targetColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(tx - boxW / 2, ty - boxH / 2, boxW, boxH);

      // Corner Accents
      const cornerLen = 14;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;

      // Top-left
      ctx.beginPath();
      ctx.moveTo(tx - boxW / 2, ty - boxH / 2 + cornerLen);
      ctx.lineTo(tx - boxW / 2, ty - boxH / 2);
      ctx.lineTo(tx - boxW / 2 + cornerLen, ty - boxH / 2);
      ctx.stroke();

      // Top-right
      ctx.beginPath();
      ctx.moveTo(tx + boxW / 2 - cornerLen, ty - boxH / 2);
      ctx.lineTo(tx + boxW / 2, ty - boxH / 2);
      ctx.lineTo(tx + boxW / 2, ty - boxH / 2 + cornerLen);
      ctx.stroke();

      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(tx - boxW / 2, ty + boxH / 2 - cornerLen);
      ctx.lineTo(tx - boxW / 2, ty + boxH / 2);
      ctx.lineTo(tx - boxW / 2 + cornerLen, ty + boxH / 2);
      ctx.stroke();

      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(tx + boxW / 2 - cornerLen, ty + boxH / 2);
      ctx.lineTo(tx + boxW / 2, ty + boxH / 2);
      ctx.lineTo(tx + boxW / 2, ty + boxH / 2 - cornerLen);
      ctx.stroke();

      // Target Label
      ctx.fillStyle = targetColor;
      ctx.font = '10px monospace';
      ctx.fillText(`FEATURE_TRACK [u:${Math.round(tx)}, v:${Math.round(ty)}]`, tx - boxW / 2, ty - boxH / 2 - 8);

      // 6. Draw Visual Servoing Tracking Error Vector
      ctx.beginPath();
      ctx.moveTo(camX, camY);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = alertColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 7. Draw Visual Servo Camera Center Reticle
      ctx.beginPath();
      ctx.arc(camX, camY, 22, 0, Math.PI * 2);
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(camX, camY, 4, 0, Math.PI * 2);
      ctx.fillStyle = primaryColor;
      ctx.fill();

      // Reticle tick marks
      ctx.beginPath();
      ctx.moveTo(camX - 32, camY);
      ctx.lineTo(camX - 22, camY);
      ctx.moveTo(camX + 22, camY);
      ctx.lineTo(camX + 32, camY);
      ctx.moveTo(camX, camY - 32);
      ctx.lineTo(camX, camY - 22);
      ctx.moveTo(camX, camY + 22);
      ctx.lineTo(camX, camY + 32);
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Camera Reticle Label
      ctx.fillStyle = primaryColor;
      ctx.font = '10px monospace';
      ctx.fillText(`CAM_FRAME_SERVO [λ: ${controlGain.toFixed(2)}]`, camX + 28, camY + 16);

      // Update Telemetry Stream periodically
      if (frameCount % 15 === 0) {
        const vx = ((tx - camX) * controlGain * 0.01).toFixed(3);
        const vy = ((ty - camY) * controlGain * 0.01).toFixed(3);
        const vz = (0.24 + Math.sin(time * 0.003) * 0.05).toFixed(3);

        setVssTelemetry({
          errorNorm: Number((errorMagnitude / 100).toFixed(3)),
          velocityVector: `[${vx}, ${vy}, ${vz}] m/s`,
          jacobianRank: 6,
          fps: Math.round(1 / Math.max(0.001, delta)),
          trackingConfidence: Number((98.5 + (1 / (1 + errorMagnitude * 0.01)) * 1.4).toFixed(1)),
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleCanvasMouseMove);
    };
  }, [servoMode, controlGain, isLocked, isManualTarget, resolvedTheme]);

  return (
    <div className={`glass-panel ${styles.vssContainer}`} ref={containerRef}>
      {/* Simulation Optical Canvas */}
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* VSS Top HUD Bar */}
      <div className={styles.vssHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.vssBadge}>
            <Crosshair size={15} className={styles.crosshairIcon} />
            <span>VISUAL SERVOING SYSTEM (VSS // IBVS)</span>
          </div>
          <h3 className={styles.vssTitle}>Closed-Loop Vision-Guided Robotic Manipulator &amp; Drone Tracking</h3>
        </div>

        <div className={styles.controlsCluster}>
          {/* Servo Mode Switcher */}
          <div className={styles.modePill}>
            <button
              className={`${styles.modeBtn} ${servoMode === 'IBVS' ? styles.activeMode : ''}`}
              onClick={() => setServoMode('IBVS')}
              title="Image-Based Visual Servoing: Control directly in 2D image coordinates"
            >
              IBVS (2D)
            </button>
            <button
              className={`${styles.modeBtn} ${servoMode === 'PBVS' ? styles.activeMode : ''}`}
              onClick={() => setServoMode('PBVS')}
              title="Position-Based Visual Servoing: 3D pose estimation and task-space trajectory"
            >
              PBVS (3D)
            </button>
          </div>

          {/* Interactive Target Mode Toggle */}
          <button
            className={`${styles.toolBtn} ${isManualTarget ? styles.activeTool : ''}`}
            onClick={() => setIsManualTarget(!isManualTarget)}
            title="Move target with cursor instead of autonomous Lissajous curve"
          >
            <Target size={13} />
            <span>{isManualTarget ? 'Manual Cursor' : 'Auto Trajectory'}</span>
          </button>

          {/* Servo Lock Toggle */}
          <button
            className={`${styles.toolBtn} ${isLocked ? styles.activeToolGreen : ''}`}
            onClick={() => setIsLocked(!isLocked)}
            title="Engage / Disengage closed-loop visual servoing PID law"
          >
            <Zap size={13} />
            <span>{isLocked ? 'SERVO LOCKED' : 'FREE WHEEL'}</span>
          </button>
        </div>
      </div>

      {/* VSS Real-Time Telemetry & Controller Parameters */}
      <div className={styles.telemetryOverlay}>
        <div className={styles.telRow}>
          <div className={styles.telBox}>
            <span className={styles.telLabel}>ERROR NORM ||e||</span>
            <span className={styles.telValHighlight}>{vssTelemetry.errorNorm} px/m</span>
          </div>

          <div className={styles.telBox}>
            <span className={styles.telLabel}>CAMERA VELOCITY V_c</span>
            <span className={styles.telVal}>{vssTelemetry.velocityVector}</span>
          </div>

          <div className={styles.telBox}>
            <span className={styles.telLabel}>INTERACTION JACOBIAN</span>
            <span className={styles.telVal}>Rank {vssTelemetry.jacobianRank} (Full Rank)</span>
          </div>

          <div className={styles.telBox}>
            <span className={styles.telLabel}>CONFIDENCE</span>
            <span className={styles.telValGreen}>{vssTelemetry.trackingConfidence}%</span>
          </div>

          {/* Interactive Gain Slider */}
          <div className={styles.sliderBox}>
            <div className={styles.sliderHeader}>
              <span className={styles.sliderLabel}>SERVO GAIN (λ)</span>
              <span className={styles.sliderVal}>{controlGain.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.2"
              step="0.05"
              value={controlGain}
              onChange={(e) => setControlGain(parseFloat(e.target.value))}
              className={styles.rangeInput}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualServoingSimulator;
