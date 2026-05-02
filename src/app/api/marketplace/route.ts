// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          where: { isActive: true },
          include: {
            tiers: {
              orderBy: { quantity: "asc" },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error: any) {
    console.error("Marketplace fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
