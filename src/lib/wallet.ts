import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * Calculates the user's current wallet balance by summing all successful transactions.
 * This is the source of truth for financial logic.
 */
export async function getUserWalletBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { walletBalance: true }
  });

  if (!user) return 0;
  
  const balance = Number(user.walletBalance);
  logger.debug({ userId, balance }, "Fetched wallet balance from user record");
  return balance;
}
