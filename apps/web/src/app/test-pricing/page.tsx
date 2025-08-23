'use client';

import React, { useState } from 'react';
import { Box, Container, VStack, HStack, Text, Button, Input, NumberInput, NumberInputField, Select } from '@chakra-ui/react';
import { computeQuote, type PricingInputs } from '@/lib/pricing/engine';
import { getPricingDistance } from '@/lib/pricing/distance-calculator';

export default function TestPricingPage() {
  const [testData, setTestData] = useState({
    miles: 25,
    crewSize: 2,
    items: [{ key: 'sofa', quantity: 1 }, { key: 'bed', quantity: 1 }],
    pickupFloor: 1,
    dropoffFloor: 2,
    hasLift: false
  });

  const [result, setResult] = useState<any>(null);

  const calculateTestPrice = () => {
    const inputs: PricingInputs = {
      miles: testData.miles,
      items: testData.items,
      workersTotal: testData.crewSize,
      pickup: {
        floors: testData.pickupFloor,
        hasLift: testData.hasLift
      },
      dropoff: {
        floors: testData.dropoffFloor,
        hasLift: testData.hasLift
      },
      vatRegistered: false,
      extras: {
        ulezApplicable: false
      }
    };

    console.log('Test pricing inputs:', inputs);
    const quote = computeQuote(inputs);
    console.log('Test pricing result:', quote);
    setResult(quote);
  };

  const addTestItem = () => {
    setTestData(prev => ({
      ...prev,
      items: [...prev.items, { key: 'chair', quantity: 1 }]
    }));
  };

  const removeTestItem = (index: number) => {
    setTestData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="4xl">
        <VStack spacing={8}>
          <Text fontSize="2xl" fontWeight="bold">Pricing Engine Test</Text>
          
          <Box p={6} bg="white" borderRadius="lg" shadow="sm" w="full">
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="semibold">Test Parameters</Text>
              
              <HStack>
                <Text>Distance (miles):</Text>
                <NumberInput value={testData.miles} onChange={(_, value) => setTestData(prev => ({ ...prev, miles: value }))}>
                  <NumberInputField />
                </NumberInput>
              </HStack>

              <HStack>
                <Text>Crew Size:</Text>
                <NumberInput value={testData.crewSize} onChange={(_, value) => setTestData(prev => ({ ...prev, crewSize: value }))}>
                  <NumberInputField />
                </NumberInput>
              </HStack>

              <HStack>
                <Text>Pickup Floor:</Text>
                <NumberInput value={testData.pickupFloor} onChange={(_, value) => setTestData(prev => ({ ...prev, pickupFloor: value }))}>
                  <NumberInputField />
                </NumberInput>
              </HStack>

              <HStack>
                <Text>Dropoff Floor:</Text>
                <NumberInput value={testData.dropoffFloor} onChange={(_, value) => setTestData(prev => ({ ...prev, dropoffFloor: value }))}>
                  <NumberInputField />
                </NumberInput>
              </HStack>

              <HStack>
                <Text>Has Lift:</Text>
                <Select value={testData.hasLift ? 'true' : 'false'} onChange={(e) => setTestData(prev => ({ ...prev, hasLift: e.target.value === 'true' }))}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              </HStack>

              <Text fontSize="md" fontWeight="semibold">Items:</Text>
              {testData.items.map((item, index) => (
                <HStack key={index} justify="space-between">
                  <HStack>
                    <Text>{item.key}</Text>
                    <Text>x{item.quantity}</Text>
                  </HStack>
                  <Button size="sm" variant="destructive" onClick={() => removeTestItem(index)}>Remove</Button>
                </HStack>
              ))}
              
              <Button onClick={addTestItem} variant="secondary" size="sm">Add Test Item</Button>
              
              <Button onClick={calculateTestPrice} variant="primary" size="lg">
                Calculate Test Price
              </Button>
            </VStack>
          </Box>

          {result && (
            <Box p={6} bg="green.50" borderRadius="lg" border="1px" borderColor="green.200" w="full">
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="bold" color="green.700">Pricing Result</Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  Total: £{result.totalGBP}
                </Text>
                
                <Text fontSize="md" fontWeight="semibold">Breakdown:</Text>
                <VStack align="start" spacing={2}>
                  <Text>Base Rate: £{result.breakdown.baseRate}</Text>
                  <Text>Distance Cost: £{result.breakdown.distanceCost}</Text>
                  <Text>Items Cost: £{result.breakdown.itemsCost}</Text>
                  <Text>Workers Cost: £{result.breakdown.workersCost}</Text>
                  <Text>Stairs Cost: £{result.breakdown.stairsCost}</Text>
                  <Text>Extras Cost: £{result.breakdown.extrasCost}</Text>
                  <Text>Subtotal: £{result.breakdown.subtotal}</Text>
                  <Text>VAT: £{result.breakdown.vat}</Text>
                  <Text>Total: £{result.breakdown.total}</Text>
                </VStack>
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
