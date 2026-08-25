import { AdminAuditRecord } from '../types';

const AUDIT_STORAGE_KEY = 'finding_ai_admin_audit_logs';

export function getAuditLogs(): AdminAuditRecord[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return getInitialAuditLogs();
}

function getInitialAuditLogs(): AdminAuditRecord[] {
  const initialLogs: AdminAuditRecord[] = [
    {
      id: 'aud_101',
      adminId: 'adm_001',
      adminName: 'Chief Examiner Marcus Vance',
      action: 'ADMIN_LOGIN',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      description: 'Administrative session initialized with MFA token authentication.',
      ipAddress: '10.240.12.8',
      severity: 'INFO',
    },
    {
      id: 'aud_102',
      adminId: 'adm_001',
      adminName: 'Chief Examiner Marcus Vance',
      action: 'CASE_REVIEWED',
      caseId: 'FA-2026-000001',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      description: 'Confirmed AI classification: Midjourney v6 synthetic portrait with anatomical digit duplication.',
      severity: 'INFO',
    },
    {
      id: 'aud_103',
      adminId: 'adm_001',
      adminName: 'Chief Examiner Marcus Vance',
      action: 'VERDICT_CORRECTED',
      caseId: 'FA-2026-000002',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      description: 'Corrected false positive from LIKELY AI GENERATED to LIKELY AUTHENTIC (Stage lighting bokeh caused false high-frequency residuals).',
      severity: 'WARNING',
    },
    {
      id: 'aud_104',
      adminId: 'adm_001',
      adminName: 'Chief Examiner Marcus Vance',
      action: 'FEEDBACK_ADDED',
      caseId: 'FA-2026-000002',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      description: 'Appended verified sample to ground-truth feedback dataset for offline candidate model evaluation.',
      severity: 'INFO',
    },
    {
      id: 'aud_105',
      adminId: 'adm_001',
      adminName: 'Chief Examiner Marcus Vance',
      action: 'SECURITY_CHECK',
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
      description: 'Automated cryptographic hash integrity audit passed (100% SHA-256 parity across cases).',
      severity: 'INFO',
    },
  ];
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(initialLogs));
  return initialLogs;
}

export function logAdminAction(
  record: Omit<AdminAuditRecord, 'id' | 'timestamp'>
): AdminAuditRecord {
  const logs = getAuditLogs();
  const newLog: AdminAuditRecord = {
    ...record,
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ipAddress: record.ipAddress || '127.0.0.1 (Local Session)',
    severity: record.severity || 'INFO',
  };
  logs.unshift(newLog);
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
  return newLog;
}

export function exportAuditLogsCSV(): void {
  const logs = getAuditLogs();
  const headers = ['id', 'timestamp', 'admin_id', 'admin_name', 'action', 'case_id', 'severity', 'description'];
  const rows = [headers.join(',')];

  for (const l of logs) {
    const values = [
      l.id,
      l.timestamp,
      `"${l.adminId.replace(/"/g, '""')}"`,
      `"${l.adminName.replace(/"/g, '""')}"`,
      l.action,
      l.caseId || 'N/A',
      l.severity || 'INFO',
      `"${l.description.replace(/"/g, '""')}"`,
    ];
    rows.push(values.join(','));
  }

  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finding_ai_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
