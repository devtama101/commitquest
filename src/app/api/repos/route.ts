import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fetchGitHubRepos, fetchGitLabProjects } from "@/lib/webhooks";
import { getValidAccessToken, isTokenExpired } from "@/lib/token-refresh";

async function getGitHubUserInfo(accessToken: string) {
  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (response.ok) {
      const data = await response.json();
      return {
        username: data.login || "Unknown",
        avatarUrl: data.avatar_url || "",
      };
    }
  } catch {}
  return { username: "Unknown", avatarUrl: "" };
}

async function getGitLabUserInfo(accessToken: string) {
  try {
    const response = await fetch("https://gitlab.com/api/v4/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      return {
        username: data.username || data.name || "Unknown",
        avatarUrl: data.avatar_url || "",
      };
    }
  } catch {}
  return { username: "Unknown", avatarUrl: "" };
}

async function getAccountInfoWithRefresh(
  userId: string,
  accountId: string,
  provider: string
): Promise<{ username: string; avatarUrl: string; accessToken?: string; needsReauth: boolean }> {
  const { success, accessToken, needsReauth } = await getValidAccessToken(userId, accountId, provider);

  if (!success || !accessToken) {
    return { username: "Unknown", avatarUrl: "", needsReauth: true };
  }

  if (provider === "github") {
    const info = await getGitHubUserInfo(accessToken);
    return { ...info, accessToken, needsReauth: false };
  } else if (provider === "gitlab") {
    const info = await getGitLabUserInfo(accessToken);
    return { ...info, accessToken, needsReauth: false };
  }

  return { username: "Unknown", avatarUrl: "", needsReauth: true };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's accounts with access tokens
    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
    });

    const repos: Array<{
      id: string;
      name: string;
      url: string;
      accountId: string;
      provider: "github" | "gitlab";
      accountUsername?: string;
      accountAvatarUrl?: string;
    }> = [];

    const accountsNeedingReauth = new Set<string>();

    // Fetch from all accounts
    for (const account of accounts) {
      let accountInfo: { username: string; avatarUrl: string; accessToken?: string; needsReauth: boolean } = {
        username: "Unknown",
        avatarUrl: "",
        needsReauth: false,
      };

      if (account.provider === "github" && account.access_token) {
        accountInfo = await getAccountInfoWithRefresh(session.user.id, account.id, "github");
        if (accountInfo.needsReauth) {
          accountsNeedingReauth.add(account.id);
        }
        if (accountInfo.accessToken) {
          const githubRepos = await fetchGitHubRepos(accountInfo.accessToken);
          githubRepos.forEach((repo: any) => {
            repos.push({
              ...repo,
              accountId: account.id,
              provider: "github" as const,
              accountUsername: accountInfo.username,
              accountAvatarUrl: accountInfo.avatarUrl,
            });
          });
        }
      } else if (account.provider === "gitlab" && account.access_token) {
        accountInfo = await getAccountInfoWithRefresh(session.user.id, account.id, "gitlab");
        if (accountInfo.needsReauth) {
          accountsNeedingReauth.add(account.id);
        }
        if (accountInfo.accessToken) {
          const gitlabProjects = await fetchGitLabProjects(accountInfo.accessToken);
          gitlabProjects.forEach((repo: any) => {
            repos.push({
              ...repo,
              accountId: account.id,
              provider: "gitlab" as const,
              accountUsername: accountInfo.username,
              accountAvatarUrl: accountInfo.avatarUrl,
            });
          });
        }
      }
    }

    return NextResponse.json({
      repos,
      needsReauth: Array.from(accountsNeedingReauth),
    });
  } catch (error) {
    console.error("Repos fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch repos" }, { status: 500 });
  }
}
