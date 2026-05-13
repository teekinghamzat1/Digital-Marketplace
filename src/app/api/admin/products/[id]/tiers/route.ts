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

    const { id: productId } = await params;
    const { tiers } = await request.json(); // Array of { label, quantity, price }

    // Use a transaction to update tiers
    await prisma.$transaction(async (tx) => {
      // Simple strategy: delete existing and recreate
      // (Better: update existing by ID if provided, but this is simpler for MVP)
      await tx.tier.deleteMany({ where: { productId } });
      
      if (tiers && tiers.length > 0) {
        await tx.tier.createMany({
          data: tiers.map((t: any) => ({
            productId,
            label: t.label,
            quantity: parseInt(t.quantity),
            price: parseFloat(t.price),
            badgeText: t.badgeText || null,
            highlightType: t.highlightType || null,
            savingsText: t.savingsText || null,
          }))
        });
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
