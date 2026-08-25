import React from 'react';
import { Search, BarChart3, Database, Info, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  activeTab: 'workspace' | 'monitoring' | 'ledger' | 'about';
  setActiveTab: (tab: 'workspace' | 'monitoring' | 'ledger' | 'about') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'workspace', label: 'Analysis Workspace', icon: Search },
    { id: 'monitoring', label: 'Model Monitoring', icon: BarChart3 },
    { id: 'ledger', label: 'Feedback Ledger', icon: Database },
    { id: 'about', label: 'About / Methodology', icon: Info },
  ] as const;

  return (
    <aside className="w-64 bg-[#111827] border-r border-[#232D3F] flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Logo & Header */}
        <div className="p-5 border-b border-[#232D3F] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-wider">FINDING AI</h1>
            <p className="text-xs text-[#8B96A8]">Truth Beyond Pixels</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-[#8B96A8] hover:text-white hover:bg-[#1E293B]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8B96A8]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-[#232D3F] bg-[#0B0F19]/50">
        <div className="text-[11px] text-[#8B96A8] space-y-1">
          <p className="font-semibold text-gray-300">Evidence Fusion Engine</p>
          <p>Local simulated forensic pipeline with optional Gemini 2.5 Flash vision audit.</p>
          <div className="pt-2 flex items-center gap-1.5 text-emerald-400 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>100% Client-Side Privacy</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
