'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
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
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const fetchProfileData = async (showRefreshToast = false) => {
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
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleEditStart = () => {
    setIsEditing(true);
  };

  const handleEditCancel = () => {
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
  };

  const handleEditSave = async () => {
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
  };

  const createSampleProfile = async () => {
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
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'green';
      case 'pending': return 'yellow';
      case 'active': return 'green';
      case 'offline': return 'gray';
      default: return 'gray';
    }
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'yellow';
    return 'red';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Box
        key={i}
        as={FiStar}
        color={i < rating ? 'yellow.400' : 'gray.300'}
        fill={i < rating ? 'yellow.400' : 'transparent'}
      />
    ));
  };

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
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={2}>
            <Heading size="2xl" color="blue.600">
              👤 Driver Profile
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Manage your profile and view your performance
            </Text>
          </VStack>
          
          <HStack spacing={3}>
            <Tooltip label="Refresh data">
              <IconButton
                aria-label="Refresh"
                icon={<FiRefreshCw />}
                onClick={() => fetchProfileData(true)}
                isLoading={refreshing}
                variant="outline"
                colorScheme="blue"
              />
            </Tooltip>
            {data.profileCompleteness < 50 && (
              <Button
                variant="outline"
                colorScheme="green"
                size="sm"
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
              >
                Edit Profile
              </Button>
            ) : (
              <HStack spacing={2}>
                <Button
                  leftIcon={<FiSave />}
                  onClick={handleEditSave}
                  isLoading={isSaving}
                  colorScheme="green"
                  size="sm"
                >
                  Save
                </Button>
                <Button
                  leftIcon={<FiX />}
                  onClick={handleEditCancel}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </HStack>
            )}
          </HStack>
        </HStack>

        {/* Profile Overview */}
        <Card>
          <CardBody>
            <HStack spacing={6} align="start">
              <Avatar
                size="xl"
                src={data.profileImage}
                name={`${data.firstName} ${data.lastName}`}
              />
              <VStack align="start" spacing={3} flex={1}>
                <HStack spacing={3}>
                  <Heading size="lg">
                    {data.firstName} {data.lastName}
                  </Heading>
                  <Badge colorScheme={getStatusColor(data.onboardingStatus)} size="sm">
                    {data.onboardingStatus}
                  </Badge>
                  <Badge colorScheme={data.isOnline ? 'green' : 'gray'} size="sm">
                    {data.isOnline ? 'Online' : 'Offline'}
                  </Badge>
                </HStack>
                
                <HStack spacing={4}>
                  <HStack spacing={1}>
                    <FiMail color="gray" />
                    <Text fontSize="sm" color="gray.600">{data.email}</Text>
                  </HStack>
                  <HStack spacing={1}>
                    <FiPhone color="gray" />
                    <Text fontSize="sm" color="gray.600">{data.phone}</Text>
                  </HStack>
                  <HStack spacing={1}>
                    <FiMapPin color="gray" />
                    <Text fontSize="sm" color="gray.600">{data.basePostcode}</Text>
                  </HStack>
                </HStack>

                {data.bio && (
                  <Text fontSize="sm" color="gray.600" maxW="md">
                    {data.bio}
                  </Text>
                )}

                <HStack spacing={4}>
                  <VStack spacing={0} align="start">
                    <Text fontSize="xs" color="gray.500">Member Since</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {format(new Date(data.joinedAt), 'MMM yyyy')}
                    </Text>
                  </VStack>
                  {data.lastLogin && (
                    <VStack spacing={0} align="start">
                      <Text fontSize="xs" color="gray.500">Last Login</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {formatDistanceToNow(new Date(data.lastLogin), { addSuffix: true })}
                      </Text>
                    </VStack>
                  )}
                </HStack>
              </VStack>

              <VStack spacing={2} align="end">
                <VStack spacing={1} align="center">
                  <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                    {data.profileCompleteness}%
                  </Text>
                  <Text fontSize="xs" color="gray.500">Profile Complete</Text>
                </VStack>
                <Progress
                  value={data.profileCompleteness}
                  size="sm"
                  width="100px"
                  colorScheme={getCompletionColor(data.profileCompleteness)}
                />
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Performance Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Average Rating</StatLabel>
                <StatNumber color="yellow.500">
                  <HStack spacing={1}>
                    <Text>{data.averageRating.toFixed(1)}</Text>
                    <FiStar />
                  </HStack>
                </StatNumber>
                <StatHelpText>
                  From {data.totalJobs} completed jobs
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Jobs</StatLabel>
                <StatNumber color="blue.500">{data.totalJobs}</StatNumber>
                <StatHelpText>
                  <FiTruck style={{ display: 'inline', marginRight: '4px' }} />
                  Completed successfully
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Completion Rate</StatLabel>
                <StatNumber color="green.500">
                  {(data.completionRate * 100).toFixed(1)}%
                </StatNumber>
                <StatHelpText>
                  <FiCheck style={{ display: 'inline', marginRight: '4px' }} />
                  Jobs completed
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>On-Time Rate</StatLabel>
                <StatNumber color="purple.500">
                  {(data.onTimeRate * 100).toFixed(1)}%
                </StatNumber>
                <StatHelpText>
                  <FiClock style={{ display: 'inline', marginRight: '4px' }} />
                  Punctual deliveries
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Profile Details */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
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

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="location-consent" mb="0">
                    Location Sharing
                  </FormLabel>
                  <Switch
                    id="location-consent"
                    isChecked={data.locationConsent}
                    isDisabled
                  />
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
    </Container>
  );
}