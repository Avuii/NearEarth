import { useEffect, useState } from "react";
import { Activity, Languages, Search, User } from "lucide-react";
import logo from "./assets/logo.png";
import { EducationCard } from "./components/education-card";
import { StarfieldBackground } from "./components/starfield-background";
import { AlertsPage } from "./components/alerts-page";
import { AsteroidDetailsCard } from "./components/asteroid-details-card";
import { DashboardPage } from "./components/dashboard-page";
import { FlybysPage } from "./components/flybys-page";
import { InsightsPage } from "./components/insights-page";
import { WatchlistPage } from "./components/watchlist-page";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { TabsList, TabsTrigger } from "./components/ui/tabs";
import { Language, translations } from "./lib/i18n";

type View = "dashboard" | "flybys" | "watchlist" | "alerts" | "insights" | "edu";

export default function App() {
  const [lang, setLang] = useState<Language>("en");
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsteroidId, setSelectedAsteroidId] = useState<string | null>(null);

  const [watchlistIds, setWatchlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("nearearth-watchlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem("nearearth-watchlist", JSON.stringify(watchlistIds));
  }, [watchlistIds]);

  function openAsteroidDetails(id: string) {
    setSelectedAsteroidId(id);
  }

  function closeAsteroidDetails() {
    setSelectedAsteroidId(null);
  }

  function toggleWatchlist(id: string) {
    setWatchlistIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function openAsteroidInOrbitalPreview(id: string) {
    closeAsteroidDetails();
    setActiveView("dashboard");

    const dispatchFocus = () => {
      window.dispatchEvent(
        new CustomEvent("nearearth:focus-orbit", {
          detail: { id, follow: true },
        })
      );
    };

    window.setTimeout(dispatchFocus, 180);
    window.setTimeout(dispatchFocus, 520);
  }

  let content = (
    <DashboardPage
      lang={lang}
      watchlistIds={watchlistIds}
      onToggleWatchlist={toggleWatchlist}
      onOpenAsteroid={openAsteroidDetails}
      onOpenAsteroidPreview={openAsteroidInOrbitalPreview}
      onOpenFlybys={() => setActiveView("flybys")}
    />
  );

  if (activeView === "flybys") {
    content = (
      <FlybysPage
        lang={lang}
        watchlistIds={watchlistIds}
        onToggleWatchlist={toggleWatchlist}
        onOpenAsteroid={openAsteroidDetails}
      />
    );
  }

  if (activeView === "watchlist") {
    content = (
      <WatchlistPage
        lang={lang}
        watchlistIds={watchlistIds}
        onToggleWatchlist={toggleWatchlist}
        onOpenAsteroid={openAsteroidDetails}
      />
    );
  }

  if (activeView === "alerts") {
    content = <AlertsPage lang={lang} />;
  }

  if (activeView === "insights") {
    content = <InsightsPage lang={lang} />;
  }
  if (activeView === "education") {
    content = (
      <div className="space-y-8">
        <section>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            {lang === "pl" ? "Edukacja" : "Education"}
          </h2>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            {lang === "pl"
              ? "Proste wyjaśnienia najważniejszych pojęć używanych w aplikacji."
              : "Simple explanations of the most important terms used in the app."}
          </p>
        </section>

        <EducationCard lang={lang} />
      </div>
    );
  }
  return (
    <div className="dark min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-background via-background to-slate-950 text-foreground">
      <StarfieldBackground />

      <div className="pointer-events-none fixed inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.13),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(14,165,233,0.12),transparent_35%)]" />
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-5 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
                <button
                  className="flex w-fit items-center gap-3 select-none transition duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => setActiveView("dashboard")}
                >
                  <img
                    src={logo}
                    alt="NearEarth logo"
                    className="h-12 w-12 object-contain"
                  />

                  <div className="flex flex-col text-left leading-none">
                    <span className="text-xl font-semibold tracking-tight text-foreground">
                      NearEarth
                    </span>
                    <span className="mt-1 hidden text-[10px] uppercase tracking-[0.32em] text-cyan-300/70 sm:block">
                      NEO Monitor
                    </span>
                  </div>
                </button>

                <TabsList className="w-fit">
                  <TabsTrigger
                    value="dashboard"
                    activeValue={activeView}
                    onValueChange={(value) => setActiveView(value as View)}
                  >
                    {t.dashboard}
                  </TabsTrigger>

                  <TabsTrigger
                    value="flybys"
                    activeValue={activeView}
                    onValueChange={(value) => setActiveView(value as View)}
                  >
                    {t.flybys}
                  </TabsTrigger>

                  <TabsTrigger
                    value="watchlist"
                    activeValue={activeView}
                    onValueChange={(value) => setActiveView(value as View)}
                  >
                    {t.watchlist}
                  </TabsTrigger>

                  <TabsTrigger
                    value="alerts"
                    activeValue={activeView}
                    onValueChange={(value) => setActiveView(value as View)}
                  >
                    {t.alerts}
                  </TabsTrigger>

                  <TabsTrigger
                    value="insights"
                    activeValue={activeView}
                    onValueChange={(value) => setActiveView(value as View)}
                  >
                    {t.insights}
                  </TabsTrigger>
                  <TabsTrigger
                    value="education"
                    activeValue={activeView}
                    onValueChange={(value) => setActiveView(value as View)}
                  >
                    {lang === "pl" ? "Edu" : "Edu"}
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative hidden lg:block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300/70" />

                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="h-11 w-[300px] rounded-2xl border border-white/10 bg-white/[0.045] pl-11 pr-4 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none backdrop-blur-xl placeholder:text-muted-foreground/70 focus:border-cyan-300/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-cyan-400/15 xl:w-[360px]"
                  />
                </div>

                <Badge variant="outline" className="w-fit whitespace-nowrap text-xs">
                  <Activity className="h-3.5 w-3.5" />
                  {t.lastSync}: 2h {t.ago}
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLang(lang === "en" ? "pl" : "en")}
                >
                  <Languages className="h-4 w-4" />
                  {lang.toUpperCase()}
                </Button>

                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

       <main className="relative z-10 mx-auto w-full max-w-[1020px] px-5 py-8 lg:px-8">
  {content}
</main>

        <footer className="mt-16 border-t border-border bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-5 py-6 text-sm text-muted-foreground md:flex-row">
            <p>{t.dataSource}</p>
            <p>{t.copyright}</p>
          </div>
        </footer>
      </div>

      {selectedAsteroidId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8">
          <button
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={closeAsteroidDetails}
            aria-label="Close asteroid details"
          />

          <div className="relative z-10 w-full max-w-4xl animate-in fade-in zoom-in-95 duration-200">
            <div className="max-h-[86vh] overflow-y-auto rounded-2xl shadow-[0_30px_120px_rgba(0,0,0,0.65)]">
              <AsteroidDetailsCard
                lang={lang}
                objectId={selectedAsteroidId}
                onClose={closeAsteroidDetails}
                isWatched={watchlistIds.includes(selectedAsteroidId)}
                onToggleWatch={toggleWatchlist}
                onOpenPreview={openAsteroidInOrbitalPreview}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}