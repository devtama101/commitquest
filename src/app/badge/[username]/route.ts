import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Badge colors
const COLORS = {
  default: { bg: "#F97316", text: "#FFFFFF", border: "#333333" },
  commits: { bg: "#14B8A6", text: "#FFFFFF", border: "#333333" },
  streak: { bg: "#EF4444", text: "#FFFFFF", border: "#333333" },
  level: { bg: "#8B5CF6", text: "#FFFFFF", border: "#333333" },
  achievements: { bg: "#F59E0B", text: "#FFFFFF", border: "#333333" },
  dark: { bg: "#333333", text: "#FFFFFF", border: "#000000" },
  light: { bg: "#FFFFFF", text: "#333333", border: "#CCCCCC" },
};

const STYLE_PRESETS = {
  flat: { radius: 0, shadow: false },
  rounded: { radius: 4, shadow: false },
  "rounded-full": { radius: 12, shadow: false },
  pop: { radius: 6, shadow: true },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const searchParams = request.nextUrl.searchParams;

  const type = searchParams.get("type") || "default"; // default, commits, streak, level, achievements
  const style = searchParams.get("style") || "rounded"; // flat, rounded, rounded-full, pop
  const color = searchParams.get("color") || "default"; // default, dark, light
  const cache = searchParams.get("cache") !== "false"; // enable cache by default

  // Find user by name (case-insensitive search using raw query or multiple users)
  const allUsers = await prisma.user.findMany();
  const user = allUsers.find(
    (u) => u.name?.toLowerCase() === username.toLowerCase() || u.email?.toLowerCase() === username.toLowerCase()
  );

  if (!user) {
    // Return a "user not found" badge
    const svg = generateBadgeSvg("User not found", "Check username", COLORS.light, STYLE_PRESETS.rounded);
    return new NextResponse(svg, {
      status: 404,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": cache ? "public, max-age=60" : "no-cache",
      },
    });
  }

  // Get user stats
  const stats = await prisma.userStats.findUnique({
    where: { userId: user.id },
  });

  // Get user level
  const userLevel = await prisma.userLevel.findUnique({
    where: { userId: user.id },
  });

  // Get achievements count
  const achievementsCount = await prisma.userAchievement.count({
    where: { userId: user.id },
  });

  // Get label and value based on type
  let label = "CommitQuest";
  let value = "";
  let colorScheme = COLORS[type as keyof typeof COLORS] || COLORS.default;

  switch (type) {
    case "commits":
      label = "Commits";
      value = (stats?.totalCommits || 0).toLocaleString();
      colorScheme = COLORS.commits;
      break;
    case "streak":
      label = "Streak";
      value = `${stats?.currentStreak || 0}🔥`;
      colorScheme = COLORS.streak;
      break;
    case "level":
      label = "Level";
      value = `Lvl ${userLevel?.level || 1}`;
      colorScheme = COLORS.level;
      break;
    case "achievements":
      label = "Achievements";
      value = `${achievementsCount}🏆`;
      colorScheme = COLORS.achievements;
      break;
    default:
      label = "CommitQuest";
      value = `Lvl ${userLevel?.level || 1} · ${stats?.totalCommits || 0} commits`;
      colorScheme = COLORS.default;
  }

  // Override color if specified
  if (color !== "default") {
    colorScheme = COLORS[color as keyof typeof COLORS] || COLORS.default;
  }

  const stylePreset = STYLE_PRESETS[style as keyof typeof STYLE_PRESETS] || STYLE_PRESETS.rounded;

  // Generate SVG
  const svg = generateBadgeSvg(label, value, colorScheme, stylePreset);

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": cache ? "public, max-age=300" : "no-cache",
    },
  });
}

function generateBadgeSvg(
  label: string,
  value: string,
  colors: { bg: string; text: string; border: string },
  style: { radius: number; shadow: boolean }
): string {
  // Calculate dimensions
  const padding = 8;
  const fontSize = 12;
  const labelWidth = estimateTextWidth(label, fontSize);
  const valueWidth = estimateTextWidth(value, fontSize);
  const separatorWidth = 2;
  const width = padding * 3 + labelWidth + separatorWidth + valueWidth;
  const height = 24;

  const shadow = style.shadow
    ? `
    <defs>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.2"/>
      </filter>
    </defs>`
    : "";

  const shadowAttr = style.shadow ? 'filter="url(#shadow)"' : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${shadow}
  <g ${shadowAttr}>
    <!-- Background -->
    <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${style.radius}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1"/>

    <!-- Label -->
    <text x="${padding}" y="${height / 2 + fontSize / 2 - 1}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${colors.text}">
      ${label}
    </text>

    <!-- Separator -->
    <rect x="${padding + labelWidth + padding / 2}" y="4" width="${separatorWidth}" height="${height - 8}" fill="${colors.border}" opacity="0.3"/>

    <!-- Value -->
    <text x="${padding + labelWidth + separatorWidth + padding}" y="${height / 2 + fontSize / 2 - 1}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${colors.text}">
      ${value}
    </text>
  </g>
</svg>`;
}

function estimateTextWidth(text: string, fontSize: number): number {
  // Rough estimate: 0.6em per character
  return Math.ceil(text.length * fontSize * 0.6);
}
