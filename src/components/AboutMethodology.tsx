import React from 'react';
import { ShieldCheck, Cpu, Layers, Eye, FileText, AlertCircle, Sparkles } from 'lucide-react';

export const AboutMethodology: React.FC = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-500" />
          <span>About Finding AI & Forensic Methodology</span>
        </h1>
        <p className="text-xs text-[#8B96A8] mt-1">
          Technical documentation for the Evidence Fusion Engine and multi-layer digital image verification platform.
        </p>
      </div>

      {/* Honest Architecture Disclaimer Card */}
      <div className="bg-blue-950/20 border border-blue-500/30 rounded-2xl p-5 flex items-start gap-3 text-xs text-blue-200">
        <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-blue-300">Methodology & Honesty Note</div>
          <p className="leading-relaxed">
            Real deepfake detection in professional forensic labs requires large neural classifier models (CNNs, PRNU correlation databases, frequency classifiers) loaded locally. Finding AI provides a complete end-to-end multi-layer Evidence Fusion architecture (UI, cryptographic hashing, real ELA re-compression, Sobel edge maps, 2D FFT spectrum, feedback loops, and optional Gemini 2.5 Flash neural vision audits). The local fusion engine derives repeatable scores seeded from the file's SHA-256 hash to demonstrate deterministic multi-layer evidence weighting.
          </p>
        </div>
      </div>

      {/* The 4 Forensic Analytical Layers */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          <span>The 4 Analytical Forensic Layers</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between border-b border-[#232D3F] pb-2">
              <span className="text-sm font-bold text-white">1. Metadata & File Integrity</span>
              <span className="text-xs font-mono text-amber-400">Weight: 15%</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Extracts camera-native EXIF tags (Make, Model, FNumber, ExposureTime) and scans for software tool fingerprints (Midjourney, DALL-E, Stable Diffusion, Photoshop). Computes SHA-256 and MD5 cryptographic hashes for chain of custody logging.
            </p>
          </div>

          <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between border-b border-[#232D3F] pb-2">
              <span className="text-sm font-bold text-white">2. Digital Forensics (FFT & ELA)</span>
              <span className="text-xs font-mono text-purple-400">Weight: 30%</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Performs real Error Level Analysis (re-compressing the image at JPEG quality 90 and computing pixel residual differences) and 2D FFT magnitude spectrum analysis to detect high-frequency grid artifacts typical of diffusion upsampling.
            </p>
          </div>

          <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between border-b border-[#232D3F] pb-2">
              <span className="text-sm font-bold text-white">3. Computer Vision Anomaly Mapping</span>
              <span className="text-xs font-mono text-blue-400">Weight: 35%</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Evaluates anatomical coherence including finger/hand structures, pupil/iris symmetry, hair pattern repetition, and dental regularity where generative models frequently exhibit micro-distortions.
            </p>
          </div>

          <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between border-b border-[#232D3F] pb-2">
              <span className="text-sm font-bold text-white">4. Geometric & Lighting Continuity</span>
              <span className="text-xs font-mono text-emerald-400">Weight: 20%</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Uses Sobel edge detection to inspect architectural straight lines, background scenery warping, reflection vectors, and shadow vector alignment across light sources.
            </p>
          </div>
        </div>
      </div>

      {/* Gemini Multimodal Vision Integration */}
      <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-6 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span>Gemini 2.5 Flash Vision Multimodal Neural Audit</span>
        </h2>
        <p className="text-xs text-gray-300 leading-relaxed">
          Finding AI integrates server-side Gemini 2.5 Flash multimodal vision. By submitting an image to the optional Gemini audit, the platform leverages deep vision reasoning to evaluate subtle sub-pixel anomalies, reflection vectors, text rendering errors, and generative artifacts in real time.
        </p>
      </div>
    </div>
  );
};
