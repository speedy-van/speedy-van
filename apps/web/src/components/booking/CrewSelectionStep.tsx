import React, { useState } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Button, 
  FormControl, 
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Icon,
  useToast
} from '@chakra-ui/react';
import { FaUsers, FaArrowRight, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import PricingDisplay from './PricingDisplay';

interface CrewSelectionStepProps {
  bookingData: any;
  updateBookingData: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

const CREW_OPTIONS = [
  {
    value: 1,
    label: '1 Person',
    description: 'Suitable for small moves, studio apartments',
    multiplier: 0.8,
    price: '20% discount',
    recommended: false
  },
  {
    value: 2,
    label: '2 People',
    description: 'Standard crew for most moves',
    multiplier: 1.0,
    price: 'Standard rate',
    recommended: true
  },
  {
    value: 3,
    label: '3 People',
    description: 'For larger moves, heavy items',
    multiplier: 1.4,
    price: '+40% surcharge',
    recommended: false
  },
  {
    value: 4,
    label: '4+ People',
    description: 'For very large moves, commercial',
    multiplier: 1.8,
    price: '+80% surcharge',
    recommended: false
  }
];

export default function CrewSelectionStep({ 
  bookingData, 
  updateBookingData, 
  onNext, 
  onBack 
}: CrewSelectionStepProps) {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const toast = useToast();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!bookingData.crewSize || bookingData.crewSize < 1) {
      newErrors.crewSize = 'Please select a crew size';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext?.();
    } else {
      toast({
        title: 'Please select a crew size',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updateCrewSize = (size: number) => {
    updateBookingData({ crewSize: size });
  };

  const getSelectedCrew = () => {
    return CREW_OPTIONS.find(option => option.value === bookingData.crewSize);
  };

  const getTotalVolume = () => {
    return bookingData.items?.reduce((total: number, item: any) => {
      return total + (item.volume * item.quantity);
    }, 0) || 0;
  };

  const getRecommendedCrew = () => {
    const totalVolume = getTotalVolume();
    if (totalVolume <= 5) return 1;
    if (totalVolume <= 15) return 2;
    if (totalVolume <= 25) return 3;
    return 4;
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="xl" bg="bg.card" borderColor="border.primary" boxShadow="md">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="neon.500">
            Step 6: Crew Selection
          </Text>
          <Text fontSize="sm" color="text.secondary" mt={2}>
            Choose the crew size for your move
          </Text>
        </Box>

        {/* Crew Options */}
        <Box>
          <HStack spacing={3} mb={4}>
            <Icon as={FaUsers} color="brand.500" />
            <Text fontSize="lg" fontWeight="semibold" color="brand.500">
              Crew Size Options
            </Text>
          </HStack>
          
          <FormControl isInvalid={!!errors.crewSize}>
            <FormLabel>Select Crew Size</FormLabel>
            <RadioGroup value={bookingData.crewSize?.toString() || ''} onChange={(value) => updateCrewSize(parseInt(value))}>
              <Stack spacing={3}>
                {CREW_OPTIONS.map((option) => (
                  <Box
                    key={option.value}
                    p={4}
                    borderWidth="2px"
                    borderRadius="lg"
                    borderColor={bookingData.crewSize === option.value ? 'neon.500' : 'border.primary'}
                    bg={bookingData.crewSize === option.value ? 'bg.surface.hover' : 'bg.surface'}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ borderColor: 'neon.400' }}
                  >
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Radio value={option.value.toString()} />
                          <Text fontWeight="semibold">{option.label}</Text>
                          {option.recommended && (
                            <Badge colorScheme="brand" size="sm">Recommended</Badge>
                          )}
                          {getRecommendedCrew() === option.value && getTotalVolume() > 0 && (
                            <Badge colorScheme="neon" size="sm">Best Match</Badge>
                          )}
                        </HStack>
                        <Text fontSize="sm" color="text.secondary" ml={6}>
                          {option.description}
                        </Text>
                      </VStack>
                      <Badge 
                        colorScheme={option.multiplier === 1.0 ? 'brand' : option.multiplier < 1.0 ? 'neon' : 'warning'}
                        variant="outline"
                      >
                        {option.price}
                      </Badge>
                    </HStack>
                  </Box>
                ))}
              </Stack>
            </RadioGroup>
            {errors.crewSize && (
              <Text color="error.500" fontSize="sm" mt={2}>
                {errors.crewSize}
              </Text>
            )}
          </FormControl>
        </Box>

        {/* Recommendation */}
        {getTotalVolume() > 0 && (
          <Alert status="info">
            <AlertIcon as={FaInfoCircle} />
            <Box>
              <AlertTitle>Crew Recommendation</AlertTitle>
              <AlertDescription>
                Based on your {getTotalVolume().toFixed(1)} m³ of items, we recommend {getRecommendedCrew()} person{getRecommendedCrew() !== 1 ? 's' : ''} for optimal efficiency.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Selected Crew Summary */}
        {getSelectedCrew() && (
          <Box p={4} borderWidth="1px" borderRadius="lg" bg="bg.surface" borderColor="border.primary">
            <Text fontSize="lg" fontWeight="semibold" mb={3}>
              Selected Crew
            </Text>
            <VStack align="start" spacing={2}>
              <HStack>
                <Text fontWeight="medium">Crew Size:</Text>
                <Text>{getSelectedCrew()?.label}</Text>
                {getSelectedCrew()?.recommended && (
                  <Badge colorScheme="brand">Recommended</Badge>
                )}
              </HStack>
              <HStack>
                <Text fontWeight="medium">Description:</Text>
                <Text>{getSelectedCrew()?.description}</Text>
              </HStack>

            </VStack>
          </Box>
        )}

        {/* Pricing Display */}
        <PricingDisplay bookingData={bookingData} showBreakdown={true} />

        {/* Navigation Buttons */}
        <HStack spacing={4} justify="space-between" pt={4}>
          <Button
            onClick={onBack}
            variant="secondary"
            size="lg"
            leftIcon={<FaArrowLeft />}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            variant="primary"
            size="lg"
            rightIcon={<FaArrowRight />}
          >
            Continue to Confirmation
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
