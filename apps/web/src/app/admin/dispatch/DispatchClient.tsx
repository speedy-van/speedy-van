'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
  Flex,
  Button,
  Icon,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Spinner,
  Tooltip,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Avatar,
  AvatarGroup,
  useColorModeValue
} from '@chakra-ui/react';
import {
  FaMapMarkedAlt,
  FaTruck,
  FaExclamationTriangle,
  FaCog,
  FaPlay,
  FaPause,
  FaEye,
  FaUser,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaPlus,
  FaFilter,
  FaEllipsisV,
  FaCheck,
  FaTimes,
  FaEdit,
  FaBell,
  FaChartLine,
  FaRoute,
  FaCalendarAlt,
  FaShieldAlt,
  FaWifi,
  FaSignal,
  FaExclamationCircle,
  FaCheckCircle,
  FaClock as FaClockIcon,
  FaUserTie,
  FaCar,
  FaWeightHanging
} from 'react-icons/fa';
import { formatDistanceToNow, format } from 'date-fns';

interface DispatchData {
  jobsByStatus: Record<string, number>;
  activeJobs: any[];
  availableDrivers: any[];
  openIncidents: any[];
  autoAssignRules: any;
}

interface DispatchClientProps {
  data: DispatchData;
}

interface JobStatus {
  id: string;
  title: string;
  color: string;
  icon: any;
  jobs: any[];
}

interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
  lastUpdate: Date;
  status: 'online' | 'offline' | 'break';
}

export default function DispatchClient({ data }: DispatchClientProps) {
  const [selectedView, setSelectedView] = useState<'board' | 'map'>('board');
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [incidentForm, setIncidentForm] = useState({
    category: '',
    description: '',
    severity: 'medium'
  });
  
  // Real-time state
  const [driverLocations, setDriverLocations] = useState<DriverLocation[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [driverDetailsOpen, setDriverDetailsOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    area: 'all',
    driver: 'all'
  });
  
  // Auto-refresh timer
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isIncidentOpen, 
    onOpen: onIncidentOpen, 
    onClose: onIncidentClose 
  } = useDisclosure();
  
  // Real-time connection setup
  useEffect(() => {
    // Simulate real-time connection
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      setIsConnected(true);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would fetch fresh data
      console.log('Refreshing dispatch data...');
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);
  
  // Job status columns configuration
  const jobStatuses: JobStatus[] = [
    {
      id: 'DRAFT',
      title: 'Unassigned',
      color: 'gray',
      icon: FaTruck,
      jobs: data.activeJobs.filter(job => job.status === 'DRAFT')
    },
    {
      id: 'CONFIRMED',
      title: 'CONFIRMED',
      color: 'blue',
      icon: FaUserTie,
      jobs: data.activeJobs.filter(job => job.status === 'CONFIRMED')
    },
    {
      id: 'in_progress',
      title: 'En Route',
      color: 'yellow',
      icon: FaRoute,
      jobs: data.activeJobs.filter(job => job.status === 'in_progress')
    },
    {
      id: 'picked_up',
      title: 'At Pickup',
      color: 'orange',
      icon: FaMapMarkerAlt,
      jobs: data.activeJobs.filter(job => job.status === 'picked_up')
    },
    {
      id: 'in_transit',
      title: 'In Transit',
      color: 'purple',
      icon: FaCar,
      jobs: data.activeJobs.filter(job => job.status === 'in_transit')
    },
    {
      id: 'COMPLETED',
      title: 'COMPLETED',
      color: 'green',
      icon: FaCheckCircle,
      jobs: data.activeJobs.filter(job => job.status === 'COMPLETED')
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'gray';
      case 'CONFIRMED': return 'blue';
      case 'in_progress': return 'yellow';
      case 'picked_up': return 'orange';
      case 'COMPLETED': return 'green';
      default: return 'gray';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'green';
      case 'medium': return 'yellow';
      case 'high': return 'orange';
      case 'critical': return 'red';
      default: return 'yellow';
    }
  };

  const handleAssignJob = async (jobId: string, driverId: string) => {
    try {
      const response = await fetch(`/api/admin/dispatch/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          driverId
        }),
      });

      if (response.ok) {
        toast({
          title: "Job assigned successfully",
          description: "The job has been assigned to the driver",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // Refresh data
        window.location.reload();
      } else {
        throw new Error('Assignment failed');
      }
    } catch (error) {
      toast({
        title: "Assignment failed",
        description: "Failed to assign job to driver",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCreateIncident = async () => {
    if (!incidentForm.category || !incidentForm.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/dispatch/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...incidentForm,
          driverId: selectedDriver?.id,
          jobId: selectedJob?.id
        }),
      });

      if (response.ok) {
        toast({
          title: "Incident created",
          description: "The incident has been logged",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setIncidentForm({ category: '', description: '', severity: 'medium' });
        onIncidentClose();
        // Refresh data
        window.location.reload();
      } else {
        throw new Error('Failed to create incident');
      }
    } catch (error) {
      toast({
        title: "Failed to create incident",
        description: "Please try again",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleToggleAutoAssign = async () => {
    try {
      const response = await fetch('/api/admin/dispatch/auto-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: !autoAssignEnabled
        }),
      });

      if (response.ok) {
        setAutoAssignEnabled(!autoAssignEnabled);
        toast({
          title: `Auto-assign ${!autoAssignEnabled ? 'enabled' : 'disabled'}`,
          description: `Auto-assignment has been ${!autoAssignEnabled ? 'enabled' : 'disabled'}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to toggle auto-assign');
      }
    } catch (error) {
      toast({
        title: "Failed to toggle auto-assign",
        description: "Please try again",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      {/* Header with real-time indicators */}
      <Flex justify="space-between" align="center" mb={6}>
        <VStack align="start" spacing={1}>
          <HStack spacing={3}>
            <Heading size="lg">Dispatch & Live Operations</Heading>
            <HStack spacing={2}>
              <Box
                w={3}
                h={3}
                borderRadius="full"
                bg={isConnected ? "green.500" : "red.500"}
                animation={isConnected ? "pulse 2s infinite" : "none"}
              />
              <Text fontSize="sm" color="gray.600">
                {isConnected ? "Live" : "Offline"}
              </Text>
            </HStack>
          </HStack>
          <Text fontSize="sm" color="gray.500">
            Last updated: {format(lastUpdate, 'HH:mm:ss')} • {data.activeJobs.length} active jobs
          </Text>
        </VStack>
        
        <HStack spacing={4}>
          {/* Quick Stats */}
          <HStack spacing={6}>
            <Stat size="sm">
              <StatLabel>Available Drivers</StatLabel>
              <StatNumber>{data.availableDrivers.length}</StatNumber>
            </Stat>
            <Stat size="sm">
              <StatLabel>Open Incidents</StatLabel>
              <StatNumber color="red.500">{data.openIncidents.length}</StatNumber>
            </Stat>
          </HStack>
          
          <Button
            leftIcon={<Icon as={autoAssignEnabled ? FaPause : FaPlay} />}
            colorScheme={autoAssignEnabled ? "green" : "gray"}
            onClick={handleToggleAutoAssign}
          >
            Auto-Assign {autoAssignEnabled ? "ON" : "OFF"}
          </Button>
          <Button
            leftIcon={<FaCog />}
            variant="outline"
            onClick={onOpen}
          >
            Auto-Assign Rules
          </Button>
        </HStack>
      </Flex>

      {/* View Toggle */}
      <HStack spacing={4} mb={6}>
        <Button
          variant={selectedView === 'board' ? 'solid' : 'outline'}
          onClick={() => setSelectedView('board')}
        >
          Board View
        </Button>
        <Button
          variant={selectedView === 'map' ? 'solid' : 'outline'}
          onClick={() => setSelectedView('map')}
          leftIcon={<FaMapMarkedAlt />}
        >
          Live Map
        </Button>
      </HStack>

      {selectedView === 'board' ? (
        <Box overflowX="auto">
          <Grid templateColumns="repeat(6, 1fr)" gap={4} minW="1200px">
            {jobStatuses.map((status) => (
              <Card key={status.id} h="fit-content">
                <CardHeader pb={2}>
                  <Flex justify="space-between" align="center">
                    <HStack spacing={2}>
                      <Icon as={status.icon} color={`${status.color}.500`} />
                      <Heading size="sm">{status.title}</Heading>
                    </HStack>
                    <Badge colorScheme={status.color} variant="subtle">
                      {status.jobs.length}
                    </Badge>
                  </Flex>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={3} align="stretch" minH="400px">
                    {status.jobs.map((job) => (
                      <Box
                        key={job.id}
                        p={3}
                        border="1px"
                        borderColor="gray.200"
                        borderRadius="md"
                        bg="white"
                        _hover={{ shadow: "md", transform: "translateY(-1px)" }}
                        transition="all 0.2s"
                        cursor="pointer"
                        onClick={() => {
                          setSelectedJob(job);
                          setJobDetailsOpen(true);
                        }}
                      >
                        <VStack align="start" spacing={2}>
                          <HStack justify="space-between" w="full">
                            <Text fontWeight="bold" fontSize="sm">#{job.reference}</Text>
                            <Badge colorScheme={getStatusColor(job.status)} size="sm">
                              {job.status.replace('_', ' ')}
                            </Badge>
                          </HStack>
                          
                          <VStack align="start" spacing={1} w="full">
                            <HStack spacing={1} fontSize="xs" color="gray.600">
                              <Icon as={FaMapMarkerAlt} />
                              <Text noOfLines={1}>{job.pickupAddress}</Text>
                            </HStack>
                            <HStack spacing={1} fontSize="xs" color="gray.600">
                              <Icon as={FaMapMarkerAlt} />
                              <Text noOfLines={1}>{job.dropoffAddress}</Text>
                            </HStack>
                          </VStack>
                          
                          <HStack justify="space-between" w="full" fontSize="xs">
                            <Text color="gray.500">
                              {job.customer.name}
                            </Text>
                            <Text color="gray.400">
                              {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                            </Text>
                          </HStack>
                          
                          {job.driver && (
                            <HStack spacing={1} fontSize="xs" color="blue.600">
                              <Icon as={FaUser} />
                              <Text>{job.driver.user.name}</Text>
                            </HStack>
                          )}
                          
                          {status.id === 'DRAFT' && (
                            <HStack spacing={2} w="full">
                              <Button size="xs" colorScheme="blue" flex={1}>
                                Auto-Assign
                              </Button>
                              <Button size="xs" variant="outline" flex={1}>
                                Manual
                              </Button>
                            </HStack>
                          )}
                          
                          {['in_progress', 'picked_up', 'in_transit'].includes(status.id) && (
                            <HStack spacing={2} w="full">
                              <Button size="xs" variant="outline" flex={1}>
                                <Icon as={FaEye} />
                              </Button>
                              <Button size="xs" variant="outline" flex={1}>
                                <Icon as={FaPhone} />
                              </Button>
                            </HStack>
                          )}
                        </VStack>
                      </Box>
                    ))}
                    
                    {status.jobs.length === 0 && (
                      <Box
                        p={6}
                        border="2px dashed"
                        borderColor="gray.200"
                        borderRadius="md"
                        textAlign="center"
                      >
                        <Icon as={status.icon} boxSize={6} color="gray.300" mb={2} />
                        <Text fontSize="sm" color="gray.400">
                          No {status.title.toLowerCase()} jobs
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </Box>
      ) : (
        /* Live Map View */
        <Grid templateColumns={{ base: "1fr", lg: "1fr 350px" }} gap={6}>
          {/* Map Area */}
          <Card>
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="md">Live Map</Heading>
                <HStack spacing={2}>
                  <Button size="sm" variant="outline" leftIcon={<FaWifi />}>
                    Traffic
                  </Button>
                  <Button size="sm" variant="outline" leftIcon={<FaChartLine />}>
                    Heat Map
                  </Button>
                  <Button size="sm" variant="outline" leftIcon={<FaMapMarkerAlt />}>
                    Draw Radius
                  </Button>
                </HStack>
              </Flex>
            </CardHeader>
            <CardBody p={0}>
              <Box 
                bg="gray.100" 
                h="600px" 
                borderRadius="md" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                position="relative"
              >
                <VStack>
                  <Icon as={FaMapMarkedAlt} boxSize={16} color="gray.400" />
                  <Text color="gray.500" fontSize="lg">Interactive Map Component</Text>
                  <Text fontSize="sm" color="gray.400">
                    Will integrate with Google Maps or Mapbox
                  </Text>
                  <Button mt={4} colorScheme="blue">
                    Open Full Map
                  </Button>
                </VStack>
                
                {/* Map Controls Overlay */}
                <Box position="absolute" top={4} left={4}>
                  <VStack spacing={2}>
                    <Button size="sm" variant="outline" bg="white" boxShadow="md">
                      Traffic
                    </Button>
                    <Button size="sm" variant="outline" bg="white" boxShadow="md">
                      Heat Map
                    </Button>
                    <Button size="sm" variant="outline" bg="white" boxShadow="md">
                      Draw Radius
                    </Button>
                  </VStack>
                </Box>

                {/* Legend */}
                <Box position="absolute" bottom={4} right={4} bg="white" p={3} borderRadius="md" boxShadow="md">
                  <VStack spacing={2} align="start">
                    <Text fontSize="sm" fontWeight="bold">Legend</Text>
                    <HStack spacing={2}>
                      <Box w={3} h={3} bg="green.500" borderRadius="full" />
                      <Text fontSize="xs">Available Drivers</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Box w={3} h={3} bg="blue.500" borderRadius="full" />
                      <Text fontSize="xs">Active Jobs</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Box w={3} h={3} bg="red.500" borderRadius="full" />
                      <Text fontSize="xs">Unassigned Jobs</Text>
                    </HStack>
                  </VStack>
                </Box>
              </Box>
            </CardBody>
          </Card>

          {/* Sidebar */}
          <VStack spacing={6} align="stretch">
            {/* Auto-Assign Rules */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Auto-Assign Rules</Heading>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm">Radius (km)</Text>
                    <Input size="sm" w="80px" defaultValue="5" />
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Max Jobs</Text>
                    <Input size="sm" w="80px" defaultValue="3" />
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Min Rating</Text>
                    <Input size="sm" w="80px" defaultValue="4.0" />
                  </HStack>
                  <Button size="sm" colorScheme="blue">
                    Apply Rules
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Active Drivers */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Active Drivers</Heading>
                <VStack spacing={3} align="stretch">
                  {data.availableDrivers.slice(0, 5).map((driver) => (
                    <HStack key={driver.id} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="sm">{driver.user.name}</Text>
                        <Text fontSize="xs" color="gray.600">Online</Text>
                        <Text fontSize="xs" color="blue.600">{driver.rating || 'N/A'} ⭐</Text>
                      </VStack>
                      <VStack align="end" spacing={1}>
                        <Badge colorScheme="green" size="sm">
                          Available
                        </Badge>
                        <Button size="xs" variant="outline">
                          <Icon as={FaMapMarkerAlt} />
                        </Button>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* Active Jobs */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Active Jobs</Heading>
                <VStack spacing={3} align="stretch">
                  {data.activeJobs.slice(0, 5).map((job) => (
                    <HStack key={job.id} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="sm">{job.reference}</Text>
                        <Text fontSize="xs" color="gray.600">
                          {job.pickupAddress?.split(',')[0]} → {job.dropoffAddress?.split(',')[0]}
                        </Text>
                        {job.driver && (
                          <Text fontSize="xs" color="blue.600">Driver: {job.driver.user.name}</Text>
                        )}
                      </VStack>
                      <Badge colorScheme={getStatusColor(job.status)} size="sm">
                        {job.status.replace("-", " ")}
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* Recent Incidents */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Recent Incidents</Heading>
                <VStack spacing={3} align="stretch">
                  {data.openIncidents.slice(0, 3).map((incident) => (
                    <HStack key={incident.id} justify="space-between" p={2} bg="red.50" borderRadius="md">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="sm">{incident.category}</Text>
                        <Text fontSize="xs" color="gray.600">
                          {incident.driver?.user.name} • {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
                        </Text>
                      </VStack>
                      <Button size="xs" colorScheme="red">
                        Resolve
                      </Button>
                    </HStack>
                  ))}
                  {data.openIncidents.length === 0 && (
                    <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                      No recent incidents
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Grid>
      )}

      {/* Available Drivers */}
      <Card mt={6}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Available Drivers</Heading>
            <HStack spacing={2}>
              <Badge colorScheme="green" variant="subtle">
                {data.availableDrivers.length} Online
              </Badge>
              <Button size="sm" variant="outline" leftIcon={<FaFilter />}>
                Filter
              </Button>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {data.availableDrivers.map(driver => (
              <Box 
                key={driver.id} 
                p={4} 
                border="1px" 
                borderColor="gray.200" 
                borderRadius="md"
                _hover={{ shadow: "md", borderColor: "blue.200" }}
                transition="all 0.2s"
                cursor="pointer"
                onClick={() => {
                  setSelectedDriver(driver);
                  setDriverDetailsOpen(true);
                }}
              >
                <VStack align="start" spacing={3}>
                  <HStack justify="space-between" w="full">
                    <HStack spacing={2}>
                      <Avatar size="sm" name={driver.user.name} />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="sm">{driver.user.name}</Text>
                        <Text fontSize="xs" color="gray.500">{driver.user.email}</Text>
                      </VStack>
                    </HStack>
                    <Badge colorScheme="green" size="sm">Online</Badge>
                  </HStack>
                  
                  <HStack spacing={4} w="full" fontSize="xs">
                    <HStack spacing={1}>
                      <Icon as={FaCar} color="gray.400" />
                      <Text color="gray.600">
                        {driver.vehicles[0]?.make} {driver.vehicles[0]?.model}
                      </Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={FaWeightHanging} color="gray.400" />
                      <Text color="gray.600">{driver.vehicles[0]?.weightClass || 'N/A'}</Text>
                    </HStack>
                  </HStack>
                  
                  <HStack justify="space-between" w="full">
                    <HStack spacing={1}>
                      <Text fontSize="sm" color="blue.600">⭐ {driver.rating || 'N/A'}</Text>
                      <Text fontSize="xs" color="gray.500">({driver.ratings?.length || 0} reviews)</Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      {driver.bookings?.filter((b: any) => ['CONFIRMED', 'in_progress', 'picked_up'].includes(b.status)).length || 0} active jobs
                    </Text>
                  </HStack>
                  
                  <HStack spacing={2} w="full">
                    <Button size="sm" variant="outline" flex={1} leftIcon={<FaPhone />}>
                      Call
                    </Button>
                    <Button size="sm" variant="outline" flex={1} leftIcon={<FaMapMarkerAlt />}>
                      Track
                    </Button>
                    <Button size="sm" variant="outline" flex={1} leftIcon={<FaEnvelope />}>
                      Message
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            ))}
            {data.availableDrivers.length === 0 && (
              <Box 
                p={8} 
                border="2px dashed" 
                borderColor="gray.200" 
                borderRadius="md" 
                textAlign="center"
                gridColumn="1 / -1"
              >
                <Icon as={FaTruck} boxSize={8} color="gray.300" mb={3} />
                <Text color="gray.500" fontSize="lg" mb={2}>No drivers currently available</Text>
                <Text fontSize="sm" color="gray.400">
                  All drivers are either offline or have reached their job limit
                </Text>
              </Box>
            )}
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Open Incidents */}
      <Card mt={6}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Open Incidents</Heading>
            <Button size="sm" leftIcon={<FaPlus />} onClick={onIncidentOpen}>
              Create Incident
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          {data.openIncidents.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Driver</Th>
                  <Th>Job</Th>
                  <Th>Category</Th>
                  <Th>Severity</Th>
                  <Th>Reported</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.openIncidents.map(incident => (
                  <Tr key={incident.id}>
                    <Td>{incident.driver.user.name}</Td>
                    <Td>#{incident.assignment.booking.reference}</Td>
                    <Td>{incident.category}</Td>
                    <Td>
                      <Badge colorScheme={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                    </Td>
                    <Td>{formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button size="sm" variant="outline">
                          <Icon as={FaEye} />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Icon as={FaEdit} />
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text color="gray.500" textAlign="center" py={8}>
              No open incidents
            </Text>
          )}
        </CardBody>
      </Card>

      {/* Auto-Assign Rules Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Auto-Assign Rules Configuration</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Tabs>
              <TabList>
                <Tab>Basic Rules</Tab>
                <Tab>Advanced Logic</Tab>
                <Tab>Priority Settings</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Search Radius (km)</FormLabel>
                      <NumberInput defaultValue={data.autoAssignRules.radius / 1000} min={1} max={50}>
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Text fontSize="sm" color="gray.500">Maximum distance to search for available drivers</Text>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Minimum Driver Rating</FormLabel>
                      <NumberInput defaultValue={data.autoAssignRules.rating} min={1} max={5} step={0.1}>
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Text fontSize="sm" color="gray.500">Only assign to drivers with this rating or higher</Text>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Maximum Jobs per Driver</FormLabel>
                      <NumberInput defaultValue={data.autoAssignRules.maxJobs} min={1} max={10}>
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Text fontSize="sm" color="gray.500">Prevent overloading drivers with too many jobs</Text>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Vehicle Type Filter</FormLabel>
                      <Select defaultValue={data.autoAssignRules.vehicleType}>
                        <option value="any">Any Vehicle</option>
                        <option value="small">Small Van (up to 1.5t)</option>
                        <option value="medium">Medium Van (1.5t - 3.5t)</option>
                        <option value="large">Large Van (3.5t+)</option>
                        <option value="specialist">Specialist Equipment</option>
                      </Select>
                    </FormControl>
                  </VStack>
                </TabPanel>
                
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Load Capacity Filter</FormLabel>
                      <Select defaultValue={data.autoAssignRules.capacity}>
                        <option value="any">Any Capacity</option>
                        <option value="light">Light Loads (0-500kg)</option>
                        <option value="medium">Medium Loads (500kg-1.5t)</option>
                        <option value="heavy">Heavy Loads (1.5t+)</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Time Window Priority</FormLabel>
                      <Select defaultValue="urgent">
                        <option value="urgent">Prioritize Urgent Jobs</option>
                        <option value="scheduled">Prioritize Scheduled Jobs</option>
                        <option value="balanced">Balanced Approach</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Driver Experience Weight</FormLabel>
                      <Select defaultValue="medium">
                        <option value="low">Low (favor newer drivers)</option>
                        <option value="medium">Medium (balanced)</option>
                        <option value="high">High (favor experienced drivers)</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Geographic Preference</FormLabel>
                      <Select defaultValue="nearest">
                        <option value="nearest">Nearest Driver</option>
                        <option value="area_expert">Area Expert</option>
                        <option value="balanced">Balanced Distribution</option>
                      </Select>
                    </FormControl>
                  </VStack>
                </TabPanel>
                
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Alert status="info">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Priority Weights</AlertTitle>
                        <AlertDescription>
                          Configure how different factors influence driver selection. Higher weights mean greater importance.
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <FormControl>
                      <FormLabel>Distance Weight (0-100)</FormLabel>
                      <NumberInput defaultValue={70} min={0} max={100}>
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Rating Weight (0-100)</FormLabel>
                      <NumberInput defaultValue={20} min={0} max={100}>
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Experience Weight (0-100)</FormLabel>
                      <NumberInput defaultValue={10} min={0} max={100}>
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Current Load Weight (0-100)</FormLabel>
                      <NumberInput defaultValue={50} min={0} max={100}>
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Text fontSize="sm" color="gray.500">Prefer drivers with fewer current jobs</Text>
                    </FormControl>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>

            <Divider my={6} />

            <Alert status="warning">
              <AlertIcon />
              <Box>
                <AlertTitle>Auto-Assign Logic</AlertTitle>
                <AlertDescription>
                  Jobs will be automatically assigned to the best available driver based on these rules.
                  Drivers must be online and within the specified radius. The system will log why each driver was selected or skipped.
                </AlertDescription>
              </Box>
            </Alert>

            <HStack spacing={4} justify="flex-end" mt={6}>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue">
                Save Rules
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Create Incident Modal */}
      <Modal isOpen={isIncidentOpen} onClose={onIncidentClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Incident</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select 
                  value={incidentForm.category}
                  onChange={(e) => setIncidentForm({ ...incidentForm, category: e.target.value })}
                  placeholder="Select category"
                >
                  <option value="accident">Accident</option>
                  <option value="breakdown">Vehicle Breakdown</option>
                  <option value="delay">Delivery Delay</option>
                  <option value="damage">Property Damage</option>
                  <option value="customer_complaint">Customer Complaint</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Severity</FormLabel>
                <Select 
                  value={incidentForm.severity}
                  onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea 
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  placeholder="Describe the incident..."
                  rows={4}
                />
              </FormControl>

              <HStack spacing={4} justify="flex-end">
                <Button variant="outline" onClick={onIncidentClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleCreateIncident}>
                  Create Incident
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Job Details Drawer */}
      <Drawer isOpen={jobDetailsOpen} onClose={() => setJobDetailsOpen(false)} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Job Details - #{selectedJob?.reference}</DrawerHeader>
          <DrawerBody>
            {selectedJob && (
              <Tabs>
                <TabList>
                  <Tab>Overview</Tab>
                  <Tab>Timeline</Tab>
                  <Tab>Payment</Tab>
                  <Tab>Communications</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Card>
                        <CardBody>
                          <VStack spacing={3} align="stretch">
                            <HStack justify="space-between">
                              <Text fontWeight="bold">Status</Text>
                              <Badge colorScheme={getStatusColor(selectedJob.status)}>
                                {selectedJob.status.replace('_', ' ')}
                              </Badge>
                            </HStack>
                            <HStack justify="space-between">
                              <Text>Customer</Text>
                              <Text>{selectedJob.customer.name}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text>Created</Text>
                              <Text>{format(new Date(selectedJob.createdAt), 'PPp')}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text>Amount</Text>
                              <Text>£{(selectedJob.totalGBP / 100).toFixed(2)}</Text>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <Heading size="sm">Route</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack spacing={3} align="stretch">
                            <HStack spacing={2}>
                              <Icon as={FaMapMarkerAlt} color="green.500" />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="bold">Pickup</Text>
                                <Text fontSize="sm">{selectedJob.pickupAddress}</Text>
                              </VStack>
                            </HStack>
                            <HStack spacing={2}>
                              <Icon as={FaMapMarkerAlt} color="red.500" />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="bold">Dropoff</Text>
                                <Text fontSize="sm">{selectedJob.dropoffAddress}</Text>
                              </VStack>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                      
                      {selectedJob.driver && (
                        <Card>
                          <CardHeader>
                            <Heading size="sm">Assigned Driver</Heading>
                          </CardHeader>
                          <CardBody>
                            <HStack spacing={3}>
                              <Avatar name={selectedJob.driver.user.name} />
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">{selectedJob.driver.user.name}</Text>
                                <Text fontSize="sm" color="gray.600">{selectedJob.driver.user.email}</Text>
                                <Text fontSize="sm" color="blue.600">⭐ {selectedJob.driver.rating || 'N/A'}</Text>
                              </VStack>
                            </HStack>
                          </CardBody>
                        </Card>
                      )}
                    </VStack>
                  </TabPanel>
                  <TabPanel>
                    <Text>Timeline events will be displayed here</Text>
                  </TabPanel>
                  <TabPanel>
                    <Text>Payment information will be displayed here</Text>
                  </TabPanel>
                  <TabPanel>
                    <Text>Communication history will be displayed here</Text>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Driver Details Drawer */}
      <Drawer isOpen={driverDetailsOpen} onClose={() => setDriverDetailsOpen(false)} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Driver Details - {selectedDriver?.user.name}</DrawerHeader>
          <DrawerBody>
            {selectedDriver && (
              <Tabs>
                <TabList>
                  <Tab>Profile</Tab>
                  <Tab>Current Jobs</Tab>
                  <Tab>Performance</Tab>
                  <Tab>Documents</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Card>
                        <CardBody>
                          <HStack spacing={4}>
                            <Avatar size="lg" name={selectedDriver.user.name} />
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="bold" fontSize="lg">{selectedDriver.user.name}</Text>
                              <Text color="gray.600">{selectedDriver.user.email}</Text>
                              <HStack spacing={4}>
                                <Badge colorScheme="green">Online</Badge>
                                <Text fontSize="sm">⭐ {selectedDriver.rating || 'N/A'}</Text>
                              </HStack>
                            </VStack>
                          </HStack>
                        </CardBody>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <Heading size="sm">Vehicle Information</Heading>
                        </CardHeader>
                        <CardBody>
                          {selectedDriver.vehicles[0] ? (
                            <VStack spacing={2} align="stretch">
                              <HStack justify="space-between">
                                <Text>Vehicle</Text>
                                <Text>{selectedDriver.vehicles[0].make} {selectedDriver.vehicles[0].model}</Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text>Registration</Text>
                                <Text>{selectedDriver.vehicles[0].reg}</Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text>Weight Class</Text>
                                <Text>{selectedDriver.vehicles[0].weightClass}</Text>
                              </HStack>
                            </VStack>
                          ) : (
                            <Text color="gray.500">No vehicle information available</Text>
                          )}
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>
                  <TabPanel>
                    <Text>Current jobs will be displayed here</Text>
                  </TabPanel>
                  <TabPanel>
                    <Text>Performance metrics will be displayed here</Text>
                  </TabPanel>
                  <TabPanel>
                    <Text>Document status will be displayed here</Text>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
