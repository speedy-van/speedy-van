import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import { Logo } from './Logo';
import { AnimatedLogo } from './AnimatedLogo';
import { ResponsiveLogo } from './ResponsiveLogo';

export function LogoDemo() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box p={8} bg={bgColor} minH="100vh">
      <VStack spacing={12} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="2xl" mb={4} color="neon.500">
            Speedy Van Logo Suite v3.0
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Enhanced neon dark design system with responsive variants and
            animations
          </Text>
        </Box>

        {/* Standard Logo Variants */}
        <Box>
          <Heading size="lg" mb={6} color="neon.400">
            Standard Logo Variants
          </Heading>
          <VStack spacing={6} align="stretch">
            <Box p={6} border="1px" borderColor={borderColor} borderRadius="lg">
              <Text fontWeight="bold" mb={3}>
                Dark Background Logo
              </Text>
              <Logo variant="logo" mode="dark" width={240} height={80} />
            </Box>

            <Box p={6} border="1px" borderColor={borderColor} borderRadius="lg">
              <Text fontWeight="bold" mb={3}>
                Light Background Logo
              </Text>
              <Logo variant="logo" mode="light" width={240} height={80} />
            </Box>

            <Box p={6} border="1px" borderColor={borderColor} borderRadius="lg">
              <Text fontWeight="bold" mb={3}>
                Wordmark Only
              </Text>
              <Logo variant="wordmark" width={200} height={60} />
            </Box>
          </VStack>
        </Box>

        {/* Responsive Logo Variants */}
        <Box>
          <Heading size="lg" mb={6} color="neon.400">
            Responsive Logo Variants
          </Heading>
          <VStack spacing={6} align="stretch">
            <Box p={6} border="1px" borderColor={borderColor} borderRadius="lg">
              <Text fontWeight="bold" mb={3}>
                Responsive Logo (Tablet)
              </Text>
              <Logo variant="responsive" width={320} height={120} />
            </Box>

            <Box p={6} border="1px" borderColor={borderColor} borderRadius="lg">
              <Text fontWeight="bold" mb={3}>
                Mobile Logo
              </Text>
              <Logo variant="mobile" width={160} height={60} />
            </Box>
          </VStack>
        </Box>

        {/* Icon Variants */}
        <Box>
          <Heading size="lg" mb={6} color="neon.400">
            Icon Variants
          </Heading>
          <HStack spacing={8} justify="center" wrap="wrap">
            <Box
              p={4}
              border="1px"
              borderColor={borderColor}
              borderRadius="lg"
              textAlign="center"
            >
              <Text fontWeight="bold" mb={3}>
                App Icon
              </Text>
              <Logo variant="icon" width={64} height={64} />
            </Box>

            <Box
              p={4}
              border="1px"
              borderColor={borderColor}
              borderRadius="lg"
              textAlign="center"
            >
              <Text fontWeight="bold" mb={3}>
                Minimal Icon
              </Text>
              <Logo variant="icon-min" width={48} height={48} />
            </Box>
          </HStack>
        </Box>

        {/* Animated Logo Variants */}
        <Box>
          <Heading size="lg" mb={6} color="neon.400">
            Animated Logo Variants
          </Heading>
          <VStack spacing={6} align="stretch">
            <Box p={6} border="1px" borderColor={borderColor} borderRadius="lg">
              <Text fontWeight="bold" mb={3}>
                Animated Logo (Hover for effects)
              </Text>
              <AnimatedLogo
                variant="logo"
                mode="dark"
                width={240}
                height={80}
                animated={true}
              />
            </Box>

            <Box p={6} border="1px" borderColor={borderColor} borderRadius="lg">
              <Text fontWeight="bold" mb={3}>
                Animated Icon (Hover for effects)
              </Text>
              <AnimatedLogo
                variant="icon"
                width={64}
                height={64}
                animated={true}
              />
            </Box>

            <Box p={6} border="1px" borderColor={borderColor} borderRadius="lg">
              <Text fontWeight="bold" mb={3}>
                Animated Wordmark (Hover for effects)
              </Text>
              <AnimatedLogo
                variant="wordmark"
                width={200}
                height={60}
                animated={true}
              />
            </Box>
          </VStack>
        </Box>

        {/* Responsive Logo Component */}
        <Box>
          <Heading size="lg" mb={6} color="neon.400">
            Responsive Logo Component (Auto-selection)
          </Heading>
          <VStack spacing={6} align="stretch">
            <Box p={6} border="1px" borderColor={borderColor} borderRadius="lg">
              <Text fontWeight="bold" mb={3}>
                Automatic Responsive Selection
              </Text>
              <Text fontSize="sm" color="gray.500" mb={3}>
                This component automatically selects the best logo variant based
                on screen size
              </Text>
              <ResponsiveLogo
                variant="logo"
                responsive={true}
                width={240}
                height={80}
              />
            </Box>
          </VStack>
        </Box>

        {/* Color Scheme Display */}
        <Box>
          <Heading size="lg" mb={6} color="neon.400">
            Color Scheme
          </Heading>
          <HStack spacing={4} justify="center" wrap="wrap">
            <Box
              p={4}
              bg="neon.500"
              borderRadius="lg"
              textAlign="center"
              minW="100px"
            >
              <Text color="white" fontWeight="bold">
                Primary
              </Text>
              <Text color="white" fontSize="sm">
                #00C2FF
              </Text>
            </Box>

            <Box
              p={4}
              bg="neon.purple"
              borderRadius="lg"
              textAlign="center"
              minW="100px"
            >
              <Text color="white" fontWeight="bold">
                Accent
              </Text>
              <Text color="white" fontSize="sm">
                #B026FF
              </Text>
            </Box>

            <Box
              p={4}
              bg="success.500"
              borderRadius="lg"
              textAlign="center"
              minW="100px"
            >
              <Text color="white" fontWeight="bold">
                Success
              </Text>
              <Text color="white" fontSize="sm">
                #39FF14
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* Features Summary */}
        <Box>
          <Heading size="lg" mb={6} color="neon.400">
            Enhanced Features
          </Heading>
          <VStack spacing={4} align="stretch">
            <Box p={4} border="1px" borderColor={borderColor} borderRadius="lg">
              <Text fontWeight="bold" color="neon.500">
                ✨ Transparent Backgrounds
              </Text>
              <Text>
                All logos now have transparent backgrounds for seamless website
                integration
              </Text>
            </Box>

            <Box p={4} border="1px" borderColor={borderColor} borderRadius="lg">
              <Text fontWeight="bold" color="neon.500">
                🎨 Theme Color Match
              </Text>
              <Text>
                Colors now exactly match your website theme (#00C2FF instead of
                #00E0FF)
              </Text>
            </Box>

            <Box p={4} border="1px" borderColor={borderColor} borderRadius="lg">
              <Text fontWeight="bold" color="neon.500">
                📱 Responsive Variants
              </Text>
              <Text>
                New mobile and tablet-optimized logo variants for all screen
                sizes
              </Text>
            </Box>

            <Box p={4} border="1px" borderColor={borderColor} borderRadius="lg">
              <Text fontWeight="bold" color="neon.500">
                🎭 Animated Components
              </Text>
              <Text>
                Interactive logo components with neon glow animations and hover
                effects
              </Text>
            </Box>

            <Box p={4} border="1px" borderColor={borderColor} borderRadius="lg">
              <Text fontWeight="bold" color="neon.500">
                🔧 Enhanced Neon Effects
              </Text>
              <Text>
                Improved SVG filters for better neon glow and motion trail
                effects
              </Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}

export default LogoDemo;
