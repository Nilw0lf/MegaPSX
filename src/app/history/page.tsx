"use client";

import { useEffect, useMemo, useState } from "react";
import { Pin, PinOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import { useLoad } from "@/lib/useLoad";

export default function HistoryPage() {
  const loaded = useLoad();
  const [showSkeleton, setShowSkeleton] = useState(true);
  const dividendScenarios = useAppStore((state) => state.dividendScenarios);
  const sellScenarios = useAppStore((state) => state.sellScenarios);
  const deleteScenario = useAppStore((state) => state.deleteScenario);
  const togglePinned = useAppStore((state) => state.togglePinned);

  const [filter, setFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [pinnedFilter, setPinnedFilter] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => setShowSkeleton(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (!loaded || showSkeleton) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  const items = useMemo(() => {
    const mapped = [
      ...dividendScenarios.map((scenario) => ({
        id: scenario.id,
        label: scenario.label,
        type: "Dividend",
        value: scenario.shares * scenario.currentPrice,
        createdAt: scenario.createdAt,
        pinned: scenario.pinned ?? false
      })),
      ...sellScenarios.map((scenario) => ({
        id: scenario.id,
        label: scenario.label,
        type: "Sell",
        value: scenario.quantity * scenario.sellPrice,
        createdAt: scenario.createdAt,
        pinned: scenario.pinned ?? false
      }))
    ];
    let filtered = mapped;
    if (filter === "dividend") {
      filtered = filtered.filter((item) => item.type === "Dividend");
    }
    if (filter === "sell") {
      filtered = filtered.filter((item) => item.type === "Sell");
    }
    if (pinnedFilter === "pinned") {
      filtered = filtered.filter((item) => item.pinned);
    }
    if (dateFilter !== "all") {
      const days = Number(dateFilter);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      filtered = filtered.filter((item) => new Date(item.createdAt) >= cutoff);
    }
    return filtered;
  }, [dividendScenarios, sellScenarios, filter, dateFilter, pinnedFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">History</h1>
        <p className="mt-2 text-muted-foreground">
          Saved scenarios across dividend and sell planners.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Focus on type, date range, or pinned items.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">All types</option>
            <option value="dividend">Dividend only</option>
            <option value="sell">Sell only</option>
          </Select>
          <Select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}>
            <option value="all">All time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </Select>
          <Select value={pinnedFilter} onChange={(event) => setPinnedFilter(event.target.value)}>
            <option value="all">All pins</option>
            <option value="pinned">Pinned only</option>
          </Select>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No scenarios yet. Save a scenario from the dashboard.
            </CardContent>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{item.label}</CardTitle>
                  <CardDescription>{item.type} scenario</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      togglePinned(
                        item.type === "Dividend" ? "dividend" : "sell",
                        item.id
                      )
                    }
                  >
                    {item.pinned ? <PinOff size={16} /> : <Pin size={16} />}
                    {item.pinned ? "Unpin" : "Pin"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      deleteScenario(item.type === "Dividend" ? "dividend" : "sell", item.id)
                    }
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">
                  Value snapshot: {formatCurrency(item.value)}
                </span>
                <span className="text-muted-foreground">
                  Created: {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
