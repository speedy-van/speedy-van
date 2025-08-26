import { prisma } from "@/lib/prisma";
import { getCurrentPricingSettings } from "@/lib/pricing/settings";

export interface EarningsCalculation {
  baseAmountPence: number;
  surgeAmountPence: number;
  tipAmountPence: number;
  feeAmountPence: number;
  netAmountPence: number;
}

export async function calculateDriverEarnings(assignmentId: string): Promise<EarningsCalculation> {
  // Get assignment with booking details
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      Booking: {
        select: {
          totalGBP: true,
          baseDistanceMiles: true,
          estimatedDurationMinutes: true,
          crewSize: true,
        },
      },
    },
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  const booking = assignment.Booking;
  
  // Get current pricing settings for driver rate multiplier
  const pricingSettings = await getCurrentPricingSettings();
  
  // Base calculation - simplified
  // For now, using a simple calculation based on distance and time
  const baseRatePerMile = 2.50; // £2.50 per mile
  const baseRatePerHour = 25.00; // £25 per hour
  const distanceMiles = booking.baseDistanceMiles || 0;
  const durationHours = (booking.estimatedDurationMinutes || 0) / 60;
  
  // Apply driver rate multiplier if settings are active
  const rateMultiplier = pricingSettings.isActive ? pricingSettings.driverRateMultiplier : 1;
  const adjustedRatePerMile = baseRatePerMile * rateMultiplier;
  const adjustedRatePerHour = baseRatePerHour * rateMultiplier;
  
  // Base amount calculation with adjusted rates
  let baseAmountPence = Math.round(
    (distanceMiles * adjustedRatePerMile + durationHours * adjustedRatePerHour) * 100
  );
  
  // Minimum fare (also adjusted by multiplier)
  const minFarePence = Math.round(1500 * rateMultiplier); // £15 minimum * multiplier
  baseAmountPence = Math.max(baseAmountPence, minFarePence);
  
  // Additional earnings (simplified)
  const surgeAmountPence = 0;
  
  // Get tips for this assignment
  const tips = await prisma.driverTip.findMany({
    where: {
      assignmentId,
      status: { in: ["confirmed", "reconciled"] },
    },
  });
  
  const tipAmountPence = tips.reduce((sum, tip) => sum + tip.amountPence, 0);
  
  // Platform fee (typically 15-20% for delivery platforms)
  const platformFeeRate = 0.15; // 15%
  const feeAmountPence = Math.round((baseAmountPence + surgeAmountPence) * platformFeeRate);
  
  // Net earnings
  const netAmountPence = baseAmountPence + surgeAmountPence + tipAmountPence - feeAmountPence;
  
  return {
    baseAmountPence,
    surgeAmountPence,
    tipAmountPence,
    feeAmountPence,
    netAmountPence,
  };
}

export async function createDriverEarnings(assignmentId: string, driverId: string): Promise<void> {
  try {
    // Check if earnings already exist for this assignment
    const existingEarnings = await prisma.driverEarnings.findFirst({
      where: { assignmentId },
    });

    if (existingEarnings) {
      console.log(`Earnings already exist for assignment ${assignmentId}`);
      return;
    }

    // Calculate earnings
    const earnings = await calculateDriverEarnings(assignmentId);
    
    // Create earnings record
    await prisma.driverEarnings.create({
      data: {
        driverId,
        assignmentId,
        baseAmountPence: earnings.baseAmountPence,
        surgeAmountPence: earnings.surgeAmountPence,
        tipAmountPence: earnings.tipAmountPence,
        feeAmountPence: earnings.feeAmountPence,
        netAmountPence: earnings.netAmountPence,
        currency: "gbp",
        calculatedAt: new Date(),
        paidOut: false,
      },
    });

    console.log(`Created earnings for assignment ${assignmentId}: £${earnings.netAmountPence / 100}`);
  } catch (error) {
    console.error(`Error creating earnings for assignment ${assignmentId}:`, error);
    throw error;
  }
}

export async function getDriverEarningsSummary(driverId: string, range: string = "month") {
  // Calculate date range
  let fromDate: Date;
  const toDate = new Date();

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

  // Get earnings for the period
  const earnings = await prisma.driverEarnings.findMany({
    where: {
      driverId,
      calculatedAt: {
        gte: fromDate,
        lte: toDate,
      },
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

  return {
    range,
    fromDate: fromDate.toISOString(),
    toDate: toDate.toISOString(),
    totals,
    earningsCount: earnings.length,
  };
}
