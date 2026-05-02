// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { adminResponse, status, action } = await request.json();

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        orderItem: {
          include: {
            order: true,
            productItem: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Handle manual actions like refund
    if (action === "refund") {
      const amount = ticket.orderItem.order.unitPrice;
      
      await prisma.$transaction([
        // Update user balance
        prisma.user.update({
          where: { id: ticket.userId },
          data: { walletBalance: { increment: amount } }
        }),
        // Create transaction record
        prisma.walletTransaction.create({
          data: {
            userId: ticket.userId,
            type: "credit",
            amount,
            reference: `REFUND-${id.substring(0, 8)}`,
            description: `Refund for order item dispute (Ticket: ${id.substring(0, 5)})`,
            status: "successful"
          }
        }),
        // Update ticket
        prisma.ticket.update({
          where: { id },
          data: {
            status: "resolved",
            adminResponse: adminResponse || "Refunded successfully."
          }
        })
      ]);

      return NextResponse.json({ message: "Refund processed and ticket resolved" });
    }

    // Default update
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        adminResponse: adminResponse !== undefined ? adminResponse : ticket.adminResponse,
        status: status !== undefined ? status : ticket.status
      }
    });

    return NextResponse.json({ message: "Ticket updated successfully", ticket: updatedTicket });
  } catch (error: any) {
    console.error("Ticket Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getAdminFromRequest(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: true,
        orderItem: {
          include: {
            order: true,
            productItem: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
