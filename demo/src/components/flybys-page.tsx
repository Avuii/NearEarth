import { useMemo, useState } from "react";
import { AlertTriangle, Filter, Search, Signal, Zap } from "lucide-react";
import { neoObjects } from "../data/neo-data";
import { Language, translations } from "../lib/i18n";
import { FlybyChart } from "./flyby-chart";
import { FlybyTable } from "./flyby-table";
import { ScatterPlot } from "./scatter-plot";
import { StatsCard } from "./stats-card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

interface FlybysPageProps {
  lang: Language;
  watchlistIds: string[];
  onToggleWatchlist: (id: string) => void;
  onOpenAsteroid: (id: string) => void;
}

type FilterMode = "all" | "close" | "pha";

export function FlybysPage({
  lang,
  watchlistIds,
  onToggleWatchlist,
  onOpenAsteroid,
}: FlybysPageProps) {
  const t = translations[lang];
  const [filter, setFilter] = useState<FilterMode>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return neoObjects
      .filter((item) => filter !== "close" || item.distanceLD <= 5)
      .filter((item) => filter !== "pha" || item.isPHA)
      .filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
  }, [filter, search]);

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <Badge variant="secondary" className="mb-3">
              <Signal className="h-3.5 w-3.5" />
              {t.flybyExplorer}
            </Badge>

            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              {t.flybys}
            </h2>

            <p className="mt-2 max-w-2xl text-muted-foreground">
              {t.heroSubtitle}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.searchPlaceholder}
                className="pl-9 sm:w-[280px]"
              />
            </div>

            <Button variant="outline">
              <Filter className="h-4 w-4" />
              {t.searchResults}: {filtered.length}
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            {t.allObjects}
          </Button>

          <Button
            variant={filter === "close" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("close")}
          >
            {t.closeOnly}
          </Button>

          <Button
            variant={filter === "pha" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pha")}
          >
            {t.hazardousOnly}
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatsCard
          icon={Signal}
          label={t.allObjects}
          value={neoObjects.length}
          subtext={t.trackingAll}
        />

        <StatsCard
          icon={Zap}
          label={t.closeOnly}
          value={neoObjects.filter((item) => item.distanceLD <= 5).length}
          subtext="≤ 5 LD"
          highlight
        />

        <StatsCard
          icon={AlertTriangle}
          label={t.hazardousOnly}
          value={neoObjects.filter((item) => item.isPHA).length}
          subtext="NASA PHA flag"
          highlight
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-6 backdrop-blur-xl">
          <h3 className="mb-4 font-semibold text-foreground">
            {t.flybysOverTime}
          </h3>

          <FlybyChart />
        </Card>

        <Card className="p-6 backdrop-blur-xl">
          <h3 className="mb-4 font-semibold text-foreground">
            {t.distanceVsDate}
          </h3>

          <ScatterPlot />
        </Card>
      </section>

      <section>
        <FlybyTable
          lang={lang}
          items={filtered}
          watchlistIds={watchlistIds}
          onToggleWatch={onToggleWatchlist}
          onSelect={onOpenAsteroid}
        />
      </section>
    </div>
  );
}