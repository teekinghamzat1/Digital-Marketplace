import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
      }
    });

    // Send welcome email (non-blocking)
    sendEmail({
      to: email,
      subject: "Welcome to Sumon Mondal Logs Marketplace!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #10b981;">Welcome, ${username}!</h1>
          <p>Thank you for joining the most reliable digital account marketplace.</p>
          <p>You can now fund your wallet and start shopping for verified logs instantly.</p>
          <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px;">
            <p style="margin: 0;"><strong>Need help?</strong> Reply to this email or visit our support page.</p>
          </div>
        </div>
      `
    }).catch(console.error);

    return NextResponse.json({ message: "Registration successful" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
