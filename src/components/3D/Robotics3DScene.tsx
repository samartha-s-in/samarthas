"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '@/components/Common/ThemeProvider';
import { Bot, Radio, Layers, RotateCw, Navigation, Crosshair, MapPin } from 'lucide-react';
import styles from './Robotics3DScene.module.css';

type ModelType = 'robot-arm' | 'drone' | 'amr-nav2';
type RenderMode = 'shaded' | 'wireframe';

interface Nav2Waypoint {
  id: string;
  name: string;
  x: number;
  z: number;
}

const PRESET_WAYPOINTS: Nav2Waypoint[] = [
  { id: 'bay-a', name: 'Bay A: Assembly', x: -3.8, z: -2.6 },
  { id: 'bay-b', name: 'Bay B: Sorting', x: 3.6, z: -2.4 },
  { id: 'bay-c', name: 'Bay C: Charging Dock', x: -3.4, z: 3.2 },
  { id: 'bay-d', name: 'Bay D: QC Inspection', x: 3.8, z: 2.8 },
];

export const Robotics3DScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();
  const [modelType, setModelType] = useState<ModelType>('amr-nav2');
  const [renderMode, setRenderMode] = useState<RenderMode>('shaded');
  const [telemetry, setTelemetry] = useState({ yaw: 0, pitch: 0, jointAngle: 0, scanDist: 14.8 });
  const [nav2Telemetry, setNav2Telemetry] = useState({
    status: 'NAV2 READY [CLICK ANYWHERE ON GRID]',
    targetX: 0,
    targetZ: 0,
    posX: 0,
    posZ: 0,
    linearVel: 0,
    angularVel: 0,
    headingDeg: 0,
  });
  const [activeWpId, setActiveWpId] = useState<string | null>(null);

  // Refs for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sub-object refs for animation
  const armGroupRef = useRef<THREE.Group | null>(null);
  const droneGroupRef = useRef<THREE.Group | null>(null);
  const amrGroupRef = useRef<THREE.Group | null>(null);
  const amrWheelsRef = useRef<THREE.Group[]>([]);
  const amrLidarTurretRef = useRef<THREE.Mesh | null>(null);
  const amrLidarRaysRef = useRef<THREE.LineSegments | null>(null);
  const amrLidarFanRef = useRef<THREE.Mesh | null>(null);
  const nav2GoalMarkerRef = useRef<THREE.Group | null>(null);
  const nav2PathLineRef = useRef<THREE.Line | null>(null);

  const jointsRef = useRef<{ [key: string]: THREE.Object3D }>({});
  const rotorsRef = useRef<THREE.Group[]>([]);

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const mouseDownPos = useRef({ x: 0, y: 0 });
  const mouseDownTime = useRef(0);
  const targetRotation = useRef({ x: 0.35, y: 0.45 });
  const currentRotation = useRef({ x: 0.35, y: 0.45 });

  // Nav2 Autonomous Kinematics State Ref
  const nav2StateRef = useRef({
    currentPos: new THREE.Vector3(0, 0, 0),
    targetPos: new THREE.Vector3(2.5, 0, -2.5),
    heading: 0, // Radians
    linearVel: 0,
    angularVel: 0,
    isNavigating: false,
    status: 'NAV2 READY [CLICK GRID]',
  });

  // Helper: Normalize angle to [-PI, PI]
  const normalizeAngle = (ang: number) => {
    let a = ang % (Math.PI * 2);
    if (a > Math.PI) a -= Math.PI * 2;
    if (a < -Math.PI) a += Math.PI * 2;
    return a;
  };

  // Dispatch Nav2 Goal
  const dispatchNav2Goal = (x: number, z: number, wpId: string | null = null) => {
    const clampedX = Math.max(-6.5, Math.min(6.5, x));
    const clampedZ = Math.max(-6.5, Math.min(6.5, z));

    nav2StateRef.current.targetPos.set(clampedX, 0, clampedZ);
    nav2StateRef.current.isNavigating = true;
    nav2StateRef.current.status = 'NAV2_PLANNING';
    setActiveWpId(wpId);

    // Update 3D Goal Marker
    if (nav2GoalMarkerRef.current) {
      nav2GoalMarkerRef.current.position.set(clampedX, 0, clampedZ);
      nav2GoalMarkerRef.current.visible = true;
    }

    // Update Path Line
    if (nav2PathLineRef.current && amrGroupRef.current) {
      const positions = new Float32Array([
        amrGroupRef.current.position.x, 0.08, amrGroupRef.current.position.z,
        clampedX, 0.08, clampedZ,
      ]);
      nav2PathLineRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      nav2PathLineRef.current.geometry.attributes.position.needsUpdate = true;
      nav2PathLineRef.current.visible = true;
    }
  };

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
    camera.position.set(0, 7.5, 12);
    camera.lookAt(0, 0.5, 0);
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
    const emeraldColor = isDark ? 0x10b981 : 0x059669;
    const metalDark = isDark ? 0x111827 : 0x334155;
    const metalLight = isDark ? 0x1f2937 : 0x64748b;
    const gridColor = isDark ? 0x00e5ff : 0x0284c7;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.8 : 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.6 : 1.8);
    dirLight.position.set(8, 16, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const cyanPointLight = new THREE.PointLight(primaryColor, 3, 22);
    cyanPointLight.position.set(-4, 4, 4);
    scene.add(cyanPointLight);

    const bluePointLight = new THREE.PointLight(accentColor, 2, 22);
    bluePointLight.position.set(4, 5, -3);
    scene.add(bluePointLight);

    // 5. Ground Holographic Grid & Navigation Boundary
    const gridHelper = new THREE.GridHelper(16, 24, gridColor, isDark ? 0x1e293b : 0xcbd5e1);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Holographic radar circles
    const ringGeo = new THREE.RingGeometry(2.5, 2.54, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: primaryColor, side: THREE.DoubleSide, transparent: true, opacity: isDark ? 0.35 : 0.2 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.02;
    scene.add(ringMesh);

    const outerRingGeo = new THREE.RingGeometry(5.8, 5.85, 64);
    const outerRingMesh = new THREE.Mesh(outerRingGeo, ringMat);
    outerRingMesh.rotation.x = -Math.PI / 2;
    outerRingMesh.position.y = 0.02;
    scene.add(outerRingMesh);

    // Virtual Obstacles (Warehouse Pillars / Pallets) for LiDAR Ray reflections
    const obstacleMat = new THREE.MeshStandardMaterial({
      color: metalDark,
      metalness: 0.8,
      roughness: 0.3,
    });
    const obstacles: THREE.Mesh[] = [
      new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.8), obstacleMat),
      new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.8), obstacleMat),
      new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.4, 16), obstacleMat),
      new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.4, 16), obstacleMat),
    ];
    obstacles[0].position.set(-2.2, 0.6, -2.0);
    obstacles[1].position.set(2.2, 0.6, -2.0);
    obstacles[2].position.set(-2.5, 0.7, 2.2);
    obstacles[3].position.set(2.5, 0.7, 2.2);
    obstacles.forEach((ob) => {
      ob.castShadow = true;
      ob.receiveShadow = true;
      scene.add(ob);
    });

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

    const baseGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.4, 32);
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.2;
    armGroup.add(baseMesh);

    const swivelGroup = new THREE.Group();
    swivelGroup.position.y = 0.4;
    armGroup.add(swivelGroup);
    jointsRef.current['swivel'] = swivelGroup;

    const turretGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.6, 24);
    const turretMesh = new THREE.Mesh(turretGeo, baseMat);
    turretMesh.position.y = 0.3;
    swivelGroup.add(turretMesh);

    const shoulderGroup = new THREE.Group();
    shoulderGroup.position.set(0, 0.6, 0);
    swivelGroup.add(shoulderGroup);
    jointsRef.current['shoulder'] = shoulderGroup;

    const shoulderJointGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.9, 20);
    const shoulderJointMesh = new THREE.Mesh(shoulderJointGeo, jointMat);
    shoulderJointMesh.rotation.z = Math.PI / 2;
    shoulderGroup.add(shoulderJointMesh);

    const upperArmGeo = new THREE.BoxGeometry(0.4, 1.8, 0.4);
    const upperArmMesh = new THREE.Mesh(upperArmGeo, limbMat);
    upperArmMesh.position.set(0, 0.9, 0);
    shoulderGroup.add(upperArmMesh);

    const elbowGroup = new THREE.Group();
    elbowGroup.position.set(0, 1.8, 0);
    shoulderGroup.add(elbowGroup);
    jointsRef.current['elbow'] = elbowGroup;

    const elbowJointGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.7, 18);
    const elbowJointMesh = new THREE.Mesh(elbowJointGeo, jointMat);
    elbowJointMesh.rotation.z = Math.PI / 2;
    elbowGroup.add(elbowJointMesh);

    const forearmGeo = new THREE.BoxGeometry(0.32, 1.6, 0.32);
    const forearmMesh = new THREE.Mesh(forearmGeo, limbMat);
    forearmMesh.position.set(0, 0.8, 0);
    elbowGroup.add(forearmMesh);

    const wristGroup = new THREE.Group();
    wristGroup.position.set(0, 1.6, 0);
    elbowGroup.add(wristGroup);
    jointsRef.current['wrist'] = wristGroup;

    const wristJointGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const wristJointMesh = new THREE.Mesh(wristJointGeo, jointMat);
    wristGroup.add(wristJointMesh);

    const gripperBaseGeo = new THREE.BoxGeometry(0.45, 0.2, 0.3);
    const gripperBaseMesh = new THREE.Mesh(gripperBaseGeo, baseMat);
    gripperBaseMesh.position.y = 0.2;
    wristGroup.add(gripperBaseMesh);

    const fingerGeo = new THREE.BoxGeometry(0.08, 0.4, 0.1);
    const leftFinger = new THREE.Mesh(fingerGeo, jointMat);
    leftFinger.position.set(-0.16, 0.4, 0);
    wristGroup.add(leftFinger);

    const rightFinger = new THREE.Mesh(fingerGeo, jointMat);
    rightFinger.position.set(0.16, 0.4, 0);
    wristGroup.add(rightFinger);

    scene.add(armGroup);

    // ==========================================
    // 7. BUILD MODEL B: Autonomous Pixhawk Drone
    // ==========================================
    const droneGroup = new THREE.Group();
    droneGroupRef.current = droneGroup;
    droneGroup.position.set(0, 2.2, 0);

    const carbonMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.6, roughness: 0.35 });
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.8, roughness: 0.2 });

    const lowerDeck = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 1.4), carbonMat);
    lowerDeck.position.y = -0.08;
    droneGroup.add(lowerDeck);

    const upperDeck = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 1.2), carbonMat);
    upperDeck.position.y = 0.12;
    droneGroup.add(upperDeck);

    const pixhawkCase = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.7), orangeMat);
    pixhawkCase.position.set(0, 0.22, 0);
    droneGroup.add(pixhawkCase);

    const armGeo = new THREE.CylinderGeometry(0.065, 0.065, 1.8, 12);
    const armPositions = [
      { x: 1, z: 1, rot: Math.PI / 4 },
      { x: -1, z: 1, rot: -Math.PI / 4 },
      { x: 1, z: -1, rot: -Math.PI / 4 },
      { x: -1, z: -1, rot: Math.PI / 4 },
    ];

    rotorsRef.current = [];
    armPositions.forEach((pos) => {
      const armM = new THREE.Mesh(armGeo, carbonMat);
      armM.rotation.z = Math.PI / 2;
      armM.rotation.y = pos.rot;
      armM.position.set(pos.x * 0.62, 0.02, pos.z * 0.62);
      droneGroup.add(armM);

      const propGroup = new THREE.Group();
      propGroup.position.set(pos.x * 1.25, 0.3, pos.z * 1.25);
      const blade1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 0.14), carbonMat);
      propGroup.add(blade1);
      droneGroup.add(propGroup);
      rotorsRef.current.push(propGroup);
    });

    scene.add(droneGroup);

    // ==========================================
    // 8. BUILD MODEL C: AUTONOMOUS MOBILE ROBOT (AMR) WITH NAV2 & LIDAR
    // ==========================================
    const amrGroup = new THREE.Group();
    amrGroupRef.current = amrGroup;
    amrGroup.position.set(0, 0, 0);

    // AMR Lower Chassis (Industrial AGV style with chamfered bumpers)
    const amrChassisMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.25,
      wireframe: renderMode === 'wireframe',
    });
    const amrChassis = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 2.4), amrChassisMat);
    amrChassis.position.y = 0.42;
    amrChassis.castShadow = true;
    amrGroup.add(amrChassis);

    // Safety Hazard Stripes on Sides
    const hazardMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
    [-0.91, 0.91].forEach((hx) => {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 2.0), hazardMat);
      stripe.position.set(hx, 0.42, 0);
      amrGroup.add(stripe);
    });

    // Upper Avionics / Battery Shell
    const upperAvionics = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.32, 1.7),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
    );
    upperAvionics.position.y = 0.78;
    upperAvionics.castShadow = true;
    amrGroup.add(upperAvionics);

    // Emergency Stop Button
    const estop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 })
    );
    estop.position.set(0.45, 0.98, -0.6);
    amrGroup.add(estop);

    // Dual Forward LED Headlights
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const hlL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), ledMat);
    hlL.position.set(-0.55, 0.45, 1.22);
    const hlR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), ledMat);
    hlR.position.set(0.55, 0.45, 1.22);
    amrGroup.add(hlL);
    amrGroup.add(hlR);

    // Forward SpotLight illuminating floor ahead
    const amrSpotLight = new THREE.SpotLight(0xffffff, 3.5, 12, Math.PI / 5, 0.5);
    amrSpotLight.position.set(0, 0.5, 1.2);
    const spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, 0, 6);
    amrGroup.add(spotTarget);
    amrSpotLight.target = spotTarget;
    amrGroup.add(amrSpotLight);

    // 4 High-Traction Drive Wheels on Axles
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85 });
    const rimMat = new THREE.MeshStandardMaterial({ color: primaryColor, metalness: 0.9, roughness: 0.2 });
    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.24, 20);
    const rimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.26, 16);

    const wheelOffsets: [number, number, number][] = [
      [-1.02, 0.36, 0.75],
      [1.02, 0.36, 0.75],
      [-1.02, 0.36, -0.75],
      [1.02, 0.36, -0.75],
    ];

    amrWheelsRef.current = [];
    wheelOffsets.forEach(([wx, wy, wz]) => {
      const axle = new THREE.Group();
      axle.position.set(wx, wy, wz);

      const wheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
      wheelMesh.rotation.z = Math.PI / 2;
      wheelMesh.castShadow = true;
      axle.add(wheelMesh);

      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.rotation.z = Math.PI / 2;
      axle.add(rimMesh);

      amrGroup.add(axle);
      amrWheelsRef.current.push(axle);
    });

    // Elevated LiDAR Mast
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.35, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
    );
    mast.position.set(0, 1.05, 0.1);
    amrGroup.add(mast);

    // Spinning LiDAR Turret Dome (Velodyne / Hokuyo)
    const lidarTurret = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.22, 24),
      new THREE.MeshStandardMaterial({
        color: 0x090d16,
        metalness: 0.95,
        roughness: 0.1,
      })
    );
    lidarTurret.position.set(0, 1.25, 0.1);
    amrGroup.add(lidarTurret);
    amrLidarTurretRef.current = lidarTurret;

    // Glowing Laser Window Ring on Turret
    const laserBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.255, 0.255, 0.06, 24),
      new THREE.MeshBasicMaterial({ color: primaryColor })
    );
    laserBand.position.set(0, 1.25, 0.1);
    amrGroup.add(laserBand);

    // ========================================================
    // SIMULATE THE RAY OF LIGHT OF LIDAR (360° LASER BEAMS FAN)
    // ========================================================
    const rayCount = 64;
    const rayVertices: number[] = [];
    const rayColors: number[] = [];
    const primaryRGB = new THREE.Color(primaryColor);
    const emeraldRGB = new THREE.Color(emeraldColor);

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      // Ray start at LiDAR sensor origin
      rayVertices.push(0, 0.05, 0);

      // Distance variation simulating room scan
      const range = 4.2 + Math.sin(angle * 3) * 1.5 + Math.cos(angle * 5) * 0.8;
      const rx = Math.sin(angle) * range;
      const rz = Math.cos(angle) * range;
      rayVertices.push(rx, 0.02, rz);

      // Gradient colors
      rayColors.push(primaryRGB.r, primaryRGB.g, primaryRGB.b);
      rayColors.push(emeraldRGB.r, emeraldRGB.g, emeraldRGB.b);
    }

    const raysGeo = new THREE.BufferGeometry();
    raysGeo.setAttribute('position', new THREE.Float32BufferAttribute(rayVertices, 3));
    raysGeo.setAttribute('color', new THREE.Float32BufferAttribute(rayColors, 3));

    const raysMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const lidarRays = new THREE.LineSegments(raysGeo, raysMat);
    lidarRays.position.set(0, 1.25, 0.1);
    amrGroup.add(lidarRays);
    amrLidarRaysRef.current = lidarRays;

    // Volumetric Glowing Light Disc / Cone Sweeping with LiDAR
    const fanGeo = new THREE.RingGeometry(0.3, 5.5, 48, 1);
    const fanMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const lidarFan = new THREE.Mesh(fanGeo, fanMat);
    lidarFan.rotation.x = -Math.PI / 2;
    lidarFan.position.set(0, 1.24, 0.1);
    amrGroup.add(lidarFan);
    amrLidarFanRef.current = lidarFan;

    scene.add(amrGroup);

    // ==========================================
    // 9. BUILD NAV2 GOAL MARKER & TRAJECTORY LINE
    // ==========================================
    const goalMarkerGroup = new THREE.Group();
    nav2GoalMarkerRef.current = goalMarkerGroup;
    goalMarkerGroup.position.set(2.5, 0, -2.5);

    // Target Concentric Rings on Ground
    const goalRingInner = new THREE.Mesh(
      new THREE.RingGeometry(0.25, 0.35, 32),
      new THREE.MeshBasicMaterial({ color: emeraldColor, side: THREE.DoubleSide })
    );
    goalRingInner.rotation.x = -Math.PI / 2;
    goalRingInner.position.y = 0.04;
    goalMarkerGroup.add(goalRingInner);

    const goalRingOuter = new THREE.Mesh(
      new THREE.RingGeometry(0.75, 0.85, 32),
      new THREE.MeshBasicMaterial({ color: primaryColor, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
    );
    goalRingOuter.rotation.x = -Math.PI / 2;
    goalRingOuter.position.y = 0.04;
    goalMarkerGroup.add(goalRingOuter);

    // Vertical Holographic Beacon Beam (Ray of light pointing to sky)
    const beaconGeo = new THREE.CylinderGeometry(0.03, 0.03, 3.5, 12);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: emeraldColor,
      transparent: true,
      opacity: 0.65,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 1.75;
    goalMarkerGroup.add(beacon);

    // Nav2 Target Pin Head Cone
    const pinCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.45, 16),
      new THREE.MeshStandardMaterial({ color: emeraldColor, emissive: emeraldColor, emissiveIntensity: 0.6 })
    );
    pinCone.rotation.x = Math.PI;
    pinCone.position.y = 3.6;
    goalMarkerGroup.add(pinCone);

    scene.add(goalMarkerGroup);

    // Nav2 Planned Global Path Line (Green glowing spline)
    const pathInitPositions = new Float32Array([0, 0.06, 0, 2.5, 0.06, -2.5]);
    const pathGeo = new THREE.BufferGeometry();
    pathGeo.setAttribute('position', new THREE.BufferAttribute(pathInitPositions, 3));
    const pathMat = new THREE.LineBasicMaterial({ color: emeraldColor, linewidth: 3 });
    const pathLine = new THREE.Line(pathGeo, pathMat);
    scene.add(pathLine);
    nav2PathLineRef.current = pathLine;

    // Initial Model Visibility Sync
    armGroup.visible = modelType === 'robot-arm';
    droneGroup.visible = modelType === 'drone';
    amrGroup.visible = modelType === 'amr-nav2';
    goalMarkerGroup.visible = modelType === 'amr-nav2';
    pathLine.visible = modelType === 'amr-nav2';

    // ==========================================
    // 10. MOUSE INTERACTION & CLICK-TO-NAV2 RAYCASTER
    // ==========================================
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
      mouseDownPos.current = { x: e.clientX, y: e.clientY };
      mouseDownTime.current = Date.now();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      targetRotation.current.y += deltaX * 0.008;
      targetRotation.current.x = Math.max(-0.4, Math.min(1.1, targetRotation.current.x + deltaY * 0.008));

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = (e: MouseEvent) => {
      isDraggingRef.current = false;
      const distMoved = Math.hypot(e.clientX - mouseDownPos.current.x, e.clientY - mouseDownPos.current.y);
      const timeElapsed = Date.now() - mouseDownTime.current;

      // Click detected: user did not drag the camera
      if (distMoved < 6 && timeElapsed < 350) {
        const rect = domElement.getBoundingClientRect();
        mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouseVector, camera);
        const intersectPoint = new THREE.Vector3();
        const hit = raycaster.ray.intersectPlane(groundPlane, intersectPoint);

        if (hit) {
          dispatchNav2Goal(intersectPoint.x, intersectPoint.z, null);
        }
      }
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

    // ==========================================
    // 11. MAIN ANIMATION & NAV2 AUTONOMOUS LOOP
    // ==========================================
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera orbit
      if (!isDraggingRef.current) {
        targetRotation.current.y += 0.002;
      }
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;

      const radius = 10.5;
      camera.position.x = radius * Math.sin(currentRotation.current.y) * Math.cos(currentRotation.current.x);
      camera.position.y = Math.max(1.8, radius * Math.sin(currentRotation.current.x) + 3.8);
      camera.position.z = radius * Math.cos(currentRotation.current.y) * Math.cos(currentRotation.current.x);
      camera.lookAt(0, 0.8, 0);

      // Model A: Kinematic Arm
      if (jointsRef.current['swivel']) {
        jointsRef.current['swivel'].rotation.y = Math.sin(elapsedTime * 0.8) * 0.8;
      }
      if (jointsRef.current['shoulder']) {
        jointsRef.current['shoulder'].rotation.z = Math.sin(elapsedTime * 1.2) * 0.35 + 0.2;
      }
      if (jointsRef.current['elbow']) {
        jointsRef.current['elbow'].rotation.z = Math.cos(elapsedTime * 1.4) * 0.45 - 0.4;
      }

      // Model B: Drone
      if (droneGroupRef.current) {
        droneGroupRef.current.position.y = 2.2 + Math.sin(elapsedTime * 2.5) * 0.18;
      }
      rotorsRef.current.forEach((r, idx) => {
        r.rotation.y += (idx % 2 === 0 ? 1 : -1) * 0.55;
      });

      // Model C: AUTONOMOUS AMR NAV2 KINEMATICS ENGINE
      const amr = amrGroupRef.current;
      const nav = nav2StateRef.current;

      if (amr && modelType === 'amr-nav2') {
        // Spin LiDAR Turret dome & Light Rays
        if (amrLidarTurretRef.current) {
          amrLidarTurretRef.current.rotation.y += 0.12;
        }
        if (amrLidarRaysRef.current) {
          amrLidarRaysRef.current.rotation.y += 0.12;
        }
        if (amrLidarFanRef.current) {
          amrLidarFanRef.current.rotation.z -= 0.12;
        }

        // Pulse Nav2 Goal Rings
        if (nav2GoalMarkerRef.current) {
          const s = 1 + Math.sin(elapsedTime * 4) * 0.15;
          nav2GoalMarkerRef.current.scale.set(s, 1, s);
        }

        // Autonomous Navigation Execution
        if (nav.isNavigating) {
          const dx = nav.targetPos.x - amr.position.x;
          const dz = nav.targetPos.z - amr.position.z;
          const distToGoal = Math.hypot(dx, dz);

          if (distToGoal > 0.15) {
            // Target heading in ground X-Z (+Z is forward)
            const targetHeading = Math.atan2(dx, dz);
            const angleDiff = normalizeAngle(targetHeading - nav.heading);

            // Differential drive: rotate towards target
            nav.angularVel = Math.max(-2.2, Math.min(2.2, angleDiff * 3.2));
            nav.heading += nav.angularVel * 0.03;
            amr.rotation.y = nav.heading;

            // Move forward when roughly aligned with goal
            if (Math.abs(angleDiff) < 0.85) {
              nav.linearVel = Math.min(1.6, Math.max(0.25, distToGoal * 1.1));
              amr.position.x += Math.sin(nav.heading) * nav.linearVel * 0.03;
              amr.position.z += Math.cos(nav.heading) * nav.linearVel * 0.03;

              // Rotate wheels forward with velocity
              amrWheelsRef.current.forEach((axle) => {
                axle.rotation.x += nav.linearVel * 0.35;
              });
            } else {
              nav.linearVel = 0;
            }

            nav.status = `NAV2 NAVIGATING [DIST: ${distToGoal.toFixed(2)}m]`;

            // Update Dynamic Nav2 Path Line
            if (nav2PathLineRef.current) {
              const positions = new Float32Array([
                amr.position.x, 0.08, amr.position.z,
                nav.targetPos.x, 0.08, nav.targetPos.z,
              ]);
              nav2PathLineRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
              nav2PathLineRef.current.geometry.attributes.position.needsUpdate = true;
            }
          } else {
            // Arrived at destination
            nav.linearVel = 0;
            nav.angularVel = 0;
            nav.isNavigating = false;
            nav.status = `GOAL REACHED [TOLERANCE < 0.08m]`;
          }
        }

        // Live Nav2 Telemetry
        setNav2Telemetry({
          status: nav.status,
          targetX: Number(nav.targetPos.x.toFixed(2)),
          targetZ: Number(nav.targetPos.z.toFixed(2)),
          posX: Number(amr.position.x.toFixed(2)),
          posZ: Number(amr.position.z.toFixed(2)),
          linearVel: Number(nav.linearVel.toFixed(2)),
          angularVel: Number(nav.angularVel.toFixed(2)),
          headingDeg: Number(((nav.heading * (180 / Math.PI)) % 360).toFixed(1)),
        });
      }

      // General Telemetry
      setTelemetry({
        yaw: Number(((currentRotation.current.y * (180 / Math.PI)) % 360).toFixed(1)),
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

  // Handle Model Switching Visibility
  useEffect(() => {
    if (armGroupRef.current) armGroupRef.current.visible = modelType === 'robot-arm';
    if (droneGroupRef.current) droneGroupRef.current.visible = modelType === 'drone';
    if (amrGroupRef.current) amrGroupRef.current.visible = modelType === 'amr-nav2';
    if (nav2GoalMarkerRef.current) nav2GoalMarkerRef.current.visible = modelType === 'amr-nav2';
    if (nav2PathLineRef.current) nav2PathLineRef.current.visible = modelType === 'amr-nav2';
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
            <span className={styles.hudTitle}>
              {modelType === 'amr-nav2' ? 'NAV2 AUTONOMOUS AMR TWIN' : '3D REAL-TIME DIGITAL TWIN'}
            </span>
          </div>

          <div className={styles.controlsGroup}>
            {/* Model Selector Pill */}
            <div className={styles.pillToggle}>
              <button
                className={`${styles.pillBtn} ${modelType === 'amr-nav2' ? styles.activePill : ''}`}
                onClick={() => setModelType('amr-nav2')}
                title="Autonomous Mobile Robot with Nav2 Click-to-Drive & 360° LiDAR Rays"
              >
                <Navigation size={13} />
                <span>Nav2 AMR Rover</span>
              </button>
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

        {/* AMR Nav2 Click Instruction & Quick Dispatch Waypoints Banner */}
        {modelType === 'amr-nav2' && (
          <div className={styles.nav2InstructionBanner}>
            <div className={styles.nav2Prompt}>
              <Crosshair size={14} className="animate-spin" />
              <span>CLICK ANYWHERE ON 3D GROUND TO DISPATCH NAV2 GOAL:</span>
            </div>

            <div className={styles.nav2WpGroup}>
              {PRESET_WAYPOINTS.map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => dispatchNav2Goal(wp.x, wp.z, wp.id)}
                  className={`${styles.nav2WpBtn} ${activeWpId === wp.id ? styles.nav2WpBtnActive : ''}`}
                >
                  <MapPin size={11} />
                  <span>{wp.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Telemetry Stream Bar */}
        <div className={styles.telemetryFooter}>
          {modelType === 'amr-nav2' ? (
            <>
              <div className={styles.telItem}>
                <span className={styles.telKey}>NAV2 STATE</span>
                <span className={styles.telVal} style={{ color: 'var(--accent-emerald)' }}>
                  {nav2Telemetry.status}
                </span>
              </div>
              <div className={styles.telItem}>
                <span className={styles.telKey}>POSE (X, Z, YAW)</span>
                <span className={styles.telVal}>
                  [{nav2Telemetry.posX}m, {nav2Telemetry.posZ}m, {nav2Telemetry.headingDeg}°]
                </span>
              </div>
              <div className={styles.telItem}>
                <span className={styles.telKey}>NAV2 GOAL</span>
                <span className={styles.telVal}>
                  [{nav2Telemetry.targetX}m, {nav2Telemetry.targetZ}m]
                </span>
              </div>
              <div className={styles.telItem}>
                <span className={styles.telKey}>CMD_VEL (V, Ω)</span>
                <span className={styles.telVal}>
                  {nav2Telemetry.linearVel} m/s | {nav2Telemetry.angularVel} rad/s
                </span>
              </div>
              <div className={styles.telItem}>
                <span className={styles.telKey}>LIDAR SCAN</span>
                <span className={styles.telVal} style={{ color: 'var(--accent-primary)' }}>
                  360° RAYS ACTIVE @ 15Hz
                </span>
              </div>
            </>
          ) : (
            <>
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
                <span>Drag to Orbit / Click ground to navigate</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Robotics3DScene;
