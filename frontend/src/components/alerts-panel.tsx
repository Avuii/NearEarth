import { AlertTriangle, Bell } from "lucide-react";
import { alerts } from "../data/neo-data";
import { Language, translations } from "../lib/i18n";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

interface AlertsPanelProps {
  lang: Language;
}

export function AlertsPanel({ lang }: AlertsPanelProps) {
  const t = translations[lang];

  return (
    <Card className="p-6 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t.recentAlerts}</h3>
          <p className="text-sm text-muted-foreground">{t.alertStream}</p>
        </div>
        <Badge variant="warning">
          <Bell className="h-3.5 w-3.5" />
          {alerts.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-xl border border-border bg-secondary/30 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-300" />
                <p className="font-medium text-foreground">{lang === "pl" ? alert.titlePL : alert.title}</p>
              </div>
              <Badge variant={alert.level === "high" || alert.level === "critical" ? "danger" : "warning"}>{alert.level}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{lang === "pl" ? alert.descriptionPL : alert.description}</p>
            <p className="mt-2 text-xs text-muted-foreground">{alert.time}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
