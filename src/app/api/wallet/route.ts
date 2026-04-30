import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await getUserFromRequest(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = payload.id as string;

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true }
    });

    const transactions = await prisma.walletTransaction.findMany({
      where: { 
        userId: userId,
        status: "successful"
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined
    });

    return NextResponse.json({
      balance: user?.walletBalance,
      transactions
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
