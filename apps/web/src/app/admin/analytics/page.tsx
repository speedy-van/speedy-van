'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  Flex,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Chart container component for consistent sizing
const ChartContainer = ({ children, height = 400, minHeight = 400 }: { children: React.ReactElement; height?: number; minHeight?: number }) => (
  <Box height={height} minHeight={minHeight} width="100%">
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </Box>
);

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading) {
    return (
      <Box p={6}>
        <Box>
          <Box h="32px" bg="bg.surface.elevated" rounded="md" w="1/4" mb={6}></Box>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
            {[...Array(8)].map((_, i) => (
              <Box key={i} h="96px" bg="bg.surface.elevated" rounded="md"></Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error" mb={6}>
          <AlertIcon />
          Failed to load analytics data: {error}
        </Alert>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p={6}>
        <Alert status="warning">
          <AlertIcon />
          No analytics data available
        </Alert>
      </Box>
    );
  }

  // Extract data with safe defaults
  const { 
    kpis = {}, 
    series = [], 
    driverMetrics = [], 
    cancellationReasons = [], 
    serviceAreas = [], 
    realTimeMetrics = {} 
  } = data;

  // Safe access to KPI values with defaults
  const safeKpis = {
    totalRevenue30d: kpis.totalRevenue30d || 0,
    totalRevenue7d: kpis.totalRevenue7d || 0,
    totalRevenue24h: kpis.totalRevenue24h || 0,
    aov30d: kpis.aov30d || 0,
    aov7d: kpis.aov7d || 0,
    conversionRate: kpis.conversionRate || 0,
    onTimePickup: kpis.onTimePickup || 0,
    onTimeDelivery: kpis.onTimeDelivery || 0,
    avgResponseTime: kpis.avgResponseTime || 0,
    openIncidents: kpis.openIncidents || 0,
    activeDrivers: kpis.activeDrivers || 0,
    totalBookings: kpis.totalBookings || 0,
    completedBookings: kpis.completedBookings || 0,
    cancelledBookings: kpis.cancelledBookings || 0,
    byStatus: kpis.byStatus || {},
  };

  const safeRealTimeMetrics = {
    jobsInProgress: realTimeMetrics.jobsInProgress || 0,
    latePickups: realTimeMetrics.latePickups || 0,
    lateDeliveries: realTimeMetrics.lateDeliveries || 0,
    pendingAssignments: realTimeMetrics.pendingAssignments || 0,
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box p={6} display="flex" flexDirection="column" gap={6}>
      {/* Header */}
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="lg">Analytics Dashboard</Heading>
          <Text color="text.secondary">Real-time business insights and performance metrics</Text>
        </Box>
        <Flex gap={2}>
          <Button
            size="sm"
            variant={timeRange === '24h' ? 'solid' : 'outline'}
            onClick={() => setTimeRange('24h')}
          >
            24h
          </Button>
          <Button
            size="sm"
            variant={timeRange === '7d' ? 'solid' : 'outline'}
            onClick={() => setTimeRange('7d')}
          >
            7d
          </Button>
          <Button
            size="sm"
            variant={timeRange === '30d' ? 'solid' : 'outline'}
            onClick={() => setTimeRange('30d')}
          >
            30d
          </Button>
        </Flex>
      </Flex>

      {/* KPI Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Total Revenue (30d)</StatLabel>
              <StatNumber>£{safeKpis.totalRevenue30d.toLocaleString()}</StatNumber>
              <StatHelpText>
                AOV: £{safeKpis.aov30d.toFixed(2)}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Active Drivers</StatLabel>
              <StatNumber>{safeKpis.activeDrivers}</StatNumber>
              <StatHelpText>
                {safeRealTimeMetrics.jobsInProgress} jobs in progress
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>On-Time Performance</StatLabel>
              <StatNumber>{safeKpis.onTimePickup}%</StatNumber>
              <StatHelpText>
                {safeRealTimeMetrics.latePickups} late pickups, {safeRealTimeMetrics.lateDeliveries} late deliveries
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Conversion Rate</StatLabel>
              <StatNumber>{safeKpis.conversionRate.toFixed(1)}%</StatNumber>
              <StatHelpText>
                {safeKpis.totalBookings} total bookings
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Open Incidents</StatLabel>
              <StatNumber>{safeKpis.openIncidents}</StatNumber>
              <StatHelpText>
                Avg response time: {safeKpis.avgResponseTime}min
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Completion Rate</StatLabel>
              <StatNumber>
                {safeKpis.totalBookings > 0 ? ((safeKpis.completedBookings / safeKpis.totalBookings) * 100).toFixed(1) : '0.0'}%
              </StatNumber>
              <StatHelpText>
                {safeKpis.completedBookings} completed, {safeKpis.cancelledBookings} cancelled
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Charts */}
      <Tabs>
        <TabList>
          <Tab>Revenue Trends</Tab>
          <Tab>Booking Activity</Tab>
          <Tab>Driver Performance</Tab>
          <Tab>Cancellation Analysis</Tab>
          <Tab>Service Areas</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Revenue Trends</Heading>
              </CardHeader>
              <CardBody>
                {series.length > 0 ? (
                  <ChartContainer height={400} minHeight={400}>
                    <AreaChart data={series}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`£${value}`, 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500">No revenue data available for the selected time range</Text>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Booking Activity</Heading>
              </CardHeader>
              <CardBody>
                {series.length > 0 ? (
                  <ChartContainer height={400} minHeight={400}>
                    <BarChart data={series}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="bookings" fill="#8884d8" />
                      <Bar dataKey="completed" fill="#82ca9d" />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500">No booking data available for the selected time range</Text>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Driver Performance</Heading>
              </CardHeader>
              <CardBody>
                {driverMetrics.length > 0 ? (
                  <ChartContainer height={400} minHeight={400}>
                    <BarChart data={driverMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="driverName" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="earnings" fill="#8884d8" />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500">No driver performance data available</Text>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Cancellation Analysis</Heading>
              </CardHeader>
              <CardBody>
                {cancellationReasons.length > 0 ? (
                  <ChartContainer height={400} minHeight={400}>
                    <PieChart>
                      <Pie
                        data={cancellationReasons}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ reason, percentage }) => `${reason}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {cancellationReasons.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500">No cancellation data available</Text>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Service Areas</Heading>
              </CardHeader>
              <CardBody>
                {serviceAreas.length > 0 ? (
                  <ChartContainer height={400} minHeight={400}>
                    <BarChart data={serviceAreas}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="area" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#8884d8" />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500">No service area data available</Text>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}


