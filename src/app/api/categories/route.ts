// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        products: {
          where: { isActive: true },
          include: {
            _count: {
              select: { items: { where: { isSold: false } } }
            }
          }
        }
      }
    });

    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      availableItemsCount: cat.products.reduce((sum: number, p: any) => sum + p._count.items, 0)
    }));

    return NextResponse.json(formattedCategories, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
