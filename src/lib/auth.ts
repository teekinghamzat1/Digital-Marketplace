import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import crypto from "crypto";

const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

// Create a new user session
export async function createUserSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  if (!prisma.session) {
    throw new Error("Prisma Session model not initialized. Please restart the dev server.");
  }
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
export async function getUserFromRequest(request: NextRequest) {
  const sessionId = request.cookies.get("user_session")?.value;
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
export async function getAdminFromRequest(request: NextRequest) {
  const sessionId = request.cookies.get("admin_session")?.value;
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
