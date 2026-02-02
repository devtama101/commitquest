import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Timezone for Indonesia (Jakarta - WIB)
const TIMEZONE = "Asia/Jakarta";

function getDateInTimezone(date: Date): Date {
  // Convert to target timezone and get the local date string
  const year = date.toLocaleString("en-US", { timeZone: TIMEZONE, year: "numeric" });
  const month = date.toLocaleString("en-US", { timeZone: TIMEZONE, month: "2-digit" });
  const day = date.toLocaleString("en-US", { timeZone: TIMEZONE, day: "2-digit" });
  return new Date(`${year}-${month}-${day}`);
}

function formatDateKey(date: Date): string {
  const year = date.toLocaleString("en-US", { timeZone: TIMEZONE, year: "numeric" });
  const month = date.toLocaleString("en-US", { timeZone: TIMEZONE, month: "2-digit" });
  const day = date.toLocaleString("en-US", { timeZone: TIMEZONE, day: "2-digit" });
  return `${year}-${month}-${day}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get commits from the last 365 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365);
    startDate.setHours(0, 0, 0, 0);

    const commits = await prisma.commit.findMany({
      where: {
        userId: session.user.id,
        committedAt: { gte: startDate },
      },
      select: {
        committedAt: true,
      },
      orderBy: { committedAt: "asc" },
    });

    // Aggregate by day in Jakarta timezone
    const commitsByDay = new Map<string, number>();

    // Initialize all days with 0
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const key = formatDateKey(date);
      commitsByDay.set(key, 0);
    }

    // Fill in actual commit counts
    for (const commit of commits) {
      const key = formatDateKey(new Date(commit.committedAt));
      commitsByDay.set(key, (commitsByDay.get(key) || 0) + 1);
    }

    // Convert to array format
    const calendarData = Array.from(commitsByDay.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({ calendarData });
  } catch (error) {
    console.error("Calendar fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch calendar data" }, { status: 500 });
  }
}
