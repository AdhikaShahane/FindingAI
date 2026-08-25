import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Workspace } from './components/Workspace';
import { ModelMonitoring } from './components/ModelMonitoring';
import { FeedbackLedger } from './components/FeedbackLedger';
import { AboutMethodology } from './components/AboutMethodology';

export function App() {
  const [activeTab, setActiveTab] = useState<'workspace' | 'monitoring' | 'ledger' | 'about'>('workspace');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFeedbackSubmitted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen bg-[#0B0F19] text-[#E5E9F0] overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#0B0F19] min-w-0">
        {activeTab === 'workspace' && <Workspace onFeedbackSubmitted={handleFeedbackSubmitted} />}
        {activeTab === 'monitoring' && <ModelMonitoring key={refreshTrigger} />}
        {activeTab === 'ledger' && <FeedbackLedger key={refreshTrigger} />}
        {activeTab === 'about' && <AboutMethodology />}
      </main>
    </div>
  );
}

export default App;
