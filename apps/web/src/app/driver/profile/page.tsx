'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Flex,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Avatar,
  Badge,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  Progress,
  Divider,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { 
  FiUser, 
  FiStar, 
  FiTruck, 
  FiEdit,
  FiSave,
  FiX,
  FiRefreshCw,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
  FiTrendingUp,
  FiCheck,
  FiClock,
  FiTarget,
} from 'react-icons/fi';
import { formatDistanceToNow, format } from 'date-fns';

interface DriverProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  driverId: string;
  basePostcode: string;
  vehicleType: string;
  onboardingStatus: string;
  rating: number;
  strikes: number;
  status: string;
  bio: string;
  profileImage: string;
  profileCompleteness: number;
  totalJobs: number;
  averageScore: number;
  averageRating: number;
  completionRate: number;
  onTimeRate: number;
  isOnline: boolean;
  lastSeenAt?: string;
  locationConsent: boolean;
  hasActiveOrders?: boolean;
  recentRatings: Array<{
    id: string;
    rating: number;
    review: string;
    category: string;
    bookingReference: string;
    customerName: string;
    createdAt: string;
  }>;
  joinedAt: string;
  lastLogin?: string;
  applicationStatus: string;
  applicationDate?: string;
}

export default function DriverProfile() {
  const [data, setData] = useState<DriverProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    basePostcode: '',
    vehicleType: '',
    bio: '',
    profileImage: '',
  });

  const fetchProfileData = useCallback(async (showRefreshToast = false) => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/driver/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const result = await response.json();
      setData(result.data);
      setError(null);

      // Initialize edit form
      setEditForm({
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        phone: result.data.phone,
        email: result.data.email,
        basePostcode: result.data.basePostcode,
        vehicleType: result.data.vehicleType,
        bio: result.data.bio,
        profileImage: result.data.profileImage,
      });

      if (showRefreshToast) {
        toast({
          title: 'Profile Refreshed',
          description: 'Profile data has been updated',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to load profile');
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleEditStart = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    // Reset form to original data
    if (data) {
      setEditForm({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        basePostcode: data.basePostcode,
        vehicleType: data.vehicleType,
        bio: data.bio,
        profileImage: data.profileImage,
      });
    }
  }, [data]);

  const handleEditSave = useCallback(async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/driver/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update profile');
      }

      setIsEditing(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh data
      fetchProfileData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  }, [editForm, fetchProfileData, toast]);

  const createSampleProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/debug/create-sample-profile', {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Sample Profile Created',
          description: 'Sample profile data has been added to your account.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        // Refresh data
        fetchProfileData();
      } else {
        const result = await response.json();
        toast({
          title: 'Failed to create sample profile',
          description: result.error || 'Unknown error',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error creating sample profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to create sample profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [fetchProfileData, toast]);

  const getStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'green';
      case 'pending': return 'yellow';
      case 'active': return 'green';
      case 'offline': return 'gray';
      default: return 'gray';
    }
  }, []);

  const getCompletionColor = useCallback((percentage: number) => {
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'yellow';
    return 'red';
  }, []);

  const renderStars = useCallback((rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Box
        key={i}
        as={FiStar}
        color={i < rating ? 'yellow.400' : 'gray.300'}
        fill={i < rating ? 'yellow.400' : 'transparent'}
      />
    ));
  }, []);

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="center">
          <Spinner size="xl" color="blue.500" />
          <Text>Loading your profile...</Text>
        </VStack>
      </Container>
    );
  }

  if (error || !data) {
    const isDriverRecordError = error?.includes('Driver record not found');
    
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          <VStack align="start" spacing={3}>
            <Text fontWeight="bold">Failed to load profile data</Text>
            <Text fontSize="sm">{error}</Text>
            <HStack spacing={3}>
              <Button size="sm" onClick={() => fetchProfileData()}>
                Try Again
              </Button>
              {isDriverRecordError && (
                <Button 
                  size="sm" 
                  colorScheme="blue" 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/debug/create-driver-record', {
                        method: 'POST',
                      });
                      if (response.ok) {
                        toast({
                          title: 'Driver Record Created',
                          description: 'Driver record created. Refreshing profile...',
                          status: 'success',
                          duration: 2000,
                        });
                        fetchProfileData();
                      }
                    } catch (error) {
                      console.error('Error creating driver record:', error);
                    }
                  }}
                >
                  Create Driver Record
                </Button>
              )}
              <Button 
                size="sm" 
                colorScheme="green" 
                onClick={createSampleProfile}
              >
                Create Sample Data
              </Button>
            </HStack>
          </VStack>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={12} align="stretch">
        {/* Header */}
        <VStack align="center" spacing={6} textAlign="center">
          <VStack spacing={4}>
            <Heading size="2xl" color="gray.800" fontWeight="bold">
              <Box as={FiUser} display="inline" mr={3} color="blue.500" />
              Driver Profile
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="2xl">
              Manage your profile information and track your performance metrics
            </Text>
          </VStack>
          
          <HStack spacing={4} flexWrap="wrap" justify="center">
            <Button
              leftIcon={<FiRefreshCw />}
              onClick={() => fetchProfileData(true)}
              isLoading={refreshing}
              variant="outline"
              colorScheme="blue"
              size="lg"
              px={6}
            >
              Refresh Data
            </Button>
            {data.profileCompleteness < 50 && (
              <Button
                variant="outline"
                colorScheme="green"
                size="lg"
                px={6}
                onClick={createSampleProfile}
              >
                Add Sample Data
              </Button>
            )}
            {!isEditing ? (
              <Button
                leftIcon={<FiEdit />}
                onClick={handleEditStart}
                colorScheme="blue"
                size="lg"
                px={8}
              >
                Edit Profile
              </Button>
            ) : (
              <HStack spacing={3}>
                <Button
                  leftIcon={<FiSave />}
                  onClick={handleEditSave}
                  isLoading={isSaving}
                  colorScheme="green"
                  size="lg"
                  px={8}
                >
                  Save Changes
                </Button>
                <Button
                  leftIcon={<FiX />}
                  onClick={handleEditCancel}
                  variant="outline"
                  colorScheme="red"
                  size="lg"
                  px={6}
                >
                  Cancel
                </Button>
              </HStack>
            )}
          </HStack>
        </VStack>

        {/* Profile Overview */}
        <Card shadow="lg" borderRadius="xl">
          <CardBody p={8}>
            <VStack spacing={8} align="stretch">
              {/* Main Profile Info */}
              <Flex direction={{ base: "column", md: "row" }} align={{ base: "center", md: "start" }} gap={8}>
                <VStack spacing={4}>
                  <Avatar
                    size="2xl"
                    src={data.profileImage}
                    name={`${data.firstName} ${data.lastName}`}
                    bg="blue.500"
                    color="white"
                    fontWeight="bold"
                    fontSize="2xl"
                  />
                  <VStack spacing={2}>
                    <Badge 
                      colorScheme={getStatusColor(data.onboardingStatus)} 
                      fontSize="md"
                      px={4}
                      py={1}
                      borderRadius="full"
                      textTransform="uppercase"
                      fontWeight="bold"
                    >
                      {data.onboardingStatus}
                    </Badge>
                    <Badge 
                      colorScheme={data.isOnline ? 'green' : 'gray'} 
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {data.isOnline ? '🟢 Online' : '⚫ Offline'}
                    </Badge>
                  </VStack>
                </VStack>

                <VStack align={{ base: "center", md: "start" }} spacing={6} flex={1}>
                  <VStack align={{ base: "center", md: "start" }} spacing={3}>
                    <Heading size="2xl" color="gray.800" textAlign={{ base: "center", md: "left" }}>
                      {data.firstName} {data.lastName}
                    </Heading>
                    
                    <Text fontSize="lg" color="gray.600" maxW="2xl" textAlign={{ base: "center", md: "left" }}>
                      Driver ID: {data.driverId}
                    </Text>
                  </VStack>
                  
                  <VStack spacing={4} align={{ base: "center", md: "start" }}>
                    <HStack spacing={6} flexWrap="wrap" justify={{ base: "center", md: "start" }}>
                      <HStack spacing={3}>
                        <Box as={FiMail} color="blue.500" size="18px" />
                        <Text fontSize="lg" color="gray.700" fontWeight="medium">{data.email}</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Box as={FiPhone} color="green.500" size="18px" />
                        <Text fontSize="lg" color="gray.700" fontWeight="medium">{data.phone}</Text>
                      </HStack>
                    </HStack>
                    
                    <HStack spacing={3}>
                      <Box as={FiMapPin} color="purple.500" size="18px" />
                      <Text fontSize="lg" color="gray.700" fontWeight="medium">Base: {data.basePostcode}</Text>
                    </HStack>

                    {data.bio && (
                      <Box p={4} bg="gray.50" borderRadius="lg" maxW="2xl">
                        <Text fontSize="md" color="gray.700" lineHeight="1.6">
                          {data.bio}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </VStack>

                {/* Profile Completion */}
                <VStack spacing={4} align="center" minW="200px">
                  <VStack spacing={2} align="center">
                    <Text fontSize="4xl" fontWeight="bold" color={getCompletionColor(data.profileCompleteness) === 'green' ? 'green.500' : getCompletionColor(data.profileCompleteness) === 'yellow' ? 'yellow.500' : 'red.500'}>
                      {data.profileCompleteness}%
                    </Text>
                    <Text fontSize="lg" color="gray.600" fontWeight="medium">Profile Complete</Text>
                  </VStack>
                  <Progress
                    value={data.profileCompleteness}
                    size="lg"
                    width="150px"
                    colorScheme={getCompletionColor(data.profileCompleteness)}
                    borderRadius="full"
                  />
                  {data.profileCompleteness < 100 && (
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      Complete your profile to get more job opportunities
                    </Text>
                  )}
                </VStack>
              </Flex>

              {/* Member Info */}
              <Divider />
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                <VStack spacing={2} align="start">
                  <Text fontSize="sm" color="gray.500" fontWeight="semibold" textTransform="uppercase">Member Since</Text>
                  <HStack spacing={2}>
                    <Box as={FiCalendar} color="blue.500" />
                    <Text fontSize="lg" fontWeight="medium" color="gray.700">
                      {format(new Date(data.joinedAt), 'MMMM yyyy')}
                    </Text>
                  </HStack>
                </VStack>
                
                {data.lastLogin && (
                  <VStack spacing={2} align="start">
                    <Text fontSize="sm" color="gray.500" fontWeight="semibold" textTransform="uppercase">Last Login</Text>
                    <HStack spacing={2}>
                      <Box as={FiClock} color="green.500" />
                      <Text fontSize="lg" fontWeight="medium" color="gray.700">
                        {formatDistanceToNow(new Date(data.lastLogin), { addSuffix: true })}
                      </Text>
                    </HStack>
                  </VStack>
                )}
                
                <VStack spacing={2} align="start">
                  <Text fontSize="sm" color="gray.500" fontWeight="semibold" textTransform="uppercase">Vehicle Type</Text>
                  <HStack spacing={2}>
                    <Box as={FiTruck} color="purple.500" />
                    <Text fontSize="lg" fontWeight="medium" color="gray.700" textTransform="capitalize">
                      {data.vehicleType}
                    </Text>
                  </HStack>
                </VStack>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* Performance Stats */}
        <VStack spacing={4} align="stretch">
          <Heading size="lg" color="gray.700" textAlign="center">
            Performance Overview
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            {/* Average Rating Card */}
            <Card bg="yellow.50" borderLeft="4px solid" borderLeftColor="yellow.500" shadow="lg">
              <CardBody p={6}>
                <VStack spacing={4} align="center">
                  <Box as={FiStar} size="32px" color="yellow.500" />
                  <Stat textAlign="center">
                    <StatLabel fontSize="md" fontWeight="semibold" color="gray.600">Average Rating</StatLabel>
                    {data.totalJobs > 0 ? (
                      <>
                        <StatNumber fontSize="3xl" fontWeight="bold" color="yellow.600">
                          <HStack spacing={2} justify="center">
                            <Text>{data.averageRating.toFixed(1)}</Text>
                            <Box as={FiStar} fill="currentColor" />
                          </HStack>
                        </StatNumber>
                        <StatHelpText fontSize="md" color="gray.600">
                          From {data.totalJobs} completed jobs
                        </StatHelpText>
                      </>
                    ) : (
                      <>
                        <StatNumber fontSize="2xl" fontWeight="bold" color="gray.500">
                          No ratings yet
                        </StatNumber>
                        <StatHelpText fontSize="md" color="gray.500">
                          Complete jobs to earn ratings
                        </StatHelpText>
                      </>
                    )}
                  </Stat>
                </VStack>
              </CardBody>
            </Card>

            {/* Total Jobs Card */}
            <Card bg="blue.50" borderLeft="4px solid" borderLeftColor="blue.500" shadow="lg">
              <CardBody p={6}>
                <VStack spacing={4} align="center">
                  <Box as={FiTruck} size="32px" color="blue.500" />
                  <Stat textAlign="center">
                    <StatLabel fontSize="md" fontWeight="semibold" color="gray.600">Total Jobs</StatLabel>
                    <StatNumber fontSize="3xl" fontWeight="bold" color="blue.600">
                      {data.totalJobs}
                    </StatNumber>
                    <StatHelpText fontSize="md" color="gray.600">
                      Completed successfully
                    </StatHelpText>
                  </Stat>
                </VStack>
              </CardBody>
            </Card>

            {/* Completion Rate Card */}
            <Card bg="green.50" borderLeft="4px solid" borderLeftColor="green.500" shadow="lg">
              <CardBody p={6}>
                <VStack spacing={4} align="center">
                  <Box as={FiCheck} size="32px" color="green.500" />
                  <Stat textAlign="center">
                    <StatLabel fontSize="md" fontWeight="semibold" color="gray.600">Completion Rate</StatLabel>
                    <StatNumber fontSize="3xl" fontWeight="bold" color="green.600">
                      {data.totalJobs > 0 ? `${(data.completionRate * 100).toFixed(1)}%` : 'N/A'}
                    </StatNumber>
                    <StatHelpText fontSize="md" color="gray.600">
                      Jobs completed on time
                    </StatHelpText>
                  </Stat>
                </VStack>
              </CardBody>
            </Card>

            {/* On-Time Rate Card */}
            <Card bg="purple.50" borderLeft="4px solid" borderLeftColor="purple.500" shadow="lg">
              <CardBody p={6}>
                <VStack spacing={4} align="center">
                  <Box as={FiClock} size="32px" color="purple.500" />
                  <Stat textAlign="center">
                    <StatLabel fontSize="md" fontWeight="semibold" color="gray.600">Punctuality Rate</StatLabel>
                    <StatNumber fontSize="3xl" fontWeight="bold" color="purple.600">
                      {data.totalJobs > 0 ? `${(data.onTimeRate * 100).toFixed(1)}%` : 'N/A'}
                    </StatNumber>
                    <StatHelpText fontSize="md" color="gray.600">
                      On-time deliveries
                    </StatHelpText>
                  </Stat>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Performance Summary */}
          {data.totalJobs === 0 && (
            <Card bg="blue.50" borderRadius="lg">
              <CardBody p={6}>
                <VStack spacing={4} textAlign="center">
                  <Box as={FiTrendingUp} size="48px" color="blue.500" />
                  <Heading size="md" color="blue.700">Ready to Start Your Journey?</Heading>
                  <Text fontSize="lg" color="blue.600">
                    Complete your first job to see your performance metrics here. 
                    Your ratings and statistics will be displayed as you build your reputation.
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>

        {/* Profile Details */}
        <VStack spacing={4} align="stretch">
          <Heading size="lg" color="gray.700" textAlign="center">
            Profile Details
          </Heading>
          
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <Heading size="md">
                <FiUser style={{ display: 'inline', marginRight: '8px' }} />
                Personal Information
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    value={isEditing ? editForm.firstName : data.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    isReadOnly={!isEditing}
                    variant={isEditing ? 'outline' : 'filled'}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    value={isEditing ? editForm.lastName : data.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    isReadOnly={!isEditing}
                    variant={isEditing ? 'outline' : 'filled'}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    value={isEditing ? editForm.phone : data.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    isReadOnly={!isEditing}
                    variant={isEditing ? 'outline' : 'filled'}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    value={isEditing ? editForm.email : data.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    isReadOnly={!isEditing}
                    variant={isEditing ? 'outline' : 'filled'}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Bio</FormLabel>
                  <Textarea
                    value={isEditing ? editForm.bio : data.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    isReadOnly={!isEditing}
                    variant={isEditing ? 'outline' : 'filled'}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          {/* Driver Information */}
          <Card>
            <CardHeader>
              <Heading size="md">
                <FiTruck style={{ display: 'inline', marginRight: '8px' }} />
                Driver Information
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Base Postcode</FormLabel>
                  <Input
                    value={isEditing ? editForm.basePostcode : data.basePostcode}
                    onChange={(e) => setEditForm({ ...editForm, basePostcode: e.target.value })}
                    isReadOnly={!isEditing}
                    variant={isEditing ? 'outline' : 'filled'}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Vehicle Type</FormLabel>
                  {isEditing ? (
                    <Select
                      value={editForm.vehicleType}
                      onChange={(e) => setEditForm({ ...editForm, vehicleType: e.target.value })}
                    >
                      <option value="">Select vehicle type</option>
                      <option value="small_van">Small Van</option>
                      <option value="large_van">Large Van</option>
                      <option value="truck">Truck</option>
                      <option value="bike">Bike</option>
                    </Select>
                  ) : (
                    <Input
                      value={data.vehicleType || 'Not specified'}
                      isReadOnly
                      variant="filled"
                    />
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Driver Status</FormLabel>
                  <Input
                    value={data.status}
                    isReadOnly
                    variant="filled"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Strikes</FormLabel>
                  <Input
                    value={data.strikes}
                    isReadOnly
                    variant="filled"
                  />
                </FormControl>

                <FormControl>
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <FormLabel htmlFor="location-consent" mb="0" fontWeight="semibold">
                          Location Sharing
                        </FormLabel>
                        <Text fontSize="sm" color="gray.600">
                          {data.hasActiveOrders 
                            ? 'Required while you have active orders' 
                            : 'Allow customers to track your location'
                          }
                        </Text>
                      </VStack>
                      <Switch
                        id="location-consent"
                        size="lg"
                        colorScheme="green"
                        isChecked={data.locationConsent}
                        isDisabled={data.hasActiveOrders && data.locationConsent}
                        onChange={async (e) => {
                          if (data.hasActiveOrders && data.locationConsent) {
                            toast({
                              title: 'Cannot Disable Location Sharing',
                              description: 'You cannot disable location sharing while you have active orders.',
                              status: 'warning',
                              duration: 5000,
                              isClosable: true,
                            });
                            return;
                          }
                          
                          try {
                            const response = await fetch('/api/driver/profile', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ locationConsent: e.target.checked }),
                            });

                            if (response.ok) {
                              setData(prev => ({ ...prev, locationConsent: e.target.checked }));
                              toast({
                                title: 'Location Sharing Updated',
                                description: `Location sharing has been ${e.target.checked ? 'enabled' : 'disabled'}.`,
                                status: 'success',
                                duration: 3000,
                                isClosable: true,
                              });
                            } else {
                              const error = await response.json();
                              throw new Error(error.error || 'Failed to update location sharing');
                            }
                          } catch (error) {
                            console.error('Location sharing update error:', error);
                            toast({
                              title: 'Error',
                              description: error instanceof Error ? error.message : 'Failed to update location sharing',
                              status: 'error',
                              duration: 5000,
                              isClosable: true,
                            });
                          }
                        }}
                      />
                    </HStack>
                    
                    {data.hasActiveOrders && (
                      <Text fontSize="xs" color="orange.600" fontWeight="medium">
                        🚨 Location sharing is mandatory while you have active orders
                      </Text>
                    )}
                    
                    <Text fontSize="xs" color="gray.500">
                      • Automatically enabled when you go online<br/>
                      • Required for customer order tracking<br/>
                      • Cannot be disabled during active deliveries
                    </Text>
                  </VStack>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Recent Reviews */}
        {data.recentRatings.length > 0 && (
          <Card>
            <CardHeader>
              <Heading size="md">
                <FiStar style={{ display: 'inline', marginRight: '8px' }} />
                Recent Customer Reviews
              </Heading>
            </CardHeader>
            <CardBody>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Customer</Th>
                    <Th>Rating</Th>
                    <Th>Review</Th>
                    <Th>Job</Th>
                    <Th>Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.recentRatings.map((rating) => (
                    <Tr key={rating.id}>
                      <Td>{rating.customerName}</Td>
                      <Td>
                        <HStack spacing={1}>
                          {renderStars(rating.rating)}
                          <Text fontSize="sm" ml={2}>
                            ({rating.rating}/5)
                          </Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm" noOfLines={2} maxW="300px">
                          {rating.review || 'No review provided'}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontFamily="mono">
                          {rating.bookingReference}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {formatDistanceToNow(new Date(rating.createdAt), { addSuffix: true })}
                        </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        )}

        {/* Account Status */}
        <Card>
          <CardHeader>
            <Heading size="md">
              <FiTarget style={{ display: 'inline', marginRight: '8px' }} />
              Account Status
            </Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <VStack spacing={2}>
                <Text fontSize="sm" color="gray.500">Application Status</Text>
                <Badge colorScheme={getStatusColor(data.applicationStatus)} size="lg">
                  {data.applicationStatus}
                </Badge>
                {data.applicationDate && (
                  <Text fontSize="xs" color="gray.500">
                    Applied {formatDistanceToNow(new Date(data.applicationDate), { addSuffix: true })}
                  </Text>
                )}
              </VStack>

              <VStack spacing={2}>
                <Text fontSize="sm" color="gray.500">Account Status</Text>
                <Badge colorScheme={getStatusColor(data.status)} size="lg">
                  {data.status}
                </Badge>
                {data.lastSeenAt && (
                  <Text fontSize="xs" color="gray.500">
                    Last seen {formatDistanceToNow(new Date(data.lastSeenAt), { addSuffix: true })}
                  </Text>
                )}
              </VStack>

              <VStack spacing={2}>
                <Text fontSize="sm" color="gray.500">Online Status</Text>
                <Badge colorScheme={data.isOnline ? 'green' : 'gray'} size="lg">
                  {data.isOnline ? 'Online' : 'Offline'}
                </Badge>
                <Text fontSize="xs" color="gray.500">
                  Location consent: {data.locationConsent ? 'Granted' : 'Not granted'}
                </Text>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>
        </VStack>
      </VStack>
    </Container>
  );
}