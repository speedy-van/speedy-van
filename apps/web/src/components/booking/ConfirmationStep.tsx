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
      // Check if payment was completed
      if (!bookingData.calculatedTotal || bookingData.calculatedTotal <= 0) {
        throw new Error('Payment not completed. Please complete payment first.');
      }

      // Check if we have a payment confirmation
      const urlParams = new URLSearchParams(window.location.search);
      const paymentIntent = urlParams.get('payment_intent');
      const paymentStatus = urlParams.get('redirect_status');

      if (!paymentIntent || paymentStatus !== 'succeeded') {
        throw new Error('Payment not confirmed. Please complete payment first.');
      }

      // Simulate API call to create booking
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a mock booking ID starting with SV
      const id = 'SV' + Date.now().toString().slice(-8);
      setBookingId(id);
      
      // Update booking data with confirmation
      updateBookingData({
        bookingId: id,
        confirmedAt: new Date().toISOString(),
        status: 'confirmed',
        paymentIntent: paymentIntent
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
        description: error instanceof Error ? error.message : 'There was an issue confirming your booking. Please contact support.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirect back to payment step if payment failed
      if (error instanceof Error && error.message.includes('Payment not')) {
        setTimeout(() => {
          window.location.href = '/booking';
        }, 3000);
      }
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

  const downloadInvoice = async () => {
    try {
      // Generate a professional PDF invoice
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      // Set colors and styling
      const primaryColor = [0, 194, 255]; // Neon blue
      const secondaryColor = [0, 209, 143]; // Brand green
      const darkColor = [51, 51, 51];
      const lightGray = [128, 128, 128];
      
      // Header with logo and company info
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(0, 0, 210, 40, 'F');
      
      // Company name and logo
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SPEEDY VAN', 20, 25);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Professional Moving Services', 20, 35);
      
      // Company details on the right
      pdf.setFontSize(10);
      pdf.text('140 Charles Street', 150, 20);
      pdf.text('Glasgow City, G21 2QB', 150, 27);
      pdf.text('Phone: 07901846297', 150, 34);
      pdf.text('support@speedy-van.co.uk', 150, 41);
      
      // Invoice title and details
      pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INVOICE', 20, 60);
      
      // Invoice details section
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      const startY = 80;
      let currentY = startY;
      
      // Left column - Invoice details
      pdf.setFont('helvetica', 'bold');
      pdf.text('Invoice Details:', 20, currentY);
      currentY += 8;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Invoice Number: ${bookingId}`, 20, currentY);
      currentY += 6;
      pdf.text(`Issue Date: ${new Date().toLocaleDateString('en-GB')}`, 20, currentY);
      currentY += 6;
      pdf.text(`Due Date: ${new Date().toLocaleDateString('en-GB')}`, 20, currentY);
      currentY += 6;
      pdf.text(`Status: PAID`, 20, currentY);
      
      // Right column - Customer details
      currentY = startY;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Customer Details:', 120, currentY);
      currentY += 8;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${bookingData.customer?.name || 'N/A'}`, 120, currentY);
      currentY += 6;
      pdf.text(`Email: ${bookingData.customer?.email || 'N/A'}`, 120, currentY);
      currentY += 6;
      pdf.text(`Phone: ${bookingData.customer?.phone || 'N/A'}`, 120, currentY);
      
      // Move details section
      currentY += 15;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Move Details:', 20, currentY);
      currentY += 8;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Move Date: ${bookingData.date ? new Date(bookingData.date).toLocaleDateString('en-GB') : 'N/A'}`, 20, currentY);
      currentY += 6;
      pdf.text(`Time Slot: ${bookingData.timeSlot || 'N/A'}`, 20, currentY);
      currentY += 6;
      
      // Addresses
      if (bookingData.pickupAddress) {
        pdf.text(`Pickup: ${bookingData.pickupAddress.line1 || ''}, ${bookingData.pickupAddress.city || ''}`, 20, currentY);
        currentY += 6;
      }
      if (bookingData.dropoffAddress) {
        pdf.text(`Dropoff: ${bookingData.dropoffAddress.line1 || ''}, ${bookingData.dropoffAddress.city || ''}`, 20, currentY);
        currentY += 6;
      }
      
      // Items section
      currentY += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Items to Move:', 20, currentY);
      currentY += 8;
      
      if (bookingData.items && bookingData.items.length > 0) {
        // Table header
        pdf.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        pdf.rect(20, currentY - 3, 170, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Item', 25, currentY);
        pdf.text('Qty', 100, currentY);
        pdf.text('Volume (m³)', 130, currentY);
        pdf.text('Price (£)', 160, currentY);
        currentY += 8;
        
        // Table rows
        pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        pdf.setFont('helvetica', 'normal');
        let totalVolume = 0;
        let totalPrice = 0;
        
        bookingData.items.forEach((item: any) => {
          pdf.text(item.name || 'N/A', 25, currentY);
          pdf.text((item.quantity || 1).toString(), 100, currentY);
          pdf.text((item.volume || 0).toFixed(1), 130, currentY);
          pdf.text((item.price || 0).toFixed(2), 160, currentY);
          
          totalVolume += (item.volume || 0) * (item.quantity || 1);
          totalPrice += (item.price || 0) * (item.quantity || 1);
          currentY += 6;
        });
        
        // Summary row
        currentY += 2;
        pdf.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        pdf.line(20, currentY, 190, currentY);
        currentY += 6;
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Total Volume:', 100, currentY);
        pdf.text(`${totalVolume.toFixed(1)} m³`, 130, currentY);
        currentY += 6;
        
        pdf.text('Subtotal:', 100, currentY);
        pdf.text(`£${totalPrice.toFixed(2)}`, 160, currentY);
        currentY += 6;
      }
      
      // Total amount section
      currentY += 10;
              pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(20, currentY - 3, 170, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('TOTAL AMOUNT:', 100, currentY + 3);
      pdf.text(`£${(bookingData.calculatedTotal || 0).toFixed(2)}`, 160, currentY + 3);
      
      // Footer
      currentY += 25;
              pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Thank you for choosing Speedy Van for your moving needs!', 20, currentY);
      currentY += 6;
      pdf.text('For any questions, please contact us at support@speedy-van.co.uk or call 07901846297', 20, currentY);
      currentY += 6;
      pdf.text('This invoice is automatically generated and valid without signature.', 20, currentY);
      
      // Download the PDF
      pdf.save(`speedy-van-invoice-${bookingId}.pdf`);
      
      toast({
        title: 'Invoice Downloaded',
        description: 'Your professional invoice has been downloaded successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: 'Download Failed',
        description: 'There was an issue generating your invoice. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
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
            Verifying Payment & Confirming Your Booking...
          </Text>
          <Text fontSize="sm" color="text.secondary" textAlign="center">
            Please wait while we verify your payment and process your booking confirmation.
          </Text>
          <Text fontSize="xs" color="text.tertiary" textAlign="center">
            This ensures your booking is properly secured and confirmed.
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
             Your move has been successfully booked and payment confirmed
           </Text>
           <Badge colorScheme="brand" fontSize="lg" p={2} mt={3}>
             Booking ID: {bookingId}
           </Badge>
           
           {/* Payment Confirmation */}
           <Box mt={4} p={3} bg="green.50" borderRadius="lg" borderWidth="1px" borderColor="green.200">
             <HStack justify="center" spacing={2}>
               <Icon as={FaCheckCircle} color="green.500" boxSize={4} />
               <Text fontSize="sm" color="green.700" fontWeight="medium">
                 Payment Confirmed - £{formatCurrency(bookingData.calculatedTotal || 0)}
               </Text>
             </HStack>
           </Box>
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
              <Link href="tel:07901846297" color="neon.500">07901846297</Link>
            </HStack>
            <HStack>
              <Icon as={FaEnvelope} color="neon.500" />
              <Text fontWeight="medium">Email:</Text>
              <Link href="mailto:support@speedy-van.co.uk" color="neon.500">support@speedy-van.co.uk</Link>
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

                 {/* Invoice Information */}
         <Box p={4} borderWidth="1px" borderRadius="lg" bg="bg.surface" borderColor="border.primary">
           <Text fontSize="lg" fontWeight="semibold" mb={3} color="neon.500">
             📄 Professional Invoice
           </Text>
           <VStack align="start" spacing={2}>
             <HStack>
               <Icon as={FaCheckCircle} color="brand.500" boxSize={4} />
               <Text fontSize="sm">Includes detailed item breakdown and pricing</Text>
             </HStack>
             <HStack>
               <Icon as={FaCheckCircle} color="brand.500" boxSize={4} />
               <Text fontSize="sm">Professional branding with company details</Text>
             </HStack>
             <HStack>
               <Icon as={FaCheckCircle} color="brand.500" boxSize={4} />
               <Text fontSize="sm">Ready for accounting and record keeping</Text>
             </HStack>
             <HStack>
               <Icon as={FaCheckCircle} color="brand.500" boxSize={4} />
               <Text fontSize="sm">Automatically generated PDF format</Text>
             </HStack>
           </VStack>
         </Box>

         {/* Action Buttons */}
         <VStack spacing={4}>
                     <Button
             onClick={downloadInvoice}
             variant="primary"
             size="lg"
             leftIcon={<FaDownload />}
             w="full"
             bg="linear-gradient(135deg, rgba(0,194,255,0.9), rgba(0,194,255,0.7))"
             color="white"
             fontWeight="bold"
             fontSize="lg"
             py={6}
             borderRadius="xl"
             borderWidth="2px"
             borderColor="neon.400"
             _hover={{
               transform: 'translateY(-2px)',
               boxShadow: '0 10px 25px rgba(0,194,255,0.4)',
               bg: 'linear-gradient(135deg, rgba(0,194,255,1), rgba(0,194,255,0.8))'
             }}
             _active={{
               transform: 'translateY(0)',
               boxShadow: '0 5px 15px rgba(0,194,255,0.3)'
             }}
             transition="all 300ms"
           >
             📄 Download Professional Invoice
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
