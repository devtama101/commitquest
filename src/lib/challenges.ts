import { prisma } from "./prisma";

// Challenge templates
const DAILY_CHALLENGE_TEMPLATES = [
  {
    title: "Commit Streak",
    description: "Make {goal} commits today",
    icon: "🔥",
    rewardXp: 50,
  },
  {
    title: "Early Bird",
    description: "Make a commit before 9 AM",
    icon: "🌅",
    rewardXp: 30,
  },
  {
    title: "Night Owl",
    description: "Make a commit after 10 PM",
    icon: "🦉",
    rewardXp: 30,
  },
  {
    title: "Code Warrior",
    description: "Add {goal}+ lines of code",
    icon: "⚔️",
    rewardXp: 40,
  },
  {
    title: "Repo Explorer",
    description: "Commit to at least {goal} different repos",
    icon: "🗺️",
    rewardXp: 35,
  },
  {
    title: "Message Master",
    description: "Make {goal} commits with descriptive messages",
    icon: "✍️",
    rewardXp: 25,
  },
];

const WEEKLY_CHALLENGE_TEMPLATES = [
  {
    title: "Week Warrior",
    description: "Make {goal} commits this week",
    icon: "⚔️",
    rewardXp: 200,
  },
  {
    title: "Streak Master",
    description: "Maintain a {goal} day commit streak",
    icon: "🔥",
    rewardXp: 150,
  },
  {
    title: "Polyglot",
    description: "Commit to at least {goal} different repositories",
    icon: "🌐",
    rewardXp: 100,
  },
];

/**
 * Generate daily challenges for a user
 */
export async function generateDailyChallenges(userId: string) {
  // Check if daily challenges already exist for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingDaily = await prisma.userChallenge.count({
    where: {
      userId,
      challenge: {
        type: "daily",
        startDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    },
  });

  if (existingDaily > 0) {
    return; // Daily challenges already generated
  }

  // Select 3 random daily challenge templates
  const shuffled = [...DAILY_CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
  const selectedTemplates = shuffled.slice(0, 3);

  // Create challenges
  for (const template of selectedTemplates) {
    const goal = Math.floor(Math.random() * 5) + 3; // Random goal between 3-7
    const description = template.description.replace("{goal}", goal.toString());

    const challenge = await prisma.challenge.create({
      data: {
        title: template.title,
        description,
        type: "daily",
        goal,
        rewardXp: template.rewardXp,
        icon: template.icon,
        startDate: today,
        endDate: tomorrow,
        isActive: true,
      },
    });

    // Assign to user
    await prisma.userChallenge.create({
      data: {
        userId,
        challengeId: challenge.id,
        progress: 0,
        completed: false,
      },
    });
  }
}

/**
 * Generate weekly challenge for a user
 */
export async function generateWeeklyChallenges(userId: string) {
  // Check if weekly challenge already exists for this week
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const existingWeekly = await prisma.userChallenge.count({
    where: {
      userId,
      challenge: {
        type: "weekly",
        startDate: {
          gte: startOfWeek,
        },
      },
    },
  });

  if (existingWeekly > 0) {
    return; // Weekly challenge already generated
  }

  // Select 1 random weekly challenge template
  const template = WEEKLY_CHALLENGE_TEMPLATES[Math.floor(Math.random() * WEEKLY_CHALLENGE_TEMPLATES.length)];
  const goal = Math.floor(Math.random() * 20) + 10; // Random goal between 10-30
  const description = template.description.replace("{goal}", goal.toString());

  const challenge = await prisma.challenge.create({
    data: {
      title: template.title,
      description,
      type: "weekly",
      goal,
      rewardXp: template.rewardXp,
      icon: template.icon,
      startDate: startOfWeek,
      endDate: endOfWeek,
      isActive: true,
    },
  });

  // Assign to user
  await prisma.userChallenge.create({
    data: {
      userId,
      challengeId: challenge.id,
      progress: 0,
      completed: false,
    },
  });
}

/**
 * Update challenge progress based on user activity
 */
export async function updateChallengeProgress(userId: string) {
  // Get active challenges for user
  const activeChallenges = await prisma.userChallenge.findMany({
    where: {
      userId,
      completed: false,
      challenge: {
        isActive: true,
      },
    },
    include: {
      challenge: true,
    },
  });

  // Get user's recent commits for progress calculation
  const now = new Date();

  for (const userChallenge of activeChallenges) {
    const challenge = userChallenge.challenge;
    let progress = userChallenge.progress;
    let completed = false;

    // Calculate progress based on challenge type
    if (challenge.type === "daily") {
      // For daily challenges, count commits from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (challenge.title === "Commit Streak" || challenge.title === "Week Warrior") {
        const commitCount = await prisma.commit.count({
          where: {
            userId,
            committedAt: {
              gte: challenge.startDate,
              lt: challenge.endDate || now,
            },
          },
        });
        progress = Math.min(commitCount, challenge.goal);
        completed = progress >= challenge.goal;
      } else if (challenge.title === "Early Bird") {
        const earlyCommits = await prisma.commit.count({
          where: {
            userId,
            committedAt: {
              gte: challenge.startDate,
              lt: challenge.endDate || now,
            },
          },
        });
        // Check if any commit was made before 9 AM
        const hasEarlyCommit = earlyCommits > 0;
        progress = hasEarlyCommit ? 1 : 0;
        completed = hasEarlyCommit;
      } else if (challenge.title === "Night Owl") {
        const lateCommits = await prisma.commit.count({
          where: {
            userId,
            committedAt: {
              gte: challenge.startDate,
              lt: challenge.endDate || now,
            },
          },
        });
        // Check if any commit was made after 10 PM
        const hasLateCommit = lateCommits > 0;
        progress = hasLateCommit ? 1 : 0;
        completed = hasLateCommit;
      } else if (challenge.title === "Code Warrior") {
        const commits = await prisma.commit.findMany({
          where: {
            userId,
            committedAt: {
              gte: challenge.startDate,
              lt: challenge.endDate || now,
            },
          },
          select: { additions: true },
        });
        const totalLines = commits.reduce((sum, c) => sum + (c.additions || 0), 0);
        progress = Math.min(totalLines, challenge.goal);
        completed = progress >= challenge.goal;
      } else if (challenge.title === "Repo Explorer" || challenge.title === "Polyglot") {
        const commits = await prisma.commit.findMany({
          where: {
            userId,
            committedAt: {
              gte: challenge.startDate,
              lt: challenge.endDate || now,
            },
          },
          select: { repoId: true },
          distinct: ["repoId"],
        });
        progress = Math.min(commits.length, challenge.goal);
        completed = progress >= challenge.goal;
      } else if (challenge.title === "Message Master") {
        const commits = await prisma.commit.findMany({
          where: {
            userId,
            committedAt: {
              gte: challenge.startDate,
              lt: challenge.endDate || now,
            },
            message: {
              not: "",
            },
          },
        });
        const descriptiveCommits = commits.filter((c) => c.message && c.message.length > 10);
        progress = Math.min(descriptiveCommits.length, challenge.goal);
        completed = progress >= challenge.goal;
      } else if (challenge.title === "Streak Master") {
        // Get current streak from user stats
        const stats = await prisma.userStats.findUnique({
          where: { userId },
        });
        progress = Math.min(stats?.currentStreak || 0, challenge.goal);
        completed = progress >= challenge.goal;
      }
    }

    // Update progress
    await prisma.userChallenge.update({
      where: { id: userChallenge.id },
      data: {
        progress,
        completed,
        completedAt: completed && !userChallenge.completed ? new Date() : userChallenge.completedAt,
      },
    });
  }
}

/**
 * Claim challenge reward
 */
export async function claimChallengeReward(
  userId: string,
  userChallengeId: string
): Promise<{ success: boolean; xpAwarded: number; leveledUp?: boolean; newLevel?: number }> {
  const userChallenge = await prisma.userChallenge.findUnique({
    where: { id: userChallengeId },
    include: {
      challenge: true,
    },
  });

  if (!userChallenge || userChallenge.userId !== userId) {
    throw new Error("Challenge not found");
  }

  if (!userChallenge.completed) {
    throw new Error("Challenge not completed");
  }

  if (userChallenge.claimedAt) {
    throw new Error("Reward already claimed");
  }

  // Mark as claimed
  await prisma.userChallenge.update({
    where: { id: userChallengeId },
    data: { claimedAt: new Date() },
  });

  // Award XP
  const { addXpToUser } = await import("./xp");
  const { leveledUp, newLevel } = await addXpToUser(
    userId,
    userChallenge.challenge.rewardXp,
    `challenge:${userChallenge.challenge.id}`
  );

  return {
    success: true,
    xpAwarded: userChallenge.challenge.rewardXp,
    leveledUp,
    newLevel,
  };
}

/**
 * Get active challenges for a user
 */
export async function getUserChallenges(userId: string) {
  const userChallenges = await prisma.userChallenge.findMany({
    where: {
      userId,
      challenge: {
        isActive: true,
      },
    },
    include: {
      challenge: true,
    },
    orderBy: {
      challenge: {
        startDate: "desc",
      },
    },
  });

  // Separate into active and completed but not claimed
  const active = userChallenges.filter(
    (uc) => !uc.completed && new Date(uc.challenge.endDate || Date.now() + 86400000) > new Date()
  );
  const completed = userChallenges.filter((uc) => uc.completed && !uc.claimedAt);
  const claimed = userChallenges.filter((uc) => uc.claimedAt);

  return {
    active,
    completed,
    claimed,
  };
}

/**
 * Get challenge history for a user
 */
export async function getChallengeHistory(userId: string) {
  const userChallenges = await prisma.userChallenge.findMany({
    where: {
      userId,
      claimedAt: { not: null },
    },
    include: {
      challenge: true,
    },
    orderBy: {
      claimedAt: "desc",
    },
    take: 20,
  });

  return userChallenges.map((uc) => ({
    id: uc.challenge.id,
    title: uc.challenge.title,
    description: uc.challenge.description,
    icon: uc.challenge.icon,
    rewardXp: uc.challenge.rewardXp,
    type: uc.challenge.type,
    completedAt: uc.completedAt,
    claimedAt: uc.claimedAt,
  }));
}
