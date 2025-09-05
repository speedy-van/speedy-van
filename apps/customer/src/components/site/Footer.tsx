'use client';
import {
  Box,
  Container,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Link,
  Icon,
  Button,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import {
  FaTruck,
  FaPhone,
  FaEnvelope,
  FaCookieBite,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaHeart,
} from 'react-icons/fa';

export default function Footer() {
  const bg = useColorModeValue('gray.900', 'gray.800');
  const year = new Date().getFullYear();

  return (
    <Box
      as="footer"
      data-testid="footer-omega"
      role="contentinfo"
      bg={bg}
      color="gray.300"
      borderTop="2px solid"
      borderColor="neon.400"
      position="relative"
      overflow="hidden"
      display="block"
      w="100%"
      sx={{
        // Force horizontal layout and override any parent styles
        '& [data-grid]': {
          display: 'grid !important',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(260px, 1fr)) !important',
          gap: '2rem !important',
        },
        '& [data-grid] > *': {
          minWidth: '0 !important',
          maxWidth: 'none !important',
          display: 'block !important',
        },
        // Override any global prose or global CSS
        '& *': {
          maxWidth: 'none !important',
          display: 'revert !important',
        },
      }}
    >
      <Container maxW="7xl" position="relative" zIndex={1}>
        <SimpleGrid
          data-grid
          minChildWidth="260px"
          spacing={8}
          py={8}
          alignItems="start"
        >
          {/* Left */}
          <VStack align="start" spacing={4}>
            <HStack spacing={3}>
              <Box
                p={2}
                borderRadius="md"
                borderWidth="1px"
                borderColor="neon.400"
              >
                <Icon as={FaTruck} color="neon.500" boxSize={5} />
              </Box>
              <Text fontSize="lg" color="neon.500" fontWeight="bold">
                Speedy Van
              </Text>
            </HStack>
            <VStack align="start" spacing={3} fontSize="sm" color="gray.400">
              <HStack>
                <Icon as={FaPhone} color="neon.400" boxSize={4} />
                <Text as="a" href="tel:07901846297">
                  07901846297
                </Text>
              </HStack>
              <HStack>
                <Icon as={FaEnvelope} color="neon.400" boxSize={4} />
                <Link
                  href="mailto:support@speedy-van.co.uk"
                  _hover={{ color: 'neon.400' }}
                >
                  support@speedy-van.co.uk
                </Link>
              </HStack>
            </VStack>
          </VStack>

          {/* Middle */}
          <VStack align="start" spacing={4}>
            <Text fontSize="lg" color="white" fontWeight="semibold">
              Quick Links
            </Text>
            <VStack align="start" spacing={3} fontSize="sm" color="gray.400">
              <Link as={NextLink} href="/book" _hover={{ color: 'neon.400' }}>
                Book a Van
              </Link>
              <Link as={NextLink} href="/track" _hover={{ color: 'neon.400' }}>
                Track Move
              </Link>
              <Link
                as={NextLink}
                href="/driver-application"
                _hover={{ color: 'neon.400' }}
              >
                Become Driver
              </Link>
              <Link
                as={NextLink}
                href="/legal/privacy"
                _hover={{ color: 'neon.400' }}
              >
                Privacy Policy
              </Link>
              <Link
                as={NextLink}
                href="/legal/cookies"
                _hover={{ color: 'neon.400' }}
              >
                Cookie Policy
              </Link>
            </VStack>
          </VStack>

          {/* Right */}
          <VStack align="start" spacing={4}>
            <Text fontSize="lg" color="white" fontWeight="semibold">
              Connect & Settings
            </Text>
            <HStack spacing={3}>
              <Button
                as="a"
                href="#"
                aria-label="Facebook"
                size="sm"
                variant="ghost"
                color="gray.400"
                _hover={{ color: 'neon.400', bg: 'rgba(0,194,255,0.1)' }}
                borderRadius="full"
                p={2}
                minW="36px"
                h="36px"
              >
                <Icon as={FaFacebook} boxSize={4} />
              </Button>
              <Button
                as="a"
                href="#"
                aria-label="Twitter"
                size="sm"
                variant="ghost"
                color="gray.400"
                _hover={{ color: 'neon.400', bg: 'rgba(0,194,255,0.1)' }}
                borderRadius="full"
                p={2}
                minW="36px"
                h="36px"
              >
                <Icon as={FaTwitter} boxSize={4} />
              </Button>
              <Button
                as="a"
                href="#"
                aria-label="LinkedIn"
                size="sm"
                variant="ghost"
                color="gray.400"
                _hover={{ color: 'neon.400', bg: 'rgba(0,194,255,0.1)' }}
                borderRadius="full"
                p={2}
                minW="36px"
                h="36px"
              >
                <Icon as={FaLinkedin} boxSize={4} />
              </Button>
              <Button
                as="a"
                href="#"
                aria-label="Instagram"
                size="sm"
                variant="ghost"
                color="gray.400"
                _hover={{ color: 'neon.400', bg: 'rgba(0,194,255,0.1)' }}
                borderRadius="full"
                p={2}
                minW="36px"
                h="36px"
              >
                <Icon as={FaInstagram} boxSize={4} />
              </Button>
            </HStack>
            <Button
              onClick={() => (window as any)?.openPreferences?.() ?? null}
              variant="outline"
              borderColor="neon.400"
              color="neon.400"
              size="sm"
              _hover={{
                bg: 'rgba(0,194,255,0.1)',
                borderColor: 'neon.500',
                color: 'neon.500',
              }}
              leftIcon={<Icon as={FaCookieBite} boxSize={4} />}
            >
              Cookie Settings
            </Button>
          </VStack>
        </SimpleGrid>

        {/* Bottom Row */}
        <Box pt={6} borderTop="1px solid" borderColor="gray.600" pb={6}>
          <SimpleGrid
            columns={{ base: 1, md: 2 }}
            spacing={6}
            alignItems="center"
          >
            <HStack
              spacing={3}
              flexWrap="wrap"
              justify={{ base: 'center', md: 'flex-start' }}
            >
              <Badge
                colorScheme="green"
                variant="solid"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
              >
                🛡️ Insured
              </Badge>
              <Badge
                colorScheme="blue"
                variant="solid"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
              >
                ⭐ 5-Star
              </Badge>
              <Badge
                colorScheme="purple"
                variant="solid"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
              >
                🚚 Same-Day
              </Badge>
            </HStack>
            <HStack
              spacing={4}
              fontSize="xs"
              color="gray.500"
              justify={{ base: 'center', md: 'flex-end' }}
            >
              <Text>© {year} Speedy Van</Text>
              <Text display="inline-flex" alignItems="center" gap="6px">
                Made with <Icon as={FaHeart} color="red.400" boxSize={3} /> in
                UK
              </Text>
            </HStack>
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
}
