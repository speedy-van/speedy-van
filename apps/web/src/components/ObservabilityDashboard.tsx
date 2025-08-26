'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  VStack,
  HStack,
  Text,
  Badge,
  Progress,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { ChartContainer } from './ChartContainer';

interface MetricData {
  name: string;
  value: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  threshold?: number;
  status: 'good' | 'warning' | 'critical';
}

interface PerformanceData {
  timestamp: string;
  portalLoadTime: number;
  timeToFirstContent: number;
  apiErrorRate: number;
  signInSuccessRate: number;
}

export function ObservabilityDashboard() {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
    fetchPerformanceData();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/telemetry/performance?aggregate=true');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        setError('Failed to fetch metrics');
      }
    } catch (err) {
      setError('Error fetching metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/telemetry/performance?timeRange=24h');
      if (response.ok) {
        const data = await response.json();
        setPerformanceData(data);
      }
    } catch (err) {
      console.error('Error fetching performance data:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'green';
      case 'warning': return 'yellow';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  const getThresholdAlert = (metric: MetricData) => {
    if (!metric.threshold) return null;
    
    if (metric.value > metric.threshold) {
      return (
        <Alert status="warning" size="sm" mt={2}>
          <AlertIcon />
          <Box>
            <AlertTitle>Threshold Exceeded</AlertTitle>
            <AlertDescription>
              {metric.name} ({metric.value}{metric.unit}) exceeds threshold ({metric.threshold}{metric.unit})
            </AlertDescription>
          </Box>
        </Alert>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box p={6}>
        <VStack spacing={4}>
          <Box>Loading observability dashboard...</Box>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Customer Portal Observability</Heading>
        
        {/* Key Metrics Grid */}
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
          {/* Portal Load Time */}
          <Card>
            <CardHeader>
              <Stat>
                <StatLabel>Portal Load Time</StatLabel>
                <StatNumber>
                  {metrics.find(m => m.name === 'customer_portal_load_time')?.value || 0}ms
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  12.5%
                </StatHelpText>
              </Stat>
            </CardHeader>
            <CardBody>
              <Text fontSize="sm" color="gray.600">
                Target: &lt; 1000ms
              </Text>
              {getThresholdAlert(metrics.find(m => m.name === 'customer_portal_load_time')!)}
            </CardBody>
          </Card>

          {/* Time to First Content */}
          <Card>
            <CardHeader>
              <Stat>
                <StatLabel>Time to First Content</StatLabel>
                <StatNumber>
                  {metrics.find(m => m.name === 'time_to_first_content')?.value || 0}ms
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  5.2%
                </StatHelpText>
              </Stat>
            </CardHeader>
            <CardBody>
              <Text fontSize="sm" color="gray.600">
                Target: &lt; 1000ms
              </Text>
              {getThresholdAlert(metrics.find(m => m.name === 'time_to_first_content')!)}
            </CardBody>
          </Card>

          {/* Sign-in Success Rate */}
          <Card>
            <CardHeader>
              <Stat>
                <StatLabel>Sign-in Success Rate</StatLabel>
                <StatNumber>
                  {metrics.find(m => m.name === 'auth_sign_in_success_rate')?.value || 0}%
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  2.1%
                </StatHelpText>
              </Stat>
            </CardHeader>
            <CardBody>
              <Text fontSize="sm" color="gray.600">
                Target: &gt; 95%
              </Text>
              <Progress 
                value={metrics.find(m => m.name === 'auth_sign_in_success_rate')?.value || 0} 
                colorScheme="green" 
                mt={2}
              />
            </CardBody>
          </Card>

          {/* API Error Rate */}
          <Card>
            <CardHeader>
              <Stat>
                <StatLabel>API Error Rate</StatLabel>
                <StatNumber>
                  {metrics.find(m => m.name === 'api_error_rate')?.value || 0}%
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  8.3%
                </StatHelpText>
              </Stat>
            </CardHeader>
            <CardBody>
              <Text fontSize="sm" color="gray.600">
                Target: &lt; 1%
              </Text>
              <Progress 
                value={metrics.find(m => m.name === 'api_error_rate')?.value || 0} 
                colorScheme="red" 
                mt={2}
              />
            </CardBody>
          </Card>
        </Grid>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <Heading size="md">Performance Trends (24h)</Heading>
          </CardHeader>
          <CardBody>
            <ChartContainer height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey="portalLoadTime" 
                  stroke="#8884d8" 
                  name="Portal Load Time (ms)"
                />
                <Line 
                  type="monotone" 
                  dataKey="timeToFirstContent" 
                  stroke="#82ca9d" 
                  name="Time to First Content (ms)"
                />
              </LineChart>
            </ChartContainer>
          </CardBody>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <Heading size="md">Recent Events</Heading>
          </CardHeader>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Event</Th>
                  <Th>User</Th>
                  <Th>Status</Th>
                  <Th>Timestamp</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>Portal Load</Td>
                  <Td>customer@example.com</Td>
                  <Td>
                    <Badge colorScheme="green">Success</Badge>
                  </Td>
                  <Td>2 minutes ago</Td>
                </Tr>
                <Tr>
                  <Td>Sign-in</Td>
                  <Td>customer@example.com</Td>
                  <Td>
                    <Badge colorScheme="green">Success</Badge>
                  </Td>
                  <Td>5 minutes ago</Td>
                </Tr>
                <Tr>
                  <Td>API Error</Td>
                  <Td>customer@example.com</Td>
                  <Td>
                    <Badge colorScheme="red">Error</Badge>
                  </Td>
                  <Td>10 minutes ago</Td>
                </Tr>
                <Tr>
                  <Td>Deep Link Redirect</Td>
                  <Td>customer@example.com</Td>
                  <Td>
                    <Badge colorScheme="green">Success</Badge>
                  </Td>
                  <Td>15 minutes ago</Td>
                </Tr>
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        {/* Alerts and Warnings */}
        <Card>
          <CardHeader>
            <Heading size="md">Alerts & Warnings</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {metrics.some(m => m.value > (m.threshold || 0)) ? (
                metrics
                  .filter(m => m.value > (m.threshold || 0))
                  .map((metric, index) => (
                    <Alert key={index} status="warning">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Performance Alert</AlertTitle>
                        <AlertDescription>
                          {metric.name} ({metric.value}{metric.unit}) exceeds threshold ({metric.threshold}{metric.unit})
                        </AlertDescription>
                      </Box>
                    </Alert>
                  ))
              ) : (
                <Alert status="success">
                  <AlertIcon />
                  <AlertTitle>All Systems Operational</AlertTitle>
                  <AlertDescription>
                    All performance metrics are within acceptable thresholds.
                  </AlertDescription>
                </Alert>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
