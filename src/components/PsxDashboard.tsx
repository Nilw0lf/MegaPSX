"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPercent } from "@/lib/format";

interface PsxItem {
  symbol?: string;
  company?: string;
  price?: number | string;
  change?: number | string;
  changePercent?: number | string;
  volume?: number | string;
}

interface PsxSummary {
  index?: string;
  value?: number | string;
  change?: number | string;
  changePercent?: number | string;
  volume?: number | string;
  valueTraded?: number | string;
}

interface PsxResponse {
  summary: PsxSummary | null;
  gainers: PsxItem[];
  losers: PsxItem[];
  updatedAt: string;
  error?: string;
  source?: string;
}

const toNumber = (value: number | string | undefined) => {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;
  const cleaned = value.toString().replace(/,/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toText = (value: number | string | undefined, fallback = "--") => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
};

export const PsxDashboard = () => {
  const [data, setData] = useState<PsxResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/psx");
      const json = (await response.json()) as PsxResponse;
      setData(json);
    } catch (error) {
      console.error(error);
      setData({
        summary: null,
        gainers: [],
        losers: [],
        updatedAt: new Date().toISOString(),
        error: "Unable to fetch PSX data.",
        source: "Unavailable"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredGainers = useMemo(() => {
    const list = data?.gainers ?? [];
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (item) =>
        item.symbol?.toLowerCase().includes(q) || item.company?.toLowerCase().includes(q)
    );
  }, [data, query]);

  const filteredLosers = useMemo(() => {
    const list = data?.losers ?? [];
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (item) =>
        item.symbol?.toLowerCase().includes(q) || item.company?.toLowerCase().includes(q)
    );
  }, [data, query]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>PSX Market Summary</CardTitle>
          <CardDescription>Live KSE-100 snapshot, top gainers, and losers.</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search ticker or name"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-56"
          />
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCcw size={14} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        {loading ? (
          <div className="grid gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-48" />
          </div>
        ) : (
          <>
            {data?.error && (
              <p className="text-sm text-danger">
                {data.error} PSX data may be unavailable in some environments.
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4">
                <p className="text-xs uppercase text-muted-foreground">Index</p>
                <p className="text-2xl font-semibold">
                  {toText(data?.summary?.index, "KSE-100")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {toText(data?.summary?.value)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Source: {data?.source ?? "Unknown"}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs uppercase text-muted-foreground">Daily change</p>
                <p className="text-2xl font-semibold">
                  {toText(data?.summary?.change)} ({formatPercent(toNumber(data?.summary?.changePercent))})
                </p>
                <p className="text-sm text-muted-foreground">Volume: {toText(data?.summary?.volume)}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs uppercase text-muted-foreground">Value traded</p>
                <p className="text-2xl font-semibold">{toText(data?.summary?.valueTraded)}</p>
                <p className="text-sm text-muted-foreground">Updated: {new Date(data?.updatedAt ?? "").toLocaleTimeString()}</p>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-accent">
                    <ArrowUpRight size={16} />
                    <p className="text-sm font-semibold">Top Gainers</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{filteredGainers.length} stocks</p>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  {filteredGainers.slice(0, 8).map((item) => (
                    <div key={`${item.symbol}-g`} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{item.symbol ?? "--"}</p>
                        <p className="text-xs text-muted-foreground">{item.company ?? ""}</p>
                      </div>
                      <div className="text-right">
                        <p>{toText(item.price)}</p>
                        <p className="text-xs text-accent">
                          +{toText(item.change)} ({formatPercent(toNumber(item.changePercent))})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-danger">
                    <ArrowDownRight size={16} />
                    <p className="text-sm font-semibold">Top Losers</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{filteredLosers.length} stocks</p>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  {filteredLosers.slice(0, 8).map((item) => (
                    <div key={`${item.symbol}-l`} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{item.symbol ?? "--"}</p>
                        <p className="text-xs text-muted-foreground">{item.company ?? ""}</p>
                      </div>
                      <div className="text-right">
                        <p>{toText(item.price)}</p>
                        <p className="text-xs text-danger">
                          {toText(item.change)} ({formatPercent(toNumber(item.changePercent))})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
