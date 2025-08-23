import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPusherServer } from "@/lib/pusher";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { driverId: string } }) {
  const msgs = await prisma.message.findMany({
    where: { bookingId: params.driverId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(msgs);
}

export async function POST(req: Request, { params }: { params: { driverId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const { content } = await req.json();
  if (!content?.trim()) return new NextResponse("Empty", { status: 400 });

  const role = (session.user as any).role;
  const uid = (session.user as any).id;

  if (role === "driver") {
    const d = await prisma.driver.findUnique({ where: { userId: uid }, select: { id: true } });
    if (!d || d.id !== params.driverId) return new NextResponse("Forbidden", { status: 403 });
  } else if (role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const m = await prisma.message.create({
    data: { 
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bookingId: params.driverId, 
      senderId: uid, 
      content 
    },
  });
  await getPusherServer().trigger(`driver-${params.driverId}`, "chat:new", m);
  return NextResponse.json(m, { status: 201 });
}


