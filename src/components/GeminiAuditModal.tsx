import React, { useState } from 'react';
import { Sparkles, X, Loader2, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { GeminiAuditResult, FileInfo } from '../types';

interface GeminiAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileInfo: FileInfo | null;
  imgDataUrl: string | null;
}

export const GeminiAuditModal: React.FC<GeminiAuditModalProps> = ({
  isOpen,
  onClose,
  fileInfo,
  imgDataUrl,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeminiAuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !fileInfo || !imgDataUrl) return null;

  const runGeminiAudit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/gemini-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imgDataUrl,
          filename: fileInfo.filename,
          mimeType: fileInfo.format.startsWith('image/') ? fileInfo.format : 'image/jpeg',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.details || 'Gemini audit failed.');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error executing Gemini Vision Audit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#232D3F] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#232D3F] flex items-center justify-between bg-gradient-to-r from-blue-900/30 via-[#1E293B] to-[#111827]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Gemini 2.5 Flash Vision Forensic Audit
              </h2>
              <p className="text-xs text-[#8B96A8]">Real AI Multimodal Visual Reasoning & Artifact Detection</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {!result && !loading && !error && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base font-semibold text-white">Run Gemini Vision Neural Deep Inspection</h3>
                <p className="text-xs text-[#8B96A8]">
                  Submit this image directly to Gemini 2.5 Flash model for deep visual forensics. Gemini examines fine lighting vectors, sub-pixel shadow coherence, anatomical structure, text rendering, and GAN/diffusion noise patterns.
                </p>
              </div>
              <button
                onClick={runGeminiAudit}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition shadow-lg shadow-purple-600/25 flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Gemini Vision Audit</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12 space-y-4">
              <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto" />
              <div>
                <h3 className="text-base font-semibold text-white">Analyzing Image with Gemini 2.5 Flash...</h3>
                <p className="text-xs text-[#8B96A8]">Evaluating sub-pixel artifacts, reflection vectors, and anatomical coherence...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center space-y-3">
              <ShieldAlert className="w-8 h-8 text-red-400 mx-auto" />
              <div className="text-sm font-semibold text-red-300">{error}</div>
              <p className="text-xs text-gray-400">Ensure GEMINI_API_KEY is configured in server environment.</p>
              <button
                onClick={runGeminiAudit}
                className="px-4 py-2 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-200 text-xs font-medium border border-red-500/30 transition"
              >
                Retry Audit
              </button>
            </div>
          )}

          {result && (
            <div className="space-y-5">
              {/* Verdict header card */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  result.aiProbability >= 65
                    ? 'bg-red-950/40 border-red-500/40 text-red-300'
                    : result.aiProbability >= 35
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.aiProbability >= 65 ? (
                    <ShieldAlert className="w-8 h-8 text-red-400 shrink-0" />
                  ) : result.aiProbability >= 35 ? (
                    <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-semibold tracking-wider uppercase opacity-80">
                      Gemini Vision Verdict
                    </div>
                    <div className="text-lg font-bold">{result.verdict}</div>
                    {result.detectedGenerator && (
                      <div className="text-xs opacity-90">Likely Origin: {result.detectedGenerator}</div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black">{result.aiProbability}%</div>
                  <div className="text-[11px] opacity-80">AI Probability</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Confidence: {result.confidence}%</div>
                </div>
              </div>

              {/* Forensic Observations List */}
              {result.structuredFindings && result.structuredFindings.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-300 tracking-wider uppercase">Structured Visual Findings</h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {result.structuredFindings.map((item, idx) => (
                      <div key={idx} className="bg-[#0B0F19] p-3.5 rounded-xl border border-[#232D3F] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{item.finding}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950/60 border border-purple-500/40 text-purple-300 font-medium">
                              {item.location}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.severity === 'Critical'
                                ? 'bg-red-950/60 text-red-400 border border-red-500/40'
                                : item.severity === 'Moderate'
                                ? 'bg-amber-950/60 text-amber-400 border border-amber-500/40'
                                : 'bg-blue-950/60 text-blue-300 border border-blue-500/40'
                            }`}
                          >
                            {item.severity} Severity
                          </span>
                        </div>
                        <p className="text-xs text-gray-300">{item.explanation}</p>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-[#232D3F]/60">
                          <span>AI Relevance: <strong className="text-gray-200">{item.aiRelevance}</strong></span>
                          <span>Confidence: <strong className="text-purple-300">{item.confidence}%</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-300 tracking-wider uppercase">Visual Observations</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {result.forensicObservations.map((obs, idx) => (
                      <div key={idx} className="bg-[#0B0F19] p-3 rounded-xl border border-[#232D3F] text-xs text-gray-200 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="pt-0.5">{obs}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expert Summary */}
              <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#232D3F] space-y-1.5">
                <h4 className="text-xs font-bold text-purple-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini Expert Forensic Summary</span>
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed leading-6">{result.expertSummary}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#232D3F] bg-[#1E293B]/50 flex items-center justify-between">
          <span className="text-xs text-[#8B96A8]">Model: Gemini 2.5 Flash Vision Multimodal</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#27344A] hover:bg-[#32435e] text-white text-xs font-medium transition"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
