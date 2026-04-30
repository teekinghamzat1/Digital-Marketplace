import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const payload = await getUserFromRequest(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = payload.id as string;

    const { amount } = await request.json();

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return NextResponse.json({ error: "Payment gateway configuration error" }, { status: 500 });
    }

    // Generate a unique reference
    const reference = `FUND-${crypto.randomBytes(8).toString('hex')}`;

    // Create a pending transaction
    await prisma.walletTransaction.create({
      data: {
        userId: user.id,
        type: "credit",
        amount,
        reference,
        description: "Wallet funding via Paystack",
        status: "pending"
      }
    });

    const amountInKobo = Math.round(amount * 100);
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
    const callbackUrl = `${baseUrl}/api/wallet/verify`;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: amountInKobo,
        reference,
        callback_url: callbackUrl,
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return NextResponse.json({ error: paystackData.message || "Failed to initialize payment" }, { status: 400 });
    }

    return NextResponse.json({ 
      message: "Payment initiated",
      reference,
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
