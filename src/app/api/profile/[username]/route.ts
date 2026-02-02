import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Find user by name or email (case-insensitive)
    const allUsers = await prisma.user.findMany({
      include: {
        profile: true,
      },
    });

    const user = allUsers.find(
      (u) => u.name?.toLowerCase() === username.toLowerCase() || u.email?.toLowerCase() === username.toLowerCase()
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's privacy settings
    const profile = user.profile;

    // Get stats if public
    let stats = null;
    if (profile?.showStats !== false) {
      stats = await prisma.userStats.findUnique({
        where: { userId: user.id },
      });
    }

    // Get level if public
    let userLevel = null;
    if (profile?.showStats !== false) {
      userLevel = await prisma.userLevel.findUnique({
        where: { userId: user.id },
      });
    }

    // Get achievements if public
    let achievements: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      rarity: string;
      unlockedAt: Date;
    }> = [];
    if (profile?.showAchievements !== false) {
      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId: user.id },
        include: {
          achievement: true,
        },
        orderBy: {
          unlockedAt: "desc",
        },
      });

      achievements = userAchievements.map((ua) => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        rarity: ua.achievement.rarity,
        unlockedAt: ua.unlockedAt,
      }));
    }

    // Get recent commits if activity is public
    let recentCommits: Array<{
      sha: string;
      message: string;
      committedAt: Date;
      repoName: string;
    }> = [];
    if (profile?.showActivity !== false) {
      const commits = await prisma.commit.findMany({
        where: { userId: user.id },
        include: {
          repo: {
            select: {
              repoName: true,
            },
          },
        },
        orderBy: {
          committedAt: "desc",
        },
        take: 10,
      });

      recentCommits = commits.map((c) => ({
        sha: c.sha,
        message: c.message,
        committedAt: c.committedAt,
        repoName: c.repo?.repoName || "Unknown",
      }));
    }

    // Get commit calendar data if activity is public (last 365 days)
    let calendarData: Array<{ date: string; count: number }> = [];
    if (profile?.showActivity !== false) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 365);

      const commits = await prisma.commit.findMany({
        where: {
          userId: user.id,
          committedAt: {
            gte: startDate,
          },
        },
        select: {
          committedAt: true,
        },
      });

      // Group by date
      const commitsByDate = new Map<string, number>();
      commits.forEach((commit) => {
        const dateKey = commit.committedAt.toISOString().split("T")[0];
        commitsByDate.set(dateKey, (commitsByDate.get(dateKey) || 0) + 1);
      });

      calendarData = Array.from(commitsByDate.entries()).map(([date, count]) => ({
        date,
        count,
      }));
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
        bio: profile?.bio || null,
        location: profile?.location || null,
        website: profile?.website || null,
      },
      stats: profile?.showStats === false ? null : {
        totalCommits: stats?.totalCommits || 0,
        currentStreak: stats?.currentStreak || 0,
        longestStreak: stats?.longestStreak || 0,
        level: userLevel?.level || 1,
        totalXp: userLevel?.totalXp || 0,
        title: userLevel?.title || "Code Novice",
      },
      achievements: profile?.showAchievements === false ? [] : achievements,
      recentCommits: profile?.showActivity === false ? [] : recentCommits,
      calendarData: profile?.showActivity === false ? [] : calendarData,
      privacy: {
        showActivity: profile?.showActivity ?? true,
        showStats: profile?.showStats ?? true,
        showAchievements: profile?.showAchievements ?? true,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
