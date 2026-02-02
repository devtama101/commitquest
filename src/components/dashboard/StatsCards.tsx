"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/StatCard";

interface Stats {
  currentStreak: number;
  longestStreak: number;
  totalCommits: number;
  todayCommits: number;
  achievementsCount: number;
  totalAchievements: number;
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const defaultStats: Stats = {
    currentStreak: 0,
    longestStreak: 0,
    totalCommits: 0,
    todayCommits: 0,
    achievementsCount: 0,
    totalAchievements: 0,
  };

  useEffect(() => {
    const fetchStats = async (retryCount = 0) => {
      try {
        const res = await fetch("/api/stats");
        if (!res.ok) {
          if (res.status === 401 && retryCount < 3) {
            setTimeout(() => fetchStats(retryCount + 1), 500 * (retryCount + 1));
            return;
          }
          setStats(defaultStats);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setStats(data.stats ?? defaultStats);
      } catch {
        setStats(defaultStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-cream border-4 border-dark rounded-2xl p-8 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      <StatCard icon="🎯" value={stats.todayCommits} label="Today's Commits" />
      <StatCard
        icon="🔥"
        value={stats.currentStreak}
        label="Day Streak"
        animate={stats.currentStreak > 0}
      />
      <StatCard icon="💻" value={stats.totalCommits.toLocaleString()} label="Total Commits" />
      <StatCard
        icon="🏅"
        value={`${stats.achievementsCount}/${stats.totalAchievements}`}
        label="Achievements"
      />
    </div>
  );
}
