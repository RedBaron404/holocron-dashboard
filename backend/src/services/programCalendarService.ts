import type { ProgramTaskAlert } from '../types/program.js';
import {
  appendActivityLog,
  getProgramCalendar,
} from './workspaceService.js';
import { nudgePolicyOwners, scanPolicyDueDates } from './policyLifecycleService.js';
import { scanRiskStaleness, sendRiskReviewReminders } from './riskWorkflowService.js';
import { scanAuditEscalations } from './auditProgramService.js';
import { sendComplianceDigest } from './notificationService.js';

function daysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function classifyProgramTask(task: {
  nextDueDate: string;
  escalationDays: number;
  status: string;
}): ProgramTaskAlert | null {
  if (task.status !== 'Active') return null;
  const days = daysUntil(task.nextDueDate);
  if (days < 0) {
    return { task: task as ProgramTaskAlert['task'], daysUntilDue: days, severity: 'overdue' };
  }
  if (days <= task.escalationDays) {
    return {
      task: task as ProgramTaskAlert['task'],
      daysUntilDue: days,
      severity: days <= 3 ? 'due_soon' : 'escalation',
    };
  }
  return null;
}

export async function scanProgramCalendar(): Promise<readonly ProgramTaskAlert[]> {
  const tasks = await getProgramCalendar();
  return tasks
    .map(classifyProgramTask)
    .filter((a): a is ProgramTaskAlert => a !== null);
}

export interface DailyScanResult {
  readonly scannedAt: string;
  readonly policyNudges: number;
  readonly programAlerts: readonly ProgramTaskAlert[];
  readonly staleRisks: number;
  readonly auditEscalations: number;
  readonly digest: string;
}

export async function runDailyScan(): Promise<DailyScanResult> {
  const scannedAt = new Date().toISOString();

  const [policyDue, programAlerts, staleRisks, auditEscalations] =
    await Promise.all([
      scanPolicyDueDates(),
      scanProgramCalendar(),
      scanRiskStaleness(),
      scanAuditEscalations(),
    ]);

  const policyNudges = await nudgePolicyOwners(policyDue);
  const riskReminders = await sendRiskReviewReminders(staleRisks);

  const lines = [
    `Holocron Daily IMS Scan — ${scannedAt.slice(0, 10)}`,
    '',
    `Policy reviews due/overdue: ${policyDue.length} (${policyNudges} nudges sent)`,
    `Program calendar alerts: ${programAlerts.length}`,
    `Stale risks: ${staleRisks.length} (${riskReminders} reminders)`,
    `Audit escalations: ${auditEscalations}`,
    '',
  ];

  if (policyDue.length > 0) {
    lines.push('Policies:');
    for (const p of policyDue) {
      lines.push(`  - ${p.policy.policyId}: ${p.window} (${p.daysUntilDue}d)`);
    }
    lines.push('');
  }

  if (programAlerts.length > 0) {
    lines.push('Program tasks:');
    for (const a of programAlerts) {
      lines.push(
        `  - ${a.task.taskId} ${a.task.title}: ${a.severity} (${a.daysUntilDue}d)`,
      );
    }
  }

  const digest = lines.join('\n');
  await sendComplianceDigest(digest);

  await appendActivityLog({
    actor: 'agent',
    action: 'daily_scan',
    targetType: 'program',
    targetId: scannedAt.slice(0, 10),
    outcome: 'success',
    details: JSON.stringify({
      policyDue: policyDue.length,
      programAlerts: programAlerts.length,
      staleRisks: staleRisks.length,
      auditEscalations,
    }),
  });

  return {
    scannedAt,
    policyNudges,
    programAlerts,
    staleRisks: staleRisks.length,
    auditEscalations,
    digest,
  };
}
