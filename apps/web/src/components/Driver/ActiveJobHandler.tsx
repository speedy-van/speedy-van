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
  Heading
} from "@chakra-ui/react";
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
  FiFileText
} from "react-icons/fi";
import { queueJobProgress, offlineFetch } from "@/lib/offline";

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
  jobId: string;
  status: string;
  currentStep: string;
  completedSteps: string[];
  progressPercentage: number;
  stepOrder: string[];
  events: JobEvent[];
  job: {
    reference: string;
    pickupAddress: string;
    dropoffAddress: string;
    pickupLat?: number;
    pickupLng?: number;
    dropoffLat?: number;
    dropoffLng?: number;
    scheduledAt: string;
    timeSlot: string;
    vanSize: string;
    totalGBP: number;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    specialInstructions?: string;
    photos?: any;
    extras?: any;
  };
}

interface ActiveJobHandlerProps {
  onJobCompleted?: (jobId: string) => void;
}

const stepConfig = {
  navigate_to_pickup: {
    title: "Navigate to Pickup",
    description: "Start navigation to pickup location",
    icon: FiNavigation,
    color: "blue",
    requiresMedia: false,
    requiresNotes: false
  },
  arrived_at_pickup: {
    title: "Arrived at Pickup",
    description: "Confirm arrival at pickup location",
    icon: FiMapPin,
    color: "green",
    requiresMedia: false,
    requiresNotes: false
  },
  loading_started: {
    title: "Loading Started",
    description: "Begin loading items",
    icon: FiPackage,
    color: "orange",
    requiresMedia: false,
    requiresNotes: false
  },
  loading_completed: {
    title: "Loading Completed",
    description: "All items loaded and secured",
    icon: FiCheck,
    color: "green",
    requiresMedia: true,
    requiresNotes: true,
    mediaDescription: "Take photos of loaded items"
  },
  en_route_to_dropoff: {
    title: "En Route to Dropoff",
    description: "Start navigation to dropoff location",
    icon: FiTruck,
    color: "blue",
    requiresMedia: false,
    requiresNotes: false
  },
  arrived_at_dropoff: {
    title: "Arrived at Dropoff",
    description: "Confirm arrival at dropoff location",
    icon: FiHome,
    color: "green",
    requiresMedia: false,
    requiresNotes: false
  },
  unloading_started: {
    title: "Unloading Started",
    description: "Begin unloading items",
    icon: FiPackage,
    color: "orange",
    requiresMedia: false,
    requiresNotes: false
  },
  unloading_completed: {
    title: "Unloading Completed",
    description: "All items unloaded",
    icon: FiCheck,
    color: "green",
    requiresMedia: true,
    requiresNotes: true,
    mediaDescription: "Take photos of unloaded items"
  },
  job_completed: {
    title: "Job Completed",
    description: "Job successfully completed",
    icon: FiCheck,
    color: "green",
    requiresMedia: false,
    requiresNotes: false
  }
};

export default function ActiveJobHandler({ onJobCompleted }: ActiveJobHandlerProps) {
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    checkForActiveJob();
    const interval = setInterval(checkForActiveJob, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const checkForActiveJob = async () => {
    try {
      const response = await fetch('/api/driver/jobs/active');
      if (response.ok) {
        const data = await response.json();
        setActiveJob(data.activeJob);
      }
    } catch (error) {
      console.error("Error checking for active job:", error);
    }
  };

  const handleStepAction = (step: string) => {
    setSelectedStep(step);
    setMediaUrls([]);
    setNotes("");
    onOpen();
  };

  const handleCompleteStep = async () => {
    if (!selectedStep || !activeJob) return;

    const config = stepConfig[selectedStep as keyof typeof stepConfig];
    if (!config) return;

    // Validate requirements
    if (config.requiresMedia && mediaUrls.length === 0) {
      toast({
        title: "Media Required",
        description: (config as any).mediaDescription || "Please add photos for this step",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (config.requiresNotes && !notes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please add notes for this step",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setActionLoading(selectedStep);
    try {
      // Use offline-aware fetch
      const response = await offlineFetch(
        `/api/driver/jobs/${activeJob.id}/progress`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            step: selectedStep,
            mediaUrls,
            notes: notes.trim() || null
          })
        },
        'job_progress'
      );

      const data = await response.json();

      if (response.ok || response.status === 202) {
        const isQueued = data.queued;
        
        toast({
          title: isQueued ? "Step Queued" : "Step Completed!",
          description: isQueued 
            ? `${config.title} will be completed when connection is restored`
            : `${config.title} completed successfully`,
          status: isQueued ? "info" : "success",
          duration: 3000,
          isClosable: true,
        });

        // If not queued, refresh active job data
        if (!isQueued) {
          await checkForActiveJob();
          
          // If job is completed, trigger callback
          if (selectedStep === "job_completed" && onJobCompleted) {
            onJobCompleted(activeJob.jobId);
          }
        }

        onClose();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to complete step",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error completing step:", error);
      toast({
        title: "Error",
        description: "Failed to complete step",
        status: "error",
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
      month: 'short'
    });
  };

  const formatTimeSlot = (timeSlot: string) => {
    const timeMap: { [key: string]: string } = {
      'am': 'Morning',
      'pm': 'Afternoon',
      'evening': 'Evening'
    };
    return timeMap[timeSlot] || timeSlot;
  };

  if (!activeJob) {
    return null;
  }

  return (
    <>
      <Card mb={6} borderColor="green.200" borderWidth="2px">
        <CardBody>
          <VStack align="stretch" spacing={6}>
            {/* Header */}
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Heading size="md">Active Job #{activeJob.job.reference}</Heading>
                <Text fontSize="sm" color="gray.600">
                  {formatDate(activeJob.job.scheduledAt)} • {formatTimeSlot(activeJob.job.timeSlot)}
                </Text>
              </VStack>
              <Badge colorScheme="green" fontSize="lg" p={2}>
                £{(activeJob.job.totalGBP / 100).toFixed(2)}
              </Badge>
            </HStack>

            {/* Progress Bar */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="medium">Progress</Text>
                <Text fontSize="sm" fontWeight="medium">{Math.round(activeJob.progressPercentage)}%</Text>
              </HStack>
              <Progress 
                value={activeJob.progressPercentage} 
                colorScheme="green"
                size="lg"
                borderRadius="md"
              />
            </Box>

            {/* Job Details */}
            <VStack align="start" spacing={3}>
              <HStack>
                <FiMapPin color="gray" />
                <Text fontSize="sm" fontWeight="medium">Pickup</Text>
              </HStack>
              <Text fontSize="sm" color="gray.700" pl={6}>
                {activeJob.job.pickupAddress}
              </Text>
              
              <HStack>
                <FiMapPin color="gray" />
                <Text fontSize="sm" fontWeight="medium">Dropoff</Text>
              </HStack>
              <Text fontSize="sm" color="gray.700" pl={6}>
                {activeJob.job.dropoffAddress}
              </Text>

              <HStack>
                <FiTruck color="gray" />
                <Text fontSize="sm" fontWeight="medium">Vehicle</Text>
              </HStack>
              <Text fontSize="sm" color="gray.700" pl={6}>
                {activeJob.job.vanSize}
              </Text>

              {activeJob.job.contactName && (
                <>
                  <HStack>
                    <FiUser color="gray" />
                    <Text fontSize="sm" fontWeight="medium">Contact</Text>
                  </HStack>
                  <VStack align="start" pl={6} spacing={1}>
                    <Text fontSize="sm" color="gray.700">{activeJob.job.contactName}</Text>
                    {activeJob.job.contactPhone && (
                      <HStack>
                        <FiPhone size={12} />
                        <Text fontSize="sm" color="blue.600">{activeJob.job.contactPhone}</Text>
                      </HStack>
                    )}
                    {activeJob.job.contactEmail && (
                      <HStack>
                        <FiMail size={12} />
                        <Text fontSize="sm" color="blue.600">{activeJob.job.contactEmail}</Text>
                      </HStack>
                    )}
                  </VStack>
                </>
              )}

              {activeJob.job.specialInstructions && (
                <>
                  <HStack>
                    <FiFileText color="gray" />
                    <Text fontSize="sm" fontWeight="medium">Special Instructions</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.700" pl={6}>
                    {activeJob.job.specialInstructions}
                  </Text>
                </>
              )}
            </VStack>

            <Divider />

            {/* Step Actions */}
            <VStack align="stretch" spacing={3}>
              <Text fontWeight="medium" fontSize="lg">Next Steps</Text>
              
              {activeJob.stepOrder.map((step, index) => {
                const config = stepConfig[step as keyof typeof stepConfig];
                if (!config) return null;

                const isCompleted = activeJob.completedSteps.includes(step);
                const isCurrent = activeJob.currentStep === step;
                const isNext = !isCompleted && (index === 0 || activeJob.completedSteps.includes(activeJob.stepOrder[index - 1]));

                return (
                  <Button
                    key={step}
                    leftIcon={<config.icon />}
                    colorScheme={isCompleted ? "green" : isCurrent ? "blue" : "gray"}
                    variant={isCompleted ? "solid" : isCurrent ? "solid" : "outline"}
                    onClick={() => isNext && handleStepAction(step)}
                    isDisabled={!isNext}
                    justifyContent="start"
                    h="auto"
                    py={3}
                  >
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack justify="space-between" w="100%">
                        <Text fontWeight="medium">{config.title}</Text>
                        {isCompleted && <FiCheck />}
                      </HStack>
                      <Text fontSize="sm" color="gray.600">{config.description}</Text>
                    </VStack>
                  </Button>
                );
              })}
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Step Completion Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedStep && stepConfig[selectedStep as keyof typeof stepConfig]?.title}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text>{selectedStep && stepConfig[selectedStep as keyof typeof stepConfig]?.description}</Text>

              {/* Media Upload Section */}
              {selectedStep && stepConfig[selectedStep as keyof typeof stepConfig]?.requiresMedia && (
                <Box>
                  <Text fontWeight="medium" mb={3}>
                    {(stepConfig[selectedStep as keyof typeof stepConfig] as any)?.mediaDescription || "Add Photos"}
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
                            position="absolute"
                            top={2}
                            right={2}
                            onClick={() => removeMedia(index)}
                          />
                        </Box>
                      ))}
                    </SimpleGrid>
                  )}
                </Box>
              )}

              {/* Notes Section */}
              {selectedStep && stepConfig[selectedStep as keyof typeof stepConfig]?.requiresNotes && (
                <Box>
                  <Text fontWeight="medium" mb={3}>Notes</Text>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
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
    </>
  );
}
