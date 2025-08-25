'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Icon,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FaTimes, FaHome, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

export default function BookingCancelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationStatus, setCancellationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      handleOrderCancellation();
    } else {
      setCancellationStatus('error');
      setErrorMessage('No session ID provided');
    }
  }, [sessionId]);

  const handleOrderCancellation = async () => {
    if (!sessionId) return;

    try {
      setIsCancelling(true);
      setCancellationStatus('pending');

      const response = await fetch('/api/stripe/cancel-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          reason: 'Customer cancelled on Stripe page'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to cancel order');
      }

      const result = await response.json();
      setCancellationStatus('success');
      
      toast({
        title: 'Order Cancelled',
        description: 'Your order has been cancelled successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Error cancelling order:', error);
      setCancellationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to cancel order');
      
      toast({
        title: 'Error',
        description: 'Failed to cancel order. Please contact support.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  const renderContent = () => {
    switch (cancellationStatus) {
      case 'pending':
        return (
          <VStack spacing={6} textAlign="center">
            <Spinner size="xl" color="neon.500" />
            <Heading size="lg" color="neon.500">
              Cancelling Your Order
            </Heading>
            <Text color="gray.600" fontSize="md">
              Please wait while we process your cancellation...
            </Text>
          </VStack>
        );

      case 'success':
        return (
          <VStack spacing={6} textAlign="center">
            <Box
              w="80px"
              h="80px"
              borderRadius="full"
              bg="red.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FaTimes} boxSize={10} color="red.500" />
            </Box>
            
            <Heading size="lg" color="red.500">
              Order Cancelled
            </Heading>
            
            <Text color="gray.600" fontSize="md" lineHeight="1.6">
              Your order has been successfully cancelled. You will not be charged for this service.
            </Text>

            <Alert status="info" borderRadius="lg">
              <AlertIcon as={FaExclamationTriangle} />
              <Box>
                <AlertTitle fontSize="md">What happens next?</AlertTitle>
                <AlertDescription fontSize="sm">
                  • Your booking has been cancelled immediately<br/>
                  • No charges will be made to your account<br/>
                  • You can create a new booking anytime
                </AlertDescription>
              </Box>
            </Alert>

            <VStack spacing={4} width="full">
              <Button
                colorScheme="neon"
                size="lg"
                width="full"
                height="56px"
                onClick={handleGoHome}
                leftIcon={<FaHome />}
              >
                Go to Homepage
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                width="full"
                height="56px"
                onClick={handleGoBack}
                leftIcon={<FaArrowLeft />}
              >
                Go Back
              </Button>
            </VStack>
          </VStack>
        );

      case 'error':
        return (
          <VStack spacing={6} textAlign="center">
            <Box
              w="80px"
              h="80px"
              borderRadius="full"
              bg="orange.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FaExclamationTriangle} boxSize={10} color="orange.500" />
            </Box>
            
            <Heading size="lg" color="orange.500">
              Cancellation Error
            </Heading>
            
            <Text color="gray.600" fontSize="md" lineHeight="1.6">
              {errorMessage || 'An error occurred while cancelling your order.'}
            </Text>

            <Alert status="warning" borderRadius="lg">
              <AlertIcon as={FaExclamationTriangle} />
              <Box>
                <AlertTitle fontSize="md">Don't worry!</AlertTitle>
                <AlertDescription fontSize="sm">
                  Your order may still be active. Please contact our support team to confirm the status.
                </AlertDescription>
              </Box>
            </Alert>

            <VStack spacing={4} width="full">
              <Button
                colorScheme="neon"
                size="lg"
                width="full"
                height="56px"
                onClick={handleGoHome}
                leftIcon={<FaHome />}
              >
                Go to Homepage
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                width="full"
                height="56px"
                onClick={handleGoBack}
                leftIcon={<FaArrowLeft />}
              >
                Try Again
              </Button>
            </VStack>
          </VStack>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      p={{ base: 4, md: 8 }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        maxW="500px"
        w="full"
        bg="white"
        borderRadius="xl"
        p={{ base: 6, md: 8 }}
        boxShadow="lg"
        textAlign="center"
      >
        {renderContent()}
      </Box>
    </Box>
  );
}
