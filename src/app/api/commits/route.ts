import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const commits = await prisma.commit.findMany({
      where: { userId: session.user.id },
      include: {
        repo: {
          select: {
            repoName: true,
            provider: true,
            repoUrl: true,
          },
        },
      },
      orderBy: { committedAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.commit.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      commits,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Commits fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch commits" }, { status: 500 });
  }
}
