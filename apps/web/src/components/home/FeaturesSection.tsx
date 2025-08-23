'use client';

import React from 'react';
import { Box, VStack, Heading, Text, Icon, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaTruck, FaClock, FaShieldAlt, FaStar } from 'react-icons/fa';

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

export default function FeaturesSection() {
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box w="full">
      <VStack spacing={12}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          textAlign="center"
        >
          <Heading size="lg" mb={4}>
            Why Choose Speedy Van?
          </Heading>
          <Text color={textColor} maxW="2xl" mx="auto">
            We provide comprehensive moving solutions tailored to your needs
          </Text>
        </MotionBox>

        <Box
          display="grid"
          gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
          gap={8}
          w="full"
        >
          {features.map((feature, index) => (
            <MotionBox
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              textAlign="center"
              p={6}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="gray.200"
              _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
            >
              <Icon as={feature.icon} boxSize={8} color="blue.500" mb={4} />
              <Heading size="md" mb={3}>
                {feature.title}
              </Heading>
              <Text color={textColor} fontSize="sm">
                {feature.description}
              </Text>
            </MotionBox>
          ))}
        </Box>
      </VStack>
    </Box>
  );
}
