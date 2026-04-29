import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, itemId: string }> }
) {
  try {
    const payload = await getUserFromRequest(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = payload.id as string;
    const { id, itemId } = await params;

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order || order.userId !== userId) {
      return NextResponse.json({ error: "Order not found or forbidden" }, { status: 403 });
    }

    if (order.status !== "completed") {
      return NextResponse.json({ error: "Order is not completed" }, { status: 400 });
    }

    const orderItem = await prisma.orderItem.findFirst({
      where: {
        orderId: id,
        productItemId: itemId
      },
      include: {
        productItem: true
      }
    });

    if (!orderItem) {
      return NextResponse.json({ error: "Item not found in order" }, { status: 404 });
    }

    if (!orderItem.isRevealed) {
      await prisma.orderItem.update({
        where: { id: orderItem.id },
        data: { isRevealed: true }
      });
    }

    return NextResponse.json({ credentialText: orderItem.productItem.credentialText }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
