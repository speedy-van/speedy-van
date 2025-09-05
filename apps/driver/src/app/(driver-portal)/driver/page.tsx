'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  VStack,
  HStack,
  Card,
  CardBody,
  Button,
  Spacer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Spinner,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { requireDriver } from '@/lib/auth';
import LocationTracker from '@/components/Driver/LocationTracker';
import ClaimedJobHandler from '@/components/Driver/ClaimedJobHandler';
import OfflineStatus from '@/components/Driver/OfflineStatus';
import { queueAvailabilityUpdate, offlineFetch } from '@/lib/offline';
import { useRouter } from 'next/navigation';
import {
  FaTruck,
  FaClock,
  FaStar,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBriefcase,
  FaPoundSign,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
} from 'react-icons/fa';

interface DashboardData {
  driver: {
    id: string;
    name: string;
    email: string;
    status: string;
    onboardingStatus: string;
    basePostcode: string;
    vehicleType: string;
  };
  kpis: {
    todayEarnings: number;
    activeJob: any;
    rating: number;
    availability: string;
  };
  alerts: Array<{
    type: string;
    category: string;
    message: string;
    expiresAt?: Date;
  }>;
  shifts: Array<{
    id: string;
    startTime: string;
    endTime: string;
    isRecurring: boolean;
    recurringDays: string[];
    isActive: boolean;
  }>;
  locationStatus: {
    hasConsent: boolean;
    lastSeen?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  availableJobs: Array<{
    id: string;
    reference: string;
    pickupAddress: string;
    dropoffAddress: string;
    scheduledAt: string;
    timeSlot?: string; // Made optional as field removed from schema
    vanSize?: string; // Made optional as field removed from schema
    totalGBP: number;
  }>;
  claimedJob?: any;
}

export default function DriverDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      const response = await fetch('/api/driver/dashboard');
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data received:', data);

        // Ensure we have default values for critical fields
        const safeData: DashboardData = {
          ...data,
          driver: {
            id: data.driver?.id || '',
            name: data.driver?.name || 'Driver',
            email: data.driver?.email || '',
            status: data.driver?.status || 'unknown',
            onboardingStatus: data.driver?.onboardingStatus || 'unknown',
            basePostcode: data.driver?.basePostcode || '',
            vehicleType: data.driver?.vehicleType || 'unknown',
          },
          kpis: {
            todayEarnings: data.kpis?.todayEarnings || 0,
            activeJob: data.kpis?.activeJob || null,
            rating: data.kpis?.rating || 0,
            availability: data.kpis?.availability || 'offline',
          },
          alerts: data.alerts || [],
          shifts: data.shifts || [],
          locationStatus: data.locationStatus || { hasConsent: false },
          availableJobs: data.availableJobs || [],
          claimedJob: data.claimedJob || null,
        };

        setDashboardData(safeData);
      } else {
        console.error('Failed to fetch dashboard data:', response.status);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (newStatus: string) => {
    setUpdatingAvailability(true);
    try {
      console.log('Updating availability to:', newStatus);

      const response = await fetch('/api/driver/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      // Check if response has content before parsing JSON
      const text = await response.text();
      let data;

      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', text);
          throw new Error('Invalid response format');
        }
      } else {
        // Handle empty response
        data = { success: true };
      }

      if (response.ok || response.status === 202) {
        const isQueued = data.queued;

        // Refresh dashboard data if not queued
        if (!isQueued) {
          await fetchDashboardData();
        }

        toast({
          title: isQueued ? 'Status Queued' : 'Success',
          description: isQueued
            ? `Your status will be updated to ${newStatus} when connection is restored`
            : `You are now ${newStatus}`,
          status: isQueued ? 'info' : 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        console.error('Availability update failed:', {
          status: response.status,
          data,
        });
        throw new Error(`Failed to update availability: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'green';
      case 'break':
        return 'yellow';
      case 'offline':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getAvailabilityButtonText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Go Offline';
      case 'break':
        return 'Go Online';
      case 'offline':
        return 'Go Online';
      default:
        return 'Go Online';
    }
  };

  const getAvailabilityButtonColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'red';
      case 'break':
        return 'green';
      case 'offline':
        return 'green';
      default:
        return 'green';
    }
  };

  const getNextAvailabilityStatus = (currentStatus: string) => {
    console.log('getNextAvailabilityStatus called with:', currentStatus);
    const nextStatus = (() => {
      switch (currentStatus) {
        case 'online':
          return 'offline';
        case 'break':
          return 'online';
        case 'offline':
          return 'online';
        default:
          return 'online';
      }
    })();
    console.log('getNextAvailabilityStatus returning:', nextStatus);
    return nextStatus;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="400px"
        position="relative"
        zIndex={1}
      >
        <VStack spacing={6}>
          <Spinner size="xl" color="neon.500" thickness="4px" />
          <Text color="text.secondary" fontSize="lg">
            Loading your dashboard...
          </Text>
        </VStack>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box position="relative" zIndex={1}>
        <Alert status="error" borderRadius="xl">
          <AlertIcon />
          <Box>
            <AlertTitle>Failed to load dashboard data</AlertTitle>
            <AlertDescription>
              Please refresh the page or contact support if the problem
              persists.
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box position="relative" zIndex={1}>
      <OfflineStatus variant="compact" />
      {/* Background location tracker */}
      <LocationTracker
        isOnline={(dashboardData?.kpis.availability || 'offline') === 'online'}
        hasConsent={dashboardData?.locationStatus?.hasConsent || false}
        onLocationUpdate={(lat, lng) => {
          console.log('Location updated:', lat, lng);
          // Optionally refresh dashboard data to show new location
          fetchDashboardData();
        }}
      />

      <VStack spacing={{ base: 6, md: 8 }} align="stretch">
        {/* Header Section */}
        <Box textAlign="center" py={{ base: 4, md: 6 }}>
          <VStack spacing={4}>
            <Box
              p={4}
              borderRadius="2xl"
              bg="linear-gradient(135deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))"
              borderWidth="2px"
              borderColor="neon.400"
              display="inline-block"
            >
              <Icon as={FaTruck} color="neon.500" boxSize={10} />
            </Box>
            <Heading
              size={{ base: 'xl', md: '2xl' }}
              color="neon.500"
              fontWeight="extrabold"
            >
              🚚 Driver Dashboard
            </Heading>
            <Text
              color="text.secondary"
              fontSize={{ base: 'md', md: 'lg' }}
              maxW="2xl"
              mx="auto"
            >
              Welcome back, {dashboardData.driver?.name || 'Driver'}! Here's
              your current status and available opportunities.
            </Text>
          </VStack>
        </Box>

        {/* Claimed Job Handler - shows when driver has claimed a job */}
        <ClaimedJobHandler
          onJobAccepted={jobId => {
            console.log('Job accepted:', jobId);
            fetchDashboardData(); // Refresh dashboard
          }}
          onJobDeclined={jobId => {
            console.log('Job declined:', jobId);
            fetchDashboardData(); // Refresh dashboard
          }}
        />

        {/* KPI Cards */}
        <Grid
          templateColumns={{
            base: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          }}
          gap={{ base: 4, md: 6 }}
        >
          <Card
            borderRadius="2xl"
            borderWidth="2px"
            borderColor="border.primary"
            bg={cardBg}
            boxShadow="xl"
            overflow="hidden"
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(135deg, rgba(0,194,255,0.05), rgba(0,209,143,0.05))',
              pointerEvents: 'none',
            }}
          >
            <CardBody p={{ base: 4, md: 6 }} position="relative" zIndex={1}>
              <VStack spacing={3} align="center">
                <Box
                  p={3}
                  borderRadius="xl"
                  bg="green.500"
                  color="white"
                  boxSize="50px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 4px 15px rgba(0,209,143,0.3)"
                >
                  <Icon as={FaPoundSign} boxSize={5} />
                </Box>
                <Stat textAlign="center">
                  <StatLabel
                    fontSize={{ base: 'sm', md: 'md' }}
                    color="text.secondary"
                    fontWeight="medium"
                  >
                    Today's Earnings
                  </StatLabel>
                  <StatNumber
                    fontSize={{ base: '2xl', md: '3xl' }}
                    color="green.500"
                    fontWeight="bold"
                  >
                    £{(dashboardData.kpis.todayEarnings || 0).toFixed(2)}
                  </StatNumber>
                  <StatHelpText
                    fontSize={{ base: 'xs', md: 'sm' }}
                    color="text.tertiary"
                  >
                    {(dashboardData.kpis.todayEarnings || 0) > 0
                      ? 'Great work today!'
                      : 'No jobs completed today'}
                  </StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </Card>

          <Card
            borderRadius="2xl"
            borderWidth="2px"
            borderColor="border.primary"
            bg={cardBg}
            boxShadow="xl"
            overflow="hidden"
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(135deg, rgba(0,194,255,0.05), rgba(0,209,143,0.05))',
              pointerEvents: 'none',
            }}
          >
            <CardBody p={{ base: 4, md: 6 }} position="relative" zIndex={1}>
              <VStack spacing={3} align="center">
                <Box
                  p={3}
                  borderRadius="xl"
                  bg="blue.500"
                  color="white"
                  boxSize="50px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 4px 15px rgba(0,194,255,0.3)"
                >
                  <Icon as={FaBriefcase} boxSize={5} />
                </Box>
                <Stat textAlign="center">
                  <StatLabel
                    fontSize={{ base: 'sm', md: 'md' }}
                    color="text.secondary"
                    fontWeight="medium"
                  >
                    Active Job
                  </StatLabel>
                  <StatNumber
                    fontSize={{ base: '2xl', md: '3xl' }}
                    color="blue.500"
                    fontWeight="bold"
                  >
                    {dashboardData.kpis.activeJob ? 'In Progress' : 'None'}
                  </StatNumber>
                  <StatHelpText
                    fontSize={{ base: 'xs', md: 'sm' }}
                    color="text.tertiary"
                  >
                    {dashboardData.kpis.activeJob ? (
                      <VStack align="center" spacing={2}>
                        <Badge
                          colorScheme="green"
                          size={{ base: 'sm', md: 'md' }}
                        >
                          Active
                        </Badge>
                        <Button
                          size={{ base: 'sm', md: 'md' }}
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => router.push('/driver/jobs/active')}
                          _hover={{
                            bg: 'blue.500',
                            color: 'white',
                          }}
                        >
                          View Active Job
                        </Button>
                      </VStack>
                    ) : (
                      <Badge colorScheme="gray" size={{ base: 'sm', md: 'md' }}>
                        No Active Job
                      </Badge>
                    )}
                  </StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </Card>

          <Card
            borderRadius="2xl"
            borderWidth="2px"
            borderColor="border.primary"
            bg={cardBg}
            boxShadow="xl"
            overflow="hidden"
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(135deg, rgba(0,194,255,0.05), rgba(0,209,143,0.05))',
              pointerEvents: 'none',
            }}
          >
            <CardBody p={{ base: 4, md: 6 }} position="relative" zIndex={1}>
              <VStack spacing={3} align="center">
                <Box
                  p={3}
                  borderRadius="xl"
                  bg="yellow.500"
                  color="white"
                  boxSize="50px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 4px 15px rgba(255,193,7,0.3)"
                >
                  <Icon as={FaStar} boxSize={5} />
                </Box>
                <Stat textAlign="center">
                  <StatLabel
                    fontSize={{ base: 'sm', md: 'md' }}
                    color="text.secondary"
                    fontWeight="medium"
                  >
                    Rating
                  </StatLabel>
                  <StatNumber
                    fontSize={{ base: '2xl', md: '3xl' }}
                    color="yellow.500"
                    fontWeight="bold"
                  >
                    {(dashboardData.kpis.rating || 0) > 0
                      ? `${(dashboardData.kpis.rating || 0).toFixed(1)} ⭐`
                      : '--'}
                  </StatNumber>
                  <StatHelpText
                    fontSize={{ base: 'xs', md: 'sm' }}
                    color="text.tertiary"
                  >
                    {(dashboardData.kpis.rating || 0) > 0
                      ? 'Average customer rating'
                      : 'No ratings yet'}
                  </StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </Card>

          <Card
            borderRadius="2xl"
            borderWidth="2px"
            borderColor="border.primary"
            bg={cardBg}
            boxShadow="xl"
            overflow="hidden"
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(135deg, rgba(0,194,255,0.05), rgba(0,209,143,0.05))',
              pointerEvents: 'none',
            }}
          >
            <CardBody p={{ base: 4, md: 6 }} position="relative" zIndex={1}>
              <VStack spacing={3} align="center">
                <Box
                  p={3}
                  borderRadius="xl"
                  bg={`${getAvailabilityColor(dashboardData.kpis.availability || 'offline')}.500`}
                  color="white"
                  boxSize="50px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow={`0 4px 15px rgba(0,0,0,0.2)`}
                >
                  <Icon as={FaShieldAlt} boxSize={5} />
                </Box>
                <Stat textAlign="center">
                  <StatLabel
                    fontSize={{ base: 'sm', md: 'md' }}
                    color="text.secondary"
                    fontWeight="medium"
                  >
                    Availability
                  </StatLabel>
                  <StatNumber
                    fontSize={{ base: '2xl', md: '3xl' }}
                    color={`${getAvailabilityColor(dashboardData.kpis.availability || 'offline')}.500`}
                    fontWeight="bold"
                  >
                    <Badge
                      colorScheme={getAvailabilityColor(
                        dashboardData.kpis.availability || 'offline'
                      )}
                      size={{ base: 'md', md: 'lg' }}
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="md"
                    >
                      {(dashboardData.kpis.availability || 'offline')
                        .charAt(0)
                        .toUpperCase() +
                        (dashboardData.kpis.availability || 'offline').slice(1)}
                    </Badge>
                  </StatNumber>
                  <StatHelpText
                    fontSize={{ base: 'xs', md: 'sm' }}
                    color="text.tertiary"
                  >
                    <Button
                      size={{ base: 'sm', md: 'md' }}
                      colorScheme={getAvailabilityButtonColor(
                        dashboardData.kpis.availability || 'offline'
                      )}
                      variant="outline"
                      onClick={() => {
                        const nextStatus = getNextAvailabilityStatus(
                          dashboardData.kpis.availability || 'offline'
                        );
                        console.log(
                          'Button clicked - next status:',
                          nextStatus
                        );
                        updateAvailability(nextStatus);
                      }}
                      isLoading={updatingAvailability}
                      loadingText="Updating..."
                      w={{ base: 'full', sm: 'auto' }}
                      _hover={{
                        bg: `${getAvailabilityButtonColor(dashboardData.kpis.availability || 'offline')}.500`,
                        color: 'white',
                      }}
                    >
                      {getAvailabilityButtonText(
                        dashboardData.kpis.availability || 'offline'
                      )}
                    </Button>
                  </StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Alerts Section */}
        {dashboardData.alerts && dashboardData.alerts.length > 0 && (
          <Card
            borderRadius="2xl"
            borderWidth="2px"
            borderColor="border.primary"
            bg={cardBg}
            boxShadow="xl"
            overflow="hidden"
          >
            <CardBody p={{ base: 6, md: 8 }}>
              <VStack spacing={6} align="stretch">
                <HStack spacing={3}>
                  <Icon
                    as={FaExclamationTriangle}
                    color="orange.500"
                    boxSize={6}
                  />
                  <Heading size={{ base: 'md', md: 'lg' }} color="text.primary">
                    Alerts & Notifications
                  </Heading>
                </HStack>
                <VStack align="stretch" spacing={4}>
                  {dashboardData.alerts.map((alert, index) => (
                    <Alert
                      key={index}
                      status={
                        alert.type === 'expired'
                          ? 'error'
                          : alert.type === 'expiring'
                            ? 'warning'
                            : 'info'
                      }
                      borderRadius="xl"
                      borderWidth="1px"
                      borderColor={
                        alert.type === 'expired'
                          ? 'red.400'
                          : alert.type === 'expiring'
                            ? 'orange.400'
                            : 'blue.400'
                      }
                    >
                      <AlertIcon />
                      <Box flex="1">
                        <AlertTitle
                          fontSize={{ base: 'sm', md: 'md' }}
                          fontWeight="semibold"
                        >
                          {alert.category.toUpperCase()}
                        </AlertTitle>
                        <AlertDescription fontSize={{ base: 'sm', md: 'md' }}>
                          {alert.message}
                        </AlertDescription>
                      </Box>
                      <Button
                        size={{ base: 'sm', md: 'md' }}
                        colorScheme={
                          alert.type === 'missing' ? 'blue' : 'green'
                        }
                        _hover={{
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}
                        transition="all 0.2s"
                      >
                        {alert.type === 'missing' ? 'Upload' : 'Renew'}
                      </Button>
                    </Alert>
                  ))}
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Location Status Section */}
        {dashboardData.locationStatus && (
          <Card
            borderRadius="2xl"
            borderWidth="2px"
            borderColor="border.primary"
            bg={cardBg}
            boxShadow="xl"
            overflow="hidden"
          >
            <CardBody p={{ base: 6, md: 8 }}>
              <VStack spacing={6} align="stretch">
                <HStack spacing={3}>
                  <Icon as={FaMapMarkerAlt} color="neon.500" boxSize={6} />
                  <Heading size={{ base: 'md', md: 'lg' }} color="text.primary">
                    Location Status
                  </Heading>
                </HStack>
                <VStack align="stretch" spacing={4}>
                  <HStack
                    justify="space-between"
                    flexWrap={{ base: 'wrap', md: 'nowrap' }}
                  >
                    <Text
                      fontSize={{ base: 'md', md: 'lg' }}
                      color="text.secondary"
                    >
                      <strong>Location Sharing:</strong>{' '}
                      {dashboardData.locationStatus.hasConsent
                        ? 'Enabled'
                        : 'Disabled'}
                    </Text>
                    <Badge
                      colorScheme={
                        dashboardData.locationStatus.hasConsent
                          ? 'green'
                          : 'gray'
                      }
                      size="lg"
                      px={4}
                      py={2}
                      borderRadius="full"
                    >
                      {dashboardData.locationStatus.hasConsent
                        ? 'Active'
                        : 'Inactive'}
                    </Badge>
                  </HStack>
                  {dashboardData.locationStatus.lastSeen && (
                    <Text
                      fontSize={{ base: 'sm', md: 'md' }}
                      color="text.tertiary"
                    >
                      <strong>Last Updated:</strong>{' '}
                      {new Date(
                        dashboardData.locationStatus.lastSeen
                      ).toLocaleString()}
                    </Text>
                  )}
                  {dashboardData.locationStatus.coordinates && (
                    <Text
                      fontSize={{ base: 'sm', md: 'md' }}
                      color="text.tertiary"
                    >
                      <strong>Coordinates:</strong>{' '}
                      {dashboardData.locationStatus.coordinates.lat.toFixed(6)},{' '}
                      {dashboardData.locationStatus.coordinates.lng.toFixed(6)}
                    </Text>
                  )}
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Upcoming Shifts Section */}
        {dashboardData.shifts && dashboardData.shifts.length > 0 && (
          <Card
            borderRadius="2xl"
            borderWidth="2px"
            borderColor="border.primary"
            bg={cardBg}
            boxShadow="xl"
            overflow="hidden"
          >
            <CardBody p={{ base: 6, md: 8 }}>
              <VStack spacing={6} align="stretch">
                <HStack spacing={3}>
                  <Icon as={FaCalendarAlt} color="purple.500" boxSize={6} />
                  <Heading size={{ base: 'md', md: 'lg' }} color="text.primary">
                    Upcoming Shifts
                  </Heading>
                </HStack>
                <VStack align="stretch" spacing={4}>
                  {dashboardData.shifts.slice(0, 3).map(shift => (
                    <Box
                      key={shift.id}
                      p={{ base: 4, md: 6 }}
                      border="2px solid"
                      borderColor="border.primary"
                      borderRadius="xl"
                      bg="bg.surface"
                      _hover={{
                        borderColor: 'neon.400',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,194,255,0.1)',
                      }}
                      transition="all 0.3s ease"
                    >
                      <HStack
                        justify="space-between"
                        flexWrap={{ base: 'wrap', md: 'nowrap' }}
                      >
                        <VStack align="start" spacing={2}>
                          <Text
                            fontWeight="bold"
                            fontSize={{ base: 'md', md: 'lg' }}
                            color="text.primary"
                          >
                            {new Date(shift.startTime).toLocaleDateString()} -{' '}
                            {new Date(shift.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                          <Text
                            fontSize={{ base: 'sm', md: 'md' }}
                            color="text.secondary"
                          >
                            {shift.isRecurring
                              ? shift.recurringDays.join(', ')
                              : 'One-time'}
                          </Text>
                        </VStack>
                        <Badge
                          colorScheme={shift.isActive ? 'green' : 'gray'}
                          size="lg"
                          px={4}
                          py={2}
                          borderRadius="full"
                        >
                          {shift.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </HStack>
                    </Box>
                  ))}
                  {dashboardData.shifts && dashboardData.shifts.length > 3 && (
                    <Text
                      fontSize={{ base: 'sm', md: 'md' }}
                      color="text.tertiary"
                      textAlign="center"
                    >
                      +{dashboardData.shifts.length - 3} more shifts
                    </Text>
                  )}
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Available Jobs Section */}
        <Card
          borderRadius="2xl"
          borderWidth="2px"
          borderColor="border.primary"
          bg={cardBg}
          boxShadow="xl"
          overflow="hidden"
        >
          <CardBody p={{ base: 6, md: 8 }}>
            <VStack spacing={6} align="stretch">
              <HStack spacing={3}>
                <Icon as={FaBriefcase} color="green.500" boxSize={6} />
                <Heading size={{ base: 'md', md: 'lg' }} color="text.primary">
                  Available Jobs Near You
                </Heading>
              </HStack>
              {dashboardData.availableJobs &&
              dashboardData.availableJobs.length > 0 ? (
                <VStack align="stretch" spacing={4}>
                  {dashboardData.availableJobs.map(job => (
                    <Box
                      key={job.id}
                      p={{ base: 4, md: 6 }}
                      border="2px solid"
                      borderColor="border.primary"
                      borderRadius="xl"
                      bg="bg.surface"
                      _hover={{
                        bg: 'bg.surface',
                        borderColor: 'neon.400',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,194,255,0.1)',
                      }}
                      transition="all 0.3s ease"
                    >
                      <VStack align="stretch" spacing={4}>
                        <HStack
                          justify="space-between"
                          mb={2}
                          flexWrap={{ base: 'wrap', md: 'nowrap' }}
                        >
                          <Text
                            fontWeight="bold"
                            fontSize={{ base: 'md', md: 'lg' }}
                            color="text.primary"
                          >
                            Job #{job.reference}
                          </Text>
                          <Badge
                            colorScheme="green"
                            size="lg"
                            px={4}
                            py={2}
                            borderRadius="full"
                            fontSize="md"
                            fontWeight="bold"
                          >
                            £{(job.totalGBP / 100).toFixed(2)}
                          </Badge>
                        </HStack>
                        <VStack align="stretch" spacing={3}>
                          <HStack spacing={4} align="start">
                            <VStack align="start" spacing={1} flex="1">
                              <Text
                                fontSize={{ base: 'sm', md: 'md' }}
                                color="text.secondary"
                                fontWeight="medium"
                              >
                                <Icon
                                  as={FaMapMarkerAlt}
                                  mr={2}
                                  color="red.400"
                                />
                                Pickup
                              </Text>
                              <Text
                                fontSize={{ base: 'sm', md: 'md' }}
                                color="text.primary"
                              >
                                {job.pickupAddress}
                              </Text>
                            </VStack>
                            <VStack align="start" spacing={1} flex="1">
                              <Text
                                fontSize={{ base: 'sm', md: 'md' }}
                                color="text.secondary"
                                fontWeight="medium"
                              >
                                <Icon
                                  as={FaMapMarkerAlt}
                                  mr={2}
                                  color="green.400"
                                />
                                Dropoff
                              </Text>
                              <Text
                                fontSize={{ base: 'sm', md: 'md' }}
                                color="text.primary"
                              >
                                {job.dropoffAddress}
                              </Text>
                            </VStack>
                          </HStack>
                          <HStack
                            spacing={6}
                            color="text.tertiary"
                            fontSize={{ base: 'sm', md: 'md' }}
                          >
                            <HStack spacing={2}>
                              <Icon as={FaCalendarAlt} color="neon.400" />
                              <Text>
                                {new Date(job.scheduledAt).toLocaleDateString()}
                              </Text>
                            </HStack>
                            {job.timeSlot && (
                              <HStack spacing={2}>
                                <Icon as={FaClock} color="neon.400" />
                                <Text>{job.timeSlot}</Text>
                              </HStack>
                            )}
                            {job.vanSize && (
                              <HStack spacing={2}>
                                <Icon as={FaTruck} color="neon.400" />
                                <Text>{job.vanSize}</Text>
                              </HStack>
                            )}
                          </HStack>
                        </VStack>
                        <Button
                          size={{ base: 'md', md: 'lg' }}
                          colorScheme="blue"
                          w="full"
                          _hover={{
                            transform: 'translateY(-1px)',
                            boxShadow: '0 6px 20px rgba(0,194,255,0.3)',
                          }}
                          transition="all 0.2s"
                        >
                          View Details
                        </Button>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Box textAlign="center" py={8}>
                  <Icon
                    as={FaInfoCircle}
                    color="text.tertiary"
                    boxSize={12}
                    mb={4}
                  />
                  <Text
                    color="text.secondary"
                    fontSize={{ base: 'md', md: 'lg' }}
                    mb={2}
                  >
                    No jobs available in your area
                  </Text>
                  <Text
                    color="text.tertiary"
                    fontSize={{ base: 'sm', md: 'md' }}
                  >
                    Make sure you're online and in a service area to see
                    available jobs.
                  </Text>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
