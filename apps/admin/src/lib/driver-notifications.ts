import { prisma } from '@/lib/prisma';

// Helper function to derive timeSlot from scheduledAt
function getTimeSlotFromDate(scheduledAt: Date): string {
  const hour = scheduledAt.getHours();
  if (hour < 12) return '09:00-12:00'; // AM slot
  if (hour < 17) return '12:00-17:00'; // PM slot
  return '17:00-21:00'; // Evening slot
}

// Enhanced driver notification data with weather, traffic, and route information
export interface DriverNotificationData {
  type: 'new_booking' | 'booking_updated' | 'booking_cancelled';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  data: any;
  actionUrl?: string;
  weatherInfo?: WeatherInfo;
  trafficInfo?: TrafficInfo;
  routeOptimization?: RouteOptimization;
}

// Weather information for driver notifications
export interface WeatherInfo {
  condition: string;
  temperature: number;
  precipitation: number;
  windSpeed: number;
  visibility: number;
  impact: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// Traffic information for driver notifications
export interface TrafficInfo {
  congestionLevel: 'low' | 'medium' | 'high' | 'severe';
  estimatedDelay: number; // minutes
  roadClosures: RoadClosure[];
  alternativeRoutes: AlternativeRoute[];
  recommendations: string[];
}

// Road closure information
export interface RoadClosure {
  location: string;
  reason: string;
  estimatedDuration: string;
  impact: 'low' | 'medium' | 'high';
}

// Alternative route information
export interface AlternativeRoute {
  route: string;
  distance: number; // miles
  time: number; // minutes
  fuelCost: number; // GBP
  savings: number; // GBP compared to original route
  trafficLevel: 'low' | 'medium' | 'high';
  ulezImpact: boolean;
}

// Route optimization for fuel efficiency and cost
export interface RouteOptimization {
  originalRoute: {
    distance: number;
    time: number;
    fuelCost: number;
    ulezCost: number;
    totalCost: number;
  };
  optimizedRoute: {
    distance: number;
    time: number;
    fuelCost: number;
    ulezCost: number;
    totalCost: number;
    savings: number;
  };
  recommendations: string[];
}

export async function sendDriverNotification(
  booking: any,
  driverId: string,
  type: 'job_offer' | 'job_update' | 'job_cancelled' = 'job_offer'
) {
  try {
    console.log(
      '🚛 Sending driver notification for booking:',
      booking.reference
    );

    // Check if booking is in ULEZ/Lez zones or similar restricted areas
    const isRestrictedZone = await checkRestrictedZone(booking);

    // Get weather information for the booking location and time
    const weatherInfo = await getWeatherInfo(booking);

    // Get traffic information and route optimization
    const trafficInfo = await getTrafficInfo(booking);
    const routeOptimization = await getRouteOptimization(booking);

    // Create enhanced driver notification in database
    const notification = await prisma.driverNotification.create({
      data: {
        type,
        title: `New Job Assignment - ${booking.unifiedBookingId || booking.reference}`,
        message: generateEnhancedMessage(
          booking,
          isRestrictedZone,
          weatherInfo,
          trafficInfo
        ),
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
                lng: booking.pickupAddress?.lat,
              },
            },
            dropoff: {
              line1: booking.dropoffAddress?.label,
              city: booking.dropoffAddress?.city,
              postcode: booking.dropoffAddress?.postcode,
              coordinates: {
                lat: booking.dropoffAddress?.lat,
                lng: booking.dropoffAddress?.lng,
              },
            },
          },
          properties: {
            pickup: {
              type: booking.pickupProperty?.propertyType,
              floor: booking.pickupProperty?.floors,
              access: booking.pickupProperty?.accessType,
              notes: booking.pickupProperty?.notes,
            },
            dropoff: {
              type: booking.dropoffProperty?.propertyType,
              floor: booking.dropoffProperty?.floors,
              access: booking.dropoffProperty?.accessType,
              notes: booking.dropoffProperty?.notes,
            },
          },
          schedule: {
            date: booking.scheduledAt,
            timeSlot: getTimeSlotFromDate(booking.scheduledAt),
            estimatedDuration: booking.estimatedDurationMinutes,
          },
          items: booking.items || [],
          pricing: {
            total: booking.totalGBP,
            breakdown: booking.metadata?.pricingBreakdown || {},
          },
          crewRecommendation: await generateCrewRecommendation(booking),
          specialRequirements:
            booking.metadata?.customerPreferences?.specialRequirements || '',
          createdAt: booking.createdAt,
          // Enhanced information for restricted zones
          restrictedZoneInfo: isRestrictedZone
            ? {
                zoneType: isRestrictedZone.type,
                charges: isRestrictedZone.charges,
                requirements: isRestrictedZone.requirements,
                exemptions: isRestrictedZone.exemptions,
              }
            : null,
          weatherInfo: weatherInfo
            ? JSON.parse(JSON.stringify(weatherInfo))
            : null,
          trafficInfo: trafficInfo
            ? JSON.parse(JSON.stringify(trafficInfo))
            : null,
          routeOptimization: routeOptimization
            ? JSON.parse(JSON.stringify(routeOptimization))
            : null,
        },
        driverId: driverId,
      },
    });

    console.log('✅ Enhanced driver notification created:', notification.id);

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
    const hasStairs =
      (booking.pickupProperty?.accessType === 'STAIRS' && pickupFloors > 0) ||
      (booking.dropoffProperty?.accessType === 'STAIRS' && dropoffFloors > 0);

    // Check total volume to determine complexity
    const totalVolume = items.reduce(
      (sum: number, item: any) => sum + (item.volumeM3 || 0),
      0
    );

    let recommendation = {
      suggestedCrewSize: 'ONE' as 'ONE' | 'TWO' | 'THREE' | 'FOUR',
      reason: '',
      confidence: 'low' as 'low' | 'medium' | 'high',
      factors: [] as string[],
    };

    // High confidence factors
    if (requiresTwoPerson) {
      recommendation.suggestedCrewSize = 'TWO';
      recommendation.confidence = 'high';
      recommendation.reason = 'Items require two-person handling';
      recommendation.factors.push('Two-person items detected');
    }

    // Medium confidence factors
    if (totalVolume > 20) {
      // More than 20 cubic meters
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
      recommendation.factors.push(
        `Stairs: ${pickupFloors} pickup, ${dropoffFloors} dropoff floors`
      );
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
    const disassemblyItems = items.filter(
      (item: any) => item.requiresDisassembly
    );
    if (disassemblyItems.length > 0) {
      recommendation.factors.push(
        `${disassemblyItems.length} items need disassembly`
      );
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
      factors: ['Analysis failed'],
    };
  }
}

async function sendRealtimeDriverNotification(
  notification: any,
  driverId: string
) {
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
      data: { read: true, readAt: new Date() },
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
        read: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications;
  } catch (error) {
    console.error('❌ Error getting driver unread notifications:', error);
    return [];
  }
}

export async function getDriverNotificationHistory(
  driverId: string,
  limit: number = 100
) {
  try {
    const notifications = await prisma.driverNotification.findMany({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return notifications;
  } catch (error) {
    console.error('❌ Error getting driver notification history:', error);
    return [];
  }
}

// Check if booking is in restricted zones (ULEZ, Lez, etc.)
async function checkRestrictedZone(booking: any) {
  try {
    const pickupPostcode = booking.pickupAddress?.postcode;
    const dropoffPostcode = booking.dropoffAddress?.postcode;

    // Check ULEZ zones (London)
    if (isULEZZone(pickupPostcode) || isULEZZone(dropoffPostcode)) {
      return {
        type: 'ULEZ',
        charges: 12.5,
        requirements: 'Euro 6 diesel or Euro 4 petrol vehicle required',
        exemptions: ['Electric vehicles', 'Hybrid vehicles meeting standards'],
        applies: true,
      };
    }

    // Check LEZ zones (other cities)
    if (isLEZZone(pickupPostcode) || isLEZZone(dropoffPostcode)) {
      return {
        type: 'LEZ',
        charges: 8.0,
        requirements: 'Euro 6 diesel or Euro 4 petrol vehicle required',
        exemptions: ['Electric vehicles', 'Hybrid vehicles meeting standards'],
        applies: true,
      };
    }

    // Check congestion charge zones
    if (
      isCongestionChargeZone(pickupPostcode) ||
      isCongestionChargeZone(dropoffPostcode)
    ) {
      return {
        type: 'Congestion Charge',
        charges: 15.0,
        requirements: 'Payment required for driving in zone',
        exemptions: ['Electric vehicles', 'Residents', 'Blue badge holders'],
        applies: true,
      };
    }

    return { applies: false };
  } catch (error) {
    console.error('❌ Error checking restricted zones:', error);
    return { applies: false };
  }
}

// Check if postcode is in ULEZ zone
function isULEZZone(postcode: string): boolean {
  if (!postcode) return false;

  // ULEZ covers all of Greater London
  const londonPostcodes = [
    'E',
    'EC',
    'N',
    'NW',
    'SE',
    'SW',
    'W',
    'WC', // Central London
    'BR',
    'CR',
    'DA',
    'EN',
    'HA',
    'IG',
    'KT',
    'RM',
    'SM',
    'TN',
    'TW',
    'UB',
    'WD', // Greater London
  ];

  return londonPostcodes.some(prefix =>
    postcode.toUpperCase().startsWith(prefix)
  );
}

// Check if postcode is in LEZ zone
function isLEZZone(postcode: string): boolean {
  if (!postcode) return false;

  // LEZ zones in various cities
  const lezZones = {
    B: ['Birmingham'],
    M: ['Manchester'],
    L: ['Leeds', 'Liverpool'],
    S: ['Sheffield', 'Southampton'],
    N: ['Newcastle'],
    G: ['Glasgow'],
    E: ['Edinburgh'],
    C: ['Cardiff'],
  };

  // This is a simplified check - in production, use proper zone mapping
  return Object.keys(lezZones).some(prefix =>
    postcode.toUpperCase().startsWith(prefix)
  );
}

// Check if postcode is in congestion charge zone
function isCongestionChargeZone(postcode: string): boolean {
  if (!postcode) return false;

  // London congestion charge zone (central London)
  const congestionZonePostcodes = [
    'E1',
    'E1W',
    'EC1',
    'EC2',
    'EC3',
    'EC4',
    'SE1',
    'SW1',
    'W1',
    'WC1',
    'WC2',
  ];

  return congestionZonePostcodes.some(zone =>
    postcode.toUpperCase().startsWith(zone)
  );
}

// Get weather information for the booking
async function getWeatherInfo(booking: any): Promise<WeatherInfo | null> {
  try {
    const pickupLat = booking.pickupAddress?.lat;
    const pickupLng = booking.pickupAddress?.lng;
    const scheduledDate = new Date(booking.scheduledAt);

    if (!pickupLat || !pickupLng) {
      return null;
    }

    // Call weather API to get current and forecast weather
    const weatherResponse = await fetch(
      `/api/weather/forecast?lat=${pickupLat}&lng=${pickupLng}&date=${scheduledDate.toISOString()}`
    );

    if (!weatherResponse.ok) {
      return getMockWeatherInfo(scheduledDate);
    }

    const weatherData = await weatherResponse.json();

    return {
      condition: weatherData.condition,
      temperature: weatherData.temperature,
      precipitation: weatherData.precipitation,
      windSpeed: weatherData.windSpeed,
      visibility: weatherData.visibility,
      impact: determineWeatherImpact(weatherData),
      recommendations: generateWeatherRecommendations(weatherData),
    };
  } catch (error) {
    console.error('❌ Error getting weather info:', error);
    return getMockWeatherInfo(new Date(booking.scheduledAt));
  }
}

// Get mock weather information (fallback)
function getMockWeatherInfo(date: Date): WeatherInfo {
  const hour = date.getHours();
  const isDaytime = hour >= 6 && hour <= 20;

  return {
    condition: isDaytime ? 'Clear' : 'Cloudy',
    temperature: isDaytime ? 18 : 12,
    precipitation: 0,
    windSpeed: 5,
    visibility: 10,
    impact: 'low',
    recommendations: ['Normal driving conditions expected'],
  };
}

// Determine weather impact level
function determineWeatherImpact(weatherData: any): 'low' | 'medium' | 'high' {
  if (
    weatherData.precipitation > 5 ||
    weatherData.visibility < 5 ||
    weatherData.windSpeed > 20
  ) {
    return 'high';
  } else if (
    weatherData.precipitation > 2 ||
    weatherData.visibility < 8 ||
    weatherData.windSpeed > 15
  ) {
    return 'medium';
  }
  return 'low';
}

// Generate weather-specific recommendations
function generateWeatherRecommendations(weatherData: any): string[] {
  const recommendations = [];

  if (weatherData.precipitation > 5) {
    recommendations.push('Heavy rain expected - allow extra travel time');
    recommendations.push('Use windshield wipers and maintain safe distance');
  }

  if (weatherData.visibility < 8) {
    recommendations.push(
      'Reduced visibility - use headlights and drive carefully'
    );
  }

  if (weatherData.windSpeed > 15) {
    recommendations.push(
      'High winds - secure loose items and drive cautiously'
    );
  }

  if (weatherData.temperature < 5) {
    recommendations.push(
      'Cold weather - check vehicle fluids and tire pressure'
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('Good weather conditions for travel');
  }

  return recommendations;
}

// Get traffic information and route optimization
async function getTrafficInfo(booking: any): Promise<TrafficInfo | null> {
  try {
    const pickupLat = booking.pickupAddress?.lat;
    const pickupLng = booking.pickupAddress?.lng;
    const dropoffLat = booking.dropoffAddress?.lat;
    const dropoffLng = booking.dropoffAddress?.lng;

    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
      return null;
    }

    // Call traffic API to get current conditions
    const trafficResponse = await fetch(
      `/api/traffic/route?from=${pickupLat},${pickupLng}&to=${dropoffLat},${dropoffLng}`
    );

    if (!trafficResponse.ok) {
      return getMockTrafficInfo();
    }

    const trafficData = await trafficResponse.json();

    return {
      congestionLevel: trafficData.congestionLevel,
      estimatedDelay: trafficData.estimatedDelay,
      roadClosures: trafficData.roadClosures || [],
      alternativeRoutes: trafficData.alternativeRoutes || [],
      recommendations: generateTrafficRecommendations(trafficData),
    };
  } catch (error) {
    console.error('❌ Error getting traffic info:', error);
    return getMockTrafficInfo();
  }
}

// Get mock traffic information (fallback)
function getMockTrafficInfo(): TrafficInfo {
  return {
    congestionLevel: 'medium',
    estimatedDelay: 15,
    roadClosures: [],
    alternativeRoutes: [],
    recommendations: [
      'Check route before departure',
      'Allow extra travel time',
    ],
  };
}

// Generate traffic-specific recommendations
function generateTrafficRecommendations(trafficData: any): string[] {
  const recommendations = [];

  if (
    trafficData.congestionLevel === 'high' ||
    trafficData.congestionLevel === 'severe'
  ) {
    recommendations.push('Heavy traffic expected - allow extra travel time');
    recommendations.push('Consider alternative routes if available');
  }

  if (trafficData.estimatedDelay > 30) {
    recommendations.push(
      `Significant delay expected: ${trafficData.estimatedDelay} minutes`
    );
  }

  if (trafficData.roadClosures && trafficData.roadClosures.length > 0) {
    recommendations.push('Road closures detected - check alternative routes');
  }

  if (
    trafficData.alternativeRoutes &&
    trafficData.alternativeRoutes.length > 0
  ) {
    recommendations.push(
      'Alternative routes available - consider fuel efficiency'
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('Normal traffic conditions expected');
  }

  return recommendations;
}

// Get route optimization for fuel efficiency and cost
async function getRouteOptimization(
  booking: any
): Promise<RouteOptimization | null> {
  try {
    const pickupLat = booking.pickupAddress?.lat;
    const pickupLng = booking.pickupAddress?.lng;
    const dropoffLat = booking.dropoffAddress?.lat;
    const dropoffLng = booking.dropoffAddress?.lng;

    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
      return null;
    }

    // Call route optimization API
    const routeResponse = await fetch(
      `/api/routes/optimize?from=${pickupLat},${pickupLng}&to=${dropoffLat},${dropoffLng}&fuelEfficiency=true`
    );

    if (!routeResponse.ok) {
      return getMockRouteOptimization(booking);
    }

    const routeData = await routeResponse.json();

    return {
      originalRoute: routeData.originalRoute,
      optimizedRoute: routeData.optimizedRoute,
      recommendations: generateRouteRecommendations(routeData),
    };
  } catch (error) {
    console.error('❌ Error getting route optimization:', error);
    return getMockRouteOptimization(booking);
  }
}

// Get mock route optimization (fallback)
function getMockRouteOptimization(booking: any): RouteOptimization {
  const distance = booking.distanceMiles || 10;
  const baseTime = distance * 3; // 3 minutes per mile
  const fuelCost = distance * 0.15; // £0.15 per mile
  const ulezCost = 0; // Will be calculated based on zone

  return {
    originalRoute: {
      distance,
      time: baseTime,
      fuelCost,
      ulezCost,
      totalCost: fuelCost + ulezCost,
    },
    optimizedRoute: {
      distance: distance * 0.9, // 10% shorter
      time: baseTime * 0.95, // 5% faster
      fuelCost: fuelCost * 0.85, // 15% less fuel
      ulezCost,
      totalCost: fuelCost * 0.85 + ulezCost,
      savings: fuelCost * 0.15,
    },
    recommendations: [
      'Use recommended route for fuel efficiency',
      'Avoid peak traffic hours if possible',
      'Consider ULEZ charges in route planning',
    ],
  };
}

// Generate route-specific recommendations
function generateRouteRecommendations(routeData: any): string[] {
  const recommendations = [];

  if (routeData.optimizedRoute.savings > 5) {
    recommendations.push(
      `Route optimization saves £${routeData.optimizedRoute.savings.toFixed(2)}`
    );
  }

  if (routeData.optimizedRoute.fuelCost < routeData.originalRoute.fuelCost) {
    const fuelSavings =
      routeData.originalRoute.fuelCost - routeData.optimizedRoute.fuelCost;
    recommendations.push(`Fuel savings: £${fuelSavings.toFixed(2)}`);
  }

  if (routeData.optimizedRoute.ulezCost > 0) {
    recommendations.push('ULEZ charges apply - ensure vehicle compliance');
  }

  if (routeData.optimizedRoute.time < routeData.originalRoute.time) {
    const timeSavings =
      routeData.originalRoute.time - routeData.optimizedRoute.time;
    recommendations.push(`Time savings: ${timeSavings} minutes`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Route is already optimized');
  }

  return recommendations;
}

// Generate enhanced message for driver notifications
function generateEnhancedMessage(
  booking: any,
  isRestrictedZone: any,
  weatherInfo: WeatherInfo | null,
  trafficInfo: TrafficInfo | null
): string {
  let message = `New job from ${booking.pickupAddress?.city || 'Unknown'} to ${booking.dropoffAddress?.city || 'Unknown'}`;

  if (isRestrictedZone?.applies) {
    message += `\n⚠️ ${isRestrictedZone.type} zone - £${isRestrictedZone.charges} charge applies`;
  }

  if (weatherInfo?.impact === 'high') {
    message += `\n🌧️ Weather alert: ${weatherInfo.condition} - extra care required`;
  }

  if (
    trafficInfo?.congestionLevel === 'high' ||
    trafficInfo?.congestionLevel === 'severe'
  ) {
    message += `\n🚦 Heavy traffic expected - allow extra time`;
  }

  if (trafficInfo?.roadClosures && trafficInfo.roadClosures.length > 0) {
    message += `\n🚧 Road closures detected - check alternative routes`;
  }

  return message;
}

// Determine notification priority based on conditions
function determinePriority(
  weatherInfo: WeatherInfo | null,
  trafficInfo: TrafficInfo | null,
  isRestrictedZone: any
): 'low' | 'medium' | 'high' {
  if (
    weatherInfo?.impact === 'high' ||
    trafficInfo?.congestionLevel === 'severe'
  ) {
    return 'high';
  }

  if (
    isRestrictedZone?.applies ||
    weatherInfo?.impact === 'medium' ||
    trafficInfo?.congestionLevel === 'high'
  ) {
    return 'medium';
  }

  return 'low';
}
