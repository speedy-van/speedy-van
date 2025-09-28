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
  CardHeader,
  SimpleGrid,
  Badge,
  Button,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  Flex,
  IconButton,
  Tooltip,
  useColorModeValue,
  TableContainer,
} from '@chakra-ui/react';
import {
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi';
import { format, startOfWeek, startOfMonth, endOfWeek, endOfMonth } from 'date-fns';

interface DriverEarning {
  id: string;
  assignmentId: string;
  bookingReference: string;
  customerName: string;
  baseAmount: string;
  surgeAmount: string;
  tipAmount: string;
  // feeAmount removed from driver view for privacy
  netAmount: string;
  currency: string;
  calculatedAt: string;
  paidOut: boolean;
  payoutId?: string;
}

interface EarningsSummary {
  totalEarnings: string;
  totalJobs: number;
  totalTips: string;
  // totalFees removed from driver view for privacy
  paidOutEarnings: string;
  pendingEarnings: string;
  averageEarningsPerJob: string;
}

interface EarningsData {
  period: string;
  dateRange: {
    start: string;
    end: string;
  } | null;
  summary: EarningsSummary;
  earnings: DriverEarning[];
}

export default function DriverEarningsPage() {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' },
  ];

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        period: selectedPeriod,
      });
      
      const response = await fetch(`/api/driver/earnings?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch earnings data');
      }
      
      const data = await response.json();
      setEarningsData(data.data);
    } catch (err) {
      console.error('Driver Earnings Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: 'Error Loading Earnings',
        description: 'Failed to load your earnings data. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [selectedPeriod]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = format(new Date(start), 'MMM dd, yyyy');
    const endDate = format(new Date(end), 'MMM dd, yyyy');
    return `${startDate} - ${endDate}`;
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: 'Export',
      description: 'Export functionality coming soon',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={{ base: 4, md: 8 }}>
        <VStack spacing={6} align="center" py={20}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading your earnings...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={{ base: 4, md: 8 }}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Error loading earnings</Text>
            <Text>{error}</Text>
          </Box>
        </Alert>
      </Container>
    );
  }

  if (!earningsData) {
    return (
      <Container maxW="container.xl" py={{ base: 4, md: 8 }}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Text>No earnings data available</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={{ base: 4, md: 8 }}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Heading size={{ base: "md", md: "lg" }} mb={2}>My Earnings</Heading>
            {earningsData.dateRange && (
              <Text color="gray.600" fontSize="sm">
                {formatDateRange(earningsData.dateRange.start, earningsData.dateRange.end)}
              </Text>
            )}
          </Box>
          <HStack spacing={4} wrap="wrap">
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              width={{ base: "full", sm: "150px" }}
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </Select>
            <IconButton
              aria-label="Refresh"
              icon={<FiRefreshCw />}
              onClick={fetchEarnings}
              colorScheme="blue"
              variant="outline"
              size="sm"
            />
            <Button
              leftIcon={<FiDownload />}
              onClick={handleExport}
              colorScheme="blue"
              variant="outline"
              size="sm"
            >
              Export
            </Button>
          </HStack>
        </Flex>

        {/* Summary Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Total Earnings</StatLabel>
                <StatNumber color="green.500" fontSize={{ base: "lg", md: "xl" }}>
                  £{earningsData.summary.totalEarnings}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {earningsData.summary.totalJobs} jobs
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Pending Payout</StatLabel>
                <StatNumber color="orange.500" fontSize={{ base: "lg", md: "xl" }}>
                  £{earningsData.summary.pendingEarnings}
                </StatNumber>
                <StatHelpText>
                  <FiClock style={{ display: 'inline', marginRight: '4px' }} />
                  Awaiting payout
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Tips Received</StatLabel>
                <StatNumber color="purple.500" fontSize={{ base: "lg", md: "xl" }}>
                  £{earningsData.summary.totalTips}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Customer tips
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Avg per Job</StatLabel>
                <StatNumber color="blue.500" fontSize={{ base: "lg", md: "xl" }}>
                  £{earningsData.summary.averageEarningsPerJob}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Per assignment
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Earnings History */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Earnings History</Heading>
          </CardHeader>
          <CardBody>
            {earningsData.earnings.length === 0 ? (
              <VStack spacing={4} py={8}>
                <FiDollarSign size={48} color="gray" />
                <Text color="gray.500">No earnings found for this period</Text>
                <Text fontSize="sm" color="gray.400">
                  Complete some jobs to see your earnings here
                </Text>
              </VStack>
            ) : (
              <TableContainer>
                <Table variant="simple" size={{ base: "sm", md: "md" }}>
                  <Thead>
                    <Tr>
                      <Th>Job Reference</Th>
                      <Th>Customer</Th>
                      <Th isNumeric>Base</Th>
                      <Th isNumeric>Surge</Th>
                      <Th isNumeric>Tips</Th>
                      {/* Fees column removed from driver view for privacy */}
                      <Th isNumeric>Net Amount</Th>
                      <Th>Status</Th>
                      <Th>Date</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {earningsData.earnings.map((earning) => (
                      <Tr key={earning.id}>
                        <Td>
                          <Text fontFamily="mono" fontSize="sm">
                            {earning.bookingReference}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">{earning.customerName}</Text>
                        </Td>
                        <Td isNumeric>
                          <Text fontSize="sm">£{earning.baseAmount}</Text>
                        </Td>
                        <Td isNumeric>
                          <Text fontSize="sm">£{earning.surgeAmount}</Text>
                        </Td>
                        <Td isNumeric>
                          <Text fontSize="sm" color="purple.500">
                            £{earning.tipAmount}
                          </Text>
                        </Td>
                        {/* Fees column removed from driver view for privacy */}
                        <Td isNumeric>
                          <Text fontWeight="bold" color="green.500">
                            £{earning.netAmount}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            {earning.paidOut ? <FiCheckCircle size={12} /> : <FiClock size={12} />}
                            <Badge
                              colorScheme={earning.paidOut ? 'green' : 'orange'}
                              variant="subtle"
                            >
                              {earning.paidOut ? 'Paid' : 'Pending'}
                            </Badge>
                          </HStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.500">
                            {formatDate(earning.calculatedAt)}
                          </Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>

        {/* Payout Information */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Payout Information</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="medium">Next Payout Date:</Text>
                <Text>Every Friday</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="medium">Payout Method:</Text>
                <Text>Bank Transfer</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="medium">Minimum Payout:</Text>
                <Text>£10.00</Text>
              </HStack>
              <Divider />
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontSize="sm">
                    Payouts are processed every Friday for earnings from the previous week. 
                    You'll receive an email notification when your payout is processed.
                  </Text>
                </Box>
              </Alert>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}
