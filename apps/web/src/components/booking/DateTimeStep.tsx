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
  Badge
} from '@chakra-ui/react';
import { FaCalendar, FaClock, FaArrowRight, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

interface DateTimeStepProps {
  bookingData: any;
  updateBookingData: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

const TIME_SLOTS = [
  { value: 'morning', label: 'Morning (8:00 AM - 12:00 PM)', surcharge: 0 },
  { value: 'afternoon', label: 'Afternoon (12:00 PM - 4:00 PM)', surcharge: 0 },
  { value: 'evening', label: 'Evening (4:00 PM - 8:00 PM)', surcharge: 15 },
  { value: 'night', label: 'Night (8:00 PM - 12:00 AM)', surcharge: 25 }
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
    const timeSlot = getSelectedTimeSlot();
    const weekend = bookingData.date ? isWeekend(bookingData.date) : false;
    return (timeSlot?.surcharge || 0) > 0 || weekend;
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="blue.600">
            Step 4: Schedule Your Move
          </Text>
          <Text fontSize="sm" color="gray.600" mt={2}>
            Choose the date and time for your move
          </Text>
        </Box>

        {/* Date Selection */}
        <Box>
          <HStack spacing={3} mb={4}>
            <Icon as={FaCalendar} color="green.500" />
            <Text fontSize="lg" fontWeight="semibold" color="green.600">
              Select Date
            </Text>
          </HStack>
          
          <FormControl isInvalid={!!errors.date}>
            <FormLabel>Move Date</FormLabel>
            <input
              type="date"
              min={getMinDate()}
              max={getMaxDate()}
              value={bookingData.date || ''}
              onChange={(e) => updateDate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'white'
              }}
            />
            <FormErrorMessage>{errors.date}</FormErrorMessage>
          </FormControl>

          {bookingData.date && isWeekend(bookingData.date) && (
            <Alert status="warning" mt={3}>
              <AlertIcon />
              <Box>
                <AlertTitle>Weekend Move</AlertTitle>
                <AlertDescription>
                  Weekend moves may have additional charges. We'll show you the final price in the next step.
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </Box>

        <Divider />

        {/* Time Selection */}
        <Box>
          <HStack spacing={3} mb={4}>
            <Icon as={FaClock} color="blue.500" />
            <Text fontSize="lg" fontWeight="semibold" color="blue.600">
              Select Time Slot
            </Text>
          </HStack>
          
          <FormControl isInvalid={!!errors.time}>
            <FormLabel>Preferred Time</FormLabel>
            <Select
              placeholder="Choose a time slot"
              value={bookingData.time || ''}
              onChange={(e) => updateTime(e.target.value)}
              size="lg"
            >
              {TIME_SLOTS.map(slot => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                  {slot.surcharge > 0 && ` (+£${slot.surcharge})`}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.time}</FormErrorMessage>
          </FormControl>

          {getSelectedTimeSlot()?.surcharge && getSelectedTimeSlot()!.surcharge > 0 && (
            <Alert status="info" mt={3}>
              <AlertIcon />
              <Box>
                <AlertTitle>Time Surcharge</AlertTitle>
                <AlertDescription>
                  This time slot has a £{getSelectedTimeSlot()!.surcharge} surcharge due to high demand.
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </Box>

        {/* Summary */}
        {(bookingData.date || bookingData.time) && (
          <Box p={4} borderWidth="1px" borderRadius="md" bg="blue.50">
            <Text fontSize="lg" fontWeight="semibold" mb={3}>
              Move Summary
            </Text>
            <VStack align="start" spacing={2}>
              {bookingData.date && (
                <HStack>
                  <Text fontWeight="medium">Date:</Text>
                  <Text>{new Date(bookingData.date).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</Text>
                  {isWeekend(bookingData.date) && (
                    <Badge colorScheme="orange">Weekend</Badge>
                  )}
                </HStack>
              )}
              {bookingData.time && (
                <HStack>
                  <Text fontWeight="medium">Time:</Text>
                  <Text>{getSelectedTimeSlot()?.label}</Text>
                  {getSelectedTimeSlot()?.surcharge && getSelectedTimeSlot()!.surcharge > 0 && (
                    <Badge colorScheme="red">+£{getSelectedTimeSlot()!.surcharge}</Badge>
                  )}
                </HStack>
              )}
            </VStack>
          </Box>
        )}

        {/* Surcharge Warning */}
        {hasSurcharge() && (
          <Alert status="warning">
            <AlertIcon as={FaExclamationTriangle} />
            <Box>
              <AlertTitle>Surcharge Notice</AlertTitle>
              <AlertDescription>
                Your selected time/date will be confirmed in the next step.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Navigation Buttons */}
        <HStack spacing={4} justify="space-between" pt={4}>
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            leftIcon={<FaArrowLeft />}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            colorScheme="blue"
            size="lg"
            rightIcon={<FaArrowRight />}
          >
            Continue to Customer Details
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
