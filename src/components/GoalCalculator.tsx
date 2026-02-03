"use client";

import { useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

const numberOrZero = (value: string | number) => {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : 0;
};

export const GoalCalculator = () => {
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({
    currentPortfolio: 2500000,
    monthlyContribution: 45000,
    expectedReturn: 18,
    inflation: 12,
    targetYear: 2030,
    targetAmount: 15000000
  });

  const monthlyRate = useMemo(() => {
    const annual = numberOrZero(form.expectedReturn) / 100;
    return Math.pow(1 + annual, 1 / 12) - 1;
  }, [form.expectedReturn]);

  const months = Math.max((form.targetYear - currentYear) * 12, 0);

  const projection = useMemo(() => {
    let balance = numberOrZero(form.currentPortfolio);
    const data: { year: number; value: number }[] = [];
    for (let month = 0; month <= months; month += 1) {
      balance = balance * (1 + monthlyRate) + numberOrZero(form.monthlyContribution);
      if (month % 12 === 0) {
        data.push({
          year: currentYear + Math.floor(month / 12),
          value: balance
        });
      }
    }
    return data;
  }, [months, monthlyRate, form.currentPortfolio, form.monthlyContribution, currentYear]);

  const projectedValue = projection.at(-1)?.value ?? numberOrZero(form.currentPortfolio);

  const inflationAdjustedTarget = useMemo(() => {
    const years = Math.max(form.targetYear - currentYear, 0);
    const inflationRate = numberOrZero(form.inflation) / 100;
    return numberOrZero(form.targetAmount) * Math.pow(1 + inflationRate, years);
  }, [form.targetAmount, form.inflation, form.targetYear, currentYear]);

  const gap = projectedValue - numberOrZero(form.targetAmount);

  const requiredMonthly = useMemo(() => {
    if (months === 0) return 0;
    const target = numberOrZero(form.targetAmount);
    const current = numberOrZero(form.currentPortfolio);
    if (monthlyRate === 0) {
      return Math.max((target - current) / months, 0);
    }
    const growth = Math.pow(1 + monthlyRate, months);
    const numerator = target - current * growth;
    const denominator = (growth - 1) / monthlyRate;
    return Math.max(numerator / denominator, 0);
  }, [months, monthlyRate, form.targetAmount, form.currentPortfolio]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Contribution to 2030 Goal</CardTitle>
          <CardDescription>
            A FIRE-style sanity check to stay on track with your target.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              Current portfolio
              <Input
                type="number"
                min={0}
                value={form.currentPortfolio}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    currentPortfolio: numberOrZero(event.target.value)
                  }))
                }
              />
            </label>
            <label className="text-sm">
              Monthly contribution
              <Input
                type="number"
                min={0}
                value={form.monthlyContribution}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    monthlyContribution: numberOrZero(event.target.value)
                  }))
                }
              />
            </label>
            <label className="text-sm">
              Expected annual return (%)
              <Input
                type="number"
                min={12}
                max={25}
                value={form.expectedReturn}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    expectedReturn: numberOrZero(event.target.value)
                  }))
                }
              />
            </label>
            <label className="text-sm">
              Inflation estimate (%)
              <Input
                type="number"
                min={0}
                value={form.inflation}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    inflation: numberOrZero(event.target.value)
                  }))
                }
              />
            </label>
            <label className="text-sm">
              Target year
              <Input
                type="number"
                min={currentYear}
                value={form.targetYear}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    targetYear: numberOrZero(event.target.value)
                  }))
                }
              />
            </label>
            <label className="text-sm">
              Target amount
              <Input
                type="number"
                min={0}
                value={form.targetAmount}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    targetAmount: numberOrZero(event.target.value)
                  }))
                }
              />
            </label>
          </div>
          <Button variant="outline">Goal uses monthly compounding</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Projection Summary</CardTitle>
            <CardDescription>Where you land by {form.targetYear}.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatCurrency(projectedValue)}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {gap >= 0
                ? `You’re ahead by ${formatCurrency(gap)}.`
                : `You’re short by ${formatCurrency(Math.abs(gap))}.`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Required Monthly Contribution</CardTitle>
            <CardDescription>To hit the target amount.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(requiredMonthly)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inflation-Adjusted Target</CardTitle>
            <CardDescription>Target value in future money.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(inflationAdjustedTarget)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Future Value Curve</CardTitle>
            <CardDescription>Annual snapshots until target year.</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projection} margin={{ left: 0, right: 16 }}>
                <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Year ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
