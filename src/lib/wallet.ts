import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * Calculates the user's current wallet balance by summing all successful transactions.
 * This is the source of truth for financial logic.
 */
export async function getUserWalletBalance(userId: string): Promise<number> {
  const transactions = await prisma.walletTransaction.findMany({
    where: { 
      userId,
      status: "successful"
    },
    select: {
      type: true,
      amount: true
    }
  });

  const balance = transactions.reduce((acc, tx) => {
    const amount = Number(tx.amount);
    return tx.type === "CREDIT" ? acc + amount : acc - amount;
  }, 0);

  logger.debug({ userId, balance }, "Calculated wallet balance from transaction history");
  return balance;
}
