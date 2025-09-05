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
  Progress,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Select,
  Input,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react';
import { 
  PlayIcon,
  StopIcon,
  BeakerIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { AgentManager } from '../../agent/core/AgentManager';

interface TestRunnerProps {
  agentManager: AgentManager | null;
  onClose: () => void;
}

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration: number;
  error?: string;
  output?: string;
  timestamp: Date;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
}

/**
 * Test Runner - Comprehensive testing interface for developers
 * Provides test execution, monitoring, and results analysis
 */
export const TestRunner: React.FC<TestRunnerProps> = ({
  agentManager,
  onClose
}) => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<string>('all');
  const [testFilter, setTestFilter] = useState<string>('');
  const [coverage, setCoverage] = useState<number>(0);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const toast = useToast();
  const { isOpen: isConfigOpen, onOpen: onConfigOpen, onClose: onConfigClose } = useDisclosure();

  // Load available test suites
  useEffect(() => {
    loadTestSuites();
  }, []);

  // Load test suites
  const loadTestSuites = async () => {
    try {
      setIsLoading(true);
      
      // Mock test suites - in real implementation, this would scan the project
      const suites: TestSuite[] = [
        {
          name: 'Unit Tests',
          tests: [
            { id: '1', name: 'User authentication', status: 'pending', duration: 0, timestamp: new Date() },
            { id: '2', name: 'Database operations', status: 'pending', duration: 0, timestamp: new Date() },
            { id: '3', name: 'API endpoints', status: 'pending', duration: 0, timestamp: new Date() }
          ],
          totalTests: 3,
          passedTests: 0,
          failedTests: 0,
          duration: 0
        },
        {
          name: 'Integration Tests',
          tests: [
            { id: '4', name: 'User flow', status: 'pending', duration: 0, timestamp: new Date() },
            { id: '5', name: 'Payment processing', status: 'pending', duration: 0, timestamp: new Date() }
          ],
          totalTests: 2,
          passedTests: 0,
          failedTests: 0,
          duration: 0
        },
        {
          name: 'E2E Tests',
          tests: [
            { id: '6', name: 'Complete booking flow', status: 'pending', duration: 0, timestamp: new Date() },
            { id: '7', name: 'Driver assignment', status: 'pending', duration: 0, timestamp: new Date() }
          ],
          totalTests: 2,
          passedTests: 0,
          failedTests: 0,
          duration: 0
        }
      ];
      
      setTestSuites(suites);
    } catch (error) {
      toast({
        title: 'Failed to Load Tests',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    if (!agentManager) return;

    try {
      setIsRunning(true);
      setExecutionTime(0);
      const startTime = Date.now();
      
      toast({
        title: 'Running Tests',
        description: 'Executing all test suites...',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });

      // Reset all test statuses
      setTestSuites(prev => prev.map(suite => ({
        ...suite,
        tests: suite.tests.map(test => ({ ...test, status: 'running' as const })),
        passedTests: 0,
        failedTests: 0,
        duration: 0
      })));

      // Simulate test execution
      for (const suite of testSuites) {
        for (const test of suite.tests) {
          // Simulate test execution time
          await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
          
          // Simulate test results
          const passed = Math.random() > 0.2; // 80% pass rate
          const duration = Math.random() * 2000 + 500;
          
          setTestSuites(prev => prev.map(s => {
            if (s.name === suite.name) {
              const updatedTests = s.tests.map(t => {
                if (t.id === test.id) {
                  return {
                    ...t,
                    status: passed ? 'passed' : 'failed',
                    duration,
                    error: passed ? undefined : 'Test assertion failed',
                    output: passed ? 'Test passed successfully' : 'Expected true but got false'
                  };
                }
                return t;
              });
              
              const passedTests = updatedTests.filter(t => t.status === 'passed').length;
              const failedTests = updatedTests.filter(t => t.status === 'failed').length;
              const totalDuration = updatedTests.reduce((sum, t) => sum + t.duration, 0);
              
              return {
                ...s,
                tests: updatedTests,
                passedTests,
                failedTests,
                duration: totalDuration
              };
            }
            return s;
          }));
        }
      }

      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      
      // Calculate coverage
      const totalTests = testSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
      const passedTests = testSuites.reduce((sum, suite) => sum + suite.passedTests, 0);
      setCoverage(Math.round((passedTests / totalTests) * 100));
      
      toast({
        title: 'Tests Completed',
        description: `All tests finished in ${Math.round((endTime - startTime) / 1000)}s`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Test Execution Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Run specific test suite
  const runTestSuite = async (suiteName: string) => {
    if (!agentManager) return;

    try {
      setIsRunning(true);
      
      toast({
        title: 'Running Test Suite',
        description: `Executing ${suiteName}...`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });

      // Find and run the specific suite
      const suite = testSuites.find(s => s.name === suiteName);
      if (!suite) return;

      // Reset suite test statuses
      setTestSuites(prev => prev.map(s => {
        if (s.name === suiteName) {
          return {
            ...s,
            tests: s.tests.map(test => ({ ...test, status: 'running' as const })),
            passedTests: 0,
            failedTests: 0,
            duration: 0
          };
        }
        return s;
      }));

      // Simulate suite execution
      for (const test of suite.tests) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
        
        const passed = Math.random() > 0.2;
        const duration = Math.random() * 2000 + 500;
        
        setTestSuites(prev => prev.map(s => {
          if (s.name === suiteName) {
            const updatedTests = s.tests.map(t => {
              if (t.id === test.id) {
                return {
                  ...t,
                  status: passed ? 'passed' : 'failed',
                  duration,
                  error: passed ? undefined : 'Test assertion failed',
                  output: passed ? 'Test passed successfully' : 'Expected true but got false'
                };
              }
              return t;
            });
            
            const passedTests = updatedTests.filter(t => t.status === 'passed').length;
            const failedTests = updatedTests.filter(t => t.status === 'failed').length;
            const totalDuration = updatedTests.reduce((sum, t) => sum + t.duration, 0);
            
            return {
              ...s,
              tests: updatedTests,
              passedTests,
              failedTests,
              duration: totalDuration
            };
          }
          return s;
        }));
      }

      toast({
        title: 'Test Suite Completed',
        description: `${suiteName} finished successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Test Suite Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Stop all tests
  const stopTests = () => {
    setIsRunning(false);
    setTestSuites(prev => prev.map(suite => ({
      ...suite,
      tests: suite.tests.map(test => 
        test.status === 'running' ? { ...test, status: 'pending' as const } : test
      )
    })));
    
    toast({
      title: 'Tests Stopped',
      description: 'Test execution has been stopped',
      status: 'warning',
      duration: 2000,
      isClosable: true,
    });
  };

  // Get test status icon
  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return CheckCircleIcon;
      case 'failed':
        return XCircleIcon;
      case 'running':
        return Spinner;
      case 'pending':
        return InformationCircleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  // Get test status color
  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'green';
      case 'failed':
        return 'red';
      case 'running':
        return 'blue';
      case 'pending':
        return 'gray';
      default:
        return 'gray';
    }
  };

  // Calculate overall statistics
  const overallStats = {
    totalTests: testSuites.reduce((sum, suite) => sum + suite.totalTests, 0),
    passedTests: testSuites.reduce((sum, suite) => sum + suite.passedTests, 0),
    failedTests: testSuites.reduce((sum, suite) => sum + suite.failedTests, 0),
    totalDuration: testSuites.reduce((sum, suite) => sum + suite.duration, 0)
  };

  // Filter test suites
  const filteredSuites = selectedSuite === 'all' 
    ? testSuites 
    : testSuites.filter(suite => suite.name === selectedSuite);

  return (
    <Box h="100%" bg="white" overflow="hidden">
      {/* Header */}
      <Box p={4} borderBottom="1px" borderColor="gray.200" bg="gray.50">
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
            <Icon as={BeakerIcon} boxSize={6} color="green.500" />
            <Text fontSize="xl" fontWeight="bold" color="gray.700">
              Test Runner
            </Text>
            <Badge size="lg" colorScheme="green" variant="subtle">
              {overallStats.totalTests} Tests
            </Badge>
          </HStack>
          
          <HStack spacing={3}>
            <Button
              size="sm"
              colorScheme="blue"
              variant="ghost"
              onClick={onConfigOpen}
              leftIcon={<CogIcon />}
            >
              Config
            </Button>
            
            <Button
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={stopTests}
              isDisabled={!isRunning}
              leftIcon={<StopIcon />}
            >
              Stop
            </Button>
            
            <Button
              size="sm"
              colorScheme="green"
              onClick={runAllTests}
              isLoading={isRunning}
              leftIcon={<PlayIcon />}
            >
              Run All Tests
            </Button>
          </HStack>
        </HStack>
      </Box>

      {/* Statistics Bar */}
      <Box p={4} bg="blue.50" borderBottom="1px" borderColor="blue.200">
        <HStack spacing={6} justify="center">
          <VStack spacing={1}>
            <Text fontSize="sm" color="gray.600">Total Tests</Text>
            <Badge size="lg" colorScheme="blue">{overallStats.totalTests}</Badge>
          </VStack>
          
          <VStack spacing={1}>
            <Text fontSize="sm" color="gray.600">Passed</Text>
            <Badge size="lg" colorScheme="green">{overallStats.passedTests}</Badge>
          </VStack>
          
          <VStack spacing={1}>
            <Text fontSize="sm" color="gray.600">Failed</Text>
            <Badge size="lg" colorScheme="red">{overallStats.failedTests}</Badge>
          </VStack>
          
          <VStack spacing={1}>
            <Text fontSize="sm" color="gray.600">Coverage</Text>
            <Badge size="lg" colorScheme="purple">{coverage}%</Badge>
          </VStack>
          
          <VStack spacing={1}>
            <Text fontSize="sm" color="gray.600">Duration</Text>
            <Badge size="lg" colorScheme="teal">
              {Math.round(overallStats.totalDuration / 1000)}s
            </Badge>
          </VStack>
        </HStack>
        
        {overallStats.totalTests > 0 && (
          <Progress
            value={(overallStats.passedTests / overallStats.totalTests) * 100}
            colorScheme="green"
            size="sm"
            mt={3}
          />
        )}
      </Box>

      {/* Controls */}
      <Box p={4} borderBottom="1px" borderColor="gray.200">
        <HStack spacing={4}>
          <Select
            size="sm"
            value={selectedSuite}
            onChange={(e) => setSelectedSuite(e.target.value)}
            w="200px"
          >
            <option value="all">All Test Suites</option>
            {testSuites.map(suite => (
              <option key={suite.name} value={suite.name}>{suite.name}</option>
            ))}
          </Select>
          
          <Input
            size="sm"
            placeholder="Filter tests..."
            value={testFilter}
            onChange={(e) => setTestFilter(e.target.value)}
            w="300px"
          />
          
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            onClick={() => loadTestSuites()}
            isLoading={isLoading}
            leftIcon={<ArrowPathIcon />}
          >
            Refresh
          </Button>
        </HStack>
      </Box>

      {/* Test Results */}
      <Box flex={1} overflow="auto" p={4}>
        {filteredSuites.map(suite => (
          <Box key={suite.name} mb={6}>
            <HStack justify="space-between" mb={3}>
              <HStack spacing={3}>
                <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                  {suite.name}
                </Text>
                <Badge colorScheme="blue" variant="subtle">
                  {suite.tests.length} tests
                </Badge>
                <Badge colorScheme="green" variant="subtle">
                  {suite.passedTests} passed
                </Badge>
                <Badge colorScheme="red" variant="subtle">
                  {suite.failedTests} failed
                </Badge>
              </HStack>
              
              <Button
                size="sm"
                colorScheme="green"
                variant="outline"
                onClick={() => runTestSuite(suite.name)}
                isDisabled={isRunning}
                leftIcon={<PlayIcon />}
              >
                Run Suite
              </Button>
            </HStack>
            
            <Accordion allowMultiple>
              {suite.tests
                .filter(test => 
                  testFilter === '' || 
                  test.name.toLowerCase().includes(testFilter.toLowerCase())
                )
                .map(test => (
                <AccordionItem key={test.id} border="1px" borderColor="gray.200" borderRadius="md" mb={2}>
                  <AccordionButton p={3} _hover={{ bg: 'gray.50' }}>
                    <HStack spacing={3} flex={1} justify="flex-start">
                      <Icon 
                        as={getTestStatusIcon(test.status)} 
                        boxSize={4} 
                        color={`${getTestStatusColor(test.status)}.500`} 
                      />
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        {test.name}
                      </Text>
                      <Badge 
                        size="sm" 
                        colorScheme={getTestStatusColor(test.status)}
                        ml="auto"
                      >
                        {test.status}
                      </Badge>
                      {test.duration > 0 && (
                        <Text fontSize="xs" color="gray.500">
                          {Math.round(test.duration)}ms
                        </Text>
                      )}
                    </HStack>
                    <AccordionIcon />
                  </AccordionButton>
                  
                  <AccordionPanel pb={3} px={3}>
                    <VStack spacing={2} align="stretch">
                      {test.error && (
                        <Box p={2} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
                          <Text fontSize="xs" fontWeight="semibold" color="red.700" mb={1}>
                            Error:
                          </Text>
                          <Text fontSize="xs" color="red.600" fontFamily="mono">
                            {test.error}
                          </Text>
                        </Box>
                      )}
                      
                      {test.output && (
                        <Box p={2} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
                          <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={1}>
                            Output:
                          </Text>
                          <Text fontSize="xs" color="gray.600" fontFamily="mono">
                            {test.output}
                          </Text>
                        </Box>
                      )}
                      
                      <Text fontSize="xs" color="gray.500">
                        Executed at: {test.timestamp.toLocaleTimeString()}
                      </Text>
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>
        ))}
      </Box>

      {/* Configuration Modal */}
      <Modal isOpen={isConfigOpen} onClose={onConfigClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Test Configuration</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Configure test execution settings and preferences.
              </Text>
              
              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={2}>
                  Test Framework
                </Text>
                <Select size="sm" defaultValue="jest">
                  <option value="jest">Jest</option>
                  <option value="vitest">Vitest</option>
                  <option value="mocha">Mocha</option>
                </Select>
              </Box>
              
              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={2}>
                  Coverage Threshold
                </Text>
                <Input size="sm" placeholder="80" type="number" />
              </Box>
              
              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={2}>
                  Timeout (ms)
                </Text>
                <Input size="sm" placeholder="5000" type="number" />
              </Box>
              
              <Button colorScheme="blue" onClick={onConfigClose}>
                Save Configuration
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};
