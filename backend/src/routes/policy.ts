import { Router } from 'express';
import { getPolicyRegister } from '../services/workspaceService.js';
import {
  archiveApprovedPolicy,
  requestPolicyApproval,
  scanPolicyDueDates,
} from '../services/policyLifecycleService.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { z } from 'zod';

export const policyRouter = Router();

policyRouter.get('/', async (_req, res, next) => {
  try {
    const policies = await getPolicyRegister();
    res.json({ policies });
  } catch (err) {
    next(err);
  }
});

policyRouter.get('/due', async (_req, res, next) => {
  try {
    const due = await scanPolicyDueDates();
    res.json({ due, count: due.length });
  } catch (err) {
    next(err);
  }
});

policyRouter.post(
  '/:policyId/approve',
  requireAuth,
  async (req, res, next) => {
    try {
      const body = z.object({ confirmed: z.boolean() }).parse(req.body);
      const result = await requestPolicyApproval(
        String(req.params.policyId ?? ''),
        body.confirmed,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

policyRouter.post(
  '/:policyId/archive',
  requireAuth,
  async (req, res, next) => {
    try {
      const result = await archiveApprovedPolicy(
        String(req.params.policyId ?? ''),
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);
