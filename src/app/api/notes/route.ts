import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit } from "@/lib/auth";

const schema = z.object({
  sessionId: z.string().cuid(),
  content: z.string().min(1).max(10000),
  timestampSecs: z.number().int().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());

    // Verify the session exists and is published
    const session = await db.audioSession.findUnique({
      where: { id: body.sessionId, isPublished: true },
    });
    if (!session) return NextResponse.json({ ok: false, error: "Session not found" }, { status: 404 });

    const note = await db.note.create({
      data: {
        userId: user.id,
        audioSessionId: body.sessionId,
        content: body.content,
        timestampSecs: body.timestampSecs ?? null,
      },
    });

    await audit("NOTE_CREATE", { userId: user.id, detail: { noteId: note.id, sessionId: body.sessionId } });

    return NextResponse.json({ ok: true, data: { ...note, createdAt: note.createdAt.toISOString() } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
