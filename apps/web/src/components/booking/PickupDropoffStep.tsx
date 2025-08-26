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

  const handlePickupAddressSelect = useCallback((address: any) => {
    console.log('Pickup address selected:', address);
    updateBookingData({
      pickupAddress: {
        line1: address.address?.line1 || address.line1 || '',
        city: address.address?.city || address.city || '',
        postcode: address.address?.postcode || address.postcode || '',
        coordinates: address.coords || address.coordinates
      }
    });
    // Update the search field with the selected address label
    setPickupSearch(address.label || address.address?.line1 || '');
  }, [updateBookingData]);

  const handleDropoffAddressSelect = useCallback((address: any) => {
    console.log('Dropoff address selected:', address);
    updateBookingData({
      dropoffAddress: {
        line1: address.address?.line1 || address.line1 || '',
        city: address.address?.city || address.city || '',
        postcode: address.address?.postcode || address.postcode || '',
        coordinates: address.coords || address.coordinates
      }
    });
    // Update the search field with the selected address label
    setDropoffSearch(address.label || address.address?.line1 || '');
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
      // Check if we're on a mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Show mobile-specific guidance
        toast({
          title: 'Getting your location...',
          description: 'Please allow location access when prompted by your browser',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
      
      const position = await getCurrentLocation();
      const address = await getAddressFromCoordinates(position.coords.latitude, position.coords.longitude);
      
      if (address) {
        if (type === 'pickup') {
          updateBookingData({
            pickupAddress: {
              line1: address.line1 || '',
              city: address.city || '',
              postcode: address.postcode || '',
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            }
          });
          setPickupSearch(address.line1 || '');
        } else {
          updateBookingData({
            dropoffAddress: {
              line1: address.line1 || '',
              city: address.city || '',
              postcode: address.postcode || '',
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            }
          });
          setDropoffSearch(address.line1 || '');
        }
        
        toast({
          title: 'Location detected successfully',
          description: `Using your current location for ${type} address`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Could not resolve address from coordinates');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      
      let errorMessage = 'Could not detect your location. Please enter manually or check your browser permissions.';
      
      // Provide more specific error messages for mobile
      if (error instanceof Error) {
        if (error.message.includes('HTTPS')) {
          errorMessage = 'Location access requires a secure connection (HTTPS). Please use a secure connection or enter address manually.';
        } else if (error.message.includes('permission denied')) {
          errorMessage = 'Location permission denied. Please allow location access in your browser settings or enter address manually.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Location request timed out. Please check your GPS/network connection or enter address manually.';
        } else if (error.message.includes('unavailable')) {
          errorMessage = 'Location information unavailable. Please check your GPS/network connection or enter address manually.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setLocationError(errorMessage);
      toast({
        title: 'Location detection failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGettingLocation(false);
    }
  }, [updateBookingData, toast]);

  return (
    <Box className="booking-step-pickup-dropoff">
      <VStack spacing={{ base: 6, md: 8 }} align="stretch">
        {/* Location Error Alert */}
        {locationError && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">{locationError}</Text>
          </Alert>
        )}

        {/* Pickup Address */}
        <Box className="booking-form-section">
          <HStack spacing={3} mb={4} justify="space-between" flexWrap={{ base: "wrap", md: "nowrap" }}>
            <HStack spacing={3}>
              <Icon as={FaMapMarkerAlt} color="neon.500" />
              <Text fontSize="lg" fontWeight="semibold" color="neon.500">
                Pickup Address
              </Text>
            </HStack>
            <HStack spacing={2} flexWrap={{ base: "wrap", md: "nowrap" }}>
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
                    // Only update line1 during search if it's a short query (not a full address)
                    // This prevents overwriting selected address data
                    if (value.length < 50 && !value.includes(',')) {
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

            <VStack spacing={4} w="full" className="booking-form-row">
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
            </VStack>

            <HStack mt={2} spacing={2} flexWrap="wrap">
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
          <HStack spacing={3} mb={4} justify="space-between" flexWrap={{ base: "wrap", md: "nowrap" }}>
            <HStack spacing={3}>
              <Icon as={FaArrowRight} color="neon.500" />
              <Text fontSize="lg" fontWeight="semibold" color="neon.500">
                Dropoff Address
              </Text>
            </HStack>
            <HStack spacing={2} flexWrap={{ base: "wrap", md: "nowrap" }}>
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

            <VStack spacing={4} w="full" className="booking-form-row">
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
            </VStack>

            <HStack mt={2} spacing={2} flexWrap="wrap">
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
          <Text fontSize="xs" color="text.secondary">
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
