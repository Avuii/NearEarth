import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  History,
  Mail,
  Radio,
  RefreshCw,
  Send,
  Settings,
  ShieldAlert,
} from "lucide-react";
import {
  checkEmailAlerts,
  getDashboardData,
  getEmailAlertHistory,
  type AlertCheckResponse,
  type NeoAlert,
} from "../services/nearEarthApi";
import type { DashboardNeoItem, DashboardResponse } from "../types/dashboard";
import { type Language, translations } from "../lib/i18n";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

interface AlertsPageProps {
  lang: Language;
}

type AlertLanguage = "pl" | "en";
type RuleId = "close" | "pha" | "large";

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

const copy = {
  en: {
    subtitle:
      "Email alert center for close approaches, PHA objects and monitoring thresholds.",
    configure: "Configure email alerts",
    allAlerts: "Current alerts",
    highPriority: "High priority",
    sentHistory: "Sent history",
    lastSent: "Last sent",
    recentAlerts: "Current NASA alerts",
    noAlerts: "No alerts for the current NASA data range.",
    emailTitle: "Email notifications",
    emailSubtitle:
      "Send email alerts when NASA NeoWs detects objects matching selected rules.",
    emailAddress: "Email address",
    alertLanguage: "Alert language",
    alertRules: "Alert rules",
    thresholds: "Thresholds",
    safety: "Safety",
    veryCloseRule: "Very close NEO",
    largeRule: "Large NEO",
    phaRule: "NASA PHA flag",
    veryCloseDistance: "Very close distance",
    largeDiameter: "Large object diameter",
    maxEmails: "Max emails per check",
    sendButton: "Check and send email alerts",
    sending: "Checking alerts...",
    resultTitle: "Last email check",
    found: "alerts found",
    sent: "emails sent",
    skipped: "skipped",
    failed: "failed",
    historyTitle: "Sent email history",
    noHistory: "No sent email alerts yet.",
    mockHint:
      "If backend Email:Mode is Mock, the alert will be generated without sending a real email.",
    validationEmail: "Enter an email address first.",
    errorGeneric: "Could not send email alerts.",
    enabled: "Enabled",
    disabled: "Disabled",
  },
  pl: {
    subtitle:
      "Centrum alertów e-mail dla bliskich przelotów, obiektów PHA i progów monitorowania.",
    configure: "Konfiguruj alerty e-mail",
    allAlerts: "Aktualne alerty",
    highPriority: "Wysoki priorytet",
    sentHistory: "Historia wysyłek",
    lastSent: "Ostatnio wysłane",
    recentAlerts: "Aktualne alerty NASA",
    noAlerts: "Brak alertów dla aktualnego zakresu danych NASA.",
    emailTitle: "Powiadomienia e-mail",
    emailSubtitle:
      "Wysyłaj alerty e-mail, gdy NASA NeoWs wykryje obiekty spełniające wybrane reguły.",
    emailAddress: "Adres e-mail",
    alertLanguage: "Język alertu",
    alertRules: "Reguły alertów",
    thresholds: "Progi",
    safety: "Bezpieczeństwo",
    veryCloseRule: "Bardzo bliski obiekt NEO",
    largeRule: "Duży obiekt NEO",
    phaRule: "Flaga NASA PHA",
    veryCloseDistance: "Bardzo bliska odległość",
    largeDiameter: "Średnica dużego obiektu",
    maxEmails: "Maksymalnie maili na sprawdzenie",
    sendButton: "Sprawdź i wyślij alerty e-mail",
    sending: "Sprawdzanie alertów...",
    resultTitle: "Ostatnie sprawdzenie",
    found: "znalezionych alertów",
    sent: "wysłanych maili",
    skipped: "pominiętych",
    failed: "nieudanych",
    historyTitle: "Historia wysłanych alertów",
    noHistory: "Brak wysłanych alertów e-mail.",
    mockHint:
      "Jeśli backend ma Email:Mode ustawione na Mock, alert zostanie wygenerowany bez realnej wysyłki maila.",
    validationEmail: "Najpierw wpisz adres e-mail.",
    errorGeneric: "Nie udało się wysłać alertów e-mail.",
    enabled: "Włączone",
    disabled: "Wyłączone",
  },
};

export function AlertsPage({ lang }: AlertsPageProps) {
  const t = translations[lang];
  const c = copy[lang];

  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null
  );
  const [email, setEmail] = useState(() => {
    return localStorage.getItem("nearearth-alert-email") ?? "";
  });
  const [alertLanguage, setAlertLanguage] = useState<AlertLanguage>(() => {
    const saved = localStorage.getItem("nearearth-alert-language");

    if (saved === "pl" || saved === "en") {
      return saved;
    }

    return lang;
  });
  const [enableVeryClose, setEnableVeryClose] = useState(() => {
    return localStorage.getItem("nearearth-alert-very-close") !== "false";
  });
  const [enableLargeObject, setEnableLargeObject] = useState(() => {
    return localStorage.getItem("nearearth-alert-large") !== "false";
  });
  const [enablePotentiallyHazardous, setEnablePotentiallyHazardous] = useState(
    () => {
      return localStorage.getItem("nearearth-alert-pha") !== "false";
    }
  );
  const [veryCloseMaxLd, setVeryCloseMaxLd] = useState(() => {
    return Number(localStorage.getItem("nearearth-alert-close-ld") ?? 5);
  });
  const [largeMinDiameterMeters, setLargeMinDiameterMeters] = useState(() => {
    return Number(localStorage.getItem("nearearth-alert-large-meter") ?? 300);
  });
  const [maxEmailsPerCheck, setMaxEmailsPerCheck] = useState(() => {
    return Number(localStorage.getItem("nearearth-alert-max-emails") ?? 1);
  });
  const [history, setHistory] = useState<NeoAlert[]>([]);
  const [checkResult, setCheckResult] = useState<AlertCheckResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getDashboardData();
      setDashboardData(data);

      try {
        const alertHistory = await getEmailAlertHistory();
        setHistory(alertHistory);
      } catch {
        setHistory([]);
      }
    } catch {
      setError("Could not load NASA NeoWs alerts.");
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshHistory() {
    try {
      const alertHistory = await getEmailAlertHistory();
      setHistory(alertHistory);
    } catch {
      setHistory([]);
    }
  }

  async function handleSendAlerts() {
    if (!email.trim()) {
      setFormError(c.validationEmail);
      return;
    }

    try {
      setIsChecking(true);
      setFormError(null);

      const result = await checkEmailAlerts({
        email: email.trim(),
        language: alertLanguage,
        enableVeryClose,
        enableLargeObject,
        enablePotentiallyHazardous,
        veryCloseMaxLd,
        largeMinDiameterMeters,
        days: 7,
        maxEmailsPerCheck,
      });

      setCheckResult(result);
      await refreshHistory();
    } catch (err) {
      if (err instanceof Error) {
        setFormError(err.message || c.errorGeneric);
      } else {
        setFormError(c.errorGeneric);
      }
    } finally {
      setIsChecking(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem("nearearth-alert-email", email);
  }, [email]);

  useEffect(() => {
    localStorage.setItem("nearearth-alert-language", alertLanguage);
  }, [alertLanguage]);

  useEffect(() => {
    localStorage.setItem("nearearth-alert-very-close", String(enableVeryClose));
  }, [enableVeryClose]);

  useEffect(() => {
    localStorage.setItem("nearearth-alert-large", String(enableLargeObject));
  }, [enableLargeObject]);

  useEffect(() => {
    localStorage.setItem(
      "nearearth-alert-pha",
      String(enablePotentiallyHazardous)
    );
  }, [enablePotentiallyHazardous]);

  useEffect(() => {
    localStorage.setItem("nearearth-alert-close-ld", String(veryCloseMaxLd));
  }, [veryCloseMaxLd]);

  useEffect(() => {
    localStorage.setItem(
      "nearearth-alert-large-meter",
      String(largeMinDiameterMeters)
    );
  }, [largeMinDiameterMeters]);

  useEffect(() => {
    localStorage.setItem(
      "nearearth-alert-max-emails",
      String(maxEmailsPerCheck)
    );
  }, [maxEmailsPerCheck]);

  const currentAlerts = useMemo(() => {
    return buildAlerts(dashboardData?.objects ?? [], {
      enableVeryClose,
      enableLargeObject,
      enablePotentiallyHazardous,
      veryCloseMaxLd,
      largeMinDiameterMeters,
    });
  }, [
    dashboardData,
    enableVeryClose,
    enableLargeObject,
    enablePotentiallyHazardous,
    veryCloseMaxLd,
    largeMinDiameterMeters,
  ]);

  const highPriority = currentAlerts.filter(
    (alert) => alert.level === "high" || alert.level === "critical"
  ).length;

  const failedCount =
    checkResult?.results.filter((item) => !item.success && !item.skipped)
      .length ?? 0;

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
              .getElementById("email-alerts")
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
        <Metric label={c.sentHistory} value={history.length} />
        <Metric label={c.lastSent} value={checkResult?.sentCount ?? 0} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.95fr]">
        <Card className="border-white/10 bg-black/70 p-6 backdrop-blur-xl">
          <h3 className="mb-5 text-lg font-semibold text-foreground">
            {c.recentAlerts}
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
          id="email-alerts"
          className="scroll-mt-28 border-white/10 bg-black/70 p-6 backdrop-blur-xl"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Mail className="h-5 w-5 text-primary" />
                {c.emailTitle}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {c.emailSubtitle}
              </p>
            </div>

            <Badge variant="success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Email
            </Badge>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {c.emailAddress}
              </label>

              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {c.alertLanguage}
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAlertLanguage("en")}
                  className={`rounded-xl border px-4 py-3 text-sm transition ${
                    alertLanguage === "en"
                      ? "border-cyan-300/50 bg-cyan-300/15 text-cyan-100"
                      : "border-white/10 bg-white/[0.035] text-muted-foreground hover:bg-white/[0.06]"
                  }`}
                >
                  English
                </button>

                <button
                  type="button"
                  onClick={() => setAlertLanguage("pl")}
                  className={`rounded-xl border px-4 py-3 text-sm transition ${
                    alertLanguage === "pl"
                      ? "border-cyan-300/50 bg-cyan-300/15 text-cyan-100"
                      : "border-white/10 bg-white/[0.035] text-muted-foreground hover:bg-white/[0.06]"
                  }`}
                >
                  Polski
                </button>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-foreground">
                {c.alertRules}
              </p>

              <div className="space-y-2">
                <RuleToggle
                  label={c.veryCloseRule}
                  checked={enableVeryClose}
                  onChange={setEnableVeryClose}
                />

                <RuleToggle
                  label={c.largeRule}
                  checked={enableLargeObject}
                  onChange={setEnableLargeObject}
                />

                <RuleToggle
                  label={c.phaRule}
                  checked={enablePotentiallyHazardous}
                  onChange={setEnablePotentiallyHazardous}
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-foreground">
                {c.thresholds}
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <NumberField
                  label={`${c.veryCloseDistance} (LD)`}
                  value={veryCloseMaxLd}
                  min={1}
                  max={50}
                  step={1}
                  onChange={setVeryCloseMaxLd}
                />

                <NumberField
                  label={`${c.largeDiameter} (m)`}
                  value={largeMinDiameterMeters}
                  min={50}
                  max={5000}
                  step={50}
                  onChange={setLargeMinDiameterMeters}
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-foreground">
                {c.safety}
              </p>

              <NumberField
                label={c.maxEmails}
                value={maxEmailsPerCheck}
                min={1}
                max={20}
                step={1}
                onChange={setMaxEmailsPerCheck}
              />
            </div>

            <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/5 p-4 text-sm leading-relaxed text-muted-foreground">
              {c.mockHint}
            </div>

            {formError && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
                {formError}
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleSendAlerts}
              disabled={isChecking}
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isChecking ? c.sending : c.sendButton}
            </Button>

            {checkResult && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="mb-3 font-medium text-foreground">
                  {c.resultTitle}
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <ResultItem
                    label={c.found}
                    value={checkResult.totalAlertsFound}
                  />

                  <ResultItem label={c.sent} value={checkResult.sentCount} />

                  <ResultItem
                    label={c.skipped}
                    value={checkResult.skippedCount}
                  />

                  <ResultItem label={c.failed} value={failedCount} />
                </div>
              </div>
            )}
          </div>
        </Card>
      </section>

      <section>
        <Card className="border-white/10 bg-black/70 p-6 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <History className="h-5 w-5 text-primary" />
                {c.historyTitle}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {lang === "pl"
                  ? "Lista alertów e-mail zapisanych przez backend w tej sesji."
                  : "Email alerts stored by the backend during this session."}
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={refreshHistory}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {history.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 text-sm text-muted-foreground">
              {c.noHistory}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {history.map((alert) => (
                <HistoryItem key={alert.alertId} alert={alert} lang={lang} />
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

function buildAlerts(
  objects: DashboardNeoItem[],
  settings: {
    enableVeryClose: boolean;
    enableLargeObject: boolean;
    enablePotentiallyHazardous: boolean;
    veryCloseMaxLd: number;
    largeMinDiameterMeters: number;
  }
): AlertItem[] {
  const result: AlertItem[] = [];

  if (settings.enableVeryClose) {
    objects
      .filter((item) => item.missDistanceLunar <= settings.veryCloseMaxLd)
      .sort((a, b) => a.missDistanceLunar - b.missDistanceLunar)
      .slice(0, 6)
      .forEach((item) => {
        result.push({
          id: `close-${item.id}`,
          ruleId: "close",
          title: `Close approach below ${settings.veryCloseMaxLd} LD`,
          titlePL: `Bliskie zbliżenie poniżej ${settings.veryCloseMaxLd} LD`,
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

  if (settings.enablePotentiallyHazardous) {
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

  if (settings.enableLargeObject) {
    objects
      .filter(
        (item) =>
          item.diameterAverageMeters >= settings.largeMinDiameterMeters
      )
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

function RuleToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] p-4 text-left transition duration-200 hover:border-cyan-300/30 hover:bg-white/[0.06] active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <ShieldAlert className="h-4 w-4 text-primary" />

        <p className="font-medium text-foreground">{label}</p>
      </div>

      <span
        className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
          checked ? "bg-emerald-400/80" : "bg-white/15"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs text-muted-foreground">
        {label}
      </label>

      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function ResultItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function HistoryItem({ alert, lang }: { alert: NeoAlert; lang: Language }) {
  const reason = lang === "pl" ? alert.reasonPl : alert.reasonEn;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{alert.objectName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            ID: {alert.objectId}
          </p>
        </div>

        <Badge variant={alert.severity === "High" ? "danger" : "warning"}>
          {alert.severity}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">{reason}</p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <p>{alert.closeApproachDate}</p>
        <p>{formatNumber(alert.missDistanceLunar, 2)} LD</p>
        <p>~{formatNumber(alert.diameterAverageMeters, 0)} m</p>
        <p>{formatNumber(alert.velocityKilometersPerSecond, 1)} km/s</p>
      </div>
    </div>
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