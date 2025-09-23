'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  Spinner,
  Box,
  Button,
  Badge,
  HStack,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Icon,
  Flex
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaClock, FaPoundSign, FaBox, FaUser, FaPhone } from 'react-icons/fa';

interface Job {
  id: string;
  bookingReference: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: {
    label: string;
    postcode: string;
    lat: number;
    lng: number;
  };
  dropoffAddress: {
    label: string;
    postcode: string;
    lat: number;
    lng: number;
  };
  scheduledDate: string;
  timeSlot: string;
  estimatedDuration: number;
  distance: number;
  driverPayout: number;
  items: Array<{
    name: string;
    quantity: number;
    size: string;
  }>;
  specialInstructions: string;
  priority: 'normal' | 'high' | 'urgent';
  requiredWorkers: number;
  crewSize: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export default function DriverJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingJob, setAcceptingJob] = useState<string | null>(null);
  const toast = useToast();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/driver/jobs/available');
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.data || []);
        console.log('✅ Jobs loaded:', data.data?.length || 0);
      } else {
        setError(data.error || 'Failed to load jobs');
      }
    } catch (err) {
      console.error('❌ Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const acceptJob = async (jobId: string) => {
    try {
      setAcceptingJob(jobId);
      
      const response = await fetch(`/api/driver/jobs/${jobId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
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
        toast({
          title: 'Failed to Accept Job',
          description: data.error || 'Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('❌ Error accepting job:', err);
      toast({
        title: 'Error',
        description: 'Failed to accept job. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setAcceptingJob(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      default: return 'green';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (pence: number) => {
    return `£${(pence / 100).toFixed(2)}`;
  };

  useEffect(() => {
    fetchJobs();
    
    // Refresh jobs every 30 seconds
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading size="lg">Available Jobs</Heading>
          <Card>
            <CardBody>
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" />
                <Text>Loading available jobs...</Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading size="lg">Available Jobs</Heading>
          <Alert status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>Error Loading Jobs!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
          <Button onClick={fetchJobs} colorScheme="blue">
            Try Again
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Available Jobs</Heading>
          <Button onClick={fetchJobs} size="sm" colorScheme="blue">
            Refresh
          </Button>
        </Flex>

        {jobs.length === 0 ? (
          <Card>
            <CardBody>
              <VStack spacing={4}>
                <Text fontSize="lg" color="gray.500">
                  No available jobs at the moment
                </Text>
                <Text color="gray.400">
                  New jobs will appear here when customers place orders
                </Text>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {jobs.map((job) => (
              <Card key={job.id} borderWidth="1px" borderColor="gray.200">
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {/* Header */}
                    <Flex justify="space-between" align="start">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="lg">
                          {job.bookingReference}
                        </Text>
                        <Badge colorScheme={getPriorityColor(job.priority)}>
                          {job.priority.toUpperCase()}
                        </Badge>
                      </VStack>
                      <Text fontSize="2xl" fontWeight="bold" color="green.500">
                        {formatCurrency(job.driverPayout)}
                      </Text>
                    </Flex>

                    <Divider />

                    {/* Customer Info */}
                    <VStack spacing={2} align="stretch">
                      <HStack>
                        <Icon as={FaUser} color="blue.500" />
                        <Text fontWeight="medium">{job.customerName}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FaPhone} color="blue.500" />
                        <Text>{job.customerPhone || 'No phone provided'}</Text>
                      </HStack>
                    </VStack>

                    <Divider />

                    {/* Addresses */}
                    <VStack spacing={3} align="stretch">
                      <Box>
                        <HStack mb={1}>
                          <Icon as={FaMapMarkerAlt} color="green.500" />
                          <Text fontWeight="medium" color="green.600">Pickup</Text>
                        </HStack>
                        <Text fontSize="sm" pl={6}>
                          {job.pickupAddress.label}
                        </Text>
                        <Text fontSize="xs" color="gray.500" pl={6}>
                          {job.pickupAddress.postcode}
                        </Text>
                      </Box>

                      <Box>
                        <HStack mb={1}>
                          <Icon as={FaMapMarkerAlt} color="red.500" />
                          <Text fontWeight="medium" color="red.600">Dropoff</Text>
                        </HStack>
                        <Text fontSize="sm" pl={6}>
                          {job.dropoffAddress.label}
                        </Text>
                        <Text fontSize="xs" color="gray.500" pl={6}>
                          {job.dropoffAddress.postcode}
                        </Text>
                      </Box>
                    </VStack>

                    <Divider />

                    {/* Job Details */}
                    <VStack spacing={2} align="stretch">
                      <HStack>
                        <Icon as={FaClock} color="blue.500" />
                        <Text fontSize="sm">
                          {formatDate(job.scheduledDate)}
                        </Text>
                      </HStack>
                      <HStack>
                        <Text fontSize="sm" color="gray.600">
                          Duration: ~{job.estimatedDuration} mins
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Distance: {job.distance} miles
                        </Text>
                      </HStack>
                      <HStack>
                        <Text fontSize="sm" color="gray.600">
                          Workers: {job.requiredWorkers || 1}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Crew: {job.crewSize || 'TWO'}
                        </Text>
                      </HStack>
                    </VStack>

                    {/* Items */}
                    {job.items && job.items.length > 0 && (
                      <>
                        <Divider />
                        <Box>
                          <HStack mb={2}>
                            <Icon as={FaBox} color="purple.500" />
                            <Text fontWeight="medium">Items</Text>
                          </HStack>
                          <VStack spacing={1} align="stretch">
                            {job.items.map((item, index) => (
                              <Text key={index} fontSize="sm" pl={6}>
                                {item.quantity}x {item.name}
                              </Text>
                            ))}
                          </VStack>
                        </Box>
                      </>
                    )}

                    {/* Action Buttons */}
                    <VStack spacing={2} w="full">
                      <Button
                        colorScheme="green"
                        size="lg"
                        onClick={() => acceptJob(job.id)}
                        isLoading={acceptingJob === job.id}
                        loadingText="Accepting..."
                        w="full"
                      >
                        Accept Job
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/driver/jobs/${job.id}`, '_blank')}
                        w="full"
                      >
                        View Details
                      </Button>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
}
