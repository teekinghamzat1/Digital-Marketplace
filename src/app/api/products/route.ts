// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");

    const where: any = { isActive: true };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const products = await prisma.product.findMany({
      where,
      take: limit ? parseInt(limit) : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        tiers: { orderBy: { price: 'asc' }, take: 1 },
        _count: {
          select: { items: { where: { isSold: false } } }
        }
      }
    });

    const formattedProducts = products.map(prod => ({
      id: prod.id,
      name: prod.name,
      info: prod.info,
      basePrice: prod.tiers[0]?.price || 0,
      categoryId: prod.categoryId,
      categoryName: prod.category.name,
      stockCount: prod._count.items
    }));

    return NextResponse.json(formattedProducts, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
