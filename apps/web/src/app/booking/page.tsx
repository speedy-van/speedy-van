'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, VStack, HStack, Heading, Text, Progress, useToast, Icon, Badge, SimpleGrid } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaBuilding, FaBoxes, FaCalendarAlt, FaCreditCard, FaCheckCircle, FaArrowRight, FaUser } from 'react-icons/fa';
import { logBookingBoot } from '@/lib/booking-boot-log';
// Import all booking step components
import PickupDropoffStep from '@/components/booking/PickupDropoffStep';
import PropertyDetailsStep from '@/components/booking/PropertyDetailsStep';
import EnhancedItemSelectionStep from '@/components/booking/EnhancedItemSelectionStep';
import EnhancedItemSelectionStepWithImages from '@/components/booking/EnhancedItemSelectionStepWithImages';
import DateTimeStep from '@/components/booking/DateTimeStep';
import CustomerDetailsStep from '@/components/booking/CustomerDetailsStep';
import BookingSummaryAndPaymentStep from '@/components/booking/BookingSummaryAndPaymentStep';
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
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };

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
    if (currentStep < 7) {
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
        return <EnhancedItemSelectionStepWithImages 
          {...commonProps} 
          onUpdate={updateBookingData}
          isCurrentStep={currentStep === 3}
        />;
      case 4:
        return <DateTimeStep {...commonProps} />;
      case 5:
        return <CustomerDetailsStep {...commonProps} />;
      case 6:
        return <BookingSummaryAndPaymentStep {...commonProps} />;
      case 7:
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
    'Summary & Payment',
    'Confirmation'
  ];

  const stepIcons = [
    FaMapMarkerAlt,
    FaBuilding,
    FaBoxes,
    FaCalendarAlt,
    FaUser,
    FaCreditCard,
    FaCheckCircle
  ];

  const stepDescriptions = [
    'Tell us where to collect and deliver your items',
    'Describe the properties for pickup and delivery',
    'Select what you need to move',
    'Choose when you\'d like your move to take place',
    'Provide your contact information',
    'Review details and complete payment',
    'Confirm your booking and get ready to move'
  ];

  return (
    <Box minH="100vh" bg="bg.canvas" py={{ base: 4, md: 8 }} className="booking-page-container">
      <Container maxW={{ base: "100%", md: "6xl" }} px={{ base: 4, md: 6 }}>
        <VStack spacing={{ base: 8, md: 10 }}>
          {/* Enhanced Header */}
          <Box 
            textAlign="center" 
            w="full"
            p={{ base: 6, md: 8 }}
            borderRadius="2xl"
            bg="linear-gradient(135deg, rgba(0,194,255,0.05), rgba(0,209,143,0.05))"
            borderWidth="2px"
            borderColor="border.neon"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: "2xl",
              background: "radial-gradient(circle at 50% 0%, rgba(0,194,255,0.1) 0%, transparent 70%)",
              pointerEvents: "none"
            }}
          >
            <VStack spacing={4} position="relative" zIndex={1}>
              <Heading 
                size={{ base: "xl", md: "2xl" }} 
                color="neon.500" 
                mb={2}
                textShadow="0 0 20px rgba(0,194,255,0.5)"
                fontWeight="extrabold"
                letterSpacing="tight"
              >
                🚚 Book Your Move
              </Heading>
              <Text 
                color="text.secondary" 
                fontSize={{ base: "md", md: "xl" }}
                maxW="600px"
                lineHeight="1.6"
                fontWeight="medium"
              >
                Complete your booking in {7 - currentStep + 1} simple steps
              </Text>
              <Text 
                color="neon.400" 
                fontSize={{ base: "sm", md: "md" }}
                fontWeight="semibold"
                opacity={0.8}
              >
                Professional moving service • Reliable drivers • Competitive pricing
              </Text>
            </VStack>
          </Box>

          {/* Enhanced Progress Section */}
          <Box 
            w="full" 
            bg="bg.card" 
            p={{ base: 6, md: 8 }} 
            borderRadius="2xl" 
            borderWidth="2px" 
            borderColor="border.primary" 
            boxShadow="xl"
            className="booking-progress"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: "2xl",
              background: "linear-gradient(135deg, rgba(0,194,255,0.03), rgba(0,209,143,0.03))",
              pointerEvents: "none"
            }}
          >
            <VStack spacing={{ base: 6, md: 8 }} position="relative" zIndex={1}>
              {/* Progress Header */}
              <HStack justify="space-between" w="full" align="center">
                <VStack align="start" spacing={1}>
                  <Text fontSize={{ base: "sm", md: "md" }} color="text.tertiary" fontWeight="medium">
                    Progress
                  </Text>
                  <Text fontSize={{ base: "lg", md: "xl" }} color="neon.500" fontWeight="bold">
                    Step {currentStep} of 7
                  </Text>
                </VStack>
                <Badge 
                  colorScheme="neon" 
                  variant="solid" 
                  size="lg"
                  px={4}
                  py={2}
                  borderRadius="full"
                  fontSize={{ base: "sm", md: "md" }}
                  boxShadow="0 0 15px rgba(0,194,255,0.3)"
                >
                  {Math.round((currentStep / 7) * 100)}% Complete
                </Badge>
              </HStack>

              {/* Enhanced Progress Bar */}
              <Box w="full" position="relative">
                <Progress 
                  value={(currentStep / 7) * 100} 
                  w="full" 
                  colorScheme="neon" 
                  size={{ base: "lg", md: "xl" }}
                  borderRadius="full"
                  bg="bg.surface"
                  boxShadow="inset 0 2px 4px rgba(0,0,0,0.1)"
                  sx={{
                    '& > div': {
                      background: 'linear-gradient(90deg, #00C2FF 0%, #00D18F 100%)',
                      boxShadow: '0 0 20px rgba(0,194,255,0.4)'
                    }
                  }}
                />
                {/* Progress Glow Effect */}
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                  borderRadius="full"
                  background="linear-gradient(90deg, rgba(0,194,255,0.2) 0%, rgba(0,209,143,0.2) 100%)"
                  filter="blur(8px)"
                  opacity={0.6}
                  zIndex={-1}
                />
              </Box>

              {/* Step Indicators */}
              <SimpleGrid columns={{ base: 3, md: 6 }} spacing={{ base: 2, md: 4 }} w="full">
                {stepTitles.map((title, index) => {
                  const isCompleted = index + 1 < currentStep;
                  const isCurrent = index + 1 === currentStep;
                  const IconComponent = stepIcons[index];
                  
                  return (
                    <Box
                      key={index}
                      p={{ base: 3, md: 4 }}
                      borderRadius="xl"
                      borderWidth="2px"
                      borderColor={isCompleted ? 'green.400' : isCurrent ? 'neon.400' : 'border.primary'}
                      bg={isCompleted ? 'green.50' : isCurrent ? 'dark.800' : 'dark.700'}
                      position="relative"
                      overflow="hidden"
                      transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
                      _hover={{
                        transform: isCurrent ? "translateY(-2px)" : "none",
                        boxShadow: isCurrent ? "0 8px 25px rgba(0,194,255,0.3)" : "none"
                      }}
                    >
                      {/* Background Pattern */}
                      {isCurrent && (
                        <Box
                          position="absolute"
                          top="0"
                          left="0"
                          right="0"
                          bottom="0"
                          bg="linear-gradient(135deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))"
                          borderRadius="xl"
                          zIndex={0}
                        />
                      )}
                      
                      <VStack spacing={2} position="relative" zIndex={1} textAlign="center">
                        <Box
                          position="relative"
                          p={2}
                          borderRadius="full"
                          bg={isCompleted ? 'green.500' : isCurrent ? 'neon.500' : 'gray.500'}
                          color="white"
                          boxSize={{ base: "40px", md: "48px" }}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          boxShadow={isCurrent ? "0 0 20px rgba(0,194,255,0.5)" : "none"}
                        >
                          {isCompleted ? (
                            <Icon as={FaCheckCircle} boxSize={{ base: "20px", md: "24px" }} />
                          ) : (
                            <Icon as={IconComponent} boxSize={{ base: "20px", md: "24px" }} />
                          )}
                        </Box>
                        
                        <VStack spacing={1}>
                          <Text 
                            fontSize={{ base: "xs", md: "sm" }} 
                            fontWeight="bold" 
                            color={isCompleted ? 'green.600' : isCurrent ? 'neon.400' : 'text.secondary'}
                            lineHeight="1.2"
                          >
                            {title}
                          </Text>
                          <Text 
                            fontSize={{ base: "2xs", md: "xs" }} 
                            color={isCompleted ? 'green.500' : isCurrent ? 'neon.300' : 'text.tertiary'}
                            textAlign="center"
                            lineHeight="1.2"
                            noOfLines={2}
                          >
                            {stepDescriptions[index]}
                          </Text>
                        </VStack>

                        {/* Step Number */}
                        <Badge 
                          colorScheme={isCompleted ? 'green' : isCurrent ? 'neon' : 'gray'} 
                          variant="solid" 
                          size="sm"
                          borderRadius="full"
                          px={2}
                          py={1}
                          fontSize="xs"
                          fontWeight="bold"
                        >
                          {index + 1}
                        </Badge>
                      </VStack>

                      {/* Current Step Indicator */}
                      {isCurrent && (
                        <Box
                          position="absolute"
                          top="2"
                          right="2"
                          bg="neon.500"
                          borderRadius="full"
                          p={1}
                          boxShadow="0 0 10px rgba(0,194,255,0.5)"
                        >
                          <Icon as={FaArrowRight} color="white" boxSize={3} />
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <MotionBox
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
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
