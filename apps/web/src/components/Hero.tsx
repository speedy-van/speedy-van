'use client';

import { useEffect, useState, useRef } from "react";
import { Box, Heading, Text, Stack, Button, useColorModeValue } from "@chakra-ui/react";
import NextLink from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
    <Box as="section" bg={bgColor} py={16} textAlign="center" position="relative" overflow="hidden" minH="80vh">
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

      <Box maxW="6xl" mx="auto" px={4} className="hero-text-overlay">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AnimatePresence mode="wait">
            <MotionBox
              key={currentPhrase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Heading 
                as="h1" 
                size="2xl" 
                mb={4}
                minH="80px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
              >
                {rotatingPhrases[currentPhrase]}
              </Heading>
            </MotionBox>
          </AnimatePresence>
          
          <Text mt={3} fontSize="lg">
            Book a professional van in minutes with real-time tracking.
          </Text>
          
          <Stack direction={{ base: "column", sm: "row" }} justify="center" mt={8} spacing={4}>
            <HeaderButton 
              href="/book" 
              label="Get a quote"
              size="lg"
              px={8}
              py={6}
              fontSize="lg"
              fontWeight="semibold"
            />
            <HeaderButton 
              href="/track" 
              label="Track a move"
              size="lg"
              px={8}
              py={6}
              fontSize="lg"
              fontWeight="semibold"
            />
          </Stack>
        </MotionBox>
      </Box>
    </Box>
  );
}
