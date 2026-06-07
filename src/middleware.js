import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  canAccessPortal,
  verifySessionToken,
} from "@/src/lib/security/session";

// Public routes that don't require authentication
const publicRoutes = ["/login", "/", "/about", "/events", "/contact"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth/session")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    const session = await verifySessionToken(
      request.cookies.get(SESSION_COOKIE_NAME)?.value,
    ).catch(() => null);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/events/"),
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const portal = pathname.startsWith("/boys")
    ? "boys"
    : pathname.startsWith("/girls")
      ? "girls"
      : null;

  if (portal) {
    const session = await verifySessionToken(
      request.cookies.get(SESSION_COOKIE_NAME)?.value,
    ).catch(() => null);
    if (!session) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "";
      return NextResponse.redirect(loginUrl);
    }
    if (!canAccessPortal(session.role, portal)) {
      const allowedUrl = request.nextUrl.clone();
      allowedUrl.pathname = `/${session.portal}/dashboard`;
      allowedUrl.search = "";
      return NextResponse.redirect(allowedUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
