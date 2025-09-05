import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
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
  Alert,
  AlertIcon,
  Spinner,
  useToast,
  Icon,
  Divider,
  Badge,
} from '@chakra-ui/react';
import {
  FaCheckCircle,
  FaTruck,
  FaUser,
  FaArrowRight,
  FaHome,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa';
import PostPaymentAccountCreation from './PostPaymentAccountCreation';
import { useCustomerBookings } from '@/hooks/useCustomerBookings';

interface PaymentSuccessPageProps {
  bookingData: {
    id: string;
    reference: string;
    unifiedBookingId?: string;
    customer: {
      name: string;
      email: string;
      phone: string;
    };
    addresses: {
      pickup: {
        line1: string;
        city: string;
        postcode: string;
      };
      dropoff: {
        line1: string;
        city: string;
        postcode: string;
      };
    };
    schedule: {
      date: string;
      timeSlot: string;
    };
    totalGBP: number;
    status: string;
  };
}

export default function PaymentSuccessPage({
  bookingData,
}: PaymentSuccessPageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showAccountCreation, setShowAccountCreation] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    'success' | 'account-creation' | 'account-created'
  >('success');
  const toast = useToast();

  const { bookings, stats } = useCustomerBookings();

  // Check if user is already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setCurrentStep('account-created');
    }
  }, [status, session]);

  const handleCreateAccount = () => {
    setShowAccountCreation(true);
    setCurrentStep('account-creation');
  };

  const handleSkipAccount = () => {
    setCurrentStep('success');
    toast({
      title: 'Account Creation Skipped',
      description:
        'You can create an account later to view your booking history.',
      status: 'info',
      duration: 4000,
    });
  };

  const handleAccountCreated = () => {
    setAccountCreated(true);
    setCurrentStep('account-created');
    toast({
      title: 'Welcome to Speedy Van!',
      description: "Your account has been created and you're now signed in.",
      status: 'success',
      duration: 5000,
    });
  };

  const handleViewDashboard = () => {
    router.push('/dashboard');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeSlot: string) => {
    return timeSlot || '09:00-12:00';
  };

  if (currentStep === 'account-creation') {
    return (
      <PostPaymentAccountCreation
        customerEmail={bookingData.customer.email}
        customerName={bookingData.customer.name}
        bookingReference={bookingData.reference}
        unifiedBookingId={bookingData.unifiedBookingId}
        onAccountCreated={handleAccountCreated}
        onSkip={handleSkipAccount}
      />
    );
  }

  if (currentStep === 'account-created') {
    return (
      <Box maxW="4xl" mx="auto" py={8}>
        <VStack spacing={8}>
          {/* Success Header */}
          <Box textAlign="center">
            <Icon as={FaCheckCircle} color="green.500" boxSize={16} mb={4} />
            <Heading size="lg" color="green.600" mb={2}>
              Welcome to Speedy Van!
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Your account has been created and you're now signed in.
            </Text>
          </Box>

          {/* Account Created Success */}
          <Card borderColor="green.200" borderWidth="2px" w="full">
            <CardHeader>
              <HStack>
                <Icon as={FaUser} color="green.500" />
                <Heading size="md">Account Created Successfully</Heading>
                <Badge colorScheme="green" variant="solid">
                  Signed In
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text>
                  <strong>Email:</strong> {bookingData.customer.email}
                </Text>
                <Text>
                  <strong>Name:</strong> {bookingData.customer.name}
                </Text>

                {bookings && (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Text>
                      We found {bookings.totalCount} booking
                      {bookings.totalCount !== 1 ? 's' : ''} linked to your
                      account!
                    </Text>
                  </Alert>
                )}

                <HStack spacing={4} justify="center">
                  <Button
                    colorScheme="blue"
                    size="lg"
                    leftIcon={<FaTruck />}
                    onClick={handleViewDashboard}
                  >
                    View My Bookings
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    leftIcon={<FaHome />}
                    onClick={handleGoHome}
                  >
                    Go to Homepage
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    );
  }

  // Default success view
  return (
    <Box maxW="4xl" mx="auto" py={8}>
      <VStack spacing={8}>
        {/* Success Header */}
        <Box textAlign="center">
          <Icon as={FaCheckCircle} color="green.500" boxSize={16} mb={4} />
          <Heading size="lg" color="green.600" mb={2}>
            Payment Successful!
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Your booking has been confirmed and payment processed.
          </Text>
          <VStack spacing={2} mt={3}>
            {bookingData.unifiedBookingId && (
              <Badge
                colorScheme="blue"
                variant="solid"
                px={4}
                py={2}
                fontSize="md"
              >
                Booking ID: {bookingData.unifiedBookingId}
              </Badge>
            )}
            <Badge colorScheme="green" variant="solid" px={4} py={2}>
              Reference: {bookingData.reference}
            </Badge>
          </VStack>
        </Box>

        {/* Booking Summary */}
        <Card w="full">
          <CardHeader>
            <Heading size="md">Booking Summary</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* Customer Info */}
              <Box>
                <Text fontWeight="bold" mb={3} color="blue.600">
                  Customer Information
                </Text>
                <VStack align="start" spacing={2} pl={4}>
                  <HStack>
                    <Icon as={FaUser} color="gray.500" boxSize={4} />
                    <Text>
                      <strong>Name:</strong> {bookingData.customer.name}
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaEnvelope} color="gray.500" boxSize={4} />
                    <Text>
                      <strong>Email:</strong> {bookingData.customer.email}
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaPhone} color="gray.500" boxSize={4} />
                    <Text>
                      <strong>Phone:</strong> {bookingData.customer.phone}
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              <Divider />

              {/* Addresses */}
              <Box>
                <Text fontWeight="bold" mb={3} color="green.600">
                  Pickup Address
                </Text>
                <Text pl={4}>{bookingData.addresses.pickup.line1}</Text>
                <Text pl={4} color="gray.600">
                  {bookingData.addresses.pickup.city},{' '}
                  {bookingData.addresses.pickup.postcode}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={3} color="red.600">
                  Dropoff Address
                </Text>
                <Text pl={4}>{bookingData.addresses.dropoff.line1}</Text>
                <Text pl={4} color="gray.600">
                  {bookingData.addresses.dropoff.city},{' '}
                  {bookingData.addresses.dropoff.postcode}
                </Text>
              </Box>

              <Divider />

              {/* Schedule */}
              <Box>
                <Text fontWeight="bold" mb={3} color="purple.600">
                  Schedule
                </Text>
                <VStack align="start" spacing={2} pl={4}>
                  <Text>
                    <strong>Date:</strong>{' '}
                    {formatDate(bookingData.schedule.date)}
                  </Text>
                  <Text>
                    <strong>Time:</strong>{' '}
                    {formatTime(bookingData.schedule.timeSlot)}
                  </Text>
                </VStack>
              </Box>

              <Divider />

              {/* Payment */}
              <Box>
                <Text fontWeight="bold" mb={3} color="blue.600">
                  Payment
                </Text>
                <Text pl={4} fontSize="lg">
                  <strong>Total Amount:</strong> £{bookingData.totalGBP}
                </Text>
                <Text pl={4} color="green.600" fontWeight="medium">
                  ✓ Payment Confirmed
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Next Steps */}
        <Card w="full" borderColor="blue.200" borderWidth="2px">
          <CardHeader>
            <Heading size="md" color="blue.600">
              What Happens Next?
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text>
                Our team will review your booking and confirm the details.
                You'll receive:
              </Text>
              <VStack align="start" spacing={2} pl={4}>
                <Text>• Confirmation email with booking details</Text>
                <Text>• Driver assignment notification</Text>
                <Text>• Pre-move checklist and instructions</Text>
                <Text>• Contact information for your move day</Text>
              </VStack>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  <strong>Need to make changes?</strong> Contact our support
                  team at{' '}
                  <Text as="span" color="blue.600" fontWeight="medium">
                    support@speedy-van.co.uk
                  </Text>{' '}
                  or call{' '}
                  <Text as="span" color="blue.600" fontWeight="medium">
                    07901846297
                  </Text>
                </Text>
              </Alert>
            </VStack>
          </CardBody>
        </Card>

        {/* Account Creation CTA */}
        <Card w="full" borderColor="orange.200" borderWidth="2px">
          <CardHeader>
            <HStack>
              <Icon as={FaUser} color="orange.500" />
              <Heading size="md" color="orange.600">
                Create Your Account
              </Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text>
                Create a free account to track your booking, view your move
                history, and manage future bookings all in one place.
              </Text>

              <VStack spacing={3} align="stretch">
                <Button
                  colorScheme="orange"
                  size="lg"
                  onClick={handleCreateAccount}
                  leftIcon={<FaUser />}
                  rightIcon={<FaArrowRight />}
                >
                  Create Account Now
                </Button>

                <Button variant="ghost" size="sm" onClick={handleSkipAccount}>
                  Maybe Later
                </Button>
              </VStack>

              <Box bg="orange.50" p={4} borderRadius="md">
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color="orange.700"
                  mb={2}
                >
                  Benefits of creating an account:
                </Text>
                <VStack
                  align="start"
                  spacing={1}
                  fontSize="xs"
                  color="orange.600"
                >
                  <Text>• Track your current move in real-time</Text>
                  <Text>• View complete booking history</Text>
                  <Text>• Quick rebooking for future moves</Text>
                  <Text>• Receive important updates and notifications</Text>
                  <Text>• Manage your preferences and addresses</Text>
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <HStack spacing={4} justify="center">
          <Button
            variant="outline"
            size="lg"
            leftIcon={<FaHome />}
            onClick={handleGoHome}
          >
            Return to Homepage
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
