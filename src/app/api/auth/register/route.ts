import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
      }
    });

    return NextResponse.json({ message: "Registration successful" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
