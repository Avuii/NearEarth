import { AlertTriangle, Bell } from "lucide-react";
import { alerts } from "../data/neo-data";
import { Language, translations } from "../lib/i18n";
import type { DashboardNeoItem } from "../types/dashboard";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

interface AlertsPanelProps {
  lang: Language;
  objects?: DashboardNeoItem[];
}

type AlertItem = {
  id: string;
  title: string;
  titlePL: string;
  description: string;
  descriptionPL: string;
  level: "medium" | "high" | "critical";
  time: string;
};

export function AlertsPanel({ lang, objects }: AlertsPanelProps) {
  const t = translations[lang];

  const currentAlerts =
    objects && objects.length > 0
      ? buildAlerts(objects)
      : alerts;

  return (
    <Card className="p-6 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t.recentAlerts}</h3>
          <p className="text-sm text-muted-foreground">{t.alertStream}</p>
        </div>
        <Badge variant="warning">
          <Bell className="h-3.5 w-3.5" />
          {currentAlerts.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {currentAlerts.length === 0 ? (
          <div className="rounded-xl border border-border bg-secondary/20 p-5 text-sm text-muted-foreground">
            {lang === "pl"
              ? "Brak aktywnych alertów dla aktualnego zakresu danych."
              : "No active alerts for the current data range."}
          </div>
        ) : (
          currentAlerts.map((alert) => (
            <div key={alert.id} className="rounded-xl border border-border bg-secondary/30 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-300" />
                  <p className="font-medium text-foreground">
                    {lang === "pl" ? alert.titlePL : alert.title}
                  </p>
                </div>
                <Badge variant={alert.level === "high" || alert.level === "critical" ? "danger" : "warning"}>
                  {alert.level}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {lang === "pl" ? alert.descriptionPL : alert.description}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{alert.time}</p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function buildAlerts(objects: DashboardNeoItem[]): AlertItem[] {
  const result: AlertItem[] = [];

  const closeObjects = [...objects]
    .filter((item) => item.missDistanceLunar <= 5)
    .sort((a, b) => a.missDistanceLunar - b.missDistanceLunar);

  const hazardousObjects = [...objects]
    .filter((item) => item.isPotentiallyHazardous)
    .sort((a, b) => a.missDistanceLunar - b.missDistanceLunar);

  const largeObjects = [...objects]
    .filter((item) => item.diameterAverageMeters >= 300)
    .sort((a, b) => b.diameterAverageMeters - a.diameterAverageMeters);

  const fastObjects = [...objects]
    .filter((item) => item.velocityKilometersPerSecond >= 20)
    .sort((a, b) => b.velocityKilometersPerSecond - a.velocityKilometersPerSecond);

  closeObjects.slice(0, 2).forEach((item) => {
    result.push({
      id: `close-${item.id}`,
      title: "Close approach below 5 LD",
      titlePL: "Bliskie zbliżenie poniżej 5 LD",
      description: `${item.name} will pass at ${formatNumber(item.missDistanceLunar, 2)} lunar distances.`,
      descriptionPL: `${item.name} minie Ziemię w odległości ${formatNumber(item.missDistanceLunar, 2)} LD.`,
      level: item.missDistanceLunar <= 3 ? "high" : "medium",
      time: formatDate(item.closeApproachDate),
    });
  });

  hazardousObjects.slice(0, 2).forEach((item) => {
    result.push({
      id: `pha-${item.id}`,
      title: "PHA object detected",
      titlePL: "Wykryto obiekt PHA",
      description: `${item.name} is marked by NASA as potentially hazardous.`,
      descriptionPL: `${item.name} jest oznaczony przez NASA jako potencjalnie niebezpieczny.`,
      level: "high",
      time: formatDate(item.closeApproachDate),
    });
  });

  largeObjects.slice(0, 1).forEach((item) => {
    result.push({
      id: `large-${item.id}`,
      title: "Large diameter object",
      titlePL: "Obiekt o dużej średnicy",
      description: `${item.name} has an estimated diameter of about ${formatNumber(item.diameterAverageMeters, 0)} m.`,
      descriptionPL: `${item.name} ma szacowaną średnicę około ${formatNumber(item.diameterAverageMeters, 0)} m.`,
      level: "high",
      time: formatDate(item.closeApproachDate),
    });
  });

  fastObjects.slice(0, 1).forEach((item) => {
    result.push({
      id: `fast-${item.id}`,
      title: "High velocity object",
      titlePL: "Obiekt o wysokiej prędkości",
      description: `${item.name} is moving at ${formatNumber(item.velocityKilometersPerSecond, 1)} km/s.`,
      descriptionPL: `${item.name} porusza się z prędkością ${formatNumber(item.velocityKilometersPerSecond, 1)} km/s.`,
      level: "medium",
      time: formatDate(item.closeApproachDate),
    });
  });

  return result.slice(0, 5);
}

function formatNumber(value: number, maximumFractionDigits: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}