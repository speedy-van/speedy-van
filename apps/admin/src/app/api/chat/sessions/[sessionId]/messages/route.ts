import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPusherServer } from '@/lib/pusher';
import { prisma } from '@/lib/prisma';
import { MessageType, MessageStatus } from '@prisma/client';

export async function GET(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const guestEmail = searchParams.get('guestEmail');

  // Allow access for authenticated users or guest participants
  if (!session?.user && !guestEmail) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const userId = session?.user ? (session.user as any).id : null;
  const since = searchParams.get('since');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    // Check if user is a participant in this chat session
    let participant;

    if (userId) {
      // Authenticated user
      participant = await prisma.chatParticipant.findUnique({
        where: {
          sessionId_userId: {
            sessionId: params.sessionId,
            userId: userId,
          },
        },
      });
    } else if (guestEmail) {
      // Guest user
      participant = await prisma.chatParticipant.findFirst({
        where: {
          sessionId: params.sessionId,
          guestEmail: guestEmail,
        },
      });
    }

    if (!participant) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Build query for messages
    const whereClause: any = {
      sessionId: params.sessionId,
    };

    if (since) {
      whereClause.createdAt = {
        gt: new Date(since),
      };
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    });

    // Update last read timestamp for the participant
    if (messages.length > 0) {
      await prisma.chatParticipant.update({
        where: {
          id: participant.id,
        },
        data: {
          lastReadAt: new Date(),
        },
      });
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession(authOptions);
  const { content, type = 'text', metadata, guestEmail } = await req.json();

  // Allow access for authenticated users or guest participants
  if (!session?.user && !guestEmail) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const userId = session?.user ? (session.user as any).id : null;

  if (!content || !content.trim()) {
    return new NextResponse('Message content is required', { status: 400 });
  }

  try {
    // Check if user is a participant in this chat session
    let participant;

    if (userId) {
      // Authenticated user
      participant = await prisma.chatParticipant.findUnique({
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
              type: true,
            },
          },
        },
      });
    } else if (guestEmail) {
      // Guest user
      participant = await prisma.chatParticipant.findFirst({
        where: {
          sessionId: params.sessionId,
          guestEmail: guestEmail,
        },
        include: {
          session: {
            select: {
              isActive: true,
              type: true,
            },
          },
        },
      });
    }

    if (!participant) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (!participant.session.isActive) {
      return new NextResponse('Chat session is closed', { status: 400 });
    }

    // For guest messages, we need to use the system user
    let messageSenderId = userId;
    let messageMetadata = metadata || {};

    if (guestEmail) {
      // Find the system user for guest messages
      const systemUser = await prisma.user.findFirst({
        where: {
          email: 'system@speedy-van.co.uk',
        },
      });

      if (!systemUser) {
        console.error('System user not found for guest chat');
        return new NextResponse('System configuration error', { status: 500 });
      }

      messageSenderId = systemUser.id;
      messageMetadata = {
        ...messageMetadata,
        guestName: participant.guestName,
        guestEmail: participant.guestEmail,
        isGuestMessage: true,
      };
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        sessionId: params.sessionId,
        senderId: messageSenderId,
        content: content.trim(),
        type: type as MessageType,
        status: MessageStatus.sent,
        metadata: messageMetadata,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Update session's updatedAt timestamp
    await prisma.chatSession.update({
      where: {
        id: params.sessionId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    // Send real-time notification via Pusher (only if Pusher is configured)
    try {
      const pusher = getPusherServer();
      await pusher.trigger(`chat-session-${params.sessionId}`, 'message:new', {
        id: message.id,
        content: message.content,
        type: message.type,
        status: message.status,
        createdAt: message.createdAt,
        sender: message.sender,
        metadata: message.metadata,
      });

      // Also trigger typing indicator reset
      await pusher.trigger(`chat-session-${params.sessionId}`, 'typing:stop', {
        userId: userId,
      });
    } catch (pusherError) {
      console.warn('Pusher notification failed:', pusherError);
      // Don't fail the request if Pusher fails
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
