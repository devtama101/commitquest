import { prisma } from "./prisma";

// XP rewards
export const XP_PER_COMMIT = 10;
export const XP_STREAK_MULTIPLIER = 0.5; // 0.5 XP per day of streak

// Level thresholds (cumulative XP needed)
export const LEVEL_THRESHOLDS: Record<number, { requiredXp: number; title: string }> = {
  1: { requiredXp: 0, title: "Code Novice" },
  2: { requiredXp: 100, title: "App Developer" },
  3: { requiredXp: 250, title: "Bug Hunter" },
  4: { requiredXp: 500, title: "Code Apprentice" },
  5: { requiredXp: 1000, title: "Merge Apprentice" },
  6: { requiredXp: 2000, title: "Committer" },
  7: { requiredXp: 3500, title: "Streak Keeper" },
  8: { requiredXp: 5000, title: "Code Warrior" },
  9: { requiredXp: 7500, title: "Git Apprentice" },
  10: { requiredXp: 10000, title: "Merge Master" },
  11: { requiredXp: 15000, title: "Git Knight" },
  12: { requiredXp: 20000, title: "Code Crusader" },
  13: { requiredXp: 30000, title: "Streak Legend" },
  14: { requiredXp: 40000, title: "Achievement Hunter" },
  15: { requiredXp: 50000, title: "Git Champion" },
  16: { requiredXp: 75000, title: "Code Warlord" },
  17: { requiredXp: 100000, title: "Streak God" },
  18: { requiredXp: 150000, title: "Git Legend" },
  19: { requiredXp: 200000, title: "Code Titan" },
  20: { requiredXp: 250000, title: "Master Coder" },
  25: { requiredXp: 500000, title: "Elite Developer" },
  30: { requiredXp: 1000000, title: "Git Grandmaster" },
  50: { requiredXp: 5000000, title: "Code Immortal" },
  100: { requiredXp: 10000000, title: "Commit God" },
};

/**
 * Calculate base XP for a single commit
 */
export function calculateXpForCommit(commit: { additions?: number; deletions?: number }): number {
  let xp = XP_PER_COMMIT;

  // Bonus XP for larger commits
  const totalChanges = (commit.additions || 0) + (commit.deletions || 0);
  if (totalChanges > 100) xp += 5;
  if (totalChanges > 500) xp += 10;
  if (totalChanges > 1000) xp += 15;

  return xp;
}

/**
 * Calculate streak bonus XP
 */
export function calculateStreakBonusXp(streak: number): number {
  if (streak < 3) return 0;
  return Math.floor(streak * XP_STREAK_MULTIPLIER);
}

/**
 * Get the title for a given level
 */
export function getTitleForLevel(level: number): string {
  // Find the highest level threshold that's <= current level
  let title = LEVEL_THRESHOLDS[1].title;
  for (const [lvl, data] of Object.entries(LEVEL_THRESHOLDS)) {
    const lvlNum = parseInt(lvl);
    if (level >= lvlNum) {
      title = data.title;
    }
  }
  return title;
}

/**
 * Get XP required for a specific level
 */
export function getRequiredXpForLevel(level: number): number {
  for (const [lvl, data] of Object.entries(LEVEL_THRESHOLDS)) {
    const lvlNum = parseInt(lvl);
    if (lvlNum === level) {
      return data.requiredXp;
    }
  }
  // Default: exponential growth for undefined levels
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * Get the current level from total XP
 */
export function getLevelFromXp(totalXp: number): number {
  let level = 1;
  for (const [lvl, data] of Object.entries(LEVEL_THRESHOLDS)) {
    const lvlNum = parseInt(lvl);
    if (totalXp >= data.requiredXp) {
      level = lvlNum;
    }
  }
  return level;
}

/**
 * Add XP to a user and check for level up
 */
export async function addXpToUser(
  userId: string,
  xp: number,
  reason: string
): Promise<{ leveledUp: boolean; newLevel: number; newXp: number }> {
  // Get or create UserLevel
  let userLevel = await prisma.userLevel.findUnique({
    where: { userId },
  });

  if (!userLevel) {
    userLevel = await prisma.userLevel.create({
      data: {
        userId,
        level: 1,
        xp: 0,
        totalXp: 0,
        title: LEVEL_THRESHOLDS[1].title,
      },
    });
  }

  const oldLevel = userLevel.level;
  const newTotalXp = userLevel.totalXp + xp;
  const newLevel = getLevelFromXp(newTotalXp);
  const newTitle = getTitleForLevel(newLevel);

  // Update user level
  const updated = await prisma.userLevel.update({
    where: { userId },
    data: {
      xp: userLevel.xp + xp,
      totalXp: newTotalXp,
      level: newLevel,
      title: newTitle,
    },
  });

  return {
    leveledUp: newLevel > oldLevel,
    newLevel,
    newXp: updated.xp,
  };
}

/**
 * Get user's current XP and level
 */
export async function getUserXp(userId: string) {
  const userLevel = await prisma.userLevel.findUnique({
    where: { userId },
  });

  if (!userLevel) {
    return {
      level: 1,
      xp: 0,
      totalXp: 0,
      title: LEVEL_THRESHOLDS[1].title,
      xpToNextLevel: LEVEL_THRESHOLDS[2].requiredXp,
    };
  }

  const nextLevel = userLevel.level + 1;
  const xpToNextLevel = getRequiredXpForLevel(nextLevel) - userLevel.totalXp;

  return {
    level: userLevel.level,
    xp: userLevel.xp,
    totalXp: userLevel.totalXp,
    title: userLevel.title || LEVEL_THRESHOLDS[1].title,
    xpToNextLevel: Math.max(0, xpToNextLevel),
  };
}

/**
 * Award XP for an achievement unlock
 */
export async function awardAchievementXp(
  userId: string,
  achievementId: string,
  xpReward: number
): Promise<{ leveledUp: boolean; newLevel: number }> {
  const result = await addXpToUser(userId, xpReward, `achievement:${achievementId}`);
  return result;
}
