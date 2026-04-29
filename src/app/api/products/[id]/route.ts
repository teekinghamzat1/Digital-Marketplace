import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const p = await params;
    const { id } = p;
    
    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
        _count: {
          select: { items: { where: { isSold: false } } }
        }
      }
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const formattedProduct = {
      id: product.id,
      name: product.name,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      price: product.price,
      categoryId: product.categoryId,
      categoryName: product.category.name,
      stockCount: product._count.items
    };

    return NextResponse.json(formattedProduct, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
