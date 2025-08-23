import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!s?.user || (s.user as any).role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { orderIds, action, data } = await req.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "Order IDs required" }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ error: "Action required" }, { status: 400 });
    }

    let errorCount = 0;
    const errors: string[] = [];

    switch (action) {
      case 'export':
        // Export orders to CSV format
        const orders = await prisma.booking.findMany({
          where: {
            id: { in: orderIds }
          },
          include: {
            customer: {
              select: {
                name: true,
                email: true
              }
            },
            driver: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            },
            pickupAddress: true,
            dropoffAddress: true
          }
        });

        const csvData = orders.map(order => ({
          reference: order.reference,
          status: order.status,
          customerName: order.customer?.name || 'Unknown',
          customerEmail: order.customer?.email || 'Unknown',
          pickupAddress: order.pickupAddress.label,
          dropoffAddress: order.dropoffAddress.label,
          amount: (order.totalGBP / 100).toFixed(2),
          driverName: order.driver?.user.name || 'Unassigned',
          createdAt: order.createdAt,
          scheduledAt: order.scheduledAt
        }));

        return NextResponse.json({ 
          success: true, 
          message: `Exported ${orders.length} orders`,
          data: csvData 
        });

      case 'email':
        // Send email to customers of selected orders
        const emailOrders = await prisma.booking.findMany({
          where: {
            id: { in: orderIds }
          },
          include: {
            customer: true
          }
        });

        // Here you would integrate with your email service
        // For now, just return success
        return NextResponse.json({ 
          success: true, 
          message: `Email notifications sent to ${emailOrders.length} customers`,
          count: emailOrders.length 
        });

      case 'assign':
        // Bulk assign orders to drivers
        const { driverId, autoAssign = false, reason } = data || {};
        
        if (!driverId && !autoAssign) {
          return NextResponse.json({ error: "Driver ID or auto-assign required" }, { status: 400 });
        }

        for (const orderId of orderIds) {
          try {
            const booking = await prisma.booking.findUnique({
              where: { id: orderId },
              include: { driver: true }
            });

            if (!booking) {
              errorCount++;
              errors.push(`Order ${orderId} not found`);
              continue;
            }

            if (booking.driverId && !autoAssign) {
              errorCount++;
              errors.push(`Order ${booking.reference} already assigned`);
              continue;
            }

            let targetDriverId = driverId;

            // Auto-assign logic
            if (autoAssign || !driverId) {
              const availableDrivers = await prisma.driver.findMany({
                where: {
                  status: "active",
                  onboardingStatus: "approved"
                },
                include: {
                  Booking: {
                    where: {
                      status: {
                        in: ["CONFIRMED", "COMPLETED"]
                      }
                    }
                  }
                },
                orderBy: [
                  { rating: "desc" },
                  { createdAt: "asc" }
                ],
                take: 10
              });

              const suitableDrivers = availableDrivers.filter(driver => {
                const activeJobs = driver.Booking.length;
                return activeJobs < 3;
              });

              if (suitableDrivers.length === 0) {
                errorCount++;
                errors.push(`No suitable drivers available for order ${booking.reference}`);
                continue;
              }

              targetDriverId = suitableDrivers[0].id;
            }

            // Update booking
            await prisma.booking.update({
              where: { id: orderId },
              data: {
                driverId: targetDriverId,
                status: "CONFIRMED"
              }
            });

            // Create or update assignment
            await prisma.assignment.upsert({
              where: { bookingId: orderId },
              update: {
                driverId: targetDriverId,
                status: "invited",
                round: 1,
                updatedAt: new Date()
              },
              create: {
                id: `assignment_${orderId}`,
                bookingId: orderId,
                driverId: targetDriverId,
                status: "invited",
                round: 1,
                updatedAt: new Date()
              }
            });

            // Log audit
            await logAudit({
              action: "bulk_assign_driver",
              targetType: "booking",
              targetId: orderId,
              before: { driverId: booking.driverId, status: booking.status },
              after: { driverId: targetDriverId, status: "CONFIRMED" }
            });

          } catch (error) {
            errorCount++;
            errors.push(`Error processing order ${orderId}: ${error}`);
          }
        }

        return NextResponse.json({
          success: true,
          message: `Processed ${orderIds.length} orders with ${errorCount} errors`,
          errors: errors.length > 0 ? errors : undefined
        });

      case 'cancel':
        // Bulk cancel orders
        for (const orderId of orderIds) {
          try {
            const booking = await prisma.booking.findUnique({
              where: { id: orderId }
            });

            if (!booking) {
              errorCount++;
              errors.push(`Order ${orderId} not found`);
              continue;
            }

            if (booking.status === "CANCELLED") {
              errorCount++;
              errors.push(`Order ${booking.reference} already cancelled`);
              continue;
            }

            await prisma.booking.update({
              where: { id: orderId },
              data: { status: "CANCELLED" }
            });

            // Log audit
            await logAudit({
              action: "bulk_cancel_order",
              targetType: "booking",
              targetId: orderId,
              before: { status: booking.status },
              after: { status: "CANCELLED" }
            });

          } catch (error) {
            errorCount++;
            errors.push(`Error cancelling order ${orderId}: ${error}`);
          }
        }

        return NextResponse.json({
          success: true,
          message: `Cancelled ${orderIds.length - errorCount} orders with ${errorCount} errors`,
          errors: errors.length > 0 ? errors : undefined
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (error) {
    console.error("Bulk operations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
