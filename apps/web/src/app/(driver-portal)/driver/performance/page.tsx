"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Grid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  VStack,
  HStack,
  Divider,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Checkbox,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Image,
  SimpleGrid,
  Progress,
  Flex,
  Spinner
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";

interface PerformanceData {
  performance: {
    averageRating: number;
    totalRatings: number;
    completionRate: number;
    acceptanceRate: number;
    onTimeRate: number;
    cancellationRate: number;
    totalJobs: number;
    completedJobs: number;
    cancelledJobs: number;
    lastCalculated: string;
  };
  monthly: {
    rating: number;
    completionRate: number;
    jobsCompleted: number;
    totalJobs: number;
  };
  recentRatings: Array<{
    id: string;
    rating: number;
    review: string | null;
    category: string;
    createdAt: string;
    job: {
      reference: string;
      pickupAddress: string;
      dropoffAddress: string;
      date: string;
    } | null;
  }>;
  recentIncidents: Array<{
    id: string;
    type: string;
    severity: string;
    title: string;
    status: string;
    reportedAt: string;
    job: {
      reference: string;
      pickupAddress: string;
      dropoffAddress: string;
    } | null;
  }>;
}

interface IncidentFormData {
  type: string;
  severity: string;
  title: string;
  description: string;
  location: string;
  customerImpact: boolean;
  propertyDamage: boolean;
  injuryInvolved: boolean;
}

export default function PerformancePage() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingIncident, setSubmittingIncident] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [incidentForm, setIncidentForm] = useState<IncidentFormData>({
    type: "",
    severity: "",
    title: "",
    description: "",
    location: "",
    customerImpact: false,
    propertyDamage: false,
    injuryInvolved: false
  });

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch("/api/driver/performance");
      if (response.ok) {
        const data = await response.json();
        setPerformanceData(data);
      }
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncidentSubmit = async () => {
    setSubmittingIncident(true);
    try {
      const response = await fetch("/api/driver/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(incidentForm),
      });

      if (response.ok) {
        onClose();
        setIncidentForm({
          type: "",
          severity: "",
          title: "",
          description: "",
          location: "",
          customerImpact: false,
          propertyDamage: false,
          injuryInvolved: false
        });
        fetchPerformanceData(); // Refresh data
      }
    } catch (error) {
      console.error("Error submitting incident:", error);
    } finally {
      setSubmittingIncident(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "green";
      case "medium": return "yellow";
      case "high": return "orange";
      case "critical": return "red";
      default: return "gray";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reported": return "blue";
      case "under_review": return "yellow";
      case "resolved": return "green";
      case "closed": return "gray";
      case "escalated": return "red";
      default: return "gray";
    }
  };

  const renderStars = (rating: number) => {
    return Array(5).fill("").map((_, i) => (
      <StarIcon
        key={i}
        color={i < rating ? "yellow.400" : "gray.300"}
        boxSize={4}
      />
    ));
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" />
        </Flex>
      </Container>
    );
  }

  if (!performanceData) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>
            Failed to load performance data. Please try again.
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Performance & Ratings</Heading>

      {/* Performance Overview */}
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Average Rating</StatLabel>
              <StatNumber>
                <HStack>
                  <Text fontSize="2xl">{performanceData.performance.averageRating.toFixed(1)}</Text>
                  <HStack spacing={1}>
                    {renderStars(Math.round(performanceData.performance.averageRating))}
                  </HStack>
                </HStack>
              </StatNumber>
              <StatHelpText>
                {performanceData.performance.totalRatings} total ratings
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Completion Rate</StatLabel>
              <StatNumber>{performanceData.performance.completionRate.toFixed(1)}%</StatNumber>
              <StatHelpText>
                <Progress 
                  value={performanceData.performance.completionRate} 
                  colorScheme="green" 
                  size="sm" 
                  mb={2}
                />
                {performanceData.performance.completedJobs} of {performanceData.performance.totalJobs} jobs
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Acceptance Rate</StatLabel>
              <StatNumber>{performanceData.performance.acceptanceRate.toFixed(1)}%</StatNumber>
              <StatHelpText>
                Jobs accepted vs offered
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>On-Time Rate</StatLabel>
              <StatNumber>{performanceData.performance.onTimeRate.toFixed(1)}%</StatNumber>
              <StatHelpText>
                Jobs completed on time
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      {/* Monthly Performance */}
      <Card mb={8}>
        <CardBody>
          <Heading size="md" mb={4}>This Month</Heading>
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
            <Box>
              <Text fontSize="sm" color="gray.600">Rating</Text>
              <Text fontSize="xl" fontWeight="bold">
                {performanceData.monthly.rating.toFixed(1)} ⭐
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600">Completion Rate</Text>
              <Text fontSize="xl" fontWeight="bold">
                {performanceData.monthly.completionRate.toFixed(1)}%
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600">Jobs Completed</Text>
              <Text fontSize="xl" fontWeight="bold">
                {performanceData.monthly.jobsCompleted} / {performanceData.monthly.totalJobs}
              </Text>
            </Box>
          </Grid>
        </CardBody>
      </Card>

      {/* Recent Ratings */}
      <Card mb={8}>
        <CardBody>
          <Heading size="md" mb={4}>Recent Ratings</Heading>
          {performanceData.recentRatings.length > 0 ? (
            <VStack align="stretch" spacing={4}>
              {performanceData.recentRatings.map((rating) => (
                <Box key={rating.id} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      {renderStars(rating.rating)}
                      <Text fontWeight="bold">{rating.rating}/5</Text>
                    </HStack>
                    <Badge colorScheme="blue">{rating.category}</Badge>
                  </HStack>
                  {rating.review && (
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      "{rating.review}"
                    </Text>
                  )}
                  {rating.job && (
                    <Text fontSize="sm" color="gray.500">
                      Job {rating.job.reference} • {new Date(rating.createdAt).toLocaleDateString()}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          ) : (
            <Text color="gray.500">No ratings yet</Text>
          )}
        </CardBody>
      </Card>

      {/* Incidents Section */}
      <Card mb={8}>
        <CardBody>
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Incidents</Heading>
            <Button colorScheme="red" size="sm" onClick={onOpen}>
              Report Incident
            </Button>
          </HStack>
          
          {performanceData.recentIncidents.length > 0 ? (
            <VStack align="stretch" spacing={4}>
              {performanceData.recentIncidents.map((incident) => (
                <Box key={incident.id} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="bold">{incident.title}</Text>
                    <HStack spacing={2}>
                      <Badge colorScheme={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                      <Badge colorScheme={getStatusColor(incident.status)}>
                        {incident.status.replace("_", " ")}
                      </Badge>
                    </HStack>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    {incident.type.replace("_", " ")} • {new Date(incident.reportedAt).toLocaleDateString()}
                  </Text>
                  {incident.job && (
                    <Text fontSize="sm" color="gray.500">
                      Job {incident.job.reference}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          ) : (
            <Text color="gray.500">No incidents reported</Text>
          )}
        </CardBody>
      </Card>

      {/* Report Incident Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Report Incident</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Incident Type</FormLabel>
                <Select
                  value={incidentForm.type}
                  onChange={(e) => setIncidentForm({...incidentForm, type: e.target.value})}
                >
                  <option value="">Select type</option>
                  <option value="vehicle_breakdown">Vehicle Breakdown</option>
                  <option value="traffic_accident">Traffic Accident</option>
                  <option value="customer_dispute">Customer Dispute</option>
                  <option value="property_damage">Property Damage</option>
                  <option value="theft">Theft</option>
                  <option value="weather_related">Weather Related</option>
                  <option value="medical_emergency">Medical Emergency</option>
                  <option value="technical_issue">Technical Issue</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Severity</FormLabel>
                <Select
                  value={incidentForm.severity}
                  onChange={(e) => setIncidentForm({...incidentForm, severity: e.target.value})}
                >
                  <option value="">Select severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={incidentForm.title}
                  onChange={(e) => setIncidentForm({...incidentForm, title: e.target.value})}
                  placeholder="Brief description of the incident"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({...incidentForm, description: e.target.value})}
                  placeholder="Detailed description of what happened..."
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Location</FormLabel>
                <Input
                  value={incidentForm.location}
                  onChange={(e) => setIncidentForm({...incidentForm, location: e.target.value})}
                  placeholder="Where did this happen?"
                />
              </FormControl>

              <SimpleGrid columns={3} spacing={4} w="full">
                <Checkbox
                  isChecked={incidentForm.customerImpact}
                  onChange={(e) => setIncidentForm({...incidentForm, customerImpact: e.target.checked})}
                >
                  Customer Impact
                </Checkbox>
                <Checkbox
                  isChecked={incidentForm.propertyDamage}
                  onChange={(e) => setIncidentForm({...incidentForm, propertyDamage: e.target.checked})}
                >
                  Property Damage
                </Checkbox>
                <Checkbox
                  isChecked={incidentForm.injuryInvolved}
                  onChange={(e) => setIncidentForm({...incidentForm, injuryInvolved: e.target.checked})}
                >
                  Injury Involved
                </Checkbox>
              </SimpleGrid>

              <HStack spacing={4} w="full" justify="flex-end">
                <Button onClick={onClose}>Cancel</Button>
                <Button
                  colorScheme="red"
                  onClick={handleIncidentSubmit}
                  isLoading={submittingIncident}
                  loadingText="Submitting..."
                  isDisabled={!incidentForm.type || !incidentForm.severity || !incidentForm.title || !incidentForm.description}
                >
                  Submit Report
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
}
