import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Sliders,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  Layers,
  Cpu,
  Info,
} from 'lucide-react';
import PromptBuilder from '../components/PromptBuilder';
import ImageComparisonSlider from '../components/ImageComparisonSlider';
import { generationApi, reviewApi, imageUrl } from '../api';
import type { Sketch, GenerationRequest, Render, ModelStatusInfo } from '../types';

interface Props {
  sketch: Sketch;
  onBack: () => void;
  onGoToReview: (renderId: number) => void;
  revisionSourceRenderId?: number;
  initialPromptText?: string;
}

export default function GenerationStudioPage({
  sketch,
  onBack,
  onGoToReview,
  revisionSourceRenderId,
  initialPromptText,
}: Props) {
  // Generation parameters
  const [controlnetScale, setControlnetScale] = useState(0.85);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [numSteps, setNumSteps] = useState(25);
  const [numVariations, setNumVariations] = useState(2);
  const [seed, setSeed] = useState(-1);
  const [isSampleDemo, setIsSampleDemo] = useState(false);

  // Prompt state
  const [promptData, setPromptData] = useState({
    finalPrompt: initialPromptText ||
      'Photorealistic theme park concept of a red steel roller coaster with a large central loop, a wooden boarding station in the foreground, trees around the track, and warm sunset lighting.',
    negativePrompt: 'blurry, low quality, distorted, extra tracks, deformed, chaotic, bad geometry',
    theme: '',
    materials: '',
    timeOfDay: '',
    weather: '',
    surroundings: '',
  });

  // Job execution state
  const [activeJobId, setActiveJobId] = useState<number | null>(null);
  const [currentRequest, setCurrentRequest] = useState<GenerationRequest | null>(null);
  const [results, setResults] = useState<Render[]>([]);
  const [selectedRenderForComparison, setSelectedRenderForComparison] = useState<Render | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelStatusInfo | null>(null);
  const [submittingReviewId, setSubmittingReviewId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const pollTimerRef = useRef<number | null>(null);

  // Load model runtime info
  useEffect(() => {
    generationApi.getModelStatus().then(setModelInfo).catch(console.error);
  }, []);

  // Polling for background job status transitions
  useEffect(() => {
    if (!activeJobId) return;

    const poll = async () => {
      try {
        const req = await generationApi.getStatus(activeJobId);
        setCurrentRequest(req);
        if (req.renders && req.renders.length > 0) {
          setResults(req.renders);
          if (!selectedRenderForComparison && req.renders[0]) {
            setSelectedRenderForComparison(req.renders[0]);
          }
        }

        if (req.status === 'completed') {
          setActiveJobId(null);
        } else if (req.status === 'failed') {
          setActiveJobId(null);
          setErrorMsg(req.error_message || 'Generation failed. You may retry or explore Sample Demo mode.');
        }
      } catch (err: any) {
        console.error('Job polling error:', err);
      }
    };

    pollTimerRef.current = window.setInterval(poll, 1500);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [activeJobId, selectedRenderForComparison]);

  const handleStartGeneration = async () => {
    setErrorMsg(null);
    try {
      const genReq = await generationApi.createRequest({
        sketch_id: sketch.id,
        source_render_id: revisionSourceRenderId,
        prompt: promptData.finalPrompt,
        negative_prompt: promptData.negativePrompt,
        theme: promptData.theme,
        materials: promptData.materials,
        time_of_day: promptData.timeOfDay,
        weather: promptData.weather,
        surroundings: promptData.surroundings,
        controlnet_scale: controlnetScale,
        guidance_scale: guidanceScale,
        num_inference_steps: numSteps,
        num_variations: numVariations,
        base_seed: seed,
        is_sample_demo: isSampleDemo,
      });

      setCurrentRequest(genReq);
      setActiveJobId(genReq.id);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to submit generation request.');
    }
  };

  const handleRetry = async () => {
    if (!currentRequest) return;
    setErrorMsg(null);
    try {
      const newReq = await generationApi.retry(currentRequest.id);
      setCurrentRequest(newReq);
      setActiveJobId(newReq.id);
    } catch (e: any) {
      setErrorMsg(e.message || 'Retry failed.');
    }
  };

  const handleSubmitRenderForReview = async (renderId: number) => {
    setSubmittingReviewId(renderId);
    try {
      const updated = await reviewApi.submitForReview(renderId);
      setResults((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      onGoToReview(renderId);
    } catch (e: any) {
      alert(e.message || 'Submission error');
    } finally {
      setSubmittingReviewId(null);
    }
  };

  const sketchCondFilename = sketch.conditioning_file_path.split(/[\\/]/).pop();
  const sketchCondUrl = imageUrl(`/api/files/conditioning/${sketchCondFilename}`);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Generation Studio
                {revisionSourceRenderId && (
                  <span className="text-xs bg-amber-900/60 text-amber-300 border border-amber-600 px-2.5 py-0.5 rounded-full font-medium">
                    Revision from Render #{revisionSourceRenderId}
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-400">
                Spatial Sketch Guidance Pipeline with ControlNet Canny
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-1 text-xs">
              <button
                onClick={() => setIsSampleDemo(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  !isSampleDemo
                    ? 'bg-purple-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                AI Generation Mode
              </button>
              <button
                onClick={() => setIsSampleDemo(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  isSampleDemo
                    ? 'bg-purple-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Sample Demo (Fast)
              </button>
            </div>
          </div>
        </div>

        {/* Runtime Device & Model Banner */}
        {modelInfo && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                Runtime Device:{' '}
                <strong className="text-slate-200 uppercase">{modelInfo.device}</strong> (
                {modelInfo.device_name}) | Model: {modelInfo.model_controlnet}
              </span>
            </div>
            {isSampleDemo ? (
              <span className="text-amber-400 font-medium">
                Using pre-prepared university demo concept suite
              </span>
            ) : (
              <span className="text-purple-300">
                Real-time Canny spatial sketch guidance enabled
              </span>
            )}
          </div>
        )}

        {/* Error notification with Actionable Message & Retry */}
        {errorMsg && (
          <div className="bg-red-950/60 border border-red-700 text-red-200 rounded-2xl p-4 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Inference Job Warning / Setup Notice</p>
                <p className="text-xs text-red-300 mt-1">{errorMsg}</p>
                <p className="text-xs text-red-400/80 mt-1">
                  Tip: If GPU weights are unavailable, switch to &quot;Sample Demo&quot; mode for smooth university viva demonstration.
                </p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 bg-red-900/80 hover:bg-red-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Job
            </button>
          </div>
        )}

        {/* Main Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Sketch & Parameters (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Sketch Preview Card */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" /> Conditioning Spatial Map
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {sketch.width}x{sketch.height}
                </span>
              </div>
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                <img
                  src={sketchCondUrl}
                  alt="Conditioning Edges"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2 text-center">
                Canny thresholds: L:{sketch.canny_low_threshold} / H:{sketch.canny_high_threshold}
              </p>
            </div>

            {/* Inference Parameters Card */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Generation Parameters
                </span>
              </div>

              {/* Sketch Guidance Strength */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Sketch Guidance Strength</span>
                  <span className="font-mono text-purple-400">{controlnetScale.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.5"
                  step="0.05"
                  value={controlnetScale}
                  onChange={(e) => setControlnetScale(parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Higher = stricter spatial adherence to sketch lines
                </p>
              </div>

              {/* Number of Variations (1 to 3) */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                  <span>Variations</span>
                  <span className="font-mono text-purple-400">{numVariations}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNumVariations(n)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                        numVariations === n
                          ? 'bg-purple-600 text-white border-purple-500 shadow'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {n} {n === 1 ? 'Concept' : 'Concepts'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seed */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Seed (-1 for random)</span>
                  <span className="font-mono text-purple-400">{seed}</span>
                </div>
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(parseInt(e.target.value) || -1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleStartGeneration}
                disabled={!!activeJobId}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm shadow-xl shadow-purple-900/30 flex items-center justify-center gap-2 transition"
              >
                {activeJobId ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Synthesizing Concepts ({currentRequest?.status || 'queued'})…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Generate {numVariations} Concept{numVariations > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Prompt Builder + Live Results (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Prompt Builder */}
            <PromptBuilder
              initialPrompt={initialPromptText || promptData.finalPrompt}
              onPromptChange={setPromptData}
            />

            {/* Results Gallery & Inspection */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <h3 className="font-bold text-white text-base">Generated Concepts Gallery</h3>
                </div>
                {results.length > 0 && (
                  <span className="text-xs text-slate-400">
                    {results.length} output{results.length !== 1 ? 's' : ''} available
                  </span>
                )}
              </div>

              {/* Empty state before generation */}
              {results.length === 0 && !activeJobId && (
                <div className="text-center py-12 text-slate-500">
                  <Sparkles className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm">No concept renders generated yet.</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Click &quot;Generate Concepts&quot; above to run sketch-guided diffusion inference.
                  </p>
                </div>
              )}

              {/* Loading progress placeholder */}
              {activeJobId && (
                <div className="bg-slate-950 border border-purple-900/50 rounded-xl p-6 text-center">
                  <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm font-semibold text-purple-200">
                    Running Diffusion Inference Worker…
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Aligning spatial coaster features to sketch contours.
                  </p>
                </div>
              )}

              {/* Result Cards Grid */}
              {results.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((render) => (
                    <div
                      key={render.id}
                      onClick={() => setSelectedRenderForComparison(render)}
                      className={`bg-slate-950 border rounded-2xl p-4 cursor-pointer transition ${
                        selectedRenderForComparison?.id === render.id
                          ? 'border-purple-500 ring-2 ring-purple-500/30 shadow-lg'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center mb-3">
                        <img
                          src={imageUrl(`/api/files/renders/${render.image_filename}`)}
                          alt={`Render ${render.id}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="font-mono text-slate-400">Render #{render.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            render.status === 'approved'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : render.status === 'submitted_for_review'
                              ? 'bg-yellow-950 text-yellow-300 border border-yellow-700'
                              : render.status === 'changes_requested'
                              ? 'bg-orange-950 text-orange-300 border border-orange-700'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {render.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubmitRenderForReview(render.id);
                          }}
                          disabled={submittingReviewId === render.id}
                          className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                        >
                          {submittingReviewId === render.id ? (
                            'Submitting…'
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" /> Submit to Review
                            </>
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onGoToReview(render.id);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-medium border border-slate-700 transition"
                        >
                          Inspect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Interactive Visual Comparison Slider for the Selected Output */}
              {selectedRenderForComparison && (
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-3">
                    Active Comparison: Sketch vs Render #{selectedRenderForComparison.id}
                  </h4>
                  <ImageComparisonSlider
                    beforeImage={sketchCondUrl}
                    afterImage={imageUrl(`/api/files/renders/${selectedRenderForComparison.image_filename}`)}
                    beforeLabel="Spatial Conditioning Edges"
                    afterLabel={`Render #${selectedRenderForComparison.id}`}
                    beforeSub={`Original contours (L:${sketch.canny_low_threshold}/H:${sketch.canny_high_threshold})`}
                    afterSub={`Seed: ${selectedRenderForComparison.seed} | Guidance: ${controlnetScale}`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
