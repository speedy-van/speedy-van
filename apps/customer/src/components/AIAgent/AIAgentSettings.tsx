'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  SimpleGrid,
  Button,
  Switch,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue,
  useToast,
  Divider,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
  Tooltip,
  Progress,
  Spinner,
} from '@chakra-ui/react';
import {
  FiSettings,
  FiSave,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiShield,
  FiBrain,
  FiGlobe,
  FiZap,
  FiDatabase,
  FiUsers,
  FiCode,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';

interface AIAgentSettings {
  // General Settings
  agentName: string;
  agentDescription: string;
  defaultLanguage: 'ar' | 'en';
  defaultMode: 'customer' | 'developer' | 'auto';
  enableAutoModeDetection: boolean;
  
  // AI Model Settings
  openaiModel: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  
  // Performance Settings
  maxConcurrentRequests: number;
  requestTimeout: number;
  enableCaching: boolean;
  cacheExpiration: number;
  enableRateLimiting: boolean;
  rateLimitPerMinute: number;
  
  // Security Settings
  enableInputValidation: boolean;
  enableOutputFiltering: boolean;
  maxInputLength: number;
  blockedKeywords: string[];
  allowedDomains: string[];
  enableAuditLogging: boolean;
  
  // RAG Settings
  enableRAG: boolean;
  ragModel: string;
  maxContextLength: number;
  similarityThreshold: number;
  maxRetrievedChunks: number;
  
  // Tool Settings
  enableToolExecution: boolean;
  maxToolExecutionTime: number;
  enableToolChaining: boolean;
  toolExecutionRetries: number;
  
  // Monitoring Settings
  enablePerformanceMonitoring: boolean;
  enableErrorTracking: boolean;
  enableUsageAnalytics: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  metricsCollectionInterval: number;
  
  // Integration Settings
  enableStripeIntegration: boolean;
  enableMapboxIntegration: boolean;
  enableEmailIntegration: boolean;
  enableSMSIntegration: boolean;
  
  // Customization Settings
  enableCustomPrompts: boolean;
  customSystemPrompt: string;
  enableCustomTools: boolean;
  customToolDefinitions: string;
}

const AIAgentSettings: React.FC = () => {
  const [settings, setSettings] = useState<AIAgentSettings>({
    // General Settings
    agentName: 'Speedy Van AI Agent',
    agentDescription: 'مساعد ذكي متقدم لخدمة العملاء والتطوير',
    defaultLanguage: 'ar',
    defaultMode: 'auto',
    enableAutoModeDetection: true,
    
    // AI Model Settings
    openaiModel: 'gpt-4',
    maxTokens: 4000,
    temperature: 0.7,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    
    // Performance Settings
    maxConcurrentRequests: 100,
    requestTimeout: 30000,
    enableCaching: true,
    cacheExpiration: 3600,
    enableRateLimiting: true,
    rateLimitPerMinute: 60,
    
    // Security Settings
    enableInputValidation: true,
    enableOutputFiltering: true,
    maxInputLength: 10000,
    blockedKeywords: ['spam', 'malicious', 'inappropriate'],
    allowedDomains: ['speedy-van.co.uk', 'localhost:3000'],
    enableAuditLogging: true,
    
    // RAG Settings
    enableRAG: true,
    ragModel: 'text-embedding-ada-002',
    maxContextLength: 8000,
    similarityThreshold: 0.8,
    maxRetrievedChunks: 5,
    
    // Tool Settings
    enableToolExecution: true,
    maxToolExecutionTime: 30000,
    enableToolChaining: true,
    toolExecutionRetries: 3,
    
    // Monitoring Settings
    enablePerformanceMonitoring: true,
    enableErrorTracking: true,
    enableUsageAnalytics: true,
    logLevel: 'info',
    metricsCollectionInterval: 60,
    
    // Integration Settings
    enableStripeIntegration: true,
    enableMapboxIntegration: true,
    enableEmailIntegration: true,
    enableSMSIntegration: true,
    
    // Customization Settings
    enableCustomPrompts: false,
    customSystemPrompt: '',
    enableCustomTools: false,
    customToolDefinitions: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<AIAgentSettings | null>(null);

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (originalSettings) {
      setHasChanges(JSON.stringify(settings) !== JSON.stringify(originalSettings));
    }
  }, [settings, originalSettings]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to load settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, fetch from API
      const loadedSettings = { ...settings };
      setSettings(loadedSettings);
      setOriginalSettings(loadedSettings);
      
      toast({
        title: 'تم تحميل الإعدادات',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'خطأ في تحميل الإعدادات',
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setOriginalSettings({ ...settings });
      setHasChanges(false);
      
      toast({
        title: 'تم حفظ الإعدادات',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'خطأ في حفظ الإعدادات',
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetSettings = () => {
    if (originalSettings) {
      setSettings({ ...originalSettings });
      setHasChanges(false);
      
      toast({
        title: 'تم إعادة تعيين الإعدادات',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const updateSetting = <K extends keyof AIAgentSettings>(
    key: K,
    value: AIAgentSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const addBlockedKeyword = (keyword: string) => {
    if (keyword.trim() && !settings.blockedKeywords.includes(keyword.trim())) {
      updateSetting('blockedKeywords', [...settings.blockedKeywords, keyword.trim()]);
    }
  };

  const removeBlockedKeyword = (keyword: string) => {
    updateSetting('blockedKeywords', settings.blockedKeywords.filter(k => k !== keyword));
  };

  const addAllowedDomain = (domain: string) => {
    if (domain.trim() && !settings.allowedDomains.includes(domain.trim())) {
      updateSetting('allowedDomains', [...settings.allowedDomains, domain.trim()]);
    }
  };

  const removeAllowedDomain = (domain: string) => {
    updateSetting('allowedDomains', settings.allowedDomains.filter(d => d !== domain));
  };

  if (isLoading && !originalSettings) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" color={accentColor} />
        <Text mt={4} fontSize="lg" color="gray.500">
          جاري تحميل الإعدادات...
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <VStack spacing={4} textAlign="center">
          <Heading size="xl" color={textColor}>
            إعدادات AI Agent
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            تخصيص وإدارة إعدادات المساعد الذكي المتقدمة
          </Text>
        </VStack>

        {/* Action Buttons */}
        <HStack spacing={4} justify="center">
          <Button
            leftIcon={<FiSave />}
            colorScheme="green"
            size="lg"
            onClick={saveSettings}
            isLoading={isLoading}
            isDisabled={!hasChanges}
          >
            حفظ الإعدادات
          </Button>
          
          <Button
            leftIcon={<FiRefreshCw />}
            colorScheme="blue"
            size="lg"
            onClick={loadSettings}
            isLoading={isLoading}
          >
            إعادة تحميل
          </Button>
          
          <Button
            leftIcon={<FiXCircle />}
            colorScheme="gray"
            size="lg"
            onClick={resetSettings}
            isDisabled={!hasChanges}
          >
            إعادة تعيين
          </Button>
        </HStack>

        {/* Settings Tabs */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>عام</Tab>
            <Tab>نموذج الذكاء الاصطناعي</Tab>
            <Tab>الأداء</Tab>
            <Tab>الأمان</Tab>
            <Tab>RAG</Tab>
            <Tab>الأدوات</Tab>
            <Tab>المراقبة</Tab>
            <Tab>التكامل</Tab>
            <Tab>التخصيص</Tab>
          </TabList>

          <TabPanels>
            {/* General Settings */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color={textColor}>
                  الإعدادات العامة
                </Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>اسم الـ Agent</FormLabel>
                    <Input
                      value={settings.agentName}
                      onChange={(e) => updateSetting('agentName', e.target.value)}
                      placeholder="أدخل اسم الـ Agent"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>اللغة الافتراضية</FormLabel>
                    <Select
                      value={settings.defaultLanguage}
                      onChange={(e) => updateSetting('defaultLanguage', e.target.value as 'ar' | 'en')}
                    >
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
                
                <FormControl>
                  <FormLabel>وصف الـ Agent</FormLabel>
                  <Textarea
                    value={settings.agentDescription}
                    onChange={(e) => updateSetting('agentDescription', e.target.value)}
                    placeholder="أدخل وصفاً للـ Agent"
                    rows={3}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>الوضع الافتراضي</FormLabel>
                  <Select
                    value={settings.defaultMode}
                    onChange={(e) => updateSetting('defaultMode', e.target.value as 'customer' | 'developer' | 'auto')}
                  >
                    <option value="auto">تلقائي</option>
                    <option value="customer">العملاء</option>
                    <option value="developer">المطورين</option>
                  </Select>
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">تفعيل اكتشاف الوضع التلقائي</FormLabel>
                  <Switch
                    isChecked={settings.enableAutoModeDetection}
                    onChange={(e) => updateSetting('enableAutoModeDetection', e.target.checked)}
                  />
                </FormControl>
              </VStack>
            </TabPanel>

            {/* AI Model Settings */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color={textColor}>
                  إعدادات نموذج الذكاء الاصطناعي
                </Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>نموذج OpenAI</FormLabel>
                    <Select
                      value={settings.openaiModel}
                      onChange={(e) => updateSetting('openaiModel', e.target.value)}
                    >
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>الحد الأقصى للرموز</FormLabel>
                    <NumberInput
                      value={settings.maxTokens}
                      onChange={(_, value) => updateSetting('maxTokens', value)}
                      min={100}
                      max={8000}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>درجة الحرارة (Temperature)</FormLabel>
                    <NumberInput
                      value={settings.temperature}
                      onChange={(_, value) => updateSetting('temperature', value)}
                      min={0}
                      max={2}
                      step={0.1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Top P</FormLabel>
                    <NumberInput
                      value={settings.topP}
                      onChange={(_, value) => updateSetting('topP', value)}
                      min={0}
                      max={1}
                      step={0.1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* Performance Settings */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color={textColor}>
                  إعدادات الأداء
                </Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>الحد الأقصى للطلبات المتزامنة</FormLabel>
                    <NumberInput
                      value={settings.maxConcurrentRequests}
                      onChange={(_, value) => updateSetting('maxConcurrentRequests', value)}
                      min={1}
                      max={1000}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>مهلة الطلب (مللي ثانية)</FormLabel>
                    <NumberInput
                      value={settings.requestTimeout}
                      onChange={(_, value) => updateSetting('requestTimeout', value)}
                      min={1000}
                      max={120000}
                      step={1000}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">تفعيل التخزين المؤقت</FormLabel>
                  <Switch
                    isChecked={settings.enableCaching}
                    onChange={(e) => updateSetting('enableCaching', e.target.checked)}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">تفعيل تحديد معدل الطلبات</FormLabel>
                  <Switch
                    isChecked={settings.enableRateLimiting}
                    onChange={(e) => updateSetting('enableRateLimiting', e.target.checked)}
                  />
                </FormControl>
              </VStack>
            </TabPanel>

            {/* Security Settings */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color={textColor}>
                  إعدادات الأمان
                </Heading>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">تفعيل التحقق من المدخلات</FormLabel>
                  <Switch
                    isChecked={settings.enableInputValidation}
                    onChange={(e) => updateSetting('enableInputValidation', e.target.checked)}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">تفعيل تصفية المخرجات</FormLabel>
                  <Switch
                    isChecked={settings.enableOutputFiltering}
                    onChange={(e) => updateSetting('enableOutputFiltering', e.target.checked)}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>الحد الأقصى لطول المدخلات</FormLabel>
                  <NumberInput
                    value={settings.maxInputLength}
                    onChange={(_, value) => updateSetting('maxInputLength', value)}
                    min={100}
                    max={50000}
                    step={100}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl>
                  <FormLabel>الكلمات المفتاحية المحظورة</FormLabel>
                  <VStack spacing={2} align="stretch">
                    {settings.blockedKeywords.map((keyword, index) => (
                      <HStack key={index} justify="space-between">
                        <Badge colorScheme="red" variant="subtle">
                          {keyword}
                        </Badge>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeBlockedKeyword(keyword)}
                        >
                          <FiX />
                        </Button>
                      </HStack>
                    ))}
                    <HStack>
                      <Input
                        placeholder="أدخل كلمة مفتاحية جديدة"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addBlockedKeyword((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="أدخل كلمة مفتاحية جديدة"]') as HTMLInputElement;
                          if (input) {
                            addBlockedKeyword(input.value);
                            input.value = '';
                          }
                        }}
                      >
                        إضافة
                      </Button>
                    </HStack>
                  </VStack>
                </FormControl>
              </VStack>
            </TabPanel>

            {/* RAG Settings */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color={textColor}>
                  إعدادات RAG
                </Heading>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">تفعيل RAG</FormLabel>
                  <Switch
                    isChecked={settings.enableRAG}
                    onChange={(e) => updateSetting('enableRAG', e.target.checked)}
                  />
                </FormControl>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>نموذج RAG</FormLabel>
                    <Select
                      value={settings.ragModel}
                      onChange={(e) => updateSetting('ragModel', e.target.value)}
                    >
                      <option value="text-embedding-ada-002">text-embedding-ada-002</option>
                      <option value="text-embedding-3-small">text-embedding-3-small</option>
                      <option value="text-embedding-3-large">text-embedding-3-large</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>عتبة التشابه</FormLabel>
                    <NumberInput
                      value={settings.similarityThreshold}
                      onChange={(_, value) => updateSetting('similarityThreshold', value)}
                      min={0}
                      max={1}
                      step={0.1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* Tool Settings */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color={textColor}>
                  إعدادات الأدوات
                </Heading>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">تفعيل تنفيذ الأدوات</FormLabel>
                  <Switch
                    isChecked={settings.enableToolExecution}
                    onChange={(e) => updateSetting('enableToolExecution', e.target.checked)}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">تفعيل ربط الأدوات</FormLabel>
                  <Switch
                    isChecked={settings.enableToolChaining}
                    onChange={(e) => updateSetting('enableToolChaining', e.target.checked)}
                  />
                </FormControl>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>الحد الأقصى لوقت تنفيذ الأداة (مللي ثانية)</FormLabel>
                    <NumberInput
                      value={settings.maxToolExecutionTime}
                      onChange={(_, value) => updateSetting('maxToolExecutionTime', value)}
                      min={1000}
                      max={120000}
                      step={1000}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>عدد محاولات تنفيذ الأداة</FormLabel>
                    <NumberInput
                      value={settings.toolExecutionRetries}
                      onChange={(_, value) => updateSetting('toolExecutionRetries', value)}
                      min={0}
                      max={5}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* Monitoring Settings */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color={textColor}>
                  إعدادات المراقبة
                </Heading>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">تفعيل مراقبة الأداء</FormLabel>
                  <Switch
                    isChecked={settings.enablePerformanceMonitoring}
                    onChange={(e) => updateSetting('enablePerformanceMonitoring', e.target.checked)}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">تفعيل تتبع الأخطاء</FormLabel>
                  <Switch
                    isChecked={settings.enableErrorTracking}
                    onChange={(e) => updateSetting('enableErrorTracking', e.target.checked)}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">تفعيل تحليلات الاستخدام</FormLabel>
                  <Switch
                    isChecked={settings.enableUsageAnalytics}
                    onChange={(e) => updateSetting('enableUsageAnalytics', e.target.checked)}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>مستوى التسجيل</FormLabel>
                  <Select
                    value={settings.logLevel}
                    onChange={(e) => updateSetting('logLevel', e.target.value as 'debug' | 'info' | 'warn' | 'error')}
                  >
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                  </Select>
                </FormControl>
              </VStack>
            </TabPanel>

            {/* Integration Settings */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color={textColor}>
                  إعدادات التكامل
                </Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">تكامل Stripe</FormLabel>
                    <Switch
                      isChecked={settings.enableStripeIntegration}
                      onChange={(e) => updateSetting('enableStripeIntegration', e.target.checked)}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">تكامل Mapbox</FormLabel>
                    <Switch
                      isChecked={settings.enableMapboxIntegration}
                      onChange={(e) => updateSetting('enableMapboxIntegration', e.target.checked)}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">تكامل البريد الإلكتروني</FormLabel>
                    <Switch
                      isChecked={settings.enableEmailIntegration}
                      onChange={(e) => updateSetting('enableEmailIntegration', e.target.checked)}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">تكامل الرسائل النصية</FormLabel>
                    <Switch
                      isChecked={settings.enableSMSIntegration}
                      onChange={(e) => updateSetting('enableSMSIntegration', e.target.checked)}
                    />
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* Customization Settings */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color={textColor}>
                  إعدادات التخصيص
                </Heading>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">تفعيل الرسائل المخصصة</FormLabel>
                  <Switch
                    isChecked={settings.enableCustomPrompts}
                    onChange={(e) => updateSetting('enableCustomPrompts', e.target.checked)}
                  />
                </FormControl>
                
                {settings.enableCustomPrompts && (
                  <FormControl>
                    <FormLabel>رسالة النظام المخصصة</FormLabel>
                    <Textarea
                      value={settings.customSystemPrompt}
                      onChange={(e) => updateSetting('customSystemPrompt', e.target.value)}
                      placeholder="أدخل رسالة النظام المخصصة..."
                      rows={4}
                    />
                  </FormControl>
                )}
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">تفعيل الأدوات المخصصة</FormLabel>
                  <Switch
                    isChecked={settings.enableCustomTools}
                    onChange={(e) => updateSetting('enableCustomTools', e.target.checked)}
                  />
                </FormControl>
                
                {settings.enableCustomTools && (
                  <FormControl>
                    <FormLabel>تعريفات الأدوات المخصصة</FormLabel>
                    <Textarea
                      value={settings.customToolDefinitions}
                      onChange={(e) => updateSetting('customToolDefinitions', e.target.value)}
                      placeholder="أدخل تعريفات الأدوات المخصصة بصيغة JSON..."
                      rows={6}
                    />
                  </FormControl>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Changes Indicator */}
        {hasChanges && (
          <Alert status="info">
            <AlertIcon />
            <AlertTitle>توجد تغييرات!</AlertTitle>
            <AlertDescription>
              تم تعديل الإعدادات. لا تنس حفظ التغييرات.
            </AlertDescription>
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default AIAgentSettings;
