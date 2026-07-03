import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { runDailyScan } from '../services/programCalendarService.js';
import { scanPolicyDueDates } from '../services/policyLifecycleService.js';
import { scanProgramCalendar } from '../services/programCalendarService.js';
import { scanRiskStaleness } from '../services/riskWorkflowService.js';
import { scanAuditEscalations } from '../services/auditProgramService.js';
import { getActivityLog } from '../services/workspaceService.js';

export const agentRouter = Router();

const AGENT_API_KEY = process.env.AGENT_API_KEY;

function requireAgentKey(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!AGENT_API_KEY) {
    next();
    return;
  }
  const key =
    req.headers['x-agent-key'] ??
    req.headers.authorization?.replace('Bearer ', '');
  if (key !== AGENT_API_KEY) {
    res.status(401).json({ error: 'Invalid agent API key' });
    return;
  }
  next();
}

agentRouter.use(requireAgentKey);

agentRouter.post('/daily-scan', async (_req, res, next) => {
  try {
    const result = await runDailyScan();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

agentRouter.get('/exceptions', async (_req, res) => {
  try {
    const [policyDue, programAlerts, staleRisks, auditEscalations] =
      await Promise.all([
        scanPolicyDueDates(),
        scanProgramCalendar(),
        scanRiskStaleness(),
        scanAuditEscalations(),
      ]);

    res.json({
      policyDue,
      programAlerts,
      staleRisks,
      auditEscalations,
      totalExceptions:
        policyDue.length +
        programAlerts.length +
        staleRisks.length +
        auditEscalations,
      workspace: 'connected',
    });
  } catch {
    res.json({
      policyDue: [],
      programAlerts: [],
      staleRisks: [],
      auditEscalations: 0,
      totalExceptions: 0,
      workspace: 'not_configured',
      hint: 'Complete docs/intake/ACCESS_CHECKLIST.md and run verify-setup.sh',
    });
  }
});

agentRouter.get('/activity', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 50);
    const activity = await getActivityLog(limit);
    res.json({ activity });
  } catch (err) {
    next(err);
  }
});
