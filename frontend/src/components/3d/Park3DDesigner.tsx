import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Sun,
  Sunset,
  Moon,
  Camera,
  Download,
  Save,
  Sparkles,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Activity,
  Sliders,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Eye,
  Compass,
  Play,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Target,
  Home,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Footprints,
  MousePointer,
} from 'lucide-react';
import type {
  ParkSceneData,
  SceneObject,
  AttractionType,
  CustomArchitectureObject,
  LightingMode,
  FantasyCastleObject,
  WoodenCoasterObject,
  MountainAttractionObject,
} from '../../types/parkScene';
import {
  generateDefaultObject,
  createInitialParkScene,
  generateAIParkLayoutFromPrompt,
  applyAIInstructionToPark,
  createRealisticMegaPark,
  createWonderlaAmusementPark,
  createFuturisticCyberPark,
  createFantasyKingdomPark,
  createWaterParadisePark,
  createTropicalAdventurePark,
} from '../../types/parkScene';
import ParkCanvas, { type ParkCanvasHandle } from './ParkCanvas';
import Outliner from './Outliner';
import AttractionInspector from './AttractionInspector';
import FloorPlanEditor from './FloorPlanEditor';
import AddToParkPanel from './AddToParkPanel';
import { projectApi, sketchApi } from '../../api';
import type { Sketch } from '../../types';

interface Props {
  projectId: number;
  projectTitle: string;
  initialAttractionType: string;
  initialSceneJson?: string | null;
  onGoToGenerationStudioWithSketch?: (sketch: Sketch, suggestedPrompt?: string) => void;
  onBack: () => void;
}

export function buildScenePrompt(sceneData: ParkSceneData, projectTitle: string): string {
  const parts: string[] = [];
  parts.push(`Photorealistic theme park concept render of "${projectTitle}"`);

  const attractionDescs: string[] = [];
  sceneData.objects.forEach((obj) => {
    switch (obj.type) {
      case 'Fantasy Castle':
        attractionDescs.push(
          `a monumental central fairy-tale fantasy castle with soaring spires, royal blue roofs, gold pinnacles, stone battlements, and pedestrian bridge crossing a sprawling blue lake`
        );
        break;
      case 'Wooden Coaster':
        attractionDescs.push(
          `a classic wooden roller coaster with dense cross-braced timber trestle woodwork, steep drops, and undulating camelback hills`
        );
        break;
      case 'Mountain Attraction':
        attractionDescs.push(
          `a dramatic red-rock canyon mountain adventure zone with sculpted sandstone cliffs, natural rock arches, mine train coaster tracks, and water flumes`
        );
        break;
      case 'Futuristic Dome':
        attractionDescs.push(
          `a futuristic silver geodesic sphere dome pavilion with glowing neon contour rings`
        );
        break;
      case 'Splash Zone':
        attractionDescs.push(
          `an active water park splash pad with interactive spray nozzles, water mushroom umbrellas, and a giant tipping water bucket`
        );
        break;
      case 'Visitor Crowds':
        attractionDescs.push(
          `hundreds of animated park visitors strolling along curved cobblestone pedestrian promenades`
        );
        break;
      case 'Roller Coaster':
        attractionDescs.push(
          `a red steel roller coaster with a ${obj.hillHeight}m lift hill, high-speed loop, and continuous tubular rail track`
        );
        break;
      case 'Ferris Wheel':
        attractionDescs.push(
          `a towering ${obj.wheelDiameter}m Ferris wheel with ${obj.cabinCount} illuminated gondola cabins and steel spokes`
        );
        break;
      case 'Water Ride':
        attractionDescs.push(
          `a winding river rapids water channel ride with floating circular boats and splashing water flumes`
        );
        break;
      case 'Carousel':
        attractionDescs.push(
          `a grand rotating carousel with an ornate striped canopy, decorative finial spire, and illuminated ride seats`
        );
        break;
      case 'Drop Tower':
        attractionDescs.push(
          `a towering ${obj.towerHeight}m vertical lattice drop tower with a passenger carriage ring and beacon lights`
        );
        break;
      case 'Wave Pool':
        attractionDescs.push(
          `an active wave pool basin with surging azure water waves and tiled swimming decks`
        );
        break;
      case 'Slide Tower':
        attractionDescs.push(
          `a multi-flume water slide tower with twisting colorful slides plunging into a splash pool`
        );
        break;
      case 'Lazy River':
        attractionDescs.push(
          `a tropical lazy river water circuit with gentle currents and floating guest tubes`
        );
        break;
      case 'Lagoon':
        attractionDescs.push(
          `a sparkling natural lagoon with turquoise water, sandy shoreline, and decorative boulders`
        );
        break;
      case 'Trees':
        attractionDescs.push(
          `lush tropical palm tree groves and botanical landscaping`
        );
        break;
      case 'Pedestrian Path':
        attractionDescs.push(
          `stone-paved pedestrian promenades connecting the park zones and attractions`
        );
        break;
      case 'Ticket Pavilion':
        attractionDescs.push(
          `a grand entrance ticket pavilion with welcoming turnstiles and red tile roof`
        );
        break;
      case 'Food Court':
        attractionDescs.push(
          `a themed outdoor dining food court pavilion with dining patios`
        );
        break;
      case 'Changing Rooms':
        attractionDescs.push(
          `a modern waterpark guest locker and changing facility`
        );
        break;
      case 'Swing Ride':
        attractionDescs.push(
          `a dynamic wave swinger carousel with suspended chairs and colorful striped canopy`
        );
        break;
      case 'Bumper Cars':
        attractionDescs.push(
          `an active bumper cars arena with electric overhead grid and colorful passenger cars`
        );
        break;
      case 'Kids Attraction':
        attractionDescs.push(
          `a whimsical kids spinning teacup ride with giant decorative centerpiece teapot`
        );
        break;
      case 'Entrance Gate':
        attractionDescs.push(
          `a grand monumental theme park entrance gateway with welcoming turnstiles and marquee signage`
        );
        break;
      case 'Restaurant':
        attractionDescs.push(
          `a themed full-service restaurant with glass windows and outdoor dining patio with parasols`
        );
        break;
      case 'Shop':
        attractionDescs.push(
          `a themed souvenir gift boutique with colorful fabric awning and retail display windows`
        );
        break;
      case 'Parking Area':
        attractionDescs.push(
          `a paved visitor parking facility with marked bays, parked cars, and illumination poles`
        );
        break;
      case 'Gardens':
        attractionDescs.push(
          `lush symmetrical botanical gardens with sculpted boxwood hedges and blooming flower beds`
        );
        break;
      case 'Bridge':
        attractionDescs.push(
          `a gracefully arched pedestrian bridge with decorative balustrade railings spanning the water`
        );
        break;
      case 'Fountain':
        attractionDescs.push(
          `a multi-tiered ornamental stone water fountain with rising animated water jet sprays`
        );
        break;
      case 'Decorative Lighting':
        attractionDescs.push(
          `illuminated Victorian street lampposts casting warm glowing evening light`
        );
        break;
      case 'Custom Architecture': {
        const arch = obj as CustomArchitectureObject;
        attractionDescs.push(
          `a custom ${arch.preset || 'architectural'} building with ${arch.finish} walls and a ${arch.roofStyle} roof`
        );
        break;
      }
    }
  });

  if (attractionDescs.length > 0) {
    parts.push(`featuring ${attractionDescs.join(', ')}`);
  } else {
    parts.push(`featuring open landscaped park terrain, walkways, and guest plazas`);
  }

  if (sceneData.lightingMode === 'sunset') {
    parts.push(
      `bathed in warm golden hour sunset lighting, vibrant amber and purple sky, and glowing attraction lights`
    );
  } else {
    parts.push(
      `under bright crystal clear daylight, rich blue skies, crisp shadows, and lush green landscaping`
    );
  }

  parts.push(
    `cinematic theme park masterplan visualization, photorealistic 8k, architectural showcase`
  );
  return parts.join(', ');
}

export default function Park3DDesigner({
  projectId,
  projectTitle,
  initialAttractionType,
  initialSceneJson,
  onGoToGenerationStudioWithSketch,
  onBack,
}: Props) {
  const canvasRef = useRef<ParkCanvasHandle>(null);

  // Initialize or load scene data
  const [sceneData, setSceneData] = useState<ParkSceneData>(() => {
    if (initialSceneJson) {
      try {
        const parsed = JSON.parse(initialSceneJson);
        if (parsed.objects && Array.isArray(parsed.objects)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved scene JSON, falling back to default:', e);
      }
    }
    return createInitialParkScene(initialAttractionType);
  });

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    return sceneData.objects.length > 0 ? sceneData.objects[0].id : null;
  });

  const [editingFloorPlan, setEditingFloorPlan] = useState<CustomArchitectureObject | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [renderingAI, setRenderingAI] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [cameraMode, setCameraMode] = useState<'orbit' | 'top'>('orbit');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isRideCamActive, setIsRideCamActive] = useState(false);
  const [isCinematicActive, setIsCinematicActive] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [activeCameraPreset, setActiveCameraPreset] = useState<'aerial' | 'birdseye' | 'top' | 'walkthrough' | 'cinematic' | 'ride'>('aerial');
  const [hudNavMode, setHudNavMode] = useState<'rotate' | 'pan'>('rotate');
  const [isMouseMoveLook, setIsMouseMoveLook] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // AI Park Generator & Assistant State
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [aiToastMessage, setAiToastMessage] = useState<string | null>(null);

  const handleGenerateRealisticMegaPark = () => {
    const megaPark = createRealisticMegaPark();
    setSceneData(megaPark);
    if (megaPark.objects.length > 0) {
      setSelectedId(megaPark.objects[0].id);
    }
    setIsCinematicActive(false);
    setIsRideCamActive(false);
    canvasRef.current?.setCameraPreset('aerial');
    setAiToastMessage(
      '✨ Generated Complete Realistic 3D Mega Theme Park (Reference Composition): Central Fantasy Castle, Lake & Bridges, Thunderbolt & Timber Coasters, Ferris Wheel, Mountain Adventure, Wonderla Water Park, Promenades & Visitor Crowds!'
    );
    projectApi.aiGenerateLayout('Generate a complete amusement park like the uploaded reference image').catch(console.error);
    setTimeout(() => setAiToastMessage(null), 8000);
  };

  const handleApplyAIPrompt = (promptToRun?: string) => {
    const text = (promptToRun || aiPromptInput).trim();
    if (!text) return;

    const lower = text.toLowerCase();
    if (
      lower.includes('mega') ||
      lower.includes('reference') ||
      lower.includes('like the uploaded') ||
      lower.includes('realistic mega')
    ) {
      handleGenerateRealisticMegaPark();
      setAiPromptInput('');
      setShowAIAssistant(false);
      return;
    }

    const isFullDesign =
      lower.startsWith('design') ||
      lower.startsWith('generate') ||
      lower.startsWith('create a complete') ||
      lower.includes('style amusement park') ||
      lower.includes('water park resort') ||
      lower.includes('cyber') ||
      lower.includes('wonderla') ||
      lower.includes('fantasy kingdom');

    if (isFullDesign) {
      const generated = generateAIParkLayoutFromPrompt(text);
      setSceneData(generated);
      if (generated.objects.length > 0) {
        setSelectedId(generated.objects[0].id);
      }
      canvasRef.current?.setCameraPreset('aerial');
      setAiToastMessage(
        `AI Layout Engine: Synthesized structured 3D masterplan for "${text}" featuring ${generated.objects.length} zoned attractions & architecture!`
      );
      // Synchronize with backend
      projectApi.aiGenerateLayout(text).catch(console.error);
    } else {
      const res = applyAIInstructionToPark(sceneData, text);
      setSceneData(res.scene);
      setAiToastMessage(`AI Assistant: ${res.message}`);
      // Synchronize with backend
      projectApi.aiEditLayout(text).catch(console.error);
    }

    setAiPromptInput('');
    setShowAIAssistant(false);
    setTimeout(() => setAiToastMessage(null), 7000);
  };

  // Fetch remote scene if available on mount
  useEffect(() => {
    projectApi
      .getScene(projectId)
      .then((res) => {
        if (res.scene_data) {
          try {
            const parsed = JSON.parse(res.scene_data);
            if (parsed.objects && Array.isArray(parsed.objects)) {
              setSceneData(parsed);
              if (parsed.objects.length > 0 && !selectedId) {
                setSelectedId(parsed.objects[0].id);
              }
            }
          } catch (e) {
            console.error('Error loading scene data:', e);
          }
        }
      })
      .catch(console.error);
  }, [projectId]);

  const selectedObject = sceneData.objects.find((o) => o.id === selectedId) || null;

  // Save Scene to Backend
  const handleSaveScene = async () => {
    setSaving(true);
    try {
      const json = JSON.stringify(sceneData);
      await projectApi.saveScene(projectId, json);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      alert('Failed to save scene: ' + (e.message || e));
    } finally {
      setSaving(false);
    }
  };

  // Add Attraction
  const handleAddAttraction = (type: AttractionType) => {
    setShowAddPanel(false);
    // Offset slightly so multiple attractions don't spawn exactly atop each other
    const count = sceneData.objects.length;
    const offsetX = (count % 4) * 22 - 20;
    const offsetZ = Math.floor(count / 4) * 25 - 15;

    const newObj = generateDefaultObject(type, [offsetX, 0, offsetZ]);
    setSceneData((prev) => ({
      ...prev,
      objects: [...prev.objects, newObj],
    }));
    setSelectedId(newObj.id);

    // If adding Custom Architecture, open the Floor-Plan Editor directly!
    if (type === 'Custom Architecture') {
      setEditingFloorPlan(newObj as CustomArchitectureObject);
    }
  };

  // Object Operations
  const handleUpdateObject = (updated: SceneObject) => {
    setSceneData((prev) => ({
      ...prev,
      objects: prev.objects.map((o) => (o.id === updated.id ? updated : o)),
    }));
  };

  const handleDuplicateObject = (obj: SceneObject) => {
    const clone: SceneObject = {
      ...obj,
      id: `obj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${obj.name} (Copy)`,
      position: [obj.position[0] + 8, obj.position[1], obj.position[2] + 8],
    };
    setSceneData((prev) => ({
      ...prev,
      objects: [...prev.objects, clone],
    }));
    setSelectedId(clone.id);
  };

  const handleDeleteObject = (id: string) => {
    setSceneData((prev) => ({
      ...prev,
      objects: prev.objects.filter((o) => o.id !== id),
    }));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  // Export Snapshot PNG
  const handleSnapshotPNG = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.captureSnapshot();
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${projectTitle.toLowerCase().replace(/\s+/g, '_')}_3d_snapshot.png`;
    link.click();
    setShowExportMenu(false);
  };

  // Export GLB
  const handleExportGLB = (onlySelected: boolean) => {
    if (!canvasRef.current) return;
    canvasRef.current.exportGLB(onlySelected);
    setShowExportMenu(false);
  };

  // AI Concept Render from 3D Viewport
  const handleAIConceptRender = async () => {
    if (!canvasRef.current || !onGoToGenerationStudioWithSketch) return;

    setRenderingAI(true);
    try {
      // 1. Capture clean 3D snapshot
      const dataUrl = canvasRef.current.captureSnapshot();
      if (!dataUrl) throw new Error('Could not capture viewport frame.');

      // Convert dataUrl to File
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${projectTitle}_3d_view.png`, { type: 'image/png' });

      // 2. Upload snapshot directly to backend sketch pipeline
      const uploadedSketch = await sketchApi.upload(projectId, file, 100, 200);

      // 3. Synthesize rich thematic prompt from all actual scene objects
      const suggestedPrompt = buildScenePrompt(sceneData, projectTitle);

      // 4. Save current scene first so edits are preserved
      await projectApi.saveScene(projectId, JSON.stringify(sceneData));

      // 5. Navigate to Generation Studio
      onGoToGenerationStudioWithSketch(uploadedSketch, suggestedPrompt);
    } catch (e: any) {
      alert('AI Render initialization failed: ' + (e.message || e));
    } finally {
      setRenderingAI(false);
    }
  };

  const handleToggleAutoRotate = () => {
    const active = canvasRef.current?.toggleAutoRotate() || false;
    setIsAutoRotating(active);
  };
  const handleZoomIn = () => canvasRef.current?.zoomIn();
  const handleZoomOut = () => canvasRef.current?.zoomOut();
  const handleRotateLeft = () => canvasRef.current?.rotateLeft();
  const handleRotateRight = () => canvasRef.current?.rotateRight();
  const handleTiltUp = () => canvasRef.current?.tiltUp();
  const handleTiltDown = () => canvasRef.current?.tiltDown();
  const handlePan = (dx: number, dy: number) => canvasRef.current?.pan(dx, dy);
  const handleFocusSelected = () => canvasRef.current?.focusOnSelected();
  const handleResetCamera = () => {
    canvasRef.current?.autoFramePark();
    setActiveCameraPreset('aerial');
    setIsCinematicActive(false);
    setIsRideCamActive(false);
  };
  const handleToggleMouseMoveLook = () => {
    const next = canvasRef.current?.toggleMouseMoveLook() || false;
    setIsMouseMoveLook(next);
  };

  const attractionTypesList: AttractionType[] = [
    'Roller Coaster',
    'Ferris Wheel',
    'Water Ride',
    'Carousel',
    'Drop Tower',
    'Custom Architecture',
  ];

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col bg-slate-950 overflow-hidden relative select-none">
      {/* Top Floating Control Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-5 py-2.5 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Back to Project Hub"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">{projectTitle}</h2>
              <span className="text-[10px] bg-purple-900/60 text-purple-300 border border-purple-700/60 px-2 py-0.5 rounded-full font-medium">
                3D Theme Park Designer
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {sceneData.objects.length} attraction{sceneData.objects.length === 1 ? '' : 's'} placed
              • Procedural 3D WebGL
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* MASTER DEMONSTRATION BUTTON: GENERATE REALISTIC MEGA THEME PARK */}
          <button
            onClick={handleGenerateRealisticMegaPark}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white rounded-xl text-xs font-black tracking-wide transition shadow-lg shadow-rose-600/40 border border-amber-300/50 hover:scale-[1.02] active:scale-[0.98]"
            title="Generate a complete realistic 3D amusement park based on the reference image composition"
          >
            <Sparkles className="w-4 h-4 text-yellow-200 animate-pulse" />
            <span className="hidden sm:inline">GENERATE REALISTIC MEGA THEME PARK</span>
            <span className="sm:hidden">MEGA PARK</span>
          </button>

          {/* AI Park Generator Assistant Button */}
          <button
            onClick={() => setShowAIAssistant(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-600/30 border border-purple-400/30"
            title="AI Theme Park Design & Natural Language Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden md:inline">AI Park Assistant</span>
          </button>

          {/* Add to Park Button */}
          <button
            onClick={() => {
              setShowAddPanel(true);
              setShowExportMenu(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">Add Attraction</span>
          </button>

          {/* Camera Presets Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] text-slate-300">
            <button
              onClick={() => {
                canvasRef.current?.setCameraPreset('aerial');
                setActiveCameraPreset('aerial');
                setIsCinematicActive(false);
              }}
              className={`px-2 py-1 rounded-lg transition font-medium ${
                activeCameraPreset === 'aerial' && !isCinematicActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'hover:text-white hover:bg-slate-800 text-amber-300/80'
              }`}
              title="Aerial View (Elevated Diagonal Perspective - Reference Target)"
            >
              Aerial
            </button>
            <button
              onClick={() => {
                canvasRef.current?.setCameraPreset('birdseye');
                setActiveCameraPreset('birdseye');
                setIsCinematicActive(false);
              }}
              className={`px-2 py-1 rounded-lg transition font-medium ${
                activeCameraPreset === 'birdseye' && !isCinematicActive
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                  : 'hover:text-white hover:bg-slate-800'
              }`}
              title="Bird's-Eye View (High 60° Overhead)"
            >
              Bird's-Eye
            </button>
            <button
              onClick={() => {
                canvasRef.current?.setCameraPreset('top');
                setActiveCameraPreset('top');
                setIsCinematicActive(false);
              }}
              className={`px-2 py-1 rounded-lg transition font-medium ${
                activeCameraPreset === 'top' && !isCinematicActive
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                  : 'hover:text-white hover:bg-slate-800'
              }`}
              title="Top View (Direct 90° Masterplan)"
            >
              Top
            </button>
            <button
              onClick={() => {
                canvasRef.current?.setCameraPreset('walkthrough');
                setActiveCameraPreset('walkthrough');
                setIsCinematicActive(false);
              }}
              className={`px-2 py-1 rounded-lg transition font-medium ${
                activeCameraPreset === 'walkthrough' && !isCinematicActive
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                  : 'hover:text-white hover:bg-slate-800 text-emerald-400'
              }`}
              title="Ground-Level Walkthrough (Use WASD / Arrow Keys to Walk)"
            >
              Walk
            </button>
            <button
              onClick={() => {
                const active = canvasRef.current?.toggleCinematicTour() || false;
                setIsCinematicActive(active);
                if (active) setActiveCameraPreset('cinematic');
              }}
              className={`px-2 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
                isCinematicActive
                  ? 'bg-purple-600 text-white shadow'
                  : 'hover:text-white hover:bg-slate-800 text-purple-300'
              }`}
              title="Cinematic Tour (Automated 360° Aerial Flight)"
            >
              <Play className="w-3 h-3" />
              <span>Tour</span>
            </button>

            {/* Free 360° Auto-Rotate Toggle */}
            <button
              onClick={handleToggleAutoRotate}
              className={`px-2 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
                isAutoRotating
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'hover:text-white hover:bg-slate-800 text-slate-300'
              }`}
              title="Toggle Free 360° Auto-Rotation"
            >
              <RotateCw className={`w-3 h-3 ${isAutoRotating ? 'animate-spin text-amber-300' : ''}`} />
              <span className="hidden xl:inline">Free Rotate</span>
            </button>

            {/* Pure Mouse Movement Look Toggle */}
            <button
              onClick={handleToggleMouseMoveLook}
              className={`px-2 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
                isMouseMoveLook
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'hover:text-white hover:bg-slate-800 text-slate-300'
              }`}
              title="Toggle Pure Mouse Movement Look (Move mouse across screen to rotate & look around)"
            >
              <MousePointer className={`w-3 h-3 ${isMouseMoveLook ? 'text-cyan-300' : ''}`} />
              <span className="hidden xl:inline">{isMouseMoveLook ? 'Mouse Look ON' : 'Mouse Look'}</span>
            </button>
          </div>

          {/* Lighting Mode Toggle (Daylight / Sunset / Night) */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSceneData((s) => ({ ...s, lightingMode: 'daylight' }))}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
                sceneData.lightingMode === 'daylight'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Daylight Lighting (Crisp Sun & Sharp Shadows)"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSceneData((s) => ({ ...s, lightingMode: 'sunset' }))}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
                sceneData.lightingMode === 'sunset'
                  ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Sunset Lighting (Golden Hour Amber & Purple)"
            >
              <Sunset className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSceneData((s) => ({ ...s, lightingMode: 'night' }))}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
                sceneData.lightingMode === 'night'
                  ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Night Mode (Glowing Neon Rides & Starry Sky)"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Ride Camera (Coaster Follower) */}
          <button
            onClick={() => canvasRef.current?.toggleRideCamera()}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
              isRideCamActive
                ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="First-Person Roller Coaster Ride Camera"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isRideCamActive ? 'Exit Ride Cam' : 'Ride Cam'}</span>
          </button>

          {/* Save Scene */}
          <button
            onClick={handleSaveScene}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
          >
            {saveSuccess ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            ) : saving ? (
              <span className="text-slate-400">Saving…</span>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" /> Save
              </>
            )}
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowExportMenu(!showExportMenu);
                setShowAddPanel(false);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-2xl p-1.5 shadow-2xl z-50 text-xs">
                <button
                  onClick={handleSnapshotPNG}
                  className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Snapshot View (PNG)</span>
                </button>
                <button
                  onClick={() => handleExportGLB(false)}
                  className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2"
                >
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Full Park (GLB 3D)</span>
                </button>
                {selectedObject && (
                  <button
                    onClick={() => handleExportGLB(true)}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Selected Object (GLB)</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* AI Concept Render Action Button */}
          <button
            onClick={handleAIConceptRender}
            disabled={renderingAI}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-600/30"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{renderingAI ? 'Capturing 3D…' : 'AI Concept Render'}</span>
          </button>
        </div>
      </div>

      {/* AI Interpretation Feedback Notification Banner */}
      {aiToastMessage && (
        <div className="bg-gradient-to-r from-purple-900/90 to-indigo-900/90 border-b border-purple-500/40 px-6 py-2.5 flex items-center justify-between text-xs text-purple-100 z-30 shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span className="font-medium">{aiToastMessage}</span>
          </div>
          <button
            onClick={() => setAiToastMessage(null)}
            className="text-purple-300 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-purple-800/50"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main 3D Canvas Viewport + Overlay Sidebars */}
      <div className="flex-1 relative overflow-hidden">
        {/* Three.js Canvas */}
        <ParkCanvas
          ref={canvasRef}
          sceneData={sceneData}
          selectedId={selectedId}
          onSelectObject={setSelectedId}
          onRideCameraChange={setIsRideCamActive}
          onMouseMoveLookChange={setIsMouseMoveLook}
        />

        {/* Left Floating Outliner Panel */}
        <div
          className={`absolute top-4 left-4 z-20 transition-all duration-300 w-64 ${
            leftSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-72 opacity-0 pointer-events-none'
          }`}
        >
          <Outliner
            objects={sceneData.objects}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAddAttraction={handleAddAttraction}
            onDelete={handleDeleteObject}
          />
        </div>

        {/* Toggle button for left panel */}
        <button
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="absolute top-4 left-2 z-20 p-1.5 bg-slate-900/90 text-slate-400 hover:text-white rounded-r-xl border-y border-r border-slate-800 backdrop-blur"
          title={leftSidebarOpen ? 'Hide Attractions List' : 'Show Attractions List'}
        >
          {leftSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Right Floating Property Inspector Panel */}
        <div
          className={`absolute top-4 right-4 z-20 transition-all duration-300 w-80 max-h-[85vh] overflow-y-auto ${
            rightSidebarOpen ? 'translate-x-0 opacity-100' : 'translate-x-88 opacity-0 pointer-events-none'
          }`}
        >
          <AttractionInspector
            selectedObject={selectedObject}
            onChange={handleUpdateObject}
            onDuplicate={handleDuplicateObject}
            onDelete={handleDeleteObject}
            onOpenFloorPlanEditor={(arch) => setEditingFloorPlan(arch)}
          />
        </div>

        {/* Toggle button for right panel */}
        <button
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          className="absolute top-4 right-2 z-20 p-1.5 bg-slate-900/90 text-slate-400 hover:text-white rounded-l-xl border-y border-l border-slate-800 backdrop-blur"
          title={rightSidebarOpen ? 'Hide Inspector' : 'Show Inspector'}
        >
          {rightSidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Walkthrough Mode Prompt Banner */}
        {activeCameraPreset === 'walkthrough' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-emerald-500/60 rounded-2xl px-5 py-2.5 text-xs text-emerald-300 shadow-2xl backdrop-blur flex items-center gap-3 z-30 animate-in fade-in slide-in-from-top-4 duration-300">
            <Footprints className="w-4 h-4 text-emerald-400 animate-bounce" />
            <div>
              <span className="font-bold text-white">Walkthrough Mode Active: </span>
              <span className="text-slate-300">
                Use <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-white font-mono text-[10px]">W</kbd>{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-white font-mono text-[10px]">A</kbd>{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-white font-mono text-[10px]">S</kbd>{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-white font-mono text-[10px]">D</kbd> or Arrow Keys to stroll • Drag to look around
              </span>
            </div>
            <button
              onClick={() => {
                canvasRef.current?.setCameraPreset('aerial');
                setActiveCameraPreset('aerial');
              }}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 transition"
            >
              Exit Walk
            </button>
          </div>
        )}

        {/* Pure Mouse Movement Look Active Banner */}
        {isMouseMoveLook && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-cyan-500/60 rounded-2xl px-5 py-2.5 text-xs text-cyan-300 shadow-2xl backdrop-blur flex items-center gap-3 z-30 animate-in fade-in slide-in-from-top-4 duration-300">
            <MousePointer className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div>
              <span className="font-bold text-white">Pure Mouse Look Active: </span>
              <span className="text-slate-300">
                Move mouse across screen to freely rotate & look around • Edge hover steers • Scroll to zoom
              </span>
            </div>
            <button
              onClick={handleToggleMouseMoveLook}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700 transition"
            >
              Exit Mouse Look
            </button>
          </div>
        )}

        {/* FLOATING INTERACTIVE CAMERA NAVIGATION & CONTROLS HUD */}
        <div
          className={`absolute bottom-14 z-20 flex flex-col items-end gap-2.5 transition-all duration-300 ${
            rightSidebarOpen ? 'right-[21.5rem]' : 'right-4'
          }`}
        >
          {/* Main Navigation Widget */}
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-2.5 shadow-2xl flex flex-col items-center gap-2">
            {/* Header: Mode Selector & Free Rotate / Mouse Move Toggles */}
            <div className="flex items-center gap-1.5 w-full justify-between pb-1.5 border-b border-slate-800/80">
              <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                <button
                  onClick={() => setHudNavMode('rotate')}
                  className={`px-2 py-0.5 rounded transition font-medium flex items-center gap-1 ${
                    hudNavMode === 'rotate' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Rotate & Look Around"
                >
                  <Compass className="w-3 h-3" /> Rotate
                </button>
                <button
                  onClick={() => setHudNavMode('pan')}
                  className={`px-2 py-0.5 rounded transition font-medium flex items-center gap-1 ${
                    hudNavMode === 'pan' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Pan & Move Position"
                >
                  <Move className="w-3 h-3" /> Pan
                </button>
              </div>

              <div className="flex items-center gap-1">
                {/* Pure Mouse Movement Look Button */}
                <button
                  onClick={handleToggleMouseMoveLook}
                  className={`p-1.5 rounded-lg transition text-[11px] font-semibold flex items-center gap-1 ${
                    isMouseMoveLook
                      ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/60 shadow-sm'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                  }`}
                  title={isMouseMoveLook ? 'Disable Mouse Movement Look' : 'Enable Pure Mouse Movement Look (Just move mouse to rotate & look around)'}
                >
                  <MousePointer className={`w-3.5 h-3.5 ${isMouseMoveLook ? 'text-cyan-300 animate-pulse' : ''}`} />
                </button>

                {/* Free 360° Auto-Rotate Button */}
                <button
                  onClick={handleToggleAutoRotate}
                  className={`p-1.5 rounded-lg transition text-[11px] font-semibold flex items-center gap-1 ${
                    isAutoRotating
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                  }`}
                  title={isAutoRotating ? 'Stop Free 360° Rotation' : 'Start Free 360° Auto-Rotation'}
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin text-amber-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* D-Pad for Rotation / Look or Pan */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Up / Look Up / Pan Forward */}
              <button
                onClick={() => (hudNavMode === 'rotate' ? handleTiltUp() : handlePan(0, 10))}
                className="absolute top-0 w-8 h-8 bg-slate-800 hover:bg-slate-700 active:bg-purple-600 text-slate-200 rounded-lg flex items-center justify-center shadow transition border border-slate-700/60"
                title={hudNavMode === 'rotate' ? 'Tilt / Look Up' : 'Pan Forward'}
              >
                <ArrowUp className="w-4 h-4" />
              </button>

              {/* Left / Rotate Left / Pan Left */}
              <button
                onClick={() => (hudNavMode === 'rotate' ? handleRotateLeft() : handlePan(-10, 0))}
                className="absolute left-0 w-8 h-8 bg-slate-800 hover:bg-slate-700 active:bg-purple-600 text-slate-200 rounded-lg flex items-center justify-center shadow transition border border-slate-700/60"
                title={hudNavMode === 'rotate' ? 'Rotate / Look Left' : 'Pan Left'}
              >
                {hudNavMode === 'rotate' ? <RotateCcw className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              </button>

              {/* Center Button: Home / Reset View */}
              <button
                onClick={handleResetCamera}
                className="w-8 h-8 bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white rounded-lg flex items-center justify-center shadow transition border border-purple-500/40"
                title="Reset Camera to Aerial View (Reference Angle)"
              >
                <Home className="w-4 h-4" />
              </button>

              {/* Right / Rotate Right / Pan Right */}
              <button
                onClick={() => (hudNavMode === 'rotate' ? handleRotateRight() : handlePan(10, 0))}
                className="absolute right-0 w-8 h-8 bg-slate-800 hover:bg-slate-700 active:bg-purple-600 text-slate-200 rounded-lg flex items-center justify-center shadow transition border border-slate-700/60"
                title={hudNavMode === 'rotate' ? 'Rotate / Look Right' : 'Pan Right'}
              >
                {hudNavMode === 'rotate' ? <RotateCw className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              {/* Down / Tilt Down / Pan Backward */}
              <button
                onClick={() => (hudNavMode === 'rotate' ? handleTiltDown() : handlePan(0, -10))}
                className="absolute bottom-0 w-8 h-8 bg-slate-800 hover:bg-slate-700 active:bg-purple-600 text-slate-200 rounded-lg flex items-center justify-center shadow transition border border-slate-700/60"
                title={hudNavMode === 'rotate' ? 'Tilt / Look Down' : 'Pan Backward'}
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom & Focus Controls Bar */}
            <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-800/80 w-full justify-center">
              <button
                onClick={handleZoomIn}
                className="flex-1 py-1 px-2 bg-slate-800 hover:bg-slate-700 active:bg-purple-600 text-slate-200 rounded-lg flex items-center justify-center gap-1 text-xs font-semibold shadow transition border border-slate-700/60"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-3.5 h-3.5 text-sky-400" />
                <span>+</span>
              </button>
              <button
                onClick={handleZoomOut}
                className="flex-1 py-1 px-2 bg-slate-800 hover:bg-slate-700 active:bg-purple-600 text-slate-200 rounded-lg flex items-center justify-center gap-1 text-xs font-semibold shadow transition border border-slate-700/60"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-3.5 h-3.5 text-sky-400" />
                <span>-</span>
              </button>
              <button
                onClick={handleFocusSelected}
                disabled={!selectedId}
                className={`p-1.5 rounded-lg flex items-center justify-center shadow transition border ${
                  selectedId
                    ? 'bg-purple-600/30 hover:bg-purple-600 text-purple-200 border-purple-500/50'
                    : 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
                }`}
                title={selectedId ? 'Focus & Center on Selected Attraction' : 'Select an attraction first to focus'}
              >
                <Target className="w-3.5 h-3.5 text-purple-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Helper Bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur px-5 py-1.5 rounded-full border border-slate-800 text-[11px] text-slate-400 flex items-center gap-3 z-10 pointer-events-none">
          <span>Move Mouse: Free Look</span>
          <span>•</span>
          <span>Left-Drag: Orbit</span>
          <span>•</span>
          <span>Right-Drag: Pan</span>
          <span>•</span>
          <span>Scroll / Buttons: Zoom</span>
          <span>•</span>
          <span>Double-Click: Focus</span>
          <span>•</span>
          <span>WASD: Walk</span>
        </div>
      </div>

      {/* Custom Architecture Floor-Plan Editor Modal */}
      {editingFloorPlan && (
        <FloorPlanEditor
          building={editingFloorPlan}
          onChange={(updated) => {
            setEditingFloorPlan(updated);
            handleUpdateObject(updated);
          }}
          onClose={() => setEditingFloorPlan(null)}
        />
      )}

      {/* Add to Park Palette Modal */}
      {showAddPanel && (
        <AddToParkPanel
          onSelect={handleAddAttraction}
          onClose={() => setShowAddPanel(false)}
        />
      )}

      {/* AI Park Assistant & Natural Language Layout Modal */}
      {showAIAssistant && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-purple-500/50 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-950/60 to-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="bg-purple-600/30 text-purple-300 p-2 rounded-xl border border-purple-500/40">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    AI Theme Park Designer &amp; Layout Engine
                  </h3>
                  <p className="text-xs text-slate-400">
                    Describe a theme park or prompt layout revisions in natural language
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAIAssistant(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              {/* Reference Image Hero Banner */}
              <div className="p-4 bg-gradient-to-r from-purple-950/80 via-rose-950/60 to-slate-900 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                      REFERENCE IMAGE TARGET
                    </span>
                    <span className="text-xs text-slate-400">Master Theme Park Architecture</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white">Realistic 3D Mega Amusement Park</h4>
                  <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                    Central Fantasy Castle, surrounding lake &amp; fountains, high-speed looping coaster, timber wooden coaster, skyline Ferris wheel, canyon mountain adventure zone, Wonderla water park, and promenades.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateRealisticMegaPark}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white rounded-xl text-xs font-black transition shadow-lg shadow-rose-600/30 whitespace-nowrap flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-yellow-200" />
                  <span>GENERATE MEGA PARK</span>
                </button>
              </div>

              {/* Natural Language Prompt Area */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Natural Language Design Instruction
                </label>
                <textarea
                  rows={3}
                  value={aiPromptInput}
                  onChange={(e) => setAiPromptInput(e.target.value)}
                  placeholder="e.g. Generate a complete amusement park like the uploaded reference image, or type 'Make the castle bigger', 'Add more roller coasters behind the castle'..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
                />
              </div>

              {/* Quick AI Park Masterplan Presets */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
                  Complete Theme Park Masterplan Presets
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      label: 'Realistic Mega Theme Park',
                      icon: '🏰',
                      desc: 'Reference Image Composition (Castle, Lake, Dual Coasters, Mountain & Waterpark)',
                      prompt:
                        'Generate a complete amusement park like the uploaded reference image with central castle, lake, dual coasters, Ferris wheel, mountain adventure, and water park.',
                    },
                    {
                      label: 'Wonderla Mega Park',
                      icon: '🎡',
                      desc: 'Amusement & Water Park with thrill coasters and family rides',
                      prompt:
                        'Design a large Wonderla-style amusement park containing multiple roller coasters, water rides, family attractions, kids zones, restaurants, gardens, pedestrian pathways, entrance gates, parking areas, and a realistic 3D environment.',
                    },
                    {
                      label: 'Neo-City 2099 Cyberpark',
                      icon: '🚀',
                      desc: 'Futuristic sci-fi park with hyper coasters and quantum drop towers',
                      prompt:
                        'Create a complete futuristic sci-fi theme park with magnetic hyper coasters, quantum drop tower, holosphere vista wheel, cyber portals, and neon lighting.',
                    },
                    {
                      label: 'Aqua Paradise Water Resort',
                      icon: '🌊',
                      desc: 'Tropical water park with multi-slide towers and wave pool',
                      prompt:
                        'Design a tropical water park with multi-slide towers, tidal wave pool, lazy river, palm tree landscaping, and cabana facilities.',
                    },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleApplyAIPrompt(preset.prompt)}
                      className="p-3 bg-slate-950 border border-slate-800 hover:border-purple-500/70 hover:bg-slate-800/50 rounded-xl text-left transition flex items-start gap-2.5 group"
                    >
                      <span className="text-xl">{preset.icon}</span>
                      <div className="min-w-0">
                        <span className="block font-semibold text-xs text-slate-200 group-hover:text-purple-300 truncate">
                          {preset.label}
                        </span>
                        <span className="text-[10px] text-slate-500 line-clamp-1">
                          {preset.desc}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Natural-Language Editing Commands */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
                  AI-Assisted Layout Modifications (Natural Language Commands)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Generate a complete amusement park like the uploaded reference image.',
                    'Make the castle bigger.',
                    'Add more roller coasters behind the castle.',
                    'Create a giant water park on the right.',
                    'Add more restaurants and buildings.',
                    'Increase the number of trees.',
                    'Make the park more realistic.',
                    'Add a mountain roller coaster.',
                    'Change the park to sunset lighting.',
                    'Change the park to night lighting.',
                    'Change the park to daylight.',
                    'Add a large Ferris wheel near the entrance.',
                    'Place a tiered central water fountain.',
                  ].map((cmd) => (
                    <button
                      key={cmd}
                      type="button"
                      onClick={() => handleApplyAIPrompt(cmd)}
                      className="text-[11px] bg-slate-950 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg transition text-left"
                    >
                      + {cmd}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/80">
              <span className="text-xs text-slate-400">
                AI interprets design commands &amp; generates coordinate-zoned 3D elements
              </span>
              <button
                type="button"
                onClick={() => handleApplyAIPrompt()}
                disabled={!aiPromptInput.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-600/30"
              >
                <Sparkles className="w-4 h-4 text-amber-300" /> Apply AI Design
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
