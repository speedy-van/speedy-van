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
  AlertDescription
} from '@chakra-ui/react';
import { FaBuilding, FaArrowRight, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import Button from '../common/Button';
import BookingNavigationButtons from './BookingNavigationButtons';

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

  return (
    <Box p={6} borderWidth="1px" borderRadius="xl" bg="bg.card" borderColor="border.primary" boxShadow="md" className="booking-step-card">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="neon.500">
            Step 2: Property Details
          </Text>
          <Text fontSize="sm" color="text.secondary" mt={2}>
            Tell us about the properties for pickup and delivery
          </Text>
        </Box>

        {/* Floor Number Info Alert */}
        <Alert status="info" borderRadius="md" className="booking-form-control">
          <AlertIcon as={FaInfoCircle} />
          <AlertDescription fontSize={{ base: 'sm', md: 'md' }}>
            <Text fontWeight="semibold" mb={1}>Floor Number Information:</Text>
            <Text>Please ensure your floor number is correct as our drivers will deliver your items to the specified floor. Use 0 for ground floor, 1 for first floor, etc.</Text>
          </AlertDescription>
        </Alert>

        {/* Pickup Property */}
        <Box className="booking-form-section">
          <HStack spacing={3} mb={4}>
            <Icon as={FaBuilding} color="brand.500" />
            <Text fontSize="lg" fontWeight="semibold" color="brand.500">
              Pickup Property
            </Text>
          </HStack>
          
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.pickupPropertyType} className="booking-form-control">
              <FormLabel>Property Type *</FormLabel>
              <Select
                placeholder="Select property type"
                value={bookingData.pickupProperty?.propertyType || ''}
                onChange={(e) => updatePickupProperty('propertyType', e.target.value)}
                size="lg"
                className="booking-select"
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

            <FormControl isInvalid={!!errors.pickupFloor} className="booking-form-control">
              <FormLabel>Floor Number (Optional)</FormLabel>
              <NumberInput
                min={0}
                max={100}
                value={bookingData.pickupProperty?.floor !== undefined ? bookingData.pickupProperty.floor : ''}
                onChange={(value) => {
                  const numValue = parseInt(value);
                  updatePickupProperty('floor', isNaN(numValue) ? undefined : numValue);
                }}
                size="lg"
                className="booking-number-input"
              >
                <NumberInputField placeholder="0 for ground floor (optional)" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="xs" color="text.secondary" mt={1}>
                Leave empty if unsure. Driver will confirm on arrival.
              </Text>
              <FormErrorMessage>{errors.pickupFloor}</FormErrorMessage>
            </FormControl>

            <FormControl className="booking-form-control">
              <Checkbox
                isChecked={bookingData.pickupProperty?.hasLift || false}
                onChange={(e) => updatePickupProperty('hasLift', e.target.checked)}
                size="lg"
                className="booking-checkbox"
              >
                Building has a lift/elevator
              </Checkbox>
            </FormControl>
          </VStack>
        </Box>

        <Divider className="booking-divider" />

        {/* Dropoff Property */}
        <Box className="booking-form-section">
          <HStack spacing={3} mb={4}>
            <Icon as={FaBuilding} color="neon.500" />
            <Text fontSize="lg" fontWeight="semibold" color="neon.500">
              Dropoff Property
            </Text>
          </HStack>
          
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.dropoffPropertyType} className="booking-form-control">
              <FormLabel>Property Type *</FormLabel>
              <Select
                placeholder="Select property type"
                value={bookingData.dropoffProperty?.propertyType || ''}
                onChange={(e) => updateDropoffProperty('propertyType', e.target.value)}
                size="lg"
                className="booking-select"
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

            <FormControl isInvalid={!!errors.dropoffFloor} className="booking-form-control">
              <FormLabel>Floor Number (Optional)</FormLabel>
              <NumberInput
                min={0}
                max={100}
                value={bookingData.dropoffProperty?.floor !== undefined ? bookingData.dropoffProperty.floor : ''}
                onChange={(value) => {
                  const numValue = parseInt(value);
                  updateDropoffProperty('floor', isNaN(numValue) ? undefined : numValue);
                }}
                size="lg"
                className="booking-number-input"
              >
                <NumberInputField placeholder="0 for ground floor (optional)" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="xs" color="text.secondary" mt={1}>
                Leave empty if unsure. Driver will confirm on arrival.
              </Text>
              <FormErrorMessage>{errors.dropoffFloor}</FormErrorMessage>
            </FormControl>

            <FormControl className="booking-form-control">
              <Checkbox
                isChecked={bookingData.dropoffProperty?.hasLift || false}
                onChange={(e) => updateDropoffProperty('hasLift', e.target.checked)}
                size="lg"
                className="booking-checkbox"
              >
                Building has a lift/elevator
              </Checkbox>
            </FormControl>
          </VStack>
        </Box>

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
