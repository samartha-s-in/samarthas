"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '@/components/Common/ThemeProvider';
import { Play, RotateCcw, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './RobotScrollPath.module.css';

interface Waypoint {
  id: string;
  name: string;
  title: string;
  tagline: string;
  position: 'left' | 'right';
  progress: number;
  badge: string;
  specs: string[];
  tech: string[];
}

const WAYPOINTS: Waypoint[] = [
  {
    id: 'wp1',
    name: 'WAYPOINT 01 // AUTONOMOUS FLIGHT',
    title: 'PX4 & MAVROS Autonomous Drone Architecture',
    tagline: 'Companion computer autonomy on Pixhawk 450mm quadcopters with GPS-denied LiDAR altitude fusion.',
    position: 'right',
    progress: 0.15,
    badge: 'MAVROS / PX4',
    specs: [
      'Real-time EKF2 state estimation and planar LiDAR fusion',
      'Companion SBC linked via 921,600 baud UART serial telemetry',
      'Custom carbon-fiber airframe with dynamic PID flight control',
    ],
    tech: ['ROS 2', 'PX4 Autopilot', 'MAVROS', 'Planar LiDAR', 'C++'],
  },
  {
    id: 'wp2',
    name: 'WAYPOINT 02 // NEURAL VISION',
    title: 'Automated SKU Recognition & Expiry OCR',
    tagline: 'Edge deep learning vision system for warehouse automation, reaching national finals at Flipkart GRID 6.0.',
    position: 'left',
    progress: 0.48,
    badge: 'AI & CV',
    specs: [
      '99.4% SKU item classification under variable warehouse lighting',
      'Automated expiration date & MRP contour text extraction',
      'Low-latency inference pipeline deployed on NVIDIA Jetson edge SBCs',
    ],
    tech: ['TensorFlow', 'OpenCV', 'YOLOv8', 'Python', 'Jetson TX2'],
  },
  {
    id: 'wp3',
    name: 'WAYPOINT 03 // PUBLISHED ROBOTICS',
    title: 'RoboGleam Dual-Arm Floor Sanitization AMR',
    tagline: 'Dual articulated robotic cleaning system published in IEEE ICCCNT 2024 conference proceedings.',
    position: 'right',
    progress: 0.78,
    badge: 'IEEE ICCCNT 2024',
    specs: [
      'High-torque BLDC drivetrain with dual articulated mopping arms',
      'Arduino Mega 2560 control harness with BLE mobile app telemetry',
      'Custom kinematics drafted in Autodesk Fusion 360 & CATIA',
    ],
    tech: ['Arduino Mega', 'BLDC Actuators', 'CATIA V5', 'BLE Telemetry'],
  },
  {
    id: 'wp4',
    name: 'WAYPOINT 04 // DOCKING STATION',
    title: 'ROS 2 Nav2 & Cartographer SLAM Stack',
    tagline: 'Industrial autonomous mobile robot navigation with dynamic costmap inflation and sub-centimeter path routing.',
    position: 'left',
    progress: 1.0,
    badge: 'SLAM & Nav2',
    specs: [
      'Sub-centimeter 2D Cartographer LiDAR SLAM map construction',
      'Costmap inflation radius dynamically avoiding static & moving obstacles',
      'Integrated with micro-ROS on ESP32 distributed sensor nodes',
    ],
    tech: ['ROS 2 Jazzy', 'Nav2', 'Cartographer', 'micro-ROS', 'ESP32'],
  },
];

export const RobotScrollPath: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();

  // Scroll / drive progress (0.0 to 1.0)
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStation, setActiveStation] = useState(0);
  const [isAutoDriving, setIsAutoDriving] = useState(false);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const robotGroupRef = useRef<THREE.Group | null>(null);
  const wheelAxlesRef = useRef<THREE.Group[]>([]);
  const lidarTurretRef = useRef<THREE.Mesh | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Smooth progress interpolation target
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);

  // Define 3D Spline Navigation Path (S-Curve)
  const curvePoints = [
    new THREE.Vector3(-6, 0, 10),
    new THREE.Vector3(-2, 0, 4),
    new THREE.Vector3(3, 0, 0),
    new THREE.Vector3(-2, 0, -5),
    new THREE.Vector3(5, 0, -10),
    new THREE.Vector3(0, 0, -15),
  ];
  const splineRef = useRef(new THREE.CatmullRomCurve3(curvePoints));

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;

    const width = host.clientWidth;
    const height = host.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 10, 14);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.innerHTML = '';
    host.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const isDark = resolvedTheme === 'dark';
    const primaryColor = isDark ? 0x00e5ff : 0x0284c7;
    const secondaryColor = isDark ? 0x8b5cf6 : 0x6366f1;
    const metalDark = isDark ? 0x0f172a : 0x334155;
    const metalAccent = isDark ? 0x1e293b : 0x64748b;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.8 : 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.5 : 1.8);
    dirLight.position.set(8, 16, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const cyanGlowLight = new THREE.PointLight(primaryColor, 3, 20);
    cyanGlowLight.position.set(0, 2, 0);
    scene.add(cyanGlowLight);

    // 5. Floor Grid
    const grid = new THREE.GridHelper(36, 36, primaryColor, isDark ? 0x1e293b : 0xcbd5e1);
    grid.position.y = -0.01;
    scene.add(grid);

    // 6. Draw Spline Glowing Navigation Track
    const splinePoints = splineRef.current.getPoints(80);
    const pathGeometry = new THREE.BufferGeometry().setFromPoints(splinePoints);
    const pathMaterial = new THREE.LineBasicMaterial({ color: primaryColor, linewidth: 3 });
    const pathLine = new THREE.Line(pathGeometry, pathMaterial);
    pathLine.position.y = 0.05;
    scene.add(pathLine);

    // Add Waypoint Station Pillars on the 3D ground
    WAYPOINTS.forEach((wp) => {
      const pt = splineRef.current.getPointAt(wp.progress);
      // Outer ring
      const ringGeo = new THREE.RingGeometry(0.8, 0.9, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: secondaryColor, side: THREE.DoubleSide });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(pt.x, 0.06, pt.z);
      scene.add(ringMesh);

      // Vertical beacon line
      const beaconMat = new THREE.LineBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.7 });
      const beaconGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(pt.x, 0.06, pt.z),
        new THREE.Vector3(pt.x, 2.5, pt.z),
      ]);
      const beaconLine = new THREE.Line(beaconGeo, beaconMat);
      scene.add(beaconLine);
    });

    // 7. BUILD 3D AUTONOMOUS MOBILE ROBOT (AMR / Rover)
    const robotGroup = new THREE.Group();
    robotGroupRef.current = robotGroup;

    // Chassis Base
    const chassisGeo = new THREE.BoxGeometry(1.6, 0.45, 2.2);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: metalDark,
      metalness: 0.85,
      roughness: 0.25,
    });
    const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
    chassisMesh.position.y = 0.45;
    chassisMesh.castShadow = true;
    robotGroup.add(chassisMesh);

    // Upper Shell / Avionics Bay
    const upperGeo = new THREE.BoxGeometry(1.2, 0.35, 1.6);
    const upperMat = new THREE.MeshStandardMaterial({
      color: metalAccent,
      metalness: 0.7,
      roughness: 0.3,
    });
    const upperMesh = new THREE.Mesh(upperGeo, upperMat);
    upperMesh.position.y = 0.8;
    upperMesh.castShadow = true;
    robotGroup.add(upperMesh);

    // Spinning LiDAR Turret Dome
    const lidarBaseGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.25, 20);
    const lidarMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9 });
    const lidarBase = new THREE.Mesh(lidarBaseGeo, lidarMat);
    lidarBase.position.y = 1.05;
    robotGroup.add(lidarBase);

    const lidarCapGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.15, 16);
    const lidarCapMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      emissive: primaryColor,
      emissiveIntensity: 0.8,
    });
    const lidarCap = new THREE.Mesh(lidarCapGeo, lidarCapMat);
    lidarCap.position.y = 1.2;
    robotGroup.add(lidarCap);
    lidarTurretRef.current = lidarCap;

    // Simulate the Ray of Light of LiDAR (360° fan of laser beams)
    const rayCount = 48;
    const rayVertices: number[] = [];
    const rayColors: number[] = [];
    const pRGB = new THREE.Color(primaryColor);
    const emeraldRGB = new THREE.Color(0x10b981);

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      rayVertices.push(0, 0.02, 0);
      const range = 4.0 + Math.sin(angle * 4) * 1.2 + Math.cos(angle * 2) * 0.8;
      rayVertices.push(Math.sin(angle) * range, 0.02, Math.cos(angle) * range);
      rayColors.push(pRGB.r, pRGB.g, pRGB.b);
      rayColors.push(emeraldRGB.r, emeraldRGB.g, emeraldRGB.b);
    }
    const rayGeo = new THREE.BufferGeometry();
    rayGeo.setAttribute('position', new THREE.Float32BufferAttribute(rayVertices, 3));
    rayGeo.setAttribute('color', new THREE.Float32BufferAttribute(rayColors, 3));
    const rayMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const lidarRays = new THREE.LineSegments(rayGeo, rayMat);
    lidarCap.add(lidarRays);

    // Volumetric Glowing Light Fan Sweeping with LiDAR
    const fanGeo = new THREE.RingGeometry(0.3, 4.8, 36, 1);
    const fanMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const lidarFan = new THREE.Mesh(fanGeo, fanMat);
    lidarFan.rotation.x = -Math.PI / 2;
    lidarCap.add(lidarFan);

    // 4 Drive Wheels mounted on independent rotating axles
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 20);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: metalDark,
      roughness: 0.8,
      metalness: 0.4,
    });
    const wheelPositions: [number, number, number][] = [
      [-0.95, 0.35, 0.7],
      [0.95, 0.35, 0.7],
      [-0.95, 0.35, -0.7],
      [0.95, 0.35, -0.7],
    ];

    wheelAxlesRef.current = [];
    wheelPositions.forEach(([x, y, z]) => {
      const axle = new THREE.Group();
      axle.position.set(x, y, z);

      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      axle.add(wheel);

      // Wheel Rim Hubcap Accent
      const rimGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.27, 16);
      const rimMat = new THREE.MeshStandardMaterial({
        color: primaryColor,
        metalness: 0.85,
        roughness: 0.2,
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;
      axle.add(rim);

      robotGroup.add(axle);
      wheelAxlesRef.current.push(axle);
    });

    // Dual Forward LED Headlights (placed at +Z front)
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const hlLeft = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), lightMat);
    hlLeft.position.set(-0.45, 0.5, 1.12);
    const hlRight = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), lightMat);
    hlRight.position.set(0.45, 0.5, 1.12);
    robotGroup.add(hlLeft);
    robotGroup.add(hlRight);

    // Front Headlight Beam (SpotLight shining forward along +Z)
    const headBeam = new THREE.SpotLight(0xffffff, 4, 12, Math.PI / 6, 0.4);
    headBeam.position.set(0, 0.6, 1.2);
    const targetObj = new THREE.Object3D();
    targetObj.position.set(0, 0, 8);
    robotGroup.add(targetObj);
    headBeam.target = targetObj;
    robotGroup.add(headBeam);

    // Initial positioning at current progress (or 0)
    const initProgress = currentProgressRef.current || 0;
    const startPt = splineRef.current.getPointAt(initProgress);
    const startTangent = splineRef.current.getTangentAt(initProgress).normalize();
    robotGroup.position.set(startPt.x, 0, startPt.z);
    robotGroup.rotation.set(0, Math.atan2(startTangent.x, startTangent.z), 0);
    scene.add(robotGroup);

    // Handle Window Resize
    const handleResize = () => {
      if (!host) return;
      const w = host.clientWidth;
      const h = host.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    let downTime = 0;
    let downX = 0;
    let downY = 0;

    const handleCanvasPointerDown = (e: MouseEvent) => {
      downTime = Date.now();
      downX = e.clientX;
      downY = e.clientY;
    };

    const handleCanvasPointerUp = (e: MouseEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) < 6 && Date.now() - downTime < 350) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseVec, camera);
        const hit = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(groundPlane, hit)) {
          let closestProgress = 0;
          let minDist = 9999;
          for (let sp = 0; sp <= 1.0; sp += 0.02) {
            const pt = splineRef.current.getPointAt(sp);
            const d = Math.hypot(pt.x - hit.x, pt.z - hit.z);
            if (d < minDist) {
              minDist = d;
              closestProgress = sp;
            }
          }
          targetProgressRef.current = closestProgress;
          setScrollProgress(closestProgress);
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleCanvasPointerDown);
    domElement.addEventListener('mouseup', handleCanvasPointerUp);

    // Animation Loop
    let lastP = initProgress;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Smooth interpolation to target progress
      currentProgressRef.current += (targetProgressRef.current - currentProgressRef.current) * 0.08;
      const p = Math.max(0.0001, Math.min(0.9999, currentProgressRef.current));

      const deltaP = p - lastP;
      lastP = p;

      // Update Robot Position on Spline
      const pos = splineRef.current.getPointAt(p);
      const tangent = splineRef.current.getTangentAt(p).normalize();

      if (robotGroupRef.current) {
        robotGroupRef.current.position.set(pos.x, 0, pos.z);

        // Robot is modeled facing local +Z.
        // Heading angle on ground plane X-Z (tangent.x, tangent.z):
        const headingAngle = Math.atan2(tangent.x, tangent.z);

        // Strictly set yaw (Y) and enforce 0 pitch (X) and 0 roll (Z) so robot is always 100% upright
        robotGroupRef.current.rotation.set(0, headingAngle, 0);
      }

      // Rotate wheels forward along axle with velocity
      wheelAxlesRef.current.forEach((axle) => {
        axle.rotation.x += deltaP * 50;
      });

      // Spin LiDAR Turret
      if (lidarTurretRef.current) {
        lidarTurretRef.current.rotation.y += 0.06;
      }

      // Dynamic Camera follow behind and above robot
      if (cameraRef.current) {
        cameraRef.current.position.x = pos.x * 0.4;
        cameraRef.current.position.z = pos.z + 12;
        cameraRef.current.position.y = 8;
        cameraRef.current.lookAt(pos.x, 1, pos.z);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', handleCanvasPointerDown);
      domElement.removeEventListener('mouseup', handleCanvasPointerUp);
      renderer.dispose();
      if (host) host.innerHTML = '';
    };
  }, [resolvedTheme]);

  // Decoupled from window scroll: page scrolling will not advance or change stages.
  // Navigation between stations is explicitly controlled via station selector pills,
  // the AUTO-DRIVE simulation toggle, the scrubber slider, or direct clicks on the 3D track.

  // Jump smoothly to a specific waypoint
  const jumpToWaypoint = (idx: number) => {
    if (idx < 0 || idx >= WAYPOINTS.length) return;
    setActiveStation(idx);
    targetProgressRef.current = WAYPOINTS[idx].progress;
    setScrollProgress(WAYPOINTS[idx].progress);
  };

  // Auto-drive simulation timer that pauses at each station
  useEffect(() => {
    if (!isAutoDriving) return;
    let stationTimer: NodeJS.Timeout | null = null;
    let currentIdx = activeStation;

    const driveNext = () => {
      const nextIdx = (currentIdx + 1) % WAYPOINTS.length;
      currentIdx = nextIdx;
      jumpToWaypoint(nextIdx);

      // Pause for 4 seconds at this station so user can review the card
      stationTimer = setTimeout(driveNext, 4200);
    };

    stationTimer = setTimeout(driveNext, 3800);

    return () => {
      if (stationTimer) clearTimeout(stationTimer);
    };
  }, [isAutoDriving, activeStation]);

  const handleManualSeek = (val: number) => {
    targetProgressRef.current = val;
    setScrollProgress(val);
    let closestIdx = 0;
    let minDiff = 999;
    WAYPOINTS.forEach((wp, idx) => {
      const diff = Math.abs(val - wp.progress);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    setActiveStation(closestIdx);
  };

  const currentWp = WAYPOINTS[activeStation];
  const isRightSide = currentWp.position === 'right';

  return (
    <div className={styles.scrollSectionWrapper} ref={containerRef}>
      {/* Sticky 3D WebGL Viewport */}
      <div className={styles.stickyCanvasContainer}>
        <div ref={canvasHostRef} className={styles.webglCanvas} />

        {/* Top HUD Telemetry Ribbon & Waypoint Jump Tabs */}
        <div className={styles.hudHeader}>
          <div className={styles.statusBox}>
            <span className="pulse-dot" />
            <span className={styles.hudLabel}>AUTONOMOUS MOBILE ROBOT (AMR) // PATH TRACKING</span>
          </div>

          {/* Quick-Jump Station Selector Pills */}
          <div className={styles.stationPillsRow}>
            {WAYPOINTS.map((wp, idx) => (
              <button
                key={wp.id}
                onClick={() => jumpToWaypoint(idx)}
                className={`${styles.stationPillBtn} ${activeStation === idx ? styles.stationPillBtnActive : ''}`}
              >
                <span>{`0${idx + 1}`}</span>
                <span>{wp.badge}</span>
              </button>
            ))}
          </div>

          <div className={styles.controlsBar}>
            <button
              onClick={() => setIsAutoDriving(!isAutoDriving)}
              className={`${styles.hudBtn} ${isAutoDriving ? styles.hudBtnActive : ''}`}
            >
              <Play size={13} />
              <span>{isAutoDriving ? 'PAUSE DRIVE' : 'AUTO-DRIVE'}</span>
            </button>
            <button
              onClick={() => jumpToWaypoint(0)}
              className={styles.hudBtn}
              title="Reset to Starting Station"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Holographic Dynamic Waypoint Card (Appears on Left or Right as Robot Stops) */}
        <div
          className={`${styles.hudCardContainer} ${isRightSide ? styles.dockRight : styles.dockLeft}`}
        >
          <div
            key={currentWp.id}
            className={`glass-panel ${styles.hologramCard} ${isRightSide ? styles.slideInRight : styles.slideInLeft}`}
          >
            {/* Holographic Laser Scanline */}
            <div className={styles.scanline} />

            {/* Tech Bracket Accents */}
            <span className={styles.cornerTL} />
            <span className={styles.cornerTR} />
            <span className={styles.cornerBL} />
            <span className={styles.cornerBR} />

            <div className={styles.cardStationHeader}>
              <span className={styles.stationName}>{currentWp.name}</span>
              <span className={styles.stationPill}>{currentWp.badge}</span>
            </div>

            {/* Active Sensor Waveform */}
            <div className={styles.telemetryWaveform} title="Simulated LiDAR Telemetry Signal">
              <span className={styles.waveBar} />
              <span className={styles.waveBar} />
              <span className={styles.waveBar} />
              <span className={styles.waveBar} />
              <span className={styles.waveBar} />
            </div>

            <h3 className={styles.cardTitle}>{currentWp.title}</h3>
            <p className={styles.cardTagline}>{currentWp.tagline}</p>

            <ul className={styles.specsList}>
              {currentWp.specs.map((spec, sIdx) => (
                <li key={sIdx}>
                  <CheckCircle2 size={14} className={styles.checkIcon} />
                  <span>{spec}</span>
                </li>
              ))}
            </ul>

            <div className={styles.techPillRow}>
              {currentWp.tech.map((t) => (
                <span key={t} className="tech-chip">
                  {t}
                </span>
              ))}
            </div>

            {/* Prev / Next Station Navigation Footer */}
            <div className={styles.cardNavFooter}>
              <button
                onClick={() => jumpToWaypoint(activeStation - 1)}
                disabled={activeStation === 0}
                className={styles.cardNavBtn}
              >
                <ChevronLeft size={14} />
                <span>Prev Station</span>
              </button>

              <button
                onClick={() => jumpToWaypoint(activeStation + 1)}
                disabled={activeStation === WAYPOINTS.length - 1}
                className={styles.cardNavBtn}
              >
                <span>Next Station</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Interactive Scrubber Slider */}
        <div className={styles.scrubberBar}>
          <div className={styles.scrubberInfo}>
            <span className={styles.scrubberText}>
              MISSION PROGRESS: {Math.round(scrollProgress * 100)}% // {currentWp.name}
            </span>
            <span className={styles.stationBadge}>
              {currentWp.badge}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.005"
            value={scrollProgress}
            onChange={(e) => handleManualSeek(parseFloat(e.target.value))}
            className={styles.seekSlider}
          />
        </div>
      </div>
    </div>
  );
};

export default RobotScrollPath;
