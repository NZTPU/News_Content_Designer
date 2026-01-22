import { REQUIRED_FIELDS, validateRow, ValidationError } from "./schema";

export type ParsedData = {
  rows: Record<string, string>[];
  errors: ValidationError[];
  headers: string[];
};

const normalizeHeader = (header: string) => header.trim();

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
};

export const parseCsvText = (csvText: string): ParsedData => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { rows: [], errors: [], headers: [] };
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const rows: Record<string, string>[] = [];
  const errors: ValidationError[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() ?? "";
    });

    rows.push(row);
    errors.push(...validateRow(row, i));
  }

  REQUIRED_FIELDS.forEach((field) => {
    if (!headers.includes(field)) {
      errors.push({
        rowIndex: 0,
        field,
        message: `Missing required header: ${field}`,
      });
    }
  });

  return { rows, errors, headers };
};

export const loadCsvFile = async (file: File): Promise<ParsedData> => {
  const csvText = await file.text();
  return parseCsvText(csvText);
};

const extractSpreadsheetId = (url: string) => {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] ?? null;
};

export const buildGoogleSheetsCsvUrl = (url: string) => {
  const spreadsheetId = extractSpreadsheetId(url);
  if (!spreadsheetId) {
    return url;
  }

  const parsed = new URL(url);
  const gid = parsed.searchParams.get("gid") ?? "0";

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
};

export const fetchGoogleSheetCsv = async (url: string): Promise<ParsedData> => {
  const csvUrl = buildGoogleSheetsCsvUrl(url);
  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV (${response.status})`);
  }

  const csvText = await response.text();
  return parseCsvText(csvText);
};
