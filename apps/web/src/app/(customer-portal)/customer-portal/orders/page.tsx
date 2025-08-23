'use client';

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Button,
  Badge,
  HStack,
  VStack,
  IconButton,
  Tooltip,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Spinner
} from "@chakra-ui/react";
import NextLink from "next/link";
import { ExternalLinkIcon, DownloadIcon, ChatIcon } from "@chakra-ui/icons";

interface Booking {
  id: string;
  reference: string;
  status: string;
  amount: number;
  totalGBP: number;
  createdAt: string;
  scheduledAt: string;
  timeSlot: string;
  pickupAddress: string;
  dropoffAddress: string;
  crewName?: string;
  crewPhone?: string;
  crewSize?: number;
  vanSize?: string;
}

export default function CustomerOrdersPage() {
  const [currentUpcoming, setCurrentUpcoming] = useState<Booking[]>([]);
  const [past, setPast] = useState<Booking[]>([]);
  const [all, setAll] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customer/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      
      setCurrentUpcoming(data.currentUpcoming || []);
      setPast(data.past || []);
      setAll(data.all || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={12}>
        <Spinner size="lg" />
        <Text mt={4}>Loading your orders...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={12}>
        <Text color="red.500" mb={4}>Error: {error}</Text>
        <Button onClick={fetchOrders} colorScheme="blue">
          Try Again
        </Button>
      </Box>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      case 'failed': return 'red';
      case 'en_route_dropoff': return 'blue';
      case 'loaded': return 'blue';
      case 'arrived': return 'yellow';
      case 'CONFIRMED': return 'orange';
      case 'CONFIRMED': return 'green';
      case 'pending_dispatch': return 'yellow';
      case 'DRAFT': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'DRAFT': 'DRAFT',
      'pending_dispatch': 'Pending Dispatch',
      'CONFIRMED': 'Crew Assigned',
      'en_route_pickup': 'En Route to Pickup',
      'arrived': 'Arrived at Pickup',
      'loaded': 'Loaded & En Route',
      'en_route_dropoff': 'En Route to Dropoff',
      'COMPLETED': 'COMPLETED',
      'CANCELLED': 'CANCELLED',
      'failed': 'Failed'
    };
    return statusMap[status] || status.replace(/_/g, " ").toUpperCase();
  };

  const getCrewSize = (crewSize: number) => {
    return `${crewSize} ${crewSize === 1 ? 'person' : 'people'}`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (time: string | null) => {
    if (!time) return "—";
    return time.charAt(0).toUpperCase() + time.slice(1);
  };

  function renderTable(rows: Booking[]) {
    if (rows.length === 0) {
      return (
        <Box textAlign="center" py={12}>
          <VStack spacing={4}>
            <Box 
              w="64px" 
              h="64px" 
              borderRadius="full" 
              bg="gray.100" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
            >
              <Text fontSize="2xl">📦</Text>
            </Box>
            <Text fontSize="lg" fontWeight="medium" color="gray.700">
              No orders found
            </Text>
            <Text color="gray.600" maxW="md">
              {rows === currentUpcoming 
                ? "You don't have any current or upcoming orders. Start by making a new booking!"
                : "You don't have any past orders yet."
              }
            </Text>
            {rows === currentUpcoming && (
              <Button
                as={NextLink as any}
                href="/book"
                colorScheme="blue"
                size="md"
                mt={2}
              >
                Make a New Booking
              </Button>
            )}
          </VStack>
        </Box>
      );
    }

    return (
      <Box overflowX="auto">
        <Table size="md" variant="simple">
          <Thead>
            <Tr>
              <Th>Reference</Th>
              <Th>Date & Time</Th>
              <Th>Route</Th>
              <Th>Crew</Th>
              <Th isNumeric>Price</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((r) => (
              <Tr key={r.id} _hover={{ bg: "gray.50" }}>
                <Td>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="semibold" color="blue.600">
                      {r.reference}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {formatDate(new Date(r.createdAt))}
                    </Text>
                  </VStack>
                </Td>
                <Td>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium">
                      {formatDate(new Date(r.scheduledAt))}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {formatTime(r.timeSlot)}
                    </Text>
                  </VStack>
                </Td>
                <Td>
                  <VStack align="start" spacing={1}>
                    <Box>
                      <Text fontSize="xs" fontWeight="medium" color="blue.600">From:</Text>
                      <Text fontSize="sm" noOfLines={2}>
                        {r.pickupAddress || "—"}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" fontWeight="medium" color="green.600">To:</Text>
                      <Text fontSize="sm" noOfLines={2}>
                        {r.dropoffAddress || "—"}
                      </Text>
                    </Box>
                  </VStack>
                </Td>
                <Td>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium">
                      {getCrewSize(r.crewSize || 2)}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {r.vanSize || "Standard van"}
                    </Text>
                  </VStack>
                </Td>
                <Td isNumeric>
                  <VStack align="end" spacing={0}>
                    <Text fontWeight="semibold" fontSize="sm">
                      {r.totalGBP ? formatCurrency(r.totalGBP) : "—"}
                    </Text>
                    {r.status === "paid" && (
                      <Badge size="sm" colorScheme="green" variant="subtle">
                        Paid
                      </Badge>
                    )}
                  </VStack>
                </Td>
                <Td>
                  <Badge
                    colorScheme={getStatusColor(r.status)}
                    variant="subtle"
                    size="sm"
                  >
                    {getStatusLabel(r.status)}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <Button
                      as={NextLink as any}
                      href={`/customer-portal/orders/${r.reference}`}
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      leftIcon={<ExternalLinkIcon />}
                    >
                      View
                    </Button>
                    
                    {(r.status === "assigned" || r.status === "en_route_pickup" || r.status === "arrived" || r.status === "loaded" || r.status === "en_route_dropoff") && (
                      <Button
                        as={NextLink as any}
                        href={`/track/${r.reference}`}
                        size="sm"
                        variant="outline"
                        colorScheme="green"
                      >
                        Track
                      </Button>
                    )}
                    
                    <Tooltip label="Download Invoice">
                      <IconButton
                        aria-label="Download invoice"
                        icon={<DownloadIcon />}
                        size="sm"
                        variant="ghost"
                        isDisabled={r.status !== 'paid'}
                        colorScheme="gray"
                      />
                    </Tooltip>
                    
                    <Tooltip label="Get Support">
                      <IconButton
                        aria-label="Get support"
                        icon={<ChatIcon />}
                        size="sm"
                        variant="ghost"
                        as={NextLink as any}
                        href={`/customer-portal/support?order=${r.reference}`}
                        colorScheme="gray"
                      />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={8}>
      {/* Header */}
      <Box>
        <Heading size="lg" mb={2}>My Orders</Heading>
        <Text color="gray.600">View and manage all your bookings</Text>
      </Box>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Current & Upcoming</StatLabel>
              <StatNumber>{currentUpcoming.length}</StatNumber>
              <StatHelpText>Active bookings</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Completed</StatLabel>
              <StatNumber>{past.filter(b => b.status === 'COMPLETED').length}</StatNumber>
              <StatHelpText>Successful moves</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Orders</StatLabel>
              <StatNumber>{all.length}</StatNumber>
              <StatHelpText>All time</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Orders Table */}
      <Card>
        <CardBody>
          <Tabs variant="enclosed">
            <TabList>
              <Tab>
                Current & Upcoming ({currentUpcoming.length})
              </Tab>
              <Tab>
                Past ({past.length})
              </Tab>
              <Tab>
                All ({all.length})
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {renderTable(currentUpcoming)}
              </TabPanel>
              <TabPanel>
                {renderTable(past)}
              </TabPanel>
              <TabPanel>
                {renderTable(all)}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

      {/* Help Section */}
      <Card bg="blue.50" borderColor="blue.200">
        <CardBody>
          <HStack spacing={4}>
            <Box>
              <Text fontSize="2xl">💡</Text>
            </Box>
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium" color="blue.800">
                Need help with your orders?
              </Text>
              <Text fontSize="sm" color="blue.700">
                Contact our support team for any questions about your bookings, payments, or delivery status.
              </Text>
              <Button
                as={NextLink as any}
                href="/customer-portal/support"
                size="sm"
                colorScheme="blue"
                variant="outline"
                mt={2}
              >
                Get Support
              </Button>
            </VStack>
          </HStack>
        </CardBody>
      </Card>
    </VStack>
  );
}


