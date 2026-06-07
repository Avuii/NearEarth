import { AlertCircle, Bell, Radio, Settings, ShieldAlert } from "lucide-react";
import { alerts } from "../data/neo-data";
import { Language, translations } from "../lib/i18n";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface AlertsPageProps {
  lang: Language;
}

export function AlertsPage({ lang }: AlertsPageProps) {
  const t = translations[lang];

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Badge variant="warning" className="mb-3">
            <Radio className="h-3.5 w-3.5" />
            {t.alertStream}
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">{t.alerts}</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">Alert center for close approaches, PHA objects and user-defined monitoring thresholds.</p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4" />
          Configure rules
        </Button>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric label="All alerts" value={alerts.length} />
        <Metric label="High priority" value={alerts.filter((alert) => alert.level === "high").length} />
        <Metric label="Active rules" value={4} />
        <Metric label="Muted" value={0} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card className="p-6 backdrop-blur-xl">
          <h3 className="mb-5 text-lg font-semibold text-foreground">{t.recentAlerts}</h3>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-xl border border-border bg-secondary/30 p-4">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-300" />
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

        <Card className="p-6 backdrop-blur-xl">
          <h3 className="mb-5 text-lg font-semibold text-foreground">{t.alertRules}</h3>
          <div className="space-y-3">
            <Rule title="Close approach" text="Distance below 5 LD" active />
            <Rule title="Potentially hazardous" text="NASA PHA flag enabled" active />
            <Rule title="Large object" text="Diameter above 300 m" active />
            <Rule title="High velocity" text="Velocity above 20 km/s" active />
          </div>
        </Card>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-5 backdrop-blur-xl">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-foreground">{value}</p>
    </Card>
  );
}

function Rule({ title, text, active }: { title: string; text: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-4">
      <div className="flex items-center gap-3">
        <ShieldAlert className="h-4 w-4 text-primary" />
        <div>
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{text}</p>
        </div>
      </div>
      <Badge variant={active ? "success" : "outline"}>{active ? "ON" : "OFF"}</Badge>
    </div>
  );
}
