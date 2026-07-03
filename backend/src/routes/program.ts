import { Router } from 'express';
import {
  runDailyScan,
  scanProgramCalendar,
} from '../services/programCalendarService.js';
import { getProgramCalendar } from '../services/workspaceService.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const programRouter = Router();

programRouter.get('/calendar', async (_req, res, next) => {
  try {
    const tasks = await getProgramCalendar();
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
});

programRouter.get('/alerts', async (_req, res, next) => {
  try {
    const alerts = await scanProgramCalendar();
    res.json({ alerts, count: alerts.length });
  } catch (err) {
    next(err);
  }
});

programRouter.post('/daily-scan', requireAuth, async (_req, res, next) => {
  try {
    const result = await runDailyScan();
    res.json(result);
  } catch (err) {
    next(err);
  }
});
