'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  SimpleGrid,
  Badge,
  useToast,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Checkbox,
  Textarea,
  Select,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useUnifiedBooking } from '@/lib/unified-booking-context';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCreditCard,
  FaShieldAlt,
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaInfoCircle,
  FaLock,
} from 'react-icons/fa';

const MotionBox = motion.create(Box);

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  secure: boolean;
  popular?: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Pay securely with your card',
    icon: FaCreditCard,
    secure: true,
    popular: true,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pay with your PayPal account',
    icon: FaShieldAlt,
    secure: true,
  },
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    description: 'Direct bank transfer',
    icon: FaShieldAlt,
    secure: true,
  },
  {
    id: 'cash',
    name: 'Cash on Delivery',
    description: 'Pay when the service is completed',
    icon: FaCheckCircle,
    secure: false,
  },
];

export default function WhoAndPaymentStep() {
  const { form, nextStep, prevStep, trackIncompleteBooking } =
    useUnifiedBooking();

  const [customerDetails, setCustomerDetails] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [cardDetails, setCardDetails] = useState<{
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  }>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  // Initialize with existing data from form
  useEffect(() => {
    const formData = form.getValues();
    if (formData.customerDetails) setCustomerDetails(formData.customerDetails);
    if (formData.paymentMethod) setPaymentMethod(formData.paymentMethod);
    if (formData.cardDetails) setCardDetails({
      cardNumber: formData.cardDetails.cardNumber || '',
      expiryDate: formData.cardDetails.expiryDate || '',
      cvv: formData.cardDetails.cvv || '',
      cardholderName: formData.cardDetails.cardholderName || '',
    });
    if (formData.termsAccepted) setTermsAccepted(formData.termsAccepted);
    if (formData.marketingConsent)
      setMarketingConsent(formData.marketingConsent);
    if (formData.specialInstructions)
      setSpecialInstructions(formData.specialInstructions);
  }, [form]);

  // Track incomplete booking when user leaves step 2
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentData = form.getValues();
      if (currentData.customerDetails?.firstName || currentData.paymentMethod) {
        trackIncompleteBooking(
          2,
          'User left step 2 with customer/payment data'
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form, trackIncompleteBooking]);

  // Track when user reaches step 2 (booking started)
  useEffect(() => {
    const currentSessionId = (window as any).currentSessionId;
    if (currentSessionId) {
      const existingVisitors = JSON.parse(
        localStorage.getItem('admin-visitor-analytics') || '[]'
      );
      const visitorIndex = existingVisitors.findIndex(
        (v: any) => v.sessionId === currentSessionId
      );

      if (visitorIndex !== -1) {
        existingVisitors[visitorIndex] = {
          ...existingVisitors[visitorIndex],
          bookingStarted: true,
        };

        localStorage.setItem(
          'admin-visitor-analytics',
          JSON.stringify(existingVisitors)
        );
      }
    }
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Customer details validation
    if (!customerDetails.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!customerDetails.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!customerDetails.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!customerDetails.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    // Payment method validation
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }

    // Card details validation (if card payment selected)
    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (cardDetails.cardNumber.replace(/\s/g, '').length < 13) {
        newErrors.cardNumber = 'Please enter a valid card number';
      }
      if (!cardDetails.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      }
      if (!cardDetails.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      } else if (cardDetails.cvv.length < 3) {
        newErrors.cvv = 'Please enter a valid CVV';
      }
      if (!cardDetails.cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name is required';
      }
    }

    // Terms acceptance validation
    if (!termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateForm()) {
      // Update form data
      form.setValue('customerDetails', customerDetails);
      form.setValue('paymentMethod', paymentMethod);
      form.setValue(
        'cardDetails',
        paymentMethod === 'card' ? cardDetails : undefined
      );
      form.setValue('termsAccepted', termsAccepted);
      form.setValue('marketingConsent', marketingConsent);
      form.setValue('specialInstructions', specialInstructions);

      // Try to move to next step
      const success = await nextStep();

      if (success) {
        toast({
          title: 'Step completed!',
          description: 'Moving to confirmation...',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Validation failed',
          description: 'Please check the form and try again',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: 'Please complete all required fields',
        description: 'Check the highlighted fields below',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCustomerDetailChange = (field: string, value: string) => {
    setCustomerDetails(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCardDetailChange = (field: string, value: string) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
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

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const getSelectedPaymentMethod = () => {
    return PAYMENT_METHODS.find(method => method.id === paymentMethod);
  };

  const selectedPaymentMethod = getSelectedPaymentMethod();

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      w="full"
    >
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <VStack spacing={3} align="center" textAlign="center">
          <Heading size="lg" color="text.primary">
            Who & Payment
          </Heading>
          <Text color="text.secondary" fontSize="lg">
            Enter your details and choose payment method
          </Text>
        </VStack>

        {/* Customer Details */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <HStack>
                <Icon as={FaUser} color="blue.500" boxSize={5} />
                <Heading size="md">Customer Details</Heading>
              </HStack>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isInvalid={!!errors.firstName}>
                  <FormLabel>First Name *</FormLabel>
                  <Input
                    value={customerDetails.firstName}
                    onChange={e =>
                      handleCustomerDetailChange('firstName', e.target.value)
                    }
                    placeholder="Enter your first name"
                    size="lg"
                  />
                  <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.lastName}>
                  <FormLabel>Last Name *</FormLabel>
                  <Input
                    value={customerDetails.lastName}
                    onChange={e =>
                      handleCustomerDetailChange('lastName', e.target.value)
                    }
                    placeholder="Enter your last name"
                    size="lg"
                  />
                  <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email Address *</FormLabel>
                  <Input
                    value={customerDetails.email}
                    onChange={e =>
                      handleCustomerDetailChange('email', e.target.value)
                    }
                    placeholder="Enter your email address"
                    type="email"
                    size="lg"
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.phone}>
                  <FormLabel>Phone Number *</FormLabel>
                  <Input
                    value={customerDetails.phone}
                    onChange={e =>
                      handleCustomerDetailChange('phone', e.target.value)
                    }
                    placeholder="Enter your phone number"
                    type="tel"
                    size="lg"
                  />
                  <FormErrorMessage>{errors.phone}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Company Name (Optional)</FormLabel>
                <Input
                  value={customerDetails.company}
                  onChange={e =>
                    handleCustomerDetailChange('company', e.target.value)
                  }
                  placeholder="Enter company name if applicable"
                  size="lg"
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Payment Method Selection */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <HStack>
                <Icon as={FaCreditCard} color="green.500" boxSize={5} />
                <Heading size="md">Payment Method</Heading>
              </HStack>

              <FormControl isInvalid={!!errors.paymentMethod}>
                <FormLabel>Select Payment Method *</FormLabel>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {PAYMENT_METHODS.map(method => (
                    <Card
                      key={method.id}
                      variant={
                        paymentMethod === method.id ? 'filled' : 'outline'
                      }
                      borderColor={
                        paymentMethod === method.id
                          ? 'green.500'
                          : 'border.primary'
                      }
                      bg={
                        paymentMethod === method.id ? 'green.50' : 'transparent'
                      }
                      cursor="pointer"
                      onClick={() => setPaymentMethod(method.id)}
                      _hover={{
                        borderColor: 'green.300',
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between">
                            <HStack>
                              <Icon
                                as={method.icon}
                                color="green.500"
                                boxSize={5}
                              />
                              <VStack align="start" spacing={1}>
                                <Heading size="sm">{method.name}</Heading>
                                <Text fontSize="sm" color="text.secondary">
                                  {method.description}
                                </Text>
                              </VStack>
                            </HStack>
                            {method.popular && (
                              <Badge colorScheme="green" variant="solid">
                                Popular
                              </Badge>
                            )}
                          </HStack>

                          <HStack spacing={2}>
                            <Icon
                              as={FaShieldAlt}
                              color="green.500"
                              boxSize={3}
                            />
                            <Text fontSize="sm" color="green.600">
                              {method.secure
                                ? 'Secure Payment'
                                : 'Standard Payment'}
                            </Text>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
                <FormErrorMessage>{errors.paymentMethod}</FormErrorMessage>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Card Details (if card payment selected) */}
        {paymentMethod === 'card' && (
          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <HStack>
                  <Icon as={FaCreditCard} color="blue.500" boxSize={5} />
                  <Heading size="md">Card Details</Heading>
                </HStack>

                <FormControl isInvalid={!!errors.cardholderName}>
                  <FormLabel>Cardholder Name *</FormLabel>
                  <Input
                    value={cardDetails.cardholderName}
                    onChange={e =>
                      handleCardDetailChange('cardholderName', e.target.value)
                    }
                    placeholder="Name on card"
                    size="lg"
                  />
                  <FormErrorMessage>{errors.cardholderName}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.cardNumber}>
                  <FormLabel>Card Number *</FormLabel>
                  <Input
                    value={cardDetails.cardNumber}
                    onChange={e =>
                      handleCardDetailChange(
                        'cardNumber',
                        formatCardNumber(e.target.value)
                      )
                    }
                    placeholder="1234 5678 9012 3456"
                    size="lg"
                    maxLength={19}
                  />
                  <FormErrorMessage>{errors.cardNumber}</FormErrorMessage>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isInvalid={!!errors.expiryDate}>
                    <FormLabel>Expiry Date *</FormLabel>
                    <Input
                      value={cardDetails.expiryDate}
                      onChange={e =>
                        handleCardDetailChange(
                          'expiryDate',
                          formatExpiryDate(e.target.value)
                        )
                      }
                      placeholder="MM/YY"
                      size="lg"
                      maxLength={5}
                    />
                    <FormErrorMessage>{errors.expiryDate}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.cvv}>
                    <FormLabel>CVV *</FormLabel>
                    <Input
                      value={cardDetails.cvv}
                      onChange={e =>
                        handleCardDetailChange('cvv', e.target.value)
                      }
                      placeholder="123"
                      size="lg"
                      maxLength={4}
                    />
                    <FormErrorMessage>{errors.cvv}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>

                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Secure Payment</AlertTitle>
                    <AlertDescription>
                      Your card details are encrypted and secure. We never store
                      your full card information.
                    </AlertDescription>
                  </Box>
                </Alert>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Special Instructions */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack>
                <Icon as={FaInfoCircle} color="orange.500" boxSize={5} />
                <Heading size="md">Special Instructions</Heading>
              </HStack>

              <FormControl>
                <FormLabel>Additional Notes (Optional)</FormLabel>
                <Textarea
                  value={specialInstructions}
                  onChange={e => setSpecialInstructions(e.target.value)}
                  placeholder="Any special instructions, access codes, or specific requirements for the move..."
                  size="lg"
                  rows={3}
                />
                <Text fontSize="sm" color="text.tertiary">
                  Let us know about any special access requirements, parking
                  instructions, or other details
                </Text>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Terms and Conditions */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.terms}>
                <HStack spacing={3}>
                  <Checkbox
                    isChecked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    colorScheme="blue"
                    size="lg"
                  />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">
                      I accept the{' '}
                      <Button variant="link" color="blue.500" size="sm">
                        Terms and Conditions
                      </Button>{' '}
                      and{' '}
                      <Button variant="link" color="blue.500" size="sm">
                        Privacy Policy
                      </Button>
                    </Text>
                    <Text fontSize="sm" color="text.tertiary">
                      You must accept these terms to continue with your booking
                    </Text>
                  </VStack>
                </HStack>
                <FormErrorMessage>{errors.terms}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <HStack spacing={3}>
                  <Checkbox
                    isChecked={marketingConsent}
                    onChange={e => setMarketingConsent(e.target.checked)}
                    colorScheme="blue"
                    size="lg"
                  />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">
                      I would like to receive updates about special offers and
                      services
                    </Text>
                    <Text fontSize="sm" color="text.tertiary">
                      You can unsubscribe at any time. This is optional.
                    </Text>
                  </VStack>
                </HStack>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Security Notice */}
        <Alert status="success">
          <AlertIcon />
          <Box>
            <AlertTitle>Secure & Protected</AlertTitle>
            <AlertDescription>
              Your information is protected with bank-level security. We use SSL
              encryption to keep your data safe.
            </AlertDescription>
          </Box>
        </Alert>

        {/* Navigation */}
        <HStack justify="space-between" pt={4}>
          <Button
            variant="outline"
            onClick={prevStep}
            size="lg"
            leftIcon={<FaArrowLeft />}
          >
            Back
          </Button>

          <Button
            colorScheme="blue"
            onClick={handleNext}
            size="lg"
            rightIcon={<FaArrowRight />}
            isDisabled={!termsAccepted}
          >
            Continue to Review
          </Button>
        </HStack>
      </VStack>
    </MotionBox>
  );
}
