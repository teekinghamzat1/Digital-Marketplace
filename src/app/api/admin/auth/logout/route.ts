import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get("admin_session")?.value;
  if (sessionId) await deleteSession(sessionId);

  const response = NextResponse.json({ message: "Logged out" });
  response.headers.set(
    "Set-Cookie",
    "admin_session=; Path=/; HttpOnly; Max-Age=0"
  );
  return response;
}
