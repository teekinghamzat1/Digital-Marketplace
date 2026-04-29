import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const adminCount = await prisma.admin.count();
    
    if (adminCount > 0) {
      return NextResponse.json({ error: "Setup already completed" }, { status: 403 });
    }

    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);

    await prisma.admin.create({
      data: {
        username,
        email,
        passwordHash,
        setupCompleted: true,
      }
    });

    return NextResponse.json({ message: "Admin setup successful" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
