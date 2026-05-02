import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, tierId } = await request.json();

    if (!productId || !tierId) {
      return NextResponse.json({ error: "Missing product or tier selection" }, { status: 400 });
    }

    // Fetch product and tier
    const tier = await prisma.pricingTier.findFirst({
      where: {
        id: tierId,
        productId: productId,
      },
      include: {
        product: true,
      },
    });

    if (!tier) {
      return NextResponse.json({ error: "Invalid product or tier selection" }, { status: 404 });
    }

    // Check balance
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { walletBalance: true },
    });

    if (!freshUser) {
       return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (Number(freshUser.walletBalance) < Number(tier.price)) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }

    // Transactional purchase
    const transactionResult = await prisma.$transaction(async (tx) => {
      // 1. Deduct balance
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          walletBalance: {
            decrement: tier.price,
          },
        },
      });

      // 2. Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          productId: productId,
          pricingTierId: tierId,
          amount: tier.price,
          status: "successful",
        },
      });

      // 3. Mock delivery (In a real app, you'd fetch ProductItems and mark them as sold)
      // Here we just acknowledge the purchase.

      return { transaction, updatedBalance: updatedUser.walletBalance };
    });

    return NextResponse.json({
      message: "Purchase successful",
      transaction: transactionResult.transaction,
      newBalance: transactionResult.updatedBalance,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Purchase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
