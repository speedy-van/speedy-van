'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, VStack, HStack, Heading, Text, Progress, useToast } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { logBookingBoot } from '@/lib/booking-boot-log';
// Import all booking step components
import PickupDropoffStep from '@/components/booking/PickupDropoffStep';
import PropertyDetailsStep from '@/components/booking/PropertyDetailsStep';
import ItemSelectionStep from '@/components/booking/ItemSelectionStep';
import DateTimeStep from '@/components/booking/DateTimeStep';
import CustomerDetailsStep from '@/components/booking/CustomerDetailsStep';
import CrewSelectionStep from '@/components/booking/CrewSelectionStep';
import BookingSummary from '@/components/booking/BookingSummary';
import PaymentStep from '@/components/booking/PaymentStep';
import ConfirmationStep from '@/components/booking/ConfirmationStep';

// Create motion components using motion.create()
const MotionBox = motion.create(Box);

interface BookingData {
  // Pickup & Dropoff
  pickupAddress?: {
    line1?: string;
    city?: string;
    postcode?: string;
    coordinates?: { lat: number; lng: number };
  };
  dropoffAddress?: {
    line1?: string;
    city?: string;
    postcode?: string;
    coordinates?: { lat: number; lng: number };
  };

  // Property Details
  pickupProperty?: {
    propertyType?: string;
    floor?: number;
    hasLift?: boolean;
  };
  dropoffProperty?: {
    propertyType?: string;
    floor?: number;
    hasLift?: boolean;
  };

  // Items
  items?: Array<{
    name: string;
    volume: number;
    quantity: number;
  }>;

  // Date & Time
  date?: string;
  timeSlot?: string;

  // Customer Details
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;

  // Crew
  crewSize?: number;



  // Payment
  paymentMethod?: string;
  termsAccepted?: boolean;
}

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({});
  const toast = useToast();

  useEffect(() => {
    logBookingBoot('/booking');
  }, []);

  const updateBookingData = (updates: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < 9) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep = () => {
    const commonProps = {
      bookingData,
      updateBookingData,
      onNext: nextStep,
      onBack: prevStep
    };

    switch (currentStep) {
      case 1:
        return <PickupDropoffStep {...commonProps} />;
      case 2:
        return <PropertyDetailsStep {...commonProps} />;
      case 3:
        return <ItemSelectionStep {...commonProps} />;
      case 4:
        return <DateTimeStep {...commonProps} />;
      case 5:
        return <CustomerDetailsStep {...commonProps} />;
      case 6:
        return <CrewSelectionStep {...commonProps} />;
      case 7:
        return <BookingSummary {...commonProps} />;
      case 8:
        return <PaymentStep {...commonProps} />;
      case 9:
        return <ConfirmationStep {...commonProps} />;
      default:
        return <PickupDropoffStep {...commonProps} />;
    }
  };

  const stepTitles = [
    'Pickup & Dropoff',
    'Property Details',
    'Items to Move',
    'Date & Time',
    'Customer Details',
    'Crew Selection',
    'Booking Summary',
    'Payment',
    'Confirmation'
  ];

  return (
    <Box minH="100vh" bg="bg.canvas" py={8} className="booking-page-container">
      <Container maxW="4xl">
        <VStack spacing={8}>
          {/* Header */}
          <Box textAlign="center" w="full">
            <Heading size="xl" color="neon.500" mb={2}>
              Book Your Move
            </Heading>
            <Text color="text.secondary" fontSize="lg">
              Complete your booking in {9 - currentStep + 1} simple steps
            </Text>
          </Box>

          {/* Progress Bar */}
          <Box w="full" bg="bg.card" p={6} borderRadius="xl" borderWidth="1px" borderColor="border.primary" boxShadow="md" className="booking-progress">
            <VStack spacing={4}>
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" color="text.tertiary">
                  Step {currentStep} of 9
                </Text>
                <Text fontSize="sm" color="neon.500" fontWeight="semibold">
                  {stepTitles[currentStep - 1]}
                </Text>
              </HStack>
              <Progress 
                value={(currentStep / 9) * 100} 
                w="full" 
                colorScheme="neon" 
                size="lg"
                borderRadius="full"
                bg="bg.surface"
              />
            </VStack>
          </Box>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <MotionBox
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              w="full"
              className="booking-step-content"
            >
              {renderStep()}
            </MotionBox>
          </AnimatePresence>
        </VStack>
      </Container>
    </Box>
  );
}
