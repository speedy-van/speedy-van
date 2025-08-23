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
  Checkbox
} from '@chakra-ui/react';
import { FaCreditCard, FaArrowRight, FaArrowLeft, FaLock, FaShieldAlt, FaStripe, FaExclamationTriangle } from 'react-icons/fa';
import PricingDisplay from './PricingDisplay';
import StripePaymentButton from './StripePaymentButton';

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
  onBack 
}: PaymentStepProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  // Use the calculated total from booking data
  const totalAmount = bookingData.calculatedTotal || 0;

  // Debug logging for stored price
  useEffect(() => {
    console.log('PaymentStep - bookingData.calculatedTotal:', bookingData.calculatedTotal);
    console.log('PaymentStep - totalAmount:', totalAmount);
  }, [bookingData.calculatedTotal, totalAmount]);

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // Payment error is already handled by StripePaymentButton
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const getSelectedPaymentMethod = () => {
    return {
      label: 'Stripe Payment',
      description: 'Secure payment via Stripe'
    };
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="blue.600">
            Step 8: Secure Payment
          </Text>
          <Text fontSize="sm" color="gray.600" mt={2}>
            Complete your booking with secure payment
          </Text>
        </Box>

        {/* Payment Amount */}
        <Box p={4} borderWidth="1px" borderRadius="md" bg="green.50">
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              Total Amount to Pay
            </Text>
            <Badge colorScheme="green" fontSize="lg" p={2}>
              {formatCurrency(totalAmount)}
            </Badge>
          </HStack>
        </Box>

        {/* Stripe Payment Method */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Payment Method
          </Text>
          
          <Box
            p={4}
            borderWidth="2px"
            borderRadius="md"
            borderColor="blue.500"
            bg="blue.50"
          >
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={1}>
                <HStack>
                  <Icon as={FaStripe} color="blue.500" boxSize={6} />
                  <Text fontWeight="semibold">Stripe Payment</Text>
                  <Badge colorScheme="green" size="sm">Selected</Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600" ml={8}>
                  Secure payment via Stripe - Accepts all major credit cards
                </Text>
              </VStack>
              <Badge colorScheme="blue" variant="outline">
                Instant
              </Badge>
            </HStack>
          </Box>
        </Box>

        {/* Stripe Security Notice */}
        <Alert status="info">
          <AlertIcon as={FaShieldAlt} />
          <Box>
            <AlertTitle>Secure Stripe Payment</AlertTitle>
            <AlertDescription>
              All payments are processed securely via Stripe using industry-standard encryption. Your payment information is never stored on our servers and is handled directly by Stripe's secure payment system.
            </AlertDescription>
          </Box>
        </Alert>

        {/* Terms and Conditions */}
        <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
          <VStack align="start" spacing={3}>
            <Text fontSize="lg" fontWeight="semibold">
              Terms & Conditions
            </Text>
            
            <VStack align="start" spacing={2} fontSize="sm" color="gray.700">
              <Text>• By proceeding, you agree to our terms of service and privacy policy</Text>
              <Text>• Payment will be processed immediately upon confirmation</Text>
              <Text>• Cancellation policy: Free cancellation up to 24 hours before your move</Text>
              <Text>• Insurance coverage is included for all moves</Text>
              <Text>• Our team will contact you within 2 hours to confirm details</Text>
            </VStack>

            <FormControl>
              <Checkbox
                isChecked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                size="lg"
              >
                I accept the terms and conditions
              </Checkbox>
            </FormControl>
          </VStack>
        </Box>

        {/* Booking Summary */}
        <Box p={4} borderWidth="1px" borderRadius="md" bg="blue.50">
          <Text fontSize="lg" fontWeight="semibold" mb={3}>
            Booking Summary
          </Text>
          <VStack align="start" spacing={2}>
            <HStack>
              <Text fontWeight="medium">Move Date:</Text>
              <Text>{bookingData.date ? new Date(bookingData.date).toLocaleDateString('en-GB') : 'Not set'}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="medium">Crew Size:</Text>
              <Text>{bookingData.crewSize} person{bookingData.crewSize !== 1 ? 's' : ''}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="medium">Items:</Text>
              <Text>{bookingData.items?.length || 0} item{bookingData.items?.length !== 1 ? 's' : ''}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="medium">Payment Method:</Text>
              <Text>{getSelectedPaymentMethod()?.label}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="medium">Total Amount:</Text>
              <Text fontWeight="bold" color="green.600">
                {formatCurrency(totalAmount)}
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* Payment Validation Warning */}
        {(!totalAmount || totalAmount <= 0) && (
          <Alert status="warning">
            <AlertIcon as={FaExclamationTriangle} />
            <AlertTitle>Invalid Total Amount</AlertTitle>
            <AlertDescription>
              The total amount is £{formatCurrency(totalAmount)}. Please ensure you have completed the pricing step before proceeding to payment.
            </AlertDescription>
          </Alert>
        )}

        {/* Stripe Payment Button */}
        {acceptedTerms && totalAmount > 0 ? (
          <StripePaymentButton
            amount={totalAmount}
            onSuccess={() => {}} // Not needed as we redirect to Stripe
            onError={handlePaymentError}
            isDisabled={!acceptedTerms}
          />
        ) : (
          <Button
            isDisabled={true}
            size="lg"
            variant="ghost"
            leftIcon={<FaExclamationTriangle />}
          >
            {!acceptedTerms ? 'Accept Terms to Continue' : 'Invalid Total Amount'}
          </Button>
        )}

        {/* Navigation Buttons */}
        <HStack spacing={4} justify="space-between" pt={4}>
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            leftIcon={<FaArrowLeft />}
          >
            Back
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
