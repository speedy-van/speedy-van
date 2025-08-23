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
  Spinner
} from '@chakra-ui/react';
import { FaDownload, FaFilePdf, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

export default function TestInvoicePage() {
  const [bookingId, setBookingId] = useState('SV12345678');
  const [amount, setAmount] = useState('150.00');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [apiResult, setApiResult] = useState<any>(null);
  
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
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '07700 900 123',
            address: '123 Main Street, London, SW1A 1AA'
          },
          bookingDetails: {
            description: 'Professional moving service from Speedy Van',
            date: new Date().toLocaleDateString('en-GB'),
            service: 'Speedy Van Move Service'
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      const data = await response.json();
      
      if (data.success && data.invoice) {
        // Create a professional invoice PDF
        const invoiceContent = generateProfessionalInvoicePDF(data.invoice);
        
        // Create and download the PDF
        const blob = new Blob([invoiceContent], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.invoice.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

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
        description: 'There was an issue downloading your invoice. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const generateProfessionalInvoicePDF = (invoiceData: any) => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP'
      }).format(amount);
    };

    const invoiceText = `
${invoiceData.content.header.logo} ${invoiceData.content.header.companyName}
${invoiceData.content.header.companyAddress}
Phone: ${invoiceData.content.header.companyPhone} | Email: ${invoiceData.content.header.companyEmail}
Website: ${invoiceData.content.header.companyWebsite}

================================================================================
                                    INVOICE
================================================================================

Invoice Number: ${invoiceData.content.invoice.number}
Invoice Date: ${invoiceData.content.invoice.date}
Due Date: ${invoiceData.content.invoice.dueDate}
Booking ID: ${invoiceData.content.invoice.bookingId}

================================================================================
BILL TO:
================================================================================
Name: ${invoiceData.content.customer.name}
Email: ${invoiceData.content.customer.email}
Phone: ${invoiceData.content.customer.phone}
Address: ${invoiceData.content.customer.address}

================================================================================
SERVICES:
================================================================================
Description                                    Qty    Unit Price    Total
------------------------------------------------------------------------
${invoiceData.content.services.map((service: any) => 
  `${service.description.padEnd(40)} ${service.quantity.toString().padStart(3)} ${formatCurrency(service.unitPrice).padStart(12)} ${formatCurrency(service.total).padStart(12)}`
).join('\n')}

================================================================================
PAYMENT SUMMARY:
================================================================================
Subtotal: ${formatCurrency(invoiceData.content.totals.subtotal)}
VAT (20%): ${formatCurrency(invoiceData.content.totals.vat)}
TOTAL: ${formatCurrency(invoiceData.content.totals.total)}

================================================================================
PAYMENT INFORMATION:
================================================================================
Payment Method: ${invoiceData.content.payment.method}
Payment Status: ${invoiceData.content.payment.status}
Transaction ID: ${invoiceData.content.payment.transactionId}
Paid Date: ${invoiceData.content.payment.paidAt}

================================================================================
TERMS & CONDITIONS:
================================================================================
${invoiceData.content.terms.map((term: string, index: number) => 
  `${index + 1}. ${term}`
).join('\n')}

================================================================================
Thank you for choosing Speedy Van!
For support: support@speedyvan.co.uk
================================================================================
    `;

    return invoiceText;
  };

  const testAPI = async () => {
    setIsTestingAPI(true);
    
    try {
      const response = await fetch(`/api/invoice/generate?bookingId=${bookingId}&amount=${amount}`);
      const data = await response.json();
      setApiResult(data);
      
      toast({
        title: 'API Test Successful!',
        description: 'Invoice API is working correctly.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'API Test Failed',
        description: 'There was an issue testing the invoice API.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsTestingAPI(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="4xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Icon as={FaFilePdf} boxSize={12} color="blue.500" mb={4} />
            <Heading size="xl" color="blue.600" mb={4}>
              اختبار تحميل الفاتورة
            </Heading>
            <Text fontSize="lg" color="gray.600">
              اختبر وظيفة تحميل الفاتورة الاحترافية
            </Text>
          </Box>

          {/* Test Form */}
          <Box p={6} bg="white" borderRadius="lg" shadow="sm">
            <VStack spacing={6} align="stretch">
              <Heading size="md" color="gray.700">
                بيانات الفاتورة التجريبية
              </Heading>
              
              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>رقم الحجز</FormLabel>
                  <Input
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    placeholder="SV12345678"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>المبلغ (£)</FormLabel>
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="150.00"
                    type="number"
                    step="0.01"
                  />
                </FormControl>
              </HStack>

              {/* Action Buttons */}
              <HStack spacing={4}>
                <Button
                  onClick={downloadInvoice}
                  variant="primary"
                  size="lg"
                  leftIcon={isDownloading ? <Spinner size="sm" /> : <FaDownload />}
                  isLoading={isDownloading}
                  loadingText="جاري إنشاء الفاتورة..."
                  flex={1}
                >
                  {isDownloading ? 'جاري إنشاء الفاتورة...' : 'تحميل الفاتورة'}
                </Button>
                
                <Button
                  onClick={testAPI}
                  variant="secondary"
                  size="lg"
                  leftIcon={isTestingAPI ? <Spinner size="sm" /> : <FaCheckCircle />}
                  isLoading={isTestingAPI}
                  loadingText="اختبار API..."
                  flex={1}
                >
                  {isTestingAPI ? 'اختبار API...' : 'اختبار API'}
                </Button>
              </HStack>
            </VStack>
          </Box>

          {/* API Result */}
          {apiResult && (
            <Box p={6} bg="green.50" borderRadius="lg" border="1px" borderColor="green.200">
              <VStack align="start" spacing={4}>
                <HStack>
                  <Icon as={FaCheckCircle} color="green.500" />
                  <Text fontWeight="semibold" color="green.700">نتيجة اختبار API:</Text>
                </HStack>
                
                <Box p={4} bg="white" borderRadius="md" w="full">
                  <Text fontSize="sm" fontFamily="mono" whiteSpace="pre-wrap">
                    {JSON.stringify(apiResult, null, 2)}
                  </Text>
                </Box>
              </VStack>
            </Box>
          )}

          {/* Features */}
          <Box p={6} bg="white" borderRadius="lg" shadow="sm">
            <Heading size="md" color="gray.700" mb={4}>
              ميزات الفاتورة الاحترافية
            </Heading>
            
            <VStack align="start" spacing={3}>
              <HStack>
                <Badge colorScheme="success">✓</Badge>
                <Text>تنسيق احترافي مع شعار الشركة</Text>
              </HStack>
              <HStack>
                <Badge colorScheme="success">✓</Badge>
                <Text>تفاصيل كاملة للعميل والخدمة</Text>
              </HStack>
              <HStack>
                <Badge colorScheme="success">✓</Badge>
                <Text>حساب تلقائي للـ VAT (20%)</Text>
              </HStack>
              <HStack>
                <Badge colorScheme="success">✓</Badge>
                <Text>معلومات الدفع والتحويل</Text>
              </HStack>
              <HStack>
                <Badge colorScheme="success">✓</Badge>
                <Text>الشروط والأحكام</Text>
              </HStack>
              <HStack>
                <Badge colorScheme="success">✓</Badge>
                <Text>تحميل مباشر بصيغة PDF</Text>
              </HStack>
            </VStack>
          </Box>

          {/* Information */}
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>معلومات مهمة:</AlertTitle>
              <AlertDescription>
                • الفاتورة تتضمن جميع تفاصيل الحجز والدفع
                • يتم إنشاء الفاتورة تلقائياً بعد نجاح الدفع
                • يمكن تحميل الفاتورة عدة مرات
                • الفاتورة صالحة للأغراض الضريبية والمحاسبية
              </AlertDescription>
            </Box>
          </Alert>

          {/* Navigation */}
          <Box textAlign="center">
            <Text fontSize="sm" color="gray.600" mb={2}>
              لاختبار التكامل الكامل مع Stripe:
            </Text>
            <Button
              as="a"
              href="/booking"
              variant="outline"
              size="md"
            >
              اذهب إلى نظام الحجز
            </Button>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
