'use client';

import React, { useEffect, useState } from "react";
import { Box, Heading, HStack, VStack, Text, Badge, Card, CardBody, Button, Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, Input, Select, InputGroup, InputLeftElement, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Spinner, Alert, AlertIcon, AlertTitle, AlertDescription, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import { FiSearch, FiAlertTriangle, FiInfo, FiClock, FiUser, FiActivity, FiDownload, FiRefreshCw, FiEye } from "react-icons/fi";

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

interface LogStats {
  totalLogs: number;
  errorsToday: number;
  warningsToday: number;
  avgResponseTime: string;
}

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState("audit");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats>({
    totalLogs: 0,
    errorsToday: 0,
    warningsToday: 0,
    avgResponseTime: "0ms"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    level: "",
    service: "",
    action: ""
  });
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  async function loadLogs() {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        type: activeTab,
        ...filters
      });

      const response = await fetch(`/api/admin/logs?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setStats(data.stats || {
        totalLogs: 0,
        errorsToday: 0,
        warningsToday: 0,
        avgResponseTime: "0ms"
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, [activeTab]);

  function handleFilterChange(key: string, value: string) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  function handleSearch() {
    loadLogs();
  }

  function viewLogDetails(log: LogEntry) {
    setSelectedLog(log);
    onOpen();
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error": return "red";
      case "warning": return "yellow";
      case "info": return "blue";
      case "debug": return "gray";
      default: return "gray";
    }
  };

  const getActionColor = (action: string) => {
    if (action?.includes("update")) return "blue";
    if (action?.includes("create")) return "green";
    if (action?.includes("delete")) return "red";
    if (action?.includes("error")) return "red";
    if (action?.includes("warning")) return "yellow";
    return "gray";
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <VStack align="start" spacing={1}>
          <Heading size="lg">System Logs</Heading>
          <Text color="gray.600">Audit trails, system logs, and error tracking</Text>
        </VStack>
        <HStack spacing={3}>
          <Button leftIcon={<FiRefreshCw />} variant="outline" size="sm" onClick={loadLogs} isLoading={loading}>
            Refresh
          </Button>
          <Button leftIcon={<FiDownload />} variant="outline" size="sm">
            Export Logs
          </Button>
        </HStack>
      </HStack>

      {/* Stats Row */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Logs</StatLabel>
              <StatNumber suppressHydrationWarning>{(stats.totalLogs || 0).toLocaleString()}</StatNumber>
              <StatHelpText>
                <FiActivity style={{ display: 'inline', marginRight: '4px' }} />
                Last 24 hours
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Errors Today</StatLabel>
              <StatNumber color="red.500" suppressHydrationWarning>{stats.errorsToday}</StatNumber>
              <StatHelpText>
                <FiAlertTriangle style={{ display: 'inline', marginRight: '4px' }} />
                Critical issues
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Warnings Today</StatLabel>
              <StatNumber color="yellow.500" suppressHydrationWarning>{stats.warningsToday}</StatNumber>
              <StatHelpText>
                <FiInfo style={{ display: 'inline', marginRight: '4px' }} />
                Attention needed
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Avg Response Time</StatLabel>
              <StatNumber suppressHydrationWarning>{stats.avgResponseTime}</StatNumber>
              <StatHelpText>
                <FiClock style={{ display: 'inline', marginRight: '4px' }} />
                API performance
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
          <Button 
            size="sm" 
            colorScheme="blue" 
            onClick={loadLogs}
            ml={4}
          >
            Retry
          </Button>
        </Alert>
      )}

      <Tabs onChange={(index) => setActiveTab(index === 0 ? "audit" : index === 1 ? "system" : "error")}>
        <TabList>
          <Tab>Audit Logs</Tab>
          <Tab>System Logs</Tab>
          <Tab>Error Logs</Tab>
        </TabList>

        <TabPanels>
          {/* Audit Logs Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <HStack justify="space-between" mb={4}>
                  <Heading size="md">Audit Logs</Heading>
                  <HStack spacing={3}>
                    <InputGroup maxW="300px">
                      <InputLeftElement>
                        <FiSearch />
                      </InputLeftElement>
                      <Input 
                        placeholder="Search audit logs..." 
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                      />
                    </InputGroup>
                    <Select 
                      placeholder="Filter by action" 
                      maxW="200px"
                      value={filters.action}
                      onChange={(e) => handleFilterChange('action', e.target.value)}
                    >
                      <option value="order">Order Actions</option>
                      <option value="driver">Driver Actions</option>
                      <option value="payment">Payment Actions</option>
                      <option value="user">User Actions</option>
                    </Select>
                    <Button colorScheme="blue" size="sm" onClick={handleSearch}>
                      Search
                    </Button>
                  </HStack>
                </HStack>
                
                {loading ? (
                  <HStack justify="center" py={8}>
                    <Spinner />
                    <Text>Loading audit logs...</Text>
                  </HStack>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Timestamp</Th>
                        <Th>Actor</Th>
                        <Th>Action</Th>
                        <Th>Entity</Th>
                        <Th>IP Address</Th>
                        <Th>Details</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {logs.map((log) => (
                        <Tr key={log.id}>
                          <Td>
                            <Text fontSize="sm" suppressHydrationWarning>{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</Text>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <FiUser size={12} />
                              <Text fontSize="sm">{log.actor || 'System'}</Text>
                            </HStack>
                          </Td>
                          <Td>
                            <Badge colorScheme={getActionColor(log.action || '')} size="sm">
                              {log.action}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {log.entity} {log.entityId ? `#${log.entityId}` : ''}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.600">{log.ip || 'N/A'}</Text>
                          </Td>
                          <Td>
                            <Button 
                              size="xs" 
                              variant="outline" 
                              leftIcon={<FiEye />}
                              onClick={() => viewLogDetails(log)}
                            >
                              View Details
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* System Logs Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <HStack justify="space-between" mb={4}>
                  <Heading size="md">System Logs</Heading>
                  <HStack spacing={3}>
                    <InputGroup maxW="300px">
                      <InputLeftElement>
                        <FiSearch />
                      </InputLeftElement>
                      <Input 
                        placeholder="Search system logs..." 
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                      />
                    </InputGroup>
                    <Select 
                      placeholder="Filter by level" 
                      maxW="150px"
                      value={filters.level}
                      onChange={(e) => handleFilterChange('level', e.target.value)}
                    >
                      <option value="error">Error</option>
                      <option value="warning">Warning</option>
                      <option value="info">Info</option>
                      <option value="debug">Debug</option>
                    </Select>
                    <Select 
                      placeholder="Filter by service" 
                      maxW="150px"
                      value={filters.service}
                      onChange={(e) => handleFilterChange('service', e.target.value)}
                    >
                      <option value="api">API</option>
                      <option value="database">Database</option>
                      <option value="webhooks">Webhooks</option>
                      <option value="queue">Queue</option>
                    </Select>
                    <Button colorScheme="blue" size="sm" onClick={handleSearch}>
                      Search
                    </Button>
                  </HStack>
                </HStack>
                
                {loading ? (
                  <HStack justify="center" py={8}>
                    <Spinner />
                    <Text>Loading system logs...</Text>
                  </HStack>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Timestamp</Th>
                        <Th>Level</Th>
                        <Th>Service</Th>
                        <Th>Message</Th>
                        <Th>Details</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {logs.map((log) => (
                        <Tr key={log.id}>
                          <Td>
                            <Text fontSize="sm" suppressHydrationWarning>{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={getLevelColor(log.level || '')} size="sm">
                              {log.level?.toUpperCase()}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm" fontWeight="bold">{log.service}</Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{log.message}</Text>
                          </Td>
                          <Td>
                            <Button 
                              size="xs" 
                              variant="outline" 
                              leftIcon={<FiEye />}
                              onClick={() => viewLogDetails(log)}
                            >
                              View Details
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Error Logs Tab */}
          <TabPanel>
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
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                      />
                    </InputGroup>
                    <Select 
                      placeholder="Filter by service" 
                      maxW="150px"
                      value={filters.service}
                      onChange={(e) => handleFilterChange('service', e.target.value)}
                    >
                      <option value="api">API</option>
                      <option value="database">Database</option>
                      <option value="webhooks">Webhooks</option>
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
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {logs.map((log) => (
                        <Tr key={log.id}>
                          <Td>
                            <Text fontSize="sm" suppressHydrationWarning>{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" fontWeight="bold">{log.service}</Text>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm" color="red.500">{log.error}</Text>
                              <Text fontSize="xs" color="gray.600" maxW="300px" noOfLines={1}>
                                {log.stack}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Badge colorScheme={log.occurrences && log.occurrences > 1 ? "red" : "yellow"} size="sm">
                              {log.occurrences}x
                            </Badge>
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
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Log Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Log Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedLog && (
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="bold">Timestamp</Text>
                    <Text suppressHydrationWarning>{selectedLog.timestamp ? new Date(selectedLog.timestamp).toLocaleString() : 'N/A'}</Text>
                  </Box>
                  {selectedLog.actor && (
                    <Box>
                      <Text fontWeight="bold">Actor</Text>
                      <Text>{selectedLog.actor}</Text>
                    </Box>
                  )}
                  {selectedLog.action && (
                    <Box>
                      <Text fontWeight="bold">Action</Text>
                      <Text>{selectedLog.action}</Text>
                    </Box>
                  )}
                  {selectedLog.entity && (
                    <Box>
                      <Text fontWeight="bold">Entity</Text>
                      <Text>{selectedLog.entity} {selectedLog.entityId ? `#${selectedLog.entityId}` : ''}</Text>
                    </Box>
                  )}
                  {selectedLog.level && (
                    <Box>
                      <Text fontWeight="bold">Level</Text>
                      <Text>{selectedLog.level}</Text>
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
                </SimpleGrid>

                {selectedLog.message && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Message</Text>
                    <Text>{selectedLog.message}</Text>
                  </Box>
                )}

                {selectedLog.error && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Error</Text>
                    <Text color="red.500">{selectedLog.error}</Text>
                  </Box>
                )}

                {selectedLog.stack && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Stack Trace</Text>
                    <Card variant="outline">
                      <CardBody>
                        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                          {selectedLog.stack}
                        </pre>
                      </CardBody>
                    </Card>
                  </Box>
                )}

                {selectedLog.before && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Before</Text>
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
                    <Text fontWeight="bold" mb={2}>After</Text>
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

      {/* Log Retention Info */}
      <Card mt={6}>
        <CardBody>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">Log Retention Policy</Text>
              <Text fontSize="sm" color="gray.600">
                Audit logs: 7 years | System logs: 90 days | Error logs: 30 days
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Button variant="outline" size="sm">
                Configure Retention
              </Button>
              <Button variant="outline" size="sm">
                Archive Logs
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>
    </Box>
  );
}

