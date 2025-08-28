'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  SimpleGrid,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  IconButton,
  Tooltip,
  Collapse,
  useDisclosure
} from '@chakra-ui/react';
import { 
  FaTruck, 
  FaMapMarkerAlt, 
  FaCalendar, 
  FaPoundSign, 
  FaBoxes, 
  FaLink,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaEye,
  FaHistory,
  FaPlus,
  FaDownload,
  FaFileAlt
} from 'react-icons/fa';
import { CustomerBooking, getCustomerBookings, linkSpecificBooking, getCustomerBookingStats } from '@/lib/customer-bookings';
import { getCustomerInvoices } from '@/lib/invoices-client';

interface CustomerDashboardProps {
  userId: string;
}

export default function CustomerDashboard({ userId }: CustomerDashboardProps) {
  const [bookings, setBookings] = useState<{
    linkedBookings: CustomerBooking[];
    unlinkedBookings: CustomerBooking[];
    totalCount: number;
  } | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkingBookings, setLinkingBookings] = useState<Set<string>>(new Set());
  const toast = useToast();

  useEffect(() => {
    fetchCustomerData();
  }, [userId]);

  useEffect(() => {
    if (bookings?.linkedBookings.length > 0) {
      fetchInvoices();
    }
  }, [bookings]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [bookingsData, statsData] = await Promise.all([
        getCustomerBookings(userId),
        getCustomerBookingStats(userId)
      ]);
      
      setBookings(bookingsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      setInvoicesLoading(true);
      // TODO: Get customer email from user context or modify getCustomerInvoices to accept userId
      // For now, skip invoice fetching
      setInvoices([]);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const handleLinkBooking = async (bookingId: string) => {
    try {
      setLinkingBookings(prev => new Set(prev).add(bookingId));
      
      const result = await linkSpecificBooking(userId, bookingId);
      
      if (result.success) {
        toast({
          title: 'Booking Linked',
          description: result.message,
          status: 'success',
          duration: 3000,
        });
        
        // Refresh the data
        await fetchCustomerData();
      } else {
        toast({
          title: 'Linking Failed',
          description: result.message,
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to link booking',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLinkingBookings(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'green';
      case 'CONFIRMED': return 'blue';
      case 'IN_PROGRESS': return 'orange';
      case 'PENDING_PAYMENT': return 'yellow';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return FaCheckCircle;
      case 'CONFIRMED': return FaClock;
      case 'IN_PROGRESS': return FaTruck;
      case 'PENDING_PAYMENT': return FaExclamationTriangle;
      default: return FaClock;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4}>Loading your bookings...</Text>
      </Box>
    );
  }

  if (error || !bookings) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Text>Failed to load your bookings: {error}</Text>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={6}>
        <Heading size="lg" color="blue.600" mb={2}>
          My Bookings
        </Heading>
        <Text color="gray.600">
          Welcome back! Here's an overview of all your bookings with Speedy Van.
        </Text>
      </Box>

      {/* Statistics */}
      {stats && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Bookings</StatLabel>
                <StatNumber>{stats.totalBookings}</StatNumber>
                <StatHelpText>All time</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Completed</StatLabel>
                <StatNumber color="green.500">{stats.completedBookings}</StatNumber>
                <StatHelpText>Successfully completed</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Pending</StatLabel>
                <StatNumber color="orange.500">{stats.pendingBookings}</StatNumber>
                <StatHelpText>In progress</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Spent</StatLabel>
                <StatNumber color="blue.500">£{stats.totalSpent}</StatNumber>
                <StatHelpText>Completed bookings</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      {/* Unlinked Bookings Alert */}
      {bookings.unlinkedBookings.length > 0 && (
        <Alert status="info" borderRadius="md" mb={6}>
          <AlertIcon />
          <Box flex="1">
            <Text fontWeight="medium">
              We found {bookings.unlinkedBookings.length} booking{bookings.unlinkedBookings.length !== 1 ? 's' : ''} that might be yours!
            </Text>
            <Text fontSize="sm" mt={1}>
              These bookings were made before you created an account. Click the link button to connect them to your profile.
            </Text>
          </Box>
        </Alert>
      )}

      {/* Bookings Tabs */}
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>
            <HStack>
              <FaCheckCircle />
              <Text>Linked Bookings</Text>
              <Badge colorScheme="blue" variant="solid">
                {bookings.linkedBookings.length}
              </Badge>
            </HStack>
          </Tab>
          
          {bookings.unlinkedBookings.length > 0 && (
            <Tab>
              <HStack>
                <FaLink />
                <Text>Unlinked Bookings</Text>
                <Badge colorScheme="orange" variant="solid">
                  {bookings.unlinkedBookings.length}
                </Badge>
              </HStack>
            </Tab>
          )}

          <Tab>
            <HStack>
                              <FaFileAlt />
              <Text>Invoices</Text>
              <Badge colorScheme="green" variant="solid">
                {invoices.length}
              </Badge>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {/* Linked Bookings Tab */}
          <TabPanel>
            {bookings.linkedBookings.length === 0 ? (
              <Card>
                <CardBody textAlign="center" py={8}>
                  <FaHistory size={48} color="gray" />
                  <Text mt={4} fontSize="lg" color="gray.500">
                    No linked bookings yet
                  </Text>
                  <Text color="gray.400">
                    Your bookings will appear here once you make them or link existing ones.
                  </Text>
                </CardBody>
              </Card>
            ) : (
              <VStack spacing={4} align="stretch">
                {bookings.linkedBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    isLinked={true}
                    onLink={() => {}} // No action needed for linked bookings
                    linking={false}
                  />
                ))}
              </VStack>
            )}
          </TabPanel>

          {/* Unlinked Bookings Tab */}
          {bookings.unlinkedBookings.length > 0 && (
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {bookings.unlinkedBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    isLinked={false}
                    onLink={() => handleLinkBooking(booking.id)}
                    linking={linkingBookings.has(booking.id)}
                  />
                ))}
              </VStack>
            </TabPanel>
          )}

          {/* Invoices Tab */}
          <TabPanel>
            {invoicesLoading ? (
              <Card>
                <CardBody textAlign="center" py={8}>
                  <Spinner size="lg" />
                  <Text mt={4} color="gray.500">Loading invoices...</Text>
                </CardBody>
              </Card>
            ) : invoices.length === 0 ? (
              <Card>
                <CardBody textAlign="center" py={8}>
                  <FaFileAlt size={48} color="gray" />
                  <Text mt={4} fontSize="lg" color="gray.500">
                    No invoices yet
                  </Text>
                  <Text color="gray.400">
                    Your invoices will appear here after you complete a booking.
                  </Text>
                </CardBody>
              </Card>
            ) : (
              <VStack spacing={4} align="stretch">
                {invoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                  />
                ))}
              </VStack>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

interface BookingCardProps {
  booking: CustomerBooking;
  isLinked: boolean;
  onLink: () => void;
  linking: boolean;
}

function BookingCard({ booking, isLinked, onLink, linking }: BookingCardProps) {
  const { isOpen, onToggle } = useDisclosure();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'green';
      case 'CONFIRMED': return 'blue';
      case 'IN_PROGRESS': return 'orange';
      case 'PENDING_PAYMENT': return 'yellow';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return FaCheckCircle;
      case 'CONFIRMED': return FaClock;
      case 'IN_PROGRESS': return FaTruck;
      case 'PENDING_PAYMENT': return FaExclamationTriangle;
      default: return FaClock;
    }
  };

  return (
    <Card borderColor={isLinked ? 'blue.200' : 'orange.200'} borderWidth="2px">
      <CardHeader>
        <HStack justify="space-between">
          <HStack>
            <IconButton
              icon={<FaTruck />}
              aria-label="Booking"
              variant="ghost"
              colorScheme="blue"
              size="sm"
            />
            <VStack align="start" spacing={1}>
              {booking.unifiedBookingId && (
                <Text fontWeight="bold" fontSize="lg" color="blue.600">
                  {booking.unifiedBookingId}
                </Text>
              )}
              <Text fontWeight="bold" fontSize="md" color="gray.700">
                {booking.reference}
              </Text>
              <HStack>
                <Badge colorScheme={getStatusColor(booking.status)} variant="solid">
                  {booking.status.replace('_', ' ')}
                </Badge>
                {!isLinked && (
                  <Badge colorScheme="orange" variant="outline">
                    Unlinked
                  </Badge>
                )}
              </HStack>
            </VStack>
          </HStack>
          
          <HStack spacing={3}>
            <Badge colorScheme="blue" variant="solid" px={3} py={2}>
              £{booking.totalGBP}
            </Badge>
            
            {!isLinked && (
              <Button
                size="sm"
                colorScheme="orange"
                leftIcon={<FaLink />}
                onClick={onLink}
                isLoading={linking}
                loadingText="Linking..."
              >
                Link to Account
              </Button>
            )}
            
            <IconButton
              icon={<FaEye />}
              aria-label="View details"
              variant="ghost"
              size="sm"
              onClick={onToggle}
            />
          </HStack>
        </HStack>
      </CardHeader>

      <Collapse in={isOpen} animateOpacity>
        <CardBody pt={0}>
          <Divider mb={4} />
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {/* Addresses */}
            <Box>
              <Text fontWeight="semibold" mb={2} color="green.600">
                <FaMapMarkerAlt style={{ display: 'inline', marginRight: '8px' }} />
                Pickup Address
              </Text>
              <Text>{booking.pickupAddress.line1}</Text>
              <Text color="gray.600">
                {booking.pickupAddress.city}, {booking.pickupAddress.postcode}
              </Text>
            </Box>
            
            <Box>
              <Text fontWeight="semibold" mb={2} color="red.600">
                <FaMapMarkerAlt style={{ display: 'inline', marginRight: '8px' }} />
                Dropoff Address
              </Text>
              <Text>{booking.dropoffAddress.line1}</Text>
              <Text color="gray.600">
                {booking.dropoffAddress.city}, {booking.dropoffAddress.postcode}
              </Text>
            </Box>
          </SimpleGrid>

          {/* Schedule */}
          <Box mt={4}>
            <Text fontWeight="semibold" mb={2} color="purple.600">
              <FaCalendar style={{ display: 'inline', marginRight: '8px' }} />
              Schedule
            </Text>
            <HStack spacing={4}>
              <Text><strong>Date:</strong> {formatDate(booking.scheduledAt as any)}</Text>
              <Text><strong>Time:</strong> {formatTime(booking.scheduledAt as any)}</Text>
              <Text><strong>Created:</strong> {formatDate(booking.createdAt as any)}</Text>
              {booking.paidAt && (
                <Text><strong>Paid:</strong> {formatDate(booking.paidAt as any)}</Text>
              )}
            </HStack>
          </Box>

          {/* Items */}
          {booking.items.length > 0 && (
            <Box mt={4}>
              <Text fontWeight="semibold" mb={2} color="teal.600">
                <FaBoxes style={{ display: 'inline', marginRight: '8px' }} />
                Items ({booking.items.length})
              </Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2}>
                {booking.items.map((item, index) => (
                  <Box
                    key={index}
                    p={2}
                    bg="gray.50"
                    borderRadius="md"
                    fontSize="sm"
                  >
                    <Text fontWeight="medium">{item.name}</Text>
                    <Text color="gray.600">
                      Qty: {item.quantity} • {item.volumeM3} m³
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}
        </CardBody>
      </Collapse>
    </Card>
  );
}

interface InvoiceCardProps {
  invoice: any;
}

function InvoiceCard({ invoice }: InvoiceCardProps) {
  const { isOpen, onToggle } = useDisclosure();

  const downloadInvoice = async () => {
    try {
      const response = await fetch(`/api/customer/invoices/${invoice.id}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold" fontSize="lg" color="blue.600">
              {invoice.invoiceNumber}
            </Text>
            <Text fontWeight="bold" fontSize="md" color="gray.700">
              {invoice.pickupAddress} → {invoice.dropoffAddress}
            </Text>
            <Text color="gray.600" fontSize="sm">
              {formatDate(invoice.scheduledAt)}
            </Text>
          </VStack>
          
          <VStack align="end" spacing={2}>
            <Badge colorScheme="green" variant="solid" px={3} py={1}>
              £{(invoice.totalGBP / 100).toFixed(2)}
            </Badge>
            <HStack spacing={2}>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<FaDownload />}
                onClick={downloadInvoice}
              >
                Download PDF
              </Button>
              <IconButton
                icon={<FaEye />}
                aria-label="View details"
                variant="ghost"
                size="sm"
                onClick={onToggle}
              />
            </HStack>
          </VStack>
        </HStack>
      </CardHeader>

      <Collapse in={isOpen} animateOpacity>
        <CardBody pt={0}>
          <Divider mb={4} />
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box>
              <Text fontWeight="semibold" mb={2} color="green.600">
                <FaMapMarkerAlt style={{ display: 'inline', marginRight: '8px' }} />
                Pickup Address
              </Text>
              <Text>{invoice.pickupAddress}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="semibold" mb={2} color="red.600">
                <FaMapMarkerAlt style={{ display: 'inline', marginRight: '8px' }} />
                Dropoff Address
              </Text>
              <Text>{invoice.dropoffAddress}</Text>
            </Box>
          </SimpleGrid>

          <Box mt={4}>
            <Text fontWeight="semibold" mb={2} color="purple.600">
              <FaCalendar style={{ display: 'inline', marginRight: '8px' }} />
              Service Details
            </Text>
            <HStack spacing={4}>
              <Text><strong>Date:</strong> {formatDate(invoice.scheduledAt)}</Text>
              <Text><strong>Crew:</strong> {invoice.crewSize}</Text>
              <Text><strong>Paid:</strong> {formatDate(invoice.paidAt)}</Text>
            </HStack>
          </Box>

          <Box mt={4}>
            <Text fontWeight="semibold" mb={2} color="teal.600">
              <FaPoundSign style={{ display: 'inline', marginRight: '8px' }} />
              Price Breakdown
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
              <Text><strong>Distance:</strong> £{(invoice.distanceCostGBP / 100).toFixed(2)}</Text>
              <Text><strong>Access:</strong> £{(invoice.accessSurchargeGBP / 100).toFixed(2)}</Text>
              <Text><strong>Weather:</strong> £{(invoice.weatherSurchargeGBP / 100).toFixed(2)}</Text>
              <Text><strong>Items:</strong> £{(invoice.itemsSurchargeGBP / 100).toFixed(2)}</Text>
              <Text><strong>Crew:</strong> {invoice.crewMultiplierPercent > 0 ? '+' : ''}{invoice.crewMultiplierPercent}%</Text>
              <Text><strong>Availability:</strong> +{invoice.availabilityMultiplierPercent}%</Text>
            </SimpleGrid>
          </Box>
        </CardBody>
      </Collapse>
    </Card>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
