"use client";

import React from 'react';
import { Box, Text, VStack, HStack, Button, Badge } from '@chakra-ui/react';

export default function TestIOSSafariPage() {
  return (
    <Box 
      minH="100dvh" 
      bg="gray.50" 
      p={4}
      className="safe-area-top safe-area-bottom"
    >
      <VStack spacing={6} align="stretch">
        <Box bg="white" p={6} borderRadius="lg" shadow="sm">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            iOS Safari Test Page
          </Text>
          <Text color="gray.600" mb={4}>
            This page tests the iOS Safari fixes for viewport, contrast, and layout issues.
          </Text>
        </Box>

        {/* Test Date & Time Section */}
        <Box bg="white" p={6} borderRadius="lg" shadow="sm">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Date & Time Test
          </Text>
          
          {/* Active date/time items */}
          <VStack spacing={3} align="stretch" mb={4}>
            <HStack 
              justify="space-between" 
              p={3} 
              bg="white" 
              border="1px solid" 
              borderColor="gray.200" 
              borderRadius="md"
            >
              <Text fontWeight="semibold" color="gray.900">04/09/2025</Text>
              <Badge colorScheme="green">from £45</Badge>
            </HStack>
            
            <HStack 
              justify="space-between" 
              p={3} 
              bg="white" 
              border="1px solid" 
              borderColor="gray.200" 
              borderRadius="md"
            >
              <Text fontWeight="semibold" color="gray.900">05/09/2025</Text>
              <Badge colorScheme="green">from £42</Badge>
            </HStack>
          </VStack>

          {/* Disabled date/time items */}
          <VStack spacing={3} align="stretch">
            <HStack 
              justify="space-between" 
              p={3} 
              bg="gray.50" 
              border="1px solid" 
              borderColor="gray.200" 
              borderRadius="md"
            >
              <Text fontWeight="semibold" color="gray.400">06/09/2025</Text>
              <Badge colorScheme="gray" variant="subtle">Unavailable</Badge>
            </HStack>
            
            <HStack 
              justify="space-between" 
              p={3} 
              bg="gray.50" 
              border="1px solid" 
              borderColor="gray.200" 
              borderRadius="md"
            >
              <Text fontWeight="semibold" color="gray.400">07/09/2025</Text>
              <Badge colorScheme="gray" variant="subtle">Unavailable</Badge>
            </HStack>
          </VStack>
        </Box>

        {/* Test Tabs Section */}
        <Box bg="white" p={6} borderRadius="lg" shadow="sm">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Tabs Test (No Overlay)
          </Text>
          
          <Box position="relative" zIndex="docked">
            <Box 
              position="sticky" 
              top="56px" 
              zIndex={1} 
              bg="white" 
              h="48px" 
              borderBottom="1px solid" 
              borderColor="gray.200"
              display="flex"
              alignItems="center"
              px={4}
            >
              <HStack spacing={6}>
                <Button variant="ghost" size="sm">Furniture</Button>
                <Button variant="ghost" size="sm">Appliances</Button>
                <Button variant="ghost" size="sm">Electronics</Button>
              </HStack>
            </Box>
            
            {/* Right fade mask - confined to tab bar only */}
            <Box
              position="absolute"
              right="0"
              top="0"
              h="48px"
              w="24px"
              pointerEvents="none"
              zIndex={1}
              bgGradient="linear(to-l, rgba(11,18,32,0.9), rgba(11,18,32,0))"
              display={{ base: 'none', md: 'block' }}
            />
          </Box>
          
          <Box mt={4} p={4} bg="gray.50" borderRadius="md">
            <Text color="gray.600">
              Tab content area - no dark overlay should appear here
            </Text>
          </Box>
        </Box>

        {/* Test Viewport Height */}
        <Box bg="white" p={6} borderRadius="lg" shadow="sm">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Viewport Test
          </Text>
          <Text color="gray.600" mb={2}>
            This page should use the full viewport height on iOS Safari without cropping.
          </Text>
          <Text fontSize="sm" color="gray.500">
            Current viewport height: <span id="viewport-height">Calculating...</span>
          </Text>
        </Box>

        {/* Spacer to test scrolling */}
        <Box h="100vh" bg="blue.50" display="flex" alignItems="center" justifyContent="center">
          <Text color="blue.600" fontSize="lg">
            Scroll Test Area
          </Text>
        </Box>
      </VStack>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Update viewport height display
            function updateViewportHeight() {
              const height = window.innerHeight;
              const element = document.getElementById('viewport-height');
              if (element) {
                element.textContent = height + 'px';
              }
            }
            
            updateViewportHeight();
            window.addEventListener('resize', updateViewportHeight);
          `
        }}
      />
    </Box>
  );
}
