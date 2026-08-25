import React from 'react';
import {
  Search,
  FolderLock,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  Layers,
  Cpu,
} from 'lucide-react';
import { UserProfile, ForensicCase } from '../types';

interface UserDashboardProps {
  currentUser: UserProfile;
  cases: ForensicCase[];
  onNavigateToWorkspace: () => void;
  onNavigateToCases: () => void;
  onSelectCase: (c: ForensicCase) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  cases,
  onNavigateToWorkspace,
  onNavigateToCases,
  onSelectCase,
}) => {
  const userCases = cases.filter((c) => c.userId === currentUser.id);
  const totalAnalyzed = userCases.length;
  const aiGeneratedCount = userCases.filter((c) => c.originalAiVerdict === 'LIKELY AI GENERATED').length;
  const authenticCount = userCases.filter((c) => c.originalAiVerdict === 'LIKELY AUTHENTIC').length;
  const inconclusiveCount = userCases.filter((c) => c.originalAiVerdict === 'INCONCLUSIVE').length;
  const reviewedCount = userCases.filter((c) => c.adminReviewStatus === 'Reviewed').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-[#111827] to-[#1E293B]/40 border border-[#232D3F] rounded-2xl p-6 relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Forensics & Probabilistic AI Detection</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-[#8B96A8] leading-relaxed">
            Perform multi-layer forensic examinations with Error Level Analysis (ELA), 2D Fourier frequency spectrums, semantic reality reasoning, and cryptographic chain-of-custody verification.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onNavigateToWorkspace}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-blue-600/25"
            >
              <Search className="w-4 h-4" />
              <span>Start New Forensic Analysis</span>
            </button>
            <button
              onClick={onNavigateToCases}
              className="px-4 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#283548] text-gray-200 font-semibold text-xs border border-[#232D3F] transition flex items-center gap-2"
            >
              <FolderLock className="w-4 h-4 text-gray-400" />
              <span>View My Cases ({totalAnalyzed})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-bold text-[#8B96A8] uppercase tracking-wider">Total Cases Uploaded</div>
          <div className="text-2xl font-black text-white">{totalAnalyzed}</div>
          <div className="text-[10px] text-gray-400">Cryptographically indexed</div>
        </div>

        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-bold text-[#8B96A8] uppercase tracking-wider">AI Generated Flagged</div>
          <div className="text-2xl font-black text-amber-400">{aiGeneratedCount}</div>
          <div className="text-[10px] text-amber-400/80">Synthetic texture indicators</div>
        </div>

        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-bold text-[#8B96A8] uppercase tracking-wider">Camera Authentic</div>
          <div className="text-2xl font-black text-emerald-400">{authenticCount}</div>
          <div className="text-[10px] text-emerald-400/80">Intact sensor & EXIF profile</div>
        </div>

        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-bold text-[#8B96A8] uppercase tracking-wider">Human Verified</div>
          <div className="text-2xl font-black text-blue-400">{reviewedCount}</div>
          <div className="text-[10px] text-blue-400/80">Reviewed by Chief Examiner</div>
        </div>
      </div>

      {/* Responsible Forensics Policy & Disclaimer */}
      <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-amber-200">
          <div className="font-bold text-amber-300">Responsible Forensics & Probabilistic Evidence Disclaimer</div>
          <p className="leading-relaxed">
            FindingAI provides probabilistic forensic indicators and automated analysis. It should not be treated as absolute proof of image authenticity or manipulation. High-impact decisions should involve qualified human forensic examination and independent corroborating evidence.
          </p>
        </div>
      </div>

      {/* Recent Cases Section */}
      <div className="bg-[#111827] border border-[#232D3F] rounded-2xl overflow-hidden space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Recent Forensic Examinations</span>
            </h2>
            <p className="text-[11px] text-[#8B96A8]">Your latest submitted evidence files and automated verdicts.</p>
          </div>
          <button
            onClick={onNavigateToCases}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>See All Cases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {userCases.length === 0 ? (
          <div className="text-center py-8 space-y-2 border border-dashed border-[#232D3F] rounded-xl">
            <Search className="w-8 h-8 text-gray-500 mx-auto" />
            <p className="text-xs text-gray-300 font-medium">No cases uploaded yet in this session.</p>
            <p className="text-[11px] text-gray-500">Upload an image in the New Analysis tab to generate a Case ID.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#1E293B]/60 text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-[#232D3F]">
                <tr>
                  <th className="px-3 py-2.5">Case ID</th>
                  <th className="px-3 py-2.5">Filename</th>
                  <th className="px-3 py-2.5">Date Ingested</th>
                  <th className="px-3 py-2.5">AI Verdict</th>
                  <th className="px-3 py-2.5">Confidence</th>
                  <th className="px-3 py-2.5">Human Verification</th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232D3F]">
                {userCases.slice(0, 5).map((c) => (
                  <tr key={c.caseId} className="hover:bg-[#1E293B]/40 transition">
                    <td className="px-3 py-2.5 font-mono text-[11px] text-blue-400 font-bold">
                      {c.caseId}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-white max-w-[180px] truncate">
                      {c.filename}
                    </td>
                    <td className="px-3 py-2.5 text-gray-400 font-mono text-[11px]">
                      {new Date(c.uploadTimestamp).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                          c.originalAiVerdict === 'LIKELY AI GENERATED'
                            ? 'bg-red-950/40 border-red-500/40 text-red-300'
                            : c.originalAiVerdict === 'LIKELY AUTHENTIC'
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                        }`}
                      >
                        {c.originalAiVerdict}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-gray-300">
                      {c.aiConfidence} ({c.aiProbability}%)
                    </td>
                    <td className="px-3 py-2.5">
                      {c.adminReviewStatus === 'Reviewed' ? (
                        <span className="px-2 py-0.5 rounded bg-blue-950/50 border border-blue-500/40 text-blue-300 text-[10px] font-semibold flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3 text-blue-400" />
                          <span>VERIFIED</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-400 text-[10px]">
                          NOT REVIEWED
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        onClick={() => onSelectCase(c)}
                        className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-[11px] font-semibold transition"
                      >
                        Inspect Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Forensic Multi-Layer Pipeline Overview */}
      <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <span>Multi-Layer Evidence Fusion Architecture</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-[#0B0F19] border border-[#232D3F] rounded-xl p-3.5 space-y-1">
            <div className="text-[11px] font-bold text-blue-400">1. Cryptographic Hashing</div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Computes SHA-256 and MD5 hashes at ingestion to preserve original byte chain of custody.
            </p>
          </div>

          <div className="bg-[#0B0F19] border border-[#232D3F] rounded-xl p-3.5 space-y-1">
            <div className="text-[11px] font-bold text-purple-400">2. Spectral & ELA Forensics</div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              2D Fourier FFT lattice checks and JPEG Error Level Analysis residual variance detection.
            </p>
          </div>

          <div className="bg-[#0B0F19] border border-[#232D3F] rounded-xl p-3.5 space-y-1">
            <div className="text-[11px] font-bold text-emerald-400">3. Semantic Reality Engine</div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Analyzes anatomical biomechanics, object affordances, shadow vectors, and spatial physics.
            </p>
          </div>

          <div className="bg-[#0B0F19] border border-[#232D3F] rounded-xl p-3.5 space-y-1">
            <div className="text-[11px] font-bold text-amber-400">4. Human-in-the-Loop Feedback</div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Chief Examiners verify edge cases, storing verified ground truth for controlled candidate model evaluation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
