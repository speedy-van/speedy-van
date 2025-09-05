'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Tooltip,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import {
  FiDownload,
  FiFileText,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiExternalLink,
} from 'react-icons/fi';
import NextLink from 'next/link';

interface Invoice {
  id: string;
  orderRef: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string | null;
  stripePaymentIntentId: string | null;
  pickupAddress: string | null;
  dropoffAddress: string | null;
  contactName: string | null;
  contactEmail: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exportLoading, setExportLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount / 100);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'unpaid':
        return 'red';
      case 'requires_action':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        page: currentPage.toString(),
        limit: '20',
      });

      const response = await fetch(`/api/portal/invoices?${params}`);
      if (!response.ok) throw new Error('Failed to fetch invoices');

      const data = await response.json();
      setInvoices(data.invoices);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await fetch(`/api/portal/invoices/${invoiceId}/pdf`);
      if (!response.ok) throw new Error('Failed to download invoice');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Invoice downloaded',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: 'Download failed',
        description:
          err instanceof Error ? err.message : 'Failed to download invoice',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const exportCSV = async () => {
    try {
      setExportLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
      });

      const response = await fetch(`/api/portal/invoices/export?${params}`);
      if (!response.ok) throw new Error('Failed to export invoices');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'CSV exported',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: 'Export failed',
        description:
          err instanceof Error ? err.message : 'Failed to export invoices',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setExportLoading(false);
    }
  };

  const getStripeReceiptUrl = async (paymentIntentId: string | null) => {
    if (!paymentIntentId) return '';
    // Generate a simple receipt URL - in production this would use Stripe's receipt API
    return `https://dashboard.stripe.com/payments/${paymentIntentId}`;
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, currentPage]);

  const filteredInvoices = invoices.filter(
    invoice =>
      invoice.orderRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && invoices.length === 0) {
    return (
      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading size="lg" mb={2}>
            Invoices & Payments
          </Heading>
          <Text color="gray.600">
            View and download your invoices and payment history
          </Text>
        </Box>
        <Flex justify="center" py={12}>
          <Spinner size="xl" />
        </Flex>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Heading size="lg" mb={2}>
          Invoices & Payments
        </Heading>
        <Text color="gray.600">
          View and download your invoices and payment history
        </Text>
      </Box>

      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {invoices.length === 0 && !loading ? (
        <Box textAlign="center" py={12}>
          <Text fontSize="lg" mb={4}>
            No invoices yet
          </Text>
          <Text color="gray.600" mb={6}>
            You'll see your invoices here after making your first booking.
          </Text>
          <Button as={NextLink as any} href="/book" colorScheme="blue">
            Book a Move
          </Button>
        </Box>
      ) : (
        <Box>
          {/* Filters and Actions */}
          <Flex
            justify="space-between"
            align="center"
            mb={6}
            wrap="wrap"
            gap={4}
          >
            <HStack spacing={4} wrap="wrap">
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                maxW="200px"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="requires_action">Requires Action</option>
              </Select>

              <Button
                leftIcon={<FiFilter />}
                variant="outline"
                onClick={onOpen}
              >
                Date Range
              </Button>
            </HStack>

            <HStack spacing={3}>
              <Button
                leftIcon={<FiFileText />}
                onClick={exportCSV}
                isLoading={exportLoading}
                variant="outline"
              >
                Export CSV
              </Button>
            </HStack>
          </Flex>

          {/* Invoices Table */}
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Invoice Number</Th>
                  <Th>Order Reference</Th>
                  <Th>Date</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredInvoices.map(invoice => (
                  <Tr key={invoice.id}>
                    <Td>
                      <Text fontWeight="medium">{invoice.invoiceNumber}</Text>
                    </Td>
                    <Td>
                      <Text>{invoice.orderRef}</Text>
                    </Td>
                    <Td>
                      <Text>
                        {new Date(invoice.date).toLocaleDateString('en-GB')}
                      </Text>
                    </Td>
                    <Td>
                      <Text fontWeight="medium">
                        {formatCurrency(invoice.amount)}
                      </Text>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={getPaymentStatusColor(invoice.status)}
                        variant="subtle"
                      >
                        {invoice.status.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          as={NextLink as any}
                          href={`/customer-portal/orders/${invoice.orderRef}`}
                          size="sm"
                          variant="outline"
                        >
                          View Details
                        </Button>

                        {invoice.status === 'paid' && (
                          <>
                            <Tooltip label="Download Invoice PDF">
                              <IconButton
                                aria-label="Download invoice"
                                icon={<FiDownload />}
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  downloadInvoice(
                                    invoice.id,
                                    invoice.invoiceNumber
                                  )
                                }
                              />
                            </Tooltip>

                            {invoice.stripePaymentIntentId && (
                              <Tooltip label="View Stripe Receipt">
                                <IconButton
                                  aria-label="View Stripe receipt"
                                  icon={<FiExternalLink />}
                                  size="sm"
                                  variant="ghost"
                                  onClick={async () => {
                                    const url = await getStripeReceiptUrl(
                                      invoice.stripePaymentIntentId
                                    );
                                    if (url) {
                                      window.open(url, '_blank');
                                    }
                                  }}
                                />
                              </Tooltip>
                            )}
                          </>
                        )}

                        {invoice.status === 'unpaid' && (
                          <Button
                            as={NextLink as any}
                            href={`/checkout?code=${invoice.orderRef}`}
                            size="sm"
                            colorScheme="blue"
                          >
                            Pay Now
                          </Button>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <Flex justify="center" mt={6}>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>

                <Text>
                  Page {currentPage} of {pagination.pages}
                </Text>

                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={currentPage === pagination.pages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </HStack>
            </Flex>
          )}

          <Box mt={6} p={4} bg="gray.50" borderRadius="md">
            <Text fontSize="sm" color="gray.600">
              Need a copy of your invoice? Contact our support team and we'll be
              happy to help.
            </Text>
          </Box>
        </Box>
      )}

      {/* Date Range Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Filter by Date Range</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Start Date</FormLabel>
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={e =>
                    setDateRange(prev => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>End Date</FormLabel>
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={e =>
                    setDateRange(prev => ({ ...prev, endDate: e.target.value }))
                  }
                />
              </FormControl>

              <Button
                colorScheme="blue"
                onClick={() => {
                  exportCSV();
                  onClose();
                }}
                isLoading={exportLoading}
              >
                Export with Date Filter
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
