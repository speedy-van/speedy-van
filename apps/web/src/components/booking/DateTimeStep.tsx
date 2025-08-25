import React, { useState } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Button, 
  FormControl, 
  FormLabel, 
  FormErrorMessage,
  Select,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Icon,
  useToast,
  Badge,
  SimpleGrid,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { FaCalendar, FaClock, FaArrowRight, FaArrowLeft, FaExclamationTriangle, FaInfoCircle, FaCalendarAlt } from 'react-icons/fa';
import BookingNavigationButtons from './BookingNavigationButtons';

interface DateTimeStepProps {
  bookingData: any;
  updateBookingData: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

const TIME_SLOTS = [
  { 
    value: 'morning', 
    label: 'Morning', 
    timeRange: '8:00 AM - 12:00 PM',
    surcharge: 0,
    icon: '🌅',
    description: 'Best for most moves'
  },
  { 
    value: 'afternoon', 
    label: 'Afternoon', 
    timeRange: '12:00 PM - 4:00 PM',
    surcharge: 0,
    icon: '☀️',
    description: 'Standard time slot'
  },
  { 
    value: 'evening', 
    label: 'Evening', 
    timeRange: '4:00 PM - 8:00 PM',
    surcharge: 15,
    icon: '🌆',
    description: 'Extended hours'
  },
  { 
    value: 'night', 
    label: 'Night', 
    timeRange: '8:00 PM - 12:00 AM',
    surcharge: 25,
    icon: '🌙',
    description: 'Late night option'
  }
];

export default function DateTimeStep({ 
  bookingData, 
  updateBookingData, 
  onNext, 
  onBack 
}: DateTimeStepProps) {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const toast = useToast();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!bookingData.date) {
      newErrors.date = 'Please select a date';
    }
    if (!bookingData.time) {
      newErrors.time = 'Please select a time slot';
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

  const updateDate = (date: string) => {
    updateBookingData({ date });
  };

  const updateTime = (time: string) => {
    updateBookingData({ time });
  };

  const getMinDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30); // 30 days from now
    return maxDate.toISOString().split('T')[0];
  };

  const isWeekend = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDay() === 0 || date.getDay() === 6;
  };

  const getSelectedTimeSlot = () => {
    return TIME_SLOTS.find(slot => slot.value === bookingData.time);
  };

  const hasSurcharge = () => {
    const selectedSlot = getSelectedTimeSlot();
    return selectedSlot && selectedSlot.surcharge > 0;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDateInfo = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === tomorrow.toDateString()) {
      return { type: 'tomorrow', label: 'Tomorrow', color: 'brand.500' };
    } else if (isWeekend(dateString)) {
      return { type: 'weekend', label: 'Weekend', color: 'warning.500' };
    } else {
      return { type: 'weekday', label: 'Weekday', color: 'neon.500' };
    }
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="xl" bg="bg.card" borderColor="border.primary" boxShadow="md" className="booking-step-card">
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="neon.500">
            Step 4: Date & Time
          </Text>
          <Text fontSize="sm" color="text.secondary" mt={2}>
            Choose when you'd like your move to take place
          </Text>
        </Box>

        {/* Date Selection */}
        <Box>
          <HStack spacing={3} mb={6} justify="center">
            <Icon as={FaCalendar} color="brand.500" boxSize={6} />
            <Text fontSize="lg" fontWeight="semibold" color="brand.500">
              Select Move Date
            </Text>
          </HStack>
          
          <FormControl isInvalid={!!errors.date}>
            <FormLabel textAlign="center" fontSize="md" color="text.primary">
              Choose your preferred date
            </FormLabel>
            
            {/* Enhanced Date Input */}
            <Box position="relative">
              <input
                type="date"
                min={getMinDate()}
                max={getMaxDate()}
                value={bookingData.date || ''}
                onChange={(e) => updateDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  fontSize: '18px',
                  borderRadius: '16px',
                  border: '2px solid #404040',
                  backgroundColor: '#262626',
                  color: '#FFFFFF',
                  outline: 'none',
                  textAlign: 'center',
                  fontWeight: '600',
                  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00C2FF';
                  e.target.style.boxShadow = '0 0 20px rgba(0,194,255,0.3)';
                  e.target.style.backgroundColor = '#1A1A1A';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#404040';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = '#262626';
                }}
              />
              
              {/* Calendar Icon Overlay */}
              <Box
                position="absolute"
                right="20px"
                top="50%"
                transform="translateY(-50%)"
                color="text.tertiary"
                pointerEvents="none"
              >
                <FaCalendarAlt size={20} />
              </Box>
            </Box>
            
            <FormErrorMessage textAlign="center">{errors.date}</FormErrorMessage>
          </FormControl>

          {/* Date Information Display */}
          {bookingData.date && (
            <Box mt={4} textAlign="center">
              <VStack spacing={3}>
                <Text fontSize="lg" fontWeight="semibold" color="text.primary">
                  {formatDate(bookingData.date)}
                </Text>
                
                {(() => {
                  const dateInfo = getDateInfo(bookingData.date);
                  if (dateInfo) {
                    return (
                      <HStack spacing={2}>
                        <Badge colorScheme={dateInfo.color.split('.')[0]} variant="outline" size="lg">
                          {dateInfo.label}
                        </Badge>
                        {isWeekend(bookingData.date) && (
                          <Badge colorScheme="warning" variant="outline" size="lg">
                            Weekend Move
                          </Badge>
                        )}
                      </HStack>
                    );
                  }
                  return null;
                })()}
              </VStack>
            </Box>
          )}
        </Box>

        <Divider />

        {/* Time Selection */}
        <Box>
          <HStack spacing={3} mb={6} justify="center">
            <Icon as={FaClock} color="neon.500" boxSize={6} />
            <Text fontSize="lg" fontWeight="semibold" color="neon.500">
              Select Time Slot
            </Text>
          </HStack>
          
          <FormControl isInvalid={!!errors.time}>
            <FormLabel textAlign="center" fontSize="md" color="text.primary" mb={4}>
              Choose your preferred time
            </FormLabel>
            
            {/* Enhanced Time Slot Selection */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {TIME_SLOTS.map((slot) => (
                <Box
                  key={slot.value}
                  p={4}
                  borderWidth="2px"
                  borderRadius="xl"
                  borderColor={bookingData.time === slot.value ? 'neon.500' : 'border.primary'}
                  bg={bookingData.time === slot.value ? 'bg.surface.hover' : 'bg.surface'}
                  cursor="pointer"
                  transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{ 
                    borderColor: 'neon.400',
                    transform: 'translateY(-2px)',
                    boxShadow: 'md'
                  }}
                  onClick={() => updateTime(slot.value)}
                  position="relative"
                  overflow="hidden"
                >
                  {/* Background Glow Effect */}
                  {bookingData.time === slot.value && (
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
                    {/* Icon and Label */}
                    <HStack spacing={3}>
                      <Text fontSize="2xl">{slot.icon}</Text>
                      <VStack spacing={1} align="start">
                        <Text fontWeight="semibold" color="text.primary">
                          {slot.label}
                        </Text>
                        <Text fontSize="sm" color="text.secondary">
                          {slot.timeRange}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    {/* Description */}
                    <Text fontSize="sm" color="text.tertiary" textAlign="center">
                      {slot.description}
                    </Text>
                    
                    {/* Price Info */}
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="text.secondary">
                        Base Rate
                      </Text>
                      {slot.surcharge > 0 ? (
                        <Badge colorScheme="warning" variant="outline">
                          +£{slot.surcharge}
                        </Badge>
                      ) : (
                        <Badge colorScheme="brand" variant="outline">
                          No Extra Cost
                        </Badge>
                      )}
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
            
            <FormErrorMessage textAlign="center">{errors.time}</FormErrorMessage>
          </FormControl>

          {/* Surcharge Information */}
          {hasSurcharge() && (
            <Alert status="info" mt={4} borderRadius="lg">
              <AlertIcon as={FaInfoCircle} />
              <Box>
                <AlertTitle>Time Surcharge Notice</AlertTitle>
                <AlertDescription>
                  Evening and night moves have additional charges due to extended operating hours and higher demand.
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </Box>

        {/* Enhanced Summary */}
        {(bookingData.date || bookingData.time) && (
          <Box 
            p={6} 
            borderWidth="1px" 
            borderRadius="xl" 
            bg="bg.surface" 
            borderColor="border.primary"
            position="relative"
            overflow="hidden"
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
              <Text fontSize="lg" fontWeight="semibold" color="neon.500">
                📅 Move Summary
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                {bookingData.date && (
                  <Box p={3} bg="bg.card" borderRadius="lg" borderWidth="1px" borderColor="border.primary">
                    <VStack spacing={2}>
                      <HStack>
                        <Icon as={FaCalendar} color="brand.500" />
                        <Text fontWeight="medium" color="text.primary">Date</Text>
                      </HStack>
                      <Text fontSize="sm" color="text.secondary" textAlign="center">
                        {formatDate(bookingData.date)}
                      </Text>
                      {isWeekend(bookingData.date) && (
                        <Badge colorScheme="warning" size="sm">
                          Weekend
                        </Badge>
                      )}
                    </VStack>
                  </Box>
                )}
                
                {bookingData.time && (
                  <Box p={3} bg="bg.card" borderRadius="lg" borderWidth="1px" borderColor="border.primary">
                    <VStack spacing={2}>
                      <HStack>
                        <Icon as={FaClock} color="neon.500" />
                        <Text fontWeight="medium" color="text.primary">Time</Text>
                      </HStack>
                      <Text fontSize="sm" color="text.secondary" textAlign="center">
                        {getSelectedTimeSlot()?.label}
                      </Text>
                      {getSelectedTimeSlot()?.surcharge && getSelectedTimeSlot()!.surcharge > 0 && (
                        <Badge colorScheme="warning" size="sm">
                          +£{getSelectedTimeSlot()!.surcharge}
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
          nextText="Continue to Customer Details"
          backVariant="secondary"
        />
      </VStack>
    </Box>
  );
}
