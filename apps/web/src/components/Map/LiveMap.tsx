'use client';
import mapboxgl, { Map } from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import { Box, Button, HStack, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { FiNavigation, FiMapPin, FiHome } from 'react-icons/fi';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface Location {
  lat: number;
  lng: number;
  label?: string;
}

interface Route {
  coordinates: [number, number][];
  distance?: number;
  duration?: number;
}

interface LiveMapProps {
  driverLocation?: Location;
  pickupLocation?: Location;
  dropoffLocation?: Location;
  route?: Route;
  showNavigation?: boolean;
  onNavigateToPickup?: () => void;
  onNavigateToDropoff?: () => void;
  height?: number;
}

export default function LiveMap({ 
  driverLocation, 
  pickupLocation, 
  dropoffLocation, 
  route,
  showNavigation = false,
  onNavigateToPickup,
  onNavigateToDropoff,
  height = 360
}: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const instance = useRef<Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const routeSource = useRef<string | null>(null);
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (!mapRef.current || instance.current) return;

    instance.current = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: pickupLocation ? [pickupLocation.lng, pickupLocation.lat] : [-0.118092, 51.509865], // London default
      zoom: 12,
    });

    instance.current.on('load', () => {
      setIsMapLoaded(true);
    });

    return () => {
      if (instance.current) {
        instance.current.remove();
        instance.current = null;
      }
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!instance.current || !isMapLoaded) return;

    const map = instance.current;

    // Clear existing markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    // Add driver marker
    if (driverLocation) {
      const driverEl = document.createElement('div');
      driverEl.style.width = '20px';
      driverEl.style.height = '20px';
      driverEl.style.borderRadius = '50%';
      driverEl.style.background = '#3182ce';
      driverEl.style.border = '3px solid white';
      driverEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      driverEl.style.transform = 'translate(-50%, -50%)';
      
      markers.current.driver = new mapboxgl.Marker({ element: driverEl })
        .setLngLat([driverLocation.lng, driverLocation.lat])
        .addTo(map);
    }

    // Add pickup marker
    if (pickupLocation) {
      const pickupEl = document.createElement('div');
      pickupEl.style.width = '24px';
      pickupEl.style.height = '24px';
      pickupEl.style.borderRadius = '50%';
      pickupEl.style.background = '#38a169';
      pickupEl.style.border = '3px solid white';
      pickupEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      pickupEl.style.transform = 'translate(-50%, -50%)';
      
      markers.current.pickup = new mapboxgl.Marker({ element: pickupEl })
        .setLngLat([pickupLocation.lng, pickupLocation.lat])
        .addTo(map);
    }

    // Add dropoff marker
    if (dropoffLocation) {
      const dropoffEl = document.createElement('div');
      dropoffEl.style.width = '24px';
      dropoffEl.style.height = '24px';
      dropoffEl.style.borderRadius = '50%';
      dropoffEl.style.background = '#e53e3e';
      dropoffEl.style.border = '3px solid white';
      dropoffEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      dropoffEl.style.transform = 'translate(-50%, -50%)';
      
      markers.current.dropoff = new mapboxgl.Marker({ element: dropoffEl })
        .setLngLat([dropoffLocation.lng, dropoffLocation.lat])
        .addTo(map);
    }

    // Fit map to show all markers
    if (Object.keys(markers.current).length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      Object.values(markers.current).forEach(marker => {
        bounds.extend(marker.getLngLat());
      });
      map.fitBounds(bounds, { padding: 50, maxZoom: 16 });
    }
  }, [driverLocation, pickupLocation, dropoffLocation, isMapLoaded]);

  // Update route when it changes
  useEffect(() => {
    if (!instance.current || !isMapLoaded || !route) return;

    const map = instance.current;
    const routeId = 'route-line';

    // Remove existing route
    if (map.getLayer(routeId)) map.removeLayer(routeId);
    if (map.getSource(routeId)) map.removeSource(routeId);

    // Add new route
    map.addSource(routeId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route.coordinates
        }
      }
    });

    map.addLayer({
      id: routeId,
      type: 'line',
      source: routeId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3182ce',
        'line-width': 4,
        'line-opacity': 0.8
      }
    });

    routeSource.current = routeId;
  }, [route, isMapLoaded]);

  // Update driver location smoothly
  useEffect(() => {
    if (!instance.current || !driverLocation || !markers.current.driver) return;

    const marker = markers.current.driver;
    const newLngLat = [driverLocation.lng, driverLocation.lat] as [number, number];
    
    // Smooth transition for driver marker
    marker.setLngLat(newLngLat);
    
    // Only auto-center if we're not showing navigation controls
    if (!showNavigation) {
      instance.current.easeTo({ 
        center: newLngLat, 
        duration: 1000 
      });
    }
  }, [driverLocation, showNavigation]);

  return (
    <Box position="relative">
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: height, 
          borderRadius: 12,
          border: `1px solid ${borderColor}`
        }} 
      />
      
      {showNavigation && pickupLocation && dropoffLocation && (
        <Box
          position="absolute"
          bottom={4}
          left={4}
          right={4}
          bg={bgColor}
          borderRadius="lg"
          p={4}
          boxShadow="lg"
          border={`1px solid ${borderColor}`}
        >
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="medium" color="gray.600">
                Navigation
              </Text>
              {route && (
                <Text fontSize="sm" color="gray.500">
                  {route.distance ? `${Math.round(route.distance / 1000)}km` : ''}
                  {route.duration ? ` • ${Math.round(route.duration / 60)}min` : ''}
                </Text>
              )}
            </HStack>
            
            <HStack spacing={2}>
              <Button
                size="sm"
                leftIcon={<FiMapPin />}
                colorScheme="green"
                onClick={onNavigateToPickup}
                flex={1}
              >
                To Pickup
              </Button>
              <Button
                size="sm"
                leftIcon={<FiHome />}
                colorScheme="red"
                onClick={onNavigateToDropoff}
                flex={1}
              >
                To Dropoff
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}

      <style>{`
        .mapboxgl-map {
          border-radius: 12px;
        }
      `}</style>
    </Box>
  );
}


