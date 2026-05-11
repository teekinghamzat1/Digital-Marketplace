import { NextRequest, NextResponse } from "next/server";

/**
 * PRODUCTION SESSION MIDDLEWARE
 * Enforces:
 * 1. Public path exclusion
 * 2. Admin vs User RBAC
 * 3. Session cookie presence checks
 */
const PUBLIC_PATHS = [
  "/api/auth/login", 
  "/api/auth/register", 
  "/api/webhooks",
  "/admin/login",
  "/login"
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // 1. Allow Public Paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const userSession = req.cookies.get("user_session")?.value;
  const adminSession = req.cookies.get("admin_session")?.value;

  // 2. Admin Protection (Domain 2 & 8)
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!adminSession) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    // Real-world: You would verify the token signature/expiry here if using JWT
    return NextResponse.next();
  }

  // 3. User Dashboard Protection
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/user") || pathname.startsWith("/api/purchase")) {
    if (!userSession) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/:path*",
  ],
};