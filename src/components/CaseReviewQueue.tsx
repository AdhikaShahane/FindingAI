import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  ShieldCheck,
  FileText,
  Sparkles,
  Layers,
  Fingerprint,
  Cpu,
  BrainCircuit,
  X,
  Send,
  HelpCircle,
} from 'lucide-react';
import {
  ForensicCase,
  VerdictLabelType,
  AdminVerdictType,
} from '../types';
import { reviewCase } from '../utils/caseManager';

interface CaseReviewQueueProps {
  cases: ForensicCase[];
  selectedCaseId?: string | null;
  onCaseReviewed: () => void;
}

export const CaseReviewQueue: React.FC<CaseReviewQueueProps> = ({
  cases,
  selectedCaseId,
  onCaseReviewed,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'incorrect' | 'inconclusive' | 'conflict'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectingCase, setInspectingCase] = useState<ForensicCase | null>(() => {
    if (selectedCaseId) {
      return cases.find((c) => c.caseId === selectedCaseId) || null;
    }
    return null;
  });

  // Review form state
  const [adminVerdict, setAdminVerdict] = useState<AdminVerdictType>('AI Correct');
  const [adminVerifiedLabel, setAdminVerifiedLabel] = useState<VerdictLabelType>('LIKELY AUTHENTIC');
  const [adminExplanation, setAdminExplanation] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fileHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.userName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'pending') return c.adminReviewStatus === 'Pending Review';
    if (filter === 'reviewed') return c.adminReviewStatus === 'Reviewed';
    if (filter === 'incorrect') return c.adminVerdict === 'AI Incorrect';
    if (filter === 'inconclusive') return c.adminVerdict === 'Inconclusive' || c.originalAiVerdict === 'INCONCLUSIVE';
    if (filter === 'conflict') return c.evidenceConflict;

    return true;
  });

  const handleOpenReview = (c: ForensicCase) => {
    setInspectingCase(c);
    setAdminVerdict(c.adminVerdict || 'AI Correct');
    setAdminVerifiedLabel(c.adminVerifiedLabel || c.originalAiVerdict);
    setAdminExplanation(c.adminExplanation || '');
    setSubmitSuccess(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingCase) return;

    reviewCase(inspectingCase.caseId, {
      adminVerdict,
      adminVerifiedLabel: adminVerdict === 'AI Correct' ? inspectingCase.originalAiVerdict : adminVerifiedLabel,
      adminExplanation: adminExplanation || (adminVerdict === 'AI Correct' ? 'Confirmed by forensic examiner.' : 'Human correction logged.'),
    });

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      onCaseReviewed();
      setInspectingCase(null);
    }, 1200);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-purple-400" />
            <span>Forensic Case Review Queue</span>
          </h1>
          <p className="text-xs text-[#8B96A8] mt-1">
            Examine automated AI predictions, inspect multi-layer evidence matrices, and record ground-truth verifications into the feedback ledger.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
          <span className="bg-purple-950/60 border border-purple-500/40 px-3 py-1.5 rounded-xl text-purple-300">
            Pending: {cases.filter((c) => c.adminReviewStatus === 'Pending Review').length}
          </span>
          <span className="bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-emerald-300">
            Verified: {cases.filter((c) => c.adminReviewStatus === 'Reviewed').length}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter cases by ID (FA-2026-...), filename, SHA-256, or analyst name..."
            className="w-full bg-[#111827] border border-[#232D3F] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'pending', label: 'Pending Review' },
            { id: 'all', label: 'All Cases' },
            { id: 'reviewed', label: 'Reviewed' },
            { id: 'incorrect', label: 'Incorrect AI' },
            { id: 'inconclusive', label: 'Inconclusive' },
            { id: 'conflict', label: 'Conflicts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filter === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-[#111827] text-gray-400 hover:text-white border border-[#232D3F]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Case Table */}
      <div className="bg-[#111827] border border-[#232D3F] rounded-2xl overflow-hidden shadow-xl">
        {filteredCases.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CheckSquare className="w-12 h-12 text-[#232D3F] mx-auto" />
            <h3 className="text-base font-semibold text-gray-300">No Cases in this Queue</h3>
            <p className="text-xs text-[#8B96A8] max-w-md mx-auto">
              No forensic cases match the selected filter. Switch filters or upload new cases from the workspace.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#1E293B] text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-[#232D3F]">
                <tr>
                  <th className="px-4 py-3">Case ID</th>
                  <th className="px-4 py-3">Filename & Size</th>
                  <th className="px-4 py-3">Analyst</th>
                  <th className="px-4 py-3">Original AI Verdict</th>
                  <th className="px-4 py-3">Evidence State</th>
                  <th className="px-4 py-3">Admin Review Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232D3F]">
                {filteredCases.map((c) => (
                  <tr key={c.caseId} className="hover:bg-[#1E293B]/40 transition">
                    <td className="px-4 py-3 font-mono text-[11px] text-purple-400 font-bold whitespace-nowrap">
                      {c.caseId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white max-w-[160px] truncate">{c.filename}</span>
                        {c.isDemoCase && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[9px] font-mono">
                            DEMO
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">{c.fileSize} • {c.resolution}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {c.userName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded font-bold text-[10px] border ${
                          c.originalAiVerdict === 'LIKELY AI GENERATED'
                            ? 'bg-red-950/40 border-red-500/40 text-red-300'
                            : c.originalAiVerdict === 'LIKELY AUTHENTIC'
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                        }`}
                      >
                        {c.originalAiVerdict} ({c.aiProbability}%)
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {c.evidenceConflict ? (
                        <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>Conflict Flagged</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-blue-950/30 border border-blue-500/20 text-blue-300 text-[10px]">
                          Nominal Fusion
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {c.adminReviewStatus === 'Reviewed' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{c.adminVerdict}</span>
                        </span>
                      ) : c.adminReviewStatus === 'Inconclusive' ? (
                        <span className="px-2 py-0.5 rounded bg-amber-950/50 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                          INCONCLUSIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/40 text-amber-300 text-[10px] font-bold animate-pulse">
                          PENDING REVIEW
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenReview(c)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow ${
                          c.adminReviewStatus === 'Pending Review'
                            ? 'bg-purple-600 hover:bg-purple-500 text-white'
                            : 'bg-[#1E293B] hover:bg-[#283548] text-gray-300 border border-[#232D3F]'
                        }`}
                      >
                        {c.adminReviewStatus === 'Pending Review' ? 'Review & Verify' : 'Inspect Review'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Case Review Inspector Modal */}
      {inspectingCase && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111827] border border-[#232D3F] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#232D3F] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white font-mono">{inspectingCase.caseId}</h2>
                    {inspectingCase.isDemoCase && (
                      <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold">
                        DEMO DATA — NOT REAL FORENSIC EVIDENCE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8B96A8]">
                    File: {inspectingCase.filename} ({inspectingCase.fileSize}) • Ingested by {inspectingCase.userName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectingCase(null)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-[#1E293B] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-12 text-center space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-white">Ground-Truth Verification Recorded</h3>
                <p className="text-xs text-[#8B96A8] max-w-md mx-auto">
                  The case has been added to the Verified Feedback Dataset and logged into the tamper-evident audit trail.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Evidence Conflict Banner if present */}
                {inspectingCase.evidenceConflict && (
                  <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-200">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-amber-300">EVIDENCE CONFLICT DETECTED</div>
                      <p className="mt-1 leading-relaxed">
                        {inspectingCase.evidenceConflictDetails || 'High divergence detected between digital forensics and metadata channels. Human expert determination required.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Evidence Overview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Original AI Verdict & Hashes */}
                  <div className="bg-[#0B0F19] border border-[#232D3F] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#232D3F] pb-2">
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Original AI Verdict</span>
                      <span className="text-[10px] text-gray-500 font-mono">Immutable</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs border ${
                          inspectingCase.originalAiVerdict === 'LIKELY AI GENERATED'
                            ? 'bg-red-950/40 border-red-500/40 text-red-300'
                            : inspectingCase.originalAiVerdict === 'LIKELY AUTHENTIC'
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                        }`}
                      >
                        {inspectingCase.originalAiVerdict}
                      </span>
                      <span className="text-sm font-mono font-bold text-white">
                        AI Prob: {inspectingCase.aiProbability}%
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-[#232D3F]/60 text-[11px]">
                      <div className="flex justify-between text-gray-400">
                        <span>Confidence Rating:</span>
                        <strong className="text-gray-200">{inspectingCase.aiConfidence} ({inspectingCase.aiConfidenceNumeric}%)</strong>
                      </div>
                      <div className="flex justify-between text-gray-400 font-mono text-[10px]">
                        <span>SHA-256:</span>
                        <span className="text-blue-400 truncate max-w-[200px]" title={inspectingCase.fileHash}>
                          {inspectingCase.fileHash}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Observed Evidence vs AI Interpretation */}
                  <div className="bg-[#0B0F19] border border-[#232D3F] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#232D3F] pb-2">
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Evidence Layer Scores</span>
                      <span className="text-[10px] text-purple-400 font-mono">Multi-Channel</span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {inspectingCase.fusionResult.channels.map((ch) => (
                        <div key={ch.id} className="flex items-center justify-between">
                          <span className="text-gray-400 text-[11px]">{ch.name}</span>
                          <span className="font-mono text-white font-bold">{ch.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ground Truth Decision Form */}
                <form onSubmit={handleFormSubmit} className="bg-[#0B0F19] border border-purple-500/30 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#232D3F] pb-2">
                    <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Administrator Ground-Truth Decision Form</span>
                    </h3>
                    <span className="text-[10px] text-gray-500">Recorded into Verified Dataset</span>
                  </div>

                  {/* Decision Radio Grid */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Select Examiner Assessment:</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'AI Correct', label: 'AI Result is Correct', icon: CheckCircle2, color: 'text-emerald-400' },
                        { id: 'AI Incorrect', label: 'AI Result is Incorrect', icon: AlertCircle, color: 'text-red-400' },
                        { id: 'Inconclusive', label: 'Inconclusive Evidence', icon: HelpCircle, color: 'text-amber-400' },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = adminVerdict === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setAdminVerdict(item.id as any)}
                            className={`p-3 rounded-xl border text-left transition flex flex-col items-center justify-center gap-1.5 ${
                              isSelected
                                ? 'bg-purple-600/25 border-purple-500 text-white font-bold'
                                : 'bg-[#1E293B] border-[#232D3F] text-gray-400 hover:border-gray-500'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${item.color}`} />
                            <span className="text-xs text-center">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* If Incorrect, show Verified Classification Selector */}
                  {adminVerdict === 'AI Incorrect' && (
                    <div className="bg-[#111827] border border-[#232D3F] rounded-xl p-3.5 space-y-2">
                      <label className="block text-xs font-semibold text-gray-200">
                        Verified Ground Truth Classification:
                      </label>
                      <select
                        value={adminVerifiedLabel}
                        onChange={(e) => setAdminVerifiedLabel(e.target.value as any)}
                        className="w-full bg-[#0B0F19] border border-[#232D3F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="LIKELY AUTHENTIC">LIKELY AUTHENTIC (Camera Origin / Verified Provenance)</option>
                        <option value="LIKELY AI GENERATED">LIKELY AI GENERATED (Synthetic Latent Indicators)</option>
                        <option value="MANIPULATED PHOTOGRAPH">MANIPULATED PHOTOGRAPH (Splicing / Retouching)</option>
                        <option value="AI + MANIPULATION DETECTED">AI + MANIPULATION DETECTED (Hybrid Composite)</option>
                        <option value="INCONCLUSIVE">INCONCLUSIVE (Insufficient Evidence)</option>
                      </select>
                    </div>
                  )}

                  {/* Explanation Field */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Examiner Justification & Evidence Reason:
                    </label>
                    <textarea
                      value={adminExplanation}
                      onChange={(e) => setAdminExplanation(e.target.value)}
                      rows={3}
                      placeholder="Detail why this verdict was chosen (e.g. verified camera RAW EXIF serial tags, long exposure bokeh artifacts, Midjourney v6 anatomical anomalies, etc.)."
                      className="w-full bg-[#111827] border border-[#232D3F] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Controlled Retraining Disclaimer */}
                  <p className="text-[10px] text-gray-500 italic">
                    Note: Submitting this decision appends the record to the Verified Feedback Dataset for scheduled model evaluation. It does NOT automatically modify the production weights on the fly.
                  </p>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#232D3F]">
                    <button
                      type="button"
                      onClick={() => setInspectingCase(null)}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-2 shadow-lg shadow-purple-600/25"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Record Decision & Add to Dataset</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
