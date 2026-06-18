import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit } from "@/lib/auth";

const schema = z.object({ isActive: z.boolean() });

export async function PATCH(
  req: NextRequest,
  { params }: { params: { memberId: string } }
) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const { isActive } = schema.parse(await req.json());

    const member = await db.user.findUnique({ where: { id: params.memberId } });
    if (!member || member.role === "ADMIN") {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    await db.user.update({
      where: { id: params.memberId },
      data: { isActive },
    });

    // Revoke all active sessions immediately if deactivating
    if (!isActive) {
      await db.session.deleteMany({ where: { userId: params.memberId } });
    }

    await audit(isActive ? "MEMBER_RESTORED" : "MEMBER_REVOKED", {
      userId: admin.id,
      detail: { memberId: params.memberId, email: member.email },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
