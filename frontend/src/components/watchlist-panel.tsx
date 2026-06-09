import { Eye, Star } from "lucide-react";
import { neoObjects } from "../data/neo-data";
import { Language, translations } from "../lib/i18n";
import type { DashboardNeoItem } from "../types/dashboard";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

interface WatchlistPanelProps {
  lang: Language;
  objects?: DashboardNeoItem[];
  watchlistIds?: string[];
  onOpenAsteroid?: (id: string) => void;
}

type WatchItem = {
  id: string;
  name: string;
  distanceLD: number;
  isPHA: boolean;
  note: string;
};

export function WatchlistPanel({
  lang,
  objects,
  watchlistIds = [],
  onOpenAsteroid,
}: WatchlistPanelProps) {
  const t = translations[lang];

  const source =
    objects && objects.length > 0
      ? objects.map((item) => ({
          id: item.id,
          name: item.name,
          distanceLD: item.missDistanceLunar,
          isPHA: item.isPotentiallyHazardous,
          note: buildRealNote(item, lang),
        }))
      : neoObjects.map((item) => ({
          id: item.id,
          name: item.name,
          distanceLD: item.distanceLD,
          isPHA: item.isPHA,
          note: item.note,
        }));

  const watched = source
    .filter((item) => watchlistIds.includes(item.id))
    .slice(0, 4);

  return (
    <Card className="p-6 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {t.watchlist}
          </h3>

          <p className="text-sm text-muted-foreground">
            {t.watchlistTitle}
          </p>
        </div>

        <Badge variant="secondary">
          <Eye className="h-3.5 w-3.5" />
          {watched.length} {t.active}
        </Badge>
      </div>

      {watched.length === 0 ? (
        <div className="rounded-xl border border-border bg-secondary/20 p-5 text-sm text-muted-foreground">
          {lang === "pl"
            ? "Nie obserwujesz jeszcze żadnego obiektu. Kliknij Watch przy asteroidzie w tabeli."
            : "You are not watching any object yet. Click Watch next to an asteroid in the table."}
        </div>
      ) : (
        <div className="space-y-3">
          {watched.map((item) => (
            <button
              key={item.id}
              className="w-full rounded-xl border border-border bg-secondary/30 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-secondary/50 active:scale-[0.99]"
              onClick={() => onOpenAsteroid?.(item.id)}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-current text-primary" />
                  <p className="font-medium text-foreground">
                    {item.name}
                  </p>
                </div>

                <Badge variant={item.isPHA ? "danger" : "warning"}>
                  {item.isPHA ? "PHA" : `${formatNumber(item.distanceLD, 2)} LD`}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                {item.note}
              </p>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

function buildRealNote(item: DashboardNeoItem, lang: Language) {
  const distance = formatNumber(item.missDistanceLunar, 2);
  const velocity = formatNumber(item.velocityKilometersPerSecond, 1);
  const diameter = formatNumber(item.diameterAverageMeters, 0);

  if (lang === "pl") {
    if (item.isPotentiallyHazardous) {
      return `Obiekt PHA, dystans ${distance} LD, prędkość ${velocity} km/s, średnica około ${diameter} m.`;
    }

    return `Obserwowany obiekt, dystans ${distance} LD, prędkość ${velocity} km/s, średnica około ${diameter} m.`;
  }

  if (item.isPotentiallyHazardous) {
    return `PHA object, distance ${distance} LD, velocity ${velocity} km/s, diameter about ${diameter} m.`;
  }

  return `Watched object, distance ${distance} LD, velocity ${velocity} km/s, diameter about ${diameter} m.`;
}

function formatNumber(value: number, maximumFractionDigits: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}