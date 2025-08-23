"use client";

import React, { useState, useEffect } from "react";
import { Box, Heading, Text, VStack, HStack, Card, CardBody, Button, Badge, Spinner, useToast, Alert, AlertIcon, AlertTitle, AlertDescription, Grid, GridItem, Stat, StatLabel, StatNumber, StatHelpText } from "@chakra-ui/react";
import { requireDriver } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface AvailableJob {
  id: string;
  reference: string;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledAt: string;
  timeSlot: string;
  vanSize: string;
  totalGBP: number;
  distance: number;
  estimatedDuration: number;
}

export default function AvailableJobsPage() {
  const [jobs, setJobs] = useState<AvailableJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingJob, setClaimingJob] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    radius: 10,
    vehicleType: "all",
    minAmount: 0
  });
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchAvailableJobs();
  }, [filters]);

  const fetchAvailableJobs = async () => {
    try {
      const queryParams = new URLSearchParams({
        radius: filters.radius.toString(),
        vehicleType: filters.vehicleType,
        minAmount: filters.minAmount.toString()
      });
      
      const response = await fetch(`/api/driver/jobs/available?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      } else {
        throw new Error('Failed to fetch available jobs');
      }
    } catch (error) {
      console.error('Error fetching available jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load available jobs",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const claimJob = async (jobId: string) => {
    setClaimingJob(jobId);
    try {
      const response = await fetch(`/api/driver/jobs/${jobId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast({
            title: "Job Claimed!",
            description: "You have successfully claimed this job",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          // Redirect to active jobs or job details
          router.push('/driver/jobs/active');
        } else {
          toast({
            title: "Job Already Claimed",
            description: result.message || "This job has already been claimed by another driver",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
          // Refresh the job list
          fetchAvailableJobs();
        }
      } else {
        throw new Error('Failed to claim job');
      }
    } catch (error) {
      console.error('Error claiming job:', error);
      toast({
        title: "Error",
        description: "Failed to claim job. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setClaimingJob(null);
    }
  };

  const formatCurrency = (pence: number) => {
    return `£${(pence / 100).toFixed(2)}`;
  };

  const formatDistance = (distance: number) => {
    return `${distance.toFixed(1)} miles`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <Box p={6}>
        <VStack spacing={4} align="center">
          <Spinner size="xl" />
          <Text>Loading available jobs...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Available Jobs</Heading>
          <Text color="gray.600">Jobs near your location that match your vehicle and preferences</Text>
        </Box>

        {/* Filters */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Filters</Heading>
              <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                <GridItem>
                  <Text fontWeight="medium" mb={2}>Search Radius</Text>
                  <select 
                    value={filters.radius}
                    onChange={(e) => setFilters(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  >
                    <option value={5}>5 miles</option>
                    <option value={10}>10 miles</option>
                    <option value={15}>15 miles</option>
                    <option value={25}>25 miles</option>
                  </select>
                </GridItem>
                <GridItem>
                  <Text fontWeight="medium" mb={2}>Vehicle Type</Text>
                  <select 
                    value={filters.vehicleType}
                    onChange={(e) => setFilters(prev => ({ ...prev, vehicleType: e.target.value }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  >
                    <option value="all">All Types</option>
                    <option value="small">Small Van</option>
                    <option value="medium">Medium Van</option>
                    <option value="large">Large Van</option>
                  </select>
                </GridItem>
                <GridItem>
                  <Text fontWeight="medium" mb={2}>Minimum Amount</Text>
                  <select 
                    value={filters.minAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, minAmount: parseInt(e.target.value) }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  >
                    <option value={0}>Any Amount</option>
                    <option value={2000}>£20+</option>
                    <option value={5000}>£50+</option>
                    <option value={10000}>£100+</option>
                  </select>
                </GridItem>
              </Grid>
            </VStack>
          </CardBody>
        </Card>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>No jobs available</AlertTitle>
              <AlertDescription>
                There are currently no jobs available in your area. Try adjusting your filters or check back later.
              </AlertDescription>
            </Box>
          </Alert>
        ) : (
          <VStack spacing={4} align="stretch">
            {jobs.map((job) => (
              <Card key={job.id} variant="outline">
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Badge colorScheme="blue">{job.reference}</Badge>
                          <Badge colorScheme="green">{job.vanSize}</Badge>
                        </HStack>
                        <Heading size="md">{formatCurrency(job.totalGBP)}</Heading>
                      </VStack>
                      <Button
                        colorScheme="blue"
                        size="sm"
                        onClick={() => claimJob(job.id)}
                        isLoading={claimingJob === job.id}
                        loadingText="Claiming..."
                      >
                        Claim Job
                      </Button>
                    </HStack>

                    <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                      <GridItem>
                        <Stat>
                          <StatLabel>Pickup</StatLabel>
                          <StatNumber fontSize="sm">{job.pickupAddress}</StatNumber>
                        </Stat>
                      </GridItem>
                      <GridItem>
                        <Stat>
                          <StatLabel>Drop-off</StatLabel>
                          <StatNumber fontSize="sm">{job.dropoffAddress}</StatNumber>
                        </Stat>
                      </GridItem>
                    </Grid>

                    <HStack justify="space-between">
                      <HStack spacing={6}>
                        <Stat>
                          <StatLabel>Distance</StatLabel>
                          <StatNumber fontSize="sm">{formatDistance(job.distance)}</StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel>Duration</StatLabel>
                          <StatNumber fontSize="sm">{formatDuration(job.estimatedDuration)}</StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel>Date & Time</StatLabel>
                          <StatNumber fontSize="sm">{job.scheduledAt} {job.timeSlot}</StatNumber>
                        </Stat>
                      </HStack>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
