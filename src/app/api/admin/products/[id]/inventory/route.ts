import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { logAction } from "@/lib/audit";

/**
 * GET: Fetch all individual inventory items for a product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await getAdminFromRequest();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await prisma.productItem.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH: Update an individual inventory item
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const admin = await getAdminFromRequest();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { itemId, credentialText, isSold } = await request.json();

    if (!itemId) return NextResponse.json({ error: "Item ID required" }, { status: 400 });

    const updatedItem = await prisma.productItem.update({
      where: { id: itemId },
      data: {
        credentialText,
        isSold
      }
    });

    await logAction({
      adminId: admin.id,
      action: "INVENTORY_ITEM_UPDATE",
      entity: "PRODUCT_ITEM",
      entityId: itemId,
      details: { productId, isSold }
    });

    return NextResponse.json({ message: "Item updated successfully", item: updatedItem });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Remove an individual inventory item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const admin = await getAdminFromRequest();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) return NextResponse.json({ error: "Item ID required" }, { status: 400 });

    await prisma.productItem.delete({
      where: { id: itemId }
    });

    await logAction({
      adminId: admin.id,
      action: "INVENTORY_ITEM_DELETE",
      entity: "PRODUCT_ITEM",
      entityId: itemId,
      details: { productId }
    });

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
