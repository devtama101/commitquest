"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CommitCalendar } from "@/components/dashboard/CommitCalendar";

interface ProfileData {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
  };
  stats: {
    totalCommits: number;
    currentStreak: number;
    longestStreak: number;
    level: number;
    totalXp: number;
    title: string;
  } | null;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: string;
    unlockedAt: Date;
  }>;
  recentCommits: Array<{
    sha: string;
    message: string;
    committedAt: Date;
    repoName: string;
  }>;
  calendarData: Array<{ date: string; count: number }>;
  privacy: {
    showActivity: boolean;
    showStats: boolean;
    showAchievements: boolean;
  };
}

interface PublicProfileProps {
  username: string;
}

export function PublicProfile({ username }: PublicProfileProps) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile/${username}`);
        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
          }
          return;
        }
        const profileData: ProfileData = await res.json();
        setData(profileData);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-cream border-4 border-dark rounded-2xl p-8 animate-pulse h-64"></div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <Card className="p-12 text-center">
        <div className="text-6xl mb-6">👻</div>
        <h3 className="font-display text-3xl text-dark mb-4">User Not Found</h3>
        <p className="font-body font-bold text-dark text-lg mb-8">
          The user &quot;{username}&quot; doesn&apos;t exist on CommitQuest.
        </p>
        <Button onClick={() => (window.location.href = "/")}>Go Home</Button>
      </Card>
    );
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-100 text-gray-700 border-gray-300";
      case "rare": return "bg-blue-100 text-blue-700 border-blue-300";
      case "epic": return "bg-purple-100 text-purple-700 border-purple-300";
      case "legendary": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {data.user.image ? (
            <img
              src={data.user.image}
              alt={data.user.name || "User"}
              className="w-24 h-24 rounded-full border-4 border-dark"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-orange border-4 border-dark flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
          )}

          <div className="flex-1">
            <h1 className="font-display text-4xl text-dark mb-2">{data.user.name}</h1>
            {data.user.bio && (
              <p className="font-body text-dark text-lg mb-3">{data.user.bio}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {data.user.location && (
                <span className="flex items-center gap-1">
                  📍 {data.user.location}
                </span>
              )}
              {data.user.website && (
                <a
                  href={data.user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-orange transition-colors"
                >
                  🔗 {new URL(data.user.website).hostname}
                </a>
              )}
            </div>
          </div>

          {data.stats && (
            <div className="text-center">
              <div className="font-display text-3xl text-orange">Lvl {data.stats.level}</div>
              <div className="font-body text-sm text-gray-500">{data.stats.title}</div>
            </div>
          )}
        </div>
      </Card>

      {/* Stats Grid */}
      {data.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="font-display text-2xl text-orange">{data.stats.totalCommits}</div>
            <div className="font-body text-xs text-gray-500 uppercase">Commits</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="font-display text-2xl text-red-500">{data.stats.currentStreak}🔥</div>
            <div className="font-body text-xs text-gray-500 uppercase">Current Streak</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="font-display text-2xl text-teal">{data.stats.longestStreak}</div>
            <div className="font-body text-xs text-gray-500 uppercase">Longest Streak</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="font-display text-2xl text-purple-500">{data.stats.totalXp.toLocaleString()}</div>
            <div className="font-body text-xs text-gray-500 uppercase">Total XP</div>
          </Card>
        </div>
      )}

      {/* Commit Calendar */}
      {data.privacy.showActivity && data.calendarData.length > 0 && (
        <Card className="p-6">
          <h3 className="font-display text-xl text-dark mb-4">📅 Commit Activity</h3>
          <PublicCalendar data={data.calendarData} />
        </Card>
      )}

      {/* Achievements */}
      {data.privacy.showAchievements && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl text-dark">🏆 Achievements</h3>
            <span className="font-body text-sm text-gray-500">{data.achievements.length} unlocked</span>
          </div>
          {data.achievements.length === 0 ? (
            <p className="font-body text-gray-500 text-center py-8">No achievements yet</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {data.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border-2 text-center ${getRarityColor(achievement.rarity)}`}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <div className="font-body text-sm font-bold truncate">{achievement.name}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Recent Commits */}
      {data.privacy.showActivity && (
        <Card className="p-6">
          <h3 className="font-display text-xl text-dark mb-4">📝 Recent Commits</h3>
          {data.recentCommits.length === 0 ? (
            <p className="font-body text-gray-500 text-center py-8">No commits yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentCommits.map((commit) => (
                <div key={commit.sha} className="flex items-start gap-3 p-3 bg-sand/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-orange mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-body text-sm text-dark truncate">{commit.message}</div>
                    <div className="font-body text-xs text-gray-500">
                      {commit.repoName} · {new Date(commit.committedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* CTA for visitors */}
      <Card className="p-8 text-center bg-gradient-to-r from-orange to-teal text-white">
        <h3 className="font-display text-2xl mb-2">Track Your Coding Journey!</h3>
        <p className="font-body mb-6">Join CommitQuest and unlock achievements for your commits.</p>
        <Button
          variant="secondary"
          onClick={() => (window.location.href = "/")}
        >
          Start Your Quest
        </Button>
      </Card>
    </div>
  );
}

// Simplified calendar component for public profiles
function PublicCalendar({ data }: { data: Array<{ date: string; count: number }> }) {
  const commitsByDate = new Map(data.map((d) => [d.date, d.count]));

  // Generate last 52 weeks
  const weeks: Array<Array<{ date: string; count: number } | null>> = [];
  const today = new Date();

  for (let week = 51; week >= 0; week--) {
    const weekData: Array<{ date: string; count: number } | null> = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (week * 7 + (6 - day)));
      const dateKey = date.toISOString().split("T")[0];
      weekData.push({
        date: dateKey,
        count: commitsByDate.get(dateKey) || 0,
      });
    }
    weeks.push(weekData);
  }

  const getIntensityColor = (count: number) => {
    if (count === 0) return "bg-sand";
    if (count < 3) return "bg-orange/30";
    if (count < 6) return "bg-orange/60";
    return "bg-orange";
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`w-3 h-3 rounded-sm ${day ? getIntensityColor(day.count) : "bg-transparent"}`}
                title={day ? `${day.date}: ${day.count} commits` : ""}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 mt-2 text-xs text-gray-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-sand"></div>
          <div className="w-3 h-3 rounded-sm bg-orange/30"></div>
          <div className="w-3 h-3 rounded-sm bg-orange/60"></div>
          <div className="w-3 h-3 rounded-sm bg-orange"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
