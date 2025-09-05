'use client';
import React, { useState, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  Select,
  FormControl,
  FormLabel,
  Button,
  Flex,
  Spacer,
  Alert,
  AlertIcon,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  TrendingUpIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { ErrorAnalytics, ErrorFilter } from '../../agent/types';

interface ErrorAnalyticsPanelProps {
  analytics: ErrorAnalytics | null;
  filter: ErrorFilter;
  onFilterChange: (filter: Partial<ErrorFilter>) => void;
}

export default function ErrorAnalyticsPanel({
  analytics,
  filter,
  onFilterChange,
}: ErrorAnalyticsPanelProps) {
  const [timeRange, setTimeRange] = useState('30d');

  if (!analytics) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading analytics...</Text>
      </Box>
    );
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatTime = (hours: number) => `${hours.toFixed(1)}h`;
  const formatNumber = (num: number) => num.toLocaleString();

  const getTrendIcon = (current: number, previous: number) => {
    if (current < previous) return 'decrease';
    if (current > previous) return 'increase';
    return 'decrease';
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current < previous) return 'green.500';
    if (current > previous) return 'red.500';
    return 'gray.500';
  };

  return (
    <Box>
      {/* Header */}
      <Flex mb={6} align="center" justify="space-between">
        <HStack>
          <ChartBarIcon className="h-6 w-6 text-blue-500" />
          <Text fontSize="xl" fontWeight="bold">
            Error Analytics
          </Text>
        </HStack>

        <HStack spacing={4}>
          <FormControl maxW="200px">
            <FormLabel>Time Range</FormLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </Select>
          </FormControl>

          <Button
            leftIcon={<CalendarIcon className="h-4 w-4" />}
            variant="outline"
            onClick={() => {
              const end = new Date();
              const start = new Date();
              start.setDate(start.getDate() - 30);
              onFilterChange({ dateRange: { start, end } });
            }}
          >
            Apply Filter
          </Button>
        </HStack>
      </Flex>

      {/* Key Metrics */}
      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={8}>
        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Errors</StatLabel>
                <StatNumber>{formatNumber(analytics.totalErrors)}</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  {formatNumber(analytics.errorRate)} per hour
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Avg Resolution Time</StatLabel>
                <StatNumber>{formatTime(analytics.resolutionTime.average)}</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  Median: {formatTime(analytics.resolutionTime.median)}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>95th Percentile</StatLabel>
                <StatNumber>{formatTime(analytics.resolutionTime.p95)}</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  Resolution time
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Error Rate Trend</StatLabel>
                <StatNumber color={getTrendColor(analytics.errorRate, analytics.errorRate * 0.9)}>
                  {formatNumber(analytics.errorRate)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={getTrendIcon(analytics.errorRate, analytics.errorRate * 0.9)} />
                  per hour
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Category Distribution */}
      <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={8}>
        <GridItem>
          <Card>
            <CardHeader>
              <Heading size="md">Error Categories</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                {analytics.categoryDistribution.map((category) => (
                  <Box key={category.category}>
                    <Flex justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="medium">
                        {category.category}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {category.count} ({formatPercentage(category.percentage)})
                      </Text>
                    </Flex>
                    <Progress
                      value={category.percentage}
                      colorScheme="blue"
                      size="sm"
                      borderRadius="full"
                    />
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardHeader>
              <Heading size="md">Error Sources</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                {analytics.sourceDistribution.map((source) => (
                  <Box key={source.source}>
                    <Flex justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="medium">
                        {source.source}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {source.count} ({formatPercentage(source.percentage)})
                      </Text>
                    </Flex>
                    <Progress
                      value={source.percentage}
                      colorScheme="green"
                      size="sm"
                      borderRadius="full"
                    />
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Top Issues */}
      <Card mb={8}>
        <CardHeader>
          <Heading size="md">Top Issues</Heading>
        </CardHeader>
        <CardBody>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Error</Th>
                <Th>Source</Th>
                <Th>Frequency</Th>
                <Th>Last Occurrence</Th>
                <Th>Priority</Th>
              </Tr>
            </Thead>
            <Tbody>
              {analytics.topIssues.map((issue) => (
                <Tr key={issue.error.id}>
                  <Td maxW="300px">
                    <Text fontSize="sm" noOfLines={2}>
                      {issue.error.message}
                    </Text>
                  </Td>
                  <Td>
                    <Badge variant="outline">{issue.error.source}</Badge>
                  </Td>
                  <Td>
                    <Text fontWeight="medium">{issue.frequency}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm">
                      {new Date(issue.lastOccurrence).toLocaleDateString()}
                    </Text>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={
                        issue.error.metadata.priority === 'urgent' ? 'red' :
                        issue.error.metadata.priority === 'high' ? 'orange' :
                        issue.error.metadata.priority === 'medium' ? 'yellow' : 'green'
                      }
                      variant="subtle"
                    >
                      {issue.error.metadata.priority}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <Heading size="md">Trend Analysis</Heading>
        </CardHeader>
        <CardBody>
          {analytics.trendData.length > 0 ? (
            <VStack spacing={4} align="stretch">
              {analytics.trendData.map((trend, index) => (
                <Box key={index}>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="medium">
                      {trend.timestamp}
                    </Text>
                    <HStack spacing={4}>
                      <Text fontSize="sm" color="red.500">
                        {trend.errorCount} errors
                      </Text>
                      <Text fontSize="sm" color="green.500">
                        {trend.resolutionCount} resolved
                      </Text>
                    </HStack>
                  </Flex>
                  <Progress
                    value={(trend.errorCount / Math.max(...analytics.trendData.map(t => t.errorCount))) * 100}
                    colorScheme="red"
                    size="sm"
                    borderRadius="full"
                  />
                </Box>
              ))}
            </VStack>
          ) : (
            <Alert status="info">
              <AlertIcon />
              <Text>No trend data available for the selected time period.</Text>
            </Alert>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}
