'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  Progress,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Image,
  SimpleGrid,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Spinner,
  Flex,
  Heading,
  Container,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiMapPin,
  FiClock,
  FiTruck,
  FiDollarSign,
  FiCamera,
  FiCheck,
  FiX,
  FiNavigation,
  FiPackage,
  FiHome,
  FiUser,
  FiPhone,
  FiMail,
  FiMessageSquare,
  FiFileText,
  FiArrowLeft,
  FiShare2,
  FiCopy,
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import LiveMap from '@/components/Map/LiveMap';
import NavigationPanel from '@/components/Driver/NavigationPanel';

interface JobEvent {
  id: string;
  step: string;
  payload?: any;
  mediaUrls: string[];
  notes?: string;
  createdAt: string;
}

interface ActiveJob {
  id: string;
  status: string;
  currentStep: string;
  completedSteps: string[];
  progressPercentage: number;
  stepOrder: string[];
  events: JobEvent[];
  job: {
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
    totalGBP: number;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    specialInstructions?: string;
    photos?: any;
    extras?: any;
  };
}

const stepConfig = {
  navigate_to_pickup: {
    title: 'Navigate to Pickup',
    description: 'Start navigation to pickup location',
    icon: FiNavigation,
    color: 'blue',
    requiresMedia: false,
    requiresNotes: false,
    mediaDescription: 'Add Photos',
  },
  arrived_at_pickup: {
    title: 'Arrived at Pickup',
    description: 'Confirm arrival at pickup location',
    icon: FiMapPin,
    color: 'green',
    requiresMedia: false,
    requiresNotes: false,
    mediaDescription: 'Add Photos',
  },
  loading_started: {
    title: 'Loading Started',
    description: 'Begin loading items',
    icon: FiPackage,
    color: 'orange',
    requiresMedia: false,
    requiresNotes: false,
    mediaDescription: 'Add Photos',
  },
  loading_completed: {
    title: 'Loading Completed',
    description: 'All items loaded and secured',
    icon: FiCheck,
    color: 'green',
    requiresMedia: true,
    requiresNotes: true,
    mediaDescription: 'Take photos of loaded items',
  },
  en_route_to_dropoff: {
    title: 'En Route to Dropoff',
    description: 'Start navigation to dropoff location',
    icon: FiTruck,
    color: 'blue',
    requiresMedia: false,
    requiresNotes: false,
    mediaDescription: 'Add Photos',
  },
  arrived_at_dropoff: {
    title: 'Arrived at Dropoff',
    description: 'Confirm arrival at dropoff location',
    icon: FiHome,
    color: 'green',
    requiresMedia: false,
    requiresNotes: false,
    mediaDescription: 'Add Photos',
  },
  unloading_started: {
    title: 'Unloading Started',
    description: 'Begin unloading items',
    icon: FiPackage,
    color: 'orange',
    requiresMedia: false,
    requiresNotes: false,
    mediaDescription: 'Add Photos',
  },
  unloading_completed: {
    title: 'Unloading Completed',
    description: 'All items unloaded',
    icon: FiCheck,
    color: 'green',
    requiresMedia: true,
    requiresNotes: true,
    mediaDescription: 'Take photos of unloaded items',
  },
  job_completed: {
    title: 'Job Completed',
    description: 'Job successfully completed',
    icon: FiCheck,
    color: 'green',
    requiresMedia: false,
    requiresNotes: false,
    mediaDescription: 'Add Photos',
  },
};

export default function ActiveJobPage() {
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [routeData, setRouteData] = useState<any>(null);
  const [locationInterval, setLocationInterval] =
    useState<NodeJS.Timeout | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const router = useRouter();
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    checkForActiveJob();
  }, []);

  // Start location tracking when we have an active job
  useEffect(() => {
    if (activeJob) {
      startLocationTracking();
      fetchRouteData();
    } else {
      stopLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [activeJob]);

  const startLocationTracking = () => {
    // Clear any existing interval
    if (locationInterval) {
      clearInterval(locationInterval);
    }

    // Start location tracking every 30 seconds
    const interval = setInterval(async () => {
      try {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async position => {
              const { latitude, longitude } = position.coords;
              setDriverLocation({ lat: latitude, lng: longitude });

              // Send location update to server
              await fetch('/api/driver/location', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  latitude,
                  longitude,
                }),
              });

              // Update route data
              fetchRouteData();
            },
            error => {
              console.error('Location error:', error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 30000,
            }
          );
        }
      } catch (error) {
        console.error('Error updating location:', error);
      }
    }, 30000);

    setLocationInterval(interval);
  };

  const stopLocationTracking = () => {
    if (locationInterval) {
      clearInterval(locationInterval);
      setLocationInterval(null);
    }
  };

  const fetchRouteData = async () => {
    if (!activeJob) return;

    try {
      const response = await fetch(`/api/driver/jobs/${activeJob.id}/route`);
      if (response.ok) {
        const data = await response.json();
        setRouteData(data);
      }
    } catch (error) {
      console.error('Error fetching route data:', error);
    }
  };

  const copyTrackingLink = async () => {
    if (!activeJob) return;

    const trackingUrl = `${window.location.origin}/track?code=${activeJob.job.reference}`;

    try {
      await navigator.clipboard.writeText(trackingUrl);
      toast({
        title: 'Tracking Link Copied',
        description: 'The tracking link has been copied to your clipboard',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy tracking link',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const shareTrackingLink = async () => {
    if (!activeJob) return;

    const trackingUrl = `${window.location.origin}/track?code=${activeJob.job.reference}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Track Your Delivery',
          text: `Track your delivery with code ${activeJob.job.reference}`,
          url: trackingUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying
      await copyTrackingLink();
    }
  };

  const checkForActiveJob = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/driver/jobs/active');
      if (response.ok) {
        const data = await response.json();
        setActiveJob(data.activeJob);

        if (!data.activeJob) {
          // No active job, redirect to jobs page
          router.push('/driver/jobs');
        }
      }
    } catch (error) {
      console.error('Error checking for active job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepAction = (step: string) => {
    setSelectedStep(step);
    setMediaUrls([]);
    setNotes('');
    onOpen();
  };

  const handleCompleteStep = async () => {
    if (!selectedStep || !activeJob) return;

    const config = stepConfig[selectedStep as keyof typeof stepConfig];
    if (!config) return;

    // Validate requirements
    if (config.requiresMedia && mediaUrls.length === 0) {
      toast({
        title: 'Media Required',
        description:
          config.mediaDescription || 'Please add photos for this step',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (config.requiresNotes && !notes.trim()) {
      toast({
        title: 'Notes Required',
        description: 'Please add notes for this step',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setActionLoading(selectedStep);
    try {
      const response = await fetch(
        `/api/driver/jobs/${activeJob.id}/progress`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            step: selectedStep,
            mediaUrls,
            notes: notes.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Step Completed!',
          description: `${config.title} completed successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Refresh active job data
        await checkForActiveJob();

        // If job is completed, redirect to jobs page
        if (selectedStep === 'job_completed') {
          setTimeout(() => {
            router.push('/driver/jobs');
          }, 2000);
        }

        onClose();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to complete step',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error completing step:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete step',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleMediaUpload = () => {
    // TODO: Implement actual file upload to cloud storage
    // For now, simulate with placeholder URLs
    const newUrl = `https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Photo+${mediaUrls.length + 1}`;
    setMediaUrls([...mediaUrls, newUrl]);
  };

  const removeMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTimeSlot = (timeSlot: string) => {
    const timeMap: { [key: string]: string } = {
      am: 'Morning',
      pm: 'Afternoon',
      evening: 'Evening',
    };
    return timeMap[timeSlot] || timeSlot;
  };

  if (loading) {
    return (
      <Box
        minH={{ base: '100dvh', md: '100vh' }}
        bg={bgColor}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading active job...</Text>
        </VStack>
      </Box>
    );
  }

  if (!activeJob) {
    return (
      <Box
        minH={{ base: '100dvh', md: '100vh' }}
        bg={bgColor}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Text>No active job found</Text>
          <Button onClick={() => router.push('/driver/jobs')}>
            Back to Jobs
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH={{ base: '100dvh', md: '100vh' }} bg={bgColor}>
      <Container maxW="container.lg" py={6}>
        {/* Header */}
        <HStack mb={6} justify="space-between">
          <Button
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            onClick={() => router.push('/driver/jobs')}
          >
            Back to Jobs
          </Button>
          <Badge colorScheme="green" fontSize="lg" p={2}>
            £{(activeJob.job.totalGBP / 100).toFixed(2)}
          </Badge>
        </HStack>

        <VStack spacing={6} align="stretch">
          {/* Job Header */}
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Heading size="lg">Job #{activeJob.job.reference}</Heading>
                    <Text fontSize="md" color="gray.600">
                      {formatDate(activeJob.job.scheduledAt)} •{' '}
                      {formatTimeSlot(activeJob.job.timeSlot || '')}
                    </Text>
                  </VStack>
                </HStack>

                {/* Progress Bar */}
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="md" fontWeight="medium">
                      Progress
                    </Text>
                    <Text fontSize="md" fontWeight="medium">
                      {Math.round(activeJob.progressPercentage)}%
                    </Text>
                  </HStack>
                  <Progress
                    value={activeJob.progressPercentage}
                    colorScheme="green"
                    size="lg"
                    borderRadius="md"
                  />
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Live Map and Navigation */}
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Live Tracking</Heading>

                <LiveMap
                  driverLocation={driverLocation || undefined}
                  pickupLocation={
                    activeJob.job.pickupLat && activeJob.job.pickupLng
                      ? {
                          lat: activeJob.job.pickupLat,
                          lng: activeJob.job.pickupLng,
                          label: 'Pickup',
                        }
                      : undefined
                  }
                  dropoffLocation={
                    activeJob.job.dropoffLat && activeJob.job.dropoffLng
                      ? {
                          lat: activeJob.job.dropoffLat,
                          lng: activeJob.job.dropoffLng,
                          label: 'Dropoff',
                        }
                      : undefined
                  }
                  route={
                    routeData?.route
                      ? {
                          coordinates: [
                            [
                              driverLocation?.lng || 0,
                              driverLocation?.lat || 0,
                            ],
                            [
                              activeJob.job.pickupLng || 0,
                              activeJob.job.pickupLat || 0,
                            ],
                            [
                              activeJob.job.dropoffLng || 0,
                              activeJob.job.dropoffLat || 0,
                            ],
                          ],
                          distance: routeData.route.totalDistance,
                          duration: routeData.route.totalDuration,
                        }
                      : undefined
                  }
                  showNavigation={true}
                  onNavigateToPickup={() => {
                    if (routeData?.navigation?.pickupUrl?.universal) {
                      window.open(
                        routeData.navigation.pickupUrl.universal,
                        '_blank'
                      );
                    }
                  }}
                  onNavigateToDropoff={() => {
                    if (routeData?.navigation?.dropoffUrl?.universal) {
                      window.open(
                        routeData.navigation.dropoffUrl.universal,
                        '_blank'
                      );
                    }
                  }}
                  height={400}
                />
              </VStack>
            </CardBody>
          </Card>

          {/* Navigation Panel */}
          <NavigationPanel
            assignmentId={activeJob.id}
            pickupAddress={activeJob.job.pickupAddress}
            dropoffAddress={activeJob.job.dropoffAddress}
            currentStep={activeJob.currentStep}
            onRefresh={fetchRouteData}
          />

          {/* Tracking Link Sharing */}
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Heading size="md">Share Tracking</Heading>
                  <Badge colorScheme="blue" variant="subtle">
                    {activeJob.job.reference}
                  </Badge>
                </HStack>

                <Text fontSize="sm" color="gray.600">
                  Share this tracking link with your customer so they can track
                  the delivery in real-time.
                </Text>

                <HStack spacing={3}>
                  <Button
                    leftIcon={<FiShare2 />}
                    onClick={shareTrackingLink}
                    colorScheme="blue"
                    flex={1}
                  >
                    Share Link
                  </Button>
                  <Button
                    leftIcon={<FiCopy />}
                    onClick={copyTrackingLink}
                    variant="outline"
                    flex={1}
                  >
                    Copy Link
                  </Button>
                </HStack>

                <Box
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <Text fontSize="sm" fontFamily="mono" wordBreak="break-all">
                    {`${typeof window !== 'undefined' ? window.location.origin : ''}/track?code=${activeJob.job.reference}`}
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Job Details */}
          <Card>
            <CardBody>
              <VStack align="start" spacing={4}>
                <Heading size="md">Job Details</Heading>

                <VStack align="start" spacing={3} w="100%">
                  <HStack>
                    <FiMapPin color="gray" />
                    <Text fontSize="md" fontWeight="medium">
                      Pickup
                    </Text>
                  </HStack>
                  <Text fontSize="md" color="gray.700" pl={6}>
                    {activeJob.job.pickupAddress}
                  </Text>

                  <HStack>
                    <FiMapPin color="gray" />
                    <Text fontSize="md" fontWeight="medium">
                      Dropoff
                    </Text>
                  </HStack>
                  <Text fontSize="md" color="gray.700" pl={6}>
                    {activeJob.job.dropoffAddress}
                  </Text>

                  <HStack>
                    <FiTruck color="gray" />
                    <Text fontSize="md" fontWeight="medium">
                      Vehicle
                    </Text>
                  </HStack>
                  <Text fontSize="md" color="gray.700" pl={6}>
                    {activeJob.job.vanSize || 'N/A'}
                  </Text>

                  {activeJob.job.contactName && (
                    <>
                      <HStack>
                        <FiUser color="gray" />
                        <Text fontSize="md" fontWeight="medium">
                          Contact
                        </Text>
                      </HStack>
                      <VStack align="start" pl={6} spacing={2}>
                        <Text fontSize="md" color="gray.700">
                          {activeJob.job.contactName}
                        </Text>
                        {activeJob.job.contactPhone && (
                          <HStack>
                            <FiPhone size={16} />
                            <Text fontSize="md" color="blue.600">
                              {activeJob.job.contactPhone}
                            </Text>
                          </HStack>
                        )}
                        {activeJob.job.contactEmail && (
                          <HStack>
                            <FiMail size={16} />
                            <Text fontSize="md" color="blue.600">
                              {activeJob.job.contactEmail}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </>
                  )}

                  {activeJob.job.specialInstructions && (
                    <>
                      <HStack>
                        <FiFileText color="gray" />
                        <Text fontSize="md" fontWeight="medium">
                          Special Instructions
                        </Text>
                      </HStack>
                      <Text fontSize="md" color="gray.700" pl={6}>
                        {activeJob.job.specialInstructions}
                      </Text>
                    </>
                  )}
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Step Actions */}
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Job Steps</Heading>

                <VStack align="stretch" spacing={3}>
                  {activeJob.stepOrder.map((step, index) => {
                    const config = stepConfig[step as keyof typeof stepConfig];
                    if (!config) return null;

                    const isCompleted = activeJob.completedSteps.includes(step);
                    const isCurrent = activeJob.currentStep === step;
                    const isNext =
                      !isCompleted &&
                      (index === 0 ||
                        activeJob.completedSteps.includes(
                          activeJob.stepOrder[index - 1]
                        ));

                    return (
                      <Button
                        key={step}
                        leftIcon={<config.icon />}
                        colorScheme={
                          isCompleted ? 'green' : isCurrent ? 'blue' : 'gray'
                        }
                        variant={
                          isCompleted
                            ? 'solid'
                            : isCurrent
                              ? 'solid'
                              : 'outline'
                        }
                        onClick={() => isNext && handleStepAction(step)}
                        isDisabled={!isNext}
                        justifyContent="start"
                        h="auto"
                        py={4}
                        size="lg"
                      >
                        <VStack align="start" spacing={2} flex={1}>
                          <HStack justify="space-between" w="100%">
                            <Text fontWeight="medium" fontSize="md">
                              {config.title}
                            </Text>
                            {isCompleted && <FiCheck />}
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            {config.description}
                          </Text>
                        </VStack>
                      </Button>
                    );
                  })}
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Step Completion Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedStep &&
              stepConfig[selectedStep as keyof typeof stepConfig]?.title}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text>
                {selectedStep &&
                  stepConfig[selectedStep as keyof typeof stepConfig]
                    ?.description}
              </Text>

              {/* Media Upload Section */}
              {selectedStep &&
                stepConfig[selectedStep as keyof typeof stepConfig]
                  ?.requiresMedia && (
                  <Box>
                    <Text fontWeight="medium" mb={3}>
                      {stepConfig[selectedStep as keyof typeof stepConfig]
                        ?.mediaDescription || 'Add Photos'}
                    </Text>

                    <Button
                      leftIcon={<FiCamera />}
                      onClick={handleMediaUpload}
                      mb={3}
                      colorScheme="blue"
                      variant="outline"
                    >
                      Add Photo
                    </Button>

                    {mediaUrls.length > 0 && (
                      <SimpleGrid columns={2} spacing={3}>
                        {mediaUrls.map((url, index) => (
                          <Box key={index} position="relative">
                            <Image
                              src={url}
                              alt={`Photo ${index + 1}`}
                              borderRadius="md"
                              w="100%"
                              h="150px"
                              objectFit="cover"
                            />
                            <IconButton
                              aria-label="Remove photo"
                              icon={<FiX />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => removeMedia(index)}
                              sx={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                              }}
                            />
                          </Box>
                        ))}
                      </SimpleGrid>
                    )}
                  </Box>
                )}

              {/* Notes Section */}
              {selectedStep &&
                stepConfig[selectedStep as keyof typeof stepConfig]
                  ?.requiresNotes && (
                  <Box>
                    <Text fontWeight="medium" mb={3}>
                      Notes
                    </Text>
                    <Textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Add any relevant notes..."
                      rows={4}
                    />
                  </Box>
                )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleCompleteStep}
              isLoading={actionLoading === selectedStep}
              loadingText="Completing..."
            >
              Complete Step
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
