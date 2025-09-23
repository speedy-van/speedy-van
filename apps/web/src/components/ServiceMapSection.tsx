'use client';

import React from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  useBreakpointValue,
  chakra,
  shouldForwardProp,
} from '@chakra-ui/react';
import { motion, isValidMotionProp } from 'framer-motion';

const MotionBox = chakra(motion.div, {
  shouldForwardProp: (prop) => {
    // Allow motion-specific props to pass through to Framer Motion
    if (isValidMotionProp(prop)) {
      return true;
    }
    // Use Chakra's shouldForwardProp for everything else (this handles Chakra UI props properly)
    return shouldForwardProp(prop);
  },
});

const ServiceMapSection: React.FC = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });

  return (
    <Box py={{ base: 12, md: 16 }} bg="bg.surface">
      <Container maxW="container.xl">
        <VStack spacing={8}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition="0.6s easeOut"
            textAlign="center"
          >
            <Heading
              size={{ base: 'lg', md: 'xl' }}
              mb={4}
              color="text.primary"
            >
              Service Coverage Map
            </Heading>
            <Text color="text.secondary" fontSize={{ base: 'md', md: 'lg' }}>
              We provide reliable moving services across the UK
            </Text>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition="0.6s ease-out 0.2s"
            w="full"
            h={{ base: '240px', sm: '300px', md: '500px' }}
            bg="gray.100"
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            border="2px solid"
            borderColor="border.primary"
          >
            <VStack spacing={4}>
              <Text fontSize="lg" color="text.secondary">
                Interactive Map Coming Soon
              </Text>
              <Text fontSize="sm" color="text.tertiary">
                Real-time service coverage visualization
              </Text>
            </VStack>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
};

export default ServiceMapSection;
