'use client';

import React from 'react';
import { Box, Container, VStack, Heading, Text, Button, HStack, Icon, useColorModeValue, SimpleGrid, Card, Avatar, Badge } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaTruck, FaClock, FaShieldAlt, FaStar, FaCouch, FaLaptop, FaGraduationCap, FaBuilding, FaMagic } from 'react-icons/fa';
import Hero from '../../components/Hero';
import HeroMessage from '../../components/HeroMessage';
import ServiceMapSection from '../../components/ServiceMapSection';

// Create motion components using motion.create()
const MotionBox = motion.create(Box);

const features = [
  {
    icon: FaTruck,
    title: 'Fast & Reliable',
    description: 'Professional moving service with guaranteed delivery times'
  },
  {
    icon: FaClock,
    title: '24/7 Support',
    description: 'Round-the-clock customer support for peace of mind'
  },
  {
    icon: FaShieldAlt,
    title: 'Fully Insured',
    description: 'Complete coverage for your valuable belongings'
  },
  {
    icon: FaStar,
    title: '5-Star Rated',
    description: 'Trusted by thousands of satisfied customers'
  }
];

const services = [
  {
    icon: FaCouch,
    title: 'Furniture Moves',
    description: 'Expert handling of sofas, tables & delicate pieces',
    emoji: '🪑'
  },
  {
    icon: FaLaptop,
    title: 'Appliances & Electronics',
    description: 'Safe transport of TVs, computers & kitchen gear',
    emoji: '💻'
  },
  {
    icon: FaGraduationCap,
    title: 'Student Moves',
    description: 'Affordable campus-to-campus relocation',
    emoji: '🎓'
  },
  {
    icon: FaBuilding,
    title: 'Business & Office',
    description: 'Professional corporate relocation services',
    emoji: '🏢'
  },
  {
    icon: FaMagic,
    title: 'Custom Requests',
    description: 'Tailored solutions for unique moving needs',
    emoji: '✨'
  }
];

const testimonials = [
  {
    name: 'Sarah Mitchell',
    city: 'Manchester',
    quote: 'Speedy Van moved my entire flat in under 3 hours! The team was incredibly professional and careful with my antique furniture.',
    rating: 5
  },
  {
    name: 'James Thompson',
    city: 'Birmingham',
    quote: 'Best moving experience ever. They handled my electronics with such care, and the price was exactly what they quoted.',
    rating: 5
  },
  {
    name: 'Emma Davies',
    city: 'Leeds',
    quote: 'From booking to delivery, everything was seamless. The drivers were punctual and my items arrived in perfect condition.',
    rating: 5
  }
];

export default function HomePageContent() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box bg={bgColor} py={{ base: 8, md: 16 }}>
      <Container maxW="6xl">
        <VStack spacing={{ base: 8, md: 16 }}>
          {/* Hero Section */}
          <Hero />

          {/* Hero Message Section */}
          <HeroMessage />

          {/* Service Map Section */}
          <ServiceMapSection />

          {/* Features Grid */}
          <Box w="full">
            <VStack spacing={{ base: 8, md: 12 }}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                textAlign="center"
              >
                <Heading size={{ base: "lg", md: "xl" }} mb={4}>
                  Why Choose Speedy Van?
                </Heading>
                <Text color={textColor} maxW="2xl" mx="auto" fontSize={{ base: "sm", md: "md" }}>
                  We provide comprehensive moving solutions tailored to your needs
                </Text>
              </MotionBox>

              <SimpleGrid 
                columns={{ base: 1, sm: 2, lg: 4 }} 
                spacing={{ base: 4, md: 8 }} 
                w="full"
              >
                {features.map((feature, index) => (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    textAlign="center"
                    p={{ base: 4, md: 6 }}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="gray.200"
                    _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                  >
                    <Icon as={feature.icon} boxSize={{ base: 6, md: 8 }} color="blue.500" mb={4} />
                    <Heading size={{ base: "sm", md: "md" }} mb={3}>
                      {feature.title}
                    </Heading>
                    <Text color={textColor} fontSize={{ base: "xs", md: "sm" }}>
                      {feature.description}
                    </Text>
                  </MotionBox>
                ))}
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Services Section */}
          <Box w="full">
            <VStack spacing={{ base: 8, md: 12 }}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                textAlign="center"
              >
                <Heading size={{ base: "lg", md: "xl" }} mb={4} color="text.primary">
                  Our Premium Services
                </Heading>
                <Text color={textColor} maxW="2xl" mx="auto" fontSize={{ base: "sm", md: "lg" }}>
                  Professional moving solutions for every need
                </Text>
              </MotionBox>

              <SimpleGrid 
                columns={{ base: 1, md: 2, lg: 3 }} 
                spacing={{ base: 4, md: 8 }} 
                w="full"
              >
                {services.map((service, index) => (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  >
                    <Card
                      p={{ base: 4, md: 6 }}
                      borderRadius="xl"
                      borderWidth="1px"
                      borderColor="neon.500"
                      bg="dark.800"
                      _hover={{
                        shadow: "neon.glow",
                        transform: "translateY(-4px)",
                        borderColor: "neon.400"
                      }}
                      transition="all 0.3s ease"
                      position="relative"
                      overflow="hidden"
                    >
                      {/* Neon glow effect */}
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        borderRadius="xl"
                        bg="linear-gradient(135deg, rgba(0,194,255,0.1) 0%, transparent 50%, rgba(0,194,255,0.05) 100%)"
                        opacity={0}
                        _groupHover={{ opacity: 1 }}
                        transition="opacity 0.3s ease"
                      />
                      
                      <VStack spacing={{ base: 3, md: 4 }} align="center" textAlign="center">
                        <Box
                          p={{ base: 2, md: 3 }}
                          borderRadius="full"
                          bg="neon.500"
                          color="white"
                          fontSize={{ base: "xl", md: "2xl" }}
                          mb={2}
                        >
                          {service.emoji}
                        </Box>
                        <Icon as={service.icon} boxSize={{ base: 6, md: 8 }} color="neon.400" />
                        <Heading size={{ base: "sm", md: "md" }} color="white" mb={2}>
                          {service.title}
                        </Heading>
                        <Text color="gray.300" fontSize={{ base: "xs", md: "sm" }} lineHeight="tall">
                          {service.description}
                        </Text>
                      </VStack>
                    </Card>
                  </MotionBox>
                ))}
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Customer Trust (Testimonials) */}
          <Box w="full">
            <VStack spacing={{ base: 8, md: 12 }}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                textAlign="center"
              >
                <Heading size={{ base: "lg", md: "xl" }} mb={4} color="text.primary">
                  Trusted by Thousands
                </Heading>
                <Text color={textColor} maxW="2xl" mx="auto" fontSize={{ base: "sm", md: "lg" }}>
                  Real customers, real experiences
                </Text>
              </MotionBox>

              <SimpleGrid 
                columns={{ base: 1, md: 3 }} 
                spacing={{ base: 4, md: 8 }} 
                w="full"
              >
                {testimonials.map((testimonial, index) => (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                  >
                    <Card
                      p={{ base: 4, md: 6 }}
                      borderRadius="xl"
                      borderWidth="1px"
                      borderColor="neon.500"
                      bg="dark.800"
                      _hover={{
                        shadow: "neon.glow",
                        transform: "translateY(-2px)"
                      }}
                      transition="all 0.3s ease"
                      position="relative"
                    >
                      {/* Neon border glow */}
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor="neon.400"
                        opacity={0}
                        _hover={{ opacity: 1 }}
                        transition="opacity 0.3s ease"
                        pointerEvents="none"
                      />
                      
                      <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                        <HStack spacing={2} mb={2}>
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Icon key={i} as={FaStar} color="neon.400" boxSize={{ base: 3, md: 4 }} />
                          ))}
                        </HStack>
                        
                        <Text
                          color="gray.200"
                          fontSize={{ base: "sm", md: "md" }}
                          lineHeight="tall"
                          fontStyle="italic"
                          mb={4}
                        >
                          "{testimonial.quote}"
                        </Text>
                        
                        <HStack spacing={3}>
                          <Avatar size={{ base: "xs", md: "sm" }} name={testimonial.name} bg="neon.500" />
                          <VStack spacing={0} align="start">
                            <Text fontWeight="semibold" color="white" fontSize={{ base: "xs", md: "sm" }}>
                              {testimonial.name}
                            </Text>
                            <Text color="neon.400" fontSize={{ base: "xs", md: "xs" }}>
                              {testimonial.city}
                            </Text>
                          </VStack>
                        </HStack>
                      </VStack>
                    </Card>
                  </MotionBox>
                ))}
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Final Call-to-Action */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            w="full"
            textAlign="center"
            py={{ base: 8, md: 16 }}
            px={{ base: 4, md: 8 }}
            borderRadius="2xl"
            borderWidth="2px"
            borderColor="neon.500"
            bg="dark.800"
            position="relative"
            overflow="hidden"
          >
            {/* Animated neon background */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="linear-gradient(135deg, rgba(0,194,255,0.05) 0%, rgba(0,194,255,0.02) 50%, rgba(0,194,255,0.05) 100%)"
              opacity={0.8}
            />
            
            <VStack spacing={{ base: 6, md: 8 }} position="relative" zIndex={1}>
              <Heading size={{ base: "xl", md: "2xl" }} color="white" mb={4}>
                Ready to Move with Confidence?
              </Heading>
              <Text color="gray.300" fontSize={{ base: "md", md: "xl" }} maxW="2xl" mx="auto">
                Join thousands of satisfied customers who trust Speedy Van for their moving needs. 
                Get your instant quote today and experience the difference.
              </Text>
              <Button
                size={{ base: "lg", md: "lg" }}
                variant="primary"
                bg="neon.500"
                color="white"
                _hover={{
                  bg: "neon.400",
                  shadow: "neon.glow",
                  transform: "translateY(-2px)"
                }}
                _active={{
                  bg: "neon.600"
                }}
                px={{ base: 6, md: 8 }}
                py={{ base: 4, md: 6 }}
                fontSize={{ base: "md", md: "lg" }}
                fontWeight="semibold"
                borderRadius="xl"
                transition="all 0.3s ease"
                w={{ base: "full", sm: "auto" }}
              >
                Get Your Quote →
              </Button>
            </VStack>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
}
