import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcrypt";
import prisma from "@/lib/prisma";
import { createUserSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Invalid credentials or inactive account" }, { status: 401 });
    }

    const isValid = await compare(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const sessionId = await createUserSession(user.id);
    const response = NextResponse.json({ message: "Login successful" }, { status: 200 });
    response.headers.set(
      "Set-Cookie",
      `user_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
    );
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
