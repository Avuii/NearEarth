import type { ElementType, MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Calendar,
  ExternalLink,
  Gauge,
  Orbit,
  RefreshCw,
  Ruler,
  ShieldAlert,
  Star,
  X,
} from "lucide-react";
import { getAsteroidById } from "../services/nearEarthApi";
import { Language, translations } from "../lib/i18n";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface AsteroidDetailsCardProps {
  lang: Language;
  objectId?: string;
  onClose?: () => void;
  isWatched?: boolean;
  onToggleWatch?: (id: string) => void;
  onOpenPreview?: (id: string) => void;
}

type NasaAsteroidDetails = {
  id: string;
  name: string;
  nasa_jpl_url?: string;
  absolute_magnitude_h?: number;
  is_potentially_hazardous_asteroid?: boolean;
  estimated_diameter?: {
    meters?: {
      estimated_diameter_min?: number;
      estimated_diameter_max?: number;
    };
  };
  close_approach_data?: NasaCloseApproach[];
  orbital_data?: {
    orbit_class?: {
      orbit_class_type?: string;
      orbit_class_description?: string;
    };
  };
};

type NasaCloseApproach = {
  close_approach_date?: string;
  close_approach_date_full?: string;
  epoch_date_close_approach?: number;
  relative_velocity?: {
    kilometers_per_second?: string;
    kilometers_per_hour?: string;
  };
  miss_distance?: {
    lunar?: string;
    kilometers?: string;
    astronomical?: string;
  };
  orbiting_body?: string;
};

export function AsteroidDetailsCard({
  lang,
  objectId,
  onClose,
  isWatched = false,
  onToggleWatch,
  onOpenPreview,
}: AsteroidDetailsCardProps) {
  const t = translations[lang];

  const [asteroid, setAsteroid] = useState<NasaAsteroidDetails | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(objectId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAsteroid() {
      if (!objectId) {
        setAsteroid(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await getAsteroidById(objectId);
        setAsteroid(data);
      } catch {
        setError("Could not load asteroid details from NASA NeoWs.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAsteroid();
  }, [objectId]);

  const approach = useMemo(() => {
    return selectApproach(asteroid?.close_approach_data ?? []);
  }, [asteroid]);

  const diameterMin =
    asteroid?.estimated_diameter?.meters?.estimated_diameter_min ?? 0;
  const diameterMax =
    asteroid?.estimated_diameter?.meters?.estimated_diameter_max ?? 0;
  const diameterAverage = (diameterMin + diameterMax) / 2;

  const distanceLD = parseNumber(approach?.miss_distance?.lunar);
  const distanceKm = parseNumber(approach?.miss_distance?.kilometers);
  const velocityKps = parseNumber(
    approach?.relative_velocity?.kilometers_per_second
  );

  const isPHA = Boolean(asteroid?.is_potentially_hazardous_asteroid);
  const orbitClass =
    asteroid?.orbital_data?.orbit_class?.orbit_class_type ||
    approach?.orbiting_body ||
    "NEO";

  const risk = getRisk(isPHA, distanceLD, diameterAverage);

  function handleOpenPreview(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (!asteroid) {
      return;
    }

    if (onOpenPreview) {
      onOpenPreview(asteroid.id);
      return;
    }

    window.dispatchEvent(
      new CustomEvent("nearearth:focus-orbit", {
        detail: { id: asteroid.id, follow: true },
      })
    );

    onClose?.();
  }

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-white/10 bg-black/80 p-8 text-center shadow-2xl backdrop-blur-xl">
        <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />

        <p className="text-lg font-semibold text-foreground">
          Loading asteroid details...
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Fetching object data from NASA NeoWs.
        </p>
      </Card>
    );
  }

  if (error || !asteroid) {
    return (
      <Card className="overflow-hidden border-white/10 bg-black/80 p-8 text-center shadow-2xl backdrop-blur-xl">
        <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-destructive" />

        <h2 className="mb-2 text-xl font-semibold text-foreground">
          Details unavailable
        </h2>

        <p className="mb-5 text-sm text-muted-foreground">
          {error ?? "No asteroid selected."}
        </p>

        {onClose && (
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4" />
            {lang === "pl" ? "Zamknij" : "Close"}
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-white/10 bg-black/80 shadow-2xl backdrop-blur-xl">
      <div className="border-b border-white/10 bg-cyan-950/30 p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {asteroid.name}
              </h2>

              {isPHA && <Badge variant="danger">PHA</Badge>}
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {lang === "pl"
                ? `${orbitClass} klasa orbity`
                : `${orbitClass} orbit class`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => onToggleWatch?.(asteroid.id)}
              className="transition duration-200 hover:scale-[1.03] active:scale-[0.97]"
            >
              <Star
                className={isWatched ? "h-4 w-4 fill-current" : "h-4 w-4"}
              />
              {isWatched
                ? lang === "pl"
                  ? "Obserwujesz"
                  : "Watching"
                : t.addToWatchlist}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleOpenPreview}
              className="h-11 w-11 rounded-2xl border-white/10 bg-white/[0.04] transition duration-200 hover:scale-[1.04] hover:bg-white/[0.08] active:scale-[0.96]"
              aria-label={
                lang === "pl"
                  ? "Otwórz podgląd orbitalny"
                  : "Open orbital preview"
              }
            >
              <ExternalLink className="h-4 w-4" />
            </Button>

            {onClose && (
              <Button
                variant="outline"
                size="icon"
                onClick={onClose}
                className="h-11 w-11 rounded-2xl border-white/10 bg-white/[0.04] transition duration-200 hover:scale-[1.04] hover:bg-white/[0.08] active:scale-[0.96]"
                aria-label={lang === "pl" ? "Zamknij" : "Close"}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-7 md:grid-cols-2">
        <InfoBox
          icon={Ruler}
          label={t.minDistance}
          value={
            distanceLD > 0
              ? `${formatNumber(distanceLD, 2)} LD`
              : "No data"
          }
        />

        <InfoBox
          icon={Gauge}
          label={t.relativeVelocity}
          value={
            velocityKps > 0
              ? `${formatNumber(velocityKps, 1)} km/s`
              : "No data"
          }
        />

        <InfoBox
          icon={ArrowUpRight}
          label={t.diameter}
          value={
            diameterAverage > 0
              ? `~${formatNumber(diameterAverage, 0)} m`
              : "No data"
          }
        />

        <InfoBox icon={Orbit} label={t.orbitClass} value={orbitClass} />

        <InfoBox
          icon={Calendar}
          label={t.closeApproach}
          value={formatApproachDate(
            approach?.close_approach_date,
            approach?.close_approach_date_full,
            lang
          )}
        />

        <InfoBox
          icon={ShieldAlert}
          label={lang === "pl" ? "Ryzyko" : "Risk"}
          value={risk.toUpperCase()}
        />
      </div>

      <div className="border-t border-white/10 p-7">
        <h3 className="text-lg font-semibold text-foreground">
          {t.aboutThisApproach}
        </h3>

        <p className="mt-3 text-muted-foreground">
          {buildNote(
            asteroid.name,
            isPHA,
            distanceLD,
            distanceKm,
            velocityKps,
            diameterAverage,
            lang
          )}
        </p>

        {asteroid.nasa_jpl_url && (
          <Button
            variant="outline"
            className="mt-5"
            onClick={() => window.open(asteroid.nasa_jpl_url, "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
            NASA JPL
          </Button>
        )}
      </div>
    </Card>
  );
}

interface InfoBoxProps {
  icon: ElementType;
  label: string;
  value: string;
}

function InfoBox({ icon: Icon, label, value }: InfoBoxProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition duration-200 hover:border-cyan-300/20 hover:bg-white/[0.045]">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>

      <div className="text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}

function selectApproach(items: NasaCloseApproach[]) {
  if (items.length === 0) {
    return undefined;
  }

  const now = Date.now();

  const upcoming = items
    .filter((item) => (item.epoch_date_close_approach ?? 0) >= now)
    .sort(
      (a, b) =>
        (a.epoch_date_close_approach ?? 0) -
        (b.epoch_date_close_approach ?? 0)
    );

  if (upcoming.length > 0) {
    return upcoming[0];
  }

  return [...items].sort(
    (a, b) =>
      Math.abs((a.epoch_date_close_approach ?? 0) - now) -
      Math.abs((b.epoch_date_close_approach ?? 0) - now)
  )[0];
}

function parseNumber(value?: string) {
  if (!value) {
    return 0;
  }

  const parsed = Number.parseFloat(value);

  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatNumber(value: number, maximumFractionDigits: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

function formatApproachDate(
  date?: string,
  fullDate?: string,
  lang: Language = "en"
) {
  const value = fullDate || date;

  if (!value) {
    return "No data";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString(lang === "pl" ? "pl-PL" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getRisk(isPHA: boolean, distanceLD: number, diameterM: number) {
  if (isPHA) {
    return "high";
  }

  if (distanceLD > 0 && distanceLD <= 5) {
    return "medium";
  }

  if (diameterM >= 300) {
    return "medium";
  }

  return "low";
}

function buildNote(
  name: string,
  isPHA: boolean,
  distanceLD: number,
  distanceKm: number,
  velocityKps: number,
  diameterM: number,
  lang: Language
) {
  const distanceLDText =
    distanceLD > 0 ? `${formatNumber(distanceLD, 2)} LD` : "unknown distance";
  const distanceKmText =
    distanceKm > 0 ? `${formatNumber(distanceKm, 0)} km` : "unknown km";
  const velocityText =
    velocityKps > 0 ? `${formatNumber(velocityKps, 1)} km/s` : "unknown velocity";
  const diameterText =
    diameterM > 0 ? `${formatNumber(diameterM, 0)} m` : "unknown diameter";

  if (lang === "pl") {
    return `${name} został pobrany z NASA NeoWs. Obiekt minie Ziemię w odległości około ${distanceLDText} (${distanceKmText}), z prędkością względną ${velocityText}. Szacowana średnica obiektu to około ${diameterText}. ${
      isPHA
        ? "NASA oznacza ten obiekt jako potencjalnie niebezpieczny."
        : "NASA nie oznacza tego obiektu jako PHA w aktualnych danych."
    }`;
  }

  return `${name} was fetched from NASA NeoWs. The object will pass Earth at about ${distanceLDText} (${distanceKmText}) with relative velocity ${velocityText}. Estimated diameter is about ${diameterText}. ${
    isPHA
      ? "NASA marks this object as potentially hazardous."
      : "NASA does not mark this object as PHA in the current data."
  }`;
}