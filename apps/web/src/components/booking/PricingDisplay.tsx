'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
import { computeQuote, type PricingInputs, type PricingResponse } from '@/lib/pricing/engine';
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
  const [quote, setQuote] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(showBreakdown);

  // Convert booking data to pricing inputs
  const convertToPricingInputs = useCallback((data: any): PricingInputs | null => {
    try {
      // Use distance from booking data or calculate from addresses
      let distance = data.distanceMiles || 0;
      if (!distance && data.pickupAddress && data.dropoffAddress) {
        distance = getPricingDistance(data.pickupAddress, data.dropoffAddress);
      }

      // Convert items to pricing format
      const items = (data.items || []).map((item: any) => {
        return {
          id: item.id || item.key || 'custom',
          canonicalName: item.canonicalName || item.name || 'Custom Item',
          quantity: item.quantity || 1,
          volumeFactor: item.volumeFactor || 1,
          requiresTwoPerson: item.requiresTwoPerson || false,
          isFragile: item.isFragile || false,
          requiresDisassembly: item.requiresDisassembly || false,
          basePriceHint: item.basePriceHint || 0
        };
      });

      return {
        distanceMiles: distance,
        items,
        pickupFloors: data.pickupFloors || data.pickupProperty?.floor || 0,
        pickupHasLift: data.pickupHasLift || data.pickupProperty?.hasLift || false,
        dropoffFloors: data.dropoffFloors || data.dropoffProperty?.floor || 0,
        dropoffHasLift: data.dropoffHasLift || data.dropoffProperty?.hasLift || false,
        helpersCount: data.helpersCount || (data.crewSize || 2) - 2,
        extras: {
          ulez: data.ulez || false,
          vat: data.vat || false
        }
      };
    } catch (err) {
      console.error('Error converting booking data:', err);
      return null;
    }
  }, []);

  // Memoize the converted inputs to prevent unnecessary recalculations
  const pricingInputs = useMemo(() => {
    return convertToPricingInputs(bookingData);
  }, [bookingData, convertToPricingInputs]);

  // Calculate quote when booking data changes
  useEffect(() => {
    // Add a small delay to prevent excessive calculations
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        // Use memoized inputs
        const inputs = pricingInputs;
        
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
          console.log('PricingDisplay - calling onPriceChange with:', result.breakdown.total);
          onPriceChange(result.breakdown.total);
        }
      } catch (err) {
        console.error('Pricing calculation error:', err);
        setError('Error calculating pricing');
      } finally {
        setLoading(false);
      }
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
  }, [pricingInputs, onPriceChange]);

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
                  £{quote.breakdown.total?.toFixed(2) || '0.00'}
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
                £{quote.breakdown.total?.toFixed(2) || '0.00'}
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
                  <Text fontSize="sm" color="text.secondary">Distance Base</Text>
                  <Text fontSize="sm">£{quote.breakdown?.distanceBase?.toFixed(2) || '0.00'}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontSize="sm" color="text.secondary">Volume Factor</Text>
                  <Text fontSize="sm">£{quote.breakdown?.totalVolumeFactor?.toFixed(2) || '0.00'}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontSize="sm" color="text.secondary">Floors Cost</Text>
                  <Text fontSize="sm">£{quote.breakdown?.floorsCost?.toFixed(2) || '0.00'}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontSize="sm" color="text.secondary">Helpers Cost</Text>
                  <Text fontSize="sm">£{quote.breakdown?.helpersCost?.toFixed(2) || '0.00'}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontSize="sm" color="text.secondary">Extras Cost</Text>
                  <Text fontSize="sm">£{quote.breakdown?.extrasCost?.toFixed(2) || '0.00'}</Text>
                </HStack>
                
                <Divider />
                
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
