// @ts-nocheck
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
    const tier = await prisma.tier.findFirst({
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
      // 0. Fetch and reserve inventory
      const availableItems = await tx.productItem.findMany({
        where: {
          productId: productId,
          isSold: false
        },
        take: tier.quantity,
        orderBy: { createdAt: 'asc' }
      });

      if (availableItems.length < tier.quantity) {
        throw new Error(`Insufficient stock. Only ${availableItems.length} items left.`);
      }

      const itemIds = availableItems.map((item: any) => item.id);

      // 1. Deduct balance
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          walletBalance: {
            decrement: tier.price,
          },
        },
      });

      if (Number(updatedUser.walletBalance) < 0) {
        throw new Error("Insufficient wallet balance");
      }

      // 2. Create sale record
      const sale = await tx.sale.create({
        data: {
          userId: user.id,
          productId: productId,
          tierId: tierId,
          amount: tier.price,
          status: "successful",
        },
      });

      // 3. Mark items as sold and assign to user
      await tx.productItem.updateMany({
        where: {
          id: { in: itemIds }
        },
        data: {
          isSold: true,
          soldToUserId: user.id,
          soldAt: new Date()
        }
      });

      return { sale, updatedBalance: updatedUser.walletBalance, deliveredItems: availableItems };
    });

    return NextResponse.json({
      message: "Purchase successful",
      sale: transactionResult.sale,
      newBalance: transactionResult.updatedBalance,
      deliveredItems: transactionResult.deliveredItems
    }, { status: 200 });

  } catch (error: any) {
    console.error("Purchase error:", error);
    return NextResponse.json({ error: error.message }, { status: error.message.includes('Insufficient') ? 400 : 500 });
  }
}
