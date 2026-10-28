"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '@/components/Common/ThemeProvider';
import { Cpu, Zap, Activity, Box, Layers, RotateCw } from 'lucide-react';
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
  const webglHostRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();

  const [viewMode, setViewMode] = useState<'2d-eda' | '3d-model'>('2d-eda');
  const [activeChip, setActiveChip] = useState<string>('Pixhawk 6X Autopilot');
  const [liveFreq, setLiveFreq] = useState<number>(480);
  const [isRotating, setIsRotating] = useState(true);

  // Three.js References for 3D PCB View
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const boardGroupRef = useRef<THREE.Group | null>(null);
  const animFrame3DRef = useRef<number | null>(null);

  const targetRotation = useRef({ x: 0.45, y: -0.35 });
  const currentRotation = useRef({ x: 0.45, y: -0.35 });
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  const chips = [
    { name: 'Pixhawk 6X Autopilot', role: 'Flight Dynamics & EKF', clock: '480 MHz', voltage: '5.0V', state: 'ARMED' },
    { name: 'ESP32-S3 Dual-Core', role: 'Telemetry & WiFi BLE', clock: '240 MHz', voltage: '3.3V', state: 'ONLINE' },
    { name: 'Arduino Mega 2560', role: 'BLDC Actuator Subsystem', clock: '16 MHz', voltage: '5.0V', state: 'ACTIVE' },
    { name: 'NVIDIA Jetson TX2', role: 'Edge Deep Learning & SLAM', clock: '1.3 GHz', voltage: '12V', state: 'INFERENCE' },
  ];

  // ========================================================
  // 1. 2D EDA Canvas Routing & Traces Engine
  // ========================================================
  useEffect(() => {
    if (viewMode !== '2d-eda') return;

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
    const traceBaseColor = isDark ? 'rgba(0, 229, 255, 0.22)' : 'rgba(2, 132, 199, 0.25)';
    const tracePulseColor = isDark ? '#00e5ff' : '#0284c7';
    const goldColor = isDark ? '#f59e0b' : '#d97706';
    const diffPairColor = isDark ? '#10b981' : '#059669';

    // Defined authentic EDA IC footprint nodes
    const ic1 = { x: width * 0.25, y: height * 0.42, w: 90, h: 90, label: 'U1 [STM32H7 / PIXHAWK]' };
    const ic2 = { x: width * 0.72, y: height * 0.45, w: 105, h: 105, label: 'U2 [JETSON TX2 / SOC]' };
    const ic3 = { x: width * 0.48, y: height * 0.78, w: 70, h: 70, label: 'U3 [ESP32-S3 TELEMETRY]' };

    // 45-degree chamfered copper traces connecting chips
    const traces: { x1: number; y1: number; x2: number; y2: number; isDiff?: boolean }[] = [
      // Bus lines between IC1 and IC2
      { x1: ic1.x + 45, y1: ic1.y - 20, x2: ic1.x + 120, y2: ic1.y - 20 },
      { x1: ic1.x + 120, y1: ic1.y - 20, x2: ic1.x + 160, y2: ic1.y + 20 },
      { x1: ic1.x + 160, y1: ic1.y + 20, x2: ic2.x - 52, y2: ic1.y + 20 },

      // High-speed differential pair (clock + data)
      { x1: ic1.x + 45, y1: ic1.y + 5, x2: ic1.x + 130, y2: ic1.y + 5, isDiff: true },
      { x1: ic1.x + 130, y1: ic1.y + 5, x2: ic1.x + 170, y2: ic1.y + 45, isDiff: true },
      { x1: ic1.x + 170, y1: ic1.y + 45, x2: ic2.x - 52, y2: ic1.y + 45, isDiff: true },

      { x1: ic1.x + 45, y1: ic1.y + 15, x2: ic1.x + 126, y2: ic1.y + 15, isDiff: true },
      { x1: ic1.x + 126, y1: ic1.y + 15, x2: ic1.x + 166, y2: ic1.y + 55, isDiff: true },
      { x1: ic1.x + 166, y1: ic1.y + 55, x2: ic2.x - 52, y2: ic1.y + 55, isDiff: true },

      // SPI & UART to ESP32
      { x1: ic1.x, y1: ic1.y + 45, x2: ic1.x, y2: ic3.y - 25 },
      { x1: ic1.x, y1: ic3.y - 25, x2: ic3.x - 35, y2: ic3.y - 25 },

      { x1: ic2.x, y1: ic2.y + 52, x2: ic2.x, y2: ic3.y },
      { x1: ic2.x, y1: ic3.y, x2: ic3.x + 35, y2: ic3.y },

      // Power rails & decoupling capacitor traces
      { x1: ic1.x - 45, y1: ic1.y - 15, x2: ic1.x - 90, y2: ic1.y - 15 },
      { x1: ic1.x - 90, y1: ic1.y - 15, x2: ic1.x - 120, y2: ic1.y + 15 },
      { x1: ic2.x + 52, y1: ic2.y - 30, x2: ic2.x + 95, y2: ic2.y - 30 },
      { x1: ic2.x + 95, y1: ic2.y - 30, x2: ic2.x + 120, y2: ic2.y - 5 },
    ];

    // SMT Vias with annular rings
    const vias = [
      { x: ic1.x + 120, y: ic1.y - 20 },
      { x: ic1.x + 160, y: ic1.y + 20 },
      { x: ic1.x + 130, y: ic1.y + 5 },
      { x: ic1.x + 170, y: ic1.y + 45 },
      { x: ic1.x, y: ic3.y - 25 },
      { x: ic2.x, y: ic3.y },
      { x: ic1.x - 90, y: ic1.y - 15 },
      { x: ic2.x + 95, y: ic2.y - 30 },
    ];

    // Animated High-Speed Signal Pulses
    const pulses: Pulse[] = [];
    for (let i = 0; i < 16; i++) {
      const trace = traces[Math.floor(Math.random() * traces.length)];
      pulses.push({
        x: trace.x1,
        y: trace.y1,
        targetX: trace.x2,
        targetY: trace.y2,
        progress: Math.random(),
        speed: 0.008 + Math.random() * 0.015,
        color: trace.isDiff ? diffPairColor : tracePulseColor,
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

    const render2D = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. FR-4 Solder Mask Substrate Grid
      ctx.strokeStyle = isDark ? 'rgba(0, 229, 255, 0.04)' : 'rgba(2, 132, 199, 0.05)';
      ctx.lineWidth = 1;
      const step = 20;
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

      // 2. Copper Ground Pour Hatches
      ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(241, 245, 249, 0.65)';
      ctx.fillRect(20, 20, width - 40, height - 40);

      // 3. Draw 45-Degree Routed Copper Traces
      traces.forEach((t) => {
        ctx.beginPath();
        ctx.moveTo(t.x1, t.y1);
        ctx.lineTo(t.x2, t.y2);
        ctx.strokeStyle = t.isDiff ? diffPairColor : traceBaseColor;
        ctx.lineWidth = t.isDiff ? 2.5 : 2.0;
        ctx.stroke();
      });

      // 4. Draw Plated Through-Hole Vias (ENIG Gold Rings)
      vias.forEach((v) => {
        ctx.beginPath();
        ctx.arc(v.x, v.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = goldColor;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(v.x, v.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#090d16' : '#ffffff';
        ctx.fill();
      });

      // 5. Draw SMT Chip Footprints & Silkscreen Markings
      [ic1, ic2, ic3].forEach((ic) => {
        // Chip body
        ctx.fillStyle = isDark ? '#0f172a' : '#1e293b';
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 1.5;
        ctx.fillRect(ic.x - ic.w / 2, ic.y - ic.h / 2, ic.w, ic.h);
        ctx.strokeRect(ic.x - ic.w / 2, ic.y - ic.h / 2, ic.w, ic.h);

        // Pin 1 indicator dot
        ctx.beginPath();
        ctx.arc(ic.x - ic.w / 2 + 10, ic.y - ic.h / 2 + 10, 3, 0, Math.PI * 2);
        ctx.fillStyle = goldColor;
        ctx.fill();

        // Pin lead arrays around perimeter
        const pinCount = 8;
        ctx.fillStyle = goldColor;
        for (let i = 0; i < pinCount; i++) {
          const px = ic.x - ic.w / 2 + (i + 1) * (ic.w / (pinCount + 1));
          ctx.fillRect(px - 2, ic.y - ic.h / 2 - 6, 4, 6);
          ctx.fillRect(px - 2, ic.y + ic.h / 2, 4, 6);
        }

        // Silkscreen text
        ctx.fillStyle = '#ffffff';
        ctx.font = '9px monospace';
        ctx.fillText(ic.label, ic.x - ic.w / 2 + 6, ic.y);
      });

      // 6. Draw Animated Signal Pulses along traces
      pulses.forEach((p) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          const trace = traces[Math.floor(Math.random() * traces.length)];
          p.x = trace.x1;
          p.y = trace.y1;
          p.targetX = trace.x2;
          p.targetY = trace.y2;
          p.color = trace.isDiff ? diffPairColor : tracePulseColor;
        }

        const currX = p.x + (p.targetX - p.x) * p.progress;
        const currY = p.y + (p.targetY - p.y) * p.progress;

        ctx.beginPath();
        ctx.arc(currX, currY, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 7. Interactive Logic Probe Cursor
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 26, 0, Math.PI * 2);
      ctx.strokeStyle = primaryColor;
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = primaryColor;
      ctx.font = '10px monospace';
      ctx.fillText(`LOGIC_PROBE: 3.3V // 50Ω DIFF`, mouseX + 10, mouseY - 10);

      animId = requestAnimationFrame(render2D);
    };

    render2D();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [viewMode, resolvedTheme]);

  // ========================================================
  // 2. 3D WebGL Assembled Hardware PCB Model
  // ========================================================
  useEffect(() => {
    if (viewMode !== '3d-model') return;

    const host = webglHostRef.current;
    if (!host) return;

    const width = host.clientWidth || 800;
    const height = host.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 5, 8.5);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.innerHTML = '';
    host.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const isDark = resolvedTheme === 'dark';
    const primaryColor = isDark ? 0x00e5ff : 0x0284c7;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 1.0 : 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.8 : 2.2);
    dirLight.position.set(8, 14, 8);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const goldPointLight = new THREE.PointLight(0xf59e0b, 2.5, 12);
    goldPointLight.position.set(-2, 3, 2);
    scene.add(goldPointLight);

    // 3D PCB Assembly Group
    const boardGroup = new THREE.Group();
    boardGroupRef.current = boardGroup;

    // FR-4 Substrate Board (Matte Black Solder Mask)
    const fr4Mat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.35,
      roughness: 0.5,
    });
    const boardMesh = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.16, 4.4), fr4Mat);
    boardMesh.castShadow = true;
    boardMesh.receiveShadow = true;
    boardGroup.add(boardMesh);

    // 4 Corner Gold M3 Mounting Holes
    const holeGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.18, 16);
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    [
      [-2.8, 0, -1.8],
      [2.8, 0, -1.8],
      [-2.8, 0, 1.8],
      [2.8, 0, 1.8],
    ].forEach(([hx, hy, hz]) => {
      const ring = new THREE.Mesh(holeGeo, goldMat);
      ring.position.set(hx, hy, hz);
      boardGroup.add(ring);
    });

    // Main SoC Microcontroller (QFP-64 STM32 / Pixhawk)
    const qfpMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.3 });
    const qfpMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 1.6), qfpMat);
    qfpMesh.position.set(-1.2, 0.15, 0.2);
    boardGroup.add(qfpMesh);

    // QFP Pin Leads (Silver)
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
    const pinGeo = new THREE.BoxGeometry(0.08, 0.04, 0.25);
    for (let i = -0.65; i <= 0.65; i += 0.18) {
      const p1 = new THREE.Mesh(pinGeo, pinMat);
      p1.position.set(-1.2 + i, 0.1, -0.7);
      boardGroup.add(p1);

      const p2 = new THREE.Mesh(pinGeo, pinMat);
      p2.position.set(-1.2 + i, 0.1, 1.1);
      boardGroup.add(p2);
    }

    // High-Performance Jetson Processor BGA Package with Aluminum Heat Sink
    const sinkBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 1.8), fr4Mat);
    sinkBase.position.set(1.4, 0.14, -0.2);
    boardGroup.add(sinkBase);

    // Heatsink Anodized Fins
    const finMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.25 });
    for (let fz = -0.7; fz <= 0.7; fz += 0.2) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.35, 0.08), finMat);
      fin.position.set(1.4, 0.35, -0.2 + fz);
      boardGroup.add(fin);
    }

    // USB-C Metallic Receptacle Connector
    const usbcMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
    const usbcMesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.32, 0.7), usbcMat);
    usbcMesh.position.set(-2.7, 0.24, -1.2);
    boardGroup.add(usbcMesh);

    // 2x10 GPIO Gold Pin Header Strip
    for (let px = 0.4; px <= 2.2; px += 0.2) {
      for (let pz = 1.4; pz <= 1.6; pz += 0.2) {
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 8), goldMat);
        pin.position.set(px, 0.3, pz);
        boardGroup.add(pin);
      }
    }

    // SMT 0805 Capacitors & Status LEDs
    const smtCapMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
    const ledMat = new THREE.MeshBasicMaterial({ color: primaryColor });

    [
      [-0.1, 0.12, -1.1],
      [-0.1, 0.12, -0.8],
      [0.2, 0.12, -1.1],
      [-2.1, 0.12, 0.8],
      [-2.1, 0.12, 1.1],
    ].forEach(([cx, cy, cz]) => {
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.1), smtCapMat);
      cap.position.set(cx, cy, cz);
      boardGroup.add(cap);
    });

    // Glowing Power LED
    const pwrLed = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.12), ledMat);
    pwrLed.position.set(-2.8, 0.14, 0);
    boardGroup.add(pwrLed);

    scene.add(boardGroup);

    // Mouse Drag Orbiting
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      targetRotation.current.y += deltaX * 0.008;
      targetRotation.current.x = Math.max(-0.6, Math.min(1.2, targetRotation.current.x + deltaY * 0.008));

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const handleResize3D = () => {
      if (!host || !camera || !renderer) return;
      const newW = host.clientWidth;
      const newH = host.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize3D);

    const animate3D = () => {
      animFrame3DRef.current = requestAnimationFrame(animate3D);

      if (isRotating && !isDraggingRef.current) {
        targetRotation.current.y += 0.006;
      }

      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;

      const radius = 7.5;
      camera.position.x = radius * Math.sin(currentRotation.current.y) * Math.cos(currentRotation.current.x);
      camera.position.y = Math.max(1.0, radius * Math.sin(currentRotation.current.x) + 2.5);
      camera.position.z = radius * Math.cos(currentRotation.current.y) * Math.cos(currentRotation.current.x);
      camera.lookAt(0, 0.2, 0);

      renderer.render(scene, camera);
    };

    animate3D();

    return () => {
      if (animFrame3DRef.current) cancelAnimationFrame(animFrame3DRef.current);
      window.removeEventListener('resize', handleResize3D);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
      if (host) host.innerHTML = '';
    };
  }, [viewMode, isRotating, resolvedTheme]);

  // Live Bus frequency tick
  useEffect(() => {
    const freqInterval = setInterval(() => {
      setLiveFreq(480 + Math.floor(Math.random() * 8) - 4);
    }, 1200);
    return () => clearInterval(freqInterval);
  }, []);

  return (
    <div className={`glass-panel ${styles.boardCard}`} ref={containerRef}>
      {/* 2D EDA Canvas View */}
      {viewMode === '2d-eda' && <canvas ref={canvasRef} className={styles.canvas} />}

      {/* 3D Assembled WebGL Host */}
      {viewMode === '3d-model' && (
        <div
          ref={webglHostRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'grab' }}
        />
      )}

      {/* PCB Header Overlay */}
      <div className={styles.boardHeader}>
        <div className={styles.titleCol}>
          <div className={styles.badge}>
            <Zap size={14} className={styles.zapIcon} />
            <span>EMBEDDED HARDWARE ARCHITECTURE // ALTIUM &amp; KICAD</span>
          </div>
          <h3 className={styles.boardTitle}>High-Speed PCB Design, 3D Twin &amp; Signal Routing</h3>
        </div>

        <div className={styles.controlsGroup} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Mode Switcher Pill */}
          <div style={{ display: 'flex', background: 'var(--bg-glass-card)', backdropFilter: 'blur(10px)', border: '1px solid var(--border-subtle)', borderRadius: '9999px', padding: '3px', gap: '3px' }}>
            <button
              onClick={() => setViewMode('2d-eda')}
              style={{
                border: 'none',
                background: viewMode === '2d-eda' ? 'var(--accent-gradient)' : 'transparent',
                color: viewMode === '2d-eda' ? '#ffffff' : 'var(--text-secondary)',
                borderRadius: '9999px',
                padding: '5px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Layers size={13} />
              <span>2D Traces</span>
            </button>
            <button
              onClick={() => setViewMode('3d-model')}
              style={{
                border: 'none',
                background: viewMode === '3d-model' ? 'var(--accent-gradient)' : 'transparent',
                color: viewMode === '3d-model' ? '#ffffff' : 'var(--text-secondary)',
                borderRadius: '9999px',
                padding: '5px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Box size={13} />
              <span>3D Model</span>
            </button>
          </div>

          {viewMode === '3d-model' && (
            <button
              onClick={() => setIsRotating(!isRotating)}
              style={{
                background: isRotating ? 'var(--surface-muted)' : 'var(--bg-glass-card)',
                border: '1px solid var(--border-subtle)',
                color: isRotating ? 'var(--accent-primary)' : 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              title="Toggle 3D Orbit Turntable"
            >
              <RotateCw size={13} />
              <span>Orbit</span>
            </button>
          )}

          <div className={styles.freqBadge}>
            <Activity size={14} />
            <span>BUS CLK: {liveFreq} MHz</span>
          </div>
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
