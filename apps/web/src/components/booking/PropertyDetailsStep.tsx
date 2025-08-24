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
  useToast
} from '@chakra-ui/react';
import { FaBuilding, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import Button from '../common/Button';

interface PropertyDetailsStepProps {
  bookingData: any;
  updateBookingData: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

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

    // Validate pickup property
    if (bookingData.pickupProperty?.floor === undefined || bookingData.pickupProperty?.floor < 0) {
      newErrors.pickupFloor = 'Please enter a valid floor number';
    }
    if (!bookingData.pickupProperty?.propertyType) {
      newErrors.pickupPropertyType = 'Please select property type';
    }

    // Validate dropoff property
    if (bookingData.dropoffProperty?.floor === undefined || bookingData.dropoffProperty?.floor < 0) {
      newErrors.dropoffFloor = 'Please enter a valid floor number';
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

  return (
    <Box p={6} borderWidth="1px" borderRadius="xl" bg="bg.card" borderColor="border.primary" boxShadow="md">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="neon.500">
            Step 2: Property Details
          </Text>
          <Text fontSize="sm" color="text.secondary" mt={2}>
            Tell us about the properties for pickup and delivery
          </Text>
        </Box>

        {/* Pickup Property */}
        <Box>
          <HStack spacing={3} mb={4}>
            <Icon as={FaBuilding} color="brand.500" />
            <Text fontSize="lg" fontWeight="semibold" color="brand.500">
              Pickup Property
            </Text>
          </HStack>
          
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.pickupPropertyType}>
              <FormLabel>Property Type</FormLabel>
              <Select
                placeholder="Select property type"
                value={bookingData.pickupProperty?.propertyType || ''}
                onChange={(e) => updatePickupProperty('propertyType', e.target.value)}
                size="lg"
              >
                <option value="FLAT">Flat/Apartment</option>
                <option value="HOUSE">House</option>
                <option value="OFFICE">Office</option>
                <option value="WAREHOUSE">Warehouse</option>
                <option value="SHOP">Shop/Retail</option>
                <option value="OTHER">Other</option>
              </Select>
              <FormErrorMessage>{errors.pickupPropertyType}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.pickupFloor}>
              <FormLabel>Floor Number</FormLabel>
              <NumberInput
                min={0}
                max={100}
                value={bookingData.pickupProperty?.floor || 0}
                onChange={(value) => updatePickupProperty('floor', parseInt(value) || 0)}
                size="lg"
              >
                <NumberInputField placeholder="0 for ground floor" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{errors.pickupFloor}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <Checkbox
                isChecked={bookingData.pickupProperty?.hasLift || false}
                onChange={(e) => updatePickupProperty('hasLift', e.target.checked)}
                size="lg"
              >
                Building has a lift/elevator
              </Checkbox>
            </FormControl>
          </VStack>
        </Box>

        <Divider />

        {/* Dropoff Property */}
        <Box>
          <HStack spacing={3} mb={4}>
            <Icon as={FaBuilding} color="neon.500" />
            <Text fontSize="lg" fontWeight="semibold" color="neon.500">
              Dropoff Property
            </Text>
          </HStack>
          
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.dropoffPropertyType}>
              <FormLabel>Property Type</FormLabel>
              <Select
                placeholder="Select property type"
                value={bookingData.dropoffProperty?.propertyType || ''}
                onChange={(e) => updateDropoffProperty('propertyType', e.target.value)}
                size="lg"
              >
                <option value="FLAT">Flat/Apartment</option>
                <option value="HOUSE">House</option>
                <option value="OFFICE">Office</option>
                <option value="WAREHOUSE">Warehouse</option>
                <option value="SHOP">Shop/Retail</option>
                <option value="OTHER">Other</option>
              </Select>
              <FormErrorMessage>{errors.dropoffPropertyType}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.dropoffFloor}>
              <FormLabel>Floor Number</FormLabel>
              <NumberInput
                min={0}
                max={100}
                value={bookingData.dropoffProperty?.floor || 0}
                onChange={(value) => updateDropoffProperty('floor', parseInt(value) || 0)}
                size="lg"
              >
                <NumberInputField placeholder="0 for ground floor" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{errors.dropoffFloor}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <Checkbox
                isChecked={bookingData.dropoffProperty?.hasLift || false}
                onChange={(e) => updateDropoffProperty('hasLift', e.target.checked)}
                size="lg"
              >
                Building has a lift/elevator
              </Checkbox>
            </FormControl>
          </VStack>
        </Box>

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
            isCTA={true}
            rightIcon={<FaArrowRight />}
          >
            Continue to Items
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
