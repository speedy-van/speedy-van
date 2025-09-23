'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Progress,
} from '@chakra-ui/react';
import {
  FiTruck,
  FiDollarSign,
  FiUsers,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
} from 'react-icons/fi';

interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
  revenueChange: number;
  activeDrivers: number;
  totalCustomers: number;
  avgResponseTime: string;
  systemHealth: 'healthy' | 'warning' | 'error';
}

interface AdminDashboardProps {
  data?: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ data }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    }
    try {
      const response = await fetch('/api/admin/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
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
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return FiCheckCircle;
      case 'warning':
        return FiAlertTriangle;
      case 'error':
        return FiAlertTriangle;
      default:
        return FiAlertTriangle;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Alert status="error">
        <AlertIcon />
        Failed to load dashboard data. Please try refreshing.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <HStack justify="space-between" mb={6}>
        <VStack align="start" spacing={1}>
          <Heading size="lg">Admin Dashboard</Heading>
          <Text color="gray.600">Overview of system performance and operations</Text>
        </VStack>
        <Button
          leftIcon={<FiRefreshCw />}
          onClick={() => fetchDashboardStats(true)}
          isLoading={refreshing}
          size="sm"
        >
          Refresh
        </Button>
      </HStack>

      {/* System Health Alert */}
      {stats?.systemHealth && stats.systemHealth !== 'healthy' && (
        <Alert status={stats.systemHealth === 'error' ? 'error' : 'warning'} mb={6}>
          <AlertIcon />
          <Box>
            <Text fontWeight="medium">
              System Health: {(stats.systemHealth || 'unknown').toUpperCase()}
            </Text>
            <Text fontSize="sm">
              {stats.systemHealth === 'error' 
                ? 'Critical issues detected. Immediate attention required.'
                : 'Some services may be experiencing issues.'
              }
            </Text>
          </Box>
        </Alert>
      )}

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Orders</StatLabel>
              <StatNumber>{(stats?.totalOrders || 0).toLocaleString()}</StatNumber>
              <StatHelpText>
                <HStack spacing={1}>
                  <FiTruck />
                  <Text>All time</Text>
                </HStack>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Active Orders</StatLabel>
              <StatNumber color="blue.500">{stats?.activeOrders || 0}</StatNumber>
              <StatHelpText>
                <HStack spacing={1}>
                  <FiClock />
                  <Text>In progress</Text>
                </HStack>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Revenue</StatLabel>
              <StatNumber>£{(stats?.totalRevenue || 0).toLocaleString()}</StatNumber>
              <StatHelpText>
                <HStack spacing={1}>
                  {(stats?.revenueChange || 0) >= 0 ? (
                    <FiTrendingUp color="green" />
                  ) : (
                    <FiTrendingDown color="red" />
                  )}
                  <Text color={(stats?.revenueChange || 0) >= 0 ? 'green.500' : 'red.500'}>
                    {(stats?.revenueChange || 0) >= 0 ? '+' : ''}{stats?.revenueChange || 0}%
                  </Text>
                </HStack>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Active Drivers</StatLabel>
              <StatNumber>{stats?.activeDrivers || 0}</StatNumber>
              <StatHelpText>
                <HStack spacing={1}>
                  <FiUsers />
                  <Text>Online now</Text>
                </HStack>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Additional Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Completed Orders</StatLabel>
              <StatNumber color="green.500">{stats?.completedOrders || 0}</StatNumber>
              <StatHelpText>
                <HStack spacing={1}>
                  <FiCheckCircle />
                  <Text>Successfully delivered</Text>
                </HStack>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Customers</StatLabel>
              <StatNumber>{(stats?.totalCustomers || 0).toLocaleString()}</StatNumber>
              <StatHelpText>
                <HStack spacing={1}>
                  <FiUsers />
                  <Text>Registered users</Text>
                </HStack>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Avg Response Time</StatLabel>
              <StatNumber>{stats?.avgResponseTime || 'N/A'}</StatNumber>
              <StatHelpText>
                <HStack spacing={1}>
                  <FiClock />
                  <Text>Support tickets</Text>
                </HStack>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* System Health Status */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md">System Health</Heading>
            <HStack spacing={2}>
              <Box as={getHealthIcon(stats?.systemHealth || 'unknown')} />
              <Badge colorScheme={getHealthColor(stats?.systemHealth || 'unknown')}>
                {(stats?.systemHealth || 'unknown').toUpperCase()}
              </Badge>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text>Database</Text>
              <Badge colorScheme="green">Healthy</Badge>
            </HStack>
            <HStack justify="space-between">
              <Text>API Services</Text>
              <Badge colorScheme="green">Healthy</Badge>
            </HStack>
            <HStack justify="space-between">
              <Text>Payment Processing</Text>
              <Badge colorScheme="green">Healthy</Badge>
            </HStack>
            <HStack justify="space-between">
              <Text>Real-time Tracking</Text>
              <Badge colorScheme="green">Healthy</Badge>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
