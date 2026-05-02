import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalUsers, totalTransactions, totalRevenueData, activeProducts, transactions] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count(),
      prisma.transaction.aggregate({
        where: { status: "successful" },
        _sum: { amount: true }
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.transaction.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true } },
          product: { select: { name: true } },
          pricingTier: { select: { label: true, quantity: true } }
        }
      })
    ]);

    return NextResponse.json({
      totalUsers,
      totalTransactions,
      totalRevenue: totalRevenueData._sum.amount || 0,
      activeProducts,
      transactions
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
