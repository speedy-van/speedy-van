'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  useToast,
  Spinner,
  Badge,
  Select,
  Flex,
  Divider,
  IconButton,
} from '@chakra-ui/react';
import { ChevronLeftIcon, CheckIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );
  const toast = useToast();
  const router = useRouter();

  const fetchNotifications = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (showUnreadOnly) {
        params.append('unread', 'true');
      }

      if (selectedType) {
        params.append('type', selectedType);
      }

      const response = await fetch(`/api/driver/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setPagination(data.pagination);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationIds?: string[]) => {
    try {
      const response = await fetch('/api/driver/notifications/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationIds,
          markAllAsRead: !notificationIds,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);

        // Update notifications to mark them as read
        setNotifications(prev =>
          prev.map(notification => ({
            ...notification,
            read: notificationIds
              ? notificationIds.includes(notification.id)
                ? true
                : notification.read
              : true,
            readAt: notificationIds
              ? notificationIds.includes(notification.id)
                ? new Date().toISOString()
                : notification.readAt
              : new Date().toISOString(),
          }))
        );

        setSelectedNotifications([]);

        toast({
          title: 'Success',
          description: 'Notifications marked as read',
          status: 'success',
        });
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        status: 'error',
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead([notification.id]);
    }

    // Handle navigation based on notification type
    if (notification.data?.jobId) {
      router.push(`/driver/jobs/${notification.data.jobId}`);
    } else if (notification.type === 'message_received') {
      router.push('/driver/jobs/active');
    }
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_offer':
        return '🚚';
      case 'job_update':
        return '📝';
      case 'job_cancelled':
        return '❌';
      case 'job_completed':
        return '✅';
      case 'message_received':
        return '💬';
      case 'payout_processed':
        return '💰';
      case 'payout_failed':
        return '💸';
      case 'document_expiry':
        return '⚠️';
      case 'system_alert':
        return '🚨';
      case 'performance_update':
        return '📊';
      case 'incident_reported':
        return '🚨';
      default:
        return '🔔';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'job_offer':
        return 'Job Offer';
      case 'job_update':
        return 'Job Update';
      case 'job_cancelled':
        return 'Job Cancelled';
      case 'job_completed':
        return 'Job Completed';
      case 'message_received':
        return 'Message';
      case 'payout_processed':
        return 'Payout';
      case 'payout_failed':
        return 'Payout Failed';
      case 'document_expiry':
        return 'Document';
      case 'system_alert':
        return 'System Alert';
      case 'performance_update':
        return 'Performance';
      case 'incident_reported':
        return 'Incident';
      default:
        return type;
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [selectedType, showUnreadOnly]);

  return (
    <Container maxW="800px" py={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <HStack spacing={4}>
            <IconButton
              aria-label="Back"
              icon={<ChevronLeftIcon />}
              variant="ghost"
              onClick={() => router.back()}
            />
            <VStack align="start" spacing={0}>
              <Heading size="lg">Notifications</Heading>
              <Text color="gray.600">
                {unreadCount} unread • {pagination?.total || 0} total
              </Text>
            </VStack>
          </HStack>
          {unreadCount > 0 && (
            <Button
              leftIcon={<CheckIcon />}
              size="sm"
              onClick={() => markAsRead()}
            >
              Mark all read
            </Button>
          )}
        </HStack>

        {/* Filters */}
        <HStack spacing={4}>
          <Select
            placeholder="All types"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            maxW="200px"
          >
            <option value="job_offer">Job Offers</option>
            <option value="job_update">Job Updates</option>
            <option value="message_received">Messages</option>
            <option value="payout_processed">Payouts</option>
            <option value="document_expiry">Documents</option>
            <option value="system_alert">System Alerts</option>
          </Select>
          <Button
            variant={showUnreadOnly ? 'solid' : 'outline'}
            size="sm"
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          >
            Unread only
          </Button>
        </HStack>

        {/* Notifications List */}
        {isLoading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="lg" />
          </Box>
        ) : notifications.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Text color="gray.500" fontSize="lg">
              No notifications found
            </Text>
          </Box>
        ) : (
          <VStack spacing={0} align="stretch">
            {selectedNotifications.length > 0 && (
              <Box p={3} bg="blue.50" borderRadius="md" mb={4}>
                <HStack justify="space-between">
                  <Text fontSize="sm">
                    {selectedNotifications.length} notification(s) selected
                  </Text>
                  <Button
                    size="sm"
                    leftIcon={<CheckIcon />}
                    onClick={() => markAsRead(selectedNotifications)}
                  >
                    Mark as read
                  </Button>
                </HStack>
              </Box>
            )}

            {notifications.map((notification, index) => (
              <Box
                key={notification.id}
                p={4}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                bg={notification.read ? 'white' : 'blue.50'}
                cursor="pointer"
                _hover={{ bg: notification.read ? 'gray.50' : 'blue.100' }}
                onClick={() => handleNotificationClick(notification)}
                position="relative"
              >
                <HStack spacing={3} align="start">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={e => {
                      e.stopPropagation();
                      handleSelectNotification(notification.id);
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                  <Text fontSize="xl">
                    {getNotificationIcon(notification.type)}
                  </Text>
                  <VStack align="start" spacing={2} flex={1}>
                    <HStack justify="space-between" w="100%">
                      <Text fontWeight="semibold">{notification.title}</Text>
                      <HStack spacing={2}>
                        <Badge colorScheme="blue" size="sm">
                          {getTypeLabel(notification.type)}
                        </Badge>
                        {!notification.read && (
                          <Badge colorScheme="red" size="sm">
                            New
                          </Badge>
                        )}
                      </HStack>
                    </HStack>
                    <Text color="gray.600">{notification.message}</Text>
                    <Text fontSize="xs" color="gray.400">
                      {formatTimeAgo(notification.createdAt)}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            ))}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <HStack justify="center" spacing={2} pt={4}>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={pagination.page === 1}
                  onClick={() => fetchNotifications(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Text fontSize="sm">
                  Page {pagination.page} of {pagination.pages}
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={pagination.page === pagination.pages}
                  onClick={() => fetchNotifications(pagination.page + 1)}
                >
                  Next
                </Button>
              </HStack>
            )}
          </VStack>
        )}
      </VStack>
    </Container>
  );
}
