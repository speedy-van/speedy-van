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
  Input, 
  FormControl, 
  FormLabel,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Icon,
  Spinner,
  Divider
} from '@chakra-ui/react';
import { FaDownload, FaFilePdf, FaCheckCircle, FaInfoCircle, FaFlask } from 'react-icons/fa';
import jsPDF from 'jspdf';

export default function TestInvoiceDownloadPage() {
  const [bookingId, setBookingId] = useState('SV12345678');
  const [amount, setAmount] = useState('150.00');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTestingDirect, setIsTestingDirect] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  
  const toast = useToast();

  const downloadInvoice = async () => {
    setIsDownloading(true);
    
    try {
      // Call the invoice generation API
      const response = await fetch('/api/invoice/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          amount: parseFloat(amount),
          customerData: {
            name: 'Customer Name',
            email: 'customer@example.com',
            phone: '07700 900 123',
            address: 'Customer Address'
          },
          bookingDetails: {
            description: 'Test moving service from Speedy Van',
            date: new Date().toLocaleDateString('en-GB'),
            service: 'Speedy Van Move Service'
          }
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

        setTestResults({
          success: true,
          message: 'Invoice downloaded successfully',
          data: data.invoice
        });

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
      setTestResults({
        success: false,
        message: 'Failed to download invoice',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: 'Download Failed',
        description: 'There was an issue downloading your invoice. Please try again.',
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
    const addText = (text: string, x: number, y: number, fontSize: number = 12, isBold: boolean = false) => {
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
    addText('140 Charles Street, Glasgow G21 2QB', 20, yPosition, 10);
    yPosition += 6;
    addText('Phone: 07901846297 | Email: accounts@speedyvan.co.uk', 20, yPosition, 10);
    yPosition += 6;
    addText('Website: www.speedyvan.co.uk', 20, yPosition, 10);
    yPosition += 15;

    // Invoice Title
    addText('INVOICE', pageWidth / 2 - 20, yPosition, 16, true);
    yPosition += 15;

    // Invoice Details
    addText(`Invoice Number: SV-${invoiceData.content.invoice.number || 'INV-pending'}`, 20, yPosition, 12);
    addText(`Date: ${invoiceData.content.invoice.date}`, pageWidth - 80, yPosition, 12);
    yPosition += 8;
    addText(`Due Date: ${invoiceData.content.invoice.dueDate}`, pageWidth - 80, yPosition, 12);
    yPosition += 8;
    addText(`Booking ID: ${invoiceData.content.invoice.bookingId}`, pageWidth - 80, yPosition, 12);
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
    addText(`Address: ${invoiceData.content.customer.address}`, 20, yPosition, 12);
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
    addText(`£${invoiceData.content.totals.subtotal.toFixed(2)}`, 170, yPosition, 12);
    yPosition += 8;
    addLine(yPosition);
    yPosition += 8;
    addText('TOTAL:', 140, yPosition, 14, true);
    addText(`£${invoiceData.content.totals.total.toFixed(2)}`, 170, yPosition, 14, true);
    yPosition += 15;

    // Payment Information
    addText('PAYMENT INFORMATION:', 20, yPosition, 14, true);
    yPosition += 8;
    addText(`Payment Method: ${invoiceData.content.payment.method}`, 20, yPosition, 12);
    yPosition += 6;
    addText(`Payment Status: ${invoiceData.content.payment.status}`, 20, yPosition, 12);
    yPosition += 6;
    addText(`Transaction ID: ${invoiceData.content.payment.transactionId}`, 20, yPosition, 12);
    yPosition += 6;
    addText(`Paid Date: ${invoiceData.content.payment.paidAt}`, 20, yPosition, 12);
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
    addText('Thank you for choosing Speedy Van!', pageWidth / 2 - 50, yPosition, 12, true);
    yPosition += 6;
    addText('For support: support@speedyvan.co.uk', pageWidth / 2 - 60, yPosition, 10);

    return pdf;
  };

  const testDirectPDF = () => {
    setIsTestingDirect(true);
    
    try {
      // Create a simple test PDF directly
      const pdf = new jsPDF();
      pdf.setFontSize(20);
      pdf.text('Test Invoice PDF', 20, 20);
      pdf.setFontSize(12);
      pdf.text(`Booking ID: ${bookingId}`, 20, 40);
      pdf.text(`Amount: £${amount}`, 20, 50);
      pdf.text('This is a test PDF generated directly.', 20, 70);
      
      pdf.save('test-invoice-direct.pdf');
      
      toast({
        title: 'Direct PDF Test Successful!',
        description: 'Test PDF generated and downloaded directly.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Direct PDF Test Failed',
        description: 'Error generating test PDF directly.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsTestingDirect(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="4xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Icon as={FaFlask} boxSize={16} color="blue.500" mb={4} />
            <Heading size="2xl" color="blue.600" mb={4}>
              Invoice Download Test
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Test the invoice download functionality with real PDF generation
            </Text>
          </Box>

          {/* Test Form */}
          <Box p={6} bg="white" borderRadius="lg" shadow="sm">
            <Heading size="lg" color="gray.700" mb={6}>
              Test Parameters
            </Heading>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Booking ID</FormLabel>
                <Input
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="Enter booking ID"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Amount (£)</FormLabel>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  type="number"
                  step="0.01"
                />
              </FormControl>
            </VStack>
          </Box>

          {/* Test Buttons */}
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
              {isDownloading ? 'Generating Invoice...' : 'Test Full Invoice Download'}
            </Button>
            
            <Button
              onClick={testDirectPDF}
              variant="secondary"
              size="lg"
              leftIcon={isTestingDirect ? <Spinner size="sm" /> : <FaFilePdf />}
              isLoading={isTestingDirect}
              loadingText="Generating Test PDF..."
              w="full"
              h="50px"
            >
              {isTestingDirect ? 'Generating Test PDF...' : 'Test Direct PDF Generation'}
            </Button>
          </VStack>

          {/* Test Results */}
          {testResults && (
            <Box p={6} bg="white" borderRadius="lg" shadow="sm">
              <Heading size="lg" color="gray.700" mb={4}>
                Test Results
              </Heading>
              
              <Alert status={testResults.success ? "success" : "error"} borderRadius="lg" mb={4}>
                <AlertIcon />
                <Box>
                  <AlertTitle>{testResults.success ? "Test Passed" : "Test Failed"}</AlertTitle>
                  <AlertDescription>{testResults.message}</AlertDescription>
                </Box>
              </Alert>

              {testResults.success && testResults.data && (
                <VStack align="start" spacing={3}>
                  <HStack>
                    <Badge colorScheme="info">Booking ID:</Badge>
                    <Text>{testResults.data.bookingId}</Text>
                  </HStack>
                  <HStack>
                    <Badge colorScheme="success">Amount:</Badge>
                    <Text>£{testResults.data.amount}</Text>
                  </HStack>
                  <HStack>
                    <Badge colorScheme="brand">Filename:</Badge>
                    <Text>{testResults.data.filename}</Text>
                  </HStack>
                  <HStack>
                    <Badge colorScheme="warning">Generated:</Badge>
                    <Text>{new Date(testResults.data.generatedAt).toLocaleString()}</Text>
                  </HStack>
                </VStack>
              )}

              {!testResults.success && testResults.error && (
                <Box p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
                  <Text color="red.700" fontWeight="semibold">Error Details:</Text>
                  <Text color="red.600" fontSize="sm" mt={2}>{testResults.error}</Text>
                </Box>
              )}
            </Box>
          )}

          {/* Information */}
          <Box p={6} bg="blue.50" borderRadius="lg" border="1px" borderColor="blue.200">
            <VStack spacing={4} align="start">
              <HStack>
                <Icon as={FaInfoCircle} color="blue.500" />
                <Text fontWeight="semibold" color="blue.700">Test Information:</Text>
              </HStack>
              <Text fontSize="sm" color="blue.600">
                • <strong>Full Invoice Test:</strong> Tests the complete flow from API to PDF generation
              </Text>
              <Text fontSize="sm" color="blue.600">
                • <strong>Direct PDF Test:</strong> Tests jsPDF library functionality directly
              </Text>
              <Text fontSize="sm" color="blue.600">
                • <strong>Expected Result:</strong> Both tests should generate and download PDF files
              </Text>
              <Text fontSize="sm" color="blue.600">
                • <strong>File Location:</strong> Downloads folder (or browser default location)
              </Text>
            </VStack>
          </Box>

          {/* Features */}
          <Box p={6} bg="white" borderRadius="lg" shadow="sm">
            <Heading size="lg" color="gray.700" mb={4}>
              Invoice Features
            </Heading>
            <VStack align="start" spacing={3}>
              <HStack>
                <Icon as={FaCheckCircle} color="green.500" />
                <Text>Professional PDF format with proper layout</Text>
              </HStack>
              <HStack>
                <Icon as={FaCheckCircle} color="green.500" />
                <Text>Company branding and contact information</Text>
              </HStack>
              <HStack>
                <Icon as={FaCheckCircle} color="green.500" />
                <Text>Complete customer and booking details</Text>
              </HStack>
              <HStack>
                <Icon as={FaCheckCircle} color="green.500" />
                <Text>Itemized service breakdown with pricing</Text>
              </HStack>
                             <HStack>
                 <Icon as={FaCheckCircle} color="green.500" />
                 <Text>Updated company address and contact details</Text>
               </HStack>
                             <HStack>
                 <Icon as={FaCheckCircle} color="green.500" />
                 <Text>Terms and conditions section</Text>
               </HStack>
               <HStack>
                 <Icon as={FaCheckCircle} color="green.500" />
                 <Text>SV-prefixed invoice numbering system</Text>
               </HStack>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
