import React, { useState } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Input, 
  FormControl, 
  FormLabel, 
  FormErrorMessage,
  Select,
  Checkbox,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  Icon,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  Badge,
  SimpleGrid
} from '@chakra-ui/react';
import { FaBuilding, FaArrowRight, FaArrowLeft, FaInfoCircle, FaHome, FaBuilding as FaOffice, FaWarehouse, FaStore, FaEllipsisH, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Button from '../common/Button';
import BookingNavigationButtons from './BookingNavigationButtons';

interface PropertyDetailsStepProps {
  bookingData: any;
  updateBookingData: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

const PROPERTY_TYPES = [
  { value: 'FLAT', label: 'Flat/Apartment', icon: FaBuilding, color: 'blue.500', description: 'Residential apartment or flat' },
  { value: 'HOUSE', label: 'House', icon: FaHome, color: 'green.500', description: 'Detached or semi-detached house' },
  { value: 'OFFICE', label: 'Office', icon: FaOffice, color: 'purple.500', description: 'Commercial office space' },
  { value: 'WAREHOUSE', label: 'Warehouse', icon: FaWarehouse, color: 'orange.500', description: 'Storage or industrial facility' },
  { value: 'SHOP', label: 'Shop/Retail', icon: FaStore, color: 'pink.500', description: 'Retail or commercial space' },
  { value: 'OTHER', label: 'Other', icon: FaEllipsisH, color: 'gray.500', description: 'Other property type' }
];

export default function PropertyDetailsStep({ 
  bookingData, 
  updateBookingData, 
  onNext, 
  onBack 
}: PropertyDetailsStepProps) {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const toast = useToast();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Validate pickup property - floor is now optional
    if (bookingData.pickupProperty?.floor !== undefined && bookingData.pickupProperty?.floor < 0) {
      newErrors.pickupFloor = 'Please enter a valid floor number (0 or higher)';
    }
    if (!bookingData.pickupProperty?.propertyType) {
      newErrors.pickupPropertyType = 'Please select property type';
    }

    // Validate dropoff property - floor is now optional
    if (bookingData.dropoffProperty?.floor !== undefined && bookingData.dropoffProperty?.floor < 0) {
      newErrors.dropoffFloor = 'Please enter a valid floor number (0 or higher)';
    }
    if (!bookingData.dropoffProperty?.propertyType) {
      newErrors.dropoffPropertyType = 'Please select property type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext?.();
    } else {
      toast({
        title: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updatePickupProperty = (field: string, value: any) => {
    updateBookingData({
      pickupProperty: {
        ...bookingData.pickupProperty,
        [field]: value
      }
    });
  };

  const updateDropoffProperty = (field: string, value: any) => {
    updateBookingData({
      dropoffProperty: {
        ...bookingData.dropoffProperty,
        [field]: value
      }
    });
  };

  const getPropertyTypeInfo = (type: string) => {
    return PROPERTY_TYPES.find(pt => pt.value === type);
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="xl" bg="bg.card" borderColor="border.primary" boxShadow="md" className="booking-step-card">
      <VStack spacing={8} align="stretch">
        {/* Enhanced Header */}
        <Box textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="neon.500" textShadow="0 0 10px rgba(0,194,255,0.3)">
            Step 2: Property Details
          </Text>
          <Text fontSize="md" color="text.secondary" mt={3} maxW="500px" mx="auto">
            Tell us about the properties for pickup and delivery to ensure smooth service
          </Text>
        </Box>

        {/* Enhanced Floor Number Info Alert */}
        <Box 
          p={5}
          borderWidth="2px"
          borderRadius="xl"
          borderColor="neon.300"
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
            background: "linear-gradient(135deg, rgba(0,194,255,0.08), rgba(0,209,143,0.08))",
            pointerEvents: "none"
          }}
        >
          <HStack spacing={4} position="relative" zIndex={1}>
            <Icon as={FaInfoCircle} color="neon.500" boxSize={6} />
            <Box flex="1">
              <Text fontWeight="bold" color="neon.400" fontSize="lg" mb={2}>
                🏢 Floor Number Information
              </Text>
              <Text color="text.primary" fontSize="sm" lineHeight="1.6">
                Please ensure your floor number is correct as our drivers will deliver your items to the specified floor. 
                Use <Badge colorScheme="neon" variant="solid" size="sm">0</Badge> for ground floor, 
                <Badge colorScheme="neon" variant="solid" size="sm">1</Badge> for first floor, etc.
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* Enhanced Pickup Property Section */}
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
            <HStack spacing={4} justify="center" w="full">
              <Icon as={FaBuilding} color="brand.500" boxSize={7} />
              <VStack spacing={1}>
                <Text fontSize="xl" fontWeight="bold" color="brand.500">
                  📦 Pickup Property
                </Text>
                <Text fontSize="sm" color="text.secondary">
                  Where we'll collect your items
                </Text>
              </VStack>
            </HStack>
            
            {/* Property Type Selection */}
            <FormControl isInvalid={!!errors.pickupPropertyType}>
              <FormLabel fontSize="md" fontWeight="semibold" color="text.primary" mb={4}>
                Property Type *
              </FormLabel>
              
              {/* Enhanced Property Type Cards */}
              <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                {PROPERTY_TYPES.map((type) => (
                  <Box
                    key={type.value}
                    p={4}
                    borderWidth="2px"
                    borderRadius="xl"
                    borderColor={bookingData.pickupProperty?.propertyType === type.value ? 'brand.400' : 'border.primary'}
                    bg={bookingData.pickupProperty?.propertyType === type.value ? 'dark.800' : 'dark.600'}
                    cursor="pointer"
                    transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{ 
                      borderColor: 'brand.400',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }}
                    onClick={() => updatePickupProperty('propertyType', type.value)}
                    position="relative"
                    overflow="hidden"
                    textAlign="center"
                  >
                    {/* Background Glow Effect */}
                    {bookingData.pickupProperty?.propertyType === type.value && (
                      <Box
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        bottom="0"
                        bg="linear-gradient(135deg, rgba(0,209,143,0.1), rgba(0,194,255,0.1))"
                        borderRadius="xl"
                        zIndex={0}
                      />
                    )}
                    
                    <VStack spacing={3} position="relative" zIndex={1}>
                      <Icon as={type.icon} color={type.color} boxSize={8} />
                      <Text fontSize="sm" fontWeight="semibold" color="text.primary">
                        {type.label}
                      </Text>
                      <Text fontSize="xs" color="text.secondary" textAlign="center" px={2}>
                        {type.description}
                      </Text>
                    </VStack>

                    {/* Selection Indicator */}
                    {bookingData.pickupProperty?.propertyType === type.value && (
                      <Box
                        position="absolute"
                        top="3"
                        right="3"
                        bg="brand.500"
                        borderRadius="full"
                        p={1}
                        boxShadow="0 0 10px rgba(0,209,143,0.5)"
                      >
                        <Icon as={FaArrowRight} color="white" boxSize={3} />
                      </Box>
                    )}
                  </Box>
                ))}
              </SimpleGrid>
              
              <FormErrorMessage>{errors.pickupPropertyType}</FormErrorMessage>
            </FormControl>

            {/* Floor and Lift Information */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
              <FormControl isInvalid={!!errors.pickupFloor}>
                <FormLabel fontSize="md" fontWeight="semibold" color="text.primary" mb={3}>
                  <HStack spacing={2}>
                    <Icon as={FaArrowUp} color="brand.400" />
                    <Text>Floor Number (Optional)</Text>
                  </HStack>
                </FormLabel>
                <NumberInput
                  min={0}
                  max={100}
                  value={bookingData.pickupProperty?.floor !== undefined ? bookingData.pickupProperty.floor : ''}
                  onChange={(value) => {
                    const numValue = parseInt(value);
                    updatePickupProperty('floor', isNaN(numValue) ? undefined : numValue);
                  }}
                  size="lg"
                >
                  <NumberInputField 
                    placeholder="0 for ground floor" 
                    borderWidth="2px"
                    borderColor="border.primary"
                    borderRadius="xl"
                    bg="dark.600"
                    _focus={{
                      borderColor: "brand.400",
                      boxShadow: "0 0 0 1px rgba(0,209,143,0.2)"
                    }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="xs" color="text.secondary" mt={2} textAlign="center">
                  Leave empty if unsure. Driver will confirm on arrival.
                </Text>
                <FormErrorMessage>{errors.pickupFloor}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="md" fontWeight="semibold" color="text.primary" mb={3}>
                  <HStack spacing={2}>
                    <Icon as={FaArrowDown} color="brand.400" />
                    <Text>Building Access</Text>
                  </HStack>
                </FormLabel>
                <Box 
                  p={4}
                  borderWidth="2px"
                  borderColor={bookingData.pickupProperty?.hasLift ? 'brand.400' : 'border.primary'}
                  borderRadius="xl"
                  bg={bookingData.pickupProperty?.hasLift ? 'dark.800' : 'dark.600'}
                  transition="all 200ms"
                  _hover={{
                    borderColor: "brand.400",
                    transform: "translateY(-1px)"
                  }}
                >
                  <Checkbox
                    isChecked={bookingData.pickupProperty?.hasLift || false}
                    onChange={(e) => updatePickupProperty('hasLift', e.target.checked)}
                    size="lg"
                    colorScheme="brand"
                  >
                    <Text fontSize="sm" color="text.primary">
                      Building has a lift/elevator
                    </Text>
                  </Checkbox>
                </Box>
              </FormControl>
            </SimpleGrid>
          </VStack>
        </Box>

        <Divider borderColor="border.primary" />

        {/* Enhanced Dropoff Property Section */}
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
            <HStack spacing={4} justify="center" w="full">
              <Icon as={FaBuilding} color="neon.500" boxSize={7} />
              <VStack spacing={1}>
                <Text fontSize="xl" fontWeight="bold" color="neon.500">
                  🎯 Dropoff Property
                </Text>
                <Text fontSize="sm" color="text.secondary">
                  Where we'll deliver your items
                </Text>
              </VStack>
            </HStack>
            
            {/* Property Type Selection */}
            <FormControl isInvalid={!!errors.dropoffPropertyType}>
              <FormLabel fontSize="md" fontWeight="semibold" color="text.primary" mb={4}>
                Property Type *
              </FormLabel>
              
              {/* Enhanced Property Type Cards */}
              <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                {PROPERTY_TYPES.map((type) => (
                  <Box
                    key={type.value}
                    p={4}
                    borderWidth="2px"
                    borderRadius="xl"
                    borderColor={bookingData.dropoffProperty?.propertyType === type.value ? 'neon.400' : 'border.primary'}
                    bg={bookingData.dropoffProperty?.propertyType === type.value ? 'dark.800' : 'dark.600'}
                    cursor="pointer"
                    transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{ 
                      borderColor: 'neon.400',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }}
                    onClick={() => updateDropoffProperty('propertyType', type.value)}
                    position="relative"
                    overflow="hidden"
                    textAlign="center"
                  >
                    {/* Background Glow Effect */}
                    {bookingData.dropoffProperty?.propertyType === type.value && (
                      <Box
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        bottom="0"
                        bg="linear-gradient(135deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))"
                        borderRadius="xl"
                        zIndex={0}
                      />
                    )}
                    
                    <VStack spacing={3} position="relative" zIndex={1}>
                      <Icon as={type.icon} color={type.color} boxSize={8} />
                      <Text fontSize="sm" fontWeight="semibold" color="text.primary">
                        {type.label}
                      </Text>
                      <Text fontSize="xs" color="text.secondary" textAlign="center" px={2}>
                        {type.description}
                      </Text>
                    </VStack>

                    {/* Selection Indicator */}
                    {bookingData.dropoffProperty?.propertyType === type.value && (
                      <Box
                        position="absolute"
                        top="3"
                        right="3"
                        bg="neon.500"
                        borderRadius="full"
                        p={1}
                        boxShadow="0 0 10px rgba(0,194,255,0.5)"
                      >
                        <Icon as={FaArrowRight} color="white" boxSize={3} />
                      </Box>
                    )}
                  </Box>
                ))}
              </SimpleGrid>
              
              <FormErrorMessage>{errors.dropoffPropertyType}</FormErrorMessage>
            </FormControl>

            {/* Floor and Lift Information */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
              <FormControl isInvalid={!!errors.dropoffFloor}>
                <FormLabel fontSize="md" fontWeight="semibold" color="text.primary" mb={3}>
                  <HStack spacing={2}>
                    <Icon as={FaArrowUp} color="neon.400" />
                    <Text>Floor Number (Optional)</Text>
                  </HStack>
                </FormLabel>
                <NumberInput
                  min={0}
                  max={100}
                  value={bookingData.dropoffProperty?.floor !== undefined ? bookingData.dropoffProperty.floor : ''}
                  onChange={(value) => {
                    const numValue = parseInt(value);
                    updateDropoffProperty('floor', isNaN(numValue) ? undefined : numValue);
                  }}
                  size="lg"
                >
                  <NumberInputField 
                    placeholder="0 for ground floor" 
                    borderWidth="2px"
                    borderColor="border.primary"
                    borderRadius="xl"
                    bg="dark.600"
                    _focus={{
                      borderColor: "neon.400",
                      boxShadow: "0 0 0 1px rgba(0,194,255,0.2)"
                    }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="xs" color="text.secondary" mt={2} textAlign="center">
                  Leave empty if unsure. Driver will confirm on arrival.
                </Text>
                <FormErrorMessage>{errors.dropoffFloor}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="md" fontWeight="semibold" color="text.primary" mb={3}>
                  <HStack spacing={2}>
                    <Icon as={FaArrowDown} color="neon.400" />
                    <Text>Building Access</Text>
                  </HStack>
                </FormLabel>
                <Box 
                  p={4}
                  borderWidth="2px"
                  borderColor={bookingData.dropoffProperty?.hasLift ? 'neon.400' : 'border.primary'}
                  borderRadius="xl"
                  bg={bookingData.dropoffProperty?.hasLift ? 'dark.800' : 'dark.600'}
                  transition="all 200ms"
                  _hover={{
                    borderColor: "neon.400",
                    transform: "translateY(-1px)"
                  }}
                >
                  <Checkbox
                    isChecked={bookingData.dropoffProperty?.hasLift || false}
                    onChange={(e) => updateDropoffProperty('hasLift', e.target.checked)}
                    size="lg"
                    colorScheme="neon"
                  >
                    <Text fontSize="sm" color="text.primary">
                      Building has a lift/elevator
                    </Text>
                  </Checkbox>
                </Box>
              </FormControl>
            </SimpleGrid>
          </VStack>
        </Box>

        {/* Enhanced Summary Section */}
        {(bookingData.pickupProperty?.propertyType || bookingData.dropoffProperty?.propertyType) && (
          <Box 
            p={6} 
            borderWidth="2px" 
            borderRadius="xl" 
            bg="dark.800" 
            borderColor="border.neon"
            position="relative"
            overflow="hidden"
            boxShadow="neon.glow"
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
            
            <VStack spacing={4} position="relative" zIndex={1}>
              <Text fontSize="lg" fontWeight="bold" color="neon.500" textShadow="0 0 10px rgba(0,194,255,0.5)">
                🏢 Property Summary
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                {bookingData.pickupProperty?.propertyType && (
                  <Box 
                    p={4} 
                    bg="dark.700" 
                    borderRadius="lg" 
                    borderWidth="1px" 
                    borderColor="border.primary"
                    borderLeftWidth="4px"
                    borderLeftColor="brand.500"
                  >
                    <VStack spacing={2}>
                      <HStack>
                        <Icon as={FaBuilding} color="brand.500" />
                        <Text fontWeight="medium" color="text.primary">Pickup</Text>
                      </HStack>
                      <Text fontSize="sm" color="text.secondary" textAlign="center">
                        {getPropertyTypeInfo(bookingData.pickupProperty.propertyType)?.label}
                      </Text>
                      {bookingData.pickupProperty.floor !== undefined && (
                        <Badge colorScheme="brand" size="sm" variant="solid">
                          Floor {bookingData.pickupProperty.floor}
                        </Badge>
                      )}
                      {bookingData.pickupProperty.hasLift && (
                        <Badge colorScheme="green" size="sm" variant="solid">
                          Has Lift
                        </Badge>
                      )}
                    </VStack>
                  </Box>
                )}
                
                {bookingData.dropoffProperty?.propertyType && (
                  <Box 
                    p={4} 
                    bg="dark.700" 
                    borderRadius="lg" 
                    borderWidth="1px" 
                    borderColor="border.primary"
                    borderLeftWidth="4px"
                    borderLeftColor="neon.500"
                  >
                    <VStack spacing={2}>
                      <HStack>
                        <Icon as={FaBuilding} color="neon.500" />
                        <Text fontWeight="medium" color="text.primary">Dropoff</Text>
                      </HStack>
                      <Text fontSize="sm" color="text.secondary" textAlign="center">
                        {getPropertyTypeInfo(bookingData.dropoffProperty.propertyType)?.label}
                      </Text>
                      {bookingData.dropoffProperty.floor !== undefined && (
                        <Badge colorScheme="neon" size="sm" variant="solid">
                          Floor {bookingData.dropoffProperty.floor}
                        </Badge>
                      )}
                      {bookingData.dropoffProperty.hasLift && (
                        <Badge colorScheme="green" size="sm" variant="solid">
                          Has Lift
                        </Badge>
                      )}
                    </VStack>
                  </Box>
                )}
              </SimpleGrid>
            </VStack>
          </Box>
        )}

        {/* Navigation Buttons */}
        <BookingNavigationButtons
          onNext={handleNext}
          onBack={onBack}
          nextText="Continue to Items"
          backVariant="secondary"
        />
      </VStack>
    </Box>
  );
}
