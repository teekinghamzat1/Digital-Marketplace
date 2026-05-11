import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcrypt";
import prisma from "@/lib/prisma";
import { createUserSession, setSessionCookie } from "@/lib/auth";
import { LoginSchema } from "@/lib/validations";
import { loginLimiter, checkRateLimit } from "@/lib/ratelimit";
import { logAction } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { sanitizeInput } from "@/lib/sanitize";

/**
 * PRODUCTION LOGIN HANDLER
 * Enforces Rate Limiting, Account Locking, Input Sanitization, and Secure Session Cookies.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";

  try {
    // 1. Rate Limiting (Domain 7)
    const { success, retryAfter } = await checkRateLimit(loginLimiter, ip);
    if (!success) {
      logger.warn({ ip }, "Login rate limit exceeded");
      return NextResponse.json({ 
        error: "Too many login attempts. Please try again later.", 
        retryAfter 
      }, { status: 429 });
    }

    // 2. Input Sanitization & Validation (Domain 6 & 9)
    const rawBody = await request.json();
    const sanitizedBody = sanitizeInput(rawBody);
    const validation = LoginSchema.safeParse(sanitizedBody);
    
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input format" }, { status: 400 });
    }

    const { email, password } = validation.data;

    // 3. User Lookup & Status Check
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 401 even if user doesn't exist to prevent enumeration (but log it internally)
      logger.info({ email, ip }, "Login attempt for non-existent user");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 4. Account Lock Check (Domain 1)
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      logger.warn({ userId: user.id, ip }, "Attempted login on locked account");
      return NextResponse.json({ 
        error: "Account is temporarily locked. Please try again later." 
      }, { status: 423 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account is inactive. Contact support." }, { status: 401 });
    }

    // 5. Password Verification
    const isValid = await compare(password, user.passwordHash);

    if (!isValid) {
      // Increment failed attempts and potentially lock account
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60000) : null;
      
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          failedLoginAttempts: attempts,
          lockedUntil
        }
      });

      logger.warn({ userId: user.id, attempts, locked: !!lockedUntil }, "Failed login attempt");
      
      await logAction({
        userId: user.id,
        action: "LOGIN_FAILED",
        entity: "USER",
        ipAddress: ip,
        details: { attempts, locked: !!lockedUntil }
      });

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 6. Success Flow - Reset Security Counters
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null }
    });

    // 7. Session Creation & Secure Cookie (Domain 12)
    const sessionId = await createUserSession(user.id);
    await setSessionCookie("user_session", sessionId);

    // 8. Audit Logging (Domain 10)
    await logAction({
      userId: user.id,
      action: "LOGIN_SUCCESS",
      entity: "USER",
      ipAddress: ip
    });

    logger.info({ userId: user.id }, "User logged in successfully");

    return NextResponse.json({ message: "Login successful" }, { status: 200 });

  } catch (error: any) {
    logger.error(error, "Critical error in login route");
    return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
  }
}
