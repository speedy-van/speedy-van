'use client';

import React, { useState, useEffect } from "react";
import { Box, Heading, HStack, VStack, Text, Badge, Card, CardBody, Button, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Grid, GridItem, Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, Divider, Select, Input, HStack as ChakraHStack, useToast, Spinner, Alert, AlertIcon } from "@chakra-ui/react";
import { FiDollarSign, FiFileText, FiRefreshCw, FiTrendingUp, FiTrendingDown, FiDownload, FiPlus, FiSearch, FiCalendar, FiFilter } from "react-icons/fi";
import { formatDistanceToNow } from 'date-fns';

interface FinanceData {
  period: string;
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    pendingInvoices: number;
    pendingInvoiceCount: number;
    totalRefunds: number;
    refundCount: number;
    pendingPayouts: number;
    payoutCount: number;
    earningsBreakdown: {
      baseAmount: number;
      surgeAmount: number;
      tipAmount: number;
      feeAmount: number;
      netAmount: number;
    };
  };
  recentActivity: {
    invoices: any[];
    refunds: any[];
    payouts: any[];
  };
}

export default function FinancePage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30d');
  const toast = useToast();

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/finance?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch finance data');
      }
      const financeData = await response.json();
      setData(financeData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast({
        title: "Error",
        description: "Failed to load finance data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [period]);

  const formatCurrency = (totalGBP: number) => {
    return `£${(totalGBP / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "green";
      case "pending": return "yellow";
      case "processed": return "blue";
      case "failed": return "red";
      case "refunded": return "orange";
      default: return "gray";
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert status="warning">
        <AlertIcon />
        No finance data available
      </Alert>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <VStack align="start" spacing={1}>
          <Heading size="lg">Finance</Heading>
          <Text color="gray.600">Financial management and reporting</Text>
        </VStack>
        <HStack spacing={3}>
          <Select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            size="sm"
            width="120px"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </Select>
          <Button leftIcon={<FiDownload />} variant="outline" size="sm">
            Export Reports
          </Button>
          <Button leftIcon={<FiPlus />} colorScheme="blue" size="sm">
            Create Invoice
          </Button>
        </HStack>
      </HStack>

      {/* Stats Row */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 6 }} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Revenue</StatLabel>
              <StatNumber>{formatCurrency(data.metrics.totalRevenue)}</StatNumber>
              <StatHelpText>
                <FiTrendingUp style={{ display: 'inline', marginRight: '4px' }} />
                {data.metrics.totalOrders} orders
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Pending Invoices</StatLabel>
              <StatNumber>{formatCurrency(data.metrics.pendingInvoices)}</StatNumber>
              <StatHelpText>
                <FiFileText style={{ display: 'inline', marginRight: '4px' }} />
                {data.metrics.pendingInvoiceCount} invoices
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Refunds</StatLabel>
              <StatNumber>{formatCurrency(data.metrics.totalRefunds)}</StatNumber>
              <StatHelpText>
                <FiRefreshCw style={{ display: 'inline', marginRight: '4px' }} />
                {data.metrics.refundCount} refunds
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Pending Payouts</StatLabel>
              <StatNumber>{formatCurrency(data.metrics.pendingPayouts)}</StatNumber>
              <StatHelpText>
                <FiDollarSign style={{ display: 'inline', marginRight: '4px' }} />
                {data.metrics.payoutCount} payouts
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Driver Earnings</StatLabel>
              <StatNumber>{formatCurrency(data.metrics.earningsBreakdown.netAmount)}</StatNumber>
              <StatHelpText>
                <FiTrendingUp style={{ display: 'inline', marginRight: '4px' }} />
                Net earnings
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Platform Margin</StatLabel>
              <StatNumber>{formatCurrency(data.metrics.totalRevenue - data.metrics.earningsBreakdown.netAmount)}</StatNumber>
              <StatHelpText>
                <FiDollarSign style={{ display: 'inline', marginRight: '4px' }} />
                Revenue - Payouts
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Tabs>
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Invoices</Tab>
          <Tab>Refunds</Tab>
          <Tab>Payouts</Tab>
          <Tab>Ledger</Tab>
        </TabList>

        <TabPanels>
          {/* Overview Tab */}
          <TabPanel>
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
              {/* Recent Invoices */}
              <Card>
                <CardBody>
                  <HStack justify="space-between" mb={4}>
                    <Heading size="md">Recent Invoices</Heading>
                    <Button size="sm" variant="outline" onClick={() => window.location.href = '/admin/finance/invoices'}>
                      View All
                    </Button>
                  </HStack>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Ref</Th>
                        <Th>Customer</Th>
                        <Th>Amount</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {data.recentActivity.invoices.map((invoice) => (
                        <Tr key={invoice.id}>
                          <Td>
                            <Text fontWeight="bold" fontSize="sm">{invoice.invoiceNumber || invoice.orderRef}</Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{invoice.customer?.user?.name || 'Unknown'}</Text>
                          </Td>
                          <Td>
                            <Text fontWeight="bold" fontSize="sm">{formatCurrency(invoice.totalGBP)}</Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(invoice.status)} size="sm">
                              {invoice.status}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>

              {/* Recent Refunds */}
              <Card>
                <CardBody>
                  <HStack justify="space-between" mb={4}>
                    <Heading size="md">Recent Refunds</Heading>
                    <Button size="sm" variant="outline" onClick={() => window.location.href = '/admin/finance/refunds'}>
                      View All
                    </Button>
                  </HStack>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Ref</Th>
                        <Th>Customer</Th>
                        <Th>Amount</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {data.recentActivity.refunds.map((refund) => (
                        <Tr key={refund.id}>
                          <Td>
                            <Text fontWeight="bold" fontSize="sm">{refund.orderRef}</Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{refund.customer?.user?.name || 'Unknown'}</Text>
                          </Td>
                          <Td>
                            <Text fontWeight="bold" fontSize="sm">{formatCurrency(refund.totalGBP)}</Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(refund.status)} size="sm">
                              {refund.status}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>

              {/* Recent Payouts */}
              <Card>
                <CardBody>
                  <HStack justify="space-between" mb={4}>
                    <Heading size="md">Recent Payouts</Heading>
                    <Button size="sm" variant="outline" onClick={() => window.location.href = '/admin/finance/payouts'}>
                      View All
                    </Button>
                  </HStack>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Driver</Th>
                        <Th>Amount</Th>
                        <Th>Status</Th>
                        <Th>Date</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {data.recentActivity.payouts.map((payout) => (
                        <Tr key={payout.id}>
                          <Td>
                            <Text fontSize="sm">{payout.driver?.user?.name || 'Unknown'}</Text>
                          </Td>
                          <Td>
                            <Text fontWeight="bold" fontSize="sm">{formatCurrency(payout.totalAmountPence)}</Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(payout.status)} size="sm">
                              {payout.status}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {payout.createdAt ? formatDistanceToNow(new Date(payout.createdAt), { addSuffix: true }) : 'N/A'}
                            </Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>

              {/* Financial Summary */}
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Financial Summary</Heading>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text>Gross Revenue</Text>
                      <Text fontWeight="bold">{formatCurrency(data.metrics.totalRevenue)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Refunds</Text>
                      <Text color="red.500">-{formatCurrency(data.metrics.totalRefunds)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Driver Payouts</Text>
                      <Text color="blue.500">-{formatCurrency(data.metrics.earningsBreakdown.netAmount)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Platform Fees</Text>
                      <Text color="gray.500">-{formatCurrency(data.metrics.totalRevenue - data.metrics.earningsBreakdown.netAmount)}</Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Net Profit</Text>
                      <Text fontWeight="bold" color="green.500">
                        {formatCurrency(data.metrics.totalRevenue - data.metrics.totalRefunds - data.metrics.earningsBreakdown.netAmount)}
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </Grid>
          </TabPanel>

          {/* Invoices Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <HStack justify="space-between" mb={4}>
                  <Heading size="md">Invoices</Heading>
                  <Button colorScheme="blue" size="sm" onClick={() => window.location.href = '/admin/finance/invoices'}>
                    Manage Invoices
                  </Button>
                </HStack>
                <Text color="gray.500">Invoice management interface with search, filtering, and PDF generation.</Text>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Refunds Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <HStack justify="space-between" mb={4}>
                  <Heading size="md">Refunds</Heading>
                  <Button colorScheme="blue" size="sm" onClick={() => window.location.href = '/admin/finance/refunds'}>
                    Manage Refunds
                  </Button>
                </HStack>
                <Text color="gray.500">Refund management with reason categories, partial/full refunds, and Stripe integration.</Text>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Payouts Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <HStack justify="space-between" mb={4}>
                  <Heading size="md">Payouts</Heading>
                  <Button colorScheme="blue" size="sm" onClick={() => window.location.href = '/admin/finance/payouts'}>
                    Manage Payouts
                  </Button>
                </HStack>
                <Text color="gray.500">Driver payout management with earnings breakdown, batch processing, and export functionality.</Text>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Ledger Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <HStack justify="space-between" mb={4}>
                  <Heading size="md">Ledger</Heading>
                  <Button colorScheme="blue" size="sm" onClick={() => window.location.href = '/admin/finance/ledger'}>
                    View Ledger
                  </Button>
                </HStack>
                <Text color="gray.500">Job-level financial breakdown with base, distance, floors, lift surcharge, items, surge, fees, discounts, tips, and tax.</Text>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
