"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface WatchItem {
  symbol: string;
  note: string;
}

const STORAGE_KEY = "megapx-watchlist";

export const WatchlistPanel = () => {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [symbol, setSymbol] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as WatchItem[];
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    if (!symbol.trim()) return;
    const next = symbol.trim().toUpperCase();
    if (items.some((item) => item.symbol === next)) {
      setSymbol("");
      setNote("");
      return;
    }
    setItems((prev) => [{ symbol: next, note: note.trim() }, ...prev]);
    setSymbol("");
    setNote("");
  };

  const removeItem = (target: string) => {
    setItems((prev) => prev.filter((item) => item.symbol !== target));
  };

  const countLabel = useMemo(() => {
    if (items.length === 0) return "No symbols added yet.";
    return `${items.length} symbol${items.length === 1 ? "" : "s"} tracked.`;
  }, [items.length]);

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>PSX Watchlist</CardTitle>
        <CardDescription>Keep a short list of symbols with quick notes.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-[160px_1fr_auto]">
          <Input
            placeholder="Symbol (e.g., LUCK)"
            value={symbol}
            onChange={(event) => setSymbol(event.target.value.toUpperCase())}
          />
          <Input
            placeholder="Optional note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <Button onClick={addItem}>
            <Plus size={16} />
            Add
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{countLabel}</p>
        <div className="grid gap-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add symbols to track your active focus list and attach a quick note.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.symbol}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{item.symbol}</p>
                  <p className="text-xs text-muted-foreground">{item.note || "No note added."}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeItem(item.symbol)}>
                  <Trash2 size={14} />
                  Remove
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
