'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Button,
  Badge,
  Flex,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Switch,
  FormControl,
  FormLabel,
  Select,
  Divider,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import {
  FiClock,
  FiMapPin,
  FiCalendar,
  FiCheck,
  FiX,
  FiPause,
  FiPlay,
  FiSettings,
} from 'react-icons/fi';

interface AvailabilitySettings {
  isAvailable: boolean;
  availabilityMode: 'online' | 'offline' | 'break';
  workingHours: {
    monday: { start: string; end: string; enabled: boolean };
    tuesday: { start: string; end: string; enabled: boolean };
    wednesday: { start: string; end: string; enabled: boolean };
    thursday: { start: string; end: string; enabled: boolean };
    friday: { start: string; end: string; enabled: boolean };
    saturday: { start: string; end: string; enabled: boolean };
    sunday: { start: string; end: string; enabled: boolean };
  };
  maxDistance: number; // in miles
  serviceAreas: string[]; // postcode areas or 'UK-WIDE'
  coverageType: 'uk-wide' | 'local'; // New field for coverage type
  breakUntil?: string;
}

export default function DriverAvailabilityPage() {
  const [settings, setSettings] = useState<AvailabilitySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchAvailabilitySettings();
  }, []);

  const fetchAvailabilitySettings = async () => {
    try {
      console.log('🔍 Fetching availability settings...');
      const response = await fetch('/api/driver/availability');
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response:', data);
        
        // Convert API response to expected format
        const apiData = data.data || data.settings;
        if (apiData) {
          console.log('📊 API Data:', apiData);
          setSettings({
            isAvailable: apiData.isOnline || false,
            availabilityMode: apiData.isOnline ? 'online' : 'offline',
            workingHours: {
              monday: { start: '09:00', end: '17:00', enabled: true },
              tuesday: { start: '09:00', end: '17:00', enabled: true },
              wednesday: { start: '09:00', end: '17:00', enabled: true },
              thursday: { start: '09:00', end: '17:00', enabled: true },
              friday: { start: '09:00', end: '17:00', enabled: true },
              saturday: { start: '09:00', end: '17:00', enabled: false },
              sunday: { start: '09:00', end: '17:00', enabled: false },
            },
            maxDistance: 100, // UK-wide coverage
            serviceAreas: ['UK-WIDE'],
            coverageType: 'uk-wide',
            breakUntil: undefined,
          });
          console.log('✅ Settings loaded successfully');
        } else {
          console.error('❌ No data in API response');
          throw new Error('No data received from API');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, response.statusText, errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error fetching availability settings:', error);
      toast({
        title: 'Error',
        description: `Failed to load availability settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (updates: Partial<AvailabilitySettings>) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/driver/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        // Update settings with new data
        const apiData = data.data || data.settings;
        if (apiData) {
          setSettings(prev => prev ? {
            ...prev,
            isAvailable: apiData.isOnline || false,
            availabilityMode: apiData.isOnline ? 'online' : 'offline',
          } : null);
        }
        toast({
          title: 'Success',
          description: 'Availability settings updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability settings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  const toggleAvailability = async () => {
    if (!settings) return;

    const newMode = settings.isAvailable ? 'offline' : 'online';
    await updateAvailability({
      isAvailable: !settings.isAvailable,
      availabilityMode: newMode,
    });
  };

  const setBreakMode = async () => {
    if (!settings) return;

    const breakUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes from now
    await updateAvailability({
      availabilityMode: 'break',
      breakUntil,
    });
  };

  const endBreak = async () => {
    if (!settings) return;

    await updateAvailability({
      availabilityMode: 'online',
      breakUntil: undefined,
    });
  };

  const getStatusColor = (mode: string) => {
    switch (mode) {
      case 'online':
        return 'green';
      case 'offline':
        return 'red';
      case 'break':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (mode: string) => {
    switch (mode) {
      case 'online':
        return FiCheck;
      case 'offline':
        return FiX;
      case 'break':
        return FiPause;
      default:
        return FiClock;
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" />
        </Flex>
      </Box>
    );
  }

  if (!settings) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Failed to load settings</AlertTitle>
          <AlertDescription>
            Unable to load your availability settings. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Driver Availability</Heading>
            <Text color="text.secondary">
              Manage your availability and working hours
            </Text>
          </VStack>
        </Flex>

        {/* Current Status */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <HStack>
                  <Badge
                    colorScheme={getStatusColor(settings.availabilityMode)}
                    fontSize="md"
                    px={3}
                    py={1}
                  >
                    <HStack>
                      <Box as={getStatusIcon(settings.availabilityMode)} />
                      <Text>{settings.availabilityMode.toUpperCase()}</Text>
                    </HStack>
                  </Badge>
                  {settings.breakUntil && (
                    <Text fontSize="sm" color="text.secondary">
                      Break until: {new Date(settings.breakUntil).toLocaleTimeString()}
                    </Text>
                  )}
                </HStack>

                <HStack>
                  <Button
                    leftIcon={<FiPlay />}
                    colorScheme="green"
                    variant={settings.availabilityMode === 'online' ? 'solid' : 'outline'}
                    onClick={toggleAvailability}
                    isLoading={updating}
                    isDisabled={settings.availabilityMode === 'online'}
                  >
                    Go Online
                  </Button>
                  <Button
                    leftIcon={<FiPause />}
                    colorScheme="yellow"
                    variant="outline"
                    onClick={setBreakMode}
                    isLoading={updating}
                    isDisabled={settings.availabilityMode === 'break'}
                  >
                    Take Break
                  </Button>
                  <Button
                    leftIcon={<FiX />}
                    colorScheme="red"
                    variant={settings.availabilityMode === 'offline' ? 'solid' : 'outline'}
                    onClick={toggleAvailability}
                    isLoading={updating}
                    isDisabled={settings.availabilityMode === 'offline'}
                  >
                    Go Offline
                  </Button>
                </HStack>
              </HStack>

              {settings.availabilityMode === 'break' && (
                <Alert status="warning">
                  <AlertIcon />
                  <AlertTitle>You are on break</AlertTitle>
                  <AlertDescription>
                    You won't receive new job assignments until you end your break.
                    <Button
                      size="sm"
                      ml={2}
                      colorScheme="blue"
                      variant="link"
                      onClick={endBreak}
                      isLoading={updating}
                    >
                      End Break Now
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
          <Stat>
            <StatLabel>Max Distance</StatLabel>
            <StatNumber>{settings.maxDistance} miles</StatNumber>
            <StatHelpText>Maximum distance for jobs</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Service Areas</StatLabel>
            <StatNumber>{settings.serviceAreas.length}</StatNumber>
            <StatHelpText>Postcode areas covered</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Working Days</StatLabel>
            <StatNumber>
              {Object.values(settings.workingHours).filter(day => day.enabled).length}/7
            </StatNumber>
            <StatHelpText>Days available for work</StatHelpText>
          </Stat>
        </Grid>

        {/* Working Hours */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Working Hours</Heading>

              {Object.entries(settings.workingHours).map(([day, hours]) => (
                <HStack key={day} justify="space-between" p={3} borderWidth={1} borderRadius="md">
                  <HStack>
                    <FormControl display="flex" alignItems="center" w="auto">
                      <FormLabel htmlFor={`${day}-enabled`} mb="0" fontWeight="medium">
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </FormLabel>
                      <Switch
                        id={`${day}-enabled`}
                        isChecked={hours.enabled}
                        onChange={(e) =>
                          updateAvailability({
                            workingHours: {
                              ...settings.workingHours,
                              [day]: { ...hours, enabled: e.target.checked },
                            },
                          })
                        }
                        isDisabled={updating}
                      />
                    </FormControl>
                  </HStack>

                  {hours.enabled && (
                    <HStack>
                      <Text fontSize="sm">From:</Text>
                      <input
                        type="time"
                        value={hours.start}
                        onChange={(e) =>
                          updateAvailability({
                            workingHours: {
                              ...settings.workingHours,
                              [day]: { ...hours, start: e.target.value },
                            },
                          })
                        }
                        disabled={updating}
                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}
                      />
                      <Text fontSize="sm">To:</Text>
                      <input
                        type="time"
                        value={hours.end}
                        onChange={(e) =>
                          updateAvailability({
                            workingHours: {
                              ...settings.workingHours,
                              [day]: { ...hours, end: e.target.value },
                            },
                          })
                        }
                        disabled={updating}
                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}
                      />
                    </HStack>
                  )}
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Service Areas */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Service Coverage</Heading>
              <Text color="text.secondary" fontSize="sm">
                Choose your service coverage area:
              </Text>
              
              {/* Coverage Type Selection */}
              <VStack spacing={3} align="stretch">
                <HStack spacing={4}>
                  <Button
                    leftIcon={<FiMapPin />}
                    colorScheme={settings.coverageType === 'uk-wide' ? 'green' : 'gray'}
                    variant={settings.coverageType === 'uk-wide' ? 'solid' : 'outline'}
                    onClick={() => updateAvailability({ 
                      coverageType: 'uk-wide',
                      serviceAreas: ['UK-WIDE'],
                      maxDistance: 100
                    })}
                    isLoading={updating}
                    flex="1"
                  >
                    🇬🇧 UK-Wide Coverage
                  </Button>
                  <Button
                    leftIcon={<FiSettings />}
                    colorScheme={settings.coverageType === 'local' ? 'blue' : 'gray'}
                    variant={settings.coverageType === 'local' ? 'solid' : 'outline'}
                    onClick={() => updateAvailability({ 
                      coverageType: 'local',
                      serviceAreas: ['G21', 'G20', 'G22'],
                      maxDistance: 25
                    })}
                    isLoading={updating}
                    flex="1"
                  >
                    📍 Local Areas
                  </Button>
                </HStack>

                {/* Coverage Details */}
                {settings.coverageType === 'uk-wide' ? (
                  <Alert status="success" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>UK-Wide Coverage Active</AlertTitle>
                      <AlertDescription>
                        You can accept jobs anywhere in the United Kingdom. 
                        Maximum distance: {settings.maxDistance} miles from your location.
                      </AlertDescription>
                    </Box>
                  </Alert>
                ) : (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Local Coverage Active</AlertTitle>
                      <AlertDescription>
                        You can accept jobs in specific postcode areas. 
                        Maximum distance: {settings.maxDistance} miles.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                {/* Service Areas Display */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Current Coverage:
                  </Text>
                  <HStack wrap="wrap" spacing={2}>
                    {settings.serviceAreas.map((area, index) => (
                      <Badge 
                        key={index} 
                        colorScheme={area === 'UK-WIDE' ? 'green' : 'blue'} 
                        fontSize="sm" 
                        px={3} 
                        py={1}
                        borderRadius="full"
                      >
                        {area === 'UK-WIDE' ? '🇬🇧 UK-WIDE' : area}
                      </Badge>
                    ))}
                  </HStack>
                </Box>

                {/* Coverage Stats */}
                <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={3}>
                  <Stat textAlign="center" p={3} bg="gray.50" borderRadius="md">
                    <StatLabel fontSize="xs">Coverage Type</StatLabel>
                    <StatNumber fontSize="sm">
                      {settings.coverageType === 'uk-wide' ? 'UK-Wide' : 'Local'}
                    </StatNumber>
                  </Stat>
                  <Stat textAlign="center" p={3} bg="gray.50" borderRadius="md">
                    <StatLabel fontSize="xs">Max Distance</StatLabel>
                    <StatNumber fontSize="sm">{settings.maxDistance} miles</StatNumber>
                  </Stat>
                  <Stat textAlign="center" p={3} bg="gray.50" borderRadius="md">
                    <StatLabel fontSize="xs">Areas Covered</StatLabel>
                    <StatNumber fontSize="sm">
                      {settings.coverageType === 'uk-wide' ? 'All UK' : settings.serviceAreas.length}
                    </StatNumber>
                  </Stat>
                </Grid>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
