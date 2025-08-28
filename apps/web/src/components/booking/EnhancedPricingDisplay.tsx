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
  Icon,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Tooltip,
  Progress
} from '@chakra-ui/react';
import { 
  FaPoundSign, 
  FaInfoCircle, 
  FaChevronDown, 
  FaChevronUp,
  FaBox,
  FaUsers,
  FaStar,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import { computeQuote, type PricingInputs, type PricingResponse } from '@/lib/pricing/engine';

interface PricingDisplayProps {
  bookingData: any;
  showBreakdown?: boolean;
  compact?: boolean;
  onPriceChange?: (price: number) => void;
}

export default function EnhancedPricingDisplay({ 
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
  const convertToPricingInputs = (data: any): PricingInputs | null => {
    try {
      // Calculate distance (simplified - in real app, use Mapbox)
      const distance = data.distanceMiles || 0;

      // Convert items to new pricing format
      const items = (data.items || []).map((item: any) => {
        return {
          id: item.id || item.key || 'custom',
          name: item.name || item.key || 'Custom Item',
          quantity: item.quantity || 1,
          volumeFactor: item.volumeFactor || 1.0,
          requiresTwoPerson: item.requiresTwoPerson || false,
          isFragile: item.isFragile || false,
          requiresDisassembly: item.requiresDisassembly || false,
          basePriceHint: item.basePriceHint || 0
        };
      });

      // Convert property details
      const pickup = data.pickupProperty ? {
        floors: data.pickupProperty.floor || 0,
        hasLift: data.pickupProperty.hasLift || false
      } : undefined;

      const dropoff = data.dropoffProperty ? {
        floors: data.dropoffProperty.floor || 0,
        hasLift: data.dropoffProperty.hasLift || false
      } : undefined;

      return {
        distanceMiles: distance,
        items,
        pickupFloors: pickup?.floors || 0,
        pickupHasLift: pickup?.hasLift || false,
        dropoffFloors: dropoff?.floors || 0,
        dropoffHasLift: dropoff?.hasLift || false,
        helpersCount: (data.crewSize || 1) - 1, // Subtract base crew of 1
        extras: {
          ulez: data.extras?.ulezApplicable || false,
          vat: false
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
        
        console.log('EnhancedPricingDisplay - bookingData:', bookingData);
        console.log('EnhancedPricingDisplay - converted inputs:', inputs);
        
        if (!inputs) {
          setError('Unable to calculate pricing');
          setLoading(false);
          return;
        }

        if (inputs.items.length === 0) {
          setError('Please add items to calculate pricing');
          setLoading(false);
          return;
        }

        const result = await computeQuote(inputs);
        setQuote(result);
        
        // Notify parent component of price change
        if (onPriceChange) {
          onPriceChange(result.breakdown.total);
        }
        
        console.log('EnhancedPricingDisplay - quote result:', result);
      } catch (err: any) {
        console.error('Error calculating quote:', err);
        setError(err.message || 'Failed to calculate pricing');
      } finally {
        setLoading(false);
      }
    };

    if (bookingData && Object.keys(bookingData).length > 0) {
      calculateQuote();
    }
  }, [bookingData, onPriceChange]);

  // Get total volume factor
  const getTotalVolumeFactor = () => {
    if (!bookingData.items) return 0;
    return bookingData.items.reduce((total: number, item: any) => {
      return total + ((item.volumeFactor || 1.0) * (item.quantity || 1));
    }, 0);
  };

  // Get items requiring two people
  const getItemsRequiringTwoPeople = () => {
    if (!bookingData.items) return [];
    return bookingData.items.filter((item: any) => item.requiresTwoPerson);
  };

  // Get fragile items
  const getFragileItems = () => {
    if (!bookingData.items) return [];
    return bookingData.items.filter((item: any) => item.isFragile);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardBody textAlign="center" py={8}>
          <Spinner size="lg" color="neon.500" mb={4} />
          <Text>Calculating your quote...</Text>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert status="error">
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
      <Card>
        <CardBody textAlign="center" py={8}>
          <Text color="text.secondary">Complete your booking details to see pricing</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontSize="lg" fontWeight="semibold">Move Quote</Text>
                         <Text fontSize="2xl" fontWeight="bold" color="neon.500">
               {formatCurrency(quote.breakdown.total)}
             </Text>
          </VStack>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDetails(!showDetails)}
            rightIcon={showDetails ? <FaChevronUp /> : <FaChevronDown />}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        </HStack>
      </CardHeader>

      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* Summary Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Card variant="outline">
              <CardBody textAlign="center" p={4}>
                <Icon as={FaBox} color="neon.500" fontSize="2xl" mb={2} />
                <Text fontSize="sm" color="text.secondary">Volume Factor</Text>
                <Text fontSize="lg" fontWeight="semibold">
                  {getTotalVolumeFactor().toFixed(1)}
                </Text>
              </CardBody>
            </Card>

            <Card variant="outline">
              <CardBody textAlign="center" p={4}>
                <Icon as={FaUsers} color="neon.500" fontSize="2xl" mb={2} />
                <Text fontSize="sm" color="text.secondary">Crew Size</Text>
                <Text fontSize="lg" fontWeight="semibold">
                  {bookingData.crewSize || 1}
                </Text>
                {getItemsRequiringTwoPeople().length > 0 && (
                  <Badge size="sm" colorScheme="orange" mt={1}>
                    Helper Recommended
                  </Badge>
                )}
              </CardBody>
            </Card>

            <Card variant="outline">
              <CardBody textAlign="center" p={4}>
                                 <Icon as={FaStar} color="neon.500" fontSize="2xl" mb={2} />
                 <Text fontSize="sm" color="text.secondary">Stairs</Text>
                 <Text fontSize="lg" fontWeight="semibold">
                   {quote.breakdown.floorsCost > 0 ? formatCurrency(quote.breakdown.floorsCost) : 'None'}
                 </Text>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Detailed Breakdown */}
          <Collapse in={showDetails}>
            <VStack spacing={4} align="stretch" pt={4}>
              <Divider />
              
                             {/* Distance and Volume */}
               <VStack spacing={3} align="stretch">
                 <HStack justify="space-between">
                   <Text fontWeight="medium">Distance Base</Text>
                   <Text>{formatCurrency(quote.breakdown.distanceBase)}</Text>
                 </HStack>
                 
                 <HStack justify="space-between">
                   <Text fontWeight="medium">Volume Factor</Text>
                   <Text>{quote.breakdown.totalVolumeFactor.toFixed(1)}x</Text>
                 </HStack>
                 
                 <HStack justify="space-between">
                   <Text fontWeight="medium">Volume Adjusted Base</Text>
                   <Text fontWeight="semibold">{formatCurrency(quote.breakdown.distanceBase * quote.breakdown.totalVolumeFactor)}</Text>
                 </HStack>
               </VStack>

              <Divider />

              {/* Additional Costs */}
              <VStack spacing={3} align="stretch">
                                 {quote.breakdown.helpersCost > 0 && (
                   <HStack justify="space-between">
                     <HStack>
                       <Icon as={FaUsers} color="neon.500" />
                       <Text fontWeight="medium">Additional Workers</Text>
                     </HStack>
                     <Text>{formatCurrency(quote.breakdown.helpersCost)}</Text>
                   </HStack>
                 )}

                                 {quote.breakdown.floorsCost > 0 && (
                   <HStack justify="space-between">
                     <HStack>
                       <Icon as={FaStar} color="neon.500" />
                       <Text fontWeight="medium">Stairs & Floors</Text>
                     </HStack>
                     <Text>{formatCurrency(quote.breakdown.floorsCost)}</Text>
                   </HStack>
                 )}

                {quote.breakdown.extrasCost > 0 && (
                  <HStack justify="space-between">
                    <HStack>
                      <Icon as={FaExclamationTriangle} color="orange.500" />
                      <Text fontWeight="medium">Additional Services</Text>
                    </HStack>
                    <Text>{formatCurrency(quote.breakdown.extrasCost)}</Text>
                  </HStack>
                )}
              </VStack>

              <Divider />

                             {/* Subtotal and VAT */}
               <VStack spacing={3} align="stretch">
                 <HStack justify="space-between">
                   <Text fontWeight="medium">Subtotal</Text>
                   <Text fontWeight="semibold">{formatCurrency(quote.breakdown.total - quote.breakdown.vat)}</Text>
                 </HStack>
                 
                 {quote.breakdown.vat > 0 && (
                   <HStack justify="space-between">
                     <Text fontWeight="medium">VAT (20%)</Text>
                     <Text>{formatCurrency(quote.breakdown.vat)}</Text>
                   </HStack>
                 )}
               </VStack>

              <Divider />

              {/* Total */}
              <HStack justify="space-between" pt={2}>
                <Text fontSize="lg" fontWeight="bold">Total</Text>
                                 <Text fontSize="xl" fontWeight="bold" color="neon.500">
                   {formatCurrency(quote.breakdown.total)}
                 </Text>
              </HStack>
            </VStack>
          </Collapse>

          {/* Special Item Warnings */}
          {getFragileItems().length > 0 && (
            <Alert status="warning">
              <AlertIcon />
              <Box>
                <AlertTitle>Fragile Items</AlertTitle>
                <AlertDescription>
                  You have {getFragileItems().length} fragile item(s). These will receive special handling.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {getItemsRequiringTwoPeople().length > 0 && (
            <Alert status="info">
              <AlertIcon />
              <Box>
                <AlertTitle>Two-Person Items</AlertTitle>
                <AlertDescription>
                  {getItemsRequiringTwoPeople().length} item(s) require two people to move safely. 
                  We've automatically suggested additional crew members.
                </AlertDescription>
              </Box>
            </Alert>
          )}

                     {/* Minimum Price Notice */}
           {quote.breakdown.total === 55 && (
            <Alert status="info">
              <AlertIcon />
              <Box>
                <AlertTitle>Minimum Price Applied</AlertTitle>
                <AlertDescription>
                  Your quote has been adjusted to meet our minimum price of £55.
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}
