'use client';

import React, { useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UnifiedBookingProvider,
  useUnifiedBooking,
} from '@/lib/unified-booking-context';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Progress,
  Badge,
  Button,
} from '@chakra-ui/react';
import {
  FaMapMarkerAlt,
  FaBoxes,
  FaCalendarAlt,
  FaCreditCard,
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
} from 'react-icons/fa';

// Step components
const WhereAndWhatStep = React.lazy(
  () => import('@/components/booking-luxury/WhereAndWhatStep')
);
const WhoAndPaymentStep = React.lazy(
  () => import('@/components/booking-luxury/WhoAndPaymentStep')
);
const ConfirmationStep = React.lazy(
  () => import('@/components/booking-luxury/ConfirmationStep')
);

// Step configuration
const STEPS = [
  {
    id: 1,
    title: 'Where & What',
    description: 'Addresses and items to move',
    icon: FaMapMarkerAlt,
    component: WhereAndWhatStep,
  },
  {
    id: 2,
    title: 'Who & Payment',
    description: 'Your details and payment',
    icon: FaCreditCard,
    component: WhoAndPaymentStep,
  },
  {
    id: 3,
    title: 'Confirmation',
    description: 'Review and confirm booking',
    icon: FaCheckCircle,
    component: ConfirmationStep,
  },
];

// Loading component
const StepLoader = () => (
  <Box
    w="full"
    h="400px"
    display="flex"
    alignItems="center"
    justifyContent="center"
    bg="bg.card"
    borderRadius="2xl"
    borderWidth="2px"
    borderColor="border.primary"
  >
    <VStack spacing={4}>
      <Box
        w="60px"
        h="60px"
        borderRadius="full"
        bg="linear-gradient(135deg, #00C2FF, #00D18F)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        animation="pulse 2s infinite"
      >
        <FaBoxes color="white" size={24} />
      </Box>
      <Text color="text.secondary" fontSize="lg" fontWeight="medium">
        Loading luxury booking experience...
      </Text>
    </VStack>
  </Box>
);

// Progress indicator component
const ProgressIndicator = () => {
  const { currentStep, totalSteps, getStepStatus } = useUnifiedBooking();

  return (
    <Box
      w="full"
      bg="bg.card"
      p={{ base: 6, md: 8 }}
      borderRadius="2xl"
      borderWidth="2px"
      borderColor="border.primary"
      boxShadow="xl"
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '2xl',
        background:
          'linear-gradient(135deg, rgba(0,194,255,0.03), rgba(0,209,143,0.03))',
        pointerEvents: 'none',
      }}
    >
      <VStack spacing={{ base: 6, md: 8 }} position="relative" zIndex={1}>
        {/* Progress Header */}
        <HStack justify="space-between" w="full" align="center">
          <VStack align="start" spacing={1}>
            <Text
              fontSize={{ base: 'sm', md: 'md' }}
              color="text.tertiary"
              fontWeight="medium"
            >
              Progress
            </Text>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="neon.500"
              fontWeight="bold"
            >
              Step {currentStep} of {totalSteps}
            </Text>
          </VStack>
          <Badge
            colorScheme="neon"
            variant="solid"
            size="lg"
            px={4}
            py={2}
            borderRadius="full"
            fontSize={{ base: 'sm', md: 'md' }}
            boxShadow="0 0 15px rgba(0,194,255,0.3)"
          >
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </Badge>
        </HStack>

        {/* Enhanced Progress Bar */}
        <Box w="full" position="relative">
          <Progress
            value={(currentStep / totalSteps) * 100}
            w="full"
            colorScheme="neon"
            size={{ base: 'lg', md: 'xl' }}
            borderRadius="full"
            bg="bg.surface"
            boxShadow="inset 0 2px 4px rgba(0,0,0,0.1)"
            sx={{
              '& > div': {
                background: 'linear-gradient(90deg, #00C2FF 0%, #00D18F 100%)',
                boxShadow: '0 0 20px rgba(0,194,255,0.4)',
              },
            }}
          />
          {/* Progress Glow Effect */}
          <Box
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            borderRadius="full"
            background="linear-gradient(90deg, rgba(0,194,255,0.2) 0%, rgba(0,209,143,0.2) 100%)"
            filter="blur(8px)"
            opacity={0.6}
            zIndex={-1}
          />
        </Box>

        {/* Step Indicators */}
        <HStack spacing={{ base: 2, md: 4 }} w="full" justify="space-between">
          {STEPS.map((step, index) => {
            const stepStatus = getStepStatus(step.id);
            const isCompleted = stepStatus.isCompleted;
            const isCurrent = stepStatus.isCurrent;
            const IconComponent = step.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                style={{ flex: 1 }}
              >
                <Box
                  p={{ base: 3, md: 4 }}
                  borderRadius="xl"
                  borderWidth="2px"
                  borderColor={
                    isCompleted
                      ? 'green.400'
                      : isCurrent
                        ? 'neon.400'
                        : 'border.primary'
                  }
                  bg={
                    isCompleted
                      ? 'green.50'
                      : isCurrent
                        ? 'dark.800'
                        : 'dark.700'
                  }
                  position="relative"
                  overflow="hidden"
                  transition="all 300ms cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{
                    transform: isCurrent ? 'translateY(-2px)' : 'none',
                    boxShadow: isCurrent
                      ? '0 8px 25px rgba(0,194,255,0.3)'
                      : 'none',
                  }}
                  cursor={isCompleted ? 'pointer' : 'default'}
                >
                  {/* Current step background */}
                  {isCurrent && (
                    <Box
                      position="absolute"
                      top="0"
                      left="0"
                      width="100%"
                      height="100%"
                      bg="linear-gradient(135deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))"
                      borderRadius="xl"
                      zIndex={0}
                    />
                  )}

                  <VStack
                    spacing={2}
                    position="relative"
                    zIndex={1}
                    textAlign="center"
                  >
                    <Box
                      p={2}
                      borderRadius="full"
                      bg={
                        isCompleted
                          ? 'green.500'
                          : isCurrent
                            ? 'neon.500'
                            : 'gray.500'
                      }
                      color="white"
                      boxSize={{ base: '40px', md: '48px' }}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      boxShadow={
                        isCurrent ? '0 0 20px rgba(0,194,255,0.5)' : 'none'
                      }
                      transition="all 300ms ease"
                    >
                      {isCompleted ? (
                        <FaCheckCircle size={20} />
                      ) : (
                        <IconComponent size={20} />
                      )}
                    </Box>

                    <VStack spacing={1}>
                      <Text
                        fontSize={{ base: 'xs', md: 'sm' }}
                        fontWeight="bold"
                        color={
                          isCompleted
                            ? 'green.600'
                            : isCurrent
                              ? 'neon.400'
                              : 'text.secondary'
                        }
                      >
                        {step.title}
                      </Text>
                      <Text
                        fontSize={{ base: '2xs', md: 'xs' }}
                        color={
                          isCompleted
                            ? 'green.500'
                            : isCurrent
                              ? 'neon.300'
                              : 'text.tertiary'
                        }
                        textAlign="center"
                        noOfLines={2}
                      >
                        {step.description}
                      </Text>
                    </VStack>
                  </VStack>
                </Box>
              </motion.div>
            );
          })}
        </HStack>
      </VStack>
    </Box>
  );
};

// Navigation component
const BookingNavigation = () => {
  const { currentStep, canGoNext, canGoPrev, nextStep, prevStep, isLoading } =
    useUnifiedBooking();

  const isLastStep = currentStep === STEPS.length;

  const handleNext = async () => {
    console.log('🎯 handleNext called, isLastStep:', isLastStep);
    if (isLastStep) {
      // Handle final submission
      console.log('Final submission');
    } else {
      console.log('🔄 Calling nextStep()...');
      const result = await nextStep();
      console.log('📊 nextStep result:', result);
    }
  };

  return (
    <HStack
      justify="space-between"
      w="full"
      p={{ base: 4, md: 6 }}
      bg="bg.card"
      borderRadius="2xl"
      borderWidth="2px"
      borderColor="border.primary"
      boxShadow="xl"
    >
      <Button
        variant="outline"
        onClick={prevStep}
        isDisabled={!canGoPrev}
        size="lg"
        leftIcon={<FaArrowLeft />}
      >
        Back
      </Button>

      <Box flex={1} />

      <Button
        rightIcon={<FaArrowRight />}
        onClick={handleNext}
        isDisabled={!canGoNext}
        isLoading={isLoading}
        loadingText={isLastStep ? 'Confirming...' : 'Validating...'}
        size="lg"
        bg="linear-gradient(135deg, #00C2FF, #00D18F)"
        color="white"
        fontWeight="bold"
        px={8}
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,194,255,0.4)',
        }}
        _active={{
          transform: 'translateY(0)',
        }}
        transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
      >
        {isLastStep ? 'Confirm Booking' : 'Continue'}
      </Button>
    </HStack>
  );
};

// Main booking flow component
const BookingFlowContent = () => {
  const { currentStep, trackStepStart } = useUnifiedBooking();

  // Track step start on mount and step change
  useEffect(() => {
    trackStepStart(currentStep);
  }, [currentStep, trackStepStart]);

  const currentStepConfig = STEPS.find(step => step.id === currentStep);
  const StepComponent = currentStepConfig?.component;

  return (
    <Box minH="100vh" bg="bg.canvas" py={{ base: 4, md: 8 }}>
      <Container maxW={{ base: '100%', md: '6xl' }} px={{ base: 4, md: 6 }}>
        <VStack spacing={{ base: 8, md: 10 }}>
          {/* Header */}
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
            sx={{
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                right: '-2px',
                bottom: '-2px',
                borderRadius: '2xl',
                background: 'linear-gradient(45deg, #00C2FF, #00D18F, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7, #DDA0DD)',
                backgroundSize: '400% 400%',
                animation: 'waveGradient 3s ease-in-out infinite',
                zIndex: -1,
                '@keyframes waveGradient': {
                  '0%': {
                    backgroundPosition: '0% 50%',
                  },
                  '50%': {
                    backgroundPosition: '100% 50%',
                  },
                  '100%': {
                    backgroundPosition: '0% 50%',
                  },
                },
              },
            }}
          >
            <Box
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              borderRadius="2xl"
              background="radial-gradient(circle at 50% 0%, rgba(0,194,255,0.1) 0%, transparent 70%)"
              pointerEvents="none"
            />
            {/* Wave gradient overlay */}
            <Box
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              borderRadius="2xl"
              background="linear-gradient(45deg, rgba(0,194,255,0.05), rgba(0,209,143,0.05), rgba(255,107,107,0.03), rgba(78,205,196,0.03))"
              backgroundSize="400% 400%"
              animation="waveGradient 4s ease-in-out infinite"
              pointerEvents="none"
              sx={{
                '@keyframes waveGradient': {
                  '0%': {
                    backgroundPosition: '0% 50%',
                  },
                  '50%': {
                    backgroundPosition: '100% 50%',
                  },
                  '100%': {
                    backgroundPosition: '0% 50%',
                  },
                },
              }}
            />

            <VStack spacing={4} position="relative" zIndex={1}>
              <Heading
                size={{ base: 'xl', md: '2xl' }}
                mb={2}
                fontWeight="extrabold"
                letterSpacing="tight"
                position="relative"
                display="inline-block"
                sx={{
                  background: 'linear-gradient(45deg, #00C2FF, #00D18F, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7, #DDA0DD)',
                  backgroundSize: '400% 400%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'waveGradient 3s ease-in-out infinite, textGlow 2s ease-in-out infinite alternate',
                  textShadow: '0 0 30px rgba(0,194,255,0.8), 0 0 60px rgba(0,209,143,0.6), 0 0 90px rgba(255,107,107,0.4)',
                  filter: 'drop-shadow(0 0 10px rgba(0,194,255,0.5))',
                  '@keyframes waveGradient': {
                    '0%': {
                      backgroundPosition: '0% 50%',
                    },
                    '50%': {
                      backgroundPosition: '100% 50%',
                    },
                    '100%': {
                      backgroundPosition: '0% 50%',
                    },
                  },
                  '@keyframes textGlow': {
                    '0%': {
                      filter: 'drop-shadow(0 0 10px rgba(0,194,255,0.5)) brightness(1)',
                    },
                    '100%': {
                      filter: 'drop-shadow(0 0 20px rgba(0,194,255,0.8)) brightness(1.2)',
                    },
                  },
                }}
              >
                🚚 Luxury Booking Experience
              </Heading>
              <Text
                color="text.secondary"
                fontSize={{ base: 'md', md: 'xl' }}
                maxW="600px"
                lineHeight="1.6"
                fontWeight="medium"
              >
                Complete your move in just {STEPS.length} simple steps
              </Text>
              <Text
                color="neon.400"
                fontSize={{ base: 'sm', md: 'md' }}
                fontWeight="semibold"
                opacity={0.8}
              >
                Premium service • Smart defaults • Zero friction
              </Text>
            </VStack>
          </Box>

          {/* Progress indicator */}
          <ProgressIndicator />

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ width: '100%' }}
            >
              <Box
                w="full"
                bg="bg.card"
                borderRadius="2xl"
                borderWidth="2px"
                borderColor="border.primary"
                boxShadow="xl"
                overflow="hidden"
              >
                <Suspense fallback={<StepLoader />}>
                  {StepComponent && (
                    <StepComponent
                      onBack={() => {/* TODO: Implement back navigation */}}
                      onComplete={() => {/* TODO: Implement completion */}}
                      bookingData={{}}
                    />
                  )}
                </Suspense>
              </Box>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <BookingNavigation />
        </VStack>
      </Container>
    </Box>
  );
};

// Main page component
export default function LuxuryBookingPage() {
  // Track session start time and visitor analytics
  React.useEffect(() => {
    (window as any).sessionStartTime = Date.now();

    // Initialize visitor tracking
    initializeVisitorTracking();

    // Track page abandonment when user leaves
    const handleBeforeUnload = () => {
      // Store incomplete booking data for admin
      const currentData = localStorage.getItem(
        'speedy-van-unified-booking-draft'
      );
      if (currentData) {
        const incompleteBooking = {
          step: 1,
          reason: 'Page abandoned',
          data: JSON.parse(currentData),
          timestamp: new Date().toISOString(),
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };

        const existingIncomplete = JSON.parse(
          localStorage.getItem('admin-incomplete-bookings') || '[]'
        );
        existingIncomplete.push(incompleteBooking);
        localStorage.setItem(
          'admin-incomplete-bookings',
          JSON.stringify(existingIncomplete)
        );
      }

      // Finalize visitor session
      finalizeVisitorSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Initialize visitor tracking with geolocation
  const initializeVisitorTracking = async () => {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      (window as any).currentSessionId = sessionId;

      // Get device information
      const deviceInfo = {
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      // Get geolocation
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          });
        }
      );

      const { latitude: lat, longitude: lng } = position.coords;

      // Reverse geocode to get city/region info
      const locationInfo = await getLocationInfo(lat, lng);

      // Create visitor session
      const visitorSession = {
        sessionId,
        visitorId: generateVisitorId(),
        city: locationInfo.city || 'Unknown',
        region: locationInfo.region || 'Unknown',
        country: locationInfo.country || 'Unknown',
        coordinates: { lat, lng },
        entryTime: new Date(),
        sessionDuration: 0,
        pagesVisited: [
          {
            page: 'luxury-booking',
            timeSpent: 0,
            timestamp: new Date(),
          },
        ],
        actions: [
          {
            action: 'page_visit',
            timestamp: new Date(),
            details: { page: 'luxury-booking' },
          },
        ],
        bookingStarted: false,
        bookingCompleted: false,
        deviceInfo,
      };

      // Store visitor session
      const existingVisitors = JSON.parse(
        localStorage.getItem('admin-visitor-analytics') || '[]'
      );
      existingVisitors.push(visitorSession);
      localStorage.setItem(
        'admin-visitor-analytics',
        JSON.stringify(existingVisitors)
      );

      // Start session timer
      (window as any).sessionTimer = setInterval(() => {
        updateSessionDuration(sessionId);
      }, 1000);
    } catch (error) {
      console.error('Failed to initialize visitor tracking:', error);
      // Fallback: create session without location
      createFallbackVisitorSession();
    }
  };

  // Get location information from coordinates
  const getLocationInfo = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `/api/geocoding/reverse?lat=${lat}&lng=${lng}`
      );
      if (response.ok) {
        const data = await response.json();
        return {
          city: data.city || data.locality || 'Unknown',
          region: data.region || data.state || 'Unknown',
          country: data.country || 'Unknown',
        };
      }
    } catch (error) {
      console.error('Failed to get location info:', error);
    }

    return { city: 'Unknown', region: 'Unknown', country: 'Unknown' };
  };

  // Generate unique visitor ID
  const generateVisitorId = () => {
    const existingId = localStorage.getItem('speedy-van-visitor-id');
    if (existingId) return existingId;

    const newId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('speedy-van-visitor-id', newId);
    return newId;
  };

  // Create fallback visitor session
  const createFallbackVisitorSession = () => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    (window as any).currentSessionId = sessionId;

    const visitorSession = {
      sessionId,
      visitorId: generateVisitorId(),
      city: 'Unknown',
      region: 'Unknown',
      country: 'Unknown',
      coordinates: { lat: 0, lng: 0 },
      entryTime: new Date(),
      sessionDuration: 0,
      pagesVisited: [
        {
          page: 'luxury-booking',
          timeSpent: 0,
          timestamp: new Date(),
        },
      ],
      actions: [
        {
          action: 'page_visit',
          timestamp: new Date(),
          details: { page: 'luxury-booking' },
        },
      ],
      bookingStarted: false,
      bookingCompleted: false,
      deviceInfo: {
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    const existingVisitors = JSON.parse(
      localStorage.getItem('admin-visitor-analytics') || '[]'
    );
    existingVisitors.push(visitorSession);
    localStorage.setItem(
      'admin-visitor-analytics',
      JSON.stringify(existingVisitors)
    );
  };

  // Update session duration
  const updateSessionDuration = (sessionId: string) => {
    const existingVisitors = JSON.parse(
      localStorage.getItem('admin-visitor-analytics') || '[]'
    );
    const visitorIndex = existingVisitors.findIndex(
      (v: any) => v.sessionId === sessionId
    );

    if (visitorIndex !== -1) {
      const visitor = existingVisitors[visitorIndex];
      const currentTime = new Date();
      const duration = Math.floor(
        (currentTime.getTime() - new Date(visitor.entryTime).getTime()) / 1000
      );

      existingVisitors[visitorIndex] = {
        ...visitor,
        sessionDuration: duration,
      };

      localStorage.setItem(
        'admin-visitor-analytics',
        JSON.stringify(existingVisitors)
      );
    }
  };

  // Finalize visitor session
  const finalizeVisitorSession = () => {
    const sessionId = (window as any).currentSessionId;
    if (sessionId && (window as any).sessionTimer) {
      clearInterval((window as any).sessionTimer);

      const existingVisitors = JSON.parse(
        localStorage.getItem('admin-visitor-analytics') || '[]'
      );
      const visitorIndex = existingVisitors.findIndex(
        (v: any) => v.sessionId === sessionId
      );

      if (visitorIndex !== -1) {
        const visitor = existingVisitors[visitorIndex];
        const exitTime = new Date();
        const duration = Math.floor(
          (exitTime.getTime() - new Date(visitor.entryTime).getTime()) / 1000
        );

        existingVisitors[visitorIndex] = {
          ...visitor,
          exitTime,
          sessionDuration: duration,
        };

        localStorage.setItem(
          'admin-visitor-analytics',
          JSON.stringify(existingVisitors)
        );
      }
    }
  };

  return (
    <UnifiedBookingProvider>
      <BookingFlowContent />
    </UnifiedBookingProvider>
  );
}
