"use client";

import { useState, useEffect } from "react";
import { ClientNavbar } from "@/components/layout/ClientNavbar";
import { Footer } from "@/components/layout/Footer";
import { ChallengeList } from "@/components/challenges/ChallengeList";
import { ChallengeHistory } from "@/components/challenges/ChallengeHistory";

export default function ChallengesPage() {
  const [tab, setTab] = useState<"active" | "history">("active");

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <ClientNavbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-5xl text-dark mb-4">
              Daily & Weekly Challenges
            </h1>
            <p className="font-body font-bold text-dark text-lg">
              Complete challenges to earn XP and level up faster!
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex gap-2 bg-white p-2 rounded-full border-2 border-dark">
              <button
                onClick={() => setTab("active")}
                className={`px-6 py-2 rounded-full font-body font-bold transition-all ${
                  tab === "active"
                    ? "bg-orange text-white"
                    : "text-dark hover:bg-sand"
                }`}
              >
                Active Challenges
              </button>
              <button
                onClick={() => setTab("history")}
                className={`px-6 py-2 rounded-full font-body font-bold transition-all ${
                  tab === "history"
                    ? "bg-orange text-white"
                    : "text-dark hover:bg-sand"
                }`}
              >
                History
              </button>
            </div>
          </div>

          {/* Content */}
          {tab === "active" ? <ChallengeList /> : <ChallengeHistory />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
