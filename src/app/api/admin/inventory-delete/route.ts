// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId, amount } = await req.json();

    if (!productId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid product ID or amount" }, { status: 400 });
    }

    const itemsToDelete = await prisma.productItem.findMany({
      where: { productId, isSold: false },
      take: amount,
      select: { id: true },
      orderBy: { createdAt: 'asc' }
    });

    if (itemsToDelete.length === 0) {
      return NextResponse.json({ error: "No unsold items found" }, { status: 404 });
    }

    const itemIds = itemsToDelete.map((item: any) => item.id);

    const result = await prisma.productItem.deleteMany({
      where: { id: { in: itemIds } }
    });

    return NextResponse.json({ success: true, count: result.count }, { status: 200 });
  } catch (error: any) {
    console.error("Inventory delete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
