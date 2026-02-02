import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyGitHubSignature } from "@/lib/crypto";
import { updateUserStats, checkAchievements } from "@/lib/achievements";

interface GitHubPushPayload {
  ref: string;
  repository: {
    id: number;
    full_name: string;
    html_url: string;
  };
  commits: Array<{
    id: string;
    message: string;
    timestamp: string;
    added: string[];
    removed: string[];
    modified: string[];
  }>;
  pusher: {
    email: string;
    name: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get signature from headers
    const signature = request.headers.get("x-hub-signature-256");
    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 401 });
    }

    // Get raw body for signature verification
    const rawBody = await request.text();

    // Find the tracked repo by repo name
    const body: GitHubPushPayload = JSON.parse(rawBody);
    const repoName = body.repository.full_name;
    const repoId = body.repository.id.toString();

    // Find the tracked repo
    const trackedRepo = await prisma.trackedRepo.findFirst({
      where: {
        provider: "github",
        repoId,
        isActive: true,
      },
      include: { user: true },
    });

    if (!trackedRepo || !trackedRepo.webhookSecret) {
      return NextResponse.json({ error: "Repo not found" }, { status: 404 });
    }

    // Verify signature
    const isValid = verifyGitHubSignature(
      rawBody,
      signature,
      trackedRepo.webhookSecret
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Get branch from ref (refs/heads/main -> main)
    const branch = body.ref.replace("refs/heads/", "");

    // Process commits
    const newCommits: Date[] = [];
    for (const commit of body.commits) {
      const commitDate = new Date(commit.timestamp);

      try {
        await prisma.commit.create({
          data: {
            userId: trackedRepo.userId,
            repoId: trackedRepo.id,
            provider: "github",
            sha: commit.id,
            message: commit.message,
            committedAt: commitDate,
            branch,
            additions: commit.added.length,
            deletions: commit.removed.length,
          },
        });
        newCommits.push(commitDate);
      } catch {
        // Commit already exists (unique constraint), skip
      }
    }

    // Update stats if we have new commits
    if (newCommits.length > 0) {
      await updateUserStats(trackedRepo.userId, newCommits);

      // Check for new achievements
      const newlyUnlocked = await checkAchievements(trackedRepo.userId);

      return NextResponse.json({
        success: true,
        commitsProcessed: newCommits.length,
        newlyUnlocked,
      });
    }

    return NextResponse.json({ success: true, commitsProcessed: 0 });
  } catch (error) {
    console.error("GitHub webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
