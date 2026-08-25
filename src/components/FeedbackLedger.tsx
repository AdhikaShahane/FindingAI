import React, { useState, useEffect } from 'react';
import { Database, Download, Trash2, Search, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { getFeedbackLog, clearFeedbackLog, exportFeedbackCSV } from '../utils/feedback';
import { FeedbackRecord } from '../types';

export const FeedbackLedger: React.FC = () => {
  const [log, setLog] = useState<FeedbackRecord[]>([]);
  const [search, setSearch] = useState('');

  const refreshLog = () => {
    setLog(getFeedbackLog());
  };

  useEffect(() => {
    refreshLog();
  }, []);

  const filteredLog = log.filter(
    (item) =>
      item.filename.toLowerCase().includes(search.toLowerCase()) ||
      item.sha256.toLowerCase().includes(search.toLowerCase()) ||
      item.userNotes.toLowerCase().includes(search.toLowerCase())
  );

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all logged human corrections?')) {
      clearFeedbackLog();
      refreshLog();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-amber-400" />
            <span>Human Feedback & Corrections Ledger</span>
          </h1>
          <p className="text-xs text-[#8B96A8] mt-1">
            Auditable log of user-reported classification errors and ground-truth corrections (`feedback_log.csv`).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportFeedbackCSV}
            disabled={log.length === 0}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleClear}
            disabled={log.length === 0}
            className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 disabled:opacity-50 text-red-300 font-semibold text-xs border border-red-500/30 transition flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter corrections by filename, SHA-256 hash, or notes..."
          className="w-full bg-[#111827] border border-[#232D3F] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Table Container */}
      <div className="bg-[#111827] border border-[#232D3F] rounded-2xl overflow-hidden">
        {filteredLog.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Database className="w-12 h-12 text-[#232D3F] mx-auto" />
            <h3 className="text-base font-semibold text-gray-300">No Feedback Corrections Found</h3>
            <p className="text-xs text-[#8B96A8] max-w-md mx-auto">
              When you submit a correction from the Workspace ("Report Incorrect Detection"), it will be appended to this log and preserved in client storage.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#1E293B] text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-[#232D3F]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Filename</th>
                  <th className="px-4 py-3">Predicted Label</th>
                  <th className="px-4 py-3">Corrected Label</th>
                  <th className="px-4 py-3">User Notes</th>
                  <th className="px-4 py-3">SHA-256 Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232D3F]">
                {filteredLog.map((row) => (
                  <tr key={row.id} className="hover:bg-[#1E293B]/50 transition">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400 font-mono text-[11px]">
                      {new Date(row.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white max-w-[180px] truncate">
                      {row.filename}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 font-medium text-[10px]">
                        {row.predictedLabel} ({row.predictedAiProbability}%)
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold text-[10px]">
                        {row.correctedLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 max-w-[240px] truncate">
                      {row.userNotes || 'No notes provided'}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-blue-400 max-w-[120px] truncate">
                      {row.sha256}
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
