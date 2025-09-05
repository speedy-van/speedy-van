import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ChatSessionType, ChatParticipantRole } from '@prisma/client';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  try {
    // Get all chat sessions where the user is a participant
    const chatSessions = await prisma.chatSession.findMany({
      where: {
        participants: {
          some: {
            userId: userId,
          },
        },
        isActive: true,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        booking: {
          select: {
            id: true,
            reference: true,
            customerName: true,
            status: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(chatSessions);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;
  const { type, bookingId, participantIds, guestInfo, title } =
    await req.json();

  try {
    // Validate session type and permissions
    if (!type || !Object.values(ChatSessionType).includes(type)) {
      return new NextResponse('Invalid session type', { status: 400 });
    }

    // Check if user has permission to create this type of session
    if (
      type === ChatSessionType.customer_admin &&
      userRole !== 'customer' &&
      userRole !== 'admin'
    ) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (
      type === ChatSessionType.driver_admin &&
      userRole !== 'driver' &&
      userRole !== 'admin'
    ) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Create the chat session
    const chatSession = await prisma.chatSession.create({
      data: {
        type: type as ChatSessionType,
        title: title || null,
        bookingId: bookingId || null,
        participants: {
          create: [
            // Add the current user as a participant
            {
              userId: userId,
              role:
                userRole === 'admin'
                  ? ChatParticipantRole.admin
                  : userRole === 'driver'
                    ? ChatParticipantRole.driver
                    : ChatParticipantRole.customer,
            },
            // Add other participants if provided
            ...(participantIds?.map((id: string) => ({
              userId: id,
              role: ChatParticipantRole.customer, // Default role, can be updated
            })) || []),
            // Add guest info if provided
            ...(guestInfo
              ? [
                  {
                    guestName: guestInfo.name,
                    guestEmail: guestInfo.email,
                    role: ChatParticipantRole.guest,
                  },
                ]
              : []),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        booking: {
          select: {
            id: true,
            reference: true,
            customerName: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(chatSession, { status: 201 });
  } catch (error) {
    console.error('Error creating chat session:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
