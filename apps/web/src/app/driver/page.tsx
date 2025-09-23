'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Heading, 
  Text, 
  Box, 
  SimpleGrid, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  StatArrow, 
  VStack, 
  HStack, 
  Button, 
  Badge, 
  Card, 
  CardBody, 
  CardHeader,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  Divider,
  useBreakpointValue,
  Stack,
  IconButton,
  Flex
} from '@chakra-ui/react';
import Link from 'next/link';
import { ROUTES } from '@/lib/routing';

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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/driver/dashboard');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load dashboard data');
      }

      const data = await response.json();
      setDashboardData(data.data);
      
      console.log('✅ Driver dashboard data loaded:', data.data.statistics);

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
      
      toast({
        title: 'Error Loading Dashboard',
        description: 'Failed to load your dashboard data. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            <Button mt={3} size={{ base: "sm", md: "md" }} onClick={loadDashboardData}>
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
    <Container maxW="7xl" py={{ base: 4, md: 8 }}>
      <VStack spacing={{ base: 6, md: 8 }} align="stretch">
        {/* Header */}
        <Box>
          <Heading size={{ base: "md", md: "lg" }} mb={2}>
            Driver Dashboard
          </Heading>
          <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
            Welcome back! Here's your latest activity and earnings.
          </Text>
          <Badge 
            colorScheme={driver.status === 'active' ? 'green' : 'red'} 
            size={{ base: "md", md: "lg" }} 
            mt={2}
          >
            Status: {driver.status}
          </Badge>
        </Box>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 4, md: 6 }}>
          <Card>
            <CardBody p={{ base: 4, md: 6 }}>
              <Stat>
                <StatLabel fontSize={{ base: "xs", md: "sm" }}>Assigned Jobs</StatLabel>
                <StatNumber fontSize={{ base: "xl", md: "2xl" }}>{statistics.assignedJobs}</StatNumber>
                <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                  Current assignments
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody p={{ base: 4, md: 6 }}>
              <Stat>
                <StatLabel fontSize={{ base: "xs", md: "sm" }}>Available Jobs</StatLabel>
                <StatNumber fontSize={{ base: "xl", md: "2xl" }}>{statistics.availableJobs}</StatNumber>
                <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                  Jobs you can accept
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody p={{ base: 4, md: 6 }}>
              <Stat>
                <StatLabel fontSize={{ base: "xs", md: "sm" }}>Completed Today</StatLabel>
                <StatNumber fontSize={{ base: "xl", md: "2xl" }}>{statistics.completedToday}</StatNumber>
                <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                  <StatArrow type="increase" />
                  Today's work
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody p={{ base: 4, md: 6 }}>
              <Stat>
                <StatLabel fontSize={{ base: "xs", md: "sm" }}>Total Earnings</StatLabel>
                <StatNumber fontSize={{ base: "xl", md: "2xl" }}>£{statistics.totalEarnings.toFixed(2)}</StatNumber>
                <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                  Average: {statistics.averageRating.toFixed(1)} ⭐
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Assigned Jobs */}
        {jobs.assigned.length > 0 && (
          <Box>
            <Heading size={{ base: "sm", md: "md" }} mb={{ base: 4, md: 6 }}>Your Assigned Jobs</Heading>
            <VStack spacing={{ base: 3, md: 4 }} align="stretch">
              {jobs.assigned.map((job) => (
                <Card key={job.id} borderLeft="4px" borderLeftColor="blue.400">
                  <CardBody p={{ base: 4, md: 6 }}>
                    <VStack align="stretch" spacing={{ base: 3, md: 4 }}>
                      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={{ base: 2, md: 0 }}>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium" fontSize={{ base: "md", md: "lg" }}>
                            {job.customer}
                          </Text>
                          <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                            Ref: {job.reference}
                          </Text>
                          <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                            {job.date} at {job.time}
                          </Text>
                        </VStack>
                        <VStack align={{ base: "start", md: "end" }} spacing={1}>
                          <Badge colorScheme={getStatusColor(job.assignmentStatus)} size={{ base: "sm", md: "lg" }}>
                            {job.assignmentStatus}
                          </Badge>
                          <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }} color="blue.600">
                            £{job.estimatedEarnings.toFixed(2)}
                          </Text>
                        </VStack>
                      </Flex>

                      <Box>
                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" mb={2}>
                          Route: {job.from} → {job.to}
                        </Text>
                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                          Distance: {job.distance} • Vehicle: {job.vehicleType}
                        </Text>
                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                          Items: {job.items}
                        </Text>
                      </Box>

                      <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 4 }}>
                        {job.assignmentStatus === 'invited' && (
                          <Button 
                            colorScheme="green" 
                            size={{ base: "sm", md: "md" }}
                            onClick={() => handleAcceptJob(job.id)}
                            width={{ base: "full", md: "auto" }}
                          >
                            Accept Job
                          </Button>
                        )}
                        <Link href={`/driver/jobs/${job.id}`}>
                          <Button variant="outline" size={{ base: "sm", md: "md" }} width={{ base: "full", md: "auto" }}>
                            View Details
                          </Button>
                        </Link>
                        <Button variant="ghost" size={{ base: "sm", md: "md" }} width={{ base: "full", md: "auto" }}>
                          Contact Customer
                        </Button>
                      </Stack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </Box>
        )}

        {/* Available Jobs */}
        {jobs.available.length > 0 && (
          <Box>
            <Heading size={{ base: "sm", md: "md" }} mb={{ base: 4, md: 6 }}>Available Jobs</Heading>
            <VStack spacing={{ base: 3, md: 4 }} align="stretch">
              {jobs.available.map((job) => (
                <Card key={job.id} borderLeft="4px" borderLeftColor="green.400">
                  <CardBody p={{ base: 4, md: 6 }}>
                    <VStack align="stretch" spacing={{ base: 3, md: 4 }}>
                      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={{ base: 2, md: 0 }}>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium" fontSize={{ base: "md", md: "lg" }}>
                            {job.customer}
                          </Text>
                          <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                            Ref: {job.reference}
                          </Text>
                          <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                            {job.date} at {job.time}
                          </Text>
                        </VStack>
                        <VStack align={{ base: "start", md: "end" }} spacing={1}>
                          <Badge colorScheme="green" size={{ base: "sm", md: "lg" }}>
                            Available
                          </Badge>
                          <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }} color="green.600">
                            £{job.estimatedEarnings.toFixed(2)}
                          </Text>
                        </VStack>
                      </Flex>

                      <Box>
                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" mb={2}>
                          Route: {job.from} → {job.to}
                        </Text>
                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                          Distance: {job.distance} • Vehicle: {job.vehicleType}
                        </Text>
                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                          Items: {job.items}
                        </Text>
                      </Box>

                      <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 4 }}>
                        <Button 
                          colorScheme="green" 
                          size={{ base: "sm", md: "md" }}
                          onClick={() => handleAcceptJob(job.id)}
                          width={{ base: "full", md: "auto" }}
                        >
                          Accept Job
                        </Button>
                        <Link href={`/driver/jobs/${job.id}`}>
                          <Button variant="outline" size={{ base: "sm", md: "md" }} width={{ base: "full", md: "auto" }}>
                            View Details
                          </Button>
                        </Link>
                      </Stack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </Box>
        )}

        {/* No Jobs Message */}
        {jobs.assigned.length === 0 && jobs.available.length === 0 && (
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <AlertDescription fontSize={{ base: "sm", md: "md" }}>
              No jobs available at the moment. Check back later or contact support if you expect to see jobs here.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <Box>
          <Heading size={{ base: "sm", md: "md" }} mb={{ base: 3, md: 4 }}>Quick Actions</Heading>
          <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 3, md: 4 }}>
            <Button 
              colorScheme="blue"
              onClick={loadDashboardData}
              isLoading={isLoading}
              size={{ base: "md", md: "lg" }}
              width={{ base: "full", md: "auto" }}
            >
              Refresh Dashboard
            </Button>
            <Link href={ROUTES.DRIVER.JOBS}>
              <Button variant="outline" size={{ base: "md", md: "lg" }} width={{ base: "full", md: "auto" }}>
                View All Jobs
              </Button>
            </Link>
            <Button variant="outline" size={{ base: "md", md: "lg" }} width={{ base: "full", md: "auto" }}>
              Update Availability
            </Button>
          </Stack>
        </Box>
      </VStack>
    </Container>
  );
}