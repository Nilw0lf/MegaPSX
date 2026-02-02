"use client";

import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const ToastStack = () => {
  const toasts = useAppStore((state) => state.toasts);
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "w-64 rounded-xl border border-border bg-card p-4 shadow-card",
            "transition-all"
          )}
        >
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.description && (
            <p className="mt-1 text-xs text-muted-foreground">
              {toast.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
