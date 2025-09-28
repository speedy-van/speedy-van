'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Heading, 
  Text, 
  Box, 
  VStack, 
  HStack, 
  Button, 
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  useBreakpointValue,
  Stack,
  Flex,
  SimpleGrid,
} from '@chakra-ui/react';
import Link from 'next/link';
import { ROUTES } from '@/lib/routing';

import { EnhancedJobCard } from '@/components/driver/EnhancedJobCard';
import { NoJobsMessage } from '@/components/driver/NoJobsMessage';
import { DriverStatsCard } from '@/components/driver/DriverStatsCard';
import { useOptimizedDataLoader } from '@/hooks/useOptimizedDataLoader';
import { useRouter } from 'next/navigation';

interface DashboardData {
  driver: {
    id: string;
    status: string;
    onboardingStatus: string;
  };
  jobs: {
    assigned: any[];
    available: any[];
  };
  statistics: {
    assignedJobs: number;
    availableJobs: number;
    completedToday: number;
    totalCompleted: number;
    earningsToday: number;
    totalEarnings: number;
    averageRating: number;
  };
}

export default function DriverDashboard() {
  const toast = useToast();
  const router = useRouter();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Logout handler
  const handleLogout = () => {
    router.push('/driver/logout');
  };

  // Use optimized data loader
  const { data: dashboardData, loading: isLoading, error, refetch } = useOptimizedDataLoader<DashboardData>({
    endpoint: '/api/driver/dashboard',
    debounceMs: 300,
    cacheKey: 'driver-dashboard',
    enabled: true
  });

  // Show toast for errors
  useEffect(() => {
    if (error) {
      console.error('Driver Dashboard Error:', error);
      toast({
        title: 'Error Loading Dashboard',
        description: 'Failed to load your dashboard data. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'accepted': return 'blue';
      case 'invited': return 'yellow';
      case 'available': return 'green';
      default: return 'gray';
    }
  };

  const handleAcceptJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/driver/jobs/${jobId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        toast({
          title: 'Job Accepted!',
          description: 'You have successfully accepted this job. Redirecting to job details...',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Redirect to job details page after a short delay
        setTimeout(() => {
          window.location.href = `/driver/jobs/${jobId}`;
        }, 1500);
      } else {
        throw new Error('Failed to accept job');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept job. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Container maxW="7xl" py={{ base: 4, md: 8 }}>
        <VStack spacing={{ base: 6, md: 8 }} align="center">
          <Spinner size="xl" color="blue.500" />
          <Text fontSize={{ base: "md", md: "lg" }}>Loading your dashboard...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="7xl" py={{ base: 4, md: 8 }}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertDescription fontSize={{ base: "sm", md: "md" }}>{error}</AlertDescription>
            <Button mt={3} size={{ base: "sm", md: "md" }} onClick={refetch}>
              Try Again
            </Button>
          </Box>
        </Alert>
      </Container>
    );
  }

  if (!dashboardData) {
    return (
      <Container maxW="7xl" py={{ base: 4, md: 8 }}>
        <Alert status="warning" borderRadius="lg">
          <AlertIcon />
          <AlertDescription fontSize={{ base: "sm", md: "md" }}>No dashboard data available.</AlertDescription>
        </Alert>
      </Container>
    );
  }

  const { driver, jobs, statistics } = dashboardData;

  return (
    <Box minH="100vh" bg="gray.50">

      <Container maxW="7xl" py={{ base: 6, md: 8 }}>
        <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          {/* Enhanced Stats Card */}
          <DriverStatsCard
            stats={statistics}
            title="Your Performance Dashboard"
            description="Track your jobs, earnings, and performance metrics"
          />

          {/* Assigned Jobs */}
          {jobs.assigned.length > 0 && (
            <Box>
              <Heading size={{ base: "lg", md: "xl" }} mb={{ base: 4, md: 6 }} color="gray.800">
                Your Assigned Jobs
              </Heading>
              <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                {jobs.assigned.map((job) => (
                  <EnhancedJobCard
                    key={job.id}
                    job={{
                      id: job.id,
                      reference: job.reference,
                      customer: job.customer,
                      customerPhone: job.customerPhone || "07901846297",
                      date: job.date,
                      time: job.time,
                      from: job.from,
                      to: job.to,
                      distance: job.distance,
                      vehicleType: job.vehicleType,
                      items: job.items,
                      estimatedEarnings: job.estimatedEarnings,
                      status: job.assignmentStatus,
                      duration: job.duration,
                      crew: job.crew,
                    }}
                    variant="assigned"
                    onAccept={job.assignmentStatus === 'invited' ? handleAcceptJob : undefined}
                    onViewDetails={(jobId) => window.location.href = `/driver/jobs/${jobId}`}
                    isAccepting={isLoading}
                  />
                ))}
              </VStack>
            </Box>
          )}

          {/* Available Jobs */}
          {jobs.available.length > 0 && (
            <Box>
              <Heading size={{ base: "lg", md: "xl" }} mb={{ base: 4, md: 6 }} color="gray.800">
                Available Jobs
              </Heading>
              <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                {jobs.available.map((job) => (
                  <EnhancedJobCard
                    key={job.id}
                    job={{
                      id: job.id,
                      reference: job.reference,
                      customer: job.customer,
                      customerPhone: job.customerPhone || "07901846297",
                      date: job.date,
                      time: job.time,
                      from: job.from,
                      to: job.to,
                      distance: job.distance,
                      vehicleType: job.vehicleType,
                      items: job.items,
                      estimatedEarnings: job.estimatedEarnings,
                      status: "available",
                      duration: job.duration,
                      crew: job.crew,
                    }}
                    variant="available"
                    onAccept={handleAcceptJob}
                    onViewDetails={(jobId) => window.location.href = `/driver/jobs/${jobId}`}
                    isAccepting={isLoading}
                  />
                ))}
              </VStack>
            </Box>
          )}

          {/* No Jobs Message */}
          {jobs.assigned.length === 0 && jobs.available.length === 0 && (
            <NoJobsMessage
              onRefresh={refetch}
              isRefreshing={isLoading}
              message="No available jobs at the moment"
              subMessage="New jobs will appear here when customers place orders"
            />
          )}

          {/* Quick Actions */}
          <Box>
            <Heading size={{ base: "lg", md: "xl" }} mb={{ base: 4, md: 6 }} color="gray.800">
              Quick Actions
            </Heading>
            <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 3, md: 4 }}>
              <Button 
                colorScheme="blue"
                onClick={refetch}
                isLoading={isLoading}
                size={{ base: "lg", md: "xl" }}
                width={{ base: "full", md: "auto" }}
                borderRadius="xl"
                fontWeight="semibold"
                px={8}
                py={6}
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: 'lg',
                }}
              >
                Refresh Dashboard
              </Button>
              <Link href={ROUTES.DRIVER.JOBS}>
                <Button 
                  variant="outline" 
                  size={{ base: "lg", md: "xl" }} 
                  width={{ base: "full", md: "auto" }}
                  borderRadius="xl"
                  fontWeight="semibold"
                  px={8}
                  py={6}
                  borderColor="blue.300"
                  color="blue.600"
                  _hover={{
                    bg: "blue.50",
                    borderColor: "blue.400",
                    transform: 'translateY(-1px)',
                    boxShadow: 'lg',
                  }}
                >
                  View All Jobs
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size={{ base: "lg", md: "xl" }} 
                width={{ base: "full", md: "auto" }}
                borderRadius="xl"
                fontWeight="semibold"
                px={8}
                py={6}
                borderColor="green.300"
                color="green.600"
                _hover={{
                  bg: "green.50",
                  borderColor: "green.400",
                  transform: 'translateY(-1px)',
                  boxShadow: 'lg',
                }}
              >
                Update Availability
              </Button>
            </Stack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}