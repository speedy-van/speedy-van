'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  VStack, 
  HStack, 
  Heading, 
  Text, 
  Button, 
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { FaTimesCircle, FaHome, FaArrowLeft, FaCreditCard } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function BookingCancelPage() {
  const router = useRouter();

  const goToHome = () => {
    router.push('/');
  };

  const goBackToBooking = () => {
    router.push('/booking');
  };

  const retryPayment = () => {
    router.push('/booking');
  };

  return (
    <Box minH="100vh" bg="red.50" py={8}>
      <Container maxW="2xl">
        <VStack spacing={8} align="stretch">
          {/* Cancel Header */}
          <Box textAlign="center">
            <Icon as={FaTimesCircle} boxSize={24} color="red.500" mb={6} />
            <Heading size="2xl" color="red.600" mb={4}>
              Payment Cancelled
            </Heading>
            <Text fontSize="xl" color="gray.600" mb={6}>
              Your payment was not completed
            </Text>
          </Box>

          {/* What Happened */}
          <Box p={6} bg="white" borderRadius="lg" shadow="sm">
            <Heading size="lg" color="gray.700" mb={4}>
              What Happened?
            </Heading>
            <VStack align="start" spacing={3}>
              <Text>• You cancelled the payment process in Stripe</Text>
              <Text>• No charges were made to your account</Text>
              <Text>• Your booking is not confirmed yet</Text>
              <Text>• You can try the payment again</Text>
            </VStack>
          </Box>

          {/* Important Notice */}
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>No Charges Made</AlertTitle>
              <AlertDescription>
                Since the payment was cancelled, no money has been taken from your account. 
                Your booking details are still saved and you can complete the payment when you're ready.
              </AlertDescription>
            </Box>
          </Alert>

          {/* Next Steps */}
          <Box p={6} bg="white" borderRadius="lg" shadow="sm">
            <Heading size="lg" color="gray.700" mb={4}>
              What Would You Like to Do?
            </Heading>
            <VStack align="start" spacing={3}>
              <Text>• <strong>Try Again:</strong> Complete the payment process</Text>
              <Text>• <strong>Modify Booking:</strong> Change your booking details</Text>
              <Text>• <strong>Contact Support:</strong> Get help with payment issues</Text>
              <Text>• <strong>Start Over:</strong> Begin a new booking</Text>
            </VStack>
          </Box>

          {/* Action Buttons */}
          <VStack spacing={4}>
            <Button
              onClick={retryPayment}
              variant="primary"
              size="lg"
              leftIcon={<FaCreditCard />}
              w="full"
            >
              Try Payment Again
            </Button>
            
            <Button
              onClick={goBackToBooking}
              variant="primary"
              size="lg"
              leftIcon={<FaArrowLeft />}
              w="full"
            >
              Return to Booking
            </Button>
            
            <Button
              onClick={goToHome}
              variant="ghost"
              size="lg"
              leftIcon={<FaHome />}
              w="full"
            >
              Return to Home
            </Button>
          </VStack>

          {/* Help Section */}
          <Box p={6} bg="gray.50" borderRadius="lg">
            <Heading size="md" color="gray.700" mb={4}>
              Need Help?
            </Heading>
            <VStack align="start" spacing={3}>
              <Text fontSize="sm" color="gray.600">
                If you're experiencing payment issues, our support team is here to help:
              </Text>
              <Text fontSize="sm" color="gray.600">
                • Email: support@speedyvan.co.uk
              </Text>
              <Text fontSize="sm" color="gray.600">
                • Phone: 0800 123 4567
              </Text>
              <Text fontSize="sm" color="gray.600">
                • Available 24/7 for assistance
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
