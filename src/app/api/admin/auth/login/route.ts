import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcrypt";
import prisma from "@/lib/prisma";
import { createAdminSession } from "@/lib/auth";

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
    response.headers.set(
      "Set-Cookie",
      `admin_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
    );
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
