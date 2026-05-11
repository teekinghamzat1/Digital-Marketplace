import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("admin_session")?.value;
  if (sessionId) await deleteSession(sessionId);

  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.delete("admin_session");
  return response;
}
