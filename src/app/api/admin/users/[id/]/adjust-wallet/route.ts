import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import crypto from "crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { amount, type, description } = await request.json();

    if (amount === undefined || !type) {
      return NextResponse.json({ error: "Amount and type are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const numAmount = parseFloat(amount);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          walletBalance: {
            [type === "credit" ? "increment" : "decrement"]: numAmount
          }
        }
      });

      await tx.walletTransaction.create({
        data: {
          userId: id,
          type: type as any,
          amount: numAmount,
          reference: `ADJ-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          description: description || `Admin adjustment: ${type}`,
          status: "successful"
        }
      });
    });

    return NextResponse.json({ message: "Wallet adjusted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
