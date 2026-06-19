import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const invite = await db.invite.findUnique({
    where: { token },
  });

  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    // Generic error — don't reveal which condition failed
    return NextResponse.json({ ok: false, error: "Invalid or expired invitation" }, { status: 400 });
  }

  // Return only what the signup form needs
  return NextResponse.json({
    ok: true,
    data: { name: invite.name, email: invite.email },
  });
}
