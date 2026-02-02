import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteGitHubWebhook, deleteGitLabWebhook } from "@/lib/webhooks";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { repoId } = body;

    if (!repoId) {
      return NextResponse.json({ error: "Missing repoId" }, { status: 400 });
    }

    // Get the tracked repo
    const trackedRepo = await prisma.trackedRepo.findFirst({
      where: {
        id: repoId,
        userId: session.user.id,
      },
    });

    if (!trackedRepo) {
      return NextResponse.json({ error: "Repo not found" }, { status: 404 });
    }

    // Delete webhook from provider if we have the ID
    if (trackedRepo.webhookId) {
      const account = await prisma.account.findFirst({
        where: {
          userId: session.user.id,
          provider: trackedRepo.provider,
        },
      });

      if (account?.access_token) {
        if (trackedRepo.provider === "github") {
          await deleteGitHubWebhook(
            account.access_token,
            trackedRepo.repoName,
            trackedRepo.webhookId
          );
        } else if (trackedRepo.provider === "gitlab") {
          await deleteGitLabWebhook(
            account.access_token,
            trackedRepo.repoId,
            trackedRepo.webhookId
          );
        }
      }
    }

    // Delete the tracked repo (commits will cascade delete)
    await prisma.trackedRepo.delete({
      where: { id: repoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Repo untrack error:", error);
    return NextResponse.json({ error: "Failed to untrack repo" }, { status: 500 });
  }
}
