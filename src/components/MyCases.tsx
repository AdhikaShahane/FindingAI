import React, { useState } from 'react';
import {
  FolderLock,
  Search,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  ShieldAlert,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import { ForensicCase } from '../types';

interface MyCasesProps {
  cases: ForensicCase[];
  onSelectCase: (c: ForensicCase) => void;
  onOpenFeedbackForCase?: (c: ForensicCase) => void;
}

export const MyCases: React.FC<MyCasesProps> = ({ cases, onSelectCase, onOpenFeedbackForCase }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'conflict'>('all');

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fileHash.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'pending') return c.adminReviewStatus === 'Pending Review';
    if (statusFilter === 'reviewed') return c.adminReviewStatus === 'Reviewed';
    if (statusFilter === 'conflict') return c.evidenceConflict === true;

    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderLock className="w-6 h-6 text-blue-400" />
            <span>My Forensic Cases Ledger</span>
          </h1>
          <p className="text-xs text-[#8B96A8] mt-1">
            Browse and inspect all submitted digital evidence files, automated AI predictions, and Chief Examiner verification statuses.
          </p>
        </div>

        <div className="text-xs font-semibold text-gray-300 bg-[#111827] px-3.5 py-2 rounded-xl border border-[#232D3F]">
          Total Cases: <span className="text-blue-400 font-bold">{cases.length}</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Case ID (FA-2026-...), filename, or SHA-256 hash..."
            className="w-full bg-[#111827] border border-[#232D3F] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Cases' },
            { id: 'pending', label: 'Pending Review' },
            { id: 'reviewed', label: 'Admin Verified' },
            { id: 'conflict', label: 'Evidence Conflicts' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === f.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-[#111827] text-gray-400 hover:text-white border border-[#232D3F]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#111827] border border-[#232D3F] rounded-2xl overflow-hidden shadow-xl">
        {filteredCases.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FolderLock className="w-12 h-12 text-[#232D3F] mx-auto" />
            <h3 className="text-base font-semibold text-gray-300">No Forensic Cases Found</h3>
            <p className="text-xs text-[#8B96A8] max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'No cases match your filter criteria. Try resetting the search or filter.'
                : 'Upload an image in the New Analysis tab to generate your first forensic case record.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#1E293B] text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-[#232D3F]">
                <tr>
                  <th className="px-4 py-3">Case ID</th>
                  <th className="px-4 py-3">Filename</th>
                  <th className="px-4 py-3">SHA-256 Hash</th>
                  <th className="px-4 py-3">AI Verdict</th>
                  <th className="px-4 py-3">AI Prob / Conf</th>
                  <th className="px-4 py-3">Evidence State</th>
                  <th className="px-4 py-3">Human Verification</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232D3F]">
                {filteredCases.map((c) => (
                  <tr key={c.caseId} className="hover:bg-[#1E293B]/40 transition">
                    <td className="px-4 py-3 font-mono text-[11px] text-blue-400 font-bold whitespace-nowrap">
                      {c.caseId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white max-w-[160px] truncate">{c.filename}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{c.fileSize} • {c.resolution}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-gray-400 max-w-[110px] truncate">
                      {c.fileHash}
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
                        {c.originalAiVerdict}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px]">
                      <span className="text-white font-bold">{c.aiProbability}%</span>
                      <span className="text-gray-500 ml-1">({c.aiConfidence})</span>
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
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>{c.adminVerdict || 'VERIFIED'}</span>
                          </span>
                          {c.adminVerifiedLabel && (
                            <div className="text-[9px] text-gray-400 truncate max-w-[130px]">
                              Truth: {c.adminVerifiedLabel}
                            </div>
                          )}
                        </div>
                      ) : c.adminReviewStatus === 'Inconclusive' ? (
                        <span className="px-2 py-0.5 rounded bg-amber-950/50 border border-amber-500/40 text-amber-300 text-[10px]">
                          INCONCLUSIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-400 text-[10px]">
                          NOT REVIEWED
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => onSelectCase(c)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow"
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
    </div>
  );
};
