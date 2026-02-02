import { NextResponse } from "next/server";

const sources = [
  {
    name: "PSX DPS",
    summary: "https://dps.psx.com.pk/market-summary",
    gainers: "https://dps.psx.com.pk/top-gainers",
    losers: "https://dps.psx.com.pk/top-losers"
  },
  {
    name: "PSX Website",
    summary: "https://www.psx.com.pk/market-summary",
    gainers: "https://www.psx.com.pk/top-gainers",
    losers: "https://www.psx.com.pk/top-losers"
  }
];

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

async function fetchYahooSummary() {
  const response = await fetch(
    "https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5EKSE,%5EKSE100",
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json, text/plain, */*"
      },
      next: { revalidate: 60 }
    }
  );
  if (!response.ok) {
    throw new Error(`Yahoo request failed: ${response.status}`);
  }
  const data = await response.json();
  const result = data?.quoteResponse?.result?.[0];
  if (!result) {
    throw new Error("Yahoo response missing KSE data");
  }
  return {
    index: "KSE-100 (Yahoo)",
    value: result.regularMarketPrice,
    change: result.regularMarketChange,
    changePercent: result.regularMarketChangePercent,
    volume: result.regularMarketVolume,
    valueTraded: result.regularMarketPreviousClose
  };
}

async function fetchPsxHtmlSummary() {
  const response = await fetch("https://www.psx.com.pk/market-summary", {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "text/html,application/xhtml+xml"
    },
    next: { revalidate: 60 }
  });
  if (!response.ok) {
    throw new Error(`PSX HTML request failed: ${response.status}`);
  }
  const html = await response.text();
  const numberPattern = /KSE-?100[^\\d]*([\\d,.]+)[^\\d-]*([\\d,.-]+)[^\\d-]*([\\d,.-]+%)/i;
  const match = html.match(numberPattern);
  if (!match) {
    throw new Error("Unable to parse KSE-100 from HTML");
  }
  const [, value, change, changePercent] = match;
  return {
    index: "KSE-100 (HTML)",
    value,
    change,
    changePercent: changePercent.replace("%", ""),
    volume: "--",
    valueTraded: "--"
  };
}

export async function GET() {
  try {
    for (const source of sources) {
      try {
        const [summary, gainers, losers] = await Promise.all([
          fetchJson(source.summary),
          fetchJson(source.gainers),
          fetchJson(source.losers)
        ]);
        return NextResponse.json({
          summary,
          gainers,
          losers,
          updatedAt: new Date().toISOString(),
          source: source.name
        });
      } catch (error) {
        console.warn(`PSX source failed: ${source.name}`, error);
      }
    }

    try {
      const htmlSummary = await fetchPsxHtmlSummary();
      return NextResponse.json({
        summary: htmlSummary,
        gainers: [],
        losers: [],
        updatedAt: new Date().toISOString(),
        source: "PSX HTML"
      });
    } catch (error) {
      console.warn("PSX HTML fallback failed", error);
    }

    const yahooSummary = await fetchYahooSummary();

    return NextResponse.json({
      summary: yahooSummary,
      gainers: [],
      losers: [],
      updatedAt: new Date().toISOString(),
      source: "Yahoo Finance"
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
