"use client";

import React, { useState, useEffect } from "react";
import { 
  Box, 
  Heading, 
  HStack, 
  VStack, 
  Text, 
  Badge, 
  Card, 
  CardBody, 
  Button, 
  Progress, 
  Grid, 
  GridItem, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel, 
  Image, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  ModalCloseButton,
  useDisclosure, 
  Textarea, 
  Select, 
  Divider,
  Flex,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
  Tooltip,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from "@chakra-ui/react";
import { 
  FiUser, 
  FiFile, 
  FiCheck, 
  FiX, 
  FiEye, 
  FiDownload, 
  FiStar, 
  FiSearch,
  FiClock,
  FiShield,
  FiTruck,
  FiCalendar,
  FiAlertTriangle,
  FiThumbsUp,
  FiThumbsDown,
  FiMail,
  FiPhone,
  FiMapPin
} from "react-icons/fi";

interface DriverApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  score: number;
  status: 'pending' | 'approved' | 'rejected' | 'under_review' | 'requires_additional_info';
  documents: {
    license: { status: string; url: string | null; ocrData?: any };
    insurance: { status: string; url: string | null; ocrData?: any };
    rightToWork: { status: string; url: string | null; ocrData?: any };
    vehicleRegistration: { status: string; url: string | null; ocrData?: any };
    dbs: { status: string; url: string | null; ocrData?: any };
  };
  vehicle: {
    type: string;
    make: string;
    model: string;
    year: string;
    reg: string;
  };
  experience: string;
  rating: number;
  appliedAt: string;
  basePostcode: string;
  rightToWorkType: string;
  complianceIssues: string[];
  autoApproveEligible: boolean;
  approvedAt?: string;
  reviewedAt?: string;
  approvedBy?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export default function DriverApplicationsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedApplication, setSelectedApplication] = useState<DriverApplication | null>(null);
  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTab, setSelectedTab] = useState(0);
  const [approvalReason, setApprovalReason] = useState('');
  const toast = useToast();

  // Custom close handler to reset form state
  const handleClose = () => {
    onClose();
    setApprovalReason('');
    setSelectedTab(0);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/drivers/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      } else {
        throw new Error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (action: 'approve' | 'reject' | 'request_info', reason?: string) => {
    if (!selectedApplication) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/drivers/applications/${selectedApplication.id}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Application ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'marked for review'}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh applications list
        await fetchApplications();
        handleClose();
      } else {
        throw new Error('Failed to process application');
      }
    } catch (error) {
      console.error('Error processing application:', error);
      toast({
        title: "Error",
        description: "Failed to process application",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setProcessing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "green";
    if (score >= 70) return "yellow";
    return "red";
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case "complete": return "green";
      case "pending": return "yellow";
      case "incomplete": return "red";
      default: return "gray";
    }
  };

  // Score is now calculated in the API, no need for local calculation

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingApplications = filteredApplications.filter(app => app.status === 'pending');
  const autoApproveEligible = pendingApplications.filter(app => app.autoApproveEligible);

  if (loading) {
    return (
      <Box p={6}>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" />
        </Flex>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Driver Applications</Heading>
            <Text color="text.secondary">Review and approve new driver applications</Text>
          </VStack>
          <HStack spacing={4}>
            <Button
              leftIcon={<FiCheck />}
              colorScheme="green"
              size="sm"
              onClick={() => {
                // Auto-approve eligible applications
                toast({
                  title: "Auto-approve",
                  description: `Auto-approving ${autoApproveEligible.length} eligible applications`,
                  status: "info",
                  duration: 3000,
                  isClosable: true,
                });
              }}
              isDisabled={autoApproveEligible.length === 0}
              variant="solid"
              _hover={{ bg: "green.600", shadow: "neon.glow" }}
            >
              Auto-approve Eligible ({autoApproveEligible.length})
            </Button>
          </HStack>
        </Flex>

        {/* Stats Row */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
          <Card bg="bg.surface" borderColor="border.primary" _hover={{ shadow: "neon.glow", transform: "translateY(-2px)" }} transition="all 0.3s ease">
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Pending Review</StatLabel>
                <StatNumber color="orange.500">{pendingApplications.length}</StatNumber>
                <StatHelpText color="text.tertiary">Awaiting approval</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg="bg.surface" borderColor="border.primary" _hover={{ shadow: "neon.glow", transform: "translateY(-2px)" }} transition="all 0.3s ease">
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Auto-approve Eligible</StatLabel>
                <StatNumber color="green.500">{autoApproveEligible.length}</StatNumber>
                <StatHelpText color="text.tertiary">Score ≥ 85, all docs complete</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg="bg.surface" borderColor="border.primary" _hover={{ shadow: "neon.glow", transform: "translateY(-2px)" }} transition="all 0.3s ease">
            <CardBody>
              <Stat>
                <StatLabel color="text.secondary">Average Score</StatLabel>
                <StatNumber color="neon.500">
                  {pendingApplications.length > 0 
                    ? Math.round(pendingApplications.reduce((sum, app) => sum + app.score, 0) / pendingApplications.length)
                    : 0
                  }
                </StatNumber>
                <StatHelpText color="text.tertiary">Of pending applications</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Filters */}
        <Card bg="bg.surface" borderColor="border.primary">
          <CardBody>
            <HStack spacing={4}>
              <InputGroup maxW="300px">
                <InputLeftElement>
                  <Icon as={FiSearch} color="text.tertiary" />
                </InputLeftElement>
                <Input
                  placeholder="Search by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                maxW="200px"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="under_review">Under Review</option>
                <option value="requires_additional_info">Requires Additional Info</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Applications List */}
        <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
          {filteredApplications.map((application) => (
            <Card 
              key={application.id} 
              cursor="pointer"
              onClick={() => {
                setSelectedApplication(application);
                onOpen();
                setApprovalReason(''); // Reset reason when selecting a new application
              }}
              _hover={{ shadow: "neon.glow", borderLeftColor: "neon.500", transform: "translateY(-2px)" }}
              transition="all 0.3s ease"
              borderLeft="4px solid"
              borderLeftColor={getScoreColor(application.score)}
              bg="bg.surface"
              borderColor="border.primary"
            >
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <Flex justify="space-between" align="start">
                    <VStack align="start" spacing={1}>
                      <Heading size="md">{application.name}</Heading>
                      <Text color="text.secondary" fontSize="sm">{application.email}</Text>
                      <Text color="text.secondary" fontSize="sm">{application.phone}</Text>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Badge colorScheme={getScoreColor(application.score)}>
                        Score: {application.score}
                      </Badge>
                      <Badge colorScheme={application.autoApproveEligible ? "green" : "gray"}>
                        {application.autoApproveEligible ? "Auto-approve" : "Manual Review"}
                      </Badge>
                      <Badge 
                        colorScheme={
                          application.status === 'approved' ? 'green' : 
                          application.status === 'rejected' ? 'red' : 
                          application.status === 'under_review' ? 'orange' : 
                          application.status === 'requires_additional_info' ? 'yellow' : 'blue'
                        }
                        size="sm"
                      >
                        {application.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </VStack>
                  </Flex>

                  {/* Approval Information */}
                  {application.status === 'approved' && application.approvedAt && (
                    <Alert status="success" size="sm">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Approved</AlertTitle>
                        <AlertDescription>
                          Approved on {new Date(application.approvedAt).toLocaleDateString()} at {new Date(application.approvedAt).toLocaleTimeString()}
                          {application.approvedBy && ` by ${application.approvedBy}`}
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  {application.status === 'rejected' && application.reviewedAt && (
                    <Alert status="error" size="sm">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Rejected</AlertTitle>
                        <AlertDescription>
                          Rejected on {new Date(application.reviewedAt).toLocaleDateString()} at {new Date(application.reviewedAt).toLocaleTimeString()}
                          {application.reviewedBy && ` by ${application.reviewedBy}`}
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  <Divider />

                  <Grid templateColumns="1fr 1fr" gap={3}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="medium">Vehicle</Text>
                      <Text fontSize="sm" color="text.secondary">
                        {application.vehicle.year} {application.vehicle.make} {application.vehicle.model}
                      </Text>
                      <Text fontSize="sm" color="text.secondary">{application.vehicle.reg}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="medium">Experience</Text>
                      <Text fontSize="sm" color="text.secondary">{application.experience}</Text>
                      <Text fontSize="sm" color="text.secondary">Rating: {application.rating}/5</Text>
                    </VStack>
                  </Grid>

                  <Divider />

                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" fontWeight="medium">Documents</Text>
                    <HStack spacing={2} wrap="wrap">
                      {Object.entries(application.documents).map(([docType, doc]) => (
                        <Badge
                          key={docType}
                          colorScheme={getDocumentStatusColor(doc.status)}
                          size="sm"
                        >
                          {docType}: {doc.status}
                        </Badge>
                      ))}
                    </HStack>
                  </VStack>

                  {application.complianceIssues.length > 0 && (
                    <Alert status="warning" size="sm">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Compliance Issues</AlertTitle>
                        <AlertDescription>
                          {application.complianceIssues.join(', ')}
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </Grid>

        {filteredApplications.length === 0 && (
          <Card bg="bg.surface" borderColor="border.primary">
            <CardBody>
              <VStack spacing={4} py={8}>
                <Icon as={FiUser} size="48px" color="text.tertiary" />
                <Text color="text.secondary">No applications found</Text>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>

      {/* Application Detail Modal */}
      <Modal isOpen={isOpen} onClose={handleClose} size="6xl">
        <ModalOverlay bg="rgba(0, 0, 0, 0.8)" />
        <ModalContent 
          bg="dark.800" 
          borderColor="neon.500"
          border="2px solid"
          shadow="neon.glow"
          borderRadius="xl"
          color="white"
        >
          <ModalHeader 
            bg="dark.900" 
            borderBottom="2px solid" 
            borderColor="neon.500"
            borderRadius="xl xl 0 0"
            color="white"
          >
            <VStack align="start" spacing={2}>
              <Heading size="lg" color="white">Review Application: {selectedApplication?.name}</Heading>
              <HStack spacing={4}>
                <Badge colorScheme="green" size="lg" variant="solid">
                  Score: {selectedApplication?.score}/100
                </Badge>
                <Badge colorScheme={selectedApplication?.autoApproveEligible ? "green" : "orange"} size="md">
                  {selectedApplication?.autoApproveEligible ? "Auto-approve Eligible" : "Manual Review Required"}
                </Badge>
              </HStack>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedApplication && (
              <Tabs index={selectedTab} onChange={setSelectedTab} variant="enclosed" colorScheme="blue">
                <TabList bg="dark.900" border="2px solid" borderColor="neon.500" borderRadius="md" p={2}>
                  <Tab 
                    _selected={{ bg: "neon.500", color: "dark.900", fontWeight: "bold" }}
                    _hover={{ bg: "dark.700" }}
                    color="white"
                  >
                    Overview
                  </Tab>
                  <Tab 
                    _selected={{ bg: "neon.500", color: "dark.900", fontWeight: "bold" }}
                    _hover={{ bg: "dark.700" }}
                    color="white"
                  >
                    Documents
                  </Tab>
                  <Tab 
                    _selected={{ bg: "neon.500", color: "dark.900", fontWeight: "bold" }}
                    _hover={{ bg: "dark.700" }}
                    color="white"
                  >
                    Vehicle
                  </Tab>
                  <Tab 
                    _selected={{ bg: "neon.500", color: "dark.900", fontWeight: "bold" }}
                    _hover={{ bg: "dark.700" }}
                    color="white"
                  >
                    Compliance
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* Overview Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Grid templateColumns="1fr 1fr" gap={6}>
                        <VStack align="start" spacing={4}>
                          <Heading size="sm" color="white" borderBottom="2px solid" borderColor="neon.500" pb={2}>
                            Personal Information
                          </Heading>
                          <VStack align="start" spacing={2}>
                            <HStack>
                              <Icon as={FiUser} />
                              <Text fontWeight="medium">{selectedApplication.name}</Text>
                            </HStack>
                            <HStack>
                              <Icon as={FiMail} />
                              <Text>{selectedApplication.email}</Text>
                            </HStack>
                            <HStack>
                              <Icon as={FiPhone} />
                              <Text>{selectedApplication.phone}</Text>
                            </HStack>
                            <HStack>
                              <Icon as={FiMapPin} />
                              <Text>{selectedApplication.basePostcode}</Text>
                            </HStack>
                          </VStack>
                        </VStack>

                        <VStack align="start" spacing={4}>
                          <Heading size="sm" color="white" borderBottom="2px solid" borderColor="neon.500" pb={2}>
                            Application Details
                          </Heading>
                          <VStack align="start" spacing={2}>
                            <Text><strong>Applied:</strong> {new Date(selectedApplication.appliedAt).toLocaleDateString()}</Text>
                            <Text><strong>Experience:</strong> {selectedApplication.experience}</Text>
                            <Text><strong>Rating:</strong> {selectedApplication.rating}/5</Text>
                            <Text><strong>Right to Work:</strong> {selectedApplication.rightToWorkType}</Text>
                          </VStack>
                        </VStack>
                      </Grid>

                      <Divider />

                      <VStack align="start" spacing={4}>
                        <Heading size="sm" color="white" borderBottom="2px solid" borderColor="neon.500" pb={2}>
                          Score Breakdown
                        </Heading>
                        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} w="full">
                          <Card bg="dark.900" borderColor="neon.500" border="1px solid" _hover={{ shadow: "neon.glow", transform: "translateY(-2px)", borderColor: "neon.400" }} transition="all 0.3s ease">
                            <CardBody>
                              <VStack spacing={3}>
                                <HStack>
                                  <Icon as={FiFile} color="neon.500" />
                                  <Text fontSize="sm" fontWeight="bold" color="white">Documents</Text>
                                </HStack>
                                <Progress 
                                  value={Object.values(selectedApplication.documents).filter(doc => doc.status === 'complete').length * 20} 
                                  colorScheme="green" 
                                  size="sm" 
                                />
                                <Text fontSize="sm" color="text.secondary">
                                  {Object.values(selectedApplication.documents).filter(doc => doc.status === 'complete').length}/5 complete
                                </Text>
                              </VStack>
                            </CardBody>
                          </Card>
                          <Card bg="dark.900" borderColor="neon.500" border="1px solid" _hover={{ shadow: "neon.glow", transform: "translateY(-2px)", borderColor: "neon.400" }} transition="all 0.3s ease">
                            <CardBody>
                              <VStack spacing={3}>
                                <HStack>
                                  <Icon as={FiUser} color="neon.500" />
                                  <Text fontSize="sm" fontWeight="bold" color="white">Experience</Text>
                                </HStack>
                                <Text fontSize="lg" fontWeight="bold">
                                  {parseInt(selectedApplication.experience.split(' ')[0])} years
                                </Text>
                                <Text fontSize="sm" color="text.secondary">
                                  {parseInt(selectedApplication.experience.split(' ')[0]) >= 5 ? 'Excellent' : 
                                   parseInt(selectedApplication.experience.split(' ')[0]) >= 3 ? 'Good' : 'Basic'}
                                </Text>
                              </VStack>
                            </CardBody>
                          </Card>
                          <Card bg="dark.900" borderColor="neon.500" border="1px solid" _hover={{ shadow: "neon.glow", transform: "translateY(-2px)", borderColor: "neon.400" }} transition="all 0.3s ease">
                            <CardBody>
                              <VStack spacing={3}>
                                <HStack>
                                  <Icon as={FiStar} color="neon.500" />
                                  <Text fontSize="sm" fontWeight="bold" color="white">Rating</Text>
                                </HStack>
                                <HStack>
                                  <Icon as={FiStar} color="yellow.400" />
                                  <Text fontSize="lg" fontWeight="bold">{selectedApplication.rating}/5</Text>
                                </HStack>
                                <Text fontSize="sm" color="text.secondary">
                                  {selectedApplication.rating >= 4.8 ? 'Excellent' : 
                                   selectedApplication.rating >= 4.5 ? 'Good' : 'Average'}
                                </Text>
                              </VStack>
                            </CardBody>
                          </Card>
                        </Grid>
                      </VStack>

                      {/* Approval Information */}
                      {(selectedApplication.status === 'approved' || selectedApplication.status === 'rejected') && (
                        <>
                          <Divider />
                          <VStack align="start" spacing={4}>
                            <Heading size="sm" color="white" borderBottom="2px solid" borderColor="neon.500" pb={2}>
                              Review Information
                            </Heading>
                            <Card bg="dark.900" borderColor="neon.500" border="1px solid" w="full">
                              <CardBody>
                                <VStack spacing={3} align="start">
                                  <HStack>
                                    <Icon as={selectedApplication.status === 'approved' ? FiCheck : FiX} 
                                          color={selectedApplication.status === 'approved' ? 'green.500' : 'red.500'} />
                                    <Text fontWeight="bold" color="white">
                                      {selectedApplication.status === 'approved' ? 'Approved' : 'Rejected'}
                                    </Text>
                                  </HStack>
                                  
                                  {selectedApplication.status === 'approved' && selectedApplication.approvedAt && (
                                    <Text color="text.secondary">
                                      <strong>Approved on:</strong> {new Date(selectedApplication.approvedAt).toLocaleDateString()} at {new Date(selectedApplication.approvedAt).toLocaleTimeString()}
                                    </Text>
                                  )}
                                  
                                  {selectedApplication.status === 'rejected' && selectedApplication.reviewedAt && (
                                    <Text color="text.secondary">
                                      <strong>Rejected on:</strong> {new Date(selectedApplication.reviewedAt).toLocaleDateString()} at {new Date(selectedApplication.reviewedAt).toLocaleTimeString()}
                                    </Text>
                                  )}
                                  
                                  {selectedApplication.approvedBy && (
                                    <Text color="text.secondary">
                                      <strong>Approved by:</strong> {selectedApplication.approvedBy}
                                    </Text>
                                  )}
                                  
                                  {selectedApplication.reviewedBy && selectedApplication.status === 'rejected' && (
                                    <Text color="text.secondary">
                                      <strong>Rejected by:</strong> {selectedApplication.reviewedBy}
                                    </Text>
                                  )}
                                  
                                  {selectedApplication.reviewNotes && (
                                    <Text color="text.secondary">
                                      <strong>Notes:</strong> {selectedApplication.reviewNotes}
                                    </Text>
                                  )}
                                </VStack>
                              </CardBody>
                            </Card>
                          </VStack>
                        </>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Documents Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="sm" color="white" borderBottom="2px solid" borderColor="neon.500" pb={2}>
                        Document Review with OCR Data
                      </Heading>
                      
                      <Grid templateColumns="1fr 1fr" gap={6}>
                        {Object.entries(selectedApplication.documents).map(([docType, doc]) => (
                          <Card key={docType} bg="dark.900" borderColor="neon.500" border="1px solid" _hover={{ shadow: "neon.glow", transform: "translateY(-2px)", borderColor: "neon.400" }} transition="all 0.3s ease">
                            <CardBody>
                              <VStack spacing={4} align="stretch">
                                <HStack justify="space-between">
                                  <Heading size="sm" textTransform="capitalize" color="white">{docType}</Heading>
                                  <Badge colorScheme={getDocumentStatusColor(doc.status)}>
                                    {doc.status}
                                  </Badge>
                                </HStack>

                                {doc.url ? (
                                  <Box>
                                    <Image 
                                      src={doc.url} 
                                      alt={`${docType} document`}
                                      borderRadius="md"
                                      maxH="300px"
                                      objectFit="contain"
                                      fallback={
                                        <Box
                                          bg="dark.700"
                                          border="1px solid"
                                          borderColor="neon.500"
                                          borderRadius="md"
                                          p={4}
                                          textAlign="center"
                                          color="white"
                                        >
                                          <Icon as={FiFile} size="48px" color="neon.500" mb={2} />
                                          <Text>Image not available</Text>
                                          <Text fontSize="sm" color="text.secondary" mt={1}>
                                            File may have been moved or deleted
                                          </Text>
                                        </Box>
                                      }
                                      onError={(e) => {
                                        console.warn(`Failed to load image: ${doc.url}`);
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </Box>
                                ) : (
                                  <Alert status="warning">
                                    <AlertIcon />
                                    <Text>Document not uploaded</Text>
                                  </Alert>
                                )}

                                {doc.ocrData && (
                                  <VStack align="start" spacing={2}>
                                    <Text fontSize="sm" fontWeight="medium">OCR Extracted Data:</Text>
                                    <Box 
                                      bg="dark.700" 
                                      border="1px solid"
                                      borderColor="neon.500"
                                      p={3} 
                                      borderRadius="md" 
                                      fontSize="sm"
                                      maxH="200px"
                                      overflowY="auto"
                                      color="white"
                                    >
                                      <pre>{JSON.stringify(doc.ocrData, null, 2)}</pre>
                                    </Box>
                                  </VStack>
                                )}
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </Grid>
                    </VStack>
                  </TabPanel>

                  {/* Vehicle Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="sm" color="white" borderBottom="2px solid" borderColor="neon.500" pb={2}>
                        Vehicle Information
                      </Heading>
                      
                      <Grid templateColumns="1fr 1fr" gap={6}>
                        <VStack align="start" spacing={4}>
                          <Text><strong>Type:</strong> {selectedApplication.vehicle.type}</Text>
                          <Text><strong>Make:</strong> {selectedApplication.vehicle.make}</Text>
                          <Text><strong>Model:</strong> {selectedApplication.vehicle.model}</Text>
                          <Text><strong>Year:</strong> {selectedApplication.vehicle.year}</Text>
                          <Text><strong>Registration:</strong> {selectedApplication.vehicle.reg}</Text>
                        </VStack>

                        <VStack align="start" spacing={4}>
                          <Text fontSize="sm" fontWeight="medium">Vehicle Assessment</Text>
                          <VStack align="start" spacing={2}>
                            <HStack>
                              <Icon as={FiTruck} />
                              <Text>Age: {2024 - parseInt(selectedApplication.vehicle.year)} years old</Text>
                            </HStack>
                            <HStack>
                              <Icon as={FiCalendar} />
                              <Text>Registration: {selectedApplication.vehicle.reg}</Text>
                            </HStack>
                            <HStack>
                              <Icon as={FiShield} />
                              <Text>Insurance: {selectedApplication.documents.insurance.status}</Text>
                            </HStack>
                          </VStack>
                        </VStack>
                      </Grid>
                    </VStack>
                  </TabPanel>

                  {/* Compliance Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading size="sm" color="white" borderBottom="2px solid" borderColor="neon.500" pb={2}>
                        Compliance Check
                      </Heading>
                      
                      {selectedApplication.complianceIssues.length > 0 ? (
                        <Alert status="error">
                          <AlertIcon />
                          <VStack align="start" spacing={1}>
                            <AlertTitle>Compliance Issues Found</AlertTitle>
                            <AlertDescription>
                              <VStack align="start" spacing={1}>
                                {selectedApplication.complianceIssues.map((issue, index) => (
                                  <Text key={index}>• {issue}</Text>
                                ))}
                              </VStack>
                            </AlertDescription>
                          </VStack>
                        </Alert>
                      ) : (
                        <Alert status="success">
                          <AlertIcon />
                          <AlertTitle>All Compliance Checks Passed</AlertTitle>
                          <AlertDescription>
                            This driver meets all compliance requirements
                          </AlertDescription>
                        </Alert>
                      )}

                      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
                        <Card bg="dark.900" borderColor="neon.500" border="1px solid" _hover={{ shadow: "neon.glow", transform: "translateY(-2px)", borderColor: "neon.400" }} transition="all 0.3s ease">
                          <CardBody>
                            <VStack spacing={3}>
                              <Icon as={FiShield} size="24px" color="green.500" />
                              <Text fontWeight="bold" color="white">Right to Work</Text>
                              <Badge colorScheme="green">{selectedApplication.rightToWorkType}</Badge>
                            </VStack>
                          </CardBody>
                        </Card>
                        <Card bg="dark.900" borderColor="neon.500" border="1px solid" _hover={{ shadow: "neon.glow", transform: "translateY(-2px)", borderColor: "neon.400" }} transition="all 0.3s ease">
                          <CardBody>
                            <VStack spacing={3}>
                              <Icon as={FiFile} size="24px" color="blue.500" />
                              <Text fontWeight="bold" color="white">DBS Check</Text>
                              <Badge colorScheme={selectedApplication.documents.dbs.status === 'complete' ? 'green' : 'red'}>
                                {selectedApplication.documents.dbs.status}
                              </Badge>
                            </VStack>
                          </CardBody>
                        </Card>
                        <Card bg="dark.900" borderColor="neon.500" border="1px solid" _hover={{ shadow: "neon.glow", transform: "translateY(-2px)", borderColor: "neon.400" }} transition="all 0.3s ease">
                          <CardBody>
                            <VStack spacing={3}>
                              <Icon as={FiTruck} size="24px" color="purple.500" />
                              <Text fontWeight="bold" color="white">Vehicle Insurance</Text>
                              <Badge colorScheme={selectedApplication.documents.insurance.status === 'complete' ? 'green' : 'red'}>
                                {selectedApplication.documents.insurance.status}
                              </Badge>
                            </VStack>
                          </CardBody>
                        </Card>
                      </Grid>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </ModalBody>

          <ModalFooter 
            bg="dark.900" 
            borderTop="2px solid" 
            borderColor="neon.500"
            borderRadius="0 0 xl xl"
            color="white"
          >
            <VStack spacing={4} align="stretch" w="full">
              <VStack align="start" spacing={2}>
                <Text fontWeight="medium" color="white">Review Notes (Optional):</Text>
                <Textarea
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  placeholder="Add any notes about this decision..."
                  bg="dark.800"
                  borderColor="neon.500"
                  color="white"
                  _placeholder={{ color: "gray.400" }}
                  _focus={{ borderColor: "neon.400", boxShadow: "0 0 0 1px var(--chakra-colors-neon-400)" }}
                  resize="vertical"
                  minH="80px"
                />
              </VStack>
              <HStack spacing={3} justify="flex-end">
                <Button
                  leftIcon={<FiThumbsUp />}
                  colorScheme="green"
                  onClick={() => handleApplicationAction('approve', approvalReason)}
                  isLoading={processing}
                  variant="solid"
                  _hover={{ bg: "green.600", shadow: "green.glow" }}
                >
                  Approve
                </Button>
                <Button
                  leftIcon={<FiThumbsDown />}
                  colorScheme="red"
                  onClick={() => handleApplicationAction('reject', approvalReason)}
                  isLoading={processing}
                  variant="solid"
                  _hover={{ bg: "red.600", shadow: "red.glow" }}
                >
                  Reject
                </Button>
                <Button
                  leftIcon={<FiAlertTriangle />}
                  colorScheme="orange"
                  onClick={() => handleApplicationAction('request_info', approvalReason)}
                  isLoading={processing}
                  variant="solid"
                  _hover={{ bg: "orange.600", shadow: "orange.glow" }}
                >
                  Request More Info
                </Button>
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
