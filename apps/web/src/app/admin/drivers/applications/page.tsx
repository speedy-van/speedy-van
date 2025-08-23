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
  const toast = useToast();

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
        onClose();
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
            <Text color="gray.600">Review and approve new driver applications</Text>
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
            >
              Auto-approve Eligible ({autoApproveEligible.length})
            </Button>
          </HStack>
        </Flex>

        {/* Stats Row */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
          <Stat>
            <StatLabel>Pending Review</StatLabel>
            <StatNumber color="orange.500">{pendingApplications.length}</StatNumber>
            <StatHelpText>Awaiting approval</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Auto-approve Eligible</StatLabel>
            <StatNumber color="green.500">{autoApproveEligible.length}</StatNumber>
            <StatHelpText>Score ≥ 85, all docs complete</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Average Score</StatLabel>
            <StatNumber>
              {pendingApplications.length > 0 
                ? Math.round(pendingApplications.reduce((sum, app) => sum + app.score, 0) / pendingApplications.length)
                : 0
              }
            </StatNumber>
            <StatHelpText>Of pending applications</StatHelpText>
          </Stat>
        </Grid>

        {/* Filters */}
        <Card>
          <CardBody>
            <HStack spacing={4}>
              <InputGroup maxW="300px">
                <InputLeftElement>
                  <Icon as={FiSearch} color="gray.400" />
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
              }}
              _hover={{ shadow: "lg" }}
              borderLeft="4px solid"
              borderLeftColor={getScoreColor(application.score)}
            >
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <Flex justify="space-between" align="start">
                    <VStack align="start" spacing={1}>
                      <Heading size="md">{application.name}</Heading>
                      <Text color="gray.600" fontSize="sm">{application.email}</Text>
                      <Text color="gray.600" fontSize="sm">{application.phone}</Text>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Badge colorScheme={getScoreColor(application.score)}>
                        Score: {application.score}
                      </Badge>
                      <Badge colorScheme={application.autoApproveEligible ? "green" : "gray"}>
                        {application.autoApproveEligible ? "Auto-approve" : "Manual Review"}
                      </Badge>
                    </VStack>
                  </Flex>

                  <Divider />

                  <Grid templateColumns="1fr 1fr" gap={3}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="medium">Vehicle</Text>
                      <Text fontSize="sm" color="gray.600">
                        {application.vehicle.year} {application.vehicle.make} {application.vehicle.model}
                      </Text>
                      <Text fontSize="sm" color="gray.600">{application.vehicle.reg}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="medium">Experience</Text>
                      <Text fontSize="sm" color="gray.600">{application.experience}</Text>
                      <Text fontSize="sm" color="gray.600">Rating: {application.rating}/5</Text>
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
          <Card>
            <CardBody>
              <VStack spacing={4} py={8}>
                <Icon as={FiUser} size="48px" color="gray.400" />
                <Text color="gray.600">No applications found</Text>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>

      {/* Application Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <VStack align="start" spacing={1}>
              <Heading size="md">Review Application: {selectedApplication?.name}</Heading>
              <Text color="gray.600" fontSize="sm">Score: {selectedApplication?.score}/100</Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedApplication && (
              <Tabs index={selectedTab} onChange={setSelectedTab}>
                <TabList>
                  <Tab>Overview</Tab>
                  <Tab>Documents</Tab>
                  <Tab>Vehicle</Tab>
                  <Tab>Compliance</Tab>
                </TabList>

                <TabPanels>
                  {/* Overview Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Grid templateColumns="1fr 1fr" gap={6}>
                        <VStack align="start" spacing={4}>
                          <Heading size="sm">Personal Information</Heading>
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
                          <Heading size="sm">Application Details</Heading>
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
                        <Heading size="sm">Score Breakdown</Heading>
                        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} w="full">
                          <Card>
                            <CardBody>
                              <VStack spacing={2}>
                                <Text fontSize="sm" fontWeight="medium">Documents</Text>
                                <Progress 
                                  value={Object.values(selectedApplication.documents).filter(doc => doc.status === 'complete').length * 20} 
                                  colorScheme="green" 
                                  size="sm" 
                                />
                                <Text fontSize="sm" color="gray.600">
                                  {Object.values(selectedApplication.documents).filter(doc => doc.status === 'complete').length}/5 complete
                                </Text>
                              </VStack>
                            </CardBody>
                          </Card>
                          <Card>
                            <CardBody>
                              <VStack spacing={2}>
                                <Text fontSize="sm" fontWeight="medium">Experience</Text>
                                <Text fontSize="lg" fontWeight="bold">
                                  {parseInt(selectedApplication.experience.split(' ')[0])} years
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  {parseInt(selectedApplication.experience.split(' ')[0]) >= 5 ? 'Excellent' : 
                                   parseInt(selectedApplication.experience.split(' ')[0]) >= 3 ? 'Good' : 'Basic'}
                                </Text>
                              </VStack>
                            </CardBody>
                          </Card>
                          <Card>
                            <CardBody>
                              <VStack spacing={2}>
                                <Text fontSize="sm" fontWeight="medium">Rating</Text>
                                <HStack>
                                  <Icon as={FiStar} color="yellow.400" />
                                  <Text fontSize="lg" fontWeight="bold">{selectedApplication.rating}/5</Text>
                                </HStack>
                                <Text fontSize="sm" color="gray.600">
                                  {selectedApplication.rating >= 4.8 ? 'Excellent' : 
                                   selectedApplication.rating >= 4.5 ? 'Good' : 'Average'}
                                </Text>
                              </VStack>
                            </CardBody>
                          </Card>
                        </Grid>
                      </VStack>
                    </VStack>
                  </TabPanel>

                  {/* Documents Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Text fontWeight="medium">Document Review with OCR Data</Text>
                      
                      <Grid templateColumns="1fr 1fr" gap={6}>
                        {Object.entries(selectedApplication.documents).map(([docType, doc]) => (
                          <Card key={docType}>
                            <CardBody>
                              <VStack spacing={4} align="stretch">
                                <HStack justify="space-between">
                                  <Heading size="sm" textTransform="capitalize">{docType}</Heading>
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
                                      bg="gray.50" 
                                      p={3} 
                                      borderRadius="md" 
                                      fontSize="sm"
                                      maxH="200px"
                                      overflowY="auto"
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
                      <Heading size="sm">Vehicle Information</Heading>
                      
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
                      <Heading size="sm">Compliance Check</Heading>
                      
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
                        <Card>
                          <CardBody>
                            <VStack spacing={2}>
                              <Icon as={FiShield} size="24px" color="green.500" />
                              <Text fontWeight="medium">Right to Work</Text>
                              <Badge colorScheme="green">{selectedApplication.rightToWorkType}</Badge>
                            </VStack>
                          </CardBody>
                        </Card>
                        <Card>
                          <CardBody>
                            <VStack spacing={2}>
                              <Icon as={FiFile} size="24px" color="blue.500" />
                              <Text fontWeight="medium">DBS Check</Text>
                              <Badge colorScheme={selectedApplication.documents.dbs.status === 'complete' ? 'green' : 'red'}>
                                {selectedApplication.documents.dbs.status}
                              </Badge>
                            </VStack>
                          </CardBody>
                        </Card>
                        <Card>
                          <CardBody>
                            <VStack spacing={2}>
                              <Icon as={FiTruck} size="24px" color="purple.500" />
                              <Text fontWeight="medium">Vehicle Insurance</Text>
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

          <ModalFooter>
            <HStack spacing={3}>
              <Button
                leftIcon={<FiThumbsUp />}
                colorScheme="green"
                onClick={() => handleApplicationAction('approve')}
                isLoading={processing}
              >
                Approve
              </Button>
              <Button
                leftIcon={<FiThumbsDown />}
                colorScheme="red"
                onClick={() => handleApplicationAction('reject')}
                isLoading={processing}
              >
                Reject
              </Button>
              <Button
                leftIcon={<FiAlertTriangle />}
                colorScheme="orange"
                onClick={() => handleApplicationAction('request_info')}
                isLoading={processing}
              >
                Request More Info
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
