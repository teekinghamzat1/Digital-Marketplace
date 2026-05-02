// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalUsers, totalSales, totalRevenueData, activeProducts, sales] = await Promise.all([
      prisma.user.count(),
      prisma.sale.count(),
      prisma.sale.aggregate({
        where: { status: "successful" },
        _sum: { amount: true }
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.sale.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true } },
          product: { select: { name: true } },
          tier: { select: { label: true, quantity: true } }
        }
      })
    ]);

    return NextResponse.json({
      totalUsers,
      totalTransactions: totalSales,
      totalRevenue: totalRevenueData._sum.amount || 0,
      activeProducts,
      transactions: sales
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
