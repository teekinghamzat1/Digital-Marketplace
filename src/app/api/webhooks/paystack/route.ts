import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const text = await request.text();
    const hash = crypto.createHmac("sha512", secret).update(text).digest("hex");

    const signature = request.headers.get("x-paystack-signature");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(text);

    if (body.event === "charge.success") {
      const reference = body.data.reference;
      const amount = body.data.amount / 100; // Paystack sends amount in kobo

      const transaction = await prisma.walletTransaction.findUnique({
        where: { reference }
      });

      if (!transaction || transaction.status !== "pending") {
        return NextResponse.json({ message: "Transaction not found or already processed" }, { status: 200 });
      }

      // Verify amount matches
      if (Number(transaction.amount) !== amount) {
        // Handle mismatch
        await prisma.walletTransaction.update({
          where: { id: transaction.id },
          data: { status: "failed", description: "Amount mismatch" }
        });
        return NextResponse.json({ message: "Amount mismatch" }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.walletTransaction.update({
          where: { id: transaction.id },
          data: { status: "successful" }
        });

        await tx.user.update({
          where: { id: transaction.userId },
          data: { walletBalance: { increment: amount } }
        });
      });
    }

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
