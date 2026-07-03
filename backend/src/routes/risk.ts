import { Router } from 'express';
import { getRiskRegister } from '../services/workspaceService.js';
import {
  createRisk,
  generateRiskReviewSummary,
  promoteRisk,
  scanRiskStaleness,
} from '../services/riskWorkflowService.js';
import { createRiskSchema } from '../types/risk.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const riskRouter = Router();

riskRouter.get('/', async (_req, res, next) => {
  try {
    const risks = await getRiskRegister();
    res.json({ risks });
  } catch (err) {
    next(err);
  }
});

riskRouter.get('/stale', async (_req, res, next) => {
  try {
    const stale = await scanRiskStaleness();
    res.json({ stale, count: stale.length });
  } catch (err) {
    next(err);
  }
});

riskRouter.get('/summary', async (_req, res, next) => {
  try {
    const summary = await generateRiskReviewSummary();
    res.json({ summary });
  } catch (err) {
    next(err);
  }
});

riskRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = createRiskSchema.parse(req.body);
    const entry = await createRisk(data, false);
    res.status(201).json({ risk: entry });
  } catch (err) {
    next(err);
  }
});

riskRouter.post('/:riskId/promote', requireAuth, async (req, res, next) => {
  try {
    const ok = await promoteRisk(String(req.params.riskId ?? ''));
    if (!ok) {
      res.status(404).json({ error: 'Risk not found or not in Draft status' });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
