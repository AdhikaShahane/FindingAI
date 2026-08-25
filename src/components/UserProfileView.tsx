import React from 'react';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Lock,
  Building,
  Mail,
  BadgeAlert,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { USER_PERMISSIONS } from '../utils/auth';

interface UserProfileViewProps {
  currentUser: UserProfile;
  onSwitchRole: (role: UserRole) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ currentUser, onSwitchRole }) => {
  const isAdmin = currentUser.role === 'admin';
  const permissions = USER_PERMISSIONS[currentUser.role];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header Profile Card */}
      <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg ${
                isAdmin
                  ? 'bg-purple-600/20 border border-purple-500/40 text-purple-300'
                  : 'bg-blue-600/20 border border-blue-500/40 text-blue-300'
              }`}
            >
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">{currentUser.name}</h1>
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-purple-950/80 border border-purple-500/40 text-purple-300'
                      : 'bg-blue-950/80 border border-blue-500/40 text-blue-300'
                  }`}
                >
                  {currentUser.role}
                </span>
              </div>
              <div className="text-xs text-[#8B96A8] flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{currentUser.email}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-gray-400" />
                  <span>{currentUser.organization}</span>
                </span>
              </div>
              <div className="text-[11px] font-mono text-blue-400">
                Badge #{currentUser.badgeNumber || 'FA-9042'}
              </div>
            </div>
          </div>

          <button
            onClick={() => onSwitchRole(isAdmin ? 'user' : 'admin')}
            className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#283548] text-white font-semibold text-xs border border-[#232D3F] transition flex items-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4 text-blue-400" />
            <span>Switch to {isAdmin ? 'Normal User' : 'Administrator'}</span>
          </button>
        </div>
      </div>

      {/* Role Capabilities Grid */}
      <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#232D3F] pb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-400" />
            <span>Role-Based Access Control (RBAC) Permissions</span>
          </h2>
          <span className="text-xs text-gray-400">Current Role: <strong className="text-white capitalize">{currentUser.role}</strong></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { key: 'canUploadAndAnalyze', label: 'Upload & Perform Forensic Analysis', desc: 'Run multi-layer ELA, FFT, and semantic reasoning.' },
            { key: 'canViewEvidenceLayers', label: 'Inspect Visual Evidence Layers', desc: 'View spectral maps, ELA masks, and scene graphs.' },
            { key: 'canDownloadReport', label: 'Download Forensic Case Reports', desc: 'Export full PDF/HTML forensic certificates.' },
            { key: 'canReportCorrection', label: 'Submit User Feedback / Corrections', desc: 'Flag potential false positives for examiner review.' },
            { key: 'canViewOwnCases', label: 'View Own Case Submissions', desc: 'Access history of uploaded files and case IDs.' },
            { key: 'canAccessAdminDashboard', label: 'Access Administrator Portal', desc: 'Access system metrics and directorate tools.' },
            { key: 'canReviewCases', label: 'Review & Verify Contested Cases', desc: 'Set official ground-truth classifications.' },
            { key: 'canModifyGroundTruth', label: 'Modify Ground Truth Decisions', desc: 'Update training benchmark validation sets.' },
            { key: 'canExportVerifiedDataset', label: 'Export Verified ML Feedback Dataset', desc: 'Download CSV datasets for candidate retraining.' },
            { key: 'canModifyWeights', label: 'Modify Evidence Fusion Weights', desc: 'Configure experimental channel weights.' },
          ].map((item) => {
            const isAllowed = (permissions as any)[item.key];
            return (
              <div
                key={item.key}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition ${
                  isAllowed
                    ? 'bg-[#0B0F19] border-[#232D3F]'
                    : 'bg-[#0B0F19]/40 border-red-950/40 opacity-75'
                }`}
              >
                {isAllowed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={`text-xs font-semibold ${isAllowed ? 'text-white' : 'text-gray-400'}`}>
                    {item.label}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
