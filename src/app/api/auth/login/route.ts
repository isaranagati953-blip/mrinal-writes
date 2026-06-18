import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword, createToken, setSessionCookie, audit } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "";

  try {
    const body = schema.parse(await req.json());

    const user = await db.user.findUnique({ where: { email: body.email.toLowerCase() } });

    // Always run bcrypt even if user not found — prevents timing attacks
    const dummyHash = "$2b$12$invalidhashtopreventtimingattacks000000000000000000000";
    const passwordValid = await verifyPassword(
      body.password,
      user?.passwordHash ?? dummyHash
    );

    if (!user || !passwordValid || !user.isActive) {
      await audit("LOGIN_FAILED", { ip, detail: { email: body.email }, userAgent: ua });
      // Generic error — don't reveal whether email exists
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Create server-side session record
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const token = await createToken({ userId: user.id, sessionId, role: user.role });

    await db.session.create({
      data: { id: sessionId, userId: user.id, token, ipAddress: ip, userAgent: ua, expiresAt },
    });

    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await audit("LOGIN_SUCCESS", { userId: user.id, ip, userAgent: ua });

    setSessionCookie(token);

    return NextResponse.json({ ok: true, data: { role: user.role } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
    console.error("[login]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
