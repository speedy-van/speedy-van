'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Button,
  useToast,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import {
  FaChartBar,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaUser,
  FaUsers,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBoxes,
  FaDownload,
  FaRedo,
} from 'react-icons/fa';

interface CompleteBooking {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceType: string;
  serviceName: string;
  pickupDate: string;
  pickupTime: string;
  pickupAddress: any;
  dropoffAddress: any;
  items: any[];
  estimatedTotal: number;
  bookingId: string;
  completedAt: string;
  bookingSource: string;
  totalSteps: number;
  completionRate: number;
  sessionDuration: number;
}

interface IncompleteBooking {
  step: number;
  reason: string;
  data: any;
  timestamp: string;
  sessionId: string;
}

export default function AdminAnalyticsPage() {
  const [completeBookings, setCompleteBookings] = useState<CompleteBooking[]>(
    []
  );
  const [incompleteBookings, setIncompleteBookings] = useState<
    IncompleteBooking[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Load data from localStorage
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    try {
      const complete = JSON.parse(
        localStorage.getItem('admin-complete-bookings') || '[]'
      );
      const incomplete = JSON.parse(
        localStorage.getItem('admin-incomplete-bookings') || '[]'
      );

      setCompleteBookings(complete);
      setIncompleteBookings(incomplete);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  const refreshData = () => {
    setIsLoading(true);
    loadAnalyticsData();
    setTimeout(() => setIsLoading(false), 1000);

    toast({
      title: 'Data Refreshed',
      description: 'Analytics data has been updated',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const exportData = (type: 'complete' | 'incomplete') => {
    const data = type === 'complete' ? completeBookings : incompleteBookings;
    const filename = `speedy-van-${type}-bookings-${new Date().toISOString().split('T')[0]}.json`;

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Data Exported',
      description: `${type} bookings data has been downloaded`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const getStepName = (step: number) => {
    switch (step) {
      case 1:
        return 'Where & What';
      case 2:
        return 'Who & Payment';
      case 3:
        return 'Confirmation';
      default:
        return `Step ${step}`;
    }
  };

  const getReasonColor = (reason: string) => {
    if (reason.includes('abandoned')) return 'red';
    if (reason.includes('left')) return 'orange';
    return 'yellow';
  };

  const calculateStats = () => {
    const totalComplete = completeBookings.length;
    const totalIncomplete = incompleteBookings.length;
    const totalBookings = totalComplete + totalIncomplete;
    const completionRate =
      totalBookings > 0 ? (totalComplete / totalBookings) * 100 : 0;

    const stepAbandonment = incompleteBookings.reduce(
      (acc, booking) => {
        acc[booking.step] = (acc[booking.step] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    const averageSessionDuration =
      completeBookings.length > 0
        ? completeBookings.reduce(
            (sum, booking) => sum + (booking.sessionDuration || 0),
            0
          ) / completeBookings.length
        : 0;

    return {
      totalComplete,
      totalIncomplete,
      totalBookings,
      completionRate,
      stepAbandonment,
      averageSessionDuration,
    };
  };

  const stats = calculateStats();

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <VStack spacing={4} textAlign="center">
          <Heading size="2xl" color="blue.600">
            📊 Speedy Van Analytics Dashboard
          </Heading>
          <Text fontSize="lg" color="text.secondary">
            Complete overview of booking performance and user behavior
          </Text>
        </VStack>

        {/* Action Buttons */}
        <HStack justify="space-between">
          <HStack spacing={4}>
            <Button
              leftIcon={<FaRedo />}
              onClick={refreshData}
              isLoading={isLoading}
              colorScheme="blue"
            >
              Refresh Data
            </Button>
            <Button
              leftIcon={<FaDownload />}
              onClick={() => exportData('complete')}
              colorScheme="green"
              isDisabled={completeBookings.length === 0}
            >
              Export Complete
            </Button>
            <Button
              leftIcon={<FaDownload />}
              onClick={() => exportData('incomplete')}
              colorScheme="orange"
              isDisabled={incompleteBookings.length === 0}
            >
              Export Incomplete
            </Button>
          </HStack>

          <Text fontSize="sm" color="text.secondary">
            <span suppressHydrationWarning>
              Last updated: {new Date().toLocaleString()}
            </span>
          </Text>
        </HStack>

        {/* Key Statistics */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Card>
            <CardBody textAlign="center">
              <Stat>
                <StatLabel>Total Bookings</StatLabel>
                <StatNumber color="blue.600">{stats.totalBookings}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {stats.totalComplete} completed
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center">
              <Stat>
                <StatLabel>Completion Rate</StatLabel>
                <StatNumber color="green.600">
                  {stats.completionRate.toFixed(1)}%
                </StatNumber>
                <StatHelpText>
                  {stats.totalComplete} of {stats.totalBookings} completed
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center">
              <Stat>
                <StatLabel>Incomplete Bookings</StatLabel>
                <StatNumber color="red.600">{stats.totalIncomplete}</StatNumber>
                <StatHelpText>
                  {stats.totalIncomplete > 0 ? 'Needs attention' : 'All good'}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center">
              <Stat>
                <StatLabel>Avg Session Time</StatLabel>
                <StatNumber color="purple.600">
                  {Math.round(stats.averageSessionDuration / 1000 / 60)}m
                </StatNumber>
                <StatHelpText>Time to complete booking</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Step Abandonment Analysis */}
        {Object.keys(stats.stepAbandonment).length > 0 && (
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="red.600">
                  🚨 Step Abandonment Analysis
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  {Object.entries(stats.stepAbandonment).map(
                    ([step, count]) => (
                      <Box
                        key={step}
                        p={4}
                        bg="red.50"
                        borderRadius="md"
                        border="1px"
                        borderColor="red.200"
                      >
                        <Text fontWeight="bold" color="red.700">
                          {getStepName(parseInt(step))}
                        </Text>
                        <Text fontSize="2xl" color="red.600">
                          {count} abandonments
                        </Text>
                        <Text fontSize="sm" color="red.500">
                          {((count / stats.totalIncomplete) * 100).toFixed(1)}%
                          of total
                        </Text>
                      </Box>
                    )
                  )}
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Detailed Data Tabs */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <FaChartBar />
                <Text>Overview</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <FaUsers />
                <Text>Visitors</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <FaCheckCircle />
                <Text>Complete Bookings ({completeBookings.length})</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <FaTimesCircle />
                <Text>Incomplete Bookings ({incompleteBookings.length})</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="lg" color="blue.600">
                  📊 Analytics Overview
                </Heading>
                <Text color="text.secondary">
                  Welcome to the Speedy Van Analytics Dashboard. Here you can
                  view comprehensive insights about your business performance.
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Card>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Heading size="md" color="blue.600">
                          Quick Actions
                        </Heading>
                        <VStack spacing={3} align="stretch">
                          <Button
                            leftIcon={<FaUsers />}
                            colorScheme="blue"
                            variant="outline"
                            onClick={() =>
                              (window.location.href = '/admin/visitors')
                            }
                          >
                            View Visitors Analytics
                          </Button>
                          <Button
                            leftIcon={<FaDownload />}
                            colorScheme="green"
                            variant="outline"
                            onClick={() => {
                              const data = {
                                completeBookings,
                                incompleteBookings,
                                timestamp: new Date().toISOString(),
                              };
                              const blob = new Blob(
                                [JSON.stringify(data, null, 2)],
                                { type: 'application/json' }
                              );
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `speedy-van-analytics-${new Date().toISOString().split('T')[0]}.json`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                          >
                            Export All Data
                          </Button>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Heading size="md" color="green.600">
                          System Status
                        </Heading>
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between">
                            <Text>Data Collection:</Text>
                            <Badge colorScheme="green">Active</Badge>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>Visitor Tracking:</Text>
                            <Badge colorScheme="green">Active</Badge>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>Analytics Engine:</Text>
                            <Badge colorScheme="green">Active</Badge>
                          </HStack>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* Visitors Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="lg" color="purple.600">
                  👥 Visitors Analytics
                </Heading>
                <Text color="text.secondary">
                  Track visitor behavior, location patterns, and engagement
                  metrics.
                </Text>

                <Card>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Heading size="md">Quick Access</Heading>
                        <Button
                          leftIcon={<FaUsers />}
                          colorScheme="purple"
                          onClick={() =>
                            (window.location.href = '/admin/visitors')
                          }
                        >
                          Open Visitors Dashboard
                        </Button>
                      </HStack>
                      <Text color="text.secondary">
                        Click the button above to access the comprehensive
                        visitors analytics dashboard with detailed insights,
                        maps, and filtering options.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Complete Bookings Tab */}
            <TabPanel>
              {completeBookings.length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>No Complete Bookings</AlertTitle>
                    <AlertDescription>
                      Complete bookings will appear here once users finish the
                      booking process.
                    </AlertDescription>
                  </Box>
                </Alert>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Customer</Th>
                        <Th>Service</Th>
                        <Th>Date/Time</Th>
                        <Th>Items</Th>
                        <Th>Total</Th>
                        <Th>Completed</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {completeBookings.map((booking, index) => (
                        <Tr key={index}>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold">
                                {booking.customerName}
                              </Text>
                              <Text fontSize="sm" color="text.secondary">
                                <Icon as={FaPhone} mr={1} />
                                {booking.customerPhone}
                              </Text>
                              <Text fontSize="sm" color="text.secondary">
                                <Icon as={FaEnvelope} mr={1} />
                                {booking.customerEmail}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold">
                                {booking.serviceName}
                              </Text>
                              <Badge colorScheme="blue">
                                {booking.serviceType}
                              </Badge>
                            </VStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold">
                                <Icon as={FaCalendarAlt} mr={1} />
                                {new Date(
                                  booking.pickupDate
                                ).toLocaleDateString()}
                              </Text>
                              <Text fontSize="sm" color="text.secondary">
                                <Icon as={FaClock} mr={1} />
                                {booking.pickupTime}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold">
                                <Icon as={FaBoxes} mr={1} />
                                {booking.items.length} items
                              </Text>
                              <Text fontSize="sm" color="text.secondary">
                                {booking.items
                                  .map(item => item.name)
                                  .join(', ')}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Text fontWeight="bold" color="green.600">
                              £{booking.estimatedTotal}
                            </Text>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm" color="text.secondary">
                                {new Date(
                                  booking.completedAt
                                ).toLocaleDateString()}
                              </Text>
                              <Text fontSize="sm" color="text.secondary">
                                {Math.round(
                                  booking.sessionDuration / 1000 / 60
                                )}
                                m
                              </Text>
                            </VStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </TabPanel>

            {/* Incomplete Bookings Tab */}
            <TabPanel>
              {incompleteBookings.length === 0 ? (
                <Alert status="success">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>No Incomplete Bookings</AlertTitle>
                    <AlertDescription>
                      Great! All users are completing their bookings
                      successfully.
                    </AlertDescription>
                  </Box>
                </Alert>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Step</Th>
                        <Th>Reason</Th>
                        <Th>Data Collected</Th>
                        <Th>Timestamp</Th>
                        <Th>Session ID</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {incompleteBookings.map((booking, index) => (
                        <Tr key={index}>
                          <Td>
                            <Badge colorScheme="red" size="lg">
                              {getStepName(booking.step)}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme={getReasonColor(booking.reason)}>
                              {booking.reason}
                            </Badge>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              {booking.data.items && (
                                <Text fontSize="sm">
                                  <Icon as={FaBoxes} mr={1} />
                                  {booking.data.items.length} items selected
                                </Text>
                              )}
                              {booking.data.customerDetails?.firstName && (
                                <Text fontSize="sm">
                                  <Icon as={FaUser} mr={1} />
                                  {booking.data.customerDetails.firstName}{' '}
                                  {booking.data.customerDetails.lastName}
                                </Text>
                              )}
                              {booking.data.pickupAddress?.line1 && (
                                <Text fontSize="sm">
                                  <Icon as={FaMapMarkerAlt} mr={1} />
                                  Pickup: {booking.data.pickupAddress.line1}
                                </Text>
                              )}
                              {booking.data.serviceType && (
                                <Text fontSize="sm">
                                  Service: {booking.data.serviceType}
                                </Text>
                              )}
                            </VStack>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {new Date(booking.timestamp).toLocaleString()}
                            </Text>
                          </Td>
                          <Td>
                            <Text
                              fontSize="xs"
                              fontFamily="mono"
                              color="text.secondary"
                            >
                              {booking.sessionId}
                            </Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Recommendations */}
        {stats.totalIncomplete > 0 && (
          <Card bg="orange.50" borderColor="orange.200">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="orange.700">
                  💡 Recommendations to Improve Completion Rate
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {stats.stepAbandonment[1] > 0 && (
                    <Alert status="warning">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Step 1 Issues</AlertTitle>
                        <AlertDescription>
                          {stats.stepAbandonment[1]} users abandoned at item
                          selection. Consider simplifying the item selection
                          process or adding progress indicators.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  {stats.stepAbandonment[2] > 0 && (
                    <Alert status="warning">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Step 2 Issues</AlertTitle>
                        <AlertDescription>
                          {stats.stepAbandonment[2]} users abandoned at customer
                          details. Consider reducing required fields or adding
                          auto-save functionality.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>General Improvements</AlertTitle>
                      <AlertDescription>
                        • Add exit-intent popups to capture contact information
                        <br />
                        • Implement email/SMS follow-up campaigns
                        <br />
                        • Add progress bars and completion incentives
                        <br />• Optimize mobile experience for better engagement
                      </AlertDescription>
                    </Box>
                  </Alert>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
}
