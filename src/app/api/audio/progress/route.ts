import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  sessionId: z.string().cuid(),
  positionSecs: z.number().int().min(0),
  completed: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());

    await db.progress.upsert({
      where: {
        userId_audioSessionId: {
          userId: user.id,
          audioSessionId: body.sessionId,
        },
      },
      create: {
        userId: user.id,
        audioSessionId: body.sessionId,
        positionSecs: body.positionSecs,
        completedAt: body.completed ? new Date() : null,
      },
      update: {
        positionSecs: body.positionSecs,
        ...(body.completed ? { completedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
