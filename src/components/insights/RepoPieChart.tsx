"use client";

import { Card } from "@/components/ui/Card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface RepoPieChartProps {
  data: Array<{
    name: string;
    commits: number;
    additions: number;
    deletions: number;
  }>;
}

const COLORS = [
  "#F97316", "#14B8A6", "#EF4444", "#8B5CF6", "#EC4899",
  "#F59E0B", "#3B82F6", "#10B981", "#6366F1", "#84CC16"
];

export function RepoPieChart({ data }: RepoPieChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-display text-xl text-dark mb-4">📁 Repository Distribution</h3>
        <div className="text-center py-8 text-gray-500">
          No repository data available
        </div>
      </Card>
    );
  }

  // Format data for pie chart
  const chartData = data.map((repo) => ({
    name: repo.name.length > 15 ? repo.name.substring(0, 15) + "..." : repo.name,
    value: repo.commits,
    fullName: repo.name,
  }));

  return (
    <Card className="p-6">
      <h3 className="font-display text-xl text-dark mb-4">📁 Repository Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={false}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#333" strokeWidth={1} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFF8E7",
              border: "2px solid #333",
              borderRadius: "8px",
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value} commits`,
              props.payload.fullName || name
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
        {data.slice(0, 5).map((repo, index) => (
          <div key={repo.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border border-dark"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-body text-dark truncate max-w-[150px]">{repo.name}</span>
            </div>
            <span className="font-body text-gray-500">
              {repo.commits} commits · +{repo.additions.toLocaleString()} / -{repo.deletions.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
