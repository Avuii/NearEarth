import {
  AlertTriangle,
  Calendar,
  Globe,
  Maximize2,
  RefreshCw,
  Rocket,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Language, translations } from "../lib/i18n";
import { getDashboardData, getDashboardRangeData } from "../services/nearEarthApi";
import type { DashboardNeoItem, DashboardResponse } from "../types/dashboard";
import { AlertsPanel } from "./alerts-panel";
import { FlybyChart } from "./flyby-chart";
import { FlybyTable } from "./flyby-table";
import { OrbitalVisualization } from "./orbital-visualization";
import { ScatterPlot } from "./scatter-plot";
import { StatsCard } from "./stats-card";
import { WatchlistPanel } from "./watchlist-panel";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface DashboardPageProps {
  lang: Language;
  watchlistIds?: string[];
  onToggleWatchlist?: (id: string) => void;
  onOpenAsteroid?: (id: string) => void;
  onOpenAsteroidPreview?: (id: string) => void;
  onOpenFlybys: () => void;
}

export function DashboardPage({
  lang,
  watchlistIds = [],
  onToggleWatchlist,
  onOpenAsteroid,
  onOpenFlybys,
}: DashboardPageProps) {
  const t = translations[lang];

  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [dashboard30Data, setDashboard30Data] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async (initialLoad = false) => {
    try {
      setError(null);

      if (initialLoad) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const data = await getDashboardData();
      setDashboardData(data);

      try {
        const rangeData = await getDashboardRangeData(30);
        setDashboard30Data(rangeData);
      } catch {
        setDashboard30Data(null);
      }
    } catch {
      setError("Could not load NASA NeoWs data.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);

  function getLocale() {
    return lang === "pl" ? "pl-PL" : "en-US";
  }

  function formatNumber(value: number, maximumFractionDigits = 0) {
    return new Intl.NumberFormat(getLocale(), {
      maximumFractionDigits,
    }).format(value);
  }

  function formatShortDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(getLocale(), {
      month: "short",
      day: "numeric",
    });
  }

  function getObjectSubtext(object: DashboardNeoItem | null, metric: string) {
    if (!object) {
      return "No data available";
    }

    return `${object.name} ${metric}`;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Card className="flex flex-col items-center gap-4 p-8 text-center backdrop-blur-xl">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <div>
            <p className="text-lg font-semibold text-foreground">
              Loading NASA NeoWs data...
            </p>
            <p className="text-sm text-muted-foreground">
              Fetching real Near-Earth Object data from backend.
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
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Data loading failed
          </h2>
          <p className="mb-5 text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => loadDashboardData(false)}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Card className="p-8 text-center backdrop-blur-xl">
          <p className="text-lg font-semibold text-foreground">
            No dashboard data available.
          </p>
        </Card>
      </div>
    );
  }

  const summary = dashboardData.summary;
  const closestObject = dashboardData.closestObject;
  const fastestObject = dashboardData.fastestObject;
  const largestObject = dashboardData.largestObject;

  const closestDistance = closestObject
    ? `${formatNumber(closestObject.missDistanceLunar, 2)} LD`
    : "—";

  const closestSubtext = closestObject
    ? `${closestObject.name} on ${formatShortDate(closestObject.closeApproachDate)}`
    : "No close approach data";

  const largestDiameter = largestObject
    ? `~${formatNumber(largestObject.diameterAverageMeters)} m`
    : "—";

  const largestSubtext = getObjectSubtext(largestObject, t.diameter);

  const fastestVelocity = fastestObject
    ? `${formatNumber(fastestObject.velocityKilometersPerSecond, 1)} km/s`
    : "—";

  const fastestSubtext = getObjectSubtext(fastestObject, t.velocity);

  return (
    <div>
      <section className="mb-12">
        <div className="mb-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <h2 className="mb-3 text-4xl font-semibold tracking-tight text-foreground">
              {t.heroTitle}
            </h2>
            <p className="max-w-2xl leading-relaxed text-muted-foreground">
              {t.heroSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => loadDashboardData(false)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {t.manualSync}
            </Button>

            <Button onClick={onOpenFlybys}>
              <Rocket className="h-4 w-4" />
              {t.exploreFlybys}
            </Button>
          </div>
        </div>

        <OrbitalVisualization apiAsteroids={dashboardData.objects} />
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatsCard
          icon={Calendar}
          label={t.objectsNext7Days}
          value={summary.totalObjects}
          subtext={`NASA NeoWs: ${dashboardData.startDate} - ${dashboardData.endDate}`}
        />

        <StatsCard
          icon={Calendar}
          label={t.objectsNext30Days}
          value={dashboard30Data?.summary.totalObjects ?? "—"}
          subtext={
            dashboard30Data
              ? `NASA NeoWs: ${dashboard30Data.startDate} - ${dashboard30Data.endDate}`
              : "30-day aggregation unavailable"
          }
        />

        <StatsCard
          icon={Maximize2}
          label={t.closestFlyby}
          value={closestDistance}
          subtext={closestSubtext}
          highlight
        />

        <StatsCard
          icon={Globe}
          label={t.largestObject}
          value={largestDiameter}
          subtext={largestSubtext}
        />

        <StatsCard
          icon={Zap}
          label={t.fastestObject}
          value={fastestVelocity}
          subtext={fastestSubtext}
        />

        <StatsCard
          icon={AlertTriangle}
          label={t.potentiallyHazardous}
          value={summary.hazardousObjects}
          subtext={t.phaObjectsTracked}
          highlight
        />
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-6 backdrop-blur-xl">
          <h3 className="mb-4 font-semibold text-foreground">
            {t.flybysOverTime}
          </h3>
          <FlybyChart data={dashboardData.dailyApproaches} />
        </Card>

        <Card className="p-6 backdrop-blur-xl">
          <h3 className="mb-4 font-semibold text-foreground">
            {t.distanceVsDate}
          </h3>
          <ScatterPlot objects={dashboardData.objects} />
        </Card>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-foreground">
            {t.top10ClosestFlybys}
          </h3>
          <Button variant="ghost" size="sm" onClick={onOpenFlybys}>
            {t.viewAll}
          </Button>
        </div>

        <FlybyTable
          lang={lang}
          objects={dashboardData.objects}
          limit={10}
          sortByClosest
          watchlistIds={watchlistIds}
          onToggleWatch={onToggleWatchlist}
          onSelect={onOpenAsteroid}
        />
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <WatchlistPanel
          lang={lang}
          objects={dashboardData.objects}
          watchlistIds={watchlistIds}
          onOpenAsteroid={onOpenAsteroid}
        />

        <AlertsPanel lang={lang} objects={dashboardData.objects} />
      </section>
    </div>
  );
}