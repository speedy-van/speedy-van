'use client';

import React, { useState } from 'react';
import { 
  Button, 
  HStack, 
  Icon, 
  Text, 
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { SafeButton } from '@/components/common';
import { FaStripe, FaLock } from 'react-icons/fa';

interface StripePaymentButtonProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  isDisabled?: boolean;
}

export default function StripePaymentButton({ 
  amount, 
  onSuccess, 
  onError, 
  isDisabled = false 
}: StripePaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Create payment intent and get Stripe checkout URL
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          bookingData: {
            // Add any relevant booking data here
            amount,
            timestamp: new Date().toISOString(),
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      
      if (data.success && data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Invalid checkout URL received');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast({
        title: 'Payment Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  return (
    <>
      {/* Stripe Payment Button */}
      <SafeButton
        onClick={handlePayment}
        variant="primary"
        size="lg"
        leftIcon={<Icon as={FaStripe} />}
        rightIcon={<Icon as={FaLock} />}
        isLoading={isProcessing}
        loadingText="Processing Payment..."
        isDisabled={isDisabled || isProcessing}
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
        {isProcessing ? 'Processing...' : `Pay ${formatAmount(amount)} via Stripe`}
      </SafeButton>

      {/* Payment Info */}
      <HStack justify="center" spacing={2} fontSize="sm" color="gray.600">
        <Icon as={FaLock} color="green.500" />
        <Text>Secure payment powered by Stripe</Text>
      </HStack>

      {/* Stripe Features */}
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <AlertTitle>Stripe Payment Features:</AlertTitle>
        <AlertDescription>
          • Accepts all major credit/debit cards • 3D Secure authentication • 
          PCI DSS compliant • Real-time fraud detection • Instant payment processing
        </AlertDescription>
      </Alert>
    </>
  );
}
