import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import session from 'express-session';
import { authRouter } from './routes/auth.js';
import { healthRouter } from './routes/health.js';
import { riskRouter } from './routes/risk.js';
import { policyRouter } from './routes/policy.js';
import { programRouter } from './routes/program.js';
import { auditRouter } from './routes/audit.js';
import { agentRouter } from './routes/agent.js';
import {
  dcfRouter,
  documentRouter,
  ncrRouter,
} from './routes/api.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);
const frontendOrigin = process.env.FRONTEND_URL ?? 'http://localhost:3000';

app.use(helmet());
app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? 'dev-only-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    },
  }),
);

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/api/agent', agentRouter);
app.use('/api/risks', riskRouter);
app.use('/api/policies', policyRouter);
app.use('/api/program', programRouter);
app.use('/api/audits', auditRouter);
app.use('/api/dcf', dcfRouter);
app.use('/api/ncr', ncrRouter);
app.use('/api/documents', documentRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    const message =
      process.env.NODE_ENV === 'development' ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  },
);

app.listen(port, () => {
  console.log(`Corporate Holocron backend listening on http://localhost:${port}`);
});
