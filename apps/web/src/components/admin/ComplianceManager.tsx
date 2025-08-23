"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  GridItem,
  Icon,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Heading,
} from "@chakra-ui/react";
import {
  FiShield,
  FiAlertTriangle,
  FiClock,
  FiCheck,
  FiX,
  FiSearch,
  FiMail,
  FiCalendar,
  FiUser,
  FiTruck,
  FiFileText,
} from "react-icons/fi";

interface ComplianceIssue {
  driverId: string;
  driverName: string;
  driverEmail: string;
  issueType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  expiryDate: string;
  daysUntilExpiry: number;
  documentType: string;
}

interface ComplianceManagerProps {
  drivers: any[];
}

export default function ComplianceManager({ drivers }: ComplianceManagerProps) {
  const [complianceIssues, setComplianceIssues] = useState<ComplianceIssue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<ComplianceIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<ComplianceIssue | null>(null);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [documentFilter, setDocumentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    processComplianceIssues();
  }, [drivers]);

  useEffect(() => {
    filterIssues();
  }, [complianceIssues, severityFilter, documentFilter, searchTerm]);

  const processComplianceIssues = () => {
    const issues: ComplianceIssue[] = [];
    const now = new Date();

    drivers.forEach(driver => {
      // Check license expiry
      if (driver.documentExpiries?.license) {
        const expiryDate = new Date(driver.documentExpiries.license);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 30) {
          issues.push({
            driverId: driver.id,
            driverName: driver.name,
            driverEmail: driver.email,
            issueType: 'license_expiry',
            severity: daysUntilExpiry <= 0 ? 'critical' : daysUntilExpiry <= 7 ? 'high' : daysUntilExpiry <= 14 ? 'medium' : 'low',
            description: `Driver license expires ${daysUntilExpiry <= 0 ? 'today' : `in ${daysUntilExpiry} days`}`,
            expiryDate: driver.documentExpiries.license,
            daysUntilExpiry,
            documentType: 'License',
          });
        }
      }

      // Check insurance expiry
      if (driver.documentExpiries?.insurance) {
        const expiryDate = new Date(driver.documentExpiries.insurance);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 30) {
          issues.push({
            driverId: driver.id,
            driverName: driver.name,
            driverEmail: driver.email,
            issueType: 'insurance_expiry',
            severity: daysUntilExpiry <= 0 ? 'critical' : daysUntilExpiry <= 7 ? 'high' : daysUntilExpiry <= 14 ? 'medium' : 'low',
            description: `Vehicle insurance expires ${daysUntilExpiry <= 0 ? 'today' : `in ${daysUntilExpiry} days`}`,
            expiryDate: driver.documentExpiries.insurance,
            daysUntilExpiry,
            documentType: 'Insurance',
          });
        }
      }

      // Check MOT expiry
      if (driver.documentExpiries?.mot) {
        const expiryDate = new Date(driver.documentExpiries.mot);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 30) {
          issues.push({
            driverId: driver.id,
            driverName: driver.name,
            driverEmail: driver.email,
            issueType: 'mot_expiry',
            severity: daysUntilExpiry <= 0 ? 'critical' : daysUntilExpiry <= 7 ? 'high' : daysUntilExpiry <= 14 ? 'medium' : 'low',
            description: `MOT certificate expires ${daysUntilExpiry <= 0 ? 'today' : `in ${daysUntilExpiry} days`}`,
            expiryDate: driver.documentExpiries.mot,
            daysUntilExpiry,
            documentType: 'MOT',
          });
        }
      }

      // Check right to work expiry
      if (driver.documentExpiries?.rtw) {
        const expiryDate = new Date(driver.documentExpiries.rtw);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 30) {
          issues.push({
            driverId: driver.id,
            driverName: driver.name,
            driverEmail: driver.email,
            issueType: 'rtw_expiry',
            severity: daysUntilExpiry <= 0 ? 'critical' : daysUntilExpiry <= 7 ? 'high' : daysUntilExpiry <= 14 ? 'medium' : 'low',
            description: `Right to work expires ${daysUntilExpiry <= 0 ? 'today' : `in ${daysUntilExpiry} days`}`,
            expiryDate: driver.documentExpiries.rtw,
            daysUntilExpiry,
            documentType: 'Right to Work',
          });
        }
      }

      // Check compliance issues from driver data
      if (driver.complianceIssues && driver.complianceIssues.length > 0) {
        driver.complianceIssues.forEach((issue: string) => {
          issues.push({
            driverId: driver.id,
            driverName: driver.name,
            driverEmail: driver.email,
            issueType: 'compliance_issue',
            severity: 'high',
            description: issue,
            expiryDate: new Date().toISOString(),
            daysUntilExpiry: 0,
            documentType: 'Compliance',
          });
        });
      }
    });

    setComplianceIssues(issues.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry));
    setLoading(false);
  };

  const filterIssues = () => {
    let filtered = complianceIssues;

    if (severityFilter !== 'all') {
      filtered = filtered.filter(issue => issue.severity === severityFilter);
    }

    if (documentFilter !== 'all') {
      filtered = filtered.filter(issue => issue.documentType === documentFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(issue => 
        issue.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.driverEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredIssues(filtered);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return FiX;
      case 'high': return FiAlertTriangle;
      case 'medium': return FiClock;
      case 'low': return FiCheck;
      default: return FiShield;
    }
  };

  const sendReminder = async (issue: ComplianceIssue) => {
    try {
      // This would typically call an API to send a reminder
      toast({
        title: "Reminder Sent",
        description: `Reminder sent to ${issue.driverName} about ${issue.documentType} expiry`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reminder",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const criticalIssues = complianceIssues.filter(issue => issue.severity === 'critical');
  const highIssues = complianceIssues.filter(issue => issue.severity === 'high');
  const mediumIssues = complianceIssues.filter(issue => issue.severity === 'medium');
  const lowIssues = complianceIssues.filter(issue => issue.severity === 'low');

  if (loading) {
    return (
      <Box p={6}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading compliance data...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Compliance Management</Heading>
            <Text color="gray.600">Monitor driver document expiries and compliance issues</Text>
          </VStack>
          <Button
            leftIcon={<FiMail />}
            colorScheme="blue"
            onClick={() => {
              // Send bulk reminders
              toast({
                title: "Bulk Reminders",
                description: "Sending reminders to all drivers with expiring documents",
                status: "info",
                duration: 3000,
                isClosable: true,
              });
            }}
          >
            Send Bulk Reminders
          </Button>
        </HStack>

        {/* Summary Cards */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
          <Card>
            <CardBody>
              <VStack spacing={2}>
                <Icon as={FiX} size="24px" color="red.500" />
                <Text fontWeight="medium">Critical</Text>
                <Text fontSize="2xl" fontWeight="bold" color="red.500">
                  {criticalIssues.length}
                </Text>
                <Text fontSize="sm" color="gray.600">Expired today</Text>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack spacing={2}>
                <Icon as={FiAlertTriangle} size="24px" color="orange.500" />
                <Text fontWeight="medium">High Priority</Text>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {highIssues.length}
                </Text>
                <Text fontSize="sm" color="gray.600">Expires within 7 days</Text>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack spacing={2}>
                <Icon as={FiClock} size="24px" color="yellow.500" />
                <Text fontWeight="medium">Medium Priority</Text>
                <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                  {mediumIssues.length}
                </Text>
                <Text fontSize="sm" color="gray.600">Expires within 14 days</Text>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack spacing={2}>
                <Icon as={FiCheck} size="24px" color="blue.500" />
                <Text fontWeight="medium">Low Priority</Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {lowIssues.length}
                </Text>
                <Text fontSize="sm" color="gray.600">Expires within 30 days</Text>
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Critical Issues Alert */}
        {criticalIssues.length > 0 && (
          <Alert status="error">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <AlertTitle>Critical Compliance Issues</AlertTitle>
              <AlertDescription>
                {criticalIssues.length} driver(s) have expired documents that require immediate attention.
                These drivers should be blocked from accepting new jobs until documents are renewed.
              </AlertDescription>
            </VStack>
          </Alert>
        )}

        {/* Filters */}
        <Card>
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              <InputGroup maxW="300px">
                <InputLeftElement>
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search drivers or issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                maxW="150px"
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
              <Select
                value={documentFilter}
                onChange={(e) => setDocumentFilter(e.target.value)}
                maxW="150px"
              >
                <option value="all">All Documents</option>
                <option value="License">License</option>
                <option value="Insurance">Insurance</option>
                <option value="MOT">MOT</option>
                <option value="Right to Work">Right to Work</option>
                <option value="Compliance">Compliance</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Issues Table */}
        <Card>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Driver</Th>
                  <Th>Issue</Th>
                  <Th>Document</Th>
                  <Th>Severity</Th>
                  <Th>Expiry</Th>
                  <Th>Days Left</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredIssues.map((issue) => (
                  <Tr key={`${issue.driverId}-${issue.issueType}`}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{issue.driverName}</Text>
                        <Text fontSize="sm" color="gray.600">{issue.driverEmail}</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{issue.description}</Text>
                    </Td>
                    <Td>
                      <Badge colorScheme="blue">{issue.documentType}</Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={getSeverityColor(issue.severity)}>
                        <Icon as={getSeverityIcon(issue.severity)} mr={1} />
                        {issue.severity}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {new Date(issue.expiryDate).toLocaleDateString()}
                      </Text>
                    </Td>
                    <Td>
                      <Text 
                        fontSize="sm" 
                        color={issue.daysUntilExpiry <= 0 ? 'red.500' : issue.daysUntilExpiry <= 7 ? 'orange.500' : 'gray.600'}
                        fontWeight={issue.daysUntilExpiry <= 7 ? 'bold' : 'normal'}
                      >
                        {issue.daysUntilExpiry <= 0 ? 'Expired' : `${issue.daysUntilExpiry} days`}
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedIssue(issue);
                            onOpen();
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => sendReminder(issue)}
                        >
                          Send Reminder
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {filteredIssues.length === 0 && (
              <VStack spacing={4} py={8}>
                <Icon as={FiCheck} size="48px" color="green.400" />
                <Text color="gray.600">No compliance issues found</Text>
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Issue Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Icon as={getSeverityIcon(selectedIssue?.severity || 'low')} color={`${getSeverityColor(selectedIssue?.severity || 'low')}.500`} />
              <Text>Compliance Issue Details</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedIssue && (
              <VStack spacing={4} align="stretch">
                <VStack align="start" spacing={2}>
                  <Text fontWeight="medium">Driver Information</Text>
                  <Text fontSize="sm" color="gray.600">Name: {selectedIssue.driverName}</Text>
                  <Text fontSize="sm" color="gray.600">Email: {selectedIssue.driverEmail}</Text>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Text fontWeight="medium">Issue Details</Text>
                  <Text fontSize="sm" color="gray.600">Type: {selectedIssue.documentType}</Text>
                  <Text fontSize="sm" color="gray.600">Description: {selectedIssue.description}</Text>
                  <Text fontSize="sm" color="gray.600">
                    Expiry Date: {new Date(selectedIssue.expiryDate).toLocaleDateString()}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Days Until Expiry: {selectedIssue.daysUntilExpiry <= 0 ? 'Expired' : selectedIssue.daysUntilExpiry}
                  </Text>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Text fontWeight="medium">Recommended Actions</Text>
                  <Text fontSize="sm" color="gray.600">
                    • Send reminder email to driver
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • Follow up with phone call if no response
                  </Text>
                  {selectedIssue.severity === 'critical' && (
                    <Text fontSize="sm" color="red.500" fontWeight="bold">
                      • BLOCK driver from accepting new jobs until resolved
                    </Text>
                  )}
                </VStack>

                <HStack spacing={3}>
                  <Button
                    colorScheme="blue"
                    onClick={() => {
                      sendReminder(selectedIssue);
                      onClose();
                    }}
                  >
                    Send Reminder
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Mark as resolved
                      toast({
                        title: "Issue Resolved",
                        description: "Compliance issue marked as resolved",
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                      });
                      onClose();
                    }}
                  >
                    Mark Resolved
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
