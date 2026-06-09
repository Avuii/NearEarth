import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartData } from "../data/neo-data";

export function FlybyChart() {
  return (
    <div className="h-[280px] min-h-[280px] w-full min-w-0">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={260}
        minHeight={260}
      >
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="countGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--chart-1)"
                stopOpacity={0.35}
              />
              <stop
                offset="95%"
                stopColor="var(--chart-1)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

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
            content={<CustomTooltip />}
          />

          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#countGradient)"
            activeDot={{
              r: 5,
              stroke: "var(--chart-1)",
              strokeWidth: 2,
              fill: "var(--background)",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border bg-card/95 p-3 text-xs shadow-2xl backdrop-blur-xl">
      <p className="mb-1 text-sm font-medium text-foreground">
        {label}
      </p>

      <p className="text-muted-foreground">
        count:{" "}
        <span className="font-semibold text-cyan-300">
          {payload[0].value}
        </span>
      </p>
    </div>
  );
}