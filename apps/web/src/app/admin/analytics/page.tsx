'use client';
import { useEffect, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Box, Heading, Text, SimpleGrid, Card, CardBody, CardHeader, Button, Tabs, TabList, TabPanels, Tab, TabPanel, Badge, Flex, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, useColorModeValue } from "@chakra-ui/react";
import { Calendar, TrendingUp, Users, Package, DollarSign, Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface AnalyticsData {
  kpis: {
    totalRevenue30d: number;
    totalRevenue7d: number;
    totalRevenue24h: number;
    aov30d: number;
    aov7d: number;
    conversionRate: number;
    onTimePickup: number;
    onTimeDelivery: number;
    avgResponseTime: number;
    openIncidents: number;
    activeDrivers: number;
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    byStatus: Record<string, number>;
  };
  series: Array<{
    day: string;
    revenue: number;
    Booking: number;
    completed: number;
    cancelled: number;
  }>;
  driverMetrics: Array<{
    driverId: string;
    driverName: string;
    completedJobs: number;
    avgRating: number;
    earnings: number;
    onTimeRate: number;
  }>;
  cancellationReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  serviceAreas: Array<{
    area: string;
    Booking: number;
    revenue: number;
    avgRating: number;
  }>;
  realTimeMetrics: {
    jobsInProgress: number;
    latePickups: number;
    lateDeliveries: number;
    pendingAssignments: number;
  };
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading || !data) {
    return (
      <Box p={6}>
        <Box>
          <Box h="32px" bg="gray.200" rounded="md" w="1/4" mb={6}></Box>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
            {[...Array(8)].map((_, i) => (
              <Box key={i} h="96px" bg="gray.200" rounded="md"></Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    );
  }

  const { kpis, series, driverMetrics, cancellationReasons, serviceAreas, realTimeMetrics } = data;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box p={6} display="flex" flexDirection="column" gap={6}>
      {/* Header */}
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="lg">Analytics Dashboard</Heading>
          <Text color="gray.600">Real-time business insights and performance metrics</Text>
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
              <StatLabel>Total Revenue</StatLabel>
              <StatNumber>£{kpis.totalRevenue30d.toFixed(2)}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {((kpis.totalRevenue7d / kpis.totalRevenue30d) * 100 - 100).toFixed(1)}% from last week
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Average Order Value</StatLabel>
              <StatNumber>£{kpis.aov30d.toFixed(2)}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {((kpis.aov7d / kpis.aov30d) * 100 - 100).toFixed(1)}% from last week
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Active Jobs</StatLabel>
              <StatNumber>{realTimeMetrics.jobsInProgress}</StatNumber>
              <StatHelpText>
                {realTimeMetrics.pendingAssignments} pending assignment
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>On-Time Performance</StatLabel>
              <StatNumber>{kpis.onTimePickup}%</StatNumber>
              <StatHelpText>
                Pickup: {kpis.onTimePickup}% | Delivery: {kpis.onTimeDelivery}%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Active Drivers</StatLabel>
              <StatNumber>{kpis.activeDrivers}</StatNumber>
              <StatHelpText>
                {realTimeMetrics.latePickups} late pickups, {realTimeMetrics.lateDeliveries} late deliveries
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Conversion Rate</StatLabel>
              <StatNumber>{kpis.conversionRate.toFixed(1)}%</StatNumber>
              <StatHelpText>
                {kpis.totalBookings} total bookings
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Open Incidents</StatLabel>
              <StatNumber>{kpis.openIncidents}</StatNumber>
              <StatHelpText>
                Avg response time: {kpis.avgResponseTime}min
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Completion Rate</StatLabel>
              <StatNumber>
                {((kpis.completedBookings / kpis.totalBookings) * 100).toFixed(1)}%
              </StatNumber>
              <StatHelpText>
                {kpis.completedBookings} completed, {kpis.cancelledBookings} cancelled
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
                <Box width="100%" height="400px">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={series}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`£${value}`, 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Booking Activity</Heading>
              </CardHeader>
              <CardBody>
                <Box width="100%" height="400px">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={series}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="bookings" fill="#8884d8" />
                      <Bar dataKey="completed" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Driver Performance</Heading>
              </CardHeader>
              <CardBody>
                <Box display="flex" flexDirection="column" gap={4}>
                  {driverMetrics.slice(0, 10).map((driver) => (
                    <Flex key={driver.driverId} justify="space-between" align="center" p={4} border="1px" borderColor={borderColor} rounded="lg">
                      <Box>
                        <Text fontWeight="bold">{driver.driverName}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {driver.completedJobs} jobs • {driver.avgRating.toFixed(1)}★ rating
                        </Text>
                      </Box>
                      <Box textAlign="right">
                        <Text fontWeight="bold">£{driver.earnings.toFixed(2)}</Text>
                        <Text fontSize="sm" color="gray.600">{driver.onTimeRate}% on-time</Text>
                      </Box>
                    </Flex>
                  ))}
                </Box>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Cancellation Reasons</Heading>
              </CardHeader>
              <CardBody>
                <Flex gap={6}>
                  <Box flex="1" height="300px">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={cancellationReasons}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {cancellationReasons.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box flex="1">
                    <Box display="flex" flexDirection="column" gap={2}>
                      {cancellationReasons.map((reason, index) => (
                        <Flex key={reason.reason} justify="space-between" align="center" p={2} border="1px" borderColor={borderColor} rounded="md">
                          <Text fontSize="sm">{reason.reason}</Text>
                          <Badge colorScheme="blue">{reason.count} ({reason.percentage.toFixed(1)}%)</Badge>
                        </Flex>
                      ))}
                    </Box>
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Service Area Performance</Heading>
              </CardHeader>
              <CardBody>
                <Box display="flex" flexDirection="column" gap={4}>
                  {serviceAreas.map((area) => (
                    <Flex key={area.area} justify="space-between" align="center" p={4} border="1px" borderColor={borderColor} rounded="lg">
                      <Box>
                        <Text fontWeight="bold">{area.area}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {area.Booking} bookings • {area.avgRating.toFixed(1)}★ rating
                        </Text>
                      </Box>
                      <Box textAlign="right">
                        <Text fontWeight="bold">£{area.revenue.toFixed(2)}</Text>
                        <Text fontSize="sm" color="gray.600">
                          £{(area.revenue / area.Booking).toFixed(2)} avg per booking
                        </Text>
                      </Box>
                    </Flex>
                  ))}
                </Box>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}


