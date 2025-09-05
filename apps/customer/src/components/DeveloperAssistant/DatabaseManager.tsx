'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Tooltip,
  useToast,
  Spinner,
  Badge,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Textarea,
  Select,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { 
  DatabaseIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  CogIcon,
  TableCellsIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { AgentManager } from '../../agent/core/AgentManager';

interface DatabaseManagerProps {
  agentManager: AgentManager | null;
  onClose: () => void;
}

interface DatabaseTable {
  name: string;
  columns: string[];
  rowCount: number;
  size: string;
  lastModified: Date;
}

interface DatabaseQuery {
  id: string;
  sql: string;
  status: 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  executionTime: number;
  timestamp: Date;
}

interface DatabaseMigration {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: Date;
  duration?: number;
  error?: string;
}

/**
 * Database Manager - Comprehensive database management interface for developers
 * Provides database operations, query execution, and migration management
 */
export const DatabaseManager: React.FC<DatabaseManagerProps> = ({
  agentManager,
  onClose
}) => {
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [queries, setQueries] = useState<DatabaseQuery[]>([]);
  const [migrations, setMigrations] = useState<DatabaseMigration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isQueryRunning, setIsQueryRunning] = useState(false);
  const [isMigrationRunning, setIsMigrationRunning] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<any[]>([]);
  const [databaseStatus, setDatabaseStatus] = useState<'connected' | 'disconnected' | 'error'>('connected');
  
  const toast = useToast();
  const { isOpen: isQueryModalOpen, onOpen: onQueryModalOpen, onClose: onQueryModalClose } = useDisclosure();
  const { isOpen: isMigrationModalOpen, onOpen: onMigrationModalOpen, onClose: onMigrationModalClose } = useDisclosure();

  // Load database information
  useEffect(() => {
    loadDatabaseInfo();
  }, []);

  // Load database information
  const loadDatabaseInfo = async () => {
    try {
      setIsLoading(true);
      
      // Mock database tables - in real implementation, this would query the database
      const mockTables: DatabaseTable[] = [
        {
          name: 'users',
          columns: ['id', 'email', 'name', 'created_at', 'updated_at'],
          rowCount: 1250,
          size: '2.5 MB',
          lastModified: new Date()
        },
        {
          name: 'bookings',
          columns: ['id', 'user_id', 'service_type', 'status', 'created_at'],
          rowCount: 3420,
          size: '8.1 MB',
          lastModified: new Date()
        },
        {
          name: 'drivers',
          columns: ['id', 'name', 'vehicle_type', 'status', 'location'],
          rowCount: 89,
          size: '1.2 MB',
          lastModified: new Date()
        },
        {
          name: 'payments',
          columns: ['id', 'booking_id', 'amount', 'status', 'payment_method'],
          rowCount: 2980,
          size: '5.8 MB',
          lastModified: new Date()
        }
      ];
      
      setTables(mockTables);
      
      // Mock migrations
      const mockMigrations: DatabaseMigration[] = [
        { id: '1', name: '001_initial_schema', status: 'completed', timestamp: new Date(Date.now() - 86400000) },
        { id: '2', name: '002_add_user_roles', status: 'completed', timestamp: new Date(Date.now() - 43200000) },
        { id: '3', name: '003_booking_improvements', status: 'completed', timestamp: new Date(Date.now() - 21600000) },
        { id: '4', name: '004_payment_integration', status: 'pending', timestamp: new Date() }
      ];
      
      setMigrations(mockMigrations);
      
    } catch (error) {
      toast({
        title: 'Failed to Load Database Info',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Execute SQL query
  const executeQuery = async (sql: string) => {
    if (!agentManager || !sql.trim()) return;

    try {
      setIsQueryRunning(true);
      
      const queryId = Date.now().toString();
      const newQuery: DatabaseQuery = {
        id: queryId,
        sql,
        status: 'running',
        executionTime: 0,
        timestamp: new Date()
      };
      
      setQueries(prev => [newQuery, ...prev]);
      
      toast({
        title: 'Executing Query',
        description: 'Running SQL query...',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });

      // Simulate query execution
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      const executionTime = Date.now() - startTime;
      
      // Simulate query result
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        const mockResult = {
          rows: Math.floor(Math.random() * 100) + 1,
          columns: ['id', 'name', 'email'],
          data: Array.from({ length: Math.min(10, Math.floor(Math.random() * 100) + 1) }, (_, i) => ({
            id: i + 1,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`
          }))
        };
        
        setQueries(prev => prev.map(q => 
          q.id === queryId 
            ? { ...q, status: 'completed', result: mockResult, executionTime }
            : q
        ));
        
        toast({
          title: 'Query Completed',
          description: `Query executed successfully in ${executionTime}ms`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const error = 'Simulated database error: Connection timeout';
        
        setQueries(prev => prev.map(q => 
          q.id === queryId 
            ? { ...q, status: 'failed', error, executionTime }
            : q
        ));
        
        toast({
          title: 'Query Failed',
          description: error,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
      
    } catch (error) {
      toast({
        title: 'Query Execution Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsQueryRunning(false);
    }
  };

  // Run database migrations
  const runMigrations = async () => {
    if (!agentManager) return;

    try {
      setIsMigrationRunning(true);
      
      toast({
        title: 'Running Migrations',
        description: 'Executing database migrations...',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });

      // Find pending migrations
      const pendingMigrations = migrations.filter(m => m.status === 'pending');
      
      for (const migration of pendingMigrations) {
        // Update migration status to running
        setMigrations(prev => prev.map(m => 
          m.id === migration.id ? { ...m, status: 'running' } : m
        ));
        
        // Simulate migration execution
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000));
        const duration = Date.now() - startTime;
        
        // Simulate migration result
        const success = Math.random() > 0.05; // 95% success rate
        
        if (success) {
          setMigrations(prev => prev.map(m => 
            m.id === migration.id 
              ? { ...m, status: 'completed', duration }
              : m
          ));
        } else {
          const error = 'Simulated migration error: Schema conflict';
          setMigrations(prev => prev.map(m => 
            m.id === migration.id 
              ? { ...m, status: 'failed', duration, error }
              : m
          ));
        }
      }
      
      toast({
        title: 'Migrations Completed',
        description: 'Database migrations finished',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
    } catch (error) {
      toast({
        title: 'Migration Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsMigrationRunning(false);
    }
  };

  // View table data
  const viewTableData = async (tableName: string) => {
    try {
      setSelectedTable(tableName);
      
      // Simulate loading table data
      const mockData = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Record ${i + 1}`,
        created_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)]
      }));
      
      setTableData(mockData);
      
    } catch (error) {
      toast({
        title: 'Failed to Load Table Data',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Get migration status color
  const getMigrationStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'running':
        return 'blue';
      case 'failed':
        return 'red';
      case 'pending':
        return 'gray';
      default:
        return 'gray';
    }
  };

  // Get query status color
  const getQueryStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'running':
        return 'blue';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box h="100%" bg="white" overflow="hidden">
      {/* Header */}
      <Box p={4} borderBottom="1px" borderColor="gray.200" bg="gray.50">
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
            <Icon as={DatabaseIcon} boxSize={6} color="purple.500" />
            <Text fontSize="xl" fontWeight="bold" color="gray.700">
              Database Manager
            </Text>
            <Badge 
              size="lg" 
              colorScheme={databaseStatus === 'connected' ? 'green' : databaseStatus === 'error' ? 'red' : 'gray'}
              variant="subtle"
            >
              {databaseStatus}
            </Badge>
          </HStack>
          
          <HStack spacing={3}>
            <Button
              size="sm"
              colorScheme="blue"
              variant="ghost"
              onClick={onQueryModalOpen}
              leftIcon={<PlusIcon />}
            >
              New Query
            </Button>
            
            <Button
              size="sm"
              colorScheme="green"
              onClick={runMigrations}
              isLoading={isMigrationRunning}
              leftIcon={<PlayIcon />}
            >
              Run Migrations
            </Button>
            
            <Button
              size="sm"
              colorScheme="blue"
              variant="ghost"
              onClick={loadDatabaseInfo}
              isLoading={isLoading}
              leftIcon={<ArrowPathIcon />}
            >
              Refresh
            </Button>
          </HStack>
        </HStack>
      </Box>

      {/* Main Content */}
      <Tabs flex={1} h="calc(100% - 80px)">
        <TabList px={4} pt={2}>
          <Tab>
            <HStack spacing={2}>
              <Icon as={TableCellsIcon} boxSize={4} />
              <Text>Tables</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <Icon as={DocumentTextIcon} boxSize={4} />
              <Text>Queries</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <Icon as={ChartBarIcon} boxSize={4} />
              <Text>Migrations</Text>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels flex={1} overflow="auto">
          {/* Tables Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                Database Tables ({tables.length})
              </Text>
              
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Table Name</Th>
                    <Th>Columns</Th>
                    <Th>Row Count</Th>
                    <Th>Size</Th>
                    <Th>Last Modified</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {tables.map(table => (
                    <Tr key={table.name}>
                      <Td fontWeight="semibold">{table.name}</Td>
                      <Td>
                        <Text fontSize="xs" color="gray.600">
                          {table.columns.join(', ')}
                        </Text>
                      </Td>
                      <Td>
                        <Badge size="sm" colorScheme="blue" variant="subtle">
                          {table.rowCount.toLocaleString()}
                        </Badge>
                      </Td>
                      <Td>{table.size}</Td>
                      <Td fontSize="xs" color="gray.600">
                        {table.lastModified.toLocaleDateString()}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="View Data">
                            <IconButton
                              size="sm"
                              icon={<EyeIcon />}
                              onClick={() => viewTableData(table.name)}
                              aria-label="View table data"
                              variant="ghost"
                              colorScheme="blue"
                            />
                          </Tooltip>
                          
                          <Tooltip label="Edit Table">
                            <IconButton
                              size="sm"
                              icon={<PencilIcon />}
                              aria-label="Edit table"
                              variant="ghost"
                              colorScheme="green"
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              
              {/* Table Data Viewer */}
              {selectedTable && tableData.length > 0 && (
                <Box mt={6}>
                  <HStack justify="space-between" mb={3}>
                    <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                      Table Data: {selectedTable}
                    </Text>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedTable('')}
                    >
                      Close
                    </Button>
                  </HStack>
                  
                  <Box overflow="auto" maxH="400px">
                    <Table variant="simple" size="sm">
                      <Thead position="sticky" top={0} bg="white" zIndex={1}>
                        <Tr>
                          {Object.keys(tableData[0]).map(key => (
                            <Th key={key}>{key}</Th>
                          ))}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {tableData.map((row, index) => (
                          <Tr key={index}>
                            {Object.values(row).map((value, i) => (
                              <Td key={i} fontSize="xs">
                                {typeof value === 'string' && value.includes('T') 
                                  ? new Date(value).toLocaleDateString()
                                  : String(value)
                                }
                              </Td>
                            ))}
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>
              )}
            </VStack>
          </TabPanel>

          {/* Queries Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                  SQL Queries ({queries.length})
                </Text>
                
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={onQueryModalOpen}
                  leftIcon={<PlusIcon />}
                >
                  New Query
                </Button>
              </HStack>
              
              {queries.length === 0 ? (
                <Box textAlign="center" py={8} color="gray.500">
                  <Icon as={DocumentTextIcon} boxSize={8} mb={3} />
                  <Text>No queries executed yet</Text>
                  <Text fontSize="sm" mt={1}>
                    Execute your first SQL query to see results here
                  </Text>
                </Box>
              ) : (
                <VStack spacing={3} align="stretch">
                  {queries.map(query => (
                    <Box 
                      key={query.id} 
                      p={4} 
                      border="1px" 
                      borderColor="gray.200" 
                      borderRadius="md"
                      bg="white"
                    >
                      <HStack justify="space-between" mb={3}>
                        <HStack spacing={3}>
                          <Badge 
                            size="sm" 
                            colorScheme={getQueryStatusColor(query.status)}
                          >
                            {query.status}
                          </Badge>
                          
                          {query.executionTime > 0 && (
                            <Text fontSize="xs" color="gray.500">
                              {query.executionTime}ms
                            </Text>
                          )}
                        </HStack>
                        
                        <Text fontSize="xs" color="gray.500">
                          {query.timestamp.toLocaleTimeString()}
                        </Text>
                      </HStack>
                      
                      <Box p={3} bg="gray.50" borderRadius="md" mb={3}>
                        <Text fontSize="sm" fontFamily="mono" color="gray.700">
                          {query.sql}
                        </Text>
                      </Box>
                      
                      {query.status === 'completed' && query.result && (
                        <Box p={3} bg="green.50" borderRadius="md" border="1px" borderColor="green.200" mb={3}>
                          <Text fontSize="xs" fontWeight="semibold" color="green.700" mb={2}>
                            Result: {query.result.rows} rows returned
                          </Text>
                          <Text fontSize="xs" color="green.600" fontFamily="mono">
                            Columns: {query.result.columns.join(', ')}
                          </Text>
                        </Box>
                      )}
                      
                      {query.status === 'failed' && query.error && (
                        <Box p={3} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
                          <Text fontSize="xs" fontWeight="semibold" color="red.700" mb={1}>
                            Error:
                          </Text>
                          <Text fontSize="xs" color="red.600" fontFamily="mono">
                            {query.error}
                          </Text>
                        </Box>
                      )}
                    </Box>
                  ))}
                </VStack>
              )}
            </VStack>
          </TabPanel>

          {/* Migrations Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                  Database Migrations ({migrations.length})
                </Text>
                
                <Button
                  size="sm"
                  colorScheme="green"
                  onClick={runMigrations}
                  isLoading={isMigrationRunning}
                  leftIcon={<PlayIcon />}
                >
                  Run All Pending
                </Button>
              </HStack>
              
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Migration</Th>
                    <Th>Status</Th>
                    <Th>Timestamp</Th>
                    <Th>Duration</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {migrations.map(migration => (
                    <Tr key={migration.id}>
                      <Td fontWeight="semibold">{migration.name}</Td>
                      <Td>
                        <Badge 
                          size="sm" 
                          colorScheme={getMigrationStatusColor(migration.status)}
                        >
                          {migration.status}
                        </Badge>
                      </Td>
                      <Td fontSize="xs" color="gray.600">
                        {migration.timestamp.toLocaleDateString()}
                      </Td>
                      <Td>
                        {migration.duration ? (
                          <Text fontSize="xs" color="gray.600">
                            {migration.duration}ms
                          </Text>
                        ) : (
                          <Text fontSize="xs" color="gray.400">-</Text>
                        )}
                      </Td>
                      <Td>
                        {migration.status === 'pending' && (
                          <Button
                            size="xs"
                            colorScheme="green"
                            variant="outline"
                            onClick={() => runMigrations()}
                            isDisabled={isMigrationRunning}
                          >
                            Run
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Query Modal */}
      <Modal isOpen={isQueryModalOpen} onClose={onQueryModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Execute SQL Query</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Enter your SQL query to execute against the database.
              </Text>
              
              <Textarea
                placeholder="SELECT * FROM users WHERE status = 'active';"
                value={currentQuery}
                onChange={(e) => setCurrentQuery(e.target.value)}
                rows={6}
                fontFamily="mono"
                fontSize="sm"
              />
              
              <HStack spacing={3}>
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    executeQuery(currentQuery);
                    onQueryModalClose();
                    setCurrentQuery('');
                  }}
                  isLoading={isQueryRunning}
                  isDisabled={!currentQuery.trim()}
                >
                  Execute Query
                </Button>
                
                <Button variant="ghost" onClick={onQueryModalClose}>
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};
