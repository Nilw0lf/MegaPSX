import { NextResponse } from "next/server";

const API_BASE = process.env.PSX_TERMINAL_API_BASE ?? "https://psxterminal.com/api";

const SUMMARY_PATH = process.env.PSX_TERMINAL_SUMMARY_PATH ?? "/market-summary";
const GAINERS_PATH = process.env.PSX_TERMINAL_GAINERS_PATH ?? "/top-gainers";
const LOSERS_PATH = process.env.PSX_TERMINAL_LOSERS_PATH ?? "/top-losers";

const buildUrl = (path: string) => `${API_BASE.replace(/\\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

const toArray = (value: unknown) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object" && Array.isArray((value as { data?: unknown }).data)) {
    return (value as { data: unknown[] }).data;
  }
  return [];
};

const pickField = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

const normalizeItem = (record: Record<string, unknown>) => ({
  symbol: pickField(record, ["symbol", "ticker", "scrip", "code"]),
  company: pickField(record, ["company", "company_name", "name"]),
  price: pickField(record, ["price", "ldcp", "last", "close"]),
  change: pickField(record, ["change", "chg"]),
  changePercent: pickField(record, ["changePercent", "change_percent", "chg_percent", "pct_change"]),
  volume: pickField(record, ["volume", "vol"])
});

const normalizeSummary = (record: Record<string, unknown>) => ({
  index: pickField(record, ["index", "index_name", "name", "market"]),
  value: pickField(record, ["value", "current", "index_value", "points", "last"]),
  change: pickField(record, ["change", "chg"]),
  changePercent: pickField(record, ["changePercent", "change_percent", "pct_change"]),
  volume: pickField(record, ["volume", "vol"]),
  valueTraded: pickField(record, ["valueTraded", "value_traded", "turnover", "traded_value"])
});

async function fetchJson(path: string) {
  const response = await fetch(buildUrl(path), { next: { revalidate: 60 } });
  if (!response.ok) {
    throw new Error(`PSX Terminal request failed (${path}): ${response.status}`);
  }
  return response.json();
}

export async function GET() {
  try {
    const [summaryRaw, gainersRaw, losersRaw] = await Promise.all([
      fetchJson(SUMMARY_PATH),
      fetchJson(GAINERS_PATH),
      fetchJson(LOSERS_PATH)
    ]);

    const summary = normalizeSummary(
      (summaryRaw && typeof summaryRaw === "object" && !Array.isArray(summaryRaw)
        ? (summaryRaw as Record<string, unknown>)
        : {}) as Record<string, unknown>
    );

    const gainers = toArray(gainersRaw).map((item) => normalizeItem(item as Record<string, unknown>));
    const losers = toArray(losersRaw).map((item) => normalizeItem(item as Record<string, unknown>));

    return NextResponse.json({
      summary,
      gainers,
      losers,
      updatedAt: new Date().toISOString(),
      source: "PSX Terminal API"
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        summary: null,
        gainers: [],
        losers: [],
        updatedAt: new Date().toISOString(),
        error: "Unable to fetch PSX data.",
        source: "Unavailable"
      },
      { status: 200 }
    );
  }
}
