'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Badge,
  Code,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { FaPlay, FaCheckCircle, FaExclamationTriangle, FaVolumeUp } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { useAudioNotification } from '@/components/driver/AudioNotification';

interface FixResult {
  success: boolean;
  message: string;
  details?: any;
}

export default function AudioNotificationFixPage() {
  const { data: session } = useSession();
  const [driverId, setDriverId] = useState<string>('');
  const [isFixing, setIsFixing] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [fixResults, setFixResults] = useState<FixResult[]>([]);

  const audioNotification = useAudioNotification();
  const toast = useToast();

  // Get driver ID from session
  useEffect(() => {
    const fetchDriverData = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/driver/profile');
          if (response.ok) {
            const data = await response.json();
            setDriverId(data.driver?.id || '');
          }
        } catch (error) {
          console.error('Failed to fetch driver data:', error);
        }
      }
    };
    fetchDriverData();
  }, [session]);

  const addFixResult = (result: FixResult) => {
    setFixResults(prev => [result, ...prev.slice(0, 9)]);
  };

  const prepareAudio = async () => {
    try {
      addFixResult({ success: false, message: 'جاري تحضير نظام الصوت...' });
      
      await audioNotification.prepareAudio();
      setAudioReady(true);
      
      addFixResult({ 
        success: true, 
        message: '✅ تم تحضير نظام الصوت بنجاح - جرب الآن تشغيل صوت تجريبي' 
      });

      toast({
        title: 'تم تحضير الصوت',
        description: 'يمكنك الآن اختبار الإشعارات الصوتية',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      addFixResult({ 
        success: false, 
        message: `❌ فشل في تحضير الصوت: ${(error as Error).message}` 
      });
    }
  };

  const testBasicAudio = async () => {
    try {
      addFixResult({ success: false, message: '🔊 جاري اختبار الصوت الأساسي...' });
      
      await audioNotification.play('job-notification');
      
      addFixResult({ 
        success: true, 
        message: '✅ تم تشغيل الصوت بنجاح! هل سمعت الصوت؟' 
      });

      toast({
        title: 'تم تشغيل الصوت',
        description: 'إذا لم تسمع صوتاً، تحقق من إعدادات المتصفح',
        status: 'info',
        duration: 5000,
      });
    } catch (error) {
      const errorMsg = (error as Error).message;
      addFixResult({ 
        success: false, 
        message: `❌ فشل في تشغيل الصوت: ${errorMsg}` 
      });

      // Show specific instructions based on error type
      if (errorMsg.includes('user interaction required')) {
        toast({
          title: 'مطلوب تفاعل المستخدم',
          description: 'اضغط على أي مكان في الصفحة أولاً، ثم جرب مرة أخرى',
          status: 'warning',
          duration: 7000,
        });
      } else if (errorMsg.includes('not supported')) {
        toast({
          title: 'المتصفح لا يدعم الصوت',
          description: 'جرب متصفح آخر مثل Chrome أو Firefox',
          status: 'error',
          duration: 7000,
        });
      }
    }
  };

  const testFullNotification = async () => {
    if (!driverId) {
      toast({
        title: 'خطأ',
        description: 'لا يمكن العثور على معرف السائق',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setIsFixing(true);
      addFixResult({ success: false, message: '📡 جاري إرسال إشعار تجريبي كامل...' });

      const response = await fetch('/api/admin/fix-driver-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-test-job',
          driverId: driverId
        }),
      });

      const result = await response.json();

      if (result.success) {
        addFixResult({ 
          success: true, 
          message: '✅ تم إرسال إشعار تجريبي كامل! يجب أن ترى إشعار وتسمع صوت' 
        });

        toast({
          title: 'تم الإرسال',
          description: 'ستتلقى إشعار تجريبي خلال ثوانٍ قليلة',
          status: 'success',
          duration: 5000,
        });
      } else {
        addFixResult({ 
          success: false, 
          message: `❌ فشل في إرسال الإشعار: ${result.error}` 
        });
      }
    } catch (error) {
      addFixResult({ 
        success: false, 
        message: `❌ خطأ في الشبكة: ${(error as Error).message}` 
      });
    } finally {
      setIsFixing(false);
    }
  };

  const checkConfiguration = async () => {
    try {
      addFixResult({ success: false, message: '🔍 جاري فحص إعدادات النظام...' });

      const response = await fetch('/api/admin/fix-driver-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check-config' }),
      });

      const result = await response.json();

      if (result.success && result.isConfigured) {
        addFixResult({ 
          success: true, 
          message: '✅ جميع إعدادات النظام صحيحة',
          details: result.config
        });
      } else {
        addFixResult({ 
          success: false, 
          message: `⚠️ مشاكل في الإعدادات: ${result.config?.recommendations?.join(', ')}`,
          details: result.config
        });
      }
    } catch (error) {
      addFixResult({ 
        success: false, 
        message: `❌ فشل في فحص الإعدادات: ${(error as Error).message}` 
      });
    }
  };

  const requestNotificationPermission = async () => {
    try {
      addFixResult({ success: false, message: '🔔 جاري طلب إذن الإشعارات...' });

      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          addFixResult({ 
            success: true, 
            message: '✅ تم منح إذن الإشعارات بنجاح' 
          });

          // Test notification
          new Notification('🎉 تم تفعيل الإشعارات!', {
            body: 'ستتلقى إشعارات عند وصول وظائف جديدة',
            icon: '/favicon.ico',
          });
        } else {
          addFixResult({ 
            success: false, 
            message: `❌ تم رفض إذن الإشعارات: ${permission}` 
          });
        }
      } else {
        addFixResult({ 
          success: false, 
          message: '❌ المتصفح لا يدعم الإشعارات' 
        });
      }
    } catch (error) {
      addFixResult({ 
        success: false, 
        message: `❌ خطأ في طلب الإذن: ${(error as Error).message}` 
      });
    }
  };

  if (!session) {
    return (
      <Box p={8}>
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>غير مصرح</AlertTitle>
          <AlertDescription>
            يجب تسجيل الدخول كسائق لاستخدام هذه الأداة.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6} maxW="4xl" mx="auto">
      <VStack spacing={6} align="stretch">
        <Card>
          <CardHeader>
            <HStack spacing={3}>
              <FaVolumeUp size="24px" color="blue" />
              <Heading size="lg">🔧 إصلاح الإشعارات الصوتية للسائقين</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>دليل الإصلاح السريع</AlertTitle>
                  <AlertDescription>
                    اتبع الخطوات التالية بالترتيب لإصلاح مشاكل الإشعارات الصوتية
                  </AlertDescription>
                </Box>
              </Alert>

              {/* Status indicators */}
              <HStack spacing={4} wrap="wrap">
                <Badge colorScheme={audioNotification.isSupported ? 'green' : 'red'}>
                  {audioNotification.isSupported ? 'الصوت مدعوم' : 'الصوت غير مدعوم'}
                </Badge>
                <Badge colorScheme={audioReady ? 'green' : 'yellow'}>
                  {audioReady ? 'الصوت جاهز' : 'الصوت غير جاهز'}
                </Badge>
                <Badge colorScheme={driverId ? 'green' : 'red'}>
                  {driverId ? `السائق: ${driverId.slice(0, 8)}...` : 'لم يتم العثور على السائق'}
                </Badge>
              </HStack>

              {/* Fix steps */}
              <VStack spacing={3} align="stretch">
                <HStack spacing={3}>
                  <Text fontWeight="bold" minW="20px">1.</Text>
                  <Button
                    leftIcon={<FaCheckCircle />}
                    colorScheme="blue"
                    onClick={prepareAudio}
                    isDisabled={!audioNotification.isSupported}
                    size="sm"
                  >
                    تحضير نظام الصوت
                  </Button>
                  <Text fontSize="sm" color="gray.600">
                    (اضغط هنا أولاً لتفعيل الصوت)
                  </Text>
                </HStack>

                <HStack spacing={3}>
                  <Text fontWeight="bold" minW="20px">2.</Text>
                  <Button
                    leftIcon={<FaPlay />}
                    colorScheme="green"
                    onClick={testBasicAudio}
                    isDisabled={!audioReady}
                    size="sm"
                  >
                    اختبار الصوت الأساسي
                  </Button>
                  <Text fontSize="sm" color="gray.600">
                    (يجب أن تسمع صوت إشعار)
                  </Text>
                </HStack>

                <HStack spacing={3}>
                  <Text fontWeight="bold" minW="20px">3.</Text>
                  <Button
                    leftIcon={<FaCheckCircle />}
                    colorScheme="orange"
                    onClick={requestNotificationPermission}
                    size="sm"
                  >
                    طلب إذن الإشعارات
                  </Button>
                  <Text fontSize="sm" color="gray.600">
                    (السماح للمتصفح بإظهار الإشعارات)
                  </Text>
                </HStack>

                <HStack spacing={3}>
                  <Text fontWeight="bold" minW="20px">4.</Text>
                  <Button
                    leftIcon={isFixing ? <Spinner size="sm" /> : <FaExclamationTriangle />}
                    colorScheme="purple"
                    onClick={testFullNotification}
                    isLoading={isFixing}
                    isDisabled={!driverId}
                    size="sm"
                  >
                    اختبار الإشعار الكامل
                  </Button>
                  <Text fontSize="sm" color="gray.600">
                    (محاكاة وظيفة جديدة)
                  </Text>
                </HStack>

                <HStack spacing={3}>
                  <Text fontWeight="bold" minW="20px">5.</Text>
                  <Button
                    leftIcon={<FaCheckCircle />}
                    colorScheme="teal"
                    onClick={checkConfiguration}
                    size="sm"
                  >
                    فحص إعدادات الخادم
                  </Button>
                  <Text fontSize="sm" color="gray.600">
                    (التحقق من إعدادات Pusher)
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Results */}
        {fixResults.length > 0 && (
          <Card>
            <CardHeader>
              <Heading size="md">نتائج الإصلاح</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={2} align="stretch">
                {fixResults.map((result, index) => (
                  <Alert
                    key={index}
                    status={result.success ? 'success' : 'error'}
                    variant="left-accent"
                  >
                    <AlertIcon />
                    <Box flex="1">
                      <Text fontSize="sm">{result.message}</Text>
                      {result.details && (
                        <Code fontSize="xs" mt={1} display="block">
                          {JSON.stringify(result.details, null, 2)}
                        </Code>
                      )}
                    </Box>
                  </Alert>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <Heading size="md">تعليمات إضافية</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="start">
              <Text fontWeight="bold">إذا استمرت المشكلة:</Text>
              <Text>• تأكد من أن مستوى الصوت في النظام مرتفع</Text>
              <Text>• جرب متصفح مختلف (Chrome يعمل بشكل أفضل)</Text>
              <Text>• تأكد من أن المتصفح لا يحجب الأصوات التلقائية</Text>
              <Text>• أعد تحميل الصفحة وجرب مرة أخرى</Text>
              <Text>• تأكد من أن الموقع مضاف للمواقع الموثوقة</Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}