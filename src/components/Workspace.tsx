import React, { useState, useRef } from 'react';
import {
  Upload,
  FileCode,
  Layers,
  Sparkles,
  Download,
  AlertTriangle,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Activity,
  Fingerprint,
  Sliders,
  Grid,
  Zap,
  ShieldCheck,
  Scissors,
  BarChart2,
  Printer,
  SlidersHorizontal,
  BrainCircuit,
} from 'lucide-react';

import {
  FileInfo,
  FusionResult,
  CanvasTab,
  EXIFSummary,
  ChainOfCustodyStep,
  PatchFinding,
} from '../types';
import {
  getFileInfo,
  extractExif,
  generateELA,
  generateEdgeMap,
  generateFFTSpectrum,
  generateAIHeatmap,
  generateNoiseResidualMap,
  generateResamplingMap,
  generatePatchGridCanvas,
  applyWatermarkAndDownload,
  exportPrintableForensicReport,
} from '../utils/forensics';
import { runFusionEngine, DEFAULT_FUSION_WEIGHTS } from '../utils/fusionEngine';
import { GeminiAuditModal } from './GeminiAuditModal';
import { FeedbackModal } from './FeedbackModal';
import { SemanticReasoningView } from './SemanticReasoningView';

interface WorkspaceProps {
  onFeedbackSubmitted: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ onFeedbackSubmitted }) => {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [exifSummary, setExifSummary] = useState<EXIFSummary>({});
  const [fusionResult, setFusionResult] = useState<FusionResult | null>(null);
  const [activeCanvasTab, setActiveCanvasTab] = useState<CanvasTab>('original');
  const [selectedPatch, setSelectedPatch] = useState<PatchFinding | null>(null);

  // UX Mode: Quick Scan vs Forensic Investigation Mode
  const [investigationMode, setInvestigationMode] = useState<'quick' | 'investigation'>('investigation');

  // Heatmap Overlay Blend Mode / Slider
  const [heatmapOverlayMode, setHeatmapOverlayMode] = useState<'single' | 'side-by-side' | 'overlay'>('single');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(65);

  // Configurable Fusion Channel Weights State
  const [channelWeights, setChannelWeights] = useState<Record<string, number>>(DEFAULT_FUSION_WEIGHTS);
  const [showWeightSliders, setShowWeightSliders] = useState(false);

  // Canvas View Image URLs
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [edgeUrl, setEdgeUrl] = useState<string | null>(null);
  const [fftUrl, setFftUrl] = useState<string | null>(null);
  const [elaUrl, setElaUrl] = useState<string | null>(null);
  const [heatmapUrl, setHeatmapUrl] = useState<string | null>(null);
  const [noiseUrl, setNoiseUrl] = useState<string | null>(null);
  const [resamplingUrl, setResamplingUrl] = useState<string | null>(null);
  const [patchGridUrl, setPatchGridUrl] = useState<string | null>(null);

  // Timeline
  const [custodySteps, setCustodySteps] = useState<ChainOfCustodyStep[]>([]);

  // Modals
  const [isGeminiOpen, setIsGeminiOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isGeminiSemanticLoading, setIsGeminiSemanticLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRefreshSemanticWithGemini = async () => {
    if (!originalUrl || !fusionResult) return;
    setIsGeminiSemanticLoading(true);
    try {
      const res = await fetch('/api/semantic-reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: originalUrl,
          filename: fileInfo?.filename || 'image.jpg',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.scene && data.dimensions) {
          setFusionResult((prev) => {
            if (!prev) return prev;
            const updatedSemantic = {
              scene: data.scene,
              dimensions: data.dimensions,
              overallPlausibilityScore: data.overallPlausibilityScore ?? prev.semanticResult.overallPlausibilityScore,
              syntheticIndicatorScore: data.syntheticIndicatorScore ?? prev.semanticResult.syntheticIndicatorScore,
              confidence: data.confidence ?? prev.semanticResult.confidence,
              unusualVsImplausibleSummary: data.unusualVsImplausibleSummary ?? prev.semanticResult.unusualVsImplausibleSummary,
              isPhysicalImpossibilityDetected: data.isPhysicalImpossibilityDetected ?? prev.semanticResult.isPhysicalImpossibilityDetected,
              contradictions: data.contradictions || prev.semanticResult.contradictions,
              anatomicalAssessment: data.anatomicalAssessment || prev.semanticResult.anatomicalAssessment,
              affordanceAssessment: data.affordanceAssessment || prev.semanticResult.affordanceAssessment,
              physicsAssessment: data.physicsAssessment || prev.semanticResult.physicsAssessment,
              humanLikeReport: data.humanLikeReport || prev.semanticResult.humanLikeReport,
              diagnostics: data.diagnostics || prev.semanticResult.diagnostics,
            };
            return {
              ...prev,
              semanticResult: updatedSemantic,
            };
          });
        }
      }
    } catch (err) {
      console.error('Gemini Semantic Audit Error:', err);
    } finally {
      setIsGeminiSemanticLoading(false);
    }
  };

  const processImage = async (file: File) => {
    setLoading(true);
    setCurrentFile(file);

    setCustodySteps([
      { id: '1', label: 'File Ingested & SHA-256 / MD5 Hashes Computed', done: false },
      { id: '2', label: 'EXIF Headers & C2PA Metadata Scanned', done: false },
      { id: '3', label: 'Multi-Patch Grid, ELA & 2D FFT Spectral Analysis', done: false },
      { id: '4', label: 'Multi-Channel Evidence Fusion & Manipulation Matrix Evaluated', done: false },
    ]);

    const objectUrl = URL.createObjectURL(file);
    setOriginalUrl(objectUrl);

    const img = new Image();
    img.src = objectUrl;

    img.onload = async () => {
      const info = await getFileInfo(file, img);
      setFileInfo(info);
      setCustodySteps((prev) =>
        prev.map((s) => (s.id === '1' ? { ...s, done: true, timestamp: new Date().toLocaleTimeString() } : s))
      );

      const exif = await extractExif(file);
      setExifSummary(exif);
      setCustodySteps((prev) =>
        prev.map((s) => (s.id === '2' ? { ...s, done: true, timestamp: new Date().toLocaleTimeString() } : s))
      );

      const ela = generateELA(img, 0.9);
      setElaUrl(ela.dataUrl);

      const edge = generateEdgeMap(img);
      setEdgeUrl(edge);

      const fft = generateFFTSpectrum(img);
      setFftUrl(fft);

      const resamp = generateResamplingMap(img);
      setResamplingUrl(resamp);

      const fusion = runFusionEngine(info.sha256, exif, ela.meanError, channelWeights);
      setFusionResult(fusion);

      const heat = generateAIHeatmap(img, fusion.overallAiProbability);
      setHeatmapUrl(heat);

      const noise = generateNoiseResidualMap(img);
      setNoiseUrl(noise);

      const grid = generatePatchGridCanvas(img, fusion.mlResult.patchProbabilityDistribution);
      setPatchGridUrl(grid);

      setSelectedPatch(fusion.mlResult.patches[0] || null);

      setCustodySteps((prev) =>
        prev.map((s) => (s.id === '3' ? { ...s, done: true, timestamp: new Date().toLocaleTimeString() } : s))
      );

      setCustodySteps((prev) =>
        prev.map((s) => (s.id === '4' ? { ...s, done: true, timestamp: new Date().toLocaleTimeString() } : s))
      );

      setLoading(false);
    };
  };

  const recomputeFusionWithWeights = (newWeights: Record<string, number>) => {
    setChannelWeights(newWeights);
    if (fileInfo) {
      const updatedFusion = runFusionEngine(fileInfo.sha256, exifSummary, 5, newWeights);
      setFusionResult(updatedFusion);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImage(e.dataTransfer.files[0]);
    }
  };

  const loadSampleImage = (type: 'ai' | 'camera' | 'manipulated') => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;

    if (type === 'ai') {
      const grad = ctx.createLinearGradient(0, 0, 800, 600);
      grad.addColorStop(0, '#312e81');
      grad.addColorStop(0.5, '#581c87');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 600);

      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(400, 260, 110, 0, Math.PI * 2);
      ctx.fill();

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'sample_midjourney_portrait.jpg', { type: 'image/jpeg' });
          processImage(file);
        }
      }, 'image/jpeg');
    } else if (type === 'manipulated') {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, 800, 600);

      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(100, 100, 250, 250);

      // Spliced block
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(450, 100, 250, 250);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'sample_spliced_photograph.jpg', { type: 'image/jpeg' });
          processImage(file);
        }
      }, 'image/jpeg');
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 800, 600);

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(400, 300, 140, 0, Math.PI * 2);
      ctx.fill();

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'sample_canon_camera_capture.jpg', { type: 'image/jpeg' });
          processImage(file);
        }
      }, 'image/jpeg');
    }
  };

  const triggerPrintReport = () => {
    if (!fileInfo || !fusionResult) return;
    exportPrintableForensicReport({
      caseId: Math.floor(100000 + Math.random() * 900000).toString(),
      generatedAt: new Date().toISOString(),
      fileInfo,
      fusionResult,
      exifSummary,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title Bar & UX Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-500" />
            <span>Finding AI — Digital Forensics Platform</span>
          </h1>
          <p className="text-xs text-[#8B96A8] mt-1">
            Explainable AI image forensics, multi-channel evidence fusion, C2PA provenance & manipulation detection.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Mode Switch: Quick Scan vs Forensic Investigation */}
          <div className="bg-[#111827] p-1 rounded-xl border border-[#232D3F] flex items-center gap-1">
            <button
              onClick={() => setInvestigationMode('quick')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                investigationMode === 'quick' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Quick Scan</span>
            </button>

            <button
              onClick={() => setInvestigationMode('investigation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                investigationMode === 'investigation' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Forensic Mode</span>
            </button>
          </div>

          {/* Demos */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => loadSampleImage('ai')}
              className="px-2.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#27344A] text-xs font-medium text-gray-300 border border-[#232D3F] transition flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI</span>
            </button>
            <button
              onClick={() => loadSampleImage('camera')}
              className="px-2.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#27344A] text-xs font-medium text-gray-300 border border-[#232D3F] transition flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Photo</span>
            </button>
            <button
              onClick={() => loadSampleImage('manipulated')}
              className="px-2.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#27344A] text-xs font-medium text-gray-300 border border-[#232D3F] transition flex items-center gap-1"
            >
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span>Spliced</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Card */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`bg-[#1E293B] border-2 border-dashed rounded-2xl p-7 text-center transition ${
          dragActive ? 'border-blue-500 bg-blue-600/10' : 'border-[#232D3F] hover:border-gray-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/bmp,image/tiff"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-3">
          <Upload className="w-6 h-6" />
        </div>

        <h3 className="text-sm font-semibold text-white mb-1">
          Drag & drop an image file here, or click to browse
        </h3>
        <p className="text-xs text-[#8B96A8] mb-4">
          Supports PNG, JPG, WEBP, BMP, TIFF — computes SHA-256 and MD5 cryptographic hashes
        </p>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-600/20 inline-flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image File</span>
        </button>
      </div>

      {loading && (
        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-6 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-white">Executing Multi-Layer Forensic Examination Pipeline...</p>
          <p className="text-xs text-[#8B96A8]">Analyzing 3x3 patch grid, 2D FFT magnitude spectrum, Error Level Analysis (ELA), C2PA, and resampling...</p>
        </div>
      )}

      {/* Main Analysis Output */}
      {fileInfo && fusionResult && !loading && (
        <div className="space-y-6">
          {/* Verdict Banner */}
          <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#232D3F] pb-5">
              <div>
                <div className="text-xs font-bold text-[#8B96A8] uppercase tracking-wider mb-1">
                  Primary Forensic Verdict ({investigationMode === 'quick' ? 'Quick Scan' : 'Full Investigation'})
                </div>
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <span>{fusionResult.verdictLabel}</span>
                </h2>
                <p className="text-xs text-[#8B96A8] mt-1">
                  Probabilistic determination derived from multi-channel evidence fusion.
                </p>
              </div>

              {/* 5 Calibrated Verdict Badges */}
              <div
                className={`px-5 py-3 rounded-xl border font-black text-sm flex items-center gap-2.5 shadow-lg ${
                  fusionResult.verdictLabel === 'LIKELY AI GENERATED'
                    ? 'bg-red-950/60 border-red-500/50 text-red-400'
                    : fusionResult.verdictLabel === 'AI + MANIPULATION DETECTED'
                    ? 'bg-purple-950/60 border-purple-500/50 text-purple-300'
                    : fusionResult.verdictLabel === 'MANIPULATED PHOTOGRAPH'
                    ? 'bg-amber-950/60 border-amber-500/50 text-amber-400'
                    : fusionResult.verdictLabel === 'INCONCLUSIVE'
                    ? 'bg-gray-800 border-gray-600 text-gray-300'
                    : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                }`}
              >
                {fusionResult.verdictLabel === 'LIKELY AI GENERATED' && <AlertCircle className="w-6 h-6" />}
                {fusionResult.verdictLabel === 'AI + MANIPULATION DETECTED' && <Sparkles className="w-6 h-6" />}
                {fusionResult.verdictLabel === 'MANIPULATED PHOTOGRAPH' && <Scissors className="w-6 h-6" />}
                {fusionResult.verdictLabel === 'INCONCLUSIVE' && <AlertTriangle className="w-6 h-6" />}
                {fusionResult.verdictLabel === 'LIKELY AUTHENTIC' && <CheckCircle2 className="w-6 h-6" />}
                <span>{fusionResult.verdictLabel}</span>
              </div>
            </div>

            {/* Metrics 4-Box Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#232D3F] space-y-1">
                <div className="text-xs text-[#8B96A8] font-semibold">AI Probability</div>
                <div className="text-3xl font-black text-white">{fusionResult.overallAiProbability}%</div>
                <div className="w-full bg-[#1E293B] h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full ${
                      fusionResult.overallAiProbability >= 65
                        ? 'bg-red-500'
                        : fusionResult.overallAiProbability >= 38
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${fusionResult.overallAiProbability}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#232D3F] space-y-1">
                <div className="text-xs text-[#8B96A8] font-semibold">Authentic Camera Probability</div>
                <div className="text-3xl font-black text-emerald-400">{fusionResult.overallAuthenticProbability}%</div>
                <div className="text-[11px] text-gray-400">Optical sensor likelihood</div>
              </div>

              <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#232D3F] space-y-1">
                <div className="text-xs text-[#8B96A8] font-semibold">Model Confidence</div>
                <div className="text-3xl font-black text-blue-400">{fusionResult.modelConfidence}</div>
                <div className="text-[11px] text-gray-400">{fusionResult.modelConfidenceNumeric}% feature support</div>
              </div>

              <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#232D3F] space-y-1">
                <div className="text-xs text-[#8B96A8] font-semibold">Evidence Quality</div>
                <div className="text-3xl font-black text-purple-300">{fusionResult.evidenceQuality}</div>
                <div className="text-[11px] text-gray-400">{fusionResult.evidenceQualityNumeric}/100 inter-channel index</div>
              </div>
            </div>

            {/* Quick Summary Reason Boxes */}
            <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#232D3F] space-y-2">
              <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Forensic Summary & Primary Findings</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {fusionResult.verdictParagraph}
              </p>
            </div>
          </div>

          {/* Quick Scan Mode vs Detailed Forensic Mode */}
          {investigationMode === 'quick' ? (
            <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Quick Scan High-Level Findings</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#232D3F] space-y-2">
                  <div className="font-bold text-white">Primary Evidence</div>
                  <ul className="list-disc pl-4 text-gray-300 space-y-1">
                    {fusionResult.reasons.strongEvidence.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#232D3F] space-y-2">
                  <div className="font-bold text-white">Generator Origin & Provenance</div>
                  <p className="text-gray-300">{fusionResult.generatorAttribution.statement}</p>
                  <p className="text-[#8B96A8]">C2PA Status: {fusionResult.provenance.status}</p>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setInvestigationMode('investigation')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition"
                >
                  Switch to Deep Forensic Investigation Mode →
                </button>
              </div>
            </div>
          ) : (
            /* Deep Forensic Investigation Mode */
            <div className="space-y-6">
              {/* File Hashes Card */}
              <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#232D3F] pb-3">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span>Chain of Custody & File Hashes</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[#8B96A8] block">SHA-256 Hash:</span>
                    <code className="text-blue-400 font-mono text-[10px] break-all">{fileInfo.sha256}</code>
                  </div>
                  <div>
                    <span className="text-[#8B96A8] block">MD5 Hash:</span>
                    <code className="text-blue-400 font-mono text-[10px] break-all">{fileInfo.md5}</code>
                  </div>
                  <div>
                    <span className="text-[#8B96A8] block">Resolution:</span>
                    <span className="text-white font-mono">{fileInfo.resolution}</span>
                  </div>
                  <div>
                    <span className="text-[#8B96A8] block">File Size:</span>
                    <span className="text-white font-mono">{fileInfo.filesizeReadable}</span>
                  </div>
                </div>
              </div>

              {/* 12-Tab Inspector */}
              <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#232D3F] pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <span>Forensic Canvas Inspector</span>
                  </h3>

                  <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-xl border border-[#232D3F] overflow-x-auto">
                    {[
                      { id: 'original', label: 'Original' },
                      { id: 'semantic', label: 'Semantic Reality' },
                      { id: 'heatmap', label: 'AI Heatmap' },
                      { id: 'patches', label: '3x3 Patches' },
                      { id: 'edge', label: 'Sobel Edge' },
                      { id: 'fft', label: '2D FFT' },
                      { id: 'ela', label: 'ELA Residual' },
                      { id: 'noise', label: 'Sensor Noise' },
                      { id: 'provenance', label: 'C2PA Provenance' },
                      { id: 'manipulation', label: 'Manipulation' },
                      { id: 'robustness', label: 'Robustness' },
                      { id: 'metadata', label: 'EXIF Tags' },
                      { id: 'explanation', label: 'Why Signals' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveCanvasTab(tab.id as CanvasTab)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                          activeCanvasTab === tab.id
                            ? 'bg-blue-600 text-white shadow'
                            : 'text-gray-400 hover:text-white hover:bg-[#1E293B]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Heatmap Overlay Controls */}
                {activeCanvasTab === 'heatmap' && (
                  <div className="flex items-center justify-between bg-[#0B0F19] p-3 rounded-xl border border-[#232D3F] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[#8B96A8]">Heatmap View Mode:</span>
                      <button
                        onClick={() => setHeatmapOverlayMode('single')}
                        className={`px-2 py-1 rounded ${heatmapOverlayMode === 'single' ? 'bg-blue-600 text-white' : 'bg-[#111827] text-gray-400'}`}
                      >
                        Heatmap Only
                      </button>
                      <button
                        onClick={() => setHeatmapOverlayMode('side-by-side')}
                        className={`px-2 py-1 rounded ${heatmapOverlayMode === 'side-by-side' ? 'bg-blue-600 text-white' : 'bg-[#111827] text-gray-400'}`}
                      >
                        Side-by-Side
                      </button>
                    </div>
                  </div>
                )}

                {/* Canvas Display */}
                <div className="bg-[#0B0F19] rounded-xl border border-[#232D3F] p-4 flex flex-col items-center justify-center min-h-[380px] max-h-[520px] overflow-hidden relative">
                  {activeCanvasTab === 'original' && originalUrl && (
                    <img src={originalUrl} alt="Original Target" className="max-h-[460px] w-auto object-contain rounded-lg" />
                  )}

                  {activeCanvasTab === 'heatmap' && heatmapUrl && (
                    heatmapOverlayMode === 'side-by-side' ? (
                      <div className="grid grid-cols-2 gap-4 w-full h-full">
                        <img src={originalUrl!} alt="Original" className="max-h-[440px] w-auto object-contain rounded-lg mx-auto" />
                        <img src={heatmapUrl} alt="Heatmap" className="max-h-[440px] w-auto object-contain rounded-lg mx-auto" />
                      </div>
                    ) : (
                      <img src={heatmapUrl} alt="AI Heatmap" className="max-h-[460px] w-auto object-contain rounded-lg" />
                    )
                  )}

                  {activeCanvasTab === 'patches' && patchGridUrl && (
                    <img src={patchGridUrl} alt="Patch Grid Map" className="max-h-[460px] w-auto object-contain rounded-lg" />
                  )}
                  {activeCanvasTab === 'edge' && edgeUrl && (
                    <img src={edgeUrl} alt="Edge Map" className="max-h-[460px] w-auto object-contain rounded-lg" />
                  )}
                  {activeCanvasTab === 'fft' && fftUrl && (
                    <img src={fftUrl} alt="2D FFT Spectrum" className="max-h-[460px] w-auto object-contain rounded-lg" />
                  )}
                  {activeCanvasTab === 'ela' && elaUrl && (
                    <img src={elaUrl} alt="ELA Error Heatmap" className="max-h-[460px] w-auto object-contain rounded-lg" />
                  )}
                  {activeCanvasTab === 'noise' && noiseUrl && (
                    <img src={noiseUrl} alt="Sensor Noise Pattern" className="max-h-[460px] w-auto object-contain rounded-lg" />
                  )}

                  {/* C2PA Provenance Tab */}
                  {activeCanvasTab === 'provenance' && (
                    <div className="w-full max-w-2xl bg-[#111827] p-5 rounded-xl border border-[#232D3F] text-xs space-y-3">
                      <h4 className="font-bold text-white text-sm border-b border-[#232D3F] pb-2 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>C2PA Content Credentials & Provenance Manifest</span>
                      </h4>
                      <div className="flex justify-between py-1 border-b border-[#232D3F]/50">
                        <span className="text-[#8B96A8]">Provenance Status:</span>
                        <span className="font-bold text-emerald-400">{fusionResult.provenance.status}</span>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{fusionResult.provenance.statement}</p>
                      {fusionResult.provenance.issuer && (
                        <div className="flex justify-between py-1 border-b border-[#232D3F]/50">
                          <span className="text-[#8B96A8]">Certificate Authority:</span>
                          <span className="text-white font-mono">{fusionResult.provenance.issuer}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Manipulation Tab */}
                  {activeCanvasTab === 'manipulation' && (
                    <div className="w-full max-w-2xl bg-[#111827] p-5 rounded-xl border border-[#232D3F] text-xs space-y-3">
                      <h4 className="font-bold text-white text-sm border-b border-[#232D3F] pb-2 flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-amber-400" />
                        <span>Image Manipulation & Localized Editing Analysis</span>
                      </h4>
                      <div className="flex justify-between py-1 border-b border-[#232D3F]/50">
                        <span className="text-[#8B96A8]">Manipulation Detected:</span>
                        <span className={`font-bold ${fusionResult.manipulation.manipulationDetected ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {fusionResult.manipulation.manipulationDetected ? 'YES' : 'NO'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#232D3F]/50">
                        <span className="text-[#8B96A8]">Detected Modification Type:</span>
                        <span className="text-white font-bold">{fusionResult.manipulation.manipulationType}</span>
                      </div>
                      <div className="space-y-1 pt-1">
                        <div className="font-bold text-white">Specific Findings:</div>
                        <ul className="list-disc pl-4 text-gray-300 space-y-1">
                          {fusionResult.manipulation.findings.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Robustness Tab */}
                  {activeCanvasTab === 'robustness' && (
                    <div className="w-full max-w-2xl bg-[#111827] p-5 rounded-xl border border-[#232D3F] text-xs space-y-3">
                      <h4 className="font-bold text-white text-sm border-b border-[#232D3F] pb-2 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-purple-400" />
                        <span>Detection Stability Under Perturbation & Degradation</span>
                      </h4>
                      <div className="text-lg font-black text-white">
                        Overall Stability Index: <span className="text-purple-400">{fusionResult.robustness.overallStabilityScore}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="bg-[#0B0F19] p-2.5 rounded-lg border border-[#232D3F]">
                          <span className="text-[#8B96A8] block">JPEG Re-compression:</span>
                          <span className="font-bold text-white">{fusionResult.robustness.jpegCompressionResilience}% resilience</span>
                        </div>
                        <div className="bg-[#0B0F19] p-2.5 rounded-lg border border-[#232D3F]">
                          <span className="text-[#8B96A8] block">Downscaling / Resize:</span>
                          <span className="font-bold text-white">{fusionResult.robustness.resizeScalingResilience}% resilience</span>
                        </div>
                        <div className="bg-[#0B0F19] p-2.5 rounded-lg border border-[#232D3F]">
                          <span className="text-[#8B96A8] block">Gaussian Noise Perturbation:</span>
                          <span className="font-bold text-white">{fusionResult.robustness.noiseDegradationResilience}% resilience</span>
                        </div>
                        <div className="bg-[#0B0F19] p-2.5 rounded-lg border border-[#232D3F]">
                          <span className="text-[#8B96A8] block">Center Cropping:</span>
                          <span className="font-bold text-white">{fusionResult.robustness.cropPerturbationResilience}% resilience</span>
                        </div>
                      </div>
                      <p className="text-gray-300">{fusionResult.robustness.assessment}</p>
                    </div>
                  )}

                  {activeCanvasTab === 'semantic' && (
                    <SemanticReasoningView
                      semanticResult={fusionResult.semanticResult}
                      fileInfo={fileInfo}
                      originalUrl={originalUrl}
                      onRefreshWithGemini={handleRefreshSemanticWithGemini}
                      isGeminiLoading={isGeminiSemanticLoading}
                    />
                  )}

                  {activeCanvasTab === 'metadata' && (
                    <div className="w-full max-w-2xl bg-[#111827] p-5 rounded-xl border border-[#232D3F] text-xs space-y-2 overflow-y-auto max-h-[440px]">
                      <h4 className="font-bold text-white text-sm border-b border-[#232D3F] pb-2">EXIF Metadata & Software Headers</h4>
                      {Object.keys(exifSummary).length === 0 ? (
                        <p className="text-gray-400 italic py-4 text-center">
                          No camera EXIF metadata blocks found in file header. (Note: EXIF removal is common on web platforms and does NOT prove AI generation).
                        </p>
                      ) : (
                        Object.entries(exifSummary).map(([k, v]) => (
                          <div key={k} className="flex justify-between py-1 border-b border-[#232D3F]/50">
                            <span className="text-[#8B96A8]">{k}:</span>
                            <span className="font-semibold text-white">{String(v)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeCanvasTab === 'explanation' && (
                    <div className="w-full max-w-3xl bg-[#111827] p-5 rounded-xl border border-[#232D3F] space-y-4 text-xs overflow-y-auto max-h-[440px]">
                      <h4 className="font-bold text-white text-sm border-b border-[#232D3F] pb-2">Categorized Evidence Explanation ("WHY")</h4>
                      <div className="space-y-2">
                        <div className="font-bold text-red-400 uppercase tracking-wider text-[11px]">Strong Evidence Signals</div>
                        <ul className="list-disc pl-4 space-y-1 text-gray-200">
                          {fusionResult.reasons.strongEvidence.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">Supporting Evidence Signals</div>
                        <ul className="list-disc pl-4 space-y-1 text-gray-300">
                          {fusionResult.reasons.supportingEvidence.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Localized Patch Inspector */}
                {fusionResult.mlResult.patches.length > 0 && (
                  <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#232D3F] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#232D3F] pb-2">
                      <h4 className="text-xs font-bold text-gray-300 tracking-wider uppercase flex items-center gap-1.5">
                        <Grid className="w-4 h-4 text-purple-400" />
                        <span>3x3 Localized Patch Inspector</span>
                      </h4>
                      <span className="text-[11px] text-[#8B96A8]">Click a patch to evaluate localized region features</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {fusionResult.mlResult.patches.map((patch) => (
                        <button
                          key={patch.id}
                          onClick={() => setSelectedPatch(patch)}
                          className={`p-2.5 rounded-xl border text-left transition ${
                            selectedPatch?.id === patch.id
                              ? 'bg-blue-600/20 border-blue-500 text-white'
                              : 'bg-[#111827] border-[#232D3F] text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold truncate max-w-[120px]">{patch.regionName}</span>
                            <span
                              className={`font-mono font-bold ${
                                patch.aiProbability >= 70
                                  ? 'text-red-400'
                                  : patch.aiProbability >= 40
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {patch.aiProbability}%
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {selectedPatch && (
                      <div className="bg-[#111827] p-3.5 rounded-xl border border-[#232D3F] space-y-1 text-xs">
                        <div className="flex items-center justify-between font-bold text-white">
                          <span>Region: {selectedPatch.regionName}</span>
                          <span className="text-blue-400">Localized AI Probability: {selectedPatch.aiProbability}%</span>
                        </div>
                        <ul className="list-disc pl-4 text-gray-300 space-y-0.5">
                          {selectedPatch.anomalyFeatures.map((feat, i) => (
                            <li key={i}>{feat}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Action Controls */}
          <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsGeminiOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-lg shadow-purple-600/20 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Gemini Vision Audit</span>
              </button>

              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#27344A] text-amber-300 font-semibold text-xs border border-amber-500/30 transition flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Log Human Feedback</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const img = new Image();
                  img.src = originalUrl!;
                  img.onload = () => {
                    applyWatermarkAndDownload(
                      img,
                      fusionResult.verdictLabel === 'LIKELY AI GENERATED',
                      fileInfo.filename
                    );
                  };
                }}
                className="px-4 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#27344A] text-gray-200 font-semibold text-xs border border-[#232D3F] transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Watermark & Download</span>
              </button>

              <button
                onClick={triggerPrintReport}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-600/20 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Printable Forensic Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <GeminiAuditModal
        isOpen={isGeminiOpen}
        onClose={() => setIsGeminiOpen(false)}
        fileInfo={fileInfo}
        imgDataUrl={originalUrl}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        fileInfo={fileInfo}
        fusionResult={fusionResult}
        onSubmitted={onFeedbackSubmitted}
      />
    </div>
  );
};
