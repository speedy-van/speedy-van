'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  IconButton,
  Tooltip,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
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
  Divider,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Heading,
  Icon,
} from '@chakra-ui/react';
import {
  FaMapMarkedAlt,
  FaTruck,
  FaUser,
  FaMapMarkerAlt,
  FaEye,
  FaPhone,
  FaEnvelope,
  FaRoute,
  FaClock,
  FaExclamationTriangle,
  FaFilter,
  FaLayerGroup,
  FaCrosshairs,
  FaExpand,
  FaCompress,
  FaInfoCircle,
  FaCar,
  FaWeightHanging,
  FaStar,
} from 'react-icons/fa';

interface Driver {
  id: string;
  user: {
    name: string;
    email: string;
  };
  rating: number;
  availability: {
    status: string;
  };
  vehicles: Array<{
    make: string;
    model: string;
    weightClass: string;
  }>;
  Booking: Array<{
    id: string;
    status: string;
  }>;
  location?: {
    lat: number;
    lng: number;
    lastUpdate: Date;
  };
}

interface Job {
  id: string;
  reference: string;
  status: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  customer: {
    name: string;
  };
  driver?: {
    id: string;
    user: {
      name: string;
    };
  };
  createdAt: Date;
  totalGBP: number;
}

interface DispatchMapProps {
  drivers: Driver[];
  jobs: Job[];
  incidents: any[];
  onDriverSelect?: (driver: Driver) => void;
  onJobSelect?: (job: Job) => void;
  onIncidentSelect?: (incident: any) => void;
}

export default function DispatchMap({
  drivers,
  jobs,
  incidents,
  onDriverSelect,
  onJobSelect,
  onIncidentSelect,
}: DispatchMapProps) {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [mapView, setMapView] = useState<'drivers' | 'jobs' | 'heatmap'>(
    'drivers'
  );
  const [showTraffic, setShowTraffic] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [driverDetailsOpen, setDriverDetailsOpen] = useState(false);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [filters, setFilters] = useState({
    driverStatus: 'all',
    jobStatus: 'all',
    radius: 10,
  });

  const toast = useToast();
  const mapRef = useRef<HTMLDivElement>(null);

  // Mock map data - in real implementation, this would integrate with Google Maps or Mapbox
  const mockMapData = {
    center: { lat: 51.5074, lng: -0.1278 }, // London
    zoom: 12,
    drivers: drivers.map(driver => ({
      ...driver,
      location: {
        lat: 51.5074 + (Math.random() - 0.5) * 0.1,
        lng: -0.1278 + (Math.random() - 0.5) * 0.1,
        lastUpdate: new Date(),
      },
    })),
    jobs: jobs.map(job => ({
      ...job,
      pickupLat: 51.5074 + (Math.random() - 0.5) * 0.1,
      pickupLng: -0.1278 + (Math.random() - 0.5) * 0.1,
      dropoffLat: 51.5074 + (Math.random() - 0.5) * 0.1,
      dropoffLng: -0.1278 + (Math.random() - 0.5) * 0.1,
    })),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'green';
      case 'offline':
        return 'gray';
      case 'break':
        return 'yellow';
      case 'DRAFT':
        return 'red';
      case 'CONFIRMED':
        return 'blue';
      case 'in_progress':
        return 'yellow';
      case 'picked_up':
        return 'orange';
      case 'COMPLETED':
        return 'green';
      default:
        return 'gray';
    }
  };

  const handleDriverClick = (driver: Driver) => {
    setSelectedDriver(driver);
    setDriverDetailsOpen(true);
    onDriverSelect?.(driver);
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setJobDetailsOpen(true);
    onJobSelect?.(job);
  };

  const toggleFullscreen = () => {
    if (mapRef.current) {
      if (!isFullscreen) {
        mapRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    if (
      filters.driverStatus !== 'all' &&
      driver.availability.status !== filters.driverStatus
    ) {
      return false;
    }
    return true;
  });

  const filteredJobs = jobs.filter(job => {
    if (filters.jobStatus !== 'all' && job.status !== filters.jobStatus) {
      return false;
    }
    return true;
  });

  return (
    <Box>
      {/* Map Container */}
      <Card>
        <CardBody p={0}>
          <Box
            ref={mapRef}
            position="relative"
            height={isFullscreen ? '100vh' : '600px'}
            bg="bg.surface.elevated"
            borderRadius="md"
            overflow="hidden"
          >
            {/* Map Placeholder */}
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              textAlign="center"
            >
              <VStack spacing={4}>
                <FaMapMarkedAlt size={48} color="#666" />
                <Text color="text.secondary" fontSize="lg">
                  Interactive Map Component
                </Text>
                <Text color="text.tertiary" fontSize="sm">
                  {filteredDrivers.length} drivers • {filteredJobs.length} jobs
                  • {incidents.length} incidents
                </Text>
                <Button colorScheme="blue" size="sm">
                  Integrate with Google Maps
                </Button>
              </VStack>
            </Box>

            {/* Map Controls Overlay */}
            <Box position="absolute" top={4} left={4} zIndex={10}>
              <VStack spacing={2}>
                <Tooltip label="Show Traffic">
                  <IconButton
                    size="sm"
                    variant={showTraffic ? 'solid' : 'outline'}
                    colorScheme={showTraffic ? 'blue' : 'gray'}
                    bg="bg.surface"
                    boxShadow="md"
                    aria-label="Traffic"
                    icon={<FaRoute />}
                    onClick={() => setShowTraffic(!showTraffic)}
                  />
                </Tooltip>
                <Tooltip label="Heat Map">
                  <IconButton
                    size="sm"
                    variant={showHeatmap ? 'solid' : 'outline'}
                    colorScheme={showHeatmap ? 'blue' : 'gray'}
                    bg="bg.surface"
                    boxShadow="md"
                    aria-label="Heat Map"
                    icon={<FaLayerGroup />}
                    onClick={() => setShowHeatmap(!showHeatmap)}
                  />
                </Tooltip>
                <Tooltip label="Center Map">
                  <IconButton
                    size="sm"
                    variant="outline"
                    bg="bg.surface"
                    boxShadow="md"
                    aria-label="Center"
                    icon={<FaCrosshairs />}
                  />
                </Tooltip>
                <Tooltip
                  label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  <IconButton
                    size="sm"
                    variant="outline"
                    bg="bg.surface"
                    boxShadow="md"
                    aria-label="Fullscreen"
                    icon={isFullscreen ? <FaCompress /> : <FaExpand />}
                    onClick={toggleFullscreen}
                  />
                </Tooltip>
              </VStack>
            </Box>

            {/* View Toggle */}
            <Box position="absolute" top={4} sx={{ right: '16px' }} zIndex={10}>
              <HStack
                spacing={2}
                bg="bg.surface"
                p={2}
                borderRadius="md"
                boxShadow="md"
              >
                <Button
                  size="sm"
                  variant={mapView === 'drivers' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => setMapView('drivers')}
                >
                  <FaTruck />
                </Button>
                <Button
                  size="sm"
                  variant={mapView === 'jobs' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => setMapView('jobs')}
                >
                  <FaMapMarkerAlt />
                </Button>
                <Button
                  size="sm"
                  variant={mapView === 'heatmap' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => setMapView('heatmap')}
                >
                  <FaLayerGroup />
                </Button>
              </HStack>
            </Box>

            {/* Legend */}
            <Box
              position="absolute"
              bottom={4}
              sx={{ right: '16px' }}
              bg="bg.surface"
              p={3}
              borderRadius="md"
              boxShadow="md"
              zIndex={10}
            >
              <VStack spacing={2} align="start">
                <Text fontSize="sm" fontWeight="bold">
                  Legend
                </Text>
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
                <HStack spacing={2}>
                  <Box w={3} h={3} bg="orange.500" borderRadius="full" />
                  <Text fontSize="xs">Incidents</Text>
                </HStack>
              </VStack>
            </Box>

            {/* Mock Driver Markers */}
            {mapView === 'drivers' &&
              filteredDrivers.map((driver, index) => (
                <Box
                  key={driver.id}
                  position="absolute"
                  left={`${20 + (index % 5) * 15}%`}
                  top={`${30 + Math.floor(index / 5) * 15}%`}
                  cursor="pointer"
                  onClick={() => handleDriverClick(driver)}
                  _hover={{ transform: 'scale(1.1)' }}
                  transition="transform 0.2s"
                >
                  <Tooltip
                    label={`${driver.user.name} - ${driver.availability.status}`}
                  >
                    <Box
                      w={8}
                      h={8}
                      bg={`${getStatusColor(driver.availability.status)}.500`}
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      boxShadow="md"
                      border="2px solid white"
                    >
                      <FaUser color="white" size={12} />
                    </Box>
                  </Tooltip>
                </Box>
              ))}

            {/* Mock Job Markers */}
            {mapView === 'jobs' &&
              filteredJobs.map((job, index) => (
                <Box
                  key={job.id}
                  position="absolute"
                  left={`${25 + (index % 4) * 18}%`}
                  top={`${25 + Math.floor(index / 4) * 18}%`}
                  cursor="pointer"
                  onClick={() => handleJobClick(job)}
                  _hover={{ transform: 'scale(1.1)' }}
                  transition="transform 0.2s"
                >
                  <Tooltip label={`${job.reference} - ${job.status}`}>
                    <Box
                      w={8}
                      h={8}
                      bg={`${getStatusColor(job.status)}.500`}
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      boxShadow="md"
                      border="2px solid white"
                    >
                      <FaMapMarkerAlt color="white" size={12} />
                    </Box>
                  </Tooltip>
                </Box>
              ))}

            {/* Status Bar */}
            <Box
              position="absolute"
              bottom={0}
              left={0}
              width="100%"
              bg="bg.surface"
              p={2}
              borderTop="1px solid"
              borderColor="border.primary"
            >
              <HStack justify="space-between" fontSize="sm">
                <HStack spacing={4}>
                  <Text>Drivers: {filteredDrivers.length}</Text>
                  <Text>Jobs: {filteredJobs.length}</Text>
                  <Text>Incidents: {incidents.length}</Text>
                </HStack>
                <Text color="text.tertiary">
                  Last updated: {new Date().toLocaleTimeString()}
                </Text>
              </HStack>
            </Box>
          </Box>
        </CardBody>
      </Card>

      {/* Driver Details Drawer */}
      <Drawer
        isOpen={driverDetailsOpen}
        onClose={() => setDriverDetailsOpen(false)}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Driver Details</DrawerHeader>
          <DrawerBody>
            {selectedDriver && (
              <VStack spacing={4} align="stretch">
                <Card>
                  <CardBody>
                    <HStack spacing={4}>
                      <Avatar size="lg" name={selectedDriver.user.name} />
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="bold" fontSize="lg">
                          {selectedDriver.user.name}
                        </Text>
                        <Text color="text.secondary">
                          {selectedDriver.user.email}
                        </Text>
                        <HStack spacing={4}>
                          <Badge
                            colorScheme={getStatusColor(
                              selectedDriver.availability.status
                            )}
                          >
                            {selectedDriver.availability.status}
                          </Badge>
                          <Text fontSize="sm">
                            ⭐ {selectedDriver.rating || 'N/A'}
                          </Text>
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
                          <Text>
                            {selectedDriver.vehicles[0].make}{' '}
                            {selectedDriver.vehicles[0].model}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Weight Class</Text>
                          <Text>{selectedDriver.vehicles[0].weightClass}</Text>
                        </HStack>
                      </VStack>
                    ) : (
                      <Text color="text.tertiary">
                        No vehicle information available
                      </Text>
                    )}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <Heading size="sm">Current Jobs</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={2} align="stretch">
                      {selectedDriver.Booking.length > 0 ? (
                        selectedDriver.Booking.map(booking => (
                          <HStack
                            key={booking.id}
                            justify="space-between"
                            p={2}
                            bg="bg.surface.elevated"
                            borderRadius="md"
                          >
                            <Text fontSize="sm">
                              Job #{booking.id.slice(-6)}
                            </Text>
                            <Badge
                              colorScheme={getStatusColor(booking.status)}
                              size="sm"
                            >
                              {booking.status}
                            </Badge>
                          </HStack>
                        ))
                      ) : (
                        <Text color="text.tertiary">No active jobs</Text>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                <HStack spacing={2}>
                  <Button leftIcon={<FaPhone />} colorScheme="blue" flex={1}>
                    Call Driver
                  </Button>
                  <Button leftIcon={<FaEnvelope />} variant="outline" flex={1}>
                    Message
                  </Button>
                </HStack>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Job Details Drawer */}
      <Drawer
        isOpen={jobDetailsOpen}
        onClose={() => setJobDetailsOpen(false)}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Job Details - #{selectedJob?.reference}</DrawerHeader>
          <DrawerBody>
            {selectedJob && (
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
                          <Text fontSize="sm">
                            {selectedJob.dropoffAddress}
                          </Text>
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
                          <Text fontWeight="bold">
                            {selectedJob.driver.user.name}
                          </Text>
                          <Text fontSize="sm" color="text.secondary">
                            Driver
                          </Text>
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>
                )}

                <HStack spacing={2}>
                  <Button leftIcon={<FaEye />} colorScheme="blue" flex={1}>
                    Track Job
                  </Button>
                  <Button leftIcon={<FaPhone />} variant="outline" flex={1}>
                    Contact
                  </Button>
                </HStack>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
