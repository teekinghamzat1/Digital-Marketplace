import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { PurchaseSchema } from "@/lib/validations";
import { purchaseLimiter, checkRateLimit } from "@/lib/ratelimit";
import { getUserWalletBalance } from "@/lib/wallet";
import { logAction } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { sanitizeInput } from "@/lib/sanitize";
import crypto from "crypto";

/**
 * PRODUCTION PURCHASE HANDLER
 * Enforces:
 * 1. User Authentication
 * 2. Redis-based Rate Limiting
 * 3. PostgreSQL Row-Level Locking (SELECT FOR UPDATE)
 * 4. Financial Integrity (Transaction History Balance)
 * 5. Atomic Purchase & Assignment
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // 2. Rate Limiting (Domain 7)
    const { success, retryAfter } = await checkRateLimit(purchaseLimiter, user.id);
    if (!success) {
      return NextResponse.json({ 
        error: "Too many purchase attempts. Please wait.", 
        retryAfter 
      }, { status: 429 });
    }

    // 3. Sanitization & Validation (Domain 6)
    const rawBody = await request.json();
    const sanitizedBody = sanitizeInput(rawBody);
    const validation = PurchaseSchema.safeParse(sanitizedBody);
    
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    const { productId, tierId } = validation.data;

    // 4. ATOMIC TRANSACTION (Domain 3 & 5)
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Row Lock & Inventory Check (Anti-double-sale)
      // SKIP LOCKED prevents multiple users from waiting on the same item, they move to the next or fail instantly
      const availableItems: any[] = await tx.$queryRaw`
        SELECT id FROM product_items 
        WHERE product_id = ${productId}::uuid AND is_sold = false 
        LIMIT 1 FOR UPDATE SKIP LOCKED
      `;

      if (availableItems.length === 0) {
        throw new Error("OUT_OF_STOCK");
      }

      const itemId = availableItems[0].id;

      // B. Backend Price Source (Domain 14)
      const tier = await tx.tier.findUnique({
        where: { id: tierId },
        include: { product: true }
      });

      if (!tier || tier.productId !== productId) {
        throw new Error("INVALID_PRODUCT_SELECTION");
      }

      // C. Financial Integrity Check (Domain 3)
      // Never trust a single 'balance' column. Sum the history.
      const realBalance = await getUserWalletBalance(user.id);
      const price = Number(tier.price);

      if (realBalance < price) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      // D. Atomic Debit & Assignment
      const debitTransaction = await tx.walletTransaction.create({
        data: {
          userId: user.id,
          type: "debit",
          amount: price,
          reference: `PURCH-${crypto.randomUUID()}`,
          status: "successful",
          description: `Purchase of ${tier.product.name} (${tier.label})`
        }
      });

      const updatedItem = await tx.productItem.update({
        where: { id: itemId },
        data: {
          isSold: true,
          soldToUserId: user.id,
          soldAt: new Date()
        }
      });

      return { item: updatedItem, transactionId: debitTransaction.id };
    });

    // 5. Audit Logging (Domain 10)
    await logAction({
      userId: user.id,
      action: "PURCHASE_SUCCESS",
      entity: "PRODUCT",
      entityId: productId,
      details: { itemId: result.item.id, transactionId: result.transactionId },
      ipAddress: request.headers.get("x-forwarded-for") || undefined
    });

    logger.info({ userId: user.id, productId }, "Purchase completed successfully");

    return NextResponse.json({
      message: "Purchase successful",
      item: { id: result.item.id }
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
