"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatPercent } from "@/lib/format";

const numberOrZero = (value: string | number) => {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : 0;
};

export const RiskGuardrailCalculator = () => {
  const [form, setForm] = useState({
    totalPortfolio: 5000000,
    maxPositionPercent: 10,
    sectorCapPercent: 25,
    currentPosition: 350000,
    currentSectorExposure: 900000,
    newInvestmentAmount: 200000
  });

  const maxPositionValue =
    (numberOrZero(form.totalPortfolio) * numberOrZero(form.maxPositionPercent)) / 100;
  const sectorCapValue =
    (numberOrZero(form.totalPortfolio) * numberOrZero(form.sectorCapPercent)) / 100;

  const positionHeadroom = maxPositionValue - numberOrZero(form.currentPosition);
  const sectorHeadroom = sectorCapValue - numberOrZero(form.currentSectorExposure);

  const allowedBuyAmount = Math.max(
    Math.min(positionHeadroom, sectorHeadroom, numberOrZero(form.newInvestmentAmount)),
    0
  );

  const overweightPosition = numberOrZero(form.currentPosition) > maxPositionValue;
  const overweightSector = numberOrZero(form.currentSectorExposure) > sectorCapValue;

  const suggestions = useMemo(() => {
    if (overweightPosition || overweightSector) {
      return [
        "Hold new buys in this position.",
        "Add to underweight sectors instead.",
        "Use new cash to rebalance gradually."
      ];
    }
    return [
      `You can add up to ${formatCurrency(allowedBuyAmount)} now.`,
      "If you want diversification, split across two underweight sectors.",
      "Keep cash buffer for monthly contributions."
    ];
  }, [overweightPosition, overweightSector, allowedBuyAmount]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Position Sizing + Risk Guardrails</CardTitle>
          <CardDescription>
            Not for day trading. Understand safe allocations for long-term positions.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              Total portfolio value
              <Input
                type="number"
                min={0}
                value={form.totalPortfolio}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    totalPortfolio: numberOrZero(event.target.value)
                  }))
                }
              />
            </label>
            <label className="text-sm">
              Max position size rule (%)
              <Input
                type="number"
                min={0}
                value={form.maxPositionPercent}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    maxPositionPercent: numberOrZero(event.target.value)
                  }))
                }
              />
            </label>
            <label className="text-sm">
              Sector cap (%)
              <Input
                type="number"
                min={0}
                value={form.sectorCapPercent}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    sectorCapPercent: numberOrZero(event.target.value)
                  }))
                }
              />
            </label>
            <label className="text-sm">
              New investment amount
              <Input
                type="number"
                min={0}
                value={form.newInvestmentAmount}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    newInvestmentAmount: numberOrZero(event.target.value)
                  }))
                }
              />
            </label>
            <label className="text-sm">
              Current position size
              <Input
                type="number"
                min={0}
                value={form.currentPosition}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    currentPosition: numberOrZero(event.target.value)
                  }))
                }
              />
            </label>
            <label className="text-sm">
              Current sector exposure
              <Input
                type="number"
                min={0}
                value={form.currentSectorExposure}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    currentSectorExposure: numberOrZero(event.target.value)
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
            <CardTitle>Allowed Buy Amount</CardTitle>
            <CardDescription>Based on your rules and current exposure.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatCurrency(allowedBuyAmount)}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Max position: {formatCurrency(maxPositionValue)} · Sector cap: {formatCurrency(sectorCapValue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Guardrail Alerts</CardTitle>
            <CardDescription>Instant signals for overweight allocations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className={overweightPosition ? "text-danger" : "text-muted-foreground"}>
              Position rule: {overweightPosition ? "Overweight" : "Within limit"} ({formatPercent((numberOrZero(form.currentPosition) / numberOrZero(form.totalPortfolio)) * 100 || 0)})
            </p>
            <p className={overweightSector ? "text-danger" : "text-muted-foreground"}>
              Sector cap: {overweightSector ? "Overweight" : "Within limit"} ({formatPercent((numberOrZero(form.currentSectorExposure) / numberOrZero(form.totalPortfolio)) * 100 || 0)})
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rebalance Suggestions</CardTitle>
            <CardDescription>Actionable next steps.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {suggestions.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>What to Buy Next</CardTitle>
            <CardDescription>Shortlist based on your guardrails.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {overweightPosition || overweightSector ? (
              <>
                <p>Prioritize underweight sectors or diversified funds.</p>
                <p>Hold off on adding to the current position.</p>
              </>
            ) : (
              <>
                <p>Add to this position up to {formatCurrency(allowedBuyAmount)}.</p>
                <p>Split remaining cash across two underweight sectors.</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
