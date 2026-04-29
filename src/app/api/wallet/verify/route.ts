import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  const trxref = request.nextUrl.searchParams.get("trxref");
  
  const refToUse = reference || trxref;

  if (!refToUse) {
    return NextResponse.redirect(new URL("/dashboard/wallet?error=No reference provided", request.url));
  }

  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      throw new Error("Payment gateway configuration error");
    }

    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${refToUse}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
      },
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return NextResponse.redirect(new URL(`/dashboard/wallet?error=${encodeURIComponent(paystackData.message || "Verification failed")}`, request.url));
    }

    const txData = paystackData.data;
    if (txData.status !== "success") {
      return NextResponse.redirect(new URL("/dashboard/wallet?error=Payment was not successful", request.url));
    }

    // Process with a Prisma transaction to avoid race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Find the pending transaction
      // We use findFirst because reference might not be strictly unique if the schema isn't configured for it,
      // but in most systems reference should be unique.
      const transaction = await tx.walletTransaction.findFirst({
        where: { reference: refToUse },
      });

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      if (transaction.status === "successful") {
        return { alreadyCompleted: true };
      }

      // Verify amount matches
      const expectedAmountInKobo = Math.round(Number(transaction.amount) * 100);
      if (txData.amount !== expectedAmountInKobo) {
        throw new Error("Amount mismatch");
      }

      // Update transaction and user balance
      await tx.walletTransaction.update({
        where: { id: transaction.id },
        data: { status: "successful" },
      });

      await tx.user.update({
        where: { id: transaction.userId },
        data: { walletBalance: { increment: transaction.amount } },
      });

      return { success: true };
    });

    if (result.alreadyCompleted) {
      return NextResponse.redirect(new URL("/dashboard/wallet?success=Payment already verified", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard/wallet?success=Wallet funded successfully", request.url));

  } catch (error: any) {
    console.error("Paystack verification error:", error);
    return NextResponse.redirect(new URL(`/dashboard/wallet?error=${encodeURIComponent(error.message || "Verification error")}`, request.url));
  }
}
