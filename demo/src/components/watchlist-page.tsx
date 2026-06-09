import { Bell, Eye, Star, Trash2 } from "lucide-react";
import { neoObjects } from "../data/neo-data";
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
  const watchedObjects = neoObjects.filter((item) =>
    watchlistIds.includes(item.id)
  );

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
            ? "Obiekty dodane do obserwowanych z listy przelotów."
            : "Objects added from the flyby list for monitoring."}
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
            {watchedObjects.filter((item) => item.isPHA).length}
          </div>
        </Card>

        <Card className="p-5 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Star className="h-5 w-5 fill-current text-cyan-300" />
            {lang === "pl" ? "Najbliższy dystans" : "Closest distance"}
          </div>
          <div className="mt-3 text-3xl font-semibold text-foreground">
            {watchedObjects.length > 0
              ? `${Math.min(...watchedObjects.map((item) => item.distanceLD))} LD`
              : "—"}
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
            {lang === "pl"
              ? "Przejdź do zakładki Przeloty i kliknij Obserwuj przy wybranej asteroidzie."
              : "Go to Flybys and click Watch next to an asteroid."}
          </p>
        </Card>
      ) : (
        <section className="grid gap-4">
          {watchedObjects.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer p-5 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-secondary/20"
              onClick={() => onOpenAsteroid(item.id)}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold text-foreground">
                      {item.name}
                    </h3>

                    {item.isPHA && <Badge variant="danger">PHA</Badge>}

                    <Badge variant={item.distanceLD <= 5 ? "warning" : "outline"}>
                      {item.distanceLD} LD
                    </Badge>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {lang === "pl" ? item.datePL : item.date} •{" "}
                    {item.velocityKms} km/s • ~{item.diameterM} m •{" "}
                    {item.orbitClass}
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
          ))}
        </section>
      )}
    </div>
  );
}