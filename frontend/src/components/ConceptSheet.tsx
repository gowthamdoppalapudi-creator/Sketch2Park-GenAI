import React, { useState, useEffect } from 'react';
import { Printer, Download, CheckCircle, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { reviewApi, imageUrl } from '../api';
import type { ConceptSheet } from '../types';

interface Props {
  renderId: number;
  onClose: () => void;
}

export default function ConceptSheetModal({ renderId, onClose }: Props) {
  const [data, setData] = useState<ConceptSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reviewApi
      .getConceptSheet(renderId)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [renderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = () => {
    if (!data) return;
    const link = document.createElement('a');
    link.href = imageUrl(data.selected_render_url);
    link.download = `Sketch2Park_${data.project_title.replace(/\s+/g, '_')}_Render_${data.render_id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Action Bar (Hidden when printing) */}
        <div className="print:hidden p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur z-20">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Project
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadImage}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              <Download className="w-4 h-4 text-purple-400" /> Download Render
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/30 transition"
            >
              <Printer className="w-4 h-4" /> Print Concept Sheet
            </button>
          </div>
        </div>

        {/* Loading / Error states */}
        {loading && (
          <div className="p-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading concept sheet…
          </div>
        )}

        {error && (
          <div className="p-8 text-center text-red-400">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            {error}
          </div>
        )}

        {/* Printable Sheet Content */}
        {data && (
          <div className="p-8 space-y-6 text-slate-100 print:text-black print:bg-white print:p-4">
            {/* Header Banner */}
            <div className="border-b-2 border-purple-600/40 pb-5 flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-purple-400 print:text-purple-700">
                  Theme Park Attraction Concept Presentation Sheet
                </span>
                <h1 className="text-3xl font-black text-white print:text-black tracking-tight mt-1">
                  {data.project_title}
                </h1>
                <p className="text-sm text-slate-400 print:text-slate-600 mt-1">
                  Attraction Category: <span className="font-semibold text-slate-200 print:text-black">{data.attraction_type}</span>
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    data.review_status === 'approved'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-600 print:bg-emerald-100 print:text-emerald-900'
                      : data.review_status === 'changes_requested'
                      ? 'bg-orange-950/80 text-orange-400 border border-orange-600 print:bg-orange-100 print:text-orange-900'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {data.review_status === 'approved' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  Status: {data.review_status.replace('_', ' ')}
                </span>
                <p className="text-xs text-slate-500 print:text-slate-500 mt-2 font-mono">
                  {data.version_tag}
                </p>
              </div>
            </div>

            {/* Side-by-side Visuals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Sketch */}
              <div className="bg-slate-950 print:bg-slate-50 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
                <span className="text-xs font-semibold text-slate-400 print:text-slate-600 mb-2 uppercase tracking-wider">
                  Original Designer Sketch (Spatial Guidance)
                </span>
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-800">
                  <img
                    src={imageUrl(data.original_sketch_url)}
                    alt="Original Sketch"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-2">
                  Spatial ControlNet Canny conditioning applied
                </span>
              </div>

              {/* Selected Concept Render */}
              <div className="bg-slate-950 print:bg-slate-50 border-2 border-purple-700/60 rounded-2xl p-4 flex flex-col items-center">
                <span className="text-xs font-semibold text-purple-300 print:text-purple-800 mb-2 uppercase tracking-wider">
                  Approved AI Concept Render
                </span>
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-purple-900/40">
                  <img
                    src={imageUrl(data.selected_render_url)}
                    alt="Concept Render"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <span className="text-[11px] text-purple-300/80 print:text-purple-900 mt-2 font-mono">
                  Seed: {data.seed} | Guidance: {data.controlnet_scale}
                </span>
              </div>
            </div>

            {/* Prompt Specification */}
            <div className="bg-slate-950 print:bg-slate-50 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 print:text-purple-700">
                  Final Prompt Specification
                </span>
                <p className="text-sm font-mono text-slate-200 print:text-black mt-1 leading-relaxed bg-slate-900/50 print:bg-white p-3 rounded-xl border border-slate-800 print:border-slate-300">
                  &ldquo;{data.final_prompt}&rdquo;
                </p>
              </div>

              {data.negative_prompt && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Negative Filtering
                  </span>
                  <p className="text-xs font-mono text-slate-400 print:text-slate-600 mt-0.5">
                    {data.negative_prompt}
                  </p>
                </div>
              )}
            </div>

            {/* Review Decision & History */}
            {data.reviews && data.reviews.length > 0 && (
              <div className="bg-slate-950 print:bg-slate-50 border border-slate-800 rounded-2xl p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-emerald-700">
                  Stakeholder & Creative Reviewer Feedback
                </span>
                <div className="space-y-3 mt-3">
                  {data.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="border-l-2 border-purple-500 pl-3.5 py-1 text-xs text-slate-300 print:text-black"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white print:text-black">
                          {rev.reviewer.full_name || rev.reviewer.username}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          ({new Date(rev.created_at).toLocaleDateString()})
                        </span>
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                          {rev.decision.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="italic text-slate-400 print:text-slate-700">&ldquo;{rev.comment}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Metadata & Verification Sign-Off */}
            <div className="border-t border-slate-800 print:border-slate-300 pt-4 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
              <div>
                <p>Designed by: <strong className="text-slate-300 print:text-black">{data.owner_name}</strong></p>
                <p>Model Architecture: {data.model_name}</p>
              </div>
              <div className="text-right mt-2 md:mt-0">
                <p>Generated: {new Date(data.created_at).toLocaleString()}</p>
                <p className="font-semibold text-purple-400 print:text-purple-700">
                  Sketch2Park Enterprise Concept Sheet — University Project Demo
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
