"use client";

import { Card } from "@/components/ui/Card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface HourlyChartProps {
  data: Array<{ hour: number; commits: number }>;
  bestHour: number;
}

export function HourlyChart({ data, bestHour }: HourlyChartProps) {
  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  return (
    <Card className="p-6">
      <h3 className="font-display text-xl text-dark mb-4">🕐 Commits by Hour</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <XAxis
            dataKey="hour"
            tickFormatter={formatHour}
            interval={2}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#333", fontSize: 10 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#666", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFF8E7",
              border: "2px solid #333",
              borderRadius: "8px",
            }}
            labelFormatter={(label) => formatHour(label as number)}
            cursor={{ fill: "rgba(0,0,0,0.05)" }}
          />
          <Area
            type="monotone"
            dataKey="commits"
            stroke="#F97316"
            fill="#F97316"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center">
        <span className="font-body text-sm text-gray-500">
          Peak productivity: <strong className="text-dark">{formatHour(bestHour)}</strong>
        </span>
      </div>
    </Card>
  );
}
