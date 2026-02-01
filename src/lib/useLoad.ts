"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export const useLoad = () => {
  const loaded = useAppStore((state) => state.loaded);
  const load = useAppStore((state) => state.load);

  useEffect(() => {
    if (!loaded) {
      load();
    }
  }, [loaded, load]);

  return loaded;
};
