"use client";

import { useEffect, useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppStore } from "@/lib/store";
import { useLoad } from "@/lib/useLoad";

export default function SettingsPage() {
  const loaded = useLoad();
  const [showSkeleton, setShowSkeleton] = useState(true);
  const exportData = useAppStore((state) => state.exportData);
  const importData = useAppStore((state) => state.importData);
  const resetAll = useAppStore((state) => state.resetAll);
  const pushToast = useAppStore((state) => state.pushToast);

  const [resetInput, setResetInput] = useState("");
  const [resetOpen, setResetOpen] = useState(false);

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

  const handleExport = async () => {
    const data = exportData();
    await navigator.clipboard.writeText(data);
    pushToast({ title: "Exported", description: "JSON copied to clipboard." });
  };

  const handleImport = async () => {
    const raw = await navigator.clipboard.readText();
    importData(raw);
  };

  const handleReset = async () => {
    if (resetInput !== "RESET") return;
    await resetAll();
    setResetInput("");
    setResetOpen(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage theme, exports, and local data settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Light default with a premium dark mode.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Controls</CardTitle>
          <CardDescription>Export or import your local-first data.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={handleExport}>
            <Download size={16} />
            Export JSON
          </Button>
          <Button variant="outline" onClick={handleImport}>
            <Upload size={16} />
            Import JSON
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reset Local Data</CardTitle>
          <CardDescription>
            Type RESET to confirm removal of all saved scenarios and templates.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 max-w-md">
          <Button variant="danger" onClick={() => setResetOpen(true)}>
            Open reset modal
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data disclaimer</CardTitle>
          <CardDescription>Enter rates based on your broker/tax status.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Default currency formatting uses PKR but can be adapted when you export data.
          </p>
        </CardContent>
      </Card>

      {resetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold">Confirm reset</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This clears all local data. Type RESET to confirm.
            </p>
            <Input
              className="mt-4"
              value={resetInput}
              onChange={(event) => setResetInput(event.target.value)}
              placeholder="Type RESET"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setResetOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleReset}>
                Confirm reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
