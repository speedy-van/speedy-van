'use client';

import React, { useState, useEffect } from "react";
import {
  Box,
  Badge,
  Button,
  Divider,
  Grid,
  GridItem,
  Heading,
  HStack,
  VStack,
  Link as ChakraLink,
  Stack,
  Text,
  Icon,
  List,
  ListItem,
  ListIcon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast
} from "@chakra-ui/react";
import NextLink from "next/link";
import { CheckCircleIcon, TimeIcon, InfoIcon } from "@chakra-ui/icons";
import { useParams } from "next/navigation";

interface Driver {
  id: string;
  user: {
    name: string;
    phone: string;
  };
}

interface Booking {
  id: string;
  code: string;
  status: string;
  amount: number;
  amountPence: number;
  paymentStatus: string;
  discountPence?: number;
  createdAt: string;
  preferredDate: string;
  timeSlot: string;
  pickupAddress: string;
  dropoffAddress: string;
  customerId: string;
  driver?: Driver;
  buildingType?: string;
  hasElevator?: boolean;
  stairsFloors?: number;
  specialInstructions?: string;
  vanSize?: string;
  crewSize?: number;
  assembly?: boolean;
  packingMaterials?: boolean;
  heavyItems?: boolean;
}

// Status timeline configuration
const STATUS_TIMELINE = [
  { status: 'open', label: 'Booking Created', description: 'Your booking has been created' },
  { status: 'pending_dispatch', label: 'Pending Dispatch', description: 'We\'re finding the best crew for your job' },
  { status: 'confirmed', label: 'Confirmed', description: 'Your booking has been confirmed' },
  { status: 'assigned', label: 'Crew Assigned', description: 'Your crew has been assigned' },
  { status: 'en_route_pickup', label: 'En Route to Pickup', description: 'Your crew is on the way to pickup' },
  { status: 'arrived', label: 'Arrived at Pickup', description: 'Your crew has arrived at pickup location' },
  { status: 'loaded', label: 'Loaded & En Route', description: 'Items loaded and heading to destination' },
  { status: 'en_route_dropoff', label: 'En Route to Dropoff', description: 'Your crew is on the way to dropoff' },
  { status: 'completed', label: 'Completed', description: 'Your move has been completed successfully' }
];

export default function OrderDetails() {
  const params = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    if (params.code) {
      fetchBooking(params.code as string);
    }
  }, [params.code]);

  const fetchBooking = async (code: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/customer/orders/${code}`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking');
      }
      const data = await response.json();
      setBooking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!booking) return;
    
    try {
      setCancelling(true);
      const response = await fetch(`/api/customer/orders/${booking.code}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to cancel booking');
      }

      const result = await response.json();
      
      // Update local state
      setBooking(prev => prev ? { ...prev, status: 'cancelled' } : null);
      
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to cancel booking',
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4}>Loading order details...</Text>
      </Box>
    );
  }

  if (error || !booking) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="red.500" mb={4}>Error: {error || 'Order not found'}</Text>
        <Button onClick={() => fetchBooking(params.code as string)} colorScheme="blue">
          Try Again
        </Button>
      </Box>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      case 'failed': return 'red';
      case 'en_route_dropoff': return 'blue';
      case 'loaded': return 'blue';
      case 'arrived': return 'yellow';
      case 'assigned': return 'orange';
      case 'confirmed': return 'green';
      case 'pending_dispatch': return 'yellow';
      case 'open': return 'gray';
      default: return 'gray';
    }
  };

  const getCurrentStatusIndex = () => {
    return STATUS_TIMELINE.findIndex(s => s.status === booking.status);
  };

  const canReschedule = ['open', 'pending_dispatch', 'confirmed'].includes(booking.status);
  const canCancel = ['open', 'pending_dispatch', 'confirmed'].includes(booking.status);
  const canTrack = ['assigned', 'en_route_pickup', 'arrived', 'loaded', 'en_route_dropoff'].includes(booking.status);

  return (
    <Stack spacing={6}>
      {/* Header */}
      <VStack align="start" spacing={4}>
        <VStack align="start" spacing={1} width="full">
          <Heading size="lg">Order {booking.code}</Heading>
          <Text color="gray.600">
            Created on {new Date(booking.createdAt).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </VStack>
        <HStack spacing={3} flexWrap="wrap">
          <Badge size="lg" colorScheme={getStatusColor(booking.status)}>
            {booking.status.replace(/_/g, " ").toUpperCase()}
          </Badge>
          <Badge size="lg" colorScheme={booking.paymentStatus === "paid" ? "green" : "yellow"}>
            {booking.paymentStatus.toUpperCase()}
          </Badge>
        </HStack>
      </VStack>

      {/* Status Timeline */}
      <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
        <Heading size="md" mb={4}>Status Timeline</Heading>
        <List spacing={3}>
          {STATUS_TIMELINE.map((step, index) => {
            const currentIndex = getCurrentStatusIndex();
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <ListItem key={step.status}>
                <HStack spacing={3}>
                  <ListIcon
                    as={isCompleted ? CheckCircleIcon : TimeIcon}
                    color={isCompleted ? "green.500" : "gray.300"}
                    boxSize={5}
                  />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontWeight="medium" color={isCompleted ? "black" : "gray.500"}>
                      {step.label}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {step.description}
                    </Text>
                  </VStack>
                  {isCurrent && (
                    <Badge colorScheme="blue" variant="subtle">
                      Current
                    </Badge>
                  )}
                </HStack>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
        <GridItem>
          {/* Live Tracking */}
          {canTrack && (
            <Box borderWidth="1px" borderRadius="lg" p={6} bg="white" mb={6}>
              <HStack justify="space-between" mb={4}>
                <Heading size="md">Live Tracking</Heading>
                <Button
                  as={NextLink as any}
                  href={`/track/${booking.code}`}
                  colorScheme="blue"
                  size="sm"
                >
                  Open Full Map
                </Button>
              </HStack>
              <Box
                bg="gray.100"
                h="200px"
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <VStack>
                  <Icon as={InfoIcon} boxSize={8} color="gray.400" />
                  <Text color="gray.600">Live tracking map</Text>
                  <Text fontSize="sm" color="gray.500">Click "Open Full Map" to view real-time location</Text>
                </VStack>
              </Box>
            </Box>
          )}

          {/* Addresses & Access */}
          <Box borderWidth="1px" borderRadius="lg" p={6} bg="white" mb={6}>
            <Heading size="md" mb={4}>Addresses & Access</Heading>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="medium" color="blue.600" mb={2}>Pickup Address</Text>
                <Text>{booking.pickupAddress || "Not specified"}</Text>
                {booking.buildingType && (
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Building type: {booking.buildingType}
                  </Text>
                )}
                {booking.hasElevator !== null && (
                  <Text fontSize="sm" color="gray.600">
                    Elevator: {booking.hasElevator ? "Yes" : "No"}
                  </Text>
                )}
                {booking.stairsFloors && (
                  <Text fontSize="sm" color="gray.600">
                    Floors: {booking.stairsFloors}
                  </Text>
                )}
              </Box>

              <Divider />

              <Box>
                <Text fontWeight="medium" color="green.600" mb={2}>Dropoff Address</Text>
                <Text>{booking.dropoffAddress || "Not specified"}</Text>
              </Box>

              {booking.specialInstructions && (
                <>
                  <Divider />
                  <Box>
                    <Text fontWeight="medium" mb={2}>Special Instructions</Text>
                    <Text fontSize="sm">{booking.specialInstructions}</Text>
                  </Box>
                </>
              )}
            </VStack>
          </Box>

          {/* Items & Extras */}
          <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
            <Heading size="md" mb={4}>Items & Extras</Heading>
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text>Van Size:</Text>
                <Text fontWeight="medium">{booking.vanSize || "Standard"}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text>Crew Size:</Text>
                <Text fontWeight="medium">{booking.crewSize || 2} people</Text>
              </HStack>
              {booking.assembly && (
                <HStack justify="space-between">
                  <Text>Assembly Required:</Text>
                  <Badge colorScheme="blue">Yes</Badge>
                </HStack>
              )}
              {booking.packingMaterials && (
                <HStack justify="space-between">
                  <Text>Packing Materials:</Text>
                  <Badge colorScheme="blue">Included</Badge>
                </HStack>
              )}
              {booking.heavyItems && (
                <HStack justify="space-between">
                  <Text>Heavy Items:</Text>
                  <Badge colorScheme="orange">Yes</Badge>
                </HStack>
              )}
            </VStack>
          </Box>
        </GridItem>

        <GridItem>
          {/* Driver Assignment */}
          {booking.driver && (
            <Box borderWidth="1px" borderRadius="lg" p={6} bg="white" mb={6}>
              <Heading size="md" mb={4}>Your Crew</Heading>
              <VStack align="start" spacing={3}>
                <Text fontWeight="medium">{booking.driver.user.name}</Text>
                <Text fontSize="sm" color="gray.600">
                  Driver ID: {booking.driver.id}
                </Text>
                <Button size="sm" variant="outline" colorScheme="blue">
                  Contact Driver
                </Button>
              </VStack>
            </Box>
          )}

          {/* Payments & Documents */}
          <Box borderWidth="1px" borderRadius="lg" p={6} bg="white" mb={6}>
            <Heading size="md" mb={4}>Payments & Documents</Heading>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Text fontWeight="medium">Total Amount:</Text>
                <Text fontWeight="bold" fontSize="lg">
                  {booking.amountPence ? formatCurrency(booking.amountPence) : "—"}
                </Text>
              </HStack>

              {booking.discountPence && booking.discountPence > 0 && (
                <HStack justify="space-between">
                  <Text color="green.600">Discount Applied:</Text>
                  <Text color="green.600" fontWeight="medium">
                    -{formatCurrency(booking.discountPence)}
                  </Text>
                </HStack>
              )}

              <Divider />

              <VStack spacing={3}>
                {booking.paymentStatus !== "paid" && (
                  <Button
                    as={NextLink as any}
                    href={`/checkout?code=${booking.code}`}
                    colorScheme="blue"
                    size="md"
                    width="full"
                    height="48px"
                  >
                    Complete Payment
                  </Button>
                )}

                <Button
                  as={NextLink as any}
                  href={`/api/customer/orders/${booking.code}/receipt`}
                  variant="outline"
                  size="md"
                  width="full"
                  height="48px"
                >
                  Download Receipt
                </Button>

                {booking.paymentStatus === "paid" && (
                  <Button
                    as={NextLink as any}
                    href={`/api/customer/orders/${booking.code}/invoice`}
                    variant="outline"
                    size="md"
                    width="full"
                    height="48px"
                  >
                    Download Invoice
                  </Button>
                )}
              </VStack>
            </VStack>
          </Box>

          {/* Actions */}
          <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
            <Heading size="md" mb={4}>Actions</Heading>
            <VStack spacing={4}>
              {canReschedule && (
                <Button
                  variant="outline"
                  size="md"
                  width="full"
                  height="48px"
                  isDisabled={true} // TODO: Implement reschedule functionality
                >
                  Reschedule
                </Button>
              )}

              {canCancel && (
                <Button
                  variant="outline"
                  colorScheme="red"
                  size="md"
                  width="full"
                  height="48px"
                  onClick={onOpen}
                >
                  Cancel Order
                </Button>
              )}

              {canTrack && (
                <Button
                  as={NextLink as any}
                  href={`/customer-portal/track/${booking.id}`}
                  colorScheme="blue"
                  size="md"
                  width="full"
                  height="48px"
                >
                  Track Live
                </Button>
              )}

              <Button
                as={NextLink as any}
                href={`/customer-portal/support?order=${booking.code}`}
                variant="outline"
                size="md"
                width="full"
                height="48px"
              >
                Get Support
              </Button>

              <Button
                variant="outline"
                size="md"
                width="full"
                height="48px"
                isDisabled={true} // TODO: Implement add note functionality
              >
                Add Note
              </Button>
            </VStack>
          </Box>
        </GridItem>
      </Grid>

      {/* Cancel Order Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader>Cancel Order</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} textAlign="center">
              <Box
                bg="red.50"
                p={4}
                borderRadius="md"
                border="1px solid"
                borderColor="red.200"
              >
                <Text fontWeight="medium" color="red.700" mb={2}>
                  Are you sure you want to cancel this order?
                </Text>
                <Text fontSize="sm" color="red.600">
                  This action cannot be undone. You may be charged a cancellation fee depending on your booking terms.
                </Text>
              </Box>
              
              <VStack spacing={3} align="stretch">
                <Box>
                  <Text fontWeight="medium" mb={1}>Order Details:</Text>
                  <Text fontSize="sm" color="gray.600">
                    Order: {booking.code}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Amount: {booking.amountPence ? formatCurrency(booking.amountPence) : "—"}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Date: {new Date(booking.preferredDate).toLocaleDateString('en-GB')}
                  </Text>
                </Box>
              </VStack>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <VStack spacing={3} width="full">
              <Button
                colorScheme="red"
                width="full"
                height="48px"
                onClick={handleCancelOrder}
                isLoading={cancelling}
                loadingText="Cancelling..."
              >
                Yes, Cancel Order
              </Button>
              <Button
                variant="outline"
                width="full"
                height="48px"
                onClick={onClose}
                isDisabled={cancelling}
              >
                Keep Order
              </Button>
            </VStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
}


