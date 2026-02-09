"use client";

import { useEffect, useState } from "react";
import { DividendCalculator } from "@/components/DividendCalculator";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoad } from "@/lib/useLoad";

export default function DividendPage() {
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
        <h1 className="text-3xl font-semibold">Dividend After-Tax</h1>
        <p className="mt-2 text-muted-foreground">
          Quick net dividend yield with editable tax profiles.
        </p>
      </div>
      <DividendCalculator />
    </div>
  );
}
