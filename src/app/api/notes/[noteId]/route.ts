import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { noteId: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const schema = z.object({ content: z.string().min(1).max(10000) });

  try {
    const body = schema.parse(await req.json());

    // Ensure the note belongs to this user
    const existing = await db.note.findUnique({ where: { id: params.noteId } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    const updated = await db.note.update({
      where: { id: params.noteId },
      data: { content: body.content },
    });

    await audit("NOTE_EDIT", { userId: user.id, detail: { noteId: params.noteId } });

    return NextResponse.json({ ok: true, data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { noteId: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const existing = await db.note.findUnique({ where: { id: params.noteId } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  await db.note.delete({ where: { id: params.noteId } });
  await audit("NOTE_DELETE", { userId: user.id, detail: { noteId: params.noteId } });

  return NextResponse.json({ ok: true });
}
