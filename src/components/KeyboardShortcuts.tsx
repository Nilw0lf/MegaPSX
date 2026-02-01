"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export const KeyboardShortcuts = () => {
  const router = useRouter();
  const pathname = usePathname();

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
        if (pathname !== "/dividend") {
          router.push("/dividend");
        }
      }
      if (event.key.toLowerCase() === "s") {
        if (pathname !== "/sell") {
          router.push("/sell");
        }
      }
      if (event.key.toLowerCase() === "c") {
        if (pathname !== "/") {
          router.push("/");
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router, pathname]);

  return null;
};
