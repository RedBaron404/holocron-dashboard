#!/usr/bin/env tsx
/**
 * Daily IMS scan — for Cursor Automation, cron, or manual invocation.
 * Run: ./scripts/with-secrets.sh npm run daily-scan
 */
const API_URL = process.env.API_URL ?? 'http://localhost:4000';
const AGENT_API_KEY = process.env.AGENT_API_KEY;

async function main(): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (AGENT_API_KEY) {
    headers['X-Agent-Key'] = AGENT_API_KEY;
  }

  const res = await fetch(`${API_URL}/api/agent/daily-scan`, {
    method: 'POST',
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Daily scan failed (${res.status}): ${text}`);
  }

  const result = await res.json();
  console.log('Daily scan complete:');
  console.log(result.digest ?? JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
