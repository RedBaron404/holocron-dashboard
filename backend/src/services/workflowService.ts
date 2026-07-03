import { NCR_PHASE_ORDER, type NCRPhase } from '../types/ncr.js';
import { updateSheetRowByKey } from '../lib/sheetsOrm.js';
import { isWorkspaceConfigured } from '../lib/googleClient.js';
import { NCR_COLUMNS } from '../types/ncr.js';

export function nextPhase(current: NCRPhase): NCRPhase | null {
  const idx = NCR_PHASE_ORDER.indexOf(current);
  if (idx < 0 || idx >= NCR_PHASE_ORDER.length - 1) return null;
  return NCR_PHASE_ORDER[idx + 1] ?? null;
}

export function canTransition(
  from: NCRPhase,
  to: NCRPhase,
): { allowed: boolean; reason?: string } {
  const fromIdx = NCR_PHASE_ORDER.indexOf(from);
  const toIdx = NCR_PHASE_ORDER.indexOf(to);
  if (toIdx !== fromIdx + 1) {
    return {
      allowed: false,
      reason: `Invalid transition ${from} → ${to}. Phases must be sequential.`,
    };
  }
  return { allowed: true };
}

export async function updateNCRPhase(
  ncrId: string,
  phase: NCRPhase,
): Promise<boolean> {
  if (!isWorkspaceConfigured()) {
    throw new Error('Workspace not configured');
  }
  const sheetId = process.env.SHEET_NCR_LOG_ID;
  if (!sheetId) throw new Error('SHEET_NCR_LOG_ID not configured');

  return updateSheetRowByKey(
    sheetId,
    'NCR',
    NCR_COLUMNS,
    'ncr_id',
    ncrId,
    { phase },
  );
}

export function daysInPhase(since: string): number {
  return Math.floor(
    (Date.now() - new Date(since).getTime()) / (1000 * 60 * 60 * 24),
  );
}
