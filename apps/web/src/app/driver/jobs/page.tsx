'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from '@chakra-ui/react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { EnhancedJobCard } from '@/components/driver/EnhancedJobCard';
import { NoJobsMessage } from '@/components/driver/NoJobsMessage';
import { useOptimizedDataLoader } from '@/hooks/useOptimizedDataLoader';
import { useDebounce } from '@/hooks/useDebounce';

interface Job {
  id: string;
  reference: string;
  customer: string;
  customerPhone: string;
  date: string;
  time: string;
  from: string;
  to: string;
  distance: string;
  vehicleType: string;
  items: string;
  estimatedEarnings: number;
  status: string;
  priority?: string;
  duration?: string;
  crew?: string;
}

interface JobsData {
  jobs: Job[];
  total: number;
  available: number;
  assigned: number;
}

export default function DriverJobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Use optimized data loader
  const { data: jobsData, loading: isLoading, error, refetch } = useOptimizedDataLoader<JobsData>({
    endpoint: '/api/driver/jobs',
    debounceMs: 300,
    cacheKey: 'driver-jobs',
    enabled: true
  });

  // Optimized filtering with useMemo
  const filteredJobs = useMemo(() => {
    if (!jobsData?.jobs || !Array.isArray(jobsData.jobs)) return [];

    let filtered = jobsData.jobs;

    // Filter by search term
    if (debouncedSearchTerm) {
      filtered = filtered.filter(job => 
        job.customer.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        job.reference.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        job.from.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        job.to.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    return filtered;
  }, [jobsData?.jobs, debouncedSearchTerm, statusFilter]);

  // Show toast for errors
  useEffect(() => {
    if (error) {
      console.error('Driver Jobs Error:', error);
      toast({
        title: 'Error Loading Jobs',
        description: 'Failed to load jobs data. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  const handleAcceptJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/driver/jobs/${jobId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        toast({
          title: 'Job Accepted!',
          description: 'You have successfully accepted this job.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh jobs data
        refetch();
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
      <Box minH="100vh" bg="gray.50">
        <Container maxW="7xl" py={{ base: 6, md: 8 }}>
          <VStack spacing={{ base: 6, md: 8 }} align="center">
            <Spinner size="xl" color="blue.500" />
            <Text fontSize={{ base: "md", md: "lg" }}>Loading jobs...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Container maxW="7xl" py={{ base: 6, md: 8 }}>
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
      </Box>
    );
  }

  if (!jobsData) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Container maxW="7xl" py={{ base: 6, md: 8 }}>
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <AlertDescription fontSize={{ base: "sm", md: "md" }}>No jobs data available.</AlertDescription>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">

      <Container maxW="7xl" py={{ base: 6, md: 8 }}>
        <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          {/* Page Header */}
          <Box>
            <Heading size={{ base: "lg", md: "xl" }} mb={2} color="gray.800">
              All Jobs
            </Heading>
            <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
              Manage and track all your jobs in one place
            </Text>
            
            {/* Enhanced Stats */}
            <HStack spacing={4} mt={4}>
              <Badge 
                bg="blue.100" 
                color="blue.800" 
                size="lg" 
                px={4} 
                py={2}
                fontWeight="600"
                borderRadius="lg"
              >
                Total: {jobsData.total}
              </Badge>
              <Badge 
                bg="green.100" 
                color="green.800" 
                size="lg" 
                px={4} 
                py={2}
                fontWeight="600"
                borderRadius="lg"
              >
                Available: {jobsData.available}
              </Badge>
              <Badge 
                bg="orange.100" 
                color="orange.800" 
                size="lg" 
                px={4} 
                py={2}
                fontWeight="600"
                borderRadius="lg"
              >
                Assigned: {jobsData.assigned}
              </Badge>
            </HStack>
          </Box>

          {/* Enhanced Search and Filter - Separated Design */}
          <VStack spacing={4} align="stretch">
            {/* Search Box - Standalone */}
            <Box 
              bg="white" 
              p={4} 
              borderRadius="xl" 
              boxShadow="sm"
              position="sticky"
              top={{ base: "76px", md: "80px" }}
              zIndex={10}
            >
              <InputGroup>
                <InputLeftElement 
                  pointerEvents="none"
                  pl={4}
                >
                  <FaSearch color="gray.400" size="16px" />
                </InputLeftElement>
                <Input
                  placeholder="Search by customer, reference, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  borderRadius="lg"
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  pl={12}
                  fontSize="16px"
                  h="52px"
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.2)",
                    bg: "white"
                  }}
                />
              </InputGroup>
            </Box>

            {/* Filter Badges - Separate Row */}
            <HStack spacing={3} flexWrap="wrap">
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                Filter:
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                <Badge
                  colorScheme={statusFilter === 'all' ? 'blue' : 'gray'}
                  size="lg"
                  px={4}
                  py={2}
                  borderRadius="full"
                  cursor="pointer"
                  onClick={() => setStatusFilter('all')}
                  _hover={{ transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                >
                  All Status
                </Badge>
                <Badge
                  colorScheme={statusFilter === 'available' ? 'green' : 'gray'}
                  size="lg"
                  px={4}
                  py={2}
                  borderRadius="full"
                  cursor="pointer"
                  onClick={() => setStatusFilter('available')}
                  _hover={{ transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                >
                  Available
                </Badge>
                <Badge
                  colorScheme={statusFilter === 'assigned' ? 'orange' : 'gray'}
                  size="lg"
                  px={4}
                  py={2}
                  borderRadius="full"
                  cursor="pointer"
                  onClick={() => setStatusFilter('assigned')}
                  _hover={{ transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                >
                  Assigned
                </Badge>
                <Badge
                  colorScheme={statusFilter === 'accepted' ? 'blue' : 'gray'}
                  size="lg"
                  px={4}
                  py={2}
                  borderRadius="full"
                  cursor="pointer"
                  onClick={() => setStatusFilter('accepted')}
                  _hover={{ transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                >
                  Accepted
                </Badge>
                <Badge
                  colorScheme={statusFilter === 'completed' ? 'purple' : 'gray'}
                  size="lg"
                  px={4}
                  py={2}
                  borderRadius="full"
                  cursor="pointer"
                  onClick={() => setStatusFilter('completed')}
                  _hover={{ transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                >
                  Completed
                </Badge>
              </HStack>
            </HStack>
          </VStack>

          {/* Jobs List */}
          {filteredJobs.length > 0 ? (
            <Box mt={6}>
              <VStack spacing={6} align="stretch">
                {filteredJobs.map((job) => (
                  <EnhancedJobCard
                    key={job.id}
                    job={job}
                    variant={job.status === 'assigned' ? 'assigned' : 'available'}
                    onAccept={job.status === 'available' ? handleAcceptJob : undefined}
                    onViewDetails={(jobId) => window.location.href = `/driver/jobs/${jobId}`}
                    isAccepting={isLoading}
                  />
                ))}
              </VStack>
            </Box>
          ) : (
            <NoJobsMessage
              onRefresh={refetch}
              isRefreshing={isLoading}
              message={searchTerm || statusFilter !== 'all' ? "No jobs match your filters" : "No jobs available"}
              subMessage={searchTerm || statusFilter !== 'all' ? "Try adjusting your search or filter criteria" : "New jobs will appear here when customers place orders"}
            />
          )}
        </VStack>
      </Container>
    </Box>
  );
}