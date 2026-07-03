import { Router } from 'express';
import { isWorkspaceConfigured } from '../lib/googleClient.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    phase: 'GRC Analyst Agent — Phase A–F',
    workspace: isWorkspaceConfigured() ? 'configured' : 'not_configured',
    timestamp: new Date().toISOString(),
  });
});
