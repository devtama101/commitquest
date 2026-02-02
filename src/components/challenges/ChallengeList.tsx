"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  goal: number;
  rewardXp: number;
  type: string;
  startDate: Date;
  endDate: Date | null;
}

interface UserChallenge {
  id: string;
  progress: number;
  completed: boolean;
  completedAt: Date | null;
  claimedAt: Date | null;
  challenge: Challenge;
}

interface ChallengesData {
  active: UserChallenge[];
  completed: UserChallenge[];
  claimed: UserChallenge[];
}

export function ChallengeList() {
  const [challenges, setChallenges] = useState<ChallengesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  const fetchChallenges = async () => {
    try {
      const res = await fetch("/api/challenges");
      const data: ChallengesData = await res.json();
      setChallenges(data);
    } catch (error) {
      console.error("Failed to fetch challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (userChallengeId: string) => {
    setClaiming(userChallengeId);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim", userChallengeId }),
      });
      const data = await res.json();

      if (data.success) {
        // Show level up if applicable
        if (data.leveledUp) {
          window.dispatchEvent(new CustomEvent("level-up", {
            detail: { newLevel: data.newLevel, xpEarned: data.xpAwarded },
          }));
        }
        fetchChallenges();
      }
    } catch (error) {
      console.error("Failed to claim reward:", error);
    } finally {
      setClaiming(null);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const getTypeColor = (type: string) => {
    return type === "daily" ? "bg-orange/20 text-orange" : "bg-teal/20 text-teal";
  };

  const getChallengeCard = (uc: UserChallenge) => {
    const progress = Math.min(uc.progress / uc.challenge.goal, 1) * 100;
    const isCompleted = uc.completed;
    const isClaimed = uc.claimedAt;

    return (
      <Card
        key={uc.id}
        className={`p-6 ${isCompleted && !isClaimed ? "border-4 border-teal" : ""}`}
      >
        <div className="flex items-start gap-4">
          <div className="text-4xl">{uc.challenge.icon}</div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-display text-lg text-dark">{uc.challenge.title}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${getTypeColor(uc.challenge.type)}`}
                  >
                    {uc.challenge.type}
                  </span>
                </div>
                <p className="font-body text-sm text-gray-600">{uc.challenge.description}</p>
              </div>
              <div className="text-right">
                <div className="font-display text-lg text-orange">+{uc.challenge.rewardXp} XP</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>
                  {Math.min(uc.progress, uc.challenge.goal)} / {uc.challenge.goal}
                </span>
              </div>
              <div className="relative h-3 bg-sand rounded-full overflow-hidden border border-dark/50">
                <div
                  className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                    isCompleted ? "bg-teal" : "bg-orange"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Action Button */}
            {isCompleted && !isClaimed && (
              <Button
                className="w-full"
                onClick={() => handleClaim(uc.id)}
                disabled={claiming === uc.id}
              >
                {claiming === uc.id ? "Claiming..." : "Claim Reward!"}
              </Button>
            )}

            {isClaimed && (
              <div className="text-center font-body text-sm font-bold text-teal">
                ✅ Reward Claimed!
              </div>
            )}

            {/* Time remaining */}
            {!isCompleted && uc.challenge.endDate && (
              <div className="text-xs text-gray-500 mt-2">
                {new Date(uc.challenge.endDate) > new Date()
                  ? `Ends ${new Date(uc.challenge.endDate).toLocaleDateString()}`
                  : "Ended"}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-cream border-4 border-dark rounded-2xl p-6 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!challenges) {
    return (
      <Card className="p-12 text-center">
        <div className="text-6xl mb-6">⚔️</div>
        <h3 className="font-display text-3xl text-dark mb-4">No Challenges</h3>
        <p className="font-body font-bold text-dark text-lg">
          Start committing to unlock challenges!
        </p>
      </Card>
    );
  }

  const hasNoChallenges =
    challenges.active.length === 0 &&
    challenges.completed.length === 0 &&
    challenges.claimed.length === 0;

  if (hasNoChallenges) {
    return (
      <Card className="p-12 text-center">
        <div className="text-6xl mb-6">⚔️</div>
        <h3 className="font-display text-3xl text-dark mb-4">No Active Challenges</h3>
        <p className="font-body font-bold text-dark text-lg mb-8">
          Check back tomorrow for new daily challenges!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Completed but not claimed */}
      {challenges.completed.length > 0 && (
        <div>
          <h3 className="font-display text-xl text-dark mb-4">🎉 Ready to Claim!</h3>
          <div className="space-y-4">{challenges.completed.map(getChallengeCard)}</div>
        </div>
      )}

      {/* Active challenges */}
      {challenges.active.length > 0 && (
        <div>
          <h3 className="font-display text-xl text-dark mb-4">⚔️ Active Challenges</h3>
          <div className="space-y-4">{challenges.active.map(getChallengeCard)}</div>
        </div>
      )}

      {/* Recently claimed */}
      {challenges.claimed.length > 0 && (
        <div>
          <h3 className="font-display text-xl text-dark mb-4">✅ Recently Completed</h3>
          <div className="space-y-4">
            {challenges.claimed.slice(0, 3).map(getChallengeCard)}
          </div>
        </div>
      )}
    </div>
  );
}
