"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmModal, AlertDialog } from "@/components/ui/ConfirmModal";

const TIMEZONE = "Asia/Jakarta";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const remainingMonths = diffDays % 30;
  const diffYears = Math.floor(diffDays / 365);
  const remainingMonthsInYear = Math.floor((diffDays % 365) / 30);

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 30) {
    return `${diffDays}d ago`;
  } else if (diffDays < 365) {
    return `${diffMonths}mo ago`;
  } else {
    if (remainingMonthsInYear > 0) {
      return `${diffYears}y ${remainingMonthsInYear}mo ago`;
    }
    return `${diffYears}y ago`;
  }
}

interface TrackedRepo {
  id: string;
  repoName: string;
  repoUrl: string;
  provider: string;
  commitCount: number;
  createdAt: string;
  lastCommitAt: string | null;
  accountUsername?: string;
  accountAvatarUrl?: string;
}

export function RepoList() {
  const [repos, setRepos] = useState<TrackedRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | "all" | null>(null);
  const [syncStatus, setSyncStatus] = useState<Record<string, string>>({});
  const [needsReauth, setNeedsReauth] = useState<string[]>([]);

  // Modal states
  const [untrackModal, setUntrackModal] = useState<{ isOpen: boolean; repoId: string; repoName: string }>({
    isOpen: false,
    repoId: "",
    repoName: "",
  });
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const fetchRepos = async () => {
    try {
      const res = await fetch("/api/repos/tracked");
      const data = await res.json();
      setRepos(data.repos || []);
      setNeedsReauth(data.needsReauth || []);
    } catch (error) {
      console.error("Failed to fetch repos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const handleSync = async (repoId?: string) => {
    const syncTarget = repoId || "all";
    setSyncing(syncTarget);

    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(repoId ? { repoId } : {}),
      });
      const data = await res.json();

      if (data.success) {
        if (repoId) {
          setSyncStatus((prev) => ({ ...prev, [repoId]: `Synced ${data.syncedCount} commits` }));
        }
        fetchRepos();

        // Show achievement toasts
        if (data.newlyUnlocked && data.newlyUnlocked.length > 0) {
          data.newlyUnlocked.forEach((achievement: any) => {
            window.dispatchEvent(new CustomEvent("achievement-unlocked", {
              detail: { achievement },
            }));
          });
        }

        // Show level up celebration
        if (data.leveledUp) {
          window.dispatchEvent(new CustomEvent("level-up", {
            detail: { newLevel: data.newLevel, xpEarned: data.xpEarned },
          }));
        }

        // Clear status after 3 seconds
        setTimeout(() => {
          if (repoId) {
            setSyncStatus((prev) => {
              const updated = { ...prev };
              delete updated[repoId];
              return updated;
            });
          }
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to sync:", error);
      if (repoId) {
        setSyncStatus((prev) => ({ ...prev, [repoId]: "Sync failed" }));
      }
    } finally {
      setSyncing(null);
    }
  };

  const handleUntrack = async (repoId: string, repoName: string) => {
    setUntrackModal({ isOpen: true, repoId, repoName });
  };

  const confirmUntrack = async () => {
    const { repoId } = untrackModal;
    try {
      await fetch("/api/repos/untrack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId }),
      });
      fetchRepos();
    } catch (error) {
      console.error("Failed to untrack repo:", error);
      setAlertModal({
        isOpen: true,
        title: "Failed to Untrack",
        message: "Could not untrack repository. Please try again.",
      });
    } finally {
      setUntrackModal({ isOpen: false, repoId: "", repoName: "" });
    }
  };

  const getProviderIcon = (provider: string) => {
    return provider === "github" ? "🐙" : "🦊";
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-cream border-4 border-dark rounded-2xl p-6 animate-pulse" />
        ))}
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="text-6xl mb-6">🚀</div>
        <h3 className="font-display text-3xl text-dark mb-4">No Repos Yet</h3>
        <p className="font-body font-bold text-dark text-lg mb-8">
          Start tracking your repositories to unlock achievements!
        </p>
        <AddRepoModal onRepoAdded={fetchRepos} needsReauth={needsReauth} />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-3xl text-dark">Tracked Repositories</h2>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => handleSync()}
            disabled={syncing === "all"}
          >
            {syncing === "all" ? "Syncing..." : "🔄 Sync All"}
          </Button>
          <AddRepoModal onRepoAdded={fetchRepos} needsReauth={needsReauth} />
        </div>
      </div>

      {/* Re-authentication warning */}
      {needsReauth.length > 0 && (
        <Card className="p-4 bg-orange/10 border-4 border-orange">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h4 className="font-display text-lg text-dark mb-1">Account Re-authentication Required</h4>
              <p className="font-body text-sm text-dark mb-3">
                Your GitLab account access has expired. Please reconnect to continue tracking your repositories.
              </p>
              <Button
                size="sm"
                onClick={() => (window.location.href = `/api/auth/signin?provider=gitlab&callbackUrl=${encodeURIComponent(window.location.pathname)}`)}
                className="bg-orange hover:bg-orange-dark text-white"
              >
                Reconnect GitLab Account
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.map((repo) => (
          <Card key={repo.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {repo.accountAvatarUrl ? (
                  <img
                    src={repo.accountAvatarUrl}
                    alt={`${repo.accountUsername} avatar`}
                    className="w-10 h-10 rounded-full border-2 border-dark"
                    title={`${repo.provider === "github" ? "GitHub" : "GitLab"} account: ${repo.accountUsername}`}
                  />
                ) : (
                  <span className="text-3xl" title={`${repo.provider === "github" ? "GitHub" : "GitLab"}`}>
                    {getProviderIcon(repo.provider)}
                  </span>
                )}
                <div>
                  <h3 className="font-display text-xl text-dark">{repo.repoName}</h3>
                  <div className="flex items-center gap-2">
                    <a
                      href={repo.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-sm text-teal hover:text-teal-dark"
                    >
                      View on {repo.provider === "github" ? "GitHub" : "GitLab"}
                    </a>
                    {repo.accountUsername && (
                      <span className="font-body text-xs text-gray-500">
                        via {repo.accountUsername}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="font-body font-bold text-dark">
                <span className="text-2xl">{repo.commitCount}</span> commits
              </div>
              {repo.lastCommitAt && (
                <div className="font-body text-xs text-gray-500">
                  {formatDate(repo.lastCommitAt)}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => handleSync(repo.id)}
                disabled={syncing === repo.id || syncing === "all"}
              >
                {syncing === repo.id ? "Syncing..." : "🔄 Sync"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUntrack(repo.id, repo.repoName)}
              >
                Untrack
              </Button>
            </div>

            {syncStatus[repo.id] && (
              <div className="mt-3 text-center font-body text-sm font-bold text-teal">
                {syncStatus[repo.id]}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Untrack Confirmation Modal */}
      <ConfirmModal
        isOpen={untrackModal.isOpen}
        title="Stop Tracking Repository?"
        message={`Are you sure you want to stop tracking "${untrackModal.repoName}"? This won't delete any of your commit data, but the repository will no longer appear in your tracked list.`}
        confirmText="Stop Tracking"
        cancelText="Cancel"
        onConfirm={confirmUntrack}
        onCancel={() => setUntrackModal({ isOpen: false, repoId: "", repoName: "" })}
        variant="danger"
      />

      {/* Alert Modal */}
      <AlertDialog
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        onOk={() => setAlertModal({ isOpen: false, title: "", message: "" })}
      />
    </div>
  );
}

interface AvailableRepo {
  id: string;
  name: string;
  url: string;
  provider: string;
  accountId: string;
  accountUsername?: string;
  accountAvatarUrl?: string;
}

function AddRepoModal({ onRepoAdded, needsReauth }: { onRepoAdded: () => void | Promise<void>; needsReauth: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableRepos, setAvailableRepos] = useState<AvailableRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState<string | null>(null);
  const [providerFilter, setProviderFilter] = useState<"all" | "github" | "gitlab">("all");
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const fetchAvailableRepos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/repos");
      const data = await res.json();
      setAvailableRepos(data.repos || []);
    } catch (error) {
      console.error("Failed to fetch repos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    fetchAvailableRepos();
  };

  const handleTrack = async (repo: AvailableRepo) => {
    setTracking(repo.id);
    try {
      const res = await fetch("/api/repos/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoId: repo.id,
          repoName: repo.name,
          repoUrl: repo.url,
          provider: repo.provider,
          accountId: repo.accountId,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to track repository");
      }

      onRepoAdded();
      setIsOpen(false);

      // Trigger toast notifications for newly unlocked achievements
      if (data.newlyUnlocked && data.newlyUnlocked.length > 0) {
        data.newlyUnlocked.forEach((achievement: any) => {
          window.dispatchEvent(new CustomEvent("achievement-unlocked", {
            detail: { achievement },
          }));
        });
      }
    } catch (error) {
      console.error("Failed to track repo:", error);
      setAlertModal({
        isOpen: true,
        title: "Failed to Track Repository",
        message: "Could not track repository. Please try again.",
      });
    } finally {
      setTracking(null);
    }
  };

  const getProviderIcon = (provider: string) => {
    return provider === "github" ? "🐙" : "🦊";
  };

  const filteredRepos = availableRepos.filter((repo) => {
    if (providerFilter === "all") return true;
    return repo.provider === providerFilter;
  });

  const getProviderCount = (provider: string) => {
    return availableRepos.filter((r) => r.provider === provider).length;
  };

  if (!isOpen) {
    return (
      <Button onClick={handleOpen}>
        <span>+</span> Track New Repo
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/50 pointer-events-none">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col pointer-events-auto">
        <div className="p-6 border-b-4 border-dark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-2xl text-dark">Track a Repository</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-dark hover:text-orange text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setProviderFilter("all")}
              className={`px-4 py-2 rounded-full font-body font-bold border-2 border-dark transition-all ${
                providerFilter === "all"
                  ? "bg-orange text-white"
                  : "bg-white text-dark hover:bg-sand"
              }`}
            >
              All ({availableRepos.length})
            </button>
            <button
              onClick={() => setProviderFilter("github")}
              className={`px-4 py-2 rounded-full font-body font-bold border-2 border-dark transition-all ${
                providerFilter === "github"
                  ? "bg-[#333] text-white"
                  : "bg-white text-dark hover:bg-sand"
              }`}
            >
              🐙 GitHub ({getProviderCount("github")})
            </button>
            <button
              onClick={() => setProviderFilter("gitlab")}
              className={`px-4 py-2 rounded-full font-body font-bold border-2 border-dark transition-all ${
                providerFilter === "gitlab"
                  ? "bg-[#FC6D26] text-white"
                  : "bg-white text-dark hover:bg-sand"
              }`}
            >
              🦊 GitLab ({getProviderCount("gitlab")})
            </button>
          </div>
        </div>

        {/* Re-authentication warning */}
        {needsReauth.length > 0 && providerFilter !== "github" && (
          <div className="mx-6 p-3 bg-orange/10 border-2 border-orange rounded-lg flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <p className="font-body text-sm text-dark flex-1">
              Your GitLab token has expired. <button
                onClick={() => (window.location.href = `/api/auth/signin?provider=gitlab&callbackUrl=${encodeURIComponent(window.location.pathname)}`)}
                className="text-orange hover:underline font-bold"
              >
                Reconnect your account
              </button> to continue tracking repositories.
            </p>
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse font-body font-bold">Loading repositories...</div>
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-body font-bold text-dark">
                {providerFilter === "all"
                  ? "No repositories found. Make sure you&apos;ve connected your GitHub or GitLab account."
                  : `No ${providerFilter === "github" ? "GitHub" : "GitLab"} repositories found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between p-4 bg-sand/30 rounded-xl border-2 border-dark hover:bg-sand/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {repo.accountAvatarUrl ? (
                      <img
                        src={repo.accountAvatarUrl}
                        alt={`${repo.accountUsername} avatar`}
                        className="w-8 h-8 rounded-full border-2 border-dark"
                        title={`via ${repo.accountUsername}`}
                      />
                    ) : (
                      <span className="text-2xl">{getProviderIcon(repo.provider)}</span>
                    )}
                    <div>
                      <span className="font-body font-bold text-dark">{repo.name}</span>
                      {repo.accountUsername && (
                        <div className="font-body text-xs text-gray-500">
                          via {repo.accountUsername}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleTrack(repo)}
                    disabled={tracking === repo.id}
                  >
                    {tracking === repo.id ? "Tracking..." : "Track"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Alert Modal */}
      <AlertDialog
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        onOk={() => setAlertModal({ isOpen: false, title: "", message: "" })}
      />
    </div>
  );
}
