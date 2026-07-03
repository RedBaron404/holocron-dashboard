import { getSheetsClient } from './googleClient.js';

export type SheetRow = Record<string, string>;

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function rowToCamel<T extends Record<string, unknown>>(
  row: SheetRow,
  columns: readonly string[],
): T {
  const out: Record<string, unknown> = {};
  for (const col of columns) {
    const val = row[col];
    if (val !== undefined && val !== '') {
      out[snakeToCamel(col)] = val;
    }
  }
  return out as T;
}

export function objectToRow(
  obj: Record<string, unknown>,
  columns: readonly string[],
): string[] {
  return columns.map((col) => {
    const camel = snakeToCamel(col);
    const val = obj[camel] ?? obj[col];
    if (val === undefined || val === null) return '';
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    return String(val);
  });
}

export async function readSheetTab(
  spreadsheetId: string,
  tabName: string,
): Promise<readonly SheetRow[]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName}!A:Z`,
  });
  const values = res.data.values;
  if (!values || values.length < 2) return [];

  const headers = values[0] as string[];
  return values.slice(1).map((row) => {
    const record: SheetRow = {};
    headers.forEach((h, i) => {
      const cell = row[i];
      if (cell !== undefined && cell !== '') {
        record[h] = String(cell);
      }
    });
    return record;
  });
}

export async function appendSheetRow(
  spreadsheetId: string,
  tabName: string,
  columns: readonly string[],
  obj: Record<string, unknown>,
): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tabName}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [objectToRow(obj, columns)],
    },
  });
}

export async function updateSheetRowByKey(
  spreadsheetId: string,
  tabName: string,
  columns: readonly string[],
  keyColumn: string,
  keyValue: string,
  updates: Record<string, unknown>,
): Promise<boolean> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName}!A:Z`,
  });
  const values = res.data.values;
  if (!values || values.length < 2) return false;

  const headers = values[0] as string[];
  const keyIndex = headers.indexOf(keyColumn);
  if (keyIndex < 0) return false;

  const rowIndex = values.findIndex(
    (row, i) => i > 0 && row[keyIndex] === keyValue,
  );
  if (rowIndex < 0) return false;

  const existing: Record<string, unknown> = {};
  headers.forEach((h, i) => {
    const cell = values[rowIndex]?.[i];
    if (cell !== undefined) existing[snakeToCamel(h)] = String(cell);
  });
  const merged = { ...existing, ...updates };
  const rowNum = rowIndex + 1;
  const range = `${tabName}!A${rowNum}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [objectToRow(merged, columns)],
    },
  });
  return true;
}

export { camelToSnake };
