// app/[vaultSlug]/api/sessions/[sessionId]/transcript-search/route.ts
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ vaultSlug: string; sessionId: string }> }
) {
  const { sessionId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const query = req.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const transcription = await db.transcription.findUnique({
    where: { audioSessionId: sessionId },
    select: { content: true },
  });

  if (!transcription) return NextResponse.json({ results: [] });

  const paragraphs = transcription.content.split("\n").filter(Boolean);
  const lowerQuery = query.toLowerCase();

  const results = paragraphs
    .map((text, index) => ({ text, index }))
    .filter(({ text }) => text.toLowerCase().includes(lowerQuery));

  return NextResponse.json({ results });
}