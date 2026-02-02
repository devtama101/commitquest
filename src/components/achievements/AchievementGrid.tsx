"use client";

import { useEffect, useState } from "react";
import { AchievementCard } from "@/components/ui/AchievementCard";

interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  threshold: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  isUnlocked: boolean;
  unlockedAt: string | null;
}

interface Stats {
  currentStreak: number;
  totalCommits: number;
}

export function AchievementGrid() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<Stats>({ currentStreak: 0, totalCommits: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

  useEffect(() => {
    fetch("/api/achievements")
      .then((res) => res.json())
      .then((data) => {
        setAchievements(data.achievements);
        setStats(data.stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredAchievements = achievements.filter((a) => {
    if (filter === "all") return true;
    if (filter === "unlocked") return a.isUnlocked;
    if (filter === "locked") return !a.isUnlocked;
    return true;
  });

  const categories = Array.from(new Set(achievements.map((a) => a.category)));

  const getProgress = (achievement: Achievement) => {
    if (achievement.isUnlocked) return achievement.threshold;

    switch (achievement.category) {
      case "streak":
        return Math.min(stats.currentStreak, achievement.threshold);
      case "volume":
        return Math.min(stats.totalCommits, achievement.threshold);
      default:
        return achievement.isUnlocked ? achievement.threshold : 0;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="font-display text-3xl text-dark">Achievements</h2>
          <p className="font-body font-bold text-gray-600 mt-2">
            {achievements.filter((a) => a.isUnlocked).length} / {achievements.length} unlocked
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3">
          {(["all", "unlocked", "locked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-body font-bold px-4 py-2 border-3 border-dark rounded-full transition-all ${
                filter === f
                  ? "bg-orange text-white shadow-[4px_4px_0_var(--color-dark)]"
                  : "bg-white text-dark hover:bg-cream"
              }`}
            >
              {f === "all" ? "All" : f === "unlocked" ? "Unlocked" : "Locked"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-cream border-4 border-dark rounded-2xl p-6 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* By Category */}
          {categories.map((category) => {
            const categoryAchievements = filteredAchievements.filter(
              (a) => a.category === category
            );

            if (categoryAchievements.length === 0) return null;

            return (
              <div key={category} className="mb-12">
                <h3 className="font-display text-2xl text-dark mb-6 capitalize flex items-center gap-3">
                  <span className="bg-sand px-4 py-2 rounded-full border-3 border-dark">
                    {category}
                  </span>
                  <span className="font-body font-bold text-gray-600 text-lg capitalize">
                    {categoryAchievements.filter((a) => a.isUnlocked).length} / {categoryAchievements.length}
                  </span>
                </h3>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      icon={achievement.icon}
                      name={achievement.name}
                      description={achievement.description}
                      rarity={achievement.rarity}
                      isUnlocked={achievement.isUnlocked}
                      progress={getProgress(achievement)}
                      maxProgress={achievement.threshold}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {filteredAchievements.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔒</div>
              <p className="font-body font-bold text-dark text-lg">
                No achievements match this filter.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
