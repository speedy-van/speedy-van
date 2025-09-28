'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Progress,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Icon,
  Flex,
  useColorModeValue,
  Divider,
  Stack,
  Circle,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaArrowLeft, FaArrowRight, FaCheck, FaTruck, FaShieldAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
// @ts-ignore - Temporary fix for Next.js module resolution
import { useSearchParams } from 'next/navigation';
import WhereAndWhatStep from './components/WhereAndWhatStep';
import WhoAndPaymentStep from './components/WhoAndPaymentStep';
import { useBookingForm } from './hooks/useBookingForm';

const STEPS = [
  { 
    id: 1, 
    title: 'What, Where & When', 
    description: 'Select items, addresses, date and time',
    icon: FaTruck,
    shortTitle: 'Items & Details',
    color: 'blue'
  },
  { 
    id: 2, 
    title: 'Customer & Payment', 
    description: 'Enter details and payment',
    icon: FaCheck,
    shortTitle: 'Checkout',
    color: 'green'
  },
];

export default function BookingLuxuryPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const toast = useToast();
  const searchParams = useSearchParams();

  const {
    formData,
    updateFormData,
    validateStep,
    isStepValid,
    errors,
    clearErrors,
  } = useBookingForm();

  // Auto-save functionality
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save form data to localStorage
  useEffect(() => {
    const saveFormData = async () => {
      if (!formData) return;
      
      setIsSaving(true);
      try {
        localStorage.setItem('speedy_van_booking_draft', JSON.stringify({
          ...formData,
          currentStep,
          savedAt: new Date().toISOString(),
        }));
        setLastSaved(new Date());
        
        // Show subtle save confirmation (only on mobile)
        if (window.innerWidth < 768) {
          toast({
            title: 'Draft saved',
            status: 'success',
            duration: 1000,
            isClosable: false,
            position: 'top',
            size: 'sm',
          });
        }
      } catch (error) {
        console.error('Failed to save draft:', error);
      } finally {
        setIsSaving(false);
      }
    };

    // Debounce auto-save
    const timeoutId = setTimeout(saveFormData, 2000);
    return () => clearTimeout(timeoutId);
  }, [formData, currentStep, toast]);

  // Load saved draft on component mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('speedy_van_booking_draft');
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        const savedDate = new Date(draftData.savedAt);
        
        // Only restore if saved within last 24 hours
        const hoursSinceLastSave = (new Date().getTime() - savedDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastSave < 24 && draftData.currentStep) {
          toast({
            title: 'Draft restored',
            description: `Your booking draft from ${savedDate.toLocaleString()} has been restored.`,
            status: 'info',
            duration: 5000,
            isClosable: true,
          });
          setCurrentStep(draftData.currentStep);
          setLastSaved(savedDate);
        }
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  }, [toast]);

  // Handle URL parameters on page load
  useEffect(() => {
    const step = searchParams?.get('step');
    const paymentStatus = searchParams?.get('payment');
    const sessionId = searchParams?.get('session_id');

    // Check if we're coming from a successful payment and should show success page
    const savedPaymentSuccess = localStorage.getItem('speedy_van_payment_success');
    const savedSessionId = localStorage.getItem('speedy_van_session_id');

    // Redirect to success page if payment was successful
    if (paymentStatus === 'success' || (savedPaymentSuccess === 'true' && savedSessionId)) {
      
      // Clear localStorage
      localStorage.removeItem('speedy_van_payment_success');
      localStorage.removeItem('speedy_van_session_id');

      // Redirect to dedicated success page
      const successUrl = `/booking-luxury/success?session_id=${sessionId || savedSessionId}`;
      window.location.href = successUrl;
      return;
    }

    if (paymentStatus === 'cancelled') {
      setCurrentStep(2); // Go back to payment step
      
      toast({
        title: 'Payment Cancelled',
        description: 'Your payment was cancelled. You can try again when ready.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      
      return;
    }

    // Handle normal step navigation (only steps 1 and 2 now)
    if (step && (step === '1' || step === '2')) {
      const stepNumber = parseInt(step, 10);
      if (stepNumber >= 1 && stepNumber <= STEPS.length) {
        setCurrentStep(stepNumber);
      }
    }
  }, [searchParams, toast]);


  // Success page is now handled by dedicated /booking/success route

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
        clearErrors();
      }
    } else {
      toast({
        title: 'Please complete all required fields',
        description: 'Please fill in all required information before proceeding.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      clearErrors();
    }
  };

  const handleStepClick = async (stepNumber: number) => {
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
      clearErrors();
    } else if (stepNumber === currentStep + 1) {
      await handleNext();
    }
  };



  // Success page is now handled by dedicated /booking/success route

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box minH="100vh" bg={bgColor} py={{ base: 2, md: 8 }} pb={{ base: "100px", md: 8 }}>
      <Container maxW="6xl">
        <VStack spacing={{ base: 4, md: 8 }} align="stretch" py={{ base: 4, md: 8 }}>
          {/* Enhanced Header */}
          <Card bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
            <CardBody p={{ base: 3, md: 8 }}>
              <VStack spacing={{ base: 3, md: 6 }} textAlign="center">
                <VStack spacing={{ base: 3, md: 4 }}>
                  <Circle size={{ base: "60px", md: "80px" }} bg="blue.500" color="white">
                    <Icon as={FaTruck} boxSize={{ base: 6, md: 8 }} />
                  </Circle>
                  <Heading size={{ base: "xl", md: "2xl" }} bgGradient="linear(to-r, blue.600, green.600)" bgClip="text">
                    Book Your Move
                  </Heading>
                  <Text fontSize={{ base: "md", md: "xl" }} color="gray.600" maxW="2xl">
                    Professional moving services with transparent pricing and real-time tracking
                  </Text>
                </VStack>
                
                {/* Trust Indicators */}
                <Stack 
                  direction={{ base: "column", sm: "row" }} 
                  spacing={{ base: 2, md: 8 }} 
                  align="center" 
                  justify="center"
                  w="full"
                >
                  <HStack spacing={2}>
                    <Icon as={FaShieldAlt} color="green.500" />
                    <Text fontSize={{ base: "sm", md: "sm" }} fontWeight="medium">Insured & Licensed</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FaClock} color="blue.500" />
                    <Text fontSize={{ base: "sm", md: "sm" }} fontWeight="medium">24/7 Support</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FaMapMarkerAlt} color="purple.500" />
                    <Text fontSize={{ base: "sm", md: "sm" }} fontWeight="medium">UK-Wide Coverage</Text>
                  </HStack>
                </Stack>
              </VStack>
            </CardBody>
          </Card>

          {/* Enhanced Progress Indicator */}
          <Card bg={cardBg} shadow="md" borderRadius="xl" border="1px" borderColor="gray.200">
            <CardBody p={{ base: 4, md: 8 }}>
              <VStack spacing={{ base: 4, md: 8 }}>
                {/* Enhanced Progress Bar */}
                <Box w="full">
                  <HStack justify="space-between" mb={3}>
                    <Text fontSize="md" fontWeight="bold" color="purple.700">
                      Booking Progress
                    </Text>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      {Math.round((currentStep / STEPS.length) * 100)}% Complete
                    </Text>
                  </HStack>
                  <Progress
                    value={(currentStep / STEPS.length) * 100}
                    size="lg"
                    colorScheme="purple"
                    borderRadius="full"
                    bg="gray.200"
                    h={{ base: "12px", md: "16px" }}
                    shadow="inner"
                    sx={{
                      '& > div:first-of-type': {
                        background: 'linear-gradient(90deg, #805ad5 0%, #667eea 50%, #764ba2 100%)',
                        borderRadius: 'full',
                        boxShadow: '0 2px 4px rgba(128, 90, 213, 0.3)',
                      },
                    }}
                  />
                </Box>
                
                {/* Step Indicators */}
                <Stack 
                  direction={isMobile ? 'column' : 'row'} 
                  spacing={isMobile ? 2 : 8} 
                  w="full" 
                  justify="space-between"
                >
                  {STEPS.map((step, index) => {
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;
                    const isAccessible = step.id <= currentStep + 1;
                    
                    return (
                      <Card
                        key={step.id}
                        bg={isCurrent ? `${step.color}.50` : isCompleted ? 'green.50' : 'white'}
                        borderColor={isCurrent ? `${step.color}.300` : isCompleted ? 'green.300' : 'gray.300'}
                        borderWidth="2px"
                        borderRadius="xl"
                        p={{ base: 3, md: 5 }}
                        cursor={isAccessible ? 'pointer' : 'not-allowed'}
                        onClick={() => isAccessible && handleStepClick(step.id)}
                        transition="all 0.3s ease"
                        _hover={isAccessible ? { 
                          transform: 'translateY(-2px)', 
                          shadow: 'lg',
                          borderColor: isCompleted ? 'green.400' : `${step.color}.400`
                        } : {}}
                        opacity={isAccessible ? 1 : 0.6}
                        w={isMobile ? 'full' : '48%'}
                        shadow={isCurrent ? 'md' : 'sm'}
                        position="relative"
                        overflow="hidden"
                      >
                        {/* Animated Background Gradient */}
                        {isCurrent && (
                          <Box
                            position="absolute"
                            top="0"
                            left="0"
                            right="0"
                            bottom="0"
                            bgGradient={`linear(45deg, ${step.color}.50 0%, ${step.color}.100 50%, ${step.color}.50 100%)`}
                            opacity={0.3}
                            animation="pulse 2s infinite"
                          />
                        )}
                        
                        <HStack spacing={{ base: 3, md: 4 }} align="start" position="relative" zIndex={1}>
                          <Circle
                            size={{ base: "36px", md: "44px" }}
                            bg={isCompleted ? 'green.500' : isCurrent ? `${step.color}.500` : 'gray.300'}
                            color="white"
                            fontWeight="bold"
                            shadow="md"
                            transition="all 0.3s ease"
                          >
                            {isCompleted ? (
                              <Icon as={FaCheck} boxSize={{ base: 4, md: 5 }} />
                            ) : (
                              <Icon as={step.icon} boxSize={{ base: 4, md: 5 }} />
                            )}
                          </Circle>
                          <VStack spacing={{ base: 1, md: 2 }} align="start" flex={1}>
                            <HStack spacing={2} align="center">
                              <Text 
                                fontSize={{ base: "md", md: "lg" }} 
                                fontWeight="bold" 
                                color={isCurrent ? `${step.color}.700` : isCompleted ? 'green.700' : 'gray.800'}
                              >
                                {isMobile ? step.shortTitle : step.title}
                              </Text>
                              {isCompleted && (
                                <Badge colorScheme="green" variant="solid" fontSize="2xs" px={2}>
                                  ✓ Complete
                                </Badge>
                              )}
                              {isCurrent && (
                                <Badge colorScheme={step.color} variant="solid" fontSize="2xs" px={2}>
                                  Active
                                </Badge>
                              )}
                            </HStack>
                            <Text 
                              fontSize={{ base: "sm", md: "md" }} 
                              color={isCurrent ? `${step.color}.600` : isCompleted ? 'green.600' : 'gray.600'}
                              lineHeight="short"
                            >
                              {step.description}
                            </Text>
                            
                            {/* Step Progress Indicator */}
                            {isCurrent && (
                              <Box w="full" mt={{ base: 2, md: 3 }}>
                                <HStack justify="space-between" mb={1}>
                                  <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                    Step Progress
                                  </Text>
                                  <Text fontSize="xs" color={`${step.color}.600`} fontWeight="semibold">
                                    75%
                                  </Text>
                                </HStack>
                                <Progress
                                  value={75} // This could be calculated based on form completion
                                  size="sm"
                                  colorScheme={step.color}
                                  borderRadius="full"
                                  bg="gray.200"
                                />
                              </Box>
                            )}
                          </VStack>
                        </HStack>
                      </Card>
                    );
                  })}
                </Stack>
              </VStack>
            </CardBody>
          </Card>

          {/* Enhanced Step Content */}
          <Card bg={cardBg} shadow="lg" borderRadius="2xl" overflow="hidden">
            <CardBody p={0}>
              {currentStep === 1 ? (
                <WhereAndWhatStep
                  formData={formData}
                  updateFormData={updateFormData}
                  errors={errors}
                  onNext={() => setCurrentStep(2)}
                />
              ) : currentStep === 2 ? (
                <WhoAndPaymentStep
                  formData={formData}
                  updateFormData={updateFormData}
                  errors={errors}
                  paymentSuccess={false}
                />
              ) : null}
            </CardBody>
          </Card>

          {/* Enhanced Navigation */}
          <Card bg={cardBg} shadow="lg" borderRadius="2xl">
            <CardBody p={{ base: 4, md: 6 }}>
              <VStack spacing={{ base: 3, md: 0 }} w="full">
                {/* Step Info - Mobile First */}
                <VStack spacing={1} w="full" align="center">
                  <Text fontSize={{ base: "sm", md: "sm" }} color="gray.500" textAlign="center">
                    Step {currentStep} of {STEPS.length}
                  </Text>
                  <Text fontSize={{ base: "xs", md: "xs" }} color="gray.400" textAlign="center">
                    {isStepValid(currentStep) ? 'Ready to continue' : 'Please complete required fields'}
                  </Text>
                </VStack>
                
                {/* Navigation buttons handled by sticky bottom navigation on mobile */}
                {/* Desktop users use sticky navigation as well for consistency */}
              </VStack>
            </CardBody>
          </Card>

          {/* Enhanced Error Display */}
          {Object.keys(errors).length > 0 && (
            <Card bg="red.50" borderColor="red.200" borderWidth="2px" borderRadius="2xl">
              <CardBody p={{ base: 4, md: 6 }}>
                <Alert status="error" borderRadius="xl" bg="transparent" border="none">
                  <AlertIcon boxSize={{ base: 4, md: 6 }} />
                  <Box>
                    <AlertTitle fontSize={{ base: "md", md: "lg" }} mb={2}>Please fix the following errors:</AlertTitle>
                    <AlertDescription>
                      <VStack align="start" spacing={2}>
                        {Object.entries(errors).map(([field, error]) => (
                          <HStack key={field} spacing={2} align="start">
                            <Text color="red.500" fontSize={{ base: "xs", md: "sm" }}>•</Text>
                            <Text fontSize={{ base: "xs", md: "sm" }} color="red.700">
                              {error}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    </AlertDescription>
                  </Box>
                </Alert>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>

      {/* Sticky Bottom Navigation - Mobile Only */}
      <Box
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        bg="white"
        borderTop="1px solid"
        borderColor="gray.200"
        p={{ base: 4, md: 4 }}
        display="block"
        zIndex="sticky"
        shadow="lg"
        sx={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <Container maxW="6xl">
          <VStack spacing={3}>
            {/* Progress Bar with Save Status */}
            <Box w="full">
              <HStack justify="space-between" mb={2}>
                <HStack spacing={2}>
                  <Text fontSize="xs" color="purple.700" fontWeight="bold">
                    Step {currentStep}/{STEPS.length}
                  </Text>
                  <Text fontSize="xs" color="gray.600">•</Text>
                  <Text fontSize="xs" color="purple.600" fontWeight="medium">
                    {Math.round((currentStep / STEPS.length) * 100)}%
                  </Text>
                </HStack>
                
                {/* Auto-save indicator */}
                {isSaving ? (
                  <HStack spacing={1}>
                    <Box w="6px" h="6px" bg="blue.400" borderRadius="full" />
                    <Text fontSize="xs" color="blue.600" fontWeight="medium">Saving</Text>
                  </HStack>
                ) : lastSaved ? (
                  <HStack spacing={1}>
                    <Box w="6px" h="6px" bg="green.400" borderRadius="full" />
                    <Text fontSize="xs" color="green.600" fontWeight="medium">
                      Saved
                    </Text>
                  </HStack>
                ) : null}
              </HStack>
              <Progress
                value={(currentStep / STEPS.length) * 100}
                size="md"
                colorScheme="purple"
                borderRadius="full"
                bg="gray.200"
                h="8px"
                sx={{
                  '& > div:first-of-type': {
                    background: 'linear-gradient(90deg, #805ad5 0%, #667eea 50%, #764ba2 100%)',
                    borderRadius: 'full',
                  },
                }}
              />
            </Box>

            {/* Navigation Buttons - Hide in Step 2 (Payment handled by Stripe) */}
            {currentStep < STEPS.length && (
              <HStack w="full" spacing={3}>
                <Button
                  leftIcon={<FaArrowLeft />}
                  onClick={handlePrevious}
                  isDisabled={currentStep === 1}
                  variant="outline"
                  size="lg"
                  colorScheme="gray"
                  flex={1}
                  minH="48px"
                >
                  Previous
                </Button>
                
                <Button
                  rightIcon={<FaArrowRight />}
                  onClick={handleNext}
                  colorScheme="purple"
                  size="lg"
                  isDisabled={!isStepValid(currentStep)}
                  flex={2}
                  minH="48px"
                  bg="purple.500"
                  color="white"
                  _hover={{
                    bg: 'purple.600',
                    transform: 'translateY(-1px)',
                    shadow: 'lg',
                  }}
                  _disabled={{
                    bg: 'gray.300',
                    color: 'gray.500',
                    cursor: 'not-allowed',
                  }}
                  transition="all 0.2s"
                  fontWeight="semibold"
                >
                  Next Step
                </Button>
              </HStack>
            )}
            
            {/* Step 2: Show only Previous button since payment is handled by Stripe */}
            {currentStep === STEPS.length && (
              <HStack w="full" spacing={3}>
                <Button
                  leftIcon={<FaArrowLeft />}
                  onClick={handlePrevious}
                  variant="outline"
                  size="lg"
                  colorScheme="gray"
                  w="full"
                  minH="48px"
                >
                  ← Back to Step 1
                </Button>
              </HStack>
            )}
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}
