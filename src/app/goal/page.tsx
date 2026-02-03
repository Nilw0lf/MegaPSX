"use client";

import { useEffect, useState } from "react";
import { GoalCalculator } from "@/components/GoalCalculator";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoad } from "@/lib/useLoad";

export default function GoalPage() {
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
        <h1 className="text-3xl font-semibold">2030 Goal Calculator</h1>
        <p className="mt-2 text-muted-foreground">
          Model monthly contributions and see your future value curve.
        </p>
      </div>
      <GoalCalculator />
    </div>
  );
}
