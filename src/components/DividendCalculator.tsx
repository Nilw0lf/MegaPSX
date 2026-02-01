"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ClipboardCopy, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { calcDividend, frequencyToDistributions } from "@/lib/calculations";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { DividendFrequency } from "@/types/models";

const frequencyOptions: DividendFrequency[] = [
  "One-time",
  "Quarterly",
  "Semiannual",
  "Annual",
  "Custom"
];

export const DividendCalculator = () => {
  const taxProfiles = useAppStore((state) => state.taxProfiles);
  const addScenario = useAppStore((state) => state.addDividendScenario);
  const pushToast = useAppStore((state) => state.pushToast);

  const [form, setForm] = useState({
    label: "Dividend focus",
    tickerOrName: "MegaPower",
    shares: 500,
    buyPrice: 120,
    currentPrice: 132,
    dividendPerShare: 4.5,
    dividendFrequency: "Quarterly" as DividendFrequency,
    customDistributionsPerYear: 4,
    taxProfileId: taxProfiles[0]?.id || ""
  });

  useEffect(() => {
    if (!form.taxProfileId && taxProfiles[0]) {
      setForm((prev) => ({ ...prev, taxProfileId: taxProfiles[0].id }));
    }
  }, [form.taxProfileId, taxProfiles]);

  const taxProfile = taxProfiles.find((profile) => profile.id === form.taxProfileId);
  const withholdingRate = taxProfile?.dividendWithholdingRate ?? 0;

  const results = useMemo(
    () =>
      calcDividend({
        shares: Number(form.shares),
        buyPrice: Number(form.buyPrice),
        currentPrice: Number(form.currentPrice),
        dividendPerShare: Number(form.dividendPerShare),
        frequency: form.dividendFrequency,
        customDistributionsPerYear: Number(form.customDistributionsPerYear),
        withholdingRate
      }),
    [form, withholdingRate]
  );

  const distributions = frequencyToDistributions(
    form.dividendFrequency,
    form.customDistributionsPerYear
  );

  const chartData = useMemo(() => {
    const base = Number(form.currentPrice) || 0;
    if (base === 0) return [];
    return Array.from({ length: 9 }).map((_, index) => {
      const multiplier = 0.8 + index * 0.05;
      const price = base * multiplier;
      const annualNet = results.annualNet;
      const netYieldOnCurrent = price > 0 ? (annualNet / (form.shares * price)) * 100 : 0;
      return {
        price,
        netYieldOnCurrent
      };
    });
  }, [form.currentPrice, form.shares, results.annualNet]);

  const handleSave = useCallback(() => {
    addScenario({
      label: form.label,
      tickerOrName: form.tickerOrName,
      shares: Number(form.shares),
      buyPrice: Number(form.buyPrice),
      currentPrice: Number(form.currentPrice),
      dividendPerShare: Number(form.dividendPerShare),
      dividendFrequency: form.dividendFrequency,
      customDistributionsPerYear:
        form.dividendFrequency === "Custom"
          ? Number(form.customDistributionsPerYear)
          : undefined,
      taxProfileId: form.taxProfileId
    });
  }, [addScenario, form]);

  useEffect(() => {
    const handler = () => handleSave();
    window.addEventListener("megapx-save", handler);
    return () => window.removeEventListener("megapx-save", handler);
  }, [handleSave]);

  const handleCopy = async () => {
    const summary = `Dividend After-Tax Summary\nScenario: ${form.label}\nTicker/Name: ${form.tickerOrName}\nAnnual Net Dividend: ${formatCurrency(results.annualNet)}\nNet Yield on Cost: ${formatPercent(results.netYieldOnCost)}\nNet Yield on Current: ${formatPercent(results.netYieldOnCurrent)}\nDistributions per Year: ${distributions}`;
    await navigator.clipboard.writeText(summary);
    pushToast({ title: "Summary copied" });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Dividend After-Tax</CardTitle>
          <CardDescription>
            Tune the cashflow and see the net yield after your withholding tax.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              Label
              <Input
                value={form.label}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, label: event.target.value }))
                }
              />
            </label>
            <label className="text-sm">
              Ticker / Name
              <Input
                value={form.tickerOrName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, tickerOrName: event.target.value }))
                }
              />
            </label>
            <label className="text-sm">
              Shares
              <Input
                type="number"
                min={0}
                value={form.shares}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, shares: Number(event.target.value) }))
                }
              />
            </label>
            <label className="text-sm">
              Buy Price
              <Input
                type="number"
                min={0}
                value={form.buyPrice}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, buyPrice: Number(event.target.value) }))
                }
              />
            </label>
            <label className="text-sm">
              Current Price
              <Input
                type="number"
                min={0}
                value={form.currentPrice}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    currentPrice: Number(event.target.value)
                  }))
                }
              />
            </label>
            <label className="text-sm">
              Dividend Per Share
              <Input
                type="number"
                min={0}
                value={form.dividendPerShare}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    dividendPerShare: Number(event.target.value)
                  }))
                }
              />
            </label>
            <label className="text-sm">
              Frequency
              <Select
                value={form.dividendFrequency}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    dividendFrequency: event.target.value as DividendFrequency
                  }))
                }
              >
                {frequencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>
            {form.dividendFrequency === "Custom" && (
              <label className="text-sm">
                Distributions / Year
                <Input
                  type="number"
                  min={1}
                  value={form.customDistributionsPerYear}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      customDistributionsPerYear: Number(event.target.value)
                    }))
                  }
                />
              </label>
            )}
            <label className="text-sm">
              Tax Profile
              <Select
                value={form.taxProfileId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, taxProfileId: event.target.value }))
                }
              >
                {taxProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </Select>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleSave}>
              <Save size={16} />
              Save scenario
            </Button>
            <Button variant="outline" onClick={handleCopy}>
              <ClipboardCopy size={16} />
              Copy summary
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Annual Net Dividend</CardTitle>
            <CardDescription>After withholding tax.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {formatCurrency(results.annualNet)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Gross: {formatCurrency(results.annualGross)} · Distributions: {distributions}
            </p>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Net Yield on Cost</CardTitle>
              <CardDescription>Based on your buy price.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {formatPercent(results.netYieldOnCost)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Net Yield on Current</CardTitle>
              <CardDescription>Based on today’s price.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {formatPercent(results.netYieldOnCurrent)}
              </p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Yield vs Price Sensitivity</CardTitle>
            <CardDescription>Range around your current price.</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 0, right: 16 }}>
                <defs>
                  <linearGradient id="yieldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="price"
                  tickFormatter={(value) => value.toFixed(0)}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  formatter={(value: number) => `${value.toFixed(2)}%`}
                  labelFormatter={(label) => `Price: ${label.toFixed(2)}`}
                />
                <Area
                  type="monotone"
                  dataKey="netYieldOnCurrent"
                  stroke="hsl(var(--accent))"
                  fill="url(#yieldFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
