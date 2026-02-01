"use client";

import { useEffect, useState } from "react";
import { CompareView } from "@/components/CompareView";
import { DividendCalculator } from "@/components/DividendCalculator";
import { SellPlanner } from "@/components/SellPlanner";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>2030 Goal Calculator</CardTitle>
            <CardDescription>Model monthly contributions and future value.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="text-sm font-medium text-accent underline" href="/goal">
              Open calculator →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Position Sizing + Risk Guardrails</CardTitle>
            <CardDescription>Plan safe allocations and avoid overweight positions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="text-sm font-medium text-accent underline" href="/risk">
              Open calculator →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inflation Calculator</CardTitle>
            <CardDescription>See how PKR purchasing power changes over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="text-sm font-medium text-accent underline" href="/inflation">
              Open calculator →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
