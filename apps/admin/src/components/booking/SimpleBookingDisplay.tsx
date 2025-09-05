import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';

export default function SimpleBookingDisplay() {
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <VStack spacing={3} align="stretch">
        <Text fontSize="lg" fontWeight="bold">
          Simple Booking Display
        </Text>
        <Text>Basic booking information display</Text>
      </VStack>
    </Box>
  );
}
