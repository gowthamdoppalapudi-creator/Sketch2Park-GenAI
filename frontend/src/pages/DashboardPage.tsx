import React, { useEffect, useState } from 'react';
import { Plus, Eye, Layers, CheckCircle, Clock, Sparkles, Mountain } from 'lucide-react';
import { projectApi } from '../api';
import { useAuth } from '../store/AuthContext';
import type { AttractionProject } from '../types';
import {
  createInitialParkScene,
  generateAIParkLayoutFromPrompt,
  createRealisticMegaPark,
  type ParkLayoutType,
} from '../types/parkScene';

interface Props {
  onSelectProject: (id: number) => void;
}

export default function DashboardPage({ onSelectProject }: Props) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<AttractionProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [designChoice, setDesignChoice] = useState<'full_park' | 'single_attraction' | 'custom_architecture'>('full_park');
  const [parkLayout, setParkLayout] = useState<ParkLayoutType>('realistic_mega_park');
  const [aiPrompt, setAiPrompt] = useState('');
  const [singleRideType, setSingleRideType] = useState('Roller Coaster');
  const [createForm, setCreateForm] = useState({ title: '', description: '' });

  const handleQuickLaunchRealisticMegaPark = async () => {
    setCreating(true);
    try {
      const megaScene = createRealisticMegaPark();
      const p = await projectApi.create({
        title: `Mega Theme Park Resort`,
        attraction_type: 'Realistic Mega Theme Park',
        description:
          'Complete 3D amusement park generated from reference image composition: Central Fantasy Castle, surrounding lake, dual roller coasters, giant Ferris wheel, mountain adventure zone, Wonderla water park, and animated guest crowds.',
        scene_data: JSON.stringify(megaScene),
      });
      setProjects((prev) => [p, ...prev]);
      onSelectProject(p.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    projectApi.list().then(setProjects).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      let attractionTypeLabel = 'Full Theme Park';
      let sceneData;

      if (aiPrompt.trim()) {
        attractionTypeLabel = 'AI GenAI Theme Park';
        sceneData = generateAIParkLayoutFromPrompt(aiPrompt.trim());
      } else if (designChoice === 'full_park') {
        const layoutLabels: Record<string, string> = {
          realistic_mega_park: 'Realistic Mega Theme Park (Reference Image)',
          wonderla_park: 'Wonderla Mega Park',
          futuristic_cyber: 'Futuristic Cyberpark',
          fantasy_kingdom: 'Fantasy Kingdom',
          water_paradise: 'Water Paradise Resort',
          tropical_adventure: 'Tropical Adventure Island',
          empty_site: 'Full Theme Park',
        };
        attractionTypeLabel = layoutLabels[parkLayout] || 'Realistic Mega Theme Park';
        sceneData = createInitialParkScene('Full Theme Park', parkLayout);
      } else if (designChoice === 'custom_architecture') {
        attractionTypeLabel = 'Custom Architecture';
        sceneData = createInitialParkScene('Custom Architecture');
      } else {
        attractionTypeLabel = singleRideType;
        sceneData = createInitialParkScene(singleRideType);
      }

      const p = await projectApi.create({
        title: createForm.title,
        attraction_type: attractionTypeLabel,
        description: createForm.description || aiPrompt || undefined,
        scene_data: JSON.stringify(sceneData),
      });

      setProjects(prev => [p, ...prev]);
      setShowCreate(false);
      setCreateForm({ title: '', description: '' });
      setAiPrompt('');
      onSelectProject(p.id);
    } catch (err: any) {
      setError(err.message);
    } finally { setCreating(false); }
  };

  const singleRideTypes = [
    'Roller Coaster',
    'Ferris Wheel',
    'Carousel',
    'Drop Tower',
    'Swing Ride',
    'Bumper Cars',
    'Kids Attraction',
    'Water Ride',
  ];

  const statusColor: Record<string, string> = {
    approved: 'text-emerald-400 bg-emerald-900/30 border-emerald-700',
    submitted_for_review: 'text-yellow-400 bg-yellow-900/30 border-yellow-700',
    changes_requested: 'text-orange-400 bg-orange-900/30 border-orange-700',
    draft: 'text-slate-400 bg-slate-800 border-slate-600',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Project Dashboard</h2>
            <p className="text-slate-400 text-sm">
              {user?.role === 'reviewer' ? 'Projects assigned for your review' : 'Your attraction design projects'}
            </p>
          </div>
          {(user?.role === 'designer' || user?.role === 'admin') && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
          )}
        </div>

        {/* HERO TARGET CARD: GENERATE REALISTIC MEGA THEME PARK */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-950/80 via-rose-950/60 to-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>REFERENCE IMAGE TARGET — MEGA PARK</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Transform Sketch2Park into a Realistic 3D Mega Theme Park
            </h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Generate a complete, connected 3D amusement park inspired by the reference aerial composition: Central Fantasy Castle surrounded by a lake and bridges, towering red steel looping coaster, timber wooden coaster, skyline Ferris wheel, Big Thunder rocky mountain adventure zone, Wonderla water park, and animated guest crowds.
            </p>
          </div>
          <button
            onClick={handleQuickLaunchRealisticMegaPark}
            disabled={creating}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white rounded-2xl text-xs md:text-sm font-black transition shadow-xl shadow-rose-600/40 border border-amber-300/50 whitespace-nowrap flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Sparkles className="w-4 h-4 text-yellow-200 animate-spin" />
            <span>GENERATE REALISTIC MEGA THEME PARK</span>
          </button>
        </div>

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Create New Project</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-semibold">Project Title *</label>
                  <input
                    required
                    value={createForm.title}
                    onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. WonderWave Adventure Park"
                    className="w-full bg-slate-950 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* 1. What do you want to design? */}
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5 font-semibold">
                    What do you want to design? *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDesignChoice('full_park')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        designChoice === 'full_park'
                          ? 'bg-purple-600/20 border-purple-500 text-white font-bold shadow-md shadow-purple-600/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-base block mb-0.5">🎡</span>
                      <span className="text-xs font-semibold block leading-tight">Full Theme Park</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 opacity-80 leading-tight">
                        Shared park scene
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDesignChoice('single_attraction')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        designChoice === 'single_attraction'
                          ? 'bg-purple-600/20 border-purple-500 text-white font-bold shadow-md shadow-purple-600/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-base block mb-0.5">🎢</span>
                      <span className="text-xs font-semibold block leading-tight">Single Attraction</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 opacity-80 leading-tight">
                        Individual ride editor
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDesignChoice('custom_architecture')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        designChoice === 'custom_architecture'
                          ? 'bg-purple-600/20 border-purple-500 text-white font-bold shadow-md shadow-purple-600/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-base block mb-0.5">🏛️</span>
                      <span className="text-xs font-semibold block leading-tight">Custom Architecture</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 opacity-80 leading-tight">
                        Building designer
                      </span>
                    </button>
                  </div>
                </div>

                {/* Natural Language AI Prompt Generator (Optional) */}
                <div className="bg-purple-950/30 border border-purple-500/30 p-3 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>AI Natural-Language Park Generator (Optional)</span>
                  </div>
                  <input
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    placeholder="e.g. Design a large Wonderla-style amusement park containing multiple roller coasters, water rides, restaurants, gardens, entrance gates, parking..."
                    className="w-full bg-slate-950 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Describe any theme park; AI will synthesize and zone the entire 3D layout automatically.
                  </span>
                </div>

                {/* 2. When Full Theme Park: Starting Layout options */}
                {!aiPrompt && designChoice === 'full_park' && (
                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-2">
                    <label className="block text-xs text-purple-300 font-semibold">
                      Starting Theme Park Layout *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'realistic_mega_park', label: '👑 Realistic Mega Park', desc: 'Reference image: Castle, Lake, Dual Coasters, Ferris Wheel, Mountain & Waterpark' },
                        { id: 'wonderla_park', label: '🎡 Wonderla Mega Park', desc: 'Coasters, water rides, swing, bumper cars, gates & parking' },
                        { id: 'futuristic_cyber', label: '🚀 Cyberpark 2099', desc: 'Neon hyper coasters, cyber portal & anti-gravity tower' },
                        { id: 'fantasy_kingdom', label: '🏰 Fantasy Kingdom', desc: 'Castle gate, dragon coaster, royal carousel & gardens' },
                        { id: 'water_paradise', label: '🌊 Water Paradise', desc: 'Tidal wave pool, slide flumes & lazy river' },
                        { id: 'tropical_adventure', label: '🌴 Tropical Island', desc: 'Lagoon, bridge, ferris wheel & palm groves' },
                        { id: 'empty_site', label: '🟩 Empty Masterplan', desc: 'Blank terrain to design freely from scratch' },
                      ].map(layout => (
                        <button
                          key={layout.id}
                          type="button"
                          onClick={() => setParkLayout(layout.id as ParkLayoutType)}
                          className={`p-2.5 rounded-xl border text-left transition ${
                            parkLayout === layout.id
                              ? 'bg-purple-600 border-purple-400 text-white font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="text-xs font-bold block">{layout.label}</span>
                          <span className="text-[10px] text-slate-300 block leading-tight mt-1 opacity-80">
                            {layout.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Single Ride selector */}
                {designChoice === 'single_attraction' && (
                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-semibold">Select Ride Type *</label>
                    <select
                      value={singleRideType}
                      onChange={e => setSingleRideType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500"
                    >
                      {singleRideTypes.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-semibold">Description</label>
                  <textarea
                    value={createForm.description}
                    onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    placeholder="Describe the park concept..."
                    className="w-full bg-slate-950 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 shadow-lg shadow-purple-600/30"
                  >
                    {creating ? 'Creating…' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <Sparkles className="w-10 h-10 text-purple-400 animate-pulse mx-auto mb-3" />
            <p className="text-slate-400">Loading projects…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && projects.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-700 rounded-2xl">
            <Mountain className="w-14 h-14 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No projects yet</h3>
            <p className="text-slate-500 text-sm mb-6">Create your first attraction design project to get started.</p>
            {(user?.role === 'designer' || user?.role === 'admin') && (
              <button onClick={() => setShowCreate(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition">
                + Create Project
              </button>
            )}
          </div>
        )}

        {/* Project grid */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="bg-slate-900 border border-slate-700 hover:border-purple-600 rounded-2xl p-5 cursor-pointer group transition-all hover:shadow-xl hover:shadow-purple-900/20"
              >
                {/* Type badge */}
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs bg-purple-900/60 text-purple-300 border border-purple-700 px-2.5 py-1 rounded-full font-medium">
                    {project.attraction_type}
                  </span>
                  {project.approved_render_id && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> Approved
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mb-1 group-hover:text-purple-300 transition-colors line-clamp-1">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="text-slate-400 text-xs line-clamp-2 mb-4">{project.description}</p>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> {project.sketches_count} sketch{project.sketches_count !== 1 ? 'es' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> {project.renders_count} render{project.renders_count !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Owner / reviewer info */}
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    <span className="text-slate-400">{project.owner.full_name || project.owner.username}</span>
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
