"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/store";
import { useLoad } from "@/lib/useLoad";
import type { FeeItem, TaxProfile } from "@/types/models";

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Math.random().toString(16).slice(2)}`;

const validateSlabs = (profile: TaxProfile) => {
  const sorted = [...profile.cgtRules].sort((a, b) => a.minDays - b.minDays);
  for (let i = 0; i < sorted.length; i += 1) {
    const rule = sorted[i];
    if (rule.maxDays !== null && rule.maxDays < rule.minDays) {
      return "Max days must be above min days.";
    }
    if (i > 0) {
      const prev = sorted[i - 1];
      const prevMax = prev.maxDays ?? Infinity;
      if (rule.minDays <= prevMax) {
        return "CGT slabs overlap. Adjust ranges.";
      }
    }
  }
  return null;
};

export default function TemplatesPage() {
  const loaded = useLoad();
  const [showSkeleton, setShowSkeleton] = useState(true);
  const taxProfiles = useAppStore((state) => state.taxProfiles);
  const feeProfiles = useAppStore((state) => state.feeProfiles);
  const sellScenarios = useAppStore((state) => state.sellScenarios);
  const addTaxProfile = useAppStore((state) => state.addTaxProfile);
  const updateTaxProfile = useAppStore((state) => state.updateTaxProfile);
  const deleteTaxProfile = useAppStore((state) => state.deleteTaxProfile);
  const addFeeProfile = useAppStore((state) => state.addFeeProfile);
  const updateFeeProfile = useAppStore((state) => state.updateFeeProfile);
  const deleteFeeProfile = useAppStore((state) => state.deleteFeeProfile);

  const [selectedTradeValue, setSelectedTradeValue] = useState(0);
  const [selectedScenarioId, setSelectedScenarioId] = useState("");

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

  const scenarioTradeValue = useMemo(() => {
    const scenario = sellScenarios.find((item) => item.id === selectedScenarioId);
    return scenario ? scenario.quantity * scenario.sellPrice : 0;
  }, [sellScenarios, selectedScenarioId]);

  const tradeValueForPreview = scenarioTradeValue || selectedTradeValue;

  const feePreview = useMemo(() => {
    if (!tradeValueForPreview) return null;
    return feeProfiles.map((profile) => {
      const total = profile.fees.reduce((sum, fee) => {
        if (fee.type === "percent_of_trade_value") {
          return sum + tradeValueForPreview * (fee.value / 100);
        }
        return sum + fee.value;
      }, 0);
      return { id: profile.id, total };
    });
  }, [feeProfiles, tradeValueForPreview]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold">Templates</h1>
        <p className="mt-2 text-muted-foreground">
          Configure reusable tax and fee profiles once, then apply them everywhere.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Tax Profiles</h2>
            <p className="text-sm text-muted-foreground">Dividend withholding + CGT slabs.</p>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              addTaxProfile({
                name: "New Tax Profile",
                dividendWithholdingRate: 0,
                cgtRules: [
                  {
                    id: makeId(),
                    label: "0+ days",
                    minDays: 0,
                    maxDays: null,
                    rate: 0
                  }
                ]
              })
            }
          >
            <Plus size={16} />
            Add profile
          </Button>
        </div>
        <div className="grid gap-4">
          {taxProfiles.map((profile) => {
            const error = validateSlabs(profile);
            return (
              <Card key={profile.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{profile.name}</CardTitle>
                    <CardDescription>
                      CGT slabs must not overlap. Rates are editable placeholders.
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTaxProfile(profile.id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <label className="text-sm">
                    Profile Name
                    <Input
                      value={profile.name}
                      onChange={(event) =>
                        updateTaxProfile({
                          ...profile,
                          name: event.target.value
                        })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Dividend withholding rate (%)
                    <Input
                      type="number"
                      min={0}
                      value={profile.dividendWithholdingRate}
                      onChange={(event) =>
                        updateTaxProfile({
                          ...profile,
                          dividendWithholdingRate: Number(event.target.value)
                        })
                      }
                    />
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">CGT Slabs</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateTaxProfile({
                            ...profile,
                            cgtRules: [
                              ...profile.cgtRules,
                              {
                                id: makeId(),
                                label: "New slab",
                                minDays: 0,
                                maxDays: null,
                                rate: 0
                              }
                            ]
                          })
                        }
                      >
                        <Plus size={14} />
                        Add slab
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {profile.cgtRules.map((rule) => (
                        <div
                          key={rule.id}
                          className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]"
                        >
                          <Input
                            value={rule.label}
                            onChange={(event) => {
                              updateTaxProfile({
                                ...profile,
                                cgtRules: profile.cgtRules.map((item) =>
                                  item.id === rule.id
                                    ? { ...item, label: event.target.value }
                                    : item
                                )
                              });
                            }}
                          />
                          <Input
                            type="number"
                            min={0}
                            value={rule.minDays}
                            onChange={(event) =>
                              updateTaxProfile({
                                ...profile,
                                cgtRules: profile.cgtRules.map((item) =>
                                  item.id === rule.id
                                    ? { ...item, minDays: Number(event.target.value) }
                                    : item
                                )
                              })
                            }
                          />
                          <Input
                            type="number"
                            min={0}
                            value={rule.maxDays ?? ""}
                            onChange={(event) =>
                              updateTaxProfile({
                                ...profile,
                                cgtRules: profile.cgtRules.map((item) =>
                                  item.id === rule.id
                                    ? {
                                        ...item,
                                        maxDays: event.target.value
                                          ? Number(event.target.value)
                                          : null
                                      }
                                    : item
                                )
                              })
                            }
                            placeholder="Max days"
                          />
                          <Input
                            type="number"
                            min={0}
                            value={rule.rate}
                            onChange={(event) =>
                              updateTaxProfile({
                                ...profile,
                                cgtRules: profile.cgtRules.map((item) =>
                                  item.id === rule.id
                                    ? { ...item, rate: Number(event.target.value) }
                                    : item
                                )
                              })
                            }
                            placeholder="Rate %"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateTaxProfile({
                                ...profile,
                                cgtRules: profile.cgtRules.filter(
                                  (item) => item.id !== rule.id
                                )
                              })
                            }
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {error && <p className="text-sm text-danger">{error}</p>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Fee Profiles</h2>
            <p className="text-sm text-muted-foreground">
              Define fee templates (percent or fixed) and reuse them.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              addFeeProfile({
                name: "New Fee Profile",
                fees: [
                  {
                    id: makeId(),
                    label: "Broker commission",
                    type: "percent_of_trade_value",
                    value: 0,
                    applyOn: "sell"
                  }
                ]
              })
            }
          >
            <Plus size={16} />
            Add profile
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Fee Preview</CardTitle>
            <CardDescription>Estimate total fees at a trade value.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                Scenario preview
                <Select
                  value={selectedScenarioId}
                  onChange={(event) => setSelectedScenarioId(event.target.value)}
                >
                  <option value="">Select sell scenario</option>
                  {sellScenarios.map((scenario) => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.label}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="text-sm">
                Or enter trade value
                <Input
                  type="number"
                  min={0}
                  value={selectedTradeValue}
                  onChange={(event) => setSelectedTradeValue(Number(event.target.value))}
                />
              </label>
            </div>
            {feePreview && (
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                {feePreview.map((item) => (
                  <p key={item.id}>Estimated fees: {item.total.toFixed(2)}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <div className="grid gap-4">
          {feeProfiles.map((profile) => (
            <Card key={profile.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{profile.name}</CardTitle>
                  <CardDescription>Rates are editable placeholders.</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteFeeProfile(profile.id)}
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </CardHeader>
              <CardContent className="grid gap-4">
                <label className="text-sm">
                  Profile Name
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Fee Items</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateFeeProfile({
                          ...profile,
                          fees: [
                            ...profile.fees,
                            {
                              id: makeId(),
                              label: "New fee",
                              type: "fixed",
                              value: 0,
                              applyOn: "sell"
                            } as FeeItem
                          ]
                        })
                      }
                    >
                      <Plus size={14} />
                      Add fee
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {profile.fees.map((fee) => (
                      <div
                        key={fee.id}
                        className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]"
                      >
                        <Input
                          value={fee.label}
                          onChange={(event) =>
                            updateFeeProfile({
                              ...profile,
                              fees: profile.fees.map((item) =>
                                item.id === fee.id
                                  ? { ...item, label: event.target.value }
                                  : item
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
                                  ? {
                                      ...item,
                                      type: event.target.value as FeeItem["type"]
                                    }
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
                                  ? {
                                      ...item,
                                      applyOn: event.target.value as FeeItem["applyOn"]
                                    }
                                  : item
                              )
                            })
                          }
                        >
                          <option value="buy">Buy</option>
                          <option value="sell">Sell</option>
                          <option value="both">Both</option>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            updateFeeProfile({
                              ...profile,
                              fees: profile.fees.filter((item) => item.id !== fee.id)
                            })
                          }
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
