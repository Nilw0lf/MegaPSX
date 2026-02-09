"use client";

import Link from "next/link";
import { Download, LayoutGrid, Settings, Upload } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const dividendScenarios = useAppStore((state) => state.dividendScenarios);
  const sellScenarios = useAppStore((state) => state.sellScenarios);
  const exportData = useAppStore((state) => state.exportData);
  const importData = useAppStore((state) => state.importData);
  const pushToast = useAppStore((state) => state.pushToast);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "/") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return [
      ...dividendScenarios.map((item) => ({
        id: item.id,
        label: item.label,
        type: "Dividend",
        href: "/tools?tab=dividend"
      })),
      ...sellScenarios.map((item) => ({
        id: item.id,
        label: item.label,
        type: "Sell",
        href: "/tools?tab=sell"
      }))
    ].filter((item) => item.label.toLowerCase().includes(query));
  }, [searchQuery, dividendScenarios, sellScenarios]);

  const handleExport = async () => {
    const data = exportData();
    await navigator.clipboard.writeText(data);
    pushToast({ title: "Exported", description: "JSON copied to clipboard." });
  };

  const handleImport = async () => {
    const raw = await navigator.clipboard.readText();
    importData(raw);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold">
            MegaPX
          </Link>
          <Link href="/tools" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
            Tools
          </Link>
          <Link href="/watchlist" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
            Watchlist
          </Link>
        </div>
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            placeholder="Search scenarios…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          {searchQuery.trim() && (
            <div className="absolute left-0 right-0 mt-2 rounded-xl border border-white/10 bg-card/70 p-2 shadow-card backdrop-blur-xl">
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  No matches. Try another label.
                </p>
              ) : (
                filtered.slice(0, 5).map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                      "hover:bg-muted"
                    )}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.type}
                    </span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/">
            <Button variant="ghost" size="sm">
              <LayoutGrid size={16} />
              Dashboard
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download size={16} />
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={handleImport}>
            <Upload size={16} />
            Import
          </Button>
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <Settings size={16} />
              Settings
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
