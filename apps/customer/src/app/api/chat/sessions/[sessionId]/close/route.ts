import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPusherServer } from '@/lib/pusher';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  try {
    // Get the chat session with participants
    const chatSession = await prisma.chatSession.findUnique({
      where: {
        id: params.sessionId,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!chatSession) {
      return new NextResponse('Chat session not found', { status: 404 });
    }

    if (!chatSession.isActive) {
      return new NextResponse('Chat session is already closed', {
        status: 400,
      });
    }

    // Check if user has permission to close this session
    const isParticipant = chatSession.participants.some(
      p => p.userId === userId
    );
    const isAdmin = userRole === 'admin';

    if (!isParticipant && !isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Close the chat session
    await prisma.chatSession.update({
      where: {
        id: params.sessionId,
      },
      data: {
        isActive: false,
        closedAt: new Date(),
        closedBy: userId,
      },
    });

    // Send real-time notification via Pusher
    const pusher = getPusherServer();
    await pusher.trigger(`chat-session-${params.sessionId}`, 'session:closed', {
      closedBy: userId,
      closedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error closing chat session:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
