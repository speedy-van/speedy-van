import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestEarnings() {
  try {
    console.log("Creating test earnings data...");

    // Get all drivers
    const drivers = await prisma.driver.findMany({
      include: {
        Assignment: {
          include: {
            Booking: true,
          },
        },
      },
    });

    if (drivers.length === 0) {
      console.log("No drivers found. Please create some drivers first.");
      return;
    }

    // Create earnings for each driver's assignments
    for (const driver of drivers) {
      console.log(`Processing driver: ${driver.id}`);

      for (const assignment of driver.Assignment) {
        // Skip if earnings already exist
        const existingEarnings = await prisma.driverEarnings.findFirst({
          where: { assignmentId: assignment.id },
        });

        if (existingEarnings) {
          console.log(`Earnings already exist for assignment ${assignment.id}`);
          continue;
        }

        // Calculate earnings based on booking amount
        const bookingAmount = (assignment.Booking.totalGBP || 50) * 100; // Convert GBP to pence, default £50
        const baseAmountPence = Math.round(bookingAmount * 0.7); // 70% of booking amount
        const surgeAmountPence = Math.round(bookingAmount * 0.1); // 10% surge
        const tipAmountPence = Math.round(bookingAmount * 0.05); // 5% tip
        const feeAmountPence = Math.round((baseAmountPence + surgeAmountPence) * 0.15); // 15% fee
        const netAmountPence = baseAmountPence + surgeAmountPence + tipAmountPence - feeAmountPence;

        // Create earnings record
        await prisma.driverEarnings.create({
          data: {
            driverId: driver.id,
            assignmentId: assignment.id,
            baseAmountPence,
            surgeAmountPence,
            tipAmountPence,
            feeAmountPence,
            netAmountPence,
            currency: "gbp",
            calculatedAt: new Date(),
            paidOut: false,
          },
        });

        console.log(`Created earnings for assignment ${assignment.id}: £${(netAmountPence / 100).toFixed(2)}`);
      }

      // Create some tips for completed assignments
      const completedAssignments = driver.Assignment.filter(a => a.status === "completed");
      for (const assignment of completedAssignments.slice(0, 3)) { // Max 3 tips per driver
        const tipAmountPence = Math.floor(Math.random() * 1000) + 500; // £5-15 tip
        
        await prisma.driverTip.create({
          data: {
            driverId: driver.id,
            assignmentId: assignment.id,
            amountPence: tipAmountPence,
            currency: "gbp",
            method: ["cash", "card", "qr_code"][Math.floor(Math.random() * 3)] as any,
            reference: `TIP-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            status: "confirmed",
            notes: "Test tip",
          },
        });

        console.log(`Created tip for assignment ${assignment.id}: £${(tipAmountPence / 100).toFixed(2)}`);
      }

      // Create payout settings for each driver
      const existingSettings = await prisma.driverPayoutSettings.findUnique({
        where: { driverId: driver.id },
      });

      if (!existingSettings) {
        await prisma.driverPayoutSettings.create({
          data: {
            driverId: driver.id,
            autoPayout: Math.random() > 0.5, // Random auto payout setting
            minPayoutAmountPence: 5000, // £50 minimum
            accountName: "Test Account",
            accountNumber: "12345678",
            sortCode: "123456",
            verified: Math.random() > 0.3, // 70% verified
          },
        });

        console.log(`Created payout settings for driver ${driver.id}`);
      }
    }

    // Create some test payouts
    for (const driver of drivers) {
      const unpaidEarnings = await prisma.driverEarnings.findMany({
        where: {
          driverId: driver.id,
          paidOut: false,
        },
      });

      if (unpaidEarnings.length > 0) {
        const totalAmount = unpaidEarnings.reduce((sum, earning) => sum + earning.netAmountPence, 0);
        
        if (totalAmount >= 5000) { // Only create payout if >= £50
          const payout = await prisma.driverPayout.create({
            data: {
              driverId: driver.id,
              totalAmountPence: totalAmount,
              currency: "gbp",
              status: Math.random() > 0.2 ? "completed" : "pending", // 80% completed
              processedAt: Math.random() > 0.2 ? new Date() : null,
            },
          });

          // Mark earnings as paid out
          await prisma.driverEarnings.updateMany({
            where: {
              driverId: driver.id,
              paidOut: false,
            },
            data: {
              paidOut: true,
              payoutId: payout.id,
            },
          });

          console.log(`Created payout for driver ${driver.id}: £${(totalAmount / 100).toFixed(2)}`);
        }
      }
    }

    console.log("Test earnings data created successfully!");
  } catch (error) {
    console.error("Error creating test earnings:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestEarnings();
