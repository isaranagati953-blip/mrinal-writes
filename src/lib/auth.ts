import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const SESSION_DURATION = process.env.SESSION_DURATION ?? "7d";
const COOKIE_NAME = "sp_session"; // generic name, not revealing

// ── Password hashing ─────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── JWT ──────────────────────────────────────────────────
export async function createToken(payload: {
  userId: string;
  sessionId: string;
  role: string;
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<{ userId: string; sessionId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; sessionId: string; role: string };
  } catch {
    return null;
  }
}

// ── Session cookie ───────────────────────────────────────
export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,       // JS cannot read this cookie
    secure: true,         // HTTPS only
    sameSite: "strict",   // no cross-site leakage
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: "/",
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export function getSessionCookie(): string | undefined {
  return cookies().get(COOKIE_NAME)?.value;
}

// ── Get current user from request ───────────────────────
export async function getCurrentUser() {
  const token = getSessionCookie();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  // Verify session still exists in DB (allows instant revocation)
  const session = await db.session.findUnique({
    where: { id: payload.sessionId, token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  if (!session.user.isActive) return null;

  return session.user;
}

// ── Audit logger ─────────────────────────────────────────
export async function audit(
  action: string,
  opts: {
    userId?: string;
    detail?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
  } = {}
) {
  await db.auditLog.create({
    data: {
      action,
      userId: opts.userId ?? null,
      detail: opts.detail ? JSON.stringify(opts.detail) : null,
      ipAddress: opts.ip ?? null,
      userAgent: opts.userAgent ?? null,
    },
  });
}
