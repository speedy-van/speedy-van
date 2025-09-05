'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  SimpleGrid,
  Badge,
  useToast,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaTruck,
  FaUser,
  FaCreditCard,
  FaCheckCircle,
  FaArrowLeft,
  FaShieldAlt,
  FaInfoCircle,
  FaPhone,
  FaEnvelope,
  FaBoxes,
  FaStar,
} from 'react-icons/fa';

const MotionBox = motion.create(Box);

interface ConfirmationStepProps {
  onBack: () => void;
  onComplete: () => void;
  bookingData: any;
}

interface ServiceType {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  icon: React.ComponentType<any>;
}

const SERVICE_TYPES: Record<string, ServiceType> = {
  'man-and-van': {
    id: 'man-and-van',
    name: 'Man & Van',
    description: 'Professional crew with van',
    price: 45,
    features: [
      '2 crew members',
      'Loading/unloading',
      'Furniture protection',
      'Basic packing materials',
    ],
    icon: FaUser,
  },
  'van-only': {
    id: 'van-only',
    name: 'Van Only',
    description: 'Van rental without crew',
    price: 35,
    features: [
      'Van rental',
      'Fuel included',
      'Insurance covered',
      'Flexible timing',
    ],
    icon: FaTruck,
  },
  premium: {
    id: 'premium',
    name: 'Premium Service',
    description: 'Luxury moving experience',
    price: 75,
    features: [
      '3 crew members',
      'Premium packing materials',
      'White glove service',
      'Priority scheduling',
    ],
    icon: FaStar,
  },
  express: {
    id: 'express',
    name: 'Express Service',
    description: 'Same-day delivery',
    price: 95,
    features: [
      'Same-day delivery',
      'Priority handling',
      'Dedicated crew',
      'Real-time tracking',
    ],
    icon: FaClock,
  },
};

export default function ConfirmationStep({
  onBack,
  onComplete,
  bookingData,
}: ConfirmationStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Track booking completion
  useEffect(() => {
    // Update visitor analytics to mark booking as completed
    const currentSessionId = (window as any).currentSessionId;
    if (currentSessionId) {
      const existingVisitors = JSON.parse(
        localStorage.getItem('admin-visitor-analytics') || '[]'
      );
      const visitorIndex = existingVisitors.findIndex(
        (v: any) => v.sessionId === currentSessionId
      );

      if (visitorIndex !== -1) {
        existingVisitors[visitorIndex] = {
          ...existingVisitors[visitorIndex],
          bookingCompleted: true,
          exitTime: new Date(),
        };

        localStorage.setItem(
          'admin-visitor-analytics',
          JSON.stringify(existingVisitors)
        );
      }
    }
  }, []);

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);

    try {
      // Prepare driver notification data (excluding email for privacy)
      const driverNotificationData = {
        // Customer details (excluding email)
        customerName:
          `${bookingData.customerDetails?.firstName || ''} ${bookingData.customerDetails?.lastName || ''}`.trim(),
        customerPhone: bookingData.customerDetails?.phone || '',
        customerCompany: bookingData.customerDetails?.company || '',

        // Service details
        serviceType: bookingData.serviceType || 'man-and-van',
        serviceName: getServiceDetails().name,
        serviceDescription: getServiceDetails().description,

        // Scheduling
        pickupDate: bookingData.date || '',
        pickupTime: bookingData.timeSlot || '',

        // Addresses
        pickupAddress: {
          line1: bookingData.pickupAddress?.line1 || '',
          city: bookingData.pickupAddress?.city || '',
          postcode: bookingData.pickupAddress?.postcode || '',
          propertyType: bookingData.pickupProperty?.propertyType || '',
          floor: bookingData.pickupProperty?.floor || 0,
          hasLift: bookingData.pickupProperty?.hasLift || false,
          accessNotes: bookingData.pickupProperty?.accessNotes || '',
        },
        dropoffAddress: {
          line1: bookingData.dropoffAddress?.line1 || '',
          city: bookingData.dropoffAddress?.city || '',
          postcode: bookingData.dropoffAddress?.postcode || '',
          propertyType: bookingData.dropoffProperty?.propertyType || '',
          floor: bookingData.dropoffProperty?.floor || 0,
          hasLift: bookingData.dropoffProperty?.hasLift || false,
          accessNotes: bookingData.dropoffProperty?.accessNotes || '',
        },

        // Items to move
        items:
          bookingData.items?.map(item => ({
            name: item.name,
            category: item.category,
            size: item.size,
            quantity: item.quantity,
            description: item.description || '',
          })) || [],

        // Special requirements
        customRequirements: bookingData.customRequirements || '',
        specialInstructions: bookingData.specialInstructions || '',

        // Pricing
        estimatedTotal: calculateEstimatedTotal(),
        distanceMiles: bookingData.distanceMiles || 0,

        // Booking metadata
        bookingId: `SV-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'confirmed',
      };

      // Send notification to driver (simulate API call)
      console.log('🚚 Sending driver notification:', driverNotificationData);

      // In production, this would be an API call to notify the driver
      // await fetch('/api/driver/notify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(driverNotificationData),
      // });

      // Send complete booking data to admin
      const adminNotificationData = {
        ...driverNotificationData,
        // Include email for admin (not sent to driver)
        customerEmail: bookingData.customerDetails?.email || '',
        // Additional admin-specific data
        bookingSource: 'luxury-booking-flow',
        completedAt: new Date().toISOString(),
        totalSteps: 3,
        completionRate: 100,
        sessionDuration: Date.now() - (window as any).sessionStartTime || 0,
      };

      console.log('👨‍💼 Sending admin notification:', adminNotificationData);

      // In production, this would be an API call to notify admin
      // await fetch('/api/admin/complete-booking', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(adminNotificationData),
      // });

      // Store in localStorage for admin access
      const existingComplete = JSON.parse(
        localStorage.getItem('admin-complete-bookings') || '[]'
      );
      existingComplete.push(adminNotificationData);
      localStorage.setItem(
        'admin-complete-bookings',
        JSON.stringify(existingComplete)
      );

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setShowSuccess(true);
      toast({
        title: 'Booking Confirmed! 🎉',
        description:
          'Your booking has been successfully created and the driver has been notified',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Auto-redirect after success
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (error) {
      console.error('❌ Booking error:', error);
      toast({
        title: 'Booking Failed',
        description:
          'There was an error creating your booking. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStep = (stepNumber: number) => {
    onBack(); // This will go back to the previous step
  };

  const getServiceDetails = () => {
    return (
      SERVICE_TYPES[bookingData.serviceType] || SERVICE_TYPES['man-and-van']
    );
  };

  const serviceDetails = getServiceDetails();

  const calculateEstimatedTotal = () => {
    let basePrice = serviceDetails.price;

    // Add distance-based pricing (simplified)
    if (bookingData.distanceMiles) {
      if (bookingData.distanceMiles > 50) {
        basePrice += 25; // Long distance surcharge
      } else if (bookingData.distanceMiles > 20) {
        basePrice += 15; // Medium distance surcharge
      }
    }

    // Add weekend surcharge
    if (bookingData.date) {
      const bookingDate = new Date(bookingData.date);
      const isWeekend =
        bookingDate.getDay() === 0 || bookingDate.getDay() === 6;
      if (isWeekend) {
        basePrice += 10;
      }
    }

    return basePrice;
  };

  const estimatedTotal = calculateEstimatedTotal();

  if (showSuccess) {
    return (
      <MotionBox
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        w="full"
        textAlign="center"
      >
        <VStack spacing={8} py={12}>
          <Box
            w="120px"
            h="120px"
            borderRadius="full"
            bg="green.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
            animation="pulse 2s infinite"
          >
            <FaCheckCircle color="white" size={60} />
          </Box>

          <VStack spacing={4}>
            <Heading size="2xl" color="green.600">
              Booking Confirmed!
            </Heading>
            <Text fontSize="xl" color="text.secondary">
              Your booking has been successfully created
            </Text>
            <Text fontSize="lg" color="text.tertiary">
              You will receive a confirmation email shortly
            </Text>
          </VStack>

          <Progress value={100} w="full" colorScheme="green" size="lg" />

          <Text fontSize="sm" color="text.tertiary">
            Redirecting to dashboard...
          </Text>
        </VStack>
      </MotionBox>
    );
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      w="full"
    >
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <VStack spacing={3} align="center" textAlign="center">
          <Heading size="lg" color="text.primary">
            Review & Confirm
          </Heading>
          <Text color="text.secondary" fontSize="lg">
            Please review your booking details before confirming
          </Text>
        </VStack>

        {/* Progress Indicator */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="medium">Booking Progress</Text>
                <Text fontSize="sm" color="text.secondary">
                  4 of 4 steps
                </Text>
              </HStack>
              <Progress value={100} colorScheme="blue" size="lg" />
              <Text fontSize="sm" color="green.600" fontWeight="medium">
                All steps completed! Ready to confirm.
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Booking Summary */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="md">Booking Summary</Heading>

              {/* Step 1: Where & What */}
              <Card variant="outline" borderColor="blue.200">
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <HStack>
                        <Icon
                          as={FaMapMarkerAlt}
                          color="blue.500"
                          boxSize={5}
                        />
                        <Heading size="sm">Where & What</Heading>
                      </HStack>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => handleEditStep(1)}
                      >
                        Edit
                      </Button>
                    </HStack>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="medium" color="text.secondary">
                          Pickup Address
                        </Text>
                        <Text>
                          {bookingData.pickupAddress?.label || 'Not specified'}
                        </Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="medium" color="text.secondary">
                          Dropoff Address
                        </Text>
                        <Text>
                          {bookingData.dropoffAddress?.label || 'Not specified'}
                        </Text>
                      </VStack>
                    </SimpleGrid>

                    {bookingData.items && bookingData.items.length > 0 && (
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="medium" color="text.secondary">
                          Items to Move
                        </Text>
                        <Text>{bookingData.items.length} items selected</Text>
                      </VStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Step 2: When & How */}
              <Card variant="outline" borderColor="green.200">
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <HStack>
                        <Icon
                          as={FaCalendarAlt}
                          color="green.500"
                          boxSize={5}
                        />
                        <Heading size="sm">When & How</Heading>
                      </HStack>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="green"
                        onClick={() => handleEditStep(2)}
                      >
                        Edit
                      </Button>
                    </HStack>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="medium" color="text.secondary">
                          Date
                        </Text>
                        <Text>{bookingData.date || 'Not specified'}</Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="medium" color="text.secondary">
                          Time
                        </Text>
                        <Text>{bookingData.timeSlot || 'Not specified'}</Text>
                      </VStack>
                    </SimpleGrid>

                    <VStack align="start" spacing={2}>
                      <Text fontWeight="medium" color="text.secondary">
                        Service Type
                      </Text>
                      <HStack>
                        <Icon
                          as={serviceDetails.icon}
                          color="blue.500"
                          boxSize={4}
                        />
                        <Text>{serviceDetails.name}</Text>
                        <Badge colorScheme="blue">
                          {serviceDetails.description}
                        </Badge>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Step 3: Who & Payment */}
              <Card variant="outline" borderColor="purple.200">
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={FaUser} color="purple.500" boxSize={5} />
                        <Heading size="sm">Who & Payment</Heading>
                      </HStack>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="purple"
                        onClick={() => handleEditStep(3)}
                      >
                        Edit
                      </Button>
                    </HStack>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="medium" color="text.secondary">
                          Customer
                        </Text>
                        <Text>
                          {bookingData.customerDetails?.firstName}{' '}
                          {bookingData.customerDetails?.lastName}
                        </Text>
                        <Text fontSize="sm" color="text.secondary">
                          {bookingData.customerDetails?.email}
                        </Text>
                        <Text fontSize="sm" color="text.secondary">
                          {bookingData.customerDetails?.phone}
                        </Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="medium" color="text.secondary">
                          Payment Method
                        </Text>
                        <Text>
                          {bookingData.paymentMethod || 'Not specified'}
                        </Text>
                      </VStack>
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </CardBody>
        </Card>

        {/* Pricing Summary */}
        <Card bg="blue.50" borderColor="blue.200">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md" color="blue.700">
                Pricing Summary
              </Heading>

              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text>Service Base Price</Text>
                  <Text fontWeight="bold">£{serviceDetails.price}</Text>
                </HStack>

                {bookingData.distanceMiles && (
                  <HStack justify="space-between">
                    <Text>Distance Surcharge</Text>
                    <Text>
                      {bookingData.distanceMiles > 50
                        ? '+£25'
                        : bookingData.distanceMiles > 20
                          ? '+£15'
                          : 'Included'}
                    </Text>
                  </HStack>
                )}

                {bookingData.date && (
                  <HStack justify="space-between">
                    <Text>Weekend Surcharge</Text>
                    <Text>
                      {(() => {
                        const bookingDate = new Date(bookingData.date);
                        const isWeekend =
                          bookingDate.getDay() === 0 ||
                          bookingDate.getDay() === 6;
                        return isWeekend ? '+£10' : 'Included';
                      })()}
                    </Text>
                  </HStack>
                )}

                <Divider />

                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="bold">
                    Estimated Total
                  </Text>
                  <Text fontSize="xl" fontWeight="bold" color="blue.600">
                    £{estimatedTotal}
                  </Text>
                </HStack>

                <Text fontSize="sm" color="text.secondary">
                  * Final price may vary based on actual distance and
                  requirements
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Important Information */}
        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>Important Information</AlertTitle>
            <AlertDescription>
              Please ensure all details are correct. You will receive a
              confirmation email with your booking reference number. Our team
              will contact you within 2 hours to confirm your booking and
              provide further details.
            </AlertDescription>
          </Box>
        </Alert>

        {/* Navigation */}
        <HStack justify="space-between" pt={4}>
          <Button
            variant="outline"
            onClick={onBack}
            size="lg"
            leftIcon={<FaArrowLeft />}
            isDisabled={isSubmitting}
          >
            Back
          </Button>

          <Button
            colorScheme="blue"
            onClick={handleConfirmBooking}
            size="lg"
            rightIcon={<FaCheckCircle />}
            isLoading={isSubmitting}
            loadingText="Confirming..."
            isDisabled={isSubmitting}
          >
            Confirm Booking
          </Button>
        </HStack>

        {/* Contact Information */}
        <Card variant="outline" borderColor="gray.200">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="sm">Need Help?</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <HStack>
                  <Icon as={FaPhone} color="blue.500" boxSize={4} />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">Phone Support</Text>
                    <Text fontSize="sm" color="text.secondary">
                      +44 7901846297
                    </Text>
                  </VStack>
                </HStack>
                <HStack>
                  <Icon as={FaEnvelope} color="blue.500" boxSize={4} />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">Email Support</Text>
                    <Text fontSize="sm" color="text.secondary">
                      support@speedy-van.co.uk
                    </Text>
                  </VStack>
                </HStack>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </MotionBox>
  );
}
