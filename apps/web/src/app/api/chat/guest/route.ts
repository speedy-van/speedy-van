import { NextResponse } from "next/server";
import { getPusherServer } from "@/lib/pusher";
import { prisma } from "@/lib/prisma";
import { ChatSessionType, ChatParticipantRole } from "@prisma/client";

export async function POST(req: Request) {
  const { name, email, message } = await req.json();

  if (!name || !email || !message) {
    return new NextResponse("Name, email, and message are required", { status: 400 });
  }

  try {
    // Create a guest chat session
    const chatSession = await prisma.chatSession.create({
      data: {
        type: ChatSessionType.guest_admin,
        title: `Guest Support - ${name}`,
        participants: {
          create: [
            {
              guestName: name,
              guestEmail: email,
              role: ChatParticipantRole.guest
            }
          ]
        },
        messages: {
          create: []
        }
      },
      include: {
        participants: true,
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Find admin users to add to the session
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'admin',
        isActive: true
      },
      select: {
        id: true
      },
      take: 3 // Add up to 3 admin users
    });

    // Add admin participants
    if (adminUsers.length > 0) {
      await prisma.chatParticipant.createMany({
        data: adminUsers.map(admin => ({
          sessionId: chatSession.id,
          userId: admin.id,
          role: ChatParticipantRole.admin
        }))
      });
    }

    // Find or create a system user for guest messages
    let systemUser = await prisma.user.findFirst({
      where: {
        email: 'system@speedy-van.co.uk',
        role: 'admin'
      }
    });

    if (!systemUser) {
      // If system user doesn't exist, we'll need to create it with proper hash
      // For now, let's throw an error and suggest running the create-system-user script
      throw new Error('System user not found. Please run the create-system-user script first.');
    }

    // Create the initial message from the guest
    const initialMessage = await prisma.message.create({
      data: {
        sessionId: chatSession.id,
        senderId: systemUser.id,
        content: message,
        type: 'text',
        status: 'sent',
        metadata: {
          guestName: name,
          guestEmail: email,
          isGuestMessage: true
        }
      }
    });

    // Send real-time notification to admin users
    const pusher = getPusherServer();
    await pusher.trigger('admin-support', 'guest:new', {
      sessionId: chatSession.id,
      guestName: name,
      guestEmail: email,
      message: message,
      createdAt: chatSession.createdAt
    });

    return NextResponse.json({
      sessionId: chatSession.id,
      success: true
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating guest chat:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
