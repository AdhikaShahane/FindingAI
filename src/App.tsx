import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Workspace } from './components/Workspace';
import { UserDashboard } from './components/UserDashboard';
import { MyCases } from './components/MyCases';
import { AdminDashboard } from './components/AdminDashboard';
import { CaseReviewQueue } from './components/CaseReviewQueue';
import { FeedbackDatasetView } from './components/FeedbackDatasetView';
import { ModelMonitoring } from './components/ModelMonitoring';
import { AuditLogsView } from './components/AuditLogsView';
import { SystemHealthView } from './components/SystemHealthView';
import { UserProfileView } from './components/UserProfileView';
import { AboutMethodology } from './components/AboutMethodology';
import { ForensicReportModal } from './components/ForensicReportModal';
import { UserProfile, UserRole, ForensicCase } from './types';
import { getCurrentUser, switchRole, hasAdminAccess } from './utils/auth';
import { getAllCases } from './utils/caseManager';
import { getAuditLogs, logAdminAction } from './utils/auditLogger';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [cases, setCases] = useState<ForensicCase[]>(getAllCases());
  const [auditLogs, setAuditLogs] = useState(getAuditLogs());
  const [selectedCaseForReport, setSelectedCaseForReport] = useState<ForensicCase | null>(null);
  const [selectedCaseIdForReview, setSelectedCaseIdForReview] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isAdmin = hasAdminAccess(currentUser);

  // Sync state when user changes or action taken
  const refreshData = () => {
    setCases(getAllCases());
    setAuditLogs(getAuditLogs());
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  const handleRoleSwitch = (newRole: UserRole) => {
    const updated = switchRole(newRole);
    setCurrentUser(updated);

    logAdminAction({
      adminId: updated.id,
      adminName: updated.name,
      action: 'ROLE_SWITCHED',
      description: `Active role switched to ${newRole.toUpperCase()} by ${updated.name}.`,
      severity: 'INFO',
    });

    if (newRole === 'admin') {
      setActiveTab('admin-dashboard');
    } else {
      setActiveTab('dashboard');
    }
    refreshData();
  };

  const handleCaseCreated = (newCase: ForensicCase) => {
    refreshData();
  };

  const handleNavigateToReviewCase = (c: ForensicCase) => {
    setSelectedCaseIdForReview(c.caseId);
    setActiveTab('case-review');
  };

  const pendingReviewCount = cases.filter((c) => c.adminReviewStatus === 'Pending Review').length;

  return (
    <div className="flex h-screen bg-[#0B0F19] text-[#E5E9F0] overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSwitchRole={handleRoleSwitch}
        pendingReviewCount={pendingReviewCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#0B0F19] min-w-0">
        {/* Normal User Routes */}
        {activeTab === 'dashboard' && (
          <UserDashboard
            currentUser={currentUser}
            cases={cases}
            onNavigateToWorkspace={() => setActiveTab('workspace')}
            onNavigateToCases={() => setActiveTab('my-cases')}
            onSelectCase={(c) => setSelectedCaseForReport(c)}
          />
        )}

        {activeTab === 'workspace' && (
          <Workspace
            onFeedbackSubmitted={refreshData}
            onCaseCreated={handleCaseCreated}
          />
        )}

        {(activeTab === 'my-cases' || activeTab === 'reports') && (
          <MyCases
            cases={isAdmin ? cases : cases.filter((c) => c.userId === currentUser.id)}
            onSelectCase={(c) => setSelectedCaseForReport(c)}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfileView
            currentUser={currentUser}
            onSwitchRole={handleRoleSwitch}
          />
        )}

        {/* Administrator Routes (Guarded) */}
        {activeTab === 'admin-dashboard' && (
          isAdmin ? (
            <AdminDashboard
              currentUser={currentUser}
              cases={cases}
              auditLogs={auditLogs}
              onNavigateToReviewQueue={() => setActiveTab('case-review')}
              onNavigateToDataset={() => setActiveTab('feedback-dataset')}
              onNavigateToMonitoring={() => setActiveTab('model-monitoring')}
              onNavigateToAuditLogs={() => setActiveTab('audit-logs')}
              onSelectCaseToReview={handleNavigateToReviewCase}
            />
          ) : (
            <div className="p-12 text-center text-gray-400">Access Denied. Administrator role required.</div>
          )
        )}

        {activeTab === 'case-review' && (
          isAdmin ? (
            <CaseReviewQueue
              cases={cases}
              selectedCaseId={selectedCaseIdForReview}
              onCaseReviewed={refreshData}
            />
          ) : (
            <div className="p-12 text-center text-gray-400">Access Denied. Administrator role required.</div>
          )
        )}

        {activeTab === 'feedback-dataset' && (
          isAdmin ? (
            <FeedbackDatasetView />
          ) : (
            <div className="p-12 text-center text-gray-400">Access Denied. Administrator role required.</div>
          )
        )}

        {activeTab === 'model-monitoring' && (
          isAdmin ? (
            <ModelMonitoring key={refreshTrigger} />
          ) : (
            <div className="p-12 text-center text-gray-400">Access Denied. Administrator role required.</div>
          )
        )}

        {activeTab === 'audit-logs' && (
          isAdmin ? (
            <AuditLogsView logs={auditLogs} />
          ) : (
            <div className="p-12 text-center text-gray-400">Access Denied. Administrator role required.</div>
          )
        )}

        {activeTab === 'system-health' && (
          isAdmin ? (
            <SystemHealthView />
          ) : (
            <div className="p-12 text-center text-gray-400">Access Denied. Administrator role required.</div>
          )
        )}

        {/* About & Methodology (Accessible to both) */}
        {activeTab === 'about' && <AboutMethodology />}
      </main>

      {/* Global Forensic Report Modal */}
      {selectedCaseForReport && (
        <ForensicReportModal
          caseData={selectedCaseForReport}
          onClose={() => setSelectedCaseForReport(null)}
        />
      )}
    </div>
  );
}

export default App;
