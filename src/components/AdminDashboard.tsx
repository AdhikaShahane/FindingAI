import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Database,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  GitBranch,
  Cpu,
  Layers,
  ScrollText,
} from 'lucide-react';
import { ForensicCase, AdminAuditRecord, UserProfile } from '../types';

interface AdminDashboardProps {
  currentUser: UserProfile;
  cases: ForensicCase[];
  auditLogs: AdminAuditRecord[];
  onNavigateToReviewQueue: () => void;
  onNavigateToDataset: () => void;
  onNavigateToMonitoring: () => void;
  onNavigateToAuditLogs: () => void;
  onSelectCaseToReview: (c: ForensicCase) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  cases,
  auditLogs,
  onNavigateToReviewQueue,
  onNavigateToDataset,
  onNavigateToMonitoring,
  onNavigateToAuditLogs,
  onSelectCaseToReview,
}) => {
  const pendingCases = cases.filter((c) => c.adminReviewStatus === 'Pending Review');
  const reviewedCases = cases.filter((c) => c.adminReviewStatus === 'Reviewed');
  const incorrectCases = cases.filter((c) => c.adminVerdict === 'AI Incorrect');
  const conflictCases = cases.filter((c) => c.evidenceConflict);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-[#111827] to-[#1E293B]/40 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Forensic Administration & Human Verification Directorate</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Administrator Command Dashboard
          </h1>
          <p className="text-xs text-[#8B96A8] leading-relaxed">
            Oversee digital forensic cases, review contested evidence layers, verify ground truth classifications, and supervise the controlled candidate model improvement pipeline.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onNavigateToReviewQueue}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-purple-600/25"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Open Case Review Queue ({pendingCases.length} Pending)</span>
            </button>
            <button
              onClick={onNavigateToDataset}
              className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#283548] text-gray-200 font-semibold text-xs border border-[#232D3F] transition flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-purple-400" />
              <span>Verified Feedback Dataset ({reviewedCases.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-bold text-[#8B96A8] uppercase tracking-wider">Total Cases</div>
          <div className="text-2xl font-black text-white">{cases.length}</div>
          <div className="text-[10px] text-gray-400">All submitted cases</div>
        </div>

        <div className="bg-[#111827] border border-amber-500/30 rounded-2xl p-4 space-y-1 bg-amber-950/10">
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Pending Review</div>
          <div className="text-2xl font-black text-amber-300">{pendingCases.length}</div>
          <div className="text-[10px] text-amber-400/80">Requires examiner decision</div>
        </div>

        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-bold text-[#8B96A8] uppercase tracking-wider">Verified Dataset</div>
          <div className="text-2xl font-black text-purple-300">{reviewedCases.length}</div>
          <div className="text-[10px] text-gray-400">Ground-truth verified</div>
        </div>

        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-bold text-[#8B96A8] uppercase tracking-wider">AI Corrections</div>
          <div className="text-2xl font-black text-red-400">{incorrectCases.length}</div>
          <div className="text-[10px] text-red-400/80">Disagreements logged</div>
        </div>

        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-bold text-[#8B96A8] uppercase tracking-wider">Evidence Conflicts</div>
          <div className="text-2xl font-black text-blue-400">{conflictCases.length}</div>
          <div className="text-[10px] text-blue-400/80">High layer divergence</div>
        </div>
      </div>

      {/* Controlled Retraining Pipeline Architecture Card */}
      <div className="bg-[#111827] border border-purple-500/30 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-purple-400" />
            <span>Controlled Human-in-the-Loop Model Improvement Pipeline</span>
          </h2>
          <span className="px-2.5 py-1 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 text-[10px] font-mono font-bold">
            No Automatic Retraining
          </span>
        </div>

        <div className="bg-[#0B0F19] border border-[#232D3F] rounded-xl p-4 space-y-3">
          <div className="text-xs text-gray-300 leading-relaxed">
            FindingAI strictly rejects unmonitored automatic retraining to prevent adversarial poisoning and feedback loop degradation. Administrator corrections follow a formalized validation pipeline:
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-[10px]">
            <div className="bg-[#1E293B]/70 border border-[#232D3F] rounded-lg p-2 font-semibold text-blue-300">
              1. AI Prediction
            </div>
            <div className="bg-[#1E293B]/70 border border-[#232D3F] rounded-lg p-2 font-semibold text-purple-300">
              2. Admin Review
            </div>
            <div className="bg-[#1E293B]/70 border border-[#232D3F] rounded-lg p-2 font-semibold text-amber-300">
              3. Ground-Truth Correction
            </div>
            <div className="bg-[#1E293B]/70 border border-[#232D3F] rounded-lg p-2 font-semibold text-emerald-300">
              4. Verified Feedback Record
            </div>
            <div className="bg-[#1E293B]/70 border border-[#232D3F] rounded-lg p-2 font-semibold text-blue-300">
              5. Validation Dataset
            </div>
            <div className="bg-[#1E293B]/70 border border-[#232D3F] rounded-lg p-2 font-semibold text-purple-300">
              6. Model Evaluation
            </div>
            <div className="bg-[#1E293B]/70 border border-[#232D3F] rounded-lg p-2 font-semibold text-amber-300">
              7. Candidate Improvement
            </div>
            <div className="bg-purple-600/30 border border-purple-500/50 rounded-lg p-2 font-bold text-white">
              8. Production Release
            </div>
          </div>
        </div>
      </div>

      {/* Priority Review Queue & Audit Log Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Review Queue (2 Cols) */}
        <div className="lg:col-span-2 bg-[#111827] border border-[#232D3F] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>Priority Cases Awaiting Review ({pendingCases.length})</span>
            </h3>
            <button
              onClick={onNavigateToReviewQueue}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              <span>View Full Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingCases.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[#232D3F] rounded-xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs text-gray-300 font-semibold">Review Queue Clean</p>
              <p className="text-[11px] text-gray-500">All submitted cases have been verified by examiners.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingCases.slice(0, 4).map((c) => (
                <div
                  key={c.caseId}
                  className="bg-[#0B0F19] border border-[#232D3F] hover:border-purple-500/40 rounded-xl p-3.5 flex items-center justify-between gap-3 transition"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-400">{c.caseId}</span>
                      <span className="text-xs font-semibold text-white truncate max-w-[160px]">{c.filename}</span>
                      {c.isDemoCase && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[9px] font-mono">
                          DEMO DATA
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-2">
                      <span>AI: <strong className="text-amber-400">{c.originalAiVerdict} ({c.aiProbability}%)</strong></span>
                      <span>•</span>
                      <span>Analyst: {c.userName}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectCaseToReview(c)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow shrink-0"
                  >
                    Review Case
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Admin Audit Logs Widget */}
        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-purple-400" />
              <span>Recent Audit Logs</span>
            </h3>
            <button
              onClick={onNavigateToAuditLogs}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
            >
              All Logs
            </button>
          </div>

          <div className="space-y-2.5">
            {auditLogs.slice(0, 4).map((l) => (
              <div key={l.id} className="bg-[#0B0F19] border border-[#232D3F] rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono text-purple-400 font-bold">{l.action}</span>
                  <span className="text-gray-500 font-mono">{new Date(l.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed">{l.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
