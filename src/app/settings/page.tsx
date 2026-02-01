"use client";

import { useEffect, useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppStore } from "@/lib/store";
import { useLoad } from "@/lib/useLoad";
import type { DividendScenario, SellScenario } from "@/types/models";

export default function SettingsPage() {
  const loaded = useLoad();
  const [showSkeleton, setShowSkeleton] = useState(true);
  const exportData = useAppStore((state) => state.exportData);
  const importData = useAppStore((state) => state.importData);
  const resetAll = useAppStore((state) => state.resetAll);
  const pushToast = useAppStore((state) => state.pushToast);
  const taxProfiles = useAppStore((state) => state.taxProfiles);
  const feeProfiles = useAppStore((state) => state.feeProfiles);
  const dividendScenarios = useAppStore((state) => state.dividendScenarios);
  const sellScenarios = useAppStore((state) => state.sellScenarios);
  const addDividendScenario = useAppStore((state) => state.addDividendScenario);
  const addSellScenario = useAppStore((state) => state.addSellScenario);
  const updateFeeProfile = useAppStore((state) => state.updateFeeProfile);
  const updateDividendScenario = useAppStore((state) => state.updateDividendScenario);
  const updateSellScenario = useAppStore((state) => state.updateSellScenario);
  const deleteScenario = useAppStore((state) => state.deleteScenario);

  const [resetInput, setResetInput] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [dividendDrafts, setDividendDrafts] = useState<Record<string, DividendScenario>>({});
  const [sellDrafts, setSellDrafts] = useState<Record<string, SellScenario>>({});

  useEffect(() => {
    const timer = setTimeout(() => setShowSkeleton(false), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const next: Record<string, DividendScenario> = {};
    dividendScenarios.forEach((scenario) => {
      next[scenario.id] = scenario;
    });
    setDividendDrafts(next);
  }, [dividendScenarios]);

  useEffect(() => {
    const next: Record<string, SellScenario> = {};
    sellScenarios.forEach((scenario) => {
      next[scenario.id] = scenario;
    });
    setSellDrafts(next);
  }, [sellScenarios]);

  const handleDividendDraftChange = (
    id: string,
    updater: (prev: DividendScenario) => DividendScenario
  ) => {
    setDividendDrafts((prev) => {
      const current = prev[id] ?? dividendScenarios.find((item) => item.id === id);
      if (!current) return prev;
      return { ...prev, [id]: updater(current) };
    });
  };

  const handleSellDraftChange = (
    id: string,
    updater: (prev: SellScenario) => SellScenario
  ) => {
    setSellDrafts((prev) => {
      const current = prev[id] ?? sellScenarios.find((item) => item.id === id);
      if (!current) return prev;
      return { ...prev, [id]: updater(current) };
    });
  };

  const defaultTaxProfileId = taxProfiles[0]?.id ?? "";
  const defaultFeeProfileId = feeProfiles[0]?.id ?? "";

  if (!loaded || showSkeleton) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  const handleExport = async () => {
    const data = exportData();
    await navigator.clipboard.writeText(data);
    pushToast({ title: "Exported", description: "JSON copied to clipboard." });
  };

  const handleImport = async () => {
    const raw = await navigator.clipboard.readText();
    importData(raw);
  };

  const handleReset = async () => {
    if (resetInput !== "RESET") return;
    await resetAll();
    setResetInput("");
    setResetOpen(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage theme, exports, and local data settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Light default with a premium dark mode.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Controls</CardTitle>
          <CardDescription>Export or import your local-first data.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={handleExport}>
            <Download size={16} />
            Export JSON
          </Button>
          <Button variant="outline" onClick={handleImport}>
            <Upload size={16} />
            Import JSON
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Fee Profile</CardTitle>
          <CardDescription>Update fee profiles directly from settings.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {feeProfiles.map((profile) => (
            <div key={profile.id} className="grid gap-3 rounded-lg border border-border p-4">
              <label className="text-sm">
                Profile name
                <Input
                  value={profile.name}
                  onChange={(event) =>
                    updateFeeProfile({
                      ...profile,
                      name: event.target.value
                    })
                  }
                />
              </label>
              {profile.fees.map((fee) => (
                <div
                  key={fee.id}
                  className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-[1.3fr_1fr_1fr_1fr]"
                >
                  <Input
                    value={fee.label}
                    onChange={(event) =>
                      updateFeeProfile({
                        ...profile,
                        fees: profile.fees.map((item) =>
                          item.id === fee.id ? { ...item, label: event.target.value } : item
                        )
                      })
                    }
                  />
                  <Select
                    value={fee.type}
                    onChange={(event) =>
                      updateFeeProfile({
                        ...profile,
                        fees: profile.fees.map((item) =>
                          item.id === fee.id
                            ? { ...item, type: event.target.value as typeof fee.type }
                            : item
                        )
                      })
                    }
                  >
                    <option value="percent_of_trade_value">% of trade value</option>
                    <option value="fixed">Fixed</option>
                  </Select>
                  <Input
                    type="number"
                    min={0}
                    value={fee.value}
                    onChange={(event) =>
                      updateFeeProfile({
                        ...profile,
                        fees: profile.fees.map((item) =>
                          item.id === fee.id
                            ? { ...item, value: Number(event.target.value) }
                            : item
                        )
                      })
                    }
                  />
                  <Select
                    value={fee.applyOn}
                    onChange={(event) =>
                      updateFeeProfile({
                        ...profile,
                        fees: profile.fees.map((item) =>
                          item.id === fee.id
                            ? { ...item, applyOn: event.target.value as typeof fee.applyOn }
                            : item
                        )
                      })
                    }
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                    <option value="both">Both</option>
                  </Select>
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Scenarios</CardTitle>
          <CardDescription>View and edit your saved dividend and sell scenarios.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Dividend Scenarios</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  addDividendScenario({
                    label: "New dividend scenario",
                    tickerOrName: "New Holding",
                    shares: 100,
                    buyPrice: 100,
                    currentPrice: 100,
                    dividendPerShare: 1,
                    dividendFrequency: "Annual",
                    taxProfileId: defaultTaxProfileId
                  })
                }
              >
                Add
              </Button>
            </div>
            {dividendScenarios.length === 0 ? (
              <p className="text-sm text-muted-foreground">No dividend scenarios saved yet.</p>
            ) : (
              dividendScenarios.map((scenario) => {
                const draft = dividendDrafts[scenario.id] ?? scenario;
                return (
                  <div key={scenario.id} className="grid gap-2 rounded-lg border border-border p-4">
                    <label className="text-sm">
                      Label
                      <Input
                        value={draft.label}
                        onChange={(event) =>
                          handleDividendDraftChange(scenario.id, (prev) => ({
                            ...prev,
                            label: event.target.value
                          }))
                        }
                      />
                    </label>
                    <label className="text-sm">
                      Ticker / Name
                      <Input
                        value={draft.tickerOrName}
                        onChange={(event) =>
                          handleDividendDraftChange(scenario.id, (prev) => ({
                            ...prev,
                            tickerOrName: event.target.value
                          }))
                        }
                      />
                    </label>
                    <div className="grid gap-2 md:grid-cols-3">
                      <label className="text-sm">
                        Shares
                        <Input
                          type="number"
                          min={0}
                          value={draft.shares}
                          onChange={(event) =>
                            handleDividendDraftChange(scenario.id, (prev) => ({
                              ...prev,
                              shares: Number(event.target.value)
                            }))
                          }
                        />
                      </label>
                      <label className="text-sm">
                        Buy Price
                        <Input
                          type="number"
                          min={0}
                          value={draft.buyPrice}
                          onChange={(event) =>
                            handleDividendDraftChange(scenario.id, (prev) => ({
                              ...prev,
                              buyPrice: Number(event.target.value)
                            }))
                          }
                        />
                      </label>
                      <label className="text-sm">
                        Current Price
                        <Input
                          type="number"
                          min={0}
                          value={draft.currentPrice}
                          onChange={(event) =>
                            handleDividendDraftChange(scenario.id, (prev) => ({
                              ...prev,
                              currentPrice: Number(event.target.value)
                            }))
                          }
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => updateDividendScenario(draft)}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteScenario("dividend", scenario.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Sell Scenarios</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  addSellScenario({
                    label: "New sell scenario",
                    tickerOrName: "New Holding",
                    quantity: 100,
                    buyPrice: 100,
                    sellPrice: 110,
                    buyDate: new Date().toISOString().slice(0, 10),
                    sellDate: new Date().toISOString().slice(0, 10),
                    taxProfileId: defaultTaxProfileId,
                    feeProfileId: defaultFeeProfileId
                  })
                }
              >
                Add
              </Button>
            </div>
            {sellScenarios.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sell scenarios saved yet.</p>
            ) : (
              sellScenarios.map((scenario) => {
                const draft = sellDrafts[scenario.id] ?? scenario;
                return (
                  <div key={scenario.id} className="grid gap-2 rounded-lg border border-border p-4">
                    <label className="text-sm">
                      Label
                      <Input
                        value={draft.label}
                        onChange={(event) =>
                          handleSellDraftChange(scenario.id, (prev) => ({
                            ...prev,
                            label: event.target.value
                          }))
                        }
                      />
                    </label>
                    <label className="text-sm">
                      Ticker / Name
                      <Input
                        value={draft.tickerOrName}
                        onChange={(event) =>
                          handleSellDraftChange(scenario.id, (prev) => ({
                            ...prev,
                            tickerOrName: event.target.value
                          }))
                        }
                      />
                    </label>
                    <div className="grid gap-2 md:grid-cols-3">
                      <label className="text-sm">
                        Quantity
                        <Input
                          type="number"
                          min={0}
                          value={draft.quantity}
                          onChange={(event) =>
                            handleSellDraftChange(scenario.id, (prev) => ({
                              ...prev,
                              quantity: Number(event.target.value)
                            }))
                          }
                        />
                      </label>
                      <label className="text-sm">
                        Buy Price
                        <Input
                          type="number"
                          min={0}
                          value={draft.buyPrice}
                          onChange={(event) =>
                            handleSellDraftChange(scenario.id, (prev) => ({
                              ...prev,
                              buyPrice: Number(event.target.value)
                            }))
                          }
                        />
                      </label>
                      <label className="text-sm">
                        Sell Price
                        <Input
                          type="number"
                          min={0}
                          value={draft.sellPrice}
                          onChange={(event) =>
                            handleSellDraftChange(scenario.id, (prev) => ({
                              ...prev,
                              sellPrice: Number(event.target.value)
                            }))
                          }
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => updateSellScenario(draft)}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteScenario("sell", scenario.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reset Local Data</CardTitle>
          <CardDescription>
            Type RESET to confirm removal of all saved scenarios and templates.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 max-w-md">
          <Button variant="danger" onClick={() => setResetOpen(true)}>
            Open reset modal
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data disclaimer</CardTitle>
          <CardDescription>Enter rates based on your broker/tax status.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Default currency formatting uses PKR but can be adapted when you export data.
          </p>
        </CardContent>
      </Card>

      {resetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold">Confirm reset</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This clears all local data. Type RESET to confirm.
            </p>
            <Input
              className="mt-4"
              value={resetInput}
              onChange={(event) => setResetInput(event.target.value)}
              placeholder="Type RESET"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setResetOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleReset}>
                Confirm reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
