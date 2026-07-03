import type { RiskEntry } from '../types/risk.js';
import { riskEntrySchema } from '../types/risk.js';
import type { Severity } from '../types/ncr.js';
import {
  appendActivityLog,
  appendRiskEntry,
  getRiskRegister,
  updateRiskEntry,
} from './workspaceService.js';
import { sendNotification } from './notificationService.js';

const SEVERITY_RANK: Record<string, number> = {
  Negligible: 1,
  Low: 2,
  Moderate: 3,
  High: 4,
  Critical: 5,
};

const STALE_DAYS = Number(process.env.RISK_STALE_DAYS ?? 90);

export function calculateSeverity(
  impact: string,
  likelihood: string,
): Severity {
  const score =
    (SEVERITY_RANK[impact] ?? 1) * (SEVERITY_RANK[likelihood] ?? 1);
  if (score >= 20) return 'Critical';
  if (score >= 12) return 'High';
  if (score >= 6) return 'Moderate';
  if (score >= 3) return 'Low';
  return 'Negligible';
}

export function validateRiskWrite(entry: RiskEntry): {
  valid: boolean;
  error?: string;
} {
  if (entry.treatment === 'Accept' && !entry.leadershipApprover) {
    return {
      valid: false,
      error: 'Accept treatment requires leadership_approver',
    };
  }
  return { valid: true };
}

export async function createRisk(
  data: Parameters<typeof appendRiskEntry>[0],
  promote = false,
): Promise<RiskEntry> {
  const severity =
    data.severity ??
    calculateSeverity(data.impact, data.likelihood);

  const entry = riskEntrySchema.parse({
    ...data,
    severity,
    status: promote ? data.status ?? 'Open' : 'Draft',
    updatedAt: new Date().toISOString(),
  });

  const validation = validateRiskWrite(entry);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return appendRiskEntry(entry);
}

export async function promoteRisk(riskId: string): Promise<boolean> {
  const risks = await getRiskRegister();
  const risk = risks.find((r) => r.riskId === riskId);
  if (!risk || risk.status !== 'Draft') {
    return false;
  }
  const validation = validateRiskWrite({ ...risk, status: 'Open' });
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  return updateRiskEntry(riskId, { status: 'Open' });
}

function isStale(risk: RiskEntry): boolean {
  if (risk.status === 'Closed') return false;
  const updated = new Date(risk.updatedAt);
  const days =
    (Date.now() - updated.getTime()) / (1000 * 60 * 60 * 24);
  return days > STALE_DAYS;
}

export async function scanRiskStaleness(): Promise<readonly RiskEntry[]> {
  const risks = await getRiskRegister();
  return risks.filter(isStale);
}

export async function sendRiskReviewReminders(
  stale: readonly RiskEntry[],
): Promise<number> {
  let count = 0;
  for (const risk of stale) {
    await sendNotification(
      risk.owner,
      `[IMS] Risk review required: ${risk.riskId}`,
      `Risk "${risk.aspect}" has not been updated since ${risk.updatedAt}.\n` +
        `Severity: ${risk.severity} | Treatment: ${risk.treatment}`,
    );
    await appendActivityLog({
      actor: 'agent',
      action: 'risk_stale_nudge',
      targetType: 'risk',
      targetId: risk.riskId,
      outcome: 'success',
    });
    count += 1;
  }
  return count;
}

export async function quarterlyRiskReviewDue(): Promise<boolean> {
  const month = new Date().getMonth() + 1;
  return month === 1 || month === 4 || month === 7 || month === 10;
}

export async function generateRiskReviewSummary(): Promise<string> {
  const risks = await getRiskRegister();
  const open = risks.filter((r) => r.status === 'Open');
  const monitoring = risks.filter((r) => r.status === 'Monitoring');
  const stale = risks.filter(isStale);

  return [
    'Risk Register Summary',
    `Open: ${open.length}`,
    `Monitoring: ${monitoring.length}`,
    `Stale (>${STALE_DAYS}d): ${stale.length}`,
    '',
    'Top open risks:',
    ...open.slice(0, 10).map(
      (r) => `  ${r.riskId}: ${r.severity} — ${r.aspect.slice(0, 60)}`,
    ),
  ].join('\n');
}
