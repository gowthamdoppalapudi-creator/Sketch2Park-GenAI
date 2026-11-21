import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  FileText,
  RotateCcw,
  Clock,
  Sparkles,
} from 'lucide-react';
import ImageComparisonSlider from '../components/ImageComparisonSlider';
import ConceptSheetModal from '../components/ConceptSheet';
import { reviewApi, imageUrl } from '../api';
import { useAuth } from '../store/AuthContext';
import type { Render, Review } from '../types';

interface Props {
  renderId: number;
  onBack: () => void;
  onStartRevision: (sourceRenderId: number, previousPrompt: string) => void;
}

export default function ReviewerWorkspacePage({
  renderId,
  onBack,
  onStartRevision,
}: Props) {
  const { user } = useAuth();
  const [render, setRender] = useState<Render | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConceptSheet, setShowConceptSheet] = useState(false);

  const isReviewerOrAdmin = user?.role === 'reviewer' || user?.role === 'admin';
  const isDesignerOrAdmin = user?.role === 'designer' || user?.role === 'admin';

  const loadData = () => {
    setLoading(true);
    reviewApi
      .getRender(renderId)
      .then(setRender)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [renderId]);

  const handleDecision = async (decision: 'approved' | 'changes_requested' | 'rejected') => {
    if (!comment.trim()) {
      alert('Please enter a review comment explaining your decision.');
      return;
    }

    setSubmitting(true);
    try {
      await reviewApi.submitDecision(renderId, decision, comment);
      setComment('');
      loadData();
    } catch (e: any) {
      alert(e.message || 'Error submitting review decision');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <Sparkles className="w-8 h-8 text-purple-500 animate-spin mr-3" />
        Loading render review details…
      </div>
    );
  }

  if (error || !render) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        <button onClick={onBack} className="text-slate-400 hover:text-white flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="bg-red-950/50 border border-red-700 text-red-300 p-4 rounded-xl">
          {error || 'Render not found'}
        </div>
      </div>
    );
  }

  const genReq = (render as any).generation_request;
  const sketch = genReq?.sketch;
  const sketchCondFilename = sketch?.conditioning_file_path?.split(/[\\/]/).pop();
  const sketchCondUrl = sketchCondFilename ? imageUrl(`/api/files/conditioning/${sketchCondFilename}`) : '';
  const renderImageUrl = imageUrl(`/api/files/renders/${render.image_filename}`);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">Reviewer Workspace</h1>
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">
                  Render #{render.id}
                </span>
                <span
                  className={`text-xs px-3 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    render.status === 'approved'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-600'
                      : render.status === 'changes_requested'
                      ? 'bg-orange-950 text-orange-400 border border-orange-600'
                      : render.status === 'rejected'
                      ? 'bg-red-950 text-red-400 border border-red-600'
                      : 'bg-yellow-950 text-yellow-400 border border-yellow-600'
                  }`}
                >
                  {render.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect concept image, compare against spatial sketch lines, and record official review decision.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowConceptSheet(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/30 transition"
          >
            <FileText className="w-4 h-4" /> Concept Sheet
          </button>
        </div>

        {/* Visual Inspection & Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Visual Comparison Slider (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <ImageComparisonSlider
              beforeImage={sketchCondUrl || renderImageUrl}
              afterImage={renderImageUrl}
              beforeLabel="Spatial Conditioning Edges"
              afterLabel={`Concept Render #${render.id}`}
              beforeSub={sketch ? `Sketch: ${sketch.original_filename}` : undefined}
              afterSub={`Seed: ${render.seed} | Created: ${new Date(render.created_at).toLocaleTimeString()}`}
            />

            {/* Prompt Specification */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Prompt Used for This Render
              </span>
              <p className="text-xs font-mono text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                &ldquo;{genReq?.prompt}&rdquo;
              </p>
            </div>
          </div>

          {/* Right Column: Review Decisions & Comment Thread (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Review Decision Action Card */}
            {isReviewerOrAdmin ? (
              <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Submit Formal Review Decision
                  </span>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    Reviewer Feedback / Comments *
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter actionable design feedback, comments on lighting, atmosphere, loop geometry, or station detailing..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleDecision('approved')}
                    disabled={submitting}
                    className="flex flex-col items-center justify-center gap-1 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white p-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-900/30"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleDecision('changes_requested')}
                    disabled={submitting}
                    className="flex flex-col items-center justify-center gap-1 bg-orange-700 hover:bg-orange-600 disabled:opacity-50 text-white p-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-orange-900/30"
                  >
                    <AlertCircle className="w-4 h-4" /> Request Changes
                  </button>
                  <button
                    onClick={() => handleDecision('rejected')}
                    disabled={submitting}
                    className="flex flex-col items-center justify-center gap-1 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white p-2.5 rounded-xl text-xs font-bold transition"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ) : (
              /* Notice for Designers */
              <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Designer Revision Action
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If changes were requested by the reviewer, you can spawn a new generation request starting from this render&apos;s prompt and settings.
                </p>
                <button
                  onClick={() => onStartRevision(render.id, genReq?.prompt || '')}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <RotateCcw className="w-4 h-4" /> Create Revision From Render #{render.id}
                </button>
              </div>
            )}

            {/* If Changes Were Requested, also show Revision button to Designer/Admin */}
            {render.status === 'changes_requested' && isDesignerOrAdmin && (
              <div className="bg-orange-950/40 border border-orange-700 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-orange-300 text-xs font-bold mb-2">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  Reviewer Requested Changes
                </div>
                <p className="text-xs text-slate-300 mb-3">
                  Start a new generation request pre-populated from this render. The system keeps previous renders and review history intact.
                </p>
                <button
                  onClick={() => onStartRevision(render.id, genReq?.prompt || '')}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <RotateCcw className="w-4 h-4" /> Revise Concept & Respond
                </button>
              </div>
            )}

            {/* Review History Thread */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Review History ({render.reviews?.length || 0})
                </span>
                <Clock className="w-3.5 h-3.5 text-slate-500" />
              </div>

              {!render.reviews || render.reviews.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No review decisions recorded on this render yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {render.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          {rev.reviewer?.full_name || rev.reviewer?.username}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            rev.decision === 'approved'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : rev.decision === 'changes_requested'
                              ? 'bg-orange-950 text-orange-400 border border-orange-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}
                        >
                          {rev.decision.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 italic">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                      <span className="text-[10px] text-slate-500 block">
                        {new Date(rev.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Concept Sheet Modal */}
      {showConceptSheet && (
        <ConceptSheetModal
          renderId={render.id}
          onClose={() => setShowConceptSheet(false)}
        />
      )}
    </div>
  );
}
