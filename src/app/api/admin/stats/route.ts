import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAdminFromRequest(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalUsers, totalOrders, totalRevenueData, activeProducts, availableItems] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true }
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.productItem.count({ where: { isSold: false } })
    ]);

    // Calculate recent sales (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = await prisma.order.aggregate({
      where: { createdAt: { gte: thirtyDaysAgo } },
      _sum: { totalAmount: true }
    });

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenueData._sum.totalAmount || 0,
      recentSales: recentSales._sum.totalAmount || 0,
      activeProducts,
      availableItems
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
