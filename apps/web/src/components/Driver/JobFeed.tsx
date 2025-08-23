"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Select,
  Input,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  IconButton,
  Tooltip,
  Divider
} from "@chakra-ui/react";
import { FiMapPin, FiClock, FiTruck, FiUsers, FiDollarSign, FiFilter, FiRefreshCw } from "react-icons/fi";
import { queueJobClaim, queueJobDecline, offlineFetch } from "@/lib/offline";

interface Job {
  id: string;
  reference: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  scheduledAt: string;
  timeSlot?: string; // Made optional as field removed from schema
  vanSize?: string; // Made optional as field removed from schema
  crewSize?: number;
  totalGBP: number;
  distance?: number;
  distanceMeters?: number;
  durationSeconds?: number;
  stairsFloors?: number;
  assembly?: boolean;
  packingMaterials?: boolean;
  heavyItems?: boolean;
  createdAt: string;
}

interface JobFeedProps {
  onJobClaimed?: (jobId: string) => void;
}

export default function JobFeed({ onJobClaimed }: JobFeedProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingJob, setClaimingJob] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filters, setFilters] = useState({
    radius: 700, // Changed from 50km to 700 miles
    date: ""
    // Removed vehicleType and timeSlot as these fields no longer exist in the schema
  });
  const [error, setError] = useState<string | null>(null);
  const [blockingReason, setBlockingReason] = useState<string | null>(null);
  
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    setBlockingReason(null);
    
    try {
      const params = new URLSearchParams();
      if (filters.radius) params.append('radius', filters.radius.toString());
      if (filters.date) params.append('date', filters.date);

      const response = await fetch(`/api/driver/jobs/available?${params}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setBlockingReason(data.reason);
          setError(data.error);
        } else {
          setError(data.error || "Failed to fetch jobs");
        }
        return;
      }

      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const claimJob = async (jobId: string) => {
    setClaimingJob(jobId);
    try {
      // Use offline-aware job claiming
      const response = await offlineFetch(`/api/driver/jobs/${jobId}/claim`, {
        method: 'POST'
      }, 'job_claim');
      
      const data = await response.json();
      
      if (response.ok || response.status === 202) {
        const isQueued = data.queued;
        
        toast({
          title: isQueued ? "Job Claim Queued" : "Job Claimed!",
          description: isQueued 
            ? "Your job claim will be processed when connection is restored"
            : data.message,
          status: isQueued ? "info" : "success",
          duration: 5000,
          isClosable: true,
        });
        
        // Remove the job from the list if not queued
        if (!isQueued) {
          setJobs(prev => prev.filter(job => job.id !== jobId));
          
          if (onJobClaimed) {
            onJobClaimed(jobId);
          }
        }
      } else {
        if (response.status === 409) {
          toast({
            title: "Job Already Claimed",
            description: data.error,
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
          // Refresh the job list to remove claimed jobs
          fetchJobs();
        } else {
          toast({
            title: "Error",
            description: data.error,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error("Error claiming job:", error);
      toast({
        title: "Error",
        description: "Failed to claim job",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setClaimingJob(null);
    }
  };

  const openJobDetails = (job: Job) => {
    setSelectedJob(job);
    onOpen();
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return "Unknown";
    return `${distance.toFixed(1)} miles`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (timeSlot: string) => {
    const timeMap: { [key: string]: string } = {
      'am': 'Morning',
      'pm': 'Afternoon',
      'evening': 'Evening'
    };
    return timeMap[timeSlot] || timeSlot;
  };

  if (blockingReason) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Box flex="1">
          <AlertTitle>Cannot View Jobs</AlertTitle>
          <AlertDescription>
            {error}
            {blockingReason === 'onboarding_incomplete' && (
              <Text mt={2}>Please complete your onboarding process first.</Text>
            )}
            {blockingReason === 'expired_documents' && (
              <Text mt={2}>Please renew your expired documents to continue.</Text>
            )}
            {blockingReason === 'expired_license' && (
              <Text mt={2}>Please renew your driver license to continue.</Text>
            )}
            {blockingReason === 'expired_insurance' && (
              <Text mt={2}>Please renew your insurance to continue.</Text>
            )}
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Filters */}
      <Card mb={6}>
        <CardBody>
          <VStack spacing={4}>
            <HStack justify="space-between" width="full">
              <Text fontWeight="bold">Filters</Text>
              <HStack>
                <Tooltip label="Refresh jobs">
                  <IconButton
                    aria-label="Refresh jobs"
                    icon={<FiRefreshCw />}
                    size="sm"
                    onClick={fetchJobs}
                    isLoading={loading}
                  />
                </Tooltip>
              </HStack>
            </HStack>
            
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4} width="full">
              <FormControl>
                <FormLabel fontSize="sm">Radius (miles)</FormLabel>
                <Select
                  value={filters.radius}
                  onChange={(e) => setFilters(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                  size="sm"
                >
                  <option value={100}>100 miles</option>
                  <option value={250}>250 miles</option>
                  <option value={500}>500 miles</option>
                  <option value={700}>700 miles</option>
                  <option value={1000}>1000 miles</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Date</FormLabel>
                <Input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                  size="sm"
                />
              </FormControl>
            </Grid>
          </VStack>
        </CardBody>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Jobs List */}
      {loading ? (
        <Box textAlign="center" py={8}>
          <Spinner size="lg" />
          <Text mt={4}>Loading available jobs...</Text>
        </Box>
      ) : jobs.length === 0 ? (
        <Card>
          <CardBody textAlign="center" py={8}>
            <Text color="gray.600">No jobs available in your area.</Text>
            <Text color="gray.500" fontSize="sm" mt={2}>
              Make sure you're online and in a service area.
            </Text>
          </CardBody>
        </Card>
      ) : (
        <VStack spacing={4} align="stretch">
          {jobs.map((job) => (
            <Card key={job.id} _hover={{ shadow: "md" }} transition="all 0.2s">
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  {/* Header */}
                  <HStack justify="space-between">
                    <HStack>
                      <Text fontWeight="bold" fontSize="lg">Job #{job.reference}</Text>
                      <Badge colorScheme="green" fontSize="sm">
                        £{(job.totalGBP / 100).toFixed(2)}
                      </Badge>
                    </HStack>
                    {job.distance && (
                      <Badge colorScheme="blue" fontSize="sm">
                        {formatDistance(job.distance)}
                      </Badge>
                    )}
                  </HStack>

                  {/* Job Details */}
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                    <VStack align="start" spacing={2}>
                      <HStack>
                        <FiMapPin color="gray" />
                        <Text fontSize="sm" fontWeight="medium">Pickup</Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.700" pl={6}>
                        {job.pickupAddress}
                      </Text>
                      
                      <HStack>
                        <FiMapPin color="gray" />
                        <Text fontSize="sm" fontWeight="medium">Dropoff</Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.700" pl={6}>
                        {job.dropoffAddress}
                      </Text>
                    </VStack>

                    <VStack align="start" spacing={2}>
                      <HStack>
                        <FiClock color="gray" />
                        <Text fontSize="sm" fontWeight="medium">Schedule</Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.700" pl={6}>
                        {formatDate(job.scheduledAt)} • {formatTime(job.timeSlot || "")}
                      </Text>

                      <HStack>
                        <FiTruck color="gray" />
                        <Text fontSize="sm" fontWeight="medium">Vehicle</Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.700" pl={6}>
                        {job.vanSize || "Not specified"} {job.crewSize && `• ${job.crewSize} crew`}
                      </Text>

                      {job.distanceMeters && job.durationSeconds && (
                        <>
                          <HStack>
                            <FiMapPin color="gray" />
                            <Text fontSize="sm" fontWeight="medium">Route</Text>
                          </HStack>
                          <Text fontSize="sm" color="gray.700" pl={6}>
                            {Math.round(job.distanceMeters / 1000)} km • {formatDuration(job.durationSeconds)}
                          </Text>
                        </>
                      )}
                    </VStack>
                  </Grid>

                  {/* Extras */}
                  {(job.stairsFloors || job.assembly || job.packingMaterials || job.heavyItems) && (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Extras:</Text>
                      <HStack spacing={2} flexWrap="wrap">
                        {job.stairsFloors && (
                          <Badge size="sm" colorScheme="orange">
                            {job.stairsFloors} floors
                          </Badge>
                        )}
                        {job.assembly && (
                          <Badge size="sm" colorScheme="purple">
                            Assembly
                          </Badge>
                        )}
                        {job.packingMaterials && (
                          <Badge size="sm" colorScheme="teal">
                            Packing
                          </Badge>
                        )}
                        {job.heavyItems && (
                          <Badge size="sm" colorScheme="red">
                            Heavy Items
                          </Badge>
                        )}
                      </HStack>
                    </Box>
                  )}

                  <Divider />

                  {/* Actions */}
                  <HStack justify="space-between">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openJobDetails(job)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => claimJob(job.id)}
                      isLoading={claimingJob === job.id}
                      loadingText="Claiming..."
                    >
                      Claim Job
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}

      {/* Job Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Job Details #{selectedJob?.reference}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedJob && (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold" mb={2}>Pickup Location</Text>
                  <Text color="gray.700">{selectedJob.pickupAddress}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold" mb={2}>Dropoff Location</Text>
                  <Text color="gray.700">{selectedJob.dropoffAddress}</Text>
                </Box>

                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box>
                    <Text fontWeight="bold" mb={1}>Date</Text>
                    <Text color="gray.700">{formatDate(selectedJob.scheduledAt)}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={1}>Time</Text>
                    <Text color="gray.700">{formatTime(selectedJob.timeSlot || "")}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={1}>Vehicle</Text>
                    <Text color="gray.700">{selectedJob.vanSize || "Not specified"}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={1}>Crew</Text>
                    <Text color="gray.700">{selectedJob.crewSize || "Not specified"}</Text>
                  </Box>
                </Grid>

                {selectedJob.distance && (
                  <Box>
                    <Text fontWeight="bold" mb={1}>Distance from you</Text>
                    <Text color="gray.700">{formatDistance(selectedJob.distance)}</Text>
                  </Box>
                )}

                <Box>
                  <Text fontWeight="bold" mb={2}>Payment</Text>
                  <Text fontSize="xl" color="green.600" fontWeight="bold">
                    £{(selectedJob.totalGBP / 100).toFixed(2)}
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => {
                if (selectedJob) {
                  claimJob(selectedJob.id);
                  onClose();
                }
              }}
              isLoading={claimingJob === selectedJob?.id}
              loadingText="Claiming..."
            >
              Claim This Job
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
