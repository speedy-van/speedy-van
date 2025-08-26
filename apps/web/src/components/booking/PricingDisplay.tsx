'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Badge, 
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Collapse,
  Button,
  Icon
} from '@chakra-ui/react';
import { FaPoundSign, FaInfoCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { computeQuote, type PricingInputs, type PricingResult } from '@/lib/pricing/engine';
import { getPricingDistance } from '@/lib/pricing/distance-calculator';

interface PricingDisplayProps {
  bookingData: any;
  showBreakdown?: boolean;
  compact?: boolean;
  onPriceChange?: (price: number) => void;
}

export default function PricingDisplay({ 
  bookingData, 
  showBreakdown = false,
  compact = false,
  onPriceChange
}: PricingDisplayProps) {
  const [quote, setQuote] = useState<PricingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(showBreakdown);

  // Convert booking data to pricing inputs
  const convertToPricingInputs = (data: any): PricingInputs | null => {
    try {
      // Calculate distance using the distance calculator
      const distance = data.pickupAddress && data.dropoffAddress 
        ? getPricingDistance(data.pickupAddress, data.dropoffAddress)
        : 0;

            // Convert items to pricing format using catalog keys
      const items = (data.items || []).map((item: any) => {
        return {
          key: item.key || item.name || 'custom',
          quantity: item.quantity || 1
        };
      });

      // Convert property details (simplified)
      const pickup = data.pickupProperty ? {
        floors: data.pickupProperty.floor || 1,
        hasLift: data.pickupProperty.hasLift || false
      } : undefined;

      const dropoff = data.dropoffProperty ? {
        floors: data.dropoffProperty.floor || 1,
        hasLift: data.dropoffProperty.hasLift || false
      } : undefined;

      return {
        miles: distance,
        items,
        workersTotal: data.crewSize || 2,
        pickup,
        dropoff,
        vatRegistered: false, // Default to false for individual customers
        extras: {
          ulezApplicable: false // Default to false
        }
      };
    } catch (err) {
      console.error('Error converting booking data:', err);
      return null;
    }
  };

  // Calculate quote when booking data changes
  useEffect(() => {
    const calculateQuote = async () => {
      setLoading(true);
      setError(null);

      try {
        const inputs = convertToPricingInputs(bookingData);
        
        // Debug logging
        console.log('PricingDisplay - bookingData:', bookingData);
        console.log('PricingDisplay - converted inputs:', inputs);
        
        if (!inputs) {
          setError('Unable to calculate pricing');
          setLoading(false);
          return;
        }

        // Check if we have minimum required data
        if (!inputs.items || inputs.items.length === 0) {
          console.log('PricingDisplay - No items found, setting quote to null');
          setQuote(null);
          setLoading(false);
          return;
        }

        const result = await computeQuote(inputs);
        console.log('PricingDisplay - computed result:', result);
        setQuote(result);
        
        // Notify parent component of price change
        if (onPriceChange) {
          console.log('PricingDisplay - calling onPriceChange with:', result.totalGBP);
          onPriceChange(result.totalGBP);
        }
      } catch (err) {
        console.error('Pricing calculation error:', err);
        setError('Error calculating pricing');
      } finally {
        setLoading(false);
      }
    };

    calculateQuote().catch(console.error);
  }, [bookingData]);

  return (
    <Box p={4} bg="bg.surface" borderRadius="lg" shadow="sm" border="1px" borderColor="border.primary">
      <VStack spacing={3} align="stretch">
        {loading && (
          <HStack justify="center" py={4}>
            <Spinner size="sm" color="neon.500" />
            <Text fontSize="sm" color="text.secondary">Calculating price...</Text>
          </HStack>
        )}

        {error && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Pricing Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!quote && !loading && !error && (
          <Box p={4} bg="bg.surface" borderRadius="lg" border="1px" borderColor="border.primary">
            <Text fontSize="sm" color="text.secondary" textAlign="center">
              Complete your booking details to see pricing
            </Text>
          </Box>
        )}

        {quote && !compact && (
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="text.secondary">Estimated Price:</Text>
              <HStack spacing={2}>
                <Icon as={FaPoundSign} color="neon.500" />
                <Text fontSize="lg" fontWeight="bold" color="neon.500">
                  £{quote.totalGBP?.toFixed(2) || '0.00'}
                </Text>
              </HStack>
            </HStack>
          </Box>
        )}

        {quote && compact && (
          <Box textAlign="center" py={4}>
            <HStack justify="center" spacing={2} mb={2}>
              <Icon as={FaPoundSign} color="neon.500" />
              <Text fontSize="2xl" fontWeight="bold" color="neon.500">
                £{quote.totalGBP?.toFixed(2) || '0.00'}
              </Text>
            </HStack>
            <Text fontSize="sm" color="text.tertiary">
              Total estimated cost
            </Text>
          </Box>
        )}

        {quote && showBreakdown && (
          <Collapse in={showDetails}>
            <Box mt={4} p={4} bg="bg.surface" borderRadius="lg" borderWidth="1px" borderColor="border.primary">
              <HStack justify="space-between" mb={3}>
                <Text fontSize="lg" fontWeight="semibold">Price Breakdown</Text>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDetails(!showDetails)}
                  color="neon.500"
                >
                  <Icon as={showDetails ? FaChevronUp : FaChevronDown} />
                </Button>
              </HStack>
              
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="text.secondary">Base Rate</Text>
                  <Text fontSize="sm">£{quote.breakdown?.baseRate?.toFixed(2) || '0.00'}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontSize="sm" color="text.secondary">Distance Cost</Text>
                  <Text fontSize="sm">£{quote.breakdown?.distanceCost?.toFixed(2) || '0.00'}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontSize="sm" color="text.secondary">Items Cost</Text>
                  <Text fontSize="sm">£{quote.breakdown?.itemsCost?.toFixed(2) || '0.00'}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontSize="sm" color="text.secondary">Extra Workers</Text>
                  <Text fontSize="sm">£{quote.breakdown?.workersCost?.toFixed(2) || '0.00'}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontSize="sm" color="text.secondary">Stairs Cost</Text>
                  <Text fontSize="sm">£{quote.breakdown?.stairsCost?.toFixed(2) || '0.00'}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontSize="sm" color="text.secondary">Extras</Text>
                  <Text fontSize="sm">£{quote.breakdown?.extrasCost?.toFixed(2) || '0.00'}</Text>
                </HStack>
                
                <Divider />
                
                <HStack justify="space-between">
                  <Text fontSize="sm" color="text.secondary">Subtotal</Text>
                  <Text fontSize="sm">£{quote.breakdown?.subtotal?.toFixed(2) || '0.00'}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontSize="sm" color="text.secondary">VAT (20%)</Text>
                  <Text fontSize="sm">£{quote.breakdown?.vat?.toFixed(2) || '0.00'}</Text>
                </HStack>
                
                <Divider />
                
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="bold" color="neon.500">Total</Text>
                  <Text fontSize="sm" fontWeight="bold" color="neon.500">£{quote.breakdown?.total?.toFixed(2) || '0.00'}</Text>
                </HStack>
              </VStack>
              
              <Box p={3} bg="bg.surface" borderRadius="md" mt={4} borderWidth="1px" borderColor="border.primary">
                <HStack spacing={2}>
                  <Icon as={FaInfoCircle} color="neon.500" />
                  <Text fontSize="sm" color="text.secondary">
                    This is an estimated price. Final price may vary based on actual requirements.
                  </Text>
                </HStack>
              </Box>
            </Box>
          </Collapse>
        )}
      </VStack>
    </Box>
  );
}
