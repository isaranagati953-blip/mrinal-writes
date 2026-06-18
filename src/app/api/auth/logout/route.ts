import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionCookie, clearSessionCookie, verifyToken, audit } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = getSessionCookie();

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      // Delete session from DB — token is now dead even if someone saved it
      await db.session.deleteMany({ where: { id: payload.sessionId } });
      await audit("LOGOUT", { userId: payload.userId });
    }
  }

  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
