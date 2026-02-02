import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyGitLabToken } from "@/lib/crypto";
import { updateUserStats, checkAchievements } from "@/lib/achievements";

interface GitLabPushPayload {
  project: {
    id: number;
    path_with_namespace: string;
    web_url: string;
  };
  ref: string;
  commits: Array<{
    id: string;
    message: string;
    timestamp: string;
    added: string[];
    removed: string[];
    modified: string[];
  }>;
  user_email: string;
  user_name: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get token from headers
    const token = request.headers.get("x-gitlab-token");
    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    // Get raw body
    const rawBody = await request.text();

    // Parse payload
    const body: GitLabPushPayload = JSON.parse(rawBody);
    const repoId = body.project.id.toString();

    // Find the tracked repo
    const trackedRepo = await prisma.trackedRepo.findFirst({
      where: {
        provider: "gitlab",
        repoId,
        isActive: true,
      },
      include: { user: true },
    });

    if (!trackedRepo || !trackedRepo.webhookSecret) {
      return NextResponse.json({ error: "Repo not found" }, { status: 404 });
    }

    // Verify token
    const isValid = verifyGitLabToken(token, trackedRepo.webhookSecret);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
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
            provider: "gitlab",
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
    console.error("GitLab webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
