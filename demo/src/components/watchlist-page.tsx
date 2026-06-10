import { useEffect, useState } from "react";
import { Bell, Eye, RefreshCw, Star, Trash2 } from "lucide-react";
import { getDashboardData } from "../services/nearEarthApi";
import type { DashboardNeoItem, DashboardResponse } from "../types/dashboard";
import { Language, translations } from "../lib/i18n";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface WatchlistPageProps {
  lang: Language;
  watchlistIds: string[];
  onToggleWatchlist: (id: string) => void;
  onOpenAsteroid: (id: string) => void;
}

export function WatchlistPage({
  lang,
  watchlistIds,
  onToggleWatchlist,
  onOpenAsteroid,
}: WatchlistPageProps) {
  const t = translations[lang];

  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getDashboardData();
      setDashboardData(data);
    } catch {
      setError("Could not load watchlist objects from NASA data.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const objects = dashboardData?.objects ?? [];
  const watchedObjects = objects.filter((item) => watchlistIds.includes(item.id));

  const closestDistance =
    watchedObjects.length > 0
      ? `${formatNumber(
          Math.min(...watchedObjects.map((item) => item.missDistanceLunar)),
          2
        )} LD`
      : "—";

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Card className="flex flex-col items-center gap-4 p-8 text-center backdrop-blur-xl">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <div>
            <p className="text-lg font-semibold text-foreground">
              Loading watchlist...
            </p>
            <p className="text-sm text-muted-foreground">
              Matching watched IDs with current NASA feed.
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
          <Bell className="mx-auto mb-4 h-10 w-10 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Watchlist loading failed
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
      <section>
        <Badge variant="secondary" className="mb-3">
          <Star className="h-3.5 w-3.5 fill-current" />
          {t.watchlistTitle}
        </Badge>

        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          {t.watchlist}
        </h2>

        <p className="mt-2 max-w-2xl text-muted-foreground">
          {lang === "pl"
            ? "Obiekty dodane do obserwowanych z aktualnych danych NASA NeoWs."
            : "Objects added from the current NASA NeoWs flyby data."}
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-5 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Eye className="h-5 w-5 text-cyan-300" />
            {lang === "pl" ? "Obserwowane" : "Watched"}
          </div>

          <div className="mt-3 text-3xl font-semibold text-foreground">
            {watchedObjects.length}
          </div>
        </Card>

        <Card className="p-5 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Bell className="h-5 w-5 text-cyan-300" />
            PHA
          </div>

          <div className="mt-3 text-3xl font-semibold text-foreground">
            {watchedObjects.filter((item) => item.isPotentiallyHazardous).length}
          </div>
        </Card>

        <Card className="p-5 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Star className="h-5 w-5 fill-current text-cyan-300" />
            {lang === "pl" ? "Najbliższy dystans" : "Closest distance"}
          </div>

          <div className="mt-3 text-3xl font-semibold text-foreground">
            {closestDistance}
          </div>
        </Card>
      </section>

      {watchedObjects.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
            <Star className="h-6 w-6" />
          </div>

          <h3 className="text-xl font-semibold text-foreground">
            {lang === "pl" ? "Brak obserwowanych obiektów" : "No watched objects"}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            {watchlistIds.length > 0
              ? lang === "pl"
                ? "Masz zapisane ID, ale nie występują one w aktualnym 7-dniowym zakresie NASA NeoWs."
                : "You have saved IDs, but they are not present in the current 7-day NASA NeoWs range."
              : lang === "pl"
                ? "Przejdź do zakładki Przeloty i kliknij Watch przy wybranej asteroidzie."
                : "Go to Flybys and click Watch next to an asteroid."}
          </p>
        </Card>
      ) : (
        <section className="grid gap-4">
          {watchedObjects.map((item) => (
            <WatchlistCard
              key={item.id}
              item={item}
              lang={lang}
              onOpenAsteroid={onOpenAsteroid}
              onToggleWatchlist={onToggleWatchlist}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function WatchlistCard({
  item,
  lang,
  onOpenAsteroid,
  onToggleWatchlist,
}: {
  item: DashboardNeoItem;
  lang: Language;
  onOpenAsteroid: (id: string) => void;
  onToggleWatchlist: (id: string) => void;
}) {
  return (
    <Card
      className="cursor-pointer p-5 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-secondary/20"
      onClick={() => onOpenAsteroid(item.id)}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold text-foreground">
              {item.name}
            </h3>

            {item.isPotentiallyHazardous && <Badge variant="danger">PHA</Badge>}

            <Badge
              variant={item.missDistanceLunar <= 5 ? "warning" : "outline"}
            >
              {formatNumber(item.missDistanceLunar, 2)} LD
            </Badge>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {formatDate(item.closeApproachDate, lang)} •{" "}
            {formatNumber(item.velocityKilometersPerSecond, 1)} km/s • ~
            {formatNumber(item.diameterAverageMeters, 0)} m •{" "}
            {item.orbitingBody || "Earth"}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            onToggleWatchlist(item.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
          {lang === "pl" ? "Usuń" : "Remove"}
        </Button>
      </div>
    </Card>
  );
}

function formatNumber(value: number, maximumFractionDigits: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

function formatDate(value: string, lang: Language) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(lang === "pl" ? "pl-PL" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}