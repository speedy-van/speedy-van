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
  Textarea,
  SimpleGrid
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaArrowRight, FaCrosshairs, FaCheck, FaInfoCircle, FaEdit, FaLocationArrow, FaSearch, FaGlobe, FaMapPin } from 'react-icons/fa';
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
    <Box p={6} borderWidth="1px" borderRadius="xl" bg="bg.card" borderColor="border.primary" boxShadow="md" className="booking-step-card">
      <VStack spacing={8} align="stretch">
        {/* Enhanced Header */}
        <Box textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="neon.500" textShadow="0 0 10px rgba(0,194,255,0.3)">
            Step 1: Pickup & Dropoff Addresses
          </Text>
          <Text fontSize="md" color="text.secondary" mt={3} maxW="600px" mx="auto">
            Tell us where to collect your items and where to deliver them
          </Text>
        </Box>

        {/* Enhanced Location Error Alert */}
        {locationError && (
          <Box 
            p={5}
            borderWidth="2px"
            borderRadius="xl"
            borderColor="red.400"
            bg="red.50"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: "xl",
              background: "linear-gradient(135deg, rgba(245,101,101,0.1), rgba(245,101,101,0.05))",
              pointerEvents: "none"
            }}
          >
            <HStack spacing={4} position="relative" zIndex={1}>
              <AlertIcon as={FaInfoCircle} color="red.500" />
              <Text fontSize="sm" color="red.700" fontWeight="medium">
                {locationError}
              </Text>
            </HStack>
          </Box>
        )}

        {/* Enhanced Pickup Address Section */}
        <Box 
          p={6}
          borderWidth="2px"
          borderRadius="xl"
          borderColor="border.primary"
          bg="dark.700"
          position="relative"
          overflow="hidden"
          transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
          _hover={{
            borderColor: "brand.400",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}
        >
          {/* Background Pattern */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="linear-gradient(135deg, rgba(0,209,143,0.05), rgba(0,194,255,0.05))"
            borderRadius="xl"
            zIndex={0}
          />
          
          <VStack spacing={6} position="relative" zIndex={1}>
            {/* Section Header */}
            <HStack spacing={4} justify="space-between" w="full" flexWrap={{ base: "wrap", md: "nowrap" }}>
              <HStack spacing={4}>
                <Icon as={FaMapMarkerAlt} color="brand.500" boxSize={7} />
                <VStack spacing={1} align="start">
                  <Text fontSize="xl" fontWeight="bold" color="brand.500">
                    📦 Pickup Address
                  </Text>
                  <Text fontSize="sm" color="text.secondary">
                    Where we'll collect your items
                  </Text>
                </VStack>
              </HStack>
              
              {/* Enhanced Action Buttons */}
              <HStack spacing={3} flexWrap={{ base: "wrap", md: "nowrap" }}>
                <Button
                  size="md"
                  leftIcon={<FaCrosshairs />}
                  variant="outline"
                  colorScheme="brand"
                  onClick={() => useCurrentLocation('pickup')}
                  isLoading={isGettingLocation}
                  loadingText="Detecting..."
                  isMobileFriendly={true}
                  _hover={{
                    bg: "brand.50",
                    borderColor: "brand.400",
                    transform: "translateY(-1px)"
                  }}
                >
                  Use Current Location
                </Button>
                <Button
                  size="md"
                  leftIcon={<FaEdit />}
                  variant={pickupManualMode ? "primary" : "outline"}
                  colorScheme={pickupManualMode ? "brand" : "gray"}
                  onClick={() => setPickupManualMode(!pickupManualMode)}
                  _hover={{
                    transform: "translateY(-1px)"
                  }}
                >
                  {pickupManualMode ? "Auto-complete" : "Manual Input"}
                </Button>
              </HStack>
            </HStack>
            
            {/* Address Input Section */}
            <VStack spacing={5} w="full">
              {!pickupManualMode ? (
                <FormControl isInvalid={!!errors.pickupLine1}>
                  <FormLabel fontSize="md" fontWeight="semibold" color="text.primary" mb={3}>
                    <HStack spacing={2}>
                      <Icon as={FaSearch} color="brand.400" />
                      <Text>Street Address</Text>
                      <Tooltip label="Search by street name, postcode, or city name in any order. Address suggestions will appear as you type." placement="top">
                        <Box as="span" display="inline-block">
                          <Icon as={FaInfoCircle} color="brand.400" cursor="help" />
                        </Box>
                      </Tooltip>
                    </HStack>
                  </FormLabel>
                  
                  <Box 
                    p={4}
                    borderWidth="2px"
                    borderColor="border.primary"
                    borderRadius="xl"
                    bg="dark.600"
                    _focusWithin={{
                      borderColor: "brand.400",
                      boxShadow: "0 0 0 1px rgba(0,209,143,0.2)"
                    }}
                  >
                    <Text fontSize="sm" color="brand.300" mb={3} fontStyle="italic">
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
                    
                    <Text fontSize="xs" color="text.secondary" mt={3} fontStyle="italic">
                      💡 Tip: Try searching by postcode first (e.g., "SW1A", "M1", "B1") for faster results
                    </Text>
                  </Box>
                </FormControl>
              ) : (
                <FormControl isInvalid={!!errors.pickupLine1}>
                  <FormLabel fontSize="md" fontWeight="semibold" color="text.primary" mb={3}>
                    <HStack spacing={2}>
                      <Icon as={FaEdit} color="brand.400" />
                      <Text>Street Address</Text>
                    </HStack>
                  </FormLabel>
                  <Textarea
                    placeholder="Enter your full street address..."
                    value={bookingData.pickupAddress?.line1 || ''}
                    onChange={(e) => updatePickupAddress('line1', e.target.value)}
                    size="lg"
                    rows={3}
                    borderWidth="2px"
                    borderColor="border.primary"
                    borderRadius="xl"
                    bg="dark.600"
                    _focus={{
                      borderColor: "brand.400",
                      boxShadow: "0 0 0 1px rgba(0,209,143,0.2)"
                    }}
                  />
                  <FormErrorMessage>{errors.pickupLine1}</FormErrorMessage>
                </FormControl>
              )}

              {/* City and Postcode Fields */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} w="full">
                <FormControl isInvalid={!!errors.pickupCity}>
                  <FormLabel fontSize="md" fontWeight="semibold" color="text.primary" mb={3}>
                    <HStack spacing={2}>
                      <Icon as={FaGlobe} color="brand.400" />
                      <Text>City</Text>
                    </HStack>
                  </FormLabel>
                  <InputGroup>
                    <Input
                      placeholder="e.g., London"
                      value={bookingData.pickupAddress?.city || ''}
                      onChange={(e) => updatePickupAddress('city', e.target.value)}
                      size="lg"
                      borderWidth="2px"
                      borderColor="border.primary"
                      borderRadius="xl"
                      bg="dark.600"
                      _focus={{
                        borderColor: "brand.400",
                        boxShadow: "0 0 0 1px rgba(0,209,143,0.2)"
                      }}
                    />
                    {pickupValidation.city && (
                      <InputRightElement>
                        <Icon as={FaCheck} color="green.400" />
                      </InputRightElement>
                    )}
                  </InputGroup>
                  <FormErrorMessage>{errors.pickupCity}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.pickupPostcode}>
                  <FormLabel fontSize="md" fontWeight="semibold" color="text.primary" mb={3}>
                    <HStack spacing={2}>
                      <Icon as={FaMapPin} color="brand.400" />
                      <Text>Postcode</Text>
                    </HStack>
                  </FormLabel>
                  <InputGroup>
                    <Input
                      placeholder="e.g., SW1A 2AA"
                      value={bookingData.pickupAddress?.postcode || ''}
                      onChange={(e) => handlePostcodeChange(e.target.value, 'pickup')}
                      size="lg"
                      borderWidth="2px"
                      borderColor="border.primary"
                      borderRadius="xl"
                      bg="dark.600"
                      _focus={{
                        borderColor: "brand.400",
                        boxShadow: "0 0 0 1px rgba(0,209,143,0.2)"
                      }}
                    />
                    {pickupValidation.postcode && (
                      <InputRightElement>
                        <Icon as={FaCheck} color="green.400" />
                      </InputRightElement>
                    )}
                  </InputGroup>
                  <FormErrorMessage>{errors.pickupPostcode}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>

              {/* Enhanced Validation Badges */}
              <HStack spacing={3} flexWrap="wrap" justify="center">
                {pickupValidation.line1 && (
                  <Badge colorScheme="green" size="md" variant="solid" px={3} py={2}>
                    <Icon as={FaCheck} mr={2} /> Street Address
                  </Badge>
                )}
                {pickupValidation.city && (
                  <Badge colorScheme="green" size="md" variant="solid" px={3} py={2}>
                    <Icon as={FaCheck} mr={2} /> City
                  </Badge>
                )}
                {pickupValidation.postcode && (
                  <Badge colorScheme="green" size="md" variant="solid" px={3} py={2}>
                    <Icon as={FaCheck} mr={2} /> Postcode
                  </Badge>
                )}
              </HStack>
            </VStack>
          </VStack>
        </Box>

        <Divider borderColor="border.primary" />

        {/* Enhanced Dropoff Address Section */}
        <Box 
          p={6}
          borderWidth="2px"
          borderRadius="xl"
          borderColor="border.primary"
          bg="dark.700"
          position="relative"
          overflow="hidden"
          transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
          _hover={{
            borderColor: "neon.400",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}
        >
          {/* Background Pattern */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="linear-gradient(135deg, rgba(0,194,255,0.05), rgba(0,209,143,0.05))"
            borderRadius="xl"
            zIndex={0}
          />
          
          <VStack spacing={6} position="relative" zIndex={1}>
            {/* Section Header */}
            <HStack spacing={4} justify="space-between" w="full" flexWrap={{ base: "wrap", md: "nowrap" }}>
              <HStack spacing={4}>
                <Icon as={FaArrowRight} color="neon.500" boxSize={7} />
                <VStack spacing={1} align="start">
                  <Text fontSize="xl" fontWeight="bold" color="neon.500">
                    🎯 Dropoff Address
                  </Text>
                  <Text fontSize="sm" color="text.secondary">
                    Where we'll deliver your items
                  </Text>
                </VStack>
              </HStack>
              
              {/* Enhanced Action Buttons */}
              <HStack spacing={3} flexWrap={{ base: "wrap", md: "nowrap" }}>
                <Button
                  size="md"
                  leftIcon={<FaCrosshairs />}
                  variant="outline"
                  colorScheme="neon"
                  onClick={() => useCurrentLocation('dropoff')}
                  isLoading={isGettingLocation}
                  loadingText="Detecting..."
                  isMobileFriendly={true}
                  _hover={{
                    bg: "neon.50",
                    borderColor: "neon.400",
                    transform: "translateY(-1px)"
                  }}
                >
                  Use Current Location
                </Button>
                <Button
                  size="md"
                  leftIcon={<FaEdit />}
                  variant={dropoffManualMode ? "primary" : "outline"}
                  colorScheme={dropoffManualMode ? "neon" : "gray"}
                  onClick={() => setDropoffManualMode(!dropoffManualMode)}
                  _hover={{
                    transform: "translateY(-1px)"
                  }}
                >
                  {dropoffManualMode ? "Auto-complete" : "Manual Input"}
                </Button>
              </HStack>
            </HStack>
            
            {/* Address Input Section */}
            <VStack spacing={5} w="full">
              {!dropoffManualMode ? (
                <FormControl isInvalid={!!errors.dropoffLine1}>
                  <FormLabel fontSize="md" fontWeight="semibold" color="text.primary" mb={3}>
                    <HStack spacing={2}>
                      <Icon as={FaSearch} color="neon.400" />
                      <Text>Street Address</Text>
                      <Tooltip label="Search by street name, postcode, or city name in any order. Address suggestions will appear as you type." placement="top">
                        <Box as="span" display="inline-block">
                          <Icon as={FaInfoCircle} color="neon.400" cursor="help" />
                        </Box>
                      </Tooltip>
                    </HStack>
                  </FormLabel>
                  
                  <Box 
                    p={4}
                    borderWidth="2px"
                    borderColor="border.primary"
                    borderRadius="xl"
                    bg="dark.600"
                    _focusWithin={{
                      borderColor: "neon.400",
                      boxShadow: "0 0 0 1px rgba(0,194,255,0.2)"
                    }}
                  >
                    <Text fontSize="sm" color="neon.300" mb={3} fontStyle="italic">
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
                    
                    <Text fontSize="xs" color="text.secondary" mt={3} fontStyle="italic">
                      💡 Tip: Try searching by postcode first (e.g., "SW1A", "M1", "B1") for faster results
                    </Text>
                  </Box>
                </FormControl>
              ) : (
                <FormControl isInvalid={!!errors.dropoffLine1}>
                  <FormLabel fontSize="md" fontWeight="semibold" color="text.primary" mb={3}>
                    <HStack spacing={2}>
                      <Icon as={FaEdit} color="neon.400" />
                      <Text>Street Address</Text>
                    </HStack>
                  </FormLabel>
                  <Textarea
                    placeholder="Enter your full street address..."
                    value={bookingData.dropoffAddress?.line1 || ''}
                    onChange={(e) => updateDropoffAddress('line1', e.target.value)}
                    size="lg"
                    rows={3}
                    borderWidth="2px"
                    borderColor="border.primary"
                    borderRadius="xl"
                    bg="dark.600"
                    _focus={{
                      borderColor: "neon.400",
                      boxShadow: "0 0 0 1px rgba(0,194,255,0.2)"
                    }}
                  />
                  <FormErrorMessage>{errors.dropoffLine1}</FormErrorMessage>
                </FormControl>
              )}

              {/* City and Postcode Fields */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} w="full">
                <FormControl isInvalid={!!errors.dropoffCity}>
                  <FormLabel fontSize="md" fontWeight="semibold" color="text.primary" mb={3}>
                    <HStack spacing={2}>
                      <Icon as={FaGlobe} color="neon.400" />
                      <Text>City</Text>
                    </HStack>
                  </FormLabel>
                  <InputGroup>
                    <Input
                      placeholder="e.g., Manchester"
                      value={bookingData.dropoffAddress?.city || ''}
                      onChange={(e) => updateDropoffAddress('city', e.target.value)}
                      size="lg"
                      borderWidth="2px"
                      borderColor="border.primary"
                      borderRadius="xl"
                      bg="dark.600"
                      _focus={{
                        borderColor: "neon.400",
                        boxShadow: "0 0 0 1px rgba(0,194,255,0.2)"
                      }}
                    />
                    {dropoffValidation.city && (
                      <InputRightElement>
                        <Icon as={FaCheck} color="green.400" />
                      </InputRightElement>
                    )}
                  </InputGroup>
                  <FormErrorMessage>{errors.dropoffCity}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.dropoffPostcode}>
                  <FormLabel fontSize="md" fontWeight="semibold" color="text.primary" mb={3}>
                    <HStack spacing={2}>
                      <Icon as={FaMapPin} color="neon.400" />
                      <Text>Postcode</Text>
                    </HStack>
                  </FormLabel>
                  <InputGroup>
                    <Input
                      placeholder="e.g., M1 1AA"
                      value={bookingData.dropoffAddress?.postcode || ''}
                      onChange={(e) => handlePostcodeChange(e.target.value, 'dropoff')}
                      size="lg"
                      borderWidth="2px"
                      borderColor="border.primary"
                      borderRadius="xl"
                      bg="dark.600"
                      _focus={{
                        borderColor: "neon.400",
                        boxShadow: "0 0 0 1px rgba(0,194,255,0.2)"
                      }}
                    />
                    {dropoffValidation.postcode && (
                      <InputRightElement>
                        <Icon as={FaCheck} color="green.400" />
                      </InputRightElement>
                    )}
                  </InputGroup>
                  <FormErrorMessage>{errors.dropoffPostcode}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>

              {/* Enhanced Validation Badges */}
              <HStack spacing={3} flexWrap="wrap" justify="center">
                {dropoffValidation.line1 && (
                  <Badge colorScheme="green" size="md" variant="solid" px={3} py={2}>
                    <Icon as={FaCheck} mr={2} /> Street Address
                  </Badge>
                )}
                {dropoffValidation.city && (
                  <Badge colorScheme="green" size="md" variant="solid" px={3} py={2}>
                    <Icon as={FaCheck} mr={2} /> City
                  </Badge>
                )}
                {dropoffValidation.postcode && (
                  <Badge colorScheme="green" size="md" variant="solid" px={3} py={2}>
                    <Icon as={FaCheck} mr={2} /> Postcode
                  </Badge>
                )}
              </HStack>
            </VStack>
          </VStack>
        </Box>

        {/* Enhanced Form Completion Status */}
        <Box 
          p={6}
          borderWidth="2px"
          borderRadius="xl"
          borderColor="border.primary"
          bg="dark.700"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "xl",
            background: "linear-gradient(135deg, rgba(0,194,255,0.05), rgba(0,209,143,0.05))",
            pointerEvents: "none"
          }}
        >
          <VStack spacing={3} position="relative" zIndex={1}>
            <HStack spacing={3}>
              <Icon as={FaInfoCircle} color="neon.400" />
              <Text fontSize="md" fontWeight="semibold" color="neon.400">
                📋 Form Completion Status
              </Text>
            </HStack>
            <Text fontSize="sm" color="text.secondary" textAlign="center">
              Complete both pickup and dropoff addresses to continue
            </Text>
            <Text fontSize="xs" color="text.tertiary" textAlign="center">
              All fields marked with green checkmarks are required
            </Text>
          </VStack>
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
