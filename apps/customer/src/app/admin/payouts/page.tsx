import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import FinanceClient from './FinanceClient';

async function getFinanceData() {
  // Get recent invoices
  const recentInvoices = await prisma.booking.findMany({
    where: {
      status: 'COMPLETED',
      stripePaymentIntentId: {
        not: null,
      },
    },
    include: {
      customer: true,
    },
    orderBy: {
      paidAt: 'desc',
    },
    take: 10,
  });

  // Get pending refunds
  const pendingRefunds = await prisma.booking.findMany({
    where: {
      status: 'CANCELLED',
      updatedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    },
    include: {
      customer: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 10,
  });

  // Get driver payouts
  const driverPayouts = await prisma.driverPayout.findMany({
    where: {
      status: {
        in: ['pending', 'processing'],
      },
    },
    include: {
      driver: {
        include: {
          user: true,
        },
      },
      earnings: {
        include: {
          Assignment: {
            include: {
              Booking: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });

  // Get earnings breakdown
  const earningsBreakdown = await prisma.driverEarnings.aggregate({
    _sum: {
      baseAmountPence: true,
      surgeAmountPence: true,
      tipAmountPence: true,
      feeAmountPence: true,
      netAmountPence: true,
    },
    where: {
      calculatedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
  });

  // Get revenue metrics
  const revenueMetrics = await prisma.booking.aggregate({
    _sum: {
      totalGBP: true,
    },
    _count: {
      id: true,
    },
    where: {
      status: 'COMPLETED',
      paidAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
  });

  return {
    recentInvoices,
    pendingRefunds,
    driverPayouts,
    earningsBreakdown: {
      baseAmount: earningsBreakdown._sum.baseAmountPence || 0,
      surgeAmount: earningsBreakdown._sum.surgeAmountPence || 0,
      tipAmount: earningsBreakdown._sum.tipAmountPence || 0,
      feeAmount: earningsBreakdown._sum.feeAmountPence || 0,
      netAmount: earningsBreakdown._sum.netAmountPence || 0,
    },
    revenueMetrics: {
      totalRevenue: revenueMetrics._sum.totalGBP || 0,
      totalOrders: revenueMetrics._count.id || 0,
    },
  };
}

export default async function FinancePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'admin')
    redirect('/auth/login');

  const data = await getFinanceData();

  return <FinanceClient data={data} />;
}
