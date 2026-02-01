"use client";

import { useEffect, useState } from "react";
import { CompareView } from "@/components/CompareView";
import { DividendCalculator } from "@/components/DividendCalculator";
import { SellPlanner } from "@/components/SellPlanner";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLoad } from "@/lib/useLoad";

export default function DashboardPage() {
  const loaded = useLoad();
  const [tab, setTab] = useState("dividend");
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSkeleton(false), 400);
    return () => clearTimeout(timer);
  }, []);

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
        <h1 className="text-3xl font-semibold">MegaPX Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Calm, local-first calculations for dividends and sell planning.
        </p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
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
