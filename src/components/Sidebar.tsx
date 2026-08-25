import React from 'react';
import {
  LayoutDashboard,
  Search,
  FolderLock,
  FileText,
  User,
  ShieldCheck,
  CheckSquare,
  Database,
  BarChart3,
  ScrollText,
  Activity,
  Info,
  UserCheck,
  ShieldAlert,
  ArrowRightLeft,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { hasAdminAccess } from '../utils/auth';

interface SidebarProps {
  currentUser: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchRole: (role: UserRole) => void;
  pendingReviewCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onSwitchRole,
  pendingReviewCount = 0,
}) => {
  const isAdmin = hasAdminAccess(currentUser);

  const userNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workspace', label: 'New Analysis', icon: Search },
    { id: 'my-cases', label: 'My Cases', icon: FolderLock },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'about', label: 'Methodology & Ethics', icon: Info },
  ];

  const adminNavItems: NavItem[] = [
    { id: 'admin-dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    {
      id: 'case-review',
      label: 'Case Review Queue',
      icon: CheckSquare,
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
    },
    { id: 'feedback-dataset', label: 'Feedback Dataset', icon: Database },
    { id: 'model-monitoring', label: 'Model Monitoring', icon: BarChart3 },
    { id: 'audit-logs', label: 'Audit Logs', icon: ScrollText },
    { id: 'system-health', label: 'System Health', icon: Activity },
    { id: 'workspace', label: 'Forensic Workspace', icon: Search },
    { id: 'about', label: 'Methodology & Ethics', icon: Info },
  ];

  const currentNavItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside className="w-64 bg-[#111827] border-r border-[#232D3F] flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Logo & Header */}
        <div className="p-4 border-b border-[#232D3F] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isAdmin
                ? 'bg-purple-600/20 border border-purple-500/40 text-purple-400'
                : 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-white text-sm tracking-wider">FINDING AI</h1>
              </div>
              <p className="text-[10px] text-[#8B96A8]">Human-in-the-Loop Forensics</p>
            </div>
          </div>

          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
              isAdmin
                ? 'bg-purple-950/80 border border-purple-500/40 text-purple-300'
                : 'bg-blue-950/80 border border-blue-500/40 text-blue-300'
            }`}
          >
            {currentUser.role}
          </span>
        </div>

        {/* Role Switcher Bar */}
        <div className="p-3 border-b border-[#232D3F] bg-[#0B0F19]/40">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Active Role:</span>
            </span>
            <button
              onClick={() => onSwitchRole(isAdmin ? 'user' : 'admin')}
              className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/30 transition"
              title="Toggle role for testing & demonstration"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>Switch to {isAdmin ? 'Normal User' : 'Admin'}</span>
            </button>
          </div>
          <div className="text-[11px] text-gray-300 font-semibold truncate">{currentUser.name}</div>
          <div className="text-[10px] text-gray-500 truncate">{currentUser.organization}</div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            {isAdmin ? 'Administrator Portal' : 'Forensic Analyst Menu'}
          </div>
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? isAdmin
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-[#8B96A8] hover:text-white hover:bg-[#1E293B]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8B96A8]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-[#232D3F] bg-[#0B0F19]/60">
        <div className="text-[10px] text-[#8B96A8] space-y-1">
          <div className="flex items-center justify-between font-semibold text-gray-300">
            <span>Controlled Retraining</span>
            <span className="text-emerald-400">Active</span>
          </div>
          <p className="text-[10px] leading-tight">
            Human feedback records are stored for offline candidate validation.
          </p>
          <div className="pt-1.5 flex items-center gap-1.5 text-blue-400 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            <span>SHA-256 Chain of Custody</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
