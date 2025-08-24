import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Button, 
  Divider,
  Icon,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Link
} from '@chakra-ui/react';
import { 
  FaCheckCircle, 
  FaEnvelope, 
  FaPhone, 
  FaCalendar, 
  FaMapMarkerAlt,
  FaUsers,
  FaBox,
  FaDownload,
  FaHome
} from 'react-icons/fa';
import EnhancedBookingSummary from './EnhancedBookingSummary';

interface ConfirmationStepProps {
  bookingData: any;
  updateBookingData: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function ConfirmationStep({ 
  bookingData, 
  updateBookingData, 
  onNext, 
  onBack 
}: ConfirmationStepProps) {
  const [bookingId, setBookingId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const toast = useToast();

  useEffect(() => {
    generateBookingConfirmation();
  }, []);

  const generateBookingConfirmation = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate API call to create booking
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a mock booking ID starting with SV
      const id = 'SV' + Date.now().toString().slice(-8);
      setBookingId(id);
      
      // Update booking data with confirmation
      updateBookingData({
        bookingId: id,
        confirmedAt: new Date().toISOString(),
        status: 'confirmed'
      });
      
      toast({
        title: 'Booking Confirmed!',
        description: `Your booking has been successfully created with ID: ${id}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Confirmation Error',
        description: 'There was an issue confirming your booking. Please contact support.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const downloadInvoice = () => {
    // Simulate invoice download
    toast({
      title: 'Invoice Downloaded',
      description: 'Your invoice has been downloaded successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const goToHome = () => {
    window.location.href = '/';
  };

  if (isGenerating) {
    return (
      <Box p={6} borderWidth="1px" borderRadius="xl" bg="bg.card" borderColor="border.primary" boxShadow="md">
        <VStack spacing={6} align="center" py={8}>
          <Icon as={FaCheckCircle} boxSize={12} color="brand.500" />
          <Text fontSize="xl" fontWeight="bold" color="brand.500">
            Confirming Your Booking...
          </Text>
          <Text fontSize="sm" color="text.secondary" textAlign="center">
            Please wait while we process your booking and send you confirmation details.
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6} borderWidth="1px" borderRadius="xl" bg="bg.card" borderColor="border.primary" boxShadow="md">
      <VStack spacing={6} align="stretch">
        {/* Success Header */}
        <Box textAlign="center">
          <Icon as={FaCheckCircle} boxSize={16} color="brand.500" mb={4} />
          <Text fontSize="2xl" fontWeight="bold" color="brand.500">
            Booking Confirmed!
          </Text>
          <Text fontSize="lg" color="text.secondary" mt={2}>
            Your move has been successfully booked
          </Text>
          <Badge colorScheme="brand" fontSize="lg" p={2} mt={3}>
            Booking ID: {bookingId}
          </Badge>
        </Box>

        {/* Enhanced Booking Summary */}
        <EnhancedBookingSummary bookingData={bookingData} showPricing={true} />

        {/* Next Steps */}
        <Box p={4} borderWidth="1px" borderRadius="lg" bg="bg.surface" borderColor="border.primary">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            What Happens Next?
          </Text>
          <VStack align="start" spacing={3}>
            <HStack>
              <Badge colorScheme="neon">1</Badge>
              <Text>You'll receive a confirmation email within 5 minutes</Text>
            </HStack>
            <HStack>
              <Badge colorScheme="neon">2</Badge>
              <Text>Our team will call you within 2 hours to confirm details</Text>
            </HStack>
            <HStack>
              <Badge colorScheme="neon">3</Badge>
              <Text>We'll send you the driver's contact details 24 hours before your move</Text>
            </HStack>
            <HStack>
              <Badge colorScheme="neon">4</Badge>
              <Text>Your move will be completed on the scheduled date</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Contact Information */}
        <Box p={4} borderWidth="1px" borderRadius="lg" bg="bg.surface" borderColor="border.primary">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Need Help?
          </Text>
          <VStack align="start" spacing={3}>
            <HStack>
              <Icon as={FaPhone} color="neon.500" />
              <Text fontWeight="medium">Phone:</Text>
              <Link href="tel:0800 123 4567" color="neon.500">0800 123 4567</Link>
            </HStack>
            <HStack>
              <Icon as={FaEnvelope} color="neon.500" />
              <Text fontWeight="medium">Email:</Text>
              <Link href="mailto:support@speedyvan.co.uk" color="neon.500">support@speedyvan.co.uk</Link>
            </HStack>
            <Text fontSize="sm" color="text.tertiary">
              Our support team is available 24/7 to help with any questions.
            </Text>
          </VStack>
        </Box>

        {/* Important Notice */}
        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>Important Reminder</AlertTitle>
            <AlertDescription>
              Please ensure someone is available at both pickup and dropoff locations during your scheduled time slot. 
              Our team will arrive within the specified time window.
            </AlertDescription>
          </Box>
        </Alert>

        {/* Action Buttons */}
        <VStack spacing={4}>
          <Button
            onClick={downloadInvoice}
            variant="primary"
            size="lg"
            leftIcon={<FaDownload />}
            w="full"
          >
            Download Invoice
          </Button>
          
          <Button
            onClick={goToHome}
            variant="secondary"
            size="lg"
            leftIcon={<FaHome />}
            w="full"
          >
            Return to Home
          </Button>
        </VStack>

        {/* Thank You Message */}
        <Box textAlign="center" p={4} bg="bg.surface" borderRadius="lg" borderWidth="1px" borderColor="border.primary">
          <Text fontSize="lg" fontWeight="semibold" color="text.primary">
            Thank you for choosing Speedy Van!
          </Text>
          <Text fontSize="sm" color="text.secondary" mt={2}>
            We're excited to help make your move smooth and stress-free.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
