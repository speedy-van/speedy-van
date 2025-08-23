'use client';

import React, { useState } from 'react';
import { Box, Container, VStack, Heading, Text } from '@chakra-ui/react';
import PickupDropoffStep from '@/components/booking/PickupDropoffStep';

export default function TestSimplePage() {
  const [bookingData, setBookingData] = useState({
    pickupAddress: {},
    dropoffAddress: {}
  });

  const updateBookingData = (data: any) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" mb={2}>
            Simple Component Test
          </Heading>
          <Text color="gray.600">
            Testing if basic components render without errors
          </Text>
        </Box>
        
        <Box>
          <Text mb={4}>Testing PickupDropoffStep component:</Text>
          <PickupDropoffStep 
            bookingData={bookingData}
            updateBookingData={updateBookingData}
          />
        </Box>
      </VStack>
    </Container>
  );
}
