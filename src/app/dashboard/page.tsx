"use client";

import { ClientNavbar } from "@/components/layout/ClientNavbar";
import { Footer } from "@/components/layout/Footer";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { LevelProgress } from "@/components/dashboard/LevelProgress";
import { CodeStatsCard } from "@/components/dashboard/CodeStatsCard";
import { CommitCalendar } from "@/components/dashboard/CommitCalendar";
import { RecentCommits } from "@/components/dashboard/RecentCommits";
import { useEffect } from "react";

export default function DashboardPage() {
  useEffect(() => {
    // Poll for new achievements every 30 seconds
    const checkAchievements = async () => {
      try {
        const response = await fetch("/api/achievements/check");
        const data = await response.json();
        if (data.newlyUnlocked && data.newlyUnlocked.length > 0) {
          data.newlyUnlocked.forEach((achievement: any) => {
            window.dispatchEvent(new CustomEvent("achievement-unlocked", {
              detail: { achievement },
            }));
          });
        }
      } catch (error) {
        // Ignore errors
      }
    };

    checkAchievements();
    const interval = setInterval(checkAchievements, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <ClientNavbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-5xl md:text-6xl text-dark mb-4">
              Your Quest Stats
            </h1>
            <p className="font-body font-bold text-dark text-lg">
              Track your coding journey and unlock achievements!
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-12">
            <StatsCards />
          </div>

          {/* Level Progress */}
          <div className="mb-12">
            <LevelProgress />
          </div>

          {/* Code Stats */}
          <div className="mb-12">
            <CodeStatsCard />
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Commit Calendar */}
            <div className="lg:col-span-2">
              <CommitCalendar />
            </div>

            {/* Recent Commits */}
            <div className="lg:col-span-2">
              <RecentCommits />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
