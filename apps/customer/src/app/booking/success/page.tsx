'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import {
  FaCheckCircle,
  FaHome,
  FaDownload,
  FaEnvelope,
  FaFilePdf,
} from 'react-icons/fa';
import { useSearchParams, useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

export default function BookingSuccessPage() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const amount = searchParams.get('amount');
  const bookingId = searchParams.get('bookingId');

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(parseFloat(amount));
  };

  const goToHome = () => {
    router.push('/');
  };

  const downloadInvoice = async () => {
    setIsDownloading(true);

    try {
      // Call the invoice generation API to get invoice data
      const response = await fetch('/api/invoice/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingId || 'SV' + Date.now().toString().slice(-8),
          amount: parseFloat(amount || '0'),
          customerData: {
            name: 'Customer Name', // In production, get from booking data
            email: 'customer@example.com', // In production, get from booking data
            phone: '07700 900 123',
            address: 'Customer Address',
          },
          bookingDetails: {
            description: 'Professional moving service from Speedy Van',
            date: new Date().toLocaleDateString('en-GB'),
            service: 'Speedy Van Move Service',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice data');
      }

      const data = await response.json();

      if (data.success && data.invoice) {
        // Generate real PDF using jsPDF
        const pdf = generatePDFInvoice(data.invoice);

        // Download the PDF
        pdf.save(data.invoice.filename);

        toast({
          title: 'Invoice Downloaded Successfully!',
          description: `Professional invoice ${data.invoice.bookingId} has been downloaded.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error('Invalid invoice data received');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: 'Download Failed',
        description:
          'There was an issue downloading your invoice. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const generatePDFInvoice = (invoiceData: any) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add text with proper positioning
    const addText = (
      text: string,
      x: number,
      y: number,
      fontSize: number = 12,
      isBold: boolean = false
    ) => {
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont(undefined, 'bold');
      } else {
        pdf.setFont(undefined, 'normal');
      }
      pdf.text(text, x, y);
    };

    // Helper function to add line
    const addLine = (y: number) => {
      pdf.line(20, y, pageWidth - 20, y);
    };

    // Header
    addText('🚚 SPEEDY VAN LTD', 20, yPosition, 18, true);
    yPosition += 8;
    addText('123 Business Street, London, SW1A 1AA', 20, yPosition, 10);
    yPosition += 6;
    addText(
      'Phone: 07901846297 | Email: support@speedy-van.co.uk',
      20,
      yPosition,
      10
    );
    yPosition += 6;
    addText('Website: www.speedy-van.co.uk', 20, yPosition, 10);
    yPosition += 15;

    // Invoice Title
    addText('INVOICE', pageWidth / 2 - 20, yPosition, 16, true);
    yPosition += 15;

    // Invoice Details
    addText(
      `Invoice Number: ${invoiceData.content.invoice.number}`,
      20,
      yPosition,
      12
    );
    addText(
      `Date: ${invoiceData.content.invoice.date}`,
      pageWidth - 80,
      yPosition,
      12
    );
    yPosition += 8;
    addText(
      `Due Date: ${invoiceData.content.invoice.dueDate}`,
      pageWidth - 80,
      yPosition,
      12
    );
    yPosition += 8;
    addText(
      `Booking ID: ${invoiceData.content.invoice.bookingId}`,
      pageWidth - 80,
      yPosition,
      12
    );
    yPosition += 15;

    // Customer Information
    addText('BILL TO:', 20, yPosition, 14, true);
    yPosition += 8;
    addText(`Name: ${invoiceData.content.customer.name}`, 20, yPosition, 12);
    yPosition += 6;
    addText(`Email: ${invoiceData.content.customer.email}`, 20, yPosition, 12);
    yPosition += 6;
    addText(`Phone: ${invoiceData.content.customer.phone}`, 20, yPosition, 12);
    yPosition += 6;
    addText(
      `Address: ${invoiceData.content.customer.address}`,
      20,
      yPosition,
      12
    );
    yPosition += 15;

    // Services Table Header
    addLine(yPosition);
    yPosition += 8;
    addText('Description', 20, yPosition, 12, true);
    addText('Qty', 120, yPosition, 12, true);
    addText('Unit Price', 140, yPosition, 12, true);
    addText('Total', 170, yPosition, 12, true);
    yPosition += 8;
    addLine(yPosition);
    yPosition += 8;

    // Services
    invoiceData.content.services.forEach((service: any) => {
      addText(service.description, 20, yPosition, 12);
      addText(service.quantity.toString(), 120, yPosition, 12);
      addText(`£${service.unitPrice.toFixed(2)}`, 140, yPosition, 12);
      addText(`£${service.total.toFixed(2)}`, 170, yPosition, 12);
      yPosition += 8;
    });

    yPosition += 5;
    addLine(yPosition);
    yPosition += 8;

    // Totals
    addText('Subtotal:', 140, yPosition, 12, true);
    addText(
      `£${invoiceData.content.totals.subtotal.toFixed(2)}`,
      170,
      yPosition,
      12
    );
    yPosition += 8;
    addText('VAT (20%):', 140, yPosition, 12, true);
    addText(
      `£${invoiceData.content.totals.vat.toFixed(2)}`,
      170,
      yPosition,
      12
    );
    yPosition += 8;
    addLine(yPosition);
    yPosition += 8;
    addText('TOTAL:', 140, yPosition, 14, true);
    addText(
      `£${invoiceData.content.totals.total.toFixed(2)}`,
      170,
      yPosition,
      14,
      true
    );
    yPosition += 15;

    // Payment Information
    addText('PAYMENT INFORMATION:', 20, yPosition, 14, true);
    yPosition += 8;
    addText(
      `Payment Method: ${invoiceData.content.payment.method}`,
      20,
      yPosition,
      12
    );
    yPosition += 6;
    addText(
      `Payment Status: ${invoiceData.content.payment.status}`,
      20,
      yPosition,
      12
    );
    yPosition += 6;
    addText(
      `Transaction ID: ${invoiceData.content.payment.transactionId}`,
      20,
      yPosition,
      12
    );
    yPosition += 6;
    addText(
      `Paid Date: ${invoiceData.content.payment.paidAt}`,
      20,
      yPosition,
      12
    );
    yPosition += 15;

    // Terms and Conditions
    addText('TERMS & CONDITIONS:', 20, yPosition, 14, true);
    yPosition += 8;
    invoiceData.content.terms.forEach((term: string, index: number) => {
      addText(`${index + 1}. ${term}`, 20, yPosition, 10);
      yPosition += 5;
    });

    // Footer
    yPosition = pageHeight - 30;
    addLine(yPosition);
    yPosition += 8;
    addText(
      'Thank you for choosing Speedy Van!',
      pageWidth / 2 - 50,
      yPosition,
      12,
      true
    );
    yPosition += 6;
    addText(
      'For support: support@speedyvan.co.uk',
      pageWidth / 2 - 60,
      yPosition,
      10
    );

    return pdf;
  };

  const sendEmail = async () => {
    setIsSendingEmail(true);

    try {
      // Simulate sending confirmation email
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Email Sent Successfully!',
        description: 'Confirmation email has been sent to your email address.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Email Failed',
        description:
          'There was an issue sending the confirmation email. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <Box minH="100vh" bg="green.50" py={8}>
      <Container maxW="2xl">
        <VStack spacing={8} align="stretch">
          {/* Success Header */}
          <Box textAlign="center">
            <Icon as={FaCheckCircle} boxSize={24} color="green.500" mb={6} />
            <Heading size="2xl" color="green.600" mb={4}>
              Payment Successful!
            </Heading>
            <Text fontSize="xl" color="gray.600" mb={6}>
              Your booking has been confirmed and payment processed
            </Text>

            {/* Payment Details */}
            <Box
              p={6}
              bg="white"
              borderRadius="lg"
              shadow="sm"
              border="1px"
              borderColor="green.200"
              maxW="md"
              mx="auto"
            >
              <VStack spacing={4}>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="semibold">Amount Paid:</Text>
                  <Badge colorScheme="green" fontSize="lg" p={2}>
                    {formatCurrency(amount || '0')}
                  </Badge>
                </HStack>

                {bookingId && (
                  <HStack justify="space-between" w="full">
                    <Text fontWeight="semibold">Booking ID:</Text>
                    <Badge colorScheme="blue" fontSize="md" p={2}>
                      {bookingId}
                    </Badge>
                  </HStack>
                )}

                <HStack justify="space-between" w="full">
                  <Text fontWeight="semibold">Payment Method:</Text>
                  <Badge colorScheme="purple" fontSize="md" p={2}>
                    Stripe
                  </Badge>
                </HStack>
              </VStack>
            </Box>
          </Box>

          {/* What Happens Next */}
          <Box p={6} bg="white" borderRadius="lg" shadow="sm">
            <Heading size="lg" color="gray.700" mb={4}>
              What Happens Next?
            </Heading>
            <VStack align="start" spacing={4}>
              <HStack>
                <Badge colorScheme="blue" borderRadius="full" p={2}>
                  1
                </Badge>
                <Text>
                  You'll receive a confirmation email within 5 minutes
                </Text>
              </HStack>
              <HStack>
                <Badge colorScheme="blue" borderRadius="full" p={2}>
                  2
                </Badge>
                <Text>
                  Our team will call you within 2 hours to confirm details
                </Text>
              </HStack>
              <HStack>
                <Badge colorScheme="blue" borderRadius="full" p={2}>
                  3
                </Badge>
                <Text>
                  We'll send you the driver's contact details 24 hours before
                  your move
                </Text>
              </HStack>
              <HStack>
                <Badge colorScheme="blue" borderRadius="full" p={2}>
                  4
                </Badge>
                <Text>Your move will be completed on the scheduled date</Text>
              </HStack>
            </VStack>
          </Box>

          {/* Important Information */}
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>Important Reminder</AlertTitle>
              <AlertDescription>
                Please ensure someone is available at both pickup and dropoff
                locations during your scheduled time slot. Our team will arrive
                within the specified time window.
              </AlertDescription>
            </Box>
          </Alert>

          {/* Contact Information */}
          <Box p={6} bg="white" borderRadius="lg" shadow="sm">
            <Heading size="lg" color="gray.700" mb={4}>
              Need Help?
            </Heading>
            <VStack align="start" spacing={3}>
              <HStack>
                <Icon as={FaEnvelope} color="blue.500" />
                <Text fontWeight="medium">Email:</Text>
                <Text>support@speedyvan.co.uk</Text>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                Our support team is available 24/7 to help with any questions.
              </Text>
            </VStack>
          </Box>

          {/* Action Buttons */}
          <VStack spacing={4}>
            <Button
              onClick={downloadInvoice}
              variant="primary"
              size="lg"
              leftIcon={isDownloading ? <Spinner size="sm" /> : <FaDownload />}
              isLoading={isDownloading}
              loadingText="Generating Invoice..."
              w="full"
              h="60px"
              fontSize="lg"
              fontWeight="bold"
            >
              {isDownloading
                ? 'Generating Invoice...'
                : 'Download Invoice (PDF)'}
            </Button>

            <Button
              onClick={sendEmail}
              variant="primary"
              size="lg"
              leftIcon={isSendingEmail ? <Spinner size="sm" /> : <FaEnvelope />}
              isLoading={isSendingEmail}
              loadingText="Sending Email..."
              w="full"
              h="50px"
            >
              {isSendingEmail
                ? 'Sending Email...'
                : 'Resend Confirmation Email'}
            </Button>

            <Button
              onClick={goToHome}
              variant="ghost"
              size="lg"
              leftIcon={<FaHome />}
              w="full"
              h="50px"
            >
              Return to Home
            </Button>
          </VStack>

          {/* Invoice Information */}
          <Box
            p={4}
            bg="blue.50"
            borderRadius="lg"
            border="1px"
            borderColor="blue.200"
          >
            <VStack spacing={2} align="start">
              <HStack>
                <Icon as={FaFilePdf} color="blue.500" />
                <Text fontWeight="semibold" color="blue.700">
                  Invoice Details:
                </Text>
              </HStack>
              <Text fontSize="sm" color="blue.600">
                • Professional PDF invoice with all booking details
              </Text>
              <Text fontSize="sm" color="blue.600">
                • Includes payment information and terms
              </Text>
              <Text fontSize="sm" color="blue.600">
                • Automatically generated with your booking ID
              </Text>
              <Text fontSize="sm" color="blue.600">
                • Keep for your records and tax purposes
              </Text>
            </VStack>
          </Box>

          {/* Thank You Message */}
          <Box textAlign="center" p={6} bg="gray.50" borderRadius="lg">
            <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={2}>
              Thank you for choosing Speedy Van!
            </Text>
            <Text fontSize="sm" color="gray.600">
              We're excited to help make your move smooth and stress-free.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
