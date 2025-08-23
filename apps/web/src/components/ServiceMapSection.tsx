'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import mapboxgl from 'mapbox-gl';

// Set the access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function ServiceMapSection() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Ensure Mapbox CSS is loaded
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.css';
    link.type = 'text/css';
    document.head.appendChild(link);

    return () => {
      const existingLink = document.querySelector('link[href*="mapbox-gl.css"]');
      if (existingLink) {
        existingLink.remove();
      }
    };
  }, []);

  useEffect(() => {
    // Add JSON-LD structured data for SEO
    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Speedy Van",
      "url": "https://speedyvan.co.uk",
      "image": "https://speedyvan.co.uk/og/cover.png",
      "description": "Speedy Van offers premium man and van services across the UK with real-time tracking and neon-dark experience.",
      "areaServed": [
        "London",
        "Manchester",
        "Birmingham",
        "Glasgow",
        "Edinburgh",
        "Leeds",
        "Liverpool",
        "Sheffield",
        "Newcastle",
        "Nottingham",
        "Bristol",
        "Cardiff",
        "Inverness"
      ],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "UK"
      }
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify(schema);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize the map
    mapInstance.current = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-1.5, 54.5], // UK center
      zoom: 5.5,
      attributionControl: false,
      logoPosition: 'bottom-right'
    });

    mapInstance.current.on('load', () => {
      setIsMapLoaded(true);
      
      // Add service area markers for major UK cities
      const cities = [
        { name: 'London', lng: -0.118092, lat: 51.509865 },
        { name: 'Manchester', lng: -2.242631, lat: 53.480759 },
        { name: 'Birmingham', lng: -1.890401, lat: 52.486243 },
        { name: 'Glasgow', lng: -4.251433, lat: 55.864237 },
        { name: 'Edinburgh', lng: -3.188267, lat: 55.953252 },
        { name: 'Leeds', lng: -1.549077, lat: 53.800755 },
        { name: 'Liverpool', lng: -2.587910, lat: 53.408371 },
        { name: 'Sheffield', lng: -1.465541, lat: 53.381129 },
        { name: 'Newcastle', lng: -1.617780, lat: 54.978252 },
        { name: 'Nottingham', lng: -1.149309, lat: 52.954783 },
        { name: 'Bristol', lng: -2.587910, lat: 51.454513 },
        { name: 'Cardiff', lng: -3.179090, lat: 51.481583 },
        { name: 'Inverness', lng: -4.224721, lat: 57.477773 }
      ];

      cities.forEach(city => {
        // Create custom marker element
        const markerEl = document.createElement('div');
        markerEl.style.width = '12px';
        markerEl.style.height = '12px';
        markerEl.style.borderRadius = '50%';
        markerEl.style.background = '#00C2FF';
        markerEl.style.border = '2px solid #FFFFFF';
        markerEl.style.boxShadow = '0 0 10px rgba(0, 194, 255, 0.5)';
        markerEl.style.transform = 'translate(-50%, -50%)';
        markerEl.style.cursor = 'pointer';

        // Add hover effect
        markerEl.addEventListener('mouseenter', () => {
          markerEl.style.transform = 'translate(-50%, -50%) scale(1.2)';
          markerEl.style.boxShadow = '0 0 15px rgba(0, 194, 255, 0.8)';
        });

        markerEl.addEventListener('mouseleave', () => {
          markerEl.style.transform = 'translate(-50%, -50%) scale(1)';
          markerEl.style.boxShadow = '0 0 10px rgba(0, 194, 255, 0.5)';
        });

        // Create and add marker
        new mapboxgl.Marker(markerEl)
          .setLngLat([city.lng, city.lat])
          .addTo(mapInstance.current!);
      });
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <Box as="section" py={20} textAlign="center" bg="bg.canvas">
      <VStack spacing={8} maxW="6xl" mx="auto" px={4}>
        <Heading 
          size="2xl" 
          mb={4} 
          bgGradient="linear(to-r, neon.400, neon.500, neon.600)" 
          bgClip="text"
          fontWeight="bold"
        >
          Nationwide Coverage
        </Heading>
        
        <Text 
          fontSize="xl" 
          color="text.secondary" 
          maxW="800px" 
          mx="auto" 
          mb={12}
          lineHeight="tall"
        >
          Speedy Van operates across major UK cities including London, Manchester, Birmingham, 
          Glasgow, Edinburgh, Leeds, Liverpool, Sheffield, Newcastle, Nottingham, Bristol, 
          Cardiff, and beyond — ensuring you can move fast, move right, and stay in control 
          wherever you are.
        </Text>
        
        <Box 
          h={{ base: "300px", md: "400px", lg: "500px" }}
          w="full"
          borderRadius="2xl" 
          overflow="hidden" 
          border="2px solid" 
          borderColor="border.neon"
          boxShadow="neon.glow"
          position="relative"
        >
          {/* Map container */}
          <Box 
            ref={mapRef} 
            position="relative" 
            w="full" 
            h="full"
            className="mapboxgl-map"
          />
          
          {/* Overlay with service cities */}
          <Box
            position="absolute"
            top={4}
            left={4}
            bg="rgba(13, 13, 13, 0.9)"
            backdropFilter="blur(10px)"
            borderRadius="lg"
            p={4}
            border="1px solid"
            borderColor="border.neon"
            maxW="200px"
            textAlign="left"
            zIndex={10}
          >
            <Text fontSize="sm" color="neon.400" fontWeight="semibold" mb={2}>
              Service Cities
            </Text>
            <Text fontSize="xs" color="text.secondary" lineHeight="tall">
              London • Manchester • Birmingham • Glasgow • Edinburgh • Leeds • Liverpool • 
              Sheffield • Newcastle • Nottingham • Bristol • Cardiff • Inverness
            </Text>
          </Box>
        </Box>
        
        {/* Additional coverage information */}
        <Text 
          fontSize="md" 
          color="text.tertiary" 
          maxW="600px" 
          mx="auto"
          lineHeight="tall"
        >
          From the bustling streets of London to the historic lanes of Edinburgh, 
          Speedy Van's network covers over 95% of the UK population with 
          same-day and next-day delivery options available.
        </Text>
      </VStack>
    </Box>
  );
}
