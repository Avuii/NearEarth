import type { ElementType, MouseEvent } from "react";
import {
  ArrowUpRight,
  Calendar,
  ExternalLink,
  Gauge,
  Orbit,
  Ruler,
  ShieldAlert,
  Star,
  X,
} from "lucide-react";
import { neoObjects } from "../data/neo-data";
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

export function AsteroidDetailsCard({
  lang,
  objectId,
  onClose,
  isWatched = false,
  onToggleWatch,
  onOpenPreview,
}: AsteroidDetailsCardProps) {
  const t = translations[lang];
  const item =
    neoObjects.find((object) => object.id === objectId) ??
    neoObjects.find((object) => object.name === "2024 XR7") ??
    neoObjects[0];

  function handleOpenPreview(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (onOpenPreview) {
      onOpenPreview(item.id);
      return;
    }

    window.dispatchEvent(
      new CustomEvent("nearearth:focus-orbit", {
        detail: { id: item.id, follow: true },
      })
    );

    onClose?.();
  }

  return (
    <Card className="overflow-hidden border-white/10 bg-black/80 shadow-2xl backdrop-blur-xl">
      <div className="border-b border-white/10 bg-cyan-950/30 p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {item.name}
              </h2>

              {item.isPHA && <Badge variant="danger">PHA</Badge>}
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {lang === "pl"
                ? `${item.orbitClass} klasa orbity`
                : `${item.orbitClass} orbit class`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => onToggleWatch?.(item.id)}
              className="transition duration-200 hover:scale-[1.03] active:scale-[0.97]"
            >
              <Star className={isWatched ? "h-4 w-4 fill-current" : "h-4 w-4"} />
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
        <InfoBox icon={Ruler} label={t.minDistance} value={`${item.distanceLD} LD`} />
        <InfoBox icon={Gauge} label={t.relativeVelocity} value={`${item.velocityKms} km/s`} />
        <InfoBox icon={ArrowUpRight} label={t.diameter} value={`~${item.diameterM} m`} />
        <InfoBox icon={Orbit} label={t.orbitClass} value={item.orbitClass} />
        <InfoBox
          icon={Calendar}
          label={t.closeApproach}
          value={lang === "pl" ? item.datePL : item.date}
        />
        <InfoBox
          icon={ShieldAlert}
          label={lang === "pl" ? "Ryzyko" : "Risk"}
          value={item.risk.toUpperCase()}
        />
      </div>

      <div className="border-t border-white/10 p-7">
        <h3 className="text-lg font-semibold text-foreground">
          {t.aboutThisApproach}
        </h3>

        <p className="mt-3 text-muted-foreground">{item.note}</p>
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
