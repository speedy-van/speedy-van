'use client';

import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  Icon,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  FaMapMarkerAlt,
  FaCalendar,
  FaUsers,
  FaBox,
  FaBuilding,
  FaPoundSign,
} from 'react-icons/fa';
import PricingDisplay from './PricingDisplay';

interface EnhancedBookingSummaryProps {
  bookingData: any;
  showPricing?: boolean;
}

export default function EnhancedBookingSummary({
  bookingData,
  showPricing = true,
}: EnhancedBookingSummaryProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeSlot?: string) => {
    if (!timeSlot) return 'Not set';
    return timeSlot;
  };

  const getTotalVolume = () => {
    if (!bookingData.items || bookingData.items.length === 0) return 0;
    return bookingData.items.reduce((total: number, item: any) => {
      return total + item.volume * item.quantity;
    }, 0);
  };

  return (
    <Box
      p={6}
      bg="white"
      borderRadius="lg"
      shadow="sm"
      border="1px"
      borderColor="gray.200"
    >
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="blue.600" mb={2}>
            Booking Summary
          </Text>
          <Text fontSize="sm" color="gray.600">
            Review your move details before confirming
          </Text>
        </Box>

        <Divider />

        {/* Addresses */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={3} color="gray.700">
            <Icon as={FaMapMarkerAlt} mr={2} color="blue.500" />
            Pickup & Dropoff
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box p={3} bg="blue.50" borderRadius="md">
              <Text fontSize="sm" fontWeight="medium" color="blue.700" mb={1}>
                Pickup Address
              </Text>
              <Text fontSize="sm" color="gray.700">
                {bookingData.pickupAddress?.line1 || 'Not set'}
              </Text>
              {bookingData.pickupAddress?.city && (
                <Text fontSize="sm" color="gray.600">
                  {bookingData.pickupAddress.city}
                </Text>
              )}
            </Box>

            <Box p={3} bg="green.50" borderRadius="md">
              <Text fontSize="sm" fontWeight="medium" color="green.700" mb={1}>
                Dropoff Address
              </Text>
              <Text fontSize="sm" color="gray.700">
                {bookingData.dropoffAddress?.line1 || 'Not set'}
              </Text>
              {bookingData.dropoffAddress?.city && (
                <Text fontSize="sm" color="gray.600">
                  {bookingData.dropoffAddress.city}
                </Text>
              )}
            </Box>
          </SimpleGrid>
        </Box>

        {/* Property Details */}
        {(bookingData.pickupProperty || bookingData.dropoffProperty) && (
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={3} color="gray.700">
              <Icon as={FaBuilding} mr={2} color="blue.500" />
              Property Details
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {bookingData.pickupProperty && (
                <Box p={3} bg="gray.50" borderRadius="md">
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.700"
                    mb={1}
                  >
                    Pickup Property
                  </Text>
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <Text fontSize="sm" color="gray.600">
                        Type:
                      </Text>
                      <Badge colorScheme="blue" size="sm">
                        {bookingData.pickupProperty.propertyType ||
                          'Not specified'}
                      </Badge>
                    </HStack>
                    <HStack>
                      <Text fontSize="sm" color="gray.600">
                        Floor:
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        {bookingData.pickupProperty.floor || 0}
                      </Text>
                    </HStack>
                    <HStack>
                      <Text fontSize="sm" color="gray.600">
                        Lift:
                      </Text>
                      <Badge
                        colorScheme={
                          bookingData.pickupProperty.hasLift ? 'green' : 'red'
                        }
                        size="sm"
                      >
                        {bookingData.pickupProperty.hasLift ? 'Yes' : 'No'}
                      </Badge>
                    </HStack>
                  </VStack>
                </Box>
              )}

              {bookingData.dropoffProperty && (
                <Box p={3} bg="gray.50" borderRadius="md">
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.700"
                    mb={1}
                  >
                    Dropoff Property
                  </Text>
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <Text fontSize="sm" color="gray.600">
                        Type:
                      </Text>
                      <Badge colorScheme="blue" size="sm">
                        {bookingData.dropoffProperty.propertyType ||
                          'Not specified'}
                      </Badge>
                    </HStack>
                    <HStack>
                      <Text fontSize="sm" color="gray.600">
                        Floor:
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        {bookingData.dropoffProperty.floor || 0}
                      </Text>
                    </HStack>
                    <HStack>
                      <Text fontSize="sm" color="gray.600">
                        Lift:
                      </Text>
                      <Badge
                        colorScheme={
                          bookingData.dropoffProperty.hasLift ? 'green' : 'red'
                        }
                        size="sm"
                      >
                        {bookingData.dropoffProperty.hasLift ? 'Yes' : 'No'}
                      </Badge>
                    </HStack>
                  </VStack>
                </Box>
              )}
            </SimpleGrid>
          </Box>
        )}

        {/* Items */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={3} color="gray.700">
            <Icon as={FaBox} mr={2} color="blue.500" />
            Items to Move
          </Text>

          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" color="gray.600">
              {bookingData.items?.length || 0} item
              {(bookingData.items?.length || 0) !== 1 ? 's' : ''}
            </Text>
            <Badge colorScheme="blue" fontSize="sm">
              Total Volume: {getTotalVolume().toFixed(1)} m³
            </Badge>
          </HStack>

          {bookingData.items && bookingData.items.length > 0 ? (
            <VStack spacing={2} align="stretch">
              {bookingData.items.map((item: any, index: number) => (
                <HStack
                  key={index}
                  justify="space-between"
                  p={2}
                  bg="gray.50"
                  borderRadius="md"
                >
                  <Text fontSize="sm" fontWeight="medium">
                    {item.name}
                  </Text>
                  <HStack spacing={2}>
                    <Badge colorScheme="green" size="sm">
                      Qty: {item.quantity}
                    </Badge>
                    <Badge colorScheme="blue" size="sm">
                      {item.volume} m³
                    </Badge>
                  </HStack>
                </HStack>
              ))}
            </VStack>
          ) : (
            <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
              No items added
            </Text>
          )}
        </Box>

        {/* Schedule */}
        <SimpleGrid columns={{ base: 1, md: 1 }} spacing={4}>
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={3} color="gray.700">
              <Icon as={FaCalendar} mr={2} color="blue.500" />
              Schedule
            </Text>
            <VStack align="start" spacing={2}>
              <HStack>
                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                  Date:
                </Text>
                <Text fontSize="sm" color="gray.700">
                  {formatDate(bookingData.date)}
                </Text>
              </HStack>
              <HStack>
                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                  Time:
                </Text>
                <Text fontSize="sm" color="gray.700">
                  {formatTime(bookingData.timeSlot)}
                </Text>
              </HStack>
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Customer Details */}
        {(bookingData.customer?.name ||
          bookingData.customer?.email ||
          bookingData.customer?.phone) && (
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={3} color="gray.700">
              Customer Details
            </Text>
            <VStack align="start" spacing={2}>
              {bookingData.customer?.name && (
                <HStack>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    Name:
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    {bookingData.customer.name}
                  </Text>
                </HStack>
              )}
              {bookingData.customer?.email && (
                <HStack>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    Email:
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    {bookingData.customer.email}
                  </Text>
                </HStack>
              )}
              {bookingData.customer?.phone && (
                <HStack>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    Phone:
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    {bookingData.customer.phone}
                  </Text>
                </HStack>
              )}
            </VStack>
          </Box>
        )}

        {/* Pricing */}
        {showPricing && (
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={3} color="gray.700">
              <Icon as={FaPoundSign} mr={2} color="blue.500" />
              Pricing
            </Text>
            <PricingDisplay bookingData={bookingData} showBreakdown={true} />
          </Box>
        )}
      </VStack>
    </Box>
  );
}
