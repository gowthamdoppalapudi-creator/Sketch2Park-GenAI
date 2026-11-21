import React, { useState, useEffect } from 'react';
import { Sparkles, Palette, Clock, CloudSun, Trees, Layers, RefreshCw } from 'lucide-react';

interface Props {
  initialPrompt?: string;
  initialNegativePrompt?: string;
  initialTheme?: string;
  initialMaterials?: string;
  initialTimeOfDay?: string;
  initialWeather?: string;
  initialSurroundings?: string;
  onPromptChange: (data: {
    finalPrompt: string;
    negativePrompt: string;
    theme: string;
    materials: string;
    timeOfDay: string;
    weather: string;
    surroundings: string;
  }) => void;
}

const THEME_PRESETS = [
  'Rustic Adventure & Frontier',
  'Futuristic Sci-Fi Spaceport',
  'Mystical Enchanted Fantasy',
  'Industrial Steampunk Foundry',
  'Tropical Jungle Expedition',
  'Cyberpunk Neon Metropolis',
  'Mediterranean Coastal Harbor',
  'Gothic Haunted Highlands',
];

const MATERIAL_PRESETS = [
  'Red Tubular Steel & Weathered Cedar Timber',
  'Brushed Stainless Steel & Polished Glass',
  'Rustic Handcrafted Wood & Iron Rivets',
  'Copper Pipes, Brass Gears & Dark Brick',
  'Bamboo, Thatch Roofing & Carved Stone',
  'Matte Black Carbon Fiber & Holographic Trim',
];

const TIME_PRESETS = [
  'Sunset / Golden Hour Glow',
  'High Noon Brilliant Sunlight',
  'Twilight Dusk with Dramatic Horizon',
  'Deep Night with Vibrant Lanterns & Floodlights',
  'Early Dawn Crisp Morning Light',
];

const WEATHER_PRESETS = [
  'Crisp & Crystal Clear Sky',
  'Soft Atmospheric Golden Haze',
  'Gentle Mountain Mist & Low Fog',
  'Dramatic Sunset Cloud Formations',
  'Overcast Soft Diffused Light',
];

const SURROUNDINGS_PRESETS = [
  'Lush Evergreen Pines & Mountain Valley',
  'Sparkling Lagoon & Tropical Palm Trees',
  'Dramatic Rocky Cliff & Roaring Waterfall',
  'Dense Deciduous Forest in Autumn Colors',
  'Themed Plaza with Pedestrian Pathways',
];

export default function PromptBuilder({
  initialPrompt = '',
  initialNegativePrompt = 'blurry, low quality, distorted, extra tracks, deformed, chaotic, bad geometry',
  initialTheme = '',
  initialMaterials = '',
  initialTimeOfDay = '',
  initialWeather = '',
  initialSurroundings = '',
  onPromptChange,
}: Props) {
  const [description, setDescription] = useState(
    initialPrompt ||
    'Photorealistic theme park concept of a red steel roller coaster with a large central loop, a wooden boarding station in the foreground, trees around the track, and warm sunset lighting.'
  );
  const [negativePrompt, setNegativePrompt] = useState(initialNegativePrompt);
  const [theme, setTheme] = useState(initialTheme);
  const [materials, setMaterials] = useState(initialMaterials);
  const [timeOfDay, setTimeOfDay] = useState(initialTimeOfDay);
  const [weather, setWeather] = useState(initialWeather);
  const [surroundings, setSurroundings] = useState(initialSurroundings);
  const [finalPrompt, setFinalPrompt] = useState(description);
  const [isEditingFinalDirectly, setIsEditingFinalDirectly] = useState(false);

  // Re-synthesize final prompt when choices change, unless user is directly typing into final prompt
  useEffect(() => {
    if (isEditingFinalDirectly) return;

    let combined = description.trim();
    const additions: string[] = [];

    if (theme) additions.push(`theme: ${theme}`);
    if (materials) additions.push(`crafted with ${materials}`);
    if (timeOfDay) additions.push(`captured during ${timeOfDay}`);
    if (weather) additions.push(`under ${weather}`);
    if (surroundings) additions.push(`surrounded by ${surroundings}`);

    if (additions.length > 0 && !combined.endsWith('.')) {
      combined += '.';
    }
    if (additions.length > 0) {
      combined += ' ' + additions.join(', ') + '.';
    }

    setFinalPrompt(combined);
    onPromptChange({
      finalPrompt: combined,
      negativePrompt,
      theme,
      materials,
      timeOfDay,
      weather,
      surroundings,
    });
  }, [description, theme, materials, timeOfDay, weather, surroundings, negativePrompt, isEditingFinalDirectly]);

  const handleFinalPromptDirectEdit = (val: string) => {
    setIsEditingFinalDirectly(true);
    setFinalPrompt(val);
    onPromptChange({
      finalPrompt: val,
      negativePrompt,
      theme,
      materials,
      timeOfDay,
      weather,
      surroundings,
    });
  };

  const handleResetToBuilder = () => {
    setIsEditingFinalDirectly(false);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white text-base">Concept Prompt Studio</h3>
        </div>
        <span className="text-xs bg-purple-900/50 text-purple-300 px-2.5 py-1 rounded-full border border-purple-700">
          Spatial Conditioning Active
        </span>
      </div>

      {/* Primary Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Core Attraction Description *
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => {
            setIsEditingFinalDirectly(false);
            setDescription(e.target.value);
          }}
          placeholder="Describe your ride layout, main features, and focal points..."
          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition resize-none"
        />
        <p className="text-xs text-slate-500 mt-1">
          Tip: Mention key sketch structures (e.g., &quot;large central loop&quot;, &quot;wooden boarding station in foreground&quot;).
        </p>
      </div>

      {/* Thematic Builders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Theme Preset */}
        <div>
          <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Palette className="w-3.5 h-3.5 text-blue-400" /> Themed Style
          </label>
          <select
            value={theme}
            onChange={(e) => {
              setIsEditingFinalDirectly(false);
              setTheme(e.target.value);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="">Custom / None</option>
            {THEME_PRESETS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Materials */}
        <div>
          <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" /> Materials & Track Construction
          </label>
          <select
            value={materials}
            onChange={(e) => {
              setIsEditingFinalDirectly(false);
              setMaterials(e.target.value);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="">Custom / None</option>
            {MATERIAL_PRESETS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Time of Day */}
        <div>
          <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-orange-400" /> Time of Day & Lighting
          </label>
          <select
            value={timeOfDay}
            onChange={(e) => {
              setIsEditingFinalDirectly(false);
              setTimeOfDay(e.target.value);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="">Custom / None</option>
            {TIME_PRESETS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Weather & Atmosphere */}
        <div>
          <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <CloudSun className="w-3.5 h-3.5 text-sky-400" /> Weather & Atmosphere
          </label>
          <select
            value={weather}
            onChange={(e) => {
              setIsEditingFinalDirectly(false);
              setWeather(e.target.value);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="">Custom / None</option>
            {WEATHER_PRESETS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Surroundings */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Trees className="w-3.5 h-3.5 text-emerald-400" /> Landscaping & Park Surroundings
          </label>
          <select
            value={surroundings}
            onChange={(e) => {
              setIsEditingFinalDirectly(false);
              setSurroundings(e.target.value);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="">Custom / None</option>
            {SURROUNDINGS_PRESETS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Final Combined Prompt (Inspect & Directly Edit) */}
      <div className="bg-slate-950 rounded-xl p-3.5 border border-purple-900/60">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
            Final Prompt Sent to Diffusion Pipeline
          </span>
          {isEditingFinalDirectly && (
            <button
              onClick={handleResetToBuilder}
              className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300"
            >
              <RefreshCw className="w-3 h-3" /> Re-sync from dropdown choices
            </button>
          )}
        </div>
        <textarea
          rows={3}
          value={finalPrompt}
          onChange={(e) => handleFinalPromptDirectEdit(e.target.value)}
          className="w-full bg-transparent text-sm text-purple-100 focus:outline-none font-mono resize-none leading-relaxed"
        />
      </div>

      {/* Negative Prompt */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
          Negative Prompt (Excluded Artifacts)
        </label>
        <input
          type="text"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
        />
      </div>
    </div>
  );
}
