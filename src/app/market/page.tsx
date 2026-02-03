"use client";

import { useEffect, useState } from "react";
import { MarketLookup } from "@/components/MarketLookup";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoad } from "@/lib/useLoad";

export default function MarketPage() {
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
        <h1 className="text-3xl font-semibold">Market Lookup</h1>
        <p className="mt-2 text-muted-foreground">
          Fetch daily prices from the local PSX API.
        </p>
      </div>
      <MarketLookup />
    </div>
  );
}
