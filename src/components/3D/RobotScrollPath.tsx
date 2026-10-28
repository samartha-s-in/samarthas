"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '@/components/Common/ThemeProvider';
import { Play, RotateCcw, CheckCircle2 } from 'lucide-react';
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
  const wheelsRef = useRef<THREE.Mesh[]>([]);
  const lidarTurretRef = useRef<THREE.Mesh | null>(null);
  const headlightBeamRef = useRef<THREE.SpotLight | null>(null);
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
    waypoints.forEach((wp) => {
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
    upperMesh.position.set(0, 0.75, -0.1);
    robotGroup.add(upperMesh);

    // 360° Rotating LiDAR Turret
    const lidarBaseGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.25, 20);
    const lidarMat = new THREE.MeshStandardMaterial({ color: primaryColor, emissive: primaryColor, emissiveIntensity: 0.4 });
    const lidarMesh = new THREE.Mesh(lidarBaseGeo, lidarMat);
    lidarMesh.position.set(0, 1.05, 0.2);
    robotGroup.add(lidarMesh);
    lidarTurretRef.current = lidarMesh;

    // Laser Ray Scanning Cone (Mesh)
    const laserConeGeo = new THREE.ConeGeometry(2.5, 5, 16, 1, true);
    const laserConeMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    const laserCone = new THREE.Mesh(laserConeGeo, laserConeMat);
    laserCone.rotation.x = Math.PI / 2;
    laserCone.position.set(0, 0, 2.6);
    lidarMesh.add(laserCone);

    // Front Headlights
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const headlightGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
    const leftLight = new THREE.Mesh(headlightGeo, headlightMat);
    leftLight.rotation.x = Math.PI / 2;
    leftLight.position.set(-0.55, 0.45, 1.12);
    robotGroup.add(leftLight);

    const rightLight = new THREE.Mesh(headlightGeo, headlightMat);
    rightLight.rotation.x = Math.PI / 2;
    rightLight.position.set(0.55, 0.45, 1.12);
    robotGroup.add(rightLight);

    // Spotlight beam
    const spot = new THREE.SpotLight(0xffffff, 4, 15, Math.PI / 6, 0.3);
    spot.position.set(0, 0.6, 1.1);
    spot.target.position.set(0, 0, 8);
    robotGroup.add(spot);
    robotGroup.add(spot.target);
    headlightBeamRef.current = spot;

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9, metalness: 0.2 });
    wheelsRef.current = [];

    const wheelPositions = [
      { x: -0.9, z: 0.7 },
      { x: 0.9, z: 0.7 },
      { x: -0.9, z: -0.7 },
      { x: 0.9, z: -0.7 },
    ];

    wheelPositions.forEach((wp) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wp.x, 0.38, wp.z);
      w.castShadow = true;
      robotGroup.add(w);
      wheelsRef.current.push(w);
    });

    scene.add(robotGroup);

    // Set initial position
    const initPos = splineRef.current.getPointAt(0);
    robotGroup.position.copy(initPos);

    // Handle Resize
    const handleResize = () => {
      if (!host || !camera || !renderer) return;
      const newW = host.clientWidth;
      const newH = host.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let lastP = 0;
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
        robotGroupRef.current.position.copy(pos);

        // Smooth orientation along path tangent
        const targetLook = pos.clone().add(tangent);
        robotGroupRef.current.lookAt(targetLook);

        // Slight acceleration tilt
        robotGroupRef.current.rotation.x = Math.max(-0.06, Math.min(0.06, deltaP * 12));
      }

      // Rotate wheels with velocity
      wheelsRef.current.forEach((w) => {
        w.rotation.x += deltaP * 40;
      });

      // Spin LiDAR Turret
      if (lidarTurretRef.current) {
        lidarTurretRef.current.rotation.y += 0.06;
      }

      // Dynamic Camera follow
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
      renderer.dispose();
      if (host) host.innerHTML = '';
    };
  }, [resolvedTheme]);

  // Listen to container scroll or manual scrubber
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalDist = rect.height - windowHeight;

      if (totalDist > 0) {
        const scrolled = Math.max(0, -rect.top);
        const progress = Math.min(1, Math.max(0, scrolled / totalDist));
        targetProgressRef.current = progress;
        setScrollProgress(progress);

        // Calculate active station index
        let closestIdx = 0;
        let minDiff = 999;
        WAYPOINTS.forEach((wp, idx) => {
          const diff = Math.abs(progress - wp.progress);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = idx;
          }
        });
        setActiveStation(closestIdx);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-drive simulation timer
  useEffect(() => {
    if (!isAutoDriving) return;
    const interval = setInterval(() => {
      targetProgressRef.current += 0.008;
      if (targetProgressRef.current >= 1) {
        targetProgressRef.current = 0;
      }
      setScrollProgress(targetProgressRef.current);
    }, 40);
    return () => clearInterval(interval);
  }, [isAutoDriving]);

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

  return (
    <div className={styles.scrollSectionWrapper} ref={containerRef}>
      {/* Sticky 3D WebGL Viewport */}
      <div className={styles.stickyCanvasContainer}>
        <div ref={canvasHostRef} className={styles.webglCanvas} />

        {/* Top HUD Telemetry Ribbon */}
        <div className={styles.hudHeader}>
          <div className={styles.statusBox}>
            <span className="pulse-dot" />
            <span className={styles.hudLabel}>AUTONOMOUS MOBILE ROBOT (AMR) // PATH TRACKING</span>
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
              onClick={() => handleManualSeek(0)}
              className={styles.hudBtn}
              title="Reset to Starting Station"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Interactive Scrubber Slider */}
        <div className={styles.scrubberBar}>
          <div className={styles.scrubberInfo}>
            <span className={styles.scrubberText}>
              MISSION PROGRESS: {Math.round(scrollProgress * 100)}%
            </span>
            <span className={styles.stationBadge}>
              {WAYPOINTS[activeStation].badge}
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

      {/* Floating Story Waypoint Cards that appear on Left / Right based on robot station */}
      <div className={styles.storyContentLayer}>
        {WAYPOINTS.map((wp, idx) => {
          const isCurrent = activeStation === idx;
          const isLeft = wp.position === 'left';

          return (
            <div
              key={wp.id}
              className={`${styles.storyWaypointRow} ${isLeft ? styles.rowLeft : styles.rowRight}`}
            >
              <div
                className={`glass-panel ${styles.waypointCard} ${isCurrent ? styles.activeCard : ''}`}
              >
                {/* Tech Bracket Accents */}
                <span className={styles.cornerTL} />
                <span className={styles.cornerTR} />
                <span className={styles.cornerBL} />
                <span className={styles.cornerBR} />

                <div className={styles.cardStationHeader}>
                  <span className={styles.stationName}>{wp.name}</span>
                  <span className={styles.stationPill}>{wp.badge}</span>
                </div>

                <h3 className={styles.cardTitle}>{wp.title}</h3>
                <p className={styles.cardTagline}>{wp.tagline}</p>

                <ul className={styles.specsList}>
                  {wp.specs.map((spec, sIdx) => (
                    <li key={sIdx}>
                      <CheckCircle2 size={14} className={styles.checkIcon} />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>

                <div className={styles.techPillRow}>
                  {wp.tech.map((t) => (
                    <span key={t} className="tech-chip">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RobotScrollPath;
