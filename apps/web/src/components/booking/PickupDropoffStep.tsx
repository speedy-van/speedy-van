/* eslint-disable no-console */
"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  AlertIcon
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaArrowRight, FaCrosshairs } from 'react-icons/fa';
import { validateUKPostcode, formatUKPostcode, getCurrentLocation, getAddressFromCoordinates } from '@/lib/addressService';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import BookingNavigationButtons from './BookingNavigationButtons';
import Button from '@/components/common/Button';
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN } from "@/lib/mapbox";

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
  // ULTRA SIMPLE LOGS FOR PRODUCTION
  console.log('STEP1_LOADED');
  console.log('TIME:', Date.now());
  console.log('BOOKING_DATA:', !!bookingData);
  
  // FORCE ALL LOG TYPES
  console.warn('WARNING_LOG');
  console.error('ERROR_LOG');
  console.info('INFO_LOG');
  
  // ADDITIONAL SIMPLE LOG
  console.log('COMPONENT_START');
  
  // States
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [pickupSearch, setPickupSearch] = useState(bookingData.pickupAddress?.line1 || '');
  const [dropoffSearch, setDropoffSearch] = useState(bookingData.dropoffAddress?.line1 || '');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [query, setQuery] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const toast = useToast();

  // Token must be public in production
  mapboxgl.accessToken = MAPBOX_TOKEN as string;

  // Debug in prod if token missing
  if (!MAPBOX_TOKEN) {
    console.warn("❗ Missing NEXT_PUBLIC_MAPBOX_TOKEN (booking step1)");
  }

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

  // Debounced autocomplete with hard logs to verify handler runs in prod
  useEffect(() => {
    console.log("USE_EFFECT_RUNNING");
    console.log("QUERY_VALUE:", query);
    if (!query) return;
    console.log("TYPING_DETECTED:", query);
    console.warn("WARNING: Typing detected:", query);
    console.error("ERROR: Typing detected:", query);
    
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const t = setTimeout(async () => {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?autocomplete=true&limit=5&access_token=${MAPBOX_TOKEN}`;
        console.log("[Step1] fetch:", url);
        console.warn("⚠️ [Step1] WARNING - fetch started:", url);
        const res = await fetch(url, { signal: ac.signal });
        console.log("[Step1] status:", res.status);
        console.warn("⚠️ [Step1] WARNING - status:", res.status);
        if (!res.ok) return;
        const data = await res.json();
        console.log("[Step1] features:", data?.features?.length ?? 0);
        console.warn("⚠️ [Step1] WARNING - features:", data?.features?.length ?? 0);
        // TODO: set options to your suggestions state here
      } catch (e) {
        if ((e as any)?.name !== "AbortError") {
          console.warn("[Step1] fetch error:", e);
          console.error("❌ [Step1] ERROR - fetch failed:", e);
        }
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

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

  console.log('[PickupDropoffStep] Rendering component');
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
          </HStack>
          
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.pickupLine1} className="booking-form-control">
              <FormLabel>Street Address</FormLabel>
              <AddressAutocomplete
                value={pickupSearch}
                                 onChange={(value) => {
                   console.log('PICKUP_ONCHANGE:', value);
                   console.log('PICKUP_TYPE:', typeof value);
                   setPickupSearch(value);
                   setQuery(value);
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

            <HStack spacing={4} w="full" className="booking-form-row">
              <FormControl isInvalid={!!errors.pickupCity} className="booking-form-control">
                <FormLabel>City</FormLabel>
                <Input
                  placeholder="e.g., London"
                  value={bookingData.pickupAddress?.city || ''}
                  onChange={(e) => updatePickupAddress('city', e.target.value)}
                  size="lg"
                  className="booking-input"
                />
                <FormErrorMessage>{errors.pickupCity}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.pickupPostcode} className="booking-form-control">
                <FormLabel>Postcode</FormLabel>
                <Input
                  placeholder="e.g., SW1A 2AA"
                  value={bookingData.pickupAddress?.postcode || ''}
                  onChange={(e) => handlePostcodeChange(e.target.value, 'pickup')}
                  size="lg"
                  className="booking-input"
                />
                <FormErrorMessage>{errors.pickupPostcode}</FormErrorMessage>
              </FormControl>
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
          </HStack>
          
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.dropoffLine1} className="booking-form-control">
              <FormLabel>Street Address</FormLabel>
              <AddressAutocomplete
                value={dropoffSearch}
                                 onChange={(value) => {
                   console.log('DROPOFF_ONCHANGE:', value);
                   console.log('DROPOFF_TYPE:', typeof value);
                   setDropoffSearch(value);
                   setQuery(value);
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

            <HStack spacing={4} w="full" className="booking-form-row">
              <FormControl isInvalid={!!errors.dropoffCity} className="booking-form-control">
                <FormLabel>City</FormLabel>
                <Input
                  placeholder="e.g., Manchester"
                  value={bookingData.dropoffAddress?.city || ''}
                  onChange={(e) => updateDropoffAddress('city', e.target.value)}
                  size="lg"
                  className="booking-input"
                />
                <FormErrorMessage>{errors.dropoffCity}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.dropoffPostcode} className="booking-form-control">
                <FormLabel>Postcode</FormLabel>
                <Input
                  placeholder="e.g., M1 1AA"
                  value={bookingData.dropoffAddress?.postcode || ''}
                  onChange={(e) => handlePostcodeChange(e.target.value, 'dropoff')}
                  size="lg"
                  className="booking-input"
                />
                <FormErrorMessage>{errors.dropoffPostcode}</FormErrorMessage>
              </FormControl>
            </HStack>
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
