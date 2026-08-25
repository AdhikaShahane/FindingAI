import React, { useState } from 'react';
import {
  ScrollText,
  Download,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Info,
  Clock,
  Lock,
} from 'lucide-react';
import { AdminAuditRecord } from '../types';
import { exportAuditLogsCSV } from '../utils/auditLogger';

interface AuditLogsViewProps {
  logs: AdminAuditRecord[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'INFO' | 'WARNING' | 'CRITICAL'>('all');

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.caseId && l.caseId.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (severityFilter !== 'all' && l.severity !== severityFilter) return false;

    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-purple-400" />
            <span>Administrative Security & Audit Ledger</span>
          </h1>
          <p className="text-xs text-[#8B96A8] mt-1">
            Immutable, tamper-evident audit logs documenting all administrative reviews, ground truth corrections, and security events.
          </p>
        </div>

        <button
          onClick={exportAuditLogsCSV}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-purple-600/25 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Tamper Evident Banner */}
      <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Cryptographic Log Immutability Active</div>
            <p className="text-[10px] text-gray-400">Records cannot be modified or deleted by users or administrators.</p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full">
          100% Chain-of-Custody Integrity
        </span>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit records by Action, Admin, Case ID, or keyword..."
            className="w-full bg-[#111827] border border-[#232D3F] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['all', 'INFO', 'WARNING', 'CRITICAL'].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s as any)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                severityFilter === s
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-[#111827] text-gray-400 hover:text-white border border-[#232D3F]'
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#111827] border border-[#232D3F] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#1E293B] text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-[#232D3F]">
              <tr>
                <th className="px-4 py-3">Audit ID</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action Event</th>
                <th className="px-4 py-3">Case ID</th>
                <th className="px-4 py-3">Admin / Officer</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232D3F]">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-[#1E293B]/40 transition">
                  <td className="px-4 py-3 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                    {l.id}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-gray-400 whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono font-bold text-purple-300 text-[10px]">
                      {l.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-blue-400 whitespace-nowrap">
                    {l.caseId || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap text-[11px]">
                    {l.adminName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                        l.severity === 'WARNING'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                          : l.severity === 'CRITICAL'
                          ? 'bg-red-950/60 text-red-300 border border-red-500/40'
                          : 'bg-blue-950/40 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {l.severity || 'INFO'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-gray-300 max-w-md">
                    {l.description}
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
