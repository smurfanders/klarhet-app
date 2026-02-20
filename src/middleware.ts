import { NextRequest, NextResponse } from "next/server";

// Middleware runs in an environment where decoding the full iron-session
// is fragile (and may not have access to runtime secrets). For routing
// decisions we only need a cheap, readable indicator that the user is
// authenticated. The API routes remain the source of truth and still use
// the encrypted iron-session cookie.

const PROTECTED = [
  "/dashboard",
  "/api/feedback-requests",
  "/api/dashboard",
  "/api/responses",
];
const AUTH_ROUTES = ["/login", "/setup"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Read a simple client-visible flag set by the login/logout handlers.
  // This can be spoofed by a client but middleware only uses it for UX
  // (redirects). API routes still enforce auth by reading the secure
  // iron-session on the server.
  const loggedFlag = request.cookies.get("klarhet_logged_in")?.value;
  const isLoggedIn = loggedFlag === "1";

  const isProtected = PROTECTED.some((r) => pathname.startsWith(r));
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
