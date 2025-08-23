'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  Divider,
  useToast,
  Spinner,
  Button,
} from '@chakra-ui/react';

interface NotificationPreferences {
  id: string;
  driverId: string;
  pushJobOffers: boolean;
  pushJobUpdates: boolean;
  pushMessages: boolean;
  pushScheduleChanges: boolean;
  pushPayoutEvents: boolean;
  pushSystemAlerts: boolean;
  emailJobOffers: boolean;
  emailJobUpdates: boolean;
  emailMessages: boolean;
  emailScheduleChanges: boolean;
  emailPayoutEvents: boolean;
  emailSystemAlerts: boolean;
  smsJobOffers: boolean;
  smsJobUpdates: boolean;
  smsMessages: boolean;
  smsScheduleChanges: boolean;
  smsPayoutEvents: boolean;
  smsSystemAlerts: boolean;
}

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/driver/settings/notification-preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    try {
      setIsSaving(true);
      const response = await fetch('/api/driver/settings/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Notification preferences saved',
          status: 'success',
        });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        status: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (!preferences) return;
    setPreferences(prev => prev ? { ...prev, [key]: !prev[key] } : null);
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
      </Box>
    );
  }

  if (!preferences) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">Failed to load notification preferences</Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={2}>Notification Preferences</Heading>
          <Text color="gray.600">
            Choose how you want to receive notifications about jobs, messages, and updates.
          </Text>
        </Box>

        {/* Push Notifications */}
        <Box>
          <Heading size="sm" mb={4}>Push Notifications</Heading>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={1}>Job Offers</FormLabel>
                  <FormHelperText>Get notified when new jobs are available</FormHelperText>
                </Box>
                <Switch
                  isChecked={preferences.pushJobOffers}
                  onChange={() => handleToggle('pushJobOffers')}
                />
              </HStack>
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={1}>Job Updates</FormLabel>
                  <FormHelperText>Updates about your active jobs</FormHelperText>
                </Box>
                <Switch
                  isChecked={preferences.pushJobUpdates}
                  onChange={() => handleToggle('pushJobUpdates')}
                />
              </HStack>
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={1}>Messages</FormLabel>
                  <FormHelperText>New messages from customers or support</FormHelperText>
                </Box>
                <Switch
                  isChecked={preferences.pushMessages}
                  onChange={() => handleToggle('pushMessages')}
                />
              </HStack>
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={1}>Schedule Changes</FormLabel>
                  <FormHelperText>Changes to your scheduled jobs</FormHelperText>
                </Box>
                <Switch
                  isChecked={preferences.pushScheduleChanges}
                  onChange={() => handleToggle('pushScheduleChanges')}
                />
              </HStack>
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={1}>Payout Events</FormLabel>
                  <FormHelperText>Payout confirmations and issues</FormHelperText>
                </Box>
                <Switch
                  isChecked={preferences.pushPayoutEvents}
                  onChange={() => handleToggle('pushPayoutEvents')}
                />
              </HStack>
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={1}>System Alerts</FormLabel>
                  <FormHelperText>Important system updates and alerts</FormHelperText>
                </Box>
                <Switch
                  isChecked={preferences.pushSystemAlerts}
                  onChange={() => handleToggle('pushSystemAlerts')}
                />
              </HStack>
            </FormControl>
          </VStack>
        </Box>

        <Divider />

        {/* Email Notifications */}
        <Box>
          <Heading size="sm" mb={4}>Email Notifications</Heading>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={1}>Job Offers</FormLabel>
                  <FormHelperText>Email notifications for new jobs</FormHelperText>
                </Box>
                <Switch
                  isChecked={preferences.emailJobOffers}
                  onChange={() => handleToggle('emailJobOffers')}
                />
              </HStack>
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={1}>Job Updates</FormLabel>
                  <FormHelperText>Email updates about your jobs</FormHelperText>
                </Box>
                <Switch
                  isChecked={preferences.emailJobUpdates}
                  onChange={() => handleToggle('emailJobUpdates')}
                />
              </HStack>
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={1}>Messages</FormLabel>
                  <FormHelperText>Email notifications for new messages</FormHelperText>
                </Box>
                <Switch
                  isChecked={preferences.emailMessages}
                  onChange={() => handleToggle('emailMessages')}
                />
              </HStack>
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={1}>Schedule Changes</FormLabel>
                  <FormHelperText>Email notifications for schedule changes</FormHelperText>
                </Box>
                <Switch
                  isChecked={preferences.emailScheduleChanges}
                  onChange={() => handleToggle('emailScheduleChanges')}
                />
              </HStack>
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={1}>Payout Events</FormLabel>
                  <FormHelperText>Email confirmations for payouts</FormHelperText>
                </Box>
                <Switch
                  isChecked={preferences.emailPayoutEvents}
                  onChange={() => handleToggle('emailPayoutEvents')}
                />
              </HStack>
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={1}>System Alerts</FormLabel>
                  <FormHelperText>Important system updates via email</FormHelperText>
                </Box>
                <Switch
                  isChecked={preferences.emailSystemAlerts}
                  onChange={() => handleToggle('emailSystemAlerts')}
                />
              </HStack>
            </FormControl>
          </VStack>
        </Box>

        <Divider />

        {/* SMS Notifications */}
        <Box>
          <Heading size="sm" mb={4}>SMS Notifications</Heading>
          <Text color="gray.600" mb={4}>
            SMS notifications are currently disabled. This feature will be available soon.
          </Text>
          <VStack spacing={4} align="stretch" opacity={0.5}>
            <FormControl isDisabled>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={1}>Job Offers</FormLabel>
                  <FormHelperText>SMS notifications for new jobs</FormHelperText>
                </Box>
                <Switch isChecked={false} />
              </HStack>
            </FormControl>

            <FormControl isDisabled>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={1}>Job Updates</FormLabel>
                  <FormHelperText>SMS updates about your jobs</FormHelperText>
                </Box>
                <Switch isChecked={false} />
              </HStack>
            </FormControl>

            <FormControl isDisabled>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={1}>Messages</FormLabel>
                  <FormHelperText>SMS notifications for new messages</FormHelperText>
                </Box>
                <Switch isChecked={false} />
              </HStack>
            </FormControl>

            <FormControl isDisabled>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={1}>Schedule Changes</FormLabel>
                  <FormHelperText>SMS notifications for schedule changes</FormHelperText>
                </Box>
                <Switch isChecked={false} />
              </HStack>
            </FormControl>

            <FormControl isDisabled>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={1}>Payout Events</FormLabel>
                  <FormHelperText>SMS confirmations for payouts</FormHelperText>
                </Box>
                <Switch isChecked={false} />
              </HStack>
            </FormControl>

            <FormControl isDisabled>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={1}>System Alerts</FormLabel>
                  <FormHelperText>Important system updates via SMS</FormHelperText>
                </Box>
                <Switch isChecked={false} />
              </HStack>
            </FormControl>
          </VStack>
        </Box>

        <Button
          colorScheme="blue"
          onClick={savePreferences}
          isLoading={isSaving}
          loadingText="Saving..."
        >
          Save Preferences
        </Button>
      </VStack>
    </Box>
  );
}
