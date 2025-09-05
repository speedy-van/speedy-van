'use client';

import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Text,
  Alert,
  AlertIcon,
  Box,
  SimpleGrid,
  Checkbox,
  CheckboxGroup,
} from '@chakra-ui/react';

interface OnboardingWizardProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: (data: any) => void;
  isLoading: boolean;
}

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  postcode: string;
  nationalInsurance: string;

  // Vehicle Information
  vehicleMake: string;
  vehicleModel: string;
  vehicleReg: string;
  vehicleType: string;
  vehicleCapacity: string;
  motExpiry: string;

  // Documents
  documents: {
    drivingLicense: File | null;
    insurance: File | null;
    mot: File | null;
    rightToWork: File | null;
  };

  // Review
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export default function OnboardingWizard({
  currentStep,
  onStepChange,
  onComplete,
  isLoading,
}: OnboardingWizardProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    postcode: '',
    nationalInsurance: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleReg: '',
    vehicleType: '',
    vehicleCapacity: '',
    motExpiry: '',
    documents: {
      drivingLicense: null,
      insurance: null,
      mot: null,
      rightToWork: null,
    },
    termsAccepted: false,
    privacyAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateDocument = (
    docType: keyof FormData['documents'],
    file: File | null
  ) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [docType]: file },
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Personal Information
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!formData.dateOfBirth)
          newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.postcode) newErrors.postcode = 'Postcode is required';
        break;

      case 1: // Vehicle Information
        if (!formData.vehicleMake)
          newErrors.vehicleMake = 'Vehicle make is required';
        if (!formData.vehicleModel)
          newErrors.vehicleModel = 'Vehicle model is required';
        if (!formData.vehicleReg)
          newErrors.vehicleReg = 'Vehicle registration is required';
        if (!formData.vehicleType)
          newErrors.vehicleType = 'Vehicle type is required';
        if (!formData.motExpiry)
          newErrors.motExpiry = 'MOT expiry date is required';
        break;

      case 2: // Documents
        if (!formData.documents.drivingLicense)
          newErrors.documents_drivingLicense = 'Driving license is required';
        if (!formData.documents.insurance)
          newErrors.documents_insurance = 'Insurance document is required';
        if (!formData.documents.mot)
          newErrors.documents_mot = 'MOT certificate is required';
        break;

      case 3: // Review
        if (!formData.termsAccepted)
          newErrors.termsAccepted = 'You must accept the terms and conditions';
        if (!formData.privacyAccepted)
          newErrors.privacyAccepted = 'You must accept the privacy policy';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      onStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    onStepChange(currentStep - 1);
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onComplete(formData);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <VStack spacing={4} align="stretch" w="full">
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Personal Information
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired isInvalid={!!errors.firstName}>
                <FormLabel>First Name</FormLabel>
                <Input
                  value={formData.firstName}
                  onChange={e => updateFormData('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.lastName}>
                <FormLabel>Last Name</FormLabel>
                <Input
                  value={formData.lastName}
                  onChange={e => updateFormData('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
              </FormControl>
            </SimpleGrid>

            <FormControl isRequired isInvalid={!!errors.phone}>
              <FormLabel>Phone Number</FormLabel>
              <Input
                type="tel"
                value={formData.phone}
                onChange={e => updateFormData('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.dateOfBirth}>
              <FormLabel>Date of Birth</FormLabel>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={e => updateFormData('dateOfBirth', e.target.value)}
              />
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.address}>
              <FormLabel>Address</FormLabel>
              <Textarea
                value={formData.address}
                onChange={e => updateFormData('address', e.target.value)}
                placeholder="Enter your full address"
                rows={3}
              />
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.postcode}>
              <FormLabel>Postcode</FormLabel>
              <Input
                value={formData.postcode}
                onChange={e =>
                  updateFormData('postcode', e.target.value.toUpperCase())
                }
                placeholder="Enter your postcode"
              />
            </FormControl>

            <FormControl>
              <FormLabel>National Insurance Number (Optional)</FormLabel>
              <Input
                value={formData.nationalInsurance}
                onChange={e =>
                  updateFormData(
                    'nationalInsurance',
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="Enter your NI number"
              />
            </FormControl>
          </VStack>
        );

      case 1:
        return (
          <VStack spacing={4} align="stretch" w="full">
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Vehicle Information
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired isInvalid={!!errors.vehicleMake}>
                <FormLabel>Vehicle Make</FormLabel>
                <Input
                  value={formData.vehicleMake}
                  onChange={e => updateFormData('vehicleMake', e.target.value)}
                  placeholder="e.g., Ford, Mercedes"
                />
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.vehicleModel}>
                <FormLabel>Vehicle Model</FormLabel>
                <Input
                  value={formData.vehicleModel}
                  onChange={e => updateFormData('vehicleModel', e.target.value)}
                  placeholder="e.g., Transit, Sprinter"
                />
              </FormControl>
            </SimpleGrid>

            <FormControl isRequired isInvalid={!!errors.vehicleReg}>
              <FormLabel>Vehicle Registration</FormLabel>
              <Input
                value={formData.vehicleReg}
                onChange={e =>
                  updateFormData('vehicleReg', e.target.value.toUpperCase())
                }
                placeholder="Enter vehicle registration"
              />
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.vehicleType}>
              <FormLabel>Vehicle Type</FormLabel>
              <Select
                value={formData.vehicleType}
                onChange={e => updateFormData('vehicleType', e.target.value)}
                placeholder="Select vehicle type"
              >
                <option value="small_van">Small Van</option>
                <option value="medium_van">Medium Van</option>
                <option value="large_van">Large Van</option>
                <option value="luton_van">Luton Van</option>
                <option value="pickup">Pickup Truck</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Vehicle Capacity</FormLabel>
              <Select
                value={formData.vehicleCapacity}
                onChange={e =>
                  updateFormData('vehicleCapacity', e.target.value)
                }
                placeholder="Select capacity"
              >
                <option value="1_ton">1 Ton</option>
                <option value="2_ton">2 Ton</option>
                <option value="3_ton">3 Ton</option>
                <option value="3_5_ton">3.5 Ton</option>
                <option value="7_5_ton">7.5 Ton</option>
              </Select>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.motExpiry}>
              <FormLabel>MOT Expiry Date</FormLabel>
              <Input
                type="date"
                value={formData.motExpiry}
                onChange={e => updateFormData('motExpiry', e.target.value)}
              />
            </FormControl>
          </VStack>
        );

      case 2:
        return (
          <VStack spacing={4} align="stretch" w="full">
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Required Documents
            </Text>

            <Alert status="info">
              <AlertIcon />
              Please upload clear, readable copies of your documents. All
              documents must be valid and not expired.
            </Alert>

            <FormControl isRequired>
              <FormLabel>Driving License</FormLabel>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e =>
                  updateDocument('drivingLicense', e.target.files?.[0] || null)
                }
              />
              <Text fontSize="sm" color="gray.600">
                Upload both sides of your driving license
              </Text>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Vehicle Insurance</FormLabel>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e =>
                  updateDocument('insurance', e.target.files?.[0] || null)
                }
              />
              <Text fontSize="sm" color="gray.600">
                Upload your current insurance certificate
              </Text>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>MOT Certificate</FormLabel>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e =>
                  updateDocument('mot', e.target.files?.[0] || null)
                }
              />
              <Text fontSize="sm" color="gray.600">
                Upload your current MOT certificate
              </Text>
            </FormControl>

            <FormControl>
              <FormLabel>Right to Work Document (Optional)</FormLabel>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e =>
                  updateDocument('rightToWork', e.target.files?.[0] || null)
                }
              />
              <Text fontSize="sm" color="gray.600">
                Upload proof of right to work in the UK
              </Text>
            </FormControl>
          </VStack>
        );

      case 3:
        return (
          <VStack spacing={4} align="stretch" w="full">
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Review Your Information
            </Text>

            <Box p={4} border="1px" borderColor="gray.200" borderRadius="md">
              <Text fontWeight="bold" mb={2}>
                Personal Information
              </Text>
              <Text>
                Name: {formData.firstName} {formData.lastName}
              </Text>
              <Text>Phone: {formData.phone}</Text>
              <Text>Date of Birth: {formData.dateOfBirth}</Text>
              <Text>Address: {formData.address}</Text>
              <Text>Postcode: {formData.postcode}</Text>
              {formData.nationalInsurance && (
                <Text>NI Number: {formData.nationalInsurance}</Text>
              )}
            </Box>

            <Box p={4} border="1px" borderColor="gray.200" borderRadius="md">
              <Text fontWeight="bold" mb={2}>
                Vehicle Information
              </Text>
              <Text>
                Vehicle: {formData.vehicleMake} {formData.vehicleModel}
              </Text>
              <Text>Registration: {formData.vehicleReg}</Text>
              <Text>Type: {formData.vehicleType}</Text>
              {formData.vehicleCapacity && (
                <Text>Capacity: {formData.vehicleCapacity}</Text>
              )}
              <Text>MOT Expiry: {formData.motExpiry}</Text>
            </Box>

            <Box p={4} border="1px" borderColor="gray.200" borderRadius="md">
              <Text fontWeight="bold" mb={2}>
                Documents
              </Text>
              <Text>
                Driving License:{' '}
                {formData.documents.drivingLicense ? '✓ Uploaded' : '✗ Missing'}
              </Text>
              <Text>
                Insurance:{' '}
                {formData.documents.insurance ? '✓ Uploaded' : '✗ Missing'}
              </Text>
              <Text>
                MOT Certificate:{' '}
                {formData.documents.mot ? '✓ Uploaded' : '✗ Missing'}
              </Text>
              <Text>
                Right to Work:{' '}
                {formData.documents.rightToWork ? '✓ Uploaded' : 'Optional'}
              </Text>
            </Box>

            <VStack spacing={3} align="stretch">
              <Checkbox
                isChecked={formData.termsAccepted}
                onChange={e =>
                  updateFormData('termsAccepted', e.target.checked)
                }
                isInvalid={!!errors.termsAccepted}
              >
                I accept the Terms and Conditions
              </Checkbox>

              <Checkbox
                isChecked={formData.privacyAccepted}
                onChange={e =>
                  updateFormData('privacyAccepted', e.target.checked)
                }
                isInvalid={!!errors.privacyAccepted}
              >
                I accept the Privacy Policy
              </Checkbox>
            </VStack>
          </VStack>
        );

      default:
        return null;
    }
  };

  return (
    <VStack spacing={6} align="stretch" w="full">
      {renderStep()}

      <HStack justify="space-between" pt={4}>
        <Button
          onClick={handlePrevious}
          isDisabled={currentStep === 0}
          variant="outline"
        >
          Previous
        </Button>

        {currentStep < 3 ? (
          <Button onClick={handleNext} colorScheme="blue" isLoading={isLoading}>
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            colorScheme="green"
            isLoading={isLoading}
          >
            Submit Application
          </Button>
        )}
      </HStack>
    </VStack>
  );
}
