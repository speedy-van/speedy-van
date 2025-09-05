'use client';
import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  Flex,
  Spacer,
  IconButton,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Textarea,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import {
  EyeIcon,
  PencilIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { ErrorReport } from '../../agent/types';

interface ErrorReportsPanelProps {
  reports: ErrorReport[];
  onReportSelect: (report: ErrorReport) => void;
  onRefresh: () => void;
}

export default function ErrorReportsPanel({
  reports,
  onReportSelect,
  onRefresh,
}: ErrorReportsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null);
  
  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onClose: onViewModalClose } = useDisclosure();

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewReport = (report: ErrorReport) => {
    setSelectedReport(report);
    onViewModalOpen();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'gray';
      case 'reviewed': return 'blue';
      case 'approved': return 'green';
      case 'in_progress': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <ClockIcon className="h-4 w-4" />;
      case 'reviewed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'approved': return <CheckCircleIcon className="h-4 w-4" />;
      case 'in_progress': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatPeriod = (start: Date, end: Date) => {
    const startDate = new Date(start).toLocaleDateString();
    const endDate = new Date(end).toLocaleDateString();
    return `${startDate} - ${endDate}`;
  };

  return (
    <Box>
      {/* Header */}
      <Flex mb={6} align="center" justify="space-between">
        <HStack>
          <DocumentTextIcon className="h-6 w-6 text-blue-500" />
          <Text fontSize="xl" fontWeight="bold">
            Error Reports
          </Text>
          <Badge colorScheme="blue" variant="solid" borderRadius="full">
            {reports.length}
          </Badge>
        </HStack>

        <Button onClick={onRefresh} variant="outline">
          Refresh
        </Button>
      </Flex>

      {/* Search and Filter */}
      <Flex mb={6} gap={4} align="end">
        <FormControl maxW="300px">
          <FormLabel>Search Reports</FormLabel>
          <Input
            placeholder="Search by title or summary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FormControl>

        <FormControl maxW="200px">
          <FormLabel>Status</FormLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="All statuses"
          >
            <option value="draft">Draft</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="in_progress">In Progress</option>
          </Select>
        </FormControl>
      </Flex>

      {/* Reports Summary */}
      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={8}>
        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Reports</StatLabel>
                <StatNumber>{reports.length}</StatNumber>
                <StatHelpText>Generated reports</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Draft</StatLabel>
                <StatNumber color="gray.500">
                  {reports.filter(r => r.status === 'draft').length}
                </StatNumber>
                <StatHelpText>Pending review</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>In Progress</StatLabel>
                <StatNumber color="orange.500">
                  {reports.filter(r => r.status === 'in_progress').length}
                </StatNumber>
                <StatHelpText>Being addressed</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Resolved</StatLabel>
                <StatNumber color="green.500">
                  {reports.filter(r => r.status === 'approved').length}
                </StatNumber>
                <StatHelpText>Completed</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Reports Table */}
      <Box overflowX="auto" borderWidth={1} borderRadius="lg">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Title</Th>
              <Th>Period</Th>
              <Th>Generated</Th>
              <Th>Assignee</Th>
              <Th>Status</Th>
              <Th>Statistics</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredReports.map((report) => (
              <Tr key={report.id} _hover={{ bg: 'gray.50' }}>
                <Td maxW="250px">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium" noOfLines={1}>
                      {report.title}
                    </Text>
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      {report.summary}
                    </Text>
                  </VStack>
                </Td>
                
                <Td>
                  <Text fontSize="sm">
                    {formatPeriod(report.period.start, report.period.end)}
                  </Text>
                </Td>
                
                <Td>
                  <Text fontSize="sm">
                    {formatDate(report.generatedAt)}
                  </Text>
                </Td>
                
                <Td>
                  {report.assignee ? (
                    <HStack>
                      <UserIcon className="h-4 w-4" />
                      <Text fontSize="sm">{report.assignee}</Text>
                    </HStack>
                  ) : (
                    <Text fontSize="sm" color="gray.500">Unassigned</Text>
                  )}
                </Td>
                
                <Td>
                  <Badge colorScheme={getStatusColor(report.status)} variant="subtle">
                    <HStack spacing={1}>
                      {getStatusIcon(report.status)}
                      <Text>{report.status.replace('_', ' ')}</Text>
                    </HStack>
                  </Badge>
                </Td>
                
                <Td>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm">
                      {report.statistics.totalErrors} errors
                    </Text>
                    <Text fontSize="sm" color="red.500">
                      {report.statistics.criticalErrors} critical
                    </Text>
                    <Text fontSize="sm" color="green.500">
                      {report.statistics.resolvedErrors} resolved
                    </Text>
                  </VStack>
                </Td>
                
                <Td>
                  <HStack spacing={2}>
                    <Tooltip label="View Report">
                      <IconButton
                        aria-label="View report details"
                        icon={<EyeIcon className="h-4 w-4" />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewReport(report)}
                      />
                    </Tooltip>
                    <Tooltip label="Edit Report">
                      <IconButton
                        aria-label="Edit report"
                        icon={<PencilIcon className="h-4 w-4" />}
                        size="sm"
                        variant="ghost"
                        onClick={() => onReportSelect(report)}
                      />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* No Reports Message */}
      {filteredReports.length === 0 && (
        <Alert status="info" mt={6}>
          <AlertIcon />
          <Text>
            {searchTerm || statusFilter 
              ? 'No reports match the current filters.'
              : 'No error reports have been generated yet.'
            }
          </Text>
        </Alert>
      )}

      {/* View Report Modal */}
      <Modal isOpen={isViewModalOpen} onClose={onViewModalClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <DocumentTextIcon className="h-6 w-6 text-blue-500" />
              <Text>{selectedReport?.title}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedReport && (
              <VStack spacing={6} align="stretch">
                {/* Report Summary */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Summary</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text>{selectedReport.summary}</Text>
                  </CardBody>
                </Card>

                {/* Report Statistics */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Statistics</Heading>
                  </CardHeader>
                  <CardBody>
                    <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                      <Stat>
                        <StatLabel>Total Errors</StatLabel>
                        <StatNumber>{selectedReport.statistics.totalErrors}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Critical Errors</StatLabel>
                        <StatNumber color="red.500">{selectedReport.statistics.criticalErrors}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Resolved</StatLabel>
                        <StatNumber color="green.500">{selectedReport.statistics.resolvedErrors}</StatNumber>
                      </Stat>
                    </Grid>
                    
                    <Divider my={4} />
                    
                    <VStack align="stretch" spacing={4}>
                      <Text fontWeight="medium">Top Categories:</Text>
                      {selectedReport.statistics.topCategories.map((category, index) => (
                        <Box key={index}>
                          <Flex justify="space-between" mb={2}>
                            <Text>{category.category}</Text>
                            <Text fontWeight="medium">{category.count}</Text>
                          </Flex>
                          <Progress
                            value={(category.count / selectedReport.statistics.totalErrors) * 100}
                            colorScheme="blue"
                            size="sm"
                            borderRadius="full"
                          />
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Recommendations */}
                {selectedReport.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <Heading size="md">Recommendations</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        {selectedReport.recommendations.map((rec, index) => (
                          <Box key={index} p={4} borderWidth={1} borderRadius="md">
                            <HStack mb={3}>
                              <Badge
                                colorScheme={
                                  rec.priority === 'urgent' ? 'red' :
                                  rec.priority === 'high' ? 'orange' :
                                  rec.priority === 'medium' ? 'yellow' : 'green'
                                }
                                variant="solid"
                              >
                                {rec.priority}
                              </Badge>
                              <Text fontWeight="medium">{rec.title}</Text>
                            </HStack>
                            <Text mb={3}>{rec.description}</Text>
                            <Text fontSize="sm" color="gray.600" mb={2}>
                              <strong>Impact:</strong> {rec.impact}
                            </Text>
                            <Text fontSize="sm" color="gray.600" mb={3}>
                              <strong>Estimated Effort:</strong> {rec.estimatedEffort}
                            </Text>
                            <Text fontSize="sm" fontWeight="medium">Action Items:</Text>
                            <VStack align="start" spacing={1} mt={2}>
                              {rec.actionItems.map((item, itemIndex) => (
                                <Text key={itemIndex} fontSize="sm" color="gray.700">
                                  • {item}
                                </Text>
                              ))}
                            </VStack>
                          </Box>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* Report Metadata */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Report Details</Heading>
                  </CardHeader>
                  <CardBody>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <Box>
                        <Text fontWeight="medium">Generated:</Text>
                        <Text>{formatDate(selectedReport.generatedAt)}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="medium">Period:</Text>
                        <Text>{formatPeriod(selectedReport.period.start, selectedReport.period.end)}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="medium">Status:</Text>
                        <Badge colorScheme={getStatusColor(selectedReport.status)}>
                          {selectedReport.status.replace('_', ' ')}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontWeight="medium">Assignee:</Text>
                        <Text>{selectedReport.assignee || 'Unassigned'}</Text>
                      </Box>
                    </Grid>
                  </CardBody>
                </Card>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
