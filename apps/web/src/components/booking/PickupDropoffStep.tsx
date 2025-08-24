import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Input, 
  Button, 
  FormControl, 
  FormLabel, 
  FormErrorMessage,
  Divider,
  Icon,
  useToast,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaArrowRight, FaCrosshairs } from 'react-icons/fa';
import { validateUKPostcode, formatUKPostcode, getCurrentLocation, getAddressFromCoordinates } from '@/lib/addressService';
import AddressAutocomplete from '@/components/AddressAutocomplete';

interface PickupDropoffStepProps {
  bookingData: any;
  updateBookingData: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function PickupDropoffStep({ 
  bookingData, 
  updateBookingData, 
  onNext, 
  onBack 
}: PickupDropoffStepProps) {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [pickupSearch, setPickupSearch] = useState(bookingData.pickupAddress?.line1 || '');
  const [dropoffSearch, setDropoffSearch] = useState(bookingData.dropoffAddress?.line1 || '');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const toast = useToast();

  // Sync search fields with booking data
  useEffect(() => {
    console.log('[PickupDropoffStep] useEffect pickup - bookingData.pickupAddress?.line1:', bookingData.pickupAddress?.line1);
    setPickupSearch(bookingData.pickupAddress?.line1 || '');
    console.log('[PickupDropoffStep] useEffect pickup - set pickupSearch to:', bookingData.pickupAddress?.line1 || '');
  }, [bookingData.pickupAddress?.line1]);

  useEffect(() => {
    console.log('[PickupDropoffStep] useEffect dropoff - bookingData.dropoffAddress?.line1:', bookingData.dropoffAddress?.line1);
    setDropoffSearch(bookingData.dropoffAddress?.line1 || '');
    console.log('[PickupDropoffStep] useEffect dropoff - set dropoffSearch to:', bookingData.dropoffAddress?.line1 || '');
  }, [bookingData.dropoffAddress?.line1]);

  const validateForm = () => {
    console.log('[PickupDropoffStep] validateForm - bookingData:', bookingData);
    console.log('[PickupDropoffStep] validateForm - pickupAddress:', bookingData.pickupAddress);
    console.log('[PickupDropoffStep] validateForm - dropoffAddress:', bookingData.dropoffAddress);
    
    const newErrors: {[key: string]: string} = {};

    // Validate pickup address
    if (!bookingData.pickupAddress?.line1?.trim()) {
      newErrors.pickupLine1 = 'Pickup address is required';
      console.log('[PickupDropoffStep] validateForm - pickup line1 missing');
    }
    if (!bookingData.pickupAddress?.city?.trim()) {
      newErrors.pickupCity = 'Pickup city is required';
      console.log('[PickupDropoffStep] validateForm - pickup city missing');
    }
    if (!bookingData.pickupAddress?.postcode?.trim()) {
      newErrors.pickupPostcode = 'Pickup postcode is required';
      console.log('[PickupDropoffStep] validateForm - pickup postcode missing');
    } else if (!validateUKPostcode(bookingData.pickupAddress.postcode)) {
      newErrors.pickupPostcode = 'Please enter a valid UK postcode';
      console.log('[PickupDropoffStep] validateForm - pickup postcode invalid');
    }

    // Validate dropoff address
    if (!bookingData.dropoffAddress?.line1?.trim()) {
      newErrors.dropoffLine1 = 'Dropoff address is required';
      console.log('[PickupDropoffStep] validateForm - dropoff line1 missing');
    }
    if (!bookingData.dropoffAddress?.city?.trim()) {
      newErrors.dropoffCity = 'Dropoff city is required';
      console.log('[PickupDropoffStep] validateForm - dropoff city missing');
    }
    if (!bookingData.dropoffAddress?.postcode?.trim()) {
      newErrors.dropoffPostcode = 'Dropoff postcode is required';
      console.log('[PickupDropoffStep] validateForm - dropoff postcode missing');
    } else if (!validateUKPostcode(bookingData.dropoffAddress.postcode)) {
      newErrors.dropoffPostcode = 'Please enter a valid UK postcode';
      console.log('[PickupDropoffStep] validateForm - dropoff postcode invalid');
    }

    console.log('[PickupDropoffStep] validateForm - errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext?.();
    } else {
      toast({
        title: 'Please fill in all required fields correctly',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updatePickupAddress = (field: string, value: string) => {
    updateBookingData({
      pickupAddress: {
        ...bookingData.pickupAddress,
        [field]: value
      }
    });
  };

  const updateDropoffAddress = (field: string, value: string) => {
    updateBookingData({
      dropoffAddress: {
        ...bookingData.dropoffAddress,
        [field]: value
      }
    });
  };

  // Handle address selection from AddressAutocomplete
  const handlePickupAddressSelect = (selection: any) => {
    console.log('[PickupDropoffStep] Pickup selection:', selection);
    console.log('[PickupDropoffStep] Selection type:', typeof selection);
    console.log('[PickupDropoffStep] Selection keys:', Object.keys(selection || {}));
    
    // Extract data from selection
    const parts = selection.label.split(',');
    const line1 = selection.address?.line1 || parts[0]?.trim() || selection.label;
    const city = selection.address?.city || parts.slice(1, -1).join(',').trim() || '';
    const postcode = formatUKPostcode(selection.address?.postcode || parts[parts.length - 1]?.trim() || '');
    
    console.log('[PickupDropoffStep] Extracted data:', { line1, city, postcode });
    console.log('[PickupDropoffStep] Parts array:', parts);
    
    // Update all address fields at once
    const updatedPickupAddress = {
      line1,
      city,
      postcode,
      coordinates: selection.coords
    };
    
    console.log('[PickupDropoffStep] Updated pickup address:', updatedPickupAddress);
    
    updateBookingData({
      pickupAddress: updatedPickupAddress
    });
    setPickupSearch(selection.label);
    
    console.log('[PickupDropoffStep] After update - pickupSearch:', selection.label);
    console.log('[PickupDropoffStep] After update - bookingData.pickupAddress:', bookingData.pickupAddress);
  };

  const handleDropoffAddressSelect = (selection: any) => {
    console.log('[PickupDropoffStep] Dropoff selection:', selection);
    console.log('[PickupDropoffStep] Selection type:', typeof selection);
    console.log('[PickupDropoffStep] Selection keys:', Object.keys(selection || {}));
    
    // Extract data from selection
    const parts = selection.label.split(',');
    const line1 = selection.address?.line1 || parts[0]?.trim() || selection.label;
    const city = selection.address?.city || parts.slice(1, -1).join(',').trim() || '';
    const postcode = formatUKPostcode(selection.address?.postcode || parts[parts.length - 1]?.trim() || '');
    
    console.log('[PickupDropoffStep] Extracted data:', { line1, city, postcode });
    console.log('[PickupDropoffStep] Parts array:', parts);
    
    // Update all address fields at once
    const updatedDropoffAddress = {
      line1,
      city,
      postcode,
      coordinates: selection.coords
    };
    
    console.log('[PickupDropoffStep] Updated dropoff address:', updatedDropoffAddress);
    
    updateBookingData({
      dropoffAddress: updatedDropoffAddress
    });
    setDropoffSearch(selection.label);
    
    console.log('[PickupDropoffStep] After update - dropoffSearch:', selection.label);
    console.log('[PickupDropoffStep] After update - bookingData.dropoffAddress:', bookingData.dropoffAddress);
  };

  const handlePostcodeChange = (value: string, type: 'pickup' | 'dropoff') => {
    const formatted = formatUKPostcode(value);
    if (type === 'pickup') {
      updatePickupAddress('postcode', formatted);
    } else {
      updateDropoffAddress('postcode', formatted);
    }
  };

  const useCurrentLocation = async (type: 'pickup' | 'dropoff') => {
    setIsGettingLocation(true);
    setLocationError('');

    try {
      const coords = await getCurrentLocation();
      const address = await getAddressFromCoordinates(coords.lat, coords.lng, true);

      if (address) {
        // Format the full address for display
        const fullAddress = `${address.line1}, ${address.city} ${address.postcode}`;
        
        if (type === 'pickup') {
          // Update the search field to show the address
          setPickupSearch(fullAddress);
          
          // Update the booking data with the full address
          const updatedPickupAddress = {
            line1: address.line1,
            city: address.city,
            postcode: formatUKPostcode(address.postcode),
            coordinates: { lat: address.lat, lng: address.lng }
          };
          
          updateBookingData({
            pickupAddress: updatedPickupAddress
          });
          
        } else {
          // Update the search field to show the address
          setDropoffSearch(fullAddress);
          
          // Update the booking data with the full address
          const updatedDropoffAddress = {
            line1: address.line1,
            city: address.city,
            postcode: formatUKPostcode(address.postcode),
            coordinates: { lat: address.lat, lng: address.lng }
          };
          
          updateBookingData({
            dropoffAddress: updatedDropoffAddress
          });
        }

        // Show success toast
        toast({
          title: 'Location Detected!',
          description: `Successfully set ${type} address to your current location.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

      } else {
        throw new Error('Could not find address for current location');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get current location';
      setLocationError(errorMessage);
      
      toast({
        title: 'Location Error',
        description: 'Could not detect your current location. Please enter the address manually.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Note: AddressAutocomplete handles its own click outside behavior
  // No need for manual click outside handling anymore

  return (
    <Box p={6} borderWidth="1px" borderRadius="xl" bg="bg.card" borderColor="border.primary" boxShadow="md">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="neon.500">
            Step 1: Pickup & Dropoff Addresses
          </Text>
          <Text fontSize="sm" color="text.secondary" mt={2}>
            Enter the addresses for pickup and delivery
          </Text>
        </Box>

        {locationError && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">{locationError}</Text>
          </Alert>
        )}

        {/* Pickup Address */}
        <Box>
          <HStack spacing={3} mb={4} justify="space-between">
            <HStack spacing={3}>
              <Icon as={FaMapMarkerAlt} color="brand.500" />
              <Text fontSize="lg" fontWeight="semibold" color="brand.500">
                Pickup Address
              </Text>
            </HStack>
            <Button
              size="sm"
              leftIcon={<FaCrosshairs />}
              variant="outline"
              onClick={() => useCurrentLocation('pickup')}
              isLoading={isGettingLocation}
              loadingText="Detecting..."
            >
              Use Current Location
            </Button>
          </HStack>
          
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.pickupLine1}>
              <FormLabel>Street Address</FormLabel>
              <AddressAutocomplete
                value={pickupSearch}
                onChange={(value) => {
                  console.log('[PickupDropoffStep] Pickup onChange:', value);
                  console.log('[PickupDropoffStep] Pickup onChange type:', typeof value);
                  setPickupSearch(value);
                }}
                onSelect={handlePickupAddressSelect}
                placeholder="Start typing to search addresses..."
                country="GB"
                limit={6}
                minLength={3}
                debounceMs={250}
              />
              <FormErrorMessage>{errors.pickupLine1}</FormErrorMessage>
            </FormControl>

            <HStack spacing={4} w="full">
              <FormControl isInvalid={!!errors.pickupCity}>
                <FormLabel>City</FormLabel>
                <Input
                  placeholder="e.g., London"
                  value={bookingData.pickupAddress?.city || ''}
                  onChange={(e) => updatePickupAddress('city', e.target.value)}
                  size="lg"
                />
                <FormErrorMessage>{errors.pickupCity}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.pickupPostcode}>
                <FormLabel>Postcode</FormLabel>
                <Input
                  placeholder="e.g., SW1A 2AA"
                  value={bookingData.pickupAddress?.postcode || ''}
                  onChange={(e) => handlePostcodeChange(e.target.value, 'pickup')}
                  size="lg"
                />
                <FormErrorMessage>{errors.pickupPostcode}</FormErrorMessage>
              </FormControl>
            </HStack>
          </VStack>
        </Box>

        <Divider />

        {/* Dropoff Address */}
        <Box>
          <HStack spacing={3} mb={4} justify="space-between">
            <HStack spacing={3}>
              <Icon as={FaArrowRight} color="neon.500" />
              <Text fontSize="lg" fontWeight="semibold" color="neon.500">
                Dropoff Address
              </Text>
            </HStack>
            <Button
              size="sm"
              leftIcon={<FaCrosshairs />}
              variant="outline"
              onClick={() => useCurrentLocation('dropoff')}
              isLoading={isGettingLocation}
              loadingText="Detecting..."
            >
              Use Current Location
            </Button>
          </HStack>
          
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.dropoffLine1}>
              <FormLabel>Street Address</FormLabel>
              <AddressAutocomplete
                value={dropoffSearch}
                onChange={(value) => {
                  console.log('[PickupDropoffStep] Dropoff onChange:', value);
                  console.log('[PickupDropoffStep] Dropoff onChange type:', typeof value);
                  setDropoffSearch(value);
                }}
                onSelect={handleDropoffAddressSelect}
                placeholder="Start typing to search addresses..."
                country="GB"
                limit={6}
                minLength={3}
                debounceMs={250}
              />
              <FormErrorMessage>{errors.dropoffLine1}</FormErrorMessage>
            </FormControl>

            <HStack spacing={4} w="full">
              <FormControl isInvalid={!!errors.dropoffCity}>
                <FormLabel>City</FormLabel>
                <Input
                  placeholder="e.g., Manchester"
                  value={bookingData.dropoffAddress?.city || ''}
                  onChange={(e) => updateDropoffAddress('city', e.target.value)}
                  size="lg"
                />
                <FormErrorMessage>{errors.dropoffCity}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.dropoffPostcode}>
                <FormLabel>Postcode</FormLabel>
                <Input
                  placeholder="e.g., M1 1AA"
                  value={bookingData.dropoffAddress?.postcode || ''}
                  onChange={(e) => handlePostcodeChange(e.target.value, 'dropoff')}
                  size="lg"
                />
                <FormErrorMessage>{errors.dropoffPostcode}</FormErrorMessage>
              </FormControl>
            </HStack>
          </VStack>
        </Box>

        {/* Navigation Buttons */}
        <HStack spacing={4} justify="space-between" pt={4}>
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            isDisabled={!onBack}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            variant="primary"
            size="lg"
            rightIcon={<FaArrowRight />}
          >
            Continue to Property Details
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
