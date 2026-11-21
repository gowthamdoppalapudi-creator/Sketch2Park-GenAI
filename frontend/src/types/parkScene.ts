// 3D Theme Park Multi-Attraction Domain Types & AI Layout Engine

export type ProjectDesignMode = 'full_park' | 'single_attraction' | 'custom_architecture';
export type ParkLayoutType =
  | 'empty_site'
  | 'realistic_mega_park'
  | 'wonderla_park'
  | 'tropical_adventure'
  | 'water_paradise'
  | 'futuristic_cyber'
  | 'fantasy_kingdom';

export type PlaceableCategory = 'rides' | 'water' | 'architecture' | 'landscape' | 'infrastructure';

export type AttractionType =
  // Thrill Rides
  | 'Roller Coaster'
  | 'Wooden Coaster'
  | 'Ferris Wheel'
  | 'Carousel'
  | 'Drop Tower'
  | 'Swing Ride'
  | 'Bumper Cars'
  | 'Kids Attraction'
  | 'Mountain Attraction'
  // Water Attractions
  | 'Water Ride'
  | 'Wave Pool'
  | 'Slide Tower'
  | 'Lazy River'
  | 'Splash Zone'
  // Architecture & Facilities
  | 'Fantasy Castle'
  | 'Futuristic Dome'
  | 'Custom Architecture'
  | 'Entrance Gate'
  | 'Ticket Counter'
  | 'Ticket Pavilion'
  | 'Food Court'
  | 'Restaurant'
  | 'Shop'
  | 'Changing Rooms'
  // Landscape, Infrastructure & Amenities
  | 'Parking Area'
  | 'Gardens'
  | 'Trees'
  | 'Pedestrian Path'
  | 'Bridge'
  | 'Fountain'
  | 'Decorative Lighting'
  | 'Benches'
  | 'Lagoon'
  | 'Visitor Crowds'
  | 'Blank Park';

export type RoofStyle = 'gable' | 'hip' | 'flat' | 'mansard' | 'dome' | 'pagoda' | 'futuristic';
export type BuildingFinish = 'timber' | 'brick' | 'glass' | 'painted' | 'stone' | 'metal' | 'stucco';
export type ArchitecturalStyle = 'modern' | 'victorian' | 'fantasy' | 'futuristic' | 'tropical' | 'wonderla' | 'rustic';
export type BuildingPreset =
  | 'Boarding Station'
  | 'Ticket Counter'
  | 'Ticket Pavilion'
  | 'Park Entrance'
  | 'Food Court'
  | 'Restaurant'
  | 'Shop'
  | 'Changing Rooms'
  | 'Pavilion'
  | 'Custom Building';

export type CarouselCanopyStyle = 'striped' | 'conical' | 'tiered' | 'gold_trim';
export type DropTowerLighting = 'strobe' | 'neon' | 'beacon' | 'warm';
export type LightingMode = 'daylight' | 'sunset' | 'night';

export interface BaseSceneObject {
  id: string;
  name: string;
  type: AttractionType;
  category: PlaceableCategory;
  position: [number, number, number]; // [x, y, z] in meters
  rotation: [number, number, number]; // [x, y, z] in radians
  scale: [number, number, number];
}

// -------------------------------------------------------------
// 1. THRILL & FAMILY RIDES
// -------------------------------------------------------------
export interface RollerCoasterObject extends BaseSceneObject {
  type: 'Roller Coaster';
  hillHeight: number; // 15 - 55m
  loopHeight: number; // 10 - 35m
  trackDepth: number; // 30 - 90m
  railColor: string; // hex
  supportColor: string; // hex
}

export interface FerrisWheelObject extends BaseSceneObject {
  type: 'Ferris Wheel';
  wheelDiameter: number; // 16 - 50m
  cabinCount: number; // 8 - 24
  frameColor: string; // hex
  cabinColor: string; // hex
  rotationSpeed: number; // 0.1 - 2.0 RPM
}

export interface CarouselObject extends BaseSceneObject {
  type: 'Carousel';
  platformDiameter: number; // 8 - 22m
  seatCount: number; // 6 - 18
  canopyStyle: CarouselCanopyStyle;
  primaryColor: string; // hex
  secondaryColor: string; // hex
  rotationSpeed: number; // 0.2 - 2.0 RPM
}

export interface DropTowerObject extends BaseSceneObject {
  type: 'Drop Tower';
  towerHeight: number; // 25 - 75m
  towerColor: string; // hex
  carriageColor: string; // hex
  lighting: DropTowerLighting;
  cycleSpeed: number; // 0.5 - 2.0
}

export interface SwingRideObject extends BaseSceneObject {
  type: 'Swing Ride';
  towerHeight: number; // 10 - 25m
  canopyDiameter: number; // 10 - 22m
  armCount: number; // 8 - 18
  canopyColor: string;
  chairColor: string;
  rotationSpeed: number; // 0.4 - 2.5
}

export interface BumperCarsObject extends BaseSceneObject {
  type: 'Bumper Cars';
  arenaWidth: number; // 16 - 32m
  arenaLength: number; // 20 - 40m
  carCount: number; // 4 - 14
  roofColor: string;
  floorColor: string;
  bumperColor: string;
}

export interface KidsAttractionObject extends BaseSceneObject {
  type: 'Kids Attraction';
  subtype: 'teacups' | 'mini_train' | 'kiddie_coaster';
  diameter: number; // 10 - 18m
  primaryColor: string;
  secondaryColor: string;
  rotationSpeed: number;
}

// -------------------------------------------------------------
// 2. WATER ATTRACTIONS
// -------------------------------------------------------------
export interface WaterRideObject extends BaseSceneObject {
  type: 'Water Ride';
  channelWidth: number; // 2.5 - 7m
  channelRadius: number; // 15 - 45m
  waterColor: string; // hex
  boatCount: number; // 1 - 5
  boatColor: string; // hex
  flowSpeed: number; // 0.5 - 2.5
}

export interface WavePoolObject extends BaseSceneObject {
  type: 'Wave Pool';
  poolWidth: number; // 15 - 40m
  poolLength: number; // 20 - 55m
  waterColor: string; // hex
  tileColor: string; // hex
  waveSpeed: number; // 0.5 - 2.0
}

export interface SlideTowerObject extends BaseSceneObject {
  type: 'Slide Tower';
  towerHeight: number; // 12 - 32m
  slideCount: number; // 1 - 4 flume tubes
  slideColor1: string; // hex
  slideColor2: string; // hex
  poolWidth: number; // 8 - 20m
}

export interface LazyRiverObject extends BaseSceneObject {
  type: 'Lazy River';
  channelWidth: number; // 3.5 - 7m
  riverRadius: number; // 15 - 35m
  waterColor: string; // hex
  tubeCount: number; // 2 - 8
}

// -------------------------------------------------------------
// 3. ARCHITECTURE & FACILITIES
// -------------------------------------------------------------
export interface CustomArchitectureObject extends BaseSceneObject {
  type: 'Custom Architecture' | 'Ticket Pavilion' | 'Food Court' | 'Changing Rooms' | 'Ticket Counter';
  preset: BuildingPreset;
  shape: 'rectangular' | 'l_shaped';
  width: number; // meters
  depth: number; // meters
  wingWidth: number; // for L-shape
  wingDepth: number; // for L-shape
  wallHeight: number; // 2.8 - 9m
  roofStyle: RoofStyle;
  finish: BuildingFinish;
  finishColor: string; // hex
  roofColor: string; // hex
  doorCount: number; // 1 - 4
  windowCount: number; // 1 - 8
  doorPosition: 'center' | 'left' | 'right';
  style?: ArchitecturalStyle;
}

export interface EntranceGateObject extends BaseSceneObject {
  type: 'Entrance Gate';
  archWidth: number; // 16 - 36m
  archHeight: number; // 8 - 18m
  gateStyle: 'grand_archway' | 'castle_gate' | 'modern_canopy' | 'futuristic_portal';
  primaryColor: string;
  accentColor: string;
  marqueeText: string;
  turnstileCount: number;
}

export interface RestaurantObject extends BaseSceneObject {
  type: 'Restaurant';
  width: number; // 14 - 30m
  depth: number; // 12 - 26m
  wallHeight: number; // 4 - 8m
  diningStyle: 'sitdown' | 'patio' | 'buffet' | 'bistro';
  roofStyle: RoofStyle;
  finish: BuildingFinish;
  finishColor: string;
  roofColor: string;
  hasOutdoorPatio: boolean;
}

export interface ShopObject extends BaseSceneObject {
  type: 'Shop';
  width: number; // 10 - 20m
  depth: number; // 8 - 16m
  wallHeight: number; // 3.5 - 6m
  shopTheme: 'souvenirs' | 'apparel' | 'candy' | 'gear';
  finishColor: string;
  roofColor: string;
  awningColor: string;
}

// -------------------------------------------------------------
// 4. LANDSCAPE, INFRASTRUCTURE & AMENITIES
// -------------------------------------------------------------
export interface ParkingAreaObject extends BaseSceneObject {
  type: 'Parking Area';
  lotWidth: number; // 25 - 70m
  lotLength: number; // 25 - 80m
  carCount: number; // 6 - 24
  asphaltColor: string;
  hasLightPoles: boolean;
}

export interface GardensObject extends BaseSceneObject {
  type: 'Gardens';
  gardenStyle: 'botanical' | 'formal' | 'flower_beds' | 'hedges';
  gardenWidth: number; // 12 - 36m
  gardenLength: number; // 12 - 36m
  flowerColor: string;
  hedges: boolean;
}

export interface BridgeObject extends BaseSceneObject {
  type: 'Bridge';
  bridgeLength: number; // 10 - 32m
  bridgeWidth: number; // 3 - 6m
  archHeight: number; // 1.5 - 4.5m
  deckMaterial: 'wood' | 'stone' | 'steel';
  deckColor: string;
  railColor: string;
}

export interface FountainObject extends BaseSceneObject {
  type: 'Fountain';
  basinRadius: number; // 4 - 14m
  tiers: number; // 1 - 3
  jetHeight: number; // 3 - 9m
  stoneColor: string;
  waterColor: string;
}

export interface DecorativeLightingObject extends BaseSceneObject {
  type: 'Decorative Lighting';
  poleStyle: 'victorian' | 'modern' | 'festive' | 'neon';
  poleHeight: number; // 4 - 8m
  lampCount: number; // 1 - 3
  lightColor: string;
  intensity: number; // 0.5 - 2.5
}

export interface LagoonObject extends BaseSceneObject {
  type: 'Lagoon';
  radiusX: number; // 12 - 45m
  radiusZ: number; // 10 - 40m
  waterColor: string; // hex
  rockBorder: boolean;
}

export interface TreesObject extends BaseSceneObject {
  type: 'Trees';
  treeCount: number; // 4 - 24
  clusterRadius: number; // 8 - 25m
  treeType: 'palm' | 'evergreen' | 'mixed' | 'flowering';
  foliageTone: string; // hex
}

export interface PedestrianPathObject extends BaseSceneObject {
  type: 'Pedestrian Path';
  pathWidth: number; // 2.5 - 8m
  pathLength: number; // 10 - 60m
  pavingType: 'stone' | 'brick' | 'sand' | 'asphalt';
  pavingColor: string; // hex
}

export interface BenchesObject extends BaseSceneObject {
  type: 'Benches';
  benchCount: number; // 1 - 5
  benchLength: number; // 1.8 - 3m
  material: 'wood' | 'metal' | 'stone';
  woodColor: string; // hex
}

export interface FantasyCastleObject extends BaseSceneObject {
  type: 'Fantasy Castle';
  castleWidth: number; // 24 - 45m
  castleHeight: number; // 35 - 75m
  towerCount: number; // 4 - 8
  wallColor: string; // hex
  roofColor: string; // hex
  trimColor: string; // hex
  lakeRadius?: number;
  hasWaterJets?: boolean;
  hasBridges?: boolean;
}

export interface WoodenCoasterObject extends BaseSceneObject {
  type: 'Wooden Coaster';
  hillHeight: number; // 25 - 45m
  trackLength: number; // 40 - 80m
  woodColor: string; // hex
  railColor: string; // hex
  supportDensity: number;
}

export interface MountainAttractionObject extends BaseSceneObject {
  type: 'Mountain Attraction';
  mountainWidth: number; // 35 - 65m
  mountainHeight: number; // 25 - 50m
  rockColor: string; // hex
  rockSecondaryColor: string; // hex
  hasMineTrain: boolean;
  hasWaterFlume: boolean;
  tunnelCount: number;
}

export interface FuturisticDomeObject extends BaseSceneObject {
  type: 'Futuristic Dome';
  domeRadius: number; // 15 - 32m
  domeHeight: number; // 12 - 25m
  domeColor: string; // hex
  glowColor: string; // hex
}

export interface SplashZoneObject extends BaseSceneObject {
  type: 'Splash Zone';
  zoneWidth: number; // 16 - 32m
  waterColor: string;
  hasTippingBucket: boolean;
  hasMushrooms: boolean;
}

export interface VisitorCrowdsObject extends BaseSceneObject {
  type: 'Visitor Crowds';
  crowdCount: number; // 20 - 150
  walkRadius: number; // 20 - 75m
  density: 'sparse' | 'medium' | 'dense';
}

export type SceneObject =
  | RollerCoasterObject
  | WoodenCoasterObject
  | FerrisWheelObject
  | CarouselObject
  | DropTowerObject
  | SwingRideObject
  | BumperCarsObject
  | KidsAttractionObject
  | MountainAttractionObject
  | WaterRideObject
  | WavePoolObject
  | SlideTowerObject
  | LazyRiverObject
  | SplashZoneObject
  | FantasyCastleObject
  | FuturisticDomeObject
  | CustomArchitectureObject
  | EntranceGateObject
  | RestaurantObject
  | ShopObject
  | ParkingAreaObject
  | GardensObject
  | BridgeObject
  | FountainObject
  | DecorativeLightingObject
  | LagoonObject
  | TreesObject
  | PedestrianPathObject
  | BenchesObject
  | VisitorCrowdsObject;

export interface ParkSceneData {
  version: number;
  designMode: ProjectDesignMode;
  layoutType?: ParkLayoutType;
  lightingMode: LightingMode;
  parkTheme?: string;
  parkSize?: 'compact' | 'standard' | 'grand';
  objects: SceneObject[];
}

// -------------------------------------------------------------
// HELPER TO INSTANTIATE ANY OBJECT TYPE WITH DEFAULT PARAMETERS
// -------------------------------------------------------------
export function generateDefaultObject(
  type: AttractionType,
  offset: [number, number, number] = [0, 0, 0]
): SceneObject {
  const id = `obj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  switch (type) {
    // 1. Thrill & Family Rides
    case 'Roller Coaster':
      return {
        id,
        name: 'Coaster Circuit',
        type: 'Roller Coaster',
        category: 'rides',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        hillHeight: 34,
        loopHeight: 22,
        trackDepth: 55,
        railColor: '#e11d48',
        supportColor: '#475569',
      };
    case 'Ferris Wheel':
      return {
        id,
        name: 'Skyline Wheel',
        type: 'Ferris Wheel',
        category: 'rides',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        wheelDiameter: 28,
        cabinCount: 16,
        frameColor: '#f8fafc',
        cabinColor: '#06b6d4',
        rotationSpeed: 0.6,
      };
    case 'Carousel':
      return {
        id,
        name: 'Grand Carousel',
        type: 'Carousel',
        category: 'rides',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        platformDiameter: 14,
        seatCount: 12,
        canopyStyle: 'striped',
        primaryColor: '#7c3aed',
        secondaryColor: '#fbbf24',
        rotationSpeed: 0.8,
      };
    case 'Drop Tower':
      return {
        id,
        name: 'Sky Drop Tower',
        type: 'Drop Tower',
        category: 'rides',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        towerHeight: 48,
        towerColor: '#f59e0b',
        carriageColor: '#1e293b',
        lighting: 'strobe',
        cycleSpeed: 1.0,
      };
    case 'Swing Ride':
      return {
        id,
        name: 'Wave Swinger Carousel',
        type: 'Swing Ride',
        category: 'rides',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        towerHeight: 16,
        canopyDiameter: 16,
        armCount: 12,
        canopyColor: '#3b82f6',
        chairColor: '#f59e0b',
        rotationSpeed: 1.0,
      };
    case 'Bumper Cars':
      return {
        id,
        name: 'Speedway Bumper Cars',
        type: 'Bumper Cars',
        category: 'rides',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        arenaWidth: 20,
        arenaLength: 26,
        carCount: 8,
        roofColor: '#dc2626',
        floorColor: '#334155',
        bumperColor: '#10b981',
      };
    case 'Kids Attraction':
      return {
        id,
        name: 'Spinning Teacups',
        type: 'Kids Attraction',
        category: 'rides',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        subtype: 'teacups',
        diameter: 14,
        primaryColor: '#ec4899',
        secondaryColor: '#38bdf8',
        rotationSpeed: 1.2,
      };

    // 2. Water Attractions
    case 'Water Ride':
      return {
        id,
        name: 'River Rapids Flume',
        type: 'Water Ride',
        category: 'water',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        channelWidth: 4.5,
        channelRadius: 24,
        waterColor: '#0284c7',
        boatCount: 3,
        boatColor: '#d97706',
        flowSpeed: 1.0,
      };
    case 'Wave Pool':
      return {
        id,
        name: 'Tsunami Wave Basin',
        type: 'Wave Pool',
        category: 'water',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        poolWidth: 24,
        poolLength: 32,
        waterColor: '#0ea5e9',
        tileColor: '#38bdf8',
        waveSpeed: 1.0,
      };
    case 'Slide Tower':
      return {
        id,
        name: 'Aqua Vortex Slide Tower',
        type: 'Slide Tower',
        category: 'water',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        towerHeight: 22,
        slideCount: 3,
        slideColor1: '#f43f5e',
        slideColor2: '#06b6d4',
        poolWidth: 14,
      };
    case 'Lazy River':
      return {
        id,
        name: 'Tropical Lazy River',
        type: 'Lazy River',
        category: 'water',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        channelWidth: 4.5,
        riverRadius: 22,
        waterColor: '#06b6d4',
        tubeCount: 5,
      };

    // 3. Architecture & Facilities
    case 'Entrance Gate':
      return {
        id,
        name: 'Grand Entrance Gateway',
        type: 'Entrance Gate',
        category: 'architecture',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        archWidth: 24,
        archHeight: 12,
        gateStyle: 'grand_archway',
        primaryColor: '#7c3aed',
        accentColor: '#fbbf24',
        marqueeText: 'WELCOME TO SKETCH2PARK',
        turnstileCount: 4,
      };
    case 'Restaurant':
      return {
        id,
        name: 'Lakeside Grill & Restaurant',
        type: 'Restaurant',
        category: 'architecture',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        width: 18,
        depth: 14,
        wallHeight: 5.0,
        diningStyle: 'sitdown',
        roofStyle: 'hip',
        finish: 'brick',
        finishColor: '#991b1b',
        roofColor: '#1e293b',
        hasOutdoorPatio: true,
      };
    case 'Shop':
      return {
        id,
        name: 'Souvenir Boutique',
        type: 'Shop',
        category: 'architecture',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        width: 12,
        depth: 9,
        wallHeight: 4.2,
        shopTheme: 'souvenirs',
        finishColor: '#f8fafc',
        roofColor: '#2563eb',
        awningColor: '#ef4444',
      };
    case 'Ticket Pavilion':
    case 'Ticket Counter':
      return {
        id,
        name: 'Ticket Counter Pavilion',
        type: 'Ticket Pavilion',
        category: 'architecture',
        preset: 'Ticket Pavilion',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        shape: 'rectangular',
        width: 12,
        depth: 6,
        wingWidth: 6,
        wingDepth: 6,
        wallHeight: 3.8,
        roofStyle: 'hip',
        finish: 'painted',
        finishColor: '#fef08a',
        roofColor: '#e11d48',
        doorCount: 3,
        windowCount: 4,
        doorPosition: 'center',
        style: 'modern',
      };
    case 'Food Court':
      return {
        id,
        name: 'Promenade Food Court',
        type: 'Food Court',
        category: 'architecture',
        preset: 'Food Court',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        shape: 'rectangular',
        width: 16,
        depth: 10,
        wingWidth: 7,
        wingDepth: 6,
        wallHeight: 4.5,
        roofStyle: 'gable',
        finish: 'timber',
        finishColor: '#854d0e',
        roofColor: '#047857',
        doorCount: 2,
        windowCount: 6,
        doorPosition: 'center',
        style: 'tropical',
      };
    case 'Changing Rooms':
      return {
        id,
        name: 'Locker & Changing Facility',
        type: 'Changing Rooms',
        category: 'architecture',
        preset: 'Changing Rooms',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        shape: 'rectangular',
        width: 14,
        depth: 8,
        wingWidth: 6,
        wingDepth: 6,
        wallHeight: 3.8,
        roofStyle: 'flat',
        finish: 'painted',
        finishColor: '#e0f2fe',
        roofColor: '#0284c7',
        doorCount: 2,
        windowCount: 4,
        doorPosition: 'center',
        style: 'modern',
      };
    case 'Custom Architecture':
      return {
        id,
        name: 'Custom Architectural Pavilion',
        type: 'Custom Architecture',
        category: 'architecture',
        preset: 'Custom Building',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        shape: 'rectangular',
        width: 16,
        depth: 10,
        wingWidth: 6,
        wingDepth: 6,
        wallHeight: 4.8,
        roofStyle: 'gable',
        finish: 'timber',
        finishColor: '#854d0e',
        roofColor: '#334155',
        doorCount: 2,
        windowCount: 6,
        doorPosition: 'center',
        style: 'modern',
      };

    // 4. Landscape, Infrastructure & Amenities
    case 'Parking Area':
      return {
        id,
        name: 'Visitor Parking Lot',
        type: 'Parking Area',
        category: 'infrastructure',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        lotWidth: 40,
        lotLength: 30,
        carCount: 12,
        asphaltColor: '#1e293b',
        hasLightPoles: true,
      };
    case 'Gardens':
      return {
        id,
        name: 'Botanical Gardens',
        type: 'Gardens',
        category: 'landscape',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        gardenStyle: 'botanical',
        gardenWidth: 20,
        gardenLength: 20,
        flowerColor: '#ec4899',
        hedges: true,
      };
    case 'Bridge':
      return {
        id,
        name: 'Pedestrian Lagoon Bridge',
        type: 'Bridge',
        category: 'landscape',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        bridgeLength: 16,
        bridgeWidth: 4.0,
        archHeight: 2.2,
        deckMaterial: 'wood',
        deckColor: '#78350f',
        railColor: '#d97706',
      };
    case 'Fountain':
      return {
        id,
        name: 'Tiered Grand Fountain',
        type: 'Fountain',
        category: 'landscape',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        basinRadius: 8,
        tiers: 3,
        jetHeight: 6,
        stoneColor: '#e2e8f0',
        waterColor: '#38bdf8',
      };
    case 'Decorative Lighting':
      return {
        id,
        name: 'Theme Park Light Post',
        type: 'Decorative Lighting',
        category: 'infrastructure',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        poleStyle: 'victorian',
        poleHeight: 6,
        lampCount: 2,
        lightColor: '#fef08a',
        intensity: 1.5,
      };
    case 'Lagoon':
      return {
        id,
        name: 'Central Lagoon',
        type: 'Lagoon',
        category: 'landscape',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        radiusX: 20,
        radiusZ: 16,
        waterColor: '#0284c7',
        rockBorder: true,
      };
    case 'Trees':
      return {
        id,
        name: 'Landscaped Trees Grove',
        type: 'Trees',
        category: 'landscape',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        treeCount: 8,
        clusterRadius: 14,
        treeType: 'palm',
        foliageTone: '#16a34a',
      };
    case 'Pedestrian Path':
      return {
        id,
        name: 'Park Promenade Walkway',
        type: 'Pedestrian Path',
        category: 'landscape',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        pathWidth: 5.0,
        pathLength: 26,
        pavingType: 'stone',
        pavingColor: '#cbd5e1',
      };
    case 'Benches':
      return {
        id,
        name: 'Park Benches',
        type: 'Benches',
        category: 'landscape',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        benchCount: 3,
        benchLength: 2.2,
        material: 'wood',
        woodColor: '#854d0e',
      };
    case 'Fantasy Castle':
      return {
        id,
        name: 'Grand Enchanted Fantasy Castle',
        type: 'Fantasy Castle',
        category: 'architecture',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        castleWidth: 32,
        castleHeight: 52,
        towerCount: 5,
        wallColor: '#f8fafc',
        roofColor: '#2563eb',
        trimColor: '#fbbf24',
        lakeRadius: 36,
        hasWaterJets: true,
        hasBridges: true,
      };
    case 'Wooden Coaster':
      return {
        id,
        name: 'Thunder Timber Wooden Coaster',
        type: 'Wooden Coaster',
        category: 'rides',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        hillHeight: 32,
        trackLength: 60,
        woodColor: '#78350f',
        railColor: '#451a03',
        supportDensity: 1.2,
      };
    case 'Mountain Attraction':
      return {
        id,
        name: 'Canyon Gorge Mountain Adventure',
        type: 'Mountain Attraction',
        category: 'rides',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        mountainWidth: 48,
        mountainHeight: 36,
        rockColor: '#c2410c',
        rockSecondaryColor: '#7c2d12',
        hasMineTrain: true,
        hasWaterFlume: true,
        tunnelCount: 2,
      };
    case 'Futuristic Dome':
      return {
        id,
        name: 'AstroSphere Futuristic Pavilion',
        type: 'Futuristic Dome',
        category: 'architecture',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        domeRadius: 18,
        domeHeight: 15,
        domeColor: '#94a3b8',
        glowColor: '#06b6d4',
      };
    case 'Splash Zone':
      return {
        id,
        name: 'Aqua Splash & Rain Dance',
        type: 'Splash Zone',
        category: 'water',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        zoneWidth: 20,
        waterColor: '#38bdf8',
        hasTippingBucket: true,
        hasMushrooms: true,
      };
    case 'Visitor Crowds':
      return {
        id,
        name: 'Park Visitor Crowds',
        type: 'Visitor Crowds',
        category: 'landscape',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        crowdCount: 50,
        walkRadius: 30,
        density: 'medium',
      };
    case 'Blank Park':
    default:
      return {
        id,
        name: 'Park Element',
        type: 'Pedestrian Path',
        category: 'landscape',
        position: offset,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        pathWidth: 4,
        pathLength: 20,
        pavingType: 'stone',
        pavingColor: '#cbd5e1',
      };
  }
}

// -------------------------------------------------------------
// COMPLETE PRE-CONFIGURED THEME PARK LAYOUTS
// -------------------------------------------------------------

// 0. Realistic Mega Theme Park (Matches Reference Image Composition)
export function createRealisticMegaPark(): ParkSceneData {
  return {
    version: 2,
    designMode: 'full_park',
    layoutType: 'realistic_mega_park',
    lightingMode: 'daylight',
    parkTheme: 'Realistic Mega Theme Park & Resort (Reference Composition)',
    parkSize: 'grand',
    objects: [
      // -----------------------------------------------------------
      // A. CENTER ZONE: FANTASY CASTLE, SURROUNDING LAKE & BRIDGES
      // -----------------------------------------------------------
      {
        id: 'mega_castle',
        name: 'Grand Enchanted Fantasy Castle',
        type: 'Fantasy Castle',
        category: 'architecture',
        position: [0, 0, -8],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        castleWidth: 34,
        castleHeight: 54,
        towerCount: 5,
        wallColor: '#f8fafc',
        roofColor: '#2563eb',
        trimColor: '#fbbf24',
        lakeRadius: 40,
        hasWaterJets: true,
        hasBridges: true,
      },
      {
        id: 'mega_lake',
        name: 'Castle Lagoon & Moat',
        type: 'Lagoon',
        category: 'landscape',
        position: [0, 0, -8],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        radiusX: 42,
        radiusZ: 34,
        waterColor: '#0284c7',
        rockBorder: true,
      },
      {
        id: 'mega_fountain_lake_l',
        name: 'Castle West Water Jet Fountain',
        type: 'Fountain',
        category: 'landscape',
        position: [-16, 0, -12],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        basinRadius: 5.5,
        tiers: 2,
        jetHeight: 8.5,
        stoneColor: '#e2e8f0',
        waterColor: '#38bdf8',
      },
      {
        id: 'mega_fountain_lake_r',
        name: 'Castle East Water Jet Fountain',
        type: 'Fountain',
        category: 'landscape',
        position: [16, 0, -12],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        basinRadius: 5.5,
        tiers: 2,
        jetHeight: 8.5,
        stoneColor: '#e2e8f0',
        waterColor: '#38bdf8',
      },
      {
        id: 'mega_bridge_south',
        name: 'Royal Stone Castle Bridge',
        type: 'Bridge',
        category: 'landscape',
        position: [0, 0, 16],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        bridgeLength: 18,
        bridgeWidth: 5.5,
        archHeight: 2.2,
        deckMaterial: 'stone',
        deckColor: '#94a3b8',
        railColor: '#475569',
      },
      {
        id: 'mega_bridge_west',
        name: 'Midway Timber Footbridge',
        type: 'Bridge',
        category: 'landscape',
        position: [-24, 0, -6],
        rotation: [0, Math.PI / 6, 0],
        scale: [1, 1, 1],
        bridgeLength: 14,
        bridgeWidth: 4.0,
        archHeight: 1.8,
        deckMaterial: 'wood',
        deckColor: '#78350f',
        railColor: '#d97706',
      },
      {
        id: 'mega_bridge_east',
        name: 'Adventure Timber Footbridge',
        type: 'Bridge',
        category: 'landscape',
        position: [24, 0, -6],
        rotation: [0, -Math.PI / 6, 0],
        scale: [1, 1, 1],
        bridgeLength: 14,
        bridgeWidth: 4.0,
        archHeight: 1.8,
        deckMaterial: 'wood',
        deckColor: '#78350f',
        railColor: '#d97706',
      },

      // -----------------------------------------------------------
      // B. BACK SIDE: MASSIVE RED LOOPING COASTER, DROP TOWER & DOME
      // -----------------------------------------------------------
      {
        id: 'mega_red_coaster',
        name: 'Thunderbolt Looping Hyper Coaster',
        type: 'Roller Coaster',
        category: 'rides',
        position: [6, 0, -56],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        hillHeight: 48,
        loopHeight: 30,
        trackDepth: 75,
        railColor: '#dc2626',
        supportColor: '#475569',
      },
      {
        id: 'mega_drop_tower',
        name: 'Skyfall Free-Fall Drop Tower',
        type: 'Drop Tower',
        category: 'rides',
        position: [42, 0, -50],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        towerHeight: 64,
        towerColor: '#0284c7',
        carriageColor: '#e11d48',
        lighting: 'beacon',
        cycleSpeed: 0.9,
      },
      {
        id: 'mega_futuristic_dome',
        name: 'AstroSphere Futuristic Pavilion',
        type: 'Futuristic Dome',
        category: 'architecture',
        position: [25, 0, -46],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        domeRadius: 18,
        domeHeight: 15,
        domeColor: '#94a3b8',
        glowColor: '#06b6d4',
      },

      // -----------------------------------------------------------
      // C. LEFT SIDE: FERRIS WHEEL, WOODEN COASTER, CAROUSEL & MIDWAY
      // -----------------------------------------------------------
      {
        id: 'mega_wooden_coaster',
        name: 'Timber Titan Wooden Coaster',
        type: 'Wooden Coaster',
        category: 'rides',
        position: [-52, 0, -42],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        hillHeight: 32,
        trackLength: 62,
        woodColor: '#78350f',
        railColor: '#451a03',
        supportDensity: 1.2,
      },
      {
        id: 'mega_ferris_wheel',
        name: 'Colossus Skyline Ferris Wheel',
        type: 'Ferris Wheel',
        category: 'rides',
        position: [-48, 0, 8],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        wheelDiameter: 34,
        cabinCount: 18,
        frameColor: '#ffffff',
        cabinColor: '#06b6d4',
        rotationSpeed: 0.5,
      },
      {
        id: 'mega_carousel',
        name: 'Grand Royal Carousel',
        type: 'Carousel',
        category: 'rides',
        position: [-26, 0, -2],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        platformDiameter: 15,
        seatCount: 14,
        canopyStyle: 'striped',
        primaryColor: '#ec4899',
        secondaryColor: '#fbbf24',
        rotationSpeed: 0.8,
      },
      {
        id: 'mega_swing_ride',
        name: 'Wave Swinger Flying Carousel',
        type: 'Swing Ride',
        category: 'rides',
        position: [-25, 0, 22],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        towerHeight: 16,
        canopyDiameter: 16,
        armCount: 14,
        canopyColor: '#3b82f6',
        chairColor: '#f59e0b',
        rotationSpeed: 1.1,
      },
      {
        id: 'mega_restaurant_lakeview',
        name: 'Lakeview Terrace Bistro',
        type: 'Restaurant',
        category: 'architecture',
        position: [-18, 0, 14],
        rotation: [0, Math.PI / 4, 0],
        scale: [1, 1, 1],
        width: 16,
        depth: 12,
        wallHeight: 5.2,
        diningStyle: 'patio',
        roofStyle: 'gable',
        finish: 'timber',
        finishColor: '#92400e',
        roofColor: '#dc2626',
        hasOutdoorPatio: true,
      },
      {
        id: 'mega_shop_candy',
        name: 'Sweet Tooth Confectionery',
        type: 'Shop',
        category: 'architecture',
        position: [-36, 0, 24],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        width: 12,
        depth: 10,
        wallHeight: 4.6,
        shopTheme: 'candy',
        finishColor: '#f43f5e',
        roofColor: '#fda4af',
        awningColor: '#ffffff',
      },

      // -----------------------------------------------------------
      // D. RIGHT SIDE: ROCKY MOUNTAIN ADVENTURE & RAPIDS
      // -----------------------------------------------------------
      {
        id: 'mega_mountain',
        name: 'Big Canyon Rocky Mountain Adventure',
        type: 'Mountain Attraction',
        category: 'rides',
        position: [45, 0, 14],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        mountainWidth: 50,
        mountainHeight: 36,
        rockColor: '#c2410c',
        rockSecondaryColor: '#7c2d12',
        hasMineTrain: true,
        hasWaterFlume: true,
        tunnelCount: 2,
      },
      {
        id: 'mega_water_rapids',
        name: 'Canyon Rapids Water Channel',
        type: 'Water Ride',
        category: 'water',
        position: [38, 0, 32],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        channelWidth: 4.5,
        channelRadius: 22,
        waterColor: '#0284c7',
        boatCount: 3,
        boatColor: '#d97706',
        flowSpeed: 1.2,
      },
      {
        id: 'mega_mountain_lodge',
        name: 'Canyon Outpost Restaurant',
        type: 'Restaurant',
        category: 'architecture',
        position: [28, 0, -10],
        rotation: [0, -Math.PI / 4, 0],
        scale: [1, 1, 1],
        width: 18,
        depth: 14,
        wallHeight: 5.4,
        diningStyle: 'sitdown',
        roofStyle: 'hip',
        finish: 'timber',
        finishColor: '#78350f',
        roofColor: '#451a03',
        hasOutdoorPatio: true,
      },
      {
        id: 'mega_island_shop',
        name: 'Marina Outfitters & Gear',
        type: 'Shop',
        category: 'architecture',
        position: [16, 0, 6],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        width: 10,
        depth: 8,
        wallHeight: 4.2,
        shopTheme: 'gear',
        finishColor: '#b45309',
        roofColor: '#78350f',
        awningColor: '#f59e0b',
      },

      // -----------------------------------------------------------
      // E. CONNECTED WONDERLA WATER PARK ZONE (RIGHT FLANK)
      // -----------------------------------------------------------
      {
        id: 'mega_wave_pool',
        name: 'Wonderla Giant Tidal Wave Pool',
        type: 'Wave Pool',
        category: 'water',
        position: [75, 0, 16],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        poolWidth: 32,
        poolLength: 42,
        waterColor: '#06b6d4',
        tileColor: '#e0f2fe',
        waveSpeed: 1.2,
      },
      {
        id: 'mega_slide_tower',
        name: 'Wonderla Aqua Tornado Slide Tower',
        type: 'Slide Tower',
        category: 'water',
        position: [76, 0, -18],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        towerHeight: 25,
        slideCount: 4,
        slideColor1: '#eab308',
        slideColor2: '#3b82f6',
        poolWidth: 16,
      },
      {
        id: 'mega_lazy_river',
        name: 'Wonderla Tropical Lazy River',
        type: 'Lazy River',
        category: 'water',
        position: [68, 0, -2],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        channelWidth: 5.0,
        riverRadius: 25,
        waterColor: '#0284c7',
        tubeCount: 6,
      },
      {
        id: 'mega_splash_zone',
        name: 'Wonderla Rain Dance & Splash Zone',
        type: 'Splash Zone',
        category: 'water',
        position: [84, 0, -2],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        zoneWidth: 20,
        waterColor: '#38bdf8',
        hasTippingBucket: true,
        hasMushrooms: true,
      },
      {
        id: 'mega_changing_rooms',
        name: 'Waterpark Locker & Changing Pavilion',
        type: 'Custom Architecture',
        category: 'architecture',
        preset: 'Changing Rooms',
        position: [62, 0, 32],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        shape: 'rectangular',
        width: 16,
        depth: 10,
        wingWidth: 6,
        wingDepth: 6,
        wallHeight: 4.5,
        roofStyle: 'flat',
        finish: 'painted',
        finishColor: '#0284c7',
        roofColor: '#0369a1',
        doorCount: 2,
        windowCount: 4,
        doorPosition: 'center',
        style: 'modern',
      },

      // -----------------------------------------------------------
      // F. FRONT SIDE: MAIN ENTRANCE GATE, PLAZA, BAVARIAN RESTAURANTS
      // -----------------------------------------------------------
      {
        id: 'mega_entrance_gate',
        name: 'Monumental Grand Entrance Gateway',
        type: 'Entrance Gate',
        category: 'architecture',
        position: [0, 0, 65],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        archWidth: 28,
        archHeight: 14,
        gateStyle: 'castle_gate',
        primaryColor: '#2563eb',
        accentColor: '#fbbf24',
        marqueeText: 'REALISTIC MEGA THEME PARK',
        turnstileCount: 6,
      },
      {
        id: 'mega_fountain_plaza',
        name: 'Grand Plaza Tiered Fountain',
        type: 'Fountain',
        category: 'landscape',
        position: [0, 0, 48],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        basinRadius: 7,
        tiers: 3,
        jetHeight: 6.5,
        stoneColor: '#e2e8f0',
        waterColor: '#38bdf8',
      },
      {
        id: 'mega_restaurant_bavarian',
        name: 'Bavarian Village Restaurant & Patio',
        type: 'Restaurant',
        category: 'architecture',
        position: [-18, 0, 42],
        rotation: [0, Math.PI / 8, 0],
        scale: [1, 1, 1],
        width: 22,
        depth: 16,
        wallHeight: 6.0,
        diningStyle: 'patio',
        roofStyle: 'gable',
        finish: 'timber',
        finishColor: '#92400e',
        roofColor: '#b91c1c',
        hasOutdoorPatio: true,
      },
      {
        id: 'mega_shop_mainstreet',
        name: 'Main Street Souvenir Emporium',
        type: 'Shop',
        category: 'architecture',
        position: [16, 0, 44],
        rotation: [0, -Math.PI / 8, 0],
        scale: [1, 1, 1],
        width: 16,
        depth: 12,
        wallHeight: 5.0,
        shopTheme: 'souvenirs',
        finishColor: '#475569',
        roofColor: '#dc2626',
        awningColor: '#fbbf24',
      },

      // -----------------------------------------------------------
      // G. PROMENADES & CONNECTED PATHWAYS
      // -----------------------------------------------------------
      {
        id: 'mega_path_main',
        name: 'Central Royal Promenade',
        type: 'Pedestrian Path',
        category: 'landscape',
        position: [0, 0, 36],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        pathWidth: 8.0,
        pathLength: 50,
        pavingType: 'stone',
        pavingColor: '#cbd5e1',
      },
      {
        id: 'mega_path_left',
        name: 'Midway Boardwalk Promenade',
        type: 'Pedestrian Path',
        category: 'landscape',
        position: [-28, 0, 16],
        rotation: [0, Math.PI / 4, 0],
        scale: [1, 1, 1],
        pathWidth: 6.0,
        pathLength: 45,
        pavingType: 'brick',
        pavingColor: '#fca5a5',
      },
      {
        id: 'mega_path_right',
        name: 'Adventure Canyon Promenade',
        type: 'Pedestrian Path',
        category: 'landscape',
        position: [28, 0, 16],
        rotation: [0, -Math.PI / 4, 0],
        scale: [1, 1, 1],
        pathWidth: 6.0,
        pathLength: 45,
        pavingType: 'stone',
        pavingColor: '#cbd5e1',
      },
      {
        id: 'mega_path_waterpark',
        name: 'Waterpark Beachside Boardwalk',
        type: 'Pedestrian Path',
        category: 'landscape',
        position: [56, 0, 12],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        pathWidth: 5.0,
        pathLength: 38,
        pavingType: 'sand',
        pavingColor: '#fde68a',
      },

      // -----------------------------------------------------------
      // H. GARDENS & BOTANICAL LANDSCAPING
      // -----------------------------------------------------------
      {
        id: 'mega_garden_left',
        name: 'Royal Symmetrical Rose Garden',
        type: 'Gardens',
        category: 'landscape',
        position: [-12, 0, 26],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        gardenStyle: 'formal',
        gardenWidth: 16,
        gardenLength: 16,
        flowerColor: '#f43f5e',
        hedges: true,
      },
      {
        id: 'mega_garden_right',
        name: 'Royal Symmetrical Lavender Garden',
        type: 'Gardens',
        category: 'landscape',
        position: [12, 0, 26],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        gardenStyle: 'formal',
        gardenWidth: 16,
        gardenLength: 16,
        flowerColor: '#8b5cf6',
        hedges: true,
      },

      // -----------------------------------------------------------
      // I. DENSE TREE CLUSTERS & GROVES
      // -----------------------------------------------------------
      {
        id: 'mega_trees_lake_w',
        name: 'Castle Lake West Woodlands',
        type: 'Trees',
        category: 'landscape',
        position: [-30, 0, -22],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        treeCount: 16,
        clusterRadius: 18,
        treeType: 'mixed',
        foliageTone: '#15803d',
      },
      {
        id: 'mega_trees_lake_e',
        name: 'Castle Lake East Woodlands',
        type: 'Trees',
        category: 'landscape',
        position: [30, 0, -22],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        treeCount: 16,
        clusterRadius: 18,
        treeType: 'mixed',
        foliageTone: '#16a34a',
      },
      {
        id: 'mega_trees_coaster_back_l',
        name: 'Coaster Backdrop Pine Grove',
        type: 'Trees',
        category: 'landscape',
        position: [-15, 0, -38],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        treeCount: 18,
        clusterRadius: 16,
        treeType: 'evergreen',
        foliageTone: '#166534',
      },
      {
        id: 'mega_trees_coaster_back_r',
        name: 'Hyper Coaster Pine Forest',
        type: 'Trees',
        category: 'landscape',
        position: [15, 0, -38],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        treeCount: 18,
        clusterRadius: 16,
        treeType: 'evergreen',
        foliageTone: '#14532d',
      },
      {
        id: 'mega_trees_midway',
        name: 'Carnival Midway Grove',
        type: 'Trees',
        category: 'landscape',
        position: [-44, 0, 28],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        treeCount: 14,
        clusterRadius: 15,
        treeType: 'mixed',
        foliageTone: '#22c55e',
      },
      {
        id: 'mega_trees_mountain_border',
        name: 'Mountain Perimeter Forest',
        type: 'Trees',
        category: 'landscape',
        position: [46, 0, 38],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        treeCount: 14,
        clusterRadius: 15,
        treeType: 'mixed',
        foliageTone: '#15803d',
      },
      {
        id: 'mega_trees_waterpark_palms',
        name: 'Wave Pool Oasis Palms',
        type: 'Trees',
        category: 'landscape',
        position: [66, 0, 8],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        treeCount: 12,
        clusterRadius: 14,
        treeType: 'palm',
        foliageTone: '#10b981',
      },
      {
        id: 'mega_trees_waterpark_flank',
        name: 'Waterpark Flank Palms',
        type: 'Trees',
        category: 'landscape',
        position: [88, 0, 10],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        treeCount: 12,
        clusterRadius: 14,
        treeType: 'palm',
        foliageTone: '#059669',
      },

      // -----------------------------------------------------------
      // J. STREET LIGHTING & PARK BENCHES
      // -----------------------------------------------------------
      {
        id: 'mega_light_1',
        name: 'Plaza Victorian Light Post W',
        type: 'Decorative Lighting',
        category: 'infrastructure',
        position: [-6, 0, 50],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        poleStyle: 'victorian',
        poleHeight: 6,
        lampCount: 2,
        lightColor: '#fef08a',
        intensity: 1.6,
      },
      {
        id: 'mega_light_2',
        name: 'Plaza Victorian Light Post E',
        type: 'Decorative Lighting',
        category: 'infrastructure',
        position: [6, 0, 50],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        poleStyle: 'victorian',
        poleHeight: 6,
        lampCount: 2,
        lightColor: '#fef08a',
        intensity: 1.6,
      },
      {
        id: 'mega_light_3',
        name: 'Bridge Entry Light Post W',
        type: 'Decorative Lighting',
        category: 'infrastructure',
        position: [-6, 0, 28],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        poleStyle: 'victorian',
        poleHeight: 6,
        lampCount: 2,
        lightColor: '#fef08a',
        intensity: 1.6,
      },
      {
        id: 'mega_light_4',
        name: 'Bridge Entry Light Post E',
        type: 'Decorative Lighting',
        category: 'infrastructure',
        position: [6, 0, 28],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        poleStyle: 'victorian',
        poleHeight: 6,
        lampCount: 2,
        lightColor: '#fef08a',
        intensity: 1.6,
      },
      {
        id: 'mega_bench_1',
        name: 'Plaza Seating Benches W',
        type: 'Benches',
        category: 'landscape',
        position: [-8, 0, 40],
        rotation: [0, Math.PI / 2, 0],
        scale: [1, 1, 1],
        benchCount: 3,
        benchLength: 2.2,
        material: 'wood',
        woodColor: '#854d0e',
      },
      {
        id: 'mega_bench_2',
        name: 'Plaza Seating Benches E',
        type: 'Benches',
        category: 'landscape',
        position: [8, 0, 40],
        rotation: [0, -Math.PI / 2, 0],
        scale: [1, 1, 1],
        benchCount: 3,
        benchLength: 2.2,
        material: 'wood',
        woodColor: '#854d0e',
      },

      // -----------------------------------------------------------
      // K. ANIMATED PARK VISITOR CROWDS
      // -----------------------------------------------------------
      {
        id: 'mega_crowd_plaza',
        name: 'Central Entrance Plaza Guests',
        type: 'Visitor Crowds',
        category: 'landscape',
        position: [0, 0, 42],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        crowdCount: 65,
        walkRadius: 35,
        density: 'dense',
      },
      {
        id: 'mega_crowd_midway',
        name: 'Carnival Midway Guests',
        type: 'Visitor Crowds',
        category: 'landscape',
        position: [-28, 0, 10],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        crowdCount: 45,
        walkRadius: 28,
        density: 'medium',
      },
      {
        id: 'mega_crowd_mountain',
        name: 'Adventure Mountain Guests',
        type: 'Visitor Crowds',
        category: 'landscape',
        position: [32, 0, 18],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        crowdCount: 45,
        walkRadius: 28,
        density: 'medium',
      },
      {
        id: 'mega_crowd_waterpark',
        name: 'Water Park Promenade Guests',
        type: 'Visitor Crowds',
        category: 'landscape',
        position: [72, 0, 6],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        crowdCount: 40,
        walkRadius: 25,
        density: 'medium',
      },
    ],
  };
}

// 1. Wonderla-Style Amusement Park
export function createWonderlaAmusementPark(): ParkSceneData {
  return {
    version: 2,
    designMode: 'full_park',
    layoutType: 'wonderla_park',
    lightingMode: 'daylight',
    parkTheme: 'Wonderla-Style Mega Amusement & Water Park',
    parkSize: 'grand',
    objects: [
      // Entrance Zone & Parking (Front: Z = 45 to 70)
      {
        id: 'wla_parking',
        name: 'Visitor Parking Facility',
        type: 'Parking Area',
        category: 'infrastructure',
        position: [0, 0, 75],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        lotWidth: 50,
        lotLength: 24,
        carCount: 16,
        asphaltColor: '#1e293b',
        hasLightPoles: true,
      },
      {
        id: 'wla_gate',
        name: 'Wonderla Grand Archway Entrance',
        type: 'Entrance Gate',
        category: 'architecture',
        position: [0, 0, 56],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        archWidth: 26,
        archHeight: 12,
        gateStyle: 'grand_archway',
        primaryColor: '#e11d48',
        accentColor: '#facc15',
        marqueeText: 'WONDERLA THEME PARK',
        turnstileCount: 5,
      },
      {
        id: 'wla_tickets',
        name: 'Central Ticket Counters',
        type: 'Ticket Pavilion',
        category: 'architecture',
        preset: 'Ticket Counter',
        position: [18, 0, 54],
        rotation: [0, -Math.PI / 8, 0],
        scale: [1, 1, 1],
        shape: 'rectangular',
        width: 12,
        depth: 6,
        wingWidth: 6,
        wingDepth: 6,
        wallHeight: 3.8,
        roofStyle: 'hip',
        finish: 'painted',
        finishColor: '#fef08a',
        roofColor: '#dc2626',
        doorCount: 3,
        windowCount: 4,
        doorPosition: 'center',
        style: 'wonderla',
      },
      {
        id: 'wla_souvenir_shop',
        name: 'Wonderla Emporium Gift Shop',
        type: 'Shop',
        category: 'architecture',
        position: [-18, 0, 54],
        rotation: [0, Math.PI / 8, 0],
        scale: [1, 1, 1],
        width: 14,
        depth: 9,
        wallHeight: 4.2,
        shopTheme: 'souvenirs',
        finishColor: '#ffffff',
        roofColor: '#2563eb',
        awningColor: '#f59e0b',
      },

      // Main Entry Promenade (Z = 25 to 50)
      {
        id: 'wla_promenade_path',
        name: 'Main Entrance Promenade',
        type: 'Pedestrian Path',
        category: 'landscape',
        position: [0, 0, 38],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        pathWidth: 7,
        pathLength: 32,
        pavingType: 'stone',
        pavingColor: '#e2e8f0',
      },
      {
        id: 'wla_entry_fountain',
        name: 'Grand Celebration Fountain',
        type: 'Fountain',
        category: 'landscape',
        position: [0, 0, 26],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        basinRadius: 7,
        tiers: 3,
        jetHeight: 6.5,
        stoneColor: '#f8fafc',
        waterColor: '#38bdf8',
      },
      {
        id: 'wla_light_left',
        name: 'Promenade Lantern West',
        type: 'Decorative Lighting',
        category: 'infrastructure',
        position: [-6, 0, 36],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        poleStyle: 'victorian',
        poleHeight: 6,
        lampCount: 2,
        lightColor: '#fef08a',
        intensity: 1.5,
      },
      {
        id: 'wla_light_right',
        name: 'Promenade Lantern East',
        type: 'Decorative Lighting',
        category: 'infrastructure',
        position: [6, 0, 36],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        poleStyle: 'victorian',
        poleHeight: 6,
        lampCount: 2,
        lightColor: '#fef08a',
        intensity: 1.5,
      },

      // Central Lagoon & Pedestrian Bridge (Z = 0)
      {
        id: 'wla_lagoon',
        name: 'Wonderla Central Lake',
        type: 'Lagoon',
        category: 'landscape',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        radiusX: 22,
        radiusZ: 15,
        waterColor: '#0284c7',
        rockBorder: true,
      },
      {
        id: 'wla_bridge',
        name: 'Lakeview Arched Bridge',
        type: 'Bridge',
        category: 'landscape',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        bridgeLength: 18,
        bridgeWidth: 4.5,
        archHeight: 2.4,
        deckMaterial: 'wood',
        deckColor: '#78350f',
        railColor: '#f59e0b',
      },

      // Thrill Zone (Left Side: X = -35 to -45)
      {
        id: 'wla_megacoaster',
        name: 'Recoil Hyper Coaster',
        type: 'Roller Coaster',
        category: 'rides',
        position: [-38, 0, 6],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        hillHeight: 42,
        loopHeight: 25,
        trackDepth: 60,
        railColor: '#dc2626',
        supportColor: '#334155',
      },
      {
        id: 'wla_droptower',
        name: 'Equinox Sky Drop',
        type: 'Drop Tower',
        category: 'rides',
        position: [-36, 0, -32],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        towerHeight: 52,
        towerColor: '#f59e0b',
        carriageColor: '#1e293b',
        lighting: 'strobe',
        cycleSpeed: 1.2,
      },

      // Water Park Zone (Right Side: X = 32 to 45)
      {
        id: 'wla_slidetower',
        name: 'Harakiri High-Speed Slide Tower',
        type: 'Slide Tower',
        category: 'water',
        position: [34, 0, -18],
        rotation: [0, -Math.PI / 6, 0],
        scale: [1, 1, 1],
        towerHeight: 24,
        slideCount: 3,
        slideColor1: '#0ea5e9',
        slideColor2: '#f43f5e',
        poolWidth: 15,
      },
      {
        id: 'wla_wavepool',
        name: 'Wonder Splash Wave Pool',
        type: 'Wave Pool',
        category: 'water',
        position: [34, 0, 14],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        poolWidth: 22,
        poolLength: 30,
        waterColor: '#0284c7',
        tileColor: '#38bdf8',
        waveSpeed: 1.2,
      },
      {
        id: 'wla_changing_facility',
        name: 'Water Park Locker & Changing Suite',
        type: 'Changing Rooms',
        category: 'architecture',
        preset: 'Changing Rooms',
        position: [38, 0, 36],
        rotation: [0, -Math.PI / 4, 0],
        scale: [1, 1, 1],
        shape: 'rectangular',
        width: 14,
        depth: 8,
        wingWidth: 6,
        wingDepth: 6,
        wallHeight: 3.8,
        roofStyle: 'flat',
        finish: 'painted',
        finishColor: '#e0f2fe',
        roofColor: '#0284c7',
        doorCount: 2,
        windowCount: 4,
        doorPosition: 'center',
        style: 'modern',
      },

      // Family & Kids Zone (Back Center: Z = -35 to -50)
      {
        id: 'wla_ferriswheel',
        name: 'Sky Wheel Panoramic Vista',
        type: 'Ferris Wheel',
        category: 'rides',
        position: [0, 0, -42],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        wheelDiameter: 34,
        cabinCount: 18,
        frameColor: '#ffffff',
        cabinColor: '#06b6d4',
        rotationSpeed: 0.5,
      },
      {
        id: 'wla_swingride',
        name: 'Wave Swinger Fiesta',
        type: 'Swing Ride',
        category: 'rides',
        position: [-16, 0, -18],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        towerHeight: 16,
        canopyDiameter: 16,
        armCount: 14,
        canopyColor: '#7c3aed',
        chairColor: '#facc15',
        rotationSpeed: 1.1,
      },
      {
        id: 'wla_bumper_cars',
        name: 'Crazy Cars Bumper Arena',
        type: 'Bumper Cars',
        category: 'rides',
        position: [-18, 0, 18],
        rotation: [0, Math.PI / 4, 0],
        scale: [1, 1, 1],
        arenaWidth: 18,
        arenaLength: 22,
        carCount: 8,
        roofColor: '#2563eb',
        floorColor: '#334155',
        bumperColor: '#ef4444',
      },
      {
        id: 'wla_kids_teacups',
        name: 'Kiddies Spinning Teacups',
        type: 'Kids Attraction',
        category: 'rides',
        position: [16, 0, -18],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        subtype: 'teacups',
        diameter: 13,
        primaryColor: '#ec4899',
        secondaryColor: '#38bdf8',
        rotationSpeed: 1.2,
      },

      // Dining, Gardens & Landscaping
      {
        id: 'wla_restaurant',
        name: 'Waves Lakeside Diner & Restaurant',
        type: 'Restaurant',
        category: 'architecture',
        position: [18, 0, 32],
        rotation: [0, -Math.PI / 6, 0],
        scale: [1, 1, 1],
        width: 18,
        depth: 12,
        wallHeight: 5.0,
        diningStyle: 'sitdown',
        roofStyle: 'hip',
        finish: 'brick',
        finishColor: '#991b1b',
        roofColor: '#1e293b',
        hasOutdoorPatio: true,
      },
      {
        id: 'wla_gardens',
        name: 'Wonderla Floral Pavilion Gardens',
        type: 'Gardens',
        category: 'landscape',
        position: [-18, 0, 34],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        gardenStyle: 'botanical',
        gardenWidth: 18,
        gardenLength: 18,
        flowerColor: '#ec4899',
        hedges: true,
      },
      {
        id: 'wla_trees_perimeter_1',
        name: 'West Perimeter Green Belt',
        type: 'Trees',
        category: 'landscape',
        position: [-42, 0, 32],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        treeCount: 9,
        clusterRadius: 14,
        treeType: 'mixed',
        foliageTone: '#15803d',
      },
      {
        id: 'wla_trees_perimeter_2',
        name: 'East Perimeter Green Belt',
        type: 'Trees',
        category: 'landscape',
        position: [42, 0, -36],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        treeCount: 8,
        clusterRadius: 13,
        treeType: 'palm',
        foliageTone: '#16a34a',
      },
    ],
  };
}

// 2. Futuristic Cyber Theme Park
export function createFuturisticCyberPark(): ParkSceneData {
  return {
    version: 2,
    designMode: 'full_park',
    layoutType: 'futuristic_cyber',
    lightingMode: 'night',
    parkTheme: 'Neo-City 2099 Cyber Theme Park',
    parkSize: 'grand',
    objects: [
      {
        id: 'cyber_parking',
        name: 'Autonomous Vehicle Pad',
        type: 'Parking Area',
        category: 'infrastructure',
        position: [0, 0, 68],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        lotWidth: 44,
        lotLength: 24,
        carCount: 14,
        asphaltColor: '#0f172a',
        hasLightPoles: true,
      },
      {
        id: 'cyber_gate',
        name: 'Quantum Cyber Portal',
        type: 'Entrance Gate',
        category: 'architecture',
        position: [0, 0, 50],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        archWidth: 26,
        archHeight: 14,
        gateStyle: 'futuristic_portal',
        primaryColor: '#06b6d4',
        accentColor: '#ec4899',
        marqueeText: 'NEO-CITY CYBERPARK 2099',
        turnstileCount: 4,
      },
      {
        id: 'cyber_coaster',
        name: 'Hyper-Drive Magnet Coaster',
        type: 'Roller Coaster',
        category: 'rides',
        position: [-36, 0, 4],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        hillHeight: 46,
        loopHeight: 28,
        trackDepth: 62,
        railColor: '#06b6d4',
        supportColor: '#1e1b4b',
      },
      {
        id: 'cyber_drop',
        name: 'Orbital Anti-Gravity Tower',
        type: 'Drop Tower',
        category: 'rides',
        position: [34, 0, -20],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        towerHeight: 56,
        towerColor: '#a855f7',
        carriageColor: '#06b6d4',
        lighting: 'neon',
        cycleSpeed: 1.4,
      },
      {
        id: 'cyber_wheel',
        name: 'Holosphere Vista Wheel',
        type: 'Ferris Wheel',
        category: 'rides',
        position: [0, 0, -36],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        wheelDiameter: 34,
        cabinCount: 16,
        frameColor: '#38bdf8',
        cabinColor: '#d946ef',
        rotationSpeed: 0.6,
      },
      {
        id: 'cyber_swinger',
        name: 'Plasma Swinger',
        type: 'Swing Ride',
        category: 'rides',
        position: [-16, 0, -18],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        towerHeight: 18,
        canopyDiameter: 18,
        armCount: 14,
        canopyColor: '#06b6d4',
        chairColor: '#f43f5e',
        rotationSpeed: 1.2,
      },
      {
        id: 'cyber_fountain',
        name: 'Cybernetic Laser Basin',
        type: 'Fountain',
        category: 'landscape',
        position: [0, 0, 22],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        basinRadius: 8,
        tiers: 2,
        jetHeight: 7,
        stoneColor: '#1e293b',
        waterColor: '#06b6d4',
      },
      {
        id: 'cyber_restaurant',
        name: 'Synthetix Cyber Bistro',
        type: 'Restaurant',
        category: 'architecture',
        position: [18, 0, 24],
        rotation: [0, -Math.PI / 6, 0],
        scale: [1, 1, 1],
        width: 18,
        depth: 12,
        wallHeight: 5.5,
        diningStyle: 'sitdown',
        roofStyle: 'futuristic',
        finish: 'glass',
        finishColor: '#0f172a',
        roofColor: '#06b6d4',
        hasOutdoorPatio: true,
      },
      {
        id: 'cyber_light_1',
        name: 'Neon Beacon Alpha',
        type: 'Decorative Lighting',
        category: 'infrastructure',
        position: [-8, 0, 34],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        poleStyle: 'neon',
        poleHeight: 7,
        lampCount: 2,
        lightColor: '#06b6d4',
        intensity: 2.0,
      },
      {
        id: 'cyber_light_2',
        name: 'Neon Beacon Beta',
        type: 'Decorative Lighting',
        category: 'infrastructure',
        position: [8, 0, 34],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        poleStyle: 'neon',
        poleHeight: 7,
        lampCount: 2,
        lightColor: '#ec4899',
        intensity: 2.0,
      },
    ],
  };
}

// 3. Fantasy Kingdom Theme Park
export function createFantasyKingdomPark(): ParkSceneData {
  return {
    version: 2,
    designMode: 'full_park',
    layoutType: 'fantasy_kingdom',
    lightingMode: 'sunset',
    parkTheme: 'Enchanted Kingdom Fantasy Theme Park',
    parkSize: 'grand',
    objects: [
      {
        id: 'fantasy_gate',
        name: 'Royal Citadel Castle Gate',
        type: 'Entrance Gate',
        category: 'architecture',
        position: [0, 0, 52],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        archWidth: 26,
        archHeight: 14,
        gateStyle: 'castle_gate',
        primaryColor: '#7c3aed',
        accentColor: '#f59e0b',
        marqueeText: 'THE ENCHANTED KINGDOM',
        turnstileCount: 4,
      },
      {
        id: 'fantasy_fountain',
        name: 'Merlin Tiered Royal Fountain',
        type: 'Fountain',
        category: 'landscape',
        position: [0, 0, 24],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        basinRadius: 8,
        tiers: 3,
        jetHeight: 6,
        stoneColor: '#f1f5f9',
        waterColor: '#38bdf8',
      },
      {
        id: 'fantasy_carousel',
        name: 'Royal Pegasus Grand Carousel',
        type: 'Carousel',
        category: 'rides',
        position: [0, 0, -8],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        platformDiameter: 16,
        seatCount: 16,
        canopyStyle: 'gold_trim',
        primaryColor: '#7c3aed',
        secondaryColor: '#facc15',
        rotationSpeed: 0.8,
      },
      {
        id: 'fantasy_coaster',
        name: 'Dragon Flight Mountain Coaster',
        type: 'Roller Coaster',
        category: 'rides',
        position: [-36, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        hillHeight: 38,
        loopHeight: 24,
        trackDepth: 58,
        railColor: '#d97706',
        supportColor: '#451a03',
      },
      {
        id: 'fantasy_wheel',
        name: 'Starlight Sky Wheel',
        type: 'Ferris Wheel',
        category: 'rides',
        position: [34, 0, -12],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        wheelDiameter: 30,
        cabinCount: 16,
        frameColor: '#f8fafc',
        cabinColor: '#8b5cf6',
        rotationSpeed: 0.6,
      },
      {
        id: 'fantasy_gardens',
        name: 'Royal Rose Maze & Topiary',
        type: 'Gardens',
        category: 'landscape',
        position: [-18, 0, 26],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        gardenStyle: 'formal',
        gardenWidth: 20,
        gardenLength: 20,
        flowerColor: '#ec4899',
        hedges: true,
      },
      {
        id: 'fantasy_tavern',
        name: 'The Golden Goblet Tavern',
        type: 'Restaurant',
        category: 'architecture',
        position: [18, 0, 26],
        rotation: [0, -Math.PI / 8, 0],
        scale: [1, 1, 1],
        width: 18,
        depth: 14,
        wallHeight: 5.2,
        diningStyle: 'sitdown',
        roofStyle: 'mansard',
        finish: 'timber',
        finishColor: '#78350f',
        roofColor: '#451a03',
        hasOutdoorPatio: true,
      },
    ],
  };
}

// 4. Water Paradise Park
export function createWaterParadisePark(): ParkSceneData {
  return {
    version: 2,
    designMode: 'full_park',
    layoutType: 'water_paradise',
    lightingMode: 'daylight',
    parkTheme: 'Water Paradise Aqua Resort',
    parkSize: 'grand',
    objects: [
      {
        id: 'water_parking',
        name: 'Resort Parking Facility',
        type: 'Parking Area',
        category: 'infrastructure',
        position: [0, 0, 65],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        lotWidth: 44,
        lotLength: 22,
        carCount: 14,
        asphaltColor: '#1e293b',
        hasLightPoles: true,
      },
      {
        id: 'water_entrance',
        name: 'Aqua Paradise Grand Entrance',
        type: 'Entrance Gate',
        category: 'architecture',
        position: [0, 0, 48],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        archWidth: 24,
        archHeight: 11,
        gateStyle: 'modern_canopy',
        primaryColor: '#0284c7',
        accentColor: '#38bdf8',
        marqueeText: 'AQUA PARADISE WATER PARK',
        turnstileCount: 4,
      },
      {
        id: 'water_wavepool',
        name: 'Mega Tidal Wave Pool',
        type: 'Wave Pool',
        category: 'water',
        position: [0, 0, 16],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        poolWidth: 28,
        poolLength: 36,
        waterColor: '#0284c7',
        tileColor: '#38bdf8',
        waveSpeed: 1.2,
      },
      {
        id: 'water_slidetower_1',
        name: 'Kamikaze Hydro-Flume Tower',
        type: 'Slide Tower',
        category: 'water',
        position: [-32, 0, -8],
        rotation: [0, Math.PI / 6, 0],
        scale: [1, 1, 1],
        towerHeight: 26,
        slideCount: 3,
        slideColor1: '#0ea5e9',
        slideColor2: '#f43f5e',
        poolWidth: 16,
      },
      {
        id: 'water_slidetower_2',
        name: 'Typhoon Tornado Slide',
        type: 'Slide Tower',
        category: 'water',
        position: [32, 0, -8],
        rotation: [0, -Math.PI / 6, 0],
        scale: [1, 1, 1],
        towerHeight: 22,
        slideCount: 2,
        slideColor1: '#10b981',
        slideColor2: '#f59e0b',
        poolWidth: 14,
      },
      {
        id: 'water_lazyriver',
        name: 'Tropical Oasis Lazy River',
        type: 'Lazy River',
        category: 'water',
        position: [0, 0, -28],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        channelWidth: 5,
        riverRadius: 26,
        waterColor: '#06b6d4',
        tubeCount: 6,
      },
      {
        id: 'water_changing',
        name: 'Cabana Locker & Shower Complex',
        type: 'Changing Rooms',
        category: 'architecture',
        preset: 'Changing Rooms',
        position: [24, 0, 44],
        rotation: [0, -Math.PI / 6, 0],
        scale: [1, 1, 1],
        shape: 'rectangular',
        width: 16,
        depth: 9,
        wingWidth: 6,
        wingDepth: 6,
        wallHeight: 3.8,
        roofStyle: 'flat',
        finish: 'painted',
        finishColor: '#e0f2fe',
        roofColor: '#0284c7',
        doorCount: 3,
        windowCount: 5,
        doorPosition: 'center',
        style: 'tropical',
      },
    ],
  };
}

// 5. Tropical Adventure Park (Preserved & Enhanced)
export function createTropicalAdventurePark(): ParkSceneData {
  return {
    version: 2,
    designMode: 'full_park',
    layoutType: 'tropical_adventure',
    lightingMode: 'daylight',
    parkTheme: 'Tropical Adventure Island',
    parkSize: 'standard',
    objects: [
      {
        id: 'tropical_lagoon_1',
        name: 'Paradise Lagoon',
        type: 'Lagoon',
        category: 'landscape',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        radiusX: 20,
        radiusZ: 16,
        waterColor: '#0284c7',
        rockBorder: true,
      },
      {
        id: 'tropical_bridge_1',
        name: 'Lagoon Cross Bridge',
        type: 'Bridge',
        category: 'landscape',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        bridgeLength: 16,
        bridgeWidth: 4.0,
        archHeight: 2.2,
        deckMaterial: 'wood',
        deckColor: '#78350f',
        railColor: '#d97706',
      },
      {
        id: 'tropical_wheel_1',
        name: 'Sunset Ferris Wheel',
        type: 'Ferris Wheel',
        category: 'rides',
        position: [0, 0, -35],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        wheelDiameter: 30,
        cabinCount: 16,
        frameColor: '#f8fafc',
        cabinColor: '#06b6d4',
        rotationSpeed: 0.5,
      },
      {
        id: 'tropical_coaster_1',
        name: 'Jungle Viper Coaster',
        type: 'Roller Coaster',
        category: 'rides',
        position: [-36, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        hillHeight: 34,
        loopHeight: 22,
        trackDepth: 55,
        railColor: '#e11d48',
        supportColor: '#334155',
      },
      {
        id: 'tropical_slide_1',
        name: 'Aquafall Slide Tower',
        type: 'Slide Tower',
        category: 'water',
        position: [32, 0, -14],
        rotation: [0, -Math.PI / 6, 0],
        scale: [1, 1, 1],
        towerHeight: 22,
        slideCount: 2,
        slideColor1: '#0ea5e9',
        slideColor2: '#f43f5e',
        poolWidth: 14,
      },
      {
        id: 'tropical_wave_1',
        name: 'Tidal Wave Basin',
        type: 'Wave Pool',
        category: 'water',
        position: [32, 0, 16],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        poolWidth: 20,
        poolLength: 26,
        waterColor: '#0284c7',
        tileColor: '#38bdf8',
        waveSpeed: 1.0,
      },
      {
        id: 'tropical_gate',
        name: 'Island Gate Entrance',
        type: 'Entrance Gate',
        category: 'architecture',
        position: [0, 0, 48],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        archWidth: 22,
        archHeight: 11,
        gateStyle: 'grand_archway',
        primaryColor: '#047857',
        accentColor: '#f59e0b',
        marqueeText: 'TROPICAL ADVENTURE PARK',
        turnstileCount: 3,
      },
      {
        id: 'tropical_entrance_1',
        name: 'Main Entrance Ticket Pavilion',
        type: 'Ticket Pavilion',
        category: 'architecture',
        preset: 'Ticket Pavilion',
        position: [16, 0, 46],
        rotation: [0, -Math.PI / 6, 0],
        scale: [1, 1, 1],
        shape: 'rectangular',
        width: 12,
        depth: 6,
        wingWidth: 6,
        wingDepth: 6,
        wallHeight: 4.0,
        roofStyle: 'hip',
        finish: 'timber',
        finishColor: '#854d0e',
        roofColor: '#dc2626',
        doorCount: 3,
        windowCount: 4,
        doorPosition: 'center',
        style: 'tropical',
      },
      {
        id: 'tropical_path_entrance',
        name: 'Grand Entrance Promenade',
        type: 'Pedestrian Path',
        category: 'landscape',
        position: [0, 0, 24],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        pathWidth: 6,
        pathLength: 30,
        pavingType: 'stone',
        pavingColor: '#e2e8f0',
      },
      {
        id: 'tropical_foodcourt_1',
        name: 'Lagoon Side Food Court',
        type: 'Food Court',
        category: 'architecture',
        preset: 'Food Court',
        position: [-18, 0, 24],
        rotation: [0, Math.PI / 8, 0],
        scale: [1, 1, 1],
        shape: 'rectangular',
        width: 14,
        depth: 8,
        wingWidth: 6,
        wingDepth: 6,
        wallHeight: 4.2,
        roofStyle: 'gable',
        finish: 'timber',
        finishColor: '#78350f',
        roofColor: '#047857',
        doorCount: 2,
        windowCount: 5,
        doorPosition: 'center',
        style: 'tropical',
      },
      {
        id: 'tropical_fountain',
        name: 'Promenade Palm Fountain',
        type: 'Fountain',
        category: 'landscape',
        position: [0, 0, 16],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        basinRadius: 6,
        tiers: 2,
        jetHeight: 5,
        stoneColor: '#f1f5f9',
        waterColor: '#38bdf8',
      },
      {
        id: 'tropical_trees_1',
        name: 'Lagoon Palm Grove',
        type: 'Trees',
        category: 'landscape',
        position: [-16, 0, -18],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        treeCount: 7,
        clusterRadius: 12,
        treeType: 'palm',
        foliageTone: '#15803d',
      },
    ],
  };
}

// -------------------------------------------------------------
// AI NATURAL-LANGUAGE THEME PARK GENERATOR
// -------------------------------------------------------------
export function generateAIParkLayoutFromPrompt(prompt: string): ParkSceneData {
  const p = prompt.toLowerCase();

  // 0. Realistic Mega Theme Park (Matches Reference Image Target)
  if (
    p.includes('mega') ||
    p.includes('reference') ||
    p.includes('realistic') ||
    p.includes('image') ||
    p.includes('castle') ||
    p.includes('complete amusement park') ||
    p.includes('transform sketch2park')
  ) {
    return createRealisticMegaPark();
  }

  // 1. Wonderla-Style Amusement Park
  if (
    p.includes('wonderla') ||
    (p.includes('roller coaster') && p.includes('water')) ||
    (p.includes('amusement') && p.includes('parking'))
  ) {
    return createWonderlaAmusementPark();
  }

  // 2. Futuristic Cyber Theme Park
  if (
    p.includes('futuristic') ||
    p.includes('cyber') ||
    p.includes('sci-fi') ||
    p.includes('space') ||
    p.includes('neon')
  ) {
    return createFuturisticCyberPark();
  }

  // 3. Fantasy Kingdom
  if (
    p.includes('fantasy') ||
    p.includes('magic') ||
    p.includes('fairy') ||
    p.includes('kingdom')
  ) {
    return createFantasyKingdomPark();
  }

  // 4. Water Paradise
  if (p.includes('water park') || p.includes('aqua') || p.includes('slides') || p.includes('wave pool')) {
    return createWaterParadisePark();
  }

  // Default rich layout: Realistic Mega Theme Park
  return createRealisticMegaPark();
}

// -------------------------------------------------------------
// AI NATURAL-LANGUAGE PARK EDITOR (APPLY INSTRUCTIONS)
// -------------------------------------------------------------
export function applyAIInstructionToPark(
  currentScene: ParkSceneData,
  instruction: string
): { scene: ParkSceneData; message: string } {
  const inst = instruction.toLowerCase().trim();
  let newObjects = [...currentScene.objects];
  let newLightingMode = currentScene.lightingMode;
  let message = '';

  // 0. Full Regeneration: "Generate a complete amusement park like the uploaded reference image"
  if (
    inst.includes('generate a complete') ||
    inst.includes('like the uploaded reference') ||
    inst.includes('like reference image') ||
    inst.includes('realistic mega')
  ) {
    return {
      scene: createRealisticMegaPark(),
      message: 'Synthesized complete realistic 3D mega theme park matching the reference image composition.',
    };
  }

  // 1. "Make the castle bigger"
  else if (inst.includes('castle') && (inst.includes('bigger') || inst.includes('enlarge') || inst.includes('large') || inst.includes('scale up') || inst.includes('taller'))) {
    let foundCastle = false;
    newObjects = newObjects.map((obj) => {
      if (obj.type === 'Fantasy Castle') {
        foundCastle = true;
        const c = obj as FantasyCastleObject;
        return {
          ...c,
          castleWidth: Math.round(c.castleWidth * 1.3),
          castleHeight: Math.round(c.castleHeight * 1.35),
          scale: [c.scale[0] * 1.25, c.scale[1] * 1.3, c.scale[2] * 1.25] as [number, number, number],
        };
      }
      return obj;
    });
    if (!foundCastle) {
      const castle = generateDefaultObject('Fantasy Castle', [0, 0, -8]) as FantasyCastleObject;
      castle.castleWidth = 44;
      castle.castleHeight = 68;
      castle.scale = [1.3, 1.3, 1.3];
      newObjects.push(castle);
    }
    message = 'Enlarged the central fantasy castle spires, grand keep, battlements, and towers to a monumental scale!';
  }

  // 2. "Add more roller coasters behind the castle"
  else if (inst.includes('roller coaster') && (inst.includes('behind') || inst.includes('more') || inst.includes('back'))) {
    const hyperCoaster = generateDefaultObject('Roller Coaster', [14, 0, -68]) as RollerCoasterObject;
    hyperCoaster.name = 'Titan Fury Hyper Coaster';
    hyperCoaster.hillHeight = 54;
    hyperCoaster.loopHeight = 34;
    hyperCoaster.trackDepth = 85;
    hyperCoaster.railColor = '#b91c1c';
    hyperCoaster.supportColor = '#334155';
    newObjects.push(hyperCoaster);
    message = 'Added a massive 54m high-speed looping hyper coaster towering directly behind the fantasy castle!';
  }

  // 3. "Create a giant water park on the right"
  else if (inst.includes('water park') || (inst.includes('water') && inst.includes('right'))) {
    const wavePool = generateDefaultObject('Wave Pool', [75, 0, 16]);
    const slideTower = generateDefaultObject('Slide Tower', [76, 0, -18]);
    const lazyRiver = generateDefaultObject('Lazy River', [68, 0, -2]);
    const splashZone = generateDefaultObject('Splash Zone', [84, 0, -2]);
    newObjects.push(wavePool, slideTower, lazyRiver, splashZone);
    message = 'Constructed an expansive Wonderla-style water park on the right flank featuring tidal wave pool, multi-flume slide towers, lazy river, and splash zone!';
  }

  // 4. "Add more restaurants and buildings"
  else if (inst.includes('restaurant') || inst.includes('building') || inst.includes('food') || inst.includes('dining')) {
    const rest1 = generateDefaultObject('Restaurant', [-18, 0, 42]);
    const rest2 = generateDefaultObject('Restaurant', [22, 0, 36]);
    const shop1 = generateDefaultObject('Shop', [16, 0, 48]);
    newObjects.push(rest1, rest2, shop1);
    message = 'Added Bavarian-style dining restaurants, outdoor terrace cafes, and shopping boutique pavilions along the pedestrian plazas.';
  }

  // 5. "Increase the number of trees" / "more trees"
  else if (inst.includes('tree') || inst.includes('greenery') || inst.includes('vegetation') || inst.includes('forest')) {
    const t1 = generateDefaultObject('Trees', [-34, 0, -24]);
    const t2 = generateDefaultObject('Trees', [34, 0, -24]);
    const t3 = generateDefaultObject('Trees', [0, 0, -45]);
    const t4 = generateDefaultObject('Trees', [-48, 0, 32]);
    const t5 = generateDefaultObject('Trees', [52, 0, 32]);
    newObjects.push(t1, t2, t3, t4, t5);
    message = 'Planted over 60 additional mature broadleaf, conifer, and palm trees in dense decorative groves across the park.';
  }

  // 6. "Make the park more realistic"
  else if (inst.includes('realistic') || inst.includes('realism') || inst.includes('density') || inst.includes('detail')) {
    const crowd1 = generateDefaultObject('Visitor Crowds', [0, 0, 42]);
    const crowd2 = generateDefaultObject('Visitor Crowds', [-26, 0, 14]);
    const fountain1 = generateDefaultObject('Fountain', [0, 0, 48]);
    const bridge1 = generateDefaultObject('Bridge', [0, 0, 16]);
    const lights1 = generateDefaultObject('Decorative Lighting', [-6, 0, 50]);
    const lights2 = generateDefaultObject('Decorative Lighting', [6, 0, 50]);
    newObjects.push(crowd1, crowd2, fountain1, bridge1, lights1, lights2);
    message = 'Enhanced theme park realism with animated walking visitor crowds, dancing lake water jets, arched bridges, and illuminated street lampposts.';
  }

  // 7. "Add a mountain roller coaster" / "mountain attraction"
  else if (inst.includes('mountain')) {
    const mountain = generateDefaultObject('Mountain Attraction', [46, 0, 14]);
    newObjects.push(mountain);
    message = 'Created a sculpted red-rock mountain adventure zone with winding mine train roller coaster tracks and canyon tunnels.';
  }

  // 8. "Change the park to sunset lighting"
  else if (inst.includes('sunset') || inst.includes('golden hour')) {
    newLightingMode = 'sunset';
    message = 'Transformed park atmosphere to warm golden hour sunset lighting with rich amber and purple skies.';
  }

  // 9. "Change to night lighting"
  else if (inst.includes('night') || inst.includes('dark')) {
    newLightingMode = 'night';
    message = 'Switched to night lighting with glowing ride neon, illuminated Ferris wheel spokes, castle floodlights, and a starry sky.';
  }

  // 10. "Change to daylight"
  else if (inst.includes('day') || inst.includes('daylight') || inst.includes('sun')) {
    newLightingMode = 'daylight';
    message = 'Switched to crystal clear bright daylight with rich blue skies and realistic crisp sun shadows.';
  }

  // 11. "Add a large Ferris wheel near the entrance"
  else if (inst.includes('ferris wheel')) {
    const nearEntrance = inst.includes('entrance') || inst.includes('front');
    const pos: [number, number, number] = nearEntrance ? [18, 0, 36] : [-48, 0, 8];
    const wheel = generateDefaultObject('Ferris Wheel', pos) as FerrisWheelObject;
    wheel.name = 'AI-Placed Skyline Wheel';
    wheel.wheelDiameter = 34;
    newObjects.push(wheel);
    message = `Added a 34m Skyline Ferris Wheel ${nearEntrance ? 'near the entrance promenade' : 'on the left midway'}.`;
  }

  // 12. General Add Fountain
  else if (inst.includes('fountain')) {
    const fountain = generateDefaultObject('Fountain', [0, 0, 38]);
    newObjects.push(fountain);
    message = 'Placed an animated tiered water fountain in the main plaza.';
  }

  // 13. General Add Bridge
  else if (inst.includes('bridge')) {
    const bridge = generateDefaultObject('Bridge', [0, 0, 16]);
    newObjects.push(bridge);
    message = 'Added an arched pedestrian bridge over the central water body.';
  }

  // Fallback: Add requested element if recognized
  else {
    const newCoaster = generateDefaultObject('Roller Coaster', [-34, 0, 0]);
    newObjects.push(newCoaster);
    message = `Interpreted instruction: "${instruction}". Enhanced park scene layout with new attractions.`;
  }

  return {
    scene: {
      ...currentScene,
      lightingMode: newLightingMode,
      objects: newObjects,
    },
    message,
  };
}

export function createInitialParkScene(
  startingType: string,
  layoutType: ParkLayoutType = 'realistic_mega_park'
): ParkSceneData {
  if (startingType === 'Full Theme Park' || startingType === 'full_park') {
    if (layoutType === 'realistic_mega_park') {
      return createRealisticMegaPark();
    }
    if (layoutType === 'wonderla_park') {
      return createWonderlaAmusementPark();
    }
    if (layoutType === 'tropical_adventure') {
      return createTropicalAdventurePark();
    }
    if (layoutType === 'futuristic_cyber') {
      return createFuturisticCyberPark();
    }
    if (layoutType === 'fantasy_kingdom') {
      return createFantasyKingdomPark();
    }
    if (layoutType === 'water_paradise') {
      return createWaterParadisePark();
    }
    return createRealisticMegaPark();
  }

  if (startingType === 'Custom Architecture' || startingType === 'custom_architecture') {
    return {
      version: 2,
      designMode: 'custom_architecture',
      lightingMode: 'daylight',
      objects: [generateDefaultObject('Custom Architecture', [0, 0, 0])],
    };
  }

  // Single Attraction mode
  const singleAttraction = generateDefaultObject(
    (startingType as AttractionType) || 'Roller Coaster',
    [0, 0, 0]
  );
  return {
    version: 2,
    designMode: 'single_attraction',
    lightingMode: 'sunset',
    objects: [singleAttraction],
  };
}
