'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Switch,
  FormControl,
  FormLabel,
  Button,
  Divider,
  HStack,
  Badge,
  useBreakpointValue,
  Stack,
  Input,
  Select,
  Textarea,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Avatar,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
} from '@chakra-ui/react';
import { 
  FiSettings, 
  FiBell, 
  FiShield, 
  FiMail, 
  FiUser, 
  FiTruck, 
  FiMapPin, 
  FiPhone, 
  FiEdit3,
  FiSave,
  FiLock,
  FiEye,
  FiEyeOff,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiRefreshCw
} from 'react-icons/fi';

export default function DriverSettings() {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const toast = useToast();
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    name: 'Ahmed Mohammed',
    email: 'ahmed@speedyvan.com', 
    phone: '+44 7901 846297',
    address: '123 Glasgow Street, Glasgow, UK',
    emergencyContact: '+44 7901 846298',
    drivingLicense: 'GB123456789',
    vehicleReg: 'SV21 ABC'
  });
  
  // Notifications settings
  const [notifications, setNotifications] = useState({
    jobAlerts: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    weeklyReports: true
  });
  
  // Availability settings
  const [availability, setAvailability] = useState({
    workingHours: {
      start: '08:00',
      end: '18:00'
    },
    workingDays: {
      monday: true,
      tuesday: true, 
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    maxJobsPerDay: 8,
    autoAcceptJobs: false
  });
  
  // Vehicle settings
  const [vehicleSettings, setVehicleSettings] = useState({
    vehicleType: 'van',
    maxWeight: '1000',
    specialEquipment: ['trolley', 'straps'],
    insuranceExpiry: '2025-12-31',
    motExpiry: '2025-06-15'
  });
  
  // Modals
  const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: onPasswordClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  // Password change
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Save functions
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: 'Notifications Updated',
        description: 'Your notification preferences have been saved.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notifications.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      toast({
        title: 'Password Changed',
        description: 'Your password has been successfully updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setPasswordData({ current: '', new: '', confirm: '' });
      onPasswordClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to change password.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container maxW="container.xl" py={{ base: 4, md: 8 }}>
      <VStack spacing={{ base: 6, md: 8 }} align="stretch">
        {/* Header */}
        <VStack spacing={{ base: 3, md: 4 }} textAlign="center">
          <Heading size={{ base: "lg", md: "2xl" }} color="blue.600">
            ⚙️ Driver Settings
          </Heading>
          <Text fontSize={{ base: "md", md: "lg" }} color="gray.600">
            Manage your profile, notifications, and preferences
          </Text>
        </VStack>

        {/* Account Status Overview */}
        <Card>
          <CardBody p={{ base: 4, md: 6 }}>
            <VStack spacing={4}>
              <Flex align="center" justify="space-between" w="full" direction={{ base: "column", md: "row" }}>
                <HStack spacing={4}>
                  <Avatar size="lg" name={profileData.name} />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xl" fontWeight="bold">{profileData.name}</Text>
                    <Text color="gray.600">{profileData.email}</Text>
                    <Badge colorScheme="green">Active Driver</Badge>
                  </VStack>
                </HStack>
                
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mt={{ base: 4, md: 0 }}>
                  <Stat textAlign="center">
                    <StatLabel>Status</StatLabel>
                    <StatNumber fontSize="md" color="green.500">Active</StatNumber>
                  </Stat>
                  <Stat textAlign="center">
                    <StatLabel>Rating</StatLabel>
                    <StatNumber fontSize="md">4.8</StatNumber>
                    <StatHelpText>⭐⭐⭐⭐⭐</StatHelpText>
                  </Stat>
                  <Stat textAlign="center">
                    <StatLabel>Completed</StatLabel>
                    <StatNumber fontSize="md">247</StatNumber>
                    <StatHelpText>Jobs</StatHelpText>
                  </Stat>
                  <Stat textAlign="center">
                    <StatLabel>Earnings</StatLabel>
                    <StatNumber fontSize="md">£2,340</StatNumber>
                    <StatHelpText>This month</StatHelpText>
                  </Stat>
                </SimpleGrid>
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* Settings Tabs */}
        <Card>
          <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
            <TabList>
              <Tab><Icon as={FiUser} mr={2} />Profile</Tab>
              <Tab><Icon as={FiBell} mr={2} />Notifications</Tab>
              <Tab><Icon as={FiTruck} mr={2} />Vehicle</Tab>
              <Tab><Icon as={FiMapPin} mr={2} />Availability</Tab>
              <Tab><Icon as={FiShield} mr={2} />Security</Tab>
            </TabList>

            <TabPanels>
              {/* Profile Tab */}
              <TabPanel p={{ base: 4, md: 6 }}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="blue.600">Personal Information</Heading>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Full Name</FormLabel>
                      <Input 
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Email Address</FormLabel>
                      <Input 
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Phone Number</FormLabel>
                      <Input 
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Emergency Contact</FormLabel>
                      <Input 
                        value={profileData.emergencyContact}
                        onChange={(e) => setProfileData({...profileData, emergencyContact: e.target.value})}
                      />
                    </FormControl>
                  </SimpleGrid>
                  
                  <FormControl>
                    <FormLabel>Address</FormLabel>
                    <Textarea 
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    />
                  </FormControl>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Driving License Number</FormLabel>
                      <Input 
                        value={profileData.drivingLicense}
                        onChange={(e) => setProfileData({...profileData, drivingLicense: e.target.value})}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Vehicle Registration</FormLabel>
                      <Input 
                        value={profileData.vehicleReg}
                        onChange={(e) => setProfileData({...profileData, vehicleReg: e.target.value})}
                      />
                    </FormControl>
                  </SimpleGrid>
                  
                  <Button 
                    colorScheme="blue" 
                    onClick={handleSaveProfile}
                    isLoading={isSaving}
                    leftIcon={<FiSave />}
                    alignSelf="start"
                  >
                    Save Profile
                  </Button>
                </VStack>
              </TabPanel>

              {/* Notifications Tab */}
              <TabPanel p={{ base: 4, md: 6 }}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="blue.600">Notification Preferences</Heading>
                  
                  <VStack spacing={4} align="stretch">
                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                      <VStack align="start" spacing={1}>
                        <FormLabel mb="0">Job Alerts</FormLabel>
                        <Text fontSize="sm" color="gray.600">Receive notifications for new job opportunities</Text>
                      </VStack>
                      <Switch 
                        colorScheme="blue" 
                        isChecked={notifications.jobAlerts}
                        onChange={(e) => setNotifications({...notifications, jobAlerts: e.target.checked})}
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                      <VStack align="start" spacing={1}>
                        <FormLabel mb="0">Push Notifications</FormLabel>
                        <Text fontSize="sm" color="gray.600">Instant notifications on your device</Text>
                      </VStack>
                      <Switch 
                        colorScheme="blue" 
                        isChecked={notifications.pushNotifications}
                        onChange={(e) => setNotifications({...notifications, pushNotifications: e.target.checked})}
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                      <VStack align="start" spacing={1}>
                        <FormLabel mb="0">Email Notifications</FormLabel>
                        <Text fontSize="sm" color="gray.600">Job updates and important information via email</Text>
                      </VStack>
                      <Switch 
                        colorScheme="blue" 
                        isChecked={notifications.emailNotifications}
                        onChange={(e) => setNotifications({...notifications, emailNotifications: e.target.checked})}
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                      <VStack align="start" spacing={1}>
                        <FormLabel mb="0">SMS Notifications</FormLabel>
                        <Text fontSize="sm" color="gray.600">Text messages for urgent job updates</Text>
                      </VStack>
                      <Switch 
                        colorScheme="blue" 
                        isChecked={notifications.smsNotifications}
                        onChange={(e) => setNotifications({...notifications, smsNotifications: e.target.checked})}
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                      <VStack align="start" spacing={1}>
                        <FormLabel mb="0">Weekly Reports</FormLabel>
                        <Text fontSize="sm" color="gray.600">Summary of your weekly performance and earnings</Text>
                      </VStack>
                      <Switch 
                        colorScheme="blue" 
                        isChecked={notifications.weeklyReports}
                        onChange={(e) => setNotifications({...notifications, weeklyReports: e.target.checked})}
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                      <VStack align="start" spacing={1}>
                        <FormLabel mb="0">Marketing Emails</FormLabel>
                        <Text fontSize="sm" color="gray.600">Promotional offers and updates</Text>
                      </VStack>
                      <Switch 
                        colorScheme="blue" 
                        isChecked={notifications.marketingEmails}
                        onChange={(e) => setNotifications({...notifications, marketingEmails: e.target.checked})}
                      />
                    </FormControl>
                  </VStack>
                  
                  <Button 
                    colorScheme="blue" 
                    onClick={handleSaveNotifications}
                    isLoading={isSaving}
                    leftIcon={<FiSave />}
                    alignSelf="start"
                  >
                    Save Preferences
                  </Button>
                </VStack>
              </TabPanel>

              {/* Vehicle Tab */}
              <TabPanel p={{ base: 4, md: 6 }}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="blue.600">Vehicle Information</Heading>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Vehicle Type</FormLabel>
                      <Select 
                        value={vehicleSettings.vehicleType}
                        onChange={(e) => setVehicleSettings({...vehicleSettings, vehicleType: e.target.value})}
                      >
                        <option value="van">Standard Van</option>
                        <option value="large-van">Large Van</option>
                        <option value="truck">Small Truck</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Maximum Weight (kg)</FormLabel>
                      <Input 
                        type="number"
                        value={vehicleSettings.maxWeight}
                        onChange={(e) => setVehicleSettings({...vehicleSettings, maxWeight: e.target.value})}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Insurance Expiry</FormLabel>
                      <Input 
                        type="date"
                        value={vehicleSettings.insuranceExpiry}
                        onChange={(e) => setVehicleSettings({...vehicleSettings, insuranceExpiry: e.target.value})}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>MOT Expiry</FormLabel>
                      <Input 
                        type="date"
                        value={vehicleSettings.motExpiry}
                        onChange={(e) => setVehicleSettings({...vehicleSettings, motExpiry: e.target.value})}
                      />
                    </FormControl>
                  </SimpleGrid>
                  
                  <Alert status="info">
                    <AlertIcon />
                    <AlertDescription>
                      Keep your vehicle documents up to date to maintain your driver status and continue receiving jobs.
                    </AlertDescription>
                  </Alert>
                </VStack>
              </TabPanel>

              {/* Availability Tab */}
              <TabPanel p={{ base: 4, md: 6 }}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="blue.600">Availability Settings</Heading>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <VStack spacing={4} align="stretch">
                      <Text fontWeight="semibold">Working Hours</Text>
                      <HStack>
                        <FormControl>
                          <FormLabel>Start Time</FormLabel>
                          <Input 
                            type="time"
                            value={availability.workingHours.start}
                            onChange={(e) => setAvailability({
                              ...availability, 
                              workingHours: {...availability.workingHours, start: e.target.value}
                            })}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>End Time</FormLabel>
                          <Input 
                            type="time"
                            value={availability.workingHours.end}
                            onChange={(e) => setAvailability({
                              ...availability, 
                              workingHours: {...availability.workingHours, end: e.target.value}
                            })}
                          />
                        </FormControl>
                      </HStack>
                      
                      <FormControl>
                        <FormLabel>Maximum Jobs Per Day</FormLabel>
                        <Input 
                          type="number"
                          min="1"
                          max="20"
                          value={availability.maxJobsPerDay}
                          onChange={(e) => setAvailability({...availability, maxJobsPerDay: parseInt(e.target.value)})}
                        />
                      </FormControl>
                      
                      <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <VStack align="start" spacing={1}>
                          <FormLabel mb="0">Auto-Accept Jobs</FormLabel>
                          <Text fontSize="sm" color="gray.600">Automatically accept suitable jobs</Text>
                        </VStack>
                        <Switch 
                          colorScheme="blue" 
                          isChecked={availability.autoAcceptJobs}
                          onChange={(e) => setAvailability({...availability, autoAcceptJobs: e.target.checked})}
                        />
                      </FormControl>
                    </VStack>
                    
                    <VStack spacing={4} align="stretch">
                      <Text fontWeight="semibold">Working Days</Text>
                      {Object.entries(availability.workingDays).map(([day, isWorking]) => (
                        <FormControl key={day} display="flex" alignItems="center" justifyContent="space-between">
                          <FormLabel mb="0" textTransform="capitalize">{day}</FormLabel>
                          <Switch 
                            colorScheme="blue" 
                            isChecked={isWorking}
                            onChange={(e) => setAvailability({
                              ...availability,
                              workingDays: {...availability.workingDays, [day]: e.target.checked}
                            })}
                          />
                        </FormControl>
                      ))}
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* Security Tab */}
              <TabPanel p={{ base: 4, md: 6 }}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="blue.600">Security & Privacy</Heading>
                  
                  <VStack spacing={4} align="stretch">
                    <Card variant="outline">
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <Text fontWeight="semibold">Password & Authentication</Text>
                          <Button 
                            variant="outline" 
                            leftIcon={<FiLock />}
                            onClick={onPasswordOpen}
                            size="lg"
                          >
                            Change Password
                          </Button>
                          <Text fontSize="sm" color="gray.600">
                            Last changed: Never (Please update your password)
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                    
                    <Card variant="outline">
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <Text fontWeight="semibold">Data & Privacy</Text>
                          <HStack spacing={3}>
                            <Button 
                              variant="outline" 
                              leftIcon={<FiDownload />}
                              size="md"
                            >
                              Download My Data
                            </Button>
                            <Button 
                              variant="outline" 
                              leftIcon={<FiRefreshCw />}
                              size="md"
                            >
                              Privacy Settings
                            </Button>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            Manage your personal data and privacy preferences
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                    
                    <Card variant="outline" borderColor="red.200">
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <Text fontWeight="semibold" color="red.600">Danger Zone</Text>
                          <Button 
                            colorScheme="red" 
                            variant="outline"
                            leftIcon={<FiTrash2 />}
                            onClick={onDeleteOpen}
                            size="lg"
                          >
                            Delete Account
                          </Button>
                          <Text fontSize="sm" color="red.600">
                            Permanently delete your account and all associated data
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  </VStack>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>

        {/* Password Change Modal */}
        <Modal isOpen={isPasswordOpen} onClose={onPasswordClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Change Password</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Current Password</FormLabel>
                  <HStack>
                    <Input 
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                    />
                    <Button
                      size="sm"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    >
                      {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                    </Button>
                  </HStack>
                </FormControl>
                
                <FormControl>
                  <FormLabel>New Password</FormLabel>
                  <HStack>
                    <Input 
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                    />
                    <Button
                      size="sm"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    >
                      {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                    </Button>
                  </HStack>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Confirm New Password</FormLabel>
                  <HStack>
                    <Input 
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                    />
                    <Button
                      size="sm"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    >
                      {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                    </Button>
                  </HStack>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onPasswordClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={handleChangePassword}
                isLoading={isSaving}
              >
                Change Password
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Account Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader color="red.600">Delete Account</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Alert status="warning">
                  <AlertIcon />
                  <AlertDescription>
                    This action cannot be undone. Your account and all data will be permanently deleted.
                  </AlertDescription>
                </Alert>
                <Text>
                  Are you sure you want to delete your account? This will:
                </Text>
                <VStack align="start" spacing={2} pl={4}>
                  <Text>• Delete all your personal information</Text>
                  <Text>• Remove your job history</Text>
                  <Text>• Cancel any pending jobs</Text>
                  <Text>• Permanently disable your driver account</Text>
                </VStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red">
                Yes, Delete My Account
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
}
