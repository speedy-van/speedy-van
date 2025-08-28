import React, { useState, useEffect } from 'react';
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
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  CardHeader,
  Switch,
  Badge,
  Tooltip
} from '@chakra-ui/react';
import { 
  FaBuilding, 
  FaArrowRight, 
    FaArrowLeft,
  FaInfoCircle,
  FaStar,
  FaHome,
  FaBuilding as FaOffice,
  FaWarehouse
} from 'react-icons/fa';
import BookingNavigationButtons from './BookingNavigationButtons';

interface PropertyDetailsStepProps {
  bookingData: any;
  updateBookingData: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function EnhancedPropertyDetailsStep({ 
  bookingData, 
  updateBookingData, 
  onNext, 
  onBack 
}: PropertyDetailsStepProps) {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isGroundFloorToGroundFloor, setIsGroundFloorToGroundFloor] = useState(true);
  const toast = useToast();

  // Initialize ground floor toggle based on existing data
  useEffect(() => {
    const pickupFloor = bookingData.pickupProperty?.floor ?? 0;
    const dropoffFloor = bookingData.dropoffProperty?.floor ?? 0;
    const hasPickupLift = bookingData.pickupProperty?.hasLift ?? false;
    const hasDropoffLift = bookingData.dropoffProperty?.hasLift ?? false;
    
    // If both are ground floor (0) and no lifts specified, assume ground-to-ground
    if (pickupFloor === 0 && dropoffFloor === 0 && !hasPickupLift && !hasDropoffLift) {
      setIsGroundFloorToGroundFloor(true);
    } else {
      setIsGroundFloorToGroundFloor(false);
    }
  }, [bookingData.pickupProperty, bookingData.dropoffProperty]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Validate pickup property
    if (!bookingData.pickupProperty?.propertyType) {
      newErrors.pickupPropertyType = 'Please select pickup property type';
    }

    // Validate dropoff property
    if (!bookingData.dropoffProperty?.propertyType) {
      newErrors.dropoffPropertyType = 'Please select dropoff property type';
    }

    // Validate floors if not ground-to-ground
    if (!isGroundFloorToGroundFloor) {
      if (bookingData.pickupProperty?.floor === undefined || bookingData.pickupProperty?.floor < 0) {
        newErrors.pickupFloor = 'Please enter a valid floor number (0 or higher)';
      }
      if (bookingData.dropoffProperty?.floor === undefined || bookingData.dropoffProperty?.floor < 0) {
        newErrors.dropoffFloor = 'Please enter a valid floor number (0 or higher)';
      }
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

  const handleGroundFloorToggle = (isChecked: boolean) => {
    setIsGroundFloorToGroundFloor(isChecked);
    
    if (isChecked) {
      // Reset to ground floor for both locations
      updatePickupProperty('floor', 0);
      updatePickupProperty('hasLift', false);
      updateDropoffProperty('floor', 0);
      updateDropoffProperty('hasLift', false);
      
      toast({
        title: 'Ground floor to ground floor selected',
        description: 'Floor and lift details have been reset',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'house':
        return <Icon as={FaHome} />;
      case 'apartment':
        return <Icon as={FaBuilding} />;
      case 'office':
        return <Icon as={FaOffice} />;
      case 'warehouse':
        return <Icon as={FaWarehouse} />;
      default:
        return <Icon as={FaBuilding} />;
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'house':
        return 'House';
      case 'apartment':
        return 'Apartment';
      case 'office':
        return 'Office';
      case 'warehouse':
        return 'Warehouse';
      default:
        return 'Other';
    }
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="neon.500" mb={2}>
            Property Details
          </Text>
          <Text color="text.secondary">
            Tell us about your pickup and dropoff locations
          </Text>
        </Box>

        {/* Ground Floor Toggle */}
        <Card>
          <CardBody>
            <VStack spacing={4}>
              <HStack justify="space-between" w="full">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="semibold">Ground Floor to Ground Floor</Text>
                  <Text fontSize="sm" color="text.secondary">
                    Both locations are on the ground floor (no stairs)
                  </Text>
                </VStack>
                <Switch 
                  isChecked={isGroundFloorToGroundFloor}
                  onChange={(e) => handleGroundFloorToggle(e.target.checked)}
                  colorScheme="neon"
                  size="lg"
                />
              </HStack>
              
              {isGroundFloorToGroundFloor && (
                <Alert status="success">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Ground Floor Move</AlertTitle>
                    <AlertDescription>
                      No additional charges for stairs. Your move will be priced at the base rate.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Pickup Property Details */}
        <Card>
          <CardHeader>
            <HStack>
              <Icon as={FaBuilding} color="neon.500" />
              <Text fontSize="lg" fontWeight="semibold">Pickup Location</Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.pickupPropertyType}>
                <FormLabel>Property Type</FormLabel>
                <Select
                  placeholder="Select property type"
                  value={bookingData.pickupProperty?.propertyType || ''}
                  onChange={(e) => updatePickupProperty('propertyType', e.target.value)}
                >
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="office">Office</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="other">Other</option>
                </Select>
                <FormErrorMessage>{errors.pickupPropertyType}</FormErrorMessage>
              </FormControl>

              {!isGroundFloorToGroundFloor && (
                <>
                  <FormControl isRequired isInvalid={!!errors.pickupFloor}>
                    <FormLabel>Floor Number</FormLabel>
                    <NumberInput
                      min={0}
                      max={50}
                      value={bookingData.pickupProperty?.floor ?? 0}
                      onChange={(_, value) => updatePickupProperty('floor', value)}
                    >
                      <NumberInputField placeholder="0 = Ground floor" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>{errors.pickupFloor}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Lift Available</FormLabel>
                    <HStack spacing={4}>
                      <Checkbox
                        isChecked={bookingData.pickupProperty?.hasLift ?? false}
                        onChange={(e) => updatePickupProperty('hasLift', e.target.checked)}
                      >
                        <HStack spacing={2}>
                          <Icon as={FaStar} color="green.500" />
                          <Text>Yes, there's a lift</Text>
                        </HStack>
                      </Checkbox>
                    </HStack>
                    <Text fontSize="sm" color="text.secondary" mt={1}>
                      Having a lift reduces stairs charges by 60%
                    </Text>
                  </FormControl>
                </>
              )}

              {/* Floor Info Display */}
              {bookingData.pickupProperty?.propertyType && (
                <HStack spacing={3} p={3} bg="gray.50" borderRadius="md" w="full">
                  <Icon as={FaBuilding} color="neon.500" />
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="medium">
                      {getPropertyTypeLabel(bookingData.pickupProperty.propertyType)}
                    </Text>
                    {isGroundFloorToGroundFloor ? (
                      <Badge colorScheme="green">Ground Floor</Badge>
                    ) : (
                      <HStack spacing={2}>
                        <Badge colorScheme="blue">
                          Floor {bookingData.pickupProperty?.floor ?? 0}
                        </Badge>
                        {bookingData.pickupProperty?.hasLift && (
                          <Badge colorScheme="green">
                            <Icon as={FaStar} mr={1} />
                            Lift Available
                          </Badge>
                        )}
                      </HStack>
                    )}
                  </VStack>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Dropoff Property Details */}
        <Card>
          <CardHeader>
            <HStack>
              <Icon as={FaBuilding} color="neon.500" />
              <Text fontSize="lg" fontWeight="semibold">Dropoff Location</Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.dropoffPropertyType}>
                <FormLabel>Property Type</FormLabel>
                <Select
                  placeholder="Select property type"
                  value={bookingData.dropoffProperty?.propertyType || ''}
                  onChange={(e) => updateDropoffProperty('propertyType', e.target.value)}
                >
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="office">Office</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="other">Other</option>
                </Select>
                <FormErrorMessage>{errors.dropoffPropertyType}</FormErrorMessage>
              </FormControl>

              {!isGroundFloorToGroundFloor && (
                <>
                  <FormControl isRequired isInvalid={!!errors.dropoffFloor}>
                    <FormLabel>Floor Number</FormLabel>
                    <NumberInput
                      min={0}
                      max={50}
                      value={bookingData.dropoffProperty?.floor ?? 0}
                      onChange={(_, value) => updateDropoffProperty('floor', value)}
                    >
                      <NumberInputField placeholder="0 = Ground floor" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>{errors.dropoffFloor}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Lift Available</FormLabel>
                    <HStack spacing={4}>
                      <Checkbox
                        isChecked={bookingData.dropoffProperty?.hasLift ?? false}
                        onChange={(e) => updateDropoffProperty('hasLift', e.target.checked)}
                      >
                        <HStack spacing={2}>
                          <Icon as={FaStar} color="green.500" />
                          <Text>Yes, there's a lift</Text>
                        </HStack>
                      </Checkbox>
                    </HStack>
                    <Text fontSize="sm" color="text.secondary" mt={1}>
                      Having a lift reduces stairs charges by 60%
                    </Text>
                  </FormControl>
                </>
              )}

              {/* Floor Info Display */}
              {bookingData.dropoffProperty?.propertyType && (
                <HStack spacing={3} p={3} bg="gray.50" borderRadius="md" w="full">
                  <Icon as={FaBuilding} color="neon.500" />
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="medium">
                      {getPropertyTypeLabel(bookingData.dropoffProperty.propertyType)}
                    </Text>
                    {isGroundFloorToGroundFloor ? (
                      <Badge colorScheme="green">Ground Floor</Badge>
                    ) : (
                      <HStack spacing={2}>
                        <Badge colorScheme="blue">
                          Floor {bookingData.dropoffProperty?.floor ?? 0}
                        </Badge>
                        {bookingData.dropoffProperty?.hasLift && (
                          <Badge colorScheme="green">
                            <Icon as={FaStar} mr={1} />
                            Lift Available
                          </Badge>
                        )}
                      </HStack>
                    )}
                  </VStack>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Pricing Impact Info */}
        {!isGroundFloorToGroundFloor && (
          <Card>
            <CardBody>
              <VStack spacing={3}>
                <HStack>
                  <Icon as={FaInfoCircle} color="blue.500" />
                  <Text fontWeight="semibold">Pricing Impact</Text>
                </HStack>
                <Text fontSize="sm" color="text.secondary">
                  • Each floor above ground level adds £10 per location
                  • Having a lift reduces stairs charges by 60%
                  • Example: 2nd floor without lift = +£10, with lift = +£4
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Form Errors */}
        {Object.keys(errors).length > 0 && (
          <Alert status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>Please fix the following errors:</AlertTitle>
              <AlertDescription>
                <VStack align="start" spacing={1}>
                  {Object.entries(errors).map(([field, message]) => (
                    <Text key={field}>• {message}</Text>
                  ))}
                </VStack>
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Navigation */}
        <BookingNavigationButtons
          onNext={handleNext}
          onBack={onBack}
          nextText="Continue to Items"
          backText="Back to Addresses"
        />
      </VStack>
    </Box>
  );
}
