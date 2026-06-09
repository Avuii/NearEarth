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
import { Activity, Brain, Gauge, LucideIcon, Radar, Telescope } from "lucide-react";
import { chartData, distanceBuckets, neoObjects } from "../data/neo-data";
import { Language, translations } from "../lib/i18n";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

interface InsightsPageProps {
  lang: Language;
}

const copy = {
  en: {
    subtitle: "Compact analytical view of NEO traffic, distance distribution and relative risk indicators.",
    trackedNeo: "Tracked NEO",
    avgDistance: "Average distance",
    avgVelocity: "Average velocity",
    phaRatio: "PHA ratio",
    trafficPeak: "Traffic peak",
    trafficPeakText: "Highest number of approaches appears around Jun 13-16 in the current mocked dataset.",
    riskCluster: "Risk cluster",
    riskClusterText: "PHA objects are not the closest ones only. Diameter and velocity should stay visible next to distance.",
    mvpDirection: "MVP direction",
    mvpDirectionText: "Next step should be connecting these cards to NASA NeoWs and storing watchlist rules in backend.",
    risk: "risk",
    objects: "objects",
  },
  pl: {
    subtitle: "Kompaktowy widok analityczny ruchu NEO, rozkładu odległości i wskaźników ryzyka.",
    trackedNeo: "Śledzone NEO",
    avgDistance: "Średnia odległość",
    avgVelocity: "Średnia prędkość",
    phaRatio: "Udział PHA",
    trafficPeak: "Szczyt przelotów",
    trafficPeakText: "Największa liczba zbliżeń pojawia się około 13-16 czerwca w aktualnym zestawie mocków.",
    riskCluster: "Klaster ryzyka",
    riskClusterText: "Obiekty PHA nie zawsze są tylko najbliższe. Obok odległości warto pokazywać średnicę i prędkość.",
    mvpDirection: "Kierunek MVP",
    mvpDirectionText: "Następny krok to podłączenie kart do NASA NeoWs i zapis reguł obserwacji w backendzie.",
    risk: "ryzyko",
    objects: "obiekty",
  },
};

export function InsightsPage({ lang }: InsightsPageProps) {
  const t = translations[lang];
  const c = copy[lang];
  const avgDistance = neoObjects.reduce((sum, item) => sum + item.distanceLD, 0) / neoObjects.length;
  const avgVelocity = neoObjects.reduce((sum, item) => sum + item.velocityKms, 0) / neoObjects.length;

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
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {c.subtitle}
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric icon={Telescope} label={c.trackedNeo} value={neoObjects.length.toString()} />
        <Metric icon={Radar} label={c.avgDistance} value={`${avgDistance.toFixed(1)} LD`} />
        <Metric icon={Gauge} label={c.avgVelocity} value={`${avgVelocity.toFixed(1)} km/s`} />
        <Metric icon={Activity} label={c.phaRatio} value={`${Math.round((neoObjects.filter((item) => item.isPHA).length / neoObjects.length) * 100)}%`} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="min-w-0 border-white/10 bg-black/70 p-6 backdrop-blur-xl">
          <h3 className="mb-4 font-semibold text-foreground">{t.riskTrend}</h3>
          <div className="h-[300px] min-h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={260} minHeight={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.35} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ stroke: "rgba(148, 163, 184, 0.55)", strokeWidth: 1, strokeDasharray: "4 4" }}
                  content={<RiskTooltip labelText={c.risk} />}
                />
                <Line
                  type="monotone"
                  dataKey="risk"
                  stroke="var(--chart-4)"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: "var(--background)" }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: "var(--background)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="min-w-0 border-white/10 bg-black/70 p-6 backdrop-blur-xl">
          <h3 className="mb-4 font-semibold text-foreground">{t.distanceBuckets}</h3>
          <div className="h-[300px] min-h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={260} minHeight={260}>
              <BarChart data={distanceBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.35} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
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

      <section>
        <Card className="border-white/10 bg-black/70 p-6 backdrop-blur-xl">
          <h3 className="mb-5 text-lg font-semibold text-foreground">
            {t.observations}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Observation title={c.trafficPeak} text={c.trafficPeakText} />
            <Observation title={c.riskCluster} text={c.riskClusterText} />
            <Observation title={c.mvpDirection} text={c.mvpDirectionText} />
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
        {labelText}: <span className="font-semibold text-cyan-300">{payload[0].value}</span>
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
        {labelText}: <span className="font-semibold text-cyan-300">{payload[0].value}</span>
      </p>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <Card className="border-white/10 bg-black/70 p-5 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/25">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </Card>
  );
}

function Observation({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
      <p className="mb-2 font-medium text-foreground">{title}</p>
      <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
