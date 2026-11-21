import React from 'react';
import {
  List,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Activity,
  Layers,
  Home,
  Waves,
  Sparkles,
  TreePine,
  Car,
  Utensils,
  ShoppingBag,
  Lightbulb,
  DoorOpen,
  Droplets,
  Footprints,
  Crown,
  Mountain,
} from 'lucide-react';
import type { SceneObject, AttractionType } from '../../types/parkScene';

interface Props {
  objects: SceneObject[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddAttraction: (type: AttractionType) => void;
  onDelete: (id: string) => void;
}

export default function Outliner({
  objects,
  selectedId,
  onSelect,
  onAddAttraction,
  onDelete,
}: Props) {
  const getIcon = (type: AttractionType) => {
    switch (type) {
      case 'Roller Coaster':
        return <Activity className="w-3.5 h-3.5 text-rose-400" />;
      case 'Wooden Coaster':
        return <Activity className="w-3.5 h-3.5 text-amber-600" />;
      case 'Fantasy Castle':
        return <Crown className="w-3.5 h-3.5 text-amber-300" />;
      case 'Mountain Attraction':
        return <Mountain className="w-3.5 h-3.5 text-amber-500" />;
      case 'Futuristic Dome':
        return <Layers className="w-3.5 h-3.5 text-cyan-300" />;
      case 'Splash Zone':
        return <Droplets className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Visitor Crowds':
        return <Footprints className="w-3.5 h-3.5 text-rose-400" />;
      case 'Ferris Wheel':
      case 'Swing Ride':
        return <Layers className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Carousel':
        return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      case 'Drop Tower':
        return <Activity className="w-3.5 h-3.5 text-amber-400" />;
      case 'Bumper Cars':
        return <Car className="w-3.5 h-3.5 text-orange-400" />;
      case 'Kids Attraction':
        return <Sparkles className="w-3.5 h-3.5 text-pink-400" />;
      case 'Water Ride':
      case 'Wave Pool':
      case 'Slide Tower':
      case 'Lazy River':
      case 'Lagoon':
        return <Waves className="w-3.5 h-3.5 text-blue-400" />;
      case 'Fountain':
        return <Droplets className="w-3.5 h-3.5 text-sky-400" />;
      case 'Entrance Gate':
        return <DoorOpen className="w-3.5 h-3.5 text-yellow-400" />;
      case 'Restaurant':
      case 'Food Court':
        return <Utensils className="w-3.5 h-3.5 text-red-400" />;
      case 'Shop':
        return <ShoppingBag className="w-3.5 h-3.5 text-violet-400" />;
      case 'Parking Area':
        return <Car className="w-3.5 h-3.5 text-slate-400" />;
      case 'Gardens':
      case 'Trees':
        return <TreePine className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Bridge':
        return <Layers className="w-3.5 h-3.5 text-amber-300" />;
      case 'Decorative Lighting':
        return <Lightbulb className="w-3.5 h-3.5 text-amber-400" />;
      case 'Ticket Counter':
      case 'Ticket Pavilion':
      case 'Changing Rooms':
      case 'Custom Architecture':
        return <Home className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Pedestrian Path':
      case 'Benches':
        return <Footprints className="w-3.5 h-3.5 text-stone-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2.5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <List className="w-3.5 h-3.5 text-purple-400" /> Park Attractions ({objects.length})
        </span>
      </div>

      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {objects.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            Blank Park terrain — click &ldquo;Add Attraction&rdquo; above to place rides &amp; buildings.
          </div>
        ) : (
          objects.map((obj) => {
            const isSelected = obj.id === selectedId;
            return (
              <div
                key={obj.id}
                onClick={() => onSelect(obj.id)}
                className={`flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer border text-xs transition ${
                  isSelected
                    ? 'bg-purple-600/20 border-purple-500 text-white font-semibold'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {getIcon(obj.type)}
                  <span className="truncate">{obj.name}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(obj.id);
                    }}
                    className="p-1 hover:text-red-400 text-slate-500 rounded transition"
                    title="Delete attraction"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
