import { Router } from 'express';
import { getOAuth2Client } from '../lib/googleClient.js';

const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

export const authRouter = Router();

authRouter.get('/login', (_req, res) => {
  try {
    const oauth2 = getOAuth2Client();
    const url = oauth2.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    });
    res.redirect(url);
  } catch {
    res.status(501).json({
      error: 'OAuth not configured',
      hint: 'Set GOOGLE_OAUTH_CLIENT_ID — see docs/intake/ACCESS_CHECKLIST.md',
    });
  }
});

authRouter.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (typeof code !== 'string') {
    res.status(400).json({ error: 'Missing authorization code' });
    return;
  }

  try {
    const oauth2 = getOAuth2Client();
    const { tokens } = await oauth2.getToken(code);
    oauth2.setCredentials(tokens);

    const oauth2Api = await import('googleapis').then((g) =>
      g.google.oauth2({ version: 'v2', auth: oauth2 }),
    );
    const userInfo = await oauth2Api.userinfo.get();
    const email = userInfo.data.email;
    if (!email) {
      res.status(401).json({ error: 'Could not retrieve user email' });
      return;
    }

    req.session.user = {
      email,
      ...(userInfo.data.name ? { name: userInfo.data.name } : {}),
    };

    const frontend = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    res.redirect(`${frontend}/?auth=success`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OAuth callback failed' });
  }
});

authRouter.get('/me', (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.json(req.session.user);
});

authRouter.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});
