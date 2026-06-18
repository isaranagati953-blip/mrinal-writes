import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, audit } from "@/lib/auth";
import { sendInviteEmail } from "@/lib/email";
import { v4 as uuidv4 } from "uuid";

const schema = z.object({
  name:  z.string().min(1),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase();

    // Check no existing account or pending invite
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ ok: false, error: "An account already exists for this email." }, { status: 409 });
    }

    // If a pending unused invite exists, delete it and re-send
    await db.invite.deleteMany({ where: { email, usedAt: null } });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    await db.invite.create({
      data: {
        token,
        email,
        name: body.name,
        expiresAt,
        createdBy: user.email,
      },
    });

    await sendInviteEmail({ to: email, name: body.name, token });

    await audit("INVITE_SENT", {
      userId: user.id,
      detail: { invitedEmail: email },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: err.errors[0].message }, { status: 400 });
    }
    console.error("[invite]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
