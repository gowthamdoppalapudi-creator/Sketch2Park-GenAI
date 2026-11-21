import React, { useState, useRef, useCallback } from 'react';
import { Columns, SplitSquareVertical, Sliders } from 'lucide-react';

interface Props {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeSub?: string;
  afterSub?: string;
}

export default function ImageComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Original Sketch / Conditioning',
  afterLabel = 'AI Concept Render',
  beforeSub,
  afterSub,
}: Props) {
  const [sliderPos, setSliderPos] = useState(50);
  const [mode, setMode] = useState<'slider' | 'side-by-side'>('slider');
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4">
      {/* View Switcher Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-white">Visual Comparison</span>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-1 text-xs">
          <button
            onClick={() => setMode('slider')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
              mode === 'slider' ? 'bg-purple-600 text-white font-medium shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            Split Slider
          </button>
          <button
            onClick={() => setMode('side-by-side')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
              mode === 'side-by-side' ? 'bg-purple-600 text-white font-medium shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            Side by Side
          </button>
        </div>
      </div>

      {mode === 'slider' ? (
        <div className="flex flex-col items-center">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative w-full aspect-square max-h-[500px] rounded-xl overflow-hidden cursor-ew-resize select-none border border-slate-800 bg-slate-950"
          >
            {/* After Image (Background) */}
            <img
              src={afterImage}
              alt={afterLabel}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* Before Image (Clipped Foreground) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <img
                src={beforeImage}
                alt={beforeLabel}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>

            {/* Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white text-slate-900 rounded-full shadow-lg flex items-center justify-center text-xs font-bold border-2 border-purple-500">
                ↔
              </div>
            </div>

            {/* Floating Labels */}
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-md border border-white/10 pointer-events-none">
              {beforeLabel}
            </div>
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-purple-300 text-xs px-2.5 py-1 rounded-md border border-purple-500/20 pointer-events-none">
              {afterLabel}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Drag the slider or click anywhere to inspect spatial alignment</p>
        </div>
      ) : (
        /* Side by Side View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">{beforeLabel}</span>
            </div>
            <div className="aspect-square rounded-lg overflow-hidden flex items-center justify-center bg-slate-900">
              <img src={beforeImage} alt={beforeLabel} className="max-h-full max-w-full object-contain" />
            </div>
            {beforeSub && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{beforeSub}</p>}
          </div>

          <div className="bg-slate-950 rounded-xl p-3 border border-purple-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-purple-300">{afterLabel}</span>
            </div>
            <div className="aspect-square rounded-lg overflow-hidden flex items-center justify-center bg-slate-900">
              <img src={afterImage} alt={afterLabel} className="max-h-full max-w-full object-contain" />
            </div>
            {afterSub && <p className="text-xs text-purple-200/80 mt-2 line-clamp-2">{afterSub}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
