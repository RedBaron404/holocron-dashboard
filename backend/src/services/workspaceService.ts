import { randomUUID } from 'node:crypto';
import {
  appendSheetRow,
  readSheetTab,
  rowToCamel,
  updateSheetRowByKey,
} from '../lib/sheetsOrm.js';
import { isWorkspaceConfigured } from '../lib/googleClient.js';
import type { ActivityLogEntry } from '../types/activity.js';
import { ACTIVITY_COLUMNS, activityLogSchema } from '../types/activity.js';
import type { AuditEntry } from '../types/audit.js';
import { AUDIT_COLUMNS, auditEntrySchema } from '../types/audit.js';
import type { DcfEntry } from '../types/dcf.js';
import { DCF_COLUMNS, dcfEntrySchema } from '../types/dcf.js';
import type { CreateNCREntry, NCREntry } from '../types/ncr.js';
import { NCR_COLUMNS, ncrPhaseSchema } from '../types/ncr.js';
import type { PolicyEntry } from '../types/policy.js';
import { POLICY_COLUMNS, policyEntrySchema } from '../types/policy.js';
import type { ProgramTask } from '../types/program.js';
import { PROGRAM_COLUMNS, programTaskSchema } from '../types/program.js';
import type { CreateRiskEntry, RiskEntry } from '../types/risk.js';
import { RISK_COLUMNS, riskEntrySchema } from '../types/risk.js';

function requireSheetId(envKey: string): string {
  const id = process.env[envKey];
  if (!id) {
    throw new Error(`${envKey} is not configured`);
  }
  return id;
}

function notConfigured(operation: string): never {
  throw new Error(
    `${operation}: configure GOOGLE_SERVICE_ACCOUNT_JSON and sheet IDs — see docs/intake/ACCESS_CHECKLIST.md`,
  );
}

async function readRegister<T>(
  envKey: string,
  tabName: string,
  columns: readonly string[],
  schema: { parse: (v: unknown) => T },
): Promise<readonly T[]> {
  if (!isWorkspaceConfigured()) notConfigured(`read ${tabName}`);
  const sheetId = requireSheetId(envKey);
  const rows = await readSheetTab(sheetId, tabName);
  return rows.map((row) => schema.parse(rowToCamel(row, columns)));
}

export async function getRiskRegister(): Promise<readonly RiskEntry[]> {
  return readRegister(
    'SHEET_RISK_REGISTER_ID',
    'Risks',
    RISK_COLUMNS,
    riskEntrySchema,
  );
}

export async function appendRiskEntry(data: CreateRiskEntry): Promise<RiskEntry> {
  if (!isWorkspaceConfigured()) notConfigured('appendRiskEntry');
  const sheetId = requireSheetId('SHEET_RISK_REGISTER_ID');
  const riskId = data.riskId ?? `RISK-${randomUUID().slice(0, 8)}`;
  const entry: RiskEntry = riskEntrySchema.parse({
    ...data,
    riskId,
    status: data.status ?? 'Draft',
    updatedAt: new Date().toISOString(),
  });
  await appendSheetRow(sheetId, 'Risks', RISK_COLUMNS, entry);
  return entry;
}

export async function updateRiskEntry(
  riskId: string,
  updates: Partial<RiskEntry>,
): Promise<boolean> {
  if (!isWorkspaceConfigured()) notConfigured('updateRiskEntry');
  const sheetId = requireSheetId('SHEET_RISK_REGISTER_ID');
  return updateSheetRowByKey(
    sheetId,
    'Risks',
    RISK_COLUMNS,
    'risk_id',
    riskId,
    { ...updates, updatedAt: new Date().toISOString() },
  );
}

export async function getPolicyRegister(): Promise<readonly PolicyEntry[]> {
  return readRegister(
    'SHEET_POLICY_REGISTER_ID',
    'Policies',
    POLICY_COLUMNS,
    policyEntrySchema,
  );
}

export async function updatePolicyEntry(
  policyId: string,
  updates: Partial<PolicyEntry>,
): Promise<boolean> {
  if (!isWorkspaceConfigured()) notConfigured('updatePolicyEntry');
  const sheetId = requireSheetId('SHEET_POLICY_REGISTER_ID');
  return updateSheetRowByKey(
    sheetId,
    'Policies',
    POLICY_COLUMNS,
    'policy_id',
    policyId,
    updates,
  );
}

export async function getProgramCalendar(): Promise<readonly ProgramTask[]> {
  return readRegister(
    'SHEET_PROGRAM_CALENDAR_ID',
    'ProgramCalendar',
    PROGRAM_COLUMNS,
    programTaskSchema,
  );
}

export async function getAuditCalendar(): Promise<readonly AuditEntry[]> {
  return readRegister(
    'SHEET_AUDIT_CALENDAR_ID',
    'AuditCalendar',
    AUDIT_COLUMNS,
    auditEntrySchema,
  );
}

export async function appendAuditEntry(entry: AuditEntry): Promise<void> {
  if (!isWorkspaceConfigured()) notConfigured('appendAuditEntry');
  const sheetId = requireSheetId('SHEET_AUDIT_CALENDAR_ID');
  await appendSheetRow(sheetId, 'AuditCalendar', AUDIT_COLUMNS, entry);
}

export async function updateAuditEntry(
  auditId: string,
  updates: Partial<AuditEntry>,
): Promise<boolean> {
  if (!isWorkspaceConfigured()) notConfigured('updateAuditEntry');
  const sheetId = requireSheetId('SHEET_AUDIT_CALENDAR_ID');
  return updateSheetRowByKey(
    sheetId,
    'AuditCalendar',
    AUDIT_COLUMNS,
    'audit_id',
    auditId,
    updates,
  );
}

export async function getDcfMap(): Promise<readonly DcfEntry[]> {
  return readRegister(
    'SHEET_DCF_MAP_ID',
    'DCF',
    DCF_COLUMNS,
    dcfEntrySchema,
  );
}

export async function getOpenNCRs(): Promise<readonly NCREntry[]> {
  const all = await getNCRLog();
  return all.filter((n) => n.phase !== 'Closed');
}

export async function getNCRLog(): Promise<readonly NCREntry[]> {
  if (!isWorkspaceConfigured()) notConfigured('getNCRLog');
  const sheetId = requireSheetId('SHEET_NCR_LOG_ID');
  const rows = await readSheetTab(sheetId, 'NCR');
  return rows.map((row) => {
    const parsed = rowToCamel<Record<string, string>>(row, NCR_COLUMNS);
    return {
      ncrId: parsed.ncrId ?? '',
      title: parsed.title ?? '',
      description: parsed.description ?? '',
      impact: parsed.impact as NCREntry['impact'],
      likelihood: parsed.likelihood as NCREntry['likelihood'],
      phase: ncrPhaseSchema.parse(parsed.phase ?? 'Identify'),
      createdAt: parsed.createdAt ?? '',
      createdBy: parsed.createdBy ?? '',
      ...(parsed.dcfControlId ? { dcfControlId: parsed.dcfControlId } : {}),
      ...(parsed.containmentAction
        ? { containmentAction: parsed.containmentAction }
        : {}),
      ...(parsed.rootCause ? { rootCause: parsed.rootCause } : {}),
      ...(parsed.correctiveAction
        ? { correctiveAction: parsed.correctiveAction }
        : {}),
      ...(parsed.preventiveAction
        ? { preventiveAction: parsed.preventiveAction }
        : {}),
      ...(parsed.verifiedBy ? { verifiedBy: parsed.verifiedBy } : {}),
    } satisfies NCREntry;
  });
}

export async function appendNCREntry(
  data: CreateNCREntry,
  createdBy: string,
): Promise<NCREntry> {
  if (!isWorkspaceConfigured()) notConfigured('appendNCREntry');
  const sheetId = requireSheetId('SHEET_NCR_LOG_ID');
  const entry: NCREntry = {
    ...data,
    ncrId: randomUUID(),
    phase: 'Identify',
    createdAt: new Date().toISOString(),
    createdBy,
  };
  await appendSheetRow(sheetId, 'NCR', NCR_COLUMNS, {
    ...entry,
    dcfControlId: data.dcfControlId,
  });
  return entry;
}

export async function getActivityLog(
  limit = 100,
): Promise<readonly ActivityLogEntry[]> {
  if (!isWorkspaceConfigured()) notConfigured('getActivityLog');
  const sheetId = requireSheetId('SHEET_ACTIVITY_LOG_ID');
  const rows = await readSheetTab(sheetId, 'AgentActivity');
  const entries = rows.map((row) =>
    activityLogSchema.parse(rowToCamel(row, ACTIVITY_COLUMNS)),
  );
  return entries.slice(-limit).reverse();
}

export async function appendActivityLog(
  partial: Omit<ActivityLogEntry, 'logId' | 'timestamp'> & {
    logId?: string;
    timestamp?: string;
  },
): Promise<ActivityLogEntry> {
  if (!isWorkspaceConfigured()) notConfigured('appendActivityLog');
  const sheetId = requireSheetId('SHEET_ACTIVITY_LOG_ID');
  const entry = activityLogSchema.parse({
    ...partial,
    logId: partial.logId ?? randomUUID(),
    timestamp: partial.timestamp ?? new Date().toISOString(),
  });
  await appendSheetRow(sheetId, 'AgentActivity', ACTIVITY_COLUMNS, entry);
  return entry;
}

export async function generatePolicyDocument(
  title: string,
  content: string,
): Promise<{ documentId: string; webViewLink: string }> {
  if (!isWorkspaceConfigured()) notConfigured('generatePolicyDocument');
  const { getDocsClient, getDriveClient } = await import('../lib/googleClient.js');
  const docs = getDocsClient();
  const drive = getDriveClient();

  const created = await docs.documents.create({
    requestBody: { title },
  });
  const documentId = created.data.documentId;
  if (!documentId) throw new Error('Failed to create document');

  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: content,
          },
        },
      ],
    },
  });

  const draftsFolder = process.env.DRIVE_DRAFTS_FOLDER_ID;
  if (draftsFolder) {
    await drive.files.update({
      fileId: documentId,
      addParents: draftsFolder,
      fields: 'id, parents',
    });
  }

  const meta = await drive.files.get({
    fileId: documentId,
    fields: 'webViewLink',
  });

  return {
    documentId,
    webViewLink: meta.data.webViewLink ?? `https://docs.google.com/document/d/${documentId}`,
  };
}

export async function exportDocToPDF(
  fileId: string,
  archiveName: string,
): Promise<string> {
  if (!isWorkspaceConfigured()) notConfigured('exportDocToPDF');
  const { getDriveClient } = await import('../lib/googleClient.js');
  const drive = getDriveClient();
  const archiveFolder = process.env.DRIVE_ARCHIVE_FOLDER_ID;
  if (!archiveFolder) {
    throw new Error('DRIVE_ARCHIVE_FOLDER_ID is not configured');
  }

  const pdf = await drive.files.export(
    { fileId, mimeType: 'application/pdf' },
    { responseType: 'arraybuffer' },
  );

  const uploaded = await drive.files.create({
    requestBody: {
      name: archiveName,
      parents: [archiveFolder],
      mimeType: 'application/pdf',
    },
    media: {
      mimeType: 'application/pdf',
      body: Buffer.from(pdf.data as ArrayBuffer),
    },
  });

  const archiveId = uploaded.data.id;
  if (!archiveId) throw new Error('Failed to upload PDF archive');
  return archiveId;
}

export async function initiateDocumentApproval(
  fileId: string,
  reviewerEmails: readonly string[],
): Promise<{ status: 'started' | 'manual_fallback'; message: string }> {
  if (!isWorkspaceConfigured()) notConfigured('initiateDocumentApproval');
  try {
    const { getDriveClient } = await import('../lib/googleClient.js');
    const drive = getDriveClient();
    // Drive Approvals API — may require user OAuth on some Workspace tiers
    const driveAny = drive as unknown as {
      files: {
        approvals: {
          start: (opts: {
            fileId: string;
            requestBody: { recipients: { emailAddress: string }[] };
          }) => Promise<unknown>;
        };
      };
    };
    if (!driveAny.files?.approvals?.start) {
      return {
        status: 'manual_fallback',
        message: `Drive Approvals API unavailable. Notify reviewers manually: ${reviewerEmails.join(', ')}`,
      };
    }
    await driveAny.files.approvals.start({
      fileId,
      requestBody: {
        recipients: reviewerEmails.map((email) => ({ emailAddress: email })),
      },
    });
    return { status: 'started', message: 'Approval workflow started' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      status: 'manual_fallback',
      message: `Drive Approvals failed (${msg}). Use manual approval tracking.`,
    };
  }
}
