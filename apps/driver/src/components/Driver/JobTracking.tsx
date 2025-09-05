'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  Progress,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  Spinner,
} from '@chakra-ui/react';
import {
  FiMapPin,
  FiClock,
  FiNavigation,
  FiPlay,
  FiPause,
  FiRefreshCw,
} from 'react-icons/fi';

interface JobTrackingProps {
  bookingId: string;
  isActive: boolean;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

interface TrackingStatus {
  isTracking: boolean;
  lastUpdate: Date | null;
  error: string | null;
  locationConsent: boolean;
}

export default function JobTracking({
  bookingId,
  isActive,
  onLocationUpdate,
}: JobTrackingProps) {
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>({
    isTracking: false,
    lastUpdate: null,
    error: null,
    locationConsent: false,
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [routeProgress, setRouteProgress] = useState(0);

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check location consent on mount
    checkLocationConsent();

    return () => {
      stopTracking();
    };
  }, []);

  useEffect(() => {
    if (isActive && trackingStatus.locationConsent) {
      startTracking();
    } else {
      stopTracking();
    }
  }, [isActive, trackingStatus.locationConsent]);

  const checkLocationConsent = async () => {
    try {
      const response = await fetch('/api/driver/availability');
      if (response.ok) {
        const data = await response.json();
        setTrackingStatus(prev => ({
          ...prev,
          locationConsent: data.locationConsent || false,
        }));
      }
    } catch (error) {
      console.error('Error checking location consent:', error);
    }
  };

  const startTracking = () => {
    if (watchIdRef.current) {
      return; // Already tracking
    }

    if (typeof window === 'undefined' || !navigator?.geolocation) {
      setTrackingStatus(prev => ({
        ...prev,
        error: 'Geolocation not available',
      }));
      return;
    }

    setTrackingStatus(prev => ({
      ...prev,
      isTracking: true,
      error: null,
    }));

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        position => {
          const { latitude, longitude } = position.coords;

          // Call the callback if provided
          if (onLocationUpdate) {
            onLocationUpdate(latitude, longitude);
          }

          // Send to tracking API
          sendLocationToAPI(latitude, longitude);

          setTrackingStatus(prev => ({
            ...prev,
            lastUpdate: new Date(),
          }));
        },
        error => {
          console.error('Location tracking error:', error);
          setTrackingStatus(prev => ({
            ...prev,
            error: getLocationErrorMessage(error.code),
            isTracking: false,
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );

      // Set up periodic updates every 30 seconds
      intervalRef.current = setInterval(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            position => {
              const { latitude, longitude } = position.coords;
              sendLocationToAPI(latitude, longitude);
              setTrackingStatus(prev => ({
                ...prev,
                lastUpdate: new Date(),
              }));
            },
            error => {
              console.error('Periodic location update error:', error);
            }
          );
        }
      }, 30000);
    } catch (err) {
      console.error('Failed to start location tracking:', err);
      setTrackingStatus(prev => ({
        ...prev,
        error: 'Failed to start location tracking',
        isTracking: false,
      }));
    }
  };

  const stopTracking = () => {
    if (
      watchIdRef.current &&
      typeof window !== 'undefined' &&
      navigator?.geolocation
    ) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTrackingStatus(prev => ({
      ...prev,
      isTracking: false,
    }));
  };

  const sendLocationToAPI = async (latitude: number, longitude: number) => {
    try {
      setIsUpdating(true);

      const response = await fetch('/api/driver/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          latitude,
          longitude,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update location');
      }

      const data = await response.json();

      toast({
        title: 'Location Updated',
        description: 'Your location has been updated successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error sending location to API:', error);
      toast({
        title: 'Location Update Failed',
        description:
          error instanceof Error ? error.message : 'Failed to update location',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getLocationErrorMessage = (code: number): string => {
    switch (code) {
      case 1:
        return 'Location access denied. Please enable location permissions.';
      case 2:
        return 'Location unavailable. Please check your GPS settings.';
      case 3:
        return 'Location request timed out. Please try again.';
      default:
        return 'Unknown location error occurred.';
    }
  };

  const requestLocationPermission = async () => {
    try {
      if (typeof window === 'undefined' || !navigator?.geolocation) {
        toast({
          title: 'Geolocation Not Supported',
          description: 'Your browser does not support geolocation',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Request location permission
      navigator.geolocation.getCurrentPosition(
        async position => {
          // Update consent in backend
          try {
            const response = await fetch('/api/driver/availability', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                locationConsent: true,
              }),
            });

            if (response.ok) {
              setTrackingStatus(prev => ({
                ...prev,
                locationConsent: true,
                error: null,
              }));

              toast({
                title: 'Location Permission Granted',
                description: 'Location tracking is now enabled',
                status: 'success',
                duration: 3000,
                isClosable: true,
              });
            }
          } catch (error) {
            console.error('Error updating location consent:', error);
          }
        },
        error => {
          setTrackingStatus(prev => ({
            ...prev,
            error: getLocationErrorMessage(error.code),
          }));

          toast({
            title: 'Location Permission Denied',
            description: 'Please enable location permissions to use tracking',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
      );
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  if (!isActive) {
    return (
      <Card>
        <CardBody>
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="bold">Job Tracking</Text>
              <Badge colorScheme="gray">Inactive</Badge>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              Tracking will be enabled when you start an active job
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Text fontWeight="bold">Live Tracking</Text>
            <Badge colorScheme={trackingStatus.isTracking ? 'green' : 'gray'}>
              {trackingStatus.isTracking ? 'Active' : 'Inactive'}
            </Badge>
          </HStack>

          {!trackingStatus.locationConsent && (
            <Alert status="warning">
              <AlertIcon />
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Location Permission Required</Text>
                <Text fontSize="sm">
                  Enable location tracking to provide real-time updates to
                  customers
                </Text>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={requestLocationPermission}
                >
                  Enable Location Tracking
                </Button>
              </VStack>
            </Alert>
          )}

          {trackingStatus.error && (
            <Alert status="error">
              <AlertIcon />
              <Text fontSize="sm">{trackingStatus.error}</Text>
            </Alert>
          )}

          {trackingStatus.locationConsent && (
            <>
              <HStack justify="space-between">
                <Text fontSize="sm">Tracking Status</Text>
                <HStack spacing={2}>
                  {trackingStatus.isTracking ? (
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={stopTracking}
                      leftIcon={<FiPause />}
                    >
                      Stop
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={startTracking}
                      leftIcon={<FiPlay />}
                    >
                      Start
                    </Button>
                  )}

                  <Tooltip label="Manual location update">
                    <IconButton
                      aria-label="Update location"
                      icon={<FiRefreshCw />}
                      size="sm"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            position => {
                              const { latitude, longitude } = position.coords;
                              sendLocationToAPI(latitude, longitude);
                            },
                            error => {
                              console.error(
                                'Manual location update error:',
                                error
                              );
                            }
                          );
                        }
                      }}
                      isLoading={isUpdating}
                    />
                  </Tooltip>
                </HStack>
              </HStack>

              {trackingStatus.lastUpdate && (
                <HStack spacing={2}>
                  <FiClock size={14} />
                  <Text fontSize="sm">
                    Last update:{' '}
                    {trackingStatus.lastUpdate.toLocaleTimeString()}
                  </Text>
                </HStack>
              )}

              <Box>
                <Text fontSize="sm" mb={2}>
                  Route Progress
                </Text>
                <Progress value={routeProgress} colorScheme="blue" size="sm" />
                <Text fontSize="xs" color="gray.600" mt={1}>
                  {routeProgress}% complete
                </Text>
              </Box>

              <HStack spacing={2} color="green.600">
                <FiMapPin />
                <Text fontSize="sm">Location tracking active</Text>
              </HStack>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}
