'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Icon,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FaMapMarkerAlt,
  FaBuilding,
  FaBoxes,
  FaCalendarAlt,
  FaCreditCard,
  FaCheckCircle,
  FaArrowRight,
  FaUser,
  FaRocket,
  FaInfoCircle,
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const MotionBox = motion.create(Box);

export default function LegacyBookingPage() {
  const router = useRouter();

  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/booking-luxury');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleRedirectNow = () => {
    router.push('/booking-luxury');
  };

  return (
    <Box minH="100vh" bg="bg.canvas" py={{ base: 4, md: 8 }}>
      <Container maxW="4xl" px={{ base: 4, md: 6 }}>
        <VStack spacing={8} align="stretch">
          {/* Migration Header */}
          <Card
            bg="linear-gradient(135deg, rgba(0,194,255,0.05), rgba(0,209,143,0.05))"
            borderColor="blue.200"
          >
            <CardBody>
              <VStack spacing={6} align="center" textAlign="center">
                <Box
                  w="80px"
                  h="80px"
                  borderRadius="full"
                  bg="linear-gradient(135deg, #00C2FF, #00D18F)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  animation="pulse 2s infinite"
                >
                  <FaRocket color="white" size={40} />
                </Box>

                <VStack spacing={3}>
                  <Heading size="xl" color="blue.600">
                    🚀 System Upgrade in Progress
                  </Heading>
                  <Text fontSize="lg" color="text.secondary">
                    We're upgrading your booking experience to be faster and
                    more intuitive!
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Migration Notice */}
          <Alert status="info" borderRadius="xl">
            <AlertIcon />
            <Box>
              <AlertTitle>What's New in the Luxury Booking System</AlertTitle>
              <AlertDescription>
                Our new 3-step booking process is designed to be 60% faster
                while maintaining all the features you love. You'll be
                automatically redirected in a few seconds, or click below to go
                now.
              </AlertDescription>
            </Box>
          </Alert>

          {/* Feature Comparison */}
          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading size="md" textAlign="center">
                  Legacy vs. New System Comparison
                </Heading>

                <VStack spacing={4} align="stretch">
                  {/* Legacy System */}
                  <Card variant="outline" borderColor="gray.300">
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <HStack>
                          <Icon as={FaInfoCircle} color="gray.500" />
                          <Heading size="sm" color="gray.600">
                            Legacy System (7 Steps)
                          </Heading>
                        </HStack>
                        <VStack align="start" spacing={2}>
                          <Text fontSize="sm" color="text.secondary">
                            • 7 separate steps
                          </Text>
                          <Text fontSize="sm" color="text.secondary">
                            • Basic validation
                          </Text>
                          <Text fontSize="sm" color="text.secondary">
                            • Manual data handling
                          </Text>
                          <Text fontSize="sm" color="text.secondary">
                            • Limited mobile optimization
                          </Text>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* New System */}
                  <Card variant="outline" borderColor="blue.300" bg="blue.50">
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <HStack>
                          <Icon as={FaRocket} color="blue.500" />
                          <Heading size="sm" color="blue.600">
                            New Luxury System (3 Steps)
                          </Heading>
                        </HStack>
                        <VStack align="start" spacing={2}>
                          <Text fontSize="sm" color="text.secondary">
                            • 3 streamlined steps
                          </Text>
                          <Text fontSize="sm" color="text.secondary">
                            • Advanced validation with Zod
                          </Text>
                          <Text fontSize="sm" color="text.secondary">
                            • Auto-save and draft recovery
                          </Text>
                          <Text fontSize="sm" color="text.secondary">
                            • Mobile-first design
                          </Text>
                          <Text fontSize="sm" color="text.secondary">
                            • Real-time analytics
                          </Text>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Progress Indicator */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="medium">Redirecting to new system...</Text>
                  <Text fontSize="sm" color="text.secondary">
                    5 seconds
                  </Text>
                </HStack>
                <Progress value={20} colorScheme="blue" size="lg" />
                <Text fontSize="sm" color="text.secondary">
                  Preparing your enhanced booking experience...
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          <VStack spacing={4}>
            <Button
              size="lg"
              colorScheme="blue"
              onClick={handleRedirectNow}
              rightIcon={<FaArrowRight />}
              bg="linear-gradient(135deg, #00C2FF, #00D18F)"
              color="white"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,194,255,0.4)',
              }}
            >
              Go to New System Now
            </Button>

            <Text fontSize="sm" color="text.tertiary" textAlign="center">
              You'll be automatically redirected in a few seconds
            </Text>
          </VStack>

          {/* Legacy System Info */}
          <Card variant="outline" borderColor="gray.200">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="sm" color="text.secondary">
                  About the Legacy System
                </Heading>
                <Text fontSize="sm" color="text.tertiary">
                  The 7-step booking system has served us well and will be
                  completely replaced by the new luxury system. All your
                  existing data and preferences will be preserved in the new
                  system.
                </Text>
                <Text fontSize="sm" color="text.tertiary">
                  If you need to access the legacy system for any reason, please
                  contact our support team.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}
