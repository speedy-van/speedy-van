'use client';
import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import dynamic from "next/dynamic";
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
  AlertIcon
} from "@chakra-ui/react";
import {
  FiMapPin,
  FiClock,
  FiTruck,
  FiSearch,
  FiRefreshCw
} from "react-icons/fi";

const LiveMap = dynamic(() => import("@/components/Map/LiveMap"), { ssr: false });

interface TrackingInfo {
  Booking: {
    id: string;
    reference: string;
    status: string;
    pickupAddress: string;
    dropoffAddress: string;
    pickupLat?: number;
    pickupLng?: number;
    dropoffLat?: number;
    dropoffLng?: number;
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

export default function TrackPage() {
  const [code, setCode] = useState("");
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [etaInfo, setEtaInfo] = useState<ETAInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);
  const chanRef = useRef<any>(null);
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  async function loadTracking() {
    if (!code.trim()) {
      toast({
        title: "Booking Code Required",
        description: "Please enter a booking code to track your delivery",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/track/${encodeURIComponent(code)}`);
      if (!response.ok) {
        setTrackingInfo(null);
        setDriverLocation(null);
        setEtaInfo(null);
        toast({
          title: "Booking Not Found",
          description: "Please check your booking code and try again",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const data = await response.json();
      setTrackingInfo(data);
      
      if (data.last) {
        setDriverLocation({ lat: data.last.lat, lng: data.last.lng });
      }

      // Set up real-time location updates
      if (chanRef.current) {
        chanRef.current.unsubscribe();
      }
      
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, { 
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER! 
      });
      const channel = pusher.subscribe(data.channel);
      channel.bind("location", (message: any) => {
        setDriverLocation({ lat: message.lat, lng: message.lng });
        // Refresh ETA when location updates
        loadETA();
      });
      chanRef.current = pusher;

      // Load initial ETA
      await loadETA();

    } catch (error) {
      console.error('Error loading tracking info:', error);
      toast({
        title: "Error",
        description: "Failed to load tracking information",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadETA() {
    if (!code.trim()) return;

    try {
      const response = await fetch(`/api/track/eta?code=${encodeURIComponent(code)}`);
      if (response.ok) {
        const data = await response.json();
        setEtaInfo(data);
      }
    } catch (error) {
      console.error('Error loading ETA:', error);
    }
  }

  useEffect(() => {
    return () => {
      if (chanRef.current) {
        chanRef.current.unsubscribe();
      }
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'COMPLETED': return 'green';
      case 'in_progress': return 'blue';
      case 'CONFIRMED': return 'yellow';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'COMPLETED': return 'COMPLETED';
      case 'in_progress': return 'In Progress';
      case 'CONFIRMED': return 'Driver Assigned';
      case 'DRAFT': return 'Awaiting Driver';
      default: return status;
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="lg" mb={2}>Track Your Delivery</Heading>
          <Text color="gray.600">Enter your booking code to track your delivery in real-time</Text>
        </Box>

        {/* Search Section */}
        <Card bg={bgColor} border={`1px solid ${borderColor}`}>
          <CardBody>
            <VStack spacing={4}>
              <HStack w="100%" spacing={3}>
                <Input
                  placeholder="Enter booking code (e.g., ABC123)"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && loadTracking()}
                  size="lg"
                />
                <Button
                  leftIcon={<FiSearch />}
                  onClick={loadTracking}
                  isLoading={loading}
                  loadingText="Loading..."
                  size="lg"
                  colorScheme="blue"
                >
                  Track
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Tracking Information */}
        {trackingInfo && (
          <>
            {/* Status Card */}
            <Card bg={bgColor} border={`1px solid ${borderColor}`}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="md">Delivery Status</Heading>
                    <Badge
                      colorScheme={getStatusColor(trackingInfo.Booking.status)}
                      variant="subtle"
                      fontSize="md"
                      px={3}
                      py={1}
                    >
                      {getStatusText(trackingInfo.Booking.status)}
                    </Badge>
                  </HStack>

                  <Divider />

                  {/* Addresses */}
                  <VStack spacing={3} align="stretch">
                    <Box>
                      <HStack mb={2}>
                        <FiMapPin />
                        <Text fontWeight="medium">Pickup Address</Text>
                      </HStack>
                      <Text color="gray.700" pl={6}>
                        {trackingInfo.Booking.pickupAddress}
                      </Text>
                    </Box>

                    <Box>
                      <HStack mb={2}>
                        <FiMapPin />
                        <Text fontWeight="medium">Delivery Address</Text>
                      </HStack>
                      <Text color="gray.700" pl={6}>
                        {trackingInfo.Booking.dropoffAddress}
                      </Text>
                    </Box>
                  </VStack>

                  {/* ETA Information */}
                  {etaInfo && (
                    <>
                      <Divider />
                      <HStack justify="space-between">
                        <HStack>
                          <FiClock />
                          <Text fontWeight="medium">Estimated Arrival</Text>
                        </HStack>
                        <Text fontSize="lg" fontWeight="bold" color="blue.600">
                          {Math.round(etaInfo.duration / 60)} minutes
                        </Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <HStack>
                          <FiTruck />
                          <Text fontWeight="medium">Distance</Text>
                        </HStack>
                        <Text fontSize="lg" fontWeight="bold">
                          {(etaInfo.distance / 1000).toFixed(1)} km
                        </Text>
                      </HStack>
                    </>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Live Map */}
            <Card bg={bgColor} border={`1px solid ${borderColor}`}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="md">Live Tracking</Heading>
                    <Button
                      size="sm"
                      leftIcon={<FiRefreshCw />}
                      onClick={loadETA}
                      variant="ghost"
                    >
                      Refresh
                    </Button>
                  </HStack>

                  {driverLocation ? (
                    <LiveMap
                      driverLocation={driverLocation}
                      pickupLocation={trackingInfo.Booking.pickupLat && trackingInfo.Booking.pickupLng ? {
                        lat: trackingInfo.Booking.pickupLat,
                        lng: trackingInfo.Booking.pickupLng,
                        label: 'Pickup'
                      } : undefined}
                      dropoffLocation={trackingInfo.Booking.dropoffLat && trackingInfo.Booking.dropoffLng ? {
                        lat: trackingInfo.Booking.dropoffLat,
                        lng: trackingInfo.Booking.dropoffLng,
                        label: 'Delivery'
                      } : undefined}
                      route={etaInfo?.geometry ? {
                        coordinates: etaInfo.geometry.coordinates,
                        distance: etaInfo.distance,
                        duration: etaInfo.duration
                      } : undefined}
                      height={400}
                    />
                  ) : (
                    <Box
                      height={400}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg="gray.50"
                      borderRadius="md"
                    >
                      <VStack spacing={3}>
                        <Spinner size="lg" />
                        <Text color="gray.500">Waiting for driver location...</Text>
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </>
        )}

        {/* Help Section */}
        {!trackingInfo && (
          <Alert status="info">
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">How to track your delivery</Text>
              <Text fontSize="sm">
                Enter the booking code you received when you placed your order. 
                You can find this code in your confirmation email or SMS.
              </Text>
            </Box>
          </Alert>
        )}
      </VStack>
    </Container>
  );
}

