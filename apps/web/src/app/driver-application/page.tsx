'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Card,
  CardBody,
  Grid,
  GridItem,
  Image,
  IconButton,
  Badge,
  Alert,
  AlertIcon,
  Progress,
  Divider,
  Select,
  Textarea,
  Checkbox,
  Link,
  useColorModeValue,
  Container,
  Flex,
  Spacer,
  Icon,
  InputGroup,
  InputRightElement,
  FormHelperText,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiUpload, FiX, FiEye, FiEyeOff, FiMapPin, FiUser, FiMail, FiPhone, FiCreditCard, FiShield, FiFileText, FiCamera } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const MotionBox = motion.create(Box);

interface DriverApplication {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  dateOfBirth: string;
  nationalInsuranceNumber: string;
  
  // Address Information
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  county: string;
  
  // Driving Information
  drivingLicenseNumber: string;
  drivingLicenseExpiry: string;
  drivingLicenseFront: File | null;
  drivingLicenseBack: File | null;
  
  // Insurance Information
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiry: string;
  insuranceDocument: File | null;
  
  // Banking Information
  bankName: string;
  accountHolderName: string;
  sortCode: string;
  accountNumber: string;
  
  // Right to Work
  rightToWorkShareCode: string;
  rightToWorkDocument: File | null;
  
  // Additional Information
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  
  // Terms and Conditions
  agreeToTerms: boolean;
  agreeToDataProcessing: boolean;
  agreeToBackgroundCheck: boolean;
}

export default function DriverApplicationPage() {
  const router = useRouter();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [formData, setFormData] = useState<DriverApplication>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    nationalInsuranceNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    county: '',
    drivingLicenseNumber: '',
    drivingLicenseExpiry: '',
    drivingLicenseFront: null,
    drivingLicenseBack: null,
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceExpiry: '',
    insuranceDocument: null,
    bankName: '',
    accountHolderName: '',
    sortCode: '',
    accountNumber: '',
    rightToWorkShareCode: '',
    rightToWorkDocument: null,
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    agreeToTerms: false,
    agreeToDataProcessing: false,
    agreeToBackgroundCheck: false,
  });

  const steps = [
    { number: 1, title: 'Personal Information', description: 'Basic details and contact information' },
    { number: 2, title: 'Address & Identity', description: 'Address verification and national insurance' },
    { number: 3, title: 'Driving License', description: 'Driving license details and photos' },
    { number: 4, title: 'Insurance & Banking', description: 'Insurance details and bank account information' },
    { number: 5, title: 'Right to Work', description: 'UK work authorization and documents' },
    { number: 6, title: 'Emergency Contact', description: 'Emergency contact information' },
    { number: 7, title: 'Terms & Submit', description: 'Review and submit application' },
  ];

  // Address autocomplete functionality
  const handleAddressSearch = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    try {
      // Using UK Postcodes API for address lookup
      const response = await fetch(`https://api.postcodes.io/postcodes/${query}/autocomplete`);
      const data = await response.json();
      
      if (data.result) {
        setAddressSuggestions(data.result);
        setShowAddressSuggestions(true);
      }
    } catch (error) {
      console.error('Address lookup error:', error);
    }
  };

  const handleAddressSelect = async (postcode: string) => {
    try {
      const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
      const data = await response.json();
      
      if (data.result) {
        setFormData(prev => ({
          ...prev,
          addressLine1: data.result.premises || data.result.street,
          city: data.result.admin_district,
          postcode: data.result.postcode,
          county: data.result.admin_county,
        }));
      }
    } catch (error) {
      console.error('Address details error:', error);
    }
    
    setShowAddressSuggestions(false);
  };

  const handleFileUpload = (field: keyof DriverApplication, file: File) => {
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload JPEG, PNG, or PDF files only',
        status: 'error',
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please upload files smaller than 5MB',
        status: 'error',
      });
      return;
    }

    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.email && 
                 formData.password && formData.confirmPassword && formData.phone && 
                 formData.dateOfBirth && formData.password === formData.confirmPassword);
      case 2:
        return !!(formData.addressLine1 && formData.city && formData.postcode && 
                 formData.nationalInsuranceNumber);
      case 3:
        return !!(formData.drivingLicenseNumber && formData.drivingLicenseExpiry && 
                 formData.drivingLicenseFront && formData.drivingLicenseBack);
      case 4:
        return !!(formData.insuranceProvider && formData.insurancePolicyNumber && 
                 formData.insuranceExpiry && formData.bankName && formData.sortCode && 
                 formData.accountNumber);
      case 5:
        return !!(formData.rightToWorkShareCode && formData.rightToWorkDocument);
      case 6:
        return !!(formData.emergencyContactName && formData.emergencyContactPhone && 
                 formData.emergencyContactRelationship);
      case 7:
        return !!(formData.agreeToTerms && formData.agreeToDataProcessing && 
                 formData.agreeToBackgroundCheck);
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(7)) {
      toast({
        title: 'Please complete all required fields',
        status: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          formDataToSend.append(key, value);
        } else if (typeof value === 'boolean') {
          formDataToSend.append(key, value.toString());
        } else {
          formDataToSend.append(key, value || '');
        }
      });

      const response = await fetch('/api/driver/applications', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        toast({
          title: 'Application submitted successfully',
          description: 'We will review your application and contact you within 3-5 business days',
          status: 'success',
          duration: 5000,
        });
        router.push('/driver-application/success');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit application');
      }
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'Please try again',
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="md" color="blue.600">Personal Information</Heading>
            
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter your first name"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter your last name"
                />
              </FormControl>
            </Grid>

            <FormControl isRequired>
              <FormLabel>Email Address</FormLabel>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email address"
              />
            </FormControl>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create a password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={<Icon as={showPassword ? FiEyeOff : FiEye} />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm your password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      icon={<Icon as={showConfirmPassword ? FiEyeOff : FiEye} />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl isRequired>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Date of Birth</FormLabel>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </FormControl>
            </Grid>
          </VStack>
        );

      case 2:
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="md" color="blue.600">Address & Identity</Heading>
            
            <FormControl isRequired>
              <FormLabel>National Insurance Number</FormLabel>
              <Input
                value={formData.nationalInsuranceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, nationalInsuranceNumber: e.target.value }))}
                placeholder="e.g., AB123456C"
                maxLength={9}
              />
              <FormHelperText>Format: 2 letters, 6 numbers, 1 letter (e.g., AB123456C)</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Postcode</FormLabel>
              <Input
                value={formData.postcode}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, postcode: e.target.value }));
                  handleAddressSearch(e.target.value);
                }}
                placeholder="Enter your postcode"
                onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
              />
              {showAddressSuggestions && (
                <Box position="relative">
                  <Box
                    position="absolute"
                    top="100%"
                    left={0}
                    right={0}
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    boxShadow="lg"
                    zIndex={10}
                    maxH="200px"
                    overflowY="auto"
                  >
                    {addressSuggestions.map((suggestion, index) => (
                      <Box
                        key={index}
                        px={4}
                        py={2}
                        cursor="pointer"
                        _hover={{ bg: 'gray.100' }}
                        onClick={() => handleAddressSelect(suggestion)}
                      >
                        {suggestion}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Address Line 1</FormLabel>
              <Input
                value={formData.addressLine1}
                onChange={(e) => setFormData(prev => ({ ...prev, addressLine1: e.target.value }))}
                placeholder="House number and street name"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Address Line 2</FormLabel>
              <Input
                value={formData.addressLine2}
                onChange={(e) => setFormData(prev => ({ ...prev, addressLine2: e.target.value }))}
                placeholder="Apartment, suite, etc. (optional)"
              />
            </FormControl>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl isRequired>
                <FormLabel>City</FormLabel>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter your city"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>County</FormLabel>
                <Input
                  value={formData.county}
                  onChange={(e) => setFormData(prev => ({ ...prev, county: e.target.value }))}
                  placeholder="Enter your county"
                />
              </FormControl>
            </Grid>
          </VStack>
        );

      case 3:
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="md" color="blue.600">Driving License</Heading>
            
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl isRequired>
                <FormLabel>Driving License Number</FormLabel>
                <Input
                  value={formData.drivingLicenseNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, drivingLicenseNumber: e.target.value }))}
                  placeholder="Enter your driving license number"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Expiry Date</FormLabel>
                <Input
                  type="date"
                  value={formData.drivingLicenseExpiry}
                  onChange={(e) => setFormData(prev => ({ ...prev, drivingLicenseExpiry: e.target.value }))}
                />
              </FormControl>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl isRequired>
                <FormLabel>Driving License Front</FormLabel>
                <Box
                  border="2px dashed"
                  borderColor="gray.300"
                  borderRadius="md"
                  p={4}
                  textAlign="center"
                  position="relative"
                >
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('drivingLicenseFront', file);
                    }}
                    position="absolute"
                    top={0}
                    left={0}
                    width="100%"
                    height="100%"
                    opacity={0}
                    cursor="pointer"
                  />
                  <VStack spacing={2}>
                    <Icon as={FiCamera} boxSize={6} color="gray.400" />
                    <Text fontSize="sm" color="gray.500">
                      Click to upload front of driving license
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      JPEG, PNG, or PDF (max 5MB)
                    </Text>
                  </VStack>
                </Box>
                {formData.drivingLicenseFront && (
                  <Text fontSize="sm" color="green.500" mt={2}>
                    ✓ {formData.drivingLicenseFront.name}
                  </Text>
                )}
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Driving License Back</FormLabel>
                <Box
                  border="2px dashed"
                  borderColor="gray.300"
                  borderRadius="md"
                  p={4}
                  textAlign="center"
                  position="relative"
                >
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('drivingLicenseBack', file);
                    }}
                    position="absolute"
                    top={0}
                    left={0}
                    width="100%"
                    height="100%"
                    opacity={0}
                    cursor="pointer"
                  />
                  <VStack spacing={2}>
                    <Icon as={FiCamera} boxSize={6} color="gray.400" />
                    <Text fontSize="sm" color="gray.500">
                      Click to upload back of driving license
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      JPEG, PNG, or PDF (max 5MB)
                    </Text>
                  </VStack>
                </Box>
                {formData.drivingLicenseBack && (
                  <Text fontSize="sm" color="green.500" mt={2}>
                    ✓ {formData.drivingLicenseBack.name}
                  </Text>
                )}
              </FormControl>
            </Grid>
          </VStack>
        );

      case 4:
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="md" color="blue.600">Insurance & Banking</Heading>
            
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl isRequired>
                <FormLabel>Insurance Provider</FormLabel>
                <Input
                  value={formData.insuranceProvider}
                  onChange={(e) => setFormData(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                  placeholder="Enter insurance provider name"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Policy Number</FormLabel>
                <Input
                  value={formData.insurancePolicyNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, insurancePolicyNumber: e.target.value }))}
                  placeholder="Enter policy number"
                />
              </FormControl>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl isRequired>
                <FormLabel>Insurance Expiry Date</FormLabel>
                <Input
                  type="date"
                  value={formData.insuranceExpiry}
                  onChange={(e) => setFormData(prev => ({ ...prev, insuranceExpiry: e.target.value }))}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Insurance Document</FormLabel>
                <Box
                  border="2px dashed"
                  borderColor="gray.300"
                  borderRadius="md"
                  p={4}
                  textAlign="center"
                  position="relative"
                >
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('insuranceDocument', file);
                    }}
                    position="absolute"
                    top={0}
                    left={0}
                    width="100%"
                    height="100%"
                    opacity={0}
                    cursor="pointer"
                  />
                  <VStack spacing={2}>
                    <Icon as={FiFileText} boxSize={6} color="gray.400" />
                    <Text fontSize="sm" color="gray.500">
                      Upload insurance certificate
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      JPEG, PNG, or PDF (max 5MB)
                    </Text>
                  </VStack>
                </Box>
                {formData.insuranceDocument && (
                  <Text fontSize="sm" color="green.500" mt={2}>
                    ✓ {formData.insuranceDocument.name}
                  </Text>
                )}
              </FormControl>
            </Grid>

            <Divider />

            <Heading size="sm" color="blue.600">Banking Information</Heading>
            
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl isRequired>
                <FormLabel>Bank Name</FormLabel>
                <Input
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="Enter your bank name"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Account Holder Name</FormLabel>
                <Input
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountHolderName: e.target.value }))}
                  placeholder="Name on bank account"
                />
              </FormControl>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl isRequired>
                <FormLabel>Sort Code</FormLabel>
                <Input
                  value={formData.sortCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortCode: e.target.value }))}
                  placeholder="e.g., 12-34-56"
                  maxLength={8}
                />
                <FormHelperText>Format: XX-XX-XX</FormHelperText>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Account Number</FormLabel>
                <Input
                  value={formData.accountNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="8-digit account number"
                  maxLength={8}
                />
              </FormControl>
            </Grid>
          </VStack>
        );

      case 5:
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="md" color="blue.600">Right to Work</Heading>
            
            <Alert status="info">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">UK Right to Work Verification</Text>
                <Text fontSize="sm">
                  You must provide proof of your right to work in the UK. This can be done through a share code from the UK government.
                </Text>
              </Box>
            </Alert>

            <FormControl isRequired>
              <FormLabel>Right to Work Share Code</FormLabel>
              <Input
                value={formData.rightToWorkShareCode}
                onChange={(e) => setFormData(prev => ({ ...prev, rightToWorkShareCode: e.target.value }))}
                placeholder="Enter your 9-character share code"
                maxLength={9}
              />
              <FormHelperText>
                Get your share code from{' '}
                <Link href="https://www.gov.uk/prove-right-to-work" isExternal color="blue.500">
                  gov.uk/prove-right-to-work
                </Link>
              </FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Right to Work Document</FormLabel>
              <Box
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="md"
                p={4}
                textAlign="center"
                position="relative"
              >
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload('rightToWorkDocument', file);
                  }}
                  position="absolute"
                  top={0}
                  left={0}
                  width="100%"
                  height="100%"
                  opacity={0}
                  cursor="pointer"
                />
                <VStack spacing={2}>
                  <Icon as={FiShield} boxSize={6} color="gray.400" />
                  <Text fontSize="sm" color="gray.500">
                    Upload right to work document
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    Passport, BRP, or other valid document (max 5MB)
                  </Text>
                </VStack>
              </Box>
              {formData.rightToWorkDocument && (
                <Text fontSize="sm" color="green.500" mt={2}>
                  ✓ {formData.rightToWorkDocument.name}
                </Text>
              )}
            </FormControl>
          </VStack>
        );

      case 6:
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="md" color="blue.600">Emergency Contact</Heading>
            
            <FormControl isRequired>
              <FormLabel>Emergency Contact Name</FormLabel>
              <Input
                value={formData.emergencyContactName}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                placeholder="Full name of emergency contact"
              />
            </FormControl>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl isRequired>
                <FormLabel>Emergency Contact Phone</FormLabel>
                <Input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                  placeholder="Phone number"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Relationship</FormLabel>
                <Select
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactRelationship: e.target.value }))}
                  placeholder="Select relationship"
                >
                  <option value="spouse">Spouse/Partner</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>
            </Grid>
          </VStack>
        );

      case 7:
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="md" color="blue.600">Terms & Conditions</Heading>
            
            <Alert status="warning">
              <AlertIcon />
              <Text>
                Please review all information before submitting. You will not be able to edit your application after submission.
              </Text>
            </Alert>

            <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md" maxH="300px" overflowY="auto">
              <Text fontSize="sm" lineHeight="tall">
                <strong>Application Summary:</strong><br />
                Name: {formData.firstName} {formData.lastName}<br />
                Email: {formData.email}<br />
                Phone: {formData.phone}<br />
                Address: {formData.addressLine1}, {formData.city}, {formData.postcode}<br />
                Driving License: {formData.drivingLicenseNumber}<br />
                Insurance: {formData.insuranceProvider}<br />
                Bank: {formData.bankName}<br />
                Emergency Contact: {formData.emergencyContactName} ({formData.emergencyContactRelationship})
              </Text>
            </Box>

            <VStack spacing={4} align="stretch">
              <Checkbox
                isChecked={formData.agreeToTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
              >
                I agree to the{' '}
                <Link href="/terms" isExternal color="blue.500">
                  Terms and Conditions
                </Link>
              </Checkbox>

              <Checkbox
                isChecked={formData.agreeToDataProcessing}
                onChange={(e) => setFormData(prev => ({ ...prev, agreeToDataProcessing: e.target.checked }))}
              >
                I consent to the processing of my personal data for employment purposes
              </Checkbox>

              <Checkbox
                isChecked={formData.agreeToBackgroundCheck}
                onChange={(e) => setFormData(prev => ({ ...prev, agreeToBackgroundCheck: e.target.checked }))}
              >
                I authorize Speedy Van to conduct background checks and verify all provided information
              </Checkbox>
            </VStack>

            <Alert status="info">
              <AlertIcon />
              <Text fontSize="sm">
                After submission, your application will be reviewed by our team. You will receive an email confirmation and updates on your application status.
              </Text>
            </Alert>
          </VStack>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxW="4xl" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading size="lg" color="blue.600" mb={2}>
              Driver Application
            </Heading>
            <Text color="gray.600">
              Join our team of professional drivers and start earning with Speedy Van
            </Text>
          </Box>

          {/* Progress Bar */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="medium">
                Step {currentStep} of {steps.length}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {Math.round((currentStep / steps.length) * 100)}% Complete
              </Text>
            </HStack>
            <Progress value={(currentStep / steps.length) * 100} colorScheme="brand" size="sm" />
          </Box>

          {/* Steps Navigation */}
          <HStack spacing={2} overflowX="auto" pb={2}>
            {steps.map((step, index) => (
              <Badge
                key={step.number}
                colorScheme={currentStep === step.number ? 'brand' : 'gray'}
                variant={currentStep === step.number ? 'solid' : 'outline'}
                px={3}
                py={1}
                borderRadius="full"
                cursor="pointer"
                onClick={() => {
                  if (index + 1 < currentStep || validateStep(index + 1)) {
                    setCurrentStep(step.number);
                  }
                }}
                opacity={index + 1 < currentStep || validateStep(index + 1) ? 1 : 0.5}
              >
                {step.number}. {step.title}
              </Badge>
            ))}
          </HStack>

          {/* Step Content */}
          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              {renderStepContent()}
            </CardBody>
          </Card>

          {/* Navigation Buttons */}
          <HStack justify="space-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              isDisabled={currentStep === 1}
            >
              Previous
            </Button>

            <Spacer />

            {currentStep < steps.length ? (
              <Button
                variant="primary"
                onClick={() => {
                  if (validateStep(currentStep)) {
                    setCurrentStep(currentStep + 1);
                  } else {
                    toast({
                      title: 'Please complete all required fields',
                      status: 'error',
                    });
                  }
                }}
                isDisabled={!validateStep(currentStep)}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                loadingText="Submitting..."
                isDisabled={!validateStep(currentStep)}
              >
                Submit Application
              </Button>
            )}
          </HStack>
        </VStack>
      </MotionBox>
    </Container>
  );
}
