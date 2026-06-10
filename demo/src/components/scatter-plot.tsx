import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { neoObjects } from "../data/neo-data";
import type { DashboardNeoItem } from "../types/dashboard";

interface ScatterPlotProps {
  objects?: DashboardNeoItem[];
}

type ScatterPoint = {
  id: string;
  name: string;
  date: string;
  distanceLD: number;
  diameterM: number;
  velocityKms: number;
  isPHA: boolean;
};

export function ScatterPlot({ objects }: ScatterPlotProps) {
  const source =
    objects && objects.length > 0
      ? objects.map(mapDashboardObject)
      : neoObjects.map((item) => ({
          id: item.id,
          name: item.name,
          date: item.date,
          distanceLD: item.distanceLD,
          diameterM: item.diameterM,
          velocityKms: item.velocityKms,
          isPHA: item.isPHA,
        }));

  const normal = source.filter((item) => !item.isPHA);
  const hazardous = source.filter((item) => item.isPHA);

  return (
    <div className="h-[280px] min-h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={260} minHeight={260}>
        <ScatterChart margin={{ top: 10, right: 16, bottom: 22, left: 0 }}>
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
            angle={-35}
            textAnchor="end"
            height={58}
            type="category"
            allowDuplicatedCategory={false}
          />

          <YAxis
            dataKey="distanceLD"
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />

          <ZAxis dataKey="diameterM" range={[40, 420]} />

          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;

              const item = payload[0].payload as ScatterPoint;

              return (
                <div className="rounded-xl border border-border bg-card/95 p-3 text-xs shadow-2xl backdrop-blur-xl">
                  <p className="mb-1 text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="text-muted-foreground">
                    Distance: {formatNumber(item.distanceLD, 2)} LD
                  </p>
                  <p className="text-muted-foreground">
                    Diameter: ~{formatNumber(item.diameterM, 0)} m
                  </p>
                  <p className="text-muted-foreground">
                    Velocity: {formatNumber(item.velocityKms, 1)} km/s
                  </p>
                </div>
              );
            }}
          />

          <Scatter data={normal} fill="var(--chart-2)" fillOpacity={0.75} />
          <Scatter data={hazardous} fill="var(--destructive)" fillOpacity={0.85} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

function mapDashboardObject(item: DashboardNeoItem): ScatterPoint {
  return {
    id: item.id,
    name: item.name,
    date: formatShortDate(item.closeApproachDate),
    distanceLD: item.missDistanceLunar,
    diameterM: item.diameterAverageMeters,
    velocityKms: item.velocityKilometersPerSecond,
    isPHA: item.isPotentiallyHazardous,
  };
}

function formatShortDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatNumber(value: number, maximumFractionDigits: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}