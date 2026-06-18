import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, audit } from "@/lib/auth";
import { getUploadUrl, buildR2Key } from "@/lib/r2";
import { db } from "@/lib/db";

const schema = z.object({
  filename:    z.string().min(1),
  mimeType:    z.string().min(1),
  fileSize:    z.number().int().positive(),
  title:       z.string().min(1),
  description: z.string().optional(),
  recordedAt:  z.string().min(1),
  tags:        z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = schema.parse(await req.json());
    const recordedDate = new Date(body.recordedAt);
    const year = recordedDate.getFullYear();

    // Build a clean R2 storage key
    const ext = body.filename.split(".").pop() ?? "mp3";
    const r2Key = buildR2Key(year, body.title, ext);

    // Check no duplicate key
    const existing = await db.audioSession.findUnique({ where: { r2Key } });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "A session with this title and year already exists." },
        { status: 409 }
      );
    }

    // Create DB record in draft state
    const session = await db.audioSession.create({
      data: {
        title:       body.title,
        description: body.description ?? null,
        recordedAt:  recordedDate,
        tags:        body.tags ?? null,
        r2Key,
        fileSize:    body.fileSize,
        mimeType:    body.mimeType,
        isPublished: false,
      },
    });

    // Generate pre-signed PUT URL (1 hour to complete upload)
    const uploadUrl = await getUploadUrl(r2Key, body.mimeType, 3600);

    await audit("SESSION_UPLOAD_INIT", {
      userId: user.id,
      detail: { sessionId: session.id, r2Key },
    });

    return NextResponse.json({
      ok: true,
      data: { uploadUrl, sessionId: session.id, r2Key },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: err.errors[0].message }, { status: 400 });
    }
    console.error("[presign]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
