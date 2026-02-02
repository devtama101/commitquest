import { prisma } from "./prisma";
import { addXpToUser, awardAchievementXp } from "./xp";

export interface AchievementUnlock {
  achievementId: string;
  name: string;
  icon: string;
  rarity: string;
  xpReward?: number;
}

/**
 * Calculate streak from commits
 */
export function calculateStreak(commits: Date[]): { current: number; longest: number } {
  if (commits.length === 0) return { current: 0, longest: 0 };

  // Get unique dates (midnight normalized)
  const dates = commits.map((c) => {
    const date = new Date(c);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  });
  const uniqueDatesSet = new Set(dates);
  const uniqueDates = Array.from(uniqueDatesSet).sort((a, b) => b - a); // Sort descending (newest first)

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  const yesterdayTime = todayTime - 86400000;

  // Check if there's a commit today or yesterday to start/streak
  const hasToday = uniqueDates.includes(todayTime);
  const hasYesterday = uniqueDates.includes(yesterdayTime);

  if (hasToday || hasYesterday) {
    currentStreak = hasToday ? 1 : 0;
    const startSearchTime = hasToday ? todayTime : yesterdayTime;

    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedTime = startSearchTime - i * 86400000;
      if (uniqueDates.includes(expectedTime)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let lastDate = uniqueDates[uniqueDates.length - 1];
  tempStreak = 1;

  for (let i = uniqueDates.length - 2; i >= 0; i--) {
    const diff = (lastDate - uniqueDates[i]) / 86400000;
    if (diff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
    lastDate = uniqueDates[i];
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { current: currentStreak, longest: longestStreak };
}

/**
 * Check and unlock achievements based on user stats and commits
 */
export async function checkAchievements(
  userId: string
): Promise<AchievementUnlock[]> {
  const newlyUnlocked: AchievementUnlock[] = [];

  // Get user stats
  const stats = await prisma.userStats.findUnique({
    where: { userId },
  });

  if (!stats) return [];

  // Get all achievements
  const allAchievements = await prisma.achievement.findMany();

  // Get user's existing achievements
  const existingAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const existingIds = new Set(existingAchievements.map((ua: any) => ua.achievementId));

  // Get user's accounts for multi-platform check
  const accounts = await prisma.account.findMany({
    where: { userId },
    select: { provider: true },
  });

  // Get user's tracked repos
  const trackedRepos = await prisma.trackedRepo.count({
    where: { userId },
  });

  // Get commits for time-based achievements
  const commits = await prisma.commit.findMany({
    where: { userId },
    select: { committedAt: true },
  });

  // Check each achievement
  for (const achievement of allAchievements) {
    if (existingIds.has(achievement.id)) continue;

    let shouldUnlock = false;

    switch (achievement.category) {
      case "streak":
        shouldUnlock = stats.currentStreak >= achievement.threshold;
        break;

      case "volume":
        shouldUnlock = stats.totalCommits >= achievement.threshold;
        break;

      case "time":
        // Check time-based achievements
        if (achievement.slug === "night-owl") {
          shouldUnlock = commits.some((c: any) => {
            const hour = new Date(c.committedAt).getHours();
            return hour >= 0 && hour < 5;
          });
        } else if (achievement.slug === "early-bird") {
          shouldUnlock = commits.some((c: any) => {
            const hour = new Date(c.committedAt).getHours();
            return hour >= 5 && hour < 7;
          });
        } else if (achievement.slug === "weekend-warrior") {
          const saturdayCommits = commits.some((c: any) => {
            const day = new Date(c.committedAt).getDay();
            return day === 6; // Saturday
          });
          const sundayCommits = commits.some((c: any) => {
            const day = new Date(c.committedAt).getDay();
            return day === 0; // Sunday
          });
          shouldUnlock = saturdayCommits && sundayCommits;
        }
        break;

      case "special":
        if (achievement.slug === "multi-platform") {
          const hasGitHub = accounts.some((a: any) => a.provider === "github");
          const hasGitLab = accounts.some((a: any) => a.provider === "gitlab");
          shouldUnlock = hasGitHub && hasGitLab;
        } else if (achievement.slug === "first-repo") {
          shouldUnlock = trackedRepos >= 1;
        }
        break;
    }

    if (shouldUnlock) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });

      // Award XP for the achievement
      await awardAchievementXp(userId, achievement.id, achievement.xpReward || 10);

      newlyUnlocked.push({
        achievementId: achievement.id,
        name: achievement.name,
        icon: achievement.icon,
        rarity: achievement.rarity,
        xpReward: achievement.xpReward || 10,
      });
    }
  }

  return newlyUnlocked;
}

/**
 * Update user stats after new commits
 */
export async function updateUserStats(
  userId: string,
  newCommits: Date[]
): Promise<void> {
  const allCommits = await prisma.commit.findMany({
    where: { userId },
    select: { committedAt: true },
    orderBy: { committedAt: "asc" },
  });

  const commitDates = allCommits.map((c: any) => new Date(c.committedAt));
  const { current, longest } = calculateStreak(commitDates);

  await prisma.userStats.upsert({
    where: { userId },
    create: {
      userId,
      currentStreak: current,
      longestStreak: longest,
      totalCommits: commitDates.length,
      lastCommitDate: commitDates[commitDates.length - 1],
    },
    update: {
      currentStreak: current,
      longestStreak: Math.max(longest, 0), // Will be updated below
      totalCommits: commitDates.length,
      lastCommitDate: commitDates[commitDates.length - 1],
    },
  });
}
