import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type { ParkSceneData, SceneObject } from '../../types/parkScene';
import { createAttractionRuntimeObject, type ObjectRuntimeData } from './proceduralObjects';

export interface ParkCanvasHandle {
  captureSnapshot: () => string; // returns data URL
  exportGLB: (onlySelected?: boolean) => void;
  setCameraPreset: (preset: 'aerial' | 'birdseye' | 'top' | 'walkthrough' | 'cinematic' | 'ride' | 'front' | 'side' | 'reset') => void;
  toggleRideCamera: () => boolean; // returns new ride cam state
  toggleCinematicTour: () => boolean; // returns new cinematic state
  autoFramePark: () => void;
  // Free rotating, look and zooming handles
  zoomIn: (factor?: number) => void;
  zoomOut: (factor?: number) => void;
  rotateLeft: (angle?: number) => void;
  rotateRight: (angle?: number) => void;
  tiltUp: (angle?: number) => void;
  tiltDown: (angle?: number) => void;
  pan: (deltaX: number, deltaY: number) => void;
  toggleAutoRotate: () => boolean;
  isAutoRotating: () => boolean;
  focusOnSelected: () => void;
  toggleMouseMoveLook: () => boolean;
  isMouseMoveLookActive: () => boolean;
}

interface Props {
  sceneData: ParkSceneData;
  selectedId: string | null;
  onSelectObject: (id: string | null) => void;
  onRideCameraChange?: (active: boolean) => void;
  onMouseMoveLookChange?: (active: boolean) => void;
}

const ParkCanvas = forwardRef<ParkCanvasHandle, Props>(({
  sceneData,
  selectedId,
  onSelectObject,
  onRideCameraChange,
  onMouseMoveLookChange,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const runtimeObjectsRef = useRef<Map<string, ObjectRuntimeData>>(new Map());
  const objectsGroupRef = useRef<THREE.Group | null>(null);
  const selectionIndicatorRef = useRef<THREE.Mesh | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const [rideCamActive, setRideCamActive] = useState(false);
  const [cinematicActive, setCinematicActive] = useState(false);
  const [mouseMoveLookActive, setMouseMoveLookActive] = useState(false);
  const rideCamActiveRef = useRef(false);
  const cinematicActiveRef = useRef(false);
  const mouseMoveLookActiveRef = useRef(false);
  const activePresetRef = useRef<string>('aerial');
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  // Expose handles to parent (snapshots, GLB export, camera presets, free rotate, look & zoom)
  useImperativeHandle(ref, () => ({
    captureSnapshot: () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return '';
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      return rendererRef.current.domElement.toDataURL('image/png');
    },
    exportGLB: (onlySelected = false) => {
      if (!sceneRef.current) return;
      const exporter = new GLTFExporter();
      let target: THREE.Object3D = sceneRef.current;

      if (onlySelected && selectedId && objectsGroupRef.current) {
        const found = objectsGroupRef.current.children.find(c => c.name === selectedId);
        if (found) target = found;
      }

      exporter.parse(
        target,
        (gltf) => {
          const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = onlySelected && selectedId ? `${selectedId}.glb` : 'park_scene.glb';
          link.click();
          URL.revokeObjectURL(url);
        },
        (error) => {
          console.error('Error exporting GLB:', error);
          alert('Could not export GLB model: ' + error);
        },
        { binary: true }
      );
    },
    setCameraPreset: (preset) => {
      if (!cameraRef.current || !controlsRef.current) return;
      setRideCamActive(false);
      rideCamActiveRef.current = false;
      setCinematicActive(false);
      cinematicActiveRef.current = false;
      onRideCameraChange?.(false);
      controlsRef.current.enabled = true;
      activePresetRef.current = preset;

      switch (preset) {
        case 'aerial':
          cameraRef.current.position.set(60, 75, 95);
          controlsRef.current.target.set(0, 10, -5);
          break;
        case 'birdseye':
          cameraRef.current.position.set(0, 115, 75);
          controlsRef.current.target.set(0, 6, -5);
          break;
        case 'top':
          cameraRef.current.position.set(0, 160, 0.1);
          controlsRef.current.target.set(0, 0, -5);
          break;
        case 'walkthrough':
          cameraRef.current.position.set(0, 2.2, 58);
          controlsRef.current.target.set(0, 2.2, 25);
          break;
        case 'cinematic':
          cinematicActiveRef.current = true;
          setCinematicActive(true);
          controlsRef.current.enabled = false;
          break;
        case 'ride':
          // Delegate to toggleRideCamera
          break;
        case 'front':
          cameraRef.current.position.set(0, 22, 85);
          controlsRef.current.target.set(0, 10, 0);
          break;
        case 'side':
          cameraRef.current.position.set(95, 24, 0);
          controlsRef.current.target.set(0, 10, 0);
          break;
        case 'reset':
        default:
          cameraRef.current.position.set(60, 75, 95);
          controlsRef.current.target.set(0, 10, -5);
          break;
      }
      controlsRef.current.update();
    },
    autoFramePark: () => {
      if (!cameraRef.current || !controlsRef.current) return;
      setRideCamActive(false);
      rideCamActiveRef.current = false;
      setCinematicActive(false);
      cinematicActiveRef.current = false;
      onRideCameraChange?.(false);
      controlsRef.current.enabled = true;
      activePresetRef.current = 'aerial';
      cameraRef.current.position.set(60, 75, 95);
      controlsRef.current.target.set(0, 10, -5);
      controlsRef.current.update();
    },
    toggleCinematicTour: () => {
      const next = !cinematicActiveRef.current;
      cinematicActiveRef.current = next;
      setCinematicActive(next);
      if (next) {
        setRideCamActive(false);
        rideCamActiveRef.current = false;
        onRideCameraChange?.(false);
      }
      if (controlsRef.current) {
        controlsRef.current.enabled = !next;
      }
      return next;
    },
    toggleRideCamera: () => {
      // Find if any roller coaster exists
      const coasterRuntime = Array.from(runtimeObjectsRef.current.values()).find(
        r => typeof r.getRideCameraTransform === 'function'
      );
      if (!coasterRuntime) {
        alert('Please add or select a Roller Coaster to use the Ride Camera preview.');
        return false;
      }
      const nextState = !rideCamActiveRef.current;
      rideCamActiveRef.current = nextState;
      setRideCamActive(nextState);
      if (nextState) {
        setCinematicActive(false);
        cinematicActiveRef.current = false;
      }
      if (controlsRef.current) {
        controlsRef.current.enabled = !nextState;
      }
      onRideCameraChange?.(nextState);
      return nextState;
    },
    // FREE ROTATING, LOOK & ZOOMING METHODS
    zoomIn: (factor = 0.18) => {
      if (!cameraRef.current || !controlsRef.current) return;
      const camera = cameraRef.current;
      const target = controlsRef.current.target;
      const dir = new THREE.Vector3().subVectors(target, camera.position);
      const dist = dir.length();
      if (dist > 5) {
        camera.position.addScaledVector(dir, factor);
        controlsRef.current.update();
      }
    },
    zoomOut: (factor = 0.18) => {
      if (!cameraRef.current || !controlsRef.current) return;
      const camera = cameraRef.current;
      const target = controlsRef.current.target;
      const dir = new THREE.Vector3().subVectors(target, camera.position);
      const dist = dir.length();
      if (dist < 480) {
        camera.position.addScaledVector(dir, -factor);
        controlsRef.current.update();
      }
    },
    rotateLeft: (angle = 0.14) => {
      if (!cameraRef.current || !controlsRef.current) return;
      const target = controlsRef.current.target;
      const offset = new THREE.Vector3().subVectors(cameraRef.current.position, target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      cameraRef.current.position.copy(target).add(offset);
      controlsRef.current.update();
    },
    rotateRight: (angle = 0.14) => {
      if (!cameraRef.current || !controlsRef.current) return;
      const target = controlsRef.current.target;
      const offset = new THREE.Vector3().subVectors(cameraRef.current.position, target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -angle);
      cameraRef.current.position.copy(target).add(offset);
      controlsRef.current.update();
    },
    tiltUp: (angle = 0.09) => {
      if (!cameraRef.current || !controlsRef.current) return;
      const camera = cameraRef.current;
      const target = controlsRef.current.target;
      const offset = new THREE.Vector3().subVectors(camera.position, target);
      const horizontalDir = new THREE.Vector3(offset.x, 0, offset.z).normalize();
      const rightAxis = new THREE.Vector3(-horizontalDir.z, 0, horizontalDir.x);
      offset.applyAxisAngle(rightAxis, angle);
      if (offset.y > 3 && offset.y < 350) {
        camera.position.copy(target).add(offset);
        controlsRef.current.update();
      }
    },
    tiltDown: (angle = 0.09) => {
      if (!cameraRef.current || !controlsRef.current) return;
      const camera = cameraRef.current;
      const target = controlsRef.current.target;
      const offset = new THREE.Vector3().subVectors(camera.position, target);
      const horizontalDir = new THREE.Vector3(offset.x, 0, offset.z).normalize();
      const rightAxis = new THREE.Vector3(-horizontalDir.z, 0, horizontalDir.x);
      offset.applyAxisAngle(rightAxis, -angle);
      if (offset.y > 3 && offset.y < 350) {
        camera.position.copy(target).add(offset);
        controlsRef.current.update();
      }
    },
    pan: (deltaX: number, deltaY: number) => {
      if (!cameraRef.current || !controlsRef.current) return;
      const camera = cameraRef.current;
      const target = controlsRef.current.target;
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();
      right.y = 0;
      right.normalize();
      const offset = right.multiplyScalar(deltaX).add(forward.multiplyScalar(deltaY));
      camera.position.add(offset);
      target.add(offset);
      controlsRef.current.update();
    },
    toggleAutoRotate: () => {
      if (!controlsRef.current) return false;
      const next = !controlsRef.current.autoRotate;
      controlsRef.current.autoRotate = next;
      controlsRef.current.autoRotateSpeed = 2.0;
      return next;
    },
    isAutoRotating: () => {
      return controlsRef.current?.autoRotate || false;
    },
    focusOnSelected: () => {
      if (!selectedId || !cameraRef.current || !controlsRef.current) return;
      const obj = sceneData.objects.find(o => o.id === selectedId);
      if (!obj) return;
      const target = new THREE.Vector3(obj.position[0], obj.position[1] + 3, obj.position[2]);
      const offset = new THREE.Vector3(22, 18, 26);
      controlsRef.current.target.copy(target);
      cameraRef.current.position.copy(target).add(offset);
      controlsRef.current.update();
    },
    toggleMouseMoveLook: () => {
      const next = !mouseMoveLookActiveRef.current;
      mouseMoveLookActiveRef.current = next;
      setMouseMoveLookActive(next);
      onMouseMoveLookChange?.(next);
      return next;
    },
    isMouseMoveLookActive: () => {
      return mouseMoveLookActiveRef.current;
    },
  }));

  // 1. Initial Scene Setup
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.5, 900);
    // Default Elevated Diagonal Perspective (matching reference image)
    camera.position.set(60, 75, 95);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true, // Enables clean canvas snapshots!
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't clip under ground
    controls.minPolarAngle = 0.02; // Allow free overhead look
    controls.minDistance = 3;
    controls.maxDistance = 500;
    controls.screenSpacePanning = true; // Natural panning
    controls.autoRotate = false;
    controls.autoRotateSpeed = 2.0;
    controls.target.set(0, 10, -5);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.45);
    dirLight.position.set(60, 90, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 400;
    dirLight.shadow.camera.left = -120;
    dirLight.shadow.camera.right = 120;
    dirLight.shadow.camera.top = 120;
    dirLight.shadow.camera.bottom = -120;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Park Ground Terrain
    const terrainGroup = new THREE.Group();
    scene.add(terrainGroup);

    // Green Grass Lawn (Expanded for Mega Park)
    const grassGeom = new THREE.PlaneGeometry(360, 360);
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.9,
      metalness: 0.05,
    });
    const grassMesh = new THREE.Mesh(grassGeom, grassMat);
    grassMesh.rotation.x = -Math.PI / 2;
    grassMesh.receiveShadow = true;
    terrainGroup.add(grassMesh);

    // Paved Plaza Area (Central Entrance Promenade)
    const plazaGeom = new THREE.CylinderGeometry(48, 48, 0.05, 36);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0xd6d3d1,
      roughness: 0.8,
    });
    const plazaMesh = new THREE.Mesh(plazaGeom, plazaMat);
    plazaMesh.position.set(0, 0.02, 35);
    plazaMesh.receiveShadow = true;
    terrainGroup.add(plazaMesh);

    // Left Midway Carnival Plaza Paving
    const leftPlaza = new THREE.Mesh(new THREE.CylinderGeometry(34, 34, 0.04, 32), plazaMat);
    leftPlaza.position.set(-35, 0.02, 10);
    leftPlaza.receiveShadow = true;
    terrainGroup.add(leftPlaza);

    // Right Adventure Mountain Plaza Paving
    const rightPlaza = new THREE.Mesh(new THREE.CylinderGeometry(36, 36, 0.04, 32), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.85 }));
    rightPlaza.position.set(38, 0.02, 16);
    rightPlaza.receiveShadow = true;
    terrainGroup.add(rightPlaza);

    // Water Park Beach Deck Paving
    const waterparkDeck = new THREE.Mesh(new THREE.CylinderGeometry(42, 42, 0.04, 32), new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 }));
    waterparkDeck.position.set(74, 0.02, 8);
    waterparkDeck.receiveShadow = true;
    terrainGroup.add(waterparkDeck);

    // Subtle Ground Grid Lines
    const grid = new THREE.GridHelper(260, 52, 0x15803d, 0x166534);
    grid.position.y = 0.04;
    terrainGroup.add(grid);

    // Peripheral Landscaping / Trees (Rich Border Woodland)
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    for (let i = 0; i < 48; i++) {
      const angle = (i / 48) * Math.PI * 2;
      const dist = 95 + (i % 4) * 16;
      const tx = Math.cos(angle) * dist;
      const tz = Math.sin(angle) * dist;

      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 3.0, 6), trunkMat);
      trunk.position.y = 1.5;
      tree.add(trunk);

      const foliage = new THREE.Mesh(new THREE.ConeGeometry(2.8, 5.5, 7), treeMat);
      foliage.position.y = 4.8;
      tree.add(foliage);

      tree.position.set(tx, 0, tz);
      terrainGroup.add(tree);
    }

    // Objects Container Group
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);
    objectsGroupRef.current = objectsGroup;

    // Selection Indicator Ring
    const selRingGeom = new THREE.RingGeometry(2.5, 2.8, 32);
    const selRingMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const selRing = new THREE.Mesh(selRingGeom, selRingMat);
    selRing.rotation.x = -Math.PI / 2;
    selRing.position.y = 0.08;
    selRing.visible = false;
    scene.add(selRing);
    selectionIndicatorRef.current = selRing;

    // Click / Raycaster Selection with Drag Discrimination
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let isPointerDown = false;

    const handlePointerDown = (event: MouseEvent) => {
      if (event.button !== 0) return;
      pointerDownPos = { x: event.clientX, y: event.clientY };
      isPointerDown = true;
    };

    const handlePointerUp = (event: MouseEvent) => {
      if (!isPointerDown || event.button !== 0 || !containerRef.current) return;
      isPointerDown = false;

      // Check drag distance - if dragged, it was an orbit or pan, not an attraction click
      const dragDistance = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);
      if (dragDistance > 6) return;

      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (objectsGroupRef.current) {
        const intersects = raycaster.intersectObjects(objectsGroupRef.current.children, true);
        if (intersects.length > 0) {
          // Traverse up to find root group with obj ID
          let cur: THREE.Object3D | null = intersects[0].object;
          let matchedId: string | null = null;
          while (cur && cur !== objectsGroupRef.current) {
            if (cur.name && cur.name.startsWith('obj_')) {
              matchedId = cur.name;
              break;
            }
            cur = cur.parent;
          }
          if (matchedId) {
            onSelectObject(matchedId);
            return;
          }
        } else {
          // Click on ground deselects
          onSelectObject(null);
        }
      }
    };

    // Double-click to Focus & Zoom directly towards location / attraction
    const handleDoubleClick = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !controlsRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      if (objectsGroupRef.current) {
        const intersects = raycaster.intersectObjects(objectsGroupRef.current.children, true);
        if (intersects.length > 0) {
          const pt = intersects[0].point;
          controlsRef.current.target.set(pt.x, Math.max(1.5, pt.y), pt.z);
          // Zoom in smoothly towards target
          const dir = new THREE.Vector3().subVectors(controlsRef.current.target, cameraRef.current.position);
          cameraRef.current.position.addScaledVector(dir, 0.45);
          controlsRef.current.update();
        }
      }
    };

    // PURE MOUSE MOVEMENT LISTENER (Free Orbit & Free Look by simply moving mouse)
    let normMouseX = 0;
    let normMouseY = 0;
    let isMouseOver = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      normMouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      normMouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Pure mouse movement: when mouse move look is active, rotate directly from delta movement
      if (
        mouseMoveLookActiveRef.current &&
        cameraRef.current &&
        controlsRef.current &&
        !cinematicActiveRef.current &&
        !rideCamActiveRef.current
      ) {
        const dx = e.movementX || 0;
        const dy = e.movementY || 0;
        if (dx !== 0 || dy !== 0) {
          const sensitivity = 0.0032;
          const camera = cameraRef.current;
          const target = controlsRef.current.target;

          if (activePresetRef.current === 'walkthrough') {
            // First-person head rotation
            const lookDir = new THREE.Vector3().subVectors(target, camera.position);
            lookDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), -dx * sensitivity);
            const horizontalDir = new THREE.Vector3(lookDir.x, 0, lookDir.z).normalize();
            const rightAxis = new THREE.Vector3(-horizontalDir.z, 0, horizontalDir.x);
            lookDir.applyAxisAngle(rightAxis, -dy * sensitivity);
            lookDir.y = Math.max(-20, Math.min(25, lookDir.y));
            target.copy(camera.position).add(lookDir);
          } else {
            // Orbit around target
            const offset = new THREE.Vector3().subVectors(camera.position, target);
            offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -dx * sensitivity);

            const horizontalDir = new THREE.Vector3(offset.x, 0, offset.z).normalize();
            const rightAxis = new THREE.Vector3(-horizontalDir.z, 0, horizontalDir.x);
            offset.applyAxisAngle(rightAxis, -dy * sensitivity);

            if (offset.y > 3 && offset.y < 350) {
              camera.position.copy(target).add(offset);
            } else {
              offset.y = Math.max(3, Math.min(350, offset.y));
              camera.position.copy(target).add(offset);
            }
          }
          controlsRef.current.update();
        }
      }
    };

    const handleMouseEnter = () => {
      isMouseOver = true;
    };
    const handleMouseLeave = () => {
      isMouseOver = false;
      normMouseX = 0;
      normMouseY = 0;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', handlePointerDown);
    domElement.addEventListener('pointerup', handlePointerUp);
    domElement.addEventListener('dblclick', handleDoubleClick);
    domElement.addEventListener('mousemove', handleMouseMove);
    domElement.addEventListener('mouseenter', handleMouseEnter);
    domElement.addEventListener('mouseleave', handleMouseLeave);

    // Keyboard Navigation for Walkthrough & Free Roaming (WASD + Arrow keys)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      keysPressedRef.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update procedural animations on all placed attractions
      runtimeObjectsRef.current.forEach((runtime) => {
        runtime.update(delta, elapsed);
      });

      // Handle Keyboard Walkthrough Navigation in Walk Mode
      if (activePresetRef.current === 'walkthrough' && !cinematicActiveRef.current && !rideCamActiveRef.current) {
        const keys = keysPressedRef.current;
        const walkSpeed = 22 * delta;
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        forward.y = 0;
        forward.normalize();
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        right.y = 0;
        right.normalize();

        if (keys['KeyW'] || keys['ArrowUp']) {
          camera.position.addScaledVector(forward, walkSpeed);
          controls.target.addScaledVector(forward, walkSpeed);
        }
        if (keys['KeyS'] || keys['ArrowDown']) {
          camera.position.addScaledVector(forward, -walkSpeed);
          controls.target.addScaledVector(forward, -walkSpeed);
        }
        if (keys['KeyA'] || keys['ArrowLeft']) {
          camera.position.addScaledVector(right, -walkSpeed);
          controls.target.addScaledVector(right, -walkSpeed);
        }
        if (keys['KeyD'] || keys['ArrowRight']) {
          camera.position.addScaledVector(right, walkSpeed);
          controls.target.addScaledVector(right, walkSpeed);
        }
        if (keys['KeyQ']) {
          const offset = new THREE.Vector3().subVectors(controls.target, camera.position);
          offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), walkSpeed * 1.5);
          controls.target.copy(camera.position).add(offset);
        }
        if (keys['KeyE']) {
          const offset = new THREE.Vector3().subVectors(controls.target, camera.position);
          offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -walkSpeed * 1.5);
          controls.target.copy(camera.position).add(offset);
        }
        camera.position.y = 2.2;
      }

      // Edge-based mouse steering when Mouse Movement Look is active
      if (
        mouseMoveLookActiveRef.current &&
        isMouseOver &&
        !cinematicActiveRef.current &&
        !rideCamActiveRef.current
      ) {
        const edgeLimit = 0.72;
        if (Math.abs(normMouseX) > edgeLimit) {
          const sign = normMouseX > 0 ? 1 : -1;
          const intensity = (Math.abs(normMouseX) - edgeLimit) / (1 - edgeLimit);
          const angle = -sign * intensity * 1.5 * delta;

          if (activePresetRef.current === 'walkthrough') {
            const lookDir = new THREE.Vector3().subVectors(controls.target, camera.position);
            lookDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
            controls.target.copy(camera.position).add(lookDir);
          } else {
            const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
            offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
            camera.position.copy(controls.target).add(offset);
          }
          controls.update();
        }
      }

      // Handle Active Camera Modes: Cinematic Tour vs Ride Cam vs Interactive Orbit
      if (cinematicActiveRef.current && !rideCamActiveRef.current) {
        const angle = elapsed * 0.12;
        const radius = 105;
        camera.position.set(
          Math.sin(angle) * radius,
          65 + Math.sin(angle * 2.2) * 12,
          Math.cos(angle) * radius
        );
        controls.target.set(0, 10, -5);
        camera.lookAt(0, 10, -5);
      } else if (rideCamActiveRef.current) {
        for (const runtime of runtimeObjectsRef.current.values()) {
          if (runtime.getRideCameraTransform) {
            const transform = runtime.getRideCameraTransform();
            if (transform) {
              camera.position.copy(transform.position);
              camera.lookAt(transform.lookAt);
            }
            break;
          }
        }
      } else {
        controls.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    // Window Resize Handling
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      domElement.removeEventListener('pointerdown', handlePointerDown);
      domElement.removeEventListener('pointerup', handlePointerUp);
      domElement.removeEventListener('dblclick', handleDoubleClick);
      domElement.removeEventListener('mousemove', handleMouseMove);
      domElement.removeEventListener('mouseenter', handleMouseEnter);
      domElement.removeEventListener('mouseleave', handleMouseLeave);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 2. Synchronize Lighting Mode (Daylight vs Sunset)
  useEffect(() => {
    if (!sceneRef.current || !dirLightRef.current || !ambientLightRef.current) return;

    if (sceneData.lightingMode === 'sunset') {
      // Golden Hour Sunset atmosphere
      sceneRef.current.background = new THREE.Color(0x311042);
      sceneRef.current.fog = new THREE.FogExp2(0x311042, 0.005);
      dirLightRef.current.color.setHex(0xf97316);
      dirLightRef.current.intensity = 2.0;
      dirLightRef.current.position.set(60, 22, -45);
      ambientLightRef.current.color.setHex(0xa855f7);
      ambientLightRef.current.intensity = 0.55;
    } else if (sceneData.lightingMode === 'night') {
      // Neon Night — dark sky with cyberpunk glow
      sceneRef.current.background = new THREE.Color(0x030712);
      sceneRef.current.fog = new THREE.FogExp2(0x0f172a, 0.007);
      dirLightRef.current.color.setHex(0x818cf8);
      dirLightRef.current.intensity = 0.6;
      dirLightRef.current.position.set(30, 60, 30);
      ambientLightRef.current.color.setHex(0x1e1b4b);
      ambientLightRef.current.intensity = 0.9;
    } else {
      // Bright Clear Daylight
      sceneRef.current.background = new THREE.Color(0x38bdf8);
      sceneRef.current.fog = new THREE.FogExp2(0x38bdf8, 0.003);
      dirLightRef.current.color.setHex(0xffffff);
      dirLightRef.current.intensity = 1.4;
      dirLightRef.current.position.set(50, 80, 40);
      ambientLightRef.current.color.setHex(0xbae6fd);
      ambientLightRef.current.intensity = 0.65;
    }
  }, [sceneData.lightingMode]);

  // 3. Synchronize Scene Objects
  useEffect(() => {
    if (!objectsGroupRef.current) return;

    // Clear existing objects in group
    while (objectsGroupRef.current.children.length > 0) {
      objectsGroupRef.current.remove(objectsGroupRef.current.children[0]);
    }
    runtimeObjectsRef.current.clear();

    // Reconstruct procedural 3D meshes for each object
    sceneData.objects.forEach((obj) => {
      const runtime = createAttractionRuntimeObject(obj);
      runtime.rootGroup.position.set(obj.position[0], obj.position[1], obj.position[2]);
      runtime.rootGroup.rotation.set(obj.rotation[0], obj.rotation[1], obj.rotation[2]);
      runtime.rootGroup.scale.set(obj.scale[0], obj.scale[1], obj.scale[2]);

      objectsGroupRef.current?.add(runtime.rootGroup);
      runtimeObjectsRef.current.set(obj.id, runtime);
    });
  }, [sceneData.objects]);

  // 4. Update Selection Indicator Ring
  useEffect(() => {
    if (!selectionIndicatorRef.current) return;

    if (!selectedId) {
      selectionIndicatorRef.current.visible = false;
      return;
    }

    const selectedObj = sceneData.objects.find((o) => o.id === selectedId);
    if (selectedObj) {
      selectionIndicatorRef.current.position.set(
        selectedObj.position[0],
        0.08,
        selectedObj.position[2]
      );
      selectionIndicatorRef.current.visible = true;
    } else {
      selectionIndicatorRef.current.visible = false;
    }
  }, [selectedId, sceneData.objects]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none"
    />
  );
});

ParkCanvas.displayName = 'ParkCanvas';
export default ParkCanvas;
