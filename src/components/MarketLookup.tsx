"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { getHistory, getQuote, searchSymbols } from "@/lib/api";

interface Quote {
  symbol: string;
  date: string;
  close: number;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  volume?: number | null;
  value?: number | null;
}

export const MarketLookup = () => {
  const [query, setQuery] = useState("LUCK");
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [history, setHistory] = useState<Quote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{ symbol: string; name?: string }[]>([]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const latest = await getQuote(query.trim());
      const historyData = await getHistory(query.trim());
      setQuote(latest);
      setHistory(historyData.slice(-30));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to fetch quote");
      setQuote(null);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggest = async (value: string) => {
    setQuery(value);
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const results = await searchSymbols(value);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    }
  };

  const chartRows = useMemo(() => {
    return history.map((row) => ({
      date: row.date,
      close: row.close
    }));
  }, [history]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>PSX Market Lookup</CardTitle>
          <CardDescription>Search a symbol and view the latest close.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Input
                value={query}
                onChange={(event) => handleSuggest(event.target.value.toUpperCase())}
                placeholder="Symbol (e.g., LUCK)"
              />
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 z-10 mt-2 rounded-xl border border-white/10 bg-card/70 p-2 shadow-card backdrop-blur-xl">
                  {suggestions.slice(0, 6).map((item) => (
                    <button
                      key={item.symbol}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-white/5"
                      onClick={() => {
                        setQuery(item.symbol);
                        setSuggestions([]);
                      }}
                    >
                      <span>{item.symbol}</span>
                      <span className="text-xs text-muted-foreground">{item.name ?? ""}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={handleSearch}>
              <Search size={16} />
              Fetch quote
            </Button>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          {loading ? (
            <Skeleton className="h-24" />
          ) : quote ? (
            <div className="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-muted-foreground">Latest close</p>
              <p className="text-3xl font-semibold">{formatCurrency(quote.close)}</p>
              <p className="text-xs text-muted-foreground">Date: {quote.date}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Search a symbol to see results.</p>
          )}
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Last 30 Closes</CardTitle>
          <CardDescription>Simple list view (chart placeholder).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {loading ? (
            <Skeleton className="h-40" />
          ) : chartRows.length === 0 ? (
            <p className="text-muted-foreground">No history loaded.</p>
          ) : (
            chartRows.map((row) => (
              <div key={row.date} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-white/5">
                <span>{row.date}</span>
                <span className="font-medium">{formatCurrency(row.close)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
