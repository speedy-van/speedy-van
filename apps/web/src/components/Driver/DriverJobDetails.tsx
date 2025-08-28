import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Button,
  Divider,
  SimpleGrid,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Heading,
  List,
  ListItem,
  ListIcon,
  Progress,
  Tooltip,
  Icon
} from '@chakra-ui/react';
import { 
  FaTruck, 
  FaUser, 
  FaMapMarkerAlt, 
  FaCalendar, 
  FaPoundSign, 
  FaBoxes, 
  FaPhone, 
  FaUsers,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaClock,
  FaRoute,
  FaBuilding,
  FaStar,
  FaArrowUp
} from 'react-icons/fa';

interface DriverJobDetailsProps {
  bookingId: string;
}

interface CrewRecommendation {
  suggestedCrewSize: 'ONE' | 'TWO' | 'THREE' | 'FOUR';
  reason: string;
  confidence: 'low' | 'medium' | 'high';
  factors: string[];
}

interface JobDetails {
  id: string;
  reference: string;
  unifiedBookingId?: string;
  customer: {
    name: string;
    phone: string;
  };
  addresses: {
    pickup: {
      line1: string;
      city: string;
      postcode: string;
      coordinates: { lat: number; lng: number };
    };
    dropoff: {
      line1: string;
      city: string;
      postcode: string;
      coordinates: { lat: number; lng: number };
    };
  };
  properties: {
    pickup: {
      type: string;
      floor: number;
      access: string;
      notes: string;
    };
    dropoff: {
      type: string;
      floor: number;
      access: string;
      notes: string;
    };
  };
  schedule: {
    date: string;
    timeSlot: string;
    estimatedDuration: number;
  };
  items: Array<{
    name: string;
    quantity: number;
    volumeM3: number;
    notes?: string;
    requiresTwoPerson?: boolean;
    isFragile?: boolean;
    requiresDisassembly?: boolean;
  }>;
  pricing: {
    total: number;
    breakdown: any;
  };
  crewRecommendation: CrewRecommendation;
  specialRequirements: string;
  status: string;
}

export default function DriverJobDetails({ bookingId }: DriverJobDetailsProps) {
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchJobDetails();
  }, [bookingId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/driver/jobs/${bookingId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch job details');
      }
      
      const data = await response.json();
      setJobDetails(data.job);
    } catch (error) {
      console.error('Error fetching job details:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'green';
      case 'medium': return 'orange';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  const getCrewSizeColor = (crewSize: string) => {
    switch (crewSize) {
      case 'ONE': return 'blue';
      case 'TWO': return 'green';
      case 'THREE': return 'orange';
      case 'FOUR': return 'red';
      default: return 'gray';
    }
  };

  const getAccessIcon = (access: string) => {
    return access === 'LIFT' ? FaArrowUp : FaStar;
  };

  const getAccessColor = (access: string) => {
    return access === 'LIFT' ? 'green' : 'orange';
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4}>Loading job details...</Text>
      </Box>
    );
  }

  if (error || !jobDetails) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Text>Failed to load job details: {error}</Text>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Card mb={6}>
        <CardHeader>
          <HStack justify="space-between">
            <HStack>
              <IconButton
                icon={<FaTruck />}
                aria-label="Job"
                variant="ghost"
                colorScheme="blue"
                size="lg"
              />
              <VStack align="start" spacing={1}>
                {jobDetails.unifiedBookingId && (
                  <Heading size="md" color="blue.600">
                    {jobDetails.unifiedBookingId}
                  </Heading>
                )}
                <Heading size="md" color="gray.600">
                  Job: {jobDetails.reference}
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Status: {jobDetails.status}
                </Text>
              </VStack>
            </HStack>
            
            <Badge colorScheme="blue" variant="solid" px={3} py={2}>
              £{jobDetails.pricing.total}
            </Badge>
          </HStack>
        </CardHeader>
      </Card>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Left Column */}
        <VStack spacing={6} align="stretch">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <HStack>
                <Icon as={FaUser} color="blue.500" />
                <Heading size="sm">Customer Information</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={3}>
                <HStack>
                  <Icon as={FaUser} color="gray.500" boxSize={4} />
                  <Text><strong>Name:</strong> {jobDetails.customer.name}</Text>
                </HStack>
                <HStack>
                  <Icon as={FaPhone} color="gray.500" boxSize={4} />
                  <Text><strong>Phone:</strong> {jobDetails.customer.phone}</Text>
                </HStack>
                {jobDetails.specialRequirements && (
                  <Box w="full">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Special Requirements:
                    </Text>
                    <Text fontSize="sm" bg="yellow.50" p={2} borderRadius="md">
                      {jobDetails.specialRequirements}
                    </Text>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Schedule Information */}
          <Card>
            <CardHeader>
              <HStack>
                <Icon as={FaCalendar} color="purple.500" />
                <Heading size="sm">Schedule</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={3}>
                <HStack>
                  <Icon as={FaCalendar} color="gray.500" boxSize={4} />
                  <Text><strong>Date:</strong> {new Date(jobDetails.schedule.date).toLocaleDateString('en-GB')}</Text>
                </HStack>
                <HStack>
                  <Icon as={FaClock} color="gray.500" boxSize={4} />
                  <Text><strong>Time:</strong> {jobDetails.schedule.timeSlot}</Text>
                </HStack>
                <HStack>
                  <Icon as={FaRoute} color="gray.500" boxSize={4} />
                  <Text><strong>Duration:</strong> {jobDetails.schedule.estimatedDuration} minutes</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Crew Recommendation */}
          <Card borderColor={getCrewSizeColor(jobDetails.crewRecommendation.suggestedCrewSize)} borderWidth="2px">
            <CardHeader>
              <HStack>
                <Icon as={FaUsers} color={getCrewSizeColor(jobDetails.crewRecommendation.suggestedCrewSize)} />
                <Heading size="sm">Crew Size Recommendation</Heading>
                <Badge 
                  colorScheme={getCrewSizeColor(jobDetails.crewRecommendation.suggestedCrewSize)} 
                  variant="solid"
                >
                  {jobDetails.crewRecommendation.suggestedCrewSize}
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={3}>
                <Text fontSize="sm" fontWeight="medium">
                  {jobDetails.crewRecommendation.reason}
                </Text>
                
                <HStack>
                  <Text fontSize="sm" color="gray.600">Confidence:</Text>
                  <Badge colorScheme={getConfidenceColor(jobDetails.crewRecommendation.confidence)}>
                    {jobDetails.crewRecommendation.confidence}
                  </Badge>
                </HStack>

                <Box w="full">
                  <Text fontSize="sm" color="gray.600" fontWeight="medium" mb={2}>
                    Factors considered:
                  </Text>
                  <List spacing={1}>
                    {jobDetails.crewRecommendation.factors.map((factor, index) => (
                      <ListItem key={index} fontSize="sm">
                        <ListIcon as={FaInfoCircle} color="blue.500" />
                        {factor}
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Alert 
                  status={jobDetails.crewRecommendation.suggestedCrewSize === 'TWO' ? 'info' : 'success'} 
                  borderRadius="md"
                >
                  <AlertIcon />
                  <Text fontSize="sm">
                    {jobDetails.crewRecommendation.suggestedCrewSize === 'TWO' 
                      ? 'A second helper is recommended for this job.'
                      : 'This job can be handled by a single driver.'
                    }
                  </Text>
                </Alert>
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        {/* Right Column */}
        <VStack spacing={6} align="stretch">
          {/* Pickup Address */}
          <Card>
            <CardHeader>
              <HStack>
                <Icon as={FaMapMarkerAlt} color="green.500" />
                <Heading size="sm">Pickup Address</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={3}>
                <Text fontWeight="medium">{jobDetails.addresses.pickup.line1}</Text>
                <Text color="gray.600">
                  {jobDetails.addresses.pickup.city}, {jobDetails.addresses.pickup.postcode}
                </Text>
                
                <HStack>
                  <Icon as={FaBuilding} color="gray.500" boxSize={4} />
                  <Text fontSize="sm">
                    <strong>Property:</strong> {jobDetails.properties.pickup.type}
                  </Text>
                </HStack>
                
                <HStack>
                  <Icon as={getAccessIcon(jobDetails.properties.pickup.access)} 
                        color={getAccessColor(jobDetails.properties.pickup.access)} 
                        boxSize={4} />
                  <Text fontSize="sm">
                    <strong>Floor:</strong> {jobDetails.properties.pickup.floor} 
                    <Text as="span" color="gray.500" ml={2}>
                      ({jobDetails.properties.pickup.access})
                    </Text>
                  </Text>
                </HStack>

                {jobDetails.properties.pickup.notes && (
                  <Text fontSize="sm" color="gray.600" bg="gray.50" p={2} borderRadius="md">
                    {jobDetails.properties.pickup.notes}
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Dropoff Address */}
          <Card>
            <CardHeader>
              <HStack>
                <Icon as={FaMapMarkerAlt} color="red.500" />
                <Heading size="sm">Dropoff Address</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={3}>
                <Text fontWeight="medium">{jobDetails.addresses.dropoff.line1}</Text>
                <Text color="gray.600">
                  {jobDetails.addresses.dropoff.city}, {jobDetails.addresses.dropoff.postcode}
                </Text>
                
                <HStack>
                  <Icon as={FaBuilding} color="gray.500" boxSize={4} />
                  <Text fontSize="sm">
                    <strong>Property:</strong> {jobDetails.properties.dropoff.type}
                  </Text>
                </HStack>
                
                <HStack>
                  <Icon as={getAccessIcon(jobDetails.properties.dropoff.access)} 
                        color={getAccessColor(jobDetails.properties.dropoff.access)} 
                        boxSize={4} />
                  <Text fontSize="sm">
                    <strong>Floor:</strong> {jobDetails.properties.dropoff.floor}
                    <Text as="span" color="gray.500" ml={2}>
                      ({jobDetails.properties.dropoff.access})
                    </Text>
                  </Text>
                </HStack>

                {jobDetails.properties.dropoff.notes && (
                  <Text fontSize="sm" color="gray.600" bg="gray.50" p={2} borderRadius="md">
                    {jobDetails.properties.dropoff.notes}
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Items to Move */}
          <Card>
            <CardHeader>
              <HStack>
                <Icon as={FaBoxes} color="teal.500" />
                <Heading size="sm">Items to Move</Heading>
                <Badge colorScheme="blue" variant="outline">
                  {jobDetails.items.length} items
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                {jobDetails.items.map((item, index) => (
                  <Box
                    key={index}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor="gray.200"
                    bg="white"
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="medium">{item.name}</Text>
                      <HStack spacing={2}>
                        {item.requiresTwoPerson && (
                          <Tooltip label="Requires two people">
                            <Badge colorScheme="orange" variant="solid" size="sm">
                              <Icon as={FaUsers} boxSize={3} />
                            </Badge>
                          </Tooltip>
                        )}
                        {item.isFragile && (
                          <Tooltip label="Fragile item">
                            <Badge colorScheme="red" variant="solid" size="sm">
                              <Icon as={FaExclamationTriangle} boxSize={3} />
                            </Badge>
                          </Tooltip>
                        )}
                        {item.requiresDisassembly && (
                          <Tooltip label="Needs disassembly">
                            <Badge colorScheme="purple" variant="solid" size="sm">
                              <Icon as={FaCheckCircle} boxSize={3} />
                            </Badge>
                          </Tooltip>
                        )}
                      </HStack>
                    </HStack>
                    
                    <HStack justify="space-between" fontSize="sm" color="gray.600">
                      <Text>Qty: {item.quantity}</Text>
                      <Text>Volume: {item.volumeM3} m³</Text>
                    </HStack>
                    
                    {item.notes && (
                      <Text fontSize="sm" color="gray.500" mt={2} bg="gray.50" p={2} borderRadius="md">
                        {item.notes}
                      </Text>
                    )}
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </SimpleGrid>

      {/* Action Buttons */}
      <Card mt={6}>
        <CardBody>
          <HStack justify="center" spacing={4}>
            <Button
              colorScheme="blue"
              leftIcon={<FaCheckCircle />}
              size="lg"
            >
              Accept Job
            </Button>
            <Button
              variant="outline"
              leftIcon={<FaClock />}
              size="lg"
            >
              Start Job
            </Button>
            <Button
              variant="outline"
              leftIcon={<FaRoute />}
              size="lg"
            >
              View Route
            </Button>
          </HStack>
        </CardBody>
      </Card>
    </Box>
  );
}
