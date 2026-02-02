import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all achievements with user's unlock status
    const achievements = await prisma.achievement.findMany({
      include: {
        users: {
          where: { userId: session.user.id },
          select: {
            unlockedAt: true,
          },
          take: 1,
        },
      },
      orderBy: [
        { category: "asc" },
        { threshold: "asc" },
      ],
    });

    // Format with unlock status and progress
    const achievementsWithStatus = achievements.map((achievement: any) => {
      const isUnlocked = achievement.users.length > 0;

      return {
        id: achievement.id,
        slug: achievement.slug,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        threshold: achievement.threshold,
        rarity: achievement.rarity,
        isUnlocked,
        unlockedAt: achievement.users[0]?.unlockedAt || null,
      };
    });

    // Get user stats for progress calculation
    const stats = await prisma.userStats.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      achievements: achievementsWithStatus,
      stats: {
        currentStreak: stats?.currentStreak || 0,
        totalCommits: stats?.totalCommits || 0,
      },
    });
  } catch (error) {
    console.error("Achievements fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
  }
}
