'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Select,
  Input,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Alert,
  AlertIcon,
  Spinner,
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
  Divider,
} from '@chakra-ui/react';
import {
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { ProductionError, ErrorReport, ErrorFilter, ErrorAnalytics } from '../../agent/types';
import ErrorList from './ErrorList';
import ErrorAnalyticsPanel from './ErrorAnalyticsPanel';
import ErrorReportsPanel from './ErrorReportsPanel';
import ErrorDetailsModal from './ErrorDetailsModal';
import GenerateReportModal from './GenerateReportModal';

interface ProductionErrorDashboardProps {
  className?: string;
}

export default function ProductionErrorDashboard({ className }: ProductionErrorDashboardProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [errors, setErrors] = useState<ProductionError[]>([]);
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [analytics, setAnalytics] = useState<ErrorAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<ErrorFilter>({});
  const [selectedError, setSelectedError] = useState<ProductionError | null>(null);
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null);
  
  const toast = useToast();
  const { isOpen: isErrorModalOpen, onOpen: onErrorModalOpen, onClose: onErrorModalClose } = useDisclosure();
  const { isOpen: isReportModalOpen, onOpen: onReportModalOpen, onClose: onReportModalClose } = useDisclosure();

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch errors
      const errorsResponse = await fetch('/api/errors?action=list');
      const errorsData = await errorsResponse.json();
      if (errorsData.success) {
        setErrors(errorsData.errors);
      }

      // Fetch analytics
      const analyticsResponse = await fetch('/api/errors?action=analytics');
      const analyticsData = await analyticsResponse.json();
      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }

      // Fetch reports
      const reportsResponse = await fetch('/api/errors/reports');
      const reportsData = await reportsResponse.json();
      if (reportsData.success) {
        setReports(reportsData.reports);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch error monitoring data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleErrorSelect = useCallback((error: ProductionError) => {
    setSelectedError(error);
    onErrorModalOpen();
  }, [onErrorModalOpen]);

  const handleReportSelect = useCallback((report: ErrorReport) => {
    setSelectedReport(report);
    // You can implement report viewing logic here
  }, []);

  const handleFilterChange = useCallback((newFilter: Partial<ErrorFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const getCriticalErrorCount = useCallback(() => {
    return errors.filter(error => error.level === 'critical').length;
  }, [errors]);

  const getUnresolvedErrorCount = useCallback(() => {
    return errors.filter(error => error.metadata.status === 'new').length;
  }, [errors]);

  const getErrorRate = useCallback(() => {
    if (!analytics) return 0;
    return analytics.errorRate;
  }, [analytics]);

  const getAverageResolutionTime = useCallback(() => {
    if (!analytics) return 0;
    return analytics.resolutionTime.average;
  }, [analytics]);

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading production error monitoring data...</Text>
      </Box>
    );
  }

  return (
    <Box className={className} p={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <VStack align="start" spacing={2}>
          <HStack>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            <Text fontSize="2xl" fontWeight="bold">
              Production Error Monitoring
            </Text>
          </HStack>
          <Text color="gray.600">
            Monitor, analyze, and manage production errors in real-time
          </Text>
        </VStack>
        
        <HStack spacing={4}>
          <Button
            leftIcon={<PlusIcon className="h-4 w-4" />}
            colorScheme="blue"
            onClick={onReportModalOpen}
          >
            Generate Report
          </Button>
          <Button
            leftIcon={<ArrowPathIcon className="h-4 w-4" />}
            variant="outline"
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </HStack>
      </Flex>

      {/* Quick Stats */}
      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={8}>
        <GridItem>
          <Stat>
            <StatLabel>Total Errors</StatLabel>
            <StatNumber>{errors.length}</StatNumber>
            <StatHelpText>
              <StatArrow type="decrease" />
              {getErrorRate().toFixed(2)} per hour
            </StatHelpText>
          </Stat>
        </GridItem>
        
        <GridItem>
          <Stat>
            <StatLabel>Critical Errors</StatLabel>
            <StatNumber color="red.500">{getCriticalErrorCount()}</StatNumber>
            <StatHelpText>Requires immediate attention</StatHelpText>
          </Stat>
        </GridItem>
        
        <GridItem>
          <Stat>
            <StatLabel>Unresolved</StatLabel>
            <StatNumber color="orange.500">{getUnresolvedErrorCount()}</StatNumber>
            <StatHelpText>Pending investigation</StatHelpText>
          </Stat>
        </GridItem>
        
        <GridItem>
          <Stat>
            <StatLabel>Avg Resolution</StatLabel>
            <StatNumber>{getAverageResolutionTime().toFixed(1)}h</StatNumber>
            <StatHelpText>Time to resolve issues</StatHelpText>
          </Stat>
        </GridItem>
      </Grid>

      {/* Main Content Tabs */}
      <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
        <TabList>
          <Tab>
            <HStack>
              <ExclamationTriangleIcon className="h-4 w-4" />
              <Text>Errors</Text>
              <Badge colorScheme="red" variant="solid" borderRadius="full">
                {errors.length}
              </Badge>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <ChartBarIcon className="h-4 w-4" />
              <Text>Analytics</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <DocumentTextIcon className="h-4 w-4" />
              <Text>Reports</Text>
              <Badge colorScheme="blue" variant="solid" borderRadius="full">
                {reports.length}
              </Badge>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {/* Errors Tab */}
          <TabPanel>
            <ErrorList
              errors={errors}
              filter={filter}
              onFilterChange={handleFilterChange}
              onErrorSelect={handleErrorSelect}
              onRefresh={handleRefresh}
            />
          </TabPanel>

          {/* Analytics Tab */}
          <TabPanel>
            <ErrorAnalyticsPanel
              analytics={analytics}
              filter={filter}
              onFilterChange={handleFilterChange}
            />
          </TabPanel>

          {/* Reports Tab */}
          <TabPanel>
            <ErrorReportsPanel
              reports={reports}
              onReportSelect={handleReportSelect}
              onRefresh={handleRefresh}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Error Details Modal */}
      <ErrorDetailsModal
        isOpen={isErrorModalOpen}
        onClose={onErrorModalClose}
        error={selectedError}
        onStatusUpdate={handleRefresh}
      />

      {/* Generate Report Modal */}
      <GenerateReportModal
        isOpen={isReportModalOpen}
        onClose={onReportModalClose}
        onReportGenerated={handleRefresh}
      />
    </Box>
  );
}
