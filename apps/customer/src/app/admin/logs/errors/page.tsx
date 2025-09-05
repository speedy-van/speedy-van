'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  HStack,
  VStack,
  Text,
  Badge,
  Card,
  CardBody,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiSearch,
  FiAlertTriangle,
  FiClock,
  FiActivity,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiTrendingUp,
  FiTrendingDown,
} from 'react-icons/fi';

interface LogEntry {
  id: string;
  timestamp: string;
  actor?: string;
  actorRole?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  ip?: string;
  userAgent?: string;
  level?: string;
  service?: string;
  message?: string;
  details?: string;
  error?: string;
  stack?: string;
  occurrences?: number;
  before?: any;
  after?: any;
}

interface ErrorStats {
  totalErrors: number;
  errorsToday: number;
  errorsThisWeek: number;
  criticalErrors: number;
  avgResolutionTime: string;
  errorTrend: 'up' | 'down' | 'stable';
}

export default function ErrorLogsPage() {
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<ErrorStats>({
    totalErrors: 0,
    errorsToday: 0,
    errorsThisWeek: 0,
    criticalErrors: 0,
    avgResolutionTime: '0h',
    errorTrend: 'stable',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    service: '',
    level: 'error',
  });
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Ensure component is mounted before rendering dynamic content
  useEffect(() => {
    setMounted(true);
  }, []);

  async function loadErrorLogs() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        type: 'error',
        level: 'error',
        ...filters,
      });

      const response = await fetch(`/api/admin/logs?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch error logs');
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setStats(
        data.stats || {
          totalErrors: 0,
          errorsToday: 0,
          errorsThisWeek: 0,
          criticalErrors: 0,
          avgResolutionTime: '0h',
          errorTrend: 'stable',
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (mounted) {
      loadErrorLogs();
    }
  }, [mounted]);

  function handleFilterChange(key: string, value: string) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  function handleSearch() {
    loadErrorLogs();
  }

  function viewLogDetails(log: LogEntry) {
    setSelectedLog(log);
    onOpen();
  }

  const getServiceColor = (service: string) => {
    switch (service) {
      case 'api':
        return 'red';
      case 'database':
        return 'orange';
      case 'webhooks':
        return 'purple';
      case 'queue':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <FiTrendingUp color="red" />;
      case 'down':
        return <FiTrendingDown color="green" />;
      default:
        return <FiTrendingUp color="gray" />;
    }
  };

  // Don't render dynamic content until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Box>
        <HStack justify="space-between" mb={6}>
          <VStack align="start" spacing={1}>
            <Heading size="lg">Error Logs</Heading>
            <Text color="gray.600">
              Critical system errors and exceptions requiring immediate
              attention
            </Text>
          </VStack>
        </HStack>
        <HStack justify="center" py={8}>
          <Spinner />
          <Text>Loading...</Text>
        </HStack>
      </Box>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <VStack align="start" spacing={1}>
          <Heading size="lg">Error Logs</Heading>
          <Text color="gray.600">
            Critical system errors and exceptions requiring immediate attention
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button
            leftIcon={<FiRefreshCw />}
            variant="outline"
            size="sm"
            onClick={loadErrorLogs}
            isLoading={loading}
          >
            Refresh
          </Button>
          <Button leftIcon={<FiDownload />} variant="outline" size="sm">
            Export Errors
          </Button>
        </HStack>
      </HStack>

      {/* Error Stats Row */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 6 }} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Errors</StatLabel>
              <StatNumber suppressHydrationWarning>
                {(stats.totalErrors || 0).toLocaleString()}
              </StatNumber>
              <StatHelpText>
                <FiActivity style={{ display: 'inline', marginRight: '4px' }} />
                All time
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Errors Today</StatLabel>
              <StatNumber color="red.500" suppressHydrationWarning>
                {stats.errorsToday}
              </StatNumber>
              <StatHelpText>
                <FiAlertTriangle
                  style={{ display: 'inline', marginRight: '4px' }}
                />
                Last 24 hours
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>This Week</StatLabel>
              <StatNumber color="orange.500" suppressHydrationWarning>
                {stats.errorsThisWeek}
              </StatNumber>
              <StatHelpText>
                <FiClock style={{ display: 'inline', marginRight: '4px' }} />
                Last 7 days
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Critical</StatLabel>
              <StatNumber color="red.600" suppressHydrationWarning>
                {stats.criticalErrors}
              </StatNumber>
              <StatHelpText>
                <FiAlertTriangle
                  style={{ display: 'inline', marginRight: '4px' }}
                />
                High priority
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Avg Resolution</StatLabel>
              <StatNumber suppressHydrationWarning>
                {stats.avgResolutionTime}
              </StatNumber>
              <StatHelpText>
                <FiClock style={{ display: 'inline', marginRight: '4px' }} />
                Time to fix
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Trend</StatLabel>
              <StatNumber>
                <HStack spacing={2}>
                  {getTrendIcon(stats.errorTrend)}
                  <Text
                    fontSize="sm"
                    color={
                      stats.errorTrend === 'up'
                        ? 'red.500'
                        : stats.errorTrend === 'down'
                          ? 'green.500'
                          : 'gray.500'
                    }
                  >
                    {stats.errorTrend === 'up'
                      ? 'Increasing'
                      : stats.errorTrend === 'down'
                        ? 'Decreasing'
                        : 'Stable'}
                  </Text>
                </HStack>
              </StatNumber>
              <StatHelpText>
                <FiActivity style={{ display: 'inline', marginRight: '4px' }} />
                Error rate
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Error Alert */}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button size="sm" colorScheme="blue" onClick={loadErrorLogs} ml={4}>
            Retry
          </Button>
        </Alert>
      )}

      {/* Error Logs Table */}
      <Card>
        <CardBody>
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Error Logs</Heading>
            <HStack spacing={3}>
              <InputGroup maxW="300px">
                <InputLeftElement>
                  <FiSearch />
                </InputLeftElement>
                <Input
                  placeholder="Search error logs..."
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                />
              </InputGroup>
              <Select
                placeholder="Filter by service"
                maxW="150px"
                value={filters.service}
                onChange={e => handleFilterChange('service', e.target.value)}
              >
                <option value="api">API</option>
                <option value="database">Database</option>
                <option value="webhooks">Webhooks</option>
                <option value="queue">Queue</option>
                <option value="auth">Authentication</option>
                <option value="payment">Payment</option>
              </Select>
              <Button colorScheme="blue" size="sm" onClick={handleSearch}>
                Search
              </Button>
            </HStack>
          </HStack>

          {loading ? (
            <HStack justify="center" py={8}>
              <Spinner />
              <Text>Loading error logs...</Text>
            </HStack>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Timestamp</Th>
                  <Th>Service</Th>
                  <Th>Error</Th>
                  <Th>Occurrences</Th>
                  <Th>User/IP</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {logs.map(log => (
                  <Tr key={log.id}>
                    <Td>
                      <Text fontSize="sm" suppressHydrationWarning>
                        {log.timestamp
                          ? new Date(log.timestamp).toLocaleString()
                          : 'N/A'}
                      </Text>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={getServiceColor(log.service || '')}
                        size="sm"
                      >
                        {log.service}
                      </Badge>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="red.500" fontWeight="medium">
                          {log.error}
                        </Text>
                        <Text
                          fontSize="xs"
                          color="gray.600"
                          maxW="300px"
                          noOfLines={1}
                        >
                          {log.message || log.stack}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          log.occurrences && log.occurrences > 1
                            ? 'red'
                            : 'yellow'
                        }
                        size="sm"
                      >
                        {log.occurrences}x
                      </Badge>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">{log.actor || 'System'}</Text>
                        <Text fontSize="xs" color="gray.600">
                          {log.ip || 'N/A'}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="xs"
                          variant="outline"
                          leftIcon={<FiEye />}
                          onClick={() => viewLogDetails(log)}
                        >
                          View Stack
                        </Button>
                        <Button size="xs" colorScheme="red" variant="outline">
                          Report Bug
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Log Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Error Log Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedLog && (
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="bold">Timestamp</Text>
                    <Text suppressHydrationWarning>
                      {selectedLog.timestamp
                        ? new Date(selectedLog.timestamp).toLocaleString()
                        : 'N/A'}
                    </Text>
                  </Box>
                  {selectedLog.actor && (
                    <Box>
                      <Text fontWeight="bold">Actor</Text>
                      <Text>{selectedLog.actor}</Text>
                    </Box>
                  )}
                  {selectedLog.service && (
                    <Box>
                      <Text fontWeight="bold">Service</Text>
                      <Text>{selectedLog.service}</Text>
                    </Box>
                  )}
                  {selectedLog.ip && (
                    <Box>
                      <Text fontWeight="bold">IP Address</Text>
                      <Text>{selectedLog.ip}</Text>
                    </Box>
                  )}
                  {selectedLog.occurrences && (
                    <Box>
                      <Text fontWeight="bold">Occurrences</Text>
                      <Text color="red.500">{selectedLog.occurrences}x</Text>
                    </Box>
                  )}
                  {selectedLog.userAgent && (
                    <Box>
                      <Text fontWeight="bold">User Agent</Text>
                      <Text fontSize="sm" color="gray.600">
                        {selectedLog.userAgent}
                      </Text>
                    </Box>
                  )}
                </SimpleGrid>

                {selectedLog.message && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Message
                    </Text>
                    <Text>{selectedLog.message}</Text>
                  </Box>
                )}

                {selectedLog.error && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Error
                    </Text>
                    <Text color="red.500">{selectedLog.error}</Text>
                  </Box>
                )}

                {selectedLog.stack && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Stack Trace
                    </Text>
                    <Card variant="outline">
                      <CardBody>
                        <pre
                          style={{
                            fontSize: '12px',
                            overflow: 'auto',
                            maxHeight: '300px',
                          }}
                        >
                          {selectedLog.stack}
                        </pre>
                      </CardBody>
                    </Card>
                  </Box>
                )}

                {selectedLog.details && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Additional Details
                    </Text>
                    <Card variant="outline">
                      <CardBody>
                        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                          {JSON.stringify(selectedLog.details, null, 2)}
                        </pre>
                      </CardBody>
                    </Card>
                  </Box>
                )}

                {selectedLog.before && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Before State
                    </Text>
                    <Card variant="outline">
                      <CardBody>
                        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                          {JSON.stringify(selectedLog.before, null, 2)}
                        </pre>
                      </CardBody>
                    </Card>
                  </Box>
                )}

                {selectedLog.after && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      After State
                    </Text>
                    <Card variant="outline">
                      <CardBody>
                        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                          {JSON.stringify(selectedLog.after, null, 2)}
                        </pre>
                      </CardBody>
                    </Card>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Error Management Info */}
      <Card mt={6}>
        <CardBody>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">Error Management</Text>
              <Text fontSize="sm" color="gray.600">
                Error logs are retained for 30 days. Critical errors trigger
                immediate alerts.
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Button variant="outline" size="sm">
                Configure Alerts
              </Button>
              <Button variant="outline" size="sm">
                Error Patterns
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>
    </Box>
  );
}
