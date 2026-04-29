import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "super_secret_string"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin route protection
  if (
    (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) &&
    !pathname.startsWith("/admin/login") &&
    !pathname.startsWith("/admin/setup") &&
    !pathname.startsWith("/api/admin/auth") &&
    !pathname.startsWith("/api/admin/setup")
  ) {
    const adminToken = request.cookies.get("admin_token")?.value;

    if (!adminToken) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(adminToken, SECRET_KEY);
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-admin-id", payload.id as string);
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } catch (e) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // User route protection
  if (
    (pathname.startsWith("/dashboard") || 
     pathname.startsWith("/orders") || 
     pathname.startsWith("/api/orders") || 
     pathname.startsWith("/api/wallet") || 
     pathname.startsWith("/api/auth/me")) &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/register")
  ) {
    const userToken = request.cookies.get("user_token")?.value;
    const isApi = pathname.startsWith("/api/");

    if (!userToken) {
      console.log("Middleware: No user_token found for", pathname);
      if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(userToken, SECRET_KEY);
      console.log("Middleware: User verified", payload.id, "for", pathname);
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", payload.id as string);
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } catch (e: any) {
      console.log("Middleware: JWT verify failed for user:", e.message);
      if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/shop/product/:path*",
    "/orders/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/orders/:path*",
    "/api/wallet/:path*",
    "/api/auth/me",
  ],
};

export default middleware;
