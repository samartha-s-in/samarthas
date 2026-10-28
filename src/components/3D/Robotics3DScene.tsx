"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '@/components/Common/ThemeProvider';
import { Bot, Radio, Layers, RotateCw } from 'lucide-react';
import styles from './Robotics3DScene.module.css';

type ModelType = 'robot-arm' | 'drone';
type RenderMode = 'shaded' | 'wireframe';

export const Robotics3DScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();
  const [modelType, setModelType] = useState<ModelType>('robot-arm');
  const [renderMode, setRenderMode] = useState<RenderMode>('shaded');
  const [telemetry, setTelemetry] = useState({ yaw: 0, pitch: 0, jointAngle: 0, scanDist: 14.8 });

  // Refs for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sub-object refs for animation
  const armGroupRef = useRef<THREE.Group | null>(null);
  const droneGroupRef = useRef<THREE.Group | null>(null);
  const jointsRef = useRef<{ [key: string]: THREE.Object3D }>({});
  const rotorsRef = useRef<THREE.Mesh[]>([]);

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0.2, y: 0.5 });
  const currentRotation = useRef({ x: 0.2, y: 0.5 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 9);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const isDark = resolvedTheme === 'dark';
    const primaryColor = isDark ? 0x00e5ff : 0x0284c7;
    const accentColor = isDark ? 0x3b82f6 : 0x2563eb;
    const metalDark = isDark ? 0x111827 : 0x334155;
    const metalLight = isDark ? 0x1f2937 : 0x64748b;
    const gridColor = isDark ? 0x00e5ff : 0x0284c7;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.7 : 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.4 : 1.6);
    dirLight.position.set(6, 12, 8);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const cyanPointLight = new THREE.PointLight(primaryColor, 3, 20);
    cyanPointLight.position.set(-4, 3, 4);
    scene.add(cyanPointLight);

    const bluePointLight = new THREE.PointLight(accentColor, 2, 20);
    bluePointLight.position.set(4, 5, -3);
    scene.add(bluePointLight);

    // 5. Ground Holographic Grid
    const gridHelper = new THREE.GridHelper(16, 24, gridColor, isDark ? 0x1e293b : 0xcbd5e1);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Holographic radar circles
    const ringGeo = new THREE.RingGeometry(2.5, 2.54, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: primaryColor, side: THREE.DoubleSide, transparent: true, opacity: isDark ? 0.4 : 0.25 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.02;
    scene.add(ringMesh);

    const outerRingGeo = new THREE.RingGeometry(4.8, 4.85, 64);
    const outerRingMesh = new THREE.Mesh(outerRingGeo, ringMat);
    outerRingMesh.rotation.x = -Math.PI / 2;
    outerRingMesh.position.y = 0.02;
    scene.add(outerRingMesh);

    // ==========================================
    // 6. BUILD MODEL A: Articulated 6-DOF Robotic Arm
    // ==========================================
    const armGroup = new THREE.Group();
    armGroupRef.current = armGroup;

    const baseMat = new THREE.MeshStandardMaterial({
      color: metalDark,
      metalness: 0.85,
      roughness: 0.25,
      wireframe: renderMode === 'wireframe',
    });

    const jointMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      metalness: 0.9,
      roughness: 0.2,
      emissive: isDark ? primaryColor : 0x000000,
      emissiveIntensity: isDark ? 0.35 : 0.0,
      wireframe: renderMode === 'wireframe',
    });

    const limbMat = new THREE.MeshStandardMaterial({
      color: metalLight,
      metalness: 0.7,
      roughness: 0.35,
      wireframe: renderMode === 'wireframe',
    });

    // Base Pedestal
    const baseGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.4, 32);
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.2;
    armGroup.add(baseMesh);

    // Swivel Turntable
    const swivelGroup = new THREE.Group();
    swivelGroup.position.y = 0.4;
    armGroup.add(swivelGroup);
    jointsRef.current['swivel'] = swivelGroup;

    const turretGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.6, 24);
    const turretMesh = new THREE.Mesh(turretGeo, baseMat);
    turretMesh.position.y = 0.3;
    swivelGroup.add(turretMesh);

    // Shoulder Joint
    const shoulderGroup = new THREE.Group();
    shoulderGroup.position.set(0, 0.6, 0);
    swivelGroup.add(shoulderGroup);
    jointsRef.current['shoulder'] = shoulderGroup;

    const shoulderJointGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.9, 20);
    const shoulderJointMesh = new THREE.Mesh(shoulderJointGeo, jointMat);
    shoulderJointMesh.rotation.z = Math.PI / 2;
    shoulderGroup.add(shoulderJointMesh);

    // Upper Arm
    const upperArmGeo = new THREE.BoxGeometry(0.4, 1.8, 0.4);
    const upperArmMesh = new THREE.Mesh(upperArmGeo, limbMat);
    upperArmMesh.position.set(0, 0.9, 0);
    shoulderGroup.add(upperArmMesh);

    // Elbow Joint
    const elbowGroup = new THREE.Group();
    elbowGroup.position.set(0, 1.8, 0);
    shoulderGroup.add(elbowGroup);
    jointsRef.current['elbow'] = elbowGroup;

    const elbowJointGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.7, 18);
    const elbowJointMesh = new THREE.Mesh(elbowJointGeo, jointMat);
    elbowJointMesh.rotation.z = Math.PI / 2;
    elbowGroup.add(elbowJointMesh);

    // Forearm
    const forearmGeo = new THREE.BoxGeometry(0.32, 1.6, 0.32);
    const forearmMesh = new THREE.Mesh(forearmGeo, limbMat);
    forearmMesh.position.set(0, 0.8, 0);
    elbowGroup.add(forearmMesh);

    // Wrist Joint
    const wristGroup = new THREE.Group();
    wristGroup.position.set(0, 1.6, 0);
    elbowGroup.add(wristGroup);
    jointsRef.current['wrist'] = wristGroup;

    const wristJointGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const wristJointMesh = new THREE.Mesh(wristJointGeo, jointMat);
    wristGroup.add(wristJointMesh);

    // End-Effector Gripper Head
    const gripperBaseGeo = new THREE.BoxGeometry(0.45, 0.2, 0.3);
    const gripperBaseMesh = new THREE.Mesh(gripperBaseGeo, baseMat);
    gripperBaseMesh.position.y = 0.2;
    wristGroup.add(gripperBaseMesh);

    // Left Finger
    const fingerGeo = new THREE.BoxGeometry(0.08, 0.4, 0.1);
    const leftFinger = new THREE.Mesh(fingerGeo, jointMat);
    leftFinger.position.set(-0.16, 0.4, 0);
    wristGroup.add(leftFinger);

    // Right Finger
    const rightFinger = new THREE.Mesh(fingerGeo, jointMat);
    rightFinger.position.set(0.16, 0.4, 0);
    wristGroup.add(rightFinger);

    // Laser Telemetry Pointer
    const laserMat = new THREE.LineBasicMaterial({ color: 0xff0055, linewidth: 2 });
    const laserPoints = [new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0, 3.5, 0)];
    const laserGeo = new THREE.BufferGeometry().setFromPoints(laserPoints);
    const laserLine = new THREE.Line(laserGeo, laserMat);
    wristGroup.add(laserLine);

    scene.add(armGroup);

    // ==========================================
    // 7. BUILD MODEL B: Autonomous Pixhawk Quadcopter Drone
    // ==========================================
    const droneGroup = new THREE.Group();
    droneGroupRef.current = droneGroup;
    droneGroup.position.set(0, 2.2, 0);

    // Carbon Fiber Weave Material & Metal Accents
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.6,
      roughness: 0.35,
    });
    const orangeMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      metalness: 0.8,
      roughness: 0.2,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.15,
    });

    // Lower & Upper Carbon Fiber Chassis Decks
    const lowerDeck = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 1.4), carbonMat);
    lowerDeck.position.y = -0.08;
    lowerDeck.castShadow = true;
    droneGroup.add(lowerDeck);

    const upperDeck = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 1.2), carbonMat);
    upperDeck.position.y = 0.12;
    upperDeck.castShadow = true;
    droneGroup.add(upperDeck);

    // Deck Standoffs (4 pillars)
    const standoffGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8);
    [
      [-0.45, 0.02, -0.45],
      [0.45, 0.02, -0.45],
      [-0.45, 0.02, 0.45],
      [0.45, 0.02, 0.45],
    ].forEach(([sx, sy, sz]) => {
      const standoff = new THREE.Mesh(standoffGeo, goldMat);
      standoff.position.set(sx, sy, sz);
      droneGroup.add(standoff);
    });

    // Center Pixhawk 6X Autopilot Flight Controller Case
    const pixhawkCase = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.7), orangeMat);
    pixhawkCase.position.set(0, 0.22, 0);
    pixhawkCase.castShadow = true;
    droneGroup.add(pixhawkCase);

    // Pixhawk Status RGB LED
    const statusLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 12, 12),
      new THREE.MeshBasicMaterial({ color: primaryColor })
    );
    statusLed.position.set(0, 0.32, 0.15);
    droneGroup.add(statusLed);

    // GPS Mast & Antenna Puck
    const gpsMast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 8), carbonMat);
    gpsMast.position.set(-0.35, 0.42, -0.35);
    droneGroup.add(gpsMast);

    const gpsPuck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.07, 16), jointMat);
    gpsPuck.position.set(-0.35, 0.72, -0.35);
    droneGroup.add(gpsPuck);

    // Rotating Planar LiDAR on Top
    const lidarMount = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16), baseMat);
    lidarMount.position.set(0, 0.36, -0.15);
    droneGroup.add(lidarMount);

    const lidarCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: primaryColor, emissive: primaryColor, emissiveIntensity: 0.6 })
    );
    lidarCap.position.set(0, 0.46, -0.15);
    droneGroup.add(lidarCap);
    jointsRef.current['lidar'] = lidarCap;

    // Downward Optical Flow & LiDAR Altitude Sensor
    const flowSensor = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.2), jointMat);
    flowSensor.position.set(0, -0.14, 0);
    droneGroup.add(flowSensor);

    // Downward Telemetry Laser Beam
    const downBeamMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.6 });
    const downBeamGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -0.14, 0),
      new THREE.Vector3(0, -2.2, 0),
    ]);
    const downBeam = new THREE.Line(downBeamGeo, downBeamMat);
    droneGroup.add(downBeam);

    // 4 Carbon Quadcopter Arms (450mm cross airframe)
    const armGeo = new THREE.CylinderGeometry(0.065, 0.065, 1.8, 12);
    const armPositions = [
      { x: 1, z: 1, rot: Math.PI / 4, isFront: true },
      { x: -1, z: 1, rot: -Math.PI / 4, isFront: true },
      { x: 1, z: -1, rot: -Math.PI / 4, isFront: false },
      { x: -1, z: -1, rot: Math.PI / 4, isFront: false },
    ];

    rotorsRef.current = [];

    armPositions.forEach((pos) => {
      // Carbon arm tube
      const armM = new THREE.Mesh(armGeo, carbonMat);
      armM.rotation.z = Math.PI / 2;
      armM.rotation.y = pos.rot;
      armM.position.set(pos.x * 0.62, 0.02, pos.z * 0.62);
      armM.castShadow = true;
      droneGroup.add(armM);

      // Motor Mount Plate
      const mountPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 16), carbonMat);
      mountPlate.position.set(pos.x * 1.25, 0.04, pos.z * 1.25);
      droneGroup.add(mountPlate);

      // BLDC Brushless Motor Stator & Bell
      const motorStator = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 16), jointMat);
      motorStator.position.set(pos.x * 1.25, 0.12, pos.z * 1.25);
      droneGroup.add(motorStator);

      const motorBell = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.1, 16), orangeMat);
      motorBell.position.set(pos.x * 1.25, 0.22, pos.z * 1.25);
      droneGroup.add(motorBell);

      // Navigation LED Strobe (Green Front, Red Rear)
      const ledColor = pos.isFront ? 0x10b981 : 0xef4444;
      const navLed = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        new THREE.MeshBasicMaterial({ color: ledColor })
      );
      navLed.position.set(pos.x * 1.25, -0.02, pos.z * 1.25);
      droneGroup.add(navLed);

      // Aerodynamic Propeller Blades (10-inch)
      const propGroup = new THREE.Group();
      propGroup.position.set(pos.x * 1.25, 0.3, pos.z * 1.25);

      const bladeGeo = new THREE.BoxGeometry(1.4, 0.02, 0.14);
      const blade1 = new THREE.Mesh(bladeGeo, carbonMat);
      propGroup.add(blade1);

      // Prop nut
      const nut = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.08, 8), goldMat);
      nut.position.y = 0.05;
      propGroup.add(nut);

      droneGroup.add(propGroup);
      rotorsRef.current.push(propGroup);
    });

    // Dual Carbon Landing Skids
    const skidTubeGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.8, 8);
    const strutLegGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8);

    [-0.65, 0.65].forEach((sx) => {
      // Horizontal ground skid
      const skid = new THREE.Mesh(skidTubeGeo, carbonMat);
      skid.rotation.x = Math.PI / 2;
      skid.position.set(sx, -0.65, 0);
      skid.castShadow = true;
      droneGroup.add(skid);

      // Angled vertical struts
      [-0.45, 0.45].forEach((sz) => {
        const strut = new THREE.Mesh(strutLegGeo, carbonMat);
        strut.position.set(sx * 0.75, -0.35, sz);
        strut.rotation.z = sx > 0 ? -0.25 : 0.25;
        droneGroup.add(strut);
      });
    });

    // ADD DRONE GROUP TO SCENE (Fixed visibility!)
    scene.add(droneGroup);

    // Initial visibility sync
    armGroup.visible = modelType === 'robot-arm';
    droneGroup.visible = modelType === 'drone';

    // 8. Mouse Drag & Orbit Interaction
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      targetRotation.current.y += deltaX * 0.008;
      targetRotation.current.x = Math.max(-0.4, Math.min(1.1, targetRotation.current.x + deltaY * 0.008));

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Handle Resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera orbit interpolation
      if (!isDraggingRef.current) {
        targetRotation.current.y += 0.004; // Gentle auto spin
      }

      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;

      const radius = 9;
      camera.position.x = radius * Math.sin(currentRotation.current.y) * Math.cos(currentRotation.current.x);
      camera.position.y = Math.max(1.2, radius * Math.sin(currentRotation.current.x) + 3);
      camera.position.z = radius * Math.cos(currentRotation.current.y) * Math.cos(currentRotation.current.x);
      camera.lookAt(0, 1.4, 0);

      // Model A: Kinematic Arm Animation
      if (jointsRef.current['swivel']) {
        jointsRef.current['swivel'].rotation.y = Math.sin(elapsedTime * 0.8) * 0.8;
      }
      if (jointsRef.current['shoulder']) {
        jointsRef.current['shoulder'].rotation.z = Math.sin(elapsedTime * 1.2) * 0.35 + 0.2;
      }
      if (jointsRef.current['elbow']) {
        jointsRef.current['elbow'].rotation.z = Math.cos(elapsedTime * 1.4) * 0.45 - 0.4;
      }
      if (jointsRef.current['wrist']) {
        jointsRef.current['wrist'].rotation.x = Math.sin(elapsedTime * 2) * 0.6;
      }

      // Model B: Drone Rotor Spin & Flight Dynamics
      if (droneGroupRef.current) {
        droneGroupRef.current.position.y = 2.2 + Math.sin(elapsedTime * 2.5) * 0.18; // Hover bob
        droneGroupRef.current.rotation.z = Math.sin(elapsedTime * 1.5) * 0.04;
        droneGroupRef.current.rotation.x = Math.cos(elapsedTime * 1.8) * 0.04;
      }

      rotorsRef.current.forEach((r, idx) => {
        r.rotation.y += (idx % 2 === 0 ? 1 : -1) * 0.55;
      });

      if (jointsRef.current['lidar']) {
        jointsRef.current['lidar'].rotation.y += 0.08;
      }

      // Live Telemetry Readout
      setTelemetry({
        yaw: Number((currentRotation.current.y * (180 / Math.PI) % 360).toFixed(1)),
        pitch: Number((currentRotation.current.x * (180 / Math.PI)).toFixed(1)),
        jointAngle: Number((Math.sin(elapsedTime * 1.2) * 35).toFixed(1)),
        scanDist: Number((12.5 + Math.sin(elapsedTime * 3) * 2.3).toFixed(2)),
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  // Handle Model Switching
  useEffect(() => {
    if (armGroupRef.current) armGroupRef.current.visible = modelType === 'robot-arm';
    if (droneGroupRef.current) droneGroupRef.current.visible = modelType === 'drone';
  }, [modelType]);

  // Handle Wireframe / CATIA CAD Mode
  useEffect(() => {
    if (!sceneRef.current) return;
    const isWire = renderMode === 'wireframe';
    sceneRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => (m.wireframe = isWire));
        } else {
          child.material.wireframe = isWire;
        }
      }
    });
  }, [renderMode]);

  return (
    <div className={styles.sceneContainer}>
      {/* Three.js Canvas Host */}
      <div ref={containerRef} className={styles.canvasArea} />

      {/* Top Floating HUD Controls */}
      <div className={styles.hudOverlay}>
        <div className={styles.hudHeader}>
          <div className={styles.statusIndicator}>
            <span className="pulse-dot" />
            <span className={styles.hudTitle}>3D REAL-TIME DIGITAL TWIN</span>
          </div>

          <div className={styles.controlsGroup}>
            {/* Model Selector */}
            <div className={styles.pillToggle}>
              <button
                className={`${styles.pillBtn} ${modelType === 'robot-arm' ? styles.activePill : ''}`}
                onClick={() => setModelType('robot-arm')}
              >
                <Bot size={13} />
                <span>6-DOF Arm</span>
              </button>
              <button
                className={`${styles.pillBtn} ${modelType === 'drone' ? styles.activePill : ''}`}
                onClick={() => setModelType('drone')}
              >
                <Radio size={13} />
                <span>Pixhawk Drone</span>
              </button>
            </div>

            {/* Wireframe / Shaded CAD Toggle */}
            <button
              className={`${styles.cadInspectBtn} ${renderMode === 'wireframe' ? styles.cadActive : ''}`}
              onClick={() => setRenderMode(renderMode === 'shaded' ? 'wireframe' : 'shaded')}
              title="Toggle CATIA CAD Wireframe Blueprint Mode"
            >
              <Layers size={13} />
              <span>{renderMode === 'shaded' ? 'CATIA Wireframe' : 'Render Shaded'}</span>
            </button>
          </div>
        </div>

        {/* Live Telemetry Stream Bar */}
        <div className={styles.telemetryFooter}>
          <div className={styles.telItem}>
            <span className={styles.telKey}>ORBIT YAW</span>
            <span className={styles.telVal}>{telemetry.yaw}°</span>
          </div>
          <div className={styles.telItem}>
            <span className={styles.telKey}>PITCH</span>
            <span className={styles.telVal}>{telemetry.pitch}°</span>
          </div>
          <div className={styles.telItem}>
            <span className={styles.telKey}>KINEMATIC THETA</span>
            <span className={styles.telVal}>{telemetry.jointAngle}°</span>
          </div>
          <div className={styles.telItem}>
            <span className={styles.telKey}>LIDAR ECHO</span>
            <span className={styles.telVal}>{telemetry.scanDist} m</span>
          </div>
          <div className={styles.telHint}>
            <RotateCw size={12} />
            <span>Click &amp; Drag to Orbit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Robotics3DScene;
