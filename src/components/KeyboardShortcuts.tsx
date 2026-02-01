"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const KeyboardShortcuts = () => {
  const router = useRouter();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        return;
      }
      if (event.metaKey || event.ctrlKey) {
        if (event.key === "Enter") {
          event.preventDefault();
          window.dispatchEvent(new CustomEvent("megapx-save"));
          return;
        }
      }
      if (event.key.toLowerCase() === "d") {
        router.push("/tools?tab=dividend");
      }
      if (event.key.toLowerCase() === "s") {
        router.push("/tools?tab=sell");
      }
      if (event.key.toLowerCase() === "c") {
        router.push("/tools?tab=compare");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  return null;
};
