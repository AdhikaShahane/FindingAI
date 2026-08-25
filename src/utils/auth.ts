import { UserProfile, UserRole } from '../types';

export const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  user: {
    id: 'usr_001',
    name: 'Analyst Sarah Chen',
    email: 'sarah.chen@findingai.org',
    role: 'user',
    badgeNumber: 'FA-FA-9042',
    organization: 'Cyber Forensic Evidence Unit',
  },
  admin: {
    id: 'adm_001',
    name: 'Chief Examiner Marcus Vance',
    email: 'marcus.vance@findingai.org',
    role: 'admin',
    badgeNumber: 'FA-CHIEF-001',
    organization: 'National Forensic Verification Directorate',
  },
};

const AUTH_STORAGE_KEY = 'finding_ai_current_user';

export function getCurrentUser(): UserProfile {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return DEFAULT_USERS.user;
}

export function setCurrentUser(user: UserProfile): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function switchRole(targetRole: UserRole): UserProfile {
  const newUser = DEFAULT_USERS[targetRole];
  setCurrentUser(newUser);
  return newUser;
}

export function hasAdminAccess(user: UserProfile | null): boolean {
  return user?.role === 'admin';
}

export const USER_PERMISSIONS = {
  user: {
    canUploadAndAnalyze: true,
    canViewEvidenceLayers: true,
    canDownloadReport: true,
    canReportCorrection: true,
    canViewOwnCases: true,
    canAccessAdminDashboard: false,
    canReviewCases: false,
    canModifyGroundTruth: false,
    canExportVerifiedDataset: false,
    canModifyWeights: false,
    canDeleteAuditRecords: false,
  },
  admin: {
    canUploadAndAnalyze: true,
    canViewEvidenceLayers: true,
    canDownloadReport: true,
    canReportCorrection: true,
    canViewOwnCases: true,
    canAccessAdminDashboard: true,
    canReviewCases: true,
    canModifyGroundTruth: true,
    canExportVerifiedDataset: true,
    canModifyWeights: true,
    canDeleteAuditRecords: false, // Immutable audit logs even for admin
  },
};
