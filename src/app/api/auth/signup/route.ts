import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, createToken, setSessionCookie, audit } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

const schema = z.object({
  token: z.string().uuid(),
  password: z.string().min(12, "Password must be at least 12 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "";

  try {
    const body = schema.parse(await req.json());

    // Re-validate invite (double-check, middleware already checked)
    const invite = await db.invite.findUnique({ where: { token: body.token } });

    if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
      return NextResponse.json({ ok: false, error: "Invalid or expired invitation" }, { status: 400 });
    }

    // Check no account exists yet for this email
    const existing = await db.user.findUnique({ where: { email: invite.email } });
    if (existing) {
      return NextResponse.json({ ok: false, error: "Account already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(body.password);

    // Create user and mark invite as used — in a transaction
    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: invite.email,
          name: invite.name,
          passwordHash,
          role: "MEMBER",
          inviteId: invite.id,
        },
      });

      await tx.invite.update({
        where: { id: invite.id },
        data: { usedAt: new Date() },
      });

      return newUser;
    });

    // Log them in immediately after signup
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const jwtToken = await createToken({ userId: user.id, sessionId, role: user.role });

    await db.session.create({
      data: { id: sessionId, userId: user.id, token: jwtToken, ipAddress: ip, userAgent: ua, expiresAt },
    });

    await audit("SIGNUP_COMPLETE", { userId: user.id, ip, userAgent: ua });

    setSessionCookie(jwtToken);

    return NextResponse.json({ ok: true, data: { role: user.role } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: err.errors[0].message }, { status: 400 });
    }
    console.error("[signup]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
