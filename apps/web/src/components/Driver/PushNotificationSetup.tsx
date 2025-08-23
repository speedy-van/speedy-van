'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Spinner,
} from '@chakra-ui/react';
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getPushSubscriptionStatus,
  isPushNotificationSupported,
} from '@/lib/push-notifications';

export default function PushNotificationSetup() {
  const [status, setStatus] = useState<{
    supported: boolean;
    enabled: boolean;
    subscribed: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const toast = useToast();

  const checkStatus = async () => {
    try {
      setIsLoading(true);
      const currentStatus = await getPushSubscriptionStatus();
      setStatus(currentStatus);
    } catch (error) {
      console.error('Error checking push notification status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setIsSubscribing(true);
      const subscription = await subscribeToPushNotifications();
      
      if (subscription) {
        toast({
          title: 'Success',
          description: 'Push notifications enabled successfully',
          status: 'success',
        });
        await checkStatus();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to enable push notifications',
          status: 'error',
        });
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to enable push notifications',
        status: 'error',
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setIsUnsubscribing(true);
      const success = await unsubscribeFromPushNotifications();
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Push notifications disabled successfully',
          status: 'success',
        });
        await checkStatus();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to disable push notifications',
          status: 'error',
        });
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to disable push notifications',
        status: 'error',
      });
    } finally {
      setIsUnsubscribing(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (isLoading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner size="lg" />
      </Box>
    );
  }

  if (!status) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to check push notification status
        </AlertDescription>
      </Alert>
    );
  }

  if (!status.supported) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>Not Supported</AlertTitle>
        <AlertDescription>
          Push notifications are not supported in this browser
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <Box>
          <Heading size="md" mb={2}>Push Notifications</Heading>
          <Text color="gray.600">
            Get instant notifications about new job offers, updates, and messages.
          </Text>
        </Box>

        <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="semibold">Status</Text>
              <HStack spacing={2}>
                <Badge
                  colorScheme={status.enabled ? 'green' : 'red'}
                  size="sm"
                >
                  {status.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
                {status.subscribed && (
                  <Badge colorScheme="blue" size="sm">
                    Subscribed
                  </Badge>
                )}
              </HStack>
            </HStack>

            {!status.enabled && (
              <Alert status="warning" size="sm">
                <AlertIcon />
                <AlertDescription>
                  Browser notifications are disabled. Please enable them in your browser settings.
                </AlertDescription>
              </Alert>
            )}

            {status.enabled && !status.subscribed && (
              <Alert status="info" size="sm">
                <AlertIcon />
                <AlertDescription>
                  Enable push notifications to get instant updates about new jobs and messages.
                </AlertDescription>
              </Alert>
            )}

            {status.enabled && status.subscribed && (
              <Alert status="success" size="sm">
                <AlertIcon />
                <AlertDescription>
                  Push notifications are enabled and working. You'll receive instant updates.
                </AlertDescription>
              </Alert>
            )}

            <HStack spacing={3}>
              {status.enabled && !status.subscribed && (
                <Button
                  colorScheme="blue"
                  onClick={handleSubscribe}
                  isLoading={isSubscribing}
                  loadingText="Enabling..."
                >
                  Enable Push Notifications
                </Button>
              )}

              {status.enabled && status.subscribed && (
                <Button
                  variant="outline"
                  onClick={handleUnsubscribe}
                  isLoading={isUnsubscribing}
                  loadingText="Disabling..."
                >
                  Disable Push Notifications
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={checkStatus}
                size="sm"
              >
                Refresh Status
              </Button>
            </HStack>
          </VStack>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.600">
            <strong>What you'll receive:</strong> New job offers, job updates, messages from customers, 
            payout confirmations, and important system alerts.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
