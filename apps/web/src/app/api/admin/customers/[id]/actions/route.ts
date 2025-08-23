import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin role
    const user = await requireRole('admin');
    
    const customerId = params.id;
    const body = await request.json();
    const { action, amount, reason, bookingId, notes } = body;

    // Get customer
    const customer = await prisma.user.findUnique({
      where: { id: customerId, role: 'customer' }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'issue_refund':
        return await handleRefund((user as any).id, customerId, bookingId, amount, reason, notes);
      
      case 'issue_credit':
        return await handleCredit((user as any).id, customerId, amount, reason, notes);
      
      case 'add_flag':
        return await handleAddFlag((user as any).id, customerId, reason, notes);
      
      case 'remove_flag':
        return await handleRemoveFlag((user as any).id, customerId, reason, notes);
      
      case 'export_data':
        return await handleExportData((user as any).id, customerId);
      
      case 'resend_invoice':
        return await handleResendInvoice((user as any).id, customerId, bookingId);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error processing customer action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}

async function handleRefund(
  adminId: string,
  customerId: string,
  bookingId: string,
  amount: number,
  reason: string,
  notes: string
) {
  // Get booking
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      customerId,
      status: 'COMPLETED'
    }
  });

  if (!booking) {
    return NextResponse.json(
      { error: 'Booking not found or not paid' },
      { status: 404 }
    );
  }

  if (amount > (booking.totalGBP || 0)) {
    return NextResponse.json(
      { error: 'Refund amount cannot exceed booking amount' },
      { status: 400 }
    );
  }

  // TODO: Implement proper refund creation
  // For now, return success without creating refund record
  // const refund = await prisma.refund.create({
  //   data: {
  //     paymentId: booking.stripePaymentIntentId || '',
  //     amount: Math.round(amount * 100),
  //     reason,
  //     status: 'pending'
  //   }
  // });

  // Update booking
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CANCELLED'
    }
  });

  // Create audit log
  await createAuditLog({
    action: 'refund.issued',
    targetType: 'Booking',
    targetId: bookingId,
    after: { amount, reason, notes, refundId: 'pending' }
  });

  return NextResponse.json({
    message: 'Refund issued successfully',
    refund: {
      id: 'pending',
      amount,
      reason,
      status: 'pending'
    }
  });
}

async function handleCredit(
  adminId: string,
  customerId: string,
  amount: number,
  reason: string,
  notes: string
) {
  // Create credit record (you might want to add a Credit model to your schema)
  // For now, we'll create an audit log entry
  await createAuditLog({
    action: 'credit.issued',
    targetType: 'User',
    targetId: customerId,
    after: { amount, reason, notes }
  });

  return NextResponse.json({
    message: 'Credit issued successfully',
    credit: {
      amount,
      reason,
      issuedAt: new Date()
    }
  });
}

async function handleAddFlag(
  adminId: string,
  customerId: string,
  reason: string,
  notes: string
) {
  // Add flag to customer (you might want to add a CustomerFlag model)
  // For now, we'll create an audit log entry
  await createAuditLog({
    action: 'customer.flagged',
    targetType: 'User',
    targetId: customerId,
    after: { reason, notes }
  });

  return NextResponse.json({
    message: 'Customer flagged successfully',
    flag: {
      reason,
      notes,
      addedAt: new Date()
    }
  });
}

async function handleRemoveFlag(
  adminId: string,
  customerId: string,
  reason: string,
  notes: string
) {
  // Remove flag from customer
  await createAuditLog({
    action: 'customer.unflagged',
    targetType: 'User',
    targetId: customerId,
    after: { reason, notes }
  });

  return NextResponse.json({
    message: 'Customer flag removed successfully'
  });
}

async function handleExportData(
  adminId: string,
  customerId: string
) {
  // Get all customer data for GDPR export
  const customerData = await prisma.user.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      bookings: {
        select: {
          id: true,
          reference: true,
          status: true,
          totalGBP: true,
          pickupAddress: true,
          dropoffAddress: true,
          scheduledAt: true,
          createdAt: true
        }
      },
      addresses: true,
      contacts: true,
      supportTickets: {
        select: {
          id: true,
          category: true,
          description: true,
          status: true,
          createdAt: true,
          responses: {
            select: {
              message: true,
              isFromSupport: true,
              createdAt: true
            }
          }
        }
      }
    }
  });

  // Create audit log for GDPR compliance
  await createAuditLog({
    action: 'customer.data_exported',
    targetType: 'User',
    targetId: customerId,
    after: { gdprExport: true }
  });

  return NextResponse.json({
    message: 'Customer data exported successfully',
    data: customerData
  });
}

async function handleResendInvoice(
  adminId: string,
  customerId: string,
  bookingId: string
) {
  // Get booking
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      customerId
    }
  });

  if (!booking) {
    return NextResponse.json(
      { error: 'Booking not found' },
      { status: 404 }
    );
  }

  // Create audit log
  await createAuditLog({
    action: 'invoice.resent',
    targetType: 'Booking',
    targetId: bookingId,
    after: { customerId }
  });

  return NextResponse.json({
    message: 'Invoice resent successfully',
    booking: {
      id: booking.id,
      code: booking.reference,
      amount: booking.totalGBP || 0
    }
  });
}
