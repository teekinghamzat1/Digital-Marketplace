import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAdminFromRequest(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        _count: {
          select: { items: { where: { isSold: false } } }
        }
      }
    });
    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getAdminFromRequest(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, categoryId, price, shortDescription, fullDescription, isActive } = await request.json();
    
    if (!name || !categoryId || price === undefined) {
      return NextResponse.json({ error: "Name, category, and price are required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        categoryId,
        price: parseFloat(price),
        shortDescription,
        fullDescription,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
