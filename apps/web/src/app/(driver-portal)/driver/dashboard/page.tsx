"use client";

import React, { useState, useEffect } from "react";
import { Box, Grid, GridItem, Heading, Text, Stat, StatLabel, StatNumber, StatHelpText, Badge, VStack, HStack, Card, CardBody, Button, Spacer, Alert, AlertIcon, AlertTitle, AlertDescription, Spinner } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import LocationTracker from "@/components/Driver/LocationTracker";
import ClaimedJobHandler from "@/components/Driver/ClaimedJobHandler";
import AvailabilityToggle from "@/components/Driver/AvailabilityToggle";
import { queueAvailabilityUpdate, offlineFetch } from "@/lib/offline";

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

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/driver/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
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

  const handleStatusChange = async (newStatus: string) => {
    // Refresh dashboard data when status changes
    await fetchDashboardData();
    
    toast({
      title: "Status Updated",
      description: `You are now ${newStatus}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleJobClaim = async (jobId: string) => {
    try {
      const response = await fetch(`/api/driver/jobs/${jobId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Job claimed successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        await fetchDashboardData(); // Refresh dashboard data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to claim job');
      }
    } catch (error) {
      console.error('Error claiming job:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to claim job",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <VStack spacing={4} align="center">
          <Spinner size="xl" />
          <Text>Loading dashboard...</Text>
        </VStack>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load dashboard data</AlertDescription>
        </Alert>
      </Box>
    );
  }

  // Safety check for required data
  if (!dashboardData.driver || !dashboardData.kpis) {
    return (
      <Box p={6}>
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Dashboard data is incomplete. Please refresh the page.</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box data-testid="driver-dashboard">
      <VStack spacing={6} align="stretch">
        {/* Header Section */}
        <Box>
          <Heading size="lg" mb={2}>Welcome back, {dashboardData.driver.name || 'Driver'}!</Heading>
          <Text color="gray.600">Driver Dashboard</Text>
        </Box>

        {/* Status and Location Section */}
        <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
          <GridItem>
            <AvailabilityToggle
              initialStatus={dashboardData.kpis.availability || 'offline'}
              onStatusChange={handleStatusChange}
            />
          </GridItem>
          <GridItem>
            <LocationTracker
              isOnline={dashboardData.kpis.availability === 'online'}
              hasConsent={dashboardData.locationStatus?.hasConsent || false}
            />
          </GridItem>
        </Grid>

        {/* KPIs Section */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Today's Earnings</StatLabel>
                  <StatNumber>£{((dashboardData.kpis.todayEarnings || 0) / 100).toFixed(2)}</StatNumber>
                  <StatHelpText>From completed jobs</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Rating</StatLabel>
                  <StatNumber>{(dashboardData.kpis.rating || 0).toFixed(1)}</StatNumber>
                  <StatHelpText>Customer satisfaction</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Status</StatLabel>
                  <StatNumber>
                    <Badge colorScheme={(dashboardData.kpis.availability || 'offline') === 'online' ? 'green' : 'gray'}>
                      {dashboardData.kpis.availability || 'offline'}
                    </Badge>
                  </StatNumber>
                  <StatHelpText>Current availability</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Active Job Section */}
        {dashboardData.claimedJob && (
          <GridItem>
            <ClaimedJobHandler
              onJobAccepted={fetchDashboardData}
              onJobDeclined={fetchDashboardData}
            />
          </GridItem>
        )}

        {/* Available Jobs Section */}
        {dashboardData.availableJobs && dashboardData.availableJobs.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>Available Jobs</Heading>
            <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
              {dashboardData.availableJobs.map((job) => (
                <GridItem key={job.id}>
                  <Card>
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="bold" fontSize="lg">Job #{job.reference}</Text>
                          <Badge colorScheme="green">£{(job.totalGBP / 100).toFixed(2)}</Badge>
                        </HStack>
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>Pickup</Text>
                          <Text>{job.pickupAddress || 'Address not specified'}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>Dropoff</Text>
                          <Text>{job.dropoffAddress || 'Address not specified'}</Text>
                        </Box>
                        <HStack spacing={4} w="full">
                          <Box>
                            <Text fontSize="sm" color="gray.600">Date</Text>
                            <Text fontSize="sm">{new Date(job.scheduledAt).toLocaleDateString()}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.600">Time</Text>
                            <Text fontSize="sm">{job.timeSlot || 'Flexible'}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.600">Van Size</Text>
                            <Text fontSize="sm">{job.vanSize || 'Standard'}</Text>
                          </Box>
                        </HStack>
                        <Button
                          colorScheme="blue"
                          size="sm"
                          w="full"
                          onClick={() => handleJobClaim(job.id)}
                        >
                          Claim Job
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          </Box>
        )}

        {/* Alerts Section */}
        {dashboardData.alerts && dashboardData.alerts.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>Alerts</Heading>
            <VStack spacing={3} align="stretch">
              {dashboardData.alerts.map((alert, index) => (
                <Alert 
                  key={index} 
                  status={alert.type === 'expired' ? 'error' : alert.type === 'expiring' ? 'warning' : 'info'}
                >
                  <AlertIcon />
                  <Box flex="1">
                    <AlertTitle>{alert.category}</AlertTitle>
                    <AlertDescription>{alert.message}</AlertDescription>
                  </Box>
                </Alert>
              ))}
            </VStack>
          </Box>
        )}

        {/* Shifts Section */}
        {dashboardData.shifts && dashboardData.shifts.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>Today's Shifts</Heading>
            <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
              {dashboardData.shifts.map((shift) => (
                <GridItem key={shift.id}>
                  <Card>
                    <CardBody>
                      <VStack align="start" spacing={2}>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="bold">
                            {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                          <Badge colorScheme={shift.isActive ? 'green' : 'gray'}>
                            {shift.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </HStack>
                        {shift.isRecurring && (
                          <Text fontSize="sm" color="gray.600">
                            Recurring: {shift.recurringDays.join(', ')}
                          </Text>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
