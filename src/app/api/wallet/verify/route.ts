import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

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

      const updatedUser = await tx.user.update({
        where: { id: transaction.userId },
        data: { walletBalance: { increment: transaction.amount } },
      });

      return { success: true, email: updatedUser.email, amount: transaction.amount, reference: transaction.reference };
    });

    if (result.alreadyCompleted) {
      return NextResponse.redirect(new URL("/dashboard/wallet?success=Payment already verified", request.url));
    }

    // Send funding confirmation email (non-blocking)
    if (result.email) {
      sendEmail({
        to: result.email,
        subject: "Wallet Funded Successfully",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #10b981;">Deposit Confirmed!</h2>
            <p>Your wallet has been credited with <strong>₦${Number(result.amount).toLocaleString()}</strong>.</p>
            <p><strong>Reference:</strong> ${result.reference}</p>
            <p>You can now use your balance to purchase logs instantly.</p>
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.NEXTAUTH_URL || request.nextUrl.origin}/shop" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Browse Shop</a>
            </div>
          </div>
        `
      }).catch(console.error);
    }

    return NextResponse.redirect(new URL("/dashboard/wallet?success=Wallet funded successfully", request.url));

  } catch (error: any) {
    console.error("Paystack verification error:", error);
    return NextResponse.redirect(new URL(`/dashboard/wallet?error=${encodeURIComponent(error.message || "Verification error")}`, request.url));
  }
}
