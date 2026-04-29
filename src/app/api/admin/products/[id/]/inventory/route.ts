import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { bulk_data } = await request.json();

    if (!bulk_data) {
      return NextResponse.json({ error: "Bulk data is required" }, { status: 400 });
    }

    const lines = bulk_data.split('\n').filter((line: string) => line.trim() !== "");
    
    if (lines.length === 0) {
      return NextResponse.json({ error: "No valid lines found" }, { status: 400 });
    }

    const itemsData = lines.map((line: string) => ({
      productId: id,
      credentialText: line.trim()
    }));

    await prisma.productItem.createMany({
      data: itemsData
    });

    return NextResponse.json({ message: `${lines.length} items added successfully` }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
