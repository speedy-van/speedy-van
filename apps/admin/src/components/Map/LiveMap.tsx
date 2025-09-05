'use client';
import mapboxgl, { Map } from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiNavigation, FiMapPin, FiHome, FiTruck } from 'react-icons/fi';

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

interface DriverLocation {
  driverId: string;
  driverName: string;
  lat: number;
  lng: number;
  lastUpdate: string;
  status: string;
}

interface TrackingBooking {
  id: string;
  reference: string;
  status: string;
  addresses: {
    pickup: {
      label: string;
      postcode: string;
      coordinates: { lat: number; lng: number };
    };
    dropoff: {
      label: string;
      postcode: string;
      coordinates: { lat: number; lng: number };
    };
  };
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  routeProgress: number;
  eta?: {
    estimatedArrival: string;
    minutesRemaining: number;
  };
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
  // New props for enhanced tracking
  driverLocations?: DriverLocation[];
  selectedBooking?: TrackingBooking | null;
  showAllDrivers?: boolean;
  showRoutePath?: boolean;
  trackingPings?: Array<{
    lat: number;
    lng: number;
    createdAt: string;
  }>;
}

export default function LiveMap({
  driverLocation,
  pickupLocation,
  dropoffLocation,
  route,
  showNavigation = false,
  onNavigateToPickup,
  onNavigateToDropoff,
  height = 360,
  driverLocations = [],
  selectedBooking,
  showAllDrivers = false,
  showRoutePath = false,
  trackingPings = [],
}: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const instance = useRef<Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const routeSource = useRef<string | null>(null);
  const trackingPathSource = useRef<string | null>(null);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (!mapRef.current || instance.current) return;

    instance.current = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: pickupLocation
        ? [pickupLocation.lng, pickupLocation.lat]
        : [-0.118092, 51.509865], // London default
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

    // Add driver marker (single booking view)
    if (driverLocation) {
      const driverEl = document.createElement('div');
      driverEl.style.width = '24px';
      driverEl.style.height = '24px';
      driverEl.style.borderRadius = '50%';
      driverEl.style.background = '#3182ce';
      driverEl.style.border = '3px solid white';
      driverEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      driverEl.style.transform = 'translate(-50%, -50%)';

      const marker = new mapboxgl.Marker({ element: driverEl })
        .setLngLat([driverLocation.lng, driverLocation.lat])
        .addTo(map);

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <strong>Driver Location</strong><br>
            ${driverLocation.label || 'Current position'}
          </div>
        `);

      marker.setPopup(popup);
      markers.current.driver = marker;
    }

    // Add multiple driver markers (admin view)
    if (showAllDrivers && driverLocations.length > 0) {
      driverLocations.forEach((driver, index) => {
        const driverEl = document.createElement('div');
        driverEl.style.width = '20px';
        driverEl.style.height = '20px';
        driverEl.style.borderRadius = '50%';
        driverEl.style.background =
          driver.status === 'online' ? '#38a169' : '#e53e3e';
        driverEl.style.border = '2px solid white';
        driverEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        driverEl.style.transform = 'translate(-50%, -50%)';

        const marker = new mapboxgl.Marker({ element: driverEl })
          .setLngLat([driver.lng, driver.lat])
          .addTo(map);

        // Add popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px;">
              <strong>${driver.driverName}</strong><br>
              Status: ${driver.status}<br>
              Last update: ${new Date(driver.lastUpdate).toLocaleTimeString()}
            </div>
          `);

        marker.setPopup(popup);
        markers.current[`driver-${driver.driverId}`] = marker;
      });
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

      const marker = new mapboxgl.Marker({ element: pickupEl })
        .setLngLat([pickupLocation.lng, pickupLocation.lat])
        .addTo(map);

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <strong>Pickup Location</strong><br>
            ${pickupLocation.label || 'Pickup address'}
          </div>
        `);

      marker.setPopup(popup);
      markers.current.pickup = marker;
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

      const marker = new mapboxgl.Marker({ element: dropoffEl })
        .setLngLat([dropoffLocation.lng, dropoffLocation.lat])
        .addTo(map);

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <strong>Dropoff Location</strong><br>
            ${dropoffLocation.label || 'Dropoff address'}
          </div>
        `);

      marker.setPopup(popup);
      markers.current.dropoff = marker;
    }

    // Add selected booking marker (admin view)
    if (selectedBooking?.currentLocation) {
      const bookingEl = document.createElement('div');
      bookingEl.style.width = '28px';
      bookingEl.style.height = '28px';
      bookingEl.style.borderRadius = '50%';
      bookingEl.style.background = '#805ad5';
      bookingEl.style.border = '3px solid white';
      bookingEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      bookingEl.style.transform = 'translate(-50%, -50%)';

      const marker = new mapboxgl.Marker({ element: bookingEl })
        .setLngLat([
          selectedBooking.currentLocation.lng,
          selectedBooking.currentLocation.lat,
        ])
        .addTo(map);

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <strong>Booking: ${selectedBooking.reference}</strong><br>
            Status: ${selectedBooking.status}<br>
            Progress: ${selectedBooking.routeProgress}%<br>
            ${selectedBooking.eta ? `ETA: ${selectedBooking.eta.minutesRemaining} min` : ''}
          </div>
        `);

      marker.setPopup(popup);
      markers.current.selectedBooking = marker;
    }
  }, [
    driverLocation,
    pickupLocation,
    dropoffLocation,
    driverLocations,
    selectedBooking,
    showAllDrivers,
    isMapLoaded,
  ]);

  // Update route when route data changes
  useEffect(() => {
    if (!instance.current || !isMapLoaded || !route) return;

    const map = instance.current;

    // Remove existing route
    if (routeSource.current) {
      if (map.getSource(routeSource.current)) {
        map.removeLayer(`${routeSource.current}-line`);
        map.removeSource(routeSource.current);
      }
    }

    // Add new route
    routeSource.current = `route-${Date.now()}`;

    map.addSource(routeSource.current, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route.coordinates,
        },
      },
    });

    map.addLayer({
      id: `${routeSource.current}-line`,
      type: 'line',
      source: routeSource.current,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#3182ce',
        'line-width': 4,
        'line-opacity': 0.8,
      },
    });
  }, [route, isMapLoaded]);

  // Add tracking path (breadcrumb trail)
  useEffect(() => {
    if (
      !instance.current ||
      !isMapLoaded ||
      !showRoutePath ||
      trackingPings.length === 0
    )
      return;

    const map = instance.current;

    // Remove existing tracking path
    if (trackingPathSource.current) {
      if (map.getSource(trackingPathSource.current)) {
        map.removeLayer(`${trackingPathSource.current}-line`);
        map.removeSource(trackingPathSource.current);
      }
    }

    // Add tracking path
    trackingPathSource.current = `tracking-path-${Date.now()}`;

    const coordinates = trackingPings.map(ping => [ping.lng, ping.lat]);

    map.addSource(trackingPathSource.current, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates,
        },
      },
    });

    map.addLayer({
      id: `${trackingPathSource.current}-line`,
      type: 'line',
      source: trackingPathSource.current,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#805ad5',
        'line-width': 3,
        'line-opacity': 0.6,
        'line-dasharray': [2, 2],
      },
    });
  }, [trackingPings, showRoutePath, isMapLoaded]);

  // Fit bounds when locations change
  useEffect(() => {
    if (!instance.current || !isMapLoaded) return;

    const map = instance.current;
    const bounds = new mapboxgl.LngLatBounds();

    // Add all relevant locations to bounds
    if (driverLocation) {
      bounds.extend([driverLocation.lng, driverLocation.lat]);
    }
    if (pickupLocation) {
      bounds.extend([pickupLocation.lng, pickupLocation.lat]);
    }
    if (dropoffLocation) {
      bounds.extend([dropoffLocation.lng, dropoffLocation.lat]);
    }
    if (selectedBooking?.currentLocation) {
      bounds.extend([
        selectedBooking.currentLocation.lng,
        selectedBooking.currentLocation.lat,
      ]);
    }
    if (showAllDrivers && driverLocations.length > 0) {
      driverLocations.forEach(driver => {
        bounds.extend([driver.lng, driver.lat]);
      });
    }

    // Fit map to bounds with padding
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
      });
    }
  }, [
    driverLocation,
    pickupLocation,
    dropoffLocation,
    selectedBooking,
    driverLocations,
    showAllDrivers,
    isMapLoaded,
  ]);

  return (
    <Box
      position="relative"
      height={height}
      borderRadius="md"
      overflow="hidden"
    >
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {showNavigation && (
        <Box position="absolute" top={4} sx={{ right: '16px' }} zIndex={1}>
          <VStack spacing={2}>
            {onNavigateToPickup && (
              <Button
                size="sm"
                colorScheme="green"
                leftIcon={<FiMapPin />}
                onClick={onNavigateToPickup}
              >
                Navigate to Pickup
              </Button>
            )}
            {onNavigateToDropoff && (
              <Button
                size="sm"
                colorScheme="red"
                leftIcon={<FiHome />}
                onClick={onNavigateToDropoff}
              >
                Navigate to Dropoff
              </Button>
            )}
          </VStack>
        </Box>
      )}

      {/* Legend for admin view */}
      {showAllDrivers && (
        <Box
          position="absolute"
          bottom={4}
          left={4}
          zIndex={1}
          bg="white"
          p={3}
          borderRadius="md"
          boxShadow="md"
        >
          <VStack spacing={2} align="start">
            <Text fontSize="sm" fontWeight="bold">
              Legend
            </Text>
            <HStack spacing={2}>
              <Box w={3} h={3} bg="#38a169" borderRadius="full" />
              <Text fontSize="xs">Online Driver</Text>
            </HStack>
            <HStack spacing={2}>
              <Box w={3} h={3} bg="#e53e3e" borderRadius="full" />
              <Text fontSize="xs">Offline Driver</Text>
            </HStack>
            <HStack spacing={2}>
              <Box w={3} h={3} bg="#805ad5" borderRadius="full" />
              <Text fontSize="xs">Selected Booking</Text>
            </HStack>
          </VStack>
        </Box>
      )}
    </Box>
  );
}
