'use client';

import { useState } from 'react';
import {
  Button,
  VStack,
  HStack,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Box,
  useToast,
} from '@chakra-ui/react';
import { FaCreditCard, FaLock, FaShieldAlt } from 'react-icons/fa';

interface CustomerData {
  name: string;
  email: string;
  phone: string;
}

interface AddressData {
  address?: string;
  city?: string;
  postcode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface ItemData {
  id: string;
  name: string;
  description: string;
  category: string;
  size: 'small' | 'medium' | 'large';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  weight: number;
  volume: number;
  image?: string;
}

interface PropertyDetails {
  type: 'house' | 'apartment' | 'office' | 'warehouse' | 'other';
  floors: number;
  hasLift: boolean;
  hasParking: boolean;
  accessNotes?: string;
  requiresPermit: boolean;
}

interface PricingData {
  baseFee: number;
  distanceFee: number;
  volumeFee: number;
  serviceFee: number;
  vat: number;
  total: number;
  distance: number;
}

interface BookingData {
  customer: CustomerData;
  pickupAddress: AddressData;
  dropoffAddress: AddressData;
  items: ItemData[];
  pricing: PricingData;
  serviceType: string;
  scheduledDate: string;
  scheduledTime?: string;
  pickupDetails: PropertyDetails;
  dropoffDetails: PropertyDetails;
  notes?: string;
  bookingId?: string;
}

interface StripePaymentButtonProps {
  amount: number;
  bookingData: BookingData;
  onSuccess: (sessionId: string, paymentIntentId?: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export default function StripePaymentButton({
  amount,
  bookingData,
  onSuccess,
  onError,
  disabled = false,
}: StripePaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const toast = useToast();

  const handlePayment = async () => {
    if (disabled || isProcessing) return;

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      console.log('🔄 Creating booking and Stripe checkout session...');
      
      // Validate required data
      if (!bookingData.customer.email || !bookingData.customer.name) {
        throw new Error('Customer email and name are required');
      }
      
      // Validate amount (must be in pounds with max 2 decimal places)
      if (!amount || amount <= 0) {
        throw new Error('Valid amount is required');
      }

      // Ensure amount has at most 2 decimal places
      const formattedAmount = Math.round(amount * 100) / 100;
      if (formattedAmount !== amount) {
        console.error('❌ Amount has more than 2 decimal places:', {
          original: amount,
          formatted: formattedAmount
        });
        throw new Error('Amount cannot have more than 2 decimal places');
      }

      let bookingId = bookingData.bookingId;

      // Create booking if it doesn't exist yet
      if (!bookingId) {
        console.log('📝 Creating booking before payment...');
        
        // Transform the data to match the API schema
        const bookingRequest = {
          customer: {
            name: bookingData.customer.name,
            email: bookingData.customer.email,
            phone: bookingData.customer.phone,
          },
          pickupAddress: {
            street: bookingData.pickupAddress.address,
            city: bookingData.pickupAddress.city,
            postcode: bookingData.pickupAddress.postcode,
            country: 'UK',
          },
          dropoffAddress: {
            street: bookingData.dropoffAddress.address,
            city: bookingData.dropoffAddress.city,
            postcode: bookingData.dropoffAddress.postcode,
            country: 'UK',
          },
          pickupDetails: {
            type: bookingData.pickupDetails.type,
            floors: bookingData.pickupDetails.floors,
            hasLift: bookingData.pickupDetails.hasLift,
            hasParking: bookingData.pickupDetails.hasParking,
            accessNotes: bookingData.pickupDetails.accessNotes || '',
            requiresPermit: bookingData.pickupDetails.requiresPermit,
          },
          dropoffDetails: {
            type: bookingData.dropoffDetails.type,
            floors: bookingData.dropoffDetails.floors,
            hasLift: bookingData.dropoffDetails.hasLift,
            hasParking: bookingData.dropoffDetails.hasParking,
            accessNotes: bookingData.dropoffDetails.accessNotes || '',
            requiresPermit: bookingData.dropoffDetails.requiresPermit,
          },
          items: bookingData.items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            category: item.category,
            volumeFactor: item.volume,
            requiresTwoPerson: false,
            isFragile: false,
            requiresDisassembly: false,
          })),
          pickupDate: bookingData.scheduledDate ? new Date(bookingData.scheduledDate).toISOString() : undefined,
          pickupTimeSlot: bookingData.scheduledTime,
          urgency: 'scheduled',
          notes: bookingData.notes || '',
          pricing: {
            subtotal: bookingData.pricing.total - bookingData.pricing.vat,
            vat: bookingData.pricing.vat,
            total: bookingData.pricing.total,
            currency: 'GBP',
          },
        };

        console.log('📤 Sending booking request:', bookingRequest);

        const bookingResponse = await fetch('/api/booking-luxury', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingRequest),
        });

        if (!bookingResponse.ok) {
          const errorData = await bookingResponse.json();
          throw new Error(errorData.error || 'Failed to create booking');
        }

        const bookingResponseData = await bookingResponse.json();
        bookingId = bookingResponseData.booking.id;
        console.log('✅ Booking created:', bookingId);
      }

      const requestData = {
        amount: formattedAmount,
        currency: 'gbp',
        customerEmail: bookingData.customer.email,
        customerName: bookingData.customer.name,
        bookingData: {
          ...bookingData,
          bookingId: bookingId, // Use the booking ID
        },
        successUrl: `${window.location.origin}/booking-luxury/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/booking-luxury?step=2&payment=cancelled`,
      };
      
      console.log('📤 Request data:', {
        ...requestData,
        bookingData: '...(truncated for logging)',
      });
      
      // Create Stripe checkout session
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Server response:', errorData);
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionUrl, sessionId } = await response.json();
      
      console.log('✅ Stripe session created:', sessionId);
      
      // Redirect to Stripe Checkout
      window.location.href = sessionUrl;
      
    } catch (error) {
      console.error('❌ Payment error:', error);
      setPaymentStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onError(errorMessage);
      
      toast({
        title: 'Payment Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch" w="full">
      <Button
        size="lg"
        colorScheme="blue"
        onClick={handlePayment}
        isDisabled={disabled || isProcessing}
        leftIcon={isProcessing ? <Spinner size="sm" /> : <FaCreditCard />}
      >
        {isProcessing ? 'Processing...' : 'Pay Securely with Stripe'}
      </Button>

      {paymentStatus === 'error' && (
        <Alert status="error">
          <AlertIcon />
          <Box>
            <AlertTitle>Payment Failed</AlertTitle>
            <AlertDescription>
              Please try again or contact support if the problem persists.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      <HStack justify="center" spacing={4} fontSize="sm" color="gray.600">
        <HStack>
          <FaLock />
          <Text>Secure Payment</Text>
        </HStack>
        <HStack>
          <FaShieldAlt />
          <Text>Protected by Stripe</Text>
        </HStack>
      </HStack>

      <Badge colorScheme="green" alignSelf="center">
        🔒 Bank-level Security
      </Badge>
    </VStack>
  );
}