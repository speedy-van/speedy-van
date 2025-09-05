import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { buildReceiptPDF } from '@/lib/pdf';
import { prisma } from '@/lib/prisma';

export async function GET(
  _: Request,
  { params }: { params: { code: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'customer')
    return new Response('Unauthorized', { status: 401 });
  const booking = await prisma.booking.findUnique({
    where: { reference: params.code },
    include: { customer: true },
  });
  if (!booking || booking.customerId !== (session.user as any).id)
    return new Response('Not found', { status: 404 });
  const pdf = await buildReceiptPDF({
    company: { name: 'Speedy Van' },
    Booking: {
      reference: booking.reference,
      totalGBP: booking.totalGBP,
      currency: 'GBP',
      paidAt: booking.paidAt,
      customerEmail: booking.customer?.email ?? undefined,
    },
  });
  return new Response(pdf as any, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=receipt-${booking.reference}.pdf`,
    },
  });
}
