import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Icon,
  useToast,
  Badge,
  Checkbox,
  SimpleGrid,
  Flex,
  Spacer,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import {
  FaCreditCard,
  FaArrowRight,
  FaArrowLeft,
  FaLock,
  FaShieldAlt,
  FaStripe,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUserShield,
  FaHandshake,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaBoxes,
  FaPoundSign,
  FaRocket,
  FaStar,
  FaGem,
  FaCrown,
} from 'react-icons/fa';
import PricingDisplay from './PricingDisplay';

interface PaymentStepProps {
  bookingData: any;
  updateBookingData: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function PaymentStep({
  bookingData,
  updateBookingData,
  onNext,
  onBack,
}: PaymentStepProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string>('');
  const toast = useToast();

  // Use the calculated total from booking data
  const totalAmount = bookingData.calculatedTotal || 0;

  // Custom keyframe animations
  const pulse = keyframes`
    0% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(1); opacity: 0.8; }
  `;

  const bounce = keyframes`
    0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
    40%, 43% { transform: translate3d(0,-8px,0); }
    70% { transform: translate3d(0,-4px,0); }
    90% { transform: translate3d(0,-2px,0); }
  `;

  const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(0,194,255,0.3); }
    50% { box-shadow: 0 0 30px rgba(0,194,255,0.6); }
  `;

  const shimmer = keyframes`
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  `;

  // Debug logging for stored price
  useEffect(() => {
    console.log(
      'PaymentStep - bookingData.calculatedTotal:',
      bookingData.calculatedTotal
    );
    console.log('PaymentStep - totalAmount:', totalAmount);
  }, [bookingData.calculatedTotal, totalAmount]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const getSelectedPaymentMethod = () => {
    return {
      label: 'Stripe Payment',
      description: 'Secure payment processing via Stripe',
    };
  };

  const getMoveDateInfo = () => {
    if (!bookingData.date)
      return { display: 'Not set', isWeekend: false, isTomorrow: false };

    const date = new Date(bookingData.date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    return {
      display: date.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      isWeekend,
      isTomorrow,
    };
  };

  const moveDateInfo = getMoveDateInfo();

  return (
    <Box
      p={8}
      borderWidth="2px"
      borderRadius="2xl"
      bg="bg.card"
      borderColor="border.primary"
      boxShadow="xl"
      position="relative"
      overflow="hidden"
      className="booking-step-card"
    >
      {/* Background Pattern */}
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        bg="linear-gradient(135deg, rgba(0,194,255,0.03), rgba(0,209,143,0.03))"
        borderRadius="2xl"
        zIndex={0}
      />

      <VStack spacing={8} align="stretch" position="relative" zIndex={1}>
        {/* Enhanced Header */}
        <Box textAlign="center" position="relative">
          <VStack spacing={4}>
            {/* Animated Main Icon */}
            <Box
              position="relative"
              p={5}
              borderRadius="full"
              bg="linear-gradient(135deg, rgba(0,194,255,0.15), rgba(0,209,143,0.15))"
              borderWidth="3px"
              borderColor="neon.500"
              animation={`${pulse} 3s ease-in-out infinite`}
              _hover={{
                transform: 'scale(1.1) rotate(5deg)',
                borderColor: 'neon.400',
              }}
              transition="all 300ms"
            >
              <Icon
                as={FaCreditCard}
                color="neon.500"
                boxSize={12}
                filter="drop-shadow(0 0 15px rgba(0,194,255,0.6))"
              />

              {/* Floating Security Icons */}
              <Box
                position="absolute"
                top="-10px"
                sx={{ right: '-10px' }}
              >
                <Icon
                  as={FaLock}
                  color="brand.500"
                  boxSize={5}
                  animation={`${bounce} 2s ease-in-out infinite`}
                />
              </Box>
              <Box
                position="absolute"
                bottom="-10px"
                left="-10px"
              >
                <Icon
                  as={FaShieldAlt}
                  color="neon.500"
                  boxSize={4}
                  animation={`${bounce} 2s ease-in-out infinite 0.5s`}
                />
              </Box>
            </Box>

            <VStack spacing={3}>
              <Text
                fontSize="3xl"
                fontWeight="bold"
                color="neon.500"
                letterSpacing="wide"
              >
                Secure Payment (Combined with Summary)
              </Text>
              <Text
                fontSize="lg"
                color="text.secondary"
                maxW="500px"
                lineHeight="tall"
              >
                Complete your booking with enterprise-grade security and instant
                confirmation
              </Text>
            </VStack>
          </VStack>
        </Box>

        {/* Enhanced Payment Amount Display with Pay Button */}
        <Box
          p={6}
          borderWidth="2px"
          borderRadius="xl"
          bg="linear-gradient(135deg, rgba(0,209,143,0.1), rgba(0,194,255,0.1))"
          borderColor="brand.500"
          position="relative"
          overflow="hidden"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: '2xl',
            borderColor: 'brand.400',
          }}
          transition="all 300ms"
          className="booking-form-section"
        >
          {/* Shimmer Effect */}
          <Box
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            bg="linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
            animation={`${shimmer} 2s infinite`}
            zIndex={0}
          />

          <VStack spacing={4} position="relative" zIndex={1}>
            <HStack justify="space-between" w="full">
              <VStack align="start" spacing={2}>
                <HStack spacing={3}>
                  <Icon as={FaPoundSign} color="brand.500" boxSize={6} />
                  <Text fontSize="xl" fontWeight="bold" color="text.primary">
                    Total Amount to Pay
                  </Text>
                </HStack>
                <Text fontSize="sm" color="text.secondary">
                  Secure payment via Stripe - instant confirmation
                </Text>
              </VStack>
              <Badge
                colorScheme="brand"
                fontSize="2xl"
                p={4}
                borderRadius="xl"
                borderWidth="2px"
                borderColor="brand.400"
                bg="linear-gradient(135deg, rgba(0,209,143,0.9), rgba(0,209,143,0.7))"
                color="white"
                _hover={{
                  transform: 'scale(1.05)',
                  boxShadow: '0 0 30px rgba(0,209,143,0.5)',
                }}
                transition="all 300ms"
              >
                {formatCurrency(totalAmount)}
              </Badge>
            </HStack>

            {/* Pay Button */}
            {totalAmount > 0 && (
              <Button
                onClick={async () => {
                  if (acceptedTerms) {
                    setIsProcessing(true);
                    try {
                      // Create payment intent and get Stripe checkout URL
                      const response = await fetch(
                        '/api/stripe/create-payment-intent',
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            amount: totalAmount,
                            bookingData: bookingData,
                          }),
                        }
                      );

                      if (!response.ok) {
                        throw new Error('Failed to create payment intent');
                      }

                      const data = await response.json();

                      if (data.checkoutUrl) {
                        // Redirect to Stripe Checkout
                        window.location.href = data.checkoutUrl;
                      } else {
                        throw new Error('No checkout URL received');
                      }
                    } catch (error) {
                      console.error('Payment error:', error);
                      toast({
                        title: 'Payment Failed',
                        description:
                          error instanceof Error
                            ? error.message
                            : 'Payment processing failed. Please try again.',
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                      });
                    } finally {
                      setIsProcessing(false);
                    }
                  } else {
                    // Show terms acceptance message
                    toast({
                      title: 'Please accept terms and conditions',
                      description:
                        'You must accept the terms and conditions to proceed with payment.',
                      status: 'warning',
                      duration: 3000,
                      isClosable: true,
                    });
                  }
                }}
                isLoading={isProcessing}
                loadingText="Processing Payment..."
                size="lg"
                colorScheme="brand"
                bg="linear-gradient(135deg, rgba(0,209,143,0.9), rgba(0,209,143,0.7))"
                color="white"
                fontWeight="bold"
                fontSize="lg"
                px={8}
                py={6}
                borderRadius="xl"
                borderWidth="2px"
                borderColor="brand.400"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 25px rgba(0,209,143,0.4)',
                  bg: 'linear-gradient(135deg, rgba(0,209,143,1), rgba(0,209,143,0.8))',
                }}
                _active={{
                  transform: 'translateY(0)',
                  boxShadow: '0 5px 15px rgba(0,209,143,0.3)',
                }}
                transition="all 300ms"
                w={{ base: 'full', md: 'auto' }}
                minH={{ base: '56px', md: 'auto' }}
                className="booking-primary-button"
              >
                <HStack spacing={3}>
                  <Icon as={FaCreditCard} boxSize={5} />
                  <Text>
                    {isProcessing
                      ? 'Processing...'
                      : `Pay Now - ${formatCurrency(totalAmount)}`}
                  </Text>
                </HStack>
              </Button>
            )}

            {/* Terms & Conditions Checkbox */}
            <Box
              w="full"
              pt={4}
              borderTopWidth="1px"
              borderColor="border.primary"
            >
              <FormControl className="booking-form-control">
                <Checkbox
                  isChecked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  size={{ base: 'lg', md: 'md' }}
                  colorScheme="brand"
                  _checked={{
                    bg: 'brand.500',
                    borderColor: 'brand.500',
                    color: 'white',
                  }}
                  className="booking-checkbox"
                >
                  <VStack align="start" spacing={1}>
                    <Text
                      fontSize={{ base: 'md', md: 'sm' }}
                      fontWeight="medium"
                      color="text.primary"
                    >
                      I accept the terms and conditions and agree to proceed
                      with payment
                    </Text>
                    <Text
                      fontSize={{ base: 'sm', md: 'xs' }}
                      color="text.secondary"
                    >
                      By accepting, you agree to our terms of service, privacy
                      policy, and payment processing
                    </Text>
                  </VStack>
                </Checkbox>
              </FormControl>
            </Box>
          </VStack>
        </Box>

        {/* Enhanced Stripe Payment Method */}
        <Box>
          <HStack spacing={4} mb={6} justify="center">
            <Box
              p={3}
              borderRadius="full"
              bg="linear-gradient(135deg, rgba(0,194,255,0.15), rgba(0,209,143,0.15))"
              borderWidth="2px"
              borderColor="neon.500"
            >
              <Icon as={FaCreditCard} color="neon.500" boxSize={7} />
            </Box>
            <Text fontSize="xl" fontWeight="semibold" color="text.primary">
              Payment Method
            </Text>
          </HStack>

          <Box
            p={6}
            borderWidth="2px"
            borderRadius="xl"
            bg="bg.surface"
            borderColor="border.primary"
            _hover={{
              borderColor: 'neon.400',
              transform: 'translateY(-2px)',
              boxShadow: 'xl',
            }}
            transition="all 300ms"
            cursor="pointer"
            onMouseEnter={() => setHoveredSection('payment')}
            onMouseLeave={() => setHoveredSection('')}
          >
            <HStack spacing={6} justify="space-between">
              <HStack spacing={4}>
                <Box
                  p={3}
                  borderRadius="xl"
                  bg="linear-gradient(135deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))"
                  borderWidth="1px"
                  borderColor="neon.500"
                  _hover={{
                    transform: 'scale(1.1) rotate(5deg)',
                    borderColor: 'neon.400',
                  }}
                  transition="all 300ms"
                >
                  <Icon as={FaStripe} boxSize={8} color="neon.500" />
                </Box>
                <VStack align="start" spacing={2}>
                  <Text fontSize="lg" fontWeight="bold" color="text.primary">
                    Stripe Payment
                  </Text>
                  <Text fontSize="md" color="text.secondary" maxW="300px">
                    Enterprise-grade payment processing with 256-bit SSL
                    encryption
                  </Text>
                </VStack>
              </HStack>
              <VStack spacing={2} align="end">
                <Badge
                  colorScheme="neon"
                  variant="outline"
                  size="lg"
                  p={3}
                  borderRadius="full"
                  borderWidth="2px"
                  fontSize="md"
                  fontWeight="bold"
                >
                  🔒 Secure
                </Badge>
                <Text fontSize="xs" color="text.tertiary" textAlign="center">
                  PCI DSS Compliant
                </Text>
              </VStack>
            </HStack>
          </Box>
        </Box>

        {/* Enhanced Security Features */}
        <Box
          p={6}
          borderWidth="2px"
          borderRadius="xl"
          bg="bg.surface"
          borderColor="border.primary"
          _hover={{
            borderColor: 'neon.400',
            transform: 'translateY(-2px)',
            boxShadow: 'xl',
          }}
          transition="all 300ms"
          onMouseEnter={() => setHoveredSection('security')}
          onMouseLeave={() => setHoveredSection('')}
        >
          <HStack spacing={4} mb={6} justify="center">
            <Box
              p={3}
              borderRadius="full"
              bg="linear-gradient(135deg, rgba(0,209,143,0.15), rgba(0,194,255,0.15))"
              borderWidth="2px"
              borderColor="brand.500"
            >
              <Icon as={FaShieldAlt} color="brand.500" boxSize={7} />
            </Box>
            <Text fontSize="xl" fontWeight="semibold" color="text.primary">
              Security Features
            </Text>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Box
              p={4}
              bg="bg.card"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="border.primary"
              textAlign="center"
              _hover={{
                transform: 'translateY(-3px)',
                borderColor: 'brand.400',
                boxShadow: 'lg',
              }}
              transition="all 300ms"
            >
              <Icon as={FaLock} color="brand.500" boxSize={8} mb={3} />
              <Text fontSize="lg" fontWeight="bold" color="text.primary" mb={2}>
                256-bit SSL Encryption
              </Text>
              <Text fontSize="sm" color="text.secondary">
                Military-grade encryption for all data transmission
              </Text>
            </Box>

            <Box
              p={4}
              bg="bg.card"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="border.primary"
              textAlign="center"
              _hover={{
                transform: 'translateY(-3px)',
                borderColor: 'neon.400',
                boxShadow: 'lg',
              }}
              transition="all 300ms"
            >
              <Icon as={FaShieldAlt} color="neon.500" boxSize={8} mb={3} />
              <Text fontSize="lg" fontWeight="bold" color="text.primary" mb={2}>
                PCI DSS Compliant
              </Text>
              <Text fontSize="sm" color="text.secondary">
                Highest security standards for payment processing
              </Text>
            </Box>

            <Box
              p={4}
              bg="bg.card"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="border.primary"
              textAlign="center"
              _hover={{
                transform: 'translateY(-3px)',
                borderColor: 'brand.400',
                boxShadow: 'lg',
              }}
              transition="all 300ms"
            >
              <Icon as={FaUserShield} color="brand.500" boxSize={8} mb={3} />
              <Text fontSize="lg" fontWeight="bold" color="text.primary" mb={2}>
                Fraud Protection
              </Text>
              <Text fontSize="sm" color="text.secondary">
                Advanced fraud detection and prevention systems
              </Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Enhanced Booking Summary */}
        <Box
          p={6}
          borderWidth="2px"
          borderRadius="xl"
          bg="bg.surface"
          borderColor="border.primary"
          _hover={{
            borderColor: 'neon.400',
            transform: 'translateY(-2px)',
            boxShadow: 'xl',
          }}
          transition="all 300ms"
          onMouseEnter={() => setHoveredSection('summary')}
          onMouseLeave={() => setHoveredSection('')}
        >
          <HStack spacing={4} mb={6} justify="center">
            <Box
              p={3}
              borderRadius="full"
              bg="linear-gradient(135deg, rgba(0,209,143,0.15), rgba(0,194,255,0.15))"
              borderWidth="2px"
              borderColor="brand.500"
            >
              <Icon as={FaRocket} color="brand.500" boxSize={7} />
            </Box>
            <Text fontSize="xl" fontWeight="semibold" color="text.primary">
              Move Summary
            </Text>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <VStack align="start" spacing={4}>
              <HStack spacing={4} w="full">
                <Box
                  p={2}
                  borderRadius="lg"
                  bg="linear-gradient(135deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))"
                  borderWidth="1px"
                  borderColor="neon.500"
                >
                  <Icon as={FaClock} color="neon.500" boxSize={5} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="text.tertiary" fontWeight="medium">
                    Move Date
                  </Text>
                  <Text fontSize="md" fontWeight="bold" color="text.primary">
                    {moveDateInfo.display}
                  </Text>
                  {moveDateInfo.isTomorrow && (
                    <Badge colorScheme="brand" size="sm">
                      Tomorrow
                    </Badge>
                  )}
                  {moveDateInfo.isWeekend && (
                    <Badge colorScheme="warning" size="sm">
                      Weekend
                    </Badge>
                  )}
                </VStack>
              </HStack>

              <HStack spacing={4} w="full">
                <Box
                  p={2}
                  borderRadius="lg"
                  bg="linear-gradient(135deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))"
                  borderWidth="1px"
                  borderColor="neon.500"
                >
                  <Icon as={FaBoxes} color="neon.500" boxSize={5} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="text.tertiary" fontWeight="medium">
                    Items
                  </Text>
                  <Text fontSize="md" fontWeight="bold" color="text.primary">
                    {bookingData.items?.length || 0} item
                    {bookingData.items?.length !== 1 ? 's' : ''}
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            <VStack align="start" spacing={4}>
              <HStack spacing={4} w="full">
                <Box
                  p={2}
                  borderRadius="lg"
                  bg="linear-gradient(135deg, rgba(0,209,143,0.1), rgba(0,194,255,0.1))"
                  borderWidth="1px"
                  borderColor="brand.500"
                >
                  <Icon as={FaCreditCard} color="brand.500" boxSize={5} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="text.tertiary" fontWeight="medium">
                    Payment Method
                  </Text>
                  <Text fontSize="md" fontWeight="bold" color="text.primary">
                    {getSelectedPaymentMethod()?.label}
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={4} w="full">
                <Box
                  p={2}
                  borderRadius="lg"
                  bg="linear-gradient(135deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))"
                  borderWidth="1px"
                  borderColor="neon.500"
                >
                  <Icon as={FaPoundSign} color="neon.500" boxSize={5} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="text.tertiary" fontWeight="medium">
                    Total Amount
                  </Text>
                  <Text fontSize="xl" fontWeight="bold" color="brand.500">
                    {formatCurrency(totalAmount)}
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={4} w="full">
                <Box
                  p={2}
                  borderRadius="lg"
                  bg="linear-gradient(135deg, rgba(0,209,143,0.1), rgba(0,194,255,0.1))"
                  borderWidth="1px"
                  borderColor="brand.500"
                >
                  <Icon as={FaGem} color="brand.500" boxSize={5} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="text.tertiary" fontWeight="medium">
                    Status
                  </Text>
                  <Badge
                    colorScheme="brand"
                    size="lg"
                    p={2}
                    borderRadius="full"
                  >
                    Ready for Payment
                  </Badge>
                </VStack>
              </HStack>
            </VStack>
          </SimpleGrid>
        </Box>

        {/* Enhanced Payment Validation Warning */}
        {(!totalAmount || totalAmount <= 0) && (
          <Alert
            status="warning"
            borderRadius="xl"
            borderWidth="2px"
            borderColor="warning.500"
            bg="linear-gradient(135deg, rgba(255,193,7,0.1), rgba(255,193,7,0.05))"
          >
            <AlertIcon as={FaExclamationTriangle} boxSize={6} />
            <Box>
              <AlertTitle fontSize="lg" fontWeight="bold">
                Invalid Total Amount
              </AlertTitle>
              <AlertDescription fontSize="md">
                The total amount is {formatCurrency(totalAmount)}. Please ensure
                you have completed the pricing step before proceeding to
                payment.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Enhanced Navigation Buttons */}
        <HStack spacing={6} justify="space-between" pt={6}>
          <Button
            onClick={onBack}
            variant="secondary"
            size="lg"
            leftIcon={<FaArrowLeft />}
            px={8}
            py={4}
            fontSize="md"
            fontWeight="semibold"
            _hover={{
              transform: 'translateX(-3px)',
              boxShadow: 'lg',
            }}
            transition="all 300ms"
          >
            Back to Summary
          </Button>

          {acceptedTerms && totalAmount > 0 && (
            <HStack spacing={3}>
              <Icon as={FaCrown} color="brand.500" boxSize={5} />
              <Text fontSize="sm" color="text.secondary" fontWeight="medium">
                Ready to complete your move booking!
              </Text>
            </HStack>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}
