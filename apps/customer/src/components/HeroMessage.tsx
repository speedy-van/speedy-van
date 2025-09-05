'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaTruck, FaShieldAlt, FaStar } from 'react-icons/fa';

const phrases = [
  'Man and van London to Manchester from £65',
  'Full home removal Manchester to Glasgow from £180',
  'Affordable move Birmingham to Edinburgh for £150',
  'Express van service London to Bristol from £70',
  'Student move Leeds to London for just £80',
  'Flat removal Liverpool to Birmingham £95',
  'Quick move Sheffield to Newcastle £110',
  'Professional removal Glasgow to Aberdeen £120',
  'Man and van Cardiff to London from £130',
  'Reliable move Edinburgh to Dundee £90',
  'House removal London to Oxford £85',
  'Same-day van Manchester to Liverpool £75',
  'Budget removal Birmingham to Leeds £105',
  'Office relocation London to Reading £150',
  'Move fast: Bristol to Cardiff £70',
  'Secure move Nottingham to Manchester £95',
  'Van hire Glasgow to Stirling £65',
  'Smooth move London to Brighton £85',
  'Best price: London to Cambridge £80',
  'Affordable removal Manchester to York £90',
  'Instant quote London to Leicester £95',
  'Trusted movers Birmingham to Coventry £70',
  'Van service Edinburgh to Glasgow £60',
  'Home removal London to Southampton £120',
  'Flat move Newcastle to Leeds £95',
  'Student relocation London to Sheffield £100',
  'Quick removal Cardiff to Bristol £60',
  'Professional move Liverpool to Manchester £75',
  'House removal Glasgow to Inverness £150',
  'Fast booking: London to Birmingham £85',
  'Efficient move Manchester to Edinburgh £140',
  'Van hire London to Nottingham £95',
  'Affordable move Leeds to Liverpool £80',
  'Reliable man and van Oxford to London £75',
  'Office relocation Manchester to Birmingham £160',
  'Flat removal London to Milton Keynes £85',
  'Student move Birmingham to Sheffield £70',
  'Quick van service Glasgow to London £200',
  'House removal Edinburgh to Aberdeen £130',
  'Low-cost move London to York £110',
  'Fast service Bristol to London £100',
  'Affordable relocation Manchester to Leicester £90',
  'Trusted movers Liverpool to Leeds £85',
  'Professional van London to Reading £95',
  'Budget student move Cardiff to Manchester £105',
  'Quick service Newcastle to London £180',
  'House move London to Exeter £150',
  'Van hire Birmingham to Glasgow £190',
  'Affordable home removal Leeds to Edinburgh £130',
  'Reliable man and van London to Coventry £95',
  'Student flat move Oxford to Cambridge £70',
  'Quick relocation Liverpool to Sheffield £85',
  'House removal London to Norwich £120',
  'Fast van service Manchester to Bristol £110',
  'Affordable move Birmingham to Nottingham £80',
  'Trusted movers Glasgow to Dundee £65',
  'Quick service London to Bath £95',
  'Efficient removal Manchester to Newcastle £100',
  'Budget-friendly move Edinburgh to London £170',
];

const MotionHeading = motion.create(Heading);
const MotionBox = motion.create(Box);

export default function HeroMessage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % phrases.length);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      as="section"
      textAlign="center"
      py={{ base: 16, md: 24 }}
      position="relative"
      overflow="hidden"
    >
      {/* Background Pattern */}
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        opacity={0.03}
        background="radial-gradient(circle at 30% 70%, rgba(0,194,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(0,209,143,0.1) 0%, transparent 50%)"
        pointerEvents="none"
      />

      <Box maxW="7xl" mx="auto" px={4} position="relative" zIndex={1}>
        <VStack spacing={{ base: 8, md: 12 }}>
          {/* Trust Indicators */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <HStack spacing={6} justify="center" flexWrap="wrap" mb={6}>
              <Badge
                colorScheme="green"
                variant="solid"
                size="lg"
                px={4}
                py={2}
                borderRadius="full"
                fontSize="sm"
                fontWeight="semibold"
                boxShadow="0 4px 15px rgba(0,209,143,0.3)"
              >
                <Icon as={FaShieldAlt} mr={2} />
                Fully Insured
              </Badge>
              <Badge
                colorScheme="blue"
                variant="solid"
                size="lg"
                px={4}
                py={2}
                borderRadius="full"
                fontSize="sm"
                fontWeight="semibold"
                boxShadow="0 4px 15px rgba(0,194,255,0.3)"
              >
                <Icon as={FaTruck} mr={2} />
                Same-Day Available
              </Badge>
              <Badge
                colorScheme="yellow"
                variant="solid"
                size="lg"
                px={4}
                py={2}
                borderRadius="full"
                fontSize="sm"
                fontWeight="semibold"
                boxShadow="0 4px 15px rgba(255,193,7,0.3)"
              >
                <Icon as={FaStar} mr={2} />
                Best Prices
              </Badge>
            </HStack>
          </MotionBox>

          {/* Main Message */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              <MotionHeading
                key={currentIndex}
                size={{ base: 'xl', md: '2xl', lg: '3xl' }}
                mb={6}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                bgGradient="linear(to-r, #00E0FF, #B026FF)"
                bgClip="text"
                fontWeight="extrabold"
                aria-live="polite"
                aria-label={`Current message: ${phrases[currentIndex]}`}
                lineHeight="1.3"
                maxW="5xl"
                mx="auto"
                textShadow="0 2px 10px rgba(0,0,0,0.1)"
              >
                {phrases[currentIndex]}
              </MotionHeading>
            </AnimatePresence>
          </MotionBox>

          {/* Additional Information */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <VStack spacing={4}>
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                color="text.secondary"
                maxW="3xl"
                mx="auto"
                lineHeight="1.6"
                fontWeight="medium"
              >
                Instant quotes • No hidden fees • Professional drivers • Live
                tracking
              </Text>

              <HStack
                spacing={6}
                justify="center"
                flexWrap="wrap"
                color="text.tertiary"
              >
                <HStack spacing={2}>
                  <Icon as={FaMapMarkerAlt} color="neon.400" />
                  <Text fontSize="sm">Nationwide Coverage</Text>
                </HStack>
                <Text fontSize="sm">•</Text>
                <HStack spacing={2}>
                  <Icon as={FaTruck} color="neon.400" />
                  <Text fontSize="sm">24/7 Service</Text>
                </HStack>
                <Text fontSize="sm">•</Text>
                <HStack spacing={2}>
                  <Icon as={FaShieldAlt} color="neon.400" />
                  <Text fontSize="sm">Full Insurance</Text>
                </HStack>
              </HStack>
            </VStack>
          </MotionBox>
        </VStack>
      </Box>

      {/* Hidden phrases for SEO - all phrases remain in DOM */}
      <Box as="div" display="none" aria-hidden="true">
        {phrases.map((phrase, i) => (
          <p key={i}>{phrase}</p>
        ))}
      </Box>
    </Box>
  );
}
