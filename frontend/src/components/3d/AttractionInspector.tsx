import React from 'react';
import {
  Sliders,
  Move,
  RotateCw,
  Copy,
  Trash2,
  Edit3,
  Layers,
  Palette,
  Activity,
  Maximize2,
} from 'lucide-react';
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
  EntranceGateObject,
  RestaurantObject,
  ShopObject,
  ParkingAreaObject,
  GardensObject,
  BridgeObject,
  FountainObject,
  DecorativeLightingObject,
  CustomArchitectureObject,
  WavePoolObject,
  SlideTowerObject,
  LazyRiverObject,
  LagoonObject,
  TreesObject,
  PedestrianPathObject,
  BenchesObject,
  RoofStyle,
  BuildingFinish,
  ArchitecturalStyle,
  BuildingPreset,
} from '../../types/parkScene';

interface Props {
  selectedObject: SceneObject | null;
  onChange: (updated: SceneObject) => void;
  onDuplicate: (obj: SceneObject) => void;
  onDelete: (id: string) => void;
  onOpenFloorPlanEditor: (archObj: CustomArchitectureObject) => void;
}

export default function AttractionInspector({
  selectedObject,
  onChange,
  onDuplicate,
  onDelete,
  onOpenFloorPlanEditor,
}: Props) {
  if (!selectedObject) {
    return (
      <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-5 text-center text-slate-400">
        <Sliders className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-300">No Attraction Selected</h4>
        <p className="text-xs text-slate-500 mt-1">
          Click any ride or building in the 3D scene or select from the Outliner to inspect &amp; edit.
        </p>
      </div>
    );
  }

  const rotDegrees = Math.round((selectedObject.rotation[1] * 180) / Math.PI);

  const handleRotationChange = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    onChange({
      ...selectedObject,
      rotation: [selectedObject.rotation[0], rad, selectedObject.rotation[2]],
    });
  };

  const handlePositionChange = (axis: 'x' | 'z', val: number) => {
    const pos: [number, number, number] = [...selectedObject.position];
    if (axis === 'x') pos[0] = val;
    if (axis === 'z') pos[2] = val;
    onChange({
      ...selectedObject,
      position: pos,
    });
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 text-xs">
      {/* Header with Name & Actions */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
            {selectedObject.type}
          </span>
          <input
            type="text"
            value={selectedObject.name}
            onChange={(e) => onChange({ ...selectedObject, name: e.target.value })}
            className="block text-sm font-bold text-white bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded px-1 -ml-1 mt-0.5"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onDuplicate(selectedObject)}
            title="Duplicate attraction"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(selectedObject.id)}
            title="Delete attraction"
            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* World Transform Coordinates */}
      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2.5">
        <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
          <Move className="w-3.5 h-3.5 text-purple-400" /> World Position &amp; Rotation
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">
              X (East-West): <span className="text-white font-mono">{selectedObject.position[0]}m</span>
            </label>
            <input
              type="range"
              min="-60"
              max="60"
              step="1"
              value={selectedObject.position[0]}
              onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">
              Z (North-South): <span className="text-white font-mono">{selectedObject.position[2]}m</span>
            </label>
            <input
              type="range"
              min="-60"
              max="60"
              step="1"
              value={selectedObject.position[2]}
              onChange={(e) => handlePositionChange('z', parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] text-slate-400 block mb-0.5 flex items-center justify-between">
            <span>Rotation Heading:</span>
            <span className="text-white font-mono font-semibold">{rotDegrees}°</span>
          </label>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            value={rotDegrees}
            onChange={(e) => handleRotationChange(parseInt(e.target.value, 10))}
            className="w-full accent-purple-500"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 block mb-0.5 flex items-center justify-between">
            <span>Object Scale:</span>
            <span className="text-white font-mono font-semibold">{selectedObject.scale[0]}x</span>
          </label>
          <input
            type="range"
            min="0.4"
            max="2.5"
            step="0.1"
            value={selectedObject.scale[0]}
            onChange={(e) => {
              const s = parseFloat(e.target.value);
              onChange({ ...selectedObject, scale: [s, s, s] });
            }}
            className="w-full accent-purple-500"
          />
        </div>
      </div>

      {/* Dynamic Type-Specific Controls */}
      {selectedObject.type === 'Roller Coaster' && (() => {
        const coaster = selectedObject as RollerCoasterObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Activity className="w-3.5 h-3.5 text-rose-400" /> Track Dynamics &amp; Geometry
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Lift Hill Height: <span className="text-rose-400 font-bold">{coaster.hillHeight}m</span>
              </label>
              <input
                type="range"
                min="18"
                max="55"
                step="1"
                value={coaster.hillHeight}
                onChange={(e) => onChange({ ...coaster, hillHeight: parseFloat(e.target.value) })}
                className="w-full accent-rose-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Loop Peak Height: <span className="text-rose-400 font-bold">{coaster.loopHeight}m</span>
              </label>
              <input
                type="range"
                min="12"
                max="32"
                step="1"
                value={coaster.loopHeight}
                onChange={(e) => onChange({ ...coaster, loopHeight: parseFloat(e.target.value) })}
                className="w-full accent-rose-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Circuit Footprint Depth:{' '}
                <span className="text-rose-400 font-bold">{coaster.trackDepth}m</span>
              </label>
              <input
                type="range"
                min="35"
                max="85"
                step="2"
                value={coaster.trackDepth}
                onChange={(e) => onChange({ ...coaster, trackDepth: parseFloat(e.target.value) })}
                className="w-full accent-rose-500"
              />
            </div>
            <div className="flex gap-4 items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={coaster.railColor}
                  onChange={(e) => onChange({ ...coaster, railColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-slate-300">Rail Steel</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={coaster.supportColor}
                  onChange={(e) => onChange({ ...coaster, supportColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-slate-300">Pylons</span>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedObject.type === 'Ferris Wheel' && (() => {
        const wheel = selectedObject as FerrisWheelObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Wheel Diameter &amp; Cabins
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Wheel Diameter:{' '}
                <span className="text-cyan-400 font-bold">{wheel.wheelDiameter}m</span>
              </label>
              <input
                type="range"
                min="16"
                max="48"
                step="2"
                value={wheel.wheelDiameter}
                onChange={(e) => onChange({ ...wheel, wheelDiameter: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Suspended Cabins: <span className="text-cyan-400 font-bold">{wheel.cabinCount}</span>
              </label>
              <input
                type="range"
                min="8"
                max="24"
                step="2"
                value={wheel.cabinCount}
                onChange={(e) =>
                  onChange({ ...wheel, cabinCount: parseInt(e.target.value, 10) })
                }
                className="w-full accent-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Rotation Speed:{' '}
                <span className="text-cyan-400 font-bold">{wheel.rotationSpeed}x</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={wheel.rotationSpeed}
                onChange={(e) => onChange({ ...wheel, rotationSpeed: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>
            <div className="flex gap-4 items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={wheel.frameColor}
                  onChange={(e) => onChange({ ...wheel, frameColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-slate-300">Rim Frame</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={wheel.cabinColor}
                  onChange={(e) => onChange({ ...wheel, cabinColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-slate-300">Gondola Pods</span>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedObject.type === 'Water Ride' && (() => {
        const water = selectedObject as WaterRideObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Activity className="w-3.5 h-3.5 text-blue-400" /> Channel Flow &amp; Boats
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Channel Width: <span className="text-blue-400 font-bold">{water.channelWidth}m</span>
              </label>
              <input
                type="range"
                min="3.0"
                max="7.0"
                step="0.5"
                value={water.channelWidth}
                onChange={(e) => onChange({ ...water, channelWidth: parseFloat(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Boat Count: <span className="text-blue-400 font-bold">{water.boatCount}</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={water.boatCount}
                onChange={(e) => onChange({ ...water, boatCount: parseInt(e.target.value, 10) })}
                className="w-full accent-blue-500"
              />
            </div>
            <div className="flex gap-4 items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={water.waterColor}
                  onChange={(e) => onChange({ ...water, waterColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-slate-300">Water Color</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={water.boatColor}
                  onChange={(e) => onChange({ ...water, boatColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-slate-300">Boat Raft</span>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedObject.type === 'Carousel' && (() => {
        const carousel = selectedObject as CarouselObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-purple-400" /> Canopy &amp; Seat Poles
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Platform Diameter:{' '}
                <span className="text-purple-400 font-bold">{carousel.platformDiameter}m</span>
              </label>
              <input
                type="range"
                min="8"
                max="22"
                step="1"
                value={carousel.platformDiameter}
                onChange={(e) =>
                  onChange({ ...carousel, platformDiameter: parseFloat(e.target.value) })
                }
                className="w-full accent-purple-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Seat Count: <span className="text-purple-400 font-bold">{carousel.seatCount}</span>
              </label>
              <input
                type="range"
                min="6"
                max="18"
                step="2"
                value={carousel.seatCount}
                onChange={(e) =>
                  onChange({ ...carousel, seatCount: parseInt(e.target.value, 10) })
                }
                className="w-full accent-purple-500"
              />
            </div>
            <div className="flex gap-4 items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={carousel.primaryColor}
                  onChange={(e) => onChange({ ...carousel, primaryColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-slate-300">Canopy</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={carousel.secondaryColor}
                  onChange={(e) => onChange({ ...carousel, secondaryColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-slate-300">Trim</span>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedObject.type === 'Drop Tower' && (() => {
        const tower = selectedObject as DropTowerObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Tower Structure &amp; Carriage
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Tower Height:{' '}
                <span className="text-amber-400 font-bold">{tower.towerHeight}m</span>
              </label>
              <input
                type="range"
                min="25"
                max="75"
                step="2"
                value={tower.towerHeight}
                onChange={(e) => onChange({ ...tower, towerHeight: parseFloat(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>
            <div className="flex gap-4 items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={tower.towerColor}
                  onChange={(e) => onChange({ ...tower, towerColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-slate-300">Lattice</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={tower.carriageColor}
                  onChange={(e) => onChange({ ...tower, carriageColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-slate-300">Carriage</span>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedObject.type === 'Wave Pool' && (() => {
        const pool = selectedObject as WavePoolObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-blue-400" /> Wave Pool Basin Dimensions
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Pool Width: <span className="text-blue-400 font-bold">{pool.poolWidth}m</span>
              </label>
              <input
                type="range"
                min="14"
                max="36"
                step="1"
                value={pool.poolWidth}
                onChange={(e) => onChange({ ...pool, poolWidth: parseFloat(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Pool Length: <span className="text-blue-400 font-bold">{pool.poolLength}m</span>
              </label>
              <input
                type="range"
                min="18"
                max="50"
                step="2"
                value={pool.poolLength}
                onChange={(e) => onChange({ ...pool, poolLength: parseFloat(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
            <div className="flex gap-4 items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={pool.waterColor}
                  onChange={(e) => onChange({ ...pool, waterColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-slate-300">Water</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={pool.tileColor}
                  onChange={(e) => onChange({ ...pool, tileColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-slate-300">Tiles</span>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedObject.type === 'Slide Tower' && (() => {
        const slide = selectedObject as SlideTowerObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Activity className="w-3.5 h-3.5 text-sky-400" /> Slide Flumes &amp; Tower Height
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Tower Height: <span className="text-sky-400 font-bold">{slide.towerHeight}m</span>
              </label>
              <input
                type="range"
                min="12"
                max="32"
                step="1"
                value={slide.towerHeight}
                onChange={(e) => onChange({ ...slide, towerHeight: parseFloat(e.target.value) })}
                className="w-full accent-sky-500"
              />
            </div>
            <div className="flex gap-4 items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={slide.slideColor1}
                  onChange={(e) => onChange({ ...slide, slideColor1: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-slate-300">Flume 1</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={slide.slideColor2}
                  onChange={(e) => onChange({ ...slide, slideColor2: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-slate-300">Flume 2</span>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedObject.type === 'Lazy River' && (() => {
        const river = selectedObject as LazyRiverObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-teal-400" /> River Loop &amp; Tubes
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                River Loop Radius: <span className="text-teal-400 font-bold">{river.riverRadius}m</span>
              </label>
              <input
                type="range"
                min="15"
                max="35"
                step="1"
                value={river.riverRadius}
                onChange={(e) => onChange({ ...river, riverRadius: parseFloat(e.target.value) })}
                className="w-full accent-teal-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Floating Tubes: <span className="text-teal-400 font-bold">{river.tubeCount}</span>
              </label>
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={river.tubeCount}
                onChange={(e) => onChange({ ...river, tubeCount: parseInt(e.target.value, 10) })}
                className="w-full accent-teal-500"
              />
            </div>
          </div>
        );
      })()}

      {selectedObject.type === 'Lagoon' && (() => {
        const lagoon = selectedObject as LagoonObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Lagoon Water Body
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Radius X: <span className="text-cyan-400 font-bold">{lagoon.radiusX}m</span>
              </label>
              <input
                type="range"
                min="12"
                max="45"
                step="1"
                value={lagoon.radiusX}
                onChange={(e) => onChange({ ...lagoon, radiusX: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Radius Z: <span className="text-cyan-400 font-bold">{lagoon.radiusZ}m</span>
              </label>
              <input
                type="range"
                min="10"
                max="40"
                step="1"
                value={lagoon.radiusZ}
                onChange={(e) => onChange({ ...lagoon, radiusZ: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Water Color</span>
              <input
                type="color"
                value={lagoon.waterColor}
                onChange={(e) => onChange({ ...lagoon, waterColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        );
      })()}

      {selectedObject.type === 'Trees' && (() => {
        const trees = selectedObject as TreesObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-green-400" /> Botanical Grove Density
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Tree Count: <span className="text-green-400 font-bold">{trees.treeCount}</span>
              </label>
              <input
                type="range"
                min="4"
                max="18"
                step="1"
                value={trees.treeCount}
                onChange={(e) => onChange({ ...trees, treeCount: parseInt(e.target.value, 10) })}
                className="w-full accent-green-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Cluster Spread Radius:{' '}
                <span className="text-green-400 font-bold">{trees.clusterRadius}m</span>
              </label>
              <input
                type="range"
                min="8"
                max="24"
                step="1"
                value={trees.clusterRadius}
                onChange={(e) => onChange({ ...trees, clusterRadius: parseFloat(e.target.value) })}
                className="w-full accent-green-500"
              />
            </div>
          </div>
        );
      })()}

      {selectedObject.type === 'Pedestrian Path' && (() => {
        const path = selectedObject as PedestrianPathObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Pathway Dimensions &amp; Paving
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Path Width: <span className="text-amber-400 font-bold">{path.pathWidth}m</span>
              </label>
              <input
                type="range"
                min="2.5"
                max="8.0"
                step="0.5"
                value={path.pathWidth}
                onChange={(e) => onChange({ ...path, pathWidth: parseFloat(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Path Length: <span className="text-amber-400 font-bold">{path.pathLength}m</span>
              </label>
              <input
                type="range"
                min="10"
                max="60"
                step="2"
                value={path.pathLength}
                onChange={(e) => onChange({ ...path, pathLength: parseFloat(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Paving Color Tone</span>
              <input
                type="color"
                value={path.pavingColor}
                onChange={(e) => onChange({ ...path, pavingColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        );
      })()}

      {selectedObject.type === 'Benches' && (() => {
        const bench = selectedObject as BenchesObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-stone-400" /> Park Benches Configuration
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Number of Benches: <span className="text-stone-300 font-bold">{bench.benchCount}</span>
              </label>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={bench.benchCount}
                onChange={(e) => onChange({ ...bench, benchCount: parseInt(e.target.value, 10) })}
                className="w-full accent-stone-500"
              />
            </div>
          </div>
        );
      })()}

      {/* 5. SWING RIDE */}
      {selectedObject.type === 'Swing Ride' && (() => {
        const ride = selectedObject as SwingRideObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Activity className="w-3.5 h-3.5 text-indigo-400" /> Wave Swinger Controls
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Canopy Diameter: <span className="text-indigo-400 font-bold">{ride.canopyDiameter}m</span>
              </label>
              <input
                type="range"
                min="10"
                max="22"
                step="1"
                value={ride.canopyDiameter}
                onChange={(e) => onChange({ ...ride, canopyDiameter: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Tower Height: <span className="text-indigo-400 font-bold">{ride.towerHeight}m</span>
              </label>
              <input
                type="range"
                min="10"
                max="24"
                step="1"
                value={ride.towerHeight}
                onChange={(e) => onChange({ ...ride, towerHeight: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Swing Arms: <span className="text-indigo-400 font-bold">{ride.armCount}</span>
              </label>
              <input
                type="range"
                min="8"
                max="18"
                step="2"
                value={ride.armCount}
                onChange={(e) => onChange({ ...ride, armCount: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Canopy Color</span>
              <input
                type="color"
                value={ride.canopyColor}
                onChange={(e) => onChange({ ...ride, canopyColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Chair Color</span>
              <input
                type="color"
                value={ride.chairColor}
                onChange={(e) => onChange({ ...ride, chairColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        );
      })()}

      {/* 6. BUMPER CARS */}
      {selectedObject.type === 'Bumper Cars' && (() => {
        const bc = selectedObject as BumperCarsObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Activity className="w-3.5 h-3.5 text-red-400" /> Bumper Cars Arena Configuration
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Arena Width: <span className="text-red-400 font-bold">{bc.arenaWidth}m</span>
              </label>
              <input
                type="range"
                min="14"
                max="32"
                step="2"
                value={bc.arenaWidth}
                onChange={(e) => onChange({ ...bc, arenaWidth: parseFloat(e.target.value) })}
                className="w-full accent-red-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Arena Length: <span className="text-red-400 font-bold">{bc.arenaLength}m</span>
              </label>
              <input
                type="range"
                min="18"
                max="40"
                step="2"
                value={bc.arenaLength}
                onChange={(e) => onChange({ ...bc, arenaLength: parseFloat(e.target.value) })}
                className="w-full accent-red-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Active Bumper Cars: <span className="text-red-400 font-bold">{bc.carCount}</span>
              </label>
              <input
                type="range"
                min="4"
                max="14"
                step="1"
                value={bc.carCount}
                onChange={(e) => onChange({ ...bc, carCount: parseInt(e.target.value, 10) })}
                className="w-full accent-red-500"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Roof Canopy Color</span>
              <input
                type="color"
                value={bc.roofColor}
                onChange={(e) => onChange({ ...bc, roofColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        );
      })()}

      {/* 7. KIDS ATTRACTION */}
      {selectedObject.type === 'Kids Attraction' && (() => {
        const kids = selectedObject as KidsAttractionObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Activity className="w-3.5 h-3.5 text-pink-400" /> Kids Attraction Controls
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Platform Diameter: <span className="text-pink-400 font-bold">{kids.diameter}m</span>
              </label>
              <input
                type="range"
                min="10"
                max="20"
                step="1"
                value={kids.diameter}
                onChange={(e) => onChange({ ...kids, diameter: parseFloat(e.target.value) })}
                className="w-full accent-pink-500"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Primary Color</span>
              <input
                type="color"
                value={kids.primaryColor}
                onChange={(e) => onChange({ ...kids, primaryColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Secondary Accent</span>
              <input
                type="color"
                value={kids.secondaryColor}
                onChange={(e) => onChange({ ...kids, secondaryColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        );
      })()}

      {/* 8. ENTRANCE GATE */}
      {selectedObject.type === 'Entrance Gate' && (() => {
        const gate = selectedObject as EntranceGateObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-purple-400" /> Entrance Gate Architecture
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Arch Span Width: <span className="text-purple-400 font-bold">{gate.archWidth}m</span>
              </label>
              <input
                type="range"
                min="16"
                max="36"
                step="2"
                value={gate.archWidth}
                onChange={(e) => onChange({ ...gate, archWidth: parseFloat(e.target.value) })}
                className="w-full accent-purple-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Arch Height: <span className="text-purple-400 font-bold">{gate.archHeight}m</span>
              </label>
              <input
                type="range"
                min="8"
                max="18"
                step="1"
                value={gate.archHeight}
                onChange={(e) => onChange({ ...gate, archHeight: parseFloat(e.target.value) })}
                className="w-full accent-purple-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Gate Architectural Style</label>
              <select
                value={gate.gateStyle}
                onChange={(e) => onChange({ ...gate, gateStyle: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
              >
                <option value="grand_archway">Grand Archway (Wonderla)</option>
                <option value="castle_gate">Royal Castle Gate (Fantasy)</option>
                <option value="modern_canopy">Modern Glass Canopy</option>
                <option value="futuristic_portal">Futuristic Portal (Cyber)</option>
              </select>
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Pillar &amp; Beam Color</span>
              <input
                type="color"
                value={gate.primaryColor}
                onChange={(e) => onChange({ ...gate, primaryColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Accent Trim Color</span>
              <input
                type="color"
                value={gate.accentColor}
                onChange={(e) => onChange({ ...gate, accentColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        );
      })()}

      {/* 9. RESTAURANT */}
      {selectedObject.type === 'Restaurant' && (() => {
        const rest = selectedObject as RestaurantObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Restaurant Facility Design
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">
                  Width: <span className="text-amber-400 font-bold">{rest.width}m</span>
                </label>
                <input
                  type="range"
                  min="12"
                  max="28"
                  step="1"
                  value={rest.width}
                  onChange={(e) => onChange({ ...rest, width: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">
                  Depth: <span className="text-amber-400 font-bold">{rest.depth}m</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  step="1"
                  value={rest.depth}
                  onChange={(e) => onChange({ ...rest, depth: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Wall Height: <span className="text-amber-400 font-bold">{rest.wallHeight}m</span>
              </label>
              <input
                type="range"
                min="3.5"
                max="8.0"
                step="0.5"
                value={rest.wallHeight}
                onChange={(e) => onChange({ ...rest, wallHeight: parseFloat(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Wall Color</span>
              <input
                type="color"
                value={rest.finishColor}
                onChange={(e) => onChange({ ...rest, finishColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Roof Color</span>
              <input
                type="color"
                value={rest.roofColor}
                onChange={(e) => onChange({ ...rest, roofColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        );
      })()}

      {/* 10. SHOP */}
      {selectedObject.type === 'Shop' && (() => {
        const shop = selectedObject as ShopObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-blue-400" /> Souvenir Shop Architecture
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Width: {shop.width}m</label>
                <input
                  type="range"
                  min="8"
                  max="20"
                  step="1"
                  value={shop.width}
                  onChange={(e) => onChange({ ...shop, width: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Depth: {shop.depth}m</label>
                <input
                  type="range"
                  min="6"
                  max="16"
                  step="1"
                  value={shop.depth}
                  onChange={(e) => onChange({ ...shop, depth: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Awning Color</span>
              <input
                type="color"
                value={shop.awningColor}
                onChange={(e) => onChange({ ...shop, awningColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        );
      })()}

      {/* 11. PARKING AREA */}
      {selectedObject.type === 'Parking Area' && (() => {
        const park = selectedObject as ParkingAreaObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Visitor Parking Configuration
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Lot Width: <span className="text-slate-300 font-bold">{park.lotWidth}m</span>
              </label>
              <input
                type="range"
                min="25"
                max="65"
                step="2"
                value={park.lotWidth}
                onChange={(e) => onChange({ ...park, lotWidth: parseFloat(e.target.value) })}
                className="w-full accent-slate-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Lot Length: <span className="text-slate-300 font-bold">{park.lotLength}m</span>
              </label>
              <input
                type="range"
                min="20"
                max="50"
                step="2"
                value={park.lotLength}
                onChange={(e) => onChange({ ...park, lotLength: parseFloat(e.target.value) })}
                className="w-full accent-slate-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Car Count: <span className="text-slate-300 font-bold">{park.carCount}</span>
              </label>
              <input
                type="range"
                min="6"
                max="24"
                step="2"
                value={park.carCount}
                onChange={(e) => onChange({ ...park, carCount: parseInt(e.target.value, 10) })}
                className="w-full accent-slate-500"
              />
            </div>
          </div>
        );
      })()}

      {/* 12. GARDENS */}
      {selectedObject.type === 'Gardens' && (() => {
        const garden = selectedObject as GardensObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-pink-400" /> Botanical Gardens Design
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Garden Span: <span className="text-pink-400 font-bold">{garden.gardenWidth}m</span>
              </label>
              <input
                type="range"
                min="12"
                max="36"
                step="2"
                value={garden.gardenWidth}
                onChange={(e) =>
                  onChange({
                    ...garden,
                    gardenWidth: parseFloat(e.target.value),
                    gardenLength: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-pink-500"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Flower Bed Color</span>
              <input
                type="color"
                value={garden.flowerColor}
                onChange={(e) => onChange({ ...garden, flowerColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        );
      })()}

      {/* 13. BRIDGE */}
      {selectedObject.type === 'Bridge' && (() => {
        const bridge = selectedObject as BridgeObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Pedestrian Bridge Structure
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Bridge Length: <span className="text-amber-400 font-bold">{bridge.bridgeLength}m</span>
              </label>
              <input
                type="range"
                min="10"
                max="30"
                step="1"
                value={bridge.bridgeLength}
                onChange={(e) => onChange({ ...bridge, bridgeLength: parseFloat(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Arch Clearance Height: <span className="text-amber-400 font-bold">{bridge.archHeight}m</span>
              </label>
              <input
                type="range"
                min="1.2"
                max="4.0"
                step="0.2"
                value={bridge.archHeight}
                onChange={(e) => onChange({ ...bridge, archHeight: parseFloat(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Deck Color</span>
              <input
                type="color"
                value={bridge.deckColor}
                onChange={(e) => onChange({ ...bridge, deckColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Railing Color</span>
              <input
                type="color"
                value={bridge.railColor}
                onChange={(e) => onChange({ ...bridge, railColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        );
      })()}

      {/* 14. FOUNTAIN */}
      {selectedObject.type === 'Fountain' && (() => {
        const ft = selectedObject as FountainObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Tiered Fountain Dynamics
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Basin Radius: <span className="text-cyan-400 font-bold">{ft.basinRadius}m</span>
              </label>
              <input
                type="range"
                min="4"
                max="14"
                step="1"
                value={ft.basinRadius}
                onChange={(e) => onChange({ ...ft, basinRadius: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Water Jet Height: <span className="text-cyan-400 font-bold">{ft.jetHeight}m</span>
              </label>
              <input
                type="range"
                min="3"
                max="10"
                step="0.5"
                value={ft.jetHeight}
                onChange={(e) => onChange({ ...ft, jetHeight: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Concentric Tiers: <span className="text-cyan-400 font-bold">{ft.tiers}</span>
              </label>
              <input
                type="range"
                min="1"
                max="3"
                step="1"
                value={ft.tiers}
                onChange={(e) => onChange({ ...ft, tiers: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>
        );
      })()}

      {/* 15. DECORATIVE LIGHTING */}
      {selectedObject.type === 'Decorative Lighting' && (() => {
        const light = selectedObject as DecorativeLightingObject;
        return (
          <div className="space-y-3">
            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-yellow-400" /> Decorative Lighting Controls
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Pole Height: <span className="text-yellow-400 font-bold">{light.poleHeight}m</span>
              </label>
              <input
                type="range"
                min="4"
                max="9"
                step="0.5"
                value={light.poleHeight}
                onChange={(e) => onChange({ ...light, poleHeight: parseFloat(e.target.value) })}
                className="w-full accent-yellow-500"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Lantern Light Glow</span>
              <input
                type="color"
                value={light.lightColor}
                onChange={(e) => onChange({ ...light, lightColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        );
      })()}

      {/* 16. CUSTOM ARCHITECTURE & BUILDINGS */}
      {['Custom Architecture', 'Ticket Pavilion', 'Food Court', 'Changing Rooms', 'Ticket Counter'].includes(
        selectedObject.type
      ) && (() => {
        const arch = selectedObject as CustomArchitectureObject;
        return (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => onOpenFloorPlanEditor(arch)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold transition shadow-md shadow-amber-600/20"
            >
              <Edit3 className="w-4 h-4" /> Open 2D Floor-Plan CAD
            </button>

            <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px] pt-1">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Architectural Parameters
            </span>

            {/* Building Preset */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Building Preset</label>
              <select
                value={arch.preset || 'Custom Building'}
                onChange={(e) => onChange({ ...arch, preset: e.target.value as BuildingPreset })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
              >
                <option value="Boarding Station">Boarding Station</option>
                <option value="Ticket Counter">Ticket Counter</option>
                <option value="Park Entrance">Park Entrance</option>
                <option value="Food Court">Food Court</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Shop">Shop</option>
                <option value="Changing Rooms">Changing Rooms</option>
                <option value="Pavilion">Pavilion</option>
                <option value="Custom Building">Custom Building</option>
              </select>
            </div>

            {/* Architectural Style */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Architectural Style</label>
              <select
                value={arch.style || 'modern'}
                onChange={(e) => onChange({ ...arch, style: e.target.value as ArchitecturalStyle })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
              >
                <option value="modern">Modern Minimalist</option>
                <option value="victorian">Victorian Classic</option>
                <option value="tropical">Tropical Bamboo / Timber</option>
                <option value="wonderla">Wonderla Vibrant Theme</option>
                <option value="fantasy">Enchanted Fantasy</option>
                <option value="futuristic">Futuristic High-Tech</option>
                <option value="rustic">Rustic Alpine Stone</option>
              </select>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">
                  Width: <span className="text-amber-400 font-bold">{arch.width}m</span>
                </label>
                <input
                  type="range"
                  min="6"
                  max="36"
                  step="1"
                  value={arch.width}
                  onChange={(e) => onChange({ ...arch, width: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">
                  Depth: <span className="text-amber-400 font-bold">{arch.depth}m</span>
                </label>
                <input
                  type="range"
                  min="6"
                  max="30"
                  step="1"
                  value={arch.depth}
                  onChange={(e) => onChange({ ...arch, depth: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Wall Height: <span className="text-amber-400 font-bold">{arch.wallHeight}m</span>
              </label>
              <input
                type="range"
                min="2.8"
                max="10.0"
                step="0.2"
                value={arch.wallHeight}
                onChange={(e) => onChange({ ...arch, wallHeight: parseFloat(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Roof Design */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Roof Architecture</label>
              <select
                value={arch.roofStyle}
                onChange={(e) => onChange({ ...arch, roofStyle: e.target.value as RoofStyle })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
              >
                <option value="gable">Pitched Gable (A-Frame)</option>
                <option value="hip">Sloped Hip (4-Sided)</option>
                <option value="flat">Modern Flat (Parapet)</option>
                <option value="mansard">Mansard / Pagoda Curved</option>
                <option value="dome">Arched Dome</option>
                <option value="futuristic">Futuristic Cantilever</option>
              </select>
            </div>

            {/* Wall Materials */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Wall Material Finish</label>
              <select
                value={arch.finish}
                onChange={(e) => onChange({ ...arch, finish: e.target.value as BuildingFinish })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
              >
                <option value="timber">Natural Cedar Timber</option>
                <option value="brick">Textured Red Brick</option>
                <option value="glass">Glass Curtain Wall</option>
                <option value="painted">Stucco Painted</option>
                <option value="stone">Carved Granite Stone</option>
                <option value="metal">Brushed Architectural Steel</option>
              </select>
            </div>

            {/* Colors */}
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Wall Tone</span>
              <input
                type="color"
                value={arch.finishColor}
                onChange={(e) => onChange({ ...arch, finishColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Roof Tiles Tone</span>
              <input
                type="color"
                value={arch.roofColor}
                onChange={(e) => onChange({ ...arch, roofColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>

            {/* Doors & Windows */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">
                  Doors: <span className="text-white font-bold">{arch.doorCount}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={arch.doorCount}
                  onChange={(e) => onChange({ ...arch, doorCount: parseInt(e.target.value, 10) })}
                  className="w-full accent-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">
                  Windows: <span className="text-white font-bold">{arch.windowCount}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={arch.windowCount}
                  onChange={(e) => onChange({ ...arch, windowCount: parseInt(e.target.value, 10) })}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* 24. FANTASY CASTLE */}
      {selectedObject.type === 'Fantasy Castle' && (() => {
        const castle = selectedObject as FantasyCastleObject;
        return (
          <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
              Fantasy Castle Architecture
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Spire Tower Height: <span className="text-white font-bold">{castle.castleHeight}m</span>
              </label>
              <input
                type="range"
                min="35"
                max="80"
                step="1"
                value={castle.castleHeight}
                onChange={(e) => onChange({ ...castle, castleHeight: parseInt(e.target.value, 10) })}
                className="w-full accent-purple-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Castle Footprint Width: <span className="text-white font-bold">{castle.castleWidth}m</span>
              </label>
              <input
                type="range"
                min="24"
                max="55"
                step="1"
                value={castle.castleWidth}
                onChange={(e) => onChange({ ...castle, castleWidth: parseInt(e.target.value, 10) })}
                className="w-full accent-purple-500"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Limestone Walls</span>
              <input
                type="color"
                value={castle.wallColor}
                onChange={(e) => onChange({ ...castle, wallColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Royal Roof Tiles</span>
              <input
                type="color"
                value={castle.roofColor}
                onChange={(e) => onChange({ ...castle, roofColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Gold Spire Trim</span>
              <input
                type="color"
                value={castle.trimColor}
                onChange={(e) => onChange({ ...castle, trimColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        );
      })()}

      {/* 25. WOODEN COASTER */}
      {selectedObject.type === 'Wooden Coaster' && (() => {
        const coaster = selectedObject as WoodenCoasterObject;
        return (
          <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
              Wooden Coaster Engineering
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Lift Hill Height: <span className="text-white font-bold">{coaster.hillHeight}m</span>
              </label>
              <input
                type="range"
                min="20"
                max="50"
                step="1"
                value={coaster.hillHeight}
                onChange={(e) => onChange({ ...coaster, hillHeight: parseInt(e.target.value, 10) })}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Track Length Depth: <span className="text-white font-bold">{coaster.trackLength}m</span>
              </label>
              <input
                type="range"
                min="35"
                max="85"
                step="1"
                value={coaster.trackLength}
                onChange={(e) => onChange({ ...coaster, trackLength: parseInt(e.target.value, 10) })}
                className="w-full accent-amber-500"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Timber Trestle Tone</span>
              <input
                type="color"
                value={coaster.woodColor}
                onChange={(e) => onChange({ ...coaster, woodColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        );
      })()}

      {/* 26. MOUNTAIN ATTRACTION */}
      {selectedObject.type === 'Mountain Attraction' && (() => {
        const mountain = selectedObject as MountainAttractionObject;
        return (
          <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 block">
              Rocky Mountain Geology &amp; Mine Train
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Mountain Peak Height: <span className="text-white font-bold">{mountain.mountainHeight}m</span>
              </label>
              <input
                type="range"
                min="25"
                max="55"
                step="1"
                value={mountain.mountainHeight}
                onChange={(e) => onChange({ ...mountain, mountainHeight: parseInt(e.target.value, 10) })}
                className="w-full accent-orange-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Canyon Footprint Width: <span className="text-white font-bold">{mountain.mountainWidth}m</span>
              </label>
              <input
                type="range"
                min="35"
                max="75"
                step="1"
                value={mountain.mountainWidth}
                onChange={(e) => onChange({ ...mountain, mountainWidth: parseInt(e.target.value, 10) })}
                className="w-full accent-orange-500"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Sandstone Rock Tone</span>
              <input
                type="color"
                value={mountain.rockColor}
                onChange={(e) => onChange({ ...mountain, rockColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        );
      })()}

      {/* 27. FUTURISTIC DOME */}
      {selectedObject.type === 'Futuristic Dome' && (() => {
        const dome = selectedObject as FuturisticDomeObject;
        return (
          <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">
              Futuristic Dome Architecture
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Dome Radius: <span className="text-white font-bold">{dome.domeRadius}m</span>
              </label>
              <input
                type="range"
                min="12"
                max="32"
                step="1"
                value={dome.domeRadius}
                onChange={(e) => onChange({ ...dome, domeRadius: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-500"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Metallic Panels</span>
              <input
                type="color"
                value={dome.domeColor}
                onChange={(e) => onChange({ ...dome, domeColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Neon Ring Glow</span>
              <input
                type="color"
                value={dome.glowColor}
                onChange={(e) => onChange({ ...dome, glowColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        );
      })()}

      {/* 28. SPLASH ZONE */}
      {selectedObject.type === 'Splash Zone' && (() => {
        const splash = selectedObject as SplashZoneObject;
        return (
          <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 block">
              Water Splash Zone &amp; Tipping Bucket
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Splash Pad Diameter: <span className="text-white font-bold">{splash.zoneWidth}m</span>
              </label>
              <input
                type="range"
                min="14"
                max="34"
                step="1"
                value={splash.zoneWidth}
                onChange={(e) => onChange({ ...splash, zoneWidth: parseInt(e.target.value, 10) })}
                className="w-full accent-sky-500"
              />
            </div>
          </div>
        );
      })()}

      {/* 29. VISITOR CROWDS */}
      {selectedObject.type === 'Visitor Crowds' && (() => {
        const crowd = selectedObject as VisitorCrowdsObject;
        return (
          <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 block">
              Park Visitor Crowd Parameters
            </span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Guest Count: <span className="text-white font-bold">{crowd.crowdCount} visitors</span>
              </label>
              <input
                type="range"
                min="15"
                max="100"
                step="5"
                value={crowd.crowdCount}
                onChange={(e) => onChange({ ...crowd, crowdCount: parseInt(e.target.value, 10) })}
                className="w-full accent-pink-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Walkway Stroll Radius: <span className="text-white font-bold">{crowd.walkRadius}m</span>
              </label>
              <input
                type="range"
                min="15"
                max="50"
                step="1"
                value={crowd.walkRadius}
                onChange={(e) => onChange({ ...crowd, walkRadius: parseInt(e.target.value, 10) })}
                className="w-full accent-pink-500"
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
}
