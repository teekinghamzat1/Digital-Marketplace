import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { generateOTPSetup, encryptSecret } from "@/lib/otp";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { secret, qrCodeUrl } = await generateOTPSetup(admin.email);
    
    // Save the encrypted secret temporarily or mark setup as in-progress
    // For this implementation, we save it immediately (but inactive until verified)
    await prisma.admin.update({
      where: { id: admin.id },
      data: { 
        otpSecret: encryptSecret(secret),
        is2faEnabled: false 
      }
    });

    return NextResponse.json({ qrCodeUrl, secret });

  } catch (error) {
    logger.error(error, "2FA Setup Error");
    return NextResponse.json({ error: "Could not generate 2FA setup" }, { status: 500 });
  }
}
