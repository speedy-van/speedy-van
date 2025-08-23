'use client';

import React from 'react';
import { Box, Container, VStack, Heading, Text, HStack } from '@chakra-ui/react';
import Button from '@/components/common/Button';

export default function TestUnifiedButtonsPage() {
  return (
    <Container maxW="container.xl" py={16}>
      <VStack spacing={12} align="stretch">
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>Unified Button System Test</Heading>
          <Text color="gray.600" fontSize="lg">
            Testing the new unified button system with consistent sizing, fonts, and variants.
          </Text>
        </Box>

        {/* Primary CTA Buttons */}
        <Box>
          <Heading size="lg" mb={6}>Primary CTA Buttons</Heading>
          <VStack spacing={4} align="stretch">
            <Button variant="primary" size="lg" isCTA={true}>Continue to Items</Button>
            <Button variant="primary" size="lg" isCTA={true}>Continue to Payment</Button>
            <Button variant="primary" size="lg" isCTA={true}>Book Now</Button>
          </VStack>
        </Box>

        {/* Secondary Buttons */}
        <Box>
          <Heading size="lg" mb={6}>Secondary Buttons</Heading>
          <HStack spacing={4} wrap="wrap">
            <Button variant="secondary" size="lg">Back</Button>
            <Button variant="secondary" size="lg">Cancel</Button>
            <Button variant="secondary" size="lg">Previous</Button>
          </HStack>
        </Box>

        {/* Size Variants */}
        <Box>
          <Heading size="lg" mb={6}>Size Variants</Heading>
          <HStack spacing={4} wrap="wrap">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" size="xl">Extra Large</Button>
          </HStack>
        </Box>

        {/* Design System Compliance */}
        <Box>
          <Heading size="lg" mb={6}>Design System Compliance</Heading>
          <VStack spacing={4} align="start">
            <Text>✅ Consistent button height: Mobile 48px, Desktop 56px</Text>
            <Text>✅ Consistent padding: px-6 py-3</Text>
            <Text>✅ Font: 16px, weight 600, Inter family</Text>
            <Text>✅ Primary CTA: Full width on mobile, auto-width on desktop</Text>
            <Text>✅ Secondary: Auto-width with transparent/dark background + border</Text>
            <Text>✅ All buttons inherit sizes and styles from Chakra theme</Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
