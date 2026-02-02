"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

interface XpData {
  level: number;
  xp: number;
  totalXp: number;
  title: string;
  xpToNextLevel: number;
}

export function LevelProgress() {
  const [xpData, setXpData] = useState<XpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const defaultXpData: XpData = {
    level: 1,
    xp: 0,
    totalXp: 0,
    title: "Code Novice",
    xpToNextLevel: 100,
  };

  const fetchXp = async (retryCount = 0) => {
    try {
      const res = await fetch("/api/xp");
      if (!res.ok) {
        if (res.status === 401 && retryCount < 3) {
          // Session not ready yet, retry after a delay
          setTimeout(() => fetchXp(retryCount + 1), 500 * (retryCount + 1));
          return;
        }
        console.error("XP API returned error:", res.status);
        setXpData(defaultXpData);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setXpData(data);
    } catch (error) {
      console.error("Failed to fetch XP:", error);
      setXpData(defaultXpData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchXp();

    // Listen for level-up events
    const handleLevelUp = (e: CustomEvent) => {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    };

    window.addEventListener("level-up", handleLevelUp as EventListener);
    return () => {
      window.removeEventListener("level-up", handleLevelUp as EventListener);
    };
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-sand rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-sand rounded w-full"></div>
        </div>
      </Card>
    );
  }

  if (!xpData) return null;

  const progressPercent = xpData.level < 100
    ? Math.min(100, Math.max(0, ((xpData.xp) / (xpData.xp + xpData.xpToNextLevel || 1)) * 100))
    : 100;

  return (
    <Card className="p-6 relative overflow-hidden">
      {showLevelUp && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 z-10 animate-pulse">
          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <div className="font-display text-2xl text-white font-bold">LEVEL UP!</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-3xl text-orange">Lvl {xpData.level}</span>
            <span className="px-2 py-1 bg-orange/20 text-orange text-xs font-bold rounded-full">
              {xpData.title}
            </span>
          </div>
          <div className="font-body text-sm text-gray-500">
            {(xpData.totalXp ?? 0).toLocaleString()} Total XP
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-xl text-teal">+{xpData.xp ?? 0} XP</div>
          {(xpData.xpToNextLevel ?? 0) > 0 && (
            <div className="font-body text-xs text-gray-500">
              {(xpData.xpToNextLevel ?? 0).toLocaleString()} to next
            </div>
          )}
        </div>
      </div>

      <div className="relative h-4 bg-sand rounded-full overflow-hidden border-2 border-dark">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange to-teal transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </Card>
  );
}
