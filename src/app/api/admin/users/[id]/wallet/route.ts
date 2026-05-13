import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: userId } = await params;
    const { amount, action } = await request.json(); // amount: Decimal, action: "add" | "set"

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let newBalance = user.walletBalance;
    if (action === "add") {
      newBalance = Number(user.walletBalance) + Number(amount);
    } else if (action === "set") {
      newBalance = Number(amount);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { walletBalance: newBalance }
    });

    // Log the transaction
    await prisma.walletTransaction.create({
      data: {
        userId,
        amount: Number(amount),
        type: action === "add" ? "deposit" : "adjustment",
        status: "successful",
        reference: `ADMIN_${admin.username}_${Date.now()}`
      }
    });

    return NextResponse.json({ balance: newBalance }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
