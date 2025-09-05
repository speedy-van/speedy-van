'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  VStack,
  HStack,
  Card,
  CardBody,
  SimpleGrid,
  Alert,
  AlertIcon,
  Button,
  Spinner,
  useToast,
  IconButton,
  Tooltip,
  Flex,
  Progress,
} from '@chakra-ui/react';
import {
  FiDollarSign,
  FiTruck,
  FiClock,
  FiMessageSquare,
  FiAlertTriangle,
  FiPlus,
  FiRefreshCw,
  FiMapPin,
  FiExternalLink,
  FiTrendingUp,
  FiTrendingDown,
} from 'react-icons/fi';
import { AdminShell } from '@/components/admin';
import { DashboardMap } from '@/components/admin/DashboardMap';
import { useRouter } from 'next/navigation';

interface DashboardData {
  kpis: {
    todayRevenue: number;
    revenueChangePercent: number;
    activeJobs: number;
    newOrders: number;
    avgEta: string;
    firstResponseTime: string;
    openIncidents: number;
  };
  liveOps: Array<{
    id: string;
    ref: string;
    status: string;
    eta: string;
    driver: string;
    pickupAddress?: string;
    dropoffAddress?: string;
    timeSinceClaimed: number;
  }>;
  queue: {
    driverApplications: number;
    pendingRefunds: number;
    disputedPayouts: number;
  };
  systemHealth: {
    database: string;
    queue: string;
    pusher: string;
    stripeWebhooks: string;
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const toast = useToast();
  const router = useRouter();

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 15 seconds to ensure all new orders are visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchDashboardData();
      }
    }, 15000); // Reduced from 30 to 15 seconds

    return () => clearInterval(interval);
  }, [fetchDashboardData, loading]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleCreateOrder = () => {
    router.push('/book');
  };

  const handleCardClick = (type: string, value?: string) => {
    switch (type) {
      case 'revenue':
        router.push('/admin/analytics');
        break;
      case 'activeJobs':
        router.push(
          '/admin/orders?status=assigned,en-route,at-pickup,in-transit,at-drop'
        );
        break;
      case 'newOrders':
        router.push('/admin/orders?status=pending,confirmed');
        break;
      case 'driverApplications':
        router.push('/admin/drivers/applications');
        break;
      case 'pendingRefunds':
        router.push('/admin/finance/refunds');
        break;
      case 'openIncidents':
        router.push('/admin/dispatch?filter=incidents');
        break;
      case 'job':
        if (value) {
          router.push(`/admin/orders/${value}`);
        }
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en-route':
        return 'blue';
      case 'at-pickup':
        return 'yellow';
      case 'in-transit':
        return 'purple';
      case 'at-drop':
        return 'orange';
      case 'late-pickup':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getHealthColor = (status: string) => {
    return status === 'healthy' ? 'green' : 'red';
  };

  if (loading) {
    return (
      <AdminShell title="Dashboard" subtitle="Loading...">
        <Flex justify="center" align="center" height="400px">
          <Spinner size="xl" />
        </Flex>
      </AdminShell>
    );
  }

  if (!data) {
    return (
      <AdminShell title="Dashboard" subtitle="Error loading data">
        <Alert status="error">
          <AlertIcon />
          Failed to load dashboard data. Please try refreshing.
        </Alert>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Dashboard"
      subtitle={`Real-time operations overview • Last updated: ${lastUpdated?.toLocaleTimeString()}`}
      showCreateButton={true}
      onCreateClick={handleCreateOrder}
      actions={
        <HStack spacing={2}>
          <Tooltip label="Refresh dashboard data">
            <IconButton
              size="sm"
              variant="outline"
              icon={<FiRefreshCw />}
              onClick={handleRefresh}
              isLoading={refreshing}
              aria-label="Refresh"
            />
          </Tooltip>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiMapPin />}
            onClick={() => router.push('/admin/dispatch/map')}
          >
            Live Map
          </Button>
        </HStack>
      }
    >
      <Box>
        {/* KPI Row */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4} mb={8}>
          <Card
            cursor="pointer"
            onClick={() => handleCardClick('revenue')}
            _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
            transition="all 0.2s"
          >
            <CardBody>
              <Stat>
                <StatLabel>Today Revenue</StatLabel>
                <StatNumber>
                  £{(data.kpis.todayRevenue || 0).toLocaleString()}
                </StatNumber>
                <StatHelpText>
                  <HStack spacing={1}>
                    {(data.kpis.revenueChangePercent || 0) >= 0 ? (
                      <FiTrendingUp color="green" />
                    ) : (
                      <FiTrendingDown color="red" />
                    )}
                    <Text
                      color={
                        (data.kpis.revenueChangePercent || 0) >= 0
                          ? 'green.500'
                          : 'red.500'
                      }
                    >
                      {(data.kpis.revenueChangePercent || 0) >= 0 ? '+' : ''}
                      {data.kpis.revenueChangePercent || 0}% from yesterday
                    </Text>
                  </HStack>
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card
            cursor="pointer"
            onClick={() => handleCardClick('activeJobs')}
            _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
            transition="all 0.2s"
          >
            <CardBody>
              <Stat>
                <StatLabel>Active Jobs</StatLabel>
                <StatNumber>{data.kpis.activeJobs || 0}</StatNumber>
                <StatHelpText>
                  <FiTruck style={{ display: 'inline', marginRight: '4px' }} />
                  In progress
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card
            cursor="pointer"
            onClick={() => handleCardClick('newOrders')}
            _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
            transition="all 0.2s"
            bg={(data.kpis.newOrders || 0) > 0 ? 'orange.50' : 'white'}
            borderColor={
              (data.kpis.newOrders || 0) > 0 ? 'orange.200' : 'gray.200'
            }
          >
            <CardBody>
              <Stat>
                <StatLabel>New Orders</StatLabel>
                <StatNumber
                  color={
                    (data.kpis.newOrders || 0) > 0 ? 'orange.600' : 'inherit'
                  }
                >
                  {data.kpis.newOrders || 0}
                </StatNumber>
                <StatHelpText>
                  <FiPlus style={{ display: 'inline', marginRight: '4px' }} />
                  Pending assignment
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Avg ETA</StatLabel>
                <StatNumber>{data.kpis.avgEta || 'N/A'}</StatNumber>
                <StatHelpText>
                  <FiClock style={{ display: 'inline', marginRight: '4px' }} />
                  Current jobs
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>First Response</StatLabel>
                <StatNumber>{data.kpis.firstResponseTime || 'N/A'}</StatNumber>
                <StatHelpText>
                  <FiMessageSquare
                    style={{ display: 'inline', marginRight: '4px' }}
                  />
                  Support tickets
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card
            cursor="pointer"
            onClick={() => handleCardClick('openIncidents')}
            _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
            transition="all 0.2s"
          >
            <CardBody>
              <Stat>
                <StatLabel>Open Incidents</StatLabel>
                <StatNumber>{data.kpis.openIncidents || 0}</StatNumber>
                <StatHelpText>
                  <FiAlertTriangle
                    style={{ display: 'inline', marginRight: '4px' }}
                  />
                  Need attention
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          {/* Live Ops Panel */}
          <Card>
            <CardBody>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">Live Operations</Heading>
                <Badge colorScheme="blue">{data.liveOps.length} active</Badge>
              </Flex>
              <VStack spacing={3} align="stretch">
                {data.liveOps.length === 0 ? (
                  <Text color="gray.500" textAlign="center" py={4}>
                    No active jobs at the moment
                  </Text>
                ) : (
                  data.liveOps.map(job => (
                    <Card
                      key={job.id}
                      size="sm"
                      cursor="pointer"
                      onClick={() => handleCardClick('job', job.id)}
                      _hover={{ shadow: 'md' }}
                      transition="all 0.2s"
                    >
                      <CardBody p={3}>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1} flex={1}>
                            <HStack>
                              <Text fontWeight="bold">{job.ref}</Text>
                              <IconButton
                                size="xs"
                                variant="ghost"
                                icon={<FiExternalLink />}
                                aria-label="View job details"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleCardClick('job', job.id);
                                }}
                              />
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              {job.driver}
                            </Text>
                            <Text fontSize="xs" color="gray.500" noOfLines={1}>
                              {job.pickupAddress} → {job.dropoffAddress}
                            </Text>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <Badge colorScheme={getStatusColor(job.status)}>
                              {job.status.replace('-', ' ')}
                            </Badge>
                            <Text fontSize="sm" color="gray.600">
                              {job.eta}
                            </Text>
                            {job.timeSinceClaimed > 0 && (
                              <Text fontSize="xs" color="gray.500">
                                {job.timeSinceClaimed}m ago
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                        {/* SLA Progress Bar */}
                        {job.timeSinceClaimed > 0 && (
                          <Progress
                            value={Math.min(
                              (job.timeSinceClaimed / 60) * 100,
                              100
                            )}
                            size="xs"
                            mt={2}
                            colorScheme={
                              job.timeSinceClaimed > 45 ? 'red' : 'blue'
                            }
                          />
                        )}
                      </CardBody>
                    </Card>
                  ))
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Queue & Health */}
          <VStack spacing={6}>
            {/* Queue */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>
                  Queue
                </Heading>
                <VStack spacing={3} align="stretch">
                  <Card
                    size="sm"
                    cursor="pointer"
                    onClick={() => handleCardClick('driverApplications')}
                    _hover={{ shadow: 'md' }}
                    transition="all 0.2s"
                  >
                    <CardBody p={3}>
                      <HStack justify="space-between">
                        <Text>Driver Applications</Text>
                        <Badge colorScheme="blue">
                          {data.queue.driverApplications}
                        </Badge>
                      </HStack>
                    </CardBody>
                  </Card>

                  <Card
                    size="sm"
                    cursor="pointer"
                    onClick={() => handleCardClick('pendingRefunds')}
                    _hover={{ shadow: 'md' }}
                    transition="all 0.2s"
                  >
                    <CardBody p={3}>
                      <HStack justify="space-between">
                        <Text>Pending Refunds</Text>
                        <Badge colorScheme="yellow">
                          {data.queue.pendingRefunds}
                        </Badge>
                      </HStack>
                    </CardBody>
                  </Card>

                  <Card
                    size="sm"
                    cursor="pointer"
                    onClick={() => router.push('/admin/finance/payouts')}
                    _hover={{ shadow: 'md' }}
                    transition="all 0.2s"
                  >
                    <CardBody p={3}>
                      <HStack justify="space-between">
                        <Text>Disputed Payouts</Text>
                        <Badge colorScheme="red">
                          {data.queue.disputedPayouts}
                        </Badge>
                      </HStack>
                    </CardBody>
                  </Card>
                </VStack>
              </CardBody>
            </Card>

            {/* System Health */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>
                  System Health
                </Heading>
                <VStack spacing={3} align="stretch">
                  {Object.entries(data.systemHealth).map(
                    ([service, status]) => (
                      <HStack key={service} justify="space-between">
                        <Text textTransform="capitalize">
                          {service.replace(/([A-Z])/g, ' $1')}
                        </Text>
                        <Badge colorScheme={getHealthColor(status)}>
                          {status}
                        </Badge>
                      </HStack>
                    )
                  )}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Grid>

        {/* Map Snapshot */}
        <Card mt={6}>
          <CardBody>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Active Crews & Order Heat Map</Heading>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<FiMapPin />}
                onClick={() => router.push('/admin/dispatch/map')}
              >
                View Full Map
              </Button>
            </Flex>
            <DashboardMap
              activeJobs={data.liveOps}
              height="300px"
              showControls={true}
            />
          </CardBody>
        </Card>
      </Box>
    </AdminShell>
  );
}
