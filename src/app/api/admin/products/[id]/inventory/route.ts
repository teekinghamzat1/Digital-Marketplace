import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getAdminFromRequest(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { bulk_data } = await request.json();

    if (!bulk_data) {
      return NextResponse.json({ error: "Data is required" }, { status: 400 });
    }

    const lines = bulk_data.split("\n").map((l: string) => l.trim()).filter((l: string) => l.length > 0);

    if (lines.length === 0) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    const created = await prisma.productItem.createMany({
      data: lines.map((content: string) => ({
        productId: id,
        credentialText: content,
        isSold: false
      }))
    });

    return NextResponse.json({
      message: `Successfully uploaded ${created.count} items`,
      count: created.count
    }, { status: 200 });
  } catch (error: any) {
    console.error("Inventory Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
