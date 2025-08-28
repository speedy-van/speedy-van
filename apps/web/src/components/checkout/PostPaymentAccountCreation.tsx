import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  Icon,
  Divider,
  Badge
} from '@chakra-ui/react';
import { FaUserPlus, FaCheckCircle, FaLock, FaEnvelope } from 'react-icons/fa';
import { signIn } from 'next-auth/react';

interface PostPaymentAccountCreationProps {
  customerEmail: string;
  customerName: string;
  bookingReference: string;
  unifiedBookingId?: string;
  onAccountCreated: () => void;
  onSkip: () => void;
}

export default function PostPaymentAccountCreation({
  customerEmail,
  customerName,
  bookingReference,
  unifiedBookingId,
  onAccountCreated,
  onSkip
}: PostPaymentAccountCreationProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const toast = useToast();

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) return;

    try {
      setIsCreating(true);
      setErrors({});

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          name: customerName,
          password: password,
          role: 'customer'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create account');
      }

      const data = await response.json();

      // Automatically sign in the user
      const signInResult = await signIn('credentials', {
        email: customerEmail,
        password: password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error('Account created but failed to sign in automatically');
      }

      toast({
        title: 'Account Created Successfully!',
        description: 'Welcome to Speedy Van! You can now view all your bookings in your personal portal.',
        status: 'success',
        duration: 5000,
      });

      // Call the success callback
      onAccountCreated();

    } catch (error) {
      console.error('Error creating account:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create account'
      });
      
      toast({
        title: 'Account Creation Failed',
        description: error instanceof Error ? error.message : 'Please try again or contact support.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSkip = () => {
    toast({
      title: 'Account Creation Skipped',
      description: 'You can create an account later to view your booking history and manage future bookings.',
      status: 'info',
      duration: 4000,
    });
    onSkip();
  };

  return (
    <Box maxW="md" mx="auto">
      <Card borderColor="green.200" borderWidth="2px">
        <CardHeader textAlign="center">
          <VStack spacing={3}>
            <Icon as={FaCheckCircle} color="green.500" boxSize={8} />
            <Heading size="md" color="green.600">
              Payment Successful!
            </Heading>
                         <VStack spacing={2}>
               <Text fontSize="sm" color="gray.600">
                 Your booking has been confirmed.
               </Text>
               {unifiedBookingId && (
                 <Badge colorScheme="blue" variant="solid" px={3} py={1}>
                   ID: {unifiedBookingId}
                 </Badge>
               )}
               <Text fontSize="sm" color="gray.600">
                 Reference: {bookingReference}
               </Text>
             </VStack>
          </VStack>
        </CardHeader>

        <CardBody>
          <VStack spacing={6}>
            {/* Account Creation Prompt */}
            <Box textAlign="center" w="full">
              <Icon as={FaUserPlus} color="blue.500" boxSize={6} mb={3} />
              <Text fontWeight="bold" fontSize="lg" color="blue.600" mb={2}>
                Would you like to create an account?
              </Text>
              <Text fontSize="sm" color="gray.600">
                Create an account to view your booking history, track your move, and manage future bookings.
              </Text>
            </Box>

            <Divider />

            {/* Account Details */}
            <VStack spacing={4} w="full">
              <FormControl isReadOnly>
                <FormLabel>
                  <HStack>
                    <Icon as={FaEnvelope} color="gray.500" boxSize={4} />
                    <Text>Email Address</Text>
                  </HStack>
                </FormLabel>
                <Input
                  value={customerEmail}
                  bg="gray.50"
                  borderColor="gray.200"
                  _hover={{ bg: 'gray.50' }}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  This email will be used for your account login
                </Text>
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel>
                  <HStack>
                    <Icon as={FaLock} color="gray.500" boxSize={4} />
                    <Text>Password</Text>
                  </HStack>
                </FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  borderColor={errors.password ? 'red.300' : 'gray.300'}
                  _focus={{
                    borderColor: errors.password ? 'red.500' : 'blue.500',
                    boxShadow: errors.password ? '0 0 0 1px #f56565' : '0 0 0 1px #3182ce'
                  }}
                />
                <FormErrorMessage>{errors.password}</FormErrorMessage>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Minimum 8 characters
                </Text>
              </FormControl>

              <FormControl isInvalid={!!errors.confirmPassword}>
                <FormLabel>
                  <HStack>
                    <Icon as={FaLock} color="gray.500" boxSize={4} />
                    <Text>Confirm Password</Text>
                  </HStack>
                </FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  borderColor={errors.confirmPassword ? 'red.300' : 'gray.300'}
                  _focus={{
                    borderColor: errors.confirmPassword ? 'red.500' : 'blue.500',
                    boxShadow: errors.confirmPassword ? '0 0 0 1px #f56565' : '0 0 0 1px #3182ce'
                  }}
                />
                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
              </FormControl>
            </VStack>

            {/* Error Display */}
            {errors.general && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">{errors.general}</Text>
              </Alert>
            )}

            {/* Action Buttons */}
            <VStack spacing={3} w="full">
              <Button
                colorScheme="blue"
                size="lg"
                w="full"
                onClick={handleCreateAccount}
                isLoading={isCreating}
                loadingText="Creating Account..."
                leftIcon={<FaUserPlus />}
              >
                Create Account & Sign In
              </Button>

              <Button
                variant="outline"
                size="md"
                w="full"
                onClick={handleSkip}
                disabled={isCreating}
              >
                Skip for Now
              </Button>
            </VStack>

            {/* Benefits */}
            <Box bg="blue.50" p={4} borderRadius="md" w="full">
              <Text fontSize="sm" fontWeight="medium" color="blue.700" mb={2}>
                Benefits of creating an account:
              </Text>
              <VStack align="start" spacing={1} fontSize="xs" color="blue.600">
                <Text>• View all your booking history in one place</Text>
                <Text>• Track the status of your current move</Text>
                <Text>• Manage future bookings easily</Text>
                <Text>• Receive updates and notifications</Text>
                <Text>• Quick rebooking for future moves</Text>
              </VStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
