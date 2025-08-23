'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  VStack, 
  HStack, 
  Heading, 
  Text, 
  Button, 
  Input, 
  FormControl, 
  FormLabel, 
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Badge,
  Icon
} from '@chakra-ui/react';
import { FaStripe, FaCreditCard, FaLock, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { useSearchParams, useRouter } from 'next/navigation';

export default function MockStripeCheckoutPage() {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const amount = searchParams.get('amount');
  const bookingId = searchParams.get('bookingId');

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(parseFloat(amount));
  };

  const handlePayment = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      toast({
        title: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate successful payment
      setIsSuccess(true);
      
      toast({
        title: 'Payment Successful!',
        description: 'Your payment has been processed successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirect to success page after 2 seconds
      setTimeout(() => {
        router.push(`/booking/success?amount=${amount}&bookingId=${bookingId}`);
      }, 2000);

    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: 'There was an issue processing your payment. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  if (isSuccess) {
    return (
      <Box minH="100vh" bg="green.50" py={8}>
        <Container maxW="md">
          <VStack spacing={6} textAlign="center">
            <Icon as={FaCheckCircle} boxSize={20} color="green.500" />
            <Heading size="xl" color="green.600">
              Payment Successful!
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Your payment of {formatCurrency(amount || '0')} has been processed.
            </Text>
            <Text fontSize="sm" color="gray.500">
              Redirecting to confirmation page...
            </Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="md">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <HStack justify="center" spacing={3} mb={4}>
              <Icon as={FaStripe} boxSize={8} color="blue.500" />
              <Heading size="xl" color="blue.600">
                Stripe Checkout
              </Heading>
            </HStack>
            <Text fontSize="lg" color="gray.600">
              Complete your payment securely
            </Text>
          </Box>

          {/* Payment Amount */}
          <Box p={4} bg="white" borderRadius="lg" shadow="sm" border="1px" borderColor="blue.200">
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="semibold">
                Total Amount
              </Text>
              <Badge colorScheme="green" fontSize="lg" p={2}>
                {formatCurrency(amount || '0')}
              </Badge>
            </HStack>
            {bookingId && (
              <Text fontSize="sm" color="gray.600" mt={2}>
                Booking ID: {bookingId}
              </Text>
            )}
          </Box>

          {/* Payment Form */}
          <Box p={6} bg="white" borderRadius="lg" shadow="sm">
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Card Number</FormLabel>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  size="lg"
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Expiry Date</FormLabel>
                  <Input
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    size="lg"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>CVV</FormLabel>
                  <Input
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    size="lg"
                    maxLength={4}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Cardholder Name</FormLabel>
                <Input
                  placeholder="John Doe"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  size="lg"
                />
              </FormControl>
            </VStack>
          </Box>

          {/* Security Notice */}
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Secure Payment</AlertTitle>
              <AlertDescription>
                Your payment information is encrypted and secure. This is a demo page simulating Stripe Checkout.
              </AlertDescription>
            </Box>
          </Alert>

          {/* Action Buttons */}
          <VStack spacing={4}>
            <Button
              onClick={handlePayment}
              colorScheme="blue"
              size="lg"
              leftIcon={<FaLock />}
              rightIcon={<FaStripe />}
              isLoading={isProcessing}
              loadingText="Processing Payment..."
              w="full"
              h="60px"
              fontSize="lg"
              fontWeight="bold"
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              _hover={{
                bg: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                transform: "translateY(-2px)",
                boxShadow: "lg"
              }}
              _active={{
                transform: "translateY(0)"
              }}
              transition="all 0.2s"
            >
              {isProcessing ? 'Processing...' : `Pay ${formatCurrency(amount || '0')}`}
            </Button>

            <Button
              onClick={goBack}
              variant="outline"
              size="lg"
              leftIcon={<FaArrowLeft />}
              w="full"
            >
              Cancel Payment
            </Button>
          </VStack>

          {/* Demo Notice */}
          <Box p={4} bg="yellow.50" borderRadius="md" border="1px" borderColor="yellow.200">
            <Text fontSize="sm" color="yellow.800" textAlign="center">
              <strong>Demo Mode:</strong> This is a mock Stripe checkout page for testing purposes. 
              In production, this would redirect to the actual Stripe Checkout.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
