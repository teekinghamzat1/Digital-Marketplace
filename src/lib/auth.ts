import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_DURATION = 1800; // 30 minutes in seconds (Inactivity timeout)

export async function setSessionCookie(name: string, value: string) {
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

// Create a new user session
export async function createUserSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + SESSION_DURATION * 1000),
    },
  });
  return sessionId;
}

// Create a new admin session
export async function createAdminSession(adminId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  await prisma.session.create({
    data: {
      id: sessionId,
      adminId,
      expiresAt: new Date(Date.now() + SESSION_DURATION * 1000),
    },
  });
  return sessionId;
}

// Get user from request cookie
export async function getUserFromRequest() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("user_session")?.value;
  if (!sessionId) return null;
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      userId: { not: null },
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });
  return session?.user ?? null;
}

// Get admin from request cookie
export async function getAdminFromRequest() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("admin_session")?.value;
  if (!sessionId) return null;
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      adminId: { not: null },
      expiresAt: { gt: new Date() },
    },
    include: { admin: true },
  });
  return session?.admin ?? null;
}

// Delete a session (logout)
export async function deleteSession(sessionId: string) {
  await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
}

// Clean up expired sessions
export async function cleanExpiredSessions() {
  await prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}
