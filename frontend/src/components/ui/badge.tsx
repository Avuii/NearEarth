import { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type BadgeVariant = "default" | "outline" | "success" | "warning" | "danger" | "secondary";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-primary/15 text-primary border-primary/30",
  outline: "bg-transparent text-muted-foreground border-border",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  warning: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  danger: "bg-red-500/15 text-red-300 border-red-400/30",
  secondary: "bg-secondary text-secondary-foreground border-border",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", variants[variant], className)}
      {...props}
    />
  );
}
