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
          locationStatus: data.locationStatus || { hasConsent: false },
          availableJobs: data.availableJobs || [],
          claimedJob: data.claimedJob || null,
        };
        
        setDashboardData(safeData);
      } else {
        console.error('Failed to fetch dashboard data:', response.status);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
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
    try {
      console.log('Updating availability to:', newStatus);
      
      const response = await fetch('/api/driver/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await response.json();
      
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
    <Box p={{ base: 4, md: 6 }}>
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
      
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        <Box>
          <Heading size={{ base: "md", md: "lg" }} mb={2}>Driver Dashboard</Heading>
          <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>Welcome back, {dashboardData.driver?.name || "Driver"}</Text>
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
        <Grid 
          templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} 
          gap={{ base: 4, md: 6 }}
        >
          <Card>
            <CardBody p={{ base: 4, md: 6 }}>
              <Stat>
                <StatLabel fontSize={{ base: "xs", md: "sm" }}>Today's Earnings</StatLabel>
                <StatNumber fontSize={{ base: "lg", md: "xl" }}>£{(dashboardData.kpis.todayEarnings || 0).toFixed(2)}</StatNumber>
                <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                  {(dashboardData.kpis.todayEarnings || 0) > 0 ? "Great work today!" : "No jobs completed today"}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody p={{ base: 4, md: 6 }}>
              <Stat>
                <StatLabel fontSize={{ base: "xs", md: "sm" }}>Active Job</StatLabel>
                <StatNumber fontSize={{ base: "lg", md: "xl" }}>
                  {dashboardData.kpis.activeJob ? "In Progress" : "None"}
                </StatNumber>
                <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                  {dashboardData.kpis.activeJob ? (
                    <VStack align="start" spacing={2}>
                      <Badge colorScheme="green" size={{ base: "sm", md: "md" }}>Active</Badge>
                      <Button 
                        size={{ base: "xs", md: "sm" }} 
                        colorScheme="blue" 
                        variant="outline"
                        onClick={() => router.push('/driver/jobs/active')}
                      >
                        View Active Job
                      </Button>
                    </VStack>
                  ) : (
                    <Badge colorScheme="gray" size={{ base: "sm", md: "md" }}>No Active Job</Badge>
                  )}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody p={{ base: 4, md: 6 }}>
              <Stat>
                <StatLabel fontSize={{ base: "xs", md: "sm" }}>Rating</StatLabel>
                <StatNumber fontSize={{ base: "lg", md: "xl" }}>
                  {(dashboardData.kpis.rating || 0) > 0 ? `${(dashboardData.kpis.rating || 0).toFixed(1)} ⭐` : "--"}
                </StatNumber>
                <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                  {(dashboardData.kpis.rating || 0) > 0 ? "Average customer rating" : "No ratings yet"}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody p={{ base: 4, md: 6 }}>
              <Stat>
                <StatLabel fontSize={{ base: "xs", md: "sm" }}>Availability</StatLabel>
                <StatNumber fontSize={{ base: "lg", md: "xl" }}>
                  <Badge colorScheme={getAvailabilityColor(dashboardData.kpis.availability || 'offline')} size={{ base: "sm", md: "md" }}>
                    {(dashboardData.kpis.availability || 'offline').charAt(0).toUpperCase() + (dashboardData.kpis.availability || 'offline').slice(1)}
                  </Badge>
                </StatNumber>
                <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                  <Button 
                    size={{ base: "xs", md: "sm" }} 
                    colorScheme={getAvailabilityButtonColor(dashboardData.kpis.availability || 'offline')} 
                    variant="outline"
                    onClick={() => {
                      const nextStatus = getNextAvailabilityStatus(dashboardData.kpis.availability || 'offline');
                      console.log('Button clicked - next status:', nextStatus);
                      updateAvailability(nextStatus);
                    }}
                    isLoading={updatingAvailability}
                    loadingText="Updating..."
                    w={{ base: "full", sm: "auto" }}
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
            <CardBody p={{ base: 4, md: 6 }}>
              <Heading size={{ base: "sm", md: "md" }} mb={4}>Alerts & Notifications</Heading>
              <VStack align="stretch" spacing={3}>
                {dashboardData.alerts.map((alert, index) => (
                  <Alert 
                    key={index}
                    status={alert.type === 'expired' ? 'error' : alert.type === 'expiring' ? 'warning' : 'info'}
                    borderRadius="md"
                  >
                    <AlertIcon />
                    <Box flex="1">
                      <AlertTitle fontSize={{ base: "xs", md: "sm" }}>{alert.category.toUpperCase()}</AlertTitle>
                      <AlertDescription fontSize={{ base: "xs", md: "sm" }}>{alert.message}</AlertDescription>
                    </Box>
                    <Button size={{ base: "xs", md: "sm" }} colorScheme="blue">
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
            <CardBody p={{ base: 4, md: 6 }}>
              <Heading size={{ base: "sm", md: "md" }} mb={4}>Location Status</Heading>
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between" flexWrap={{ base: "wrap", md: "nowrap" }}>
                  <Text fontSize={{ base: "sm", md: "md" }}>
                    <strong>Location Sharing:</strong> {dashboardData.locationStatus.hasConsent ? "Enabled" : "Disabled"}
                  </Text>
                  <Badge colorScheme={dashboardData.locationStatus.hasConsent ? "green" : "gray"} size={{ base: "sm", md: "md" }}>
                    {dashboardData.locationStatus.hasConsent ? "Active" : "Inactive"}
                  </Badge>
                </HStack>
                {dashboardData.locationStatus.lastSeen && (
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                    <strong>Last Updated:</strong> {new Date(dashboardData.locationStatus.lastSeen).toLocaleString()}
                  </Text>
                )}
                {dashboardData.locationStatus.coordinates && (
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
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
            <CardBody p={{ base: 4, md: 6 }}>
              <Heading size={{ base: "sm", md: "md" }} mb={4}>Upcoming Shifts</Heading>
              <VStack align="stretch" spacing={3}>
                {dashboardData.shifts.slice(0, 3).map((shift) => (
                  <Box 
                    key={shift.id} 
                    p={{ base: 3, md: 4 }} 
                    border="1px solid" 
                    borderColor="gray.200" 
                    borderRadius="md"
                  >
                    <HStack justify="space-between" flexWrap={{ base: "wrap", md: "nowrap" }}>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>
                          {new Date(shift.startTime).toLocaleDateString()} - {new Date(shift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </Text>
                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                          {shift.isRecurring ? shift.recurringDays.join(", ") : "One-time"}
                        </Text>
                      </VStack>
                      <Badge colorScheme={shift.isActive ? "green" : "gray"} size={{ base: "sm", md: "md" }}>
                        {shift.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </HStack>
                  </Box>
                ))}
                {dashboardData.shifts && dashboardData.shifts.length > 3 && (
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" textAlign="center">
                    +{dashboardData.shifts.length - 3} more shifts
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Available Jobs Section */}
        <Card>
          <CardBody p={{ base: 4, md: 6 }}>
            <Heading size={{ base: "sm", md: "md" }} mb={4}>Available Jobs Near You</Heading>
            {dashboardData.availableJobs && dashboardData.availableJobs.length > 0 ? (
              <VStack align="stretch" spacing={3}>
                {dashboardData.availableJobs.map((job) => (
                  <Box 
                    key={job.id} 
                    p={{ base: 3, md: 4 }} 
                    border="1px solid" 
                    borderColor="gray.200" 
                    borderRadius="md"
                    _hover={{ bg: "gray.50" }}
                  >
                    <HStack justify="space-between" mb={2} flexWrap={{ base: "wrap", md: "nowrap" }}>
                      <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>Job #{job.reference}</Text>
                      <Badge colorScheme="green" size={{ base: "sm", md: "md" }}>£{(job.totalGBP / 100).toFixed(2)}</Badge>
                    </HStack>
                    <VStack align="stretch" spacing={1}>
                      <Text fontSize={{ base: "xs", md: "sm" }}>
                        <strong>Pickup:</strong> {job.pickupAddress}
                      </Text>
                      <Text fontSize={{ base: "xs", md: "sm" }}>
                        <strong>Dropoff:</strong> {job.dropoffAddress}
                      </Text>
                      <VStack align="start" spacing={1}>
                        <Text fontSize={{ base: "xs", md: "sm" }}>
                          <strong>Date:</strong> {new Date(job.scheduledAt).toLocaleDateString()}
                        </Text>
                        <Text fontSize={{ base: "xs", md: "sm" }}>
                          <strong>Time:</strong> {job.timeSlot}
                        </Text>
                        <Text fontSize={{ base: "xs", md: "sm" }}>
                          <strong>Van:</strong> {job.vanSize}
                        </Text>
                      </VStack>
                    </VStack>
                    <Button size={{ base: "sm", md: "md" }} colorScheme="blue" mt={3} width="full">
                      View Details
                    </Button>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
                No jobs available in your area. Make sure you're online and in a service area.
              </Text>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
