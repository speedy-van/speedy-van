'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  IconButton,
  useToast,
  Divider,
  Icon,
  SimpleGrid,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  FormLabel,
  FormControl,
  FormErrorMessage,
  Badge,
  Flex,
  Card,
  CardBody,
  Circle,
  Collapse,
  useDisclosure,
  Progress,
} from '@chakra-ui/react';

import {
  FaMapMarkerAlt,
  FaBolt,
  FaTrash,
  FaBuilding,
  FaParking,
  FaTags,
  FaCalendarAlt,
  FaClock,
  FaCheck,
} from 'react-icons/fa';
import { MdElevator } from 'react-icons/md';

import type { FormData } from '../hooks/useBookingForm';
import type { Item } from '../../../lib/booking/utils';
import { COMPREHENSIVE_CATALOG, CATALOG_CATEGORIES } from '../../../lib/pricing/catalog-dataset';
import { POPULAR_ITEMS, getPopularItems, convertPopularToItem } from '../../../lib/items/popular-items';
import { searchItems } from '../../../lib/search/smart-search';
import ItemImageDisplay from './ItemImageDisplay';
import SmartSearchBox from './SmartSearchBox';
import AddressAutocomplete, { type SelectedAddress } from '../../../components/AddressAutocomplete';
import { useEnterprisePricing, transformBookingToEnterprisePricingRequest } from '../../../lib/hooks/use-enterprise-pricing';
import { kilometersToMiles } from '../../../lib/utils/distance-calculator';
import {
  roundToTwoDecimals,
  calculateRequiredWorkers,
  convertCatalogToItems,
  calculateTotals,
  deepEqual,
  buildEnhancedBookingData,
  calculatePropertySurcharges,
  calculateBuildingMultiplier,
  calculateWorkerSurcharge,
} from '../../../lib/booking/utils';

interface WhereAndWhatStepProps {
  formData: FormData;
  updateFormData: (step: keyof FormData, data: Partial<FormData[keyof FormData]>) => void;
  errors: Record<string, string>;
  onNext?: () => void;
}

export default function WhereAndWhatStep({
  formData,
  updateFormData,
  errors,
  onNext,
}: WhereAndWhatStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const { calculatePricing: calculateEnterprisePricing } = useEnterprisePricing();

  // Accordion states for mobile-friendly property details
  const { isOpen: isPickupDetailsOpen, onToggle: togglePickupDetails } = useDisclosure();
  const { isOpen: isDropoffDetailsOpen, onToggle: toggleDropoffDetails } = useDisclosure();

  const toast = useToast();
  const { step1 } = formData;

  // Memoized calculations
  const { totalWeight, totalVolume } = useMemo(() => 
    calculateTotals(step1.items), 
    [step1.items]
  );

  // Memoized display items with smart search
  const displayItems = useMemo(() => {
  const seenItems = new Set<string>();
    let items: Item[] = [];
  
  if (!searchTerm) {
    if (selectedCategory === 'popular') {
        items = POPULAR_ITEMS.map(convertPopularToItem);
    } else if (selectedCategory === 'all') {
        items = convertCatalogToItems(COMPREHENSIVE_CATALOG.slice(0, 20));
    } else {
      const popularItems = getPopularItems(selectedCategory).map(convertPopularToItem);
      const catalogItems = convertCatalogToItems(
        COMPREHENSIVE_CATALOG.filter(item => item.category === selectedCategory).slice(0, 10)
      );
      
      popularItems.forEach(item => {
        if (!seenItems.has(item.id)) {
            items.push(item);
          seenItems.add(item.id);
        }
      });
      
      catalogItems.forEach(item => {
        if (!seenItems.has(item.id)) {
            items.push(item);
          seenItems.add(item.id);
        }
      });
    }
  } else {
    const smartSearchResults = searchItems(searchTerm, 30);
    const filteredResults = selectedCategory !== 'all' && selectedCategory !== 'popular'
      ? smartSearchResults.filter(item => item.category === selectedCategory)
      : smartSearchResults;
    
    filteredResults.forEach(catalogItem => {
      if (!seenItems.has(catalogItem.id)) {
        const item = convertCatalogToItems([catalogItem])[0];
          items.push(item);
        seenItems.add(catalogItem.id);
      }
    });
  }

    return items;
  }, [searchTerm, selectedCategory]);

  // Callback functions for better performance
  const addItem = useCallback((item: Item) => {
    const existingItem = step1.items.find(i => i.id === item.id);
    if (existingItem) {
      updateFormData('step1', {
        items: step1.items.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * i.unitPrice }
            : i
        ),
      });
    } else {
      updateFormData('step1', {
        items: [...step1.items, { ...item, quantity: 1, totalPrice: item.unitPrice }],
      });
    }
  }, [step1.items, updateFormData]);

  const removeItem = useCallback((itemId: string) => {
    updateFormData('step1', {
      items: step1.items.filter(item => item.id !== itemId),
    });
  }, [step1.items, updateFormData]);

  const updateItemQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    const existingItem = step1.items.find(item => item.id === itemId);
    if (!existingItem) {
      return;
    }

    updateFormData('step1', {
      items: step1.items.map(item =>
        item.id === itemId
          ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
          : item
      ),
    });
  }, [step1.items, updateFormData, removeItem]);

  const addItems = useCallback((items: Item[]) => {
    const updatedItems = [...step1.items];
    
    items.forEach(newItem => {
      const existingIndex = updatedItems.findIndex(item => item.id === newItem.id);
      
      if (existingIndex >= 0) {
        const existing = updatedItems[existingIndex];
        updatedItems[existingIndex] = {
          ...existing,
          quantity: existing.quantity + newItem.quantity,
          totalPrice: (existing.quantity + newItem.quantity) * existing.unitPrice
        };
      } else {
        updatedItems.push({
          ...newItem,
          totalPrice: newItem.quantity * newItem.unitPrice
        });
      }
    });

    updateFormData('step1', { items: updatedItems });
  }, [step1.items, updateFormData]);

  const handleAddressSelect = useCallback((address: SelectedAddress, type: 'pickup' | 'dropoff') => {
    if (type === 'pickup') {
      updateFormData('step1', { pickupAddress: address });
    } else {
      updateFormData('step1', { dropoffAddress: address });
    }

    // Calculate distance and estimated duration when both addresses are available
    const currentPickup = type === 'pickup' ? address : step1.pickupAddress;
    const currentDropoff = type === 'dropoff' ? address : step1.dropoffAddress;
    
    if (currentPickup?.coordinates && currentDropoff?.coordinates &&
        currentPickup.coordinates.lat !== 0 && currentPickup.coordinates.lng !== 0 &&
        currentDropoff.coordinates.lat !== 0 && currentDropoff.coordinates.lng !== 0) {
      
      // Calculate distance using Haversine formula
      const R = 6371; // Earth's radius in kilometers
      const dLat = (currentDropoff.coordinates.lat - currentPickup.coordinates.lat) * Math.PI / 180;
      const dLng = (currentDropoff.coordinates.lng - currentPickup.coordinates.lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(currentPickup.coordinates.lat * Math.PI / 180) * Math.cos(currentDropoff.coordinates.lat * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distanceKm = R * c;
      const distanceMiles = distanceKm * 0.621371; // Convert to miles
      
      // Calculate estimated duration (assuming average speed of 30 mph in city)
      const estimatedDuration = Math.max(30, Math.round(distanceMiles / 30 * 60)); // Minimum 30 minutes
      
      updateFormData('step1', { 
        distance: Math.round(distanceMiles * 100) / 100, // Round to 2 decimal places
        estimatedDuration: estimatedDuration
      });
    }
  }, [updateFormData, step1.pickupAddress, step1.dropoffAddress]);

  // Auto-calculate pricing when relevant data changes
  useEffect(() => {
    const isValid = (
      step1.pickupAddress?.coordinates && 
      step1.pickupAddress.coordinates.lat !== 0 && 
      step1.pickupAddress.coordinates.lng !== 0 &&
      step1.dropoffAddress?.coordinates && 
      step1.dropoffAddress.coordinates.lat !== 0 && 
      step1.dropoffAddress.coordinates.lng !== 0 &&
      step1.items.length > 0
    );
    
    if (!isValid) return;

    const calculatePricing = async () => {
      try {
        const enhancedBookingData = buildEnhancedBookingData(step1);
        const pricingRequest = transformBookingToEnterprisePricingRequest(enhancedBookingData);
        
        const result = await calculateEnterprisePricing(pricingRequest);
        
        if (!result) {
          console.error('❌ No pricing result received from enterprise engine');
          // Fallback pricing calculation
          const fallbackVolumeFee = step1.items.reduce((sum, item) => {
            const itemWithDimensions = item as any; // Type assertion for dimensions
            if (itemWithDimensions.dimensions) {
              const volume = (itemWithDimensions.dimensions.length * itemWithDimensions.dimensions.width * itemWithDimensions.dimensions.height) / 1000000; // Convert to cubic meters
              return sum + (volume * item.quantity * 10); // £10 per cubic meter
            }
            // Fallback to using volume property if dimensions not available
            return sum + (item.volume * item.quantity * 10); // £10 per cubic meter
          }, 0);

          const fallbackPricing = {
            baseFee: 25,
            distanceFee: 0,
            volumeFee: fallbackVolumeFee,
            serviceFee: 10,
            urgencyFee: 0,
            vat: 0,
            total: 35 + fallbackVolumeFee,
            distance: 0,
          };
          
          updateFormData('step1', { 
            pricing: fallbackPricing,
            distance: 0
          });
          return;
        }

        // Enterprise pricing result received
        
        // Calculate property surcharges for display details
        const { propertySurcharge, propertyDetails } = calculatePropertySurcharges(
          step1.pickupProperty, 
          step1.dropoffProperty
        );
        
        // Calculate worker surcharge for display details
        const workerSurcharge = calculateWorkerSurcharge(step1.items);
        
        // Use backend pricing results for consistency
        const baseFee = roundToTwoDecimals(result.basePrice || 25);
        const distanceFee = roundToTwoDecimals(result.breakdown?.distance || 0);
        const serviceFee = roundToTwoDecimals(result.servicePrice || 5);
        
        // Calculate volume fee for display
        const volumeFee = step1.items.reduce((sum, item) => {
          const itemWithDimensions = item as any;
          if (itemWithDimensions.dimensions) {
            const volume = (itemWithDimensions.dimensions.length * itemWithDimensions.dimensions.width * itemWithDimensions.dimensions.height) / 1000000;
            return sum + (volume * item.quantity * 10);
          }
          return sum + (item.volume * item.quantity * 10);
        }, 0);
        
        // Calculate additional fees (property + worker surcharges)
        const additionalFees = roundToTwoDecimals(propertySurcharge + workerSurcharge);
        
        // Calculate VAT on the visible components for transparency
        const visibleSubtotal = roundToTwoDecimals(baseFee + distanceFee + volumeFee + serviceFee + additionalFees);
        const vatAmount = roundToTwoDecimals(visibleSubtotal * 0.2);
        const finalTotal = roundToTwoDecimals(visibleSubtotal + vatAmount);

        const transformedPricing = {
          baseFee,
          distanceFee,
          volumeFee: roundToTwoDecimals(volumeFee),
          serviceFee,
          urgencyFee: additionalFees,
          vat: vatAmount,
          total: finalTotal,
          // Store distance in miles for UI consistency
          distance: roundToTwoDecimals(kilometersToMiles(result.distance || 0)),
        };
          
          // Final pricing breakdown calculated
          
        // Only update if pricing has changed
        if (!deepEqual(step1.pricing, transformedPricing)) {
            updateFormData('step1', { 
              pricing: transformedPricing,
              // Distance displayed in miles
              distance: transformedPricing.distance,
            });
        }
      } catch (error) {
        console.error('❌ Pricing calculation failed:', error);
        toast({
          title: 'Pricing Error',
          description: 'Unable to calculate pricing. Please check your addresses and try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    calculatePricing();
  }, [
    step1.pickupAddress?.coordinates, 
    step1.dropoffAddress?.coordinates,
    step1.items,
    step1.serviceType,
    step1.pickupProperty?.floors,
    step1.pickupProperty?.hasLift,
    step1.pickupProperty?.type,
    step1.dropoffProperty?.floors,
    step1.dropoffProperty?.hasLift,
    step1.dropoffProperty?.type,
    calculateEnterprisePricing,
    updateFormData,
    step1.pricing
  ]);


  // Calculate form completion status
  const formCompletionStatus = {
    pickupAddress: !!(step1.pickupAddress?.address && step1.pickupAddress?.coordinates?.lat !== 0),
    dropoffAddress: !!(step1.dropoffAddress?.address && step1.dropoffAddress?.coordinates?.lat !== 0),
    items: step1.items.length > 0,
    dateTime: !!(step1.pickupDate && step1.pickupTimeSlot),
  };
  
  const completedSections = Object.values(formCompletionStatus).filter(Boolean).length;
  const totalSections = Object.keys(formCompletionStatus).length;
  const completionPercentage = Math.round((completedSections / totalSections) * 100);

  return (
    <VStack spacing={{ base: 6, md: 8 }} align="stretch" p={{ base: 4, md: 6, lg: 8 }}>
      {/* Progress Summary Card */}
      <Card bg="white" borderRadius="xl" p={4} shadow="md" border="1px solid" borderColor="gray.200">
        <VStack spacing={3}>
          <HStack justify="space-between" w="full">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              Booking Progress
            </Text>
            <Text fontSize="sm" color="gray.600">
              {completedSections}/{totalSections} completed ({completionPercentage}%)
            </Text>
          </HStack>
          
          <Progress 
            value={completionPercentage} 
            size="md" 
            colorScheme="blue" 
            borderRadius="full"
            bg="gray.100"
            w="full"
          />
          
          <HStack spacing={4} justify="center" flexWrap="wrap">
            <HStack spacing={1}>
              <Icon 
                as={FaMapMarkerAlt} 
                color={formCompletionStatus.pickupAddress ? "green.500" : "gray.400"} 
                boxSize={3}
              />
              <Text fontSize="xs" color={formCompletionStatus.pickupAddress ? "green.600" : "gray.500"}>
                Pickup {formCompletionStatus.pickupAddress ? "✓" : "○"}
              </Text>
            </HStack>
            
            <HStack spacing={1}>
              <Icon 
                as={FaMapMarkerAlt} 
                color={formCompletionStatus.dropoffAddress ? "green.500" : "gray.400"} 
                boxSize={3}
              />
              <Text fontSize="xs" color={formCompletionStatus.dropoffAddress ? "green.600" : "gray.500"}>
                Dropoff {formCompletionStatus.dropoffAddress ? "✓" : "○"}
              </Text>
            </HStack>
            
            <HStack spacing={1}>
              <Icon 
                as={FaBolt} 
                color={formCompletionStatus.items ? "green.500" : "gray.400"} 
                boxSize={3}
              />
              <Text fontSize="xs" color={formCompletionStatus.items ? "green.600" : "gray.500"}>
                Items {formCompletionStatus.items ? "✓" : "○"}
              </Text>
            </HStack>
            
            <HStack spacing={1}>
              <Icon 
                as={FaCalendarAlt} 
                color={formCompletionStatus.dateTime ? "green.500" : "gray.400"} 
                boxSize={3}
              />
              <Text fontSize="xs" color={formCompletionStatus.dateTime ? "green.600" : "gray.500"}>
                Date & Time {formCompletionStatus.dateTime ? "✓" : "○"}
              </Text>
            </HStack>
          </HStack>
        </VStack>
      </Card>

      {/* Address Selection Header */}
      <Box textAlign="center" mb={6}>
        <Heading size={{ base: "lg", md: "xl" }} mb={3} bgGradient="linear(to-r, blue.600, green.600)" bgClip="text">
          📍 Where are we moving from and to?
        </Heading>
        <Text color="gray.600" fontSize={{ base: "md", md: "lg" }}>
          Enter your pickup and delivery addresses for accurate pricing
        </Text>
      </Box>
        
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 6, md: 8, lg: 12 }} overflow="visible">
        {/* Pickup Address */}
          <Box position="relative">
            <Card bg="gray.50" borderColor="gray.200" borderWidth="1px" borderRadius="xl" p={{ base: 4, md: 6 }} shadow="md" overflow="visible">
              <VStack spacing={6} align="stretch">
                <HStack spacing={3} align="center">
                  <Circle size={{ base: "40px", md: "50px" }} bg="blue.500" color="white">
                    <Icon as={FaMapMarkerAlt} boxSize={{ base: 5, md: 6 }} />
                  </Circle>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" fontSize={{ base: "lg", md: "xl" }} color="gray.800">
                      📍 Pickup Address
                    </Text>
                    <Text fontSize={{ base: "sm", md: "md" }} color="gray.600" fontWeight="medium">
                      Where should we collect your items?
                    </Text>
                  </VStack>
                </HStack>
                
                <Box position="relative" zIndex={10} mb={4}>
                  <FormControl 
                    isRequired 
                    isInvalid={!!errors['step1.pickupAddress.address']}
                  >
                    <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                      <HStack spacing={2}>
                        <Icon as={FaMapMarkerAlt} color="blue.500" />
                        <Text>Pickup Address</Text>
                        {step1.pickupAddress?.address && step1.pickupAddress?.coordinates?.lat !== 0 && (
                          <Badge colorScheme="green" variant="solid" fontSize="xs">
                            ✓ Valid
                          </Badge>
                        )}
                      </HStack>
                    </FormLabel>
                    <AddressAutocomplete
                      value={step1.pickupAddress?.address || ''}
                      onSelect={(address) => handleAddressSelect(address, 'pickup')}
                      placeholder="Enter pickup address... (e.g., 123 Main Street, London)"
                    />
                    {errors['step1.pickupAddress.address'] && (
                      <FormErrorMessage fontSize="sm" mt={2}>
                        <HStack spacing={1}>
                          <Icon as={FaMapMarkerAlt} color="red.500" boxSize={3} />
                          <Text>{errors['step1.pickupAddress.address']}</Text>
                        </HStack>
                      </FormErrorMessage>
                    )}
                  </FormControl>
                </Box>
              </VStack>
            </Card>
          
          {/* Address Confirmation */}
            {step1.pickupAddress?.coordinates && 
             step1.pickupAddress.coordinates.lat !== 0 && 
             step1.pickupAddress.coordinates.lng !== 0 && (
              <Card bg="green.50" borderColor="green.200" borderWidth="1px" borderRadius="xl" mt={4} shadow="sm">
                <CardBody p={4}>
                  <VStack align="start" spacing={3}>
                    <HStack spacing={3} align="center">
                      <Circle size="28px" bg="green.500" color="white">
                        <Icon as={FaCheck} boxSize={3} />
                      </Circle>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="md" fontWeight="bold" color="green.700">
                          ✅ Address Confirmed
                        </Text>
                        <Text fontSize="sm" color="green.600">
                          Pickup location verified
                        </Text>
                      </VStack>
                    </HStack>
                    <VStack align="start" spacing={2} w="full">
                      <HStack spacing={2} wrap="wrap">
                        {step1.pickupAddress.houseNumber && (
                          <Badge colorScheme="blue" variant="solid" fontSize="sm" px={2} py={1}>
                            {step1.pickupAddress.houseNumber}
                          </Badge>
                        )}
                        <Badge colorScheme="green" variant="subtle" fontSize="sm" px={2} py={1}>
                          {step1.pickupAddress.postcode}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.700" fontWeight="medium">
                        {step1.pickupAddress.address}, {step1.pickupAddress.city}
                      </Text>
                  
                    {/* Flat Number Input */}
                      <Card bg="white" borderRadius="lg" p={3} w="full">
                        <HStack spacing={3} w="full">
                          <Text fontSize="sm" color="gray.600" fontWeight="medium" minW="70px">
                            Flat/Unit:
                          </Text>
                          <Input
                            size={{ base: "md", md: "sm" }}
                            placeholder="e.g., Flat 5A (optional)"
                            minH={{ base: "44px", md: "auto" }}
                            value={step1.pickupAddress.flatNumber || ''}
                            onChange={(e) => updateFormData('step1', {
                            pickupAddress: { 
                              ...(step1.pickupAddress || {}), 
                              flatNumber: e.target.value,
                              coordinates: step1.pickupAddress?.coordinates || { lat: 0, lng: 0 }
                            }
                            })}
                            bg="gray.50"
                            borderColor="gray.200"
                            _focus={{ borderColor: "blue.400", bg: "white" }}
                          />
                        </HStack>
                      </Card>
                      
                      <HStack spacing={2} align="center">
                        <Icon as={FaMapMarkerAlt} color="gray.400" boxSize={3} />
                        <Text fontSize="xs" color="gray.500">
                          {step1.pickupAddress.coordinates.lat.toFixed(4)}, {step1.pickupAddress.coordinates.lng.toFixed(4)}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            )}

          {/* Pickup Property Details - Mobile Accordion */}
            <Card bg="white" borderColor="gray.200" borderWidth="1px" borderRadius="xl" mt={4}>
              <CardBody p={4}>
                <VStack spacing={4} align="stretch">
                  {/* Accordion Header - Clickable */}
                  <Button
                    variant="ghost"
                    onClick={togglePickupDetails}
                    rightIcon={
                      <Text fontSize="lg" transform={isPickupDetailsOpen ? 'rotate(180deg)' : 'rotate(0deg)'} transition="transform 0.2s">
                        ▼
                      </Text>
                    }
                    p={0}
                    h="auto"
                    justifyContent="flex-start"
                    _hover={{ bg: 'gray.50' }}
                    borderRadius="md"
                    w="full"
                  >
                    <HStack spacing={3} align="center" flex={1}>
                      <Circle size="32px" bg="gray.600" color="white">
                        <Icon as={FaBuilding} boxSize={4} />
                      </Circle>
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontWeight="bold" fontSize="md" color="gray.800">
                          Property Details (Pickup)
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Optional - helps with accurate pricing
                        </Text>
                      </VStack>
                    </HStack>
                  </Button>
                  
                  {/* Collapsible Content */}
                  <Collapse in={isPickupDetailsOpen} animateOpacity>
                    <VStack spacing={4} align="stretch" pt={2}>
                      <Box bg="orange.50" borderRadius="md" p={2} border="1px" borderColor="orange.200">
                        <HStack spacing={2} align="start">
                          <Icon as={FaBolt} color="orange.500" boxSize={3} mt={0.5} />
                          <Text fontSize="xs" color="gray.600" fontWeight="normal">
                            Floor access affects pricing: £2/floor with elevator, £5/floor without
                          </Text>
                        </HStack>
                      </Box>
              
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {/* Building Type */}
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">Building Type</FormLabel>
                      <Select 
                        value={step1.pickupProperty?.type || 'house'}
                        onChange={(e) => updateFormData('step1', {
                        pickupProperty: { 
                          ...(step1.pickupProperty || {}), 
                          type: e.target.value as any,
                          floors: step1.pickupProperty?.floors || 0,
                          hasLift: step1.pickupProperty?.hasLift || false,
                          hasParking: step1.pickupProperty?.hasParking ?? true,
                          requiresPermit: step1.pickupProperty?.requiresPermit || false
                        }
                        })}
                        size="sm"
                        bg="white"
                        borderColor="gray.300"
                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
                      >
                        <option value="house">🏠 House</option>
                        <option value="apartment">🏢 Apartment</option>
                        <option value="office">🏢 Office</option>
                        <option value="warehouse">🏭 Warehouse</option>
                        <option value="other">🏗️ Other</option>
                      </Select>
                    </FormControl>

                  {/* Floor Number - Mobile Optimized */}
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                        Floor Number
                      </FormLabel>
                      <Text fontSize="xs" color="gray.600" mb={3} fontWeight="medium">
                        (0 = Ground floor, 1 = First floor, etc.)
                      </Text>
                      
                      {/* Mobile Stepper Layout */}
                      <HStack spacing={3} justify="center" w="full" mb={3}>
                        {/* Decrease Button */}
                        <IconButton
                          size="lg"
                          colorScheme="red"
                          variant="outline"
                          aria-label="Decrease floor number"
                          icon={<Text fontSize="xl" fontWeight="bold">−</Text>}
                          onClick={() => {
                            const currentFloor = step1.pickupProperty?.floors || 0;
                            if (currentFloor > 0) {
                              updateFormData('step1', {
                                pickupProperty: { 
                                  ...(step1.pickupProperty || {}), 
                                  floors: currentFloor - 1,
                                  type: step1.pickupProperty?.type || 'house',
                                  hasLift: step1.pickupProperty?.hasLift || false,
                                  hasParking: step1.pickupProperty?.hasParking ?? true,
                                  requiresPermit: step1.pickupProperty?.requiresPermit || false
                                }
                              });
                            }
                          }}
                          isDisabled={(step1.pickupProperty?.floors || 0) <= 0}
                          minH="48px"
                          minW="48px"
                          borderRadius="xl"
                          _hover={{ bg: 'red.50', transform: 'scale(1.05)' }}
                          _active={{ transform: 'scale(0.95)' }}
                          _focus={{ 
                            boxShadow: "0 0 0 3px rgba(229, 62, 62, 0.3)",
                            outline: "none"
                          }}
                        />
                        
                        {/* Floor Number Display */}
                        <Box
                          px={6}
                          py={3}
                          bg="blue.50"
                          borderRadius="xl"
                          border="2px solid"
                          borderColor="blue.200"
                          minW="100px"
                          minH="48px"
                          textAlign="center"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text 
                            fontWeight="bold" 
                            color="blue.800" 
                            fontSize="lg"
                            lineHeight="1"
                            aria-live="polite"
                          >
                            {step1.pickupProperty?.floors || 0}
                          </Text>
                        </Box>
                        
                        {/* Increase Button */}
                        <IconButton
                          size="lg"
                          colorScheme="green"
                          variant="outline"
                          aria-label="Increase floor number"
                          icon={<Text fontSize="xl" fontWeight="bold">+</Text>}
                          onClick={() => {
                            const currentFloor = step1.pickupProperty?.floors || 0;
                            if (currentFloor < 50) {
                              updateFormData('step1', {
                                pickupProperty: { 
                                  ...(step1.pickupProperty || {}), 
                                  floors: currentFloor + 1,
                                  type: step1.pickupProperty?.type || 'house',
                                  hasLift: step1.pickupProperty?.hasLift || false,
                                  hasParking: step1.pickupProperty?.hasParking ?? true,
                                  requiresPermit: step1.pickupProperty?.requiresPermit || false
                                }
                              });
                            }
                          }}
                          isDisabled={(step1.pickupProperty?.floors || 0) >= 50}
                          minH="48px"
                          minW="48px"
                          borderRadius="xl"
                          _hover={{ bg: 'green.50', transform: 'scale(1.05)' }}
                          _active={{ transform: 'scale(0.95)' }}
                          _focus={{ 
                            boxShadow: "0 0 0 3px rgba(56, 161, 105, 0.3)",
                            outline: "none"
                          }}
                        />
                      </HStack>

                    </FormControl>

                  {/* Has Elevator */}
                    <FormControl 
                      display="flex" 
                      alignItems="center" 
                      bg="white" 
                      p={4} 
                      borderRadius="xl" 
                      border="2px solid" 
                      borderColor={step1.pickupProperty?.hasLift ? "blue.200" : "gray.200"}
                      shadow="sm"
                      transition="all 0.2s ease"
                      _hover={{ 
                        borderColor: step1.pickupProperty?.hasLift ? "blue.300" : "gray.300",
                        shadow: "md"
                      }}
                    >
                      <HStack spacing={4} w="full" justify="space-between">
                        <HStack spacing={3}>
                          <Circle 
                            size="40px" 
                            bg={step1.pickupProperty?.hasLift ? "blue.100" : "gray.100"}
                            transition="all 0.2s ease"
                          >
                            <Icon as={MdElevator} color={step1.pickupProperty?.hasLift ? "blue.600" : "gray.500"} boxSize={6} />
                          </Circle>
                          <VStack align="start" spacing={0}>
                            <FormLabel fontSize="md" fontWeight="bold" color="gray.800" mb={0}>
                              Has Elevator
                            </FormLabel>
                            <Text fontSize="xs" color={step1.pickupProperty?.hasLift ? "green.600" : "orange.600"}>
                              {step1.pickupProperty?.hasLift ? "✓ Elevator available" : "Stairs only"}
                            </Text>
                          </VStack>
                        </HStack>
                        <Switch
                          isChecked={step1.pickupProperty?.hasLift || false}
                          onChange={(e) => updateFormData('step1', {
                          pickupProperty: { 
                            ...(step1.pickupProperty || {}), 
                            hasLift: e.target.checked,
                            type: step1.pickupProperty?.type || 'house',
                            floors: step1.pickupProperty?.floors || 0,
                            hasParking: step1.pickupProperty?.hasParking ?? true,
                            requiresPermit: step1.pickupProperty?.requiresPermit || false
                          }
                          })}
                          colorScheme="blue"
                          size="lg"
                          _focus={{ boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.3)" }}
                        />
                      </HStack>
                    </FormControl>

                  {/* Has Parking */}
                    <FormControl 
                      display="flex" 
                      alignItems="center" 
                      bg="white" 
                      p={4} 
                      borderRadius="xl" 
                      border="2px solid" 
                      borderColor={step1.pickupProperty?.hasParking ? "green.200" : "gray.200"}
                      shadow="sm"
                      transition="all 0.2s ease"
                      _hover={{ 
                        borderColor: step1.pickupProperty?.hasParking ? "green.300" : "gray.300",
                        shadow: "md"
                      }}
                    >
                      <HStack spacing={4} w="full" justify="space-between">
                        <HStack spacing={3}>
                          <Circle 
                            size="40px" 
                            bg={step1.pickupProperty?.hasParking ? "green.100" : "gray.100"}
                            transition="all 0.2s ease"
                          >
                            <Icon as={FaParking} color={step1.pickupProperty?.hasParking ? "green.600" : "gray.500"} boxSize={6} />
                          </Circle>
                          <VStack align="start" spacing={0}>
                            <FormLabel fontSize="md" fontWeight="bold" color="gray.800" mb={0}>
                              Has Parking
                            </FormLabel>
                            <Text fontSize="xs" color={step1.pickupProperty?.hasParking ? "green.600" : "blue.600"}>
                              {step1.pickupProperty?.hasParking ? "✓ Parking available" : "Street parking"}
                            </Text>
                          </VStack>
                        </HStack>
                        <Switch
                          isChecked={step1.pickupProperty?.hasParking ?? true}
                          onChange={(e) => updateFormData('step1', {
                          pickupProperty: { 
                            ...(step1.pickupProperty || {}), 
                            hasParking: e.target.checked,
                            type: step1.pickupProperty?.type || 'house',
                            floors: step1.pickupProperty?.floors || 0,
                            hasLift: step1.pickupProperty?.hasLift || false,
                            requiresPermit: step1.pickupProperty?.requiresPermit || false
                          }
                          })}
                          colorScheme="green"
                          size="lg"
                          _focus={{ boxShadow: "0 0 0 3px rgba(56, 161, 105, 0.3)" }}
                        />
                      </HStack>
                    </FormControl>
                  </SimpleGrid>
                    </VStack>
                  </Collapse>
                </VStack>
              </CardBody>
            </Card>
          </Box>

        {/* Dropoff Address - Similar structure but for dropoff */}
          <Box position="relative">
            <Card bg="gray.50" borderColor="gray.200" borderWidth="1px" borderRadius="xl" p={6} shadow="md" overflow="visible">
              <VStack spacing={6} align="stretch">
                <HStack spacing={3} align="center">
                  <Circle size="50px" bg="teal.500" color="white">
                    <Icon as={FaMapMarkerAlt} boxSize={6} />
                  </Circle>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" fontSize="xl" color="gray.800">
                      🎯 Dropoff Address
                    </Text>
                    <Text fontSize="md" color="gray.600" fontWeight="medium">
                      Where should we deliver your items?
                    </Text>
                  </VStack>
                </HStack>
                
                <Box position="relative" zIndex={10} mb={4}>
                  <FormControl 
                    isRequired 
                    isInvalid={!!errors['step1.dropoffAddress.address']}
                  >
                    <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                      <HStack spacing={2}>
                        <Icon as={FaMapMarkerAlt} color="teal.500" />
                        <Text>Dropoff Address</Text>
                        {step1.dropoffAddress?.address && step1.dropoffAddress?.coordinates?.lat !== 0 && (
                          <Badge colorScheme="green" variant="solid" fontSize="xs">
                            ✓ Valid
                          </Badge>
                        )}
                      </HStack>
                    </FormLabel>
                    <AddressAutocomplete
                      value={step1.dropoffAddress?.address || ''}
                      onSelect={(address) => handleAddressSelect(address, 'dropoff')}
                      placeholder="Enter dropoff address... (e.g., 456 Oak Avenue, Manchester)"
                    />
                    {errors['step1.dropoffAddress.address'] && (
                      <FormErrorMessage fontSize="sm" mt={2}>
                        <HStack spacing={1}>
                          <Icon as={FaMapMarkerAlt} color="red.500" boxSize={3} />
                          <Text>{errors['step1.dropoffAddress.address']}</Text>
                        </HStack>
                      </FormErrorMessage>
                    )}
                  </FormControl>
                </Box>
              </VStack>
            </Card>
          
          {/* Dropoff Address Confirmation - similar to pickup */}
            {step1.dropoffAddress?.coordinates && 
             step1.dropoffAddress.coordinates.lat !== 0 && 
             step1.dropoffAddress.coordinates.lng !== 0 && (
              <Card bg="green.50" borderColor="green.200" borderWidth="1px" borderRadius="xl" mt={4} shadow="sm">
                <CardBody p={4}>
                  <VStack align="start" spacing={3}>
                    <HStack spacing={3} align="center">
                      <Circle size="28px" bg="green.500" color="white">
                        <Icon as={FaCheck} boxSize={3} />
                      </Circle>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="md" fontWeight="bold" color="green.700">
                          ✅ Address Confirmed
                        </Text>
                        <Text fontSize="sm" color="green.600">
                          Dropoff location verified
                        </Text>
                      </VStack>
                    </HStack>
                    <VStack align="start" spacing={2} w="full">
                      <HStack spacing={2} wrap="wrap">
                        {step1.dropoffAddress.houseNumber && (
                          <Badge colorScheme="blue" variant="solid" fontSize="sm" px={2} py={1}>
                            {step1.dropoffAddress.houseNumber}
                          </Badge>
                        )}
                        <Badge colorScheme="green" variant="subtle" fontSize="sm" px={2} py={1}>
                          {step1.dropoffAddress.postcode}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.700" fontWeight="medium">
                        {step1.dropoffAddress.address}, {step1.dropoffAddress.city}
                      </Text>
                  
                    {/* Dropoff Flat Number Input */}
                      <Card bg="white" borderRadius="lg" p={3} w="full">
                        <HStack spacing={3} w="full">
                          <Text fontSize="sm" color="gray.600" fontWeight="medium" minW="70px">
                            Flat/Unit:
                          </Text>
                          <Input
                            size="sm"
                            placeholder="e.g., Flat 5A (optional)"
                            value={step1.dropoffAddress.flatNumber || ''}
                            onChange={(e) => updateFormData('step1', {
                            dropoffAddress: { 
                              ...(step1.dropoffAddress || {}), 
                              flatNumber: e.target.value,
                              coordinates: step1.dropoffAddress?.coordinates || { lat: 0, lng: 0 }
                            }
                            })}
                            bg="gray.50"
                            borderColor="gray.200"
                            _focus={{ borderColor: "green.400", bg: "white" }}
                          />
                        </HStack>
                      </Card>
                      
                      <HStack spacing={2} align="center">
                        <Icon as={FaMapMarkerAlt} color="gray.400" boxSize={3} />
                        <Text fontSize="xs" color="gray.500">
                          {step1.dropoffAddress.coordinates.lat.toFixed(4)}, {step1.dropoffAddress.coordinates.lng.toFixed(4)}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            )}

          {/* Dropoff Property Details - Mobile Accordion */}
            <Card bg="white" borderColor="gray.200" borderWidth="1px" borderRadius="xl" mt={4}>
              <CardBody p={4}>
                <VStack spacing={4} align="stretch">
                  {/* Accordion Header - Clickable */}
                  <Button
                    variant="ghost"
                    onClick={toggleDropoffDetails}
                    rightIcon={
                      <Text fontSize="lg" transform={isDropoffDetailsOpen ? 'rotate(180deg)' : 'rotate(0deg)'} transition="transform 0.2s">
                        ▼
                      </Text>
                    }
                    p={0}
                    h="auto"
                    justifyContent="flex-start"
                    _hover={{ bg: 'gray.50' }}
                    borderRadius="md"
                    w="full"
                  >
                    <HStack spacing={3} align="center" flex={1}>
                      <Circle size="32px" bg="gray.600" color="white">
                        <Icon as={FaBuilding} boxSize={4} />
                      </Circle>
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontWeight="bold" fontSize="md" color="gray.800">
                          Property Details (Dropoff)
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Optional - helps with accurate pricing
                        </Text>
                      </VStack>
                    </HStack>
                  </Button>
                  
                  {/* Collapsible Content */}
                  <Collapse in={isDropoffDetailsOpen} animateOpacity>
                    <VStack spacing={4} align="stretch" pt={2}>
                      <Box bg="orange.50" borderRadius="md" p={2} border="1px" borderColor="orange.200">
                        <HStack spacing={2} align="start">
                          <Icon as={FaBolt} color="orange.500" boxSize={3} mt={0.5} />
                          <Text fontSize="xs" color="gray.600" fontWeight="normal">
                            Floor access affects pricing: £2/floor with elevator, £5/floor without
                          </Text>
                        </HStack>
                      </Box>
              
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {/* Building Type */}
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">Building Type</FormLabel>
                      <Select 
                        value={step1.dropoffProperty?.type || 'house'}
                        onChange={(e) => updateFormData('step1', {
                        dropoffProperty: { 
                          ...(step1.dropoffProperty || {}), 
                          type: e.target.value as any,
                          floors: step1.dropoffProperty?.floors || 0,
                          hasLift: step1.dropoffProperty?.hasLift || false,
                          hasParking: step1.dropoffProperty?.hasParking ?? true,
                          requiresPermit: step1.dropoffProperty?.requiresPermit || false
                        }
                        })}
                        size="sm"
                        bg="white"
                        borderColor="gray.300"
                        _focus={{ borderColor: "green.400", boxShadow: "0 0 0 1px #38A169" }}
                      >
                        <option value="house">🏠 House</option>
                        <option value="apartment">🏢 Apartment</option>
                        <option value="office">🏢 Office</option>
                        <option value="warehouse">🏭 Warehouse</option>
                        <option value="other">🏗️ Other</option>
                      </Select>
                    </FormControl>

                  {/* Floor Number - Mobile Optimized */}
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                        Floor Number
                      </FormLabel>
                      <Text fontSize="xs" color="gray.600" mb={3} fontWeight="medium">
                        (0 = Ground floor, 1 = First floor, etc.)
                      </Text>
                      
                      {/* Mobile Stepper Layout */}
                      <HStack spacing={3} justify="center" w="full" mb={3}>
                        {/* Decrease Button */}
                        <IconButton
                          size="lg"
                          colorScheme="red"
                          variant="outline"
                          aria-label="Decrease floor number"
                          icon={<Text fontSize="xl" fontWeight="bold">−</Text>}
                          onClick={() => {
                            const currentFloor = step1.dropoffProperty?.floors || 0;
                            if (currentFloor > 0) {
                              updateFormData('step1', {
                                dropoffProperty: { 
                                  ...(step1.dropoffProperty || {}), 
                                  floors: currentFloor - 1,
                                  type: step1.dropoffProperty?.type || 'house',
                                  hasLift: step1.dropoffProperty?.hasLift || false,
                                  hasParking: step1.dropoffProperty?.hasParking ?? true,
                                  requiresPermit: step1.dropoffProperty?.requiresPermit || false
                                }
                              });
                            }
                          }}
                          isDisabled={(step1.dropoffProperty?.floors || 0) <= 0}
                          minH="48px"
                          minW="48px"
                          borderRadius="xl"
                          _hover={{ bg: 'red.50', transform: 'scale(1.05)' }}
                          _active={{ transform: 'scale(0.95)' }}
                          _focus={{ 
                            boxShadow: "0 0 0 3px rgba(229, 62, 62, 0.3)",
                            outline: "none"
                          }}
                        />
                        
                        {/* Floor Number Display */}
                        <Box
                          px={6}
                          py={3}
                          bg="green.50"
                          borderRadius="xl"
                          border="2px solid"
                          borderColor="green.200"
                          minW="100px"
                          minH="48px"
                          textAlign="center"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text 
                            fontWeight="bold" 
                            color="green.800" 
                            fontSize="lg"
                            lineHeight="1"
                            aria-live="polite"
                          >
                            {step1.dropoffProperty?.floors || 0}
                          </Text>
                        </Box>
                        
                        {/* Increase Button */}
                        <IconButton
                          size="lg"
                          colorScheme="green"
                          variant="outline"
                          aria-label="Increase floor number"
                          icon={<Text fontSize="xl" fontWeight="bold">+</Text>}
                          onClick={() => {
                            const currentFloor = step1.dropoffProperty?.floors || 0;
                            if (currentFloor < 50) {
                              updateFormData('step1', {
                                dropoffProperty: { 
                                  ...(step1.dropoffProperty || {}), 
                                  floors: currentFloor + 1,
                                  type: step1.dropoffProperty?.type || 'house',
                                  hasLift: step1.dropoffProperty?.hasLift || false,
                                  hasParking: step1.dropoffProperty?.hasParking ?? true,
                                  requiresPermit: step1.dropoffProperty?.requiresPermit || false
                                }
                              });
                            }
                          }}
                          isDisabled={(step1.dropoffProperty?.floors || 0) >= 50}
                          minH="48px"
                          minW="48px"
                          borderRadius="xl"
                          _hover={{ bg: 'green.50', transform: 'scale(1.05)' }}
                          _active={{ transform: 'scale(0.95)' }}
                          _focus={{ 
                            boxShadow: "0 0 0 3px rgba(56, 161, 105, 0.3)",
                            outline: "none"
                          }}
                        />
                      </HStack>

                    </FormControl>

                  {/* Has Elevator */}
                    <FormControl 
                      display="flex" 
                      alignItems="center" 
                      bg="white" 
                      p={4} 
                      borderRadius="xl" 
                      border="2px solid" 
                      borderColor={step1.dropoffProperty?.hasLift ? "blue.200" : "gray.200"}
                      shadow="sm"
                      transition="all 0.2s ease"
                      _hover={{ 
                        borderColor: step1.dropoffProperty?.hasLift ? "blue.300" : "gray.300",
                        shadow: "md"
                      }}
                    >
                      <HStack spacing={4} w="full" justify="space-between">
                        <HStack spacing={3}>
                          <Circle 
                            size="40px" 
                            bg={step1.dropoffProperty?.hasLift ? "blue.100" : "gray.100"}
                            transition="all 0.2s ease"
                          >
                            <Icon as={MdElevator} color={step1.dropoffProperty?.hasLift ? "blue.600" : "gray.500"} boxSize={6} />
                          </Circle>
                          <VStack align="start" spacing={0}>
                            <FormLabel fontSize="md" fontWeight="bold" color="gray.800" mb={0}>
                              Has Elevator
                            </FormLabel>
                            <Text fontSize="xs" color={step1.dropoffProperty?.hasLift ? "green.600" : "orange.600"}>
                              {step1.dropoffProperty?.hasLift ? "✓ Elevator available" : "Stairs only"}
                            </Text>
                          </VStack>
                        </HStack>
                        <Switch
                          isChecked={step1.dropoffProperty?.hasLift || false}
                          onChange={(e) => updateFormData('step1', {
                          dropoffProperty: { 
                            ...(step1.dropoffProperty || {}), 
                            hasLift: e.target.checked,
                            type: step1.dropoffProperty?.type || 'house',
                            floors: step1.dropoffProperty?.floors || 0,
                            hasParking: step1.dropoffProperty?.hasParking ?? true,
                            requiresPermit: step1.dropoffProperty?.requiresPermit || false
                          }
                          })}
                          colorScheme="blue"
                          size="lg"
                          _focus={{ boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.3)" }}
                        />
                      </HStack>
                    </FormControl>

                  {/* Has Parking */}
                    <FormControl 
                      display="flex" 
                      alignItems="center" 
                      bg="white" 
                      p={4} 
                      borderRadius="xl" 
                      border="2px solid" 
                      borderColor={step1.dropoffProperty?.hasParking ? "green.200" : "gray.200"}
                      shadow="sm"
                      transition="all 0.2s ease"
                      _hover={{ 
                        borderColor: step1.dropoffProperty?.hasParking ? "green.300" : "gray.300",
                        shadow: "md"
                      }}
                    >
                      <HStack spacing={4} w="full" justify="space-between">
                        <HStack spacing={3}>
                          <Circle 
                            size="40px" 
                            bg={step1.dropoffProperty?.hasParking ? "green.100" : "gray.100"}
                            transition="all 0.2s ease"
                          >
                            <Icon as={FaParking} color={step1.dropoffProperty?.hasParking ? "green.600" : "gray.500"} boxSize={6} />
                          </Circle>
                          <VStack align="start" spacing={0}>
                            <FormLabel fontSize="md" fontWeight="bold" color="gray.800" mb={0}>
                              Has Parking
                            </FormLabel>
                            <Text fontSize="xs" color={step1.dropoffProperty?.hasParking ? "green.600" : "blue.600"}>
                              {step1.dropoffProperty?.hasParking ? "✓ Parking available" : "Street parking"}
                            </Text>
                          </VStack>
                        </HStack>
                        <Switch
                          isChecked={step1.dropoffProperty?.hasParking ?? true}
                          onChange={(e) => updateFormData('step1', {
                          dropoffProperty: { 
                            ...(step1.dropoffProperty || {}), 
                            hasParking: e.target.checked,
                            type: step1.dropoffProperty?.type || 'house',
                            floors: step1.dropoffProperty?.floors || 0,
                            hasLift: step1.dropoffProperty?.hasLift || false,
                            requiresPermit: step1.dropoffProperty?.requiresPermit || false
                          }
                          })}
                          colorScheme="green"
                          size="lg"
                          _focus={{ boxShadow: "0 0 0 3px rgba(56, 161, 105, 0.3)" }}
                        />
                      </HStack>
                    </FormControl>
                  </SimpleGrid>
                    </VStack>
                  </Collapse>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        </SimpleGrid>

        {/* Spacer to prevent autocomplete overlap */}
        <Box h={8} />

      {/* Items Selection */}
      <Box>
        <Box textAlign="center" mb={6}>
          <Heading size={{ base: "lg", md: "xl" }} mb={3} bgGradient="linear(to-r, purple.600, pink.600)" bgClip="text">
            📦 What are we moving?
          </Heading>
          <Text color="gray.600" fontSize={{ base: "md", md: "lg" }}>
            Search and select items to get accurate pricing
          </Text>
        </Box>
        
        {/* Enhanced Smart Search with Autocomplete */}
        <Card bg="purple.50" borderColor="purple.200" borderWidth="1px" borderRadius="xl" p={{ base: 4, md: 6 }} mb={6} shadow="md">
          <VStack spacing={{ base: 5, md: 6 }}>
            <HStack spacing={3} align="center" mb={2}>
              <Circle size={{ base: "32px", md: "40px" }} bg="purple.500" color="white">
                <Icon as={FaBolt} boxSize={{ base: 4, md: 5 }} />
              </Circle>
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }} color="purple.700">
                  Smart Item Search
                </Text>
                <Text fontSize={{ base: "xs", md: "sm" }} color="purple.600">
                  AI-powered search + quick suggestions + category filter
                </Text>
              </VStack>
            </HStack>
            
            {/* Category Filter Icons Above Search */}
            <Card bg="white" borderRadius="lg" p={3} w="full" mb={2}>
              <HStack spacing={{ base: 2, md: 3 }} wrap="wrap" justify="center" align="center">
                <HStack spacing={2} flexShrink={0}>
                  <Icon as={FaTags} color="purple.500" boxSize={3} />
                  <Text fontSize="sm" color="purple.700" fontWeight="medium" whiteSpace="nowrap">
                    Filter:
                  </Text>
                </HStack>
                
                {[
                  { id: 'popular', label: 'Popular', icon: '⭐', color: 'yellow' },
                  { id: 'all', label: 'All Items', icon: '🏠', color: 'gray' },
                  ...CATALOG_CATEGORIES.slice(0, 4).map(cat => ({
                    id: cat.id,
                    label: cat.name,
                    icon: cat.icon,
                    color: 'blue'
                  }))
                ].map((category) => (
                  <Button
                    key={category.id}
                    size={{ base: "xs", md: "sm" }}
                    variant={selectedCategory === category.id ? 'solid' : 'outline'}
                    colorScheme={selectedCategory === category.id ? category.color : 'purple'}
                    onClick={() => setSelectedCategory(category.id)}
                    leftIcon={<Text fontSize={{ base: "sm", md: "md" }}>{category.icon}</Text>}
                    borderRadius="full"
                    _hover={{ 
                      bg: selectedCategory === category.id ? undefined : 'purple.50',
                      borderColor: 'purple.300'
                    }}
                    transition="all 0.2s ease"
                    px={{ base: 4, md: 4 }}
                    py={{ base: 2, md: 2 }}
                    fontWeight="medium"
                    minH={{ base: "44px", md: "36px" }}
                    minW={{ base: "44px", md: "auto" }}
                    fontSize={{ base: "sm", md: "sm" }}
                    flexShrink={0}
                  >
                    {category.label}
                  </Button>
                ))}
              </HStack>
            </Card>

            <SmartSearchBox
              value={searchTerm}
              onChange={setSearchTerm}
              onItemAdd={addItem}
              onItemUpdate={updateItemQuantity}
              onAddItems={addItems}
              selectedItems={step1.items}
              placeholder="Search for items or describe what you have... (e.g., 'sofa', 'I have 3 chairs + 2 tables')"
            />

            {/* Enhanced Quick Search Suggestions */}
            <Card 
              bg="gradient-to-r from-purple.50 to-blue.50" 
              borderRadius="xl" 
              p={{ base: 4, md: 5 }} 
              w="full"
              border="1px solid"
              borderColor="purple.100"
              shadow="sm"
            >
              <VStack spacing={4}>
                <HStack spacing={2} justify="center">
                  <Icon as={FaBolt} color="purple.600" boxSize={4} />
                  <Text fontSize="md" color="purple.800" fontWeight="bold">
                    Quick search suggestions
                  </Text>
                </HStack>
                
                <HStack spacing={{ base: 2, md: 3 }} wrap="wrap" justify="center">
                  {['heavy items', 'kitchen', 'bedroom', 'office', 'fragile', 'electronics', 'furniture', 'appliances'].map((suggestion) => (
                    <Button
                      key={suggestion}
                      size={{ base: "sm", md: "md" }}
                      variant="solid"
                      colorScheme="purple"
                      onClick={() => setSearchTerm(suggestion)}
                      _hover={{ 
                        bg: 'purple.600', 
                        transform: 'translateY(-1px)',
                        shadow: 'md'
                      }}
                      borderRadius="full"
                      px={{ base: 4, md: 6 }}
                      py={{ base: 2, md: 3 }}
                      transition="all 0.2s"
                      minH={{ base: "44px", md: "48px" }}
                      minW={{ base: "44px", md: "auto" }}
                      fontSize={{ base: "sm", md: "md" }}
                      fontWeight="semibold"
                      color="white"
                      bg="purple.500"
                      shadow="sm"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </HStack>
              </VStack>
            </Card>


            {/* Enhanced Search Results Count */}
            {searchTerm && (
              <Card bg="white" borderRadius="lg" p={3} w="full" border="1px solid" borderColor="purple.200">
                <HStack spacing={2} justify="center">
                  <Icon as={FaBolt} color="purple.500" boxSize={4} />
                  <Text fontSize="sm" color="purple.700" fontWeight="medium">
                    {displayItems.length} items found for "{searchTerm}"
                  </Text>
                </HStack>
              </Card>
            )}
          </VStack>
        </Card>
          

        {/* Enhanced Items Grid */}
        <Card bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} shadow="md" mb={4} border="1px" borderColor="gray.200">
          <VStack spacing={4}>
            <HStack spacing={3} align="center" mb={4}>
              <Circle size={{ base: "28px", md: "32px" }} bg="purple.500" color="white">
                <Icon as={FaBolt} boxSize={{ base: 3, md: 4 }} />
              </Circle>
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }} color="gray.700">
                  Available Items
                </Text>
                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                  Click to add items to your move
                </Text>
              </VStack>
            </HStack>
            
            <SimpleGrid columns={{ base: 1, sm: 1, md: 2, lg: 3, xl: 4 }} spacing={{ base: 3, md: 4 }} w="full">
              {displayItems.map((item) => (
                <Card
                key={item.id}
                p={{ base: 3, md: 4 }}
                border="2px solid"
                borderColor="gray.200"
                borderRadius="xl"
                  _hover={{ 
                    borderColor: 'purple.300', 
                    shadow: 'xl',
                    _before: { opacity: 1 }
                  }}
                  _active={{ transform: 'none' }} // Prevent scale on mobile
                cursor="pointer"
                onClick={(e) => {
                  // Only add item if clicking on the card itself, not on buttons
                  if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.card-content')) {
                    addItem(item);
                  }
                }}
                bg="white"
                transition="all 0.3s ease-in-out"
                overflow="visible" // Changed from "hidden" to "visible"
                position="relative"
                minH={{ base: "280px", md: "260px" }} // Increased height for single column layout
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  bg: 'linear-gradient(90deg, #805AD5, #D53F8C)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }}
            >
              <VStack spacing={3} align="stretch" className="card-content">
                {/* Enhanced Item Image using dedicated component */}
                <Box position="relative" textAlign="center">
                  <ItemImageDisplay
                    itemId={item.id}
                    itemName={item.name}
                    category={item.category}
                    height="120px"
                    borderRadius="xl"
                    showHover={true}
                    showFallbackText={true}
                  />
                  
                  {/* Quantity Badge - Shows current quantity */}
                  {(() => {
                    const existingItem = step1.items.find(i => i.id === item.id);
                    const currentQuantity = existingItem?.quantity || 0;
                    
                    return currentQuantity > 0 ? (
                      <Badge 
                        position="absolute"
                        top={2}
                        left={2}
                        colorScheme="purple"
                        variant="solid"
                        fontSize={{ base: "xs", md: "sm" }}
                        borderRadius="full"
                        px={{ base: 2, md: 3 }}
                        py={{ base: 1, md: 1 }}
                        fontWeight="bold"
                        pointerEvents="none"
                        zIndex={2}
                        boxShadow="lg"
                        maxW="80px"
                        noOfLines={1}
                      >
                        ×{currentQuantity}
                      </Badge>
                    ) : null;
                  })()}
                  
                  {/* Enhanced Category Badge Overlay */}
                  <Badge 
                    position="absolute"
                    top={2}
                    right={2}
                    colorScheme={
                      item.category === 'furniture' ? 'blue' :
                      item.category === 'appliances' ? 'green' :
                      item.category === 'boxes' ? 'orange' :
                      item.category === 'electronics' ? 'purple' :
                      'gray'
                    }
                    variant="solid"
                    fontSize="xs"
                    borderRadius="full"
                    px={2}
                    py={1}
                    textTransform="capitalize"
                    pointerEvents="none" // Prevent blocking touch events
                    zIndex={1}
                  >
                    {item.category}
                  </Badge>
                  
                  {/* Size Indicator */}
                  <Badge 
                    position="absolute"
                    bottom={2}
                    left={2}
                    colorScheme={
                      item.size === 'large' ? 'red' :
                      item.size === 'medium' ? 'yellow' :
                      'green'
                    }
                    variant="solid"
                    fontSize="xs"
                    textTransform="uppercase"
                    borderRadius="full"
                    pointerEvents="none" // Prevent blocking touch events
                    zIndex={1}
                  >
                    {item.size}
                  </Badge>
                </Box>

                {/* Enhanced Item Info */}
                <VStack spacing={3} align="stretch" flex={1} minH="140px">
                  {/* Item Name */}
                  <Text fontWeight="bold" fontSize="lg" textAlign="center" noOfLines={1} color="gray.800" mb={1}>
                    {item.name}
                  </Text>
                  
                  {/* Item Description */}
                  <Text 
                    fontSize="sm" // 14px on mobile
                    color="gray.700" // Darker for better contrast
                    textAlign="center" 
                    noOfLines={{ base: 3, md: 2 }} // 3 lines on mobile, 2 on desktop
                    minH={{ base: "60px", md: "40px" }} // Increased height for 3 lines
                    lineHeight="1.4"
                    px={4} // Increased horizontal padding for single column
                    mb={2} // Add margin bottom
                    wordBreak="break-word" // Allow word breaking for long words
                    w="full" // Full width for better text flow
                  >
                    {item.description || "—"}
                  </Text>
                  
                  {/* Size and Specifications */}
                  <Card bg="gray.50" borderRadius="md" p={2} border="1px solid" borderColor="gray.100" w="full">
                    <VStack spacing={2}>
                      {/* Size Badge */}
                      <Badge 
                        colorScheme={
                          item.size === 'large' ? 'red' :
                          item.size === 'medium' ? 'yellow' :
                          'green'
                        }
                        variant="subtle"
                        fontSize="xs"
                        textTransform="uppercase"
                        px={2}
                        py={1}
                      >
                        {item.size} Size
                      </Badge>
                      
                      {/* Weight and Volume */}
                      <HStack justify="center" spacing={4} fontSize="xs" w="full">
                        <VStack spacing={0} align="center" flex="1">
                          <Text fontWeight="medium" color="gray.600" fontSize="xs">Weight</Text>
                          <Text color="gray.600" fontWeight="medium" fontSize="xs">{item.weight}kg</Text>
                        </VStack>
                        <Divider orientation="vertical" h="20px" />
                        <VStack spacing={0} align="center" flex="1">
                          <Text fontWeight="medium" color="gray.600" fontSize="xs">Volume</Text>
                          <Text color="gray.600" fontWeight="medium" fontSize="xs">{item.volume}m³</Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </Card>
                </VStack>

                {/* Fixed Quantity Stepper - Always Visible */}
                {(() => {
                    const existingItem = step1.items.find(i => i.id === item.id);
                    const currentQuantity = existingItem?.quantity || 0;
                    
                    return (
                      <Card 
                        bg="white" 
                        borderRadius="xl" 
                        p={{ base: 3, md: 2 }} 
                        border="2px solid" 
                        borderColor={currentQuantity > 0 ? "purple.200" : "gray.200"}
                        shadow={currentQuantity > 0 ? "md" : "sm"}
                        transition="all 0.2s"
                        w="full"
                        className="stepper-container"
                      >
                        <HStack spacing={{ base: 2, md: 2 }} justify="center" w="full" flexWrap="nowrap" maxW="300px" mx="auto">
                          {/* Decrease Button */}
                          <IconButton
                            size="md" // Changed from lg to md for mobile
                            colorScheme="red"
                            variant={currentQuantity > 0 ? "solid" : "ghost"}
                            aria-label={`Decrease quantity of ${item.name}`}
                            icon={<Text fontSize="lg" fontWeight="bold">−</Text>}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (currentQuantity > 0) {
                                updateItemQuantity(item.id, currentQuantity - 1);
                              }
                            }}
                            isDisabled={currentQuantity === 0}
                            _hover={{ 
                              bg: currentQuantity > 0 ? 'red.600' : 'gray.50', 
                              transform: currentQuantity > 0 ? 'scale(1.05)' : 'none'
                            }}
                            _active={{ transform: currentQuantity > 0 ? 'scale(0.95)' : 'none' }}
                            borderRadius="full"
                            transition="all 0.2s"
                            minH="44px" // Minimum touch target
                            minW="44px" // Minimum touch target
                            p={1} // Reduced padding
                            _focus={{ 
                              boxShadow: currentQuantity > 0 ? "0 0 0 3px rgba(229, 62, 62, 0.3)" : "none",
                              outline: "none"
                            }}
                            opacity={currentQuantity === 0 ? 0.3 : 1}
                          />
                          
                          {/* Quantity Display */}
                          <Box
                            px={{ base: 3, md: 4 }} // Reduced horizontal padding
                            py={{ base: 2, md: 2 }}
                            bg={currentQuantity > 0 ? "purple.50" : "gray.50"}
                            borderRadius="xl"
                            border="1px solid"
                            borderColor={currentQuantity > 0 ? "purple.200" : "gray.300"}
                            minW={{ base: "64px", md: "70px" }} // Reduced min width for mobile
                            maxW={{ base: "100px", md: "80px" }} // Increased max width for mobile
                            flex="1" // Allow flexible width
                            minH="48px" // Fixed 48px height
                            textAlign="center"
                            transition="all 0.2s"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text 
                              fontWeight="bold" 
                              color={currentQuantity > 0 ? "purple.800" : "gray.700"} 
                              fontSize={{ base: "lg", md: "lg" }} // 18px on mobile
                              lineHeight="1"
                              aria-live="polite"
                              wordBreak="keep-all" // Prevent word breaking
                            >
                              {currentQuantity}
                            </Text>
                          </Box>
                          
                          {/* Increase Button */}
                          <IconButton
                            size="md" // Changed from lg to md for mobile
                            colorScheme="green"
                            variant="solid"
                            aria-label={`Increase quantity of ${item.name}`}
                            icon={<Text fontSize="lg" fontWeight="bold">+</Text>}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (currentQuantity === 0) {
                                // If quantity is 0, add the item first
                                addItem(item);
                              } else {
                                updateItemQuantity(item.id, currentQuantity + 1);
                              }
                            }}
                            _hover={{ bg: 'green.600', transform: 'scale(1.05)' }}
                            _active={{ transform: 'scale(0.95)' }}
                            borderRadius="full"
                            transition="all 0.2s"
                            minH="44px" // Minimum touch target
                            minW="44px" // Minimum touch target
                            p={1} // Reduced padding
                            _focus={{ 
                              boxShadow: "0 0 0 3px rgba(56, 161, 105, 0.3)",
                              outline: "none"
                            }}
                          />
                        </HStack>
                      </Card>
                    );
                })()}
              </VStack>
            </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Card>

        {/* Enhanced Selected Items & Pricing Combined */}
        {step1.items.length > 0 && (
          <Box>
            <Box textAlign="center" mb={6}>
              <Heading size="xl" mb={3} bgGradient="linear(to-r, green.600, blue.600)" bgClip="text">
                📦 Selected Items & Pricing
              </Heading>
              <Text color="gray.600" fontSize="lg">
                Review your items and see the estimated cost
              </Text>
            </Box>
            
            {/* Enhanced Selected Items List */}
            <Card bg="white" borderColor="gray.200" borderWidth="1px" borderRadius="xl" mb={4} p={6} shadow="md">
              <VStack spacing={4} align="stretch">
                <HStack spacing={3} align="center" mb={4}>
                  <Circle size="40px" bg="green.500" color="white">
                    <Icon as={FaBolt} boxSize={5} />
                  </Circle>
                  <VStack align="start" spacing={0}>
                    <HStack spacing={2}>
                      <Text fontWeight="bold" color="gray.700" fontSize="lg">
                        Selected Items
                      </Text>
                      {step1.items.length > 0 && (
                        <Badge colorScheme="green" variant="solid" fontSize="xs">
                          ✓ {step1.items.length} items
                        </Badge>
                      )}
                    </HStack>
                    <Text fontSize="sm" color="gray.500">
                      {step1.items.length > 0 
                        ? `${step1.items.length} items added to your move (Total: ${step1.items.reduce((sum, item) => sum + item.quantity, 0)} pieces)`
                        : 'No items selected yet'
                      }
                    </Text>
                  </VStack>
                </HStack>
              <VStack spacing={3} align="stretch">
                {step1.items.map((item) => (
                  <Card key={item.id} bg="white" borderRadius="xl" border="2px solid" borderColor="gray.200" p={4}>
                    <Flex justify="space-between" align="center">
                      <HStack spacing={4}>
                        {/* Enhanced Item Image using dedicated component */}
                        <Box w="50px" h="50px" flexShrink={0}>
                          <ItemImageDisplay
                            itemId={item.id}
                            itemName={item.name}
                            category={item.category}
                            width="50px"
                            height="50px"
                            borderRadius="lg"
                            showHover={false}
                            showFallbackText={true}
                          />
                        </Box>
                      
                        {/* Item Details */}
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold" fontSize="md" color="gray.800">
                            {item.name}
                          </Text>
                          <Text fontSize="sm" color="gray.600" fontWeight="medium">
                            {item.weight}kg • {item.volume}m³
                          </Text>
                        </VStack>
                      </HStack>
                      
                      {/* Quantity Controls */}
                      <HStack spacing={3}>
                        <IconButton
                          size={{ base: "md", md: "sm" }}
                          minH={{ base: "44px", md: "auto" }}
                          minW={{ base: "44px", md: "auto" }}
                          colorScheme="red"
                          variant="outline"
                          aria-label="Decrease quantity"
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          _hover={{ bg: 'red.50', transform: 'scale(1.1)' }}
                          icon={<Text fontSize="lg" fontWeight="bold">−</Text>}
                          borderRadius="full"
                          transition="all 0.2s"
                        />
                        <Box
                          px={3}
                          py={1}
                          bg="purple.50"
                          borderRadius="lg"
                          border="2px solid"
                          borderColor="purple.200"
                          minW="40px"
                          textAlign="center"
                        >
                          <Text fontSize="md" fontWeight="bold" color="purple.700">
                            {item.quantity}
                          </Text>
                        </Box>
                        <IconButton
                          size={{ base: "md", md: "sm" }}
                          minH={{ base: "44px", md: "auto" }}
                          minW={{ base: "44px", md: "auto" }}
                          colorScheme="green"
                          variant="outline"
                          aria-label="Increase quantity"
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          _hover={{ bg: 'green.50', transform: 'scale(1.1)' }}
                          icon={<Text fontSize="lg" fontWeight="bold">+</Text>}
                          borderRadius="full"
                          transition="all 0.2s"
                        />
                        <IconButton
                          size={{ base: "md", md: "sm" }}
                          minH={{ base: "44px", md: "auto" }}
                          minW={{ base: "44px", md: "auto" }}
                          aria-label="Remove item"
                          icon={<Icon as={FaTrash} />}
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeItem(item.id)}
                          _hover={{ bg: 'red.50', transform: 'scale(1.1)' }}
                          borderRadius="full"
                          transition="all 0.2s"
                        />
                      </HStack>
                    </Flex>
                  </Card>
                ))}
              </VStack>
            </VStack>
            </Card>

            {/* Enhanced Pricing Breakdown */}
            {step1.pricing && (
              <Card bg="green.50" borderColor="green.200" borderWidth="1px" borderRadius="xl" p={4} shadow="sm">
                <VStack spacing={4} align="stretch">
                  <HStack spacing={3} align="center" mb={4}>
                    <Circle size="40px" bg="green.500" color="white">
                      <Icon as={FaBolt} boxSize={5} />
                    </Circle>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" color="green.800" fontSize="lg">
                        💰 Complete Pricing Breakdown
                      </Text>
                      <Text fontSize="sm" color="green.600">
                        Detailed cost breakdown for your move
                      </Text>
                    </VStack>
                  </HStack>
                
                  {/* Enhanced Selected Items List */}
                  <Card bg="white" borderRadius="xl" p={4} border="2px solid" borderColor="green.200">
                    <VStack spacing={3} align="stretch">
                      <HStack spacing={2} align="center" mb={2}>
                        <Icon as={FaBolt} color="green.500" boxSize={4} />
                        <Text fontWeight="bold" color="green.700" fontSize="md">
                          📦 Selected Items ({step1.items.length} items, {step1.items.reduce((sum, item) => sum + item.quantity, 0)} total)
                        </Text>
                      </HStack>
                      <VStack spacing={2} align="stretch">
                        {step1.items.map((item) => (
                          <Card key={item.id} bg="gray.50" borderRadius="lg" p={3} border="1px solid" borderColor="gray.200">
                            <HStack justify="space-between" align="center">
                              <VStack align="start" spacing={1}>
                                <Text color="gray.800" fontWeight="medium" fontSize="sm">
                                  {item.quantity}× {item.name}
                                </Text>
                                <Text color="gray.600" fontSize="xs">
                                  {item.weight * item.quantity}kg • {item.volume * item.quantity}m³
                                </Text>
                              </VStack>
                              {/* Price hidden as requested */}
                              {/* <Badge colorScheme="green" variant="subtle" fontSize="xs">
                                £{(item.unitPrice * item.quantity).toFixed(2)}
                              </Badge> */}
                            </HStack>
                          </Card>
                        ))}
                      </VStack>
                    </VStack>
                  </Card>
                  <Divider my={2} />
                  <Card bg="green.100" borderRadius="lg" p={3} border="2px solid" borderColor="green.300">
                    <HStack justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" color="green.800" fontSize="sm">
                          Total Summary
                        </Text>
                        <Text fontSize="xs" color="green.700">
                          {totalWeight}kg • {totalVolume}m³ • {calculateRequiredWorkers(step1.items)} workers
                        </Text>
                      </VStack>
                      <Badge colorScheme="green" variant="solid" fontSize="sm" px={3} py={1}>
                        {step1.items.length} items
                      </Badge>
                    </HStack>
                  </Card>
                  
                  {/* Enhanced Price Components */}
                  <VStack spacing={3} align="stretch">
                    <Card bg="white" borderRadius="lg" p={4} border="2px solid" borderColor="gray.200">
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between" align="center">
                          <Text fontWeight="medium" color="gray.700">Base Fee:</Text>
                          <Text fontWeight="bold" color="gray.800">£{step1.pricing.baseFee.toFixed(2)}</Text>
                        </HStack>
                        <HStack justify="space-between" align="center">
                          <Text fontWeight="medium" color="gray.700">Distance Fee:</Text>
                          <Text fontWeight="bold" color="gray.800">£{step1.pricing.distanceFee.toFixed(2)}</Text>
                        </HStack>
                        <HStack justify="space-between" align="center">
                          <Text fontWeight="medium" color="gray.700">Volume Fee:</Text>
                          <Text fontWeight="bold" color="gray.800">£{step1.pricing.volumeFee.toFixed(2)}</Text>
                        </HStack>
                        <HStack justify="space-between" align="center">
                          <Text fontWeight="medium" color="gray.700">Service Fee:</Text>
                          <Text fontWeight="bold" color="gray.800">£{step1.pricing.serviceFee.toFixed(2)}</Text>
                        </HStack>
                        {step1.pricing.urgencyFee > 0 && (
                          <>
                            <HStack justify="space-between" align="center">
                              <Text fontWeight="medium" color="gray.700">Additional Fees:</Text>
                              <Text fontWeight="bold" color="gray.800">£{step1.pricing.urgencyFee.toFixed(2)}</Text>
                            </HStack>
                            <Card bg="gray.50" borderRadius="lg" p={3} border="1px solid" borderColor="gray.200">
                              <VStack spacing={2} align="stretch">
                                <Text fontSize="sm" color="gray.700" fontWeight="medium">Additional Fee Details:</Text>
                                {/* Property access fees */}
                                {step1.pickupProperty?.floors > 0 && (
                                  <Text fontSize="xs" color="gray.600">
                                    • Pickup: Floor {step1.pickupProperty.floors} {step1.pickupProperty.hasLift ? '(£2/floor with elevator)' : '(£5/floor without elevator)'}
                                  </Text>
                                )}
                                {step1.dropoffProperty?.floors > 0 && (
                                  <Text fontSize="xs" color="gray.600">
                                    • Dropoff: Floor {step1.dropoffProperty.floors} {step1.dropoffProperty.hasLift ? '(£2/floor with elevator)' : '(£5/floor without elevator)'}
                                  </Text>
                                )}
                                {/* Worker fees */}
                                {calculateRequiredWorkers(step1.items) > 2 && (
                                  <Text fontSize="xs" color="gray.600">
                                    • Extra Workers: {calculateRequiredWorkers(step1.items) - 2} additional (£15 each)
                                  </Text>
                                )}
                                {/* Building type multiplier */}
                                {(step1.pickupProperty?.type !== 'house' || step1.dropoffProperty?.type !== 'house') && (
                                  <Text fontSize="xs" color="gray.600">
                                    • Building Type: {step1.pickupProperty?.type || 'house'} / {step1.dropoffProperty?.type || 'house'} (pricing adjustment)
                                  </Text>
                                )}
                              </VStack>
                            </Card>
                          </>
                        )}
                        <HStack justify="space-between" align="center">
                          <Text fontWeight="medium" color="gray.700">VAT (20%):</Text>
                          <Text fontWeight="bold" color="gray.800">£{step1.pricing.vat.toFixed(2)}</Text>
                        </HStack>
                        <Divider />
                        {/* Total price display */}
                        <Card bg="green.100" borderRadius="lg" p={4} border="2px solid" borderColor="green.300">
                          <HStack justify="space-between" align="center">
                            <Text fontWeight="bold" fontSize="lg" color="green.800">Total:</Text>
                            <Text fontWeight="bold" fontSize="xl" color="green.800">£{step1.pricing.total.toFixed(2)}</Text>
                          </HStack>
                        </Card>
                      </VStack>
                    </Card>
                  </VStack>
                </VStack>
              </Card>
          )}
        </Box>
      )}
      </Box>

      {/* Enhanced Date and Time Selection */}
      <Card bg="white" borderRadius="xl" p={6} shadow="md" border="1px solid" borderColor="gray.200">
        <VStack spacing={6} align="stretch">
          <Box textAlign="center" mb={4}>
            <HStack spacing={3} justify="center" mb={3}>
              <Circle size="50px" bg="blue.500" color="white">
                <Icon as={FaCalendarAlt} boxSize={6} />
              </Circle>
              <VStack align="start" spacing={0}>
                <HStack spacing={2}>
                  <Heading as="h3" size="xl" color="gray.700" bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">
                    📅 When are we moving?
                  </Heading>
                  {step1.pickupDate && step1.pickupTimeSlot && (
                    <Badge colorScheme="blue" variant="solid" fontSize="xs">
                      ✓ Scheduled
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="sm" color="gray.500">
                  Select your preferred date and time
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Date Selection with Cards */}
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
                <Icon as={FaCalendarAlt} mr={2} />
                Pickup Date
              </FormLabel>
              
              {/* Enhanced Quick Date Cards */}
              <Card bg="gray.50" borderRadius="xl" p={4} mb={4} border="2px solid" borderColor="gray.200">
                <VStack spacing={3}>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                    Quick Date Selection
                  </Text>
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={3} w="full">
                {(() => {
                  const today = new Date();
                  const dates = [];
                  
                  // Generate next 5 days
                  for (let i = 0; i < 5; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() + i);
                    dates.push(date);
                  }
                  
                  return dates.map((date, index) => {
                    const dateString = date.toISOString().split('T')[0];
                    const isSelected = step1.pickupDate === dateString;
                    const dayName = date.toLocaleDateString('en-GB', { weekday: 'short' });
                    const dayNumber = date.getDate();
                    const monthName = date.toLocaleDateString('en-GB', { month: 'short' });
                    
                    let label = '';
                    let colorScheme = 'gray';
                    let emoji = '';
                    
                    if (index === 0) {
                      label = 'Today';
                      colorScheme = isSelected ? 'red' : 'red';
                      emoji = '🔥';
                    } else if (index === 1) {
                      label = 'Tomorrow';
                      colorScheme = isSelected ? 'orange' : 'orange';
                      emoji = '⚡';
                    } else if (index === 2) {
                      label = dayName;
                      colorScheme = isSelected ? 'green' : 'green';
                      emoji = '🌟';
                    } else if (index === 3) {
                      label = dayName;
                      colorScheme = isSelected ? 'blue' : 'blue';
                      emoji = '💎';
                    } else {
                      label = dayName;
                      colorScheme = isSelected ? 'purple' : 'purple';
                      emoji = '🚀';
                    }
                    
                    return (
                        <Card
                          key={dateString}
                          bg={isSelected ? `${colorScheme}.500` : 'white'}
                          borderColor={isSelected ? `${colorScheme}.500` : 'gray.200'}
                          borderWidth="2px"
                          borderRadius="xl"
                          p={3}
                          cursor="pointer"
                          onClick={() => updateFormData('step1', { pickupDate: dateString })}
                          _hover={{ shadow: 'lg' }}
                          transition="all 0.3s ease"
                          textAlign="center"
                          minH="100px"
                          display="flex"
                          flexDirection="column"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Text fontSize="lg" mb={1}>{emoji}</Text>
                          <Text fontWeight="bold" fontSize="sm" lineHeight="1.2" color={isSelected ? 'white' : 'gray.700'} mb={1}>
                            {label}
                          </Text>
                          <Text fontSize="xs" color={isSelected ? 'white' : 'gray.500'} fontWeight="semibold">
                            {dayNumber} {monthName}
                          </Text>
                        </Card>
                    );
                  });
                })()}
              </SimpleGrid>
              
                {/* Enhanced Calendar Input */}
                <Card bg="white" borderRadius="lg" p={4} border="2px solid" borderColor="gray.200">
                  <VStack spacing={3}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Or choose a custom date:</Text>
                    <Input
                      type="date"
                      value={step1.pickupDate}
                      onChange={(e) => updateFormData('step1', { pickupDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      bg="gray.50"
                      borderColor="gray.300"
                      _hover={{ borderColor: "blue.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      size="md"
                      borderRadius="lg"
                      fontWeight="medium"
                    />
                  </VStack>
                </Card>
              </VStack>
            </Card>
              
              {errors['step1.pickupDate'] && (
                <Card bg="red.50" borderColor="red.200" borderRadius="lg" p={3} mt={2}>
                  <Text color="red.700" fontSize="sm" fontWeight="medium">
                    {errors['step1.pickupDate']}
                  </Text>
                </Card>
              )}
            </FormControl>
          </VStack>

          {/* Time Slot Selection as Cards */}
          <FormControl isRequired>
            <FormLabel fontSize="md" fontWeight="bold" color="gray.700" mb={4}>
              <Icon as={FaClock} mr={2} />
              Choose Time Slot
            </FormLabel>
            
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 3, md: 4 }}>
              {[
                { value: 'morning', label: 'Morning', time: '8:00 - 12:00', emoji: '🌅', color: 'yellow' },
                { value: 'afternoon', label: 'Afternoon', time: '12:00 - 17:00', emoji: '☀️', color: 'orange' },
                { value: 'evening', label: 'Evening', time: '17:00 - 20:00', emoji: '🌆', color: 'purple' },
                { value: 'flexible', label: 'Flexible', time: 'Any time', emoji: '🕐', color: 'blue' }
              ].map((slot) => {
                const isSelected = step1.pickupTimeSlot === slot.value;
                return (
                  <Card
                    key={slot.value}
                    bg={isSelected ? `${slot.color}.50` : 'white'}
                    borderColor={isSelected ? `${slot.color}.500` : 'gray.200'}
                    borderWidth="2px"
                    borderRadius="xl"
                    p={{ base: 3, md: 4 }}
                    cursor="pointer"
                    onClick={() => updateFormData('step1', { pickupTimeSlot: slot.value })}
                    _hover={{ 
                      shadow: 'lg',
                      transform: 'translateY(-2px)',
                      borderColor: `${slot.color}.400`
                    }}
                    transition="all 0.3s ease"
                    textAlign="center"
                    minH={{ base: "100px", md: "120px" }}
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text fontSize={{ base: "xl", md: "2xl" }} mb={2}>{slot.emoji}</Text>
                    <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="bold" color={isSelected ? `${slot.color}.700` : 'gray.700'} mb={1}>
                      {slot.label}
                    </Text>
                    <Text fontSize={{ base: "2xs", md: "xs" }} color={isSelected ? `${slot.color}.600` : 'gray.500'}>
                      {slot.time}
                    </Text>
                    {isSelected && (
                      <Badge colorScheme={slot.color} size="sm" mt={2}>
                        Selected
                      </Badge>
                    )}
                  </Card>
                );
              })}
            </SimpleGrid>
            
            {errors['step1.pickupTimeSlot'] && (
              <Card bg="red.50" borderColor="red.200" borderRadius="lg" p={3} mt={4}>
                <Text color="red.700" fontSize="sm" fontWeight="medium">
                  {errors['step1.pickupTimeSlot']}
                </Text>
              </Card>
            )}
          </FormControl>

        </VStack>
      </Card>


    </VStack>
  );
}
