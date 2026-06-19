import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit } from "@/lib/auth";
import { deleteFile } from "@/lib/r2";

const patchSchema = z.object({
  title:               z.string().min(1).optional(),
  description:         z.string().optional(),
  recordedAt:          z.string().optional(),
  tags:                z.string().optional(),
  durationSecs:        z.number().int().optional(),
  isPublished:         z.boolean().optional(),
  sortOrder:           z.number().int().optional(),
  transcription:       z.string().nullable().optional(),
  transcriptVerified:  z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = patchSchema.parse(await req.json());

    const session = await db.audioSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    // Update session fields
    await db.audioSession.update({
      where: { id: sessionId },
      data: {
        ...(body.title        !== undefined && { title: body.title }),
        ...(body.description  !== undefined && { description: body.description }),
        ...(body.recordedAt   !== undefined && { recordedAt: new Date(body.recordedAt) }),
        ...(body.tags         !== undefined && { tags: body.tags }),
        ...(body.durationSecs !== undefined && { durationSecs: body.durationSecs }),
        ...(body.isPublished  !== undefined && { isPublished: body.isPublished }),
        ...(body.sortOrder    !== undefined && { sortOrder: body.sortOrder }),
      },
    });

    // Handle transcription upsert / delete
    if (body.transcription !== undefined) {
      if (body.transcription === null || body.transcription === "") {
        await db.transcription.deleteMany({ where: { audioSessionId: sessionId } });
      } else {
        await db.transcription.upsert({
          where: { audioSessionId: sessionId },
          create: {
            audioSessionId: sessionId,
            content: body.transcription,
            isVerified: body.transcriptVerified ?? false,
          },
          update: {
            content: body.transcription,
            ...(body.transcriptVerified !== undefined && { isVerified: body.transcriptVerified }),
          },
        });
      }
    }

    await audit("SESSION_EDIT", {
      userId: user.id,
      detail: { sessionId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: err.errors[0].message }, { status: 400 });
    }
    console.error("[session patch]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const session = await db.audioSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  // Delete from R2 first, then DB
  try {
    await deleteFile(session.r2Key);
  } catch {
    // Log but don't block — R2 key may already be gone
    console.warn("R2 delete failed for key:", session.r2Key);
  }

  await db.audioSession.delete({ where: { id: sessionId } });

  await audit("SESSION_DELETE", {
    userId: user.id,
    detail: { sessionId, title: session.title },
  });

  return NextResponse.json({ ok: true });
}
