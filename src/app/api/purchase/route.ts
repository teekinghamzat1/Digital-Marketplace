import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { PurchaseSchema } from "@/lib/validations";
import { purchaseLimiter, checkRateLimit } from "@/lib/ratelimit";
import { getUserWalletBalance } from "@/lib/wallet";
import { logAction } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { sanitizeInput } from "@/lib/sanitize";
import crypto from "crypto";

/**
 * PRODUCTION PURCHASE HANDLER (REFACTORED)
 * Fixes: Order history, Success screen display, Multi-item tiers
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { success, retryAfter } = await checkRateLimit(purchaseLimiter, user.id);
    if (!success) {
      return NextResponse.json({ error: "Too many purchase attempts.", retryAfter }, { status: 429 });
    }

    const rawBody = await request.json();
    const sanitizedBody = sanitizeInput(rawBody);
    const validation = PurchaseSchema.safeParse(sanitizedBody);
    
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    const { productId, tierId } = validation.data;

    // 4. ATOMIC TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Fetch Tier & Price
      const tier = await tx.tier.findUnique({
        where: { id: tierId },
        include: { product: true }
      });

      if (!tier || tier.productId !== productId) {
        throw new Error("INVALID_PRODUCT_SELECTION");
      }

      const quantityRequested = tier.quantity || 1;
      const price = Number(tier.price);

      // B. Row Lock & Inventory Check
      // We fetch EXACTLY the number of items specified in the tier
      const availableItems: any[] = await tx.$queryRaw`
        SELECT id FROM product_items 
        WHERE product_id = ${productId}::uuid AND is_sold = false 
        LIMIT ${quantityRequested} FOR UPDATE SKIP LOCKED
      `;

      if (availableItems.length < quantityRequested) {
        throw new Error("OUT_OF_STOCK");
      }

      // C. Financial Integrity Check
      const realBalance = await getUserWalletBalance(user.id);
      if (realBalance < price) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      // D. Create Order Record (Source of truth for history)
      const order = await tx.order.create({
        data: {
          userId: user.id,
          productId: productId,
          quantity: quantityRequested,
          unitPrice: price / quantityRequested,
          totalAmount: price,
          status: "completed"
        }
      });

      // E. Debit Wallet
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: price } }
      });

      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          type: "debit",
          amount: price,
          reference: `PURCH-${order.id.substring(0, 8)}`,
          status: "successful",
          description: `Purchase: ${tier.product.name} (${tier.label})`
        }
      });

      // F. Assign items to Order and User
      const itemIds = availableItems.map(i => i.id);
      
      // Update ProductItems
      await tx.productItem.updateMany({
        where: { id: { in: itemIds } },
        data: {
          isSold: true,
          soldToUserId: user.id,
          soldAt: new Date(),
          orderId: order.id
        }
      });

      // Create OrderItems (needed for "Reveal" and "Tickets")
      await tx.orderItem.createMany({
        data: itemIds.map(itemId => ({
          orderId: order.id,
          productItemId: itemId,
          isRevealed: false
        }))
      });

      return { orderId: order.id, price };
    }, {
      timeout: 15000 // Ensure transaction has enough time for bulk operations
    });

    // 5. Audit Logging
    await logAction({
      userId: user.id,
      action: "PURCHASE_SUCCESS",
      entity: "ORDER",
      entityId: result.orderId,
      details: { productId, price: result.price }
    });

    // 6. Transactional Email (Non-blocking)
    sendEmail({
      to: user.email,
      subject: "Purchase Successful",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #10b981;">Purchase Confirmed!</h2>
          <p>Your purchase was successful.</p>
          <p><strong>Order ID:</strong> ${result.orderId}</p>
          <p><strong>Total Paid:</strong> ₦${result.price.toLocaleString()}</p>
          <p>You can view your items in your dashboard.</p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || request.nextUrl.origin}/dashboard/purchases" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Purchases</a>
          </div>
        </div>
      `
    }).catch(err => logger.error(err, "Failed to send purchase email"));

    return NextResponse.json({
      message: "Purchase successful",
      orderId: result.orderId
    }, { status: 200 });

  } catch (error: any) {
    logger.warn({ error: error.message }, "Purchase failed");
    
    const errorMap: Record<string, number> = {
      "OUT_OF_STOCK": 409,
      "INSUFFICIENT_FUNDS": 402,
      "INVALID_PRODUCT_SELECTION": 400
    };

    return NextResponse.json({ 
      error: errorMap[error.message] ? error.message : "Internal purchase error" 
    }, { status: errorMap[error.message] || 500 });
  }
}
