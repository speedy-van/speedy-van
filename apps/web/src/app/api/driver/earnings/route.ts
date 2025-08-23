import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "driver") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "month"; // day, week, month, year
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Get driver
    const driver = await prisma.driver.findUnique({
      where: { userId: session.user.id },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // Calculate date range
    let fromDate: Date;
    let toDate: Date = new Date();

    if (startDate && endDate) {
      fromDate = new Date(startDate);
      toDate = new Date(endDate);
    } else {
      switch (range) {
        case "day":
          fromDate = new Date();
          fromDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          fromDate = new Date();
          fromDate.setDate(fromDate.getDate() - 7);
          break;
        case "month":
          fromDate = new Date();
          fromDate.setMonth(fromDate.getMonth() - 1);
          break;
        case "year":
          fromDate = new Date();
          fromDate.setFullYear(fromDate.getFullYear() - 1);
          break;
        default:
          fromDate = new Date();
          fromDate.setMonth(fromDate.getMonth() - 1);
      }
    }

    // Get earnings for the period
    const earnings = await prisma.driverEarnings.findMany({
      where: {
        driverId: driver.id,
        calculatedAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        Assignment: {
          include: {
            Booking: {
              select: {
                reference: true,
                pickupAddressId: true,
                dropoffAddressId: true,
                totalGBP: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: {
        calculatedAt: "desc",
      },
    });

    // Calculate totals
    const totals = earnings.reduce(
      (acc, earning) => ({
        base: acc.base + earning.baseAmountPence,
        surge: acc.surge + earning.surgeAmountPence,
        tips: acc.tips + earning.tipAmountPence,
        fees: acc.fees + earning.feeAmountPence,
        net: acc.net + earning.netAmountPence,
        jobs: acc.jobs + 1,
      }),
      { base: 0, surge: 0, tips: 0, fees: 0, net: 0, jobs: 0 }
    );

    // Get pending payouts
    const pendingPayouts = await prisma.driverPayout.findMany({
      where: {
        driverId: driver.id,
        status: "pending",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const pendingAmount = pendingPayouts.reduce(
      (sum, payout) => sum + payout.totalAmountPence,
      0
    );

    return NextResponse.json({
      range,
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
      totals: {
        base: totals.base,
        surge: totals.surge,
        tips: totals.tips,
        fees: totals.fees,
        net: totals.net,
        jobs: totals.jobs,
        pending: pendingAmount,
      },
      earnings: earnings.map((earning) => ({
        id: earning.id,
        assignmentId: earning.assignmentId,
        bookingCode: earning.Assignment.Booking.reference,
        pickupAddress: null,
        dropoffAddress: null,
        baseAmountPence: earning.baseAmountPence,
        surgeAmountPence: earning.surgeAmountPence,
        tipAmountPence: earning.tipAmountPence,
        feeAmountPence: earning.feeAmountPence,
        netAmountPence: earning.netAmountPence,
        calculatedAt: earning.calculatedAt,
        paidOut: earning.paidOut,
        bookingAmountPence: (earning.Assignment.Booking.totalGBP || 0) * 100,
        bookingCreatedAt: earning.Assignment.Booking.createdAt,
      })),
      pendingPayouts: pendingPayouts.map((payout) => ({
        id: payout.id,
        totalAmountPence: payout.totalAmountPence,
        status: payout.status,
        createdAt: payout.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching earnings:", error);
    return NextResponse.json(
      { error: "Failed to fetch earnings" },
      { status: 500 }
    );
  }
}
