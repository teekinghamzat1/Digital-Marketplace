import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { invalidateSettingsCache } from "@/lib/settings";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAdminFromRequest();
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.siteSetting.findMany();
    const settingsMap = settings.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return NextResponse.json(settingsMap, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getAdminFromRequest();
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Use a single transaction to batch all upserts — avoids opening many
    // parallel connections which exhausts the serverless connection pool
    await prisma.$transaction(
      Object.entries(data).map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );

    // Bust Next.js page cache so all SSR pages pick up the new settings
    invalidateSettingsCache();

    return NextResponse.json({ message: "Settings updated" }, { status: 200 });
  } catch (error: any) {
    console.error("[admin/settings POST]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
