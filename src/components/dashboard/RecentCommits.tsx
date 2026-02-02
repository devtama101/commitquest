"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface Commit {
  id: string;
  message: string;
  committedAt: string;
  repo: {
    repoName: string;
    provider: string;
    repoUrl: string;
  };
}

export function RecentCommits() {
  const [commits, setCommits] = useState<Commit[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommits = async (retryCount = 0) => {
      try {
        const res = await fetch("/api/commits?limit=10");
        if (!res.ok) {
          if (res.status === 401 && retryCount < 3) {
            setTimeout(() => fetchCommits(retryCount + 1), 500 * (retryCount + 1));
            return;
          }
          setCommits([]);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setCommits(data.commits ?? []);
      } catch {
        setCommits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, []);

  const getProviderIcon = (provider: string) => {
    return provider === "github" ? "🐙" : "🦊";
  };

  if (loading) {
    return (
      <div className="bg-cream border-4 border-dark rounded-2xl p-6 shadow-[6px_6px_0_var(--color-dark)]">
        <h3 className="font-display text-2xl text-dark mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream border-4 border-dark rounded-2xl p-6 shadow-[6px_6px_0_var(--color-dark)]">
      <h3 className="font-display text-2xl text-dark mb-6">Recent Activity</h3>

      {!commits || commits.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <p className="font-body font-bold text-dark text-lg">
            No commits yet. Start tracking repos to see your activity!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {commits.map((commit) => (
            <div
              key={commit.id}
              className="flex items-start gap-4 p-4 bg-sand/30 rounded-xl border-2 border-dark hover:bg-sand/50 transition-colors"
            >
              <div className="text-2xl">{getProviderIcon(commit.repo.provider)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-body font-bold text-dark truncate">
                  {commit.message}
                </div>
                <div className="font-body text-sm text-gray-600 flex items-center gap-2">
                  <span>{commit.repo.repoName}</span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(commit.committedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
              <a
                href={commit.repo.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal hover:text-teal-dark font-bold text-sm"
              >
                View →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
