import React, { useState, useEffect } from 'react';
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
  Badge,
  Icon
} from '@chakra-ui/react';
import { FaCheckCircle, FaLink, FaTruck, FaUser } from 'react-icons/fa';
import { useCustomerBookings } from '@/hooks/useCustomerBookings';

interface AccountCreationSuccessProps {
  userEmail: string;
  userPhone?: string;
  onComplete: () => void;
}

export default function AccountCreationSuccess({ 
  userEmail, 
  userPhone, 
  onComplete 
}: AccountCreationSuccessProps) {
  const [linkingInProgress, setLinkingInProgress] = useState(false);
  const [linkingComplete, setLinkingComplete] = useState(false);
  const [linkedBookingsCount, setLinkedBookingsCount] = useState(0);
  const toast = useToast();
  
  const { linkExistingBookings, bookings } = useCustomerBookings();

  useEffect(() => {
    // Automatically link existing bookings when component mounts
    if (userEmail && !linkingInProgress && !linkingComplete) {
      handleLinkExistingBookings();
    }
  }, [userEmail, linkingInProgress, linkingComplete]);

  const handleLinkExistingBookings = async () => {
    if (!userEmail) return;

    try {
      setLinkingInProgress(true);
      
      const result = await linkExistingBookings(userEmail, userPhone || '');
      
      if (result.success) {
        setLinkedBookingsCount(result.linkedCount);
        toast({
          title: 'Bookings Linked Successfully!',
          description: result.message,
          status: 'success',
          duration: 5000,
        });
      } else {
        toast({
          title: 'No Existing Bookings Found',
          description: 'No previous bookings were found to link to your account.',
          status: 'info',
          duration: 5000,
        });
      }
      
      setLinkingComplete(true);
    } catch (error) {
      console.error('Error linking existing bookings:', error);
      toast({
        title: 'Error Linking Bookings',
        description: 'There was an issue linking your existing bookings. You can link them manually later.',
        status: 'warning',
        duration: 5000,
      });
      setLinkingComplete(true);
    } finally {
      setLinkingInProgress(false);
    }
  };

  const handleContinue = () => {
    onComplete();
  };

  return (
    <Box textAlign="center" py={8}>
      {/* Success Icon */}
      <Box mb={6}>
        <Icon as={FaCheckCircle} color="green.500" boxSize={16} />
      </Box>

      {/* Success Message */}
      <VStack spacing={4} mb={8}>
        <Heading size="lg" color="green.600">
          Account Created Successfully!
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Welcome to Speedy Van! Your account has been created and you're now logged in.
        </Text>
      </VStack>

      {/* Linking Status */}
      <Card mb={6} maxW="md" mx="auto">
        <CardHeader>
          <HStack justify="center" spacing={3}>
            <Icon as={FaLink} color="blue.500" />
            <Heading size="md">Linking Existing Bookings</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          {linkingInProgress ? (
            <VStack spacing={4}>
              <Spinner size="lg" color="blue.500" />
              <Text>Searching for your existing bookings...</Text>
              <Text fontSize="sm" color="gray.500">
                We're looking for any bookings made with {userEmail}
                {userPhone && ` or ${userPhone}`}
              </Text>
            </VStack>
          ) : linkingComplete ? (
            <VStack spacing={4}>
              <Icon 
                as={linkedBookingsCount > 0 ? FaTruck : FaUser} 
                color={linkedBookingsCount > 0 ? "green.500" : "blue.500"} 
                boxSize={8} 
              />
              {linkedBookingsCount > 0 ? (
                <>
                  <Text fontWeight="bold" color="green.600">
                    {linkedBookingsCount} Booking{linkedBookingsCount !== 1 ? 's' : ''} Found!
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    We've automatically linked {linkedBookingsCount} previous booking{linkedBookingsCount !== 1 ? 's' : ''} to your account.
                  </Text>
                  <Badge colorScheme="green" variant="solid" px={3} py={2}>
                    {linkedBookingsCount} Linked
                  </Badge>
                </>
              ) : (
                <>
                  <Text fontWeight="bold" color="blue.600">
                    No Previous Bookings Found
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    This appears to be your first booking with Speedy Van. Welcome!
                  </Text>
                </>
              )}
            </VStack>
          ) : (
            <Text>Preparing to link your bookings...</Text>
          )}
        </CardBody>
      </Card>

      {/* Continue Button */}
      <Button
        colorScheme="blue"
        size="lg"
        onClick={handleContinue}
        disabled={linkingInProgress}
        leftIcon={<FaCheckCircle />}
      >
        {linkingInProgress ? 'Linking Bookings...' : 'Continue to Dashboard'}
      </Button>

      {/* Additional Information */}
      {linkingComplete && (
        <Box mt={6} maxW="lg" mx="auto">
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <Text fontWeight="medium">What happens next?</Text>
              <Text fontSize="sm">
                • You can now view all your bookings in your dashboard
                • Future bookings will be automatically linked to your account
                • You can track the status of all your moves in one place
              </Text>
            </VStack>
          </Alert>
        </Box>
      )}
    </Box>
  );
}
