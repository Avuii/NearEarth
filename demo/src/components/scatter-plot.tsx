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

export function ScatterPlot() {
  const normal = neoObjects.filter((item) => !item.isPHA);
  const hazardous = neoObjects.filter((item) => item.isPHA);

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

              const item = payload[0].payload;

              return (
                <div className="rounded-xl border border-border bg-card/95 p-3 text-xs shadow-2xl backdrop-blur-xl">
                  <p className="mb-1 text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="text-muted-foreground">
                    Distance: {item.distanceLD} LD
                  </p>
                  <p className="text-muted-foreground">
                    Diameter: ~{item.diameterM} m
                  </p>
                  <p className="text-muted-foreground">
                    Velocity: {item.velocityKms} km/s
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