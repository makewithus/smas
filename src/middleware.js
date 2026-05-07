import { NextResponse } from "next/server";

// Public routes that don't require authentication
const publicRoutes = ["/login", "/setup", "/", "/about", "/events", "/contact"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/events/"),
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for auth cookie/token
  const authToken = request.cookies.get("auth-token")?.value;
  const userProfile = request.cookies.get("user-profile")?.value;

  // For protected routes, check if user is authenticated
  // Note: In a real app, you would verify the token with Firebase Admin SDK
  // For now, we'll rely on client-side auth and localStorage

  // Allow API routes to pass through (they handle their own auth)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Protected portal routes
  const isBoysRoute = pathname.startsWith("/boys");
  const isGirlsRoute = pathname.startsWith("/girls");
  const isSuperRoute = pathname.startsWith("/super");

  // Let client-side auth handle the redirect
  // This middleware mainly ensures the routes exist
  if (isBoysRoute || isGirlsRoute || isSuperRoute) {
    // In production, you would verify the token here
    // For now, client-side auth will handle redirects
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
