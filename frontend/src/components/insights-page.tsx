import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Brain, Gauge, Radar, Telescope } from "lucide-react";
import { chartData, distanceBuckets, neoObjects } from "../data/neo-data";
import { Language, translations } from "../lib/i18n";
import { StatsCard } from "./stats-card";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

interface InsightsPageProps {
  lang: Language;
}

const copy = {
  en: {
    subtitle:
      "Compact analytical view of NEO traffic, distance distribution and relative risk indicators.",
    trackedNeo: "Tracked NEO",
    avgDistance: "Average distance",
    avgVelocity: "Average velocity",
    phaRatio: "PHA ratio",
    risk: "risk",
    objects: "objects",
    trackedNeoHint:
      "Number of NEO objects included in this analytical view. This page currently uses a compact dataset for visual statistics.",
    avgDistanceHint:
      "Average distance of tracked objects shown in lunar distances. LD means the average distance between Earth and the Moon.",
    avgVelocityHint:
      "Average relative velocity of tracked objects. It shows speed compared with Earth during close approach.",
    phaRatioHint:
      "Share of tracked objects marked as PHA. PHA means Potentially Hazardous Asteroid, but it is not an impact prediction.",
    riskTrendHint:
      "Risk trend is a simplified analytical indicator used to compare days visually. It is not an official NASA risk score.",
    distanceGroupsHint:
      "Distance groups show how many objects fall into selected LD ranges. Lower LD means a closer flyby.",
  },
  pl: {
    subtitle:
      "Kompaktowy widok analityczny ruchu NEO, rozkładu odległości i wskaźników ryzyka.",
    trackedNeo: "Śledzone NEO",
    avgDistance: "Średnia odległość",
    avgVelocity: "Średnia prędkość",
    phaRatio: "Udział PHA",
    risk: "ryzyko",
    objects: "obiekty",
    trackedNeoHint:
      "Liczba obiektów NEO uwzględnionych w tym widoku analitycznym. Ta strona używa kompaktowego zestawu danych do statystyk wizualnych.",
    avgDistanceHint:
      "Średnia odległość śledzonych obiektów pokazana w LD. LD oznacza średnią odległość Ziemi od Księżyca.",
    avgVelocityHint:
      "Średnia prędkość względna śledzonych obiektów. Pokazuje prędkość względem Ziemi podczas zbliżenia.",
    phaRatioHint:
      "Udział obiektów oznaczonych jako PHA. PHA oznacza potencjalnie niebezpieczną asteroidę, ale nie jest przewidywaniem uderzenia.",
    riskTrendHint:
      "Trend ryzyka to uproszczony wskaźnik analityczny do wizualnego porównywania dni. Nie jest to oficjalny wynik ryzyka NASA.",
    distanceGroupsHint:
      "Grupy odległości pokazują, ile obiektów mieści się w wybranych zakresach LD. Niższe LD oznacza bliższy przelot.",
  },
};

export function InsightsPage({ lang }: InsightsPageProps) {
  const t = translations[lang];
  const c = copy[lang];

  const avgDistance =
    neoObjects.reduce((sum, item) => sum + item.distanceLD, 0) /
    neoObjects.length;

  const avgVelocity =
    neoObjects.reduce((sum, item) => sum + item.velocityKms, 0) /
    neoObjects.length;

  const phaRatio = Math.round(
    (neoObjects.filter((item) => item.isPHA).length / neoObjects.length) * 100
  );

  return (
    <div className="space-y-8">
      <section>
        <Badge variant="secondary" className="mb-3">
          <Brain className="h-3.5 w-3.5" />
          {t.insightsTitle}
        </Badge>

        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          {t.insights}
        </h2>

        <p className="mt-2 max-w-2xl text-muted-foreground">{c.subtitle}</p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatsCard
          icon={Telescope}
          label={c.trackedNeo}
          value={neoObjects.length}
          hint={c.trackedNeoHint}
        />

        <StatsCard
          icon={Radar}
          label={c.avgDistance}
          value={`${avgDistance.toFixed(1)} LD`}
          hint={c.avgDistanceHint}
        />

        <StatsCard
          icon={Gauge}
          label={c.avgVelocity}
          value={`${avgVelocity.toFixed(1)} km/s`}
          hint={c.avgVelocityHint}
        />

        <StatsCard
          icon={Activity}
          label={c.phaRatio}
          value={`${phaRatio}%`}
          highlight
          hint={c.phaRatioHint}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="min-w-0 border-white/10 bg-black/70 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{t.riskTrend}</h3>
          </div>

          <p className="mb-4 text-sm text-muted-foreground">
            {c.riskTrendHint}
          </p>

          <div className="h-[300px] min-h-[300px] w-full min-w-0">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={260}
              minHeight={260}
            >
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  opacity={0.35}
                />
                <XAxis
                  dataKey="date"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{
                    stroke: "rgba(148, 163, 184, 0.55)",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                  content={<RiskTooltip labelText={c.risk} />}
                />
                <Line
                  type="monotone"
                  dataKey="risk"
                  stroke="var(--chart-4)"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: "var(--background)" }}
                  activeDot={{
                    r: 6,
                    strokeWidth: 2,
                    fill: "var(--background)",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="min-w-0 border-white/10 bg-black/70 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="font-semibold text-foreground">
              {t.distanceBuckets}
            </h3>
          </div>

          <p className="mb-4 text-sm text-muted-foreground">
            {c.distanceGroupsHint}
          </p>

          <div className="h-[300px] min-h-[300px] w-full min-w-0">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={260}
              minHeight={260}
            >
              <BarChart data={distanceBuckets}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  opacity={0.35}
                />
                <XAxis
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                  content={<BucketTooltip labelText={c.objects} />}
                />
                <Bar dataKey="value" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>
    </div>
  );
}

function RiskTooltip({ active, payload, label, labelText }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-black/80 p-3 text-xs shadow-2xl backdrop-blur-xl">
      <p className="mb-2 text-sm font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground">
        {labelText}:{" "}
        <span className="font-semibold text-cyan-300">{payload[0].value}</span>
      </p>
    </div>
  );
}

function BucketTooltip({ active, payload, label, labelText }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-black/80 p-3 text-xs shadow-2xl backdrop-blur-xl">
      <p className="mb-2 text-sm font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground">
        {labelText}:{" "}
        <span className="font-semibold text-cyan-300">{payload[0].value}</span>
      </p>
    </div>
  );
}