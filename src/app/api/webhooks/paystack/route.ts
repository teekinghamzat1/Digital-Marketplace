import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { logAction } from "@/lib/audit";
import { logger } from "@/lib/logger";

/**
 * PRODUCTION PAYSTACK WEBHOOK HANDLER
 * Enforces:
 * 1. HMAC-SHA512 Signature Verification (Buffer-based)
 * 2. Reference Idempotency
 * 3. Atomic Wallet Crediting
 */
export async function POST(request: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      logger.error("PAYSTACK_SECRET_KEY is missing from environment");
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    // 1. Signature Verification (Domain 4 & 11)
    // We use the raw text for HMAC calculation to ensure accuracy
    const rawBody = await request.text();
    const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    const signature = request.headers.get("x-paystack-signature");

    if (hash !== signature) {
      logger.warn({ signature, hash }, "Invalid Paystack signature received");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // 2. Handle Charge Success
    if (event.event === "charge.success") {
      const { reference, amount, metadata } = event.data;
      const creditAmount = amount / 100; // Convert Kobo to Naira
      const userId = metadata?.user_id;

      if (!userId) {
        logger.error({ reference }, "Paystack webhook missing user_id in metadata");
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
      }

      // 3. Idempotency Check
      const existingTx = await prisma.walletTransaction.findUnique({
        where: { reference }
      });

      if (existingTx && existingTx.status === "successful") {
        logger.info({ reference }, "Duplicate Paystack webhook ignored");
        return NextResponse.json({ message: "Already processed" }, { status: 200 });
      }

      // 4. Atomic Credit Flow (Domain 3)
      await prisma.$transaction(async (tx) => {
        // Upsert the transaction (handle both pending creation and external updates)
        await tx.walletTransaction.upsert({
          where: { reference },
          update: { status: "successful" },
          create: {
            userId,
            type: "credit",
            amount: creditAmount,
            reference,
            status: "successful",
            description: "Wallet deposit via Paystack"
          }
        });

        // 5. Audit Logging (Domain 10)
        await logAction({
          userId,
          action: "WALLET_CREDIT_SUCCESS",
          entity: "WALLET",
          details: { reference, amount: creditAmount },
          ipAddress: request.headers.get("x-forwarded-for") || undefined
        });
      });

      logger.info({ userId, reference, amount: creditAmount }, "Wallet credited via webhook");
    }

    return NextResponse.json({ message: "Webhook processed" }, { status: 200 });

  } catch (error: any) {
    logger.error(error, "Error processing Paystack webhook");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
