// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name, categoryId, info, isActive } = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        categoryId,
        info,
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
    const admin = await getAdminFromRequest();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Check if this product has completed orders — prevent data loss
    const orderCount = await prisma.order.count({
      where: { productId: id, status: "completed" }
    });
    if (orderCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete product with ${orderCount} completed order(s). Deactivate it instead.` },
        { status: 400 }
      );
    }

    await prisma.productItem.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    
    return NextResponse.json({ message: "Product deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
