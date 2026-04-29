import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isApi = pathname.startsWith("/api/");

    // Admin route protection
    if (
        (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) &&
        !pathname.startsWith("/admin/login") &&
        !pathname.startsWith("/admin/setup") &&
        !pathname.startsWith("/api/admin/auth") &&
        !pathname.startsWith("/api/admin/setup")
    ) {
        const adminSession = request.cookies.get("admin_session")?.value;

        if (!adminSession) {
            if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
        
        return NextResponse.next();
    }


    // User route protection
    const userProtectedRoutes = [
        "/dashboard", 
        "/shop/product", 
        "/orders",
        "/api/orders",
        "/api/wallet",
        "/api/auth/me"
    ];
    
    const isUserRoute = userProtectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (isUserRoute) {
        const userSession = request.cookies.get("user_session")?.value;

        if (!userSession) {
            if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            return NextResponse.redirect(new URL("/login", request.url));
        }

        return NextResponse.next();
    }


    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/shop/:path*",
        "/orders/:path*",
        "/admin/:path*",
    ],
};