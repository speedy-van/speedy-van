import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  WiDaySunny,
  WiRain,
  WiCloudy,
  WiStrongWind,
  WiFog,
} from 'react-icons/wi';
import { MdTraffic, MdRoute, MdWarning } from 'react-icons/md';

interface WeatherInfo {
  condition: string;
  temperature: number;
  precipitation: number;
  windSpeed: number;
  visibility: number;
  impact: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface TrafficInfo {
  congestionLevel: 'low' | 'medium' | 'high' | 'severe';
  estimatedDelay: number;
  roadClosures: any[];
  alternativeRoutes: any[];
  recommendations: string[];
}

interface RouteOptimization {
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

interface RestrictedZoneInfo {
  zoneType: string;
  charges: number;
  requirements: string;
  exemptions: string[];
}

interface EnhancedNotificationDisplayProps {
  notification: {
    data?: {
      weatherInfo?: WeatherInfo;
      trafficInfo?: TrafficInfo;
      routeOptimization?: RouteOptimization;
      restrictedZoneInfo?: RestrictedZoneInfo;
    };
  };
}

export default function EnhancedNotificationDisplay({
  notification,
}: EnhancedNotificationDisplayProps) {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (!notification.data) {
    return null;
  }

  const { weatherInfo, trafficInfo, routeOptimization, restrictedZoneInfo } =
    notification.data;

  return (
    <VStack spacing={3} align="stretch" mt={3}>
      {/* Weather Information */}
      {weatherInfo && (
        <Box
          bg="blue.50"
          border="1px solid"
          borderColor="blue.200"
          borderRadius="md"
          p={3}
        >
          <HStack spacing={2} mb={2}>
            <Icon as={getWeatherIcon(weatherInfo.condition)} color="blue.500" />
            <Text fontSize="sm" fontWeight="semibold" color="blue.700">
              Weather Conditions
            </Text>
            <Badge
              colorScheme={getWeatherImpactColor(weatherInfo.impact)}
              size="sm"
              ml="auto"
            >
              {weatherInfo.impact.toUpperCase()}
            </Badge>
          </HStack>

          <VStack align="start" spacing={1}>
            <Text fontSize="xs" color="blue.600">
              {weatherInfo.condition} • {weatherInfo.temperature}°C
            </Text>
            <Text fontSize="xs" color="blue.600">
              Wind: {weatherInfo.windSpeed} km/h • Visibility:{' '}
              {weatherInfo.visibility} km
            </Text>
            {weatherInfo.precipitation > 0 && (
              <Text fontSize="xs" color="blue.600">
                Precipitation: {weatherInfo.precipitation} mm
              </Text>
            )}

            {weatherInfo.recommendations.length > 0 && (
              <Box mt={2}>
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  color="blue.700"
                  mb={1}
                >
                  Recommendations:
                </Text>
                {weatherInfo.recommendations.map((rec, idx) => (
                  <Text key={idx} fontSize="xs" color="blue.600">
                    • {rec}
                  </Text>
                ))}
              </Box>
            )}
          </VStack>
        </Box>
      )}

      {/* Traffic Information */}
      {trafficInfo && (
        <Box
          bg="orange.50"
          border="1px solid"
          borderColor="orange.200"
          borderRadius="md"
          p={3}
        >
          <HStack spacing={2} mb={2}>
            <Icon as={MdTraffic} color="orange.500" />
            <Text fontSize="sm" fontWeight="semibold" color="orange.700">
              Traffic Conditions
            </Text>
            <Badge
              colorScheme={getTrafficImpactColor(trafficInfo.congestionLevel)}
              size="sm"
              ml="auto"
            >
              {trafficInfo.congestionLevel.toUpperCase()}
            </Badge>
          </HStack>

          <VStack align="start" spacing={1}>
            <Text fontSize="xs" color="orange.600">
              Estimated Delay: {trafficInfo.estimatedDelay} minutes
            </Text>

            {trafficInfo.roadClosures.length > 0 && (
              <Box mt={2}>
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  color="orange.700"
                  mb={1}
                >
                  Road Closures:
                </Text>
                {trafficInfo.roadClosures.map((closure, idx) => (
                  <Box
                    key={idx}
                    bg="orange.100"
                    p={2}
                    borderRadius="sm"
                    w="100%"
                  >
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color="orange.800"
                    >
                      {closure.location}
                    </Text>
                    <Text fontSize="xs" color="orange.700">
                      {closure.reason} • {closure.estimatedDuration}
                    </Text>
                  </Box>
                ))}
              </Box>
            )}

            {trafficInfo.alternativeRoutes.length > 0 && (
              <Box mt={2}>
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  color="orange.700"
                  mb={1}
                >
                  Alternative Routes:
                </Text>
                {trafficInfo.alternativeRoutes.map((route, idx) => (
                  <Box
                    key={idx}
                    bg="orange.100"
                    p={2}
                    borderRadius="sm"
                    w="100%"
                  >
                    <HStack justify="space-between" mb={1}>
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        color="orange.800"
                      >
                        {route.route}
                      </Text>
                      <Badge
                        colorScheme={getTrafficImpactColor(route.trafficLevel)}
                        size="xs"
                      >
                        {route.trafficLevel}
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color="orange.700">
                      {route.distance} miles • {route.time} min • £
                      {route.fuelCost.toFixed(2)} fuel
                    </Text>
                    {route.savings > 0 && (
                      <Text
                        fontSize="xs"
                        color="green.600"
                        fontWeight="semibold"
                      >
                        Saves £{route.savings.toFixed(2)}
                      </Text>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {trafficInfo.recommendations.length > 0 && (
              <Box mt={2}>
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  color="orange.700"
                  mb={1}
                >
                  Recommendations:
                </Text>
                {trafficInfo.recommendations.map((rec, idx) => (
                  <Text key={idx} fontSize="xs" color="orange.600">
                    • {rec}
                  </Text>
                ))}
              </Box>
            )}
          </VStack>
        </Box>
      )}

      {/* Route Optimization */}
      {routeOptimization && (
        <Box
          bg="green.50"
          border="1px solid"
          borderColor="green.200"
          borderRadius="md"
          p={3}
        >
          <HStack spacing={2} mb={2}>
            <Icon as={MdRoute} color="green.500" />
            <Text fontSize="sm" fontWeight="semibold" color="green.700">
              Route Optimization
            </Text>
            {routeOptimization.optimizedRoute.savings > 0 && (
              <Badge colorScheme="green" size="sm" ml="auto">
                SAVE £{routeOptimization.optimizedRoute.savings.toFixed(2)}
              </Badge>
            )}
          </HStack>

          <VStack align="start" spacing={2}>
            {/* Original Route */}
            <Box bg="green.100" p={2} borderRadius="sm" w="100%">
              <Text
                fontSize="xs"
                fontWeight="semibold"
                color="green.800"
                mb={1}
              >
                Original Route:
              </Text>
              <Text fontSize="xs" color="green.700">
                {routeOptimization.originalRoute.distance} miles •{' '}
                {routeOptimization.originalRoute.time} min
              </Text>
              <Text fontSize="xs" color="green.700">
                Fuel: £{routeOptimization.originalRoute.fuelCost.toFixed(2)}
                {routeOptimization.originalRoute.ulezCost > 0 &&
                  ` • ULEZ: £${routeOptimization.originalRoute.ulezCost.toFixed(2)}`}
              </Text>
              <Text fontSize="xs" fontWeight="semibold" color="green.800">
                Total: £{routeOptimization.originalRoute.totalCost.toFixed(2)}
              </Text>
            </Box>

            {/* Optimized Route */}
            <Box bg="green.200" p={2} borderRadius="sm" w="100%">
              <Text
                fontSize="xs"
                fontWeight="semibold"
                color="green.800"
                mb={1}
              >
                Optimized Route:
              </Text>
              <Text fontSize="xs" color="green.700">
                {routeOptimization.optimizedRoute.distance} miles •{' '}
                {routeOptimization.optimizedRoute.time} min
              </Text>
              <Text fontSize="xs" color="green.700">
                Fuel: £{routeOptimization.optimizedRoute.fuelCost.toFixed(2)}
                {routeOptimization.optimizedRoute.ulezCost > 0 &&
                  ` • ULEZ: £${routeOptimization.optimizedRoute.ulezCost.toFixed(2)}`}
              </Text>
              <Text fontSize="xs" fontWeight="semibold" color="green.800">
                Total: £{routeOptimization.optimizedRoute.totalCost.toFixed(2)}
              </Text>
            </Box>

            {routeOptimization.recommendations.length > 0 && (
              <Box mt={2}>
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  color="green.700"
                  mb={1}
                >
                  Recommendations:
                </Text>
                {routeOptimization.recommendations.map((rec, idx) => (
                  <Text key={idx} fontSize="xs" color="green.600">
                    • {rec}
                  </Text>
                ))}
              </Box>
            )}
          </VStack>
        </Box>
      )}

      {/* Restricted Zone Information */}
      {restrictedZoneInfo && (
        <Box
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
          borderRadius="md"
          p={3}
        >
          <HStack spacing={2} mb={2}>
            <Icon as={MdWarning} color="red.500" />
            <Text fontSize="sm" fontWeight="semibold" color="red.700">
              {restrictedZoneInfo.zoneType} Zone
            </Text>
            <Badge colorScheme="red" size="sm" ml="auto">
              £{restrictedZoneInfo.charges.toFixed(2)}
            </Badge>
          </HStack>

          <VStack align="start" spacing={1}>
            <Text fontSize="xs" color="red.600">
              {restrictedZoneInfo.requirements}
            </Text>

            {restrictedZoneInfo.exemptions.length > 0 && (
              <Box mt={2}>
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  color="red.700"
                  mb={1}
                >
                  Exemptions:
                </Text>
                {restrictedZoneInfo.exemptions.map((exemption, idx) => (
                  <Text key={idx} fontSize="xs" color="red.600">
                    • {exemption}
                  </Text>
                ))}
              </Box>
            )}
          </VStack>
        </Box>
      )}
    </VStack>
  );
}

// Helper functions
function getWeatherIcon(condition: string) {
  const conditionLower = condition.toLowerCase();

  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return WiRain;
  } else if (
    conditionLower.includes('cloud') ||
    conditionLower.includes('overcast')
  ) {
    return WiCloudy;
  } else if (
    conditionLower.includes('wind') ||
    conditionLower.includes('breeze')
  ) {
    return WiStrongWind;
  } else if (
    conditionLower.includes('fog') ||
    conditionLower.includes('mist')
  ) {
    return WiFog;
  } else {
    return WiDaySunny;
  }
}

function getWeatherImpactColor(impact: string) {
  switch (impact) {
    case 'high':
      return 'red';
    case 'medium':
      return 'orange';
    default:
      return 'green';
  }
}

function getTrafficImpactColor(level: string) {
  switch (level) {
    case 'severe':
      return 'red';
    case 'high':
      return 'orange';
    case 'medium':
      return 'yellow';
    default:
      return 'green';
  }
}
