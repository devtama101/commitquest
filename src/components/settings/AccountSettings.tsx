"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmModal, AlertDialog } from "@/components/ui/ConfirmModal";

interface Account {
  id: string;
  provider: string;
  providerAccountId?: string;
  username?: string;
  avatar_url?: string;
  needsReauth?: boolean;
}

export function AccountSettings() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [disconnectModal, setDisconnectModal] = useState<{
    isOpen: boolean;
    accountId: string;
    accountName: string;
    provider: string;
  }>({
    isOpen: false,
    accountId: "",
    accountName: "",
    provider: "",
  });
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/settings/accounts");
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDisconnect = (accountId: string, accountName: string, provider: string) => {
    setDisconnectModal({
      isOpen: true,
      accountId,
      accountName,
      provider,
    });
  };

  const confirmDisconnect = async () => {
    const { accountId } = disconnectModal;
    try {
      const res = await fetch("/api/settings/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });

      if (!res.ok) {
        throw new Error("Failed to disconnect");
      }

      fetchAccounts();
      setDisconnectModal({ isOpen: false, accountId: "", accountName: "", provider: "" });
    } catch (error) {
      console.error("Failed to disconnect account:", error);
      setAlertModal({
        isOpen: true,
        title: "Failed to Disconnect",
        message: "Could not disconnect account. Please try again.",
      });
      setDisconnectModal({ isOpen: false, accountId: "", accountName: "", provider: "" });
    }
  };

  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case "github":
        return { name: "GitHub", icon: "🐙", color: "bg-[#333]" };
      case "gitlab":
        return { name: "GitLab", icon: "🦊", color: "bg-[#FC6D26]" };
      default:
        return { name: provider, icon: "🔗", color: "bg-gray-500" };
    }
  };

  // Group accounts by provider
  const githubAccounts = accounts.filter((a) => a.provider === "github");
  const gitlabAccounts = accounts.filter((a) => a.provider === "gitlab");

  if (loading) {
    return (
      <div className="space-y-8">
        <h2 className="font-display text-2xl text-dark mb-6">Connected Accounts</h2>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-cream border-4 border-dark rounded-2xl p-6 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Connected Accounts */}
      <div>
        <h2 className="font-display text-2xl text-dark mb-6">Connected Accounts</h2>

        {accounts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="font-body font-bold text-dark">
              No accounts connected. Connect your accounts to start tracking!
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* GitHub Accounts */}
            {githubAccounts.length > 0 && (
              <div>
                <h3 className="font-display text-lg text-dark mb-3">🐙 GitHub Accounts ({githubAccounts.length})</h3>
                <div className="space-y-3">
                  {githubAccounts.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      onDisconnect={handleDisconnect}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* GitLab Accounts */}
            {gitlabAccounts.length > 0 && (
              <div>
                <h3 className="font-display text-lg text-dark mb-3">🦊 GitLab Accounts ({gitlabAccounts.length})</h3>
                <div className="space-y-3">
                  {gitlabAccounts.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      onDisconnect={handleDisconnect}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Re-authentication warning */}
        {accounts.some((a) => a.needsReauth) && (
          <Card className="p-4 bg-orange/10 border-4 border-orange">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h4 className="font-display text-lg text-dark mb-1">Account Re-authentication Required</h4>
                <p className="font-body text-sm text-dark mb-3">
                  One or more of your accounts has expired. Please reconnect to continue tracking.
                </p>
                <div className="flex gap-2">
                  {accounts.filter((a) => a.needsReauth && a.provider === "gitlab").length > 0 && (
                    <Button
                      size="sm"
                      onClick={() => (window.location.href = "/api/auth/signin?provider=gitlab&callbackUrl=/settings")}
                      className="bg-[#FC6D26] hover:bg-[#e65a26] text-white"
                    >
                      Reconnect GitLab
                    </Button>
                  )}
                  {accounts.filter((a) => a.needsReauth && a.provider === "github").length > 0 && (
                    <Button
                      size="sm"
                      onClick={() => (window.location.href = "/api/auth/signin?provider=github&callbackUrl=/settings")}
                      className="bg-[#333] hover:bg-[#444] text-white"
                    >
                      Reconnect GitHub
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Add More Accounts */}
      <div>
        <h2 className="font-display text-2xl text-dark mb-6">Add Account</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <ConnectCard
            provider="github"
            name="GitHub"
            icon="🐙"
            description="Connect another GitHub account"
          />
          <ConnectCard
            provider="gitlab"
            name="GitLab"
            icon="🦊"
            description="Connect another GitLab account"
          />
        </div>
      </div>

      {/* Disconnect Confirmation Modal */}
      <ConfirmModal
        isOpen={disconnectModal.isOpen}
        title="Disconnect Account?"
        message={`Are you sure you want to disconnect your ${disconnectModal.provider === "github" ? "GitHub" : "GitLab"} account (${disconnectModal.accountName})? This will remove access to its repositories and stop tracking commits from those repositories.`}
        confirmText="Disconnect"
        cancelText="Cancel"
        onConfirm={confirmDisconnect}
        onCancel={() => setDisconnectModal({ isOpen: false, accountId: "", accountName: "", provider: "" })}
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

interface AccountCardProps {
  account: Account;
  onDisconnect: (accountId: string, accountName: string, provider: string) => void;
}

function AccountCard({ account, onDisconnect }: AccountCardProps) {
  const provider = account.provider === "github" ? "GitHub" : "GitLab";
  const icon = account.provider === "github" ? "🐙" : "🦊";
  const bgColor = account.provider === "github" ? "bg-[#333]" : "bg-[#FC6D26]";

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {account.avatar_url ? (
            <img
              src={account.avatar_url}
              alt={`${account.username} avatar`}
              className="w-10 h-10 rounded-full border-2 border-dark"
            />
          ) : (
            <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center text-xl`}>
              {icon}
            </div>
          )}
          <div>
            <div className="font-display text-lg text-dark">{account.username || provider}</div>
            <div className="font-body text-xs text-gray-500">
              {provider} {account.providerAccountId ? `• ${account.providerAccountId.slice(0, 8)}...` : ""}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDisconnect(account.id, account.username || provider, account.provider)}
          className="text-red-500 hover:text-red-700"
        >
          Disconnect
        </Button>
      </div>
    </Card>
  );
}

function ConnectCard({
  provider,
  name,
  icon,
  description,
}: {
  provider: string;
  name: string;
  icon: string;
  description: string;
}) {
  const handleConnect = async () => {
    await signIn(provider, { callbackUrl: "/settings" });
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{icon}</div>
          <div>
            <div className="font-display text-xl text-dark">{name}</div>
            <div className="font-body text-sm text-gray-600">{description}</div>
          </div>
        </div>

        <Button size="sm" onClick={handleConnect}>
          Connect
        </Button>
      </div>
    </Card>
  );
}
