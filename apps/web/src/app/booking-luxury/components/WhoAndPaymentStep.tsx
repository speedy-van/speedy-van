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
    console.log('Card number updated:', formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    // Store expiry in local state or remove this functionality
    console.log('Expiry updated:', formatted);
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
    <VStack spacing={8} align="stretch">
      {/* Clean Step Header */}
      <Box textAlign="center" mb={6}>
        <Heading size="xl" mb={3} bgGradient="linear(to-r, green.600, blue.600)" bgClip="text">
          Enter Your Details & Pay Securely
        </Heading>
        <Text color="gray.600" fontSize="lg">
          Complete your booking with secure payment
        </Text>
      </Box>

      {/* 1. Customer Information - Simplified */}
      <Card bg="blue.50" borderColor="blue.200" borderWidth="2px" borderRadius="2xl" p={6} shadow="lg">
        <VStack spacing={6} align="stretch">
          <HStack spacing={3} align="center">
            <Circle size="50px" bg="blue.500" color="white">
              <Icon as={FaUser} boxSize={6} />
            </Circle>
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" fontSize="xl" color="blue.700">
                Customer Information
              </Text>
              <Text fontSize="md" color="blue.600" fontWeight="medium">
                Your contact details
              </Text>
            </VStack>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
                <Icon as={FaUser} mr={2} />
                First Name
              </FormLabel>
              <Input
                placeholder="Enter your first name"
                value={step2.customerDetails.firstName}
                onChange={(e) => updateCustomerDetails('firstName', e.target.value)}
                isInvalid={!!errors['customerDetails.firstName']}
                bg="white"
                borderColor="gray.300"
                _hover={{ borderColor: "blue.400" }}
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                size="md"
                borderRadius="lg"
                fontWeight="medium"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
                <Icon as={FaUser} mr={2} />
                Last Name
              </FormLabel>
              <Input
                placeholder="Enter your last name"
                value={step2.customerDetails.lastName}
                onChange={(e) => updateCustomerDetails('lastName', e.target.value)}
                isInvalid={!!errors['customerDetails.lastName']}
                bg="white"
                borderColor="gray.300"
                _hover={{ borderColor: "blue.400" }}
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                size="md"
                borderRadius="lg"
                fontWeight="medium"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
                <Icon as={FaEnvelope} mr={2} />
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
                _hover={{ borderColor: "blue.400" }}
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                size="md"
                borderRadius="lg"
                fontWeight="medium"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
                <Icon as={FaPhone} mr={2} />
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
                _hover={{ borderColor: "blue.400" }}
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                size="md"
                borderRadius="lg"
                fontWeight="medium"
              />
            </FormControl>
          </SimpleGrid>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
              <Icon as={FaBuilding} mr={2} />
              Company Name (Optional)
            </FormLabel>
            <Input
              placeholder="Enter your company name (if applicable)"
              value={step2.customerDetails.company || ''}
              onChange={(e) => updateCustomerDetails('company', e.target.value)}
              bg="white"
              borderColor="gray.300"
              _hover={{ borderColor: "blue.400" }}
              _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
              size="md"
              borderRadius="lg"
              fontWeight="medium"
            />
          </FormControl>
        </VStack>
      </Card>

      {/* 2. Payment Method - Simplified */}
      <Card bg="green.50" borderColor="green.200" borderWidth="2px" borderRadius="2xl" p={6} shadow="lg">
        <VStack spacing={6} align="stretch">
          <HStack spacing={3} align="center">
            <Circle size="50px" bg="green.500" color="white">
              <Icon as={FaCreditCard} boxSize={6} />
            </Circle>
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" fontSize="xl" color="green.700">
                Payment Method
              </Text>
              <Text fontSize="md" color="green.600" fontWeight="medium">
                Secure payment via Stripe
              </Text>
            </VStack>
          </HStack>

          {/* Stripe Payment Card */}
          <Card bg="white" borderRadius="xl" p={4} border="2px solid" borderColor="green.200">
            <VStack spacing={4} align="stretch">
              <HStack spacing={3} align="center" justify="center">
                <Circle size="40px" bg="green.500" color="white">
                  <Icon as={FaShieldAlt} boxSize={5} />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" color="green.700" fontSize="lg">
                    Credit/Debit Card
                  </Text>
                  <Text fontSize="sm" color="green.600">
                    Visa, Mastercard, American Express, Apple Pay, Google Pay
                  </Text>
                </VStack>
                <Badge colorScheme="green" size="lg" px={3} py={1}>
                  <Icon as={FaShieldAlt} mr={1} /> Secure
                </Badge>
              </HStack>
            </VStack>
          </Card>

          {/* Terms & Payment Button - Combined */}
          <Card bg="white" borderRadius="xl" p={4} border="2px solid" borderColor="gray.200">
            <VStack spacing={4} align="stretch">
              {/* Terms & Conditions */}
              <VStack spacing={3} align="stretch">
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
                >
                  <Text fontSize="sm" fontWeight="medium">
                    I accept the{' '}
                    <Button variant="link" colorScheme="blue" size="sm" p={0} h="auto" fontWeight="bold">
                      Terms and Conditions
                    </Button>
                    {' '}and{' '}
                    <Button variant="link" colorScheme="blue" size="sm" p={0} h="auto" fontWeight="bold">
                      Privacy Policy
                    </Button>
                  </Text>
                </Checkbox>

                <Checkbox
                  isChecked={step2.marketingOptIn || false}
                  onChange={(e) => updateFormData('step2', { marketingOptIn: e.target.checked })}
                  size="lg"
                  colorScheme="blue"
                >
                  <Text fontSize="sm" fontWeight="medium">
                    I would like to receive special offers and updates via email (optional)
                  </Text>
                </Checkbox>
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
                    console.log('✅ Payment successful:', { sessionId, paymentIntentId });
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
          </Card>

        </VStack>
      </Card>

      {/* 3. Booking Summary - Final */}
      <Card bg="gray.50" borderColor="gray.200" borderWidth="2px" borderRadius="2xl" p={6} shadow="lg">
        <VStack spacing={6} align="stretch">
          <HStack spacing={3} align="center">
            <Circle size="50px" bg="gray.500" color="white">
              <Icon as={FaBolt} boxSize={6} />
            </Circle>
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" fontSize="xl" color="gray.700">
                Booking Summary
              </Text>
              <Text fontSize="md" color="gray.600" fontWeight="medium">
                Review your order details
              </Text>
            </VStack>
          </HStack>

          {formData.step1.pricing.total > 0 ? (
            <VStack spacing={4} align="stretch">
              {/* Order Details */}
              <Card bg="white" borderRadius="xl" p={4} border="1px solid" borderColor="gray.200">
                <VStack spacing={3} align="stretch">
                  <Text fontSize="sm" fontWeight="bold" color="gray.700">
                    Order Details
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <VStack spacing={1} align="start">
                      <Text fontSize="xs" color="gray.600">Items:</Text>
                      <Text fontSize="sm" fontWeight="medium">{formData.step1.items.length} items</Text>
                    </VStack>
                    <VStack spacing={1} align="start">
                      <Text fontSize="xs" color="gray.600">Distance:</Text>
                      <Text fontSize="sm" fontWeight="medium">{formData.step1.distance} miles</Text>
                    </VStack>
                    <VStack spacing={1} align="start">
                      <Text fontSize="xs" color="gray.600">Service:</Text>
                      <Text fontSize="sm" fontWeight="medium" textTransform="capitalize">{formData.step1.serviceType}</Text>
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </Card>
              
              {/* Total Amount */}
              <Card bg="green.100" borderRadius="xl" p={4} border="2px solid" borderColor="green.300">
                <HStack justify="space-between" fontWeight="bold" fontSize="lg">
                  <Text color="green.800">Total Amount:</Text>
                  <Text color="green.600" fontSize="2xl">£{formData.step1.pricing.total.toFixed(2)}</Text>
                </HStack>
                <Text fontSize="sm" color="green.700" textAlign="center" mt={2}>
                  Including VAT (£{formData.step1.pricing.vat.toFixed(2)})
                </Text>
              </Card>
            </VStack>
          ) : (
            <Card bg="orange.50" borderRadius="xl" p={6} border="2px solid" borderColor="orange.200">
              <VStack spacing={4} align="center">
                <Circle size="60px" bg="orange.500" color="white">
                  <Icon as={FaBolt} boxSize={8} />
                </Circle>
                <VStack spacing={2} align="center">
                  <Text color="orange.600" fontWeight="bold" fontSize="lg">
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
            </Card>
          )}
        </VStack>
      </Card>

    </VStack>
  );
}
