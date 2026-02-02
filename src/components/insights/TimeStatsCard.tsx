"use client";

import { Card } from "@/components/ui/Card";

interface TimeStatsCardProps {
  avgCommitsPerDay: number;
  longestGap: number;
  totalAdditions: number;
  totalDeletions: number;
  daysSpan: number;
}

export function TimeStatsCard({
  avgCommitsPerDay,
  longestGap,
  totalAdditions,
  totalDeletions,
  daysSpan,
}: TimeStatsCardProps) {
  const formatGap = (days: number) => {
    if (days === 0) return "Today";
    if (days === 1) return "1 day";
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  };

  return (
    <Card className="p-6">
      <h3 className="font-display text-xl text-dark mb-4">⏱️ Time Stats</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-sand/50 rounded-lg">
          <span className="font-body text-dark">Avg Commits/Day</span>
          <span className="font-display text-lg text-teal">{avgCommitsPerDay}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-sand/50 rounded-lg">
          <span className="font-body text-dark">Longest Gap</span>
          <span className="font-display text-lg text-orange">{formatGap(longestGap)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-sand/50 rounded-lg">
          <span className="font-body text-dark">Active Period</span>
          <span className="font-display text-lg text-dark">{daysSpan} days</span>
        </div>
        <div className="border-t-2 border-dark/20 pt-4 mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-body text-dark">Lines Added</span>
            <span className="font-display text-lg text-green-600">+{totalAdditions.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-body text-dark">Lines Deleted</span>
            <span className="font-display text-lg text-red-600">-{totalDeletions.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
