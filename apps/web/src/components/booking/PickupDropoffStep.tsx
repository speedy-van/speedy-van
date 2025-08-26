/* eslint-disable no-console */
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Input, 
  FormControl, 
  FormLabel, 
  FormErrorMessage,
  Divider,
  Icon,
  useToast,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  Tooltip,
  Badge,
  Flex,
  Textarea
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaArrowRight, FaCrosshairs, FaCheck, FaInfoCircle, FaEdit } from 'react-icons/fa';
import { validateUKPostcode, formatUKPostcode, getCurrentLocation, getAddressFromCoordinates } from '@/lib/addressService';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import BookingNavigationButtons from './BookingNavigationButtons';
import Button from '@/components/common/Button';

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
  // States
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [pickupSearch, setPickupSearch] = useState(bookingData.pickupAddress?.line1 || '');
  const [dropoffSearch, setDropoffSearch] = useState(bookingData.dropoffAddress?.line1 || '');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [pickupValidation, setPickupValidation] = useState<{[key: string]: boolean}>({});
  const [dropoffValidation, setDropoffValidation] = useState<{[key: string]: boolean}>({});
  const [pickupManualMode, setPickupManualMode] = useState(false);
  const [dropoffManualMode, setDropoffManualMode] = useState(false);

  const toast = useToast();

  // Sync search fields with booking data - memoized to prevent unnecessary updates
  const pickupAddressLine1 = useMemo(() => bookingData.pickupAddress?.line1 || '', [bookingData.pickupAddress?.line1]);
  const dropoffAddressLine1 = useMemo(() => bookingData.dropoffAddress?.line1 || '', [bookingData.dropoffAddress?.line1]);

  useEffect(() => {
    if (pickupAddressLine1 !== pickupSearch) {
      setPickupSearch(pickupAddressLine1);
    }
  }, [pickupAddressLine1, pickupSearch]);

  useEffect(() => {
    if (dropoffAddressLine1 !== dropoffSearch) {
      setDropoffSearch(dropoffAddressLine1);
    }
  }, [dropoffAddressLine1, dropoffSearch]);

  // Validate fields in real-time - memoized to prevent unnecessary recalculations
  const validationData = useMemo(() => {
    const pickupValid = {
      line1: !!bookingData.pickupAddress?.line1?.trim(),
      city: !!bookingData.pickupAddress?.city?.trim(),
      postcode: !!bookingData.pickupAddress?.postcode?.trim() && validateUKPostcode(bookingData.pickupAddress.postcode)
    };

    const dropoffValid = {
      line1: !!bookingData.dropoffAddress?.line1?.trim(),
      city: !!bookingData.dropoffAddress?.city?.trim(),
      postcode: !!bookingData.dropoffAddress?.postcode?.trim() && validateUKPostcode(bookingData.dropoffAddress.postcode)
    };

    return { pickupValid, dropoffValid };
  }, [bookingData.pickupAddress, bookingData.dropoffAddress]);

  useEffect(() => {
    setPickupValidation(validationData.pickupValid);
    setDropoffValidation(validationData.dropoffValid);
  }, [validationData]);

  const validateForm = useCallback(() => {
    const newErrors: {[key: string]: string} = {};

    // Validate pickup address
    if (!bookingData.pickupAddress?.line1?.trim()) {
      newErrors.pickupLine1 = 'Pickup address is required';
    }
    if (!bookingData.pickupAddress?.city?.trim()) {
      newErrors.pickupCity = 'Pickup city is required';
    }
    if (!bookingData.pickupAddress?.postcode?.trim()) {
      newErrors.pickupPostcode = 'Pickup postcode is required';
    } else if (!validateUKPostcode(bookingData.pickupAddress.postcode)) {
      newErrors.pickupPostcode = 'Please enter a valid UK postcode';
    }

    // Validate dropoff address
    if (!bookingData.dropoffAddress?.line1?.trim()) {
      newErrors.dropoffLine1 = 'Dropoff address is required';
    }
    if (!bookingData.dropoffAddress?.city?.trim()) {
      newErrors.dropoffCity = 'Dropoff city is required';
    }
    if (!bookingData.dropoffAddress?.postcode?.trim()) {
      newErrors.dropoffPostcode = 'Dropoff postcode is required';
    } else if (!validateUKPostcode(bookingData.dropoffAddress.postcode)) {
      newErrors.dropoffPostcode = 'Please enter a valid UK postcode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [bookingData.pickupAddress, bookingData.dropoffAddress]);

  const handleNext = useCallback(() => {
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
  }, [validateForm, onNext, toast]);

  const updatePickupAddress = useCallback((field: string, value: string) => {
    updateBookingData({
      pickupAddress: {
        ...bookingData.pickupAddress,
        [field]: value
      }
    });
  }, [bookingData.pickupAddress, updateBookingData]);

  const updateDropoffAddress = useCallback((field: string, value: string) => {
    updateBookingData({
      dropoffAddress: {
        ...bookingData.dropoffAddress,
        [field]: value
      }
    });
  }, [bookingData.dropoffAddress, updateBookingData]);

  // Handle address selection from AddressAutocomplete
  const handlePickupAddressSelect = useCallback((selection: any) => {
    console.log('Pickup selection:', selection);
    
    // Use the structured address data from the selection
    const line1 = selection.address?.line1 || selection.label.split(',')[0]?.trim() || selection.label;
    const city = selection.address?.city || '';
    const postcode = selection.address?.postcode ? formatUKPostcode(selection.address.postcode) : '';
    
    // Update all address fields at once
    const updatedPickupAddress = {
      line1,
      city,
      postcode,
      coordinates: selection.coords
    };
    
    console.log('Updated pickup address:', updatedPickupAddress);
    
    updateBookingData({
      pickupAddress: updatedPickupAddress
    });
    setPickupSearch(selection.label);
    setPickupManualMode(false);
  }, [updateBookingData]);

  const handleDropoffAddressSelect = useCallback((selection: any) => {
    console.log('Dropoff selection:', selection);
    
    // Use the structured address data from the selection
    const line1 = selection.address?.line1 || selection.label.split(',')[0]?.trim() || selection.label;
    const city = selection.address?.city || '';
    const postcode = selection.address?.postcode ? formatUKPostcode(selection.address.postcode) : '';
    
    // Update all address fields at once
    const updatedDropoffAddress = {
      line1,
      city,
      postcode,
      coordinates: selection.coords
    };
    
    console.log('Updated dropoff address:', updatedDropoffAddress);
    
    updateBookingData({
      dropoffAddress: updatedDropoffAddress
    });
    setDropoffSearch(selection.label);
    setDropoffManualMode(false);
  }, [updateBookingData]);

  const handlePostcodeChange = useCallback((value: string, type: 'pickup' | 'dropoff') => {
    const formatted = formatUKPostcode(value);
    if (type === 'pickup') {
      updatePickupAddress('postcode', formatted);
    } else {
      updateDropoffAddress('postcode', formatted);
    }
  }, [updatePickupAddress, updateDropoffAddress]);

  const useCurrentLocation = useCallback(async (type: 'pickup' | 'dropoff') => {
    setIsGettingLocation(true);
    setLocationError('');
    
    try {
      const position = await getCurrentLocation();
      
      // Check if position and coordinates exist
      if (!position || !position.coords) {
        throw new Error('Could not get current location coordinates');
      }
      
      const { latitude, longitude } = position.coords;
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        throw new Error('Invalid coordinates received');
      }
      
      const address = await getAddressFromCoordinates(latitude, longitude);
      
      if (address) {
        if (type === 'pickup') {
          // Update the search field to show the address
          const fullAddress = `${address.line1}, ${address.city}, ${address.postcode}`;
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
          const fullAddress = `${address.line1}, ${address.city}, ${address.postcode}`;
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
  }, [updateBookingData, toast]);

  return (
    <Box p={6} borderWidth="1px" borderRadius="xl" bg="bg.card" borderColor="border.primary" boxShadow="md" className="booking-step-card">
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
            <Text fontSize="xs" color="text.secondary" mt={1}>
              💡 You can still enter your address manually using the fields below
            </Text>
          </Alert>
        )}

        {/* Pickup Address */}
        <Box className="booking-form-section">
          <HStack spacing={3} mb={4} justify="space-between">
            <HStack spacing={3}>
              <Icon as={FaMapMarkerAlt} color="brand.500" />
              <Text fontSize="lg" fontWeight="semibold" color="brand.500">
                Pickup Address
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Button
                size="sm"
                leftIcon={<FaCrosshairs />}
                variant="outline"
                onClick={() => useCurrentLocation('pickup')}
                isLoading={isGettingLocation}
                loadingText="Detecting..."
                isMobileFriendly={true}
              >
                Use Current Location
              </Button>
              <Button
                size="sm"
                leftIcon={<FaEdit />}
                variant={pickupManualMode ? "primary" : "outline"}
                colorScheme={pickupManualMode ? "neon" : "gray"}
                onClick={() => setPickupManualMode(!pickupManualMode)}
              >
                {pickupManualMode ? "Auto-complete" : "Manual Input"}
              </Button>
            </HStack>
          </HStack>
          
          <VStack spacing={4}>
            {!pickupManualMode ? (
              <FormControl isInvalid={!!errors.pickupLine1} className="booking-form-control">
                <FormLabel>
                  Street Address
                  <Tooltip label="Search by street name, postcode, or city name in any order. Address suggestions will appear as you type." placement="top">
                    <Box as="span" display="inline-block" ml={2}>
                      <Icon as={FaInfoCircle} color="gray.400" cursor="help" />
                    </Box>
                  </Tooltip>
                </FormLabel>
                
                <Text fontSize="xs" color="text.secondary" mb={2} fontStyle="italic">
                  💡 Start typing to see address suggestions • You can search by street name, postcode, or city name in any order
                </Text>
                
                <AddressAutocomplete
                  value={pickupSearch}
                  onChange={(value) => {
                    console.log('Pickup search onChange:', value);
                    setPickupSearch(value);
                    // Only update line1 during search, not during selection
                    if (!value.includes(',')) {
                      updatePickupAddress('line1', value);
                    }
                  }}
                  onSelect={handlePickupAddressSelect}
                  placeholder="Search by street name, postcode, or city..."
                  size="lg"
                  className="booking-input"
                />
                
                <Text fontSize="xs" color="text.secondary" mt={1} fontStyle="italic">
                  💡 Tip: Try searching by postcode first (e.g., "SW1A", "M1", "B1") for faster results
                </Text>
              </FormControl>
            ) : (
              <FormControl isInvalid={!!errors.pickupLine1} className="booking-form-control">
                <FormLabel>Street Address</FormLabel>
                <Textarea
                  placeholder="Enter your full street address..."
                  value={bookingData.pickupAddress?.line1 || ''}
                  onChange={(e) => updatePickupAddress('line1', e.target.value)}
                  size="lg"
                  rows={3}
                  className="booking-input"
                />
                <FormErrorMessage>{errors.pickupLine1}</FormErrorMessage>
              </FormControl>
            )}

            <HStack spacing={4} w="full" className="booking-form-row">
              <FormControl isInvalid={!!errors.pickupCity} className="booking-form-control">
                <FormLabel>City</FormLabel>
                <InputGroup>
                  <Input
                    placeholder="e.g., London"
                    value={bookingData.pickupAddress?.city || ''}
                    onChange={(e) => updatePickupAddress('city', e.target.value)}
                    size="lg"
                    className="booking-input"
                  />
                  {pickupValidation.city && (
                    <InputRightElement>
                      <Icon as={FaCheck} color="green.400" />
                    </InputRightElement>
                  )}
                </InputGroup>
                <FormErrorMessage>{errors.pickupCity}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.pickupPostcode} className="booking-form-control">
                <FormLabel>Postcode</FormLabel>
                <InputGroup>
                  <Input
                    placeholder="e.g., SW1A 2AA"
                    value={bookingData.pickupAddress?.postcode || ''}
                    onChange={(e) => handlePostcodeChange(e.target.value, 'pickup')}
                    size="lg"
                    className="booking-input"
                  />
                  {pickupValidation.postcode && (
                    <InputRightElement>
                      <Icon as={FaCheck} color="green.400" />
                    </InputRightElement>
                  )}
                </InputGroup>
                <FormErrorMessage>{errors.pickupPostcode}</FormErrorMessage>
              </FormControl>
            </HStack>

            <HStack mt={2} spacing={2}>
              {pickupValidation.line1 && (
                <Badge colorScheme="green" size="sm">
                  <Icon as={FaCheck} mr={1} /> Street Address
                </Badge>
              )}
              {pickupValidation.city && (
                <Badge colorScheme="green" size="sm">
                  <Icon as={FaCheck} mr={1} /> City
                </Badge>
              )}
              {pickupValidation.postcode && (
                <Badge colorScheme="green" size="sm">
                  <Icon as={FaCheck} mr={1} /> Postcode
                </Badge>
              )}
            </HStack>
          </VStack>
        </Box>

        <Divider className="booking-divider" />

        {/* Dropoff Address */}
        <Box className="booking-form-section">
          <HStack spacing={3} mb={4} justify="space-between">
            <HStack spacing={3}>
              <Icon as={FaArrowRight} color="neon.500" />
              <Text fontSize="lg" fontWeight="semibold" color="neon.500">
                Dropoff Address
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Button
                size="sm"
                leftIcon={<FaCrosshairs />}
                variant="outline"
                onClick={() => useCurrentLocation('dropoff')}
                isLoading={isGettingLocation}
                loadingText="Detecting..."
                isMobileFriendly={true}
              >
                Use Current Location
              </Button>
              <Button
                size="sm"
                leftIcon={<FaEdit />}
                variant={dropoffManualMode ? "primary" : "outline"}
                colorScheme={dropoffManualMode ? "neon" : "gray"}
                onClick={() => setDropoffManualMode(!dropoffManualMode)}
              >
                {dropoffManualMode ? "Auto-complete" : "Manual Input"}
              </Button>
            </HStack>
          </HStack>
          
          <VStack spacing={4}>
            {!dropoffManualMode ? (
              <FormControl isInvalid={!!errors.dropoffLine1} className="booking-form-control">
                <FormLabel>
                  Street Address
                  <Tooltip label="Search by street name, postcode, or city name in any order. Address suggestions will appear as you type." placement="top">
                    <Box as="span" display="inline-block" ml={2}>
                      <Icon as={FaInfoCircle} color="gray.400" cursor="help" />
                    </Box>
                  </Tooltip>
                </FormLabel>
                
                <Text fontSize="xs" color="text.secondary" mb={2} fontStyle="italic">
                  💡 Start typing to see address suggestions • You can search by street name, postcode, or city name in any order
                </Text>
                
                <AddressAutocomplete
                  value={dropoffSearch}
                  onChange={(value) => {
                    console.log('Dropoff search onChange:', value);
                    setDropoffSearch(value);
                    // Only update line1 during search, not during selection
                    if (!value.includes(',')) {
                      updateDropoffAddress('line1', value);
                    }
                  }}
                  onSelect={handleDropoffAddressSelect}
                  placeholder="Search by street name, postcode, or city..."
                  size="lg"
                  className="booking-input"
                />
                
                <Text fontSize="xs" color="text.secondary" mt={1} fontStyle="italic">
                  💡 Tip: Try searching by postcode first (e.g., "SW1A", "M1", "B1") for faster results
                </Text>
              </FormControl>
            ) : (
              <FormControl isInvalid={!!errors.dropoffLine1} className="booking-form-control">
                <FormLabel>Street Address</FormLabel>
                <Textarea
                  placeholder="Enter your full street address..."
                  value={bookingData.dropoffAddress?.line1 || ''}
                  onChange={(e) => updateDropoffAddress('line1', e.target.value)}
                  size="lg"
                  rows={3}
                  className="booking-input"
                />
                <FormErrorMessage>{errors.dropoffLine1}</FormErrorMessage>
              </FormControl>
            )}

            <HStack spacing={4} w="full" className="booking-form-row">
              <FormControl isInvalid={!!errors.dropoffCity} className="booking-form-control">
                <FormLabel>City</FormLabel>
                <InputGroup>
                  <Input
                    placeholder="e.g., Manchester"
                    value={bookingData.dropoffAddress?.city || ''}
                    onChange={(e) => updateDropoffAddress('city', e.target.value)}
                    size="lg"
                    className="booking-input"
                  />
                  {dropoffValidation.city && (
                    <InputRightElement>
                      <Icon as={FaCheck} color="green.400" />
                    </InputRightElement>
                  )}
                </InputGroup>
                <FormErrorMessage>{errors.dropoffCity}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.dropoffPostcode} className="booking-form-control">
                <FormLabel>Postcode</FormLabel>
                <InputGroup>
                  <Input
                    placeholder="e.g., M1 1AA"
                    value={bookingData.dropoffAddress?.postcode || ''}
                    onChange={(e) => handlePostcodeChange(e.target.value, 'dropoff')}
                    size="lg"
                    className="booking-input"
                  />
                  {dropoffValidation.postcode && (
                    <InputRightElement>
                      <Icon as={FaCheck} color="green.400" />
                    </InputRightElement>
                  )}
                </InputGroup>
                <FormErrorMessage>{errors.dropoffPostcode}</FormErrorMessage>
              </FormControl>
            </HStack>

            <HStack mt={2} spacing={2}>
              {dropoffValidation.line1 && (
                <Badge colorScheme="green" size="sm">
                  <Icon as={FaCheck} mr={1} /> Street Address
                </Badge>
              )}
              {dropoffValidation.city && (
                <Badge colorScheme="green" size="sm">
                  <Icon as={FaCheck} mr={1} /> City
                </Badge>
              )}
              {dropoffValidation.postcode && (
                <Badge colorScheme="green" size="sm">
                  <Icon as={FaCheck} mr={1} /> Postcode
                </Badge>
              )}
            </HStack>
          </VStack>
        </Box>

        {/* Form Completion Status */}
        <Box textAlign="center" p={4} bg="gray.50" borderRadius="md">
          <Text fontSize="sm" color="text.secondary">
            💡 Complete both pickup and dropoff addresses to continue
          </Text>
          <Text fontSize="xs" color="text.secondary" mt={1}>
            All fields marked with green checkmarks are required
          </Text>
        </Box>

        {/* Navigation Buttons */}
        <BookingNavigationButtons
          onNext={handleNext}
          onBack={onBack}
          nextText="Continue to Property Details"
          nextDisabled={false}
          backDisabled={!onBack}
        />
      </VStack>
    </Box>
  );
}
