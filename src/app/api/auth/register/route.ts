import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { RegisterSchema } from "@/lib/validations";
import { logAction } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { sanitizeInput } from "@/lib/sanitize";

/**
 * PRODUCTION REGISTRATION HANDLER
 * Validates strength, prevents duplicates, and sanitizes input.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";

  try {
    const rawBody = await request.json();
    const sanitizedBody = sanitizeInput(rawBody);
    
    // 1. Validation (Domain 6)
    const validation = RegisterSchema.safeParse(sanitizedBody);
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { username, email, password } = validation.data;

    // 2. Duplicate Prevention
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      }
    });

    if (existingUser) {
      logger.info({ username, email }, "Registration attempt with existing credentials");
      return NextResponse.json({ error: "Username or email already in use" }, { status: 409 });
    }

    // 3. Secure Hashing (Domain 1)
    const passwordHash = await hash(password, 12);

    // 4. Atomic Creation
    const user = await prisma.user.create({
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

    // 5. Audit Logging (Domain 10)
    await logAction({
      userId: user.id,
      action: "REGISTER",
      entity: "USER",
      ipAddress: ip,
    });

    logger.info({ userId: user.id }, "New user registered");

    // 6. Transactional Email (Non-blocking)
    sendEmail({
      to: email,
      subject: "Welcome to Sumon Mondal Marketplace!",
      html: `<h1>Welcome, ${username}!</h1><p>Your account has been successfully created.</p>`
    }).catch(err => logger.error(err, "Failed to send welcome email"));

    return NextResponse.json({ 
      message: "Registration successful",
      user 
    }, { status: 201 });

  } catch (error: any) {
    logger.error(error, "Critical error in registration route");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
