"use client";

import { useState, useEffect } from "react";
import { ClientNavbar } from "@/components/layout/ClientNavbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DayOfWeekChart } from "@/components/insights/DayOfWeekChart";
import { HourlyChart } from "@/components/insights/HourlyChart";
import { RepoPieChart } from "@/components/insights/RepoPieChart";
import { TimeStatsCard } from "@/components/insights/TimeStatsCard";
import { CommitWordCloud } from "@/components/insights/CommitWordCloud";

type Period = "week" | "month" | "year" | "all";

interface InsightsData {
  period: string;
  totalCommits: number;
  dayOfWeekData: Array<{ day: string; commits: number }>;
  hourlyData: Array<{ hour: number; commits: number }>;
  repoDistribution: Array<{
    name: string;
    commits: number;
    additions: number;
    deletions: number;
  }>;
  bestDay: string;
  bestHour: number;
  stats: {
    avgCommitsPerDay: number;
    longestGap: number;
    totalAdditions: number;
    totalDeletions: number;
    daysSpan: number;
  };
  topWords: Array<{ word: string; count: number }>;
}

export default function InsightsPage() {
  const [period, setPeriod] = useState<Period>("all");
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async (selectedPeriod: Period) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/insights?period=${selectedPeriod}`);
      const insightsData: InsightsData = await res.json();
      setData(insightsData);
    } catch (error) {
      console.error("Failed to fetch insights:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights(period);
  }, [period]);

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <ClientNavbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="font-display text-4xl md:text-5xl text-dark mb-2">
                Commit Insights
              </h1>
              <p className="font-body font-bold text-dark">
                Understand your coding patterns and productivity
              </p>
            </div>

            {/* Period Selector */}
            <div className="flex gap-2">
              {(["week", "month", "year", "all"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-full font-body font-bold border-2 border-dark transition-all ${
                    period === p
                      ? "bg-orange text-white"
                      : "bg-white text-dark hover:bg-sand"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-cream border-4 border-dark rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-sand rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-sand rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : data && data.totalCommits > 0 ? (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="p-4 text-center">
                  <div className="font-body text-xs text-gray-500 uppercase">Total Commits</div>
                  <div className="font-display text-2xl text-orange">{data.totalCommits}</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="font-body text-xs text-gray-500 uppercase">Avg/Day</div>
                  <div className="font-display text-2xl text-teal">{data.stats.avgCommitsPerDay}</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="font-body text-xs text-gray-500 uppercase">Best Day</div>
                  <div className="font-display text-2xl text-dark">{data.bestDay}</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="font-body text-xs text-gray-500 uppercase">Best Hour</div>
                  <div className="font-display text-2xl text-dark">{data.bestHour}:00</div>
                </Card>
              </div>

              {/* Day of Week Chart */}
              <div className="mb-8">
                <DayOfWeekChart data={data.dayOfWeekData} />
              </div>

              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Hourly Chart */}
                <HourlyChart data={data.hourlyData} bestHour={data.bestHour} />

                {/* Repo Distribution */}
                <RepoPieChart data={data.repoDistribution} />
              </div>

              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Time Stats */}
                <TimeStatsCard
                  avgCommitsPerDay={data.stats.avgCommitsPerDay}
                  longestGap={data.stats.longestGap}
                  totalAdditions={data.stats.totalAdditions}
                  totalDeletions={data.stats.totalDeletions}
                  daysSpan={data.stats.daysSpan}
                />

                {/* Word Cloud */}
                <CommitWordCloud words={data.topWords} />
              </div>
            </>
          ) : (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-6">📊</div>
              <h3 className="font-display text-3xl text-dark mb-4">No Insights Yet</h3>
              <p className="font-body font-bold text-dark text-lg mb-8">
                Start committing to see your coding patterns!
              </p>
              <Button onClick={() => window.location.href = "/repos"}>Track Repositories</Button>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
