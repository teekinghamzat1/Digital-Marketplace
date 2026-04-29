import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getUserFromRequest(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = payload.id as string;
    const p = await params;
    const { id } = p;
    
    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: { select: { name: true } },
        orderItems: {
          include: {
            productItem: {
              select: {
                id: true,
                credentialText: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mask credentials if not revealed
    const formattedOrder = {
      ...order,
      orderItems: order.orderItems.map(item => ({
        id: item.id,
        productItemId: item.productItemId,
        isRevealed: item.isRevealed,
        credentialText: item.isRevealed ? item.productItem.credentialText : "**********"
      }))
    };

    return NextResponse.json(formattedOrder, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
