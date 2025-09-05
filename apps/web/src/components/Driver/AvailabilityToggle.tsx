'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Switch,
  Badge,
  Button,
  useToast,
  Spinner,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { FiWifi, FiWifiOff, FiMapPin, FiClock } from 'react-icons/fi';
import { useSession } from 'next-auth/react';

interface AvailabilityToggleProps {
  onStatusChange?: (status: string) => void;
  initialStatus?: string;
}

export default function AvailabilityToggle({
  onStatusChange,
  initialStatus = 'offline',
}: AvailabilityToggleProps) {
  const [isOnline, setIsOnline] = useState(initialStatus === 'online');
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastLocation, setLastLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [lastSeen, setLastSeen] = useState<string>('');
  const toast = useToast();
  const { data: session } = useSession();

  useEffect(() => {
    // Set initial status from props
    setIsOnline(initialStatus === 'online');

    // Fetch current availability status
    fetchCurrentStatus();
  }, [initialStatus]);

  const fetchCurrentStatus = async () => {
    try {
      const response = await fetch('/api/driver/availability');
      if (response.ok) {
        const data = await response.json();
        setIsOnline(data.status === 'online');
        setLastLocation(data.location);
        setLastSeen(data.lastSeenAt);
      }
    } catch (error) {
      console.error('Error fetching availability status:', error);
    }
  };

  const handleToggle = async () => {
    const newStatus = !isOnline ? 'online' : 'offline';
    setIsUpdating(true);

    try {
      // Get current location if going online
      let locationData = null;
      if (newStatus === 'online') {
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000,
              });
            }
          );

          locationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLastLocation(locationData);
        } catch (error) {
          console.warn('Failed to get current location:', error);
          toast({
            title: 'Location Required',
            description: 'Please enable location access to go online',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
          setIsUpdating(false);
          return;
        }
      }

      const response = await fetch('/api/driver/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          location: locationData,
        }),
      });

      if (response.ok) {
        setIsOnline(newStatus === 'online');
        setLastSeen(new Date().toISOString());

        toast({
          title: `You're now ${newStatus}`,
          description:
            newStatus === 'online'
              ? 'You can now receive job notifications'
              : 'You will not receive new job notifications',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        if (onStatusChange) {
          onStatusChange(newStatus);
        }
      } else {
        throw new Error('Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatLastSeen = (timestamp: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" fontSize="lg">
                Driver Status
              </Text>
              <Text fontSize="sm" color="gray.600">
                Control your availability for jobs
              </Text>
            </VStack>
            <Badge
              colorScheme={isOnline ? 'green' : 'gray'}
              size="lg"
              px={3}
              py={1}
              borderRadius="full"
            >
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Badge>
          </HStack>

          {/* Toggle Switch */}
          <HStack
            justify="space-between"
            align="center"
            p={4}
            bg="gray.50"
            borderRadius="lg"
          >
            <HStack spacing={3}>
              <Icon
                as={isOnline ? FiWifi : FiWifiOff}
                color={isOnline ? 'green.500' : 'gray.500'}
                boxSize={5}
              />
              <VStack align="start" spacing={0}>
                <Text fontWeight="medium">
                  {isOnline ? 'Available for Jobs' : 'Not Available'}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {isOnline
                    ? 'You can receive job notifications'
                    : 'You will not receive new jobs'}
                </Text>
              </VStack>
            </HStack>

            <Switch
              isChecked={isOnline}
              onChange={handleToggle}
              isDisabled={isUpdating}
              size="lg"
              colorScheme="green"
            />
          </HStack>

          {/* Status Info */}
          <VStack spacing={3} align="stretch">
            {/* Location Status */}
            <HStack
              justify="space-between"
              p={3}
              bg="blue.50"
              borderRadius="md"
            >
              <HStack spacing={2}>
                <Icon as={FiMapPin} color="blue.500" />
                <Text fontSize="sm">Location</Text>
              </HStack>
              <Text fontSize="sm" fontWeight="medium">
                {lastLocation ? 'Active' : 'Inactive'}
              </Text>
            </HStack>

            {/* Last Seen */}
            <HStack
              justify="space-between"
              p={3}
              bg="purple.50"
              borderRadius="md"
            >
              <HStack spacing={2}>
                <Icon as={FiClock} color="purple.500" />
                <Text fontSize="sm">Last Active</Text>
              </HStack>
              <Text fontSize="sm" fontWeight="medium">
                {formatLastSeen(lastSeen)}
              </Text>
            </HStack>
          </VStack>

          {/* Action Button */}
          <Button
            colorScheme={isOnline ? 'red' : 'green'}
            variant="outline"
            size="sm"
            onClick={handleToggle}
            isLoading={isUpdating}
            loadingText={isOnline ? 'Going Offline...' : 'Going Online...'}
            leftIcon={<Icon as={isOnline ? FiWifiOff : FiWifi} />}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </Button>

          {/* Status Message */}
          {isUpdating && (
            <HStack spacing={2} justify="center" p={2}>
              <Spinner size="sm" />
              <Text fontSize="sm" color="gray.600">
                Updating status...
              </Text>
            </HStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}
