import { Router } from 'express';
import { z } from 'zod';
import {
  generateAnnualAuditPlan,
  generateReadinessReport,
  persistAuditPlan,
  prepareKickoffPackage,
} from '../services/auditProgramService.js';
import { getAuditCalendar } from '../services/workspaceService.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const auditRouter = Router();

auditRouter.get('/', async (_req, res, next) => {
  try {
    const audits = await getAuditCalendar();
    res.json({ audits });
  } catch (err) {
    next(err);
  }
});

auditRouter.get('/:auditId/readiness', async (req, res, next) => {
  try {
    const report = await generateReadinessReport(req.params.auditId ?? '');
    res.json(report);
  } catch (err) {
    next(err);
  }
});

auditRouter.post('/plan/:year', requireAuth, async (req, res, next) => {
  try {
    const year = Number(req.params.year);
    const plan = await generateAnnualAuditPlan(year);
    res.json({ plan });
  } catch (err) {
    next(err);
  }
});

auditRouter.post('/plan/:year/persist', requireAuth, async (req, res, next) => {
  try {
    const year = Number(req.params.year);
    const plan = await generateAnnualAuditPlan(year);
    const count = await persistAuditPlan(plan);
    res.json({ count, plan });
  } catch (err) {
    next(err);
  }
});

auditRouter.post(
  '/:auditId/kickoff',
  requireAuth,
  async (req, res, next) => {
    try {
      const body = z.object({ confirmed: z.boolean() }).parse(req.body);
      const result = await prepareKickoffPackage(
        String(req.params.auditId ?? ''),
        body.confirmed,
      );
      if ('error' in result) {
        res.status(400).json(result);
        return;
      }
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);
