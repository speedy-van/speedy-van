'use client';

import { useEffect, useState, useRef } from "react";
import { Box, Heading, Text, Stack, Button, useColorModeValue, Icon, Badge, HStack, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaTruck, FaShieldAlt, FaStar, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import { rotatingPhrases } from "../lib/rotatingPhrases";
import HeaderButton from "./common/HeaderButton";

const MotionBox = motion.create(Box);

export default function Hero() {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % rotatingPhrases.length);
    }, 3000); // 3 seconds per phrase for better engagement
    return () => clearInterval(interval);
  }, []);

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
    setVideoLoaded(true);
    setVideoError(false);
  };

  const handleVideoError = (e: any) => {
    console.error('Video error:', e);
    setVideoError(true);
    setVideoLoaded(false);
  };

  const handleVideoCanPlay = () => {
    console.log('Video can play');
    setVideoLoaded(true);
  };

  // Pause video when component unmounts or page becomes hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (videoRef.current) {
        if (document.hidden) {
          videoRef.current.pause();
        } else {
          videoRef.current.play().catch(() => {
            // Ignore autoplay errors
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Force video to be visible after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!videoLoaded && !videoError) {
        console.log('Forcing video to be visible');
        setVideoLoaded(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [videoLoaded, videoError]);

  return (
    <Box as="section" bg="transparent" py={20} textAlign="center" position="relative" overflow="hidden" minH="90vh">
      {/* Video Background */}
      <Box className="hero-video-background">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={handleVideoLoad}
          onCanPlay={handleVideoCanPlay}
          onError={handleVideoError}
          className={videoLoaded ? 'loaded' : ''}
          aria-hidden="true"
          role="presentation"
          style={{
            opacity: videoLoaded ? 1 : 0.8, // Ensure video is visible
            transition: 'opacity 0.5s ease-in-out',
          }}
        >
          <source src="/videos/background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Enhanced video overlay for better text readability */}
        <Box className="hero-video-overlay" />
        
        {/* Fallback background when video is loading or has errors */}
        {(!videoLoaded || videoError) && (
          <Box className="hero-video-fallback" />
        )}
      </Box>

      <Box maxW="7xl" mx="auto" px={4} className="hero-text-overlay">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Trust Badges */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            mb={8}
          >
            <HStack spacing={4} justify="center" flexWrap="wrap">
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
                <Icon as={FaStar} mr={2} />
                5-Star Rated
              </Badge>
              <Badge 
                colorScheme="purple" 
                variant="solid" 
                size="lg"
                px={4}
                py={2}
                borderRadius="full"
                fontSize="sm"
                fontWeight="semibold"
                boxShadow="0 4px 15px rgba(128,90,213,0.3)"
              >
                <Icon as={FaMapMarkerAlt} mr={2} />
                Nationwide
              </Badge>
            </HStack>
          </MotionBox>

          {/* Main Heading */}
          <AnimatePresence mode="wait">
            <MotionBox
              key={currentPhrase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <Heading 
                as="h1" 
                size={{ base: "2xl", md: "3xl", lg: "4xl" }} 
                mb={6}
                minH={{ base: "80px", md: "120px" }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="extrabold"
                color="white"
                textShadow="0 4px 20px rgba(0,0,0,0.8)"
                lineHeight="1.2"
                maxW="6xl"
                mx="auto"
              >
                {rotatingPhrases[currentPhrase]}
              </Heading>
            </MotionBox>
          </AnimatePresence>
          
          {/* Subtitle */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            mb={8}
          >
            <Text 
              fontSize={{ base: "lg", md: "xl", lg: "2xl" }} 
              color="gray.200"
              maxW="3xl"
              mx="auto"
              lineHeight="1.6"
              fontWeight="medium"
              textShadow="0 2px 10px rgba(0,0,0,0.6)"
            >
              Book a professional van in minutes with real-time tracking and guaranteed delivery times.
            </Text>
          </MotionBox>

          {/* Additional Benefits */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            mb={10}
          >
            <VStack spacing={3}>
              <Text 
                fontSize={{ base: "md", md: "lg" }} 
                color="neon.300"
                fontWeight="semibold"
                textShadow="0 2px 10px rgba(0,194,255,0.3)"
              >
                🚚 Same-day & Next-day Delivery Available
              </Text>
              <Text 
                fontSize={{ base: "sm", md: "md" }} 
                color="gray.300"
                maxW="2xl"
                mx="auto"
              >
                From £50 • Fully Insured • Professional Drivers • Live Tracking
              </Text>
            </VStack>
          </MotionBox>
          
          {/* Action Buttons */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Stack direction={{ base: "column", sm: "row" }} justify="center" spacing={6}>
              <HeaderButton 
                href="/book" 
                label="Get a Quote Now"
                size="xl"
                px={10}
                py={8}
                fontSize="lg"
                fontWeight="bold"
                bg="linear-gradient(135deg, #00C2FF, #00D18F)"
                _hover={{
                  bg: "linear-gradient(135deg, #00D18F, #00C2FF)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0,194,255,0.4)"
                }}
                transition="all 0.3s ease"
                rightIcon={<FaTruck />}
              />
              <HeaderButton 
                href="/track" 
                label="Track Your Move"
                size="xl"
                px={10}
                py={8}
                fontSize="lg"
                fontWeight="semibold"
                variant="outline"
                borderColor="neon.400"
                color="neon.300"
                _hover={{
                  bg: "neon.400",
                  color: "black",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0,194,255,0.3)"
                }}
                transition="all 0.3s ease"
                rightIcon={<FaMapMarkerAlt />}
              />
            </Stack>
          </MotionBox>

          {/* Quick Contact */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            mt={12}
          >
            <HStack spacing={6} justify="center" flexWrap="wrap">
              <HStack spacing={2} color="gray.300">
                <Icon as={FaPhone} color="neon.400" />
                <Text fontSize="sm">07901846297</Text>
              </HStack>
              <Text color="gray.400" fontSize="sm">•</Text>
              <HStack spacing={2} color="gray.300">
                <Icon as={FaTruck} color="neon.400" />
                <Text fontSize="sm">Available 24/7</Text>
              </HStack>
              <Text color="gray.400" fontSize="sm">•</Text>
              <HStack spacing={2} color="gray.300">
                <Icon as={FaShieldAlt} color="neon.400" />
                <Text fontSize="sm">Fully Insured</Text>
              </HStack>
            </HStack>
          </MotionBox>
        </MotionBox>
      </Box>
    </Box>
  );
}
