"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatPercent } from "@/lib/format";

const numberOrZero = (value: string | number) => {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : 0;
};

export const InflationCalculator = () => {
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({
    currentValue: 100000,
    inflationRate: 18,
    years: 5
  });

  const futureValue = useMemo(() => {
    const rate = numberOrZero(form.inflationRate) / 100;
    return numberOrZero(form.currentValue) * Math.pow(1 + rate, numberOrZero(form.years));
  }, [form.currentValue, form.inflationRate, form.years]);

  const purchasingPowerLoss = useMemo(() => {
    if (!futureValue) return 0;
    return (futureValue - numberOrZero(form.currentValue)) / futureValue;
  }, [futureValue, form.currentValue]);

  const chartData = useMemo(() => {
    const rate = numberOrZero(form.inflationRate) / 100;
    const totalYears = Math.max(numberOrZero(form.years), 0);
    return Array.from({ length: totalYears + 1 }).map((_, index) => ({
      year: currentYear + index,
      value: numberOrZero(form.currentValue) * Math.pow(1 + rate, index)
    }));
  }, [form.currentValue, form.inflationRate, form.years, currentYear]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Inflation Calculator (Pakistan)</CardTitle>
          <CardDescription>
            Estimate future cost and purchasing power erosion for PKR.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              Current value (PKR)
              <Input
                type="number"
                min={0}
                value={form.currentValue}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    currentValue: numberOrZero(event.target.value)
                  }))
                }
              />
            </label>
            <label className="text-sm">
              Inflation rate (%)
              <Input
                type="number"
                min={0}
                value={form.inflationRate}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    inflationRate: numberOrZero(event.target.value)
                  }))
                }
              />
            </label>
            <label className="text-sm">
              Years
              <Input
                type="number"
                min={1}
                value={form.years}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    years: numberOrZero(event.target.value)
                  }))
                }
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Future Cost</CardTitle>
            <CardDescription>Inflation-adjusted value.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatCurrency(futureValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Purchasing Power Loss</CardTitle>
            <CardDescription>How much value erodes over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatPercent(purchasingPowerLoss * 100)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inflation Curve</CardTitle>
            <CardDescription>Annual projected value growth.</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 0, right: 16 }}>
                <defs>
                  <linearGradient id="inflationFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--accent))"
                  fill="url(#inflationFill)"
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
