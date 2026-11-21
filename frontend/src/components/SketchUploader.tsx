import React, { useState, useRef, useCallback } from 'react';
import { Upload, Sliders, Eye, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { sketchApi, imageUrl } from '../api';
import type { Sketch } from '../types';

interface Props {
  projectId: number;
  onSketchReady: (sketch: Sketch) => void;
  onBack: () => void;
}

export default function SketchUploader({ projectId, onSketchReady, onBack }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lowThreshold, setLowThreshold] = useState(100);
  const [highThreshold, setHighThreshold] = useState(200);
  const [uploading, setUploading] = useState(false);
  const [previewingCanny, setPreviewingCanny] = useState(false);
  const [uploadedSketch, setUploadedSketch] = useState<Sketch | null>(null);
  const [cannyUrl, setCannyUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'pick' | 'uploaded'>('pick');
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setError('');
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file) return;
    setError(''); setUploading(true);
    try {
      const sketch = await sketchApi.upload(projectId, file, lowThreshold, highThreshold);
      setUploadedSketch(sketch);
      setCannyUrl(imageUrl(`/api/files/conditioning/${sketch.conditioning_file_path.split(/[\\/]/).pop()}`));
      setStep('uploaded');
    } catch (e: any) {
      setError(e.message);
    } finally { setUploading(false); }
  };

  const handleUpdateCanny = async () => {
    if (!uploadedSketch) return;
    setPreviewingCanny(true); setError('');
    try {
      const res = await sketchApi.previewCanny(uploadedSketch.id, lowThreshold, highThreshold);
      setCannyUrl(imageUrl(res.conditioning_url));
    } catch (e: any) {
      setError(e.message);
    } finally { setPreviewingCanny(false); }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">Sketch Upload & Preprocessing</h2>
          <p className="text-sm text-slate-400">Upload your hand-drawn sketch and tune Canny edge sensitivity</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm mb-5">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {step === 'pick' && (
        <>
          {/* Drop zone */}
          <div
            ref={dragRef}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all mb-5 ${
              dragging ? 'border-purple-500 bg-purple-900/20' : file ? 'border-emerald-600 bg-emerald-900/10' : 'border-slate-600 hover:border-slate-500 bg-slate-800/40'
            }`}
          >
            <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png" className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                <p className="text-emerald-300 font-semibold">{file.name}</p>
                <p className="text-slate-400 text-xs">{(file.size / 1024).toFixed(0)} KB — click to change</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <Upload className="w-12 h-12 text-slate-500" />
                <div>
                  <p className="font-semibold text-slate-300 mb-1">Drop sketch here or click to browse</p>
                  <p className="text-xs">JPG, PNG up to 10MB — phone photos of paper sketches accepted</p>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          {preview && (
            <div className="mb-5 rounded-xl overflow-hidden border border-slate-700 max-h-64 flex justify-center bg-slate-950">
              <img src={preview} alt="Sketch preview" className="max-h-64 object-contain" />
            </div>
          )}

          {/* Canny thresholds */}
          <div className="bg-slate-800 rounded-xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-white">Canny Edge Sensitivity</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Low Threshold: {lowThreshold}</label>
                <input type="range" min="10" max="200" value={lowThreshold}
                  onChange={e => setLowThreshold(Number(e.target.value))}
                  className="w-full accent-purple-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">High Threshold: {highThreshold}</label>
                <input type="range" min="50" max="400" value={highThreshold}
                  onChange={e => setHighThreshold(Number(e.target.value))}
                  className="w-full accent-purple-500" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Lower = more edges captured; Higher = only strong edges</p>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            {uploading
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing…</>
              : <><Upload className="w-4 h-4" /> Upload & Extract Edges</>}
          </button>
        </>
      )}

      {step === 'uploaded' && uploadedSketch && (
        <>
          {/* Side-by-side comparison */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium text-center">Original Sketch</p>
              <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 h-56 flex items-center justify-center">
                {preview && <img src={preview} alt="Original" className="max-h-56 object-contain" />}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium text-center">Canny Conditioning</p>
              <div className="rounded-xl overflow-hidden border border-purple-800 bg-slate-950 h-56 flex items-center justify-center">
                {cannyUrl
                  ? <img src={cannyUrl} alt="Canny edges" className="max-h-56 object-contain" />
                  : <span className="text-slate-500 text-sm">Loading…</span>}
              </div>
            </div>
          </div>

          {/* Adjust thresholds interactively */}
          <div className="bg-slate-800 rounded-xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-white">Adjust Edge Sensitivity</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Low: {lowThreshold}</label>
                <input type="range" min="10" max="200" value={lowThreshold}
                  onChange={e => setLowThreshold(Number(e.target.value))}
                  className="w-full accent-purple-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">High: {highThreshold}</label>
                <input type="range" min="50" max="400" value={highThreshold}
                  onChange={e => setHighThreshold(Number(e.target.value))}
                  className="w-full accent-purple-500" />
              </div>
            </div>
            <button
              onClick={handleUpdateCanny}
              disabled={previewingCanny}
              className="flex items-center gap-2 text-sm text-purple-300 hover:text-white border border-purple-700 hover:bg-purple-800/40 px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {previewingCanny
                ? <><span className="w-3.5 h-3.5 border-2 border-purple-400/40 border-t-purple-400 rounded-full animate-spin" /> Updating…</>
                : <><Eye className="w-4 h-4" /> Preview Edges</>}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setStep('pick'); setFile(null); setPreview(null); setUploadedSketch(null); }}
              className="flex-1 py-3 border border-slate-600 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-800 transition"
            >Upload Different Sketch</button>
            <button
              onClick={() => onSketchReady(uploadedSketch)}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition"
            >Proceed to Generation Studio →</button>
          </div>
        </>
      )}
    </div>
  );
}
