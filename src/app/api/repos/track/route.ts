import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createGitHubWebhook, createGitLabWebhook } from "@/lib/webhooks";
import { generateWebhookSecret } from "@/lib/crypto";
import { checkAchievements } from "@/lib/achievements";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { repoId, repoName, repoUrl, provider, accountId } = body;

    if (!repoId || !repoName || !repoUrl || !provider || !accountId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify the account belongs to the user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: session.user.id,
        provider,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Invalid account" }, { status: 400 });
    }

    // Check if already tracking
    const existing = await prisma.trackedRepo.findFirst({
      where: {
        userId: session.user.id,
        provider,
        repoId,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already tracking this repo" }, { status: 400 });
    }

    // Try to create webhook (will fail for localhost URLs in dev)
    let webhookId: string | null = null;
    let webhookSecret: string | null = null;
    const webhookBaseUrl = process.env.WEBHOOK_BASE_URL || "http://localhost:3000";
    const webhookUrl = `${webhookBaseUrl}/api/webhooks/${provider}`;

    // Skip webhook creation for localhost in development
    if (!webhookBaseUrl.includes("localhost") && account.access_token) {
      const secret = generateWebhookSecret();
      if (provider === "github") {
        const result = await createGitHubWebhook(
          account.access_token,
          repoName,
          webhookUrl,
          secret
        );
        if (result) {
          webhookId = result.id;
          webhookSecret = secret;
        }
      } else if (provider === "gitlab") {
        const result = await createGitLabWebhook(
          account.access_token,
          repoId,
          webhookUrl,
          secret
        );
        if (result) {
          webhookId = result.id;
          webhookSecret = secret;
        }
      }
    }

    // Create tracked repo record (with or without webhook)
    const trackedRepo = await prisma.trackedRepo.create({
      data: {
        userId: session.user.id,
        accountId,
        provider,
        repoId,
        repoName,
        repoUrl,
        webhookId,
        webhookSecret,
      },
    });

    // Check for "first-repo" achievement
    const newlyUnlocked = await checkAchievements(session.user.id);

    return NextResponse.json({
      success: true,
      repo: trackedRepo,
      newlyUnlocked,
      webhookSkipped: !webhookId,
    });
  } catch (error) {
    console.error("Repo track error:", error);
    return NextResponse.json({ error: "Failed to track repo" }, { status: 500 });
  }
}
