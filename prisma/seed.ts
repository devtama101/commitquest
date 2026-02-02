import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const achievements = [
  // Streak achievements
  {
    slug: "streak-7",
    name: "Week Warrior",
    description: "7-day commit streak",
    icon: "🔥",
    category: "streak",
    threshold: 7,
    rarity: "common",
    xpReward: 50,
  },
  {
    slug: "streak-30",
    name: "Monthly Master",
    description: "30-day commit streak",
    icon: "💪",
    category: "streak",
    threshold: 30,
    rarity: "rare",
    xpReward: 200,
  },
  {
    slug: "streak-100",
    name: "Centurion",
    description: "100-day commit streak",
    icon: "👑",
    category: "streak",
    threshold: 100,
    rarity: "legendary",
    xpReward: 1000,
  },

  // Volume achievements
  {
    slug: "commits-1",
    name: "First Blood",
    description: "Your first tracked commit",
    icon: "🎯",
    category: "volume",
    threshold: 1,
    rarity: "common",
    xpReward: 10,
  },
  {
    slug: "commits-100",
    name: "Century",
    description: "100 total commits",
    icon: "💯",
    category: "volume",
    threshold: 100,
    rarity: "common",
    xpReward: 100,
  },
  {
    slug: "commits-500",
    name: "Prolific",
    description: "500 total commits",
    icon: "⚡",
    category: "volume",
    threshold: 500,
    rarity: "rare",
    xpReward: 500,
  },
  {
    slug: "commits-1000",
    name: "Thousand Club",
    description: "1000 total commits",
    icon: "🏆",
    category: "volume",
    threshold: 1000,
    rarity: "epic",
    xpReward: 1000,
  },

  // Time-based achievements
  {
    slug: "night-owl",
    name: "Night Owl",
    description: "Commit between midnight and 5am",
    icon: "🦉",
    category: "time",
    threshold: 1,
    rarity: "rare",
    xpReward: 50,
  },
  {
    slug: "early-bird",
    name: "Early Bird",
    description: "Commit between 5am and 7am",
    icon: "🐦",
    category: "time",
    threshold: 1,
    rarity: "rare",
    xpReward: 50,
  },
  {
    slug: "weekend-warrior",
    name: "Weekend Warrior",
    description: "Commit on Saturday and Sunday",
    icon: "⚔️",
    category: "time",
    threshold: 1,
    rarity: "common",
    xpReward: 30,
  },

  // Special achievements
  {
    slug: "multi-platform",
    name: "Multiverse",
    description: "Connect both GitHub and GitLab",
    icon: "🌐",
    category: "special",
    threshold: 1,
    rarity: "rare",
    xpReward: 100,
  },
  {
    slug: "first-repo",
    name: "Pioneer",
    description: "Track your first repository",
    icon: "🚀",
    category: "special",
    threshold: 1,
    rarity: "common",
    xpReward: 20,
  },
];

async function main() {
  console.log("🌱 Seeding achievements...");

  // Use upsert to handle existing achievements
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { slug: achievement.slug },
      update: {},
      create: achievement,
    });
  }

  console.log(`✅ Seeded ${achievements.length} achievements`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
