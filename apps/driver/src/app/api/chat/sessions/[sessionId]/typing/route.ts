import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPusherServer } from '@/lib/pusher';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const userId = (session.user as any).id;
  const { isTyping } = await req.json();

  try {
    // Check if user is a participant in this chat session
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId: params.sessionId,
          userId: userId,
        },
      },
      include: {
        session: {
          select: {
            isActive: true,
          },
        },
      },
    });

    if (!participant) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (!participant.session.isActive) {
      return new NextResponse('Chat session is closed', { status: 400 });
    }

    // Update typing status
    await prisma.chatParticipant.update({
      where: {
        id: participant.id,
      },
      data: {
        isTyping: isTyping,
      },
    });

    // Send real-time notification via Pusher
    const pusher = getPusherServer();
    await pusher.trigger(`chat-session-${params.sessionId}`, 'typing:update', {
      userId: userId,
      isTyping: isTyping,
      userName: (session.user as any).name || (session.user as any).email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating typing status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
