import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getChallengeHistory } from "@/lib/challenges";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await getChallengeHistory(session.user.id);

    return NextResponse.json(history);
  } catch (error) {
    console.error("Challenge history fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch challenge history" }, { status: 500 });
  }
}
