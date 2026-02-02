import type { DailyPriceInput, DailyPricePayload, Provider, SymbolInput } from "./types";

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const normalizeHeader = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "_");

const splitCsvLine = (line: string) => {
  const output: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      const next = line[index + 1];
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      output.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  output.push(current);
  return output;
};

const parseCsv = (raw: string) => {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];
  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = values[index]?.trim() ?? "";
      return acc;
    }, {});
  });
};

const pickField = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return value;
  }
  return undefined;
};

const parseNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return undefined;
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned) return undefined;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseDateField = (value: unknown, fallback: Date) => {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.valueOf())) {
      parsed.setHours(0, 0, 0, 0);
      return parsed;
    }
  }
  return fallback;
};

const parseSymbols = (raw: string) => {
  let data: Array<Record<string, unknown>> = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      data = parsed;
    } else if (Array.isArray(parsed?.data)) {
      data = parsed.data;
    }
  } catch {
    data = parseCsv(raw);
  }

  return data
    .map((record) => {
      const symbol = pickField(record, ["symbol", "ticker", "scrip", "code", "symbol_code"]);
      if (!symbol || typeof symbol !== "string") return null;
      return {
        symbol: symbol.toUpperCase(),
        name: pickField(record, ["name", "company", "company_name", "symbol_name"])?.toString(),
        sector: pickField(record, ["sector", "sector_name", "industry"])?.toString()
      } satisfies SymbolInput;
    })
    .filter((value): value is SymbolInput => Boolean(value));
};

const parsePrices = (raw: string, date: Date) => {
  let data: Array<Record<string, unknown>> = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      data = parsed;
    } else if (Array.isArray(parsed?.data)) {
      data = parsed.data;
    }
  } catch {
    data = parseCsv(raw);
  }

  return data
    .map((record) => {
      const symbol = pickField(record, ["symbol", "ticker", "scrip", "code", "symbol_code"]);
      if (!symbol || typeof symbol !== "string") return null;
      const parsedDate = parseDateField(
        pickField(record, ["date", "trade_date", "close_date", "date_time"]),
        date
      );
      return {
        symbol: symbol.toUpperCase(),
        date: parsedDate,
        open: parseNumber(pickField(record, ["open", "open_price"])),
        high: parseNumber(pickField(record, ["high", "high_price"])),
        low: parseNumber(pickField(record, ["low", "low_price"])),
        close: parseNumber(pickField(record, ["close", "close_price", "closing_price"])) ?? 0,
        volume: parseNumber(pickField(record, ["volume", "total_volume"])),
        value: parseNumber(pickField(record, ["value", "turnover", "traded_value"]))
      } satisfies DailyPriceInput;
    })
    .filter((value): value is DailyPriceInput => Boolean(value) && value.close > 0);
};

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing ${key}. Set it in apps/api/.env to use the PSX provider.`);
  }
  return value;
};

const buildPriceUrl = (template: string, date: Date) => {
  const formatted = formatDate(date);
  return template.replace("{date}", formatted);
};

export const psxPortalProvider: Provider = {
  name: "psx",
  async fetchSymbols(): Promise<SymbolInput[]> {
    const url = requireEnv("PSX_PORTAL_SYMBOLS_URL");
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`PSX symbols request failed: ${response.status}`);
    }
    const raw = await response.text();
    return parseSymbols(raw);
  },
  async fetchDailyPricesForDate(date: Date): Promise<DailyPricePayload> {
    const template = requireEnv("PSX_PORTAL_PRICES_URL");
    const url = buildPriceUrl(template, date);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`PSX daily prices request failed: ${response.status}`);
    }
    const raw = await response.text();
    const prices = parsePrices(raw, date);
    const isJson = raw.trim().startsWith("{") || raw.trim().startsWith("[");
    return { prices, raw, rawExtension: isJson ? "json" : "txt" };
  }
};
