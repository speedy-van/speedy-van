'use client';

import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverHeader,
  PopoverCloseButton,
  VStack,
  HStack,
  Text,
  Box,
  Button,
  useToast,
  Spinner,
  Divider,
} from '@chakra-ui/react';
import { BellIcon } from '@chakra-ui/icons';
import { useRealtime } from '@/lib/realtime';

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

interface NotificationBellProps {
  driverId: string;
}

export default function NotificationBell({ driverId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();

  // Initialize realtime connection
  useRealtime({
    driverId,
    onNotificationReceived: (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        status: 'info',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    },
  });

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/driver/notifications?limit=10');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
            read: notificationIds ? 
              (notificationIds.includes(notification.id) ? true : notification.read) :
              true,
            readAt: notificationIds ? 
              (notificationIds.includes(notification.id) ? new Date().toISOString() : notification.readAt) :
              new Date().toISOString(),
          }))
        );
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead([notification.id]);
    }
    
    // Handle navigation based on notification type
    if (notification.data?.jobId) {
      window.location.href = `/driver/jobs/${notification.data.jobId}`;
    } else if (notification.type === 'message_received') {
      window.location.href = '/driver/jobs/active';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
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
      case 'message_received':
        return '💬';
      case 'payout_processed':
        return '💰';
      case 'document_expiry':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  return (
    <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative">
          <IconButton
            aria-label="Notifications"
            size="sm"
            variant="ghost"
            icon={<BellIcon />}
            onClick={() => setIsOpen(!isOpen)}
          />
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              colorScheme="red"
              borderRadius="full"
              minW="20px"
              h="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent width="400px" maxH="500px">
        <PopoverHeader>
          <HStack justify="space-between">
            <Text fontWeight="bold">Notifications</Text>
            {unreadCount > 0 && (
              <Button
                size="xs"
                variant="ghost"
                onClick={() => markAsRead()}
              >
                Mark all read
              </Button>
            )}
          </HStack>
        </PopoverHeader>
        <PopoverCloseButton />
        <PopoverBody p={0}>
          {isLoading ? (
            <Box p={4} textAlign="center">
              <Spinner />
            </Box>
          ) : notifications.length === 0 ? (
            <Box p={4} textAlign="center">
              <Text color="gray.500">No notifications</Text>
            </Box>
          ) : (
            <VStack spacing={0} maxH="400px" overflowY="auto">
              {notifications.map((notification, index) => (
                <Box
                  key={notification.id}
                  w="100%"
                  p={3}
                  cursor="pointer"
                  bg={notification.read ? 'transparent' : 'blue.50'}
                  _hover={{ bg: notification.read ? 'gray.50' : 'blue.100' }}
                  onClick={() => handleNotificationClick(notification)}
                  borderBottom={index < notifications.length - 1 ? '1px solid' : 'none'}
                  borderColor="gray.100"
                >
                  <HStack spacing={3} align="start">
                    <Text fontSize="lg">{getNotificationIcon(notification.type)}</Text>
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontWeight="semibold" fontSize="sm">
                        {notification.title}
                      </Text>
                      <Text fontSize="xs" color="gray.600" noOfLines={2}>
                        {notification.message}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {formatTimeAgo(notification.createdAt)}
                      </Text>
                    </VStack>
                    {!notification.read && (
                      <Box
                        w={2}
                        h={2}
                        bg="blue.500"
                        borderRadius="full"
                        flexShrink={0}
                      />
                    )}
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
          {notifications.length > 0 && (
            <Box p={3} borderTop="1px solid" borderColor="gray.100">
              <Button
                size="sm"
                variant="ghost"
                w="100%"
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/driver/notifications';
                }}
              >
                View all notifications
              </Button>
            </Box>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
