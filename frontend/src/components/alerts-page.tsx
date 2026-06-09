import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BellOff,
  Radio,
  RefreshCw,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { getDashboardData } from "../services/nearEarthApi";
import type { DashboardNeoItem, DashboardResponse } from "../types/dashboard";
import { Language, translations } from "../lib/i18n";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface AlertsPageProps {
  lang: Language;
}

type RuleId = "close" | "pha" | "large" | "velocity";

type AlertRule = {
  id: RuleId;
  title: string;
  titlePL: string;
  text: string;
  textPL: string;
  active: boolean;
};

type AlertItem = {
  id: string;
  ruleId: RuleId;
  title: string;
  titlePL: string;
  description: string;
  descriptionPL: string;
  level: "medium" | "high" | "critical";
  time: string;
};

const baseRules: AlertRule[] = [
  {
    id: "close",
    title: "Close approach",
    titlePL: "Bliskie zbliżenie",
    text: "Distance below 5 LD",
    textPL: "Odległość poniżej 5 LD",
    active: true,
  },
  {
    id: "pha",
    title: "Potentially hazardous",
    titlePL: "Potencjalnie niebezpieczne",
    text: "NASA PHA flag enabled",
    textPL: "Flaga PHA z NASA jest aktywna",
    active: true,
  },
  {
    id: "large",
    title: "Large object",
    titlePL: "Duży obiekt",
    text: "Diameter above 300 m",
    textPL: "Średnica powyżej 300 m",
    active: true,
  },
  {
    id: "velocity",
    title: "High velocity",
    titlePL: "Wysoka prędkość",
    text: "Velocity above 20 km/s",
    textPL: "Prędkość powyżej 20 km/s",
    active: true,
  },
];

const copy = {
  en: {
    subtitle:
      "Alert center for close approaches, PHA objects and user-defined monitoring thresholds.",
    configure: "Configure rules",
    allAlerts: "All alerts",
    highPriority: "High priority",
    activeRules: "Active rules",
    muted: "Muted",
    rules: "Rules",
    rulesHint: "Click a rule to enable or disable it.",
    enabled: "ON",
    disabled: "OFF",
    noAlerts: "No alerts for the current NASA data range.",
  },
  pl: {
    subtitle:
      "Centrum alertów dla bliskich zbliżeń, obiektów PHA i progów monitorowania użytkownika.",
    configure: "Konfiguruj reguły",
    allAlerts: "Wszystkie alerty",
    highPriority: "Wysoki priorytet",
    activeRules: "Aktywne reguły",
    muted: "Wyciszone",
    rules: "Reguły",
    rulesHint: "Kliknij regułę, aby ją włączyć albo wyłączyć.",
    enabled: "ON",
    disabled: "OFF",
    noAlerts: "Brak alertów dla aktualnego zakresu danych NASA.",
  },
};

export function AlertsPage({ lang }: AlertsPageProps) {
  const t = translations[lang];
  const c = copy[lang];

  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [rules, setRules] = useState<AlertRule[]>(() => {
    try {
      const saved = localStorage.getItem("nearearth-alert-rules");

      if (!saved) {
        return baseRules;
      }

      const savedRules = JSON.parse(saved) as AlertRule[];

      return baseRules.map((rule) => ({
        ...rule,
        active:
          savedRules.find((item) => item.id === rule.id)?.active ??
          rule.active,
      }));
    } catch {
      return baseRules;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getDashboardData();
      setDashboardData(data);
    } catch {
      setError("Could not load NASA NeoWs alerts.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem("nearearth-alert-rules", JSON.stringify(rules));
  }, [rules]);

  const activeRules = useMemo(
    () => rules.filter((rule) => rule.active).length,
    [rules]
  );

  const mutedRules = rules.length - activeRules;

  const currentAlerts = useMemo(() => {
    return buildAlerts(dashboardData?.objects ?? [], rules);
  }, [dashboardData, rules]);

  const highPriority = currentAlerts.filter(
    (alert) => alert.level === "high" || alert.level === "critical"
  ).length;

  function toggleRule(id: RuleId) {
    setRules((current) =>
      current.map((rule) =>
        rule.id === id ? { ...rule, active: !rule.active } : rule
      )
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Card className="flex flex-col items-center gap-4 p-8 text-center backdrop-blur-xl">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <div>
            <p className="text-lg font-semibold text-foreground">
              Loading NASA alerts...
            </p>
            <p className="text-sm text-muted-foreground">
              Building alert stream from real NeoWs data.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Card className="max-w-md p-8 text-center backdrop-blur-xl">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Alerts loading failed
          </h2>
          <p className="mb-5 text-sm text-muted-foreground">{error}</p>
          <Button onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Badge variant="warning" className="mb-3">
            <Radio className="h-3.5 w-3.5" />
            {t.alertStream}
          </Badge>

          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            {t.alerts}
          </h2>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            {c.subtitle}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() =>
            document
              .getElementById("alert-rules")
              ?.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        >
          <Settings className="h-4 w-4" />
          {c.configure}
        </Button>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric label={c.allAlerts} value={currentAlerts.length} />
        <Metric label={c.highPriority} value={highPriority} />
        <Metric label={c.activeRules} value={activeRules} />
        <Metric label={c.muted} value={mutedRules} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card className="border-white/10 bg-black/70 p-6 backdrop-blur-xl">
          <h3 className="mb-5 text-lg font-semibold text-foreground">
            {t.recentAlerts}
          </h3>

          <div className="space-y-4">
            {currentAlerts.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 text-sm text-muted-foreground">
                {c.noAlerts}
              </div>
            ) : (
              currentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-xl border border-white/10 bg-white/[0.035] p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-300" />

                      <p className="font-medium text-foreground">
                        {lang === "pl" ? alert.titlePL : alert.title}
                      </p>
                    </div>

                    <Badge
                      variant={
                        alert.level === "high" || alert.level === "critical"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {alert.level}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {lang === "pl"
                      ? alert.descriptionPL
                      : alert.description}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {alert.time}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card
          id="alert-rules"
          className="scroll-mt-28 border-white/10 bg-black/70 p-6 backdrop-blur-xl"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {c.rules}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {c.rulesHint}
              </p>
            </div>

            <Badge variant={mutedRules > 0 ? "warning" : "success"}>
              <BellOff className="h-3.5 w-3.5" />
              {mutedRules} {c.muted}
            </Badge>
          </div>

          <div className="space-y-3">
            {rules.map((rule) => (
              <Rule
                key={rule.id}
                title={lang === "pl" ? rule.titlePL : rule.title}
                text={lang === "pl" ? rule.textPL : rule.text}
                active={rule.active}
                enabledLabel={c.enabled}
                disabledLabel={c.disabled}
                onClick={() => toggleRule(rule.id)}
              />
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

function buildAlerts(
  objects: DashboardNeoItem[],
  rules: AlertRule[]
): AlertItem[] {
  const enabled = rules
    .filter((rule) => rule.active)
    .map((rule) => rule.id);

  const result: AlertItem[] = [];

  if (enabled.includes("close")) {
    objects
      .filter((item) => item.missDistanceLunar <= 5)
      .sort((a, b) => a.missDistanceLunar - b.missDistanceLunar)
      .slice(0, 6)
      .forEach((item) => {
        result.push({
          id: `close-${item.id}`,
          ruleId: "close",
          title: "Close approach below 5 LD",
          titlePL: "Bliskie zbliżenie poniżej 5 LD",
          description: `${item.name} will pass at ${formatNumber(
            item.missDistanceLunar,
            2
          )} lunar distances.`,
          descriptionPL: `${item.name} minie Ziemię w odległości ${formatNumber(
            item.missDistanceLunar,
            2
          )} LD.`,
          level: item.missDistanceLunar <= 3 ? "high" : "medium",
          time: formatDate(item.closeApproachDate),
        });
      });
  }

  if (enabled.includes("pha")) {
    objects
      .filter((item) => item.isPotentiallyHazardous)
      .sort((a, b) => a.missDistanceLunar - b.missDistanceLunar)
      .forEach((item) => {
        result.push({
          id: `pha-${item.id}`,
          ruleId: "pha",
          title: "PHA object detected",
          titlePL: "Wykryto obiekt PHA",
          description: `${item.name} is marked by NASA as potentially hazardous.`,
          descriptionPL: `${item.name} jest oznaczony przez NASA jako potencjalnie niebezpieczny.`,
          level: "high",
          time: formatDate(item.closeApproachDate),
        });
      });
  }

  if (enabled.includes("large")) {
    objects
      .filter((item) => item.diameterAverageMeters >= 300)
      .sort((a, b) => b.diameterAverageMeters - a.diameterAverageMeters)
      .slice(0, 6)
      .forEach((item) => {
        result.push({
          id: `large-${item.id}`,
          ruleId: "large",
          title: "Large diameter object",
          titlePL: "Obiekt o dużej średnicy",
          description: `${item.name} has an estimated diameter of about ${formatNumber(
            item.diameterAverageMeters,
            0
          )} m.`,
          descriptionPL: `${item.name} ma szacowaną średnicę około ${formatNumber(
            item.diameterAverageMeters,
            0
          )} m.`,
          level: "high",
          time: formatDate(item.closeApproachDate),
        });
      });
  }

  if (enabled.includes("velocity")) {
    objects
      .filter((item) => item.velocityKilometersPerSecond >= 20)
      .sort(
        (a, b) =>
          b.velocityKilometersPerSecond - a.velocityKilometersPerSecond
      )
      .slice(0, 6)
      .forEach((item) => {
        result.push({
          id: `fast-${item.id}`,
          ruleId: "velocity",
          title: "High velocity object",
          titlePL: "Obiekt o wysokiej prędkości",
          description: `${item.name} is moving at ${formatNumber(
            item.velocityKilometersPerSecond,
            1
          )} km/s.`,
          descriptionPL: `${item.name} porusza się z prędkością ${formatNumber(
            item.velocityKilometersPerSecond,
            1
          )} km/s.`,
          level: "medium",
          time: formatDate(item.closeApproachDate),
        });
      });
  }

  return result.slice(0, 15);
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-white/10 bg-black/70 p-5 backdrop-blur-xl">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-foreground">{value}</p>
    </Card>
  );
}

function Rule({
  title,
  text,
  active,
  enabledLabel,
  disabledLabel,
  onClick,
}: {
  title: string;
  text: string;
  active: boolean;
  enabledLabel: string;
  disabledLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] p-4 text-left transition duration-200 hover:border-cyan-300/30 hover:bg-white/[0.06] active:scale-[0.99]"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <ShieldAlert className="h-4 w-4 text-primary" />

        <div>
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{text}</p>
        </div>
      </div>

      <Badge variant={active ? "success" : "outline"}>
        {active ? enabledLabel : disabledLabel}
      </Badge>
    </button>
  );
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