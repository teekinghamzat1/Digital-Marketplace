import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("user_session")?.value;
  if (sessionId) await deleteSession(sessionId);

  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.delete("user_session");
  return response;
}
