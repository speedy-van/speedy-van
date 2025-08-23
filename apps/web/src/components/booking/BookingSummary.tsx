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
    <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="blue.600">
            Step 7: Booking Summary
          </Text>
          <Text fontSize="sm" color="gray.600" mt={2}>
            Review your booking details and total cost
          </Text>
        </Box>

        {/* Total Amount Display */}
        <Box p={4} borderWidth="2px" borderRadius="md" borderColor="green.500" bg="green.50">
          <HStack justify="space-between">
            <Text fontSize="xl" fontWeight="bold" color="green.700">
              Total Amount
            </Text>
            <Badge colorScheme="green" fontSize="2xl" p={3}>
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
        <Box p={4} borderWidth="1px" borderRadius="md" bg="blue.50">
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
              <Text fontWeight="medium">Items:</Text>
              <Text>{bookingData.items?.length || 0} item{bookingData.items?.length !== 1 ? 's' : ''}</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Address Summary */}
        <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
          <Text fontSize="lg" fontWeight="semibold" mb={3}>
            Addresses
          </Text>
          <VStack align="start" spacing={3}>
            <Box>
              <Text fontWeight="medium" color="blue.600">Pickup Address:</Text>
              <Text>{bookingData.pickupAddress?.line1 || 'Not set'}</Text>
              <Text fontSize="sm" color="gray.600">
                {bookingData.pickupAddress?.city}, {bookingData.pickupAddress?.postcode}
              </Text>
            </Box>
            <Box>
              <Text fontWeight="medium" color="green.600">Dropoff Address:</Text>
              <Text>{bookingData.dropoffAddress?.line1 || 'Not set'}</Text>
              <Text fontSize="sm" color="gray.600">
                {bookingData.dropoffAddress?.city}, {bookingData.dropoffAddress?.postcode}
              </Text>
            </Box>
          </VStack>
        </Box>

        {/* Customer Details */}
        <Box p={4} borderWidth="1px" borderRadius="md" bg="purple.50">
          <Text fontSize="lg" fontWeight="semibold" mb={3}>
            Customer Details
          </Text>
          <VStack align="start" spacing={2}>
            <HStack justify="space-between" w="full">
              <Text fontWeight="medium">Name:</Text>
              <Text>{bookingData.customerName || 'Not set'}</Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontWeight="medium">Email:</Text>
              <Text>{bookingData.customerEmail || 'Not set'}</Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontWeight="medium">Phone:</Text>
              <Text>{bookingData.customerPhone || 'Not set'}</Text>
            </HStack>
          </VStack>
        </Box>

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
            isCTA={true}
            rightIcon={<FaArrowRight />}
            isDisabled={currentPrice <= 0}
          >
            Continue to Payment
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
