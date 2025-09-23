'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Button,
  Badge,
  Box,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  Flex,
  SimpleGrid,
  Progress,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Image,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react';
import { 
  FaMapMarkerAlt, 
  FaClock, 
  FaPoundSign, 
  FaBox, 
  FaUser, 
  FaPhone, 
  FaBuilding,
  FaCar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCamera,
  FaSignature,
  FaRoute,
  FaTruck,
  FaHome,
  FaFlag,
  FaInfoCircle
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface JobDetails {
  id: string;
  reference: string;
  status: string;
  assignment: {
    id: string;
    status: string;
    acceptedAt: string;
    events: Array<{
      step: string;
      completedAt: string;
      notes?: string;
      payload?: any;
    }>;
  } | null;
  customer: {
    name: string;
    email: string;
    phone: string;
    canContact: boolean;
  };
  pickup: {
    address: string;
    postcode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    property: {
      type: string;
      accessType: string;
      floors: number;
      hasElevator: boolean;
      hasParking: boolean;
      buildingTypeDisplay: string;
      flatNumber: string | null;
      parkingDetails: string;
      accessNotes: string;
    };
    zones: {
      isULEZ: boolean;
      isLEZ: boolean;
      hasCongestionCharge: boolean;
    };
  };
  dropoff: {
    address: string;
    postcode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    property: {
      type: string;
      accessType: string;
      floors: number;
      hasElevator: boolean;
      hasParking: boolean;
      buildingTypeDisplay: string;
      flatNumber: string | null;
      parkingDetails: string;
      accessNotes: string;
    };
    zones: {
      isULEZ: boolean;
      isLEZ: boolean;
      hasCongestionCharge: boolean;
    };
  };
  items: Array<{
    name: string;
    quantity: number;
    volumeM3: number;
  }>;
  scheduledAt: string;
  estimatedDuration: number;
  distance: number;
  driverPayout: number;
  crewSize: string;
  requiredWorkers: number;
  smartSuggestions: Array<{
    type: string;
    title: string;
    description: string;
    priority: string;
  }>;
}

const JOB_STEPS = [
  { id: 'navigate_to_pickup', label: 'Navigate to Pickup', icon: FaRoute, color: 'blue' },
  { id: 'arrived_at_pickup', label: 'Arrived at Pickup', icon: FaMapMarkerAlt, color: 'green' },
  { id: 'loading_started', label: 'Loading Started', icon: FaBox, color: 'orange' },
  { id: 'loading_completed', label: 'Loading Completed', icon: FaCheckCircle, color: 'green' },
  { id: 'en_route_to_dropoff', label: 'En Route to Dropoff', icon: FaTruck, color: 'blue' },
  { id: 'arrived_at_dropoff', label: 'Arrived at Dropoff', icon: FaMapMarkerAlt, color: 'green' },
  { id: 'unloading_started', label: 'Unloading Started', icon: FaBox, color: 'orange' },
  { id: 'unloading_completed', label: 'Unloading Completed', icon: FaCheckCircle, color: 'green' },
  { id: 'job_completed', label: 'Job Completed', icon: FaCheckCircle, color: 'purple' }
];

export default function DriverJobDetails({ params }: { params: { id: string } }) {
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStep, setUpdatingStep] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [stepNotes, setStepNotes] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const router = useRouter();

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/driver/jobs/${params.id}/details`);
      const data = await response.json();
      
      if (data.success) {
        setJobDetails(data.data);
        // Find the latest completed step
        const events = data.data.assignment?.events || [];
        if (events.length > 0) {
          // Get the latest event (assuming events are sorted by date desc)
          const latestEvent = events[0];
          setCurrentStep(latestEvent.step);
        } else {
          setCurrentStep(null);
        }
      } else {
        console.error('❌ Job details API error:', data);
        setError(data.error || 'Failed to load job details');
      }
    } catch (err) {
      console.error('❌ Error fetching job details:', err);
      if (err instanceof Error && err.message.includes('403')) {
        setError('You do not have access to this job. Please check your assigned jobs.');
      } else {
        setError('Failed to load job details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateJobStep = async (step: string) => {
    try {
      setUpdatingStep(step);
      
      const formData = new FormData();
      formData.append('step', step);
      formData.append('notes', stepNotes);
      
      // Add media files if any
      mediaFiles.forEach((file, index) => {
        formData.append(`media_${index}`, file);
      });
      
      const response = await fetch(`/api/driver/jobs/${params.id}/update-step`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Step Updated!',
          description: `Successfully completed: ${JOB_STEPS.find(s => s.id === step)?.label}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        setStepNotes('');
        setMediaFiles([]);
        onClose();
        await fetchJobDetails();
      } else {
        toast({
          title: 'Failed to Update Step',
          description: data.error || 'Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('❌ Error updating job step:', err);
      toast({
        title: 'Error',
        description: 'Failed to update job step. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUpdatingStep(null);
    }
  };

  const getNextStep = () => {
    if (!jobDetails?.assignment?.events || jobDetails.assignment.events.length === 0) {
      return JOB_STEPS[0];
    }
    
    // Find the last completed step
    const completedSteps = jobDetails.assignment.events.map(event => event.step);
    const lastCompletedStep = completedSteps[completedSteps.length - 1];
    
    // Find the next step after the last completed one
    const lastCompletedIndex = JOB_STEPS.findIndex(step => step.id === lastCompletedStep);
    const nextStepIndex = lastCompletedIndex + 1;
    
    return JOB_STEPS[nextStepIndex] || null;
  };

  const isStepCompleted = (stepId: string) => {
    return jobDetails?.assignment?.events?.some(event => event.step === stepId) || false;
  };

  const getStepStatus = (stepId: string) => {
    if (isStepCompleted(stepId)) return 'completed';
    
    // Check if this is the next step to be completed
    const nextStep = getNextStep();
    if (nextStep && nextStep.id === stepId) return 'current';
    
    return 'pending';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (pence: number | undefined | null) => {
    if (!pence || isNaN(pence)) return '£0.00';
    return `£${(pence / 100).toFixed(2)}`;
  };

  const getZoneInfo = (zones: any) => {
    if (!zones) return 'No zone information available';
    const zoneTypes = [];
    if (zones.isULEZ) zoneTypes.push('ULEZ');
    if (zones.isLEZ) zoneTypes.push('LEZ');
    if (zones.hasCongestionCharge) zoneTypes.push('Congestion Charge');
    return zoneTypes.length > 0 ? zoneTypes.join(', ') : 'No charges';
  };

  const getFloorInfo = (property: any) => {
    if (!property) return 'Property details not available';
    if (property.floors === 0) return 'Ground floor';
    if (property.floors > 0) return `Floor ${property.floors}`;
    return 'Customer didn\'t specify';
  };

  const calculateRequiredWorkers = (items: any[], crewSize: string) => {
    const totalVolume = items.reduce((sum, item) => sum + (item.volumeM3 * item.quantity), 0);
    const heavyItems = items.filter(item => item.volumeM3 > 0.5).length;
    
    if (crewSize === 'ONE') return 1;
    if (totalVolume > 10 || heavyItems > 3) return 2;
    return 1;
  };

  useEffect(() => {
    fetchJobDetails();
  }, [params.id]);

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <HStack>
            <Button onClick={() => router.back()} variant="ghost">
              ← Back to Jobs
            </Button>
          </HStack>
          <Card>
            <CardBody>
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" />
                <Text>Loading job details...</Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    );
  }

  if (error || !jobDetails) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <HStack>
            <Button onClick={() => router.back()} variant="ghost">
              ← Back to Jobs
            </Button>
          </HStack>
          <Alert status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>Error Loading Job!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
          <Button onClick={fetchJobDetails} colorScheme="blue">
            Try Again
          </Button>
        </VStack>
      </Container>
    );
  }

  const nextStep = getNextStep();
  const completedSteps = jobDetails.assignment?.events?.length || 0;
  const totalSteps = JOB_STEPS.length;
  const progress = Math.min(completedSteps, totalSteps); // Ensure progress doesn't exceed total steps
  const progressPercentage = (progress / totalSteps) * 100;

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={2}>
            <Button onClick={() => router.back()} variant="ghost" size="sm">
              ← Back to Jobs
            </Button>
            <Heading size="lg">{jobDetails.reference}</Heading>
            <Badge colorScheme="green" size="lg">
              {jobDetails.status}
            </Badge>
          </VStack>
          <VStack align="end" spacing={2}>
            <Text fontSize="2xl" fontWeight="bold" color="green.500">
              {formatCurrency(jobDetails.driverPayout)}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Driver Payout
            </Text>
          </VStack>
        </HStack>

        {/* Progress Bar */}
        <Card>
          <CardBody>
            <VStack spacing={4}>
              <HStack justify="space-between" w="full">
                <Text fontWeight="medium">Job Progress</Text>
                <Text fontSize="sm" color="gray.500">
                  {progress} of {totalSteps} steps completed
                </Text>
              </HStack>
              <Progress value={progressPercentage} w="full" colorScheme="green" />
            </VStack>
          </CardBody>
        </Card>

        {/* Job Steps */}
        <Card>
          <CardBody>
            <VStack spacing={4}>
              <Heading size="md">Job Steps</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} w="full">
                {JOB_STEPS.map((step, index) => {
                  const status = getStepStatus(step.id);
                  const StepIcon = step.icon;
                  
                  return (
                    <Card 
                      key={step.id} 
                      borderWidth="2px" 
                      borderColor={
                        status === 'completed' ? 'green.300' : 
                        status === 'current' ? 'blue.300' : 'gray.200'
                      }
                      bg={
                        status === 'completed' ? 'green.50' : 
                        status === 'current' ? 'blue.50' : 'white'
                      }
                    >
                      <CardBody>
                        <VStack spacing={3}>
                          <Icon 
                            as={StepIcon} 
                            color={
                              status === 'completed' ? 'green.500' : 
                              status === 'current' ? 'blue.500' : 'gray.400'
                            }
                            boxSize={6}
                          />
                          <Text 
                            fontWeight={status === 'current' ? 'bold' : 'normal'}
                            textAlign="center"
                            fontSize="sm"
                          >
                            {step.label}
                          </Text>
                          {status === 'completed' && (
                            <Icon as={FaCheckCircle} color="green.500" boxSize={4} />
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </SimpleGrid>

              {/* Next Step Button */}
              {nextStep && (
                <Button
                  colorScheme="blue"
                  size="lg"
                  leftIcon={<Icon as={nextStep.icon} />}
                  onClick={onOpen}
                  isLoading={updatingStep === nextStep.id}
                  loadingText="Updating..."
                >
                  {nextStep.label}
                </Button>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Job Information Grid */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Customer Information */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Customer Information</Heading>
                <VStack spacing={2} align="stretch">
                  <HStack>
                    <Icon as={FaUser} color="blue.500" />
                    <Text fontWeight="medium">{jobDetails.customer.name}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaPhone} color="blue.500" />
                    <Text>{jobDetails.customer.phone}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaClock} color="blue.500" />
                    <Text>{formatDate(jobDetails.scheduledAt)}</Text>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Job Summary */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Job Summary</Heading>
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text>Distance:</Text>
                    <Text fontWeight="medium">{jobDetails.distance} miles</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Duration:</Text>
                    <Text fontWeight="medium">{jobDetails.estimatedDuration} mins</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Required Workers:</Text>
                    <Text fontWeight="medium">{jobDetails.requiredWorkers}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Crew Size:</Text>
                    <Text fontWeight="medium">{jobDetails.crewSize}</Text>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Pickup Details */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="green.600">Pickup Location</Heading>
                <VStack spacing={3} align="stretch">
                  <Box>
                    <HStack mb={1}>
                      <Icon as={FaMapMarkerAlt} color="green.500" />
                      <Text fontWeight="medium">Address</Text>
                    </HStack>
                    <Text fontSize="sm" pl={6}>{jobDetails.pickup.address}</Text>
                    <Text fontSize="xs" color="gray.500" pl={6}>{jobDetails.pickup.postcode}</Text>
                  </Box>

                  <Box>
                    <HStack mb={1}>
                      <Icon as={FaBuilding} color="blue.500" />
                      <Text fontWeight="medium">Property Details</Text>
                    </HStack>
                    <Text fontSize="sm" pl={6}>
                      {jobDetails.pickup.property.type} • {jobDetails.pickup.property.accessType}
                    </Text>
                    <Text fontSize="sm" pl={6}>
                      {getFloorInfo(jobDetails.pickup.property)}
                    </Text>
                    {jobDetails.pickup.property.flatNumber && (
                      <Text fontSize="sm" pl={6}>Flat: {jobDetails.pickup.property.flatNumber}</Text>
                    )}
                    <Text fontSize="sm" pl={6}>
                      Lift: {jobDetails.pickup.property.hasElevator ? 'Available' : 'Not available'}
                    </Text>
                  </Box>

                  <Box>
                    <HStack mb={1}>
                      <Icon as={FaFlag} color="orange.500" />
                      <Text fontWeight="medium">Zones & Charges</Text>
                    </HStack>
                    <Text fontSize="sm" pl={6}>{getZoneInfo(jobDetails.pickup.zones)}</Text>
                  </Box>

                  <Box>
                    <HStack mb={1}>
                      <Icon as={FaCar} color="purple.500" />
                      <Text fontWeight="medium">Parking</Text>
                    </HStack>
                    <Text fontSize="sm" pl={6}>{jobDetails.pickup.property.parkingDetails}</Text>
                  </Box>

                  {jobDetails.pickup.property.accessNotes && (
                    <Box>
                      <HStack mb={1}>
                        <Icon as={FaInfoCircle} color="gray.500" />
                        <Text fontWeight="medium">Access Notes</Text>
                      </HStack>
                      <Text fontSize="sm" pl={6}>{jobDetails.pickup.property.accessNotes}</Text>
                    </Box>
                  )}
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Dropoff Details */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="red.600">Dropoff Location</Heading>
                <VStack spacing={3} align="stretch">
                  <Box>
                    <HStack mb={1}>
                      <Icon as={FaMapMarkerAlt} color="red.500" />
                      <Text fontWeight="medium">Address</Text>
                    </HStack>
                    <Text fontSize="sm" pl={6}>{jobDetails.dropoff.address}</Text>
                    <Text fontSize="xs" color="gray.500" pl={6}>{jobDetails.dropoff.postcode}</Text>
                  </Box>

                  <Box>
                    <HStack mb={1}>
                      <Icon as={FaBuilding} color="blue.500" />
                      <Text fontWeight="medium">Property Details</Text>
                    </HStack>
                    <Text fontSize="sm" pl={6}>
                      {jobDetails.dropoff.property.type} • {jobDetails.dropoff.property.accessType}
                    </Text>
                    <Text fontSize="sm" pl={6}>
                      {getFloorInfo(jobDetails.dropoff.property)}
                    </Text>
                    {jobDetails.dropoff.property.flatNumber && (
                      <Text fontSize="sm" pl={6}>Flat: {jobDetails.dropoff.property.flatNumber}</Text>
                    )}
                    <Text fontSize="sm" pl={6}>
                      Lift: {jobDetails.dropoff.property.hasElevator ? 'Available' : 'Not available'}
                    </Text>
                  </Box>

                  <Box>
                    <HStack mb={1}>
                      <Icon as={FaFlag} color="orange.500" />
                      <Text fontWeight="medium">Zones & Charges</Text>
                    </HStack>
                    <Text fontSize="sm" pl={6}>{getZoneInfo(jobDetails.dropoff.zones)}</Text>
                  </Box>

                  <Box>
                    <HStack mb={1}>
                      <Icon as={FaCar} color="purple.500" />
                      <Text fontWeight="medium">Parking</Text>
                    </HStack>
                    <Text fontSize="sm" pl={6}>{jobDetails.dropoff.property.parkingDetails}</Text>
                  </Box>

                  {jobDetails.dropoff.property.accessNotes && (
                    <Box>
                      <HStack mb={1}>
                        <Icon as={FaInfoCircle} color="gray.500" />
                        <Text fontWeight="medium">Access Notes</Text>
                      </HStack>
                      <Text fontSize="sm" pl={6}>{jobDetails.dropoff.property.accessNotes}</Text>
                    </Box>
                  )}
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Items */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Items to Move</Heading>
              <List spacing={2}>
                {jobDetails.items.map((item, index) => (
                  <ListItem key={index}>
                    <HStack>
                      <ListIcon as={FaBox} color="blue.500" />
                      <Text>
                        {item.quantity}x {item.name}
                        <Text as="span" color="gray.500" ml={2}>
                          ({item.volumeM3}m³ each)
                        </Text>
                      </Text>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </VStack>
          </CardBody>
        </Card>

        {/* Smart Suggestions */}
        {jobDetails.smartSuggestions && jobDetails.smartSuggestions.length > 0 && (
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Smart Suggestions</Heading>
                <VStack spacing={2} align="stretch">
                  {jobDetails.smartSuggestions.map((suggestion, index) => (
                    <Alert 
                      key={index} 
                      status={suggestion.priority === 'high' ? 'warning' : 'info'}
                    >
                      <AlertIcon />
                      <Box>
                        <Text fontWeight="medium">{suggestion.title}</Text>
                        <Text fontSize="sm">{suggestion.description}</Text>
                      </Box>
                    </Alert>
                  ))}
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>

      {/* Step Update Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Job Step: {nextStep?.label}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Notes (Optional)</FormLabel>
                <Textarea
                  value={stepNotes}
                  onChange={(e) => setStepNotes(e.target.value)}
                  placeholder="Add any notes about this step..."
                />
              </FormControl>

              <FormControl>
                <FormLabel>Photos (Optional)</FormLabel>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setMediaFiles(Array.from(e.target.files || []))}
                />
              </FormControl>

              <HStack justify="end" spacing={3}>
                <Button onClick={onClose} variant="ghost">
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={() => nextStep && updateJobStep(nextStep.id)}
                  isLoading={updatingStep === nextStep?.id}
                  loadingText="Updating..."
                >
                  Complete Step
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
}
