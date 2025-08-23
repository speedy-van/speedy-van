"use client";

import { useEffect, useRef, useState } from 'react';
import { queueLocationUpdate } from '@/lib/offline';

interface LocationTrackerProps {
  isOnline: boolean;
  hasConsent: boolean;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

export default function LocationTracker({ isOnline, hasConsent, onLocationUpdate }: LocationTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !navigator?.geolocation) {
      return;
    }

    if (!isOnline || !hasConsent) {
      stopTracking();
      return;
    }

    startTracking();
  }, [isOnline, hasConsent]);

  const startTracking = () => {
    if (watchIdRef.current) {
      return; // Already tracking
    }

    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !navigator?.geolocation) {
      setError('Geolocation not available');
      return;
    }

    setIsTracking(true);
    setError(null);

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const now = Date.now();
          // Only update if it's been at least 30 seconds since last update
          if (now - lastUpdateRef.current > 30000) {
            lastUpdateRef.current = now;
            
            // Call the callback if provided
            if (onLocationUpdate) {
              onLocationUpdate(position.coords.latitude, position.coords.longitude);
            }

            // Also send to the API
            sendLocationToAPI(position.coords.latitude, position.coords.longitude);
          }
        },
        (error) => {
          console.error('Location tracking error:', error);
          setError(getLocationErrorMessage(error.code));
          setIsTracking(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } catch (err) {
      console.error('Failed to start location tracking:', err);
      setError('Failed to start location tracking');
      setIsTracking(false);
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current && typeof window !== 'undefined' && navigator?.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setError(null);
  };

  const sendLocationToAPI = async (latitude: number, longitude: number) => {
    try {
      // Use offline-aware location update
      await queueLocationUpdate(latitude, longitude);
    } catch (err) {
      console.error('Error sending location to API:', err);
    }
  };

  const getLocationErrorMessage = (code: number): string => {
    switch (code) {
      case 1:
        return 'Location access denied. Please enable location permissions.';
      case 2:
        return 'Location unavailable. Please check your GPS settings.';
      case 3:
        return 'Location request timed out. Please try again.';
      default:
        return 'Unknown location error occurred.';
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}
