'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

// Extend Window interface for Mapbox
declare global {
  interface Window {
    mapboxgl: any;
  }
}
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaTruck, FaRoute, FaPhone, FaSync } from 'react-icons/fa';

// Type definitions
interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  postcode?: string;
}

interface DriverLocation extends Location {
  timestamp?: string;
}

interface TrackingData {
  booking: {
    id: string;
    reference: string;
    status: string;
    scheduledAt: string;
  };
  driver?: {
    id: string;
    name: string;
    phone?: string;
    currentLocation?: DriverLocation;
    isOnline: boolean;
  };
  locations: {
    pickup: Location;
    dropoff: Location;
  };
  tracking: {
    status: string;
    currentDestination?: {
      type: 'pickup' | 'dropoff';
      address: Location;
      label: string;
    };
    estimatedArrival?: string;
    lastUpdate: string;
  };
  timeline: Array<{
    status: string;
    title: string;
    timestamp?: string;
    completed: boolean;
  }>;
}

interface LiveTrackingMapProps {
  bookingReference: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onTrackingUpdate?: (data: TrackingData) => void;
}

export default function LiveTrackingMap({
  bookingReference,
  autoRefresh = true,
  refreshInterval = 10000, // 10 seconds
  onTrackingUpdate
}: LiveTrackingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [mapboxLoaded, setMapboxLoaded] = useState(false);

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Load Mapbox GL JS dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.mapboxgl) {
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.js';
      script.onload = () => setMapboxLoaded(true);
      document.head.appendChild(script);
    } else if (window.mapboxgl) {
      setMapboxLoaded(true);
    }
  }, []);

  // Fetch tracking data
  const fetchTrackingData = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/customer/tracking/${bookingReference}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tracking data');
      }

      const result = await response.json();
      const data = result.data as TrackingData;
      
      setTrackingData(data);
      setLastUpdate(new Date());
      
      if (onTrackingUpdate) {
        onTrackingUpdate(data);
      }

    } catch (err) {
      console.error('Tracking fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  }, [bookingReference, onTrackingUpdate]);

  // Initialize map
  const initializeMap = useCallback(async () => {
    if (!mapboxLoaded || !mapContainer.current || !trackingData || mapRef.current) return;

    try {
      const mapboxgl = window.mapboxgl;
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

      // Calculate bounds to fit all locations
      const bounds = new mapboxgl.LngLatBounds();
      
      // Add pickup and dropoff locations to bounds
      bounds.extend([trackingData.locations.pickup.longitude, trackingData.locations.pickup.latitude]);
      bounds.extend([trackingData.locations.dropoff.longitude, trackingData.locations.dropoff.latitude]);
      
      // Add driver location if available
      if (trackingData.driver?.currentLocation) {
        bounds.extend([
          trackingData.driver.currentLocation.longitude,
          trackingData.driver.currentLocation.latitude
        ]);
      }

      // Initialize map
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/navigation-night-v1',
        bounds: bounds,
        fitBoundsOptions: {
          padding: 50,
          maxZoom: 16
        }
      });

      mapRef.current.on('load', () => {
        addMarkersAndRoute();
      });

    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Failed to initialize map');
    }
  }, [mapboxLoaded, trackingData]);

  // Add markers and route to map
  const addMarkersAndRoute = useCallback(() => {
    if (!mapRef.current || !trackingData) return;

    const mapboxgl = window.mapboxgl;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.custom-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add pickup marker
    const pickupMarker = document.createElement('div');
    pickupMarker.className = 'custom-marker';
    pickupMarker.innerHTML = '📍';
    pickupMarker.style.fontSize = '24px';
    
    new mapboxgl.Marker(pickupMarker)
      .setLngLat([trackingData.locations.pickup.longitude, trackingData.locations.pickup.latitude])
      .setPopup(new mapboxgl.Popup().setHTML(`
        <div>
          <h4>Pickup Location</h4>
          <p>${trackingData.locations.pickup.address}</p>
        </div>
      `))
      .addTo(mapRef.current);

    // Add dropoff marker
    const dropoffMarker = document.createElement('div');
    dropoffMarker.className = 'custom-marker';
    dropoffMarker.innerHTML = '🏁';
    dropoffMarker.style.fontSize = '24px';
    
    new mapboxgl.Marker(dropoffMarker)
      .setLngLat([trackingData.locations.dropoff.longitude, trackingData.locations.dropoff.latitude])
      .setPopup(new mapboxgl.Popup().setHTML(`
        <div>
          <h4>Delivery Location</h4>
          <p>${trackingData.locations.dropoff.address}</p>
        </div>
      `))
      .addTo(mapRef.current);

    // Add driver marker if location is available
    if (trackingData.driver?.currentLocation) {
      const driverMarker = document.createElement('div');
      driverMarker.className = 'custom-marker driver-marker';
      driverMarker.innerHTML = '🚚';
      driverMarker.style.fontSize = '28px';
      driverMarker.style.animation = 'pulse 2s infinite';
      
      new mapboxgl.Marker(driverMarker)
        .setLngLat([
          trackingData.driver.currentLocation.longitude,
          trackingData.driver.currentLocation.latitude
        ])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div>
            <h4>Driver: ${trackingData.driver.name}</h4>
            <p>Status: ${trackingData.driver.isOnline ? 'Online' : 'Offline'}</p>
            <p>Last update: ${trackingData.driver.currentLocation.timestamp ? 
              new Date(trackingData.driver.currentLocation.timestamp).toLocaleTimeString() : 
              'Unknown'
            }</p>
          </div>
        `))
        .addTo(mapRef.current);
    }

    // Add route line if we have driver location
    if (trackingData.driver?.currentLocation && trackingData.tracking.currentDestination) {
      const destination = trackingData.tracking.currentDestination.address;
      
      // Simple straight line route (in production, you'd use Mapbox Directions API)
      const routeCoordinates = [
        [trackingData.driver.currentLocation.longitude, trackingData.driver.currentLocation.latitude],
        [destination.longitude, destination.latitude]
      ];

      // Add route line
      if (mapRef.current.getSource('route')) {
        mapRef.current.removeLayer('route-line');
        mapRef.current.removeSource('route');
      }

      mapRef.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
          }
        }
      });

      mapRef.current.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#00ff88',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });
    }
  }, [trackingData]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchTrackingData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchTrackingData]);

  // Initial data fetch
  useEffect(() => {
    fetchTrackingData();
  }, [fetchTrackingData]);

  // Initialize map when data and mapbox are ready
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Update map when tracking data changes
  useEffect(() => {
    if (mapRef.current && trackingData) {
      addMarkersAndRoute();
    }
  }, [trackingData, addMarkersAndRoute]);

  if (loading) {
    return (
      <Card bg={cardBg} borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} py={8}>
            <Spinner size="xl" color="blue.500" />
            <Text>Loading live tracking...</Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card bg={cardBg} borderColor={borderColor}>
        <CardBody>
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
            <Button ml={3} size="sm" onClick={fetchTrackingData}>
              Retry
            </Button>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  if (!trackingData) {
    return (
      <Card bg={cardBg} borderColor={borderColor}>
        <CardBody>
          <Text>No tracking data available</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {/* Tracking Status Header */}
      <Card bg={cardBg} borderColor={borderColor}>
        <CardHeader pb={2}>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading size="md">Live Tracking</Heading>
              <Text fontSize="sm" color="gray.600">
                Order: {trackingData.booking.reference}
              </Text>
            </VStack>
            <VStack align="end" spacing={1}>
              <Badge
                colorScheme={trackingData.driver?.isOnline ? 'green' : 'gray'}
                size="lg"
                px={3}
                py={1}
              >
                {trackingData.driver ? 
                  (trackingData.driver.isOnline ? '🟢 Driver Online' : '⚫ Driver Offline') : 
                  '⏳ Awaiting Driver'
                }
              </Badge>
              <Text fontSize="xs" color="gray.500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </Text>
            </VStack>
          </HStack>
        </CardHeader>
      </Card>

      {/* Driver Info */}
      {trackingData.driver && (
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <HStack>
                  <Icon as={FaTruck} color="blue.500" boxSize={5} />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="semibold">{trackingData.driver.name}</Text>
                    <Text fontSize="sm" color="gray.600">Your Driver</Text>
                  </VStack>
                </HStack>
                {trackingData.driver.phone && (
                  <Button
                    leftIcon={<FaPhone />}
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => window.open(`tel:${trackingData.driver?.phone}`, '_self')}
                  >
                    Call
                  </Button>
                )}
              </HStack>
              
              {trackingData.tracking.currentDestination && (
                <HStack>
                  <Icon as={FaRoute} color="green.500" boxSize={4} />
                  <Text fontSize="sm">{trackingData.tracking.currentDestination.label}</Text>
                  {trackingData.tracking.estimatedArrival && (
                    <Badge colorScheme="green" size="sm">
                      ETA: {trackingData.tracking.estimatedArrival}
                    </Badge>
                  )}
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Live Map */}
      <Card bg={cardBg} borderColor={borderColor}>
        <CardBody p={0}>
          <Box
            ref={mapContainer}
            width="100%"
            height="400px"
            borderRadius="lg"
            overflow="hidden"
            position="relative"
          />
          <Box p={4}>
            <HStack justify="space-between" align="center">
              <Text fontSize="sm" color="gray.600">
                🚚 Live driver location • 📍 Pickup • 🏁 Delivery
              </Text>
              <Button
                leftIcon={<FaSync />}
                size="sm"
                variant="ghost"
                onClick={fetchTrackingData}
                isLoading={loading}
              >
                Refresh
              </Button>
            </HStack>
          </Box>
        </CardBody>
      </Card>

      {/* Tracking Timeline */}
      <Card bg={cardBg} borderColor={borderColor}>
        <CardHeader>
          <Heading size="sm">Delivery Progress</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            {trackingData.timeline.map((item, index) => (
              <HStack key={item.status} spacing={3}>
                <Box
                  w={4}
                  h={4}
                  borderRadius="full"
                  bg={item.completed ? 'green.500' : 'gray.300'}
                  flexShrink={0}
                />
                <VStack align="start" spacing={0} flex={1}>
                  <Text 
                    fontWeight={item.completed ? 'semibold' : 'normal'}
                    color={item.completed ? 'green.600' : 'gray.600'}
                  >
                    {item.title}
                  </Text>
                  {item.timestamp && (
                    <Text fontSize="xs" color="gray.500">
                      {new Date(item.timestamp).toLocaleString()}
                    </Text>
                  )}
                </VStack>
              </HStack>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}

// Add pulse animation styles
const styles = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}