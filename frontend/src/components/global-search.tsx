import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Clock,
  ExternalLink,
  FileSearch,
  Home,
  List,
  Search,
  ShieldAlert,
  Sparkles,
  Telescope,
} from "lucide-react";
import type { Language } from "../lib/i18n";
import { getDashboardData } from "../services/nearEarthApi";
import type { DashboardNeoItem, DashboardResponse } from "../types/dashboard";
import { Input } from "./ui/input";

type SearchView =
  | "dashboard"
  | "flybys"
  | "watchlist"
  | "alerts"
  | "insights"
  | "education";

interface GlobalSearchProps {
  lang: Language;
  onNavigate: (view: SearchView) => void;
  onOpenAsteroid: (id: string) => void;
}

type PageResult = {
  type: "page";
  title: string;
  description: string;
  view: SearchView;
};

type EducationResult = {
  type: "education";
  title: string;
  description: string;
  keywords: string[];
};

const pageResults: Record<Language, PageResult[]> = {
  en: [
    {
      type: "page",
      title: "Home",
      description: "Dashboard, charts and 3D orbital preview.",
      view: "dashboard",
    },
    {
      type: "page",
      title: "Flybys",
      description: "Browse and filter close approaches.",
      view: "flybys",
    },
    {
      type: "page",
      title: "Watch",
      description: "Open your asteroid watchlist.",
      view: "watchlist",
    },
    {
      type: "page",
      title: "Alerts",
      description: "Check potentially important objects.",
      view: "alerts",
    },
    {
      type: "page",
      title: "Stats",
      description: "Open analytical charts and risk indicators.",
      view: "insights",
    },
    {
      type: "page",
      title: "Education",
      description: "Learn terms like NEO, LD, PHA and close approach.",
      view: "education",
    },
  ],
  pl: [
    {
      type: "page",
      title: "Start",
      description: "Dashboard, wykresy i podgląd orbit 3D.",
      view: "dashboard",
    },
    {
      type: "page",
      title: "Przeloty",
      description: "Przeglądaj i filtruj bliskie przeloty.",
      view: "flybys",
    },
    {
      type: "page",
      title: "Lista",
      description: "Otwórz listę obserwowanych asteroid.",
      view: "watchlist",
    },
    {
      type: "page",
      title: "Alerty",
      description: "Sprawdź potencjalnie istotne obiekty.",
      view: "alerts",
    },
    {
      type: "page",
      title: "Staty",
      description: "Otwórz wykresy analityczne i wskaźniki ryzyka.",
      view: "insights",
    },
    {
      type: "page",
      title: "Edukacja",
      description: "Poznaj pojęcia NEO, LD, PHA i close approach.",
      view: "education",
    },
  ],
};

const educationResults: Record<Language, EducationResult[]> = {
  en: [
    {
      type: "education",
      title: "NEO",
      description: "Near-Earth Object, an asteroid or comet whose orbit brings it close to Earth.",
      keywords: ["neo", "near earth object", "asteroid", "comet"],
    },
    {
      type: "education",
      title: "LD",
      description: "Lunar distance, the average distance between Earth and the Moon.",
      keywords: ["ld", "lunar", "lunar distance", "moon distance"],
    },
    {
      type: "education",
      title: "PHA",
      description: "Potentially Hazardous Asteroid. It does not mean impact is expected.",
      keywords: ["pha", "hazardous", "danger", "risk"],
    },
    {
      type: "education",
      title: "Close approach",
      description: "The moment when an object passes nearest to Earth during a specific encounter.",
      keywords: ["close approach", "approach", "flyby", "nearest"],
    },
    {
      type: "education",
      title: "AU",
      description: "Astronomical unit, roughly the average distance from Earth to the Sun.",
      keywords: ["au", "astronomical unit", "sun distance"],
    },
    {
      type: "education",
      title: "Light-year",
      description: "A distance unit used for stars and galaxies, not a unit of time.",
      keywords: ["light year", "light-year", "stars", "galaxy"],
    },
    {
      type: "education",
      title: "Asteroid belt",
      description: "Region between Mars and Jupiter with many rocky objects.",
      keywords: ["asteroid belt", "belt", "mars", "jupiter"],
    },
    {
      type: "education",
      title: "Black hole",
      description: "A region where gravity is so strong that even light cannot escape.",
      keywords: ["black hole", "gravity", "space object"],
    },
  ],
  pl: [
    {
      type: "education",
      title: "NEO",
      description: "Obiekt bliski Ziemi, czyli asteroida albo kometa z orbitą przechodzącą blisko Ziemi.",
      keywords: ["neo", "obiekt bliski ziemi", "asteroida", "kometa"],
    },
    {
      type: "education",
      title: "LD",
      description: "Odległość księżycowa, czyli średnia odległość Ziemi od Księżyca.",
      keywords: ["ld", "odległość księżycowa", "księżyc"],
    },
    {
      type: "education",
      title: "PHA",
      description: "Potencjalnie niebezpieczna asteroida. To nie znaczy, że uderzenie jest przewidywane.",
      keywords: ["pha", "niebezpieczna", "ryzyko", "zagrożenie"],
    },
    {
      type: "education",
      title: "Close approach",
      description: "Moment, w którym obiekt mija Ziemię w najmniejszej odległości.",
      keywords: ["close approach", "zbliżenie", "przelot", "najbliższy"],
    },
    {
      type: "education",
      title: "AU",
      description: "Jednostka astronomiczna, czyli mniej więcej średnia odległość Ziemi od Słońca.",
      keywords: ["au", "jednostka astronomiczna", "słońce"],
    },
    {
      type: "education",
      title: "Rok świetlny",
      description: "Jednostka odległości używana dla gwiazd i galaktyk, a nie jednostka czasu.",
      keywords: ["rok świetlny", "light year", "gwiazdy", "galaktyka"],
    },
    {
      type: "education",
      title: "Pas asteroid",
      description: "Obszar między Marsem a Jowiszem, w którym znajduje się wiele skalistych obiektów.",
      keywords: ["pas asteroid", "mars", "jowisz"],
    },
    {
      type: "education",
      title: "Czarna dziura",
      description: "Obszar, w którym grawitacja jest tak silna, że nawet światło nie może uciec.",
      keywords: ["czarna dziura", "grawitacja", "kosmos"],
    },
  ],
};

export function GlobalSearch({
  lang,
  onNavigate,
  onOpenAsteroid,
}: GlobalSearchProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) {
        return;
      }

      if (!wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function loadAsteroids() {
    if (dashboardData || isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      const data = await getDashboardData();
      setDashboardData(data as DashboardResponse);
    } catch {
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  }

  function openSearch() {
    setIsOpen(true);
    loadAsteroids();
  }

  const asteroidResults = useMemo(() => {
    const objects = dashboardData?.objects ?? [];

    if (!normalizedQuery) {
      return objects.slice(0, 4);
    }

    return objects
      .filter((item) => {
        const haystack = [
          item.id,
          item.name,
          item.closeApproachDate,
          item.isPotentiallyHazardous ? "pha hazardous" : "safe",
          `${item.missDistanceLunar} ld`,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .slice(0, 5);
  }, [dashboardData, normalizedQuery]);

  const matchedPages = useMemo(() => {
    const pages = pageResults[lang];

    if (!normalizedQuery) {
      return pages.slice(0, 3);
    }

    return pages
      .filter((item) =>
        `${item.title} ${item.description} ${item.view}`
          .toLowerCase()
          .includes(normalizedQuery)
      )
      .slice(0, 4);
  }, [lang, normalizedQuery]);

  const matchedEducation = useMemo(() => {
    const terms = educationResults[lang];

    if (!normalizedQuery) {
      return terms.slice(0, 4);
    }

    return terms
      .filter((item) =>
        `${item.title} ${item.description} ${item.keywords.join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery)
      )
      .slice(0, 5);
  }, [lang, normalizedQuery]);

  function clearAndClose() {
    setQuery("");
    setIsOpen(false);
  }

  function handlePageClick(view: SearchView) {
    onNavigate(view);
    clearAndClose();
  }

  function handleEducationClick() {
    onNavigate("education");
    clearAndClose();
  }

  function handleAsteroidClick(id: string) {
    onOpenAsteroid(id);
    clearAndClose();
  }

  const hasAnyResults =
    asteroidResults.length > 0 ||
    matchedPages.length > 0 ||
    matchedEducation.length > 0;

  const labels =
    lang === "pl"
      ? {
          placeholder: "Szukaj asteroidy, strony lub pojęcia...",
          asteroids: "Asteroidy",
          pages: "Strony",
          education: "Edukacja",
          noResults: "Brak wyników",
          loading: "Ładowanie obiektów NASA...",
          openEdu: "Otwórz edukację",
          openPage: "Przejdź",
          openAsteroid: "Szczegóły",
        }
      : {
          placeholder: "Search asteroid, page or term...",
          asteroids: "Asteroids",
          pages: "Pages",
          education: "Education",
          noResults: "No results",
          loading: "Loading NASA objects...",
          openEdu: "Open education",
          openPage: "Go",
          openAsteroid: "Details",
        };

  return (
    <div ref={wrapperRef} className="relative hidden lg:block">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300/70" />

      <Input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={openSearch}
        placeholder={labels.placeholder}
        className="h-11 w-[300px] rounded-2xl border border-white/10 bg-white/[0.045] pl-11 pr-4 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none backdrop-blur-xl placeholder:text-muted-foreground/70 focus:border-cyan-300/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-cyan-400/15 xl:w-[360px]"
      />

      {isOpen && (
        <div className="absolute left-0 top-14 z-[90] w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-black/95 shadow-[0_24px_80px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <div className="border-b border-white/10 px-4 py-3 text-xs text-muted-foreground">
            {isLoading ? labels.loading : labels.placeholder}
          </div>

          <div className="max-h-[460px] overflow-y-auto p-2">
            {!hasAnyResults && !isLoading && (
              <div className="flex items-center gap-3 rounded-xl px-3 py-4 text-sm text-muted-foreground">
                <FileSearch className="h-4 w-4 text-cyan-300" />
                {labels.noResults}
              </div>
            )}

            {asteroidResults.length > 0 && (
              <SearchGroup title={labels.asteroids}>
                {asteroidResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAsteroidClick(item.id)}
                    className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.06]"
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                      <Telescope className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.name}
                        </p>

                        {item.isPotentiallyHazardous && (
                          <span className="rounded-full border border-rose-400/25 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-300">
                            PHA
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDistance(item)} · {item.closeApproachDate}
                      </p>
                    </div>

                    <span className="mt-1 text-xs text-cyan-300">
                      {labels.openAsteroid}
                    </span>
                  </button>
                ))}
              </SearchGroup>
            )}

            {matchedPages.length > 0 && (
              <SearchGroup title={labels.pages}>
                {matchedPages.map((item) => (
                  <button
                    key={item.view}
                    type="button"
                    onClick={() => handlePageClick(item.view)}
                    className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.06]"
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-cyan-300">
                      <Home className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>

                    <ExternalLink className="mt-1 h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                ))}
              </SearchGroup>
            )}

            {matchedEducation.length > 0 && (
              <SearchGroup title={labels.education}>
                {matchedEducation.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={handleEducationClick}
                    className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.06]"
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                      <BookOpen className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>

                    <span className="mt-1 text-xs text-cyan-300">
                      {labels.openEdu}
                    </span>
                  </button>
                ))}
              </SearchGroup>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/70">
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function formatDistance(item: DashboardNeoItem) {
  return `${item.missDistanceLunar.toFixed(2)} LD`;
}