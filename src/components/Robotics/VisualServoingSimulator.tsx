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

    // 3D Perspective Projection Engine for PBVS mode
    const project3D = (x: number, y: number, z: number) => {
      const cx = width / 2;
      const cy = height * 0.58;
      // 3D Isometric / Perspective View (Yaw + Pitch)
      const pitch = 0.52; // ~30 deg tilt down
      const yaw = -0.45;  // ~25 deg rotation
      const rx = x * Math.cos(yaw) - z * Math.sin(yaw);
      const rz = x * Math.sin(yaw) + z * Math.cos(yaw);
      const py = y * Math.cos(pitch) - rz * Math.sin(pitch);
      const pz = y * Math.sin(pitch) + rz * Math.cos(pitch);

      const fov = 380;
      const dist = 480;
      const scale = fov / Math.max(80, dist + pz);
      return {
        px: cx + rx * scale,
        py: cy - py * scale,
        scale,
      };
    };

    const render = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      frameCount++;

      ctx.clearRect(0, 0, width, height);

      // ========================================================
      // MODE 1: IBVS (2D IMAGE-BASED VISUAL SERVOING)
      // ========================================================
      if (servoMode === 'IBVS') {
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

        // 2. Optical Center Crosshairs (Image Plane [u, v])
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
        const errorX = targetRef.current.x - cameraEndEffectorRef.current.x;
        const errorY = targetRef.current.y - cameraEndEffectorRef.current.y;
        const errorMagnitude = Math.hypot(errorX, errorY);

        if (isLocked) {
          const speed = controlGain * 6;
          cameraEndEffectorRef.current.x += (errorX / Math.max(1, errorMagnitude)) * Math.min(speed, errorMagnitude * 0.1);
          cameraEndEffectorRef.current.y += (errorY / Math.max(1, errorMagnitude)) * Math.min(speed, errorMagnitude * 0.1);
        }

        const camX = cameraEndEffectorRef.current.x;
        const camY = cameraEndEffectorRef.current.y;

        // 5. Draw Target Object Bounding Box
        const tx = targetRef.current.x;
        const ty = targetRef.current.y;
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
        ctx.fillText(`2D_FEATURE_TRACK [u:${Math.round(tx)}, v:${Math.round(ty)}]`, tx - boxW / 2, ty - boxH / 2 - 8);

        // 6. Draw 2D Image Error Vector
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

        ctx.fillStyle = primaryColor;
        ctx.font = '10px monospace';
        ctx.fillText(`IBVS_CAM_RETICLE [λ: ${controlGain.toFixed(2)}]`, camX + 28, camY + 16);

        // Telemetry update
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
      } else {
        // ========================================================
        // MODE 2: PBVS (3D POSITION-BASED VISUAL SERVOING)
        // Authentic 3D Task-Space with Camera Frustum & 3D Pose
        // ========================================================

        // 1. Draw 3D Ground Grid (Isometric X-Z Ground Plane)
        ctx.strokeStyle = isDark ? 'rgba(0, 229, 255, 0.12)' : 'rgba(2, 132, 199, 0.14)';
        ctx.lineWidth = 1;

        const gridSize = 280;
        const gridStep = 40;
        for (let gx = -gridSize; gx <= gridSize; gx += gridStep) {
          const p1 = project3D(gx, 0, -gridSize);
          const p2 = project3D(gx, 0, gridSize);
          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.stroke();
        }
        for (let gz = -gridSize; gz <= gridSize; gz += gridStep) {
          const p1 = project3D(-gridSize, 0, gz);
          const p2 = project3D(gridSize, 0, gz);
          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.stroke();
        }

        // 2. 3D World Origin Axes {W} [X_w (red), Y_w (green), Z_w (blue)]
        const o0 = project3D(0, 0, 0);
        const ox = project3D(50, 0, 0);
        const oy = project3D(0, 50, 0);
        const oz = project3D(0, 0, 50);

        ctx.lineWidth = 2.5;
        // X Axis (Red)
        ctx.beginPath();
        ctx.moveTo(o0.px, o0.py);
        ctx.lineTo(ox.px, ox.py);
        ctx.strokeStyle = '#ef4444';
        ctx.stroke();
        // Y Axis (Green, Up)
        ctx.beginPath();
        ctx.moveTo(o0.px, o0.py);
        ctx.lineTo(oy.px, oy.py);
        ctx.strokeStyle = '#10b981';
        ctx.stroke();
        // Z Axis (Blue, Forward)
        ctx.beginPath();
        ctx.moveTo(o0.px, o0.py);
        ctx.lineTo(oz.px, oz.py);
        ctx.strokeStyle = '#00e5ff';
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px monospace';
        ctx.fillText('{W} ORIGIN', o0.px + 6, o0.py + 12);

        // 3. Dynamic 3D Target Coordinates (Flying Drone / Moving SKU)
        const t3x = isManualTarget
          ? (manualMousePos.current ? (manualMousePos.current.x - width / 2) * 0.8 : 80)
          : Math.sin(time * 0.0015) * 160;
        const t3y = 90 + Math.sin(time * 0.002) * 35; // 3D altitude above ground
        const t3z = Math.cos(time * 0.0018) * 130;

        // 4. Dynamic 3D Camera Pose (PBVS Servoing Controller)
        const c3x = cameraEndEffectorRef.current.x;
        const c3y = cameraEndEffectorRef.current.y;
        const c3z = -180; // Camera located in negative Z looking into workspace

        const error3D_X = t3x - c3x;
        const error3D_Y = t3y - c3y;
        const error3D_Z = t3z - (c3z + 240);
        const error3D_Dist = Math.hypot(error3D_X, error3D_Y, error3D_Z);

        if (isLocked) {
          const spd = controlGain * 4.5;
          cameraEndEffectorRef.current.x += (error3D_X / Math.max(1, error3D_Dist)) * Math.min(spd, error3D_Dist * 0.08);
          cameraEndEffectorRef.current.y += (error3D_Y / Math.max(1, error3D_Dist)) * Math.min(spd, error3D_Dist * 0.08);
        }

        const activeCamX = cameraEndEffectorRef.current.x;
        const activeCamY = cameraEndEffectorRef.current.y;
        const activeCamZ = c3z;

        // 5. Draw 3D Camera Body & Projected Frustum
        const camCenter = project3D(activeCamX, activeCamY, activeCamZ);
        // Frustum Far Plane corners
        const fDist = 180;
        const fW = 120;
        const fH = 80;
        const fcTL = project3D(activeCamX - fW, activeCamY + fH, activeCamZ + fDist);
        const fcTR = project3D(activeCamX + fW, activeCamY + fH, activeCamZ + fDist);
        const fcBR = project3D(activeCamX + fW, activeCamY - fH, activeCamZ + fDist);
        const fcBL = project3D(activeCamX - fW, activeCamY - fH, activeCamZ + fDist);

        // Draw Frustum Projection Rays
        ctx.strokeStyle = isDark ? 'rgba(0, 229, 255, 0.4)' : 'rgba(2, 132, 199, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);

        [fcTL, fcTR, fcBR, fcBL].forEach((fCorner) => {
          ctx.beginPath();
          ctx.moveTo(camCenter.px, camCenter.py);
          ctx.lineTo(fCorner.px, fCorner.py);
          ctx.stroke();
        });

        // Frustum Far Rect
        ctx.beginPath();
        ctx.moveTo(fcTL.px, fcTL.py);
        ctx.lineTo(fcTR.px, fcTR.py);
        ctx.lineTo(fcBR.px, fcBR.py);
        ctx.lineTo(fcBL.px, fcBL.py);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);

        // Camera Body Box
        ctx.fillStyle = isDark ? '#0f172a' : '#334155';
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(camCenter.px, camCenter.py, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText(`CAM_3D [X:${Math.round(activeCamX)}, Y:${Math.round(activeCamY)}, Z:${Math.round(activeCamZ)}]`, camCenter.px - 60, camCenter.py - 22);

        // 6. Draw 3D Target Shadow on Ground
        const targetShadow = project3D(t3x, 0, t3z);
        const target3D = project3D(t3x, t3y, t3z);

        // Vertical drop line to ground
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(target3D.px, target3D.py);
        ctx.lineTo(targetShadow.px, targetShadow.py);
        ctx.stroke();
        ctx.setLineDash([]);

        // Shadow ellipse on ground
        ctx.beginPath();
        ctx.ellipse(targetShadow.px, targetShadow.py, 22 * targetShadow.scale, 10 * targetShadow.scale, 0, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.45)' : 'rgba(15, 23, 42, 0.2)';
        ctx.fill();

        // 7. Draw 3D Target Drone / Prism
        const sz = 24 * target3D.scale;
        ctx.fillStyle = isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(5, 150, 105, 0.25)';
        ctx.strokeStyle = targetColor;
        ctx.lineWidth = 2;

        // Front Face
        ctx.strokeRect(target3D.px - sz, target3D.py - sz, sz * 2, sz * 2);
        ctx.fillRect(target3D.px - sz, target3D.py - sz, sz * 2, sz * 2);

        // Target 3D Orientation Triad
        ctx.lineWidth = 2;
        // Local Tx (red)
        ctx.beginPath();
        ctx.moveTo(target3D.px, target3D.py);
        ctx.lineTo(target3D.px + 28, target3D.py);
        ctx.strokeStyle = '#ef4444';
        ctx.stroke();
        // Local Ty (green)
        ctx.beginPath();
        ctx.moveTo(target3D.px, target3D.py);
        ctx.lineTo(target3D.px, target3D.py - 28);
        ctx.strokeStyle = '#10b981';
        ctx.stroke();
        // Local Tz (blue)
        ctx.beginPath();
        ctx.moveTo(target3D.px, target3D.py);
        ctx.lineTo(target3D.px - 20, target3D.py + 18);
        ctx.strokeStyle = '#00e5ff';
        ctx.stroke();

        ctx.fillStyle = targetColor;
        ctx.font = '10px monospace';
        ctx.fillText(`3D_TARGET_POSE [X:${Math.round(t3x)}, Y:${Math.round(t3y)}, Z:${Math.round(t3z)}]`, target3D.px - 70, target3D.py - sz - 10);
        ctx.fillText(`ALT: ${(t3y / 100).toFixed(2)}m`, target3D.px - 30, targetShadow.py - 6);

        // 8. 3D Task-Space Cartesian Error Vector (Camera to Target)
        ctx.beginPath();
        ctx.moveTo(camCenter.px, camCenter.py);
        ctx.lineTo(target3D.px, target3D.py);
        ctx.strokeStyle = alertColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // PBVS 3D Telemetry update
        if (frameCount % 15 === 0) {
          const vx = (error3D_X * controlGain * 0.008).toFixed(3);
          const vy = (error3D_Y * controlGain * 0.008).toFixed(3);
          const vz = (error3D_Z * controlGain * 0.008).toFixed(3);

          setVssTelemetry({
            errorNorm: Number((error3D_Dist / 100).toFixed(3)),
            velocityVector: `[${vx}, ${vy}, ${vz}] m/s`,
            jacobianRank: 6,
            fps: Math.round(1 / Math.max(0.001, delta)),
            trackingConfidence: Number((99.1 + (1 / (1 + error3D_Dist * 0.01)) * 0.8).toFixed(1)),
          });
        }
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
