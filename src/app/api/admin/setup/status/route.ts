import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const admin = await prisma.admin.findFirst();
    return NextResponse.json({ setupCompleted: !!admin?.setupCompleted }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
