import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const payload = await getUserFromRequest(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = payload.id as string;

    const { orderItemId, reason } = await request.json();

    if (!orderItemId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify order item belongs to user
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        order: {
          userId: userId
        }
      }
    });

    if (!orderItem) {
      return NextResponse.json({ error: "Order item not found or not owned by you" }, { status: 404 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        userId,
        orderItemId,
        reason,
        status: "open"
      }
    });

    return NextResponse.json({ message: "Ticket created successfully", ticket }, { status: 201 });
  } catch (error: any) {
    console.error("Ticket Creation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getUserFromRequest(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = payload.id as string;

    const tickets = await prisma.ticket.findMany({
      where: { userId },
      include: {
        orderItem: {
          include: {
            productItem: {
              include: {
                product: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ tickets }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
