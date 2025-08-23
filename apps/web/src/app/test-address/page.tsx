'use client';
import React, { useState } from 'react';
import { Box, Button, VStack, Text, useDisclosure } from '@chakra-ui/react';
import AddressForm from '../../components/AddressForm';

interface Address {
  label: string;
  line1: string;
  city: string;
  postcode: string;
  notes?: string;
  lift?: boolean;
  coords?: { lat: number; lng: number };
}

export default function TestAddressPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pickup, setPickup] = useState<Address | null>(null);
  const [dropoff, setDropoff] = useState<Address | null>(null);

  const handleSave = (pickupAddr: Address, dropoffAddr: Address) => {
    setPickup(pickupAddr);
    setDropoff(dropoffAddr);
    console.log('Saved addresses:', { pickup: pickupAddr, dropoff: dropoffAddr });
  };

  return (
    <Box p={8} maxW="4xl" mx="auto">
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          Address Form Test
        </Text>
        
        <Button colorScheme="blue" size="lg" onClick={onOpen}>
          Open Address Form
        </Button>

        {(pickup || dropoff) && (
          <Box p={6} border="1px" borderColor="gray.200" borderRadius="lg">
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Saved Addresses:
            </Text>
            
            {pickup && (
              <Box mb={4} p={4} bg="blue.50" borderRadius="md">
                <Text fontWeight="bold" color="blue.600">Pickup:</Text>
                <Text>{pickup.label}</Text>
                <Text fontSize="sm" color="gray.600">
                  {pickup.line1}, {pickup.city} {pickup.postcode}
                </Text>
                {pickup.lift && <Text fontSize="sm" color="green.600">✓ Lift available</Text>}
                {pickup.coords && (
                  <Text fontSize="sm" color="gray.500">
                    📍 {pickup.coords.lat.toFixed(6)}, {pickup.coords.lng.toFixed(6)}
                  </Text>
                )}
              </Box>
            )}
            
            {dropoff && (
              <Box p={4} bg="green.50" borderRadius="md">
                <Text fontWeight="bold" color="green.600">Dropoff:</Text>
                <Text>{dropoff.label}</Text>
                <Text fontSize="sm" color="gray.600">
                  {dropoff.line1}, {dropoff.city} {dropoff.postcode}
                </Text>
                {dropoff.lift && <Text fontSize="sm" color="green.600">✓ Lift available</Text>}
                {dropoff.coords && (
                  <Text fontSize="sm" color="gray.500">
                    📍 {dropoff.coords.lat.toFixed(6)}, {dropoff.coords.lng.toFixed(6)}
                  </Text>
                )}
              </Box>
            )}
          </Box>
        )}

        <Box p={4} bg="gray.50" borderRadius="lg">
          <Text fontSize="sm" fontWeight="bold" mb={2}>Features:</Text>
          <VStack align="start" spacing={1}>
            <Text fontSize="sm">• Address autocomplete with Mapbox integration</Text>
            <Text fontSize="sm">• Current location detection for both pickup & dropoff</Text>
            <Text fontSize="sm">• Lift availability checkboxes</Text>
            <Text fontSize="sm">• Additional notes field</Text>
            <Text fontSize="sm">• Form validation and error handling</Text>
            <Text fontSize="sm">• Responsive design with Chakra UI</Text>
          </VStack>
        </Box>
      </VStack>

      <AddressForm 
        isOpen={isOpen} 
        onClose={onClose} 
        onSave={handleSave} 
      />
    </Box>
  );
}
