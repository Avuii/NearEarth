import { AlertTriangle, Calendar, Globe, Maximize2, Zap } from "lucide-react";
import { Language, translations } from "../lib/i18n";
import { AsteroidDetailsCard } from "./asteroid-details-card";
import { AlertsPanel } from "./alerts-panel";
import { FlybyChart } from "./flyby-chart";
import { FlybyTable } from "./flyby-table";
import { OrbitalVisualization } from "./orbital-visualization";
import { ScatterPlot } from "./scatter-plot";
import { StatsCard } from "./stats-card";
import { WatchlistPanel } from "./watchlist-panel";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { RefreshCw, Rocket } from "lucide-react";

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
  onOpenAsteroidPreview,
  onOpenFlybys,
}: DashboardPageProps) {
  const t = translations[lang];

  return (
    <div>
      <section className="mb-12">
        <div className="mb-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <h2 className="mb-3 text-4xl font-semibold tracking-tight text-foreground">{t.heroTitle}</h2>
            <p className="max-w-2xl leading-relaxed text-muted-foreground">{t.heroSubtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4" />
              {t.manualSync}
            </Button>
            <Button onClick={onOpenFlybys}>
              <Rocket className="h-4 w-4" />
              {t.exploreFlybys}
            </Button>
          </div>
        </div>
        <OrbitalVisualization />
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatsCard icon={Calendar} label={t.objectsNext7Days} value={12} subtext={`3 ${t.moreThanLastWeek}`} />
        <StatsCard icon={Calendar} label={t.objectsNext30Days} value={47} subtext={t.trackingAll} />
        <StatsCard icon={Maximize2} label={t.closestFlyby} value="2.3 LD" subtext="2024 XR7 on Jun 8" highlight />
        <StatsCard icon={Globe} label={t.largestObject} value="~450 m" subtext={`2025 KQ ${t.diameter}`} />
        <StatsCard icon={Zap} label={t.fastestObject} value="21.5 km/s" subtext={`2025 TN2 ${t.velocity}`} />
        <StatsCard icon={AlertTriangle} label={t.potentiallyHazardous} value={3} subtext={t.phaObjectsTracked} highlight />
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-6 backdrop-blur-xl">
          <h3 className="mb-4 font-semibold text-foreground">{t.flybysOverTime}</h3>
          <FlybyChart />
        </Card>
        <Card className="p-6 backdrop-blur-xl">
          <h3 className="mb-4 font-semibold text-foreground">{t.distanceVsDate}</h3>
          <ScatterPlot />
        </Card>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-foreground">{t.top10ClosestFlybys}</h3>
          <Button variant="ghost" size="sm" onClick={onOpenFlybys}>{t.viewAll}</Button>
        </div>
        <FlybyTable
          lang={lang}
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
          watchlistIds={watchlistIds}
          onOpenAsteroid={onOpenAsteroid}
        />
        <AlertsPanel lang={lang} />
      </section>

    </div>
  );
}
