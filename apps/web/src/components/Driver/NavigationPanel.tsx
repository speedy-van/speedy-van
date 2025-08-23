'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  Divider,
  Spinner,
  useToast,
  useColorModeValue,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import {
  FiNavigation,
  FiMapPin,
  FiHome,
  FiClock,
  FiTruck,
  FiRefreshCw,
  FiExternalLink
} from 'react-icons/fi';

interface RouteInfo {
  distanceToPickup: number;
  etaToPickupMinutes: number;
  totalDistance: number;
  totalDuration: number;
}

interface NavigationUrls {
  pickup: {
    google: string;
    apple: string;
    universal: string;
  };
  dropoff: {
    google: string;
    apple: string;
    universal: string;
  };
}

interface NavigationPanelProps {
  assignmentId: string;
  pickupAddress: string;
  dropoffAddress: string;
  currentStep: string;
  onRefresh?: () => void;
}

export default function NavigationPanel({
  assignmentId,
  pickupAddress,
  dropoffAddress,
  currentStep,
  onRefresh
}: NavigationPanelProps) {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [navigationUrls, setNavigationUrls] = useState<NavigationUrls | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const fetchRouteInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/driver/jobs/${assignmentId}/route`);
      if (response.ok) {
        const data = await response.json();
        setRouteInfo(data.route);
        setNavigationUrls(data.navigation);
        setLastUpdated(new Date());
      } else {
        throw new Error('Failed to fetch route info');
      }
    } catch (error) {
      console.error('Error fetching route info:', error);
      toast({
        title: 'Error',
        description: 'Failed to load navigation information',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRouteInfo();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchRouteInfo, 30000);
    return () => clearInterval(interval);
  }, [assignmentId]);

  const openNavigation = (type: 'pickup' | 'dropoff', provider: 'google' | 'apple' | 'universal' = 'universal') => {
    if (!navigationUrls) return;
    
    const url = navigationUrls[type][provider];
    window.open(url, '_blank');
  };

  const isNavigatingToPickup = currentStep === 'navigate_to_pickup';
  const isNavigatingToDropoff = currentStep === 'en_route_to_dropoff';

  return (
    <Card bg={bgColor} border={`1px solid ${borderColor}`}>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <HStack>
              <FiNavigation />
              <Text fontWeight="semibold">Navigation</Text>
            </HStack>
            <HStack spacing={2}>
              <Tooltip label="Refresh route info">
                <IconButton
                  size="sm"
                  icon={<FiRefreshCw />}
                  onClick={fetchRouteInfo}
                  isLoading={loading}
                  aria-label="Refresh route"
                />
              </Tooltip>
              {lastUpdated && (
                <Text fontSize="xs" color="gray.500">
                  {lastUpdated.toLocaleTimeString()}
                </Text>
              )}
            </HStack>
          </HStack>

          <Divider />

          {/* Current Status */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
              Current Status
            </Text>
            <Badge
              colorScheme={isNavigatingToPickup ? 'green' : isNavigatingToDropoff ? 'blue' : 'gray'}
              variant="subtle"
            >
              {isNavigatingToPickup ? 'Heading to Pickup' : 
               isNavigatingToDropoff ? 'Heading to Dropoff' : 'At Location'}
            </Badge>
          </Box>

          {/* Route Information */}
          {routeInfo && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                Route Information
              </Text>
              <VStack spacing={2} align="stretch">
                {isNavigatingToPickup && (
                  <HStack justify="space-between">
                    <HStack>
                      <FiMapPin />
                      <Text fontSize="sm">To Pickup:</Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="medium">
                      {Math.round(routeInfo.distanceToPickup / 1000)}km • {routeInfo.etaToPickupMinutes}min
                    </Text>
                  </HStack>
                )}
                
                <HStack justify="space-between">
                  <HStack>
                    <FiTruck />
                    <Text fontSize="sm">Total Route:</Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="medium">
                    {Math.round(routeInfo.totalDistance / 1000)}km • {Math.round(routeInfo.totalDuration / 60)}min
                  </Text>
                </HStack>
              </VStack>
            </Box>
          )}

          <Divider />

          {/* Navigation Actions */}
          <VStack spacing={3} align="stretch">
            <Text fontSize="sm" fontWeight="medium" color="gray.600">
              Open Navigation
            </Text>
            
            <HStack spacing={2}>
              <Button
                size="sm"
                leftIcon={<FiMapPin />}
                colorScheme="green"
                onClick={() => openNavigation('pickup')}
                flex={1}
                isDisabled={!navigationUrls}
              >
                To Pickup
              </Button>
              <Button
                size="sm"
                leftIcon={<FiHome />}
                colorScheme="red"
                onClick={() => openNavigation('dropoff')}
                flex={1}
                isDisabled={!navigationUrls}
              >
                To Dropoff
              </Button>
            </HStack>

            {/* Provider Options */}
            {navigationUrls && (
              <HStack spacing={2} justify="center">
                <Tooltip label="Open in Google Maps">
                  <IconButton
                    size="sm"
                    icon={<FiExternalLink />}
                    onClick={() => openNavigation(isNavigatingToPickup ? 'pickup' : 'dropoff', 'google')}
                    aria-label="Google Maps"
                    variant="ghost"
                  />
                </Tooltip>
                <Text fontSize="xs" color="gray.500">Google Maps</Text>
                <Text fontSize="xs" color="gray.400">•</Text>
                <Tooltip label="Open in Apple Maps">
                  <IconButton
                    size="sm"
                    icon={<FiExternalLink />}
                    onClick={() => openNavigation(isNavigatingToPickup ? 'pickup' : 'dropoff', 'apple')}
                    aria-label="Apple Maps"
                    variant="ghost"
                  />
                </Tooltip>
                <Text fontSize="xs" color="gray.500">Apple Maps</Text>
              </HStack>
            )}
          </VStack>

          {/* Loading State */}
          {loading && (
            <HStack justify="center" py={2}>
              <Spinner size="sm" />
              <Text fontSize="sm" color="gray.500">Updating route...</Text>
            </HStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}
