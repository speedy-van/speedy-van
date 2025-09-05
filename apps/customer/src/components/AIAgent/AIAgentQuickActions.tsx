'use client';

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  SimpleGrid,
  Button,
  IconButton,
  useColorModeValue,
  Tooltip,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Progress,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiZap,
  FiUsers,
  FiCode,
  FiDatabase,
  FiFileText,
  FiSearch,
  FiSettings,
  FiTrendingUp,
  FiShield,
  FiGlobe,
  FiBrain,
  FiTool,
  FiPlay,
  FiPause,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiEdit3,
  FiEye,
  FiPlus,
  FiX,
} from 'react-icons/fi';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: 'customer' | 'developer' | 'system' | 'analytics';
  requiresAuth: boolean;
  action: () => Promise<void>;
}

const AIAgentQuickActions: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'en'>('ar');
  const [selectedMode, setSelectedMode] = useState<'customer' | 'developer' | 'auto'>('auto');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  // Quick Actions Configuration
  const quickActions: QuickAction[] = [
    // Customer Service Actions
    {
      id: 'customer-support',
      title: 'دعم العملاء',
      description: 'بدء محادثة دعم فني ذكية',
      icon: FiUsers,
      color: 'green',
      category: 'customer',
      requiresAuth: false,
      action: async () => {
        await simulateAction('دعم العملاء', 2000);
        toast({
          title: 'تم بدء دعم العملاء',
          description: 'سيتم ربطك مع ممثل خدمة العملاء قريباً',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
    },
    {
      id: 'booking-assistance',
      title: 'مساعدة الحجز',
      description: 'مساعدة ذكية في عملية الحجز',
      icon: FiFileText,
      color: 'blue',
      category: 'customer',
      requiresAuth: false,
      action: async () => {
        await simulateAction('مساعدة الحجز', 1500);
        toast({
          title: 'تم بدء مساعدة الحجز',
          description: 'سيتم توجيهك لصفحة الحجز مع المساعدة الذكية',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
    },
    {
      id: 'pricing-inquiry',
      title: 'استفسار الأسعار',
      description: 'حساب الأسعار الفورية للخدمات',
      icon: FiTrendingUp,
      color: 'orange',
      category: 'customer',
      requiresAuth: false,
      action: async () => {
        await simulateAction('استفسار الأسعار', 1800);
        toast({
          title: 'تم فتح حاسبة الأسعار',
          description: 'أدخل تفاصيل شحنتك للحصول على السعر الفوري',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
    },

    // Developer Actions
    {
      id: 'code-analysis',
      title: 'تحليل الكود',
      description: 'تحليل ذكي للكود وإيجاد المشاكل',
      icon: FiCode,
      color: 'purple',
      category: 'developer',
      requiresAuth: true,
      action: async () => {
        await simulateAction('تحليل الكود', 2500);
        toast({
          title: 'تم بدء تحليل الكود',
          description: 'سيتم فتح محرر الكود مع أدوات التحليل الذكية',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
    },
    {
      id: 'database-management',
      title: 'إدارة قاعدة البيانات',
      description: 'أدوات متقدمة لإدارة قاعدة البيانات',
      icon: FiDatabase,
      color: 'teal',
      category: 'developer',
      requiresAuth: true,
      action: async () => {
        await simulateAction('إدارة قاعدة البيانات', 2000);
        toast({
          title: 'تم فتح أدوات إدارة قاعدة البيانات',
          description: 'يمكنك الآن إدارة الجداول والاستعلامات',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
    },
    {
      id: 'file-management',
      title: 'إدارة الملفات',
      description: 'إدارة متقدمة لملفات المشروع',
      icon: FiFileText,
      color: 'cyan',
      category: 'developer',
      requiresAuth: true,
      action: async () => {
        await simulateAction('إدارة الملفات', 1800);
        toast({
          title: 'تم فتح مدير الملفات',
          description: 'يمكنك الآن تصفح وإدارة ملفات المشروع',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
    },

    // System Actions
    {
      id: 'system-health',
      title: 'صحة النظام',
      description: 'فحص شامل لصحة النظام',
      icon: FiShield,
      color: 'red',
      category: 'system',
      requiresAuth: true,
      action: async () => {
        await simulateAction('فحص صحة النظام', 3000);
        toast({
          title: 'تم فحص صحة النظام',
          description: 'جميع الأنظمة تعمل بشكل طبيعي',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
    },
    {
      id: 'performance-optimization',
      title: 'تحسين الأداء',
      description: 'تحسين أداء النظام والاستعلامات',
      icon: FiZap,
      color: 'yellow',
      category: 'system',
      requiresAuth: true,
      action: async () => {
        await simulateAction('تحسين الأداء', 4000);
        toast({
          title: 'تم تحسين الأداء',
          description: 'تم تحسين النظام بنسبة 15%',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
    },

    // Analytics Actions
    {
      id: 'usage-analytics',
      title: 'تحليل الاستخدام',
      description: 'إحصائيات مفصلة لاستخدام النظام',
      icon: FiTrendingUp,
      color: 'pink',
      category: 'analytics',
      requiresAuth: true,
      action: async () => {
        await simulateAction('تحليل الاستخدام', 2000);
        toast({
          title: 'تم فتح تحليل الاستخدام',
          description: 'يمكنك الآن مراجعة الإحصائيات المفصلة',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
    },
    {
      id: 'ai-insights',
      title: 'رؤى الذكاء الاصطناعي',
      description: 'رؤى متقدمة من تحليل البيانات',
      icon: FiBrain,
      color: 'indigo',
      category: 'analytics',
      requiresAuth: true,
      action: async () => {
        await simulateAction('تحليل الرؤى', 3500);
        toast({
          title: 'تم تحليل الرؤى',
          description: 'تم اكتشاف 3 أنماط جديدة في البيانات',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      },
    },
  ];

  const simulateAction = async (actionName: string, duration: number) => {
    setIsExecuting(true);
    setExecutionProgress(0);
    
    const interval = setInterval(() => {
      setExecutionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, duration / 10);

    await new Promise(resolve => setTimeout(resolve, duration));
    clearInterval(interval);
    setExecutionProgress(100);
    
    setTimeout(() => {
      setIsExecuting(false);
      setExecutionProgress(0);
    }, 500);
  };

  const handleActionClick = (action: QuickAction) => {
    if (action.requiresAuth) {
      // Check if user is authenticated
      const isAuthenticated = true; // Replace with actual auth check
      if (!isAuthenticated) {
        toast({
          title: 'يتطلب تسجيل الدخول',
          description: 'يجب تسجيل الدخول لاستخدام هذه الميزة',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }

    setSelectedAction(action);
    onOpen();
  };

  const executeAction = async () => {
    if (!selectedAction) return;
    
    onClose();
    await selectedAction.action();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'customer': return 'green';
      case 'developer': return 'blue';
      case 'system': return 'red';
      case 'analytics': return 'purple';
      default: return 'gray';
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'customer': return 'خدمة العملاء';
      case 'developer': return 'أدوات التطوير';
      case 'system': return 'إدارة النظام';
      case 'analytics': return 'التحليلات';
      default: return 'عام';
    }
  };

  const groupedActions = quickActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, QuickAction[]>);

  return (
    <Box>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <VStack spacing={4} textAlign="center">
          <Heading size="xl" color={textColor}>
            الإجراءات السريعة
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            وصول سريع لأهم الميزات والوظائف
          </Text>
        </VStack>

        {/* Quick Actions Grid */}
        {Object.entries(groupedActions).map(([category, actions]) => (
          <Box key={category}>
            <HStack spacing={3} mb={4}>
              <Badge colorScheme={getCategoryColor(category)} variant="subtle" size="lg">
                {getCategoryTitle(category)}
              </Badge>
              <Text fontSize="lg" fontWeight="medium" color={textColor}>
                {actions.length} إجراء
              </Text>
            </HStack>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {actions.map((action) => (
                <Box
                  key={action.id}
                  p={6}
                  bg={bgColor}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="xl"
                  cursor="pointer"
                  transition="all 0.3s"
                  _hover={{
                    transform: 'translateY(-4px)',
                    boxShadow: 'xl',
                    borderColor: `${action.color}.500`,
                  }}
                  onClick={() => handleActionClick(action)}
                >
                  <VStack spacing={4} align="center" textAlign="center">
                    <Icon
                      as={action.icon}
                      w={12}
                      h={12}
                      color={`${action.color}.500`}
                    />
                    <VStack spacing={2}>
                      <Heading size="md" color={textColor}>
                        {action.title}
                      </Heading>
                      <Text fontSize="sm" color="gray.500" lineHeight="1.4">
                        {action.description}
                      </Text>
                    </VStack>
                    
                    {action.requiresAuth && (
                      <Badge colorScheme="orange" variant="subtle" size="sm">
                        يتطلب تسجيل دخول
                      </Badge>
                    )}
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        ))}

        {/* Custom Action Input */}
        <Box p={6} bg={bgColor} border="1px solid" borderColor={borderColor} borderRadius="xl">
          <VStack spacing={4} align="stretch">
            <Heading size="md" color={textColor}>
              إجراء مخصص
            </Heading>
            <Text fontSize="sm" color="gray.500">
              اكتب وصفاً للإجراء الذي تريد تنفيذه
            </Text>
            
            <HStack spacing={4}>
              <FormControl>
                <FormLabel>اللغة</FormLabel>
                <Select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as 'ar' | 'en')}
                  size="sm"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>الوضع</FormLabel>
                <Select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value as 'customer' | 'developer' | 'auto')}
                  size="sm"
                >
                  <option value="auto">تلقائي</option>
                  <option value="customer">العملاء</option>
                  <option value="developer">المطورين</option>
                </Select>
              </FormControl>
            </HStack>
            
            <FormControl>
              <FormLabel>وصف الإجراء</FormLabel>
              <Textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="اكتب وصفاً مفصلاً للإجراء المطلوب..."
                size="lg"
                rows={3}
              />
            </FormControl>
            
            <Button
              leftIcon={<FiPlay />}
              colorScheme="blue"
              size="lg"
              onClick={() => {
                if (customInput.trim()) {
                  toast({
                    title: 'تم إرسال الإجراء المخصص',
                    description: 'سيتم معالجته بواسطة AI Agent',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                  });
                  setCustomInput('');
                }
              }}
              isDisabled={!customInput.trim()}
            >
              تنفيذ الإجراء المخصص
            </Button>
          </VStack>
        </Box>
      </VStack>

      {/* Action Execution Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={selectedAction?.icon} color={`${selectedAction?.color}.500`} />
              <Text>{selectedAction?.title}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              <Text color="gray.600">
                {selectedAction?.description}
              </Text>
              
              {isExecuting && (
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="medium">
                      جاري التنفيذ...
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {executionProgress}%
                    </Text>
                  </HStack>
                  <Progress
                    value={executionProgress}
                    colorScheme={selectedAction?.color}
                    size="lg"
                    borderRadius="full"
                  />
                </Box>
              )}
              
              <HStack spacing={3} justify="flex-end">
                <Button variant="ghost" onClick={onClose}>
                  إلغاء
                </Button>
                <Button
                  colorScheme={selectedAction?.color}
                  onClick={executeAction}
                  isLoading={isExecuting}
                  loadingText="جاري التنفيذ..."
                >
                  تنفيذ
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AIAgentQuickActions;
