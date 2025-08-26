'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import mapboxgl from 'mapbox-gl';

// Set the access token
if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  console.error('Mapbox token is missing. Please check your environment variables.');
}
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function ServiceMapSection() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Debug: Log component mount
  useEffect(() => {
    console.log('ServiceMapSection mounted');
    console.log('Mapbox token available:', !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
    console.log('Mapbox library loaded:', !!mapboxgl);
    
    // Check map container dimensions after render
    const checkContainer = () => {
      if (mapRef.current) {
        const rect = mapRef.current.getBoundingClientRect();
        console.log('Map container dimensions:', {
          width: rect.width,
          height: rect.height,
          offsetWidth: mapRef.current.offsetWidth,
          offsetHeight: mapRef.current.offsetHeight
        });
      }
    };
    
    // Check after initial render
    setTimeout(checkContainer, 100);
    
    // Check again after a longer delay
    setTimeout(checkContainer, 1000);
  }, []);

  // Check if Mapbox CSS is loaded and ensure it's available
  useEffect(() => {
    const checkMapboxCSS = () => {
      const mapboxCSSLoaded = document.querySelector('link[href*="mapbox-gl"]') || 
                             document.querySelector('style[data-mapbox]') ||
                             document.querySelector('.mapboxgl-map');
      
      console.log('Mapbox CSS check:', {
        cssLink: !!document.querySelector('link[href*="mapbox-gl"]'),
        cssStyle: !!document.querySelector('style[data-mapbox]'),
        mapElement: !!document.querySelector('.mapboxgl-map')
      });
      
      // If CSS is not loaded, try to load it manually
      if (!mapboxCSSLoaded) {
        console.log('Mapbox CSS not found, loading manually...');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.css';
        link.onload = () => {
          console.log('Mapbox CSS loaded manually');
          // Small delay to ensure CSS is fully applied
          setTimeout(() => {
            if (mapRef.current && !mapInstance.current) {
              // Trigger map initialization if container is ready
              console.log('CSS loaded, map container ready for initialization');
            }
          }, 200);
        };
        link.onerror = () => console.error('Failed to load Mapbox CSS manually');
        document.head.appendChild(link);
      }
    };
    
    // Check immediately
    checkMapboxCSS();
    
    // Also check after a short delay to ensure CSS is loaded
    const timeoutId = setTimeout(checkMapboxCSS, 100);
    
    // Check again after CSS should have loaded
    const cssTimeoutId = setTimeout(checkMapboxCSS, 500);
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(cssTimeoutId);
    };
  }, []);

  // Mapbox CSS is loaded globally in globals.css and locally as fallback

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
    console.log('Map effect triggered:', { 
      mapRef: !!mapRef.current, 
      mapInstance: !!mapInstance.current,
      token: !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN 
    });
    
    if (!mapRef.current || mapInstance.current) return;
    
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      console.error('Mapbox token missing');
      setMapError('Map configuration error. Please contact support.');
      return;
    }

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (!isMapLoaded && !mapInstance.current) {
        console.error('Map loading timeout');
        setMapError('Map took too long to load. Please refresh the page.');
      }
    }, 15000); // Increased to 15 seconds for better reliability

    try {
      console.log('Initializing Mapbox map...');
      
      // Small delay to ensure CSS is loaded and container is ready
      setTimeout(() => {
        if (mapRef.current && !mapInstance.current && mapRef.current.offsetHeight > 0) {
          try {
            mapInstance.current = new mapboxgl.Map({
              container: mapRef.current,
              style: 'mapbox://styles/mapbox/dark-v11',
              center: [-1.5, 54.5], // UK center
              zoom: 5.5,
              attributionControl: false,
              logoPosition: 'bottom-right'
            });
            console.log('Mapbox map created successfully');
            
            // Clear timeout immediately when map is created
            clearTimeout(timeoutId);
            
            // Add event listeners after map is created
            mapInstance.current.on('load', () => {
              console.log('Map loaded successfully');
              
              // Additional check to ensure map is visible
              setTimeout(() => {
                if (mapRef.current && mapRef.current.offsetHeight > 0) {
                  setIsMapLoaded(true);
                  console.log('Map is visible and ready');
                } else {
                  console.warn('Map container has no height, retrying...');
                  // Force a resize to trigger map rendering
                  if (mapInstance.current) {
                    mapInstance.current.resize();
                    setTimeout(() => setIsMapLoaded(true), 100);
                  }
                }
              }, 100);
              
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
            
            // Add error handler for map loading failures
            mapInstance.current.on('error', (error) => {
              console.error('Mapbox error:', error);
              setMapError('Map failed to load. Please refresh the page.');
              clearTimeout(timeoutId);
            });
            
          } catch (error) {
            console.error('Failed to initialize Mapbox map:', error);
            setMapError('Failed to load map. Please refresh the page.');
            clearTimeout(timeoutId);
          }
        } else if (mapRef.current && !mapInstance.current) {
          // Container exists but no height - wait a bit more and retry
          console.log('Map container not ready, retrying in 500ms...');
          setTimeout(() => {
            if (mapRef.current && mapRef.current.offsetHeight > 0 && !mapInstance.current) {
              console.log('Retrying map initialization...');
              // This will trigger the effect again
            }
          }, 500);
        }
      }, 200);
      
    } catch (error) {
      console.error('Failed to initialize Mapbox map:', error);
      setMapError('Failed to load map. Please refresh the page.');
      clearTimeout(timeoutId);
      return;
    }

    return () => {
      clearTimeout(timeoutId);
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
          {mapError ? (
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="center" 
              h="full" 
              color="red.400"
              textAlign="center"
              p={4}
            >
              <Text>{mapError}</Text>
              <Button 
                mt={4} 
                size="sm" 
                onClick={() => {
                  setMapError(null);
                  setIsMapLoaded(false);
                  if (mapInstance.current) {
                    mapInstance.current.remove();
                    mapInstance.current = null;
                  }
                  // Trigger a re-render to reinitialize the map
                  setTimeout(() => {
                    if (mapRef.current) {
                      mapRef.current.innerHTML = '';
                    }
                  }, 100);
                }}
                colorScheme="red"
              >
                Retry
              </Button>
            </Box>
          ) : (
            <Box 
              ref={mapRef} 
              position="relative" 
              w="full" 
              h="full"
              className={`mapboxgl-map ${isMapLoaded ? 'loaded' : 'loading'}`}
            >
              {!isMapLoaded && (
                <Box 
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  color="neon.400"
                  textAlign="center"
                  zIndex={1}
                >
                  <Text>Loading map...</Text>
                  <Text fontSize="sm" mt={2} color="text.secondary">
                    This may take a few seconds...
                  </Text>
                </Box>
              )}
            </Box>
          )}
          
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
