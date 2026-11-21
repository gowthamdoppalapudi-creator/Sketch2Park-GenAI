import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Upload,
  Sparkles,
  Layers,
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  FileText,
  UserPlus,
  Trash2,
  Sliders,
  Box,
} from 'lucide-react';
import { projectApi, authApi, imageUrl } from '../api';
import { useAuth } from '../store/AuthContext';
import ConceptSheetModal from '../components/ConceptSheet';
import Park3DDesigner from '../components/3d/Park3DDesigner';
import type { ProjectDetail, Sketch, Render, User } from '../types';

interface Props {
  projectId: number;
  onBack: () => void;
  onUploadSketch: () => void;
  onGoToGenerationStudio: (sketch: Sketch) => void;
  onGoToReview: (renderId: number) => void;
  onGoToGenerationStudioWithSketch?: (sketch: Sketch, suggestedPrompt?: string) => void;
}

export default function ProjectWorkspacePage({
  projectId,
  onBack,
  onUploadSketch,
  onGoToGenerationStudio,
  onGoToReview,
  onGoToGenerationStudioWithSketch,
}: Props) {
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allReviewers, setAllReviewers] = useState<User[]>([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState<number | null>(null);
  const [conceptSheetRenderId, setConceptSheetRenderId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'3d_designer' | 'sketches_hub'>('3d_designer');

  const isOwnerOrAdmin = user?.role === 'admin' || user?.id === project?.owner_id;

  const loadProject = () => {
    setLoading(true);
    projectApi
      .get(projectId)
      .then(setProject)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProject();
    authApi.getReviewers().then(setAllReviewers).catch(console.error);
  }, [projectId]);

  const handleAssignReviewer = async () => {
    if (!selectedReviewerId || !project) return;
    try {
      await projectApi.assignReviewer(project.id, selectedReviewerId);
      loadProject();
    } catch (e: any) {
      alert(e.message || 'Failed to assign reviewer');
    }
  };

  const handleRemoveReviewer = async (reviewerId: number) => {
    if (!project) return;
    try {
      await projectApi.removeReviewer(project.id, reviewerId);
      loadProject();
    } catch (e: any) {
      alert(e.message || 'Failed to remove reviewer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <Sparkles className="w-8 h-8 text-purple-500 animate-spin mr-3" />
        Loading attraction project details…
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        <button onClick={onBack} className="text-slate-400 hover:text-white flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="bg-red-950/50 border border-red-700 text-red-300 p-4 rounded-xl">
          {error || 'Project not found or access denied.'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Subheader with Tab Switcher */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">{project.title}</span>
            <span className="text-[10px] bg-purple-900/60 text-purple-300 border border-purple-700/60 px-2 py-0.5 rounded-full font-medium">
              {project.attraction_type}
            </span>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('3d_designer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === '3d_designer'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" /> 3D Park Designer
          </button>
          <button
            onClick={() => setActiveTab('sketches_hub')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'sketches_hub'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Sketches &amp; Reviews ({project.sketches?.length || 0})
          </button>
        </div>

        {/* Action Button */}
        <div>
          {isOwnerOrAdmin && (
            <button
              onClick={onUploadSketch}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Sketch
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: 3D Park Designer */}
      {activeTab === '3d_designer' && (
        <div className="flex-1 h-full">
          <Park3DDesigner
            projectId={project.id}
            projectTitle={project.title}
            initialAttractionType={project.attraction_type}
            initialSceneJson={project.scene_data}
            onGoToGenerationStudioWithSketch={onGoToGenerationStudioWithSketch}
            onBack={onBack}
          />
        </div>
      )}

      {/* Tab 2: Sketches, Generation History & Review Hub */}
      {activeTab === 'sketches_hub' && (
        <div className="max-w-6xl mx-auto w-full p-6 space-y-6">

        {/* Team & Reviewers Management */}
        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Assigned Project Reviewers & Stakeholders
            </span>
            <span className="text-xs text-slate-500">
              Lead Designer: <strong className="text-slate-300">{project.owner?.full_name || project.owner?.username}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {project.reviewers && project.reviewers.length > 0 ? (
              project.reviewers.map((pr) => (
                <div
                  key={pr.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs"
                >
                  <span className="font-semibold text-slate-200">
                    {pr.reviewer.full_name || pr.reviewer.username}
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded">
                    Reviewer
                  </span>
                  {isOwnerOrAdmin && (
                    <button
                      onClick={() => handleRemoveReviewer(pr.reviewer.id)}
                      className="text-slate-500 hover:text-red-400 ml-1 transition"
                      title="Remove Reviewer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No reviewers assigned yet.</span>
            )}

            {/* Add Reviewer Selector */}
            {isOwnerOrAdmin && (
              <div className="flex items-center gap-2 ml-auto">
                <select
                  onChange={(e) => setSelectedReviewerId(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500"
                  defaultValue=""
                >
                  <option value="" disabled>Select reviewer to assign…</option>
                  {allReviewers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.full_name || r.username} ({r.role})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignReviewer}
                  disabled={!selectedReviewerId}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 border border-slate-700 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Assign
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Project Sketches Section */}
        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                Attraction Sketches ({project.sketches?.length || 0})
              </h3>
            </div>
            {isOwnerOrAdmin && (
              <button
                onClick={onUploadSketch}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                + Add Sketch
              </button>
            )}
          </div>

          {!project.sketches || project.sketches.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No sketches uploaded yet. Upload a hand-drawn sketch to start.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {project.sketches.map((sketch) => {
                const condFilename = sketch.conditioning_file_path.split(/[\\/]/).pop();
                const condUrl = imageUrl(`/api/files/conditioning/${condFilename}`);
                const origFilename = sketch.file_path.split(/[\\/]/).pop();
                const origUrl = imageUrl(`/api/files/sketches/${origFilename}`);

                return (
                  <div
                    key={sketch.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <span className="text-[10px] text-slate-500 block mb-1">Sketch</span>
                          <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                            <img src={origUrl} alt="Sketch" className="max-h-full max-w-full object-contain" />
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-purple-400 block mb-1">Canny Conditioning</span>
                          <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-purple-900/50">
                            <img src={condUrl} alt="Canny" className="max-h-full max-w-full object-contain" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-white truncate">{sketch.original_filename}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        L:{sketch.canny_low_threshold} / H:{sketch.canny_high_threshold} | {sketch.width}x{sketch.height}
                      </p>
                    </div>

                    <button
                      onClick={() => onGoToGenerationStudio(sketch)}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Open in Generation Studio
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Generation & Revision History Timeline */}
        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                Generation & Version Revision History ({project.generation_requests?.length || 0})
              </h3>
            </div>
          </div>

          {!project.generation_requests || project.generation_requests.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              No generation requests run yet for this project.
            </p>
          ) : (
            <div className="space-y-4">
              {project.generation_requests.map((genReq, idx) => (
                <div
                  key={genReq.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3"
                >
                  {/* Request Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-300 font-mono">
                        Request #{genReq.id}
                      </span>
                      {genReq.source_render_id && (
                        <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-700 px-2 py-0.5 rounded-full font-semibold">
                          Revision of Render #{genReq.source_render_id}
                        </span>
                      )}
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          genReq.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-400'
                            : genReq.status === 'failed'
                            ? 'bg-red-950 text-red-400'
                            : 'bg-yellow-950 text-yellow-400'
                        }`}
                      >
                        {genReq.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {new Date(genReq.created_at).toLocaleString()} | {genReq.elapsed_time_seconds}s
                    </span>
                  </div>

                  {/* Prompt */}
                  <p className="text-xs text-slate-300 font-mono bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                    &ldquo;{genReq.prompt}&rdquo;
                  </p>

                  {/* Generated Renders Thumbnails */}
                  {genReq.renders && genReq.renders.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                        Render Outputs ({genReq.renders.length}):
                      </span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {genReq.renders.map((render) => (
                          <div
                            key={render.id}
                            onClick={() => onGoToReview(render.id)}
                            className="bg-slate-900 border border-slate-800 hover:border-purple-600 rounded-xl p-2 cursor-pointer transition group"
                          >
                            <div className="aspect-square rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center mb-2">
                              <img
                                src={imageUrl(`/api/files/renders/${render.image_filename}`)}
                                alt={`Render ${render.id}`}
                                className="max-h-full max-w-full object-contain group-hover:scale-105 transition"
                              />
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-mono text-slate-400">#{render.id}</span>
                              <span
                                className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                                  render.status === 'approved'
                                    ? 'bg-emerald-950 text-emerald-400'
                                    : render.status === 'changes_requested'
                                    ? 'bg-orange-950 text-orange-400'
                                    : render.status === 'submitted_for_review'
                                    ? 'bg-yellow-950 text-yellow-400'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {render.status.replace('_', ' ')}
                              </span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConceptSheetRenderId(render.id);
                              }}
                              className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 rounded text-[10px] font-medium flex items-center justify-center gap-1 transition"
                            >
                              <FileText className="w-3 h-3 text-purple-400" /> Concept Sheet
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      )}

      {/* Concept Sheet Modal */}
      {conceptSheetRenderId && (
        <ConceptSheetModal
          renderId={conceptSheetRenderId}
          onClose={() => setConceptSheetRenderId(null)}
        />
      )}
    </div>
  );
}
