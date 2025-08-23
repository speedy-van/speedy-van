import React from 'react';
import { Box, Container, VStack, Heading, Text, Button, Link } from '@chakra-ui/react';
import { FaArrowRight } from 'react-icons/fa';

export default function TestBookingIntegrationPage() {
  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="4xl">
        <VStack spacing={8}>
          <Box textAlign="center">
            <Heading size="xl" color="blue.600" mb={4}>
              اختبار نظام الحجز مع التسعير المتكامل
            </Heading>
            <Text fontSize="lg" color="gray.600" mb={6}>
              تم ربط وحدة التسعير بنظام الحجز المكون من 9 خطوات
            </Text>
          </Box>

          <Box p={6} bg="white" borderRadius="lg" shadow="sm" w="full">
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="md" color="gray.700" mb={3}>
                  ✅ ما تم إنجازه:
                </Heading>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600">
                    • تم إنشاء مكون عرض السعر المتكامل (PricingDisplay)
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • تم إضافة عرض السعر إلى خطوات الحجز المختلفة
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • تم إنشاء حاسبة المسافة بين العناوين
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • تم إنشاء ملخص الحجز المحسن مع التسعير
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • تم ربط جميع البيانات من خطوات الحجز بمحرك التسعير
                  </Text>
                </VStack>
              </Box>

              <Box>
                <Heading size="md" color="gray.700" mb={3}>
                  📍 خطوات الحجز مع التسعير:
                </Heading>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600">
                    1. <strong>العناوين:</strong> حساب المسافة تلقائياً
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    2. <strong>تفاصيل العقار:</strong> إضافة رسوم الطوابق ونوع العقار
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    3. <strong>اختيار العناصر:</strong> عرض السعر المباشر مع إضافة العناصر
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    4. <strong>التاريخ والوقت:</strong> إعداد الجدول الزمني
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    5. <strong>تفاصيل العميل:</strong> معلومات الاتصال
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    6. <strong>اختيار الطاقم:</strong> عرض السعر المحدث مع عدد العمال
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    7. <strong>الدفع:</strong> عرض السعر النهائي مع التفاصيل الكاملة
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    8. <strong>التأكيد:</strong> ملخص شامل مع السعر النهائي
                  </Text>
                </VStack>
              </Box>

              <Box>
                <Heading size="md" color="gray.700" mb={3}>
                  🧮 عوامل التسعير المطبقة:
                </Heading>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600">
                    • <strong>السعر الأساسي:</strong> £900 (تعبئة ذاتية) / £1,150 (مع التعبئة)
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • <strong>المسافة:</strong> £1.50 لكل ميل بعد 15 ميل
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • <strong>العناصر:</strong> £1.00 لكل قدم مكعب
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • <strong>العمال الإضافيون:</strong> £100 لكل عامل إضافي
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • <strong>الطوابق:</strong> £15 مع مصعد / £35 بدون مصعد
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • <strong>نوع العقار:</strong> رسوم إضافية حسب النوع
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    • <strong>الضريبة:</strong> 20% للشركات المسجلة
                  </Text>
                </VStack>
              </Box>

              <Box textAlign="center" pt={4}>
                <Link href="/booking">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    rightIcon={<FaArrowRight />}
                    px={8}
                  >
                    ابدأ تجربة الحجز مع التسعير
                  </Button>
                </Link>
              </Box>

              <Box textAlign="center">
                <Link href="/test-pricing" color="blue.500" fontSize="sm">
                  أو اختبر وحدة التسعير منفصلة
                </Link>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
