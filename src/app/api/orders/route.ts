// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const payload = await getUserFromRequest(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = payload.id as string;
    const { product_id, quantity } = await request.json();

    if (!product_id || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    // 1. Get Product
    const product = await prisma.product.findUnique({
      where: { id: product_id },
      include: { tiers: true }
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product not found or inactive" }, { status: 404 });
    }

    // 2. Check stock
    const availableItems = await prisma.productItem.findMany({
      where: { productId: product_id, isSold: false },
      take: quantity
    });

    if (availableItems.length < quantity) {
      return NextResponse.json({ error: "Insufficient stock available" }, { status: 400 });
    }

    // For legacy support, we pick the first tier that matches or is close, but this is deprecated
    const tier = product.tiers.find(t => t.quantity === quantity) || product.tiers[0];
    if (!tier) throw new Error("No pricing tiers found for this product");
    
    const totalAmount = Number(tier.price) * (quantity / tier.quantity);

    // 3. Perform Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check balance within transaction
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("User not found");

      if (Number(user.walletBalance) < totalAmount) {
        const shortfall = totalAmount - Number(user.walletBalance);
        throw new Error(`Insufficient balance. Shortfall: ${shortfall}`);
      }

      // Deduct balance
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: totalAmount } }
      });

      // Create Order
      const order = await tx.order.create({
        data: {
          userId,
          productId: product_id,
          quantity,
          unitPrice: tier.price,
          totalAmount,
          status: "completed"
        }
      });

      // Update Product Items and create Order Items
      const itemIds = availableItems.map(item => item.id);
      
      await tx.productItem.updateMany({
        where: { id: { in: itemIds } },
        data: {
          isSold: true,
          soldToUserId: userId,
          orderId: order.id,
          soldAt: new Date()
        }
      });

      // Create Order Items
      const orderItemsData = itemIds.map(itemId => ({
        orderId: order.id,
        productItemId: itemId,
        isRevealed: false
      }));

      await tx.orderItem.createMany({ data: orderItemsData });

      // Create Wallet Transaction
      await tx.walletTransaction.create({
        data: {
          userId,
          type: "debit",
          amount: totalAmount,
          reference: `ORD-${order.id}`,
          description: `Purchase: ${product.name} x${quantity}`,
          status: "successful"
        }
      });

      return { order, email: user.email, productName: product.name };
    });

    // Send purchase confirmation email (non-blocking)
    if (result.email) {
      sendEmail({
        to: result.email,
        subject: `Purchase Successful: ${result.productName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #10b981;">Order Confirmed!</h2>
            <p>Your purchase of <strong>${result.productName} (x${quantity})</strong> was successful.</p>
            <p><strong>Total Amount:</strong> ₦${totalAmount.toLocaleString()}</p>
            <p>You can access your logs immediately from your dashboard.</p>
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.NEXTAUTH_URL || request.nextUrl.origin}/orders/${result.order.id}/success" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View My Logs</a>
            </div>
          </div>
        `
      }).catch(console.error);
    }

    return NextResponse.json(result.order, { status: 201 });
  } catch (error: any) {
    if (error.message.includes("Insufficient balance")) {
      return NextResponse.json({ error: error.message }, { status: 402 }); // Payment Required
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getUserFromRequest(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = payload.id as string;

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    const orders = await prisma.order.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
      include: {
        product: { select: { name: true } }
      }
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
