'use client';
import { useEffect, useRef, useState } from 'react';
import Pusher from 'pusher-js';
import dynamic from 'next/dynamic';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Heading,
  Badge,
  Spinner,
  useToast,
  useColorModeValue,
  Divider,
  Alert,
  AlertIcon,
  Button,
  Progress,
  IconButton,
  Tooltip,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import {
  FiMapPin,
  FiClock,
  FiTruck,
  FiRefreshCw,
  FiPhone,
  FiMessageCircle,
  FiNavigation,
  FiAlertCircle,
} from 'react-icons/fi';

const LiveMap = dynamic(() => import('@/components/Map/LiveMap'), {
  ssr: false,
});

interface TrackingInfo {
  booking: {
    id: string;
    code: string;
    status: string;
    paymentStatus: string;
    pickupAddress: string;
    dropoffAddress: string;
    pickupLat?: number;
    pickupLng?: number;
    dropoffLat?: number;
    dropoffLng?: number;
    preferredDate?: string;
    timeSlot?: string;
    crewSize?: number;
    vanSize?: string;
  };
  driver?: {
    id: string;
    name: string;
    phone: string;
  };
  last?: {
    lat: number;
    lng: number;
    createdAt: string;
  };
  channel: string;
}

interface ETAInfo {
  duration: number;
  distance: number;
  geometry?: any;
}

const STATUS_CONFIG = {
  assigned: { label: 'Driver Assigned', color: 'blue', progress: 20 },
  en_route_pickup: { label: 'Driver En Route', color: 'orange', progress: 40 },
  arrived: { label: 'Driver Arrived', color: 'yellow', progress: 60 },
  loaded: { label: 'Items Loaded', color: 'purple', progress: 80 },
  en_route_dropoff: {
    label: 'En Route to Destination',
    color: 'green',
    progress: 90,
  },
  completed: { label: 'Completed', color: 'green', progress: 100 },
};

export default function TrackByIdPage({ params }: { params: { id: string } }) {
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [etaInfo, setEtaInfo] = useState<ETAInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const chanRef = useRef<any>(null);

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  async function loadTracking() {
    setLoading(true);
    try {
      const response = await fetch(`/api/portal/track/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: 'Booking Not Found',
            description:
              "This booking doesn't exist or you don't have permission to view it",
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'Error Loading Tracking',
            description: 'Please try again in a moment',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
        return;
      }

      const data = await response.json();
      setTrackingInfo(data);
      setLastUpdate(new Date());

      if (data.last) {
        setDriverLocation({ lat: data.last.lat, lng: data.last.lng });
      }

      // Load ETA if we have driver location and addresses
      if (data.last && data.booking.pickupLat && data.booking.pickupLng) {
        loadETA(
          data.last.lat,
          data.last.lng,
          data.booking.pickupLat,
          data.booking.pickupLng
        );
      }

      // Setup real-time updates
      setupRealtimeUpdates(data.channel);
    } catch (error) {
      console.error('Error loading tracking:', error);
      toast({
        title: 'Connection Error',
        description: 'Unable to load tracking information',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadETA(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number
  ) {
    try {
      const response = await fetch(
        `/api/track/eta?from=${fromLat},${fromLng}&to=${toLat},${toLng}`
      );
      if (response.ok) {
        const data = await response.json();
        setEtaInfo(data);
      }
    } catch (error) {
      console.error('Error loading ETA:', error);
    }
  }

  function setupRealtimeUpdates(channel: string) {
    if (chanRef.current) {
      chanRef.current.unsubscribe();
    }

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channelInstance = pusher.subscribe(channel);

    channelInstance.bind('location-update', (data: any) => {
      setDriverLocation({ lat: data.lat, lng: data.lng });
      setLastUpdate(new Date());

      // Update ETA if we have destination coordinates
      if (trackingInfo?.booking.pickupLat && trackingInfo?.booking.pickupLng) {
        loadETA(
          data.lat,
          data.lng,
          trackingInfo.booking.pickupLat,
          trackingInfo.booking.pickupLng
        );
      }
    });

    channelInstance.bind('status-update', (data: any) => {
      setTrackingInfo(prev =>
        prev
          ? {
              ...prev,
              booking: { ...prev.booking, status: data.status },
            }
          : null
      );
      setLastUpdate(new Date());
    });

    chanRef.current = channelInstance;
  }

  function handleRefresh() {
    setIsRefreshing(true);
    loadTracking().finally(() => setIsRefreshing(false));
  }

  function handleContactDriver() {
    if (trackingInfo?.driver?.phone) {
      // Mask the phone number for security
      const maskedPhone = trackingInfo.driver.phone.replace(
        /(\d{4})(\d{3})(\d{3})/,
        '$1 *** $3'
      );
      toast({
        title: 'Driver Contact',
        description: `Call driver at ${maskedPhone}`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    }
  }

  useEffect(() => {
    loadTracking();

    // Cleanup on unmount
    return () => {
      if (chanRef.current) {
        chanRef.current.unsubscribe();
      }
    };
  }, [params.id]);

  // Auto-refresh every 30 seconds as fallback
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && trackingInfo) {
        handleRefresh();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, trackingInfo]);

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="center">
          <Spinner size="xl" />
          <Text>Loading tracking information...</Text>
        </VStack>
      </Container>
    );
  }

  if (!trackingInfo) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Unable to load tracking information for this booking.
        </Alert>
      </Container>
    );
  }

  const statusConfig = STATUS_CONFIG[
    trackingInfo.booking.status as keyof typeof STATUS_CONFIG
  ] || { label: trackingInfo.booking.status, color: 'gray', progress: 0 };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Live Tracking</Heading>
            <Text color="gray.600">Booking {trackingInfo.booking.code}</Text>
          </VStack>
          <Tooltip label="Refresh tracking data">
            <IconButton
              aria-label="Refresh"
              icon={<FiRefreshCw />}
              onClick={handleRefresh}
              isLoading={isRefreshing}
              variant="outline"
            />
          </Tooltip>
        </Flex>

        {/* Status Progress */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="medium">Delivery Progress</Text>
                <Badge colorScheme={statusConfig.color} variant="subtle">
                  {statusConfig.label}
                </Badge>
              </HStack>
              <Progress
                value={statusConfig.progress}
                colorScheme={statusConfig.color}
                size="lg"
              />
              {lastUpdate && (
                <Text fontSize="sm" color="gray.500">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Route Information */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Route Details</Heading>
              <HStack spacing={6}>
                <VStack align="start" spacing={1} flex={1}>
                  <HStack>
                    <FiMapPin color="green" />
                    <Text fontWeight="medium">Pickup</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" pl={6}>
                    {trackingInfo.booking.pickupAddress}
                  </Text>
                </VStack>
                <VStack align="start" spacing={1} flex={1}>
                  <HStack>
                    <FiMapPin color="red" />
                    <Text fontWeight="medium">Dropoff</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" pl={6}>
                    {trackingInfo.booking.dropoffAddress}
                  </Text>
                </VStack>
              </HStack>

              {trackingInfo.booking.preferredDate && (
                <HStack>
                  <FiClock />
                  <Text fontSize="sm">
                    Scheduled:{' '}
                    {new Date(
                      trackingInfo.booking.preferredDate
                    ).toLocaleDateString()}
                    {trackingInfo.booking.timeSlot &&
                      ` (${trackingInfo.booking.timeSlot})`}
                  </Text>
                </HStack>
              )}

              <HStack>
                <FiTruck />
                <Text fontSize="sm">
                  {trackingInfo.booking.vanSize} van •{' '}
                  {trackingInfo.booking.crewSize} crew member
                  {trackingInfo.booking.crewSize !== 1 ? 's' : ''}
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Live Map */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Live Map</Heading>
              <Box height="400px" borderRadius="md" overflow="hidden">
                <LiveMap
                  driverLocation={driverLocation || undefined}
                  pickupLocation={
                    trackingInfo.booking.pickupLat &&
                    trackingInfo.booking.pickupLng
                      ? {
                          lat: trackingInfo.booking.pickupLat,
                          lng: trackingInfo.booking.pickupLng,
                          label: 'Pickup',
                        }
                      : undefined
                  }
                  dropoffLocation={
                    trackingInfo.booking.dropoffLat &&
                    trackingInfo.booking.dropoffLng
                      ? {
                          lat: trackingInfo.booking.dropoffLat,
                          lng: trackingInfo.booking.dropoffLng,
                          label: 'Dropoff',
                        }
                      : undefined
                  }
                  route={etaInfo?.geometry}
                  height={400}
                />
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Driver Information and ETA */}
        <HStack spacing={6} align="stretch">
          {/* Driver Info */}
          <Card flex={1}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Your Driver</Heading>
                {trackingInfo.driver ? (
                  <VStack spacing={3} align="stretch">
                    <Text fontWeight="medium">{trackingInfo.driver.name}</Text>
                    <HStack spacing={3}>
                      <Button
                        leftIcon={<FiPhone />}
                        size="sm"
                        onClick={handleContactDriver}
                        colorScheme="blue"
                      >
                        Contact Driver
                      </Button>
                      <Button
                        leftIcon={<FiMessageCircle />}
                        size="sm"
                        variant="outline"
                        isDisabled
                      >
                        Message (Coming Soon)
                      </Button>
                    </HStack>
                  </VStack>
                ) : (
                  <Text color="gray.500">Driver not yet assigned</Text>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* ETA Information */}
          <Card flex={1}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Estimated Arrival</Heading>
                {etaInfo ? (
                  <VStack spacing={2} align="stretch">
                    <Stat>
                      <StatLabel>Time to Pickup</StatLabel>
                      <StatNumber>
                        {Math.round(etaInfo.duration / 60)} min
                      </StatNumber>
                      <StatHelpText>
                        {Math.round(etaInfo.distance / 1000)} km away
                      </StatHelpText>
                    </Stat>
                  </VStack>
                ) : driverLocation ? (
                  <VStack spacing={2} align="center">
                    <Spinner size="sm" />
                    <Text fontSize="sm" color="gray.500">
                      Calculating ETA...
                    </Text>
                  </VStack>
                ) : (
                  <Text color="gray.500">ETA not available</Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        </HStack>

        {/* Safety Notice */}
        <Alert status="info">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="medium">Safety & Privacy</Text>
            <Text fontSize="sm">
              Driver location updates every 15-30 seconds. Contact information
              is masked for security.
            </Text>
          </VStack>
        </Alert>
      </VStack>
    </Container>
  );
}
