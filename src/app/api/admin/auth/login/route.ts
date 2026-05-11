import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcrypt";
import prisma from "@/lib/prisma";
import { createAdminSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    // Fallback: try querying exact first, then lowercased, just in case they registered with uppercase
    let admin = await prisma.admin.findUnique({ where: { email: email.trim() } });
    if (!admin) {
        admin = await prisma.admin.findUnique({ where: { email: normalizedEmail } });
    }

    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await compare(password, admin.passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const sessionId = await createAdminSession(admin.id);
    const response = NextResponse.json({ message: "Admin login successful" }, { status: 200 });
    
    // Set cookie on the response object for better compatibility in Route Handlers
    response.cookies.set("admin_session", sessionId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 604800,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
