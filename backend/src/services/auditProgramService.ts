import type { AuditEntry } from '../types/audit.js';
import { QUARTERLY_AUDIT_SCOPE } from '../types/audit.js';
import type { DcfEntry } from '../types/dcf.js';
import {
  appendActivityLog,
  appendAuditEntry,
  getAuditCalendar,
  getDcfMap,
  getOpenNCRs,
  updateAuditEntry,
} from './workspaceService.js';
import { scanPolicyDueDates } from './policyLifecycleService.js';
import { scanRiskStaleness } from './riskWorkflowService.js';
import { sendNotification } from './notificationService.js';

const QUARTER_DOMAIN: Record<string, AuditEntry['domain']> = {
  Q1: 'ISMS',
  Q2: 'PIMS',
  Q3: 'AIMS',
  Q4: 'Integrated',
};

export async function generateAnnualAuditPlan(
  year: number,
): Promise<readonly AuditEntry[]> {
  const dcf = await getDcfMap();
  const plan: AuditEntry[] = [];

  for (const [quarter, domain] of Object.entries(QUARTER_DOMAIN)) {
    const domainControls = dcf.filter(
      (c) => !c.domain || c.domain === domain || domain === 'Integrated',
    );
    const refs =
      domain === 'Integrated'
        ? '[YOUR POLICY FOR IMS Management Review] §7–§8'
        : domainControls.map((c) => c.dcfId).join('; ') ||
          QUARTERLY_AUDIT_SCOPE[domain];

    const monthMap: Record<string, number> = {
      Q1: 3,
      Q2: 6,
      Q3: 9,
      Q4: 11,
    };
    const month = monthMap[quarter] ?? 3;

    plan.push({
      auditId: `AUD-${year}-${quarter}-001`,
      quarter: quarter as AuditEntry['quarter'],
      domain,
      controlRef:
        typeof refs === 'string' ? refs : domainControls[0]?.dcfId ?? domain,
      scheduledDate: `${year}-${String(month).padStart(2, '0')}-15`,
      status: 'Planned',
      leadAuditor: process.env.DEFAULT_AUDIT_LEAD ?? 'compliance@example.com',
      auditee:
        domain === 'PIMS'
          ? 'privacy@example.com'
          : 'security@example.com',
      kickoffDate: `${year}-${String(month).padStart(2, '0')}-01`,
      findingCount: 0,
    });
  }

  return plan;
}

export async function persistAuditPlan(
  entries: readonly AuditEntry[],
): Promise<number> {
  let count = 0;
  for (const entry of entries) {
    await appendAuditEntry(entry);
    count += 1;
  }
  await appendActivityLog({
    actor: 'agent',
    action: 'audit_plan_generated',
    targetType: 'audit',
    targetId: String(new Date().getFullYear()),
    outcome: 'success',
    details: JSON.stringify({ count }),
  });
  return count;
}

export interface ReadinessReport {
  readonly auditId: string;
  readonly openNcrs: number;
  readonly overduePolicies: number;
  readonly staleRisks: number;
  readonly ready: boolean;
}

export async function generateReadinessReport(
  auditId: string,
): Promise<ReadinessReport> {
  const [openNcrs, policyDue, staleRisks] = await Promise.all([
    getOpenNCRs(),
    scanPolicyDueDates(),
    scanRiskStaleness(),
  ]);

  const overduePolicies = policyDue.filter((p) => p.window === 'overdue').length;

  return {
    auditId,
    openNcrs: openNcrs.length,
    overduePolicies,
    staleRisks: staleRisks.length,
    ready: openNcrs.length === 0 && overduePolicies === 0,
  };
}

export async function scanAuditEscalations(): Promise<number> {
  const audits = await getAuditCalendar();
  const now = new Date();
  let escalations = 0;

  for (const audit of audits) {
    if (audit.status === 'Complete') continue;
    const kickoff = audit.kickoffDate ? new Date(audit.kickoffDate) : null;
    const scheduled = new Date(audit.scheduledDate);
    if (kickoff && kickoff < now && audit.status === 'Planned') {
      escalations += 1;
      await sendNotification(
        audit.leadAuditor ?? 'compliance@example.com',
        `[IMS] Audit kickoff overdue: ${audit.auditId}`,
        `Audit ${audit.auditId} (${audit.domain}) kickoff was ${audit.kickoffDate}. Status: ${audit.status}`,
      );
    }
    if (scheduled < now) {
      escalations += 1;
    }
  }

  return escalations;
}

export interface KickoffPackage {
  readonly auditId: string;
  readonly checklistDocTitle: string;
  readonly assignments: readonly { email: string; role: string }[];
  readonly readiness: ReadinessReport;
}

export async function prepareKickoffPackage(
  auditId: string,
  confirmed: boolean,
): Promise<KickoffPackage | { error: string }> {
  if (!confirmed) {
    return { error: 'Human confirmation required for audit kickoff' };
  }

  const audits = await getAuditCalendar();
  const audit = audits.find((a) => a.auditId === auditId);
  if (!audit) {
    return { error: 'Audit not found' };
  }

  const readiness = await generateReadinessReport(auditId);
  const assignments = [
    { email: audit.leadAuditor ?? 'compliance@example.com', role: 'Lead auditor' },
    { email: audit.auditee ?? 'security@example.com', role: 'Auditee' },
  ];

  for (const a of assignments) {
    await sendNotification(
      a.email,
      `[IMS] Audit kickoff: ${auditId}`,
      `You are assigned as ${a.role} for ${audit.domain} audit.\n` +
        `Scheduled: ${audit.scheduledDate}\n` +
        `Scope: ${audit.controlRef}\n` +
        `Readiness: ${readiness.ready ? 'READY' : 'GAPS FOUND'}`,
    );
  }

  await updateAuditEntry(auditId, { status: 'In Progress' });

  await appendActivityLog({
    actor: 'agent',
    action: 'audit_kickoff',
    targetType: 'audit',
    targetId: auditId,
    outcome: 'success',
    details: JSON.stringify({ readiness }),
  });

  return {
    auditId,
    checklistDocTitle: `${auditId} — ${audit.domain} Audit Checklist`,
    assignments,
    readiness,
  };
}

export async function linkFindingToNcr(
  auditId: string,
  ncrId: string,
): Promise<void> {
  await appendActivityLog({
    actor: 'agent',
    action: 'audit_ncr_linked',
    targetType: 'audit',
    targetId: auditId,
    outcome: 'success',
    details: JSON.stringify({ ncrId }),
  });
}

export function filterDcfByDomain(
  dcf: readonly DcfEntry[],
  domain: AuditEntry['domain'],
): readonly DcfEntry[] {
  if (domain === 'Integrated') return dcf;
  return dcf.filter((c) => !c.domain || c.domain === domain);
}
