import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, HStack, Badge, Spinner, Alert, AlertIcon, Divider } from '@chakra-ui/react';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import Button from '../common/Button';
import PricingDisplay from './PricingDisplay';

interface BookingSummaryProps {
  bookingData: any;
  updateBookingData: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function BookingSummary({ 
  bookingData, 
  updateBookingData, 
  onNext, 
  onBack 
}: BookingSummaryProps) {
  const [currentPrice, setCurrentPrice] = useState(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleContinue = () => {
    // Store the calculated price in booking data for the payment step
    console.log('BookingSummary - Storing calculatedTotal:', currentPrice);
    updateBookingData({ calculatedTotal: currentPrice });
    onNext?.();
  };

  // Debug logging for price changes
  useEffect(() => {
    console.log('BookingSummary - currentPrice changed to:', currentPrice);
  }, [currentPrice]);

  return (
    <Box p={6} borderWidth="1px" borderRadius="xl" bg="bg.card" borderColor="border.primary" boxShadow="md">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="neon.500">
            Step 7: Booking Summary
          </Text>
          <Text fontSize="sm" color="text.secondary" mt={2}>
            Review your booking details and total cost
          </Text>
        </Box>

        {/* Total Amount Display */}
        <Box p={4} borderWidth="2px" borderRadius="lg" borderColor="brand.500" bg="bg.surface">
          <HStack justify="space-between">
            <Text fontSize="xl" fontWeight="bold" color="brand.500">
              Total Amount
            </Text>
            <Badge colorScheme="brand" fontSize="2xl" p={3}>
              {formatCurrency(currentPrice)}
            </Badge>
          </HStack>
        </Box>

        {/* Pricing Display with Breakdown */}
        <PricingDisplay 
          bookingData={bookingData} 
          showBreakdown={true}
          onPriceChange={setCurrentPrice}
        />

        {/* Booking Details Summary */}
        <Box p={4} borderWidth="1px" borderRadius="lg" bg="bg.surface" borderColor="border.primary">
          <Text fontSize="lg" fontWeight="semibold" mb={3}>
            Booking Details
          </Text>
          <VStack align="start" spacing={3}>
            <HStack justify="space-between" w="full">
              <Text fontWeight="medium">Move Date:</Text>
              <Text>{formatDate(bookingData.date)}</Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontWeight="medium">Time Slot:</Text>
              <Text>{bookingData.timeSlot || 'Not set'}</Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontWeight="medium">Crew Size:</Text>
              <Text>{bookingData.crewSize} person{bookingData.crewSize !== 1 ? 's' : ''}</Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontWeight="medium">Customer:</Text>
              <Text>{bookingData.customer?.name || 'Not set'}</Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontWeight="medium">Email:</Text>
              <Text>{bookingData.customer?.email || 'Not set'}</Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontWeight="medium">Phone:</Text>
              <Text>{bookingData.customer?.phone || 'Not set'}</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Address Summary */}
        <Box p={4} borderWidth="1px" borderRadius="lg" bg="bg.surface" borderColor="border.primary">
          <Text fontSize="lg" fontWeight="semibold" mb={3}>
            Address Details
          </Text>
          <VStack align="start" spacing={3}>
            <Box>
              <Text fontWeight="medium" color="brand.500">Pickup Address:</Text>
              <Text fontSize="sm" color="text.secondary">
                {bookingData.pickupAddress?.line1 || 'Not set'}, {bookingData.pickupAddress?.city || ''} {bookingData.pickupAddress?.postcode || ''}
              </Text>
              {bookingData.pickupProperty?.propertyType && (
                <Text fontSize="sm" color="text.tertiary">
                  Property: {bookingData.pickupProperty.propertyType} (Floor: {bookingData.pickupProperty.floor || 0})
                </Text>
              )}
            </Box>
            <Box>
              <Text fontWeight="medium" color="neon.500">Dropoff Address:</Text>
              <Text fontSize="sm" color="text.secondary">
                {bookingData.dropoffAddress?.line1 || 'Not set'}, {bookingData.dropoffAddress?.city || ''} {bookingData.dropoffAddress?.postcode || ''}
              </Text>
              {bookingData.dropoffProperty?.propertyType && (
                <Text fontSize="sm" color="text.tertiary">
                  Property: {bookingData.dropoffProperty.propertyType} (Floor: {bookingData.dropoffProperty.floor || 0})
                </Text>
              )}
            </Box>
          </VStack>
        </Box>

        {/* Items Summary */}
        {bookingData.items && bookingData.items.length > 0 && (
          <Box p={4} borderWidth="1px" borderRadius="lg" bg="bg.surface" borderColor="border.primary">
            <Text fontSize="lg" fontWeight="semibold" mb={3}>
              Items to Move ({bookingData.items.length})
            </Text>
            <VStack align="start" spacing={2}>
              {bookingData.items.map((item: any, index: number) => (
                <HStack key={index} justify="space-between" w="full">
                  <Text fontSize="sm">{item.name}</Text>
                  <HStack spacing={2}>
                    <Badge colorScheme="neon" variant="outline">Qty: {item.quantity}</Badge>
                    <Badge colorScheme="brand" variant="outline">£{item.price}</Badge>
                  </HStack>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}

        {/* Navigation Buttons */}
        <HStack spacing={4} justify="space-between" pt={4}>
          <Button
            onClick={onBack}
            variant="secondary"
            size="lg"
            leftIcon={<FaArrowLeft />}
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            variant="primary"
            size="lg"
            rightIcon={<FaArrowRight />}
          >
            Continue to Payment
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
