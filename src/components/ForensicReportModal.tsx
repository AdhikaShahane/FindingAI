import React from 'react';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  Layers,
} from 'lucide-react';
import { ForensicCase } from '../types';

interface ForensicReportModalProps {
  caseData: ForensicCase;
  onClose: () => void;
}

export const ForensicReportModal: React.FC<ForensicReportModalProps> = ({ caseData, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(caseData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Forensic_Report_${caseData.caseId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-[#232D3F] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 my-auto text-gray-200 print:bg-white print:text-black print:p-0 print:border-none">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#232D3F] pb-4 print:border-gray-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white print:text-black font-mono">
                  FORENSIC REPORT: {caseData.caseId}
                </h1>
                {caseData.isDemoCase && (
                  <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold">
                    DEMO DATA — NOT REAL FORENSIC EVIDENCE
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8B96A8] print:text-gray-600">
                FindingAI Multi-Layer Forensic Evidence Certificate
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#283548] text-gray-200 text-xs font-semibold border border-[#232D3F] transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1E293B] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Responsible Forensics Disclaimer Banner */}
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-200 leading-relaxed print:bg-gray-100 print:text-gray-800 print:border-gray-300">
          <strong className="text-amber-300 print:text-black">Forensic Disclaimer:</strong> FindingAI provides probabilistic forensic indicators and automated analysis. It should not be treated as absolute proof of image authenticity or manipulation. High-impact decisions should involve qualified human forensic examination and independent corroborating evidence.
        </div>

        {/* Verdict & Human Verification High-Level Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0B0F19] border border-[#232D3F] rounded-xl p-4 space-y-2 print:bg-gray-50 print:border-gray-300">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Original AI Verdict (Automated Multi-Layer Fusion)
            </div>
            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-lg font-bold text-xs border ${
                  caseData.originalAiVerdict === 'LIKELY AI GENERATED'
                    ? 'bg-red-950/40 border-red-500/40 text-red-300'
                    : caseData.originalAiVerdict === 'LIKELY AUTHENTIC'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                }`}
              >
                {caseData.originalAiVerdict}
              </span>
              <span className="font-mono text-sm font-bold text-white print:text-black">
                {caseData.aiProbability}% AI Probability
              </span>
            </div>
            <div className="text-[11px] text-gray-400">
              Confidence Rating: <strong className="text-gray-200 print:text-black">{caseData.aiConfidence} ({caseData.aiConfidenceNumeric}%)</strong>
            </div>
          </div>

          <div className="bg-[#0B0F19] border border-[#232D3F] rounded-xl p-4 space-y-2 print:bg-gray-50 print:border-gray-300">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Human Verification & Ground Truth Status
            </div>
            <div>
              {caseData.adminReviewStatus === 'Reviewed' ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>HUMAN VERIFIED: {caseData.adminVerdict}</span>
                    </span>
                  </div>
                  <div className="text-xs text-gray-300 print:text-black">
                    Verified Label: <strong>{caseData.adminVerifiedLabel}</strong>
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Examiner: {caseData.adminName} ({caseData.reviewTimestamp ? new Date(caseData.reviewTimestamp).toLocaleDateString() : 'N/A'})
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-400 text-xs font-semibold">
                    Human Verification: NOT REVIEWED
                  </span>
                  <p className="text-[10px] text-gray-500">
                    This automated analysis has not yet undergone final examination by the Chief Forensic Directorate.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chain of Custody & File Manifest */}
        <div className="bg-[#0B0F19] border border-[#232D3F] rounded-xl p-4 space-y-3 print:bg-gray-50 print:border-gray-300">
          <h2 className="text-xs font-bold text-white print:text-black uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-400" />
            <span>Digital Evidence Chain of Custody</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-[10px] text-gray-400">Filename</div>
              <div className="font-semibold text-white print:text-black truncate">{caseData.filename}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400">File Size & Res</div>
              <div className="font-semibold text-white print:text-black">{caseData.fileSize} ({caseData.resolution})</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400">Ingested Date</div>
              <div className="font-mono text-gray-300 print:text-black">{new Date(caseData.uploadTimestamp).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400">Submitting Analyst</div>
              <div className="font-semibold text-gray-300 print:text-black">{caseData.userName}</div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-gray-400 pt-2 border-t border-[#232D3F]/60">
            <div>SHA-256: <span className="text-blue-400">{caseData.fileHash}</span></div>
            <div>MD5: <span className="text-gray-300">{caseData.md5Hash}</span></div>
          </div>
        </div>

        {/* Observed Evidence vs AI Interpretation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0B0F19] border border-[#232D3F] rounded-xl p-4 space-y-2 print:bg-gray-50 print:border-gray-300">
            <h3 className="text-xs font-bold text-gray-300 print:text-black uppercase tracking-wider">
              1. Observed Physical & Forensic Evidence
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-400 list-disc list-inside">
              <li>High-frequency spectral lattice energy in 2D Fourier transform.</li>
              <li>Local error variance across JPEG discrete cosine transform blocks.</li>
              <li>EXIF header integrity and camera device signature metadata.</li>
              <li>Anatomical digit count and biomechanical joint angle continuity.</li>
            </ul>
          </div>

          <div className="bg-[#0B0F19] border border-[#232D3F] rounded-xl p-4 space-y-2 print:bg-gray-50 print:border-gray-300">
            <h3 className="text-xs font-bold text-gray-300 print:text-black uppercase tracking-wider">
              2. AI Interpretation & Inferences
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-400 list-disc list-inside">
              <li>ConvNeXt neural patch classification: {caseData.aiProbability}% synthetic score.</li>
              <li>Attributed Generator: {caseData.fusionResult.generatorAttribution.name}.</li>
              <li>Semantic Reality Plausibility Score: {caseData.fusionResult.semanticResult?.overallPlausibilityScore ?? 50}/100.</li>
            </ul>
          </div>
        </div>

        {/* Admin Explanation if reviewed */}
        {caseData.adminExplanation && (
          <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-4 space-y-1 print:bg-gray-50 print:border-gray-300">
            <div className="text-xs font-bold text-purple-300 print:text-black">
              Examiner Finding & Justification:
            </div>
            <p className="text-xs text-gray-300 print:text-black leading-relaxed">
              {caseData.adminExplanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
