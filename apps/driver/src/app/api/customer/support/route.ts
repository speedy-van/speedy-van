import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const supportTicketSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  orderRef: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  attachments: z.array(z.string()).optional(), // URLs to uploaded files
});

export async function POST(request: NextRequest) {
  try {
    // Verify customer role
    const session = await requireRole('customer');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validationResult = supportTicketSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { category, orderRef, description, email, phone, attachments } =
      validationResult.data;

    // Verify order reference if provided
    if (orderRef) {
      const order = await prisma.booking.findFirst({
        where: {
          reference: orderRef,
          customerId: session.user.id,
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Order reference not found or doesn't belong to you" },
          { status: 400 }
        );
      }
    }

    // Create support ticket
    const supportTicket = await prisma.supportTicket.create({
      data: {
        customerId: session.user.id,
        category,
        orderRef: orderRef || null,
        description,
        email,
        phone: phone || null,
        status: 'OPEN',
        priority: category === 'Urgent Issues' ? 'HIGH' : 'NORMAL',
        attachments: attachments || [],
      },
    });

    // Send notification to support team (this would integrate with your notification system)
    // await sendSupportNotification(supportTicket);

    return NextResponse.json({
      success: true,
      ticketId: supportTicket.id,
      message: 'Support ticket created successfully',
    });
  } catch (error) {
    console.error('Support ticket creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify customer role
    const session = await requireRole('customer');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {
      customerId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    // Get support tickets
    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        category: true,
        orderRef: true,
        description: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        responses: {
          select: {
            id: true,
            message: true,
            createdAt: true,
            isFromSupport: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    // Get total count
    const total = await prisma.supportTicket.count({ where });

    return NextResponse.json({
      tickets,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Support tickets fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch support tickets' },
      { status: 500 }
    );
  }
}
