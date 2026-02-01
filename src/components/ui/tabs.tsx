import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextProps {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextProps | null>(null);

export const Tabs = ({
  value,
  onValueChange,
  children,
  className
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <TabsContext.Provider value={{ value, onValueChange }}>
    <div className={cn("space-y-6", className)}>{children}</div>
  </TabsContext.Provider>
);

export const TabsList = ({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "inline-flex items-center gap-2 rounded-full border border-border bg-card p-1",
      className
    )}
  >
    {children}
  </div>
);

export const TabsTrigger = ({
  value,
  children
}: {
  value: string;
  children: React.ReactNode;
}) => {
  const context = React.useContext(TabsContext);
  if (!context) return null;
  const isActive = context.value === value;
  return (
    <button
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-all",
        isActive
          ? "bg-accent text-accent-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({
  value,
  children
}: {
  value: string;
  children: React.ReactNode;
}) => {
  const context = React.useContext(TabsContext);
  if (!context || context.value !== value) return null;
  return <div>{children}</div>;
};
