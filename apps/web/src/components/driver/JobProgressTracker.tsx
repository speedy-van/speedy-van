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
  Icon,
  Circle,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
  Spinner,
} from '@chakra-ui/react';
import {
  FaMapMarkerAlt,
  FaPlay,
  FaBox,
  FaCheck,
  FaTruck,
  FaFlag,
  FaSignature,
  FaExclamationTriangle,
  FaCamera,
  FaArrowRight,
} from 'react-icons/fa';

interface JobStep {
  key: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  current: boolean;
  optional?: boolean;
}

interface JobProgressTrackerProps {
  jobId: string;
  currentStep: string;
  completedSteps: string[];
  onStepComplete: (step: string, notes?: string) => Promise<void>;
  loading?: boolean;
}

const JOB_STEPS: JobStep[] = [
  {
    key: 'navigate_to_pickup',
    title: 'Navigate to Pickup',
    description: 'Drive to pickup location',
    icon: FaMapMarkerAlt,
    completed: false,
    current: false,
  },
  {
    key: 'arrived_at_pickup',
    title: 'Arrived at Pickup',
    description: 'Confirm arrival at pickup location',
    icon: FaFlag,
    completed: false,
    current: false,
  },
  {
    key: 'loading_started',
    title: 'Loading Started',
    description: 'Begin loading items',
    icon: FaBox,
    completed: false,
    current: false,
  },
  {
    key: 'item_count_verification',
    title: 'Verify Items',
    description: 'Count and verify all items',
    icon: FaCheck,
    completed: false,
    current: false,
    optional: true,
  },
  {
    key: 'loading_completed',
    title: 'Loading Complete',
    description: 'All items loaded and secured',
    icon: FaBox,
    completed: false,
    current: false,
  },
  {
    key: 'en_route_to_dropoff',
    title: 'En Route to Dropoff',
    description: 'Travelling to delivery location',
    icon: FaTruck,
    completed: false,
    current: false,
  },
  {
    key: 'arrived_at_dropoff',
    title: 'Arrived at Dropoff',
    description: 'Reached delivery location',
    icon: FaFlag,
    completed: false,
    current: false,
  },
  {
    key: 'unloading_started',
    title: 'Unloading Started',
    description: 'Begin unloading items',
    icon: FaBox,
    completed: false,
    current: false,
  },
  {
    key: 'unloading_completed',
    title: 'Unloading Complete',
    description: 'All items delivered',
    icon: FaBox,
    completed: false,
    current: false,
  },
  {
    key: 'customer_signature',
    title: 'Customer Signature',
    description: 'Get customer confirmation',
    icon: FaSignature,
    completed: false,
    current: false,
  },
  {
    key: 'damage_notes',
    title: 'Damage Report',
    description: 'Report any damages (if applicable)',
    icon: FaExclamationTriangle,
    completed: false,
    current: false,
    optional: true,
  },
  {
    key: 'job_completed',
    title: 'Job Complete',
    description: 'Mark job as finished',
    icon: FaCheck,
    completed: false,
    current: false,
  },
];

export default function JobProgressTracker({
  jobId,
  currentStep,
  completedSteps,
  onStepComplete,
  loading = false,
}: JobProgressTrackerProps) {
  const [steps, setSteps] = useState<JobStep[]>(JOB_STEPS);
  const [selectedStep, setSelectedStep] = useState<JobStep | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const completedColor = useColorModeValue('green.500', 'green.400');
  const currentColor = useColorModeValue('blue.500', 'blue.400');
  const pendingColor = useColorModeValue('gray.300', 'gray.600');

  useEffect(() => {
    // Update steps based on props - mark all steps before current as completed
    const currentStepIndex = JOB_STEPS.findIndex(step => step.key === currentStep);
    
    const updatedSteps = JOB_STEPS.map((step, index) => ({
      ...step,
      completed: index < currentStepIndex || completedSteps.includes(step.key),
      current: step.key === currentStep,
    }));
    
    setSteps(updatedSteps);
    
    console.log('🔄 JobProgressTracker steps updated:', {
      currentStep,
      currentStepIndex,
      totalSteps: updatedSteps.length,
      completedCount: updatedSteps.filter(s => s.completed).length
    });
  }, [currentStep, completedSteps]);

  const handleStepClick = (step: JobStep) => {
    if (step.completed) return;
    
    // Check if this is the current step or next step in sequence
    const currentIndex = steps.findIndex(s => s.key === currentStep);
    const stepIndex = steps.findIndex(s => s.key === step.key);
    
    // If clicking on current step, advance to next step
    if (stepIndex === currentIndex) {
      const nextIndex = currentIndex + 1;
      if (nextIndex < steps.length) {
        const nextStep = steps[nextIndex];
        console.log('🔄 Desktop: Advancing from current step to next:', { 
          current: step.key, 
          next: nextStep.key 
        });
        setSelectedStep(nextStep);
        setNotes('');
        onOpen();
      } else {
        toast({
          title: 'Job Complete',
          description: 'All steps have been completed!',
          status: 'success',
          duration: 3000,
        });
      }
    } 
    // Allow clicking on next step
    else if (stepIndex === currentIndex + 1) {
      setSelectedStep(step);
      setNotes('');
      onOpen();
    } else {
      toast({
        title: 'Invalid Step',
        description: 'Please complete steps in order.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmitStep = async () => {
    if (!selectedStep) return;

    setIsSubmitting(true);
    try {
      await onStepComplete(selectedStep.key, notes);
      toast({
        title: 'Step Completed',
        description: `${selectedStep.title} marked as complete.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update step. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepColor = (step: JobStep) => {
    if (step.completed) return completedColor;
    if (step.current) return currentColor;
    return pendingColor;
  };

  const getStepIcon = (step: JobStep) => {
    if (step.completed) return FaCheck;
    return step.icon;
  };

  const calculateProgress = () => {
    const totalSteps = steps.filter(s => !s.optional).length;
    const completedRequiredSteps = steps.filter(s => !s.optional && s.completed).length;
    return Math.round((completedRequiredSteps / totalSteps) * 100);
  };

  const getNextStep = () => {
    const currentIndex = steps.findIndex(s => s.current);
    return steps[currentIndex + 1];
  };

  const nextStep = getNextStep();

  return (
    <Card bg={bgColor} shadow="lg" borderRadius="xl">
      <CardBody p={6}>
        <VStack spacing={6} align="stretch">
          {/* Progress Header */}
          <Box>
            <HStack justify="space-between" mb={4}>
              <Text fontSize="xl" fontWeight="bold" color="gray.800">
                Job Progress
              </Text>
              <Badge colorScheme="blue" size="lg" px={3} py={1} borderRadius="full">
                {calculateProgress()}% Complete
              </Badge>
            </HStack>
            <Progress
              value={calculateProgress()}
              size="lg"
              colorScheme="blue"
              borderRadius="full"
              bg="gray.100"
            />
          </Box>

          {/* Next Action */}
          {nextStep && (
            <Card bg="blue.50" border="2px solid" borderColor="blue.200">
              <CardBody p={4}>
                <HStack spacing={4}>
                  <Circle size="40px" bg="blue.500" color="white">
                    <Icon as={nextStep.icon} />
                  </Circle>
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="bold" color="blue.700">
                      Next: {nextStep.title}
                    </Text>
                    <Text fontSize="sm" color="blue.600">
                      {nextStep.description}
                    </Text>
                  </VStack>
                  <Button
                    colorScheme="blue"
                    size="md"
                    rightIcon={<FaArrowRight />}
                    onClick={() => handleStepClick(nextStep)}
                    isLoading={loading}
                    loadingText="Processing..."
                  >
                    Mark Complete
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          )}

          {/* Steps List */}
          <VStack spacing={3} align="stretch">
            {steps.map((step, index) => (
              <HStack
                key={step.key}
                p={4}
                borderRadius="lg"
                border="2px solid"
                borderColor={step.completed ? completedColor : borderColor}
                bg={step.current ? `${currentColor}.50` : 'transparent'}
                cursor={step.completed ? 'default' : 'pointer'}
                onClick={() => handleStepClick(step)}
                transition="all 0.2s"
                _hover={
                  !step.completed
                    ? {
                        borderColor: currentColor,
                        transform: 'translateY(-1px)',
                        shadow: 'md',
                      }
                    : {}
                }
              >
                <Circle size="40px" bg={getStepColor(step)} color="white">
                  {step.completed ? (
                    <Icon as={FaCheck} />
                  ) : (
                    <Icon as={step.icon} />
                  )}
                </Circle>
                
                <VStack align="start" spacing={1} flex={1}>
                  <HStack>
                    <Text
                      fontWeight="semibold"
                      color={step.completed ? completedColor : 'gray.700'}
                    >
                      {step.title}
                    </Text>
                    {step.optional && (
                      <Badge size="sm" colorScheme="gray">
                        Optional
                      </Badge>
                    )}
                    {step.current && (
                      <Badge size="sm" colorScheme="blue">
                        Current
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {step.description}
                  </Text>
                </VStack>

                {step.completed && (
                  <Badge colorScheme="green" size="lg">
                    ✓ Done
                  </Badge>
                )}
                
                {step.current && !step.completed && (
                  <Spinner size="sm" color={currentColor} />
                )}
              </HStack>
            ))}
          </VStack>

          {/* Completion Message */}
          {calculateProgress() === 100 && (
            <Card bg="green.50" border="2px solid" borderColor="green.200">
              <CardBody p={4} textAlign="center">
                <Icon as={FaCheck} boxSize={8} color="green.500" mb={2} />
                <Text fontWeight="bold" color="green.700" fontSize="lg">
                  🎉 Job Completed Successfully!
                </Text>
                <Text fontSize="sm" color="green.600" mt={1}>
                  Great work! The customer has been notified.
                </Text>
              </CardBody>
            </Card>
          )}
        </VStack>
      </CardBody>

      {/* Step Completion Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Icon as={selectedStep?.icon} color="blue.500" />
              <Text>Complete: {selectedStep?.title}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text color="gray.600">
                {selectedStep?.description}
              </Text>
              
              <FormControl>
                <FormLabel>Notes (Optional)</FormLabel>
                <Textarea
                  placeholder="Add any notes about this step..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmitStep}
              isLoading={isSubmitting}
              loadingText="Updating..."
            >
              Mark Complete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
}