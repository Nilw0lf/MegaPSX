"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CompareView } from "@/components/CompareView";
import { DividendCalculator } from "@/components/DividendCalculator";
import { SellPlanner } from "@/components/SellPlanner";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLoad } from "@/lib/useLoad";

const tabOptions = ["dividend", "sell", "compare"] as const;

type TabKey = (typeof tabOptions)[number];

export default function ToolsPage() {
  const loaded = useLoad();
  const [tab, setTab] = useState<TabKey>("dividend");
  const [showSkeleton, setShowSkeleton] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => setShowSkeleton(false), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const requested = searchParams.get("tab") as TabKey | null;
    if (requested && tabOptions.includes(requested)) {
      setTab(requested);
    }
  }, [searchParams]);

  const heading = useMemo(() => {
    switch (tab) {
      case "sell":
        return "Sell Planner";
      case "compare":
        return "Compare Outcomes";
      default:
        return "Dividend After Tax";
    }
  }, [tab]);

  if (!loaded || showSkeleton) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-12 w-72" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          MegaPX Tools
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{heading}</h1>
        <p className="mt-2 text-muted-foreground">
          Choose a calculator and get instant, realistic outcomes.
        </p>
      </div>
      <Tabs value={tab} onValueChange={(value) => setTab(value as TabKey)}>
        <TabsList>
          <TabsTrigger value="dividend">Dividend After Tax</TabsTrigger>
          <TabsTrigger value="sell">Sell Planner</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
        </TabsList>
        <TabsContent value="dividend">
          <DividendCalculator />
        </TabsContent>
        <TabsContent value="sell">
          <SellPlanner />
        </TabsContent>
        <TabsContent value="compare">
          <CompareView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
