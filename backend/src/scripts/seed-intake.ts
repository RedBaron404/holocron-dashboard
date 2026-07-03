#!/usr/bin/env tsx
/**
 * Seed Google Sheets from docs/intake/seed/*.csv
 * Run: ./scripts/with-secrets.sh npm run seed:intake --workspace=backend
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../../..');
const SEED_DIR = join(ROOT, 'docs/intake/seed');

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0]!.split(',');
  return lines.slice(1).map((line) => {
    const values = line.split(',');
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      const v = values[i];
      if (v !== undefined) row[h.trim()] = v.trim();
    });
    return row;
  });
}

async function seedTab(
  sheetIdEnv: string,
  tabName: string,
  csvFile: string,
): Promise<void> {
  const sheetId = process.env[sheetIdEnv];
  if (!sheetId) {
    console.log(`  skip ${tabName}: ${sheetIdEnv} not set`);
    return;
  }

  const { getSheetsClient } = await import('../lib/googleClient.js');
  const sheets = getSheetsClient();
  const csvPath = join(SEED_DIR, csvFile);
  const content = readFileSync(csvPath, 'utf8');
  const rows = parseCsv(content);
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]!);
  const values = [headers, ...rows.map((r) => headers.map((h) => r[h] ?? ''))];

  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: `${tabName}!A:Z`,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${tabName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });

  console.log(`  ✓ ${tabName}: ${rows.length} rows from ${csvFile}`);
}

async function main(): Promise<void> {
  console.log('=== Seeding intake data to Google Sheets ===\n');

  const seeds: [string, string, string][] = [
    ['SHEET_DCF_MAP_ID', 'DCF', 'dcf-map.csv'],
    ['SHEET_POLICY_REGISTER_ID', 'Policies', 'policy-register.csv'],
    ['SHEET_RISK_REGISTER_ID', 'Risks', 'risk-register.csv'],
    ['SHEET_PROGRAM_CALENDAR_ID', 'ProgramCalendar', 'program-calendar.csv'],
    ['SHEET_AUDIT_CALENDAR_ID', 'AuditCalendar', 'audit-calendar.csv'],
  ];

  for (const [env, tab, file] of seeds) {
    try {
      await seedTab(env, tab, file);
    } catch (err) {
      console.error(`  ✗ ${tab}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log('\nDone. Update docs/intake/DATA_INVENTORY.md with sheet IDs.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
