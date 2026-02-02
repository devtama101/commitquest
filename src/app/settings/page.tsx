"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ClientNavbar } from "@/components/layout/ClientNavbar";
import { Footer } from "@/components/layout/Footer";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { BadgeEmbed } from "@/components/settings/BadgeEmbed";
import { ProfileSettings } from "@/components/settings/ProfileSettings";

type Tab = "accounts" | "profile" | "badge";

const TABS: { id: Tab; name: string; icon: string }[] = [
  { id: "accounts", name: "Connected Accounts", icon: "🔗" },
  { id: "profile", name: "Public Profile", icon: "👤" },
  { id: "badge", name: "Share Badge", icon: "📋" },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("accounts");
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const res = await fetch("/api/settings/accounts");
        const data = await res.json();
        // Get the first GitHub username for badge
        const githubAccount = data.accounts?.find((a: any) => a.provider === "github");
        if (githubAccount?.username) {
          setUsername(githubAccount.username);
        } else if (session?.user?.name) {
          setUsername(session.user.name);
        }
      } catch (error) {
        console.error("Failed to fetch username:", error);
        if (session?.user?.name) {
          setUsername(session.user.name);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsername();
  }, [session]);

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <ClientNavbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-5xl md:text-6xl text-dark mb-4">
              Settings
            </h1>
            <p className="font-body font-bold text-dark text-lg">
              Manage your accounts and preferences
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex gap-1 bg-cream p-1.5 rounded-full border-2 border-dark shadow-[4px_4px_0_var(--color-dark)]">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2 rounded-full font-body font-bold transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-orange text-white"
                      : "text-dark hover:bg-sand/70"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "accounts" && <AccountSettings />}
            {activeTab === "profile" && <ProfileSettings username={username} />}
            {activeTab === "badge" && !loading && username && <BadgeEmbed username={username} />}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
