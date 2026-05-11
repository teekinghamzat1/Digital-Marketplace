import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ticket = await prisma.contactTicket.create({
      data: {
        name,
        email,
        subject,
        message,
        status: "open",
      },
    });

    return NextResponse.json({ success: true, ticketId: ticket.id });
  } catch (error) {
    console.error("Error creating contact ticket:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
