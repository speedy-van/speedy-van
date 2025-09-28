'use client';

import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Checkbox,
  Card,
  CardBody,
  CardHeader,
  Divider,
  InputGroup,
  InputLeftElement,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  useToast,
  Grid,
  SimpleGrid,
  FormControl,
  FormLabel,
  Icon,
  Circle,
  Flex,
} from '@chakra-ui/react';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaCreditCard,
  FaShieldAlt,
  FaLock,
  FaCheckCircle,
  FaBolt,
  FaFileContract,
  FaUserShield,
} from 'react-icons/fa';
import { FormData, CustomerDetails, PaymentMethod } from '../hooks/useBookingForm';
import StripePaymentButton from './StripePaymentButton';

interface WhoAndPaymentStepProps {
  formData: FormData;
  updateFormData: (step: keyof FormData, data: Partial<FormData[keyof FormData]>) => void;
  errors: Record<string, string>;
  paymentSuccess?: boolean;
}

const PAYMENT_METHODS = [
  {
    id: 'stripe' as const,
    name: 'Credit/Debit Card',
    description: 'Secure payment via Stripe',
    icon: FaCreditCard,
    color: 'blue',
    features: ['Visa', 'Mastercard', 'American Express', 'Apple Pay', 'Google Pay'],
  },
];

export default function WhoAndPaymentStep({
  formData,
  updateFormData,
  errors,
  paymentSuccess = false,
}: WhoAndPaymentStepProps) {
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const toast = useToast();

  const { step2 } = formData;

  const updateCustomerDetails = (field: keyof CustomerDetails, value: string) => {
    updateFormData('step2', {
      customerDetails: {
        ...step2.customerDetails,
        [field]: value,
      },
    });
  };

  const updatePaymentMethod = (field: keyof PaymentMethod, value: any) => {
    updateFormData('step2', {
      paymentMethod: {
        ...step2.paymentMethod,
        [field]: value,
      },
    });
  };

  const updatePaymentStatus = (status: 'pending' | 'processing' | 'success' | 'failed') => {
    setPaymentStatus(status);
  };

  const updateStripeDetails = (field: string, value: string) => {
    updateFormData('step2', {
      paymentMethod: {
        ...step2.paymentMethod,
        stripeDetails: {
          ...step2.paymentMethod.stripeDetails,
          [field]: value,
        },
      },
    });
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    // Store card details in local state or remove this functionality
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    // Store expiry in local state or remove this functionality
  };

  const handlePaymentMethodSelect = (methodId: PaymentMethod['type']) => {
    updatePaymentMethod('type', methodId);
    setShowCardDetails(false); // Only stripe is supported now
  };

  const handleTermsAcceptance = (field: 'termsAccepted' | 'privacyAccepted', value: boolean) => {
    updateFormData('step2', {
      [field]: value,
    });
  };

  return (
    <VStack spacing={{ base: 6, md: 8 }} align="stretch" p={{ base: 4, md: 6, lg: 8 }}>
      {/* Enhanced Step Header */}
      <Box textAlign="center" mb={6}>
        <Heading size={{ base: "lg", md: "xl" }} mb={3} bgGradient="linear(to-r, purple.600, blue.600)" bgClip="text">
          💳 Complete Your Booking
        </Heading>
        <Text color="gray.600" fontSize={{ base: "md", md: "lg" }}>
          Enter your details and pay securely to confirm your move
        </Text>
      </Box>

      {/* 1. Customer Information - Enhanced */}
      <Card 
        p={{ base: 4, md: 6 }} 
        shadow="xl" 
        borderWidth="1px" 
        borderColor="purple.200"
        bg="white"
        _hover={{ shadow: "2xl", transform: "translateY(-2px)" }}
        transition="all 0.3s ease"
        borderRadius="xl"
      >
        <VStack spacing={6} align="stretch">
          <HStack spacing={3} align="center" mb={2}>
            <Circle size="40px" bg="purple.100" color="purple.600">
              <Icon as={FaUser} fontSize="20px" />
            </Circle>
            <Box>
              <Heading size={{ base: "sm", md: "md" }} color="purple.800" mb={1}>
                👤 Your Information
              </Heading>
              <Text fontSize="sm" color="gray.600">
                We'll use this to keep you updated on your move
              </Text>
            </Box>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                First Name
              </FormLabel>
              <Input
                placeholder="Enter your first name"
                value={step2.customerDetails.firstName}
                onChange={(e) => updateCustomerDetails('firstName', e.target.value)}
                isInvalid={!!errors['customerDetails.firstName']}
                bg="white"
                borderColor="gray.300"
                _hover={{ borderColor: "purple.400" }}
                _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #9F7AEA" }}
                size="md"
                borderRadius="md"
                fontWeight="medium"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Last Name
              </FormLabel>
              <Input
                placeholder="Enter your last name"
                value={step2.customerDetails.lastName}
                onChange={(e) => updateCustomerDetails('lastName', e.target.value)}
                isInvalid={!!errors['customerDetails.lastName']}
                bg="white"
                borderColor="gray.300"
                _hover={{ borderColor: "purple.400" }}
                _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #9F7AEA" }}
                size="md"
                borderRadius="md"
                fontWeight="medium"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Email Address
              </FormLabel>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={step2.customerDetails.email}
                onChange={(e) => updateCustomerDetails('email', e.target.value)}
                isInvalid={!!errors['customerDetails.email']}
                bg="white"
                borderColor="gray.300"
                _hover={{ borderColor: "purple.400" }}
                _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #9F7AEA" }}
                size="md"
                borderRadius="md"
                fontWeight="medium"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Phone Number
              </FormLabel>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={step2.customerDetails.phone}
                onChange={(e) => updateCustomerDetails('phone', e.target.value)}
                isInvalid={!!errors['customerDetails.phone']}
                bg="white"
                borderColor="gray.300"
                _hover={{ borderColor: "purple.400" }}
                _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #9F7AEA" }}
                size="md"
                borderRadius="md"
                fontWeight="medium"
              />
            </FormControl>
          </SimpleGrid>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
              Company Name (Optional)
            </FormLabel>
            <Input
              placeholder="Enter your company name (if applicable)"
              value={step2.customerDetails.company || ''}
              onChange={(e) => updateCustomerDetails('company', e.target.value)}
              bg="white"
              borderColor="gray.300"
              _hover={{ borderColor: "purple.400" }}
              _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #9F7AEA" }}
              size="md"
              borderRadius="md"
              fontWeight="medium"
            />
          </FormControl>
        </VStack>
      </Card>

      {/* 2. Payment Method - Enhanced */}
      <Card 
        p={{ base: 4, md: 6 }} 
        shadow="xl" 
        borderWidth="1px" 
        borderColor="green.200"
        bg="white"
        _hover={{ shadow: "2xl", transform: "translateY(-2px)" }}
        transition="all 0.3s ease"
        borderRadius="xl"
      >
        <VStack spacing={6} align="stretch">
          <HStack spacing={3} align="center" mb={2}>
            <Circle size="40px" bg="green.100" color="green.600">
              <Icon as={FaCreditCard} fontSize="20px" />
            </Circle>
            <Box>
              <Heading size={{ base: "sm", md: "md" }} color="green.800" mb={1}>
                💳 Payment Method
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Secure payment processed by Stripe
              </Text>
            </Box>
          </HStack>

          {/* Stripe Payment Card */}
          <Box 
            p={4} 
            bg="green.50" 
            borderRadius="lg" 
            borderWidth="1px" 
            borderColor="green.200"
          >
            <HStack spacing={3} align="center">
              <Circle size="32px" bg="green.100" color="green.600">
                <Icon as={FaShieldAlt} fontSize="16px" />
              </Circle>
              <Box flex="1">
                <Text fontWeight="600" color="green.700" fontSize="md">
                  Credit/Debit Card
                </Text>
                <Text fontSize="sm" color="green.600">
                  Visa, Mastercard, American Express
                </Text>
              </Box>
              <Badge colorScheme="green" size="sm">
                Secure
              </Badge>
            </HStack>
          </Box>

          {/* Terms & Payment Section */}
          <VStack spacing={4} align="stretch">
            {/* Terms & Conditions - Enhanced */}
            <VStack spacing={4} align="stretch" p={4} bg="gray.50" borderRadius="lg" borderWidth="1px" borderColor="gray.200">
              <HStack spacing={3} align="start">
                <Checkbox
                  isChecked={step2.termsAccepted}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    handleTermsAcceptance('termsAccepted', isChecked);
                    handleTermsAcceptance('privacyAccepted', isChecked);
                  }}
                  isInvalid={!!errors['termsAccepted']}
                  size="lg"
                  colorScheme="green"
                  mt={1}
                />
                <Box>
                  <Text fontSize="sm" fontWeight="600" color="gray.800" lineHeight="1.5">
                    I accept the{' '}
                    <Button 
                      variant="link" 
                      colorScheme="green" 
                      size="sm" 
                      p={0} 
                      h="auto" 
                      fontWeight="700"
                      textDecoration="underline"
                      _hover={{ color: "green.600" }}
                    >
                      Terms and Conditions
                    </Button>
                    {' '}and{' '}
                    <Button 
                      variant="link" 
                      colorScheme="green" 
                      size="sm" 
                      p={0} 
                      h="auto" 
                      fontWeight="700"
                      textDecoration="underline"
                      _hover={{ color: "green.600" }}
                    >
                      Privacy Policy
                    </Button>
                  </Text>
                </Box>
              </HStack>

              <HStack spacing={3} align="start">
                <Checkbox
                  isChecked={step2.marketingOptIn || false}
                  onChange={(e) => updateFormData('step2', { marketingOptIn: e.target.checked })}
                  size="md"
                  colorScheme="blue"
                  mt={1}
                />
                <Text fontSize="sm" fontWeight="500" color="gray.700" lineHeight="1.5">
                  I would like to receive special offers and updates via email (optional)
                </Text>
              </HStack>
            </VStack>

            {/* Stripe Payment Button */}
            {!paymentSuccess ? (
              <StripePaymentButton
                amount={formData.step1.pricing.total}
                bookingData={{
                  customer: {
                    name: `${step2.customerDetails.firstName || ''} ${step2.customerDetails.lastName || ''}`.trim(),
                    email: step2.customerDetails.email || '',
                    phone: step2.customerDetails.phone || '',
                  },
                  pickupAddress: formData.step1.pickupAddress,
                  dropoffAddress: formData.step1.dropoffAddress,
                  items: formData.step1.items,
                  pricing: formData.step1.pricing,
                  serviceType: formData.step1.serviceType,
                  scheduledDate: formData.step1.pickupDate,
                  scheduledTime: formData.step1.pickupTimeSlot,
                  pickupDetails: formData.step1.pickupProperty,
                  dropoffDetails: formData.step1.dropoffProperty,
                  bookingId: step2.bookingId, // Pass the booking ID
                }}
                onSuccess={(sessionId, paymentIntentId) => {
                  updatePaymentStatus('success');
                  updateFormData('step2', {
                    paymentMethod: {
                      type: 'stripe',
                      stripeDetails: {
                        sessionId,
                        paymentIntentId,
                      },
                    },
                  });
                }}
                onError={(error) => {
                  console.error('❌ Payment failed:', error);
                  updatePaymentStatus('failed');
                }}
                disabled={
                  !step2.termsAccepted || 
                  !step2.privacyAccepted || 
                  !step2.customerDetails.firstName ||
                  !step2.customerDetails.lastName ||
                  !step2.customerDetails.email ||
                  !formData.step1.pricing.total ||
                  formData.step1.pricing.total <= 0
                }
              />
            ) : (
              <Alert status="success" borderRadius="xl" p={4}>
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="lg">🎉 Payment Successful!</AlertTitle>
                  <AlertDescription fontSize="md">
                    Your payment has been processed successfully. You will be redirected to the confirmation page.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </VStack>
        </VStack>
      </Card>

      {/* 3. Booking Summary - Enhanced */}
      <Card 
        p={{ base: 4, md: 6 }} 
        shadow="xl" 
        borderWidth="1px" 
        borderColor="blue.200"
        bg="white"
        _hover={{ shadow: "2xl", transform: "translateY(-2px)" }}
        transition="all 0.3s ease"
        borderRadius="xl"
      >
        <VStack spacing={6} align="stretch">
          <HStack spacing={3} align="center" mb={2}>
            <Circle size="40px" bg="blue.100" color="blue.600">
              <Icon as={FaBolt} fontSize="20px" />
            </Circle>
            <Box>
              <Heading size={{ base: "sm", md: "md" }} color="blue.800" mb={1}>
                📋 Booking Summary
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Review your order details before payment
              </Text>
            </Box>
          </HStack>

          {formData.step1.pricing.total > 0 ? (
            <VStack spacing={4} align="stretch">
              {/* Order Details */}
              <Box p={4} bg="blue.50" borderRadius="lg" borderWidth="1px" borderColor="blue.200">
                <VStack spacing={3} align="stretch">
                  <Text fontSize="sm" fontWeight="600" color="blue.800">
                    Order Details
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <VStack spacing={1} align="start">
                      <Text fontSize="xs" color="gray.600">Items:</Text>
                      <Text fontSize="sm" fontWeight="600">{formData.step1.items.length} items</Text>
                    </VStack>
                    <VStack spacing={1} align="start">
                      <Text fontSize="xs" color="gray.600">Distance:</Text>
                      <Text fontSize="sm" fontWeight="600">{formData.step1.distance} miles</Text>
                    </VStack>
                    <VStack spacing={1} align="start">
                      <Text fontSize="xs" color="gray.600">Service:</Text>
                      <Text fontSize="sm" fontWeight="600" textTransform="capitalize">{formData.step1.serviceType}</Text>
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </Box>
              
              {/* Total Amount */}
              <Box p={4} bg="green.50" borderRadius="lg" borderWidth="1px" borderColor="green.200">
                <HStack justify="space-between" fontWeight="bold" fontSize="lg">
                  <Text color="green.800">Total Amount:</Text>
                  <Text color="green.600" fontSize="2xl">£{formData.step1.pricing.total.toFixed(2)}</Text>
                </HStack>
                <Text fontSize="sm" color="green.700" textAlign="center" mt={2}>
                  Including VAT (£{formData.step1.pricing.vat.toFixed(2)})
                </Text>
              </Box>
            </VStack>
          ) : (
            <Box p={6} bg="orange.50" borderRadius="lg" borderWidth="1px" borderColor="orange.200">
              <VStack spacing={4} align="center">
                <Circle size="48px" bg="orange.100" color="orange.600">
                  <Icon as={FaBolt} fontSize="24px" />
                </Circle>
                <VStack spacing={2} align="center">
                  <Text color="orange.700" fontWeight="600" fontSize="lg">
                    ⚠️ Pricing not calculated yet
                  </Text>
                  <Text fontSize="sm" color="orange.600" textAlign="center">
                    Please complete Step 1 to see pricing details.
                  </Text>
                </VStack>
                <Button
                  size="md"
                  colorScheme="orange"
                  variant="outline"
                  onClick={() => window.history.back()}
                  leftIcon={<Icon as={FaBolt} />}
                >
                  Go Back to Step 1
                </Button>
              </VStack>
            </Box>
          )}
        </VStack>
      </Card>

    </VStack>
  );
}
