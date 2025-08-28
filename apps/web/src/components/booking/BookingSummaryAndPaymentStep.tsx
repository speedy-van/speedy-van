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
  Container,
  Spinner
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
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import PricingDisplay from './PricingDisplay';
import BookingNavigationButtons from './BookingNavigationButtons';

interface BookingSummaryAndPaymentStepProps {
  bookingData: any;
  updateBookingData: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function BookingSummaryAndPaymentStep({ 
  bookingData, 
  updateBookingData, 
  onNext, 
  onBack 
}: BookingSummaryAndPaymentStepProps) {
  const [currentPrice, setCurrentPrice] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string>('');
  const [showSummary, setShowSummary] = useState(true);
  const toast = useToast();

  // Use the calculated total from booking data, fallback to current price
  const totalAmount = bookingData.calculatedTotal || currentPrice || 0;

  // Update booking data with calculated price when component mounts or price changes
  useEffect(() => {
    if (currentPrice > 0 && !bookingData.calculatedTotal) {
      updateBookingData({ calculatedTotal: currentPrice });
    }
  }, [currentPrice, bookingData.calculatedTotal, updateBookingData]);

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

  // Debug logging for price changes
  useEffect(() => {
    console.log('BookingSummaryAndPaymentStep - currentPrice changed to:', currentPrice);
  }, [currentPrice]);

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

  const getSelectedPaymentMethod = () => {
    return {
      label: 'Stripe Payment',
      description: 'Secure payment processing via Stripe'
    };
  };

  const getMoveDateInfo = () => {
    if (!bookingData.date) return { display: 'Not set', isWeekend: false, isTomorrow: false };
    
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
        day: 'numeric' 
      }),
      isWeekend,
      isTomorrow
    };
  };

  const moveDateInfo = getMoveDateInfo();

  const handleContinue = () => {
    // Store the calculated price in booking data for the payment step
    console.log('BookingSummaryAndPaymentStep - Storing calculatedTotal:', currentPrice);
    updateBookingData({ calculatedTotal: currentPrice });
    onNext?.();
  };

  const handlePaymentSubmit = async () => {
    if (!acceptedTerms) {
      toast({
        title: 'Terms and Conditions Required',
        description: 'Please accept the terms and conditions to continue.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!totalAmount || totalAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please ensure you have a valid total amount before proceeding.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // First, create the booking in the database
      const createBookingResponse = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          calculatedTotal: totalAmount,
          basePrice: totalAmount * 0.8, // Estimate base price
          extrasCost: 0,
          vat: totalAmount * 0.2, // 20% VAT
        }),
      });

      if (!createBookingResponse.ok) {
        const errorData = await createBookingResponse.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const createBookingData = await createBookingResponse.json();
      const bookingId = createBookingData.booking.id;

      console.log('✅ Booking created successfully:', bookingId);

      // Create payment intent and get Stripe checkout URL
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          bookingData: {
            ...bookingData,
            bookingId: bookingId, // Include the created booking ID
            calculatedTotal: totalAmount,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      
      if (data.checkoutUrl) {
        // Store the calculated total in booking data
        updateBookingData({ calculatedTotal: totalAmount });
        
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Payment processing failed. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
        right="0"
        bottom="0"
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
                borderColor: 'neon.400'
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
              <Icon
                as={FaLock}
                position="absolute"
                top="-10px"
                right="-10px"
                color="brand.500"
                boxSize={5}
                animation={`${bounce} 2s ease-in-out infinite`}
              />
              <Icon
                as={FaShieldAlt}
                position="absolute"
                bottom="-10px"
                left="-10px"
                color="neon.400"
                boxSize={5}
                animation={`${bounce} 2s ease-in-out infinite 1s`}
              />
            </Box>
            
            <VStack spacing={2}>
              <Text fontSize="3xl" fontWeight="bold" color="neon.500" textShadow="0 0 20px rgba(0,194,255,0.3)">
                Step 5: Booking Summary & Secure Payment
              </Text>
              <Text fontSize="lg" color="text.secondary" maxW="600px">
                Review your booking details and complete your secure payment
              </Text>
            </VStack>
          </VStack>
        </Box>

        {/* Toggle between Summary and Payment */}
        <Box textAlign="center">
          <HStack spacing={4} justify="center">
            <Button
              variant={showSummary ? "solid" : "outline"}
              colorScheme="neon"
              size="sm"
              leftIcon={<FaEye />}
              onClick={() => setShowSummary(true)}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
              }}
              transition="all 300ms"
            >
              Booking Summary
            </Button>
            <Button
              variant={!showSummary ? "solid" : "outline"}
              colorScheme="brand"
              size="sm"
              leftIcon={<FaCreditCard />}
              onClick={() => setShowSummary(false)}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
              }}
              transition="all 300ms"
            >
              Secure Payment
            </Button>
          </HStack>
        </Box>

        {showSummary ? (
          /* Booking Summary Section */
          <VStack spacing={6} align="stretch">
            {/* Total Amount Display */}
            <Box 
              p={6} 
              borderWidth="2px" 
              borderRadius="xl" 
              borderColor="brand.500" 
              bg="bg.surface" 
              className="booking-form-section"
              _hover={{
                borderColor: 'brand.400',
                transform: 'translateY(-2px)',
                boxShadow: 'xl'
              }}
              transition="all 300ms"
            >
              <HStack justify="space-between">
                <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                  Total Amount
                </Text>
                <Badge colorScheme="brand" fontSize="3xl" p={4} borderRadius="xl">
                  {formatCurrency(totalAmount)}
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
            <Box p={6} borderWidth="1px" borderRadius="xl" bg="bg.surface" borderColor="border.primary" className="booking-form-section">
              <Text fontSize="xl" fontWeight="semibold" mb={4} color="neon.500">
                📋 Booking Details
              </Text>
              <VStack align="start" spacing={4}>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="medium">Move Date:</Text>
                  <Text>{formatDate(bookingData.date)}</Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="medium">Time Slot:</Text>
                  <Text>{bookingData.timeSlot || 'Not set'}</Text>
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
            <Box p={6} borderWidth="1px" borderRadius="xl" bg="bg.surface" borderColor="border.primary" className="booking-form-section">
              <Text fontSize="xl" fontWeight="semibold" mb={4} color="neon.500">
                🏠 Address Details
              </Text>
              <VStack align="start" spacing={4}>
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
              <Box p={6} borderWidth="1px" borderRadius="xl" bg="bg.surface" borderColor="border.primary" className="booking-form-section">
                <Text fontSize="xl" fontWeight="semibold" mb={4} color="neon.500">
                  📦 Items to Move ({bookingData.items.length})
                </Text>
                <VStack align="start" spacing={3}>
                  {bookingData.items.map((item: any, index: number) => (
                    <HStack key={index} justify="space-between" w="full">
                      <Text fontSize="md">{item.name}</Text>
                      <HStack spacing={3}>
                        <Badge colorScheme="neon" variant="outline">Qty: {item.quantity}</Badge>
                        <Badge colorScheme="brand" variant="outline">£{item.price}</Badge>
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        ) : (
          /* Payment Section */
          <VStack spacing={6} align="stretch">
            {/* Payment Method Selection */}
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
                  boxShadow: 'xl'
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
                        borderColor: 'neon.400'
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
                        Enterprise-grade payment processing with 256-bit SSL encryption
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
                boxShadow: 'xl'
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
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <HStack spacing={4} w="full">
                  <Box
                    p={2}
                    borderRadius="lg"
                    bg="linear-gradient(135deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))"
                    borderWidth="1px"
                    borderColor="neon.500"
                  >
                    <Icon as={FaLock} color="neon.500" boxSize={5} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="text.tertiary" fontWeight="medium">
                      Encryption
                    </Text>
                    <Text fontSize="md" fontWeight="bold" color="text.primary">
                      256-bit SSL
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
                    <Icon as={FaUserShield} color="brand.500" boxSize={5} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="text.tertiary" fontWeight="medium">
                      Protection
                    </Text>
                    <Text fontSize="md" fontWeight="bold" color="text.primary">
                      Fraud Detection
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
                    <Badge colorScheme="brand" size="lg" p={2} borderRadius="full">
                      Ready for Payment
                    </Badge>
                  </VStack>
                </HStack>
              </SimpleGrid>
            </Box>

            {/* Terms and Conditions */}
            <Box 
              p={6} 
              borderWidth="2px" 
              borderRadius="xl" 
              bg="bg.surface" 
              borderColor="border.primary"
              _hover={{
                borderColor: 'neon.400',
                transform: 'translateY(-2px)',
                boxShadow: 'xl'
              }}
              transition="all 300ms"
            >
              <FormControl>
                <HStack spacing={4} align="start">
                  <Checkbox
                    isChecked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    colorScheme="neon"
                    size="lg"
                    mt={1}
                  />
                  <VStack align="start" spacing={2}>
                    <Text fontSize="lg" fontWeight="semibold" color="text.primary">
                      Terms and Conditions
                    </Text>
                    <Text fontSize="md" color="text.secondary">
                      I agree to the terms and conditions and confirm that all booking details are correct. 
                      I understand that payment will be processed securely through Stripe.
                    </Text>
                  </VStack>
                </HStack>
              </FormControl>
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
                  <AlertTitle fontSize="lg" fontWeight="bold">Invalid Total Amount</AlertTitle>
                  <AlertDescription fontSize="md">
                    The total amount is {formatCurrency(totalAmount)}. Please ensure you have completed the pricing step before proceeding to payment.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </VStack>
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
              boxShadow: 'lg'
            }}
            transition="all 300ms"
          >
            Back
          </Button>
          
          {showSummary ? (
            <Button
              onClick={() => setShowSummary(false)}
              colorScheme="neon"
              size="lg"
              rightIcon={<FaCreditCard />}
              px={8}
              py={4}
              fontSize="md"
              fontWeight="semibold"
              _hover={{
                transform: 'translateX(3px)',
                boxShadow: 'lg'
              }}
              transition="all 300ms"
            >
              Continue to Payment
            </Button>
          ) : (
            <Button
              onClick={handlePaymentSubmit}
              colorScheme="brand"
              size="lg"
              rightIcon={isProcessing ? <Spinner size="sm" /> : <FaRocket />}
              px={8}
              py={4}
              fontSize="md"
              fontWeight="semibold"
              isLoading={isProcessing}
              loadingText="Processing Payment..."
              isDisabled={!acceptedTerms || !totalAmount || totalAmount <= 0}
              _hover={{
                transform: 'translateX(3px)',
                boxShadow: 'lg'
              }}
              transition="all 300ms"
            >
              {isProcessing ? 'Processing...' : 'Complete Booking'}
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}
