import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } }
        }
      }
    });

    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      description: cat.description,
      productCount: cat._count.products
    }));

    return NextResponse.json(formattedCategories, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
