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
import BookingNavigationButtons from './BookingNavigationButtons';

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
    price: '',
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
    <Box 
      p={{ base: 4, md: 6 }} 
      borderWidth="1px" 
      borderRadius="xl" 
      bg="bg.card" 
      borderColor="border.primary" 
      boxShadow="md" 
      className="booking-step-card"
    >
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        <Box textAlign="center">
          <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color="neon.500">
            Step 6: Crew Selection
          </Text>
          <Text fontSize={{ base: 'xs', md: 'sm' }} color="text.secondary" mt={2}>
            Choose the crew size for your move
          </Text>
        </Box>

        {/* Crew Options */}
        <Box className="booking-form-section">
          <HStack spacing={3} mb={{ base: 3, md: 4 }}>
            <Icon as={FaUsers} color="brand.500" boxSize={{ base: 4, md: 5 }} />
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="semibold" color="brand.500">
              Crew Size Options
            </Text>
          </HStack>
          
                     <FormControl isInvalid={!!errors.crewSize} className="booking-form-control">
             <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Select Crew Size</FormLabel>
             <RadioGroup value={bookingData.crewSize?.toString() || ''} onChange={(value) => updateCrewSize(parseInt(value))}>
               <Stack spacing={{ base: 3, md: 4 }}>
                 {CREW_OPTIONS.map((option) => (
                   <Box
                     key={option.value}
                     onClick={() => updateCrewSize(option.value)}
                     p={{ base: 4, md: 5 }}
                     borderWidth="3px"
                     borderRadius="xl"
                     borderColor={bookingData.crewSize === option.value ? 'neon.500' : 'gray.200'}
                     bg={bookingData.crewSize === option.value ? 'neon.50' : 'white'}
                     cursor="pointer"
                     transition="all 0.3s ease"
                     _hover={{ 
                       borderColor: 'neon.400',
                       transform: 'translateY(-2px)',
                       boxShadow: 'lg'
                     }}
                     _active={{ transform: 'scale(0.98)' }}
                     className="booking-radio-option"
                     position="relative"
                     overflow="hidden"
                     _before={{
                       content: '""',
                       position: 'absolute',
                       top: 0,
                       left: 0,
                       right: 0,
                       height: '4px',
                       bg: bookingData.crewSize === option.value ? 'neon.500' : 'transparent',
                       transition: 'all 0.3s ease'
                     }}
                   >
                     {/* Selection Indicator */}
                     <Box
                       position="absolute"
                       top={{ base: 3, md: 4 }}
                       right={{ base: 3, md: 4 }}
                       w={{ base: 6, md: 7 }}
                       h={{ base: 6, md: 7 }}
                       borderRadius="full"
                       border="3px solid"
                       borderColor={bookingData.crewSize === option.value ? 'neon.500' : 'gray.300'}
                       bg={bookingData.crewSize === option.value ? 'neon.500' : 'white'}
                       display="flex"
                       alignItems="center"
                       justifyContent="center"
                       transition="all 0.3s ease"
                     >
                       {bookingData.crewSize === option.value && (
                         <Box
                           w={{ base: 3, md: 3.5 }}
                           h={{ base: 3, md: 3.5 }}
                           borderRadius="full"
                           bg="white"
                           transition="all 0.3s ease"
                         />
                       )}
                     </Box>

                     {/* Main Content */}
                     <VStack align="start" spacing={{ base: 3, md: 4 }} width="full">
                       {/* Header Row */}
                       <HStack justify="space-between" align="center" width="full">
                         <VStack align="start" spacing={1}>
                           <Text 
                             fontWeight="bold" 
                             fontSize={{ base: 'lg', md: 'xl' }}
                             color={bookingData.crewSize === option.value ? 'neon.700' : 'gray.800'}
                           >
                             {option.label}
                           </Text>
                           <HStack spacing={2} flexWrap="wrap">
                             {option.recommended && (
                               <Badge 
                                 colorScheme="brand" 
                                 size="sm" 
                                 fontSize={{ base: 'xs', md: 'sm' }}
                                 px={2}
                                 py={1}
                                 borderRadius="full"
                               >
                                 ⭐ Recommended
                               </Badge>
                             )}
                             {getRecommendedCrew() === option.value && getTotalVolume() > 0 && (
                               <Badge 
                                 colorScheme="neon" 
                                 size="sm" 
                                 fontSize={{ base: 'xs', md: 'sm' }}
                                 px={2}
                                 py={1}
                                 borderRadius="full"
                               >
                                 🎯 Best Match
                               </Badge>
                             )}
                           </HStack>
                         </VStack>
                         
                                                   {/* Price Badge */}
                          {option.price && (
                            <Badge 
                              colorScheme={option.multiplier === 1.0 ? 'brand' : option.multiplier < 1.0 ? 'neon' : 'warning'}
                              variant="solid"
                              fontSize={{ base: 'sm', md: 'md' }}
                              px={{ base: 3, md: 4 }}
                              py={{ base: 2, md: 2 }}
                              borderRadius="full"
                              fontWeight="bold"
                              boxShadow="sm"
                            >
                              {option.price}
                            </Badge>
                          )}
                       </HStack>

                       {/* Description */}
                       <Text 
                         fontSize={{ base: 'sm', md: 'md' }} 
                         color={bookingData.crewSize === option.value ? 'neon.600' : 'gray.600'}
                         lineHeight="1.5"
                       >
                         {option.description}
                       </Text>

                       {/* Additional Info */}
                       <HStack spacing={4} fontSize={{ base: 'xs', md: 'sm' }} color="gray.500">
                         <HStack spacing={1}>
                           <Text>👥</Text>
                           <Text>Perfect for {option.value === 1 ? 'small moves' : option.value === 2 ? 'most moves' : option.value === 3 ? 'large moves' : 'commercial moves'}</Text>
                         </HStack>
                       </HStack>
                     </VStack>
                   </Box>
                 ))}
               </Stack>
             </RadioGroup>
            {errors.crewSize && (
              <Text color="error.500" fontSize={{ base: 'xs', md: 'sm' }} mt={2}>
                {errors.crewSize}
              </Text>
            )}
          </FormControl>
        </Box>

        {/* Recommendation */}
        {getTotalVolume() > 0 && (
          <Alert status="info" className="booking-form-control" borderRadius="lg">
            <AlertIcon as={FaInfoCircle} boxSize={{ base: 4, md: 5 }} />
            <Box>
              <AlertTitle fontSize={{ base: 'sm', md: 'sm' }}>Crew Recommendation</AlertTitle>
              <AlertDescription fontSize={{ base: 'xs', md: 'sm' }}>
                Based on your {getTotalVolume().toFixed(1)} m³ of items, we recommend {getRecommendedCrew()} person{getRecommendedCrew() !== 1 ? 's' : ''} for optimal efficiency.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Selected Crew Summary */}
        {getSelectedCrew() && (
          <Box p={{ base: 3, md: 4 }} borderWidth="1px" borderRadius="lg" bg="bg.surface" borderColor="border.primary" className="booking-form-section">
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="semibold" mb={{ base: 2, md: 3 }}>
              Selected Crew
            </Text>
            <VStack align="start" spacing={{ base: 2, md: 2 }}>
              <HStack spacing={{ base: 2, md: 3 }} flexWrap="wrap" align="center">
                <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>Crew Size:</Text>
                <Text fontSize={{ base: 'sm', md: 'md' }}>{getSelectedCrew()?.label}</Text>
                {getSelectedCrew()?.recommended && (
                  <Badge colorScheme="brand" size="sm" fontSize={{ base: 'xs', md: 'sm' }}>Recommended</Badge>
                )}
              </HStack>
              <HStack spacing={{ base: 2, md: 3 }} flexWrap="wrap" align="start">
                <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>Description:</Text>
                <Text fontSize={{ base: 'sm', md: 'md' }}>{getSelectedCrew()?.description}</Text>
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Pricing Display */}
        <PricingDisplay bookingData={bookingData} showBreakdown={true} />

        {/* Navigation Buttons */}
        <BookingNavigationButtons
          onNext={handleNext}
          onBack={onBack}
          nextText="Continue to Confirmation"
          backVariant="secondary"
        />
      </VStack>
    </Box>
  );
}
