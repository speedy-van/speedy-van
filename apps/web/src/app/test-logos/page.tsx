'use client';

import React from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  Divider,
} from '@chakra-ui/react';

export default function TestLogosPage() {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={12} align="stretch">
        {/* Header */}
        <Box textAlign="center" py={8}>
          <Heading as="h1" size="2xl" color="text.primary" mb={4}>
            Speedy Van Logo Suite
          </Heading>
          <Text fontSize="lg" color="text.secondary">
            Testing all logo variants and ensuring proper display
          </Text>
        </Box>

        {/* Full Logo - Dark Background */}
        <Card p={8}>
          <Heading as="h2" size="lg" color="text.primary" mb={6}>
            1. Full Logo - Dark Background
          </Heading>
          <Text color="text.secondary" mb={4}>
            Primary brand identity for dark websites and app headers
          </Text>
          <Box textAlign="center" p={6} bg="gray.900" borderRadius="lg">
            <img 
              src="/logo/speedy-van-logo-dark.svg" 
              alt="Speedy Van Logo Dark" 
              width="240" 
              height="80"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Box>
          <Text fontSize="sm" color="text.secondary" mt={2}>
            Size: 240×80px | File: /logo/speedy-van-logo-dark.svg
          </Text>
        </Card>

        {/* Full Logo - Light Background */}
        <Card p={8}>
          <Heading as="h2" size="lg" color="text.primary" mb={6}>
            2. Full Logo - Light Background
          </Heading>
          <Text color="text.secondary" mb={4}>
            Light background variant for print materials and documents
          </Text>
          <Box textAlign="center" p={6} bg="white" borderRadius="lg" border="1px" borderColor="gray.200">
            <img 
              src="/logo/speedy-van-logo-light.svg" 
              alt="Speedy Van Logo Light" 
              width="240" 
              height="80"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Box>
          <Text fontSize="sm" color="text.secondary" mt={2}>
            Size: 240×80px | File: /logo/speedy-van-logo-light.svg
          </Text>
        </Card>

        {/* App Icon */}
        <Card p={8}>
          <Heading as="h2" size="lg" color="text.primary" mb={6}>
            3. App Icon
          </Heading>
          <Text color="text.secondary" mb={4}>
            App icon with stylized "S" and "V" combination for favicons and avatars
          </Text>
          <Box textAlign="center" p={6} bg="gray.900" borderRadius="lg">
            <img 
              src="/logo/speedy-van-icon.svg" 
              alt="Speedy Van Icon" 
              width="64" 
              height="64"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Box>
          <Text fontSize="sm" color="text.secondary" mt={2}>
            Size: 64×64px | File: /logo/speedy-van-icon.svg
          </Text>
        </Card>

        {/* Wordmark Only */}
        <Card p={8}>
          <Heading as="h2" size="lg" color="text.primary" mb={6}>
            4. Wordmark Only
          </Heading>
          <Text color="text.secondary" mb={4}>
            Text-only logo with special motion-styled "V" for minimal branding
          </Text>
          <Box textAlign="center" p={6} bg="gray.900" borderRadius="lg">
            <img 
              src="/logo/speedy-van-wordmark.svg" 
              alt="Speedy Van Wordmark" 
              width="200" 
              height="60"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Box>
          <Text fontSize="sm" color="text.secondary" mt={2}>
            Size: 200×60px | File: /logo/speedy-van-wordmark.svg
          </Text>
        </Card>

        {/* Minimal Icon */}
        <Card p={8}>
          <Heading as="h2" size="lg" color="text.primary" mb={6}>
            5. Minimal Icon
          </Heading>
          <Text color="text.secondary" mb={4}>
            Simplified van outline for small UI elements and status indicators
          </Text>
          <Box textAlign="center" p={6} bg="gray.900" borderRadius="lg">
            <img 
              src="/logo/speedy-van-minimal-icon.svg" 
              alt="Speedy Van Minimal Icon" 
              width="48" 
              height="48"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Box>
          <Text fontSize="sm" color="text.secondary" mt={2}>
            Size: 48×48px | File: /logo/speedy-van-minimal-icon.svg
          </Text>
        </Card>

        {/* Logo Usage Examples */}
        <Card p={8}>
          <Heading as="h2" size="lg" color="text.primary" mb={6}>
            Logo Usage Examples
          </Heading>
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontWeight="semibold" mb={2}>Header Navigation:</Text>
              <Box p={4} bg="gray.900" borderRadius="md">
                <HStack spacing={4} align="center">
                  <img 
                    src="/logo/speedy-van-logo-dark.svg" 
                    alt="Speedy Van" 
                    width="120" 
                    height="40"
                    style={{ height: '40px', width: 'auto' }}
                  />
                  <Text color="text.secondary">Navigation items would go here</Text>
                </HStack>
              </Box>
            </Box>

            <Box>
              <Text fontWeight="semibold" mb={2}>Favicon (Browser Tab):</Text>
              <Box p={4} bg="white" borderRadius="md" border="1px" borderColor="gray.200">
                <HStack spacing={4} align="center">
                  <img 
                    src="/logo/speedy-van-icon.svg" 
                    alt="Speedy Van" 
                    width="32" 
                    height="32"
                    style={{ height: '32px', width: 'auto' }}
                  />
                  <Text color="gray.700">This would appear in the browser tab</Text>
                </HStack>
              </Box>
            </Box>

            <Box>
              <Text fontWeight="semibold" mb={2}>Mobile App Icon:</Text>
              <Box p={4} bg="gray.900" borderRadius="md">
                <HStack spacing={4} align="center">
                  <img 
                    src="/logo/speedy-van-icon.svg" 
                    alt="Speedy Van" 
                    width="48" 
                    height="48"
                    style={{ height: '48px', width: 'auto' }}
                  />
                  <Text color="text.secondary">App store and home screen icon</Text>
                </HStack>
              </Box>
            </Box>
          </VStack>
        </Card>

        {/* File Information */}
        <Card p={8}>
          <Heading as="h2" size="lg" color="text.primary" mb={6}>
            File Information
          </Heading>
          <VStack spacing={4} align="stretch">
            <Box p={4} bg="gray.50" borderRadius="md">
              <Text fontSize="sm" fontFamily="mono" color="gray.700">
                All logos are SVG format for infinite scalability and optimal web performance.
              </Text>
            </Box>
            <Box p={4} bg="gray.50" borderRadius="md">
              <Text fontSize="sm" fontFamily="mono" color="gray.700">
                Colors: Primary #00E0FF, Accent #B026FF, Success #39FF14
              </Text>
            </Box>
            <Box p={4} bg="gray.50" borderRadius="md">
              <Text fontSize="sm" fontFamily="mono" color="gray.700">
                Typography: Inter Black (900) with neon glow effects
              </Text>
            </Box>
          </VStack>
        </Card>
      </VStack>
    </Container>
  );
}
