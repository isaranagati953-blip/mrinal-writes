import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET  = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = "sp_session";
const VAULT_SLUG  = process.env.VAULT_SLUG!;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Routes requiring authentication
  const isVaultRoute =
    pathname.startsWith(`/${VAULT_SLUG}/dashboard`) ||
    pathname.startsWith(`/${VAULT_SLUG}/sessions`) ||
    pathname.startsWith(`/${VAULT_SLUG}/notes`);

  const isAdminRoute  = pathname.startsWith("/admin");
  const isApiAdmin    = pathname.startsWith("/api/admin");

  if (!isVaultRoute && !isAdminRoute && !isApiAdmin) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    if (isApiAdmin || (isVaultRoute && pathname.startsWith("/api/"))) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL(`/${VAULT_SLUG}/enter`, req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Admin-only routes return 404 to non-admins (don't reveal existence)
    if ((isAdminRoute || isApiAdmin) && payload.role !== "ADMIN") {
      return new NextResponse(null, { status: 404 });
    }

    const headers = new Headers(req.headers);
    headers.set("x-user-id",    payload.userId   as string);
    headers.set("x-user-role",  payload.role     as string);
    headers.set("x-session-id", payload.sessionId as string);

    return NextResponse.next({ request: { headers } });
  } catch {
    const response = NextResponse.redirect(new URL(`/${VAULT_SLUG}/enter`, req.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
