'use client';

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  useColorModeValue,
  Heading,
  Divider,
  Badge,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { FiUser, FiMail, FiLock, FiBot, FiSparkles } from 'react-icons/fi';
import { useSession, signIn } from 'next-auth/react';

interface CustomerAccountCreationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialEmail?: string;
  initialName?: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function CustomerAccountCreation({
  onSuccess,
  onCancel,
  initialEmail = '',
  initialName = '',
}: CustomerAccountCreationProps) {
  const [formData, setFormData] = useState<FormData>({
    name: initialName,
    email: initialEmail,
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCreating, setIsCreating] = useState(false);
  const [isAIAssisted, setIsAIAssisted] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // مسح خطأ الحقل عند الكتابة
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getAISuggestion = async () => {
    if (!formData.name.trim()) return;

    try {
      const response = await fetch('/api/ai-agent/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `اقترح كلمة مرور قوية لاسم المستخدم: ${formData.name}`,
          context: 'password_suggestion',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestion(data.suggestion || '');
        setIsAIAssisted(true);
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
    }
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) return;

    try {
      setIsCreating(true);
      setErrors({});

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          name: formData.name.trim(),
          password: formData.password,
          role: 'customer',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في إنشاء الحساب');
      }

      const data = await response.json();

      // تسجيل الدخول تلقائياً
      const signInResult = await signIn('credentials', {
        email: formData.email.trim(),
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error('تم إنشاء الحساب ولكن فشل في تسجيل الدخول تلقائياً');
      }

      toast({
        title: 'تم إنشاء الحساب بنجاح!',
        description: 'مرحباً بك في Speedy Van! يمكنك الآن الوصول إلى جميع خدماتك.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // استدعاء دالة النجاح
      onSuccess?.();
    } catch (error) {
      console.error('Error creating account:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'فشل في إنشاء الحساب',
      });

      toast({
        title: 'فشل في إنشاء الحساب',
        description: error instanceof Error ? error.message : 'يرجى المحاولة مرة أخرى أو التواصل مع الدعم.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const applyAISuggestion = () => {
    if (aiSuggestion) {
      setFormData(prev => ({
        ...prev,
        password: aiSuggestion,
        confirmPassword: aiSuggestion,
      }));
      setErrors(prev => ({
        ...prev,
        password: undefined,
        confirmPassword: undefined,
      }));
    }
  };

  return (
    <Box
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      p={6}
      maxW="500px"
      mx="auto"
    >
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <VStack spacing={3} textAlign="center">
          <Heading size="lg" color="blue.600">
            إنشاء حساب العميل
          </Heading>
          <Text color="gray.600">
            أنشئ حسابك الشخصي للوصول إلى جميع خدمات Speedy Van
          </Text>
        </VStack>

        <Divider />

        {/* Form */}
        <VStack spacing={4} align="stretch">
          {/* Name Field */}
          <FormControl isInvalid={!!errors.name}>
            <FormLabel>
              <HStack spacing={2}>
                <Icon as={FiUser} />
                <Text>الاسم الكامل</Text>
              </HStack>
            </FormLabel>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="أدخل اسمك الكامل"
              size="lg"
            />
            <FormErrorMessage>{errors.name}</FormErrorMessage>
          </FormControl>

          {/* Email Field */}
          <FormControl isInvalid={!!errors.email}>
            <FormLabel>
              <HStack spacing={2}>
                <Icon as={FiMail} />
                <Text>البريد الإلكتروني</Text>
              </HStack>
            </FormLabel>
            <Input
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="أدخل بريدك الإلكتروني"
              type="email"
              size="lg"
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          {/* Password Field */}
          <FormControl isInvalid={!!errors.password}>
            <FormLabel>
              <HStack spacing={2}>
                <Icon as={FiLock} />
                <Text>كلمة المرور</Text>
                <Tooltip label="احصل على اقتراح من AI">
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    leftIcon={<Icon as={FiBot} />}
                    onClick={getAISuggestion}
                    isLoading={isCreating}
                  >
                    AI
                  </Button>
                </Tooltip>
              </HStack>
            </FormLabel>
            <Input
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="أدخل كلمة المرور"
              type="password"
              size="lg"
            />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          {/* AI Suggestion */}
          {aiSuggestion && (
            <Box
              bg="blue.50"
              border="1px solid"
              borderColor="blue.200"
              borderRadius="md"
              p={3}
            >
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium" color="blue.800">
                    اقتراح AI:
                  </Text>
                  <Badge colorScheme="green" variant="subtle">
                    <HStack spacing={1}>
                      <Icon as={FiSparkles} size={12} />
                      <Text>AI</Text>
                    </HStack>
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="blue.700" fontFamily="mono">
                  {aiSuggestion}
                </Text>
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  onClick={applyAISuggestion}
                >
                  استخدم الاقتراح
                </Button>
              </VStack>
            </Box>
          )}

          {/* Confirm Password Field */}
          <FormControl isInvalid={!!errors.confirmPassword}>
            <FormLabel>
              <HStack spacing={2}>
                <Icon as={FiLock} />
                <Text>تأكيد كلمة المرور</Text>
              </HStack>
            </FormLabel>
            <Input
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="أعد إدخال كلمة المرور"
              type="password"
              size="lg"
            />
            <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
          </FormControl>

          {/* General Error */}
          {errors.general && (
            <Box
              bg="red.50"
              border="1px solid"
              borderColor="red.200"
              borderRadius="md"
              p={3}
            >
              <Text color="red.700" fontSize="sm">
                {errors.general}
              </Text>
            </Box>
          )}

          {/* Action Buttons */}
          <VStack spacing={3} pt={4}>
            <Button
              colorScheme="blue"
              size="lg"
              w="full"
              onClick={handleCreateAccount}
              isLoading={isCreating}
              loadingText="جاري الإنشاء..."
            >
              إنشاء الحساب
            </Button>
            
            {onCancel && (
              <Button
                variant="ghost"
                size="lg"
                w="full"
                onClick={onCancel}
                disabled={isCreating}
              >
                إلغاء
              </Button>
            )}
          </VStack>
        </VStack>

        {/* Footer */}
        <Box textAlign="center">
          <Text fontSize="sm" color="gray.500">
            بإنشاء الحساب، فإنك توافق على{' '}
            <Text as="span" color="blue.500" cursor="pointer">
              شروط الخدمة
            </Text>{' '}
            و{' '}
            <Text as="span" color="blue.500" cursor="pointer">
              سياسة الخصوصية
            </Text>
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
