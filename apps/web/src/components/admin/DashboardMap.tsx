'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, VStack, HStack, Badge, Spinner } from '@chakra-ui/react';
import { FiMapPin, FiTruck, FiNavigation } from 'react-icons/fi';

interface DashboardMapProps {
  activeJobs: Array<{
    id: string;
    ref: string;
    status: string;
    driver: string;
    pickupAddress?: string;
    dropoffAddress?: string;
    pickupLat?: number;
    pickupLng?: number;
    dropoffLat?: number;
    dropoffLng?: number;
  }>;
  height?: string;
  showControls?: boolean;
}

export function DashboardMap({ activeJobs, height = "300px", showControls = false }: DashboardMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Mock coordinates for London area (in real app, these would come from actual job data)
  const mockLocations = [
    { lat: 51.5074, lng: -0.1278, type: 'pickup', jobRef: 'ORD-001' },
    { lat: 51.5200, lng: -0.1000, type: 'dropoff', jobRef: 'ORD-001' },
    { lat: 51.4900, lng: -0.1500, type: 'pickup', jobRef: 'ORD-002' },
    { lat: 51.5100, lng: -0.1200, type: 'dropoff', jobRef: 'ORD-002' },
    { lat: 51.5300, lng: -0.0800, type: 'pickup', jobRef: 'ORD-003' },
    { lat: 51.5000, lng: -0.1100, type: 'dropoff', jobRef: 'ORD-003' },
  ];

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (mapError) {
    return (
      <Box
        height={height}
        bg="bg.surface.elevated"
        borderRadius="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={2}>
          <FiMapPin size={32} color="#E53E3E" />
          <Text color="red.500" fontSize="sm">Map failed to load</Text>
        </VStack>
      </Box>
    );
  }

  if (!mapLoaded) {
    return (
      <Box
        height={height}
        bg="bg.surface.elevated"
        borderRadius="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={2}>
          <Spinner size="md" />
          <Text color="text.tertiary" fontSize="sm">Loading map...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      ref={mapRef}
      height={height}
      bg="bg.surface.elevated"
      borderRadius="md"
      position="relative"
      overflow="hidden"
      backgroundImage="url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRjNGNEY2IiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPgo8L3N2Zz4=')"
      backgroundSize="20px 20px"
    >
      {/* Map overlay with mock data */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        width="100%"
        height="100%"
        pointerEvents="none"
      >
        {/* Heat map overlay */}
        <Box
          position="absolute"
          top="20%"
          left="30%"
          width="150px"
          height="150px"
          borderRadius="full"
          background="radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 100%)"
          animation="pulse 2s infinite"
        />
        
        <Box
          position="absolute"
          top="60%"
          left="60%"
          width="100px"
          height="100px"
          borderRadius="full"
          background="radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.06) 50%, transparent 100%)"
          animation="pulse 2s infinite"
          sx={{
            animationDelay: "1s"
          }}
        />

        {/* Mock job markers */}
        {mockLocations.map((location, index) => (
          <Box
            key={index}
            position="absolute"
            top={`${30 + (index * 15) % 60}%`}
            left={`${20 + (index * 20) % 70}%`}
            transform="translate(-50%, -50%)"
          >
            <Box
              width="12px"
              height="12px"
              borderRadius="full"
              bg={location.type === 'pickup' ? 'blue.500' : 'green.500'}
              border="2px solid"
              borderColor="bg.surface"
              boxShadow="0 2px 4px rgba(0,0,0,0.2)"
              position="relative"
            >
              {/* Pulse animation for active jobs */}
              <Box
                position="absolute"
                top="-4px"
                left="-4px"
                width="20px"
                height="20px"
                borderRadius="full"
                bg={location.type === 'pickup' ? 'blue.500' : 'green.500'}
                opacity="0.3"
                animation="pulse 2s infinite"
              />
            </Box>
            
            {/* Job reference tooltip */}
            <Box
              position="absolute"
              top="16px"
              left="50%"
              transform="translateX(-50%)"
              bg="bg.surface"
              px={2}
              py={1}
              borderRadius="md"
              fontSize="xs"
              fontWeight="bold"
              boxShadow="0 2px 4px rgba(0,0,0,0.1)"
              whiteSpace="nowrap"
              zIndex={10}
            >
              {location.jobRef}
            </Box>
          </Box>
        ))}

        {/* Driver markers */}
        {activeJobs.slice(0, 3).map((job, index) => (
          <Box
            key={`driver-${index}`}
            position="absolute"
            top={`${40 + (index * 20) % 50}%`}
            left={`${40 + (index * 25) % 60}%`}
            transform="translate(-50%, -50%)"
          >
            <Box
              width="16px"
              height="16px"
              borderRadius="full"
              bg="orange.500"
              border="3px solid"
              borderColor="bg.surface"
              boxShadow="0 2px 6px rgba(0,0,0,0.3)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FiTruck size={8} color="dark.900" />
            </Box>
            
            {/* Driver name tooltip */}
            <Box
              position="absolute"
              top="20px"
              left="50%"
              transform="translateX(-50%)"
              bg="bg.surface"
              px={2}
              py={1}
              borderRadius="md"
              fontSize="xs"
              fontWeight="medium"
              boxShadow="0 2px 4px rgba(0,0,0,0.1)"
              whiteSpace="nowrap"
              zIndex={10}
            >
              {job.driver}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Map controls overlay */}
      {showControls && (
        <Box
          position="absolute"
          top={4}
          right={4}
          bg="bg.surface"
          borderRadius="md"
          p={2}
          boxShadow="0 2px 8px rgba(0,0,0,0.1)"
        >
          <VStack spacing={1} align="stretch">
            <HStack spacing={2}>
              <Box width="8px" height="8px" borderRadius="full" bg="blue.500" />
              <Text fontSize="xs">Pickup</Text>
            </HStack>
            <HStack spacing={2}>
              <Box width="8px" height="8px" borderRadius="full" bg="green.500" />
              <Text fontSize="xs">Dropoff</Text>
            </HStack>
            <HStack spacing={2}>
              <Box width="8px" height="8px" borderRadius="full" bg="orange.500" />
              <Text fontSize="xs">Driver</Text>
            </HStack>
          </VStack>
        </Box>
      )}

      {/* Status overlay */}
      <Box
        position="absolute"
        bottom={4}
        left={4}
        bg="bg.surface"
        borderRadius="md"
        p={3}
        boxShadow="0 2px 8px rgba(0,0,0,0.1)"
      >
        <VStack spacing={1} align="start">
          <HStack spacing={2}>
            <FiNavigation size={16} color="#3182CE" />
            <Text fontSize="sm" fontWeight="medium">
              {activeJobs.length} Active Jobs
            </Text>
          </HStack>
          <Text fontSize="xs" color="text.tertiary">
            Real-time tracking enabled
          </Text>
        </VStack>
      </Box>

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.1;
          }
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
        }
      `}</style>
    </Box>
  );
}
