"use client";

import React from 'react';
import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  useToast,
  Collapse,
  IconButton,
  Tooltip,
  Spinner
} from '@chakra-ui/react';
import { 
  FiWifiOff, 
  FiWifi, 
  FiRefreshCw, 
  FiClock,
  FiCheck,
  FiX,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { useOfflineState, offlineManager } from '@/lib/offline';

interface OfflineStatusProps {
  showDetails?: boolean;
  variant?: 'compact' | 'full';
}

export default function OfflineStatus({ showDetails = false, variant = 'full' }: OfflineStatusProps) {
  const state = useOfflineState();
  const [isExpanded, setIsExpanded] = React.useState(showDetails);
  const toast = useToast();

  const handleManualSync = async () => {
    try {
      await offlineManager.syncPendingActions();
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
    }
  };

  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case 'job_progress': return 'Job Progress';
      case 'location_update': return 'Location Update';
      case 'availability_update': return 'Availability Update';
      case 'job_claim': return 'Job Claim';
      case 'job_decline': return 'Job Decline';
      default: return type;
    }
  };

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'job_progress': return 'blue';
      case 'location_update': return 'green';
      case 'availability_update': return 'purple';
      case 'job_claim': return 'orange';
      case 'job_decline': return 'red';
      default: return 'gray';
    }
  };

  if (variant === 'compact') {
    return (
      <Box position="fixed" top={4} right={4} zIndex={1000}>
        {!state.isOnline && (
          <Tooltip label="You're offline. Actions will be queued.">
            <IconButton
              aria-label="Offline status"
              icon={<FiWifiOff />}
              colorScheme="red"
              size="sm"
              variant="solid"
            />
          </Tooltip>
        )}
        {state.pendingActions.length > 0 && (
          <Tooltip label={`${state.pendingActions.length} pending actions`}>
            <Badge
              colorScheme="orange"
              position="absolute"
              top={-2}
              right={-2}
              borderRadius="full"
              fontSize="xs"
            >
              {state.pendingActions.length}
            </Badge>
          </Tooltip>
        )}
      </Box>
    );
  }

  if (state.isOnline && state.pendingActions.length === 0) {
    return null;
  }

  return (
    <Box position="fixed" top={4} right={4} zIndex={1000} maxW="400px">
      <Alert
        status={state.isOnline ? 'info' : 'warning'}
        variant="solid"
        borderRadius="md"
        boxShadow="lg"
      >
        <AlertIcon />
        <Box flex="1">
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={1} flex="1">
              <AlertTitle>
                {state.isOnline ? 'Connection Restored' : 'You\'re Offline'}
              </AlertTitle>
              <AlertDescription>
                {state.isOnline 
                  ? 'All systems are back online'
                  : 'Some features may be limited while offline'
                }
              </AlertDescription>
            </VStack>
            
            <HStack spacing={2}>
              {state.syncInProgress && <Spinner size="sm" />}
              {state.pendingActions.length > 0 && (
                <Badge colorScheme="orange" variant="solid">
                  {state.pendingActions.length}
                </Badge>
              )}
              <IconButton
                aria-label="Toggle details"
                icon={isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
              />
            </HStack>
          </HStack>

          <Collapse in={isExpanded} animateOpacity>
            <VStack spacing={3} mt={4} align="stretch">
              {state.pendingActions.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Pending Actions ({state.pendingActions.length})
                  </Text>
                  <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
                    {state.pendingActions.map((action) => (
                      <HStack
                        key={action.id}
                        p={2}
                        bg="whiteAlpha.200"
                        borderRadius="md"
                        justify="space-between"
                      >
                        <VStack align="start" spacing={0} flex="1">
                          <Text fontSize="xs" fontWeight="medium">
                            {getActionTypeLabel(action.type)}
                          </Text>
                          <Text fontSize="xs" opacity={0.8}>
                            {new Date(action.timestamp).toLocaleTimeString()}
                          </Text>
                        </VStack>
                        <HStack spacing={1}>
                          <Badge
                            size="sm"
                            colorScheme={getActionTypeColor(action.type)}
                            variant="subtle"
                          >
                            {action.type.replace('_', ' ')}
                          </Badge>
                          {action.retryCount > 0 && (
                            <Badge size="sm" colorScheme="red" variant="subtle">
                              Retry {action.retryCount}/{action.maxRetries}
                            </Badge>
                          )}
                        </HStack>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}

              <HStack justify="space-between">
                {state.isOnline && state.pendingActions.length > 0 && (
                  <Button
                    size="sm"
                    colorScheme="blue"
                    leftIcon={<FiRefreshCw />}
                    onClick={handleManualSync}
                    isLoading={state.syncInProgress}
                    loadingText="Syncing..."
                  >
                    Sync Now
                  </Button>
                )}
                {!state.isOnline && (
                  <Text fontSize="xs" opacity={0.8}>
                    Actions will sync automatically when connection is restored
                  </Text>
                )}
              </HStack>
            </VStack>
          </Collapse>
        </Box>
      </Alert>
    </Box>
  );
}
