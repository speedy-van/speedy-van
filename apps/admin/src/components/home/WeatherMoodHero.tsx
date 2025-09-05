'use client';
import * as React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

type WeatherPayload = {
  city: string;
  temp: number;
  windMph: number;
  weather: string;
  description: string;
};

// Enhanced cloud animations for iOS Weather app feel
const cloudFloat = keyframes`
  0% { transform: translateX(-20px) translateY(0px); opacity: 0.3; }
  50% { transform: translateX(20px) translateY(-10px); opacity: 0.6; }
  100% { transform: translateX(-20px) translateY(0px); opacity: 0.3; }
`;

const cloudFloat2 = keyframes`
  0% { transform: translateX(20px) translateY(0px); opacity: 0.2; }
  50% { transform: translateX(-20px) translateY(-15px); opacity: 0.5; }
  100% { transform: translateX(20px) translateY(0px); opacity: 0.2; }
`;

const messages = (w: WeatherPayload) => {
  const base = [
    // Core upbeat "ready to move" lines:
    `It's ${w.description} in ${w.city}. Ready to move your sofa? 🛋️`,
    `Partly ${w.description} in ${w.city}. Need a fast man & van today? 🚚`,
    `${w.city} is ${w.temp}°C right now — perfect time for a smooth move.`,
  ];
  switch (w.weather) {
    case 'Clear':
      return [
        `It's a sunny day in ${w.city} ☀️ — let's get you moving!`,
        ...base,
      ];
    case 'Clouds':
      return [
        `Clouds above ${w.city} ☁️ — our team keeps things bright and easy.`,
        ...base,
      ];
    case 'Rain':
    case 'Drizzle':
      return [
        `Rain in ${w.city} 🌧️ — we protect everything, rain or shine.`,
        `Wet outside? We'll keep your items dry and on time.`,
        ...base,
      ];
    case 'Snow':
      return [
        `Snow in ${w.city} ❄️ — safe, careful moving when you need it most.`,
        ...base,
      ];
    case 'Thunderstorm':
      return [
        `Storms near ${w.city} ⛈️ — we still move with safety and care.`,
        ...base,
      ];
    default:
      return base;
  }
};

// Helper to determine if it's night time (simplified)
const isNightTime = () => {
  const hour = new Date().getHours();
  return hour < 6 || hour > 20;
};

export default function WeatherMoodHero() {
  const [wx, setWx] = React.useState<WeatherPayload | null>(null);
  const [msgIndex, setMsgIndex] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  // Try browser geolocation; fall back to server defaults (London)
  React.useEffect(() => {
    const fetchByCoords = async (lat?: number, lon?: number) => {
      const qs = lat && lon ? `?lat=${lat}&lon=${lon}` : '';
      const res = await fetch(`/api/weather/current${qs}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        setError('Weather unavailable');
        return;
      }
      const data = (await res.json()) as WeatherPayload;
      setWx(data);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
        () => fetchByCoords(),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      fetchByCoords();
    }
  }, []);

  // Rotate message every 30s
  React.useEffect(() => {
    const id = setInterval(() => setMsgIndex(i => i + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // Enhanced iOS Weather app-style background gradients with more dynamic colors
  const bgGrad = React.useMemo(() => {
    const tone = wx?.weather ?? 'Default';
    const isNight = isNightTime();

    if (isNight && tone !== 'Thunderstorm') {
      return 'linear-gradient(135deg, #0f2027 0%, #2c5364 50%, #203a43 100%)';
    }

    switch (tone) {
      case 'Clear':
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      case 'Clouds':
        return 'linear-gradient(135deg, #757f9a 0%, #d7dde8 100%)';
      case 'Rain':
      case 'Drizzle':
        return 'linear-gradient(135deg, #667db6 0%, #0082c8 100%)';
      case 'Snow':
        return 'linear-gradient(135deg, #e6ddd4 0%, #d5d4d0 100%)';
      case 'Thunderstorm':
        return 'linear-gradient(135deg, #2c3e50 0%, #4a6741 100%)';
      default:
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    }
  }, [wx?.weather]);

  // Text color based on background
  const getTextColor = () => {
    const tone = wx?.weather ?? 'Default';
    const isNight = isNightTime();

    if (
      isNight ||
      tone === 'Rain' ||
      tone === 'Drizzle' ||
      tone === 'Thunderstorm'
    ) {
      return 'white';
    }

    if (tone === 'Snow') {
      return 'gray.800';
    }

    return 'white';
  };

  const textColor = getTextColor();
  const secondaryTextColor =
    textColor === 'white' ? 'whiteAlpha.850' : 'gray.600';

  const line = wx
    ? messages(wx)[msgIndex % messages(wx).length]
    : 'Checking local weather…';

  return (
    <Box
      as="section"
      role="region"
      aria-label="Local weather and move prompt"
      position="relative"
      py={{ base: 8, md: 12 }}
      overflow="hidden"
    >
      <Container maxW="7xl">
        <Box
          position="relative"
          overflow="hidden"
          bg={bgGrad}
          borderRadius="16px"
          boxShadow="0 4px 24px rgba(0,0,0,0.4)"
          maxW="720px"
          mx="auto"
          p={{ base: 8, md: 10 }}
          _before={{
            content: '""',
            position: 'absolute',
            top: '15%',
            left: '15%',
            width: '80px',
            height: '40px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '40px',
            filter: 'blur(8px)',
            animation: `${cloudFloat} 25s ease-in-out infinite`,
            display: { base: 'none', md: 'block' },
          }}
          _after={{
            content: '""',
            position: 'absolute',
            top: '25%',
            right: '20%',
            width: '100px',
            height: '50px',
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '50px',
            filter: 'blur(10px)',
            animation: `${cloudFloat2} 30s ease-in-out infinite reverse`,
            display: { base: 'none', md: 'block' },
          }}
        >
          {/* Enhanced overlay for depth and iOS Weather app feel */}
          <Box
            position="absolute"
            inset={0}
            background="radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 60%)"
            borderRadius="16px"
            backdropFilter="none"
            pointerEvents="none"
          />

          {/* Additional subtle overlay for premium look */}
          <Box
            position="absolute"
            inset={0}
            background="radial-gradient(circle at 70% 70%, rgba(255,255,255,0.05) 0%, transparent 60%)"
            borderRadius="16px"
            pointerEvents="none"
          />

          <Stack spacing={6} align="flex-start" position="relative" zIndex={1}>
            <Heading
              as="h2"
              fontSize="1.8rem"
              fontWeight="700"
              color={textColor}
              lineHeight="1.2"
              textShadow="0 2px 4px rgba(0,0,0,0.3)"
            >
              {wx ? `Moving in ${wx.city}?` : 'Moving today?'}
            </Heading>

            <Text
              fontSize="lg"
              color={secondaryTextColor}
              fontWeight="500"
              lineHeight="1.4"
              opacity={0.85}
            >
              {line}
            </Text>

            {wx && (
              <Text
                fontSize="sm"
                color={secondaryTextColor}
                fontWeight="400"
                opacity={0.8}
              >
                {wx.temp}°C • {wx.description} • wind {wx.windMph} mph
              </Text>
            )}

            <Stack
              direction={{ base: 'column', sm: 'row' }}
              spacing={4}
              pt={3}
              width={{ base: '100%', sm: 'auto' }}
            >
              <Button
                as="a"
                href="/booking"
                bg="#00E0FF"
                color="black"
                fontWeight="600"
                borderRadius="25px"
                px={8}
                py={4}
                fontSize="md"
                _hover={{
                  bg: '#00C5E6',
                  boxShadow:
                    '0 0 20px rgba(0, 224, 255, 0.6), 0 0 40px rgba(0, 224, 255, 0.3)',
                  transform: 'translateY(-2px)',
                }}
                _active={{
                  bg: '#00A3CC',
                  transform: 'translateY(0)',
                }}
                transition="all 0.2s ease"
                boxShadow="0 0 15px rgba(0, 224, 255, 0.4)"
                width={{ base: '100%', sm: 'auto' }}
              >
                Get a quote
              </Button>

              <Button
                as="a"
                href="/how-it-works"
                bg="#39FF14"
                color="black"
                fontWeight="600"
                borderRadius="25px"
                px={8}
                py={4}
                fontSize="md"
                _hover={{
                  bg: '#2ECC11',
                  boxShadow:
                    '0 0 20px rgba(57, 255, 20, 0.6), 0 0 40px rgba(57, 255, 20, 0.3)',
                  transform: 'translateY(-2px)',
                }}
                _active={{
                  bg: '#24A80D',
                  transform: 'translateY(0)',
                }}
                transition="all 0.2s ease"
                boxShadow="0 0 15px rgba(57, 255, 20, 0.4)"
                width={{ base: '100%', sm: 'auto' }}
              >
                How it works
              </Button>
            </Stack>

            {error && (
              <Text fontSize="sm" color="red.300">
                {error}
              </Text>
            )}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
