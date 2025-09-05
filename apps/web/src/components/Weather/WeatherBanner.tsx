'use client';

import React from 'react';
import { Box, Flex, HStack, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { Forecast } from '@/lib/useForecast';

// framer-motion v12 deprecates direct factory; create via .create
const MotionBox = motion.create(Box);

const bgByTheme: Record<string, string> = {
  sunny: 'linear-gradient(180deg, #5ec6ff 0%, #c2e9ff 60%, #fff 100%)',
  rain: 'linear-gradient(180deg, #1e3a5f 0%, #2b4a6d 60%, #1b2a3a 100%)',
  clouds: 'linear-gradient(180deg, #8fb3cc 0%, #c9d9e6 60%, #e9edf1 100%)',
  snow: 'linear-gradient(180deg, #bcd7ff 0%, #eaf3ff 60%, #ffffff 100%)',
  wind: 'linear-gradient(180deg, #77a7c9 0%, #b9d6e6 60%, #e8f3f9 100%)',
  fog: 'linear-gradient(180deg, #aebcc6 0%, #cfd6db 60%, #eef1f3 100%)',
};

export function WeatherBanner({ f }: { f?: Forecast | null }) {
  if (!f) return null;
  const bg = bgByTheme[f.theme] ?? bgByTheme.sunny;

  return (
    <MotionBox
      borderRadius="2xl"
      p={5}
      minH="160px"
      bg={bg}
      position="relative"
      overflow="hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {f.theme === 'sunny' && (
        <Box
          position="absolute"
          sx={{ right: '-10%' }}
          top="-20%"
          w="60%"
          h="60%"
          bg="radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7), transparent 60%)"
          filter="blur(8px)"
        />
      )}
      {f.theme === 'rain' && <Box as="span" className="rain-overlay" />}

      <Flex align="flex-end" justify="space-between">
        <Box>
          <Text fontSize="lg" fontWeight="semibold">
            {f.desc}
          </Text>
          <HStack spacing={4} mt={2} fontSize="sm">
            {f.temp != null && <Text>{Math.round(f.temp)}°C</Text>}
            {f.pop != null && <Text>Rain: {Math.round(f.pop * 100)}%</Text>}
            {f.windGust != null && (
              <Text>Gusts: {Math.round(f.windGust)} km/h</Text>
            )}
            {f.uvi != null && <Text>UV: {Math.round(f.uvi)}</Text>}
          </HStack>
          <Text fontSize="xs" color="text.muted" mt={1}>
            Forecast for selected time. May change.
          </Text>
        </Box>
        {f.temp != null && (
          <Text fontSize="48px" fontWeight="bold">
            {Math.round(f.temp)}°
          </Text>
        )}
      </Flex>
    </MotionBox>
  );
}

export default WeatherBanner;
