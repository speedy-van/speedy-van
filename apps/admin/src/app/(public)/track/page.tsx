'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Input,
  Button,
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
  Progress,
  IconButton,
  Tooltip,
  Flex,
  Grid,
  GridItem,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import {
  FiMapPin,
  FiClock,
  FiTruck,
  FiSearch,
  FiRefreshCw,
  FiWifi,
  FiWifiOff,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
} from 'react-icons/fi';
import { useRealTimeTracking } from '@/hooks/useRealTimeTracking';
import { TrackingData } from '@/lib/tracking-service';

const LiveMap = dynamic(() => import('@/components/Map/LiveMap'), {
  ssr: false,
});

export default function TrackPage() {
  const [code, setCode] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const {
    trackingData,
    isConnected,
    isLoading,
    error,
    lookupBooking,
    refreshData,
    lastUpdate,
    connectionStatus,
  } = useRealTimeTracking({
    autoSubscribe: true,
    refreshInterval: 30000, // 30 seconds
    onUpdate: update => {
      // Show toast for important updates
      if (update.type === 'status') {
        toast({
          title: 'Status Updated',
          description: `Booking status changed to: ${update.data.status}`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const handleSearch = async () => {
    if (!code.trim()) {
      toast({
        title: 'Booking Code Required',
        description: 'Please enter a booking code to track your delivery',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSearchPerformed(true);
    const result = await lookupBooking(code.trim());

    if (result) {
      toast({
        title: 'Booking Found',
        description: `Successfully tracking booking ${result.reference}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'COMPLETED':
        return 'green';
      case 'IN_PROGRESS':
        return 'blue';
      case 'CONFIRMED':
        return 'yellow';
      case 'DRAFT':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'COMPLETED':
        return 'COMPLETED';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'CONFIRMED':
        return 'Driver Assigned';
      case 'DRAFT':
        return 'Awaiting Driver';
      default:
        return status;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="lg" mb={2}>
            Track Your Delivery
          </Heading>
          <Text color="gray.600">
            Enter your booking code or unified booking ID (e.g., SV12345) to
            track your delivery in real-time
          </Text>
        </Box>

        {/* Connection Status */}
        <Card bg={bgColor} border={`1px solid ${borderColor}`}>
          <CardBody>
            <HStack justify="space-between" align="center">
              <HStack spacing={2}>
                {isConnected ? (
                  <FiWifi color="green" />
                ) : (
                  <FiWifiOff color="red" />
                )}
                <Text fontSize="sm">
                  Real-time tracking:{' '}
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </HStack>
              {!isConnected && connectionStatus.reconnectAttempts > 0 && (
                <Text fontSize="xs" color="orange.500">
                  Reconnecting... ({connectionStatus.reconnectAttempts}/
                  {connectionStatus.maxReconnectAttempts})
                </Text>
              )}
            </HStack>
          </CardBody>
        </Card>

        {/* Search Section */}
        <Card bg={bgColor} border={`1px solid ${borderColor}`}>
          <CardBody>
            <VStack spacing={4}>
              <HStack w="100%" spacing={3}>
                <Input
                  placeholder="Enter booking code (e.g., ABC123) or unified ID (e.g., SV12345)"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  onKeyPress={e => e.key === 'Enter' && handleSearch()}
                  size="lg"
                />
                <Button
                  leftIcon={<FiSearch />}
                  onClick={handleSearch}
                  isLoading={isLoading}
                  loadingText="Searching..."
                  size="lg"
                  colorScheme="blue"
                >
                  Track
                </Button>
              </HStack>

              {trackingData && (
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.600">
                    Last updated: {formatTime(trackingData.lastUpdated)}
                  </Text>
                  <Tooltip label="Refresh tracking data">
                    <IconButton
                      icon={<FiRefreshCw />}
                      aria-label="Refresh"
                      size="sm"
                      variant="ghost"
                      onClick={refreshData}
                      isLoading={isLoading}
                    />
                  </Tooltip>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">Error</Text>
              <Text fontSize="sm">{error}</Text>
            </Box>
          </Alert>
        )}

        {/* Tracking Information */}
        {trackingData && (
          <>
            {/* Status Card */}
            <Card bg={bgColor} border={`1px solid ${borderColor}`}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Heading size="md">Delivery Status</Heading>
                      <Text fontSize="sm" color="gray.600">
                        {trackingData.unifiedBookingId
                          ? `Unified ID: ${trackingData.unifiedBookingId}`
                          : `Reference: ${trackingData.reference}`}
                      </Text>
                    </VStack>
                    <Badge
                      colorScheme={getStatusColor(trackingData.status)}
                      variant="subtle"
                      fontSize="md"
                      px={3}
                      py={1}
                    >
                      {getStatusText(trackingData.status)}
                    </Badge>
                  </HStack>

                  <Divider />

                  {/* Route Progress */}
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="medium">Route Progress</Text>
                      <Text fontSize="sm" color="gray.600">
                        {trackingData.routeProgress}% complete
                      </Text>
                    </HStack>
                    <Progress
                      value={trackingData.routeProgress}
                      colorScheme="blue"
                      size="lg"
                      borderRadius="md"
                    />
                  </Box>

                  {/* Addresses */}
                  <Grid
                    templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
                    gap={4}
                  >
                    <Box>
                      <HStack mb={2}>
                        <FiMapPin />
                        <Text fontWeight="medium">Pickup Address</Text>
                      </HStack>
                      <Text color="gray.700" pl={6}>
                        {trackingData.pickupAddress.label}
                      </Text>
                      <Text color="gray.500" pl={6} fontSize="sm">
                        {trackingData.pickupAddress.postcode}
                      </Text>
                    </Box>

                    <Box>
                      <HStack mb={2}>
                        <FiMapPin />
                        <Text fontWeight="medium">Delivery Address</Text>
                      </HStack>
                      <Text color="gray.700" pl={6}>
                        {trackingData.dropoffAddress.label}
                      </Text>
                      <Text color="gray.500" pl={6} fontSize="sm">
                        {trackingData.dropoffAddress.postcode}
                      </Text>
                    </Box>
                  </Grid>

                  {/* Driver Information */}
                  {trackingData.driver && (
                    <>
                      <Divider />
                      <HStack justify="space-between">
                        <HStack>
                          <FiTruck />
                          <Text fontWeight="medium">Driver</Text>
                        </HStack>
                        <Text>{trackingData.driver.name}</Text>
                      </HStack>
                    </>
                  )}

                  {/* ETA Information */}
                  {trackingData.eta && (
                    <>
                      <Divider />
                      <HStack justify="space-between">
                        <HStack>
                          <FiClock />
                          <Text fontWeight="medium">Estimated Arrival</Text>
                        </HStack>
                        <VStack align="end" spacing={1}>
                          <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color="blue.600"
                          >
                            {trackingData.eta.minutesRemaining} minutes
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {formatTime(trackingData.eta.estimatedArrival)}
                          </Text>
                          <Badge
                            colorScheme={
                              trackingData.eta.isOnTime ? 'green' : 'orange'
                            }
                            size="sm"
                          >
                            {trackingData.eta.isOnTime ? 'On Time' : 'Delayed'}
                          </Badge>
                        </VStack>
                      </HStack>
                    </>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Job Timeline */}
            {trackingData.jobTimeline &&
              trackingData.jobTimeline.length > 0 && (
                <Card bg={bgColor} border={`1px solid ${borderColor}`}>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Heading size="md">Job Timeline</Heading>
                      <List spacing={3}>
                        {trackingData.jobTimeline.map((event, index) => (
                          <ListItem key={index}>
                            <HStack spacing={3}>
                              <ListIcon
                                as={FiCheckCircle}
                                color="green.500"
                                boxSize={4}
                              />
                              <VStack align="start" spacing={1} flex={1}>
                                <Text fontWeight="medium">{event.label}</Text>
                                <Text fontSize="sm" color="gray.600">
                                  {formatTime(event.timestamp)}
                                </Text>
                                {event.notes && (
                                  <Text
                                    fontSize="sm"
                                    color="gray.500"
                                    fontStyle="italic"
                                  >
                                    {event.notes}
                                  </Text>
                                )}
                              </VStack>
                            </HStack>
                          </ListItem>
                        ))}
                      </List>
                    </VStack>
                  </CardBody>
                </Card>
              )}

            {/* Live Map */}
            {trackingData.currentLocation && (
              <Card bg={bgColor} border={`1px solid ${borderColor}`}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Heading size="md">Live Tracking</Heading>
                      <Badge colorScheme="green">
                        Real-time updates enabled
                      </Badge>
                    </HStack>

                    <LiveMap
                      driverLocation={trackingData.currentLocation}
                      pickupLocation={{
                        lat: trackingData.pickupAddress.coordinates.lat,
                        lng: trackingData.pickupAddress.coordinates.lng,
                        label: 'Pickup',
                      }}
                      dropoffLocation={{
                        lat: trackingData.dropoffAddress.coordinates.lat,
                        lng: trackingData.dropoffAddress.coordinates.lng,
                        label: 'Delivery',
                      }}
                      height={400}
                    />
                  </VStack>
                </CardBody>
              </Card>
            )}
          </>
        )}

        {/* Help Section */}
        {!trackingData && searchPerformed && (
          <Alert status="info">
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">How to track your delivery</Text>
              <Text fontSize="sm">
                Enter the booking code you received when you placed your order,
                or use the unified booking ID (SV12345 format). You can find
                these codes in your confirmation email or SMS.
              </Text>
            </Box>
          </Alert>
        )}

        {/* Connection Help */}
        {!isConnected && (
          <Alert status="warning">
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">Real-time tracking unavailable</Text>
              <Text fontSize="sm">
                We're having trouble connecting to the real-time tracking
                service. Your tracking information will still update when you
                refresh the page.
              </Text>
            </Box>
          </Alert>
        )}
      </VStack>
    </Container>
  );
}
