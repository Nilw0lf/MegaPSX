"use client";

import { useEffect, useState } from "react";
import { RiskGuardrailCalculator } from "@/components/RiskGuardrailCalculator";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoad } from "@/lib/useLoad";

export default function RiskPage() {
  const loaded = useLoad();
  const [showSkeleton, setShowSkeleton] = useState(true);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Position Sizing + Risk Guardrails</h1>
        <p className="mt-2 text-muted-foreground">
          Plan safe allocations and avoid overweight positions.
        </p>
      </div>
      <RiskGuardrailCalculator />
    </div>
  );
}
