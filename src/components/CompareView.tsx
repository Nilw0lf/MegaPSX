"use client";

import { useMemo, useState } from "react";
import { ClipboardCopy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { calcDividend, calcSell } from "@/lib/calculations";
import { formatCurrency, formatPercent } from "@/lib/format";
import { useAppStore } from "@/lib/store";

export const CompareView = () => {
  const dividendScenarios = useAppStore((state) => state.dividendScenarios);
  const sellScenarios = useAppStore((state) => state.sellScenarios);
  const taxProfiles = useAppStore((state) => state.taxProfiles);
  const feeProfiles = useAppStore((state) => state.feeProfiles);
  const pushToast = useAppStore((state) => state.pushToast);

  const [selectedDividendId, setSelectedDividendId] = useState(
    dividendScenarios[0]?.id || ""
  );
  const [selectedSellId, setSelectedSellId] = useState(sellScenarios[0]?.id || "");

  const dividendScenario = dividendScenarios.find(
    (scenario) => scenario.id === selectedDividendId
  );
  const sellScenario = sellScenarios.find((scenario) => scenario.id === selectedSellId);

  const dividendResults = useMemo(() => {
    if (!dividendScenario) return null;
    const taxProfile = taxProfiles.find(
      (profile) => profile.id === dividendScenario.taxProfileId
    );
    return calcDividend({
      shares: dividendScenario.shares,
      buyPrice: dividendScenario.buyPrice,
      currentPrice: dividendScenario.currentPrice,
      dividendPerShare: dividendScenario.dividendPerShare,
      frequency: dividendScenario.dividendFrequency,
      customDistributionsPerYear: dividendScenario.customDistributionsPerYear,
      withholdingRate: taxProfile?.dividendWithholdingRate ?? 0
    });
  }, [dividendScenario, taxProfiles]);

  const sellResults = useMemo(() => {
    if (!sellScenario) return null;
    const taxProfile = taxProfiles.find((profile) => profile.id === sellScenario.taxProfileId);
    const feeProfile = feeProfiles.find((profile) => profile.id === sellScenario.feeProfileId);
    return calcSell(sellScenario, taxProfile, feeProfile);
  }, [sellScenario, taxProfiles, feeProfiles]);

  const monthsEquivalent = useMemo(() => {
    if (!dividendResults || !sellResults) return 0;
    const monthlyDividend = dividendResults.annualNet / 12;
    if (!monthlyDividend) return 0;
    return sellResults.netPL / monthlyDividend;
  }, [dividendResults, sellResults]);

  const handleCopy = async () => {
    if (!dividendResults || !sellResults || !dividendScenario || !sellScenario) return;
    const summary = `Compare Summary\nDividend Scenario: ${dividendScenario.label}\nAnnual Net Dividend: ${formatCurrency(dividendResults.annualNet)}\nSell Scenario: ${sellScenario.label}\nNet Profit from Sell: ${formatCurrency(sellResults.netPL)}\nEquivalent Dividend Months: ${monthsEquivalent.toFixed(1)}`;
    await navigator.clipboard.writeText(summary);
    pushToast({ title: "Compare summary copied" });
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Compare Hold vs Sell</CardTitle>
          <CardDescription>
            Pick one dividend and one sell scenario to compare their outcome.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            Dividend Scenario
            <Select
              value={selectedDividendId}
              onChange={(event) => setSelectedDividendId(event.target.value)}
            >
              {dividendScenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.label}
                </option>
              ))}
            </Select>
          </label>
          <label className="text-sm">
            Sell Scenario
            <Select
              value={selectedSellId}
              onChange={(event) => setSelectedSellId(event.target.value)}
            >
              {sellScenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.label}
                </option>
              ))}
            </Select>
          </label>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Annual Net Dividend</CardTitle>
            <CardDescription>After withholding tax.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {dividendResults ? formatCurrency(dividendResults.annualNet) : "--"}
            </p>
            <p className="text-sm text-muted-foreground">
              Yield on cost: {dividendResults ? formatPercent(dividendResults.netYieldOnCost) : "--"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Profit if Sold</CardTitle>
            <CardDescription>After CGT + fees.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {sellResults ? formatCurrency(sellResults.netPL) : "--"}
            </p>
            <p className="text-sm text-muted-foreground">
              Net return: {sellResults ? formatPercent(sellResults.netReturn) : "--"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Equivalent Dividend Months</CardTitle>
            <CardDescription>How long to earn the sell profit via dividends.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {dividendResults && sellResults ? `${monthsEquivalent.toFixed(1)} months` : "--"}
            </p>
            <Button className="mt-3" variant="outline" onClick={handleCopy}>
              <ClipboardCopy size={16} />
              Copy compare summary
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
