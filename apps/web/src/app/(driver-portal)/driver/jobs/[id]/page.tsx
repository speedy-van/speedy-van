"use client";

import React, { useState, useEffect } from "react";
import { Box, Heading, Text, VStack, HStack, Card, CardBody, Button, Badge, Spinner, useToast, Alert, AlertIcon, AlertTitle, AlertDescription, Grid, GridItem, Stat, StatLabel, StatNumber, Divider, List, ListItem, ListIcon } from "@chakra-ui/react";
import { requireDriver } from "@/lib/auth";
import { useRouter, useParams } from "next/navigation";
import { HiCheckCircle, HiMapPin, HiClock, HiCurrencyPound } from "react-icons/hi2";

interface JobDetails {
  id: string;
  code: string;
  status: string;
  pickupAddress: string;
  dropoffAddress: string;
  preferredDate: string;
  timeSlot?: string; // Made optional as field removed from schema
  vanSize?: string; // Made optional as field removed from schema
  amountPence: number;
  distance: number;
  estimatedDuration: number;
  items: Array<{
    name: string;
    quantity: number;
    category: string;
  }>;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  specialInstructions?: string;
  createdAt: string;
  claimedAt?: string;
  driverId?: string;
}

export default function JobDetailsPage() {
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/driver/jobs/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data.job);
      } else {
        throw new Error('Failed to fetch job details');
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast({
        title: "Error",
        description: "Failed to load job details",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const claimJob = async () => {
    setClaiming(true);
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
          // Redirect to active jobs
          router.push('/driver/jobs/active');
        } else {
          toast({
            title: "Job Already Claimed",
            description: result.message || "This job has already been claimed by another driver",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
          // Refresh the job details
          fetchJobDetails();
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
      setClaiming(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'green';
      case 'claimed': return 'blue';
      case 'in_progress': return 'orange';
      case 'completed': return 'purple';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <VStack spacing={4} align="center">
          <Spinner size="xl" />
          <Text>Loading job details...</Text>
        </VStack>
      </Box>
    );
  }

  if (!job) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          <Box>
            <AlertTitle>Job not found</AlertTitle>
            <AlertDescription>
              The job you're looking for doesn't exist or has been removed.
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={2}>
              <HStack>
                <Badge colorScheme="blue">{job.code}</Badge>
                <Badge colorScheme={getStatusColor(job.status)}>{job.status.replace('_', ' ').toUpperCase()}</Badge>
                <Badge colorScheme="green">{job.vanSize}</Badge>
              </HStack>
              <Heading size="lg">Job Details</Heading>
            </VStack>
            {job.status === 'available' && (
              <Button
                colorScheme="blue"
                size="lg"
                onClick={claimJob}
                isLoading={claiming}
                loadingText="Claiming..."
              >
                Claim Job
              </Button>
            )}
          </HStack>
        </Box>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
          {/* Main Content */}
          <VStack spacing={6} align="stretch">
            {/* Job Overview */}
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Job Overview</Heading>
                  <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                    <GridItem>
                      <Stat>
                        <StatLabel>Pickup Address</StatLabel>
                        <StatNumber fontSize="sm">{job.pickupAddress}</StatNumber>
                      </Stat>
                    </GridItem>
                    <GridItem>
                      <Stat>
                        <StatLabel>Drop-off Address</StatLabel>
                        <StatNumber fontSize="sm">{job.dropoffAddress}</StatNumber>
                      </Stat>
                    </GridItem>
                  </Grid>
                  <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={4}>
                    <GridItem>
                      <Stat>
                        <StatLabel>Date & Time</StatLabel>
                        <StatNumber fontSize="sm">{job.preferredDate} {job.timeSlot}</StatNumber>
                      </Stat>
                    </GridItem>
                    <GridItem>
                      <Stat>
                        <StatLabel>Distance</StatLabel>
                        <StatNumber fontSize="sm">{formatDistance(job.distance)}</StatNumber>
                      </Stat>
                    </GridItem>
                    <GridItem>
                      <Stat>
                        <StatLabel>Duration</StatLabel>
                        <StatNumber fontSize="sm">{formatDuration(job.estimatedDuration)}</StatNumber>
                      </Stat>
                    </GridItem>
                  </Grid>
                </VStack>
              </CardBody>
            </Card>

            {/* Items to Move */}
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Items to Move</Heading>
                  <List spacing={3}>
                    {job.items.map((item, index) => (
                      <ListItem key={index}>
                        <HStack>
                          <ListIcon as={HiCheckCircle} color="green.500" />
                          <Text>{item.quantity}x {item.name}</Text>
                          <Badge colorScheme="gray" size="sm">{item.category}</Badge>
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                </VStack>
              </CardBody>
            </Card>

            {/* Special Instructions */}
            {job.specialInstructions && (
              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">Special Instructions</Heading>
                    <Text>{job.specialInstructions}</Text>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </VStack>

          {/* Sidebar */}
          <VStack spacing={6} align="stretch">
            {/* Payment */}
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Payment</Heading>
                  <Stat>
                    <StatLabel>Total Amount</StatLabel>
                    <StatNumber fontSize="2xl" color="green.500">{formatCurrency(job.amountPence)}</StatNumber>
                  </Stat>
                </VStack>
              </CardBody>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Customer</Heading>
                  <VStack spacing={2} align="start">
                    <Text fontWeight="medium">{job.customer.name}</Text>
                    <Text fontSize="sm">{job.customer.phone}</Text>
                    <Text fontSize="sm">{job.customer.email}</Text>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Job Timeline */}
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Timeline</Heading>
                  <VStack spacing={2} align="start">
                    <HStack>
                      <Text fontSize="sm" color="gray.500">Created:</Text>
                      <Text fontSize="sm">{new Date(job.createdAt).toLocaleDateString()}</Text>
                    </HStack>
                    {job.claimedAt && (
                      <HStack>
                        <Text fontSize="sm" color="gray.500">Claimed:</Text>
                        <Text fontSize="sm">{new Date(job.claimedAt).toLocaleDateString()}</Text>
                      </HStack>
                    )}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Grid>
      </VStack>
    </Box>
  );
}
