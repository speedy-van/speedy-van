'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Select,
  HStack,
  VStack,
  Divider,
  Alert,
  AlertIcon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiDollarSign,
  FiTrendingUp,
  FiGift,
  FiSettings,
  FiPlus,
} from 'react-icons/fi';
import { formatCurrency, formatCurrencyShort } from '@/lib/currency';

interface EarningsData {
  range: string;
  fromDate: string;
  toDate: string;
  totals: {
    base: number;
    surge: number;
    tips: number;
    fees: number;
    net: number;
    jobs: number;
    pending: number;
  };
  earnings: Array<{
    id: string;
    assignmentId: string;
    bookingCode: string;
    pickupAddress: string;
    dropoffAddress: string;
    baseAmountPence: number;
    surgeAmountPence: number;
    tipAmountPence: number;
    feeAmountPence: number;
    netAmountPence: number;
    calculatedAt: string;
    paidOut: boolean;
    bookingAmountPence: number;
    bookingCreatedAt: string;
  }>;
  pendingPayouts: Array<{
    id: string;
    totalAmountPence: number;
    status: string;
    createdAt: string;
  }>;
}

interface PayoutSettings {
  autoPayout: boolean;
  minPayoutAmountPence: number;
  verified: boolean;
  hasBankDetails: boolean;
  hasStripeAccount: boolean;
}

interface TipData {
  id: string;
  assignmentId: string;
  bookingCode: string;
  pickupAddress: string;
  dropoffAddress: string;
  totalGBP: number;
  currency: string;
  method: string;
  reference: string;
  status: string;
  reconciledAt: string;
  reconciledBy: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export default function EarningsPage() {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings | null>(
    null
  );
  const [tipsData, setTipsData] = useState<TipData[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('month');
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchEarnings = async () => {
    try {
      const response = await fetch(`/api/driver/earnings?range=${range}`);
      if (response.ok) {
        const data = await response.json();
        setEarningsData(data);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch earnings data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchPayoutSettings = async () => {
    try {
      const response = await fetch('/api/driver/payout-settings');
      if (response.ok) {
        const data = await response.json();
        setPayoutSettings(data);
      }
    } catch (error) {
      console.error('Error fetching payout settings:', error);
    }
  };

  const fetchTips = async () => {
    try {
      const response = await fetch('/api/driver/tips');
      if (response.ok) {
        const data = await response.json();
        setTipsData(data.tips || []);
      }
    } catch (error) {
      console.error('Error fetching tips:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchEarnings(), fetchPayoutSettings(), fetchTips()]);
      setLoading(false);
    };
    loadData();
  }, [range]);

  const handleRangeChange = (newRange: string) => {
    setRange(newRange);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getTipMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Cash';
      case 'card':
        return 'Card';
      case 'qr_code':
        return 'QR Code';
      case 'bank_transfer':
        return 'Bank Transfer';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <Box>
        <Heading size="lg" mb={6}>
          Earnings
        </Heading>
        <Text>Loading earnings data...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Earnings</Heading>
        <Select
          value={range}
          onChange={e => handleRangeChange(e.target.value)}
          width="auto"
          minWidth="150px"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </Select>
      </HStack>

      {earningsData && (
        <>
          {/* Earnings Summary Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel color="gray.600">Net Earnings</StatLabel>
                  <StatNumber color="green.600" fontSize="2xl">
                    {formatCurrency(earningsData.totals.net)}
                  </StatNumber>
                  <StatHelpText>
                    {earningsData.totals.jobs} jobs completed
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel color="gray.600">Base Pay</StatLabel>
                  <StatNumber fontSize="2xl">
                    {formatCurrency(earningsData.totals.base)}
                  </StatNumber>
                  <StatHelpText>
                    {earningsData.totals.jobs > 0 &&
                      formatCurrency(
                        earningsData.totals.base / earningsData.totals.jobs
                      )}{' '}
                    per job
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel color="gray.600">Tips</StatLabel>
                  <StatNumber color="orange.600" fontSize="2xl">
                    {formatCurrency(earningsData.totals.tips)}
                  </StatNumber>
                  <StatHelpText>
                    {earningsData.totals.jobs > 0 &&
                      formatCurrency(
                        earningsData.totals.tips / earningsData.totals.jobs
                      )}{' '}
                    per job
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel color="gray.600">Pending Payout</StatLabel>
                  <StatNumber color="blue.600" fontSize="2xl">
                    {formatCurrency(earningsData.totals.pending)}
                  </StatNumber>
                  <StatHelpText>
                    {earningsData.pendingPayouts.length} pending
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Main Content Tabs */}
          <Tabs index={activeTab} onChange={setActiveTab}>
            <TabList>
              <Tab>Job History</Tab>
              <Tab>Tips</Tab>
              <Tab>Payouts</Tab>
              <Tab>Settings</Tab>
            </TabList>

            <TabPanels>
              {/* Job History Tab */}
              <TabPanel>
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>
                      Job Earnings Breakdown
                    </Heading>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Job Code</Th>
                          <Th>Route</Th>
                          <Th>Base</Th>
                          <Th>Surge</Th>
                          <Th>Tips</Th>
                          <Th>Fees</Th>
                          <Th>Net</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {earningsData.earnings.map(earning => (
                          <Tr key={earning.id}>
                            <Td fontWeight="bold">{earning.bookingCode}</Td>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm" color="gray.600">
                                  {earning.pickupAddress}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  → {earning.dropoffAddress}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>{formatCurrency(earning.baseAmountPence)}</Td>
                            <Td>{formatCurrency(earning.surgeAmountPence)}</Td>
                            <Td color="orange.600">
                              {formatCurrency(earning.tipAmountPence)}
                            </Td>
                            <Td color="red.600">
                              -{formatCurrency(earning.feeAmountPence)}
                            </Td>
                            <Td fontWeight="bold" color="green.600">
                              {formatCurrency(earning.netAmountPence)}
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  earning.paidOut ? 'green' : 'yellow'
                                }
                              >
                                {earning.paidOut ? 'Paid' : 'Pending'}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Tips Tab */}
              <TabPanel>
                <Card>
                  <CardBody>
                    <HStack justify="space-between" mb={4}>
                      <Heading size="md">Tips History</Heading>
                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="blue"
                        size="sm"
                        onClick={onOpen}
                      >
                        Add Tip
                      </Button>
                    </HStack>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Job Code</Th>
                          <Th>Amount</Th>
                          <Th>Method</Th>
                          <Th>Reference</Th>
                          <Th>Status</Th>
                          <Th>Date</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {tipsData.map(tip => (
                          <Tr key={tip.id}>
                            <Td fontWeight="bold">{tip.bookingCode}</Td>
                            <Td color="orange.600" fontWeight="bold">
                              {formatCurrency(tip.totalGBP)}
                            </Td>
                            <Td>{getTipMethodLabel(tip.method)}</Td>
                            <Td>{tip.reference || '-'}</Td>
                            <Td>
                              <Badge colorScheme={getStatusColor(tip.status)}>
                                {tip.status}
                              </Badge>
                            </Td>
                            <Td>
                              {new Date(tip.createdAt).toLocaleDateString()}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Payouts Tab */}
              <TabPanel>
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>
                      Payout History
                    </Heading>
                    {earningsData.pendingPayouts.length > 0 ? (
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Payout ID</Th>
                            <Th>Amount</Th>
                            <Th>Status</Th>
                            <Th>Created</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {earningsData.pendingPayouts.map(payout => (
                            <Tr key={payout.id}>
                              <Td fontWeight="bold">{payout.id.slice(-8)}</Td>
                              <Td color="blue.600" fontWeight="bold">
                                {formatCurrency(payout.totalAmountPence)}
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={getStatusColor(payout.status)}
                                >
                                  {payout.status}
                                </Badge>
                              </Td>
                              <Td>
                                {new Date(
                                  payout.createdAt
                                ).toLocaleDateString()}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    ) : (
                      <Text color="gray.600">No pending payouts</Text>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Settings Tab */}
              <TabPanel>
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>
                      Payout Settings
                    </Heading>
                    {payoutSettings && (
                      <VStack align="start" spacing={4}>
                        <HStack>
                          <Text fontWeight="bold">Auto Payout:</Text>
                          <Badge
                            colorScheme={
                              payoutSettings.autoPayout ? 'green' : 'gray'
                            }
                          >
                            {payoutSettings.autoPayout ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </HStack>

                        <HStack>
                          <Text fontWeight="bold">Minimum Payout:</Text>
                          <Text>
                            {formatCurrency(
                              payoutSettings.minPayoutAmountPence
                            )}
                          </Text>
                        </HStack>

                        <HStack>
                          <Text fontWeight="bold">Bank Details:</Text>
                          <Badge
                            colorScheme={
                              payoutSettings.hasBankDetails ? 'green' : 'red'
                            }
                          >
                            {payoutSettings.hasBankDetails
                              ? 'Configured'
                              : 'Not Set'}
                          </Badge>
                        </HStack>

                        <HStack>
                          <Text fontWeight="bold">Verification:</Text>
                          <Badge
                            colorScheme={
                              payoutSettings.verified ? 'green' : 'yellow'
                            }
                          >
                            {payoutSettings.verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </HStack>

                        {!payoutSettings.hasBankDetails && (
                          <Alert status="warning">
                            <AlertIcon />
                            Please configure your bank details to receive
                            payouts.
                          </Alert>
                        )}
                      </VStack>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      )}

      {/* Add Tip Modal */}
      <AddTipModal isOpen={isOpen} onClose={onClose} onSuccess={fetchTips} />
    </Box>
  );
}

// Add Tip Modal Component
function AddTipModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    assignmentId: '',
    totalGBP: '',
    method: 'cash',
    reference: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/driver/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          totalGBP: parseInt(formData.totalGBP) * 100, // Convert to pence
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Tip added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onSuccess();
        onClose();
        setFormData({
          assignmentId: '',
          totalGBP: '',
          method: 'cash',
          reference: '',
          notes: '',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to add tip',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add tip',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Tip</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Assignment ID</FormLabel>
                <Input
                  value={formData.assignmentId}
                  onChange={e =>
                    setFormData({ ...formData, assignmentId: e.target.value })
                  }
                  placeholder="Enter assignment ID"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Amount (£)</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.totalGBP}
                  onChange={e =>
                    setFormData({ ...formData, totalGBP: e.target.value })
                  }
                  placeholder="0.00"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Method</FormLabel>
                <Select
                  value={formData.method}
                  onChange={e =>
                    setFormData({ ...formData, method: e.target.value })
                  }
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="qr_code">QR Code</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Reference</FormLabel>
                <Input
                  value={formData.reference}
                  onChange={e =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                  placeholder="QR code, receipt number, etc."
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={e =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional notes..."
                />
              </FormControl>

              <HStack spacing={4} width="100%">
                <Button onClick={onClose} flex={1}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorScheme="blue"
                  flex={1}
                  isLoading={loading}
                >
                  Add Tip
                </Button>
              </HStack>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
