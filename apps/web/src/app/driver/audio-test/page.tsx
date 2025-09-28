'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Badge,
  Switch,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Divider,
  useColorModeValue,
  IconButton,
  Tooltip,
  Code,
} from '@chakra-ui/react';
import { FaPlay, FaStop, FaVolumeUp, FaVolumeMute, FaBell } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { useDriverNotifications } from '@/services/driverNotifications';
import { useAudioNotification, showJobNotificationWithSound } from '@/components/driver/AudioNotification';

export default function DriverAudioTestPage() {
  const { data: session } = useSession();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [driverId, setDriverId] = useState<string>('');

  const audioNotification = useAudioNotification();
  const driverNotifications = useDriverNotifications(driverId);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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

  const addTestResult = (result: string) => {
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    setTestResults(prev => [`[${timestamp}] ${result}`, ...prev.slice(0, 9)]);
  };

  const testBasicAudio = async () => {
    try {
      addTestResult('🔊 اختبار الصوت الأساسي...');
      await audioNotification.play('job-notification');
      addTestResult('✅ تم تشغيل الصوت الأساسي بنجاح');
    } catch (error) {
      addTestResult('❌ فشل في تشغيل الصوت الأساسي: ' + (error as Error).message);
    }
  };

  const testJobNotification = async () => {
    try {
      addTestResult('🔔 اختبار إشعار الوظيفة...');
      await showJobNotificationWithSound(
        'وظيفة جديدة متاحة',
        'من الرياض إلى جدة\nالسعر: £45.00 | المسافة: 15km',
        { urgent: false }
      );
      addTestResult('✅ تم تشغيل إشعار الوظيفة بنجاح');
    } catch (error) {
      addTestResult('❌ فشل في إشعار الوظيفة: ' + (error as Error).message);
    }
  };

  const testUrgentNotification = async () => {
    try {
      addTestResult('🚨 اختبار الإشعار العاجل...');
      await showJobNotificationWithSound(
        '🚨 وظيفة عاجلة',
        'من المطار إلى المستشفى\nالسعر: £25.00 | العميل: أحمد محمد',
        { urgent: true, requireInteraction: true }
      );
      addTestResult('✅ تم تشغيل الإشعار العاجل بنجاح');
    } catch (error) {
      addTestResult('❌ فشل في الإشعار العاجل: ' + (error as Error).message);
    }
  };

  const testServiceNotification = async () => {
    try {
      addTestResult('📡 اختبار خدمة الإشعارات...');
      await driverNotifications.testNotification();
      addTestResult('✅ تم اختبار خدمة الإشعارات بنجاح');
    } catch (error) {
      addTestResult('❌ فشل في خدمة الإشعارات: ' + (error as Error).message);
    }
  };

  const stopAudio = () => {
    audioNotification.stop();
    addTestResult('⏹️ تم إيقاف الصوت');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const toggleAudio = (enabled: boolean) => {
    setAudioEnabled(enabled);
    driverNotifications.setAudioEnabled(enabled);
    addTestResult(`🔊 تم ${enabled ? 'تفعيل' : 'إلغاء تفعيل'} الإشعارات الصوتية`);
  };

  if (!session) {
    return (
      <Box p={8}>
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>غير مصرح</AlertTitle>
          <AlertDescription>يرجى تسجيل الدخول للوصول إلى صفحة اختبار الإشعارات</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6} minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <VStack spacing={6} maxW="800px" mx="auto">
        
        {/* Header */}
        <Card w="100%" bg={bg} borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">اختبار الإشعارات الصوتية للسائق</Heading>
              <Badge colorScheme={audioEnabled ? 'green' : 'red'}>
                {audioEnabled ? 'مفعل' : 'معطل'}
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text>حالة الصوت:</Text>
                <Badge colorScheme={audioNotification.isSupported ? 'green' : 'red'}>
                  {audioNotification.isSupported ? 'مدعوم' : 'غير مدعوم'}
                </Badge>
              </HStack>
              
              <HStack justify="space-between">
                <Text>معرف السائق:</Text>
                <Code>{driverId || 'غير محدد'}</Code>
              </HStack>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="audio-toggle" mb="0">
                  تفعيل الإشعارات الصوتية
                </FormLabel>
                <Switch
                  id="audio-toggle"
                  isChecked={audioEnabled}
                  onChange={(e) => toggleAudio(e.target.checked)}
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Test Controls */}
        <Card w="100%" bg={bg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="sm">اختبارات الإشعارات</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <HStack spacing={4} wrap="wrap" justify="center">
                <Button
                  leftIcon={<FaPlay />}
                  colorScheme="blue"
                  onClick={testBasicAudio}
                  isDisabled={!audioNotification.isSupported || !audioEnabled}
                >
                  اختبار الصوت الأساسي
                </Button>
                
                <Button
                  leftIcon={<FaBell />}
                  colorScheme="green"
                  onClick={testJobNotification}
                  isDisabled={!audioNotification.isSupported || !audioEnabled}
                >
                  إشعار وظيفة عادية
                </Button>

                <Button
                  leftIcon={<FaBell />}
                  colorScheme="red"
                  onClick={testUrgentNotification}
                  isDisabled={!audioNotification.isSupported || !audioEnabled}
                >
                  إشعار عاجل
                </Button>

                <Button
                  leftIcon={<FaBell />}
                  colorScheme="purple"
                  onClick={testServiceNotification}
                  isDisabled={!audioEnabled}
                >
                  اختبار الخدمة
                </Button>
              </HStack>

              <Divider />

              <HStack spacing={4}>
                <Tooltip label="إيقاف جميع الأصوات">
                  <IconButton
                    aria-label="إيقاف الصوت"
                    icon={<FaStop />}
                    colorScheme="gray"
                    onClick={stopAudio}
                    isDisabled={!audioNotification.isPlaying}
                  />
                </Tooltip>

                <Tooltip label="مسح النتائج">
                  <Button size="sm" onClick={clearResults}>
                    مسح النتائج
                  </Button>
                </Tooltip>

                <Badge colorScheme={audioNotification.isPlaying ? 'green' : 'gray'}>
                  {audioNotification.isPlaying ? 'يتم التشغيل' : 'متوقف'}
                </Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Audio Support Info */}
        {!audioNotification.isSupported && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>الصوت غير مدعوم</AlertTitle>
            <AlertDescription>
              المتصفح الحالي لا يدعم تشغيل الأصوات. يرجى استخدام متصفح حديث مثل Chrome أو Safari.
            </AlertDescription>
          </Alert>
        )}

        {/* Test Results */}
        <Card w="100%" bg={bg} borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="sm">نتائج الاختبار</Heading>
              <Badge>{testResults.length}/10</Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={2} align="stretch" maxH="300px" overflowY="auto">
              {testResults.length === 0 ? (
                <Text color="gray.500" textAlign="center">
                  لا توجد نتائج اختبار بعد
                </Text>
              ) : (
                testResults.map((result, index) => (
                  <Code
                    key={index}
                    p={2}
                    fontSize="sm"
                    borderRadius="md"
                    whiteSpace="pre-wrap"
                  >
                    {result}
                  </Code>
                ))
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Instructions */}
        <Card w="100%" bg={bg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="sm">تعليمات الاستخدام</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch" fontSize="sm">
              <Text>• <strong>اختبار الصوت الأساسي:</strong> يشغل ملف الصوت فقط بدون إشعارات المتصفح</Text>
              <Text>• <strong>إشعار وظيفة عادية:</strong> يشغل الصوت مع إشعار المتصفح العادي</Text>
              <Text>• <strong>إشعار عاجل:</strong> يشغل الصوت مع إشعار المتصفح العاجل واهتزاز</Text>
              <Text>• <strong>اختبار الخدمة:</strong> يختبر خدمة الإشعارات الكاملة مع Pusher</Text>
              <Text color="orange.500">
                <strong>ملاحظة:</strong> قد يطلب المتصفح إذنًا لتشغيل الأصوات والإشعارات في المرة الأولى
              </Text>
            </VStack>
          </CardBody>
        </Card>

      </VStack>
    </Box>
  );
}