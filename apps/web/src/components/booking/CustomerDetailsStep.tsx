import React, { useState } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Input, 
  InputGroup,
  InputLeftElement,
  Button, 
  FormControl, 
  FormLabel, 
  FormErrorMessage,
  Divider,
  Icon,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { FaUser, FaEnvelope, FaPhone, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import EmailInputWithSuggestions from './EmailInputWithSuggestions';

interface CustomerDetailsStepProps {
  bookingData: any;
  updateBookingData: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function CustomerDetailsStep({ 
  bookingData, 
  updateBookingData, 
  onNext, 
  onBack 
}: CustomerDetailsStepProps) {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const toast = useToast();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Validate name
    if (!bookingData.customer?.name?.trim()) {
      newErrors.name = 'Full name is required';
    } else if (bookingData.customer.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Validate email
    if (!bookingData.customer?.email?.trim()) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(bookingData.customer.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Validate phone
    if (!bookingData.customer?.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^(\+44|0)[1-9]\d{8,9}$/;
      if (!phoneRegex.test(bookingData.customer.phone.trim().replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid UK phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext?.();
    } else {
      toast({
        title: 'Please fill in all required fields correctly',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updateCustomerField = (field: string, value: string) => {
    updateBookingData({
      customer: {
        ...bookingData.customer,
        [field]: value
      }
    });
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format UK phone number
    if (digits.startsWith('44')) {
      return `+${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
    } else if (digits.startsWith('0')) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
    
    return value;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    updateCustomerField('phone', formatted);
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
      <VStack spacing={6} align="stretch">
                 <Box textAlign="center">
           <Text fontSize="xl" fontWeight="bold" color="blue.600">
             Step 5: Your Details
           </Text>
           <Text fontSize="sm" color="gray.600" mt={2}>
             Please provide your contact information
           </Text>
         </Box>

        {/* Contact Information */}
        <Box>
                     <HStack spacing={3} mb={4}>
             <Icon as={FaUser} color="blue.500" />
             <Text fontSize="lg" fontWeight="semibold" color="blue.600">
               Contact Information
             </Text>
           </HStack>
          
          <VStack spacing={4}>
                         <FormControl isInvalid={!!errors.name}>
               <FormLabel>Full Name</FormLabel>
               <InputGroup size="lg">
                 <InputLeftElement>
                   <FaUser />
                 </InputLeftElement>
                 <Input
                   placeholder="e.g., John Smith"
                   value={bookingData.customer?.name || ''}
                   onChange={(e) => updateCustomerField('name', e.target.value)}
                 />
               </InputGroup>
               <FormErrorMessage>{errors.name}</FormErrorMessage>
             </FormControl>

                         <FormControl isInvalid={!!errors.email}>
               <FormLabel>Email Address</FormLabel>
               <EmailInputWithSuggestions
                 value={bookingData.customer?.email || ''}
                 onChange={(value) => updateCustomerField('email', value)}
                 placeholder="e.g., john.smith@gmail.com"
                 isInvalid={!!errors.email}
                 size="lg"
               />
               <FormErrorMessage>{errors.email}</FormErrorMessage>
             </FormControl>

                         <FormControl isInvalid={!!errors.phone}>
               <FormLabel>Phone Number</FormLabel>
               <InputGroup size="lg">
                 <InputLeftElement>
                   <FaPhone />
                 </InputLeftElement>
                 <Input
                   type="tel"
                   placeholder="e.g., 07123 456789 or +44 7123 456789"
                   value={bookingData.customer?.phone || ''}
                   onChange={(e) => handlePhoneChange(e.target.value)}
                 />
               </InputGroup>
               <FormErrorMessage>{errors.phone}</FormErrorMessage>
             </FormControl>
          </VStack>
        </Box>

        {/* Information Notice */}
        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>Privacy Notice</AlertTitle>
            <AlertDescription>
              Your contact information will only be used to communicate about your move and will not be shared with third parties.
            </AlertDescription>
          </Box>
        </Alert>

        {/* Summary */}
        {(bookingData.customer?.name || bookingData.customer?.email || bookingData.customer?.phone) && (
          <Box p={4} borderWidth="1px" borderRadius="md" bg="blue.50">
            <Text fontSize="lg" fontWeight="semibold" mb={3}>
              Contact Summary
            </Text>
            <VStack align="start" spacing={2}>
              {bookingData.customer?.name && (
                <HStack>
                  <Text fontWeight="medium">Name:</Text>
                  <Text>{bookingData.customer.name}</Text>
                </HStack>
              )}
              {bookingData.customer?.email && (
                <HStack>
                  <Text fontWeight="medium">Email:</Text>
                  <Text>{bookingData.customer.email}</Text>
                </HStack>
              )}
              {bookingData.customer?.phone && (
                <HStack>
                  <Text fontWeight="medium">Phone:</Text>
                  <Text>{bookingData.customer.phone}</Text>
                </HStack>
              )}
            </VStack>
          </Box>
        )}

        {/* Navigation Buttons */}
        <HStack spacing={4} justify="space-between" pt={4}>
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            leftIcon={<FaArrowLeft />}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            colorScheme="blue"
            size="lg"
            rightIcon={<FaArrowRight />}
          >
            Continue to Crew Selection
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
