import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Collapse,
  useDisclosure,
  Button,
  Divider,
  SimpleGrid,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  Icon,
} from '@chakra-ui/react';
import {
  FaBell,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
  FaUser,
  FaMapMarkerAlt,
  FaCalendar,
  FaPoundSign,
  FaBoxes,
  FaPhone,
  FaEnvelope,
} from 'react-icons/fa';

interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  data: any;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] =
    useState<AdminNotification | null>(null);
  const { isOpen, onToggle } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/admin/notifications/${notificationId}/read`,
        {
          method: 'PUT',
        }
      );

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
        toast({
          title: 'Notification marked as read',
          status: 'success',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_booking':
        return FaBell;
      case 'payment_completed':
        return FaCheck;
      case 'booking_cancelled':
        return FaTimes;
      default:
        return FaBell;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4}>Loading notifications...</Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <HStack justify="space-between" mb={6}>
        <HStack>
          <IconButton
            icon={<FaBell />}
            aria-label="Notifications"
            variant="ghost"
            colorScheme="blue"
            size="lg"
          />
          <VStack align="start" spacing={1}>
            <Text fontSize="xl" fontWeight="bold">
              Admin Notifications
            </Text>
            <Text fontSize="sm" color="gray.600">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </Text>
          </VStack>
        </HStack>

        <Badge colorScheme="blue" variant="solid" px={3} py={2}>
          {notifications.length} total
        </Badge>
      </HStack>

      {notifications.length === 0 ? (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Text>No notifications to display</Text>
        </Alert>
      ) : (
        <VStack spacing={4} align="stretch">
          {notifications.map(notification => (
            <Box
              key={notification.id}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              borderColor={notification.isRead ? 'gray.200' : 'blue.300'}
              bg={notification.isRead ? 'gray.50' : 'blue.50'}
              position="relative"
            >
              {/* Notification Header */}
              <HStack justify="space-between" mb={3}>
                <HStack spacing={3}>
                  <Icon
                    as={getTypeIcon(notification.type)}
                    color={`${getPriorityColor(notification.priority)}.500`}
                    boxSize={5}
                  />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="semibold" fontSize="md">
                      {notification.title}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {formatDate(notification.createdAt)}
                    </Text>
                  </VStack>
                </HStack>

                <HStack spacing={2}>
                  <Badge colorScheme={getPriorityColor(notification.priority)}>
                    {notification.priority}
                  </Badge>
                  {!notification.isRead && (
                    <Badge colorScheme="blue" variant="solid">
                      New
                    </Badge>
                  )}
                </HStack>
              </HStack>

              {/* Notification Message */}
              <Text fontSize="sm" color="gray.700" mb={3}>
                {notification.message}
              </Text>

              {/* Action Buttons */}
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<FaEye />}
                    onClick={() => {
                      setSelectedNotification(notification);
                      onToggle();
                    }}
                  >
                    View Details
                  </Button>

                  {!notification.isRead && (
                    <Button
                      size="sm"
                      colorScheme="blue"
                      leftIcon={<FaCheck />}
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </HStack>

                {notification.actionUrl && (
                  <Button
                    size="sm"
                    colorScheme="green"
                    variant="outline"
                    onClick={() =>
                      window.open(notification.actionUrl, '_blank')
                    }
                  >
                    View Booking
                  </Button>
                )}
              </HStack>
            </Box>
          ))}
        </VStack>
      )}

      {/* Detailed Notification View */}
      <Collapse in={isOpen} animateOpacity>
        {selectedNotification && (
          <Box
            mt={6}
            p={6}
            borderWidth="2px"
            borderRadius="xl"
            borderColor="blue.300"
            bg="blue.50"
          >
            <HStack justify="space-between" mb={4}>
              <Text fontSize="lg" fontWeight="bold" color="blue.700">
                Booking Details - {selectedNotification.data?.reference}
              </Text>
              <IconButton
                icon={<FaTimes />}
                aria-label="Close details"
                variant="ghost"
                onClick={onToggle}
              />
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* Customer Information */}
              <Box>
                <HStack mb={3}>
                  <Icon as={FaUser} color="blue.500" />
                  <Text fontWeight="semibold">Customer Information</Text>
                </HStack>
                <VStack align="start" spacing={2} fontSize="sm">
                  <HStack>
                    <Icon as={FaUser} color="gray.500" boxSize={4} />
                    <Text>
                      <strong>Name:</strong>{' '}
                      {selectedNotification.data?.customer?.name}
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaEnvelope} color="gray.500" boxSize={4} />
                    <Text>
                      <strong>Email:</strong>{' '}
                      {selectedNotification.data?.customer?.email}
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaPhone} color="gray.500" boxSize={4} />
                    <Text>
                      <strong>Phone:</strong>{' '}
                      {selectedNotification.data?.customer?.phone}
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              {/* Addresses */}
              <Box>
                <HStack mb={3}>
                  <Icon as={FaMapMarkerAlt} color="green.500" />
                  <Text fontWeight="semibold">Addresses</Text>
                </HStack>
                <VStack align="start" spacing={2} fontSize="sm">
                  <Box>
                    <Text fontWeight="medium" color="green.600">
                      Pickup:
                    </Text>
                    <Text>
                      {selectedNotification.data?.addresses?.pickup?.line1}
                    </Text>
                    <Text color="gray.600">
                      {selectedNotification.data?.addresses?.pickup?.city},{' '}
                      {selectedNotification.data?.addresses?.pickup?.postcode}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" color="red.600">
                      Dropoff:
                    </Text>
                    <Text>
                      {selectedNotification.data?.addresses?.dropoff?.line1}
                    </Text>
                    <Text color="gray.600">
                      {selectedNotification.data?.addresses?.dropoff?.city},{' '}
                      {selectedNotification.data?.addresses?.dropoff?.postcode}
                    </Text>
                  </Box>
                </VStack>
              </Box>

              {/* Schedule */}
              <Box>
                <HStack mb={3}>
                  <Icon as={FaCalendar} color="purple.500" />
                  <Text fontWeight="semibold">Schedule</Text>
                </HStack>
                <VStack align="start" spacing={2} fontSize="sm">
                  <Text>
                    <strong>Date:</strong>{' '}
                    {new Date(
                      selectedNotification.data?.schedule?.date
                    ).toLocaleDateString('en-GB')}
                  </Text>
                  <Text>
                    <strong>Time:</strong>{' '}
                    {selectedNotification.data?.schedule?.timeSlot}
                  </Text>
                </VStack>
              </Box>

              {/* Pricing */}
              <Box>
                <HStack mb={3}>
                  <Icon as={FaPoundSign} color="orange.500" />
                  <Text fontWeight="semibold">Pricing</Text>
                </HStack>
                <VStack align="start" spacing={2} fontSize="sm">
                  <Text>
                    <strong>Total:</strong> £
                    {selectedNotification.data?.pricing?.total}
                  </Text>
                  <Text>
                    <strong>Base Price:</strong> £
                    {selectedNotification.data?.pricing?.breakdown?.basePrice}
                  </Text>
                  <Text>
                    <strong>VAT:</strong> £
                    {selectedNotification.data?.pricing?.breakdown?.vat}
                  </Text>
                </VStack>
              </Box>

              {/* Items */}
              {selectedNotification.data?.items &&
                selectedNotification.data.items.length > 0 && (
                  <Box gridColumn={{ base: 1, md: 'span 2' }}>
                    <HStack mb={3}>
                      <Icon as={FaBoxes} color="teal.500" />
                      <Text fontWeight="semibold">Items to Move</Text>
                    </HStack>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                      {selectedNotification.data.items.map(
                        (item: any, index: number) => (
                          <Box
                            key={index}
                            p={3}
                            bg="white"
                            borderRadius="md"
                            borderWidth="1px"
                            borderColor="gray.200"
                          >
                            <Text fontWeight="medium">{item.name}</Text>
                            <Text fontSize="sm" color="gray.600">
                              Qty: {item.quantity} • Volume: {item.volumeM3} m³
                            </Text>
                          </Box>
                        )
                      )}
                    </SimpleGrid>
                  </Box>
                )}
            </SimpleGrid>

            <Divider my={4} />

            {/* Payment Information */}
            {selectedNotification.data?.payment && (
              <Box>
                <Text fontWeight="semibold" mb={3}>
                  Payment Information
                </Text>
                <SimpleGrid
                  columns={{ base: 1, md: 2 }}
                  spacing={4}
                  fontSize="sm"
                >
                  <Text>
                    <strong>Stripe Session ID:</strong>{' '}
                    {selectedNotification.data.payment.stripeSessionId}
                  </Text>
                  <Text>
                    <strong>Payment Intent ID:</strong>{' '}
                    {selectedNotification.data.payment.stripePaymentIntentId}
                  </Text>
                  <Text>
                    <strong>Amount:</strong> £
                    {(selectedNotification.data.payment.amount / 100).toFixed(
                      2
                    )}
                  </Text>
                  <Text>
                    <strong>Currency:</strong>{' '}
                    {selectedNotification.data.payment.currency?.toUpperCase()}
                  </Text>
                </SimpleGrid>
              </Box>
            )}
          </Box>
        )}
      </Collapse>
    </Box>
  );
}
