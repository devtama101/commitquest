import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  generateDailyChallenges,
  generateWeeklyChallenges,
  getUserChallenges,
  updateChallengeProgress,
  claimChallengeReward,
} from "@/lib/challenges";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate challenges if needed
    await generateDailyChallenges(session.user.id);
    await generateWeeklyChallenges(session.user.id);

    // Update progress
    await updateChallengeProgress(session.user.id);

    // Get challenges
    const challenges = await getUserChallenges(session.user.id);

    return NextResponse.json(challenges);
  } catch (error) {
    console.error("Challenges fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, userChallengeId } = body;

    if (action === "claim" && userChallengeId) {
      const result = await claimChallengeReward(session.user.id, userChallengeId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Challenges action error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to perform action" },
      { status: 500 }
    );
  }
}
