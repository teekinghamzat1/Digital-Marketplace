import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAdminFromRequest(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Basic Stats
    const [totalRevenueResult, totalWalletFunds, totalOrders, totalUsers] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: "completed" }
      }),
      prisma.user.aggregate({
        _sum: { walletBalance: true }
      }),
      prisma.order.count(),
      prisma.user.count()
    ]);

    // 2. Sales by Category
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            orders: {
              where: { status: "completed" }
            }
          }
        }
      }
    });

    const salesByCategory = categories.map(cat => {
      const revenue = cat.products.reduce((acc, prod) => {
        return acc + prod.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
      }, 0);
      return { name: cat.name, value: revenue };
    }).filter(cat => cat.value > 0);

    // 3. Recent Revenue (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await prisma.order.findMany({
      where: {
        status: "completed",
        createdAt: { gte: sevenDaysAgo }
      },
      orderBy: { createdAt: "asc" }
    });

    // Group by date
    const dailyRevenue: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyRevenue[d.toLocaleDateString()] = 0;
    }

    recentOrders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      if (dailyRevenue[date] !== undefined) {
        dailyRevenue[date] += Number(order.totalAmount);
      }
    });

    const revenueOverTime = Object.entries(dailyRevenue)
      .map(([date, value]) => ({ date, value }))
      .reverse();

    return NextResponse.json({
      stats: {
        totalRevenue: totalRevenueResult._sum.totalAmount || 0,
        totalWalletFunds: totalWalletFunds._sum.walletBalance || 0,
        totalOrders,
        totalUsers
      },
      salesByCategory,
      revenueOverTime
    }, { status: 200 });
  } catch (error: any) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
