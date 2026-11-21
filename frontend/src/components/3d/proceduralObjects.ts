import * as THREE from 'three';
import type {
  SceneObject,
  RollerCoasterObject,
  WoodenCoasterObject,
  FerrisWheelObject,
  WaterRideObject,
  CarouselObject,
  DropTowerObject,
  SwingRideObject,
  BumperCarsObject,
  KidsAttractionObject,
  MountainAttractionObject,
  FantasyCastleObject,
  FuturisticDomeObject,
  SplashZoneObject,
  VisitorCrowdsObject,
  CustomArchitectureObject,
  EntranceGateObject,
  RestaurantObject,
  ShopObject,
  ParkingAreaObject,
  GardensObject,
  BridgeObject,
  FountainObject,
  DecorativeLightingObject,
  WavePoolObject,
  SlideTowerObject,
  LazyRiverObject,
  LagoonObject,
  TreesObject,
  PedestrianPathObject,
  BenchesObject,
} from '../../types/parkScene';

export interface ObjectRuntimeData {
  rootGroup: THREE.Group;
  update: (delta: number, time: number) => void;
  getRideCameraTransform?: () => { position: THREE.Vector3; lookAt: THREE.Vector3 } | null;
}

// -------------------------------------------------------------
// 1. ROLLER COASTER
// -------------------------------------------------------------
export function buildRollerCoaster(obj: RollerCoasterObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const { hillHeight, loopHeight, trackDepth, railColor, supportColor } = obj;

  // Build a continuous closed spline for the coaster circuit
  const pts: THREE.Vector3[] = [
    new THREE.Vector3(0, 3, -trackDepth * 0.4),          // Station
    new THREE.Vector3(trackDepth * 0.25, 4, -trackDepth * 0.35), // Turn to lift
    new THREE.Vector3(trackDepth * 0.35, hillHeight * 0.5, -trackDepth * 0.1), // Mid lift
    new THREE.Vector3(trackDepth * 0.35, hillHeight, trackDepth * 0.2), // Lift hill peak
    new THREE.Vector3(trackDepth * 0.3, hillHeight * 0.85, trackDepth * 0.3), // Crest
    new THREE.Vector3(trackDepth * 0.15, 3.5, trackDepth * 0.45), // First drop base
    new THREE.Vector3(0, loopHeight * 0.5, trackDepth * 0.35), // Loop entry
    new THREE.Vector3(-trackDepth * 0.05, loopHeight, trackDepth * 0.28), // Loop apex (inverted)
    new THREE.Vector3(-trackDepth * 0.08, loopHeight * 0.4, trackDepth * 0.22), // Loop exit
    new THREE.Vector3(-trackDepth * 0.3, 12, trackDepth * 0.1), // Banked high-speed turn
    new THREE.Vector3(-trackDepth * 0.35, 8, -trackDepth * 0.1), // Turn continuation
    new THREE.Vector3(-trackDepth * 0.2, 16, -trackDepth * 0.25), // Airtime camelback hill
    new THREE.Vector3(-trackDepth * 0.05, 4, -trackDepth * 0.35), // Brake run entry
  ];

  const curve = new THREE.CatmullRomCurve3(pts, true);

  // Tubular rails
  const railMat = new THREE.MeshStandardMaterial({
    color: railColor,
    metalness: 0.8,
    roughness: 0.25,
  });

  const supportMat = new THREE.MeshStandardMaterial({
    color: supportColor,
    metalness: 0.6,
    roughness: 0.4,
  });

  const tieMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.7,
    roughness: 0.3,
  });

  // Track spine
  const spineGeom = new THREE.TubeGeometry(curve, 180, 0.25, 8, true);
  const spineMesh = new THREE.Mesh(spineGeom, railMat);
  group.add(spineMesh);

  // Dual running rails & sleepers
  const numSteps = 120;
  const railOffset = 0.55;
  for (let i = 0; i < numSteps; i++) {
    const t = i / numSteps;
    const pt = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
    if (normal.lengthSq() < 0.001) normal.set(1, 0, 0);

    // Cross-tie
    const tieGeom = new THREE.CylinderGeometry(0.06, 0.06, railOffset * 2.2, 6);
    const tie = new THREE.Mesh(tieGeom, tieMat);
    tie.position.copy(pt);
    tie.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    group.add(tie);

    // Periodic vertical ground supports
    if (i % 6 === 0 && pt.y > 4) {
      const pylonHeight = pt.y;
      const pylonGeom = new THREE.CylinderGeometry(0.2, 0.35, pylonHeight, 8);
      const pylon = new THREE.Mesh(pylonGeom, supportMat);
      pylon.position.set(pt.x, pylonHeight / 2, pt.z);
      group.add(pylon);

      // Concrete footer
      const footerGeom = new THREE.CylinderGeometry(0.6, 0.7, 0.6, 8);
      const footer = new THREE.Mesh(footerGeom, new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 }));
      footer.position.set(pt.x, 0.3, pt.z);
      group.add(footer);
    }
  }

  // Dual tubular rails
  const leftPts: THREE.Vector3[] = [];
  const rightPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 200; i++) {
    const t = i / 200;
    const pt = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
    if (normal.lengthSq() < 0.001) normal.set(1, 0, 0);

    leftPts.push(pt.clone().addScaledVector(normal, railOffset).add(new THREE.Vector3(0, 0.15, 0)));
    rightPts.push(pt.clone().addScaledVector(normal, -railOffset).add(new THREE.Vector3(0, 0.15, 0)));
  }

  const leftCurve = new THREE.CatmullRomCurve3(leftPts, true);
  const rightCurve = new THREE.CatmullRomCurve3(rightPts, true);
  const leftRailGeom = new THREE.TubeGeometry(leftCurve, 180, 0.09, 6, true);
  const rightRailGeom = new THREE.TubeGeometry(rightCurve, 180, 0.09, 6, true);
  group.add(new THREE.Mesh(leftRailGeom, railMat));
  group.add(new THREE.Mesh(rightRailGeom, railMat));

  // Coaster Train (3 articulated cars)
  const trainGroup = new THREE.Group();
  const carColors = [0xef4444, 0xf97316, 0xeab308];
  const cars: THREE.Mesh[] = [];

  for (let c = 0; c < 3; c++) {
    const carGeom = new THREE.BoxGeometry(0.9, 0.6, 1.8);
    const carMesh = new THREE.Mesh(
      carGeom,
      new THREE.MeshStandardMaterial({ color: carColors[c], metalness: 0.7, roughness: 0.3 })
    );
    // Add passenger seats
    const seatGeom = new THREE.BoxGeometry(0.7, 0.4, 0.5);
    const seatMesh = new THREE.Mesh(seatGeom, new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    seatMesh.position.set(0, 0.25, 0.1);
    carMesh.add(seatMesh);

    trainGroup.add(carMesh);
    cars.push(carMesh);
  }
  group.add(trainGroup);

  let currentTrainT = 0;

  return {
    rootGroup: group,
    update: (delta) => {
      currentTrainT = (currentTrainT + delta * 0.06) % 1.0;
      cars.forEach((car, idx) => {
        const offsetT = (currentTrainT - idx * 0.02 + 1.0) % 1.0;
        const pos = curve.getPointAt(offsetT);
        const look = curve.getPointAt((offsetT + 0.01) % 1.0);
        car.position.copy(pos);
        car.lookAt(look);
      });
    },
    getRideCameraTransform: () => {
      const leadPos = curve.getPointAt(currentTrainT);
      const aheadPos = curve.getPointAt((currentTrainT + 0.02) % 1.0);
      const camPos = leadPos.clone().add(new THREE.Vector3(0, 0.8, 0));
      return { position: camPos, lookAt: aheadPos };
    },
  };
}

// -------------------------------------------------------------
// 2. FERRIS WHEEL
// -------------------------------------------------------------
export function buildFerrisWheel(obj: FerrisWheelObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const { wheelDiameter, cabinCount, frameColor, cabinColor, rotationSpeed } = obj;
  const radius = wheelDiameter / 2;
  const hubHeight = radius + 2.5;

  // A-Frame Leg Supports (Left & Right)
  const supportMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.7,
    roughness: 0.3,
  });

  const legThickness = 0.5;
  const legSpacingZ = 3.5;
  const legSpreadX = radius * 0.75;

  [-legSpacingZ, legSpacingZ].forEach((zPos) => {
    // Left Leg
    const leg1Geom = new THREE.CylinderGeometry(legThickness * 0.6, legThickness, hubHeight * 1.05, 8);
    const leg1 = new THREE.Mesh(leg1Geom, supportMat);
    leg1.position.set(-legSpreadX / 2, hubHeight / 2, zPos);
    leg1.rotation.z = Math.atan2(legSpreadX / 2, hubHeight);
    group.add(leg1);

    // Right Leg
    const leg2 = new THREE.Mesh(leg1Geom, supportMat);
    leg2.position.set(legSpreadX / 2, hubHeight / 2, zPos);
    leg2.rotation.z = -Math.atan2(legSpreadX / 2, hubHeight);
    group.add(leg2);

    // Cross brace
    const braceGeom = new THREE.CylinderGeometry(0.2, 0.2, legSpreadX * 0.8, 6);
    const brace = new THREE.Mesh(braceGeom, supportMat);
    brace.position.set(0, hubHeight * 0.45, zPos);
    brace.rotation.z = Math.PI / 2;
    group.add(brace);
  });

  // Axle Hub
  const axleGeom = new THREE.CylinderGeometry(0.7, 0.7, legSpacingZ * 2.4, 16);
  const axle = new THREE.Mesh(axleGeom, supportMat);
  axle.position.set(0, hubHeight, 0);
  axle.rotation.x = Math.PI / 2;
  group.add(axle);

  // Rotating Wheel Assembly Group
  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(0, hubHeight, 0);
  group.add(wheelGroup);

  const frameMat = new THREE.MeshStandardMaterial({
    color: frameColor,
    metalness: 0.8,
    roughness: 0.25,
  });

  // Dual outer rims
  [-legSpacingZ * 0.5, legSpacingZ * 0.5].forEach((zRim) => {
    const rimGeom = new THREE.TorusGeometry(radius, 0.25, 8, 48);
    const rim = new THREE.Mesh(rimGeom, frameMat);
    rim.position.set(0, 0, zRim);
    wheelGroup.add(rim);

    // Inner structural ring
    const innerRimGeom = new THREE.TorusGeometry(radius * 0.6, 0.18, 8, 36);
    const innerRim = new THREE.Mesh(innerRimGeom, frameMat);
    innerRim.position.set(0, 0, zRim);
    wheelGroup.add(innerRim);
  });

  // Radial Spokes and Cabins
  const cabinGroups: THREE.Group[] = [];
  const cabinMat = new THREE.MeshStandardMaterial({
    color: cabinColor,
    metalness: 0.5,
    roughness: 0.3,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.6,
  });

  for (let i = 0; i < cabinCount; i++) {
    const angle = (i / cabinCount) * Math.PI * 2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // Spoke cylinders
    const spokeLen = radius;
    const spokeGeom = new THREE.CylinderGeometry(0.12, 0.12, spokeLen, 6);

    [-legSpacingZ * 0.5, legSpacingZ * 0.5].forEach((zRim) => {
      const spoke = new THREE.Mesh(spokeGeom, frameMat);
      spoke.position.set((cosA * spokeLen) / 2, (sinA * spokeLen) / 2, zRim);
      spoke.rotation.z = angle - Math.PI / 2;
      wheelGroup.add(spoke);
    });

    // Cross truss rod between the dual rims at this spoke
    const trussGeom = new THREE.CylinderGeometry(0.1, 0.1, legSpacingZ, 6);
    const truss = new THREE.Mesh(trussGeom, frameMat);
    truss.position.set(cosA * radius, sinA * radius, 0);
    truss.rotation.x = Math.PI / 2;
    wheelGroup.add(truss);

    // Suspended Cabin
    const cabinGroup = new THREE.Group();
    cabinGroup.position.set(cosA * radius, sinA * radius, 0);

    // Cabin shell
    const cabinBodyGeom = new THREE.CylinderGeometry(1.0, 0.9, 1.8, 12);
    const cabinBody = new THREE.Mesh(cabinBodyGeom, cabinMat);
    cabinBody.position.y = -0.9;
    cabinGroup.add(cabinBody);

    // Windows band
    const windowGeom = new THREE.CylinderGeometry(1.02, 1.02, 0.7, 12);
    const windowMesh = new THREE.Mesh(windowGeom, glassMat);
    windowMesh.position.y = -0.7;
    cabinGroup.add(windowMesh);

    // Roof cap
    const roofGeom = new THREE.ConeGeometry(1.1, 0.5, 12);
    const roof = new THREE.Mesh(roofGeom, new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    roof.position.y = 0.25;
    cabinGroup.add(roof);

    wheelGroup.add(cabinGroup);
    cabinGroups.push(cabinGroup);
  }

  let wheelAngle = 0;

  return {
    rootGroup: group,
    update: (delta) => {
      const speed = rotationSpeed * 0.5;
      wheelAngle += delta * speed;
      wheelGroup.rotation.z = wheelAngle;

      // Gravitational upright counter-rotation: keep all cabins strictly upright!
      cabinGroups.forEach((cab) => {
        cab.rotation.z = -wheelAngle;
      });
    },
  };
}

// -------------------------------------------------------------
// 3. WATER RIDE (RIVER RAPIDS / LOG FLUME)
// -------------------------------------------------------------
export function buildWaterRide(obj: WaterRideObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const { channelWidth, channelRadius, waterColor, boatCount, boatColor, flowSpeed } = obj;

  // Build a winding circuit curve
  const r = channelRadius;
  const pts: THREE.Vector3[] = [
    new THREE.Vector3(r * 0.8, 0.5, 0),
    new THREE.Vector3(r * 0.6, 0.5, r * 0.7),
    new THREE.Vector3(0, 0.5, r * 0.85),
    new THREE.Vector3(-r * 0.65, 0.5, r * 0.6),
    new THREE.Vector3(-r * 0.85, 0.5, 0),
    new THREE.Vector3(-r * 0.5, 0.5, -r * 0.6),
    new THREE.Vector3(0, 0.5, -r * 0.8),
    new THREE.Vector3(r * 0.5, 0.5, -r * 0.5),
  ];

  const channelCurve = new THREE.CatmullRomCurve3(pts, true);

  // Outer and Inner Concrete Channel Walls
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
  const waterMat = new THREE.MeshStandardMaterial({
    color: waterColor,
    metalness: 0.2,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85,
  });

  const numSegments = 120;
  const halfW = channelWidth / 2;

  const waterPts: THREE.Vector3[] = [];
  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments;
    const pt = channelCurve.getPointAt(t);
    const tangent = channelCurve.getTangentAt(t).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();

    waterPts.push(pt);

    // Outer wall block
    const leftWallPt = pt.clone().addScaledVector(normal, halfW + 0.3);
    const wallGeom = new THREE.BoxGeometry(0.6, 1.2, (channelRadius * 2 * Math.PI) / numSegments + 0.2);
    const wallLeft = new THREE.Mesh(wallGeom, wallMat);
    wallLeft.position.set(leftWallPt.x, 0.6, leftWallPt.z);
    wallLeft.lookAt(leftWallPt.clone().add(tangent));
    group.add(wallLeft);

    // Inner wall block
    const rightWallPt = pt.clone().addScaledVector(normal, -halfW - 0.3);
    const wallRight = new THREE.Mesh(wallGeom, wallMat);
    wallRight.position.set(rightWallPt.x, 0.6, rightWallPt.z);
    wallRight.lookAt(rightWallPt.clone().add(tangent));
    group.add(wallRight);
  }

  // Water ribbon surface
  const waterRibbonCurve = new THREE.CatmullRomCurve3(waterPts, true);
  const waterGeom = new THREE.TubeGeometry(waterRibbonCurve, 120, halfW * 0.95, 6, true);
  waterGeom.scale(1, 0.15, 1);
  const waterMesh = new THREE.Mesh(waterGeom, waterMat);
  waterMesh.position.y = 0.35;
  group.add(waterMesh);

  // Floating Rapids Boats (Circular rafts with passenger tubes)
  const boatGroup = new THREE.Group();
  group.add(boatGroup);

  const boats: THREE.Group[] = [];
  const boatMat = new THREE.MeshStandardMaterial({ color: boatColor, roughness: 0.4 });
  const tubeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

  for (let b = 0; b < boatCount; b++) {
    const boat = new THREE.Group();

    // Outer flotation ring
    const ringGeom = new THREE.TorusGeometry(1.5, 0.4, 10, 24);
    const ring = new THREE.Mesh(ringGeom, tubeMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.4;
    boat.add(ring);

    // Inner floor & seats
    const floorGeom = new THREE.CylinderGeometry(1.4, 1.2, 0.5, 16);
    const floor = new THREE.Mesh(floorGeom, boatMat);
    floor.position.y = 0.3;
    boat.add(floor);

    // Center safety bar & steering pole
    const poleGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.9, 8);
    const pole = new THREE.Mesh(poleGeom, new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8 }));
    pole.position.y = 0.7;
    boat.add(pole);

    boatGroup.add(boat);
    boats.push(boat);
  }

  let boatProgress = 0;

  return {
    rootGroup: group,
    update: (delta, time) => {
      boatProgress = (boatProgress + delta * 0.04 * flowSpeed) % 1.0;
      boats.forEach((boat, idx) => {
        const offsetT = (boatProgress + idx / boatCount) % 1.0;
        const pos = channelCurve.getPointAt(offsetT);
        const look = channelCurve.getPointAt((offsetT + 0.01) % 1.0);

        // Water buoyancy bobbing animation
        const bob = Math.sin(time * 3 + idx * 2) * 0.08;
        const tilt = Math.sin(time * 2 + idx) * 0.04;

        boat.position.set(pos.x, 0.2 + bob, pos.z);
        boat.lookAt(new THREE.Vector3(look.x, 0.2 + bob, look.z));
        boat.rotation.z += tilt;
      });
    },
  };
}

// -------------------------------------------------------------
// 4. CAROUSEL
// -------------------------------------------------------------
export function buildCarousel(obj: CarouselObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const { platformDiameter, seatCount, primaryColor, secondaryColor, rotationSpeed } = obj;
  const radius = platformDiameter / 2;

  // Base Pedestal
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
  const baseGeom = new THREE.CylinderGeometry(radius * 1.05, radius * 1.1, 0.6, 32);
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.position.y = 0.3;
  group.add(base);

  // Rotating Assembly
  const rotatingGroup = new THREE.Group();
  group.add(rotatingGroup);

  // Wooden Platform Deck
  const deckMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
  const deckGeom = new THREE.CylinderGeometry(radius, radius, 0.3, 32);
  const deck = new THREE.Mesh(deckGeom, deckMat);
  deck.position.y = 0.75;
  rotatingGroup.add(deck);

  // Central Ornate Pillar
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, metalness: 0.8, roughness: 0.2 });
  const pillarGeom = new THREE.CylinderGeometry(radius * 0.25, radius * 0.28, 5.0, 16);
  const pillar = new THREE.Mesh(pillarGeom, pillarMat);
  pillar.position.y = 3.25;
  rotatingGroup.add(pillar);

  // Overhead Canopy Roof
  const canopyHeight = 5.6;
  const canopyMat1 = new THREE.MeshStandardMaterial({ color: primaryColor, roughness: 0.4 });
  const canopyMat2 = new THREE.MeshStandardMaterial({ color: secondaryColor, roughness: 0.4 });

  // Tiered Conical Roof
  const roofGeom = new THREE.ConeGeometry(radius * 1.08, 2.5, 24);
  const roof = new THREE.Mesh(roofGeom, canopyMat1);
  roof.position.y = canopyHeight + 1.25;
  rotatingGroup.add(roof);

  // Finial Spire
  const spireGeom = new THREE.ConeGeometry(0.3, 1.2, 8);
  const spire = new THREE.Mesh(spireGeom, new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 }));
  spire.position.y = canopyHeight + 2.8;
  rotatingGroup.add(spire);

  // Brass Poles & Whimsical Ride Seats
  const poles: THREE.Mesh[] = [];
  const seats: THREE.Group[] = [];
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 });

  for (let s = 0; s < seatCount; s++) {
    const angle = (s / seatCount) * Math.PI * 2;
    const poleRadius = radius * (s % 2 === 0 ? 0.78 : 0.5);
    const px = Math.cos(angle) * poleRadius;
    const pz = Math.sin(angle) * poleRadius;

    // Brass Pole
    const pGeom = new THREE.CylinderGeometry(0.06, 0.06, 4.6, 8);
    const pMesh = new THREE.Mesh(pGeom, poleMat);
    pMesh.position.set(px, 3.2, pz);
    rotatingGroup.add(pMesh);
    poles.push(pMesh);

    // Carousel Horse / Seat Group
    const seatGroup = new THREE.Group();
    seatGroup.position.set(px, 2.0, pz);

    // Horse body
    const horseColor = s % 2 === 0 ? primaryColor : secondaryColor;
    const horseMat = new THREE.MeshStandardMaterial({ color: horseColor, roughness: 0.35 });
    const bodyGeom = new THREE.BoxGeometry(0.5, 0.6, 1.2);
    const body = new THREE.Mesh(bodyGeom, horseMat);
    seatGroup.add(body);

    // Horse neck & head
    const headGeom = new THREE.ConeGeometry(0.25, 0.7, 6);
    const head = new THREE.Mesh(headGeom, horseMat);
    head.position.set(0, 0.5, 0.45);
    head.rotation.x = Math.PI / 4;
    seatGroup.add(head);

    // Saddle
    const saddleGeom = new THREE.BoxGeometry(0.55, 0.15, 0.5);
    const saddle = new THREE.Mesh(saddleGeom, new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    saddle.position.set(0, 0.32, 0);
    seatGroup.add(saddle);

    seatGroup.lookAt(new THREE.Vector3(px * 1.5, 2.0, pz * 1.5));
    rotatingGroup.add(seatGroup);
    seats.push(seatGroup);
  }

  let carouselAngle = 0;

  return {
    rootGroup: group,
    update: (delta, time) => {
      carouselAngle += delta * rotationSpeed * 0.7;
      rotatingGroup.rotation.y = carouselAngle;

      // Vertical sinusoidal bobbing for each seat
      seats.forEach((seat, idx) => {
        const bob = Math.sin(time * 3 + idx * 1.5) * 0.4;
        seat.position.y = 2.0 + bob;
      });
    },
  };
}

// -------------------------------------------------------------
// 5. DROP TOWER
// -------------------------------------------------------------
export function buildDropTower(obj: DropTowerObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const { towerHeight, towerColor, carriageColor, cycleSpeed } = obj;

  const towerMat = new THREE.MeshStandardMaterial({
    color: towerColor,
    metalness: 0.75,
    roughness: 0.3,
  });

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });

  // Concrete Foundation Base
  const baseGeom = new THREE.BoxGeometry(7, 1.2, 7);
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.position.y = 0.6;
  group.add(base);

  // 4 Main Vertical Steel Lattice Columns
  const colRadius = 0.25;
  const colOffset = 1.6;
  [
    [-colOffset, -colOffset],
    [-colOffset, colOffset],
    [colOffset, -colOffset],
    [colOffset, colOffset],
  ].forEach(([cx, cz]) => {
    const colGeom = new THREE.CylinderGeometry(colRadius, colRadius, towerHeight, 8);
    const col = new THREE.Mesh(colGeom, towerMat);
    col.position.set(cx, towerHeight / 2 + 1.2, cz);
    group.add(col);
  });

  // Cross Struts Lattice along tower height
  const strutSteps = Math.floor(towerHeight / 3);
  for (let s = 1; s <= strutSteps; s++) {
    const yLevel = 1.2 + (s * towerHeight) / strutSteps;
    const ringGeom = new THREE.TorusGeometry(colOffset * 1.414, 0.1, 4, 4);
    const ring = new THREE.Mesh(ringGeom, towerMat);
    ring.position.set(0, yLevel, 0);
    ring.rotation.x = Math.PI / 2;
    ring.rotation.z = Math.PI / 4;
    group.add(ring);
  }

  // Top Machinery Cap & Beacon
  const capGeom = new THREE.BoxGeometry(4.2, 2.5, 4.2);
  const cap = new THREE.Mesh(capGeom, new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 }));
  cap.position.set(0, towerHeight + 2.4, 0);
  group.add(cap);

  // Warning Beacon Light
  const beaconGeom = new THREE.SphereGeometry(0.4, 12, 12);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const beacon = new THREE.Mesh(beaconGeom, beaconMat);
  beacon.position.set(0, towerHeight + 4.0, 0);
  group.add(beacon);

  // Passenger Carriage Ring
  const carriage = new THREE.Group();
  const carriageMat = new THREE.MeshStandardMaterial({ color: carriageColor, metalness: 0.6, roughness: 0.35 });

  const ringGeom = new THREE.CylinderGeometry(2.8, 2.8, 0.8, 16);
  const ring = new THREE.Mesh(ringGeom, carriageMat);
  carriage.add(ring);

  // Passenger Seats surrounding the ring
  const seatCount = 12;
  for (let i = 0; i < seatCount; i++) {
    const angle = (i / seatCount) * Math.PI * 2;
    const sx = Math.cos(angle) * 3.1;
    const sz = Math.sin(angle) * 3.1;

    const seatGeom = new THREE.BoxGeometry(0.5, 0.7, 0.5);
    const seat = new THREE.Mesh(seatGeom, new THREE.MeshStandardMaterial({ color: 0xd97706 }));
    seat.position.set(sx, 0.35, sz);
    seat.lookAt(new THREE.Vector3(sx * 2, 0.35, sz * 2));
    carriage.add(seat);
  }

  carriage.position.set(0, 2.5, 0);
  group.add(carriage);

  // Animation timeline state
  let cycleTimer = 0;
  const cycleTotal = 10.0 / cycleSpeed; // 10s per cycle
  const maxHeight = towerHeight - 3.0;

  return {
    rootGroup: group,
    update: (delta, time) => {
      cycleTimer = (cycleTimer + delta) % cycleTotal;
      const t = cycleTimer;

      let carriageY = 2.5;
      if (t < 5.0) {
        // Slow hoist phase (0 -> 5s)
        const progress = t / 5.0;
        carriageY = 2.5 + progress * (maxHeight - 2.5);
      } else if (t < 6.5) {
        // Tension pause at summit (5 -> 6.5s)
        carriageY = maxHeight;
      } else if (t < 7.4) {
        // Free-fall drop with acceleration (6.5 -> 7.4s)
        const dropT = (t - 6.5) / 0.9;
        carriageY = maxHeight - dropT * dropT * (maxHeight - 2.5);
      } else if (t < 8.2) {
        // Magnetic brake rebound bounce (7.4 -> 8.2s)
        const bounceT = (t - 7.4) / 0.8;
        carriageY = 2.5 + Math.sin(bounceT * Math.PI) * 4.0 * (1.0 - bounceT);
      } else {
        // Boarding rest at bottom
        carriageY = 2.5;
      }

      carriage.position.y = carriageY;

      // Beacon flashing
      beaconMat.color.setHex(Math.sin(time * 6) > 0 ? 0xff0000 : 0x330000);
    },
  };
}

// -------------------------------------------------------------
// 6. CUSTOM ARCHITECTURE
// -------------------------------------------------------------
export function buildCustomArchitecture(obj: CustomArchitectureObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const {
    shape,
    width,
    depth,
    wingWidth,
    wingDepth,
    wallHeight,
    roofStyle,
    finish,
    finishColor,
    roofColor,
    doorCount,
    windowCount,
  } = obj;

  // Material setup based on finish
  let wallMat: THREE.Material;
  switch (finish) {
    case 'timber':
      wallMat = new THREE.MeshStandardMaterial({
        color: finishColor || 0x854d0e,
        roughness: 0.8,
        metalness: 0.1,
      });
      break;
    case 'brick':
      wallMat = new THREE.MeshStandardMaterial({
        color: finishColor || 0xb91c1c,
        roughness: 0.9,
        metalness: 0.05,
      });
      break;
    case 'glass':
      wallMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.7,
        roughness: 0.1,
        metalness: 0.9,
      });
      break;
    case 'painted':
    default:
      wallMat = new THREE.MeshStandardMaterial({
        color: finishColor || 0xf1f5f9,
        roughness: 0.5,
        metalness: 0.1,
      });
      break;
  }

  const trimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
  const roofMat = new THREE.MeshStandardMaterial({ color: roofColor || 0x334155, roughness: 0.7 });

  if (shape === 'l_shaped') {
    // Main building wing
    const mainGeom = new THREE.BoxGeometry(width, wallHeight, depth);
    const mainMesh = new THREE.Mesh(mainGeom, wallMat);
    mainMesh.position.set(0, wallHeight / 2, 0);
    group.add(mainMesh);

    // Extension wing
    const wingGeom = new THREE.BoxGeometry(wingWidth, wallHeight, wingDepth);
    const wingMesh = new THREE.Mesh(wingGeom, wallMat);
    const wingX = width / 2 - wingWidth / 2;
    const wingZ = depth / 2 + wingDepth / 2;
    wingMesh.position.set(wingX, wallHeight / 2, wingZ);
    group.add(wingMesh);

    // Roof for L-shape
    if (roofStyle === 'gable') {
      const roofMain = new THREE.ConeGeometry(Math.max(width, depth) * 0.7, 2.5, 4);
      const rMesh = new THREE.Mesh(roofMain, roofMat);
      rMesh.position.set(0, wallHeight + 1.25, 0);
      rMesh.rotation.y = Math.PI / 4;
      group.add(rMesh);
    } else {
      const roofFlat = new THREE.BoxGeometry(width * 1.05, 0.4, depth * 1.05);
      const rMesh = new THREE.Mesh(roofFlat, roofMat);
      rMesh.position.set(0, wallHeight + 0.2, 0);
      group.add(rMesh);
    }
  } else {
    // Rectangular Footprint
    const wallGeom = new THREE.BoxGeometry(width, wallHeight, depth);
    const wallMesh = new THREE.Mesh(wallGeom, wallMat);
    wallMesh.position.set(0, wallHeight / 2, 0);
    group.add(wallMesh);

    // Roof construction
    if (roofStyle === 'gable') {
      // Pitched Gable Prism
      const ridgeLen = depth * 1.08;
      const roofSpan = width * 1.08;
      const roofPeak = 2.6;

      const roofGeom = new THREE.ConeGeometry(roofSpan * 0.7, roofPeak, 4);
      const roofMesh = new THREE.Mesh(roofGeom, roofMat);
      roofMesh.position.set(0, wallHeight + roofPeak / 2, 0);
      roofMesh.rotation.y = Math.PI / 4;
      roofMesh.scale.set(1, 1, ridgeLen / roofSpan);
      group.add(roofMesh);
    } else if (roofStyle === 'hip') {
      const roofGeom = new THREE.ConeGeometry(Math.max(width, depth) * 0.75, 2.8, 4);
      const roofMesh = new THREE.Mesh(roofGeom, roofMat);
      roofMesh.position.set(0, wallHeight + 1.4, 0);
      roofMesh.rotation.y = Math.PI / 4;
      group.add(roofMesh);
    } else if (roofStyle === 'mansard') {
      const lowerMansard = new THREE.CylinderGeometry(width * 0.5, width * 0.58, 1.8, 4);
      const mMesh = new THREE.Mesh(lowerMansard, roofMat);
      mMesh.position.set(0, wallHeight + 0.9, 0);
      mMesh.rotation.y = Math.PI / 4;
      group.add(mMesh);
    } else {
      // Flat roof with parapet
      const flatGeom = new THREE.BoxGeometry(width * 1.06, 0.4, depth * 1.06);
      const flatMesh = new THREE.Mesh(flatGeom, roofMat);
      flatMesh.position.set(0, wallHeight + 0.2, 0);
      group.add(flatMesh);
    }

    // Front Doors
    const doorSpacing = width / (doorCount + 1);
    for (let d = 0; d < doorCount; d++) {
      const dx = -width / 2 + doorSpacing * (d + 1);
      const doorGeom = new THREE.BoxGeometry(1.4, 2.4, 0.2);
      const doorMesh = new THREE.Mesh(doorGeom, trimMat);
      doorMesh.position.set(dx, 1.2, depth / 2 + 0.05);
      group.add(doorMesh);
    }

    // Windows along front facade
    const winSpacing = width / (windowCount + 1);
    for (let w = 0; w < windowCount; w++) {
      const wx = -width / 2 + winSpacing * (w + 1);
      const winGeom = new THREE.BoxGeometry(1.2, 1.4, 0.15);
      const winMesh = new THREE.Mesh(
        winGeom,
        new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.1, metalness: 0.9 })
      );
      winMesh.position.set(wx, wallHeight * 0.65, depth / 2 + 0.05);
      group.add(winMesh);
    }
  }

  return {
    rootGroup: group,
    update: () => {},
  };
}

// -------------------------------------------------------------
// 7. WAVE POOL
// -------------------------------------------------------------
export function buildWavePool(obj: WavePoolObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const { poolWidth, poolLength, waterColor, tileColor, waveSpeed } = obj;

  // Outer pool coping deck
  const deckMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 });
  const deckGeom = new THREE.BoxGeometry(poolWidth + 3, 0.4, poolLength + 3);
  const deck = new THREE.Mesh(deckGeom, deckMat);
  deck.position.y = 0.2;
  group.add(deck);

  // Pool Basin (recessed)
  const basinMat = new THREE.MeshStandardMaterial({ color: tileColor || 0x38bdf8, roughness: 0.4 });
  const basinGeom = new THREE.BoxGeometry(poolWidth, 1.2, poolLength);
  const basin = new THREE.Mesh(basinGeom, basinMat);
  basin.position.y = 0.6;
  group.add(basin);

  // Rear wave generator mechanical machine house
  const pumpHouseGeom = new THREE.BoxGeometry(poolWidth * 0.9, 3.2, 4.5);
  const pumpHouse = new THREE.Mesh(
    pumpHouseGeom,
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 })
  );
  pumpHouse.position.set(0, 1.6, -poolLength / 2 - 2.0);
  group.add(pumpHouse);

  // Animated Water Plane with displacement
  const waterGeom = new THREE.PlaneGeometry(poolWidth * 0.96, poolLength * 0.95, 24, 24);
  const waterMat = new THREE.MeshStandardMaterial({
    color: waterColor || 0x0ea5e9,
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.85,
  });
  const waterMesh = new THREE.Mesh(waterGeom, waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.y = 0.95;
  group.add(waterMesh);

  const posAttr = waterGeom.attributes.position;
  const initialZ = new Float32Array(posAttr.count);
  for (let i = 0; i < posAttr.count; i++) {
    initialZ[i] = posAttr.getZ(i);
  }

  return {
    rootGroup: group,
    update: (delta, time) => {
      // Wave motion animation along length
      for (let i = 0; i < posAttr.count; i++) {
        const yCoord = posAttr.getY(i);
        const wave = Math.sin(time * 3.5 * waveSpeed + yCoord * 0.35) * 0.25;
        posAttr.setZ(i, initialZ[i] + wave);
      }
      posAttr.needsUpdate = true;
    },
  };
}

// -------------------------------------------------------------
// 8. SLIDE TOWER
// -------------------------------------------------------------
export function buildSlideTower(obj: SlideTowerObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const { towerHeight, slideColor1, slideColor2, poolWidth } = obj;

  // Steel Tower Framework
  const towerMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });
  const platformMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.5 });

  // 4 corner columns
  const colOffset = 2.8;
  [
    [-colOffset, -colOffset],
    [-colOffset, colOffset],
    [colOffset, -colOffset],
    [colOffset, colOffset],
  ].forEach(([cx, cz]) => {
    const colGeom = new THREE.CylinderGeometry(0.2, 0.2, towerHeight, 8);
    const col = new THREE.Mesh(colGeom, towerMat);
    col.position.set(cx, towerHeight / 2, cz);
    group.add(col);
  });

  // Top Launch Platform & Canopy
  const platGeom = new THREE.BoxGeometry(colOffset * 2.5, 0.6, colOffset * 2.5);
  const plat = new THREE.Mesh(platGeom, platformMat);
  plat.position.y = towerHeight;
  group.add(plat);

  const canopyGeom = new THREE.ConeGeometry(colOffset * 2.0, 2.5, 4);
  const canopy = new THREE.Mesh(
    canopyGeom,
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 })
  );
  canopy.position.y = towerHeight + 2.0;
  canopy.rotation.y = Math.PI / 4;
  group.add(canopy);

  // Splash Pool at bottom
  const poolMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0.85,
    roughness: 0.1,
  });
  const poolGeom = new THREE.BoxGeometry(poolWidth || 12, 0.6, 14);
  const pool = new THREE.Mesh(poolGeom, poolMat);
  pool.position.set(0, 0.3, 14);
  group.add(pool);

  // Twisting Slide 1 (Tube)
  const slide1Pts: THREE.Vector3[] = [];
  const slide2Pts: THREE.Vector3[] = [];
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = towerHeight * (1.0 - t) + 1.2;
    const angle1 = t * Math.PI * 3.5;
    const r1 = 4.0 + t * 5.0;
    slide1Pts.push(new THREE.Vector3(Math.cos(angle1) * r1, y, Math.sin(angle1) * r1 + t * 14));

    const angle2 = -t * Math.PI * 3.0 + Math.PI;
    const r2 = 3.5 + t * 4.5;
    slide2Pts.push(new THREE.Vector3(Math.cos(angle2) * r2, y, Math.sin(angle2) * r2 + t * 12));
  }

  const curve1 = new THREE.CatmullRomCurve3(slide1Pts);
  const curve2 = new THREE.CatmullRomCurve3(slide2Pts);

  const tube1Mat = new THREE.MeshStandardMaterial({ color: slideColor1 || 0x0ea5e9, roughness: 0.25 });
  const tube2Mat = new THREE.MeshStandardMaterial({ color: slideColor2 || 0xf43f5e, roughness: 0.25 });

  const slideMesh1 = new THREE.Mesh(new THREE.TubeGeometry(curve1, 64, 0.75, 12, false), tube1Mat);
  const slideMesh2 = new THREE.Mesh(new THREE.TubeGeometry(curve2, 64, 0.75, 12, false), tube2Mat);
  group.add(slideMesh1);
  group.add(slideMesh2);

  return {
    rootGroup: group,
    update: () => {},
  };
}

// -------------------------------------------------------------
// 9. LAZY RIVER
// -------------------------------------------------------------
export function buildLazyRiver(obj: LazyRiverObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const { channelWidth, riverRadius, waterColor, tubeCount } = obj;
  const r = riverRadius || 22;
  const w = channelWidth || 4.5;

  const pts: THREE.Vector3[] = [
    new THREE.Vector3(r, 0.4, 0),
    new THREE.Vector3(r * 0.7, 0.4, r * 0.7),
    new THREE.Vector3(0, 0.4, r),
    new THREE.Vector3(-r * 0.7, 0.4, r * 0.7),
    new THREE.Vector3(-r, 0.4, 0),
    new THREE.Vector3(-r * 0.7, 0.4, -r * 0.7),
    new THREE.Vector3(0, 0.4, -r),
    new THREE.Vector3(r * 0.7, 0.4, -r * 0.7),
  ];
  const curve = new THREE.CatmullRomCurve3(pts, true);

  // Water Tube Ribbon
  const waterGeom = new THREE.TubeGeometry(curve, 96, w * 0.5, 8, true);
  waterGeom.scale(1, 0.12, 1);
  const waterMat = new THREE.MeshStandardMaterial({
    color: waterColor || 0x06b6d4,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85,
  });
  const waterMesh = new THREE.Mesh(waterGeom, waterMat);
  waterMesh.position.y = 0.3;
  group.add(waterMesh);

  // Floating Inner Tube Rings
  const tubes: THREE.Mesh[] = [];
  const tubeColors = [0xf43f5e, 0xfbbf24, 0x10b981, 0x8b5cf6, 0x3b82f6];
  for (let i = 0; i < (tubeCount || 4); i++) {
    const tGeom = new THREE.TorusGeometry(1.0, 0.35, 8, 20);
    const tMat = new THREE.MeshStandardMaterial({ color: tubeColors[i % tubeColors.length], roughness: 0.3 });
    const ring = new THREE.Mesh(tGeom, tMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.4;
    group.add(ring);
    tubes.push(ring);
  }

  let flowT = 0;

  return {
    rootGroup: group,
    update: (delta, time) => {
      flowT = (flowT + delta * 0.03) % 1.0;
      tubes.forEach((ring, idx) => {
        const offsetT = (flowT + idx / tubes.length) % 1.0;
        const pos = curve.getPointAt(offsetT);
        const bob = Math.sin(time * 3 + idx * 2) * 0.05;
        ring.position.set(pos.x, 0.35 + bob, pos.z);
      });
    },
  };
}

// -------------------------------------------------------------
// 10. LAGOON
// -------------------------------------------------------------
export function buildLagoon(obj: LagoonObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const { radiusX, radiusZ, waterColor, rockBorder } = obj;

  // Sandy shoreline border
  const shoreGeom = new THREE.CylinderGeometry(radiusX + 2.5, radiusZ + 2.5, 0.15, 36);
  shoreGeom.scale(1, 1, radiusZ / radiusX);
  const shoreMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.9 });
  const shore = new THREE.Mesh(shoreGeom, shoreMat);
  shore.position.y = 0.06;
  group.add(shore);

  // Water Surface
  const waterGeom = new THREE.CylinderGeometry(radiusX, radiusZ, 0.3, 36);
  waterGeom.scale(1, 1, radiusZ / radiusX);
  const waterMat = new THREE.MeshStandardMaterial({
    color: waterColor || 0x0284c7,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.9,
  });
  const water = new THREE.Mesh(waterGeom, waterMat);
  water.position.y = 0.15;
  group.add(water);

  // Perimeter decorative river boulders
  if (rockBorder) {
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });
    const numRocks = 18;
    for (let r = 0; r < numRocks; r++) {
      const angle = (r / numRocks) * Math.PI * 2;
      const rx = Math.cos(angle) * (radiusX + 1.2);
      const rz = Math.sin(angle) * (radiusZ + 1.2);
      const rockGeom = new THREE.DodecahedronGeometry(0.7 + (r % 3) * 0.3, 0);
      const rock = new THREE.Mesh(rockGeom, rockMat);
      rock.position.set(rx, 0.4, rz);
      rock.rotation.set(r * 0.5, r * 0.8, 0);
      group.add(rock);
    }
  }

  return {
    rootGroup: group,
    update: () => {},
  };
}

// -------------------------------------------------------------
// 11. TREES (BOTANICAL PALM GROVE)
// -------------------------------------------------------------
export function buildTrees(obj: TreesObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const { treeCount, clusterRadius, treeType, foliageTone } = obj;
  const count = treeCount || 8;
  const rad = clusterRadius || 14;

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const frondMat = new THREE.MeshStandardMaterial({ color: foliageTone || 0x15803d, roughness: 0.6 });

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (i % 2) * 0.4;
    const dist = (rad * 0.35) + ((i * 7) % Math.floor(rad * 0.65));
    const tx = Math.cos(angle) * dist;
    const tz = Math.sin(angle) * dist;

    const tree = new THREE.Group();
    const treeH = 5.5 + (i % 4) * 1.5;

    // Curved palm trunk
    const trunkGeom = new THREE.CylinderGeometry(0.25, 0.4, treeH, 6);
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.position.y = treeH / 2;
    trunk.rotation.z = Math.sin(i) * 0.12;
    tree.add(trunk);

    // Palm fronds umbrella
    if (treeType === 'palm' || !treeType) {
      for (let f = 0; f < 6; f++) {
        const fAngle = (f / 6) * Math.PI * 2;
        const frondGeom = new THREE.ConeGeometry(0.8, 3.2, 4);
        const frond = new THREE.Mesh(frondGeom, frondMat);
        frond.position.set(Math.cos(fAngle) * 1.2, treeH + 0.3, Math.sin(fAngle) * 1.2);
        frond.rotation.set(Math.PI / 3, fAngle, 0);
        tree.add(frond);
      }
    } else {
      // Conical evergreen
      const crown = new THREE.Mesh(new THREE.ConeGeometry(2.0, 4.5, 6), frondMat);
      crown.position.y = treeH + 1.2;
      tree.add(crown);
    }

    tree.position.set(tx, 0, tz);
    group.add(tree);
  }

  return {
    rootGroup: group,
    update: () => {},
  };
}

// -------------------------------------------------------------
// 12. PEDESTRIAN PATH
// -------------------------------------------------------------
export function buildPedestrianPath(obj: PedestrianPathObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const { pathWidth, pathLength, pavingColor } = obj;
  const w = pathWidth || 4.5;
  const l = pathLength || 25;

  // Main Paving Strip
  const pathMat = new THREE.MeshStandardMaterial({
    color: pavingColor || 0xcbd5e1,
    roughness: 0.85,
  });
  const pathGeom = new THREE.BoxGeometry(w, 0.1, l);
  const pathMesh = new THREE.Mesh(pathGeom, pathMat);
  pathMesh.position.y = 0.05;
  group.add(pathMesh);

  // Left & Right Stone Curbs
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
  const curbGeom = new THREE.BoxGeometry(0.25, 0.18, l);

  const curbL = new THREE.Mesh(curbGeom, curbMat);
  curbL.position.set(-w / 2, 0.09, 0);
  group.add(curbL);

  const curbR = new THREE.Mesh(curbGeom, curbMat);
  curbR.position.set(w / 2, 0.09, 0);
  group.add(curbR);

  return {
    rootGroup: group,
    update: () => {},
  };
}

// -------------------------------------------------------------
// 13. BENCHES
// -------------------------------------------------------------
export function buildBenches(obj: BenchesObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const { benchCount, benchLength, woodColor } = obj;
  const count = benchCount || 2;
  const len = benchLength || 2.2;

  const woodMat = new THREE.MeshStandardMaterial({ color: woodColor || 0x854d0e, roughness: 0.7 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });

  for (let b = 0; b < count; b++) {
    const bench = new THREE.Group();
    const bx = (b - (count - 1) / 2) * (len + 1.5);

    // Seat Slats
    const seatGeom = new THREE.BoxGeometry(len, 0.08, 0.55);
    const seat = new THREE.Mesh(seatGeom, woodMat);
    seat.position.y = 0.45;
    bench.add(seat);

    // Backrest Slats
    const backGeom = new THREE.BoxGeometry(len, 0.45, 0.08);
    const back = new THREE.Mesh(backGeom, woodMat);
    back.position.set(0, 0.75, -0.25);
    bench.add(back);

    // Cast Iron Legs
    [-len * 0.4, len * 0.4].forEach((lx) => {
      const legGeom = new THREE.BoxGeometry(0.08, 0.45, 0.55);
      const leg = new THREE.Mesh(legGeom, metalMat);
      leg.position.set(lx, 0.225, 0);
      bench.add(leg);
    });

    bench.position.set(bx, 0, 0);
    group.add(bench);
  }

  return {
    rootGroup: group,
    update: () => {},
  };
}

// -------------------------------------------------------------
// 14. SWING RIDE
// -------------------------------------------------------------
export function buildSwingRide(obj: SwingRideObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const { towerHeight, canopyDiameter, armCount, canopyColor, chairColor, rotationSpeed } = obj;

  // Base platform
  const baseGeom = new THREE.CylinderGeometry(canopyDiameter * 0.45, canopyDiameter * 0.5, 0.8, 24);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.4, roughness: 0.6 });
  const baseMesh = new THREE.Mesh(baseGeom, baseMat);
  baseMesh.position.y = 0.4;
  group.add(baseMesh);

  // Central lattice column / mast
  const mastGeom = new THREE.CylinderGeometry(0.8, 1.4, towerHeight, 16);
  const mastMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.7, roughness: 0.3 });
  const mastMesh = new THREE.Mesh(mastGeom, mastMat);
  mastMesh.position.y = towerHeight / 2;
  group.add(mastMesh);

  // Rotating top assembly
  const rotatingAssembly = new THREE.Group();
  rotatingAssembly.position.y = towerHeight - 0.5;

  // Upper tilted canopy
  const canopyGeom = new THREE.ConeGeometry(canopyDiameter * 0.5, 3.2, armCount);
  const canopyMat = new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.4 });
  const canopyMesh = new THREE.Mesh(canopyGeom, canopyMat);
  canopyMesh.position.y = 1.6;
  rotatingAssembly.add(canopyMesh);

  // Radial swing arms and hanging chairs
  const chairs: { arm: THREE.Group; chain: THREE.Line; chair: THREE.Mesh }[] = [];
  const radius = canopyDiameter * 0.46;
  for (let i = 0; i < armCount; i++) {
    const angle = (i / armCount) * Math.PI * 2;
    const armGroup = new THREE.Group();
    armGroup.position.set(Math.cos(angle) * radius, 0.2, Math.sin(angle) * radius);

    // Hanging chair mesh
    const chairGeom = new THREE.BoxGeometry(0.7, 0.8, 0.7);
    const chairMat = new THREE.MeshStandardMaterial({ color: chairColor, roughness: 0.5 });
    const chairMesh = new THREE.Mesh(chairGeom, chairMat);
    chairMesh.position.set(0, -6.5, 0);
    armGroup.add(chairMesh);

    // Chain cable line
    const chainPts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -6.1, 0)];
    const chainGeom = new THREE.BufferGeometry().setFromPoints(chainPts);
    const chainMat = new THREE.LineBasicMaterial({ color: 0x94a3b8 });
    const chainLine = new THREE.Line(chainGeom, chainMat);
    armGroup.add(chainLine);

    rotatingAssembly.add(armGroup);
    chairs.push({ arm: armGroup, chain: chainLine, chair: chairMesh });
  }

  group.add(rotatingAssembly);

  let currentAngle = 0;
  return {
    rootGroup: group,
    update: (delta) => {
      currentAngle += delta * rotationSpeed * 1.5;
      rotatingAssembly.rotation.y = currentAngle;
      const swingOutAngle = Math.min(0.45, rotationSpeed * 0.35);
      chairs.forEach((c) => {
        c.arm.rotation.z = Math.sin(currentAngle) * 0.05;
        c.chair.rotation.z = swingOutAngle;
      });
    },
    getRideCameraTransform: () => {
      if (chairs.length === 0) return null;
      const targetPos = new THREE.Vector3();
      chairs[0].chair.getWorldPosition(targetPos);
      return {
        position: new THREE.Vector3(targetPos.x, targetPos.y + 0.6, targetPos.z),
        lookAt: new THREE.Vector3(targetPos.x + 5, targetPos.y + 0.4, targetPos.z),
      };
    },
  };
}

// -------------------------------------------------------------
// 15. BUMPER CARS
// -------------------------------------------------------------
export function buildBumperCars(obj: BumperCarsObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;
  const { arenaWidth, arenaLength, carCount, roofColor, floorColor, bumperColor } = obj;

  // Floor
  const floorGeom = new THREE.BoxGeometry(arenaWidth, 0.4, arenaLength);
  const floorMat = new THREE.MeshStandardMaterial({ color: floorColor, metalness: 0.6, roughness: 0.3 });
  const floor = new THREE.Mesh(floorGeom, floorMat);
  floor.position.y = 0.2;
  group.add(floor);

  // Perimeter rubber bumper barrier
  const barrierMat = new THREE.MeshStandardMaterial({ color: bumperColor, roughness: 0.6 });
  const bThick = 0.6;
  const bHeight = 0.9;
  [-arenaWidth / 2 + bThick / 2, arenaWidth / 2 - bThick / 2].forEach((x) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(bThick, bHeight, arenaLength), barrierMat);
    wall.position.set(x, bHeight / 2 + 0.4, 0);
    group.add(wall);
  });
  [-arenaLength / 2 + bThick / 2, arenaLength / 2 - bThick / 2].forEach((z) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(arenaWidth, bHeight, bThick), barrierMat);
    wall.position.set(0, bHeight / 2 + 0.4, z);
    group.add(wall);
  });

  // Roof & electrical grid overhead
  const roofHeight = 5.5;
  const roofGeom = new THREE.BoxGeometry(arenaWidth + 1.2, 0.5, arenaLength + 1.2);
  const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.4 });
  const roof = new THREE.Mesh(roofGeom, roofMat);
  roof.position.y = roofHeight;
  group.add(roof);

  // 4 Corner Pillars
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });
  [
    [-arenaWidth / 2 + 0.5, -arenaLength / 2 + 0.5],
    [arenaWidth / 2 - 0.5, -arenaLength / 2 + 0.5],
    [-arenaWidth / 2 + 0.5, arenaLength / 2 - 0.5],
    [arenaWidth / 2 - 0.5, arenaLength / 2 - 0.5],
  ].forEach(([px, pz]) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, roofHeight, 8), pillarMat);
    pillar.position.set(px, roofHeight / 2, pz);
    group.add(pillar);
  });

  // Multiple colored Bumper Cars
  const carColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899];
  const carMeshes: { mesh: THREE.Group; speedX: number; speedZ: number }[] = [];
  for (let i = 0; i < carCount; i++) {
    const carGroup = new THREE.Group();
    const carMat = new THREE.MeshStandardMaterial({ color: carColors[i % carColors.length], roughness: 0.3 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.6, 12), carMat);
    body.position.y = 0.7;
    carGroup.add(body);

    const ringMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.15, 8, 16), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.55;
    carGroup.add(ring);

    const poleMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, roofHeight - 0.8, 6), poleMat);
    pole.position.set(0, (roofHeight - 0.8) / 2 + 0.8, -0.6);
    carGroup.add(pole);

    const posX = ((i % 4) - 1.5) * (arenaWidth * 0.18);
    const posZ = (Math.floor(i / 4) - 0.5) * (arenaLength * 0.25);
    carGroup.position.set(posX, 0, posZ);
    carGroup.rotation.y = Math.random() * Math.PI * 2;
    group.add(carGroup);

    carMeshes.push({
      mesh: carGroup,
      speedX: (Math.random() - 0.5) * 2.0,
      speedZ: (Math.random() - 0.5) * 2.0,
    });
  }

  return {
    rootGroup: group,
    update: (delta) => {
      carMeshes.forEach((c) => {
        c.mesh.position.x += c.speedX * delta;
        c.mesh.position.z += c.speedZ * delta;
        const boundX = arenaWidth * 0.42;
        const boundZ = arenaLength * 0.42;
        if (Math.abs(c.mesh.position.x) > boundX) {
          c.speedX *= -1;
          c.mesh.rotation.y += Math.PI / 2;
        }
        if (Math.abs(c.mesh.position.z) > boundZ) {
          c.speedZ *= -1;
          c.mesh.rotation.y += Math.PI / 2;
        }
      });
    },
  };
}

// -------------------------------------------------------------
// 16. KIDS ATTRACTION (SPINNING TEACUPS)
// -------------------------------------------------------------
export function buildKidsAttraction(obj: KidsAttractionObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;
  const { diameter, primaryColor, secondaryColor, rotationSpeed } = obj;

  const platGeom = new THREE.CylinderGeometry(diameter * 0.5, diameter * 0.52, 0.7, 24);
  const platMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
  const platform = new THREE.Mesh(platGeom, platMat);
  platform.position.y = 0.35;
  group.add(platform);

  const turntable = new THREE.Group();
  turntable.position.y = 0.7;

  const potMat = new THREE.MeshStandardMaterial({ color: primaryColor, roughness: 0.3 });
  const potBody = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 16), potMat);
  potBody.position.y = 1.6;
  turntable.add(potBody);
  const potLid = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.8, 16), new THREE.MeshStandardMaterial({ color: secondaryColor }));
  potLid.position.y = 3.2;
  turntable.add(potLid);

  const cupGroups: THREE.Group[] = [];
  const cupRadius = diameter * 0.35;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const cupGroup = new THREE.Group();
    cupGroup.position.set(Math.cos(angle) * cupRadius, 0, Math.sin(angle) * cupRadius);

    const cupGeom = new THREE.CylinderGeometry(1.1, 0.7, 0.9, 14);
    const cupMat = new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? primaryColor : secondaryColor, roughness: 0.4 });
    const cup = new THREE.Mesh(cupGeom, cupMat);
    cup.position.y = 0.55;
    cupGroup.add(cup);

    const wheelMesh = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 6, 12), new THREE.MeshStandardMaterial({ color: 0xf1f5f9 }));
    wheelMesh.rotation.x = Math.PI / 2;
    wheelMesh.position.y = 0.85;
    cupGroup.add(wheelMesh);

    turntable.add(cupGroup);
    cupGroups.push(cupGroup);
  }

  group.add(turntable);

  let currentAngle = 0;
  return {
    rootGroup: group,
    update: (delta) => {
      currentAngle += delta * rotationSpeed;
      turntable.rotation.y = currentAngle;
      cupGroups.forEach((cg, idx) => {
        cg.rotation.y = -currentAngle * 2.5 * (idx % 2 === 0 ? 1 : -1);
      });
    },
  };
}

// -------------------------------------------------------------
// 17. ENTRANCE GATE
// -------------------------------------------------------------
export function buildEntranceGate(obj: EntranceGateObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;
  const { archWidth, archHeight, primaryColor, accentColor, turnstileCount } = obj;

  const towerWidth = 3.2;
  const towerHeight = archHeight + 2.5;

  const towerMat = new THREE.MeshStandardMaterial({ color: primaryColor, roughness: 0.5 });
  const accentMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.3 });

  [-archWidth / 2 + towerWidth / 2, archWidth / 2 - towerWidth / 2].forEach((tx) => {
    const towerGeom = new THREE.BoxGeometry(towerWidth, towerHeight, 3.5);
    const tower = new THREE.Mesh(towerGeom, towerMat);
    tower.position.set(tx, towerHeight / 2, 0);
    group.add(tower);

    const capGeom = new THREE.ConeGeometry(towerWidth * 0.75, 2.5, 4);
    const cap = new THREE.Mesh(capGeom, accentMat);
    cap.position.set(tx, towerHeight + 1.25, 0);
    cap.rotation.y = Math.PI / 4;
    group.add(cap);
  });

  const beamHeight = 2.4;
  const beamGeom = new THREE.BoxGeometry(archWidth, beamHeight, 2.5);
  const beam = new THREE.Mesh(beamGeom, towerMat);
  beam.position.set(0, archHeight - beamHeight / 2, 0);
  group.add(beam);

  const marqueeGeom = new THREE.BoxGeometry(archWidth * 0.75, 1.6, 0.4);
  const marqueeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
  const marquee = new THREE.Mesh(marqueeGeom, marqueeMat);
  marquee.position.set(0, archHeight + 1.2, 1.2);
  group.add(marquee);

  const laneSpan = (archWidth - towerWidth * 2) / (turnstileCount + 1);
  const turnstileMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
  for (let i = 1; i <= turnstileCount; i++) {
    const lx = -archWidth / 2 + towerWidth + i * laneSpan;
    const kiosk = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 1.2), turnstileMat);
    kiosk.position.set(lx, 0.6, 0);
    group.add(kiosk);
  }

  return { rootGroup: group, update: () => {} };
}

// -------------------------------------------------------------
// 18. RESTAURANT
// -------------------------------------------------------------
export function buildRestaurant(obj: RestaurantObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;
  const { width, depth, wallHeight, finishColor, roofColor, hasOutdoorPatio } = obj;

  const wallMat = new THREE.MeshStandardMaterial({ color: finishColor, roughness: 0.6 });
  const walls = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, depth), wallMat);
  walls.position.set(0, wallHeight / 2, 0);
  group.add(walls);

  const roofHeight = 3.5;
  const roofGeom = new THREE.ConeGeometry(Math.max(width, depth) * 0.7, roofHeight, 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.4 });
  const roof = new THREE.Mesh(roofGeom, roofMat);
  roof.position.set(0, wallHeight + roofHeight / 2, 0);
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, transparent: true, opacity: 0.75 });
  const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(width * 0.6, wallHeight * 0.5, 0.2), glassMat);
  windowMesh.position.set(0, wallHeight * 0.45, depth / 2 + 0.1);
  group.add(windowMesh);

  if (hasOutdoorPatio) {
    const patioDepth = 8;
    const patioGeom = new THREE.BoxGeometry(width + 2, 0.2, patioDepth);
    const patioMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
    const patio = new THREE.Mesh(patioGeom, patioMat);
    patio.position.set(0, 0.1, depth / 2 + patioDepth / 2);
    group.add(patio);

    for (let tx = -width * 0.35; tx <= width * 0.35; tx += width * 0.35) {
      const tableGroup = new THREE.Group();
      tableGroup.position.set(tx, 0.2, depth / 2 + patioDepth * 0.5);

      const table = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.1, 12), new THREE.MeshStandardMaterial({ color: 0x78350f }));
      table.position.y = 0.8;
      tableGroup.add(table);

      const umbrella = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.8, 8), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
      umbrella.position.y = 2.4;
      tableGroup.add(umbrella);

      group.add(tableGroup);
    }
  }

  return { rootGroup: group, update: () => {} };
}

// -------------------------------------------------------------
// 19. SHOP
// -------------------------------------------------------------
export function buildShop(obj: ShopObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;
  const { width, depth, wallHeight, finishColor, roofColor, awningColor } = obj;

  const wallMat = new THREE.MeshStandardMaterial({ color: finishColor, roughness: 0.5 });
  const walls = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, depth), wallMat);
  walls.position.set(0, wallHeight / 2, 0);
  group.add(walls);

  const roofHeight = 2.2;
  const roofGeom = new THREE.ConeGeometry(Math.max(width, depth) * 0.65, roofHeight, 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.4 });
  const roof = new THREE.Mesh(roofGeom, roofMat);
  roof.position.set(0, wallHeight + roofHeight / 2, 0);
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  const awningMat = new THREE.MeshStandardMaterial({ color: awningColor, roughness: 0.5 });
  const awning = new THREE.Mesh(new THREE.BoxGeometry(width * 0.85, 0.4, 2.2), awningMat);
  awning.position.set(0, wallHeight * 0.75, depth / 2 + 1.1);
  awning.rotation.x = Math.PI / 10;
  group.add(awning);

  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, transparent: true, opacity: 0.8 });
  const glass = new THREE.Mesh(new THREE.BoxGeometry(width * 0.7, wallHeight * 0.4, 0.2), glassMat);
  glass.position.set(0, wallHeight * 0.35, depth / 2 + 0.1);
  group.add(glass);

  return { rootGroup: group, update: () => {} };
}

// -------------------------------------------------------------
// 20. PARKING AREA
// -------------------------------------------------------------
export function buildParkingArea(obj: ParkingAreaObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;
  const { lotWidth, lotLength, carCount, asphaltColor, hasLightPoles } = obj;

  const asphaltMat = new THREE.MeshStandardMaterial({ color: asphaltColor, roughness: 0.8 });
  const ground = new THREE.Mesh(new THREE.BoxGeometry(lotWidth, 0.2, lotLength), asphaltMat);
  ground.position.y = 0.1;
  group.add(ground);

  const lineMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
  const rows = 2;
  const stallsPerRow = Math.floor(lotWidth / 4.5);
  for (let r = 0; r < rows; r++) {
    const zOffset = (r === 0 ? -1 : 1) * (lotLength * 0.25);
    for (let s = 0; s <= stallsPerRow; s++) {
      const x = -lotWidth / 2 + 2 + s * 4.2;
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 5.0), lineMat);
      line.position.set(x, 0.22, zOffset);
      group.add(line);
    }
  }

  const carColors = [0xd97706, 0x2563eb, 0xdc2626, 0x16a34a, 0x9333ea, 0x475569];
  const maxCars = Math.min(carCount, stallsPerRow * 2);
  for (let i = 0; i < maxCars; i++) {
    const r = i % 2;
    const col = Math.floor(i / 2);
    if (col >= stallsPerRow) break;

    const carGroup = new THREE.Group();
    const cx = -lotWidth / 2 + 4.1 + col * 4.2;
    const cz = (r === 0 ? -1 : 1) * (lotLength * 0.25);
    carGroup.position.set(cx, 0.2, cz);

    const carMat = new THREE.MeshStandardMaterial({ color: carColors[i % carColors.length], roughness: 0.3 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 4.2), carMat);
    body.position.y = 0.6;
    carGroup.add(body);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 2.4), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1 }));
    cabin.position.set(0, 1.25, -0.2);
    carGroup.add(cabin);

    group.add(carGroup);
  }

  if (hasLightPoles) {
    [-lotWidth * 0.35, lotWidth * 0.35].forEach((lx) => {
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 });
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 7, 8), poleMat);
      pole.position.set(lx, 3.5, 0);
      group.add(pole);

      const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.6), new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.5 }));
      lamp.position.set(lx, 7.0, 0);
      group.add(lamp);
    });
  }

  return { rootGroup: group, update: () => {} };
}

// -------------------------------------------------------------
// 21. GARDENS
// -------------------------------------------------------------
export function buildGardens(obj: GardensObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;
  const { gardenWidth, gardenLength, flowerColor, hedges } = obj;

  const grassMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
  const lawn = new THREE.Mesh(new THREE.BoxGeometry(gardenWidth, 0.2, gardenLength), grassMat);
  lawn.position.y = 0.1;
  group.add(lawn);

  const pathMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
  const pathX = new THREE.Mesh(new THREE.BoxGeometry(gardenWidth, 0.05, 2.4), pathMat);
  pathX.position.set(0, 0.22, 0);
  group.add(pathX);
  const pathZ = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, gardenLength), pathMat);
  pathZ.position.set(0, 0.22, 0);
  group.add(pathZ);

  const flowerMat = new THREE.MeshStandardMaterial({ color: flowerColor, roughness: 0.6 });
  const bedWidth = gardenWidth * 0.36;
  const bedLength = gardenLength * 0.36;
  const offX = gardenWidth * 0.26;
  const offZ = gardenLength * 0.26;

  [[-offX, -offZ], [offX, -offZ], [-offX, offZ], [offX, offZ]].forEach(([bx, bz]) => {
    const bed = new THREE.Mesh(new THREE.BoxGeometry(bedWidth, 0.35, bedLength), flowerMat);
    bed.position.set(bx, 0.3, bz);
    group.add(bed);

    if (hedges) {
      const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 });
      const hedge = new THREE.Mesh(new THREE.BoxGeometry(bedWidth + 0.6, 0.6, bedLength + 0.6), hedgeMat);
      hedge.position.set(bx, 0.45, bz);
      group.add(hedge);
    }
  });

  const centerUrn = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 1.4, 12), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 }));
  centerUrn.position.set(0, 0.9, 0);
  group.add(centerUrn);

  return { rootGroup: group, update: () => {} };
}

// -------------------------------------------------------------
// 22. BRIDGE
// -------------------------------------------------------------
export function buildBridge(obj: BridgeObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;
  const { bridgeLength, bridgeWidth, archHeight, deckColor, railColor } = obj;

  const halfLen = bridgeLength / 2;
  const curvePts = [
    new THREE.Vector3(-halfLen, 0.2, 0),
    new THREE.Vector3(-halfLen * 0.5, archHeight * 0.7, 0),
    new THREE.Vector3(0, archHeight, 0),
    new THREE.Vector3(halfLen * 0.5, archHeight * 0.7, 0),
    new THREE.Vector3(halfLen, 0.2, 0),
  ];
  const archCurve = new THREE.CatmullRomCurve3(curvePts);

  const numSteps = 24;
  const deckMat = new THREE.MeshStandardMaterial({ color: deckColor, roughness: 0.6 });
  const railMat = new THREE.MeshStandardMaterial({ color: railColor, roughness: 0.4 });

  for (let i = 0; i < numSteps; i++) {
    const t = i / (numSteps - 1);
    const pt = archCurve.getPointAt(t);

    const plankGeom = new THREE.BoxGeometry((bridgeLength / numSteps) * 1.1, 0.25, bridgeWidth);
    const plank = new THREE.Mesh(plankGeom, deckMat);
    plank.position.set(pt.x, pt.y, pt.z);
    group.add(plank);

    [-bridgeWidth / 2 + 0.15, bridgeWidth / 2 - 0.15].forEach((rz) => {
      const postGeom = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 6);
      const post = new THREE.Mesh(postGeom, railMat);
      post.position.set(pt.x, pt.y + 0.65, rz);
      group.add(post);
    });
  }

  return { rootGroup: group, update: () => {} };
}

// -------------------------------------------------------------
// 23. FOUNTAIN
// -------------------------------------------------------------
export function buildFountain(obj: FountainObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;
  const { basinRadius, tiers, jetHeight, stoneColor, waterColor } = obj;

  const stoneMat = new THREE.MeshStandardMaterial({ color: stoneColor, roughness: 0.4 });
  const waterMat = new THREE.MeshStandardMaterial({ color: waterColor, roughness: 0.1, transparent: true, opacity: 0.85 });

  const basin1 = new THREE.Mesh(new THREE.CylinderGeometry(basinRadius, basinRadius * 1.05, 0.8, 28), stoneMat);
  basin1.position.y = 0.4;
  group.add(basin1);

  const waterPool1 = new THREE.Mesh(new THREE.CylinderGeometry(basinRadius * 0.92, basinRadius * 0.92, 0.2, 28), waterMat);
  waterPool1.position.y = 0.85;
  group.add(waterPool1);

  if (tiers >= 2) {
    const basin2 = new THREE.Mesh(new THREE.CylinderGeometry(basinRadius * 0.55, basinRadius * 0.6, 0.6, 24), stoneMat);
    basin2.position.y = 1.6;
    group.add(basin2);
    const waterPool2 = new THREE.Mesh(new THREE.CylinderGeometry(basinRadius * 0.5, basinRadius * 0.5, 0.15, 24), waterMat);
    waterPool2.position.y = 1.95;
    group.add(waterPool2);
  }

  if (tiers >= 3) {
    const basin3 = new THREE.Mesh(new THREE.CylinderGeometry(basinRadius * 0.28, basinRadius * 0.32, 0.5, 20), stoneMat);
    basin3.position.y = 2.6;
    group.add(basin3);
  }

  const jetGeom = new THREE.CylinderGeometry(0.12, 0.35, jetHeight, 10);
  const jetMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.85 });
  const jet = new THREE.Mesh(jetGeom, jetMat);
  jet.position.y = 2.8 + jetHeight / 2;
  group.add(jet);

  return {
    rootGroup: group,
    update: (_delta, time) => {
      const scale = 1.0 + Math.sin(time * 3.0) * 0.15;
      jet.scale.set(scale, scale, scale);
    },
  };
}

// -------------------------------------------------------------
// 24. DECORATIVE LIGHTING
// -------------------------------------------------------------
export function buildDecorativeLighting(obj: DecorativeLightingObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;
  const { poleHeight, lampCount, lightColor, intensity } = obj;

  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 0.6, 8), ironMat);
  base.position.y = 0.3;
  group.add(base);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, poleHeight, 10), ironMat);
  pole.position.y = poleHeight / 2 + 0.3;
  group.add(pole);

  const lanternMat = new THREE.MeshStandardMaterial({ color: lightColor, emissive: lightColor, emissiveIntensity: 0.8 });
  const span = 0.7;
  for (let i = 0; i < lampCount; i++) {
    const angle = (i / lampCount) * Math.PI * 2;
    const lx = Math.cos(angle) * span;
    const lz = Math.sin(angle) * span;

    const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.4), lanternMat);
    lantern.position.set(lx, poleHeight + 0.5, lz);
    group.add(lantern);
  }

  const pointLight = new THREE.PointLight(lightColor, intensity, 18, 1.2);
  pointLight.position.set(0, poleHeight + 0.6, 0);
  group.add(pointLight);

  return { rootGroup: group, update: () => {} };
}

// -------------------------------------------------------------
// 24. FANTASY CASTLE (CENTRAL MEGA ATTRACTION)
// -------------------------------------------------------------
export function buildFantasyCastle(obj: FantasyCastleObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const { castleWidth, castleHeight, wallColor, roofColor, trimColor } = obj;

  // Materials
  const stoneMat = new THREE.MeshStandardMaterial({
    color: wallColor || '#f8fafc',
    roughness: 0.7,
    metalness: 0.1,
  });

  const stoneTrimMat = new THREE.MeshStandardMaterial({
    color: '#cbd5e1',
    roughness: 0.8,
  });

  const roofMat = new THREE.MeshStandardMaterial({
    color: roofColor || '#2563eb',
    roughness: 0.35,
    metalness: 0.2,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: trimColor || '#fbbf24',
    metalness: 0.85,
    roughness: 0.25,
  });

  const windowMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.65,
    roughness: 0.2,
  });

  const gateMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.7,
    roughness: 0.5,
  });

  // 1. Elevated Castle Podium / Island Base
  const podiumH = 3.5;
  const podiumGeom = new THREE.BoxGeometry(castleWidth * 1.15, podiumH, castleWidth * 0.95);
  const podium = new THREE.Mesh(podiumGeom, stoneTrimMat);
  podium.position.y = podiumH / 2;
  podium.receiveShadow = true;
  group.add(podium);

  // Podium battlements
  const numMerlons = 20;
  for (let i = 0; i < numMerlons; i++) {
    const frac = (i / numMerlons) * (castleWidth * 1.1) - (castleWidth * 1.1) / 2;
    const merlon = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.6), stoneMat);
    merlon.position.set(frac, podiumH + 0.4, (castleWidth * 0.95) / 2);
    group.add(merlon);
  }

  // 2. Lower Palace Palace Block
  const lowerH = castleHeight * 0.32;
  const lowerW = castleWidth * 0.75;
  const lowerD = castleWidth * 0.6;
  const lowerPalace = new THREE.Mesh(
    new THREE.BoxGeometry(lowerW, lowerH, lowerD),
    stoneMat
  );
  lowerPalace.position.y = podiumH + lowerH / 2;
  lowerPalace.castShadow = true;
  lowerPalace.receiveShadow = true;
  group.add(lowerPalace);

  // Arched Entrance Portal
  const portalW = lowerW * 0.28;
  const portalH = lowerH * 0.55;
  const archGeom = new THREE.CylinderGeometry(portalW / 2, portalW / 2, 1.2, 16, 1, false, 0, Math.PI);
  const arch = new THREE.Mesh(archGeom, stoneTrimMat);
  arch.rotation.z = Math.PI / 2;
  arch.position.set(0, podiumH + portalH, lowerD / 2 + 0.3);
  group.add(arch);

  const gateMesh = new THREE.Mesh(new THREE.BoxGeometry(portalW * 0.85, portalH, 0.5), gateMat);
  gateMesh.position.set(0, podiumH + portalH / 2, lowerD / 2 + 0.2);
  group.add(gateMesh);

  // Heraldic Golden Crest over gate
  const crest = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.3, 6), goldMat);
  crest.rotation.x = Math.PI / 2;
  crest.position.set(0, podiumH + portalH + 1.8, lowerD / 2 + 0.3);
  group.add(crest);

  // 3. Four Corner Fortified Towers with Conical Roofs
  const towerRadius = castleWidth * 0.08;
  const towerH = castleHeight * 0.6;
  const coneH = castleHeight * 0.22;
  const flagMeshes: THREE.Mesh[] = [];

  const cornerOffsets = [
    [-lowerW / 2, -lowerD / 2],
    [lowerW / 2, -lowerD / 2],
    [-lowerW / 2, lowerD / 2],
    [lowerW / 2, lowerD / 2],
  ];

  cornerOffsets.forEach(([cx, cz]) => {
    // Tower shaft
    const towerGeom = new THREE.CylinderGeometry(towerRadius * 0.85, towerRadius, towerH, 16);
    const tower = new THREE.Mesh(towerGeom, stoneMat);
    tower.position.set(cx, podiumH + towerH / 2, cz);
    tower.castShadow = true;
    group.add(tower);

    // Machicolation corbel rim
    const corbel = new THREE.Mesh(
      new THREE.CylinderGeometry(towerRadius * 1.15, towerRadius * 0.9, 1.2, 16),
      stoneTrimMat
    );
    corbel.position.set(cx, podiumH + towerH + 0.6, cz);
    group.add(corbel);

    // Conical spire roof
    const coneGeom = new THREE.ConeGeometry(towerRadius * 1.2, coneH, 16);
    const cone = new THREE.Mesh(coneGeom, roofMat);
    cone.position.set(cx, podiumH + towerH + 1.2 + coneH / 2, cz);
    cone.castShadow = true;
    group.add(cone);

    // Gold pinnacle finial
    const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 2.5, 8), goldMat);
    finial.position.set(cx, podiumH + towerH + 1.2 + coneH + 1.2, cz);
    group.add(finial);

    // Pennant Flag
    const flag = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 0.05), goldMat);
    flag.position.set(cx + 0.7, podiumH + towerH + 1.2 + coneH + 1.8, cz);
    group.add(flag);
    flagMeshes.push(flag);
  });

  // 4. Central Grand Keep (Middle Tier)
  const midH = castleHeight * 0.42;
  const midRadius = castleWidth * 0.22;
  const keep = new THREE.Mesh(
    new THREE.CylinderGeometry(midRadius * 0.9, midRadius, midH, 16),
    stoneMat
  );
  keep.position.set(0, podiumH + lowerH + midH / 2 - 2, 0);
  keep.castShadow = true;
  group.add(keep);

  // Keep corbel balcony
  const keepBalcony = new THREE.Mesh(
    new THREE.CylinderGeometry(midRadius * 1.05, midRadius * 0.92, 1.5, 16),
    stoneTrimMat
  );
  keepBalcony.position.set(0, podiumH + lowerH + midH - 1.2, 0);
  group.add(keepBalcony);

  // 5. Soaring Main Fairy-Tale Spire (Iconic Cinderella Peak)
  const spireBaseH = castleHeight * 0.25;
  const spireRadius = castleWidth * 0.12;
  const spireBase = new THREE.Mesh(
    new THREE.CylinderGeometry(spireRadius * 0.85, spireRadius, spireBaseH, 12),
    stoneMat
  );
  spireBase.position.set(0, podiumH + lowerH + midH + spireBaseH / 2 - 1, 0);
  spireBase.castShadow = true;
  group.add(spireBase);

  // Tower Clock on Spire Base
  const clock = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.4, 16), goldMat);
  clock.rotation.x = Math.PI / 2;
  clock.position.set(0, podiumH + lowerH + midH + spireBaseH * 0.5, spireRadius + 0.2);
  group.add(clock);

  // Grand Soaring Conical Roof
  const grandConeH = castleHeight * 0.35;
  const grandCone = new THREE.Mesh(
    new THREE.ConeGeometry(spireRadius * 1.15, grandConeH, 16),
    roofMat
  );
  grandCone.position.set(0, podiumH + lowerH + midH + spireBaseH + grandConeH / 2 - 1, 0);
  grandCone.castShadow = true;
  group.add(grandCone);

  // Golden Summit Finial & Main Flag
  const summitFinial = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.35, 4.5, 8), goldMat);
  summitFinial.position.set(0, podiumH + lowerH + midH + spireBaseH + grandConeH + 1.5, 0);
  group.add(summitFinial);

  const mainFlag = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.2, 0.08), goldMat);
  mainFlag.position.set(1.3, podiumH + lowerH + midH + spireBaseH + grandConeH + 2.8, 0);
  group.add(mainFlag);
  flagMeshes.push(mainFlag);

  // 6. Secondary Accent Spires (Front Left & Front Right of Keep)
  [-castleWidth * 0.18, castleWidth * 0.18].forEach((sx) => {
    const sH = castleHeight * 0.28;
    const sConeH = castleHeight * 0.16;
    const sRad = castleWidth * 0.055;

    const sTower = new THREE.Mesh(new THREE.CylinderGeometry(sRad, sRad, sH, 12), stoneMat);
    sTower.position.set(sx, podiumH + lowerH + sH / 2, castleWidth * 0.15);
    sTower.castShadow = true;
    group.add(sTower);

    const sCone = new THREE.Mesh(new THREE.ConeGeometry(sRad * 1.3, sConeH, 12), roofMat);
    sCone.position.set(sx, podiumH + lowerH + sH + sConeH / 2, castleWidth * 0.15);
    group.add(sCone);

    const sFinial = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.15, 2.0, 6), goldMat);
    sFinial.position.set(sx, podiumH + lowerH + sH + sConeH + 0.8, castleWidth * 0.15);
    group.add(sFinial);
  });

  // 7. Glowing Stained Glass Windows
  const windowGeom = new THREE.BoxGeometry(1.2, 2.2, 0.2);
  [-lowerW * 0.25, lowerW * 0.25].forEach((wx) => {
    const win = new THREE.Mesh(windowGeom, windowMat);
    win.position.set(wx, podiumH + lowerH * 0.65, lowerD / 2 + 0.1);
    group.add(win);
  });

  return {
    rootGroup: group,
    update: (_delta: number, time: number) => {
      // Gently flutter flags in the breeze
      flagMeshes.forEach((f, idx) => {
        f.rotation.y = Math.sin(time * 4.5 + idx * 1.5) * 0.22;
      });
      // Window glow subtle breathing effect
      windowMat.emissiveIntensity = 0.55 + Math.sin(time * 2.5) * 0.12;
    },
  };
}

// -------------------------------------------------------------
// 25. WOODEN ROLLER COASTER (LEFT VINTAGE COASTER)
// -------------------------------------------------------------
export function buildWoodenCoaster(obj: WoodenCoasterObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const { hillHeight, trackLength, woodColor, railColor } = obj;

  const woodMat = new THREE.MeshStandardMaterial({
    color: woodColor || '#78350f',
    roughness: 0.85,
    metalness: 0.05,
  });

  const railMat = new THREE.MeshStandardMaterial({
    color: railColor || '#451a03',
    metalness: 0.5,
    roughness: 0.4,
  });

  const carMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c, // Classic dark red wooden coaster cars
    roughness: 0.3,
    metalness: 0.3,
  });

  // Closed spline circuit for wooden coaster
  const pts: THREE.Vector3[] = [
    new THREE.Vector3(0, 3.5, -trackLength * 0.4),            // Station
    new THREE.Vector3(trackLength * 0.2, 4.0, -trackLength * 0.3),
    new THREE.Vector3(trackLength * 0.25, hillHeight * 0.5, -trackLength * 0.1),
    new THREE.Vector3(trackLength * 0.25, hillHeight, trackLength * 0.2),     // Lift Peak
    new THREE.Vector3(trackLength * 0.2, hillHeight * 0.8, trackLength * 0.32),
    new THREE.Vector3(trackLength * 0.1, 3.0, trackLength * 0.44),           // First Drop Base
    new THREE.Vector3(-trackLength * 0.05, hillHeight * 0.55, trackLength * 0.32), // Camelback 1
    new THREE.Vector3(-trackLength * 0.18, 5.0, trackLength * 0.18),
    new THREE.Vector3(-trackLength * 0.25, hillHeight * 0.45, 0),             // Banked Turn
    new THREE.Vector3(-trackLength * 0.2, 4.0, -trackLength * 0.2),          // Camelback 2
    new THREE.Vector3(-trackLength * 0.05, 3.5, -trackLength * 0.35),
  ];

  const curve = new THREE.CatmullRomCurve3(pts, true);

  // Twin wooden tracks
  const trackTubeGeom = new THREE.TubeGeometry(curve, 160, 0.35, 6, true);
  const trackMesh = new THREE.Mesh(trackTubeGeom, railMat);
  trackMesh.castShadow = true;
  group.add(trackMesh);

  // Dense Timber Trestle Lattice Framework
  const bentSteps = 75;
  const bentGroup = new THREE.Group();
  group.add(bentGroup);

  const postGeom = new THREE.BoxGeometry(0.35, 1, 0.35);

  for (let i = 0; i < bentSteps; i++) {
    const t = i / bentSteps;
    const pt = curve.getPointAt(t);
    const trackH = Math.max(pt.y, 1.5);

    // Left & Right Vertical Timber Bents
    const spread = 2.2;
    [-spread / 2, spread / 2].forEach((offset) => {
      const post = new THREE.Mesh(postGeom, woodMat);
      post.scale.set(1, trackH, 1);
      post.position.set(pt.x + offset, trackH / 2, pt.z);
      bentGroup.add(post);
    });

    // Horizontal walers
    const walerLevels = Math.floor(trackH / 4);
    for (let l = 1; l <= walerLevels; l++) {
      const walerH = l * 4;
      const waler = new THREE.Mesh(new THREE.BoxGeometry(spread + 0.4, 0.25, 0.25), woodMat);
      waler.position.set(pt.x, walerH, pt.z);
      bentGroup.add(waler);
    }
  }

  // Animated 3-Car Wooden Coaster Train
  const trainGroup = new THREE.Group();
  group.add(trainGroup);

  const cars: THREE.Mesh[] = [];
  for (let c = 0; c < 3; c++) {
    const car = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 2.6), carMat);
    trainGroup.add(car);
    cars.push(car);
  }

  let trainT = 0;

  return {
    rootGroup: group,
    update: (delta: number) => {
      // Advance train along track spline
      trainT = (trainT + delta * 0.08) % 1.0;
      cars.forEach((car, idx) => {
        const carT = (trainT - idx * 0.035 + 1.0) % 1.0;
        const pos = curve.getPointAt(carT);
        const tangent = curve.getTangentAt(carT).normalize();
        car.position.copy(pos);
        car.position.y += 0.55;
        car.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      });
    },
  };
}

// -------------------------------------------------------------
// 26. ROCKY MOUNTAIN ADVENTURE ZONE (BIG THUNDER STYLE)
// -------------------------------------------------------------
export function buildMountainAttraction(obj: MountainAttractionObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const { mountainWidth, mountainHeight, rockColor, rockSecondaryColor } = obj;

  const rockMat1 = new THREE.MeshStandardMaterial({
    color: rockColor || '#c2410c', // Sandstone terracotta
    roughness: 0.95,
    metalness: 0.05,
    flatShading: true,
  });

  const rockMat2 = new THREE.MeshStandardMaterial({
    color: rockSecondaryColor || '#7c2d12', // Darker canyon earth
    roughness: 0.95,
    flatShading: true,
  });

  const trackMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.7,
    roughness: 0.35,
  });

  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.15,
  });

  // 1. Stratified Multi-Peak Rock Formations
  const peakGroup = new THREE.Group();
  group.add(peakGroup);

  const peaks = [
    { x: 0, z: 0, h: mountainHeight, r: mountainWidth * 0.38, mat: rockMat1 },
    { x: -mountainWidth * 0.28, z: -mountainWidth * 0.15, h: mountainHeight * 0.8, r: mountainWidth * 0.3, mat: rockMat2 },
    { x: mountainWidth * 0.25, z: -mountainWidth * 0.2, h: mountainHeight * 0.88, r: mountainWidth * 0.32, mat: rockMat1 },
    { x: -mountainWidth * 0.18, z: mountainWidth * 0.22, h: mountainHeight * 0.65, r: mountainWidth * 0.28, mat: rockMat1 },
    { x: mountainWidth * 0.22, z: mountainWidth * 0.2, h: mountainHeight * 0.72, r: mountainWidth * 0.28, mat: rockMat2 },
  ];

  peaks.forEach((p) => {
    // 3-tiered stacked polygonal cones for jagged sandstone cliff look
    const tier1 = new THREE.Mesh(new THREE.ConeGeometry(p.r, p.h * 0.45, 9), p.mat);
    tier1.position.set(p.x, p.h * 0.22, p.z);
    tier1.castShadow = true;
    tier1.receiveShadow = true;
    peakGroup.add(tier1);

    const tier2 = new THREE.Mesh(new THREE.ConeGeometry(p.r * 0.7, p.h * 0.4, 8), p.mat);
    tier2.position.set(p.x, p.h * 0.55, p.z);
    tier2.castShadow = true;
    peakGroup.add(tier2);

    const tier3 = new THREE.Mesh(new THREE.ConeGeometry(p.r * 0.45, p.h * 0.35, 7), p.mat);
    tier3.position.set(p.x, p.h * 0.82, p.z);
    tier3.castShadow = true;
    peakGroup.add(tier3);
  });

  // 2. Canyon Gorge Basin with Splashing Water
  const basinGeom = new THREE.CylinderGeometry(mountainWidth * 0.35, mountainWidth * 0.35, 0.4, 24);
  const basin = new THREE.Mesh(basinGeom, waterMat);
  basin.position.set(0, 0.2, mountainWidth * 0.32);
  group.add(basin);

  // 3. Mine Train Coaster Track Winding through Mountain
  const trackPts: THREE.Vector3[] = [
    new THREE.Vector3(mountainWidth * 0.35, 2.5, mountainWidth * 0.25),
    new THREE.Vector3(mountainWidth * 0.3, mountainHeight * 0.45, 0),
    new THREE.Vector3(mountainWidth * 0.15, mountainHeight * 0.75, -mountainWidth * 0.25),
    new THREE.Vector3(-mountainWidth * 0.15, mountainHeight * 0.65, -mountainWidth * 0.2), // Tunnel entry
    new THREE.Vector3(-mountainWidth * 0.3, mountainHeight * 0.4, 0),
    new THREE.Vector3(-mountainWidth * 0.25, 4.0, mountainWidth * 0.25), // Trestle bridge
    new THREE.Vector3(0, 3.0, mountainWidth * 0.35),                    // Splash curve
  ];

  const trackCurve = new THREE.CatmullRomCurve3(trackPts, true);
  const trackGeom = new THREE.TubeGeometry(trackCurve, 120, 0.3, 6, true);
  const trackMesh = new THREE.Mesh(trackGeom, trackMat);
  group.add(trackMesh);

  // Animated Mine Train
  const train = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 2.8), new THREE.MeshStandardMaterial({ color: 0x92400e }));
  group.add(train);

  let trainT = 0;

  return {
    rootGroup: group,
    update: (delta: number) => {
      trainT = (trainT + delta * 0.09) % 1.0;
      const pt = trackCurve.getPointAt(trainT);
      const tang = trackCurve.getTangentAt(trainT).normalize();
      train.position.copy(pt);
      train.position.y += 0.5;
      train.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tang);
    },
  };
}

// -------------------------------------------------------------
// 27. FUTURISTIC DOME (SPACESHIRE EARTH STYLE)
// -------------------------------------------------------------
export function buildFuturisticDome(obj: FuturisticDomeObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const { domeRadius, domeHeight, domeColor, glowColor } = obj;

  const domeMat = new THREE.MeshStandardMaterial({
    color: domeColor || '#94a3b8',
    metalness: 0.85,
    roughness: 0.2,
    flatShading: true, // Geodesic facets
  });

  const glowMat = new THREE.MeshStandardMaterial({
    color: glowColor || '#06b6d4',
    emissive: glowColor || '#06b6d4',
    emissiveIntensity: 0.9,
    roughness: 0.3,
  });

  // Foundation Ring
  const baseGeom = new THREE.CylinderGeometry(domeRadius * 1.08, domeRadius * 1.12, 1.8, 24);
  const base = new THREE.Mesh(baseGeom, new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 }));
  base.position.y = 0.9;
  group.add(base);

  // Faceted Geodesic Dome
  const domeGeom = new THREE.SphereGeometry(domeRadius, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.58);
  const dome = new THREE.Mesh(domeGeom, domeMat);
  dome.scale.y = (domeHeight / domeRadius) * 1.1;
  dome.position.y = 1.8;
  dome.castShadow = true;
  group.add(dome);

  // Glowing Concentric Ring
  const ringGeom = new THREE.TorusGeometry(domeRadius * 0.85, 0.4, 8, 32);
  const ring = new THREE.Mesh(ringGeom, glowMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = domeHeight * 0.65;
  group.add(ring);

  return {
    rootGroup: group,
    update: (_delta: number, time: number) => {
      ring.rotation.z = time * 0.4;
      glowMat.emissiveIntensity = 0.75 + Math.sin(time * 3) * 0.25;
    },
  };
}

// -------------------------------------------------------------
// 28. SPLASH ZONE & RAIN DANCE (WONDERLA WATERPARK)
// -------------------------------------------------------------
export function buildSplashZone(obj: SplashZoneObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const { zoneWidth, waterColor } = obj;

  const deckMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.3,
  });

  const bucketMat = new THREE.MeshStandardMaterial({
    color: 0xeab308, // Bright yellow tipping bucket
    metalness: 0.3,
    roughness: 0.4,
  });

  const pipeMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.7,
    roughness: 0.3,
  });

  // Splash pad circular basin
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(zoneWidth / 2, zoneWidth / 2, 0.2, 32), deckMat);
  pad.position.y = 0.1;
  pad.receiveShadow = true;
  group.add(pad);

  // Central Tower Pillars
  const towerH = 12;
  const col1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, towerH, 8), pipeMat);
  col1.position.set(-1.8, towerH / 2, 0);
  group.add(col1);

  const col2 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, towerH, 8), pipeMat);
  col2.position.set(1.8, towerH / 2, 0);
  group.add(col2);

  // Overhead Pivot & Giant Tipping Bucket
  const bucketPivot = new THREE.Group();
  bucketPivot.position.set(0, towerH, 0);
  group.add(bucketPivot);

  const bucket = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.0, 2.4, 12), bucketMat);
  bucket.position.y = 1.0;
  bucket.castShadow = true;
  bucketPivot.add(bucket);

  // 2 Mushroom Water Umbrellas
  [-zoneWidth * 0.3, zoneWidth * 0.3].forEach((mx) => {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 4.5, 8), pipeMat);
    stem.position.set(mx, 2.25, 0);
    group.add(stem);

    const cap = new THREE.Mesh(new THREE.SphereGeometry(1.8, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
    cap.position.set(mx, 4.5, 0);
    group.add(cap);
  });

  return {
    rootGroup: group,
    update: (_delta: number, time: number) => {
      // 8-second bucket cycle: fills upright, tilts forward, dumps, rights itself
      const cycle = time % 8;
      if (cycle < 5.5) {
        bucketPivot.rotation.x = (cycle / 5.5) * 0.3; // slowly leaning forward as it fills
      } else if (cycle < 6.5) {
        bucketPivot.rotation.x = 0.3 + ((cycle - 5.5) / 1.0) * 1.8; // Dramatic tip dump!
      } else {
        bucketPivot.rotation.x = Math.max(0, 2.1 - (cycle - 6.5) * 2.1); // Swing back
      }
    },
  };
}

// -------------------------------------------------------------
// 29. VISITOR CROWDS (ANIMATED WALKING CHARACTERS)
// -------------------------------------------------------------
export function buildVisitorCrowds(obj: VisitorCrowdsObject): ObjectRuntimeData {
  const group = new THREE.Group();
  group.name = obj.id;

  const { crowdCount = 45, walkRadius = 25 } = obj;

  const colors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899, 0x06b6d4, 0xf8fafc];
  const visitors: { mesh: THREE.Group; leftLeg: THREE.Mesh; rightLeg: THREE.Mesh; angle: number; dist: number; speed: number; dir: number }[] = [];

  const headMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.8 });
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });

  for (let i = 0; i < crowdCount; i++) {
    const vGroup = new THREE.Group();

    // Torso with shirt color
    const shirtMat = new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.7 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.28), shirtMat);
    torso.position.y = 1.05;
    torso.castShadow = true;
    vGroup.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), headMat);
    head.position.y = 1.5;
    vGroup.add(head);

    // Left & Right Legs
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.65, 0.16), legMat);
    leftLeg.position.set(-0.12, 0.4, 0);
    vGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.65, 0.16), legMat);
    rightLeg.position.set(0.12, 0.4, 0);
    vGroup.add(rightLeg);

    const angle = (i / crowdCount) * Math.PI * 2 + (Math.random() * 0.5);
    const dist = (Math.random() * 0.8 + 0.2) * walkRadius;
    const speed = 0.5 + Math.random() * 0.6;
    const dir = Math.random() > 0.5 ? 1 : -1;

    vGroup.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
    group.add(vGroup);

    visitors.push({ mesh: vGroup, leftLeg, rightLeg, angle, dist, speed, dir });
  }

  return {
    rootGroup: group,
    update: (delta: number, time: number) => {
      visitors.forEach((v, idx) => {
        // Orbit stroll
        v.angle += v.dir * delta * (v.speed / (v.dist + 5));
        v.mesh.position.x = Math.cos(v.angle) * v.dist;
        v.mesh.position.z = Math.sin(v.angle) * v.dist;

        // Face forward tangent
        const tangentAngle = v.angle + (v.dir > 0 ? Math.PI / 2 : -Math.PI / 2);
        v.mesh.rotation.y = -tangentAngle;

        // Walking leg swing
        const legSwing = Math.sin(time * 7 * v.speed + idx);
        v.leftLeg.rotation.x = legSwing * 0.45;
        v.rightLeg.rotation.x = -legSwing * 0.45;
      });
    },
  };
}

// -------------------------------------------------------------
// FACTORY DISPATCHER
// -------------------------------------------------------------
export function createAttractionRuntimeObject(obj: SceneObject): ObjectRuntimeData {
  switch (obj.type) {
    case 'Fantasy Castle':
      return buildFantasyCastle(obj as FantasyCastleObject);
    case 'Wooden Coaster':
      return buildWoodenCoaster(obj as WoodenCoasterObject);
    case 'Mountain Attraction':
      return buildMountainAttraction(obj as MountainAttractionObject);
    case 'Futuristic Dome':
      return buildFuturisticDome(obj as FuturisticDomeObject);
    case 'Splash Zone':
      return buildSplashZone(obj as SplashZoneObject);
    case 'Visitor Crowds':
      return buildVisitorCrowds(obj as VisitorCrowdsObject);
    case 'Roller Coaster':
      return buildRollerCoaster(obj as RollerCoasterObject);
    case 'Ferris Wheel':
      return buildFerrisWheel(obj as FerrisWheelObject);
    case 'Water Ride':
      return buildWaterRide(obj as WaterRideObject);
    case 'Carousel':
      return buildCarousel(obj as CarouselObject);
    case 'Drop Tower':
      return buildDropTower(obj as DropTowerObject);
    case 'Swing Ride':
      return buildSwingRide(obj as SwingRideObject);
    case 'Bumper Cars':
      return buildBumperCars(obj as BumperCarsObject);
    case 'Kids Attraction':
      return buildKidsAttraction(obj as KidsAttractionObject);
    case 'Wave Pool':
      return buildWavePool(obj as WavePoolObject);
    case 'Slide Tower':
      return buildSlideTower(obj as SlideTowerObject);
    case 'Lazy River':
      return buildLazyRiver(obj as LazyRiverObject);
    case 'Entrance Gate':
      return buildEntranceGate(obj as EntranceGateObject);
    case 'Restaurant':
      return buildRestaurant(obj as RestaurantObject);
    case 'Shop':
      return buildShop(obj as ShopObject);
    case 'Parking Area':
      return buildParkingArea(obj as ParkingAreaObject);
    case 'Gardens':
      return buildGardens(obj as GardensObject);
    case 'Bridge':
      return buildBridge(obj as BridgeObject);
    case 'Fountain':
      return buildFountain(obj as FountainObject);
    case 'Decorative Lighting':
      return buildDecorativeLighting(obj as DecorativeLightingObject);
    case 'Lagoon':
      return buildLagoon(obj as LagoonObject);
    case 'Trees':
      return buildTrees(obj as TreesObject);
    case 'Pedestrian Path':
      return buildPedestrianPath(obj as PedestrianPathObject);
    case 'Benches':
      return buildBenches(obj as BenchesObject);
    case 'Ticket Pavilion':
    case 'Food Court':
    case 'Changing Rooms':
    case 'Custom Architecture':
    default:
      return buildCustomArchitecture(obj as CustomArchitectureObject);
  }
}
