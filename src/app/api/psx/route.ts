import { NextResponse } from "next/server";

const endpoints = {
  summary: "https://dps.psx.com.pk/market-summary",
  gainers: "https://dps.psx.com.pk/top-gainers",
  losers: "https://dps.psx.com.pk/top-losers"
};

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json, text/plain, */*"
    },
    next: { revalidate: 60 }
  });
  if (!response.ok) {
    throw new Error(`PSX request failed: ${response.status}`);
  }
  return response.json();
}

export async function GET() {
  try {
    const [summary, gainers, losers] = await Promise.all([
      fetchJson(endpoints.summary),
      fetchJson(endpoints.gainers),
      fetchJson(endpoints.losers)
    ]);

    return NextResponse.json({
      summary,
      gainers,
      losers,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        summary: null,
        gainers: [],
        losers: [],
        updatedAt: new Date().toISOString(),
        error: "Unable to fetch PSX data."
      },
      { status: 200 }
    );
  }
}
