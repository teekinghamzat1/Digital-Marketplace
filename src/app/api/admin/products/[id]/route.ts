import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getAdminFromRequest(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name, categoryId, price, shortDescription, fullDescription, isActive } = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        categoryId,
        price: parseFloat(price),
        shortDescription,
        fullDescription,
        isActive
      }
    });

    return NextResponse.json(product, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getAdminFromRequest(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Check if it has orders
    const orderCount = await prisma.order.count({ where: { productId: id } });
    if (orderCount > 0) {
      return NextResponse.json({ error: "Cannot delete product with associated orders" }, { status: 400 });
    }

    // Delete items first if any (but usually we'd want to archive)
    await prisma.productItem.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    
    return NextResponse.json({ message: "Product deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
