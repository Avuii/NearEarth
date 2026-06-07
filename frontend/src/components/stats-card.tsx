import { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  highlight?: boolean;
}

export function StatsCard({ icon: Icon, label, value, subtext, highlight }: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden p-5 backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <div className={`rounded-xl p-3 ${highlight ? "bg-accent/25" : "bg-secondary/70"}`}>
          <Icon className={`h-5 w-5 ${highlight ? "text-accent" : "text-primary"}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          {subtext && <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>}
        </div>
      </div>
      {highlight && <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />}
    </Card>
  );
}
