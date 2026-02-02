"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

interface CodeStats {
  totalLinesAdded: number;
  totalLinesDeleted: number;
  netLinesAdded: number;
  avgLinesPerCommit: number;
  biggestCommit: {
    sha: string;
    message: string;
    additions: number;
    deletions: number;
  } | null;
  linesByRepo: Array<{
    repoName: string;
    added: number;
    deleted: number;
  }>;
}

interface StatsResponse {
  stats: any;
  codeStats: CodeStats;
}

export function CodeStatsCard() {
  const [codeStats, setCodeStats] = useState<CodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchCodeStats = async (retryCount = 0) => {
      try {
        const res = await fetch("/api/stats");
        if (!res.ok) {
          if (res.status === 401 && retryCount < 3) {
            setTimeout(() => fetchCodeStats(retryCount + 1), 500 * (retryCount + 1));
            return;
          }
          setLoading(false);
          return;
        }
        const data: StatsResponse = await res.json();
        setCodeStats(data.codeStats);
      } catch (error) {
        console.error("Failed to fetch code stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCodeStats();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-sand rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-sand rounded w-full"></div>
        </div>
      </Card>
    );
  }

  if (!codeStats) return null;

  const { totalLinesAdded, totalLinesDeleted, netLinesAdded, avgLinesPerCommit, biggestCommit, linesByRepo } = codeStats;

  // Find max value for bar chart scaling
  const maxValue = Math.max(...linesByRepo.map((r) => r.added + r.deleted), 1);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl text-dark">💻 Code Stats</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-dark hover:text-orange text-2xl"
        >
          {expanded ? "−" : "+"}
        </button>
      </div>

      <div className="space-y-3">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-body text-xs text-gray-500 uppercase">Added</div>
            <div className="font-display text-2xl text-green-600">{totalLinesAdded.toLocaleString()}</div>
          </div>
          <div>
            <div className="font-body text-xs text-gray-500 uppercase">Deleted</div>
            <div className="font-display text-2xl text-red-600">{totalLinesDeleted.toLocaleString()}</div>
          </div>
        </div>

        {/* Net lines */}
        <div className={`py-2 px-4 rounded-lg text-center ${netLinesAdded >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          <span className="font-bold">{netLinesAdded >= 0 ? "+" : ""}{netLinesAdded.toLocaleString()} net</span>
        </div>

        {expanded && (
          <div className="space-y-4 mt-4 pt-4 border-t-2 border-dark">
            {/* Average per commit */}
            <div>
              <div className="font-body text-xs text-gray-500">Avg per commit</div>
              <div className="font-display text-lg text-dark">{avgLinesPerCommit.toLocaleString()} lines</div>
            </div>

            {/* Biggest commit */}
            {biggestCommit && (
              <div>
                <div className="font-body text-xs text-gray-500 mb-1">Biggest commit</div>
                <div className="font-body text-sm text-dark truncate">
                  {biggestCommit.message}
                </div>
                <div className="font-body text-xs text-gray-500">
                  +{biggestCommit.additions.toLocaleString()} / -{biggestCommit.deletions.toLocaleString()}
                </div>
              </div>
            )}

            {/* By repo */}
            <div>
              <div className="font-body text-xs text-gray-500 mb-2">By Repository</div>
              <div className="space-y-2">
                {linesByRepo.map((repo) => {
                  const total = repo.added + repo.deleted;
                  const width = (total / maxValue) * 100;
                  return (
                    <div key={repo.repoName}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-body text-dark truncate flex-1">{repo.repoName}</span>
                        <span className="font-body text-gray-500 text-xs">{total.toLocaleString()} lines</span>
                      </div>
                      <div className="relative h-3 bg-sand rounded-full overflow-hidden border border-dark/50">
                        <div
                          className="absolute left-0 top-0 h-full flex"
                          style={{ width: `${width}%` }}
                        >
                          <div className="h-full bg-green-500" style={{ width: `${(repo.added / total) * 100}%` }}></div>
                          <div className="h-full bg-red-500" style={{ width: `${(repo.deleted / total) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
