import React, { useState } from 'react';
import {
  Search,
  X,
  Plus,
  Activity,
  Layers,
  Waves,
  Building,
  Trees,
  Sparkles,
  Car,
} from 'lucide-react';
import type { AttractionType, PlaceableCategory } from '../../types/parkScene';

interface AddItem {
  type: AttractionType;
  category: PlaceableCategory;
  name: string;
  description: string;
  icon: string;
  badgeColor: string;
}

const PALETTE_ITEMS: AddItem[] = [
  // 1. Thrill & Family Rides
  {
    type: 'Roller Coaster',
    category: 'rides',
    name: 'Roller Coaster',
    description: 'High-speed tubular steel coaster with lift hill, loop, and first-person ride camera.',
    icon: '🎢',
    badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
  },
  {
    type: 'Ferris Wheel',
    category: 'rides',
    name: 'Ferris Wheel',
    description: 'Towering observation wheel with illuminated spokes and gravity-stabilized passenger cabins.',
    icon: '🎡',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
  },
  {
    type: 'Carousel',
    category: 'rides',
    name: 'Grand Carousel',
    description: 'Ornate rotating platform with striped canopy and seats that bob rhythmically.',
    icon: '🎠',
    badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
  },
  {
    type: 'Drop Tower',
    category: 'rides',
    name: 'Drop Tower',
    description: 'Extreme vertical steel lattice tower with free-fall drop and magnetic brake bounce.',
    icon: '⚡',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
  },
  {
    type: 'Swing Ride',
    category: 'rides',
    name: 'Wave Swinger',
    description: 'Rotating canopy with suspended chairs that tilt and swing outwards dynamically.',
    icon: '🎪',
    badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
  },
  {
    type: 'Bumper Cars',
    category: 'rides',
    name: 'Bumper Cars Arena',
    description: 'Enclosed arena with conductive grid ceiling, soft rubber bumpers, and animated cars.',
    icon: '🏎️',
    badgeColor: 'bg-red-950 text-red-300 border-red-800',
  },
  {
    type: 'Kids Attraction',
    category: 'rides',
    name: 'Spinning Teacups',
    description: 'Whimsical rotating turntable with giant teapot and spinning passenger cups.',
    icon: '☕',
    badgeColor: 'bg-pink-950 text-pink-300 border-pink-800',
  },
  {
    type: 'Wooden Coaster',
    category: 'rides',
    name: 'Wooden Roller Coaster',
    description: 'Classic timber roller coaster with intricate cross-braced trestle lattice woodwork.',
    icon: '🪵',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
  },
  {
    type: 'Mountain Attraction',
    category: 'rides',
    name: 'Mountain Adventure Zone',
    description: 'Sculpted red-rock sandstone mountain with winding mine train coaster and canyon tunnels.',
    icon: '⛰️',
    badgeColor: 'bg-orange-950 text-orange-300 border-orange-800',
  },

  // 2. Water Attractions
  {
    type: 'Splash Zone',
    category: 'water',
    name: 'Aqua Splash & Rain Dance',
    description: 'Interactive splash pad with spray nozzles, water mushrooms, and giant tipping bucket.',
    icon: '🪣',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
  },
  {
    type: 'Wave Pool',
    category: 'water',
    name: 'Wave Pool',
    description: 'Expansive azure swimming basin with continuous wave generator surges.',
    icon: '🌊',
    badgeColor: 'bg-blue-950 text-blue-300 border-blue-800',
  },
  {
    type: 'Slide Tower',
    category: 'water',
    name: 'Slide Tower',
    description: 'Multi-level staircase tower with winding colorful water flume tubes and splash pool.',
    icon: '🏄',
    badgeColor: 'bg-sky-950 text-sky-300 border-sky-800',
  },
  {
    type: 'Lazy River',
    category: 'water',
    name: 'Lazy River',
    description: 'Meandering circular water circuit with floating inner tubes drifting lazily.',
    icon: '🏊',
    badgeColor: 'bg-teal-950 text-teal-300 border-teal-800',
  },
  {
    type: 'Water Ride',
    category: 'water',
    name: 'River Rapids Flume',
    description: 'Winding rapids channel with circular boats navigating splashing currents.',
    icon: '🚣',
    badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
  },

  // 3. Architecture & Facilities
  {
    type: 'Fantasy Castle',
    category: 'architecture',
    name: 'Fantasy Castle',
    description: 'Iconic Disney-style fairytale castle with soaring spires, royal blue roofs, gold pinnacles, and battlements.',
    icon: '🏰',
    badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
  },
  {
    type: 'Futuristic Dome',
    category: 'architecture',
    name: 'Futuristic Dome Pavilion',
    description: 'Geodesic sphere dome pavilion with glowing neon contour rings and modern sci-fi look.',
    icon: '🌐',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
  },
  {
    type: 'Entrance Gate',
    category: 'architecture',
    name: 'Entrance Gate',
    description: 'Grand monumental theme park entrance archway with turnstiles and marquee signage.',
    icon: '⛩️',
    badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
  },
  {
    type: 'Restaurant',
    category: 'architecture',
    name: 'Themed Restaurant',
    description: 'Sit-down dining establishment with glass windows, outdoor patio, tables, and parasols.',
    icon: '🍽️',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
  },
  {
    type: 'Shop',
    category: 'architecture',
    name: 'Souvenir Boutique',
    description: 'Themed retail gift shop with front fabric awning and merchandise display windows.',
    icon: '🛍️',
    badgeColor: 'bg-blue-950 text-blue-300 border-blue-800',
  },
  {
    type: 'Custom Architecture',
    category: 'architecture',
    name: 'Custom Building',
    description: 'Fully customizable building: dimensions, wall finish, roof design, doors, and style.',
    icon: '🏛️',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  },
  {
    type: 'Ticket Pavilion',
    category: 'architecture',
    name: 'Ticket Pavilion',
    description: 'Guest entrance ticketing building with service windows and turnstile canopy.',
    icon: '🎟️',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  },
  {
    type: 'Food Court',
    category: 'architecture',
    name: 'Food Court',
    description: 'Dining pavilion with service counters, outdoor tables, and theme park finishes.',
    icon: '🍔',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  },
  {
    type: 'Changing Rooms',
    category: 'architecture',
    name: 'Changing Rooms',
    description: 'Water park locker facility with shower rooms and guest privacy corridors.',
    icon: '🚿',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  },

  // 4. Landscape & Water Bodies
  {
    type: 'Gardens',
    category: 'landscape',
    name: 'Botanical Gardens',
    description: 'Landscaped floral gardens with hedges, rose beds, stone pathways, and center pedestal.',
    icon: '🌺',
    badgeColor: 'bg-pink-950 text-pink-300 border-pink-800',
  },
  {
    type: 'Fountain',
    category: 'landscape',
    name: 'Tiered Fountain',
    description: 'Animated multi-tiered stone fountain with pulsing central water jet and spray basins.',
    icon: '⛲',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
  },
  {
    type: 'Bridge',
    category: 'landscape',
    name: 'Pedestrian Bridge',
    description: 'Gracefully arched pedestrian bridge spanning lagoons, flumes, and walkways.',
    icon: '🌉',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
  },
  {
    type: 'Lagoon',
    category: 'landscape',
    name: 'Central Lagoon',
    description: 'Natural tropical water body with sandy shoreline and decorative perimeter boulders.',
    icon: '🏝️',
    badgeColor: 'bg-lime-950 text-lime-300 border-lime-800',
  },
  {
    type: 'Trees',
    category: 'landscape',
    name: 'Trees & Groves',
    description: 'Cluster of tropical palm trees and lush shade foliage.',
    icon: '🌴',
    badgeColor: 'bg-green-950 text-green-300 border-green-800',
  },
  {
    type: 'Pedestrian Path',
    category: 'landscape',
    name: 'Pedestrian Path',
    description: 'Connecting walkways and promenades with customizable width, length, and stone pavers.',
    icon: '🛤️',
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
  },
  {
    type: 'Benches',
    category: 'landscape',
    name: 'Park Benches',
    description: 'Park guest seating benches with polished wooden slats and cast iron frames.',
    icon: '🪑',
    badgeColor: 'bg-stone-900 text-stone-300 border-stone-700',
  },
  {
    type: 'Visitor Crowds',
    category: 'landscape',
    name: 'Visitor Crowds',
    description: 'Dozens of animated walking park guests strolling along promenades with natural walking strides.',
    icon: '👥',
    badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
  },

  // 5. Infrastructure
  {
    type: 'Parking Area',
    category: 'infrastructure',
    name: 'Parking Facility',
    description: 'Asphalt parking lot with painted stall bays, parked 3D vehicles, and light poles.',
    icon: '🚗',
    badgeColor: 'bg-slate-900 text-slate-300 border-slate-700',
  },
  {
    type: 'Decorative Lighting',
    category: 'infrastructure',
    name: 'Decorative Lighting',
    description: 'Themed Victorian lampposts with glowing lantern heads and dynamic scene light source.',
    icon: '💡',
    badgeColor: 'bg-yellow-950 text-yellow-300 border-yellow-800',
  },
];

interface Props {
  onSelect: (type: AttractionType) => void;
  onClose: () => void;
}

export default function AddToParkPanel({ onSelect, onClose }: Props) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'rides', label: 'Rides' },
    { id: 'water', label: 'Water' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'landscape', label: 'Gardens & Landscape' },
    { id: 'infrastructure', label: 'Infrastructure' },
  ];

  const filteredItems = PALETTE_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="bg-purple-600/20 text-purple-400 p-2 rounded-xl border border-purple-500/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Add Attraction to Park</h3>
              <p className="text-xs text-slate-400">
                Select an attraction or facility to instantiate in the 3D scene
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

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search roller coasters, water slides, restaurants, gates, fountains, lighting…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
                  activeCategory === c.id
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid List */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.name}
              onClick={() => {
                onSelect(item.type);
                onClose();
              }}
              className="bg-slate-950/70 border border-slate-800 hover:border-purple-500/80 hover:bg-slate-800/40 p-3.5 rounded-2xl cursor-pointer transition flex items-start gap-3 group"
            >
              <div className="text-3xl p-2 bg-slate-900 rounded-xl border border-slate-800 group-hover:scale-110 transition flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-xs text-white group-hover:text-purple-300 transition truncate">
                    {item.name}
                  </h4>
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${item.badgeColor}`}
                  >
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
