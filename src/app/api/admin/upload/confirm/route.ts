import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, audit } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({ sessionId: z.string().cuid() });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const { sessionId } = schema.parse(await req.json());

    const session = await db.audioSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      return NextResponse.json({ ok: false, error: "Session not found" }, { status: 404 });
    }

    await audit("SESSION_UPLOAD_COMPLETE", {
      userId: user.id,
      detail: { sessionId, r2Key: session.r2Key },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
