import React, { useState } from 'react';
import {
  Database,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { getVerifiedFeedbackDataset, exportFeedbackCSV } from '../utils/feedback';

export const FeedbackDatasetView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const dataset = getVerifiedFeedbackDataset();

  const filtered = dataset.filter((d) => {
    return (
      d.case_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.image_hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.admin_verdict.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.reviewed_by.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const truePositives = dataset.filter(
    (d) => d.ai_verdict === 'LIKELY AI GENERATED' && d.admin_verdict === 'LIKELY AI GENERATED'
  ).length;
  const falsePositives = dataset.filter(
    (d) => d.ai_verdict === 'LIKELY AI GENERATED' && d.admin_verdict === 'LIKELY AUTHENTIC'
  ).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-400" />
            <span>Verified Ground-Truth Feedback Dataset</span>
          </h1>
          <p className="text-xs text-[#8B96A8] mt-1">
            Curated human-verified dataset of evaluated images used for candidate model retraining evaluation, false-positive mitigation, and benchmark scoring.
          </p>
        </div>

        <button
          onClick={exportFeedbackCSV}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-purple-600/25 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Dataset (CSV)</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-bold text-[#8B96A8] uppercase tracking-wider">Total Verified Samples</div>
          <div className="text-2xl font-black text-white">{dataset.length}</div>
          <div className="text-[10px] text-gray-400">Ready for candidate model evaluation</div>
        </div>

        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-bold text-[#8B96A8] uppercase tracking-wider">True Positives Confirmed</div>
          <div className="text-2xl font-black text-purple-300">{truePositives}</div>
          <div className="text-[10px] text-gray-400">Accurately detected synthetic images</div>
        </div>

        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-bold text-[#8B96A8] uppercase tracking-wider">False Positives Corrected</div>
          <div className="text-2xl font-black text-emerald-400">{falsePositives}</div>
          <div className="text-[10px] text-gray-400">Preventing future classification errors</div>
        </div>
      </div>

      {/* Dataset Guidance Banner */}
      <div className="bg-[#111827] border border-purple-500/30 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-gray-300">
          <div className="font-bold text-white">Controlled Retraining Dataset Specification</div>
          <p className="leading-relaxed text-[#8B96A8]">
            This exportable dataset adheres to standard benchmark formatting with columns: <code className="text-purple-300">case_id</code>, <code className="text-purple-300">image_hash</code>, <code className="text-purple-300">ai_verdict</code>, <code className="text-purple-300">ai_probability</code>, <code className="text-purple-300">admin_verdict</code>, <code className="text-purple-300">correction_reason</code>, <code className="text-purple-300">reviewed_by</code>, and <code className="text-purple-300">review_timestamp</code>.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search verified records by Case ID, SHA-256 hash, verdict, or examiner name..."
          className="w-full bg-[#111827] border border-[#232D3F] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Dataset Table */}
      <div className="bg-[#111827] border border-[#232D3F] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#1E293B] text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-[#232D3F]">
              <tr>
                <th className="px-4 py-3">Case ID</th>
                <th className="px-4 py-3">Image SHA-256 Hash</th>
                <th className="px-4 py-3">AI Verdict</th>
                <th className="px-4 py-3">AI Prob</th>
                <th className="px-4 py-3">Admin Verified Ground Truth</th>
                <th className="px-4 py-3">Correction Reason</th>
                <th className="px-4 py-3">Examiner</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232D3F]">
              {filtered.map((r) => (
                <tr key={r.case_id} className="hover:bg-[#1E293B]/40 transition">
                  <td className="px-4 py-3 font-mono text-[11px] text-purple-400 font-bold whitespace-nowrap">
                    {r.case_id}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-gray-400 max-w-[120px] truncate" title={r.image_hash}>
                    {r.image_hash}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-[10px] font-bold text-gray-300">{r.ai_verdict}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-white font-bold whitespace-nowrap">
                    {r.ai_probability}%
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                        r.admin_verdict === 'LIKELY AI GENERATED'
                          ? 'bg-red-950/40 border-red-500/40 text-red-300'
                          : r.admin_verdict === 'LIKELY AUTHENTIC'
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                      }`}
                    >
                      {r.admin_verdict}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-gray-300 max-w-[200px] truncate" title={r.correction_reason}>
                    {r.correction_reason}
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-[11px]">
                    {r.reviewed_by}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-gray-500 whitespace-nowrap">
                    {new Date(r.review_timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
