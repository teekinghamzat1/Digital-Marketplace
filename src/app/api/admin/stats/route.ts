// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalUsers, totalOrders, totalRevenueData, activeProducts, recentOrders] = await Promise.all([
      // Total registered users
      prisma.user.count(),

      // Total completed orders (these are real purchases)
      prisma.order.count({
        where: { status: "completed" }
      }),

      // Total revenue from completed orders
      prisma.order.aggregate({
        where: { status: "completed" },
        _sum: { totalAmount: true }
      }),

      // Active product listings
      prisma.product.count({ where: { isActive: true } }),

      // Recent 50 orders with user + product info
      prisma.order.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        where: { status: "completed" },
        include: {
          user: { select: { email: true, username: true } },
          product: { select: { name: true } },
        }
      })
    ]);

    // Shape the transactions list to match the existing admin UI expectations
    const transactions = recentOrders.map(order => ({
      id: order.id,
      createdAt: order.createdAt,
      user: { email: order.user.email },
      product: { name: order.product.name },
      // Provide a compatible "pricingTier" shape for the existing table UI
      pricingTier: { label: `x${order.quantity}`, quantity: order.quantity },
      amount: order.totalAmount,
      status: order.status,
    }));

    return NextResponse.json({
      totalUsers,
      totalTransactions: totalOrders,
      totalRevenue: totalRevenueData._sum.totalAmount || 0,
      activeProducts,
      transactions,
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
