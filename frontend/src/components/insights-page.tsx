import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Brain, Gauge, LucideIcon, Radar, Telescope } from "lucide-react";
import { chartData, distanceBuckets, neoObjects } from "../data/neo-data";
import { Language, translations } from "../lib/i18n";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

interface InsightsPageProps {
  lang: Language;
}

export function InsightsPage({ lang }: InsightsPageProps) {
  const t = translations[lang];
  const avgDistance = neoObjects.reduce((sum, item) => sum + item.distanceLD, 0) / neoObjects.length;
  const avgVelocity = neoObjects.reduce((sum, item) => sum + item.velocityKms, 0) / neoObjects.length;

  return (
    <div className="space-y-8">
      <section>
        <Badge variant="secondary" className="mb-3">
          <Brain className="h-3.5 w-3.5" />
          {t.insightsTitle}
        </Badge>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">{t.insights}</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">Compact analytical view of NEO traffic, distance distribution and relative risk indicators.</p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric icon={Telescope} label="Tracked NEO" value={neoObjects.length.toString()} />
        <Metric icon={Radar} label="Average distance" value={`${avgDistance.toFixed(1)} LD`} />
        <Metric icon={Gauge} label="Average velocity" value={`${avgVelocity.toFixed(1)} km/s`} />
        <Metric icon={Activity} label="PHA ratio" value={`${Math.round((neoObjects.filter((item) => item.isPHA).length / neoObjects.length) * 100)}%`} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-6 backdrop-blur-xl">
          <h3 className="mb-4 font-semibold text-foreground">{t.riskTrend}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.35} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "rgba(15, 23, 42, 0.92)", border: "1px solid var(--border)", borderRadius: "12px", color: "white" }} />
                <Line type="monotone" dataKey="risk" stroke="var(--chart-4)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-xl">
          <h3 className="mb-4 font-semibold text-foreground">{t.distanceBuckets}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distanceBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.35} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "rgba(15, 23, 42, 0.92)", border: "1px solid var(--border)", borderRadius: "12px", color: "white" }} />
                <Bar dataKey="value" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section>
        <Card className="p-6 backdrop-blur-xl">
          <h3 className="mb-5 text-lg font-semibold text-foreground">{t.observations}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Observation title="Traffic peak" text="Highest number of approaches appears around Jun 13-16 in the current mocked dataset." />
            <Observation title="Risk cluster" text="PHA objects are not the closest ones only. Diameter and velocity should stay visible next to distance." />
            <Observation title="MVP direction" text="Next step should be connecting these cards to NASA NeoWs and storing watchlist rules in backend." />
          </div>
        </Card>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <Card className="p-5 backdrop-blur-xl">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/70 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </Card>
  );
}

function Observation({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-4">
      <p className="mb-2 font-medium text-foreground">{title}</p>
      <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
