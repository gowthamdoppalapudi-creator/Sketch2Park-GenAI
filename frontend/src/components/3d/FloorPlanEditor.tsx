import React from 'react';
import {
  Ruler,
  Maximize2,
  Columns,
  Layers,
  Palette,
  DoorOpen,
  AppWindow,
  Home,
  X,
  Check,
} from 'lucide-react';
import type {
  CustomArchitectureObject,
  BuildingFinish,
  RoofStyle,
  BuildingPreset,
} from '../../types/parkScene';

interface Props {
  building: CustomArchitectureObject;
  onChange: (updated: CustomArchitectureObject) => void;
  onClose: () => void;
}

export default function FloorPlanEditor({ building, onChange, onClose }: Props) {
  const presets: { preset: BuildingPreset; label: string; icon: string }[] = [
    { preset: 'Boarding Station', label: 'Boarding Station', icon: '🎢' },
    { preset: 'Ticket Counter', label: 'Ticket Counter', icon: '🎟️' },
    { preset: 'Park Entrance', label: 'Park Entrance', icon: '⛩️' },
    { preset: 'Food Court', label: 'Food Court', icon: '🍔' },
    { preset: 'Pavilion', label: 'Garden Pavilion', icon: '🏛️' },
    { preset: 'Custom Building', label: 'Custom Building', icon: '🏢' },
  ];

  const finishes: { finish: BuildingFinish; label: string; defaultColor: string }[] = [
    { finish: 'timber', label: 'Natural Timber', defaultColor: '#854d0e' },
    { finish: 'brick', label: 'Red Brick', defaultColor: '#b91c1c' },
    { finish: 'glass', label: 'Curtain Glass', defaultColor: '#38bdf8' },
    { finish: 'painted', label: 'Stucco Painted', defaultColor: '#f1f5f9' },
  ];

  const roofs: { roof: RoofStyle; label: string; desc: string }[] = [
    { roof: 'gable', label: 'Pitched Gable', desc: 'Classic triangular A-frame roof' },
    { roof: 'hip', label: 'Sloped Hip', desc: '4-sided sloped roof with eaves' },
    { roof: 'flat', label: 'Modern Flat', desc: 'Clean roofline with parapet capping' },
    { roof: 'mansard', label: 'Pagoda / Mansard', desc: 'Curved tiered ornate roof' },
  ];

  const handlePresetSelect = (p: BuildingPreset) => {
    switch (p) {
      case 'Ticket Counter':
        onChange({
          ...building,
          name: 'Front Ticket Counter',
          preset: p,
          shape: 'rectangular',
          width: 8,
          depth: 5,
          wallHeight: 3.2,
          roofStyle: 'hip',
          finish: 'painted',
          finishColor: '#fef08a',
          roofColor: '#e11d48',
          doorCount: 1,
          windowCount: 3,
        });
        break;
      case 'Park Entrance':
        onChange({
          ...building,
          name: 'Grand Park Entrance Gateway',
          preset: p,
          shape: 'rectangular',
          width: 18,
          depth: 7,
          wallHeight: 6.0,
          roofStyle: 'gable',
          finish: 'brick',
          finishColor: '#991b1b',
          roofColor: '#1e293b',
          doorCount: 3,
          windowCount: 6,
        });
        break;
      case 'Food Court':
        onChange({
          ...building,
          name: 'Central Food Court Pavilion',
          preset: p,
          shape: 'l_shaped',
          width: 16,
          depth: 10,
          wingWidth: 8,
          wingDepth: 7,
          wallHeight: 4.8,
          roofStyle: 'mansard',
          finish: 'timber',
          finishColor: '#78350f',
          roofColor: '#047857',
          doorCount: 2,
          windowCount: 6,
        });
        break;
      case 'Pavilion':
        onChange({
          ...building,
          name: 'Garden Promenade Pavilion',
          preset: p,
          shape: 'rectangular',
          width: 12,
          depth: 12,
          wallHeight: 4.2,
          roofStyle: 'mansard',
          finish: 'timber',
          finishColor: '#b45309',
          roofColor: '#0f766e',
          doorCount: 2,
          windowCount: 4,
        });
        break;
      case 'Boarding Station':
      default:
        onChange({
          ...building,
          name: 'Coaster Boarding Station',
          preset: p,
          shape: 'rectangular',
          width: 14,
          depth: 9,
          wallHeight: 4.5,
          roofStyle: 'gable',
          finish: 'timber',
          finishColor: '#854d0e',
          roofColor: '#334155',
          doorCount: 2,
          windowCount: 4,
        });
        break;
    }
  };

  // SVG dimensions for top-down floor-plan rendering
  const svgWidth = 340;
  const svgHeight = 260;
  const scale = 12; // pixels per meter
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

  const rectW = building.width * scale;
  const rectH = building.depth * scale;
  const wingW = (building.wingWidth || 6) * scale;
  const wingH = (building.wingDepth || 6) * scale;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600/20 text-amber-400 p-2 rounded-xl border border-amber-500/30">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Floor-Plan &amp; Architecture Editor
              </h3>
              <p className="text-xs text-slate-400">
                Top-down CAD drafting with real-time meter scaling and 3D preview
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Top-Down CAD Floor-Plan Canvas */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-3 text-xs text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-amber-400" /> Top-Down Floor Plan
                </span>
                <span className="text-amber-400 font-mono text-[11px]">
                  {building.width.toFixed(1)}m × {building.depth.toFixed(1)}m (
                  {(building.width * building.depth).toFixed(0)} m²)
                </span>
              </div>

              {/* Interactive SVG Blueprint */}
              <div className="w-full bg-[#0a0f1d] border border-blue-950 rounded-xl overflow-hidden relative shadow-inner flex items-center justify-center p-2">
                <svg width={svgWidth} height={svgHeight} className="select-none">
                  <defs>
                    <pattern id="cadGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#cadGrid)" />

                  {/* Footprint Geometry */}
                  {building.shape === 'l_shaped' ? (
                    <g>
                      {/* Main rectangle */}
                      <rect
                        x={centerX - rectW / 2}
                        y={centerY - rectH / 2}
                        width={rectW}
                        height={rectH}
                        fill="#0284c7"
                        fillOpacity="0.25"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        rx="4"
                      />
                      {/* Extension wing */}
                      <rect
                        x={centerX + rectW / 2 - wingW}
                        y={centerY + rectH / 2}
                        width={wingW}
                        height={wingH}
                        fill="#0284c7"
                        fillOpacity="0.25"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        rx="4"
                      />
                    </g>
                  ) : (
                    <rect
                      x={centerX - rectW / 2}
                      y={centerY - rectH / 2}
                      width={rectW}
                      height={rectH}
                      fill="#d97706"
                      fillOpacity="0.25"
                      stroke="#fbbf24"
                      strokeWidth="2"
                      rx="4"
                    />
                  )}

                  {/* Dimension Lines */}
                  {/* Width Dimension */}
                  <line
                    x1={centerX - rectW / 2}
                    y1={centerY - rectH / 2 - 12}
                    x2={centerX + rectW / 2}
                    y2={centerY - rectH / 2 - 12}
                    stroke="#94a3b8"
                    strokeWidth="1.2"
                  />
                  <text
                    x={centerX}
                    y={centerY - rectH / 2 - 16}
                    fill="#cbd5e1"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {building.width.toFixed(1)} m
                  </text>

                  {/* Depth Dimension */}
                  <line
                    x1={centerX - rectW / 2 - 12}
                    y1={centerY - rectH / 2}
                    x2={centerX - rectW / 2 - 12}
                    y2={centerY + rectH / 2}
                    stroke="#94a3b8"
                    strokeWidth="1.2"
                  />
                  <text
                    x={centerX - rectW / 2 - 16}
                    y={centerY}
                    fill="#cbd5e1"
                    fontSize="10"
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontFamily="monospace"
                  >
                    {building.depth.toFixed(1)} m
                  </text>

                  {/* Doors Markers (front facade) */}
                  {Array.from({ length: building.doorCount }).map((_, d) => {
                    const spacing = rectW / (building.doorCount + 1);
                    const dx = centerX - rectW / 2 + spacing * (d + 1);
                    return (
                      <g key={`door-${d}`}>
                        <rect
                          x={dx - 8}
                          y={centerY + rectH / 2 - 2}
                          width="16"
                          height="4"
                          fill="#ef4444"
                        />
                        <text
                          x={dx}
                          y={centerY + rectH / 2 + 14}
                          fill="#f87171"
                          fontSize="8"
                          textAnchor="middle"
                        >
                          Door {d + 1}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Footprint Shape Switcher */}
              <div className="flex gap-2 w-full mt-3">
                <button
                  type="button"
                  onClick={() => onChange({ ...building, shape: 'rectangular' })}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition ${
                    building.shape === 'rectangular'
                      ? 'bg-amber-600 border-amber-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Rectangular
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...building, shape: 'l_shaped' })}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition ${
                    building.shape === 'l_shaped'
                      ? 'bg-amber-600 border-amber-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  L-Shaped Wing
                </button>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                Architectural Presets
              </span>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((p) => (
                  <button
                    key={p.preset}
                    type="button"
                    onClick={() => handlePresetSelect(p.preset)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left border text-xs transition ${
                      building.preset === p.preset
                        ? 'bg-amber-600/20 border-amber-500 text-amber-200 font-semibold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-sm">{p.icon}</span>
                    <span className="truncate">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Parameters and Material Controls */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Building Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Building Name
              </label>
              <input
                type="text"
                value={building.name}
                onChange={(e) => onChange({ ...building, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Dimensions Sliders */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Width: <span className="text-amber-400 font-bold">{building.width}m</span>
                </label>
                <input
                  type="range"
                  min="6"
                  max="35"
                  step="0.5"
                  value={building.width}
                  onChange={(e) => onChange({ ...building, width: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Depth: <span className="text-amber-400 font-bold">{building.depth}m</span>
                </label>
                <input
                  type="range"
                  min="4"
                  max="25"
                  step="0.5"
                  value={building.depth}
                  onChange={(e) => onChange({ ...building, depth: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Wall Height:{' '}
                  <span className="text-amber-400 font-bold">{building.wallHeight}m</span>
                </label>
                <input
                  type="range"
                  min="2.8"
                  max="9.0"
                  step="0.2"
                  value={building.wallHeight}
                  onChange={(e) =>
                    onChange({ ...building, wallHeight: parseFloat(e.target.value) })
                  }
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {building.shape === 'l_shaped' && (
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Wing Width:{' '}
                    <span className="text-amber-400 font-bold">{building.wingWidth || 6}m</span>
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="18"
                    step="0.5"
                    value={building.wingWidth || 6}
                    onChange={(e) =>
                      onChange({ ...building, wingWidth: parseFloat(e.target.value) })
                    }
                    className="w-full accent-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Wing Depth:{' '}
                    <span className="text-amber-400 font-bold">{building.wingDepth || 6}m</span>
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="16"
                    step="0.5"
                    value={building.wingDepth || 6}
                    onChange={(e) =>
                      onChange({ ...building, wingDepth: parseFloat(e.target.value) })
                    }
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Roof Style Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" /> Roof Architecture
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {roofs.map((r) => (
                  <button
                    key={r.roof}
                    type="button"
                    onClick={() => onChange({ ...building, roofStyle: r.roof })}
                    className={`p-2.5 rounded-xl border text-left text-xs transition ${
                      building.roofStyle === r.roof
                        ? 'bg-amber-600 border-amber-400 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold">{r.label}</div>
                    <div className="text-[10px] text-slate-300 font-normal leading-tight mt-0.5 opacity-80">
                      {r.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Finishes and Material Finish Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" /> Facade Material &amp; Finish
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {finishes.map((f) => (
                  <button
                    key={f.finish}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...building,
                        finish: f.finish,
                        finishColor: f.defaultColor,
                      })
                    }
                    className={`p-2 rounded-xl border text-center text-xs transition ${
                      building.finish === f.finish
                        ? 'bg-amber-600/30 border-amber-400 text-amber-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Color pickers */}
              <div className="flex gap-4 items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={building.finishColor}
                    onChange={(e) => onChange({ ...building, finishColor: e.target.value })}
                    className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs text-slate-300">Wall Tone</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={building.roofColor}
                    onChange={(e) => onChange({ ...building, roofColor: e.target.value })}
                    className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs text-slate-300">Roof Trim</span>
                </div>
              </div>
            </div>

            {/* Doors and Windows Count */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                  <DoorOpen className="w-3.5 h-3.5 text-amber-400" />
                  Doors: <span className="text-white font-bold">{building.doorCount}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={building.doorCount}
                  onChange={(e) =>
                    onChange({ ...building, doorCount: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                  <AppWindow className="w-3.5 h-3.5 text-amber-400" />
                  Windows: <span className="text-white font-bold">{building.windowCount}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={building.windowCount}
                  onChange={(e) =>
                    onChange({ ...building, windowCount: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-900/90">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-amber-600/20"
          >
            <Check className="w-4 h-4" /> Apply to 3D Scene
          </button>
        </div>
      </div>
    </div>
  );
}
