import React from 'react';
import { Box, Container, VStack, Heading, Text, Button, Link, Alert, AlertIcon } from '@chakra-ui/react';
import { FaArrowRight, FaStripe, FaCreditCard } from 'react-icons/fa';

export default function TestStripeIntegrationPage() {
  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="4xl">
        <VStack spacing={8}>
          <Box textAlign="center">
            <Heading size="xl" color="blue.600" mb={4}>
              اختبار تكامل Stripe مع نظام الحجز
            </Heading>
            <Text fontSize="lg" color="gray.600" mb={6}>
              تم تحديث الخطوة 7 (الدفع) لاستخدام Stripe فقط
            </Text>
          </Box>

          <Box p={6} bg="white" borderRadius="lg" shadow="sm" w="full">
            <VStack spacing={6} align="stretch">
                             <Box>
                 <Heading size="md" color="gray.700" mb={3}>
                   ✅ ما تم تحديثه:
                 </Heading>
                 <VStack align="start" spacing={2}>
                   <Text fontSize="sm" color="gray.600">
                     • تم إلغاء طرق الدفع القديمة (بطاقة ائتمان، تحويل بنكي)
                   </Text>
                   <Text fontSize="sm" color="gray.600">
                     • تم إضافة Stripe كطريقة دفع وحيدة
                   </Text>
                   <Text fontSize="sm" color="gray.600">
                     • تم إنشاء مكون StripePaymentButton متخصص
                   </Text>
                   <Text fontSize="sm" color="gray.600">
                     • تم تحديث رقم الطلب ليبدأ بـ "SV" بدلاً من "BK"
                   </Text>
                   <Text fontSize="sm" color="gray.600">
                     • تم ربط السعر الفعلي مع زر الدفع
                   </Text>
                   <Text fontSize="sm" color="gray.600">
                     • <strong>جديد:</strong> إعادة التوجيه إلى Stripe Checkout قبل تأكيد الطلب
                   </Text>
                   <Text fontSize="sm" color="gray.600">
                     • <strong>جديد:</strong> إنشاء API endpoint لإنشاء payment intent
                   </Text>
                   <Text fontSize="sm" color="gray.600">
                     • <strong>جديد:</strong> صفحات نجاح وإلغاء الدفع
                   </Text>
                   <Text fontSize="sm" color="gray.600">
                     • <strong>جديد:</strong> تحميل الفاتورة الاحترافية بعد الدفع
                   </Text>
                 </VStack>
               </Box>

              <Box>
                <Heading size="md" color="gray.700" mb={3}>
                  🔒 ميزات Stripe:
                </Heading>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600">
                    • قبول جميع بطاقات الائتمان والخصم الرئيسية
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • مصادقة 3D Secure
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • متوافق مع PCI DSS
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • كشف الاحتيال في الوقت الفعلي
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • معالجة فورية للدفع
                  </Text>
                </VStack>
              </Box>

              <Box>
                <Heading size="md" color="gray.700" mb={3}>
                  📝 التغييرات التقنية:
                </Heading>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600">
                    • <strong>PaymentStep.tsx:</strong> إزالة طرق الدفع القديمة، إضافة Stripe
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • <strong>StripePaymentButton.tsx:</strong> مكون جديد لزر الدفع
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • <strong>ConfirmationStep.tsx:</strong> تغيير رقم الطلب إلى "SV"
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • <strong>PricingDisplay.tsx:</strong> إضافة callback لتحديث السعر
                  </Text>
                </VStack>
              </Box>

              <Alert status="success">
                <AlertIcon />
                <Box>
                  <Text fontWeight="semibold">جاهز للإنتاج:</Text>
                  <Text fontSize="sm">
                    تم تحويل Stripe إلى وضع الإنتاج. تأكد من:
                    <br />• إعداد حساب Stripe الإنتاجي
                    <br />• إضافة مفاتيح API الإنتاجية (sk_live_ و pk_live_)
                    <br />• تكامل مع Stripe Checkout
                    <br />• معالجة webhooks الإنتاجية ✅
                  </Text>
                </Box>
              </Alert>

              <Box textAlign="center" pt={4}>
                <Link href="/booking">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    rightIcon={<FaArrowRight />}
                    px={8}
                  >
                    اختبر نظام الحجز مع Stripe
                  </Button>
                </Link>
              </Box>

                             <Box textAlign="center">
                 <Link href="/test-booking-integration" color="blue.500" fontSize="sm" mr={4}>
                   أو راجع دليل التكامل الكامل
                 </Link>
                 <Link href="/test-invoice" color="green.500" fontSize="sm" mr={4}>
                   أو اختبر تحميل الفاتورة
                 </Link>
                 <Link href="/test-invoice-download" color="purple.500" fontSize="sm" mr={4}>
                   أو اختبر تحميل PDF
                 </Link>
                 <Link href="/test-item-catalog" color="orange.500" fontSize="sm">
                   أو اختبر كتالوج العناصر
                 </Link>
               </Box>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
