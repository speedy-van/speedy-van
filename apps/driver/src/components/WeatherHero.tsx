'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
  Button,
  Container,
  useColorModeValue,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import HeaderButton from './common/HeaderButton';

const MotionBox = motion.create(Box);

type WeatherPayload = {
  city: string;
  temp: number;
  windMph: number;
  weather: string;
  description: string;
};

// Weather-aware SEO-friendly rotating phrases
const getWeatherPhrases = (city: string, weather: string, temp: number) => {
  const basePhrases = [
    `Book your man and van service in ${city} today for a smooth move.`,
    `Professional removal service in ${city} - secure your booking now.`,
    `Reliable man and van ${city} - your trusted moving partner.`,
    `Fast home removal ${city} - book online in minutes.`,
    `Affordable moving service ${city} - quality you can trust.`,
  ];

  const weatherSpecificPhrases = {
    Clear: [
      `It's a sunny day in ${city}. Book your man and van for a smooth move today.`,
      `Perfect weather in ${city} for your home removal — secure your booking now.`,
      `Sunny skies in ${city} - ideal conditions for your move with Speedy Van.`,
      `Clear weather in ${city} - book your professional removal service today.`,
    ],
    Clouds: [
      `Cloudy skies in ${city}. Don't wait — plan your hassle-free move today.`,
      `Overcast in ${city}, but your move can still be bright and easy.`,
      `Cloudy weather in ${city} - perfect time to book your man and van service.`,
      `Partly cloudy in ${city} - ideal for planning your stress-free move.`,
    ],
    Rain: [
      `Rainy day in ${city}? Let Speedy Van handle the heavy lifting.`,
      `Showers in ${city} — we'll keep your move safe and dry.`,
      `Wet weather in ${city} - our professional team ensures a smooth move.`,
      `Rain in ${city} won't stop your move - book with confidence today.`,
    ],
    Drizzle: [
      `Light rain in ${city} - perfect weather for an indoor move planning.`,
      `Drizzle in ${city} - book your man and van service for a dry move.`,
      `Misty weather in ${city} - ideal for scheduling your removal service.`,
    ],
    Snow: [
      `Snow in ${city}? Book your move with reliable drivers today.`,
      `Moving in ${city} despite the snow — we've got you covered.`,
      `Winter weather in ${city} - our experienced team handles all conditions.`,
      `Snowy ${city} - book your safe and reliable removal service now.`,
    ],
    Thunderstorm: [
      `Stormy weather in ${city} - we'll make your move safe and secure.`,
      `Thunder in ${city} - our professional team handles challenging conditions.`,
      `Stormy skies in ${city} - book your reliable removal service today.`,
    ],
    Wind: [
      `Windy weather in ${city}, but our vans are steady and ready.`,
      `Strong winds in ${city}? We'll make your move stress-free.`,
      `Breezy conditions in ${city} - perfect for planning your move.`,
    ],
    Fog: [
      `Foggy morning in ${city} - clear vision for your move planning.`,
      `Misty conditions in ${city} - book your removal service today.`,
    ],
    Mist: [
      `Misty weather in ${city} - ideal for scheduling your move.`,
      `Low visibility in ${city} - our team navigates safely.`,
    ],
  };

  // Get weather-specific phrases or fall back to base phrases
  const weatherPhrases =
    weatherSpecificPhrases[weather as keyof typeof weatherSpecificPhrases] ||
    basePhrases;

  // Combine weather-specific and base phrases, ensuring city and service keywords are always present
  return [...weatherPhrases, ...basePhrases];
};

export function WeatherHero() {
  const [wx, setWx] = useState<WeatherPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-detect location and fetch weather on component mount
  useEffect(() => {
    const fetchWeather = async (lat?: number, lon?: number) => {
      try {
        setLoading(true);
        const qs = lat && lon ? `?lat=${lat}&lon=${lon}` : '';
        const res = await fetch(`/api/weather/current${qs}`);

        if (!res.ok) {
          throw new Error('Weather unavailable');
        }

        const data = (await res.json()) as WeatherPayload;
        setWx(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Weather unavailable');
        // Fallback to default city for SEO
        setWx({
          city: 'London',
          temp: 18,
          windMph: 10,
          weather: 'Clear',
          description: 'clear sky',
        });
      } finally {
        setLoading(false);
      }
    };

    // Try browser geolocation first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(), // Fallback to default location
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 } // 5 min cache
      );
    } else {
      fetchWeather(); // Fallback to default location
    }
  }, []);

  // Rotate phrases every 25-30 seconds
  useEffect(() => {
    if (!wx) return;

    const phrases = getWeatherPhrases(wx.city, wx.weather, wx.temp);
    const interval = setInterval(() => {
      setCurrentPhrase(prev => (prev + 1) % phrases.length);
    }, 28000); // 28 seconds for natural rotation

    return () => clearInterval(interval);
  }, [wx]);

  // Dynamic sky gradient based on weather and time
  const weatherGradient = useMemo(() => {
    if (!wx || !mounted)
      return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #4facfe 100%)';

    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 20;

    switch (wx.weather) {
      case 'Clear':
        if (isNight) {
          return 'linear-gradient(135deg, #0f2027 0%, #2c5364 50%, #203a43 100%)';
        }
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #4facfe 100%)';
      case 'Clouds':
        return 'linear-gradient(135deg, #757f9a 0%, #d7dde8 50%, #757f9a 100%)';
      case 'Rain':
      case 'Drizzle':
        return 'linear-gradient(135deg, #667db6 0%, #0082c8 50%, #667db6 100%)';
      case 'Snow':
        return 'linear-gradient(135deg, #bcd7ff 0%, #eaf3ff 50%, #bcd7ff 100%)';
      case 'Thunderstorm':
        return 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%)';
      case 'Wind':
        return 'linear-gradient(135deg, #77a7c9 0%, #b9d6e6 50%, #77a7c9 100%)';
      case 'Fog':
      case 'Mist':
        return 'linear-gradient(135deg, #aebcc6 0%, #cfd6db 50%, #aebcc6 100%)';
      default:
        if (isNight) {
          return 'linear-gradient(135deg, #0f2027 0%, #2c5364 50%, #203a43 100%)';
        }
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #4facfe 100%)';
    }
  }, [wx?.weather, mounted]);

  // Get current phrases for display
  const currentPhrases = useMemo(() => {
    if (!wx) return ['Book your professional man and van service today.'];
    return getWeatherPhrases(wx.city, wx.weather, wx.temp);
  }, [wx]);

  const currentMessage = currentPhrases[currentPhrase] || currentPhrases[0];

  return (
    <Box
      as="section"
      position="relative"
      py={16}
      textAlign="center"
      overflow="hidden"
    >
      {/* Video Background */}
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        zIndex="1"
        overflow="hidden"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        >
          <source src="/videos/background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Video overlay for better text readability */}
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          bg="rgba(0,0,0,0.4)"
          zIndex="1"
        />
      </Box>

      {/* Dynamic Sky Background */}
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        background={weatherGradient}
        backgroundSize="200% 200%"
        animation="skyShift 20s ease-in-out infinite"
        opacity="0.7"
        zIndex="2"
        _before={{
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 60%)',
          filter: 'blur(40px)',
        }}
        _after={{
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 70% 70%, rgba(255,255,255,0.05) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Animated Clouds Overlay */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.3}
        zIndex="3"
        _before={{
          content: '""',
          position: 'absolute',
          top: '20%',
          left: '-10%',
          width: '120px',
          height: '60px',
          background: 'rgba(255,255,255,0.4)',
          borderRadius: '60px',
          filter: 'blur(8px)',
          animation: 'cloudFloat 25s linear infinite',
        }}
        _after={{
          content: '""',
          position: 'absolute',
          top: '60%',
          right: '-15%',
          width: '100px',
          height: '50px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '50px',
          filter: 'blur(6px)',
          animation: 'cloudFloat 30s linear infinite reverse',
        }}
      />

      {/* Content Container */}
      <Container
        position="relative"
        zIndex="4"
        maxW={{ base: 'full', md: '80%' }}
        mx="auto"
        px={4}
      >
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Main Heading with Weather-Aware Message */}
          <AnimatePresence mode="wait">
            <MotionBox
              key={`${wx?.city}-${currentPhrase}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Heading
                as="h1"
                size="2xl"
                color="white"
                mb={4}
                minH="80px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                textShadow="2px 2px 4px rgba(0,0,0,0.7)"
                fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                lineHeight="1.2"
                maxW="4xl"
                mx="auto"
              >
                {currentMessage}
              </Heading>
            </MotionBox>
          </AnimatePresence>

          {/* Subtitle */}
          <Text
            mt={3}
            color="white"
            fontSize="lg"
            textShadow="1px 1px 2px rgba(0,0,0,0.7)"
            opacity={0.9}
          >
            Book a professional van in minutes with real-time tracking.
          </Text>

          {/* Weather Info Display */}
          {wx && !loading && (
            <Box
              mt={4}
              display="inline-block"
              bg="rgba(255,255,255,0.15)"
              backdropFilter="none"
              px={4}
              py={2}
              borderRadius="full"
              border="1px solid rgba(255,255,255,0.2)"
              className="sv-no-blur"
            >
              <Text fontSize="sm" color="white" fontWeight="500">
                {wx.temp}°C • {wx.description} • {wx.city}
              </Text>
            </Box>
          )}

          {/* CTA Buttons */}
          <Stack
            direction={{ base: 'column', sm: 'row' }}
            justify="center"
            mt={8}
            spacing={{ base: 4, md: 6 }}
            maxW="500px"
            mx="auto"
          >
            <HeaderButton href="/book" label="Get a quote" />
            <HeaderButton href="/how-it-works" label="How it works" />
          </Stack>

          {/* Error Display */}
          {error && (
            <Text
              mt={4}
              fontSize="sm"
              color="rgba(255,255,255,0.8)"
              bg="rgba(239,68,68,0.2)"
              px={4}
              py={2}
              borderRadius="full"
              backdropFilter="none"
              display="inline-block"
              className="sv-no-blur"
            >
              {error}
            </Text>
          )}
        </MotionBox>
      </Container>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes skyShift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes cloudFloat {
          0% {
            transform: translateX(-100px);
          }
          100% {
            transform: translateX(calc(100vw + 100px));
          }
        }
      `}</style>
    </Box>
  );
}
