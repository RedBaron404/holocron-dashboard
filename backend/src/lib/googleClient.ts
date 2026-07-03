import { readFileSync } from 'node:fs';
import { google } from 'googleapis';
import { JWT, OAuth2Client } from 'google-auth-library';

const SHEETS_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar',
];

function resolveServiceAccountCredentials(): {
  client_email: string;
  private_key: string;
} {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not configured');
  }
  if (raw.trimStart().startsWith('{')) {
    return JSON.parse(raw) as { client_email: string; private_key: string };
  }
  return JSON.parse(readFileSync(raw, 'utf8')) as {
    client_email: string;
    private_key: string;
  };
}

let serviceAccountAuth: JWT | null = null;

export function getServiceAccountAuth(): JWT {
  if (!serviceAccountAuth) {
    const creds = resolveServiceAccountCredentials();
    serviceAccountAuth = new google.auth.JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: SHEETS_SCOPES,
    });
  }
  return serviceAccountAuth;
}

export function getOAuth2Client(): OAuth2Client {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI ?? 'http://localhost:4000/auth/callback';
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth is not configured');
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getSheetsClient() {
  return google.sheets({ version: 'v4', auth: getServiceAccountAuth() });
}

export function getDriveClient() {
  return google.drive({ version: 'v3', auth: getServiceAccountAuth() });
}

export function getDocsClient() {
  return google.docs({ version: 'v1', auth: getServiceAccountAuth() });
}

export function getGmailClient() {
  return google.gmail({ version: 'v1', auth: getServiceAccountAuth() });
}

export function getCalendarClient() {
  return google.calendar({ version: 'v3', auth: getServiceAccountAuth() });
}

export function isWorkspaceConfigured(): boolean {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
}
