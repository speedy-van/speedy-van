"use client";

import React, { useState, useEffect } from "react";
import { Box, Grid, GridItem, Heading, Text, Stat, StatLabel, StatNumber, StatHelpText, Badge, VStack, HStack, Card, CardBody, Button, Spacer, Alert, AlertIcon, AlertTitle, AlertDescription, useToast, Spinner } from "@chakra-ui/react";
import { requireDriver } from "@/lib/auth";
import LocationTracker from "@/components/Driver/LocationTracker";
import ClaimedJobHandler from "@/components/Driver/ClaimedJobHandler";
import OfflineStatus from "@/components/Driver/OfflineStatus";
import { queueAvailabilityUpdate, offlineFetch } from "@/lib/offline";
import { useRouter } from "next/navigation";

interface DashboardData {
  driver: {
    id: string;
    name: string;
    email: string;
    status: string;
    onboardingStatus: string;
    basePostcode: string;
    vehicleType: string;
  };
  kpis: {
    todayEarnings: number;
    activeJob: any;
    rating: number;
    availability: string;
  };
  alerts: Array<{
    type: string;
    category: string;
    message: string;
    expiresAt?: Date;
  }>;
  shifts: Array<{
    id: string;
    startTime: string;
    endTime: string;
    isRecurring: boolean;
    recurringDays: string[];
    isActive: boolean;
  }>;
  locationStatus: {
    hasConsent: boolean;
    lastSeen?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  availableJobs: Array<{
    id: string;
    reference: string;
    pickupAddress: string;
    dropoffAddress: string;
    scheduledAt: string;
    timeSlot?: string; // Made optional as field removed from schema
    vanSize?: string; // Made optional as field removed from schema
    totalGBP: number;
  }>;
  claimedJob?: any;
}

export default function DriverDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      const response = await fetch('/api/driver/dashboard');
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data received:', data);
        
        // Ensure we have default values for critical fields
        const safeData: DashboardData = {
          ...data,
          driver: {
            id: data.driver?.id || '',
            name: data.driver?.name || 'Driver',
            email: data.driver?.email || '',
            status: data.driver?.status || 'unknown',
            onboardingStatus: data.driver?.onboardingStatus || 'unknown',
            basePostcode: data.driver?.basePostcode || '',
            vehicleType: data.driver?.vehicleType || 'unknown',
          },
          kpis: {
            todayEarnings: data.kpis?.todayEarnings || 0,
            activeJob: data.kpis?.activeJob || null,
            rating: data.kpis?.rating || 0,
            availability: data.kpis?.availability || 'offline',
          },
          alerts: data.alerts || [],
          shifts: data.shifts || [],
          availableJobs: data.availableJobs || [],
          locationStatus: {
            hasConsent: data.locationStatus?.hasConsent || false,
            lastSeen: data.locationStatus?.lastSeen,
            coordinates: data.locationStatus?.coordinates,
          },
          claimedJob: data.claimedJob || null,
        };
        console.log('Safe dashboard data created:', safeData);
        setDashboardData(safeData);
      } else {
        console.error('Dashboard fetch failed:', { status: response.status });
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (newStatus: string) => {
    setUpdatingAvailability(true);
    console.log('Starting availability update:', {
      newStatus,
      currentAvailability: dashboardData?.kpis?.availability,
      dashboardData: dashboardData
    });
    
    try {
      // Get current location if available and consent is given
      let locationData: { lat: number; lng: number } | null = null;
      console.log('Location consent check:', {
        hasGeolocation: !!navigator.geolocation,
        hasConsent: dashboardData?.locationStatus?.hasConsent,
        locationStatus: dashboardData?.locationStatus
      });
      
      if (navigator.geolocation && dashboardData?.locationStatus?.hasConsent) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000 // 5 minutes
            });
          });
          
          locationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('Location obtained:', locationData);
        } catch (locationError) {
          console.warn('Could not get location:', locationError);
        }
      } else {
        console.log('No location data - geolocation or consent not available');
      }

      // Use offline-aware availability update
      const requestBody: any = { 
        status: newStatus,
        locationConsent: dashboardData?.locationStatus?.hasConsent || false
      };
      
      // Only include location if we have valid coordinates
      if (locationData && locationData.lat && locationData.lng && typeof locationData.lat === 'number' && typeof locationData.lng === 'number') {
        requestBody.location = locationData;
      }

      console.log('Sending availability update request:', {
        newStatus,
        newStatusType: typeof newStatus,
        requestBody,
        requestBodyString: JSON.stringify(requestBody),
        locationData,
        hasLocationConsent: dashboardData?.locationStatus?.hasConsent
      });

      const response = await offlineFetch('/api/driver/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }, 'availability_update');

      const data = await response.json();
      console.log('Availability update response:', { status: response.status, data });

      if (response.ok || response.status === 202) {
        const isQueued = data.queued;
        
        // Refresh dashboard data if not queued
        if (!isQueued) {
          await fetchDashboardData();
        }
        
        toast({
          title: isQueued ? "Status Queued" : "Success",
          description: isQueued 
            ? `Your status will be updated to ${newStatus} when connection is restored`
            : `You are now ${newStatus}`,
          status: isQueued ? "info" : "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        console.error('Availability update failed:', { status: response.status, data });
        throw new Error('Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'online': return 'green';
      case 'break': return 'yellow';
      case 'offline': return 'red';
      default: return 'gray';
    }
  };

  const getAvailabilityButtonText = (status: string) => {
    switch (status) {
      case 'online': return 'Go Offline';
      case 'break': return 'Go Online';
      case 'offline': return 'Go Online';
      default: return 'Go Online';
    }
  };

  const getAvailabilityButtonColor = (status: string) => {
    switch (status) {
      case 'online': return 'red';
      case 'break': return 'green';
      case 'offline': return 'green';
      default: return 'green';
    }
  };

  const getNextAvailabilityStatus = (currentStatus: string) => {
    console.log('getNextAvailabilityStatus called with:', currentStatus);
    const nextStatus = (() => {
      switch (currentStatus) {
        case 'online': return 'offline';
        case 'break': return 'online';
        case 'offline': return 'online';
        default: return 'online';
      }
    })();
    console.log('getNextAvailabilityStatus returning:', nextStatus);
    return nextStatus;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box>
        <Text>Failed to load dashboard data</Text>
      </Box>
    );
  }

  return (
    <Box>
      <OfflineStatus variant="compact" />
      {/* Background location tracker */}
      <LocationTracker 
        isOnline={(dashboardData?.kpis.availability || 'offline') === 'online'}
        hasConsent={dashboardData?.locationStatus?.hasConsent || false}
        onLocationUpdate={(lat, lng) => {
          console.log('Location updated:', lat, lng);
          // Optionally refresh dashboard data to show new location
          fetchDashboardData();
        }}
      />
      
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Driver Dashboard</Heading>
          <Text color="gray.600">Welcome back, {dashboardData.driver?.name || "Driver"}</Text>
        </Box>

        {/* Claimed Job Handler - shows when driver has claimed a job */}
        <ClaimedJobHandler 
          onJobAccepted={(jobId) => {
            console.log("Job accepted:", jobId);
            fetchDashboardData(); // Refresh dashboard
          }}
          onJobDeclined={(jobId) => {
            console.log("Job declined:", jobId);
            fetchDashboardData(); // Refresh dashboard
          }}
        />

        {/* KPI Cards */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Today's Earnings</StatLabel>
                <StatNumber>£{(dashboardData.kpis.todayEarnings || 0).toFixed(2)}</StatNumber>
                <StatHelpText>
                  {(dashboardData.kpis.todayEarnings || 0) > 0 ? "Great work today!" : "No jobs completed today"}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Active Job</StatLabel>
                <StatNumber>
                  {dashboardData.kpis.activeJob ? "In Progress" : "None"}
                </StatNumber>
                <StatHelpText>
                  {dashboardData.kpis.activeJob ? (
                    <VStack align="start" spacing={2}>
                      <Badge colorScheme="green">Active</Badge>
                      <Button 
                        size="sm" 
                        colorScheme="blue" 
                        variant="outline"
                        onClick={() => router.push('/driver/jobs/active')}
                      >
                        View Active Job
                      </Button>
                    </VStack>
                  ) : (
                    <Badge colorScheme="gray">No Active Job</Badge>
                  )}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Rating</StatLabel>
                <StatNumber>
                  {(dashboardData.kpis.rating || 0) > 0 ? `${(dashboardData.kpis.rating || 0).toFixed(1)} ⭐` : "--"}
                </StatNumber>
                <StatHelpText>
                  {(dashboardData.kpis.rating || 0) > 0 ? "Average customer rating" : "No ratings yet"}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Availability</StatLabel>
                <StatNumber>
                  <Badge colorScheme={getAvailabilityColor(dashboardData.kpis.availability || 'offline')}>
                    {(dashboardData.kpis.availability || 'offline').charAt(0).toUpperCase() + (dashboardData.kpis.availability || 'offline').slice(1)}
                  </Badge>
                </StatNumber>
                <StatHelpText>
                  <Button 
                    size="sm" 
                    colorScheme={getAvailabilityButtonColor(dashboardData.kpis.availability || 'offline')} 
                    variant="outline"
                    onClick={() => {
                      const nextStatus = getNextAvailabilityStatus(dashboardData.kpis.availability || 'offline');
                      console.log('Button clicked - next status:', nextStatus);
                      updateAvailability(nextStatus);
                    }}
                    isLoading={updatingAvailability}
                    loadingText="Updating..."
                  >
                    {getAvailabilityButtonText(dashboardData.kpis.availability || 'offline')}
                  </Button>
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Alerts Section */}
        {dashboardData.alerts && dashboardData.alerts.length > 0 && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Alerts & Notifications</Heading>
              <VStack align="stretch" spacing={3}>
                {dashboardData.alerts.map((alert, index) => (
                  <Alert 
                    key={index}
                    status={alert.type === 'expired' ? 'error' : alert.type === 'expiring' ? 'warning' : 'info'}
                  >
                    <AlertIcon />
                    <Box flex="1">
                      <AlertTitle>{alert.category.toUpperCase()}</AlertTitle>
                      <AlertDescription>{alert.message}</AlertDescription>
                    </Box>
                    <Button size="sm" colorScheme="blue">
                      {alert.type === 'missing' ? 'Upload' : 'Renew'}
                    </Button>
                  </Alert>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Location Status Section */}
        {dashboardData.locationStatus && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Location Status</Heading>
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text>
                    <strong>Location Sharing:</strong> {dashboardData.locationStatus.hasConsent ? "Enabled" : "Disabled"}
                  </Text>
                  <Badge colorScheme={dashboardData.locationStatus.hasConsent ? "green" : "gray"}>
                    {dashboardData.locationStatus.hasConsent ? "Active" : "Inactive"}
                  </Badge>
                </HStack>
                {dashboardData.locationStatus.lastSeen && (
                  <Text fontSize="sm" color="gray.600">
                    <strong>Last Updated:</strong> {new Date(dashboardData.locationStatus.lastSeen).toLocaleString()}
                  </Text>
                )}
                {dashboardData.locationStatus.coordinates && (
                  <Text fontSize="sm" color="gray.600">
                    <strong>Coordinates:</strong> {dashboardData.locationStatus.coordinates.lat.toFixed(6)}, {dashboardData.locationStatus.coordinates.lng.toFixed(6)}
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Upcoming Shifts Section */}
        {dashboardData.shifts && dashboardData.shifts.length > 0 && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Upcoming Shifts</Heading>
              <VStack align="stretch" spacing={3}>
                {dashboardData.shifts.slice(0, 3).map((shift) => (
                  <Box 
                    key={shift.id} 
                    p={3} 
                    border="1px solid" 
                    borderColor="gray.200" 
                    borderRadius="md"
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">
                          {new Date(shift.startTime).toLocaleDateString()} - {new Date(shift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {shift.isRecurring ? shift.recurringDays.join(", ") : "One-time"}
                        </Text>
                      </VStack>
                      <Badge colorScheme={shift.isActive ? "green" : "gray"}>
                        {shift.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </HStack>
                  </Box>
                ))}
                {dashboardData.shifts && dashboardData.shifts.length > 3 && (
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    +{dashboardData.shifts.length - 3} more shifts
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Available Jobs Section */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Available Jobs Near You</Heading>
            {dashboardData.availableJobs && dashboardData.availableJobs.length > 0 ? (
              <VStack align="stretch" spacing={3}>
                {dashboardData.availableJobs.map((job) => (
                  <Box 
                    key={job.id} 
                    p={4} 
                    border="1px solid" 
                    borderColor="gray.200" 
                    borderRadius="md"
                    _hover={{ bg: "gray.50" }}
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold">Job #{job.reference}</Text>
                      <Badge colorScheme="green">£{(job.totalGBP / 100).toFixed(2)}</Badge>
                    </HStack>
                    <VStack align="stretch" spacing={1}>
                      <Text fontSize="sm">
                        <strong>Pickup:</strong> {job.pickupAddress}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Dropoff:</strong> {job.dropoffAddress}
                      </Text>
                      <HStack>
                        <Text fontSize="sm">
                          <strong>Date:</strong> {new Date(job.scheduledAt).toLocaleDateString()}
                        </Text>
                        <Text fontSize="sm">
                          <strong>Time:</strong> {job.timeSlot}
                        </Text>
                        <Text fontSize="sm">
                          <strong>Van:</strong> {job.vanSize}
                        </Text>
                      </HStack>
                    </VStack>
                    <Button size="sm" colorScheme="blue" mt={3} width="full">
                      View Details
                    </Button>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text color="gray.600">
                No jobs available in your area. Make sure you're online and in a service area.
              </Text>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
