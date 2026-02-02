import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user stats
    let stats = await prisma.userStats.findUnique({
      where: { userId: session.user.id },
    });

    // If no stats exist, create them
    if (!stats) {
      stats = await prisma.userStats.create({
        data: {
          userId: session.user.id,
          currentStreak: 0,
          longestStreak: 0,
          totalCommits: 0,
        },
      });
    }

    // Get today's commit count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCommits = await prisma.commit.count({
      where: {
        userId: session.user.id,
        committedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get achievements count
    const achievementsCount = await prisma.userAchievement.count({
      where: { userId: session.user.id },
    });

    // Get total achievements available
    const totalAchievements = await prisma.achievement.count();

    // Get code stats
    const commits = await prisma.commit.findMany({
      where: { userId: session.user.id },
      select: { additions: true, deletions: true },
    });

    const totalLinesAdded = commits.reduce((sum, c) => sum + (c.additions || 0), 0);
    const totalLinesDeleted = commits.reduce((sum, c) => sum + (c.deletions || 0), 0);
    const avgLinesPerCommit = commits.length > 0 ? Math.floor((totalLinesAdded + totalLinesDeleted) / commits.length) : 0;

    // Find biggest commit
    const biggestCommit = await prisma.commit.findFirst({
      where: { userId: session.user.id },
      select: { id: true, sha: true, message: true, additions: true, deletions: true },
      orderBy: [{ additions: "desc" }, { deletions: "desc" }],
    });

    // Get code stats by repo
    const reposWithCommits = await prisma.trackedRepo.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        commits: {
          select: { additions: true, deletions: true },
        },
      },
    });

    const linesByRepo = reposWithCommits.map((repo) => {
      const added = repo.commits.reduce((sum, c) => sum + (c.additions || 0), 0);
      const deleted = repo.commits.reduce((sum, c) => sum + (c.deletions || 0), 0);
      return {
        repoName: repo.repoName,
        added,
        deleted,
      };
    });

    return NextResponse.json({
      stats: {
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        totalCommits: stats.totalCommits,
        todayCommits,
        achievementsCount,
        totalAchievements,
        lastCommitDate: stats.lastCommitDate,
      },
      codeStats: {
        totalLinesAdded,
        totalLinesDeleted,
        netLinesAdded: totalLinesAdded - totalLinesDeleted,
        avgLinesPerCommit,
        biggestCommit: biggestCommit ? {
          sha: biggestCommit.sha,
          message: biggestCommit.message?.split("\n")[0] || "",
          additions: biggestCommit.additions || 0,
          deletions: biggestCommit.deletions || 0,
        } : null,
        linesByRepo,
      },
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
