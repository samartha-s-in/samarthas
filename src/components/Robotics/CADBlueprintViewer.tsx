"use client";

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '@/components/Common/ThemeProvider';
import { Layers, Crosshair, RotateCw, Box, Flame, Compass } from 'lucide-react';
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

const CAD_MODELS: CADModelSpec[] = [
  {
    id: 'gslv',
    name: 'ISRO GSLV Mk II Shroud & Cryogenic Stage',
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
  {
    id: 'robogleam',
    name: 'RoboGleam Dual Articulated Arm & Sanitizer',
    software: 'Autodesk Fusion 360 Kinematics',
    tolerance: '± 0.05 mm',
    material: 'Aircraft 6061-T6 Aluminium & PLA-CF',
    mass: '1.85 kg',
    safetyFactor: '3.1x',
    dimX: 0.65,
    dimY: 0.42,
    dimZ: 0.28,
  },
];

export const CADBlueprintViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();

  const [selectedCAD, setSelectedCAD] = useState<string>('gslv');
  const [renderMode, setRenderMode] = useState<'solid' | 'wireframe' | 'fea'>('solid');
  const [isRotating, setIsRotating] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelsGroupRef = useRef<{ [key: string]: THREE.Group }>({});
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Rotation interaction
  const targetRotation = useRef({ x: 0.2, y: 0.6 });
  const currentRotation = useRef({ x: 0.2, y: 0.6 });
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  const activeSpec = CAD_MODELS.find((m) => m.id === selectedCAD) || CAD_MODELS[0];

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return;

    const width = host.clientWidth || 800;
    const height = host.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 9);
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
    const metalTitanium = isDark ? 0x334155 : 0x64748b;
    const goldAccent = 0xf59e0b;
    const carbonBlack = 0x0f172a;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.9 : 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.8 : 2.0);
    keyLight.position.set(10, 15, 10);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(primaryColor, 1.2);
    fillLight.position.set(-10, -5, -8);
    scene.add(fillLight);

    // 5. Technical CAD Ground Grid
    const grid = new THREE.GridHelper(16, 20, primaryColor, isDark ? 0x1e293b : 0xcbd5e1);
    grid.position.y = -2;
    scene.add(grid);
    gridHelperRef.current = grid;

    // Helper: Add CAD Edges (Black/Cyan wireframe overlay on solid faces)
    const addCadEdges = (mesh: THREE.Mesh, parent: THREE.Group) => {
      const edges = new THREE.EdgesGeometry(mesh.geometry, 25);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: isDark ? 0x00e5ff : 0x0284c7, transparent: true, opacity: 0.55 })
      );
      mesh.add(line);
      parent.add(mesh);
    };

    // Standard Solid CAD Materials
    const aeroMaterial = new THREE.MeshStandardMaterial({
      color: metalTitanium,
      metalness: 0.85,
      roughness: 0.2,
    });
    const carbonMaterial = new THREE.MeshStandardMaterial({
      color: carbonBlack,
      metalness: 0.5,
      roughness: 0.4,
    });
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: goldAccent,
      metalness: 0.9,
      roughness: 0.15,
    });

    // ========================================================
    // MODEL 1: ISRO GSLV Mk II Payload Shroud & Cryogenic Stage
    // ========================================================
    const gslvGroup = new THREE.Group();
    gslvGroup.position.y = 0.2;

    // Lower Booster Core Cylinder
    const lowerCore = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.2, 32), aeroMaterial);
    lowerCore.position.y = -0.9;
    lowerCore.castShadow = true;
    addCadEdges(lowerCore, gslvGroup);

    // Interstage Ring (Gold heat-shield ring)
    const interstage = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.25, 32), goldMaterial);
    interstage.position.y = 0.3;
    addCadEdges(interstage, gslvGroup);

    // Cryogenic C25 Fuel Tank Stage
    const cryoStage = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.9, 1.8, 32), aeroMaterial);
    cryoStage.position.y = 1.3;
    cryoStage.castShadow = true;
    addCadEdges(cryoStage, gslvGroup);

    // Ogive Payload Fairing (Shroud)
    const ogiveGeo = new THREE.ConeGeometry(0.88, 1.6, 32);
    const ogiveMesh = new THREE.Mesh(ogiveGeo, aeroMaterial);
    ogiveMesh.position.y = 3.0;
    ogiveMesh.castShadow = true;
    addCadEdges(ogiveMesh, gslvGroup);

    // Nose Cone Tip (Heat Shield Composite)
    const tipMesh = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.35, 16), goldMaterial);
    tipMesh.position.y = 3.9;
    addCadEdges(tipMesh, gslvGroup);

    // 4 Cryogenic Engine Gimbal Nozzles
    const nozzleGeo = new THREE.ConeGeometry(0.22, 0.45, 16);
    [
      [-0.35, -2.15, -0.35],
      [0.35, -2.15, -0.35],
      [-0.35, -2.15, 0.35],
      [0.35, -2.15, 0.35],
    ].forEach(([nx, ny, nz]) => {
      const nozzle = new THREE.Mesh(nozzleGeo, goldMaterial);
      nozzle.position.set(nx, ny, nz);
      nozzle.rotation.x = Math.PI;
      addCadEdges(nozzle, gslvGroup);
    });

    // 4 Grid Fins / Aerodynamic Strakes
    const finGeo = new THREE.BoxGeometry(0.04, 0.6, 0.4);
    [
      [0.92, -0.8, 0, 0],
      [-0.92, -0.8, 0, 0],
      [0, -0.8, 0.92, Math.PI / 2],
      [0, -0.8, -0.92, Math.PI / 2],
    ].forEach(([fx, fy, fz, fRot]) => {
      const fin = new THREE.Mesh(finGeo, aeroMaterial);
      fin.position.set(fx, fy, fz);
      fin.rotation.y = fRot;
      addCadEdges(fin, gslvGroup);
    });

    scene.add(gslvGroup);
    modelsGroupRef.current['gslv'] = gslvGroup;

    // ========================================================
    // MODEL 2: Pixhawk 450mm Carbon Quadcopter Airframe
    // ========================================================
    const droneCadGroup = new THREE.Group();
    droneCadGroup.position.y = 0.5;

    // Dual-Deck Carbon Chassis Plates
    const lowerPlate = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 1.4), carbonMaterial);
    lowerPlate.position.y = 0;
    addCadEdges(lowerPlate, droneCadGroup);

    const upperPlate = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.04, 1.15), carbonMaterial);
    upperPlate.position.y = 0.22;
    addCadEdges(upperPlate, droneCadGroup);

    // 4 Stand-offs
    const postGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.22, 8);
    [
      [-0.4, 0.11, -0.4],
      [0.4, 0.11, -0.4],
      [-0.4, 0.11, 0.4],
      [0.4, 0.11, 0.4],
    ].forEach(([px, py, pz]) => {
      const post = new THREE.Mesh(postGeo, goldMaterial);
      post.position.set(px, py, pz);
      droneCadGroup.add(post);
    });

    // Pixhawk 6X CAD Enclosure
    const pixhawkCad = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.65), goldMaterial);
    pixhawkCad.position.set(0, 0.32, 0);
    addCadEdges(pixhawkCad, droneCadGroup);

    // 4 Solid Carbon Arms with Motor Mounts
    const armCadGeo = new THREE.CylinderGeometry(0.07, 0.07, 2.0, 12);
    const motorCadGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.18, 16);
    const propCadGeo = new THREE.BoxGeometry(1.5, 0.02, 0.12);

    [
      { x: 1, z: 1, rot: Math.PI / 4 },
      { x: -1, z: 1, rot: -Math.PI / 4 },
      { x: 1, z: -1, rot: -Math.PI / 4 },
      { x: -1, z: -1, rot: Math.PI / 4 },
    ].forEach((pos) => {
      const arm = new THREE.Mesh(armCadGeo, carbonMaterial);
      arm.rotation.z = Math.PI / 2;
      arm.rotation.y = pos.rot;
      arm.position.set(pos.x * 0.7, 0.11, pos.z * 0.7);
      addCadEdges(arm, droneCadGroup);

      const motor = new THREE.Mesh(motorCadGeo, aeroMaterial);
      motor.position.set(pos.x * 1.4, 0.22, pos.z * 1.4);
      addCadEdges(motor, droneCadGroup);

      const prop = new THREE.Mesh(propCadGeo, carbonMaterial);
      prop.position.set(pos.x * 1.4, 0.32, pos.z * 1.4);
      droneCadGroup.add(prop);
    });

    // Landing Gear Legs
    const skidGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.8, 8);
    [-0.65, 0.65].forEach((sx) => {
      const skid = new THREE.Mesh(skidGeo, carbonMaterial);
      skid.rotation.x = Math.PI / 2;
      skid.position.set(sx, -0.6, 0);
      addCadEdges(skid, droneCadGroup);
    });

    scene.add(droneCadGroup);
    modelsGroupRef.current['drone'] = droneCadGroup;

    // ========================================================
    // MODEL 3: RoboGleam Dual Articulated Arm & Sanitizer
    // ========================================================
    const armGroup = new THREE.Group();
    armGroup.position.y = -0.5;

    // Rotary Turntable Base
    const baseTurntable = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.4, 24), aeroMaterial);
    baseTurntable.position.y = -0.2;
    addCadEdges(baseTurntable, armGroup);

    // Shoulder Revolute Joint
    const shoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20), goldMaterial);
    shoulderJoint.position.y = 0.25;
    addCadEdges(shoulderJoint, armGroup);

    // Primary Bicep Linkage
    const bicepLink = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 1.6, 16), aeroMaterial);
    bicepLink.position.set(0.2, 1.05, 0);
    bicepLink.rotation.z = -0.25;
    addCadEdges(bicepLink, armGroup);

    // Elbow Joint
    const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), goldMaterial);
    elbowJoint.position.set(0.4, 1.85, 0);
    addCadEdges(elbowJoint, armGroup);

    // Forearm Linkage
    const forearmLink = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 1.4, 16), aeroMaterial);
    forearmLink.position.set(0.2, 2.5, 0);
    forearmLink.rotation.z = 0.28;
    addCadEdges(forearmLink, armGroup);

    // Dual Sanitizing Tool Head
    const toolHead = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.4), goldMaterial);
    toolHead.position.set(0, 3.25, 0);
    addCadEdges(toolHead, armGroup);

    // Twin Rotary Mopping Discs
    [-0.28, 0.28].forEach((tx) => {
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 20), aeroMaterial);
      disc.position.set(tx, 3.42, 0);
      addCadEdges(disc, armGroup);
    });

    scene.add(armGroup);
    modelsGroupRef.current['robogleam'] = armGroup;

    // Initial Visibility Sync
    Object.keys(modelsGroupRef.current).forEach((key) => {
      modelsGroupRef.current[key].visible = key === selectedCAD;
    });

    // Mouse Drag Interaction for 3D Orbiting
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

    // Resize Handler
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
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (isRotating && !isDraggingRef.current) {
        targetRotation.current.y += 0.008; // Smooth CAD turntable rotation
      }

      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;

      const radius = 7.8;
      camera.position.x = radius * Math.sin(currentRotation.current.y) * Math.cos(currentRotation.current.x);
      camera.position.y = Math.max(0.5, radius * Math.sin(currentRotation.current.x) + 2.0);
      camera.position.z = radius * Math.cos(currentRotation.current.y) * Math.cos(currentRotation.current.x);
      camera.lookAt(0, 0.8, 0);

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
      if (host) host.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  // Model Selection Toggle
  useEffect(() => {
    Object.keys(modelsGroupRef.current).forEach((key) => {
      if (modelsGroupRef.current[key]) {
        modelsGroupRef.current[key].visible = key === selectedCAD;
      }
    });
  }, [selectedCAD]);

  // Render Mode Toggle (Solid Shaded, Technical Blueprint Wireframe, FEA Stress Heatmap)
  useEffect(() => {
    if (!sceneRef.current) return;
    const isWire = renderMode === 'wireframe';
    const isFea = renderMode === 'fea';

    sceneRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          const mat = Array.isArray(child.material) ? child.material[0] : child.material;
          mat.wireframe = isWire;

          if (isFea) {
            // High stress rainbow gradient
            mat.color.setHex(0xef4444);
            mat.roughness = 0.6;
          } else {
            mat.color.setHex(0x334155);
            mat.roughness = 0.25;
          }
        }
      }
    });
  }, [renderMode]);

  // Grid Helper Visibility
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
  }, [showGrid]);

  return (
    <div className={`glass-panel ${styles.cadWrapper}`}>
      {/* Three.js 3D Solid Model Canvas Host */}
      <div ref={mountRef} className={styles.canvasHost} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'grab' }} />

      {/* Top HUD Overlay */}
      <div className={styles.cadHeader}>
        <div className={styles.headerTitleRow}>
          <div className={styles.cadBadge}>
            <Compass size={13} />
            <span>CATIA V5 // 3D SOLID PARAMETRIC TWIN</span>
          </div>
          <h3 className={styles.modelName}>{activeSpec.name}</h3>
        </div>

        {/* Viewport Control Buttons */}
        <div className={styles.cadControls}>
          {/* Render Mode Pills */}
          <div className={styles.modeGroup}>
            <button
              onClick={() => setRenderMode('solid')}
              className={`${styles.cadToolBtn} ${renderMode === 'solid' ? styles.activeTool : ''}`}
              title="Solid Shaded CAD Model with Surface Highlights"
            >
              <Box size={13} />
              <span>Solid CAD</span>
            </button>
            <button
              onClick={() => setRenderMode('wireframe')}
              className={`${styles.cadToolBtn} ${renderMode === 'wireframe' ? styles.activeTool : ''}`}
              title="Technical Blueprint Wireframe Mode"
            >
              <Crosshair size={13} />
              <span>Blueprint</span>
            </button>
            <button
              onClick={() => setRenderMode('fea')}
              className={`${styles.cadToolBtn} ${renderMode === 'fea' ? styles.activeTool : ''}`}
              title="Von Mises Structural FEA Stress Heatmap"
            >
              <Flame size={13} />
              <span>FEA Stress</span>
            </button>
          </div>

          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`${styles.cadToolBtn} ${isRotating ? styles.activeTool : ''}`}
            title="Toggle 360° CAD Turntable Orbit"
          >
            <RotateCw size={13} />
            <span>Orbit</span>
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`${styles.cadToolBtn} ${showGrid ? styles.activeTool : ''}`}
            title="Toggle CAD Workplane Datum Grid"
          >
            <Layers size={13} />
            <span>Grid</span>
          </button>
        </div>
      </div>

      {/* Model Selection Tabs */}
      <div className={styles.modelTabs}>
        {CAD_MODELS.map((m) => (
          <button
            key={m.id}
            className={`${styles.modelTabBtn} ${selectedCAD === m.id ? styles.modelTabActive : ''}`}
            onClick={() => setSelectedCAD(m.id)}
          >
            <span>{m.id === 'gslv' ? '🚀' : m.id === 'drone' ? '🛸' : '🦾'}</span>
            <span>{m.name.split(' ')[0]} {m.name.split(' ')[1]}</span>
          </button>
        ))}
      </div>

      {/* Engineering Specs Drawer */}
      <div className={styles.specsBar}>
        <div className={styles.specColumn}>
          <span className={styles.specKey}>CAD SOFTWARE</span>
          <span className={styles.specVal}>{activeSpec.software}</span>
        </div>
        <div className={styles.specColumn}>
          <span className={styles.specKey}>MATERIAL COMPOSITE</span>
          <span className={styles.specVal}>{activeSpec.material}</span>
        </div>
        <div className={styles.specColumn}>
          <span className={styles.specKey}>MACHINING TOLERANCE</span>
          <span className={styles.specVal}>{activeSpec.tolerance}</span>
        </div>
        <div className={styles.specColumn}>
          <span className={styles.specKey}>SAFETY FACTOR</span>
          <span className={styles.specVal}>{activeSpec.safetyFactor}</span>
        </div>
        <div className={styles.specColumn}>
          <span className={styles.specKey}>DIMENSIONS (X×Y×Z)</span>
          <span className={styles.specVal}>{activeSpec.dimX}m × {activeSpec.dimY}m × {activeSpec.dimZ}m</span>
        </div>
      </div>
    </div>
  );
};

export default CADBlueprintViewer;
