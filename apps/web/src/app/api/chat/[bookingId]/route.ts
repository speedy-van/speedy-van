import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPusherServer } from "@/lib/pusher";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { bookingId: string } }) {
  const msgs = await prisma.message.findMany({
    where: { bookingId: params.bookingId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(msgs);
}

export async function POST(req: Request, { params }: { params: { bookingId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const { content } = await req.json();
  if (!content || !content.trim()) return new NextResponse("Empty", { status: 400 });
  const senderId = (session.user as any).id;

  const m = await prisma.message.create({
    data: { 
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bookingId: params.bookingId, 
      senderId, 
      content 
    },
  });

  await getPusherServer().trigger(`booking-${params.bookingId}`, "chat:new", {
    id: m.id, content: m.content, createdAt: m.createdAt, senderId,
  });

  return NextResponse.json(m, { status: 201 });
}


