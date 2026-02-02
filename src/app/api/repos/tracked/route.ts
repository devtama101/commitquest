import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getValidAccessToken, isTokenExpired } from "@/lib/token-refresh";
import { apiError, API_ERRORS } from "@/lib/api-error";

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
): Promise<{ username: string; avatarUrl: string; needsReauth: boolean }> {
  // Try to get a valid access token with automatic refresh
  const { success, accessToken, needsReauth } = await getValidAccessToken(userId, accountId, provider);

  if (!success || !accessToken) {
    return { username: "Unknown", avatarUrl: "", needsReauth: true };
  }

  if (provider === "github") {
    const info = await getGitHubUserInfo(accessToken);
    return { ...info, needsReauth: false };
  } else if (provider === "gitlab") {
    const info = await getGitLabUserInfo(accessToken);
    return { ...info, needsReauth: false };
  }

  return { username: "Unknown", avatarUrl: "", needsReauth: false };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError(API_ERRORS.UNAUTHORIZED);
    }

    const trackedRepos = await prisma.trackedRepo.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    });

    // Get all accounts for this user
    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
    });
    const accountMap = new Map(accounts.map((a) => [a.id, a]));

    // Track accounts that need re-authentication
    const accountsNeedingReauth = new Set<string>();

    // Get commit counts, latest commit date, and account info for each repo
    const reposWithData = await Promise.all(
      trackedRepos.map(async (repo: any) => {
        const commitCount = await prisma.commit.count({
          where: { repoId: repo.id },
        });

        // Get the latest commit date for this repo
        const latestCommit = await prisma.commit.findFirst({
          where: { repoId: repo.id },
          orderBy: { committedAt: "desc" },
          select: { committedAt: true },
        });

        // Get account info - use accountId if available, otherwise find by provider
        let accountInfo = { username: "Unknown", avatarUrl: "", needsReauth: false };
        let account = repo.accountId ? accountMap.get(repo.accountId) : null;

        // Fallback: find an account with the same provider
        if (!account) {
          account = accounts.find((a) => a.provider === repo.provider && a.access_token);
        }

        if (account) {
          const info = await getAccountInfoWithRefresh(
            session.user.id,
            account.id,
            repo.provider
          );
          accountInfo = info;
          if (info.needsReauth) {
            accountsNeedingReauth.add(account.id);
          }
        }

        return {
          ...repo,
          commitCount,
          lastCommitAt: latestCommit?.committedAt || null,
          accountUsername: accountInfo.username,
          accountAvatarUrl: accountInfo.avatarUrl,
        };
      })
    );

    // Sort by last commit date (most recent first), then by creation date
    reposWithData.sort((a, b) => {
      const aDate = a.lastCommitAt ? new Date(a.lastCommitAt).getTime() : 0;
      const bDate = b.lastCommitAt ? new Date(b.lastCommitAt).getTime() : 0;
      return bDate - aDate;
    });

    return NextResponse.json({
      repos: reposWithData,
      needsReauth: Array.from(accountsNeedingReauth),
    });
  } catch (error) {
    console.error("Tracked repos fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracked repos" },
      { status: 500 }
    );
  }
}
