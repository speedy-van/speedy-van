'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  IconButton,
  Flex,
  Avatar,
  Badge,
  Divider,
  useToast,
  useColorModeValue,
  Spinner,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Textarea,
  Select,
  Switch,
  FormControl,
  FormLabel,
  useClipboard,
} from '@chakra-ui/react';
import {
  FiSend,
  FiMic,
  FiMicOff,
  FiSettings,
  FiTool,
  FiDatabase,
  FiCode,
  FiUser,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiCopy,
  FiCheck,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { handleAgentQuery } from '@/agent/router';
import { AgentQuery, AgentResponse, AgentContext } from '@/agent/types';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: {
    toolUsed?: string;
    processingTime?: number;
    tokensUsed?: number;
    confidence?: number;
  };
}

interface AIAgentChatInterfaceProps {
  mode?: 'customer' | 'developer' | 'auto';
  initialContext?: AgentContext;
  onModeChange?: (mode: 'customer' | 'developer') => void;
  className?: string;
}

const MotionBox = motion.create(Box);
const MotionVStack = motion.create(VStack);

export default function AIAgentChatInterface({
  mode = 'auto',
  initialContext,
  onModeChange,
  className,
}: AIAgentChatInterfaceProps) {
  const { data: session } = useSession();
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'مرحباً! أنا Speedy Van AI Agent. كيف يمكنني مساعدتك اليوم؟',
      role: 'assistant',
      timestamp: new Date(),
      metadata: { confidence: 0.95 },
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentMode, setCurrentMode] = useState<'customer' | 'developer'>(mode === 'auto' ? 'customer' : mode);
  const [context, setContext] = useState<AgentContext>({
    userId: session?.user?.id || null,
    sessionId: crypto.randomUUID(),
    mode: currentMode,
    permissions: session?.user?.role === 'admin' ? ['read', 'write', 'execute', 'admin'] : ['read', 'write'],
    ...initialContext,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'en'>('ar');
  const [autoModeDetection, setAutoModeDetection] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);
  const [showMetadata, setShowMetadata] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { onCopy, hasCopied } = useClipboard('');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle mode change
  const handleModeChange = useCallback((newMode: 'customer' | 'developer') => {
    setCurrentMode(newMode);
    setContext(prev => ({ ...prev, mode: newMode }));
    onModeChange?.(newMode);
    
    // Add system message for mode change
    const systemMessage: Message = {
      id: crypto.randomUUID(),
      content: `تم التبديل إلى وضع ${newMode === 'customer' ? 'العملاء' : 'المطورين'}`,
      role: 'system',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, systemMessage]);
  }, [onModeChange]);

  // Auto-detect mode based on input
  const detectMode = useCallback((input: string): 'customer' | 'developer' => {
    if (!autoModeDetection) return currentMode;
    
    const developerKeywords = [
      'code', 'debug', 'test', 'build', 'deploy', 'migrate', 'database',
      'file', 'component', 'api', 'endpoint', 'schema', 'prisma',
      'كود', 'تصحيح', 'اختبار', 'بناء', 'نشر', 'ترحيل', 'قاعدة بيانات',
      'ملف', 'مكون', 'واجهة', 'نقطة نهاية', 'مخطط', 'بريزما'
    ];
    
    const customerKeywords = [
      'booking', 'delivery', 'moving', 'service', 'price', 'quote',
      'track', 'status', 'payment', 'support', 'help',
      'حجز', 'توصيل', 'نقل', 'خدمة', 'سعر', 'عرض سعر',
      'تتبع', 'حالة', 'دفع', 'دعم', 'مساعدة'
    ];
    
    const inputLower = input.toLowerCase();
    const developerScore = developerKeywords.filter(keyword => 
      inputLower.includes(keyword.toLowerCase())
    ).length;
    const customerScore = customerKeywords.filter(keyword => 
      inputLower.includes(keyword.toLowerCase())
    ).length;
    
    if (developerScore > customerScore && currentMode !== 'developer') {
      return 'developer';
    } else if (customerScore > developerScore && currentMode !== 'customer') {
      return 'customer';
    }
    
    return currentMode;
  }, [autoModeDetection, currentMode]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Detect mode if auto-detection is enabled
      const detectedMode = detectMode(content);
      if (detectedMode !== currentMode) {
        handleModeChange(detectedMode);
      }

      // Prepare agent query
      const agentQuery: AgentQuery = {
        message: content.trim(),
        language: selectedLanguage,
        context: {
          ...context,
          mode: detectedMode,
          userId: session?.user?.id || null,
          sessionId: context.sessionId,
        },
      };

      // Send to AI Agent
      const startTime = Date.now();
      const response = await handleAgentQuery(agentQuery);
      const processingTime = Date.now() - startTime;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: response.response || 'عذراً، حدث خطأ في معالجة طلبك.',
        role: 'assistant',
        timestamp: new Date(),
        metadata: {
          toolUsed: response.toolUsed,
          processingTime,
          tokensUsed: response.metadata?.tokensUsed,
          confidence: response.metadata?.confidence,
        },
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Show success toast
      toast({
        title: 'تم إرسال الرسالة بنجاح',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.',
        role: 'assistant',
        timestamp: new Date(),
        metadata: { confidence: 0.1 },
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: 'خطأ في إرسال الرسالة',
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, detectMode, currentMode, handleModeChange, selectedLanguage, context, session, toast]);

  // Handle input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // Handle voice input
  const toggleVoiceInput = () => {
    if (!isRecording) {
      // Start voice recording
      setIsRecording(true);
      toast({
        title: 'بدء التسجيل الصوتي',
        description: 'تحدث الآن...',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      // Simulate voice input (in real implementation, use Web Speech API)
      setTimeout(() => {
        setIsRecording(false);
        toast({
          title: 'تم التسجيل',
          description: 'سيتم معالجة الصوت قريباً...',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  // Copy message content
  const copyMessage = (content: string) => {
    onCopy(content);
    toast({
      title: 'تم النسخ',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Clear conversation
  const clearConversation = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        content: 'تم مسح المحادثة. كيف يمكنني مساعدتك؟',
        role: 'assistant',
        timestamp: new Date(),
        metadata: { confidence: 0.95 },
      },
    ]);
  };

  // Export conversation
  const exportConversation = () => {
    const conversationData = {
      timestamp: new Date().toISOString(),
      mode: currentMode,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        metadata: msg.metadata,
      })),
    };

    const blob = new Blob([JSON.stringify(conversationData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speedy-van-ai-conversation-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'تم تصدير المحادثة',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Get mode display info
  const getModeInfo = (mode: 'customer' | 'developer') => {
    return {
      customer: {
        title: 'وضع العملاء',
        description: 'مساعد ذكي لخدمة العملاء والاستفسارات',
        icon: FiUser,
        color: 'green',
      },
      developer: {
        title: 'وضع المطورين',
        description: 'أدوات متقدمة للتطوير والبرمجة',
        icon: FiCode,
        color: 'blue',
      },
    }[mode];
  };

  const currentModeInfo = getModeInfo(currentMode);

  return (
    <Box className={className} h="100vh" bg={bgColor} border="1px solid" borderColor={borderColor} borderRadius="lg">
      {/* Header */}
      <Box p={4} borderBottom="1px solid" borderColor={borderColor} bg={bgColor}>
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
                            <Avatar size="sm" bg={accentColor} icon={<FiCode />} />
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" fontSize="lg" color={textColor}>
                Speedy Van AI Agent
              </Text>
              <HStack spacing={2}>
                <Badge colorScheme={currentModeInfo.color} variant="subtle">
                  <HStack spacing={1}>
                    <currentModeInfo.icon size={12} />
                    <Text fontSize="xs">{currentModeInfo.title}</Text>
                  </HStack>
                </Badge>
                <Badge colorScheme="gray" variant="outline">
                  {selectedLanguage === 'ar' ? 'العربية' : 'English'}
                </Badge>
              </HStack>
            </VStack>
          </HStack>

          <HStack spacing={2}>
            <Tooltip label="الإعدادات">
              <IconButton
                aria-label="Settings"
                icon={<FiSettings />}
                size="sm"
                variant="ghost"
                onClick={() => setShowSettings(true)}
              />
            </Tooltip>
            <Tooltip label="تحديث">
              <IconButton
                aria-label="Refresh"
                icon={<FiRefreshCw />}
                size="sm"
                variant="ghost"
                onClick={() => window.location.reload()}
              />
            </Tooltip>
          </HStack>
        </HStack>
      </Box>

      {/* Messages Area */}
      <Box flex={1} overflowY="auto" p={4} h="calc(100vh - 200px)">
        <AnimatePresence>
          {messages.map((message, index) => (
            <MotionBox
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              mb={4}
            >
              <HStack align="start" spacing={3} justify={message.role === 'user' ? 'flex-end' : 'flex-start'}>
                {message.role === 'assistant' && (
                  <Avatar size="sm" bg={accentColor} icon={<FiCode />} />
                )}
                
                <Box
                  maxW="70%"
                  bg={message.role === 'user' ? accentColor : 'gray.100'}
                  color={message.role === 'user' ? 'white' : textColor}
                  p={3}
                  borderRadius="lg"
                  position="relative"
                  _dark={{
                    bg: message.role === 'user' ? accentColor : 'gray.700',
                  }}
                >
                  <Text fontSize="sm" whiteSpace="pre-wrap">
                    {message.content}
                  </Text>
                  
                  {/* Message Metadata */}
                  {showMetadata && message.metadata && (
                    <Box mt={2} pt={2} borderTop="1px solid" borderColor="inherit" opacity={0.7}>
                      <HStack spacing={2} fontSize="xs">
                        {message.metadata.toolUsed && (
                          <Badge size="sm" colorScheme="blue">
                            <FiTool size={10} />
                            {message.metadata.toolUsed}
                          </Badge>
                        )}
                        {message.metadata.processingTime && (
                          <Text>{message.metadata.processingTime}ms</Text>
                        )}
                        {showConfidence && message.metadata.confidence && (
                          <Text>ثقة: {(message.metadata.confidence * 100).toFixed(1)}%</Text>
                        )}
                      </HStack>
                    </Box>
                  )}
                  
                  {/* Message Actions */}
                  <HStack position="absolute" top={2} right={2} spacing={1} opacity={0}>
                    <Tooltip label="نسخ">
                      <IconButton
                        aria-label="Copy message"
                        icon={hasCopied ? <FiCheck /> : <FiCopy />}
                        size="xs"
                        variant="ghost"
                        onClick={() => copyMessage(message.content)}
                      />
                    </Tooltip>
                  </HStack>
                </Box>

                {message.role === 'user' && (
                  <Avatar size="sm" src={session?.user?.image || undefined} name={session?.user?.name || 'User'} />
                )}
              </HStack>
            </MotionBox>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            textAlign="center"
            py={4}
          >
            <Spinner size="md" color={accentColor} />
            <Text mt={2} fontSize="sm" color="gray.500">
              جاري معالجة طلبك...
            </Text>
          </MotionBox>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box p={4} borderTop="1px solid" borderColor={borderColor} bg={bgColor}>
        <form onSubmit={handleSubmit}>
          <HStack spacing={3}>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={selectedLanguage === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message here...'}
              size="lg"
              disabled={isLoading}
              _focus={{
                borderColor: accentColor,
                boxShadow: `0 0 0 1px ${accentColor}`,
              }}
            />
            
            <Tooltip label="تسجيل صوتي">
              <IconButton
                aria-label="Voice input"
                icon={isRecording ? <FiMicOff /> : <FiMic />}
                size="lg"
                colorScheme={isRecording ? 'red' : 'gray'}
                onClick={toggleVoiceInput}
                disabled={isLoading}
              />
            </Tooltip>
            
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              px={8}
              disabled={!inputValue.trim() || isLoading}
              _hover={{ transform: 'translateY(-1px)' }}
              transition="all 0.2s"
            >
              {isLoading ? <Spinner size="sm" /> : <FiSend />}
            </Button>
          </HStack>
        </form>
      </Box>

      {/* Settings Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>إعدادات AI Agent</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              {/* Mode Selection */}
              <FormControl>
                <FormLabel>وضع التشغيل</FormLabel>
                <Select
                  value={currentMode}
                  onChange={(e) => handleModeChange(e.target.value as 'customer' | 'developer')}
                >
                  <option value="customer">وضع العملاء</option>
                  <option value="developer">وضع المطورين</option>
                </Select>
              </FormControl>

              {/* Language Selection */}
              <FormControl>
                <FormLabel>اللغة</FormLabel>
                <Select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as 'ar' | 'en')}
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </Select>
              </FormControl>

              {/* Advanced Settings */}
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">الوضع المتقدم</FormLabel>
                <Switch
                  isChecked={advancedMode}
                  onChange={(e) => setAdvancedMode(e.target.checked)}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">اكتشاف الوضع التلقائي</FormLabel>
                <Switch
                  isChecked={autoModeDetection}
                  onChange={(e) => setAutoModeDetection(e.target.checked)}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">إظهار مستوى الثقة</FormLabel>
                <Switch
                  isChecked={showConfidence}
                  onChange={(e) => setShowConfidence(e.target.checked)}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">إظهار البيانات الوصفية</FormLabel>
                <Switch
                  isChecked={showMetadata}
                  onChange={(e) => setShowMetadata(e.target.checked)}
                />
              </FormControl>

              {/* Action Buttons */}
              <HStack spacing={3} pt={4}>
                <Button
                  leftIcon={<FiTrash2 />}
                  colorScheme="red"
                  variant="outline"
                  onClick={clearConversation}
                  flex={1}
                >
                  مسح المحادثة
                </Button>
                <Button
                  leftIcon={<FiDownload />}
                  colorScheme="green"
                  variant="outline"
                  onClick={exportConversation}
                  flex={1}
                >
                  تصدير المحادثة
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
