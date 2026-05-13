import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const admin = await getAdminFromRequest();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { itemId } = await params;
    const { credentialText } = await request.json();

    const item = await prisma.productItem.update({
      where: { id: itemId },
      data: { credentialText }
    });

    return NextResponse.json(item, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const admin = await getAdminFromRequest();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { itemId } = await params;

    // Check if item exists and if it's sold
    const item = await prisma.productItem.findUnique({ where: { id: itemId } });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    // If sold, we might want to warn or handle differently, 
    // but the user wants to be able to delete anyway.
    // Note: This might cause referential integrity issues if not handled by DB.
    // In schema.prisma, OrderItem has productItem relation.
    
    await prisma.productItem.delete({
      where: { id: itemId }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
