import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { verifyOTP, decryptSecret } from "@/lib/otp";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { token } = await request.json();
    if (!token) return NextResponse.json({ error: "OTP token required" }, { status: 400 });

    const dbAdmin = await prisma.admin.findUnique({ where: { id: admin.id } });
    if (!dbAdmin?.otpSecret) return NextResponse.json({ error: "2FA not set up" }, { status: 400 });

    const isValid = verifyOTP(token, decryptSecret(dbAdmin.otpSecret));

    if (isValid) {
      await prisma.admin.update({
        where: { id: admin.id },
        data: { is2faEnabled: true }
      });

      // Issue an elevated session cookie (admin_verified)
      const response = NextResponse.json({ message: "2FA verified" });
      response.cookies.set("admin_verified", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600 // 1 hour
      });

      return response;
    } else {
      return NextResponse.json({ error: "Invalid OTP token" }, { status: 401 });
    }

  } catch (error) {
    logger.error(error, "2FA Verification Error");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
