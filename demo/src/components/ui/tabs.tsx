import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  activeValue: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

export function TabsList({ children, className }: TabsListProps) {
  return <div className={cn("inline-flex rounded-xl border border-border bg-secondary/50 p-1", className)}>{children}</div>;
}

export function TabsTrigger({ value, activeValue, onValueChange, children }: TabsTriggerProps) {
  const active = value === activeValue;

  return (
    <button
      onClick={() => onValueChange(value)}
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm transition",
        active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
