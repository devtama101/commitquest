import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getValidAccessToken } from "@/lib/token-refresh";

async function getGitHubUsername(accessToken: string): Promise<{ username: string; avatarUrl: string }> {
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
        username: data.login || data.name || "Unknown",
        avatarUrl: data.avatar_url || "",
      };
    }
  } catch {
    // Fall through to return placeholder
  }
  return { username: "Unknown", avatarUrl: "" };
}

async function getGitLabUsername(accessToken: string): Promise<{ username: string; avatarUrl: string }> {
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
  const { success, accessToken, needsReauth } = await getValidAccessToken(userId, accountId, provider);

  if (!success || !accessToken) {
    return { username: "Unknown", avatarUrl: "", needsReauth: true };
  }

  if (provider === "github") {
    const info = await getGitHubUsername(accessToken);
    return { ...info, needsReauth: false };
  } else if (provider === "gitlab") {
    const info = await getGitLabUsername(accessToken);
    return { ...info, needsReauth: false };
  }

  return { username: "Unknown", avatarUrl: "", needsReauth: true };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
    });

    // Fetch usernames and avatars for each account with token refresh
    const formattedAccounts = await Promise.all(
      accounts.map(async (account) => {
        let username = "Unknown";
        let avatarUrl = "";
        let needsReauth = false;

        if (account.access_token) {
          const info = await getAccountInfoWithRefresh(
            session.user.id,
            account.id,
            account.provider
          );
          username = info.username;
          avatarUrl = info.avatarUrl;
          needsReauth = info.needsReauth;
        }

        return {
          id: account.id,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          username,
          avatar_url: avatarUrl,
          needsReauth,
        };
      })
    );

    return NextResponse.json({ accounts: formattedAccounts });
  } catch (error) {
    console.error("Settings accounts fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}
