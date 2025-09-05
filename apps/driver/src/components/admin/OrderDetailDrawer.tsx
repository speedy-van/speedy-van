'use client';

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Card,
  CardBody,
  Grid,
  GridItem,
  Divider,
  List,
  ListItem,
  ListIcon,
  Box,
  Flex,
  Spinner,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Select,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Avatar,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiMapPin,
  FiClock,
  FiUser,
  FiTruck,
  FiDollarSign,
  FiMessageSquare,
  FiFile,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit,
  FiPhone,
  FiMail,
  FiCalendar,
  FiPackage,
  FiStar,
  FiNavigation,
  FiDownload,
  FiSend,
} from 'react-icons/fi';
import { formatDistanceToNow, format } from 'date-fns';

interface OrderDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderCode?: string;
}

interface Order {
  id: string;
  reference: string;
  status: string;
  scheduledAt: string;
  estimatedDurationMinutes: number;
  crewSize: string;

  // Pricing
  baseDistanceMiles: number;
  distanceCostGBP: number;
  accessSurchargeGBP: number;
  weatherSurchargeGBP: number;
  itemsSurchargeGBP: number;
  crewMultiplierPercent: number;
  availabilityMultiplierPercent: number;
  totalGBP: number;

  // Customer details
  customerName: string;
  customerPhone: string;
  customerEmail: string;

  // Payment
  stripePaymentIntentId?: string;
  paidAt?: string;

  // Relations
  pickupAddress: {
    label: string;
    postcode: string;
    lat: number;
    lng: number;
  };
  dropoffAddress: {
    id: string;
    label: string;
    postcode: string;
    lat: number;
    lng: number;
  };
  pickupProperty: {
    id: string;
    propertyType: string;
    accessType: string;
    floors: number;
  };
  dropoffProperty: {
    id: string;
    propertyType: string;
    accessType: string;
    floors: number;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    volumeM3: number;
  }>;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  driver?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    rating?: number;
  };
  assignment?: {
    id: string;
    status: string;
    claimedAt?: string;
    events: Array<{
      id: string;
      step: string;
      createdAt: string;
      notes?: string;
      mediaUrls: string[];
    }>;
  };
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
  }>;
  trackingPings: Array<{
    id: string;
    lat: number;
    lng: number;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface DriverSuggestion {
  id: string;
  score: number;
  activeJobs: number;
  suitability: string;
  rating?: number;
  user: {
    name: string;
    email: string;
  };
  vehicles: Array<{
    make?: string;
    model?: string;
    reg?: string;
  }>;
}

export function OrderDetailDrawer({
  isOpen,
  onClose,
  orderCode,
}: OrderDetailDrawerProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [driverSuggestions, setDriverSuggestions] = useState<
    DriverSuggestion[]
  >([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const toast = useToast();

  const {
    isOpen: isAssignmentOpen,
    onOpen: onAssignmentOpen,
    onClose: onAssignmentClose,
  } = useDisclosure();

  useEffect(() => {
    if (isOpen && orderCode) {
      loadOrder();
    }
  }, [isOpen, orderCode]);

  const loadOrder = async () => {
    if (!orderCode) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderCode}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
        setEditData({
          status: data.status,
          scheduledAt: data.scheduledAt
            ? format(new Date(data.scheduledAt), 'yyyy-MM-dd')
            : '',
          notes: '',
        });
      } else {
        throw new Error('Failed to load order');
      }
    } catch (error) {
      toast({
        title: 'Error loading order',
        description: 'Failed to fetch order details',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDriverSuggestions = async () => {
    if (!orderCode) return;

    setLoadingSuggestions(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderCode}/assign`);
      if (response.ok) {
        const data = await response.json();
        setDriverSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to load driver suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSave = async () => {
    if (!orderCode) return;

    try {
      const response = await fetch(`/api/admin/orders/${orderCode}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrder(updatedOrder);
        setEditing(false);
        toast({
          title: 'Order updated',
          description: 'Order details have been saved successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to update order');
      }
    } catch (error) {
      toast({
        title: 'Error updating order',
        description: 'Failed to save order changes',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAssignDriver = async (driverId: string, autoAssign = false) => {
    if (!orderCode) return;

    try {
      const response = await fetch(`/api/admin/orders/${orderCode}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId: autoAssign ? undefined : driverId,
          autoAssign,
          reason: editData.notes || 'Manual assignment',
        }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrder(updatedOrder);
        onAssignmentClose();
        toast({
          title: 'Driver assigned',
          description: autoAssign
            ? 'Driver auto-assigned successfully'
            : 'Driver assigned successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      toast({
        title: 'Assignment failed',
        description:
          error instanceof Error ? error.message : 'Failed to assign driver',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'CANCELLED':
        return 'red';
      case 'in_progress':
        return 'blue';
      case 'CONFIRMED':
        return 'yellow';
      case 'DRAFT':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'requires_action':
        return 'orange';
      case 'refunded':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (!order && loading) {
    return (
      <Drawer isOpen={isOpen} onClose={onClose} size="xl">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Order Details</DrawerHeader>
          <DrawerBody>
            <Flex justify="center" align="center" h="200px">
              <Spinner size="lg" />
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose} size="xl">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="lg" fontWeight="bold">
                  #{order.reference}
                </Text>
                <Text fontSize="sm" color="text.secondary">
                  Order Details
                </Text>
              </VStack>
              <HStack spacing={2}>
                <Badge colorScheme={getStatusColor(order.status)} size="lg">
                  {order.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Button
                  size="sm"
                  leftIcon={<Icon as={FiTruck} />}
                  onClick={() => {
                    loadDriverSuggestions();
                    onAssignmentOpen();
                  }}
                  isDisabled={
                    order.status === 'COMPLETED' || order.status === 'CANCELLED'
                  }
                >
                  {order.driver ? 'Reassign' : 'Assign'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Icon as={FiEdit} />}
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? 'Cancel' : 'Edit'}
                </Button>
              </HStack>
            </HStack>
          </DrawerHeader>
          <DrawerCloseButton />

          <DrawerBody>
            <Tabs>
              <TabList>
                <Tab>Overview</Tab>
                <Tab>Timeline</Tab>
                <Tab>Payment</Tab>
                <Tab>Communications</Tab>
                <Tab>Files</Tab>
              </TabList>

              <TabPanels>
                {/* Overview Tab */}
                <TabPanel>
                  <Grid
                    templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
                    gap={6}
                  >
                    <VStack spacing={6} align="stretch">
                      {/* Route Information */}
                      <Card>
                        <CardBody>
                          <HStack mb={4}>
                            <Icon as={FiNavigation} />
                            <Text fontWeight="bold" fontSize="lg">
                              Route
                            </Text>
                          </HStack>
                          <VStack spacing={4} align="stretch">
                            <HStack>
                              <Icon as={FiMapPin} color="green.500" />
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">Pickup</Text>
                                <Text>
                                  {order.pickupAddress?.label ||
                                    'Not specified'}
                                </Text>
                                <Text fontSize="sm" color="text.secondary">
                                  {order.pickupAddress?.postcode} •{' '}
                                  {order.pickupProperty?.propertyType}
                                </Text>
                                <Text fontSize="sm" color="text.secondary">
                                  {order.scheduledAt
                                    ? format(
                                        new Date(order.scheduledAt),
                                        'MMM dd, yyyy HH:mm'
                                      )
                                    : 'No scheduled time'}
                                </Text>
                              </VStack>
                            </HStack>
                            <HStack>
                              <Icon as={FiMapPin} color="red.500" />
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">Dropoff</Text>
                                <Text>
                                  {order.dropoffAddress?.label ||
                                    'Not specified'}
                                </Text>
                                <Text fontSize="sm" color="text.secondary">
                                  {order.dropoffAddress?.postcode} •{' '}
                                  {order.dropoffProperty?.propertyType}
                                </Text>
                                <Text fontSize="sm" color="text.secondary">
                                  Distance: {order.baseDistanceMiles.toFixed(1)}{' '}
                                  miles • Duration:{' '}
                                  {order.estimatedDurationMinutes} mins
                                </Text>
                              </VStack>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Service Details */}
                      <Card>
                        <CardBody>
                          <HStack mb={4}>
                            <Icon as={FiPackage} />
                            <Text fontWeight="bold" fontSize="lg">
                              Service Details
                            </Text>
                          </HStack>
                          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                            <VStack align="start" spacing={2}>
                              <Text fontSize="sm" color="text.tertiary">
                                Crew Size
                              </Text>
                              <Text fontWeight="medium">
                                {order.crewSize || 'Not specified'}
                              </Text>
                            </VStack>
                            <VStack align="start" spacing={2}>
                              <Text fontSize="sm" color="text.tertiary">
                                Pickup Floors
                              </Text>
                              <Text fontWeight="medium">
                                {order.pickupProperty?.floors || 0} floors
                              </Text>
                            </VStack>
                            <VStack align="start" spacing={2}>
                              <Text fontSize="sm" color="text.tertiary">
                                Pickup Access
                              </Text>
                              <Text fontWeight="medium">
                                {order.pickupProperty?.accessType ||
                                  'Not specified'}
                              </Text>
                            </VStack>
                            <VStack align="start" spacing={2}>
                              <Text fontSize="sm" color="text.tertiary">
                                Dropoff Access
                              </Text>
                              <Text fontWeight="medium">
                                {order.dropoffProperty?.accessType ||
                                  'Not specified'}
                              </Text>
                            </VStack>
                          </Grid>

                          {/* Items List */}
                          {order.items && order.items.length > 0 && (
                            <Box mt={4} p={3} bg="blue.50" borderRadius="md">
                              <Text fontSize="sm" fontWeight="medium" mb={2}>
                                Items ({order.items.length})
                              </Text>
                              <VStack spacing={1} align="stretch">
                                {order.items.slice(0, 5).map((item, index) => (
                                  <Text key={index} fontSize="sm">
                                    {item.quantity}x {item.name} (
                                    {item.volumeM3}m³)
                                  </Text>
                                ))}
                                {order.items.length > 5 && (
                                  <Text fontSize="sm" color="text.secondary">
                                    ... and {order.items.length - 5} more items
                                  </Text>
                                )}
                              </VStack>
                            </Box>
                          )}
                        </CardBody>
                      </Card>
                    </VStack>

                    <VStack spacing={6} align="stretch">
                      {/* Customer Info */}
                      <Card>
                        <CardBody>
                          <HStack mb={4}>
                            <Icon as={FiUser} />
                            <Text fontWeight="bold" fontSize="lg">
                              Customer
                            </Text>
                          </HStack>
                          <VStack spacing={3} align="stretch">
                            <HStack>
                              <Avatar size="sm" name={order.customerName} />
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">
                                  {order.customerName}
                                </Text>
                                <Text fontSize="sm">{order.customerEmail}</Text>
                                <Text fontSize="sm" color="text.secondary">
                                  {order.customerPhone}
                                </Text>
                              </VStack>
                            </HStack>
                            <HStack spacing={3}>
                              <Button
                                size="sm"
                                leftIcon={<Icon as={FiMail} />}
                                variant="outline"
                              >
                                Email
                              </Button>
                              <Button
                                size="sm"
                                leftIcon={<Icon as={FiPhone} />}
                                variant="outline"
                              >
                                Call
                              </Button>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Driver Info */}
                      <Card>
                        <CardBody>
                          <HStack mb={4}>
                            <Icon as={FiTruck} />
                            <Text fontWeight="bold" fontSize="lg">
                              Driver
                            </Text>
                          </HStack>
                          {order.driver ? (
                            <VStack spacing={3} align="stretch">
                              <HStack>
                                <Avatar
                                  size="sm"
                                  name={order.driver.user.name}
                                />
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="bold">
                                    {order.driver.user.name}
                                  </Text>
                                  <Text fontSize="sm">
                                    {order.driver.user.email}
                                  </Text>
                                  {order.driver.rating && (
                                    <HStack>
                                      <Icon as={FiStar} color="yellow.400" />
                                      <Text fontSize="sm">
                                        {order.driver.rating.toFixed(1)}
                                      </Text>
                                    </HStack>
                                  )}
                                </VStack>
                              </HStack>
                              <HStack spacing={3}>
                                <Button
                                  size="sm"
                                  leftIcon={<Icon as={FiMail} />}
                                  variant="outline"
                                >
                                  Email
                                </Button>
                                <Button
                                  size="sm"
                                  leftIcon={<Icon as={FiPhone} />}
                                  variant="outline"
                                >
                                  Call
                                </Button>
                              </HStack>
                            </VStack>
                          ) : (
                            <Text color="text.tertiary">
                              No driver assigned
                            </Text>
                          )}
                        </CardBody>
                      </Card>

                      {/* Payment Info */}
                      <Card>
                        <CardBody>
                          <HStack mb={4}>
                            <Icon as={FiDollarSign} />
                            <Text fontWeight="bold" fontSize="lg">
                              Payment
                            </Text>
                          </HStack>
                          <VStack spacing={3} align="stretch">
                            <HStack justify="space-between">
                              <Text>Status</Text>
                              <Badge
                                colorScheme={order.paidAt ? 'green' : 'gray'}
                              >
                                {order.paidAt ? 'PAID' : 'PENDING'}
                              </Badge>
                            </HStack>
                            <HStack justify="space-between">
                              <Text>Total Amount</Text>
                              <Text fontWeight="bold">£{order.totalGBP}</Text>
                            </HStack>
                            {order.paidAt && (
                              <HStack justify="space-between">
                                <Text>Paid At</Text>
                                <Text fontSize="sm">
                                  {format(
                                    new Date(order.paidAt),
                                    'MMM dd, yyyy HH:mm'
                                  )}
                                </Text>
                              </HStack>
                            )}
                            {order.stripePaymentIntentId && (
                              <HStack justify="space-between">
                                <Text>Payment ID</Text>
                                <Text fontSize="xs" color="text.secondary">
                                  {order.stripePaymentIntentId.substring(0, 20)}
                                  ...
                                </Text>
                              </HStack>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    </VStack>
                  </Grid>
                </TabPanel>

                {/* Timeline Tab */}
                <TabPanel>
                  <Card>
                    <CardBody>
                      <HStack mb={4}>
                        <Icon as={FiClock} />
                        <Text fontWeight="bold" fontSize="lg">
                          Order Timeline
                        </Text>
                      </HStack>
                      <VStack spacing={4} align="stretch">
                        {order.assignment?.events &&
                        order.assignment.events.length > 0 ? (
                          order.assignment.events.map((event, index) => (
                            <HStack key={event.id} spacing={4}>
                              <Text
                                fontSize="sm"
                                color="text.secondary"
                                minW="80px"
                              >
                                {format(new Date(event.createdAt), 'HH:mm')}
                              </Text>
                              <Box
                                w="12px"
                                h="12px"
                                borderRadius="full"
                                bg={
                                  index === order.assignment!.events.length - 1
                                    ? 'blue.500'
                                    : 'text.tertiary'
                                }
                              />
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="medium">
                                  {event.step.replace(/_/g, ' ')}
                                </Text>
                                {event.notes && (
                                  <Text fontSize="sm" color="text.secondary">
                                    {event.notes}
                                  </Text>
                                )}
                              </VStack>
                            </HStack>
                          ))
                        ) : (
                          <Text color="text.tertiary">
                            No timeline events yet
                          </Text>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </TabPanel>

                {/* Payment Tab */}
                <TabPanel>
                  <Card>
                    <CardBody>
                      <HStack mb={4}>
                        <Icon as={FiDollarSign} />
                        <Text fontWeight="bold" fontSize="lg">
                          Payment Information
                        </Text>
                      </HStack>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Text>Status</Text>
                          <Badge colorScheme={order.paidAt ? 'green' : 'gray'}>
                            {order.paidAt ? 'PAID' : 'PENDING'}
                          </Badge>
                        </HStack>

                        {/* Pricing Breakdown */}
                        <VStack spacing={2} align="stretch">
                          <Text fontWeight="bold" mb={2}>
                            Pricing Breakdown
                          </Text>
                          <HStack justify="space-between">
                            <Text>
                              Distance Cost (
                              {order.baseDistanceMiles.toFixed(1)} miles)
                            </Text>
                            <Text>£{order.distanceCostGBP}</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>Access Surcharge</Text>
                            <Text>£{order.accessSurchargeGBP}</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>Weather Surcharge</Text>
                            <Text>£{order.weatherSurchargeGBP}</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>Items Surcharge</Text>
                            <Text>£{order.itemsSurchargeGBP}</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>
                              Crew Multiplier (
                              {order.crewMultiplierPercent > 0 ? '+' : ''}
                              {order.crewMultiplierPercent}%)
                            </Text>
                            <Text>
                              {order.crewMultiplierPercent > 0 ? '+' : ''}£
                              {Math.round(
                                (order.totalGBP * order.crewMultiplierPercent) /
                                  100
                              )}
                            </Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>
                              Availability Multiplier (
                              {order.availabilityMultiplierPercent > 0
                                ? '+'
                                : ''}
                              {order.availabilityMultiplierPercent}%)
                            </Text>
                            <Text>
                              {order.availabilityMultiplierPercent > 0
                                ? '+'
                                : ''}
                              £
                              {Math.round(
                                (order.totalGBP *
                                  order.availabilityMultiplierPercent) /
                                  100
                              )}
                            </Text>
                          </HStack>
                        </VStack>

                        <Divider />
                        <HStack justify="space-between">
                          <Text fontWeight="bold" fontSize="lg">
                            Total Amount
                          </Text>
                          <Text fontWeight="bold" fontSize="lg">
                            £{order.totalGBP}
                          </Text>
                        </HStack>

                        {order.paidAt && (
                          <HStack justify="space-between">
                            <Text>Paid At</Text>
                            <Text>
                              {format(
                                new Date(order.paidAt),
                                'MMM dd, yyyy HH:mm'
                              )}
                            </Text>
                          </HStack>
                        )}

                        <Divider />
                        <Button
                          leftIcon={<Icon as={FiDownload} />}
                          variant="outline"
                        >
                          Download Invoice
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </TabPanel>

                {/* Communications Tab */}
                <TabPanel>
                  <Card>
                    <CardBody>
                      <HStack mb={4}>
                        <Icon as={FiMessageSquare} />
                        <Text fontWeight="bold" fontSize="lg">
                          Communications
                        </Text>
                      </HStack>
                      <VStack spacing={4} align="stretch">
                        {order.messages && order.messages.length > 0 ? (
                          order.messages.map(message => (
                            <Box
                              key={message.id}
                              p={3}
                              bg="bg.surface.elevated"
                              borderRadius="md"
                            >
                              <Text fontSize="sm" color="text.secondary" mb={1}>
                                {format(
                                  new Date(message.createdAt),
                                  'MMM dd, yyyy HH:mm'
                                )}
                              </Text>
                              <Text>{message.content}</Text>
                            </Box>
                          ))
                        ) : (
                          <Text color="text.tertiary">No messages yet</Text>
                        )}
                        <Button
                          leftIcon={<Icon as={FiSend} />}
                          colorScheme="blue"
                        >
                          Send Message
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </TabPanel>

                {/* Files Tab */}
                <TabPanel>
                  <Card>
                    <CardBody>
                      <HStack mb={4}>
                        <Icon as={FiFile} />
                        <Text fontWeight="bold" fontSize="lg">
                          Files
                        </Text>
                      </HStack>
                      <Text color="text.tertiary">
                        Photos, POD, and invoice PDFs will be displayed here
                      </Text>
                    </CardBody>
                  </Card>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Assignment Modal */}
      <Modal isOpen={isAssignmentOpen} onClose={onAssignmentClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Assign Driver</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Button
                colorScheme="blue"
                onClick={() => handleAssignDriver('', true)}
                isLoading={loadingSuggestions}
              >
                Auto-Assign Best Driver
              </Button>

              <Divider />

              <Text fontWeight="medium">Suggested Drivers</Text>

              {loadingSuggestions ? (
                <Flex justify="center" py={4}>
                  <Spinner />
                </Flex>
              ) : (
                <VStack spacing={3} align="stretch">
                  {driverSuggestions.map(driver => (
                    <Card key={driver.id} variant="outline">
                      <CardBody>
                        <HStack justify="space-between">
                          <HStack>
                            <Avatar size="sm" name={driver.user.name} />
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold">{driver.user.name}</Text>
                              <Text fontSize="sm">{driver.user.email}</Text>
                              <HStack spacing={2}>
                                <Badge
                                  colorScheme={
                                    driver.suitability === 'available'
                                      ? 'green'
                                      : 'red'
                                  }
                                >
                                  {driver.activeJobs}/3 jobs
                                </Badge>
                                {driver.rating && (
                                  <HStack>
                                    <Icon as={FiStar} color="yellow.400" />
                                    <Text fontSize="sm">
                                      {driver.rating.toFixed(1)}
                                    </Text>
                                  </HStack>
                                )}
                              </HStack>
                            </VStack>
                          </HStack>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleAssignDriver(driver.id)}
                            isDisabled={driver.suitability !== 'available'}
                          >
                            Assign
                          </Button>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
