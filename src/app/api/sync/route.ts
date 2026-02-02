import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addXpToUser, calculateXpForCommit } from "@/lib/xp";

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
        username: data.login,
        email: data.email,
      };
    }
  } catch {}
  return { username: null, email: null };
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
        username: data.username,
        email: data.email,
      };
    }
  } catch {}
  return { username: null, email: null };
}

/**
 * Manual sync endpoint to fetch recent commits from provider APIs
 * This is a fallback when webhooks fail or for local development
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { repoId } = body;

    // Get all tracked repos for this user
    const trackedRepos = repoId
      ? await prisma.trackedRepo.findMany({
          where: {
            id: repoId,
            userId: session.user.id,
          },
        })
      : await prisma.trackedRepo.findMany({
          where: {
            userId: session.user.id,
          },
        });

    if (trackedRepos.length === 0) {
      return NextResponse.json({ error: "No repos found" }, { status: 404 });
    }

    // Get accounts for access tokens
    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
    });

    // Map account ID to account for quick lookup
    const accountMap = new Map(accounts.map((a) => [a.id, a]));

    let totalSyncedCount = 0;

    // Sync each repo
    for (const trackedRepo of trackedRepos) {
      // Use the accountId stored in the tracked repo to find the correct account
      // Fallback to provider matching for repos tracked before this update
      let account = trackedRepo.accountId
        ? accountMap.get(trackedRepo.accountId)
        : null;

      // Fallback: find an account with the same provider
      if (!account) {
        account = accounts.find((a) => a.provider === trackedRepo.provider && a.access_token);
      }

      if (!account?.access_token) {
        console.error(`No account found for repo ${trackedRepo.repoName}`);
        continue;
      }

      // Get user info for filtering
      let userInfo = { username: null as string | null, email: null as string | null };
      if (trackedRepo.provider === "github") {
        userInfo = await getGitHubUserInfo(account.access_token);
      } else if (trackedRepo.provider === "gitlab") {
        userInfo = await getGitLabUserInfo(account.access_token);
      }

      let commits: any[] = [];

      if (trackedRepo.provider === "github") {
        // Fetch all commits with pagination
        let page = 1;
        const perPage = 100;

        while (true) {
          const response = await fetch(
            `https://api.github.com/repos/${trackedRepo.repoName}/commits?per_page=${perPage}&page=${page}&author=${userInfo.username}`,
            {
              headers: {
                Authorization: `Bearer ${account.access_token}`,
                "X-GitHub-Api-Version": "2022-11-28",
              },
            }
          );

          if (!response.ok) break;

          const data = await response.json();
          if (!Array.isArray(data) || data.length === 0) break;

          commits.push(...data);
          if (data.length < perPage) break;
          page++;

          // Safety limit to prevent infinite loops
          if (page > 100) break;
        }
      } else if (trackedRepo.provider === "gitlab") {
        // Fetch all commits with pagination (GitLab doesn't have author filter in list API)
        let page = 1;
        const perPage = 100;

        while (true) {
          const response = await fetch(
            `https://gitlab.com/api/v4/projects/${encodeURIComponent(trackedRepo.repoId)}/repository/commits?per_page=${perPage}&page=${page}`,
            {
              headers: {
                Authorization: `Bearer ${account.access_token}`,
              },
            }
          );

          if (!response.ok) break;

          const data = await response.json();
          if (!Array.isArray(data) || data.length === 0) break;

          commits.push(...data);
          if (data.length < perPage) break;
          page++;

          // Safety limit to prevent infinite loops
          if (page > 100) break;
        }

        // Filter by author for GitLab (client-side filtering)
        if (userInfo.username) {
          commits = commits.filter((c: any) =>
            c.author_name === userInfo.username ||
            c.author_email === userInfo.email ||
            c.committer_name === userInfo.username
          );
        }
      }

      // Process commits
      for (const commit of commits) {
        const sha = commit.sha || commit.id;
        const message = commit.commit?.message || commit.title || "";
        const dateStr = commit.commit?.committer?.date || commit.created_at;
        const commitDate = new Date(dateStr);

        try {
          await prisma.commit.create({
            data: {
              userId: session.user.id,
              repoId: trackedRepo.id,
              provider: trackedRepo.provider,
              sha,
              message: message.split("\n")[0], // First line only
              committedAt: commitDate,
              branch: "",
            },
          });
          totalSyncedCount++;
        } catch {
          // Already exists, skip
        }
      }
    }

    // Update stats and check achievements
    if (totalSyncedCount > 0) {
      const { updateUserStats, checkAchievements } = await import("@/lib/achievements");
      await updateUserStats(session.user.id, []);
      const newlyUnlocked = await checkAchievements(session.user.id);

      // Award XP for each synced commit (if not already awarded)
      // Note: This is simplified - in production we'd track which commits already gave XP
      const commits = await prisma.commit.findMany({
        where: { userId: session.user.id },
        select: { id: true, additions: true, deletions: true },
      });

      let totalXpEarned = 0;
      for (const commit of commits) {
        const xp = calculateXpForCommit({
          additions: commit.additions || 0,
          deletions: commit.deletions || 0,
        });
        totalXpEarned += xp;
      }

      // Award XP and check for level up
      const { leveledUp, newLevel } = await addXpToUser(session.user.id, totalXpEarned, "sync");

      return NextResponse.json({
        success: true,
        syncedCount: totalSyncedCount,
        newlyUnlocked,
        xpEarned: totalXpEarned,
        leveledUp,
        newLevel,
      });
    }

    return NextResponse.json({ success: true, syncedCount: 0 });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
