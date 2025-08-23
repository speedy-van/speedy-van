"use client";

import React, { useState, useEffect } from "react";
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
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
  useToast,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { formatCurrency } from "@/lib/currency";

interface PayoutData {
  id: string;
  totalAmountPence: number;
  currency: string;
  status: string;
  processedAt: string;
  failedAt: string;
  failureReason: string;
  stripeTransferId: string;
  createdAt: string;
  updatedAt: string;
  earnings: Array<{
    assignmentId: string;
    bookingCode: string;
    pickupAddress: string;
    dropoffAddress: string;
    netAmountPence: number;
    calculatedAt: string;
  }>;
}

interface PayoutSettings {
  autoPayout: boolean;
  minPayoutAmountPence: number;
  verified: boolean;
  hasBankDetails: boolean;
  hasStripeAccount: boolean;
}

interface PayoutTotals {
  [key: string]: {
    amount: number;
    count: number;
  };
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutData[]>([]);
  const [settings, setSettings] = useState<PayoutSettings | null>(null);
  const [totals, setTotals] = useState<PayoutTotals>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    autoPayout: false,
    minPayoutAmountPence: 5000,
    accountName: "",
    accountNumber: "",
    sortCode: "",
  });
  const toast = useToast();

  const fetchPayouts = async () => {
    try {
      const response = await fetch("/api/driver/payouts");
      if (response.ok) {
        const data = await response.json();
        setPayouts(data.payouts);
        setTotals(data.totals);
      }
    } catch (error) {
      console.error("Error fetching payouts:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/driver/payout-settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setFormData({
          autoPayout: data.autoPayout || false,
          minPayoutAmountPence: data.minPayoutAmountPence || 5000,
          accountName: "",
          accountNumber: "",
          sortCode: "",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPayouts(), fetchSettings()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/driver/payout-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        toast({
          title: "Success",
          description: "Payout settings updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update settings",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "processing":
        return "blue";
      case "pending":
        return "yellow";
      case "failed":
        return "red";
      case "cancelled":
        return "gray";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "processing":
        return "Processing";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box>
        <Heading size="lg" mb={6}>Payouts</Heading>
        <Text>Loading payout data...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>Payouts</Heading>

      {/* Payout Summary Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Total Payouts</StatLabel>
              <StatNumber fontSize="2xl">
                {formatCurrency(Object.values(totals).reduce((sum, item) => sum + item.amount, 0))}
              </StatNumber>
              <StatHelpText>
                {Object.values(totals).reduce((sum, item) => sum + item.count, 0)} total payouts
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Completed</StatLabel>
              <StatNumber color="green.600" fontSize="2xl">
                {formatCurrency(totals.completed?.amount || 0)}
              </StatNumber>
              <StatHelpText>
                {totals.completed?.count || 0} payouts
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Pending</StatLabel>
              <StatNumber color="yellow.600" fontSize="2xl">
                {formatCurrency(totals.pending?.amount || 0)}
              </StatNumber>
              <StatHelpText>
                {totals.pending?.count || 0} payouts
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel color="gray.600">Failed</StatLabel>
              <StatNumber color="red.600" fontSize="2xl">
                {formatCurrency(totals.failed?.amount || 0)}
              </StatNumber>
              <StatHelpText>
                {totals.failed?.count || 0} payouts
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Main Content Tabs */}
      <Tabs>
        <TabList>
          <Tab>Payout History</Tab>
          <Tab>Settings</Tab>
        </TabList>

        <TabPanels>
          {/* Payout History Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Payout History</Heading>
                {payouts.length > 0 ? (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Payout ID</Th>
                        <Th>Amount</Th>
                        <Th>Status</Th>
                        <Th>Created</Th>
                        <Th>Details</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {payouts.map((payout) => (
                        <Tr key={payout.id}>
                          <Td fontWeight="bold">{payout.id.slice(-8)}</Td>
                          <Td color="blue.600" fontWeight="bold">
                            {formatCurrency(payout.totalAmountPence)}
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(payout.status)}>
                              {getStatusLabel(payout.status)}
                            </Badge>
                          </Td>
                          <Td>
                            {new Date(payout.createdAt).toLocaleDateString()}
                          </Td>
                          <Td>
                            <PayoutDetails payout={payout} />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text color="gray.600">No payouts found</Text>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Settings Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Payout Settings</Heading>
                
                <VStack spacing={6} align="stretch">
                  {/* Auto Payout Settings */}
                  <Box>
                    <Heading size="sm" mb={3}>Automatic Payouts</Heading>
                    <VStack spacing={4} align="stretch">
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="auto-payout" mb="0">
                          Enable automatic payouts
                        </FormLabel>
                        <Switch
                          id="auto-payout"
                          isChecked={formData.autoPayout}
                          onChange={(e) => setFormData({ ...formData, autoPayout: e.target.checked })}
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Minimum payout amount</FormLabel>
                        <NumberInput
                          value={formData.minPayoutAmountPence / 100}
                          onChange={(_, value) => setFormData({ ...formData, minPayoutAmountPence: value * 100 })}
                          min={10}
                          max={10000}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Text fontSize="sm" color="gray.600">
                          Minimum £10, maximum £10,000
                        </Text>
                      </FormControl>
                    </VStack>
                  </Box>

                  <Divider />

                  {/* Bank Details */}
                  <Box>
                    <Heading size="sm" mb={3}>Bank Account Details</Heading>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Account holder name</FormLabel>
                        <Input
                          value={formData.accountName}
                          onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                          placeholder="Enter account holder name"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Sort code</FormLabel>
                        <Input
                          value={formData.sortCode}
                          onChange={(e) => setFormData({ ...formData, sortCode: e.target.value })}
                          placeholder="123456"
                          maxLength={6}
                        />
                        <Text fontSize="sm" color="gray.600">
                          Enter 6-digit sort code
                        </Text>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Account number</FormLabel>
                        <Input
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          placeholder="12345678"
                          maxLength={8}
                        />
                        <Text fontSize="sm" color="gray.600">
                          Enter 8-digit account number
                        </Text>
                      </FormControl>
                    </VStack>
                  </Box>

                  {/* Current Status */}
                  {settings && (
                    <Box>
                      <Heading size="sm" mb={3}>Current Status</Heading>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text>Bank details configured:</Text>
                          <Badge colorScheme={settings.hasBankDetails ? "green" : "red"}>
                            {settings.hasBankDetails ? "Yes" : "No"}
                          </Badge>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text>Account verified:</Text>
                          <Badge colorScheme={settings.verified ? "green" : "yellow"}>
                            {settings.verified ? "Verified" : "Pending"}
                          </Badge>
                        </HStack>

                        {!settings.hasBankDetails && (
                          <Alert status="warning">
                            <AlertIcon />
                            Please provide your bank details to receive payouts.
                          </Alert>
                        )}

                        {settings.hasBankDetails && !settings.verified && (
                          <Alert status="info">
                            <AlertIcon />
                            Your bank details are being verified. This usually takes 1-2 business days.
                          </Alert>
                        )}
                      </VStack>
                    </Box>
                  )}

                  <Button
                    colorScheme="blue"
                    onClick={handleSaveSettings}
                    isLoading={saving}
                    loadingText="Saving..."
                  >
                    Save Settings
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

// Payout Details Component
function PayoutDetails({ payout }: { payout: PayoutData }) {
  return (
    <Accordion allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" textAlign="left">
              View Details
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <VStack spacing={3} align="stretch">
            <Box>
              <Text fontWeight="bold" fontSize="sm">Jobs included:</Text>
              <VStack spacing={2} align="stretch" mt={2}>
                {payout.earnings.map((earning) => (
                  <Box key={earning.assignmentId} p={2} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="bold">
                      {earning.bookingCode}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {earning.pickupAddress} → {earning.dropoffAddress}
                    </Text>
                    <Text fontSize="sm" color="green.600">
                      {formatCurrency(earning.netAmountPence)}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>

            {payout.stripeTransferId && (
              <Box>
                <Text fontWeight="bold" fontSize="sm">Stripe Transfer ID:</Text>
                <Text fontSize="sm" fontFamily="mono">
                  {payout.stripeTransferId}
                </Text>
              </Box>
            )}

            {payout.failureReason && (
              <Box>
                <Text fontWeight="bold" fontSize="sm" color="red.600">Failure Reason:</Text>
                <Text fontSize="sm" color="red.600">
                  {payout.failureReason}
                </Text>
              </Box>
            )}

            <Box>
              <Text fontWeight="bold" fontSize="sm">Timeline:</Text>
              <VStack spacing={1} align="stretch" mt={2}>
                <Text fontSize="sm">
                  Created: {new Date(payout.createdAt).toLocaleString()}
                </Text>
                {payout.processedAt && (
                  <Text fontSize="sm">
                    Processed: {new Date(payout.processedAt).toLocaleString()}
                  </Text>
                )}
                {payout.failedAt && (
                  <Text fontSize="sm" color="red.600">
                    Failed: {new Date(payout.failedAt).toLocaleString()}
                  </Text>
                )}
              </VStack>
            </Box>
          </VStack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
