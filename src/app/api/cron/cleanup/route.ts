import { NextResponse } from "next/server";
import { cleanExpiredSessions } from "@/lib/auth";

export async function GET() {
  try {
    await cleanExpiredSessions();
    return NextResponse.json({ message: "Cleanup done" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
