"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

interface HistoryItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardXp: number;
  type: string;
  completedAt: Date | null;
  claimedAt: Date | null;
}

export function ChallengeHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/challenges/history");
        const data: HistoryItem[] = await res.json();
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch challenge history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getTypeColor = (type: string) => {
    return type === "daily" ? "bg-orange/20 text-orange" : "bg-teal/20 text-teal";
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

  if (history.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="text-6xl mb-6">📜</div>
        <h3 className="font-display text-3xl text-dark mb-4">No History Yet</h3>
        <p className="font-body font-bold text-dark text-lg">
          Complete challenges to see your history here!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <Card key={item.id} className="p-6">
          <div className="flex items-center gap-4">
            <div className="text-3xl">{item.icon}</div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-display text-lg text-dark">{item.title}</h4>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${getTypeColor(item.type)}`}
                >
                  {item.type}
                </span>
              </div>
              <p className="font-body text-sm text-gray-600">{item.description}</p>
            </div>

            <div className="text-right">
              <div className="font-display text-lg text-orange">+{item.rewardXp} XP</div>
              <div className="font-body text-xs text-gray-500">
                {item.claimedAt
                  ? `Claimed ${new Date(item.claimedAt).toLocaleDateString()}`
                  : ""}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
