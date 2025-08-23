'use client';

import React from 'react';
import { Box, Container, VStack, Heading, Text, Button } from '@chakra-ui/react';
import Hero from '@/components/Hero';

export default function TestVideoBackgroundPage() {
  return (
    <Box>
      {/* Test the Hero component with video background */}
      <Hero />
      
      {/* Additional test content below the hero */}
      <Container maxW="container.xl" py={16}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading size="lg" mb={4}>
              Video Background Test
            </Heading>
            <Text color="gray.600" fontSize="lg">
              This page tests the video background functionality in the Hero component.
            </Text>
            <Text color="gray.500" mt={2}>
              You should see a background video playing behind the hero text above.
            </Text>
          </Box>
          
          <Box bg="gray.100" p={6} borderRadius="lg">
            <Heading size="md" mb={3}>Test Features:</Heading>
            <VStack align="start" spacing={2}>
              <Text>✅ Background video should autoplay and loop</Text>
              <Text>✅ Video should be muted for autoplay compliance</Text>
              <Text>✅ Text should be readable with proper overlay</Text>
              <Text>✅ Video should scale properly on different screen sizes</Text>
              <Text>✅ Fallback background should show while video loads</Text>
            </VStack>
          </Box>
          
          <Box textAlign="center">
            <Button 
              colorScheme="blue" 
              size="lg"
              onClick={() => window.location.href = '/'}
            >
              Back to Home
            </Button>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
