import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkAchievements } from "@/lib/achievements";

// Store last checked timestamp per user (in production, use Redis)
const lastChecked = new Map<string, number>();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check for new achievements
    const newlyUnlocked = await checkAchievements(userId);

    return NextResponse.json({ newlyUnlocked });
  } catch (error) {
    console.error("Achievements check error:", error);
    return NextResponse.json({ error: "Failed to check achievements" }, { status: 500 });
  }
}
