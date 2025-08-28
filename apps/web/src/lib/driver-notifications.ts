import { prisma } from '@/lib/prisma';

// Helper function to derive timeSlot from scheduledAt
function getTimeSlotFromDate(scheduledAt: Date): string {
  const hour = scheduledAt.getHours();
  if (hour < 12) return '09:00-12:00'; // AM slot
  if (hour < 17) return '12:00-17:00'; // PM slot
  return '17:00-21:00'; // Evening slot
}

export interface DriverNotificationData {
  type: 'new_booking' | 'booking_updated' | 'booking_cancelled';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  data: any;
  actionUrl?: string;
}

export async function sendDriverNotification(booking: any, driverId: string, type: 'job_offer' | 'job_update' | 'job_cancelled' = 'job_offer') {
  try {
    console.log('🚛 Sending driver notification for booking:', booking.reference);

    // Create driver notification in database
    const notification = await prisma.driverNotification.create({
      data: {
        type,
        title: `New Job Assignment - ${booking.unifiedBookingId || booking.reference}`,
        message: `You have been assigned a new job from ${booking.pickupAddress?.city || 'Unknown'} to ${booking.dropoffAddress?.city || 'Unknown'}`,
        data: {
          bookingId: booking.id,
          reference: booking.reference,
          unifiedBookingId: booking.unifiedBookingId,
          customer: {
            name: booking.customerName,
            phone: booking.customerPhone,
            // Note: Email is intentionally excluded for driver privacy
          },
          addresses: {
            pickup: {
              line1: booking.pickupAddress?.label,
              city: booking.pickupAddress?.city,
              postcode: booking.pickupAddress?.postcode,
              coordinates: {
                lat: booking.pickupAddress?.lat,
                lng: booking.pickupAddress?.lat
              }
            },
            dropoff: {
              line1: booking.dropoffAddress?.label,
              city: booking.dropoffAddress?.city,
              postcode: booking.dropoffAddress?.postcode,
              coordinates: {
                lat: booking.dropoffAddress?.lat,
                lng: booking.dropoffAddress?.lng
              }
            }
          },
          properties: {
            pickup: {
              type: booking.pickupProperty?.propertyType,
              floor: booking.pickupProperty?.floors,
              access: booking.pickupProperty?.accessType,
              notes: booking.pickupProperty?.notes
            },
            dropoff: {
              type: booking.dropoffProperty?.propertyType,
              floor: booking.dropoffProperty?.floors,
              access: booking.dropoffProperty?.accessType,
              notes: booking.dropoffProperty?.notes
            }
          },
          schedule: {
            date: booking.scheduledAt,
            timeSlot: getTimeSlotFromDate(booking.scheduledAt),
            estimatedDuration: booking.estimatedDurationMinutes
          },
          items: booking.items || [],
          pricing: {
            total: booking.totalGBP,
            breakdown: booking.metadata?.pricingBreakdown || {}
          },
          crewRecommendation: await generateCrewRecommendation(booking),
          specialRequirements: booking.metadata?.customerPreferences?.specialRequirements || '',
          createdAt: booking.createdAt
        },
        driverId: driverId
      }
    });

    console.log('✅ Driver notification created:', notification.id);

    // Send real-time notification via Pusher (if configured)
    await sendRealtimeDriverNotification(notification, driverId);

    return notification;

  } catch (error) {
    console.error('❌ Error sending driver notification:', error);
    // Don't throw error - notification failure shouldn't break the booking flow
  }
}

export async function generateCrewRecommendation(booking: any) {
  try {
    // Analyze items to determine if two-person crew is recommended
    const items = booking.items || [];
    const requiresTwoPerson = items.some((item: any) => item.requiresTwoPerson);
    
    // Check property conditions that might require additional help
    const pickupFloors = booking.pickupProperty?.floors || 0;
    const dropoffFloors = booking.dropoffProperty?.floors || 0;
    const hasStairs = (booking.pickupProperty?.accessType === 'STAIRS' && pickupFloors > 0) || 
                      (booking.dropoffProperty?.accessType === 'STAIRS' && dropoffFloors > 0);
    
    // Check total volume to determine complexity
    const totalVolume = items.reduce((sum: number, item: any) => sum + (item.volumeM3 || 0), 0);
    
    let recommendation = {
      suggestedCrewSize: 'ONE' as 'ONE' | 'TWO' | 'THREE' | 'FOUR',
      reason: '',
      confidence: 'low' as 'low' | 'medium' | 'high',
      factors: [] as string[]
    };

    // High confidence factors
    if (requiresTwoPerson) {
      recommendation.suggestedCrewSize = 'TWO';
      recommendation.confidence = 'high';
      recommendation.reason = 'Items require two-person handling';
      recommendation.factors.push('Two-person items detected');
    }

    // Medium confidence factors
    if (totalVolume > 20) { // More than 20 cubic meters
      if (recommendation.suggestedCrewSize === 'ONE') {
        recommendation.suggestedCrewSize = 'TWO';
        recommendation.confidence = 'medium';
        recommendation.reason = 'High volume job';
      }
      recommendation.factors.push(`Total volume: ${totalVolume.toFixed(1)} m³`);
    }

    if (hasStairs && (pickupFloors > 1 || dropoffFloors > 1)) {
      if (recommendation.suggestedCrewSize === 'ONE') {
        recommendation.suggestedCrewSize = 'TWO';
        recommendation.confidence = 'medium';
        recommendation.reason = 'Multiple floors with stairs';
      }
      recommendation.factors.push(`Stairs: ${pickupFloors} pickup, ${dropoffFloors} dropoff floors`);
    }

    // Low confidence factors
    if (items.length > 15) {
      if (recommendation.suggestedCrewSize === 'ONE') {
        recommendation.suggestedCrewSize = 'TWO';
        recommendation.confidence = 'low';
        recommendation.reason = 'Many individual items';
      }
      recommendation.factors.push(`Item count: ${items.length}`);
    }

    // Check for fragile items
    const fragileItems = items.filter((item: any) => item.isFragile);
    if (fragileItems.length > 0) {
      recommendation.factors.push(`${fragileItems.length} fragile items`);
    }

    // Check for items requiring disassembly
    const disassemblyItems = items.filter((item: any) => item.requiresDisassembly);
    if (disassemblyItems.length > 0) {
      recommendation.factors.push(`${disassemblyItems.length} items need disassembly`);
    }

    // If no specific reason was set, provide a default
    if (!recommendation.reason) {
      recommendation.reason = `Based on ${recommendation.factors.join(', ')}`;
    }

    return recommendation;

  } catch (error) {
    console.error('❌ Error generating crew recommendation:', error);
    return {
      suggestedCrewSize: 'TWO' as 'ONE' | 'TWO' | 'THREE' | 'FOUR',
      reason: 'Unable to analyze job requirements',
      confidence: 'low' as 'low' | 'medium' | 'high',
      factors: ['Analysis failed']
    };
  }
}

async function sendRealtimeDriverNotification(notification: any, driverId: string) {
  try {
    // TODO: Implement real-time notification via Pusher
    // This would send a notification to the driver's mobile app or dashboard
    console.log('🔔 Would send real-time notification to driver:', driverId);
    
  } catch (error) {
    console.error('❌ Error sending real-time driver notification:', error);
  }
}

export async function markDriverNotificationAsRead(notificationId: string) {
  try {
    await prisma.driverNotification.update({
      where: { id: notificationId },
      data: { read: true, readAt: new Date() }
    });
    
    console.log('✅ Driver notification marked as read:', notificationId);
  } catch (error) {
    console.error('❌ Error marking driver notification as read:', error);
  }
}

export async function getDriverUnreadNotifications(driverId: string) {
  try {
    const notifications = await prisma.driverNotification.findMany({
      where: { 
        driverId,
        read: false 
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    return notifications;
  } catch (error) {
    console.error('❌ Error getting driver unread notifications:', error);
    return [];
  }
}

export async function getDriverNotificationHistory(driverId: string, limit: number = 100) {
  try {
    const notifications = await prisma.driverNotification.findMany({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    return notifications;
  } catch (error) {
    console.error('❌ Error getting driver notification history:', error);
    return [];
  }
}
