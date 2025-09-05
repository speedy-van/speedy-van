'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Heading,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Divider,
  useToast,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
} from '@chakra-ui/react';
import {
  FiWifiOff,
  FiWifi,
  FiRefreshCw,
  FiSettings,
  FiClock,
  FiCheck,
  FiX,
  FiTrash2,
  FiInfo,
  FiAlertTriangle,
  FiDatabase,
  FiSmartphone,
} from 'react-icons/fi';
import { useOfflineState, offlineManager } from '@/lib/offline';

export default function OfflineSettingsPage() {
  const state = useOfflineState();
  const [settings, setSettings] = useState({
    autoSync: true,
    syncOnConnect: true,
    maxRetries: 3,
    syncInterval: 30,
    enableBackgroundSync: true,
    cacheJobData: true,
    cacheLocationData: true,
  });
  const [loading, setLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('driver-offline-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem(
      'driver-offline-settings',
      JSON.stringify(newSettings)
    );
    toast({
      title: 'Settings Saved',
      description: 'Your offline settings have been updated',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleManualSync = async () => {
    setLoading(true);
    setSyncProgress(0);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      await offlineManager.syncPendingActions();

      clearInterval(interval);
      setSyncProgress(100);

      toast({
        title: 'Sync Complete',
        description: 'All pending actions have been synchronized',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: 'Failed to synchronize pending actions',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setTimeout(() => setSyncProgress(0), 1000);
    }
  };

  const clearAllActions = async () => {
    try {
      await offlineManager.clearAllActions();
      toast({
        title: 'Actions Cleared',
        description: 'All pending actions have been cleared',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear actions',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getActionTypeStats = () => {
    const stats = {
      job_progress: 0,
      location_update: 0,
      availability_update: 0,
      job_claim: 0,
      job_decline: 0,
    };

    state.pendingActions.forEach(action => {
      stats[action.type]++;
    });

    return stats;
  };

  const actionStats = getActionTypeStats();

  return (
    <Box p={6} maxW="4xl" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Offline Settings
          </Heading>
          <Text color="gray.600">
            Manage how the app behaves when you're offline and configure
            synchronization preferences.
          </Text>
        </Box>

        {/* Connection Status */}
        <Card>
          <CardBody>
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={2}>
                <HStack>
                  <Box
                    w={3}
                    h={3}
                    borderRadius="full"
                    bg={state.isOnline ? 'green.500' : 'red.500'}
                  />
                  <Text fontWeight="medium">
                    {state.isOnline ? 'Connected' : 'Offline'}
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  {state.isOnline
                    ? 'All systems are online and working normally'
                    : "You're currently offline. Actions will be queued for later."}
                </Text>
              </VStack>

              <VStack align="end" spacing={2}>
                <Badge
                  colorScheme={
                    state.pendingActions.length > 0 ? 'orange' : 'green'
                  }
                >
                  {state.pendingActions.length} Pending Actions
                </Badge>
                {state.syncInProgress && (
                  <HStack>
                    <Spinner size="sm" />
                    <Text fontSize="sm">Syncing...</Text>
                  </HStack>
                )}
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Pending Actions Summary */}
        {state.pendingActions.length > 0 && (
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Heading size="md">Pending Actions</Heading>
                  <HStack>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      leftIcon={<FiRefreshCw />}
                      onClick={handleManualSync}
                      isLoading={loading}
                      loadingText="Syncing..."
                    >
                      Sync Now
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      leftIcon={<FiTrash2 />}
                      onClick={onOpen}
                    >
                      Clear All
                    </Button>
                  </HStack>
                </HStack>

                {loading && (
                  <Box>
                    <Text fontSize="sm" mb={2}>
                      Sync Progress
                    </Text>
                    <Progress
                      value={syncProgress}
                      colorScheme="blue"
                      size="sm"
                    />
                  </Box>
                )}

                <StatGroup>
                  <Stat>
                    <StatLabel>Job Progress</StatLabel>
                    <StatNumber>{actionStats.job_progress}</StatNumber>
                    <StatHelpText>Steps to complete</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Location Updates</StatLabel>
                    <StatNumber>{actionStats.location_update}</StatNumber>
                    <StatHelpText>GPS coordinates</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Availability</StatLabel>
                    <StatNumber>{actionStats.availability_update}</StatNumber>
                    <StatHelpText>Status changes</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Job Actions</StatLabel>
                    <StatNumber>
                      {actionStats.job_claim + actionStats.job_decline}
                    </StatNumber>
                    <StatHelpText>Claims & declines</StatHelpText>
                  </Stat>
                </StatGroup>

                <Accordion allowToggle>
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="medium">View All Actions</Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel>
                      <VStack
                        align="stretch"
                        spacing={2}
                        maxH="300px"
                        overflowY="auto"
                      >
                        {state.pendingActions.map(action => (
                          <HStack
                            key={action.id}
                            p={3}
                            bg="gray.50"
                            borderRadius="md"
                            justify="space-between"
                          >
                            <VStack align="start" spacing={1} flex={1}>
                              <Text fontSize="sm" fontWeight="medium">
                                {action.type.replace('_', ' ').toUpperCase()}
                              </Text>
                              <Text fontSize="xs" color="gray.600">
                                {new Date(action.timestamp).toLocaleString()}
                              </Text>
                            </VStack>
                            <HStack spacing={2}>
                              {action.retryCount > 0 && (
                                <Badge size="sm" colorScheme="red">
                                  Retry {action.retryCount}/{action.maxRetries}
                                </Badge>
                              )}
                              <Badge size="sm" colorScheme="gray">
                                {action.type}
                              </Badge>
                            </HStack>
                          </HStack>
                        ))}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Settings */}
        <Card>
          <CardBody>
            <VStack align="stretch" spacing={6}>
              <Heading size="md">Synchronization Settings</Heading>

              <FormControl>
                <FormLabel>Auto-sync when online</FormLabel>
                <Switch
                  isChecked={settings.autoSync}
                  onChange={e =>
                    saveSettings({ ...settings, autoSync: e.target.checked })
                  }
                />
                <FormHelperText>
                  Automatically sync pending actions when connection is restored
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Background sync</FormLabel>
                <Switch
                  isChecked={settings.enableBackgroundSync}
                  onChange={e =>
                    saveSettings({
                      ...settings,
                      enableBackgroundSync: e.target.checked,
                    })
                  }
                />
                <FormHelperText>
                  Allow the app to sync in the background when not actively
                  using it
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Cache job data</FormLabel>
                <Switch
                  isChecked={settings.cacheJobData}
                  onChange={e =>
                    saveSettings({
                      ...settings,
                      cacheJobData: e.target.checked,
                    })
                  }
                />
                <FormHelperText>
                  Store job details locally for offline viewing
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Cache location data</FormLabel>
                <Switch
                  isChecked={settings.cacheLocationData}
                  onChange={e =>
                    saveSettings({
                      ...settings,
                      cacheLocationData: e.target.checked,
                    })
                  }
                />
                <FormHelperText>
                  Store recent location data for offline navigation
                </FormHelperText>
              </FormControl>

              <Divider />

              <Heading size="md">Advanced Settings</Heading>

              <FormControl>
                <FormLabel>Maximum retry attempts</FormLabel>
                <HStack>
                  <Button
                    size="sm"
                    onClick={() =>
                      saveSettings({
                        ...settings,
                        maxRetries: Math.max(1, settings.maxRetries - 1),
                      })
                    }
                  >
                    -
                  </Button>
                  <Text>{settings.maxRetries}</Text>
                  <Button
                    size="sm"
                    onClick={() =>
                      saveSettings({
                        ...settings,
                        maxRetries: Math.min(10, settings.maxRetries + 1),
                      })
                    }
                  >
                    +
                  </Button>
                </HStack>
                <FormHelperText>
                  Number of times to retry failed actions before giving up
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Sync interval (seconds)</FormLabel>
                <HStack>
                  <Button
                    size="sm"
                    onClick={() =>
                      saveSettings({
                        ...settings,
                        syncInterval: Math.max(10, settings.syncInterval - 10),
                      })
                    }
                  >
                    -
                  </Button>
                  <Text>{settings.syncInterval}s</Text>
                  <Button
                    size="sm"
                    onClick={() =>
                      saveSettings({
                        ...settings,
                        syncInterval: Math.min(300, settings.syncInterval + 10),
                      })
                    }
                  >
                    +
                  </Button>
                </HStack>
                <FormHelperText>
                  How often to attempt syncing when offline (minimum 10s,
                  maximum 5m)
                </FormHelperText>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Information */}
        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">How Offline Mode Works</Heading>

              <List spacing={3}>
                <ListItem display="flex" alignItems="start">
                  <ListIcon as={FiWifiOff} color="red.500" mt={1} />
                  <Box>
                    <Text fontWeight="medium">When You're Offline</Text>
                    <Text fontSize="sm" color="gray.600">
                      Actions like completing job steps, updating location, and
                      claiming jobs are stored locally and will sync when you're
                      back online.
                    </Text>
                  </Box>
                </ListItem>

                <ListItem display="flex" alignItems="start">
                  <ListIcon as={FiWifi} color="green.500" mt={1} />
                  <Box>
                    <Text fontWeight="medium">When Connection Returns</Text>
                    <Text fontSize="sm" color="gray.600">
                      All pending actions are automatically sent to the server
                      in the order they were created.
                    </Text>
                  </Box>
                </ListItem>

                <ListItem display="flex" alignItems="start">
                  <ListIcon as={FiAlertTriangle} color="orange.500" mt={1} />
                  <Box>
                    <Text fontWeight="medium">Conflict Resolution</Text>
                    <Text fontSize="sm" color="gray.600">
                      If there are conflicts (e.g., job already claimed by
                      someone else), the system will handle them gracefully and
                      notify you.
                    </Text>
                  </Box>
                </ListItem>

                <ListItem display="flex" alignItems="start">
                  <ListIcon as={FiDatabase} color="blue.500" mt={1} />
                  <Box>
                    <Text fontWeight="medium">Data Storage</Text>
                    <Text fontSize="sm" color="gray.600">
                      All offline data is stored securely on your device and is
                      automatically cleaned up after successful sync.
                    </Text>
                  </Box>
                </ListItem>
              </List>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Clear All Actions Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Clear All Pending Actions</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This will permanently delete all pending actions that haven't
                  been synchronized yet. This action cannot be undone.
                </AlertDescription>
              </Box>
            </Alert>
            <Text>
              Are you sure you want to clear {state.pendingActions.length}{' '}
              pending actions?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                clearAllActions();
                onClose();
              }}
            >
              Clear All Actions
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
