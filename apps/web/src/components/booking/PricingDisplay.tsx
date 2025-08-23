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

        const result = computeQuote(inputs);
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

    calculateQuote();
  }, [bookingData]);

  if (loading) {
    return (
      <Box p={4} bg="white" borderRadius="lg" shadow="sm">
        <HStack justify="center" spacing={3}>
          <Spinner size="sm" color="blue.500" />
          <Text fontSize="sm" color="gray.600">Calculating price...</Text>
        </HStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        <Box>
          <AlertTitle>Pricing Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Box>
      </Alert>
    );
  }

  if (!quote) {
    return (
      <Box p={4} bg="gray.50" borderRadius="lg" border="1px" borderColor="gray.200">
        <Text fontSize="sm" color="gray.600" textAlign="center">
          Add items to see pricing
        </Text>
      </Box>
    );
  }

  if (compact) {
    return (
      <Box p={3} bg="white" borderRadius="lg" shadow="sm" border="1px" borderColor="blue.200">
        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.600">Estimated Price:</Text>
          <HStack spacing={2}>
            <Icon as={FaPoundSign} color="blue.500" />
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              {quote.totalGBP}
            </Text>
          </HStack>
        </HStack>
      </Box>
    );
  }

  return (
    <Box p={4} bg="white" borderRadius="lg" shadow="sm" border="1px" borderColor="blue.200">
      <VStack spacing={3} align="stretch">
        {/* Main Price Display */}
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="semibold" color="gray.700">
            Estimated Price
          </Text>
          <HStack spacing={2}>
            <Icon as={FaPoundSign} color="blue.500" />
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              {quote.totalGBP}
            </Text>
          </HStack>
        </HStack>

        {/* Price Breakdown Toggle */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowDetails(!showDetails)}
          rightIcon={showDetails ? <FaChevronUp /> : <FaChevronDown />}
          color="blue.500"
        >
          {showDetails ? 'Hide' : 'Show'} breakdown
        </Button>

        {/* Detailed Breakdown */}
        <Collapse in={showDetails}>
          <VStack spacing={2} align="stretch" pt={2}>
            <Divider />
            
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">Base Rate</Text>
              <Text fontSize="sm" fontWeight="medium">£{quote.breakdown.baseRate}</Text>
            </HStack>

            {quote.breakdown.distanceCost > 0 && (
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Distance Cost</Text>
                <Text fontSize="sm" fontWeight="medium">£{quote.breakdown.distanceCost}</Text>
              </HStack>
            )}

            {quote.breakdown.itemsCost > 0 && (
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Items Cost</Text>
                <Text fontSize="sm" fontWeight="medium">£{quote.breakdown.itemsCost}</Text>
              </HStack>
            )}

            {quote.breakdown.workersCost > 0 && (
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Extra Workers</Text>
                <Text fontSize="sm" fontWeight="medium">£{quote.breakdown.workersCost}</Text>
              </HStack>
            )}

            {quote.breakdown.stairsCost > 0 && (
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Stairs Cost</Text>
                <Text fontSize="sm" fontWeight="medium">£{quote.breakdown.stairsCost}</Text>
              </HStack>
            )}

            {quote.breakdown.extrasCost > 0 && (
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Extras</Text>
                <Text fontSize="sm" fontWeight="medium">£{quote.breakdown.extrasCost}</Text>
              </HStack>
            )}

            <Divider />
            
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">Subtotal</Text>
              <Text fontSize="sm" fontWeight="semibold">£{quote.breakdown.subtotal}</Text>
            </HStack>

            {quote.breakdown.vat > 0 && (
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">VAT (20%)</Text>
                <Text fontSize="sm" fontWeight="medium">£{quote.breakdown.vat}</Text>
              </HStack>
            )}

            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="bold" color="blue.600">Total</Text>
              <Text fontSize="sm" fontWeight="bold" color="blue.600">£{quote.breakdown.total}</Text>
            </HStack>

            {/* Additional Info */}
            <Box p={3} bg="blue.50" borderRadius="md">
              <HStack spacing={2}>
                <Icon as={FaInfoCircle} color="blue.500" />
                <Text fontSize="xs" color="blue.700">
                  Price includes fuel, insurance, and basic packing materials. 
                  One worker included in base rate.
                </Text>
              </HStack>
            </Box>
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  );
}
