import type { PolicyDueItem, PolicyEntry } from '../types/policy.js';
import {
  appendActivityLog,
  exportDocToPDF,
  getPolicyRegister,
  initiateDocumentApproval,
  updatePolicyEntry,
} from './workspaceService.js';
import { sendNotification } from './notificationService.js';

const DUE_WINDOWS = [30, 14, 7, 1] as const;

function daysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function classifyPolicyDue(policy: PolicyEntry): PolicyDueItem | null {
  if (policy.status === 'Retired' || policy.status === 'Superseded') {
    return null;
  }
  const days = daysUntil(policy.nextReviewDate);
  if (days < 0) {
    return { policy, window: 'overdue', daysUntilDue: days };
  }
  for (const w of DUE_WINDOWS) {
    if (days <= w) {
      return {
        policy,
        window: String(w) as PolicyDueItem['window'],
        daysUntilDue: days,
      };
    }
  }
  return null;
}

export async function scanPolicyDueDates(): Promise<readonly PolicyDueItem[]> {
  const policies = await getPolicyRegister();
  return policies
    .map(classifyPolicyDue)
    .filter((item): item is PolicyDueItem => item !== null);
}

export async function nudgePolicyOwners(
  items: readonly PolicyDueItem[],
): Promise<number> {
  let count = 0;
  for (const item of items) {
    const { policy, window, daysUntilDue } = item;
    const label =
      window === 'overdue'
        ? `OVERDUE by ${Math.abs(daysUntilDue)} days`
        : `due in ${daysUntilDue} days (${window}-day window)`;

    await sendNotification(
      policy.owner,
      `[IMS] Policy review: ${policy.policyId} — ${label}`,
      `Policy "${policy.title}" (${policy.version}) requires review.\n` +
        `Next review date: ${policy.nextReviewDate}\n` +
        `Approver: ${policy.approver}\n` +
        `Status: ${policy.status}`,
    );

    await appendActivityLog({
      actor: 'agent',
      action: 'policy_nudge',
      targetType: 'policy',
      targetId: policy.policyId,
      outcome: 'success',
      details: JSON.stringify({ window, daysUntilDue }),
    });
    count += 1;
  }
  return count;
}

export async function requestPolicyApproval(
  policyId: string,
  confirmed: boolean,
): Promise<{ status: string; message: string }> {
  if (!confirmed) {
    return { status: 'cancelled', message: 'Human confirmation required' };
  }

  const policies = await getPolicyRegister();
  const policy = policies.find((p) => p.policyId === policyId);
  if (!policy) {
    return { status: 'error', message: 'Policy not found' };
  }
  if (!policy.docId) {
    return { status: 'error', message: 'Policy has no linked Google Doc' };
  }

  const result = await initiateDocumentApproval(policy.docId, [
    policy.approver,
  ]);

  await updatePolicyEntry(policyId, { status: 'In Review' });

  await appendActivityLog({
    actor: 'agent',
    action: 'policy_approval_initiated',
    targetType: 'policy',
    targetId: policyId,
    outcome: result.status === 'started' ? 'success' : 'pending_human',
    details: result.message,
  });

  return { status: result.status, message: result.message };
}

export async function archiveApprovedPolicy(
  policyId: string,
): Promise<{ archiveFileId: string }> {
  const policies = await getPolicyRegister();
  const policy = policies.find((p) => p.policyId === policyId);
  if (!policy?.docId) {
    throw new Error('Policy or doc_id not found');
  }

  const archiveName = `${policy.policyId}-${policy.version}-approved.pdf`;
  const archiveFileId = await exportDocToPDF(policy.docId, archiveName);

  await updatePolicyEntry(policyId, {
    status: 'Archived',
    archiveFileId,
  });

  await appendActivityLog({
    actor: 'agent',
    action: 'policy_archived',
    targetType: 'policy',
    targetId: policyId,
    outcome: 'success',
    details: JSON.stringify({ archiveFileId }),
  });

  return { archiveFileId };
}
