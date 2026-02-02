import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      profile: profile || {
        bio: null,
        location: null,
        website: null,
        showActivity: true,
        showStats: true,
        showAchievements: true,
        customTheme: null,
      },
    });
  } catch (error) {
    console.error("Profile settings fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bio, location, website, showActivity, showStats, showAchievements, customTheme } = body;

    // Validate URL if provided
    if (website) {
      try {
        new URL(website);
      } catch {
        return NextResponse.json({ error: "Invalid website URL" }, { status: 400 });
      }
    }

    // Upsert profile
    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        bio: bio || null,
        location: location || null,
        website: website || null,
        showActivity: showActivity ?? true,
        showStats: showStats ?? true,
        showAchievements: showAchievements ?? true,
        customTheme: customTheme || null,
      },
      update: {
        bio: bio !== undefined ? bio : undefined,
        location: location !== undefined ? location : undefined,
        website: website !== undefined ? website : undefined,
        showActivity: showActivity !== undefined ? showActivity : undefined,
        showStats: showStats !== undefined ? showStats : undefined,
        showAchievements: showAchievements !== undefined ? showAchievements : undefined,
        customTheme: customTheme !== undefined ? customTheme : undefined,
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Profile settings update error:", error);
    return NextResponse.json({ error: "Failed to update profile settings" }, { status: 500 });
  }
}
