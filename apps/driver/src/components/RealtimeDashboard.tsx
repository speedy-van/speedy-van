'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Badge,
  Button,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  IconButton,
  Tooltip,
  useColorModeValue,
  Divider,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import {
  FiWifi,
  FiWifiOff,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiTruck,
  FiUsers,
  FiActivity,
  FiZap,
} from 'react-icons/fi';
import {
  useRealtimeData,
  useOrderUpdates,
  useDriverUpdates,
  useDispatchUpdates,
  useFinanceUpdates,
  useRealtimeConnection,
  useRealtimePerformance,
} from '@/hooks/useRealtimeData';
import { ToastContainer, useToastContainer } from '@/components/Toast';
import { CHANNEL_EVENTS } from '@/lib/realtime-channels';
import { cacheUtils, performanceUtils, cacheConfigs } from '@/lib/cache';
// import { errorUtils } from '@/lib/error-handling';

// Example data types
interface OrderData {
  id: string;
  status: string;
  customerName: string;
  pickupAddress: string;
  dropoffAddress: string;
  price: number;
  driverId?: string;
  updatedAt: string;
}

interface DriverData {
  id: string;
  name: string;
  status: string;
  isOnline: boolean;
  currentLocation?: { lat: number; lng: number };
  rating: number;
  activeJobs: number;
}

interface DispatchData {
  unassignedJobs: number;
  activeDrivers: number;
  recentOffers: any[];
}

interface FinanceData {
  todayRevenue: number;
  pendingPayouts: number;
  recentPayments: any[];
  recentRefunds: any[];
}

const RealtimeDashboard: React.FC = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>('order-123');
  const [selectedDriverId, setSelectedDriverId] =
    useState<string>('driver-456');

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Toast notifications
  const { toasts, addToast, dismissToast } = useToastContainer();

  // Real-time connection status
  const connectionState = useRealtimeConnection();

  // Real-time performance metrics
  const performanceMetrics = useRealtimePerformance();

  // Real-time data hooks
  const [orderState, orderActions] = useOrderUpdates(selectedOrderId);
  const [driverState, driverActions] = useDriverUpdates(selectedDriverId);
  const [dispatchState, dispatchActions] = useDispatchUpdates();
  const [financeState, financeActions] = useFinanceUpdates();

  // Custom real-time data for demonstration
  const [customState, customActions] = useRealtimeData<OrderData>({
    namespace: 'ORDERS',
    channelId: selectedOrderId,
    event: CHANNEL_EVENTS.ORDER_STATUS_CHANGED,
    cacheConfig: cacheConfigs.fast,
    pollingInterval: 10000,
    enableOptimisticUpdates: true,
    transform: data => ({
      id: data.orderId,
      status: data.status,
      customerName: 'John Doe',
      pickupAddress: '123 Main St',
      dropoffAddress: '456 Oak Ave',
      price: 45.0,
      driverId: data.driverId,
      updatedAt: new Date().toISOString(),
    }),
    onDataUpdate: data => {
      addToast({
        type: 'success',
        title: 'Order Updated',
        message: `Order ${data.id} status changed to ${data.status}`,
        duration: 3000,
      });
    },
    onError: error => {
      addToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Failed to receive real-time updates',
        duration: 5000,
        action: {
          label: 'Retry',
          onClick: () => customActions.reconnect(),
        },
      });
    },
  });

  // Connection status indicator
  const getConnectionStatus = () => {
    switch (connectionState) {
      case 'connected':
        return { icon: FiWifi, color: 'green.500', text: 'Connected' };
      case 'connecting':
        return {
          icon: FiRefreshCw,
          color: 'yellow.500',
          text: 'Connecting...',
        };
      case 'reconnecting':
        return {
          icon: FiRefreshCw,
          color: 'orange.500',
          text: 'Reconnecting...',
        };
      case 'disconnected':
        return { icon: FiWifiOff, color: 'red.500', text: 'Disconnected' };
      case 'error':
        return { icon: FiAlertCircle, color: 'red.500', text: 'Error' };
      default:
        return { icon: FiWifiOff, color: 'gray.500', text: 'Unknown' };
    }
  };

  const connectionStatus = getConnectionStatus();

  // Performance indicators
  const getPerformanceColor = (value: number) => {
    if (value > 80) return 'green.500';
    if (value > 60) return 'yellow.500';
    return 'red.500';
  };

  // Handle optimistic update example
  const handleOptimisticUpdate = async () => {
    try {
      await customActions.optimisticUpdate({
        ...customState.data!,
        status: 'IN_PROGRESS',
        updatedAt: new Date().toISOString(),
      });

      addToast({
        type: 'success',
        title: 'Optimistic Update',
        message: 'Order status updated immediately',
        duration: 3000,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update order status',
        duration: 5000,
      });
    }
  };

  // Handle cache operations
  const handleCacheOperations = () => {
    // Clear specific cache
    cacheUtils.invalidate(
      `orders-${selectedOrderId}:${CHANNEL_EVENTS.ORDER_UPDATED}`
    );

    // Get cache stats
    const stats = cacheUtils.getStats();

    addToast({
      type: 'info',
      title: 'Cache Cleared',
      message: `Cleared cache. Current ETag count: ${stats.etagCount}`,
      duration: 3000,
    });
  };

  // Handle performance test
  const handlePerformanceTest = async () => {
    const { data, duration } = await performanceUtils.measureResponseTime(
      async () => {
        // Simulate API call
        await new Promise(resolve =>
          setTimeout(resolve, 100 + Math.random() * 200)
        );
        return { success: true };
      }
    );

    addToast({
      type: 'info',
      title: 'Performance Test',
      message: `Response time: ${duration.toFixed(2)}ms`,
      duration: 3000,
    });
  };

  return (
    <Box bg={bgColor} minH={{ base: '100dvh', md: '100vh' }} p={6}>
      {/* Toast Container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
        position="top-right"
        maxToasts={5}
      />

      {/* Header */}
      <Box mb={6}>
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Real-time Dashboard</Heading>
            <Text color="gray.600">
              Live updates with caching, error handling, and performance
              monitoring
            </Text>
          </VStack>

          <HStack spacing={4}>
            {/* Connection Status */}
            <HStack spacing={2}>
              <Box
                as={connectionStatus.icon}
                color={connectionStatus.color}
                boxSize={5}
              />
              <Text fontSize="sm" fontWeight="medium">
                {connectionStatus.text}
              </Text>
            </HStack>

            {/* Performance Metrics */}
            <HStack spacing={4}>
              <Stat size="sm">
                <StatLabel fontSize="xs">Uptime</StatLabel>
                <StatNumber fontSize="sm" color={getPerformanceColor(95)}>
                  95%
                </StatNumber>
              </Stat>
              <Stat size="sm">
                <StatLabel fontSize="xs">Latency</StatLabel>
                <StatNumber fontSize="sm" color={getPerformanceColor(85)}>
                  45ms
                </StatNumber>
              </Stat>
            </HStack>

            {/* Action Buttons */}
            <HStack spacing={2}>
              <Tooltip label="Refresh all data">
                <IconButton
                  aria-label="Refresh"
                  icon={<FiRefreshCw />}
                  size="sm"
                  onClick={() => {
                    orderActions.refresh();
                    driverActions.refresh();
                    dispatchActions.refresh();
                    financeActions.refresh();
                  }}
                />
              </Tooltip>
              <Tooltip label="Test performance">
                <IconButton
                  aria-label="Performance test"
                  icon={<FiActivity />}
                  size="sm"
                  onClick={handlePerformanceTest}
                />
              </Tooltip>
              <Tooltip label="Clear cache">
                <IconButton
                  aria-label="Clear cache"
                  icon={<FiZap />}
                  size="sm"
                  onClick={handleCacheOperations}
                />
              </Tooltip>
            </HStack>
          </HStack>
        </HStack>
      </Box>

      {/* Main Grid */}
      <Grid templateColumns="repeat(12, 1fr)" gap={6}>
        {/* Orders Panel */}
        <GridItem colSpan={{ base: 12, lg: 6 }}>
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Order Updates</Heading>
                <Badge
                  colorScheme={orderState.isOptimistic ? 'yellow' : 'green'}
                  variant="subtle"
                >
                  {orderState.isOptimistic ? 'Optimistic' : 'Live'}
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              {orderState.isLoading ? (
                <HStack justify="center" py={8}>
                  <Spinner />
                  <Text>Loading order data...</Text>
                </HStack>
              ) : orderState.isError ? (
                <Alert status="error">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription>
                      Failed to load order updates.
                      <Button
                        size="sm"
                        ml={2}
                        onClick={() => orderActions.reconnect()}
                      >
                        Retry
                      </Button>
                    </AlertDescription>
                  </Box>
                </Alert>
              ) : (
                <VStack align="start" spacing={4}>
                  <HStack justify="space-between" w="full">
                    <Text fontWeight="medium">Order #{selectedOrderId}</Text>
                    <Badge colorScheme="blue">
                      {orderState.connectionState}
                    </Badge>
                  </HStack>

                  {orderState.data && (
                    <VStack align="start" spacing={2} w="full">
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Status:</Text>
                        <Badge colorScheme="green">
                          {orderState.data.status}
                        </Badge>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Customer:</Text>
                        <Text fontSize="sm">
                          {orderState.data.customerName}
                        </Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Price:</Text>
                        <Text fontSize="sm">£{orderState.data.price}</Text>
                      </HStack>
                      {orderState.lastUpdated && (
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm">Last Updated:</Text>
                          <Text fontSize="sm" color="gray.500">
                            {new Date(
                              orderState.lastUpdated
                            ).toLocaleTimeString()}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  )}

                  <Divider />

                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      leftIcon={<FiCheckCircle />}
                      onClick={handleOptimisticUpdate}
                      isDisabled={!orderState.data}
                    >
                      Optimistic Update
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => orderActions.clearCache()}
                    >
                      Clear Cache
                    </Button>
                  </HStack>
                </VStack>
              )}
            </CardBody>
          </Card>
        </GridItem>

        {/* Drivers Panel */}
        <GridItem colSpan={{ base: 12, lg: 6 }}>
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Driver Status</Heading>
                <Badge
                  colorScheme={
                    driverState.connectionState === 'connected'
                      ? 'green'
                      : 'red'
                  }
                  variant="subtle"
                >
                  {driverState.connectionState}
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              {driverState.isLoading ? (
                <HStack justify="center" py={8}>
                  <Spinner />
                  <Text>Loading driver data...</Text>
                </HStack>
              ) : (
                <VStack align="start" spacing={4}>
                  <HStack justify="space-between" w="full">
                    <Text fontWeight="medium">Driver #{selectedDriverId}</Text>
                    <Box
                      as={driverState.data?.isOnline ? FiWifi : FiWifiOff}
                      color={
                        driverState.data?.isOnline ? 'green.500' : 'red.500'
                      }
                      boxSize={4}
                    />
                  </HStack>

                  {driverState.data && (
                    <VStack align="start" spacing={2} w="full">
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Status:</Text>
                        <Badge
                          colorScheme={
                            driverState.data.isOnline ? 'green' : 'red'
                          }
                        >
                          {driverState.data.status}
                        </Badge>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Rating:</Text>
                        <Text fontSize="sm">
                          ⭐ {driverState.data.rating}/5
                        </Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Active Jobs:</Text>
                        <Text fontSize="sm">{driverState.data.activeJobs}</Text>
                      </HStack>
                    </VStack>
                  )}

                  <Divider />

                  <HStack spacing={2}>
                    <Button size="sm" onClick={() => driverActions.refresh()}>
                      Refresh
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => driverActions.reconnect()}
                    >
                      Reconnect
                    </Button>
                  </HStack>
                </VStack>
              )}
            </CardBody>
          </Card>
        </GridItem>

        {/* Dispatch Panel */}
        <GridItem colSpan={{ base: 12, lg: 6 }}>
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Dispatch Center</Heading>
                <Badge colorScheme="blue" variant="subtle">
                  Live
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="medium">Real-time Metrics</Text>
                  <Box as={FiTruck} color="blue.500" boxSize={5} />
                </HStack>

                <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                  <Stat>
                    <StatLabel>Unassigned Jobs</StatLabel>
                    <StatNumber color="orange.500">12</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      23.36%
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Active Drivers</StatLabel>
                    <StatNumber color="green.500">8</StatNumber>
                    <StatHelpText>
                      <StatArrow type="decrease" />
                      12.5%
                    </StatHelpText>
                  </Stat>
                </Grid>

                <Divider />

                <VStack align="start" spacing={2} w="full">
                  <Text fontSize="sm" fontWeight="medium">
                    Recent Job Offers
                  </Text>
                  <List spacing={2} w="full">
                    <ListItem>
                      <HStack>
                        <ListIcon as={FiClock} color="blue.500" />
                        <Text fontSize="sm">Job #1234 - Central London</Text>
                      </HStack>
                    </ListItem>
                    <ListItem>
                      <HStack>
                        <ListIcon as={FiClock} color="blue.500" />
                        <Text fontSize="sm">Job #1235 - East London</Text>
                      </HStack>
                    </ListItem>
                    <ListItem>
                      <HStack>
                        <ListIcon as={FiClock} color="blue.500" />
                        <Text fontSize="sm">Job #1236 - West London</Text>
                      </HStack>
                    </ListItem>
                  </List>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        {/* Finance Panel */}
        <GridItem colSpan={{ base: 12, lg: 6 }}>
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Finance Overview</Heading>
                <Badge colorScheme="green" variant="subtle">
                  Live
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="medium">Today's Performance</Text>
                  <Box as={FiDollarSign} color="green.500" boxSize={5} />
                </HStack>

                <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                  <Stat>
                    <StatLabel>Revenue</StatLabel>
                    <StatNumber color="green.500">£2,450</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      15.2%
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Pending Payouts</StatLabel>
                    <StatNumber color="orange.500">£890</StatNumber>
                    <StatHelpText>
                      <StatArrow type="decrease" />
                      8.1%
                    </StatHelpText>
                  </Stat>
                </Grid>

                <Divider />

                <VStack align="start" spacing={2} w="full">
                  <Text fontSize="sm" fontWeight="medium">
                    Recent Activity
                  </Text>
                  <List spacing={2} w="full">
                    <ListItem>
                      <HStack>
                        <ListIcon as={FiCheckCircle} color="green.500" />
                        <Text fontSize="sm">Payment received - £45.00</Text>
                      </HStack>
                    </ListItem>
                    <ListItem>
                      <HStack>
                        <ListIcon as={FiCheckCircle} color="green.500" />
                        <Text fontSize="sm">Payment received - £32.50</Text>
                      </HStack>
                    </ListItem>
                    <ListItem>
                      <HStack>
                        <ListIcon as={FiAlertCircle} color="orange.500" />
                        <Text fontSize="sm">Refund processed - £15.00</Text>
                      </HStack>
                    </ListItem>
                  </List>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        {/* Performance Panel */}
        <GridItem colSpan={12}>
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">System Performance</Heading>
                <Badge colorScheme="purple" variant="subtle">
                  Monitoring
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <Grid
                templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
                gap={6}
              >
                <Stat>
                  <StatLabel>Cache Hit Rate</StatLabel>
                  <StatNumber color="green.500">95.2%</StatNumber>
                  <Progress value={95.2} colorScheme="green" size="sm" mt={2} />
                </Stat>

                <Stat>
                  <StatLabel>Average Response Time</StatLabel>
                  <StatNumber color="blue.500">45ms</StatNumber>
                  <Progress value={85} colorScheme="blue" size="sm" mt={2} />
                </Stat>

                <Stat>
                  <StatLabel>Connection Uptime</StatLabel>
                  <StatNumber color="green.500">99.8%</StatNumber>
                  <Progress value={99.8} colorScheme="green" size="sm" mt={2} />
                </Stat>

                <Stat>
                  <StatLabel>Error Rate</StatLabel>
                  <StatNumber color="red.500">0.2%</StatNumber>
                  <Progress value={0.2} colorScheme="red" size="sm" mt={2} />
                </Stat>
              </Grid>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default RealtimeDashboard;
