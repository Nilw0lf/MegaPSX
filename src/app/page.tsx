"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Coins,
  Gauge,
  LineChart,
  PiggyBank,
  Scale,
  Search,
  ShieldCheck
} from "lucide-react";
import { PsxDashboard } from "@/components/PsxDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoad } from "@/lib/useLoad";

export default function DashboardPage() {
  const loaded = useLoad();
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
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            MegaPX Dashboard
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Profit Reality Suite</h1>
          <p className="mt-3 text-muted-foreground">
            A calm command center for dividends, sell planning, and long-term allocation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/tools">
              <Card className="min-w-[220px] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-accent/10 p-2 text-accent">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Open Core Tools</p>
                    <p className="text-xs text-muted-foreground">Dividend, Sell, Compare</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link href="/templates">
              <Card className="min-w-[220px] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-accent/10 p-2 text-accent">
                    <Gauge size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Profiles & Fees</p>
                    <p className="text-xs text-muted-foreground">Tax + fee templates</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-accent/10 p-3 text-accent">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold">Local-first by design</p>
              <p className="text-xs text-muted-foreground">
                No login. Your data stays in your browser.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <p>✔️ Editable tax + fee templates</p>
            <p>✔️ Scenario history and comparisons</p>
            <p>✔️ Goal + risk calculators</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-accent">
              <PiggyBank size={18} />
              <CardTitle>2030 Goal Calculator</CardTitle>
            </div>
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
            <div className="flex items-center gap-2 text-accent">
              <Scale size={18} />
              <CardTitle>Position Sizing + Risk Guardrails</CardTitle>
            </div>
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
            <div className="flex items-center gap-2 text-accent">
              <Coins size={18} />
              <CardTitle>Inflation Calculator</CardTitle>
            </div>
            <CardDescription>See how PKR purchasing power changes over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="text-sm font-medium text-accent underline" href="/inflation">
              Open calculator →
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-accent">
              <LineChart size={18} />
              <CardTitle>Dividend After Tax</CardTitle>
            </div>
            <CardDescription>Net yield and cashflow clarity.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="text-sm font-medium text-accent underline" href="/tools?tab=dividend">
              Open tool →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-accent">
              <BarChart3 size={18} />
              <CardTitle>Sell Planner</CardTitle>
            </div>
            <CardDescription>Fees, CGT, and net profit reality.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="text-sm font-medium text-accent underline" href="/tools?tab=sell">
              Open tool →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-accent">
              <Scale size={18} />
              <CardTitle>Compare Outcomes</CardTitle>
            </div>
            <CardDescription>Hold vs sell, side-by-side.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="text-sm font-medium text-accent underline" href="/tools?tab=compare">
              Open tool →
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-accent">
              <Search size={18} />
              <CardTitle>Market Lookup</CardTitle>
            </div>
            <CardDescription>Search local PSX daily prices.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="text-sm font-medium text-accent underline" href="/market">
              Open market page →
            </Link>
          </CardContent>
        </Card>
      </div>

      <PsxDashboard />
    </div>
  );
}
