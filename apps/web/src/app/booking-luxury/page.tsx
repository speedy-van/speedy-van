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
  { id: 1, title: 'What, Where & When', description: 'Select items, addresses, date and time' },
  { id: 2, title: 'Customer & Payment', description: 'Enter details and payment' },
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
    <Box minH="100vh" bg={bgColor} py={{ base: 4, md: 8 }}>
      <Container maxW="6xl">
        <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          {/* Enhanced Header */}
          <Card bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
            <CardBody p={{ base: 4, md: 8 }}>
              <VStack spacing={{ base: 4, md: 6 }} textAlign="center">
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
                <HStack spacing={{ base: 4, md: 8 }} wrap="wrap" justify="center">
                  <HStack spacing={2}>
                    <Icon as={FaShieldAlt} color="green.500" />
                    <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">Insured & Licensed</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FaClock} color="blue.500" />
                    <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">24/7 Support</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FaMapMarkerAlt} color="purple.500" />
                    <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">UK-Wide Coverage</Text>
                  </HStack>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Enhanced Progress Indicator */}
          <Card bg={cardBg} shadow="lg" borderRadius="2xl">
            <CardBody p={{ base: 4, md: 8 }}>
              <VStack spacing={{ base: 4, md: 6 }}>
                {/* Progress Bar */}
                <Box w="full">
                  <Progress
                    value={(currentStep / STEPS.length) * 100}
                    size={{ base: "md", md: "lg" }}
                    colorScheme="blue"
                    borderRadius="full"
                    bg="gray.100"
                    sx={{
                      '& > div:first-of-type': {
                        background: 'linear-gradient(90deg, #3182ce 0%, #38a169 100%)',
                      },
                    }}
                  />
                </Box>
                
                {/* Step Indicators */}
                <Stack 
                  direction={isMobile ? 'column' : 'row'} 
                  spacing={isMobile ? 3 : 8} 
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
                        bg={isCurrent ? 'blue.50' : isCompleted ? 'green.50' : 'gray.50'}
                        borderColor={isCurrent ? 'blue.200' : isCompleted ? 'green.200' : 'gray.200'}
                        borderWidth="2px"
                        borderRadius="xl"
                        p={{ base: 3, md: 4 }}
                        cursor={isAccessible ? 'pointer' : 'not-allowed'}
                        onClick={() => isAccessible && handleStepClick(step.id)}
                        transition="all 0.2s"
                        _hover={isAccessible ? { transform: 'translateY(-2px)', shadow: 'md' } : {}}
                        opacity={isAccessible ? 1 : 0.6}
                        w={isMobile ? 'full' : '48%'}
                      >
                        <HStack spacing={{ base: 3, md: 4 }} align="start">
                          <Circle
                            size={{ base: "32px", md: "40px" }}
                            bg={isCompleted ? 'green.500' : isCurrent ? 'blue.500' : 'gray.300'}
                            color="white"
                            fontWeight="bold"
                          >
                            {isCompleted ? (
                              <Icon as={FaCheck} boxSize={{ base: 3, md: 4 }} />
                            ) : (
                              <Text fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>{step.id}</Text>
                            )}
                          </Circle>
                          <VStack spacing={1} align="start" flex={1}>
                            <Text fontSize={{ base: "sm", md: "md" }} fontWeight="semibold" color={isCurrent ? 'blue.700' : isCompleted ? 'green.700' : 'gray.600'}>
                              {step.title}
                            </Text>
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                              {step.description}
                            </Text>
                            {isCurrent && (
                              <Badge colorScheme="blue" size={{ base: "xs", md: "sm" }}>
                                Current Step
                              </Badge>
                            )}
                            {isCompleted && (
                              <Badge colorScheme="green" size={{ base: "xs", md: "sm" }}>
                                Completed
                              </Badge>
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
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <Button
                  leftIcon={<FaArrowLeft />}
                  onClick={handlePrevious}
                  isDisabled={currentStep === 1}
                  variant="outline"
                  size={{ base: "md", md: "lg" }}
                  colorScheme="gray"
                  minW={{ base: "100px", md: "140px" }}
                >
                  Previous
                </Button>
                
                <VStack spacing={2} flex={1} align="center">
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500" textAlign="center">
                    Step {currentStep} of {STEPS.length}
                  </Text>
                  <Text fontSize={{ base: "2xs", md: "xs" }} color="gray.400">
                    {isStepValid(currentStep) ? 'Ready to continue' : 'Please complete required fields'}
                  </Text>
                </VStack>
                
                <Button
                  rightIcon={<FaArrowRight />}
                  onClick={handleNext}
                  colorScheme="blue"
                  size={{ base: "md", md: "lg" }}
                  isDisabled={!isStepValid(currentStep)}
                  minW={{ base: "100px", md: "140px" }}
                  bgGradient="linear(to-r, blue.500, green.500)"
                  _hover={{
                    bgGradient: 'linear(to-r, blue.600, green.600)',
                    transform: 'translateY(-1px)',
                    shadow: 'lg',
                  }}
                  transition="all 0.2s"
                >
                  {currentStep === STEPS.length ? 'Complete Booking' : 'Next Step'}
                </Button>
              </Flex>
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
    </Box>
  );
}
