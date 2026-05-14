import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { hash } from "bcrypt";
import { logAction } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ admins }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const currentAdmin = await getAdminFromRequest();
  if (!currentAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email, and password are required" }, { status: 400 });
    }

    // Check if username or email exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [{ username }, { email }]
      }
    });

    if (existingAdmin) {
      return NextResponse.json({ error: "Username or email already in use" }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);

    const newAdmin = await prisma.admin.create({
      data: {
        username,
        email,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });

    await logAction({
      adminId: currentAdmin.id,
      action: "CREATE_ADMIN",
      entity: "ADMIN",
      entityId: newAdmin.id,
      details: { username: newAdmin.username }
    });

    return NextResponse.json({ admin: newAdmin }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create admin:", error);
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
  }
}
