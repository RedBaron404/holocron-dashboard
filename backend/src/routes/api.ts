import { Router } from 'express';
import { z } from 'zod';
import {
  generatePolicyDocument,
  getDcfMap,
  appendNCREntry,
  getNCRLog,
} from '../services/workspaceService.js';
import { createNcrSchema } from '../types/ncr.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const dcfRouter = Router();

dcfRouter.get('/', async (_req, res, next) => {
  try {
    const controls = await getDcfMap();
    res.json({ controls });
  } catch (err) {
    next(err);
  }
});

export const ncrRouter = Router();

ncrRouter.get('/', async (_req, res, next) => {
  try {
    const ncrs = await getNCRLog();
    res.json({ ncrs });
  } catch (err) {
    next(err);
  }
});

ncrRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = createNcrSchema.parse(req.body);
    const email = req.session.user?.email ?? 'unknown';
    const entry = await appendNCREntry(data, email);
    res.status(201).json({ ncr: entry });
  } catch (err) {
    next(err);
  }
});

export const documentRouter = Router();

documentRouter.post('/draft', requireAuth, async (req, res, next) => {
  try {
    const body = z
      .object({
        title: z.string().min(3),
        content: z.string().min(10),
      })
      .parse(req.body);
    const doc = await generatePolicyDocument(body.title, body.content);
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
});
