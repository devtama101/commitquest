import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserXp } from "@/lib/xp";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const xpData = await getUserXp(session.user.id);

    return NextResponse.json(xpData);
  } catch (error) {
    console.error("XP fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch XP" }, { status: 500 });
  }
}
