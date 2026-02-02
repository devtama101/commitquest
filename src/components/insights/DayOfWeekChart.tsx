"use client";

import { Card } from "@/components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface DayOfWeekChartProps {
  data: Array<{ day: string; commits: number }>;
}

const dayColors = [
  "#FF6B6B", "#FF8E53", "#FFA726", "#FFD54F", "#66BB6A", "#42A5F5", "#7E57C2"
];

export function DayOfWeekChart({ data }: DayOfWeekChartProps) {
  const maxCommits = Math.max(...data.map((d) => d.commits), 1);

  return (
    <Card className="p-6">
      <h3 className="font-display text-xl text-dark mb-4">📅 Commits by Day of Week</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#333", fontSize: 12 }}
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
            cursor={{ fill: "rgba(0,0,0,0.05)" }}
          />
          <Bar dataKey="commits" radius={[8, 8, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={dayColors[index % dayColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center">
        <span className="font-body text-sm text-gray-500">
          Most productive: <strong className="text-dark">{data.sort((a, b) => b.commits - a.commits)[0]?.day}</strong>
        </span>
      </div>
    </Card>
  );
}
