import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "all"; // "week", "month", "year", "all"

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date(0); // Beginning of time

    if (period === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    // Fetch commits for the period
    const commits = await prisma.commit.findMany({
      where: {
        userId: session.user.id,
        committedAt: {
          gte: startDate,
        },
      },
      select: {
        id: true,
        sha: true,
        message: true,
        committedAt: true,
        additions: true,
        deletions: true,
        repo: {
          select: {
            repoName: true,
          },
        },
      },
      orderBy: {
        committedAt: "desc",
      },
    });

    if (commits.length === 0) {
      return NextResponse.json({
        period,
        totalCommits: 0,
        dayOfWeekData: [],
        hourlyData: [],
        repoDistribution: [],
        stats: {
          avgCommitsPerDay: 0,
          longestGap: 0,
          totalAdditions: 0,
          totalDeletions: 0,
        },
        topWords: [],
      });
    }

    // Day of week analysis
    const dayOfWeekMap = new Map<number, number>();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    commits.forEach((commit) => {
      const day = commit.committedAt.getDay();
      dayOfWeekMap.set(day, (dayOfWeekMap.get(day) || 0) + 1);
    });

    const dayOfWeekData = dayNames.map((name, index) => ({
      day: name,
      commits: dayOfWeekMap.get(index) || 0,
    }));

    // Hourly analysis
    const hourlyMap = new Map<number, number>();
    commits.forEach((commit) => {
      const hour = commit.committedAt.getHours();
      hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
    });

    const hourlyData = Array.from({ length: 24 }, (_, index) => ({
      hour: index,
      commits: hourlyMap.get(index) || 0,
    }));

    // Repo distribution
    const repoMap = new Map<string, { commits: number; additions: number; deletions: number }>();
    commits.forEach((commit) => {
      const repoName = commit.repo?.repoName || "Unknown";
      const existing = repoMap.get(repoName) || { commits: 0, additions: 0, deletions: 0 };
      existing.commits++;
      existing.additions += commit.additions || 0;
      existing.deletions += commit.deletions || 0;
      repoMap.set(repoName, existing);
    });

    const repoDistribution = Array.from(repoMap.entries()).map(([name, data]) => ({
      name,
      commits: data.commits,
      additions: data.additions,
      deletions: data.deletions,
    })).sort((a, b) => b.commits - a.commits);

    // Calculate stats
    const earliestCommit = commits[commits.length - 1]?.committedAt || now;
    const daysSpan = Math.max(1, Math.ceil((now.getTime() - earliestCommit.getTime()) / (1000 * 60 * 60 * 24)));
    const avgCommitsPerDay = Math.round((commits.length / daysSpan) * 10) / 10;

    // Calculate longest gap between commits
    let longestGap = 0;
    for (let i = 0; i < commits.length - 1; i++) {
      const gap = commits[i].committedAt.getTime() - commits[i + 1].committedAt.getTime();
      const gapDays = Math.round(gap / (1000 * 60 * 60 * 24));
      if (gapDays > longestGap) {
        longestGap = gapDays;
      }
    }

    // Calculate totals
    const totalAdditions = commits.reduce((sum, c) => sum + (c.additions || 0), 0);
    const totalDeletions = commits.reduce((sum, c) => sum + (c.deletions || 0), 0);

    // Extract words from commit messages (excluding common words)
    const commonWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
      "of", "with", "by", "from", "fix", "add", "update", "remove", "delete",
      "create", "modify", "change", "refactor", "wip", "feat", "chore", "style",
      "test", "docs", "build", "ci", "perf", "revert", "init", "impl", "use",
    ]);

    const wordMap = new Map<string, number>();
    commits.forEach((commit) => {
      const words = commit.message
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !commonWords.has(w));

      words.forEach((word) => {
        wordMap.set(word, (wordMap.get(word) || 0) + 1);
      });
    });

    const topWords = Array.from(wordMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    // Best day and hour
    const bestDayIndex = Array.from(dayOfWeekMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;
    const bestHourIndex = Array.from(hourlyMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;

    return NextResponse.json({
      period,
      totalCommits: commits.length,
      dayOfWeekData,
      hourlyData,
      repoDistribution,
      bestDay: dayNames[bestDayIndex],
      bestHour: bestHourIndex,
      stats: {
        avgCommitsPerDay,
        longestGap,
        totalAdditions,
        totalDeletions,
        daysSpan,
      },
      topWords,
    });
  } catch (error) {
    console.error("Insights fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
