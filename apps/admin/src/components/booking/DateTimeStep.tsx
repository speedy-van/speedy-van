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
  Spacer,
} from '@chakra-ui/react';
import {
  FaCalendar,
  FaClock,
  FaArrowRight,
  FaArrowLeft,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCalendarAlt,
  FaCheckCircle,
} from 'react-icons/fa';
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
    description: 'Best for most moves',
  },
  {
    value: 'afternoon',
    label: 'Afternoon',
    timeRange: '12:00 PM - 4:00 PM',
    surcharge: 0,
    icon: '☀️',
    description: 'Standard time slot',
  },
  {
    value: 'evening',
    label: 'Evening',
    timeRange: '4:00 PM - 8:00 PM',
    surcharge: 15,
    icon: '🌆',
    description: 'Extended hours',
  },
  {
    value: 'night',
    label: 'Night',
    timeRange: '8:00 PM - 12:00 AM',
    surcharge: 25,
    icon: '🌙',
    description: 'Late night option',
  },
];

export default function DateTimeStep({
  bookingData,
  updateBookingData,
  onNext,
  onBack,
}: DateTimeStepProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const toast = useToast();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

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

  const generateDateCards = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        display: date.getDate(),
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isTomorrow: i === 1,
      });
    }

    return dates;
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
      day: 'numeric',
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

  const handleFurtherDateRequest = () => {
    toast({
      title: 'Further Date Request',
      description:
        "We'll contact you to discuss available dates beyond 30 days.",
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="xl"
      bg="bg.card"
      borderColor="border.primary"
      boxShadow="md"
      className="booking-step-card"
    >
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
            <Icon as={FaCalendar} color="neon.500" boxSize={6} />
            <Text fontSize="lg" fontWeight="semibold" color="neon.500">
              Select Move Date
            </Text>
          </HStack>

          <FormControl isInvalid={!!errors.date}>
            <FormLabel
              textAlign="center"
              fontSize="md"
              color="text.primary"
              mb={4}
            >
              Choose your preferred date (30 days available)
            </FormLabel>

            {/* Date Cards Grid */}
            <SimpleGrid columns={{ base: 5, md: 6, lg: 10 }} spacing={3} mb={6}>
              {generateDateCards().map(dateCard => (
                <Box
                  key={dateCard.value}
                  p={3}
                  borderWidth="2px"
                  borderRadius="xl"
                  borderColor={
                    bookingData.date === dateCard.value
                      ? 'border.neon'
                      : 'border.primary'
                  }
                  bg={
                    dateCard.isWeekend
                      ? 'dark.600'
                      : bookingData.date === dateCard.value
                        ? 'dark.800'
                        : 'dark.700'
                  }
                  cursor="pointer"
                  transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{
                    borderColor: 'neon.400',
                    transform: 'translateY(-2px)',
                    boxShadow: 'neon.glow',
                  }}
                  onClick={() => updateDate(dateCard.value)}
                  position="relative"
                  overflow="hidden"
                  textAlign="center"
                  minH="90px"
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  {/* Background Glow Effect */}
                  {bookingData.date === dateCard.value && (
                    <Box
                      position="absolute"
                      top="0"
                      left="0"
                      width="100%"
                      height="100%"
                      bg="linear-gradient(135deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))"
                      borderRadius="xl"
                      zIndex={0}
                    />
                  )}

                  {/* Weekend Background Overlay */}
                  {dateCard.isWeekend && (
                    <Box
                      position="absolute"
                      top="0"
                      left="0"
                      width="100%"
                      height="100%"
                      bg="linear-gradient(135deg, rgba(0,194,255,0.08), rgba(0,209,143,0.08))"
                      borderRadius="xl"
                      zIndex={0}
                    />
                  )}

                  <VStack
                    spacing={1}
                    position="relative"
                    zIndex={1}
                    w="full"
                    flex="1"
                    justify="center"
                  >
                    {/* Day of week */}
                    <Text
                      fontSize="xs"
                      color={dateCard.isWeekend ? 'neon.300' : 'text.secondary'}
                      fontWeight="medium"
                      textTransform="uppercase"
                      lineHeight="1"
                    >
                      {dateCard.day}
                    </Text>

                    {/* Date number */}
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      color={
                        dateCard.isTomorrow
                          ? 'brand.500'
                          : dateCard.isWeekend
                            ? 'neon.400'
                            : 'text.primary'
                      }
                      lineHeight="1"
                    >
                      {dateCard.display}
                    </Text>

                    {/* Month */}
                    <Text
                      fontSize="xs"
                      color={dateCard.isWeekend ? 'neon.200' : 'text.tertiary'}
                      fontWeight="medium"
                      textTransform="uppercase"
                      lineHeight="1"
                    >
                      {dateCard.month}
                    </Text>
                  </VStack>

                  {/* Badges positioned at bottom */}
                  <Box position="relative" zIndex={2} w="full" mt="auto">
                    {/* Tomorrow Badge */}
                    {dateCard.isTomorrow && (
                      <Badge
                        colorScheme="brand"
                        variant="solid"
                        size="sm"
                        px={2}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        display="block"
                        textAlign="center"
                        mb={1}
                      >
                        T
                      </Badge>
                    )}

                    {/* Weekend Badge */}
                    {dateCard.isWeekend && !dateCard.isTomorrow && (
                      <Badge
                        colorScheme="neon"
                        variant="solid"
                        size="sm"
                        px={2}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        display="block"
                        textAlign="center"
                        boxShadow="0 0 8px rgba(0,194,255,0.3)"
                      >
                        W
                      </Badge>
                    )}
                  </Box>

                  {/* Selection Indicator */}
                  {bookingData.date === dateCard.value && (
                    <Box
                      position="absolute"
                      top="2"
                      sx={{ right: '8px' }}
                      bg="neon.500"
                      borderRadius="full"
                      p={1}
                      boxShadow="neon.glow"
                      zIndex={3}
                    >
                      <Icon as={FaCheckCircle} color="white" boxSize={3} />
                    </Box>
                  )}
                </Box>
              ))}
            </SimpleGrid>

            <FormErrorMessage textAlign="center">
              {errors.date}
            </FormErrorMessage>
          </FormControl>

          {/* Further Date Option */}
          <Box
            mt={4}
            p={4}
            borderWidth="2px"
            borderRadius="xl"
            borderColor="border.primary"
            bg="dark.700"
            cursor="pointer"
            transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
              borderColor: 'neon.400',
              bg: 'dark.600',
              transform: 'translateY(-2px)',
              boxShadow: 'neon.glow',
            }}
            onClick={handleFurtherDateRequest}
            position="relative"
            overflow="hidden"
          >
            {/* Background Glow Effect */}
            <Box
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              bg="linear-gradient(135deg, rgba(0,194,255,0.05), rgba(0,209,143,0.05))"
              borderRadius="xl"
              zIndex={0}
            />

            <HStack spacing={3} justify="center" position="relative" zIndex={1}>
              <Icon as={FaCalendarAlt} color="neon.500" boxSize={5} />
              <Text color="neon.400" fontWeight="semibold" fontSize="md">
                Do you want a further date? 🗓️
              </Text>
              <Icon as={FaArrowRight} color="neon.400" />
            </HStack>
            <Text fontSize="sm" color="text.tertiary" textAlign="center" mt={2}>
              Click here if you need a date beyond 30 days from today
            </Text>
          </Box>

          {/* Enhanced Date Information Display */}
          {bookingData.date && (
            <Box
              mt={4}
              p={6}
              borderWidth="2px"
              borderRadius="xl"
              borderColor="border.neon"
              bg="dark.800"
              boxShadow="neon.glow"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 'xl',
                background:
                  'linear-gradient(135deg, rgba(0,194,255,0.05) 0%, rgba(0,209,143,0.05) 100%)',
                pointerEvents: 'none',
              }}
            >
              <VStack spacing={4} position="relative" zIndex={1}>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="neon.500"
                  textShadow="0 0 10px rgba(0,194,255,0.5)"
                >
                  {formatDate(bookingData.date)}
                </Text>

                {(() => {
                  const dateInfo = getDateInfo(bookingData.date);
                  if (dateInfo) {
                    return (
                      <HStack spacing={3} flexWrap="wrap" justify="center">
                        <Badge
                          colorScheme={dateInfo.color.split('.')[0]}
                          variant="solid"
                          size="lg"
                          px={4}
                          py={2}
                          borderRadius="full"
                          boxShadow="md"
                        >
                          {dateInfo.label}
                        </Badge>
                        {isWeekend(bookingData.date) && (
                          <Badge
                            colorScheme="warning"
                            variant="solid"
                            size="lg"
                            px={4}
                            py={2}
                            borderRadius="full"
                            boxShadow="md"
                          >
                            Weekend Move
                          </Badge>
                        )}
                      </HStack>
                    );
                  }
                  return null;
                })()}

                {/* Date Range Information */}
                <Box
                  p={4}
                  bg="dark.700"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="border.primary"
                  w="full"
                >
                  <VStack spacing={2}>
                    <Text fontSize="sm" color="neon.400" fontWeight="medium">
                      📅 Available Date Range
                    </Text>
                    <HStack spacing={4} justify="center" flexWrap="wrap">
                      <Badge colorScheme="neon" variant="subtle" px={3} py={1}>
                        From: {formatDate(getMinDate())}
                      </Badge>
                      <Badge colorScheme="neon" variant="subtle" px={3} py={1}>
                        To: {formatDate(getMaxDate())}
                      </Badge>
                    </HStack>
                    <Text
                      fontSize="xs"
                      color="text.tertiary"
                      textAlign="center"
                    >
                      Currently showing dates up to 30 days from today
                    </Text>
                  </VStack>
                </Box>
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
            <FormLabel
              textAlign="center"
              fontSize="md"
              color="text.primary"
              mb={4}
            >
              Choose your preferred time
            </FormLabel>

            {/* Enhanced Time Slot Selection */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {TIME_SLOTS.map(slot => (
                <Box
                  key={slot.value}
                  p={6}
                  borderWidth="2px"
                  borderRadius="xl"
                  borderColor={
                    bookingData.time === slot.value
                      ? 'border.neon'
                      : 'border.primary'
                  }
                  bg={bookingData.time === slot.value ? 'dark.800' : 'dark.700'}
                  cursor="pointer"
                  transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{
                    borderColor: 'neon.400',
                    transform: 'translateY(-2px)',
                    boxShadow: 'neon.glow',
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
                      width="100%"
                      height="100%"
                      bg="linear-gradient(135deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))"
                      borderRadius="xl"
                      zIndex={0}
                    />
                  )}

                  <VStack spacing={4} position="relative" zIndex={1}>
                    {/* Icon and Label */}
                    <HStack spacing={4} justify="center">
                      <Text fontSize="3xl">{slot.icon}</Text>
                      <VStack spacing={1} align="center">
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color="text.primary"
                        >
                          {slot.label}
                        </Text>
                        <Text
                          fontSize="md"
                          color="neon.400"
                          fontWeight="medium"
                        >
                          {slot.timeRange}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Description */}
                    <Text
                      fontSize="sm"
                      color="text.secondary"
                      textAlign="center"
                      px={2}
                    >
                      {slot.description}
                    </Text>

                    {/* Price Info */}
                    <Box
                      p={3}
                      bg={
                        bookingData.time === slot.value
                          ? 'dark.600'
                          : 'dark.500'
                      }
                      borderRadius="lg"
                      w="full"
                      borderWidth="1px"
                      borderColor={
                        bookingData.time === slot.value
                          ? 'neon.300'
                          : 'border.primary'
                      }
                    >
                      <HStack justify="space-between" w="full">
                        <Text
                          fontSize="sm"
                          color="text.secondary"
                          fontWeight="medium"
                        >
                          Base Rate
                        </Text>
                        {slot.surcharge > 0 ? (
                          <Badge
                            colorScheme="warning"
                            variant="solid"
                            px={3}
                            py={1}
                            borderRadius="full"
                            boxShadow="md"
                          >
                            +£{slot.surcharge}
                          </Badge>
                        ) : (
                          <Badge
                            colorScheme="brand"
                            variant="solid"
                            px={3}
                            py={1}
                            borderRadius="full"
                            boxShadow="md"
                          >
                            No Extra Cost
                          </Badge>
                        )}
                      </HStack>
                    </Box>

                    {/* Selection Indicator */}
                    {bookingData.time === slot.value && (
                      <Box
                        position="absolute"
                        top="4"
                        sx={{ right: '16px' }}
                        bg="neon.500"
                        borderRadius="full"
                        p={1}
                        boxShadow="neon.glow"
                      >
                        <Icon as={FaCheckCircle} color="white" boxSize={4} />
                      </Box>
                    )}
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>

            <FormErrorMessage textAlign="center">
              {errors.time}
            </FormErrorMessage>
          </FormControl>

          {/* Enhanced Surcharge Information */}
          {hasSurcharge() && (
            <Box
              mt={4}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              borderColor="warning.300"
              bg="warning.50"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 'lg',
                background:
                  'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05))',
                pointerEvents: 'none',
              }}
            >
              <HStack spacing={3} position="relative" zIndex={1}>
                <AlertIcon as={FaInfoCircle} color="warning.500" />
                <Box>
                  <Text fontWeight="semibold" color="warning.700" fontSize="sm">
                    Time Surcharge Notice
                  </Text>
                  <Text fontSize="xs" color="warning.600" mt={1}>
                    Evening and night moves have additional charges due to
                    extended operating hours and higher demand.
                  </Text>
                </Box>
              </HStack>
            </Box>
          )}
        </Box>

        {/* Enhanced Summary */}
        {(bookingData.date || bookingData.time) && (
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
              width="100%"
              height="100%"
              bg="linear-gradient(135deg, rgba(0,194,255,0.05), rgba(0,209,143,0.05))"
              borderRadius="xl"
              zIndex={0}
            />

            <VStack spacing={4} position="relative" zIndex={1}>
              <Text
                fontSize="lg"
                fontWeight="bold"
                color="neon.500"
                textShadow="0 0 10px rgba(0,194,255,0.5)"
              >
                📅 Move Summary
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                {bookingData.date && (
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
                        <Icon as={FaCalendar} color="neon.500" />
                        <Text fontWeight="medium" color="text.primary">
                          Date
                        </Text>
                      </HStack>
                      <Text
                        fontSize="sm"
                        color="text.secondary"
                        textAlign="center"
                      >
                        {formatDate(bookingData.date)}
                      </Text>
                      {isWeekend(bookingData.date) && (
                        <Badge colorScheme="warning" size="sm" variant="solid">
                          Weekend
                        </Badge>
                      )}
                    </VStack>
                  </Box>
                )}

                {bookingData.time && (
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
                        <Icon as={FaClock} color="brand.500" />
                        <Text fontWeight="medium" color="text.primary">
                          Time
                        </Text>
                      </HStack>
                      <Text
                        fontSize="sm"
                        color="text.secondary"
                        textAlign="center"
                      >
                        {getSelectedTimeSlot()?.label}
                      </Text>
                      {getSelectedTimeSlot()?.surcharge &&
                        getSelectedTimeSlot()!.surcharge > 0 && (
                          <Badge
                            colorScheme="warning"
                            size="sm"
                            variant="solid"
                          >
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
