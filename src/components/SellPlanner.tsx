"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ClipboardCopy, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { calcSell, findBreakEvenPrice } from "@/lib/calculations";
import { formatCurrency, formatPercent } from "@/lib/format";
import { useAppStore } from "@/lib/store";

export const SellPlanner = () => {
  const taxProfiles = useAppStore((state) => state.taxProfiles);
  const feeProfiles = useAppStore((state) => state.feeProfiles);
  const addScenario = useAppStore((state) => state.addSellScenario);
  const pushToast = useAppStore((state) => state.pushToast);

  const [form, setForm] = useState({
    label: "Sell plan",
    tickerOrName: "MegaPower",
    quantity: 500,
    buyPrice: 120,
    sellPrice: 145,
    buyDate: new Date(new Date().setMonth(new Date().getMonth() - 9))
      .toISOString()
      .slice(0, 10),
    sellDate: new Date().toISOString().slice(0, 10),
    taxProfileId: taxProfiles[0]?.id || "",
    feeProfileId: feeProfiles[0]?.id || ""
  });

  useEffect(() => {
    if (!form.taxProfileId && taxProfiles[0]) {
      setForm((prev) => ({ ...prev, taxProfileId: taxProfiles[0].id }));
    }
    if (!form.feeProfileId && feeProfiles[0]) {
      setForm((prev) => ({ ...prev, feeProfileId: feeProfiles[0].id }));
    }
  }, [feeProfiles, form.feeProfileId, form.taxProfileId, taxProfiles]);

  const taxProfile = taxProfiles.find((profile) => profile.id === form.taxProfileId);
  const feeProfile = feeProfiles.find((profile) => profile.id === form.feeProfileId);

  const results = useMemo(
    () =>
      calcSell(
        {
          id: "preview",
          label: form.label,
          tickerOrName: form.tickerOrName,
          quantity: Number(form.quantity),
          buyPrice: Number(form.buyPrice),
          sellPrice: Number(form.sellPrice),
          buyDate: form.buyDate,
          sellDate: form.sellDate,
          taxProfileId: form.taxProfileId,
          feeProfileId: form.feeProfileId,
          currency: "PKR",
          createdAt: "",
          updatedAt: ""
        },
        taxProfile,
        feeProfile
      ),
    [form, taxProfile, feeProfile]
  );

  const breakEven = useMemo(
    () =>
      findBreakEvenPrice(
        {
          id: "preview",
          label: form.label,
          tickerOrName: form.tickerOrName,
          quantity: Number(form.quantity),
          buyPrice: Number(form.buyPrice),
          sellPrice: Number(form.sellPrice),
          buyDate: form.buyDate,
          sellDate: form.sellDate,
          taxProfileId: form.taxProfileId,
          feeProfileId: form.feeProfileId,
          currency: "PKR",
          createdAt: "",
          updatedAt: ""
        },
        taxProfile,
        feeProfile
      ),
    [form, taxProfile, feeProfile]
  );

  const chartData = useMemo(() => {
    const base = Number(form.sellPrice) || 0;
    if (!base) return [];
    return Array.from({ length: 9 }).map((_, index) => {
      const multiplier = 0.8 + index * 0.05;
      const sellPrice = base * multiplier;
      const preview = calcSell(
        {
          id: "preview",
          label: form.label,
          tickerOrName: form.tickerOrName,
          quantity: Number(form.quantity),
          buyPrice: Number(form.buyPrice),
          sellPrice,
          buyDate: form.buyDate,
          sellDate: form.sellDate,
          taxProfileId: form.taxProfileId,
          feeProfileId: form.feeProfileId,
          currency: "PKR",
          createdAt: "",
          updatedAt: ""
        },
        taxProfile,
        feeProfile
      );
      return {
        sellPrice,
        netPL: preview.netPL
      };
    });
  }, [form, taxProfile, feeProfile]);

  const handleSave = useCallback(() => {
    addScenario({
      label: form.label,
      tickerOrName: form.tickerOrName,
      quantity: Number(form.quantity),
      buyPrice: Number(form.buyPrice),
      sellPrice: Number(form.sellPrice),
      buyDate: form.buyDate,
      sellDate: form.sellDate,
      taxProfileId: form.taxProfileId,
      feeProfileId: form.feeProfileId
    });
  }, [addScenario, form]);

  useEffect(() => {
    const handler = () => handleSave();
    window.addEventListener("megapx-save", handler);
    return () => window.removeEventListener("megapx-save", handler);
  }, [handleSave]);

  const handleCopy = async () => {
    const summary = `Sell Planner Summary\nScenario: ${form.label}\nTicker/Name: ${form.tickerOrName}\nNet P/L: ${formatCurrency(results.netPL)}\nNet Return: ${formatPercent(results.netReturn)}\nFees: ${formatCurrency(results.totalFees)}\nCGT: ${formatCurrency(results.cgt)}\nBreak-even Price: ${formatCurrency(breakEven)}`;
    await navigator.clipboard.writeText(summary);
    pushToast({ title: "Summary copied" });
  };

  const dateError = form.sellDate < form.buyDate;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Sell Planner</CardTitle>
          <CardDescription>
            Estimate CGT, fees, and net profit reality before you sell.
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
              Quantity
              <Input
                type="number"
                min={0}
                value={form.quantity}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))
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
              Sell Price
              <Input
                type="number"
                min={0}
                value={form.sellPrice}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, sellPrice: Number(event.target.value) }))
                }
              />
            </label>
            <label className="text-sm">
              Buy Date
              <Input
                type="date"
                value={form.buyDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, buyDate: event.target.value }))
                }
              />
            </label>
            <label className="text-sm">
              Sell Date
              <Input
                type="date"
                value={form.sellDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, sellDate: event.target.value }))
                }
              />
              {dateError && (
                <p className="text-xs text-danger">Sell date cannot be before buy date.</p>
              )}
            </label>
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
            <label className="text-sm">
              Fee Profile
              <Select
                value={form.feeProfileId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, feeProfileId: event.target.value }))
                }
              >
                {feeProfiles.map((profile) => (
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
            <CardTitle>Net Profit Reality</CardTitle>
            <CardDescription>After fees + CGT.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {formatCurrency(results.netPL)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Gross P/L: {formatCurrency(results.grossPL)} · CGT rate: {results.cgtRate}%
            </p>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Net Return</CardTitle>
              <CardDescription>Return on cost basis.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {formatPercent(results.netReturn)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Fee Drag</CardTitle>
              <CardDescription>Fees as % of trade.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {formatPercent(results.feeDrag)}
              </p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Break-even Price</CardTitle>
            <CardDescription>Sell price per share to net zero.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatCurrency(breakEven)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net P/L vs Sell Price</CardTitle>
            <CardDescription>See the curve across sell targets.</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: 0, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="sellPrice"
                  tickFormatter={(value) => value.toFixed(0)}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tickFormatter={(value) => value.toFixed(0)}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Sell: ${label.toFixed(2)}`}
                />
                <Line
                  type="monotone"
                  dataKey="netPL"
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
