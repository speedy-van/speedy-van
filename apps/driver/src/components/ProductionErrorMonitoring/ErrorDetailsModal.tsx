'use client';
import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  FormControl,
  FormLabel,
  Select,
  Input,
  Textarea,
  Box,
  Divider,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Alert,
  AlertIcon,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { ProductionError } from '../../agent/types';

interface ErrorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: ProductionError | null;
  onStatusUpdate: () => void;
}

export default function ErrorDetailsModal({
  isOpen,
  onClose,
  error,
  onStatusUpdate,
}: ErrorDetailsModalProps) {
  const [status, setStatus] = useState('');
  const [assignee, setAssignee] = useState('');
  const [resolution, setResolution] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const toast = useToast();

  // Initialize form when error changes
  React.useEffect(() => {
    if (error) {
      setStatus(error.metadata.status);
      setAssignee(error.metadata.assignee || '');
      setResolution(error.metadata.resolution || '');
    }
  }, [error]);

  const handleUpdateStatus = async () => {
    if (!error) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          errorId: error.id,
          status,
          assignee: assignee || undefined,
          resolution: resolution || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Error status updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onStatusUpdate();
        onClose();
      } else {
        throw new Error(data.error || 'Failed to update error status');
      }
    } catch (error) {
      console.error('Failed to update error status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update error status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'red';
      case 'error': return 'orange';
      case 'warning': return 'yellow';
      case 'info': return 'blue';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'blue';
      case 'investigating': return 'yellow';
      case 'in_progress': return 'orange';
      case 'resolved': return 'green';
      case 'closed': return 'gray';
      default: return 'gray';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatContextValue = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  if (!error) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            <Text>Error Details</Text>
            <Badge colorScheme={getLevelColor(error.level)} variant="solid">
              {error.level}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Error Header */}
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Text fontSize="lg" fontWeight="bold">
                    {error.message}
                  </Text>
                  
                  <HStack spacing={4} wrap="wrap">
                    <Badge colorScheme={getLevelColor(error.level)} variant="solid">
                      {error.level}
                    </Badge>
                    <Badge variant="outline">{error.category}</Badge>
                    <Badge colorScheme={getPriorityColor(error.metadata.priority)} variant="subtle">
                      {error.metadata.priority}
                    </Badge>
                    <Badge colorScheme={getStatusColor(error.metadata.status)} variant="subtle">
                      {error.metadata.status.replace('_', ' ')}
                    </Badge>
                  </HStack>

                  <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Source</Text>
                      <Text fontWeight="medium">{error.source}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Timestamp</Text>
                      <Text fontWeight="medium">{formatTimestamp(error.timestamp)}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Created</Text>
                      <Text fontWeight="medium">{formatTimestamp(error.createdAt)}</Text>
                    </Box>
                  </Grid>
                </VStack>
              </CardBody>
            </Card>

            {/* Stack Trace */}
            {error.stackTrace && (
              <Card>
                <CardHeader>
                  <Heading size="md">Stack Trace</Heading>
                </CardHeader>
                <CardBody>
                  <Box
                    p={4}
                    bg="gray.50"
                    borderRadius="md"
                    fontFamily="mono"
                    fontSize="sm"
                    whiteSpace="pre-wrap"
                    overflowX="auto"
                  >
                    {error.stackTrace}
                  </Box>
                </CardBody>
              </Card>
            )}

            {/* Context Information */}
            <Card>
              <CardHeader>
                <Heading size="md">Context Information</Heading>
              </CardHeader>
              <CardBody>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  {Object.entries(error.context).map(([key, value]) => (
                    <Box key={key}>
                      <Text fontSize="sm" color="gray.600" textTransform="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Text>
                      <Text fontWeight="medium" fontSize="sm">
                        {formatContextValue(value)}
                      </Text>
                    </Box>
                  ))}
                </Grid>
              </CardBody>
            </Card>

            {/* Impact Assessment */}
            <Card>
              <CardHeader>
                <Heading size="md">Impact Assessment</Heading>
              </CardHeader>
              <CardBody>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Severity</Text>
                    <Badge colorScheme={
                      error.impact.severity === 'critical' ? 'red' :
                      error.impact.severity === 'major' ? 'orange' :
                      error.impact.severity === 'moderate' ? 'yellow' : 'green'
                    }>
                      {error.impact.severity}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Business Impact</Text>
                    <Badge colorScheme={
                      error.impact.businessImpact === 'critical' ? 'red' :
                      error.impact.businessImpact === 'high' ? 'orange' :
                      error.impact.businessImpact === 'medium' ? 'yellow' : 'green'
                    }>
                      {error.impact.businessImpact}
                    </Badge>
                  </Box>
                  {error.impact.affectedUsers && (
                    <Box>
                      <Text fontSize="sm" color="gray.600">Affected Users</Text>
                      <Text fontWeight="medium">{error.impact.affectedUsers}</Text>
                    </Box>
                  )}
                  {error.impact.downtime && (
                    <Box>
                      <Text fontSize="sm" color="gray.600">Downtime</Text>
                      <Text fontWeight="medium">{error.impact.downtime} minutes</Text>
                    </Box>
                  )}
                </Grid>
              </CardBody>
            </Card>

            {/* Related Errors */}
            {error.relatedErrors && error.relatedErrors.length > 0 && (
              <Card>
                <CardHeader>
                  <Heading size="md">Related Errors</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={2}>
                    {error.relatedErrors.map((relatedId, index) => (
                      <Box key={index} p={3} borderWidth={1} borderRadius="md">
                        <Text fontSize="sm" fontFamily="mono">
                          {relatedId}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Update Status */}
            <Card>
              <CardHeader>
                <Heading size="md">Update Status</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <FormControl>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="new">New</option>
                        <option value="investigating">Investigating</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Assignee</FormLabel>
                      <Input
                        placeholder="Enter assignee name"
                        value={assignee}
                        onChange={(e) => setAssignee(e.target.value)}
                      />
                    </FormControl>
                  </Grid>

                  <FormControl>
                    <FormLabel>Resolution Notes</FormLabel>
                    <Textarea
                      placeholder="Enter resolution details..."
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      rows={4}
                    />
                  </FormControl>

                  <HStack justify="end" spacing={4}>
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      colorScheme="blue"
                      onClick={handleUpdateStatus}
                      isLoading={isUpdating}
                      loadingText="Updating..."
                    >
                      Update Status
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
