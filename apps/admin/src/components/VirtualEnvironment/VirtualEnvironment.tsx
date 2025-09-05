'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Badge,
  Divider,
  Code,
  Select,
  Switch,
  FormControl,
  FormLabel,
  Tooltip,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  ChatBubbleLeftRightIcon,
  ComputerDesktopIcon,
  CommandLineIcon,
  PlayIcon,
  StopIcon,
  TrashIcon,
  FolderIcon,
  DocumentIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface VirtualEnvironmentProps {
  agentManager?: any;
  className?: string;
}

interface TerminalCommand {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
  status: 'running' | 'completed' | 'error';
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface VirtualEnv {
  id: string;
  name: string;
  type: 'python' | 'node' | 'docker' | 'custom';
  status: 'active' | 'inactive' | 'creating' | 'error';
  path: string;
  packages?: string[];
  createdAt: Date;
}

export default function VirtualEnvironment({ agentManager, className }: VirtualEnvironmentProps) {
  // State management
  const [virtualEnvs, setVirtualEnvs] = useState<VirtualEnv[]>([]);
  const [activeEnv, setActiveEnv] = useState<VirtualEnv | null>(null);
  const [terminalCommands, setTerminalCommands] = useState<TerminalCommand[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isTerminalActive, setIsTerminalActive] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [envType, setEnvType] = useState<'python' | 'node' | 'docker' | 'custom'>('python');
  const [envName, setEnvName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Refs
  const terminalRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Initialize with sample data
  useEffect(() => {
    const sampleEnvs: VirtualEnv[] = [
      {
        id: '1',
        name: 'speedy-van-dev',
        type: 'node',
        status: 'active',
        path: '/projects/speedy-van',
        packages: ['next', 'react', 'typescript', 'chakra-ui'],
        createdAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        name: 'ai-agent-env',
        type: 'python',
        status: 'inactive',
        path: '/projects/ai-agent',
        packages: ['openai', 'numpy', 'pandas', 'fastapi'],
        createdAt: new Date('2024-01-15'),
      },
    ];

    const sampleCommands: TerminalCommand[] = [
      {
        id: '1',
        command: 'npm install',
        output: 'added 1234 packages in 45s',
        timestamp: new Date(),
        status: 'completed',
      },
      {
        id: '2',
        command: 'npm run dev',
        output: 'ready - started server on 0.0.0.0:3000',
        timestamp: new Date(),
        status: 'running',
      },
    ];

    const sampleChat: ChatMessage[] = [
      {
        id: '1',
        type: 'assistant',
        content: 'مرحباً! أنا مساعد Speedy Van الذكي. كيف يمكنني مساعدتك اليوم؟',
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'user',
        content: 'أريد إنشاء بيئة افتراضية جديدة',
        timestamp: new Date(),
      },
      {
        id: '3',
        type: 'assistant',
        content: 'ممتاز! سأساعدك في إنشاء بيئة افتراضية جديدة. ما نوع البيئة التي تريدها؟',
        timestamp: new Date(),
      },
    ];

    setVirtualEnvs(sampleEnvs);
    setTerminalCommands(sampleCommands);
    setChatMessages(sampleChat);
    setActiveEnv(sampleEnvs[0]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalCommands]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Terminal functions
  const executeCommand = useCallback(async (command: string) => {
    if (!command.trim()) return;

    const newCommand: TerminalCommand = {
      id: Date.now().toString(),
      command,
      output: '',
      timestamp: new Date(),
      status: 'running',
    };

    setTerminalCommands(prev => [...prev, newCommand]);
    setCurrentCommand('');

    // Simulate command execution
    setTimeout(() => {
      let output = '';
      let status: 'completed' | 'error' = 'completed';

      if (command.startsWith('npm install')) {
        output = 'added 1234 packages in 45s\nfound 0 vulnerabilities';
      } else if (command.startsWith('npm run')) {
        output = 'ready - started server on 0.0.0.0:3000\n✓ ready in 2.3s';
      } else if (command.startsWith('git')) {
        output = 'On branch main\nYour branch is up to date with origin/main';
      } else if (command.startsWith('ls')) {
        output = 'src/\npublic/\npackage.json\nREADME.md\n.env.local';
      } else if (command.startsWith('cd')) {
        output = 'Changed directory successfully';
      } else if (command.startsWith('pwd')) {
        output = activeEnv?.path || '/projects/speedy-van';
      } else if (command.startsWith('python') || command.startsWith('node')) {
        output = 'Command executed successfully';
      } else {
        output = `Command '${command}' executed successfully`;
      }

      setTerminalCommands(prev =>
        prev.map(cmd =>
          cmd.id === newCommand.id
            ? { ...cmd, output, status }
            : cmd
        )
      );
    }, 1000);
  }, [activeEnv]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(currentCommand);
  };

  // Chat functions
  const sendChatMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // Simulate AI response
    setTimeout(() => {
      let response = '';
      
      if (message.includes('بيئة افتراضية') || message.includes('virtual environment')) {
        response = 'أرى أنك تريد إنشاء بيئة افتراضية! يمكنني مساعدتك في ذلك. ما نوع البيئة التي تحتاجها؟ (Python, Node.js, Docker, أو مخصصة)';
      } else if (message.includes('أمر') || message.includes('command')) {
        response = 'يمكنك استخدام الأوامر التالية:\n- `npm install` لتثبيت الحزم\n- `npm run dev` لتشغيل الخادم\n- `git status` لفحص حالة Git\n- `ls` لعرض الملفات';
      } else if (message.includes('مشكلة') || message.includes('problem')) {
        response = 'أخبرني بالمشكلة التي تواجهها وسأساعدك في حلها. هل هي مشكلة في التثبيت أم في التشغيل؟';
      } else {
        response = 'أفهم طلبك. هل يمكنك توضيح المزيد عن ما تحتاجه؟';
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  }, []);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendChatMessage(chatInput);
  };

  // Environment functions
  const createVirtualEnv = useCallback(async () => {
    if (!envName.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم للبيئة الافتراضية',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newEnv: VirtualEnv = {
      id: Date.now().toString(),
      name: envName,
      type: envType,
      status: 'creating',
      path: `/projects/${envName}`,
      packages: [],
      createdAt: new Date(),
    };

    setVirtualEnvs(prev => [...prev, newEnv]);
    setEnvName('');
    onClose();

    // Simulate environment creation
    setTimeout(() => {
      setVirtualEnvs(prev =>
        prev.map(env =>
          env.id === newEnv.id
            ? { ...env, status: 'active' }
            : env
        )
      );

      toast({
        title: 'تم إنشاء البيئة الافتراضية',
        description: `تم إنشاء البيئة "${envName}" بنجاح`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 2000);
  }, [envName]);

  const activateEnvironment = useCallback((env: VirtualEnv) => {
    setActiveEnv(env);
    setIsTerminalActive(true);
    
    toast({
      title: 'تم تفعيل البيئة',
      description: `تم تفعيل البيئة "${env.name}"`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }, []);

  const deleteEnvironment = useCallback((envId: string) => {
    setVirtualEnvs(prev => prev.filter(env => env.id !== envId));
    
    if (activeEnv?.id === envId) {
      setActiveEnv(null);
      setIsTerminalActive(false);
    }

    toast({
      title: 'تم حذف البيئة',
      description: 'تم حذف البيئة الافتراضية بنجاح',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }, [activeEnv]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'creating': return 'blue';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'python': return '🐍';
      case 'node': return '🟢';
      case 'docker': return '🐳';
      case 'custom': return '⚙️';
      default: return '💻';
    }
  };

  return (
    <Box className={className} h="100vh" bg="gray.50" overflow="hidden">
      {/* Header */}
      <Flex
        bg="white"
        borderBottom="1px"
        borderColor="gray.200"
        p={4}
        align="center"
        justify="space-between"
      >
        <HStack spacing={4}>
          <ComputerDesktopIcon className="h-6 w-6 text-blue-600" />
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            Speedy Van - البيئة الافتراضية
          </Text>
        </HStack>
        
        <HStack spacing={3}>
          <Badge colorScheme={activeEnv ? 'green' : 'gray'}>
            {activeEnv ? `نشط: ${activeEnv.name}` : 'لا توجد بيئة نشطة'}
          </Badge>
          <Button
            leftIcon={<Cog6ToothIcon className="h-4 w-4" />}
            size="sm"
            onClick={onOpen}
          >
            إعدادات
          </Button>
        </HStack>
      </Flex>

      {/* Main Content */}
      <Flex h="calc(100vh - 80px)">
        {/* Left Panel - Environment Management */}
        <Box w="300px" bg="white" borderRight="1px" borderColor="gray.200" p={4}>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="bold" color="gray.800">
                البيئات الافتراضية
              </Text>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={onOpen}
              >
                + جديد
              </Button>
            </HStack>

            <VStack spacing={2} align="stretch">
              {virtualEnvs.map((env) => (
                <Box
                  key={env.id}
                  p={3}
                  border="1px"
                  borderColor={activeEnv?.id === env.id ? 'blue.200' : 'gray.200'}
                  borderRadius="md"
                  bg={activeEnv?.id === env.id ? 'blue.50' : 'white'}
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => activateEnvironment(env)}
                >
                  <HStack justify="space-between" mb={2}>
                    <HStack spacing={2}>
                      <Text fontSize="lg">{getTypeIcon(env.type)}</Text>
                      <Text fontWeight="medium">{env.name}</Text>
                    </HStack>
                    <Badge colorScheme={getStatusColor(env.status)} size="sm">
                      {env.status}
                    </Badge>
                  </HStack>
                  
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    {env.path}
                  </Text>
                  
                  {env.packages && env.packages.length > 0 && (
                    <Text fontSize="xs" color="gray.500">
                      {env.packages.slice(0, 3).join(', ')}
                      {env.packages.length > 3 && ` +${env.packages.length - 3} أكثر`}
                    </Text>
                  )}

                  <HStack spacing={2} mt={2}>
                    <Button
                      size="xs"
                      colorScheme={activeEnv?.id === env.id ? 'blue' : 'gray'}
                      variant={activeEnv?.id === env.id ? 'solid' : 'outline'}
                    >
                      {activeEnv?.id === env.id ? 'نشط' : 'تفعيل'}
                    </Button>
                    <IconButton
                      size="xs"
                      aria-label="Delete environment"
                      icon={<TrashIcon className="h-3 w-3" />}
                      colorScheme="red"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEnvironment(env.id);
                      }}
                    />
                  </HStack>
                </Box>
              ))}
            </VStack>
          </VStack>
        </Box>

        {/* Center Panel - Terminal */}
        <Box flex="1" bg="gray.900" p={4}>
          <VStack h="full" spacing={4}>
            {/* Terminal Header */}
            <HStack w="full" justify="space-between">
              <HStack spacing={3}>
                <CommandLineIcon className="h-5 w-5 text-green-400" />
                <Text color="green.400" fontWeight="bold">
                  Terminal - {activeEnv?.name || 'No Environment'}
                </Text>
                <Badge colorScheme={isTerminalActive ? 'green' : 'gray'}>
                  {isTerminalActive ? 'نشط' : 'غير نشط'}
                </Badge>
              </HStack>
              
              <HStack spacing={2}>
                <Button
                  size="sm"
                  leftIcon={<PlayIcon className="h-4 w-4" />}
                  colorScheme="green"
                  onClick={() => setIsTerminalActive(true)}
                >
                  تشغيل
                </Button>
                <Button
                  size="sm"
                  leftIcon={<StopIcon className="h-4 w-4" />}
                  colorScheme="red"
                  onClick={() => setIsTerminalActive(false)}
                >
                  إيقاف
                </Button>
              </HStack>
            </HStack>

            {/* Terminal Output */}
            <Box
              ref={terminalRef}
              flex="1"
              w="full"
              bg="black"
              borderRadius="md"
              p={4}
              overflowY="auto"
              fontFamily="mono"
              fontSize="sm"
            >
              {terminalCommands.map((cmd) => (
                <Box key={cmd.id} mb={3}>
                  <HStack spacing={2} mb={1}>
                    <Text color="green.400">$</Text>
                    <Text color="white">{cmd.command}</Text>
                    <Badge
                      size="xs"
                      colorScheme={cmd.status === 'running' ? 'yellow' : cmd.status === 'error' ? 'red' : 'green'}
                    >
                      {cmd.status}
                    </Badge>
                  </HStack>
                  {cmd.output && (
                    <Text color="gray.300" ml={4} whiteSpace="pre-wrap">
                      {cmd.output}
                    </Text>
                  )}
                </Box>
              ))}
            </Box>

            {/* Command Input */}
            <form onSubmit={handleCommandSubmit} style={{ width: '100%' }}>
              <HStack spacing={3}>
                <Text color="green.400" fontFamily="mono">$</Text>
                <Input
                  ref={commandInputRef}
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  placeholder="أدخل الأمر هنا..."
                  bg="gray.800"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                  _focus={{ borderColor: 'green.400' }}
                  disabled={!isTerminalActive}
                />
                <Button
                  type="submit"
                  colorScheme="green"
                  disabled={!isTerminalActive || !currentCommand.trim()}
                >
                  تنفيذ
                </Button>
              </HStack>
            </form>
          </VStack>
        </Box>

        {/* Right Panel - Chat */}
        <Box w="350px" bg="white" borderLeft="1px" borderColor="gray.200" p={4}>
          <VStack h="full" spacing={4}>
            {/* Chat Header */}
            <HStack justify="space-between" w="full">
              <HStack spacing={2}>
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
                <Text fontWeight="bold" color="gray.800">
                  المساعد الذكي
                </Text>
              </HStack>
              <Badge colorScheme="blue">متصل</Badge>
            </HStack>

            {/* Chat Messages */}
            <VStack
              ref={chatRef}
              flex="1"
              w="full"
              overflowY="auto"
              spacing={3}
            >
              {chatMessages.map((message) => (
                <Box
                  key={message.id}
                  mb={3}
                  alignSelf={message.type === 'user' ? 'flex-end' : 'flex-start'}
                >
                  <Box
                    maxW="80%"
                    p={3}
                    borderRadius="lg"
                    bg={message.type === 'user' ? 'blue.500' : 'gray.100'}
                    color={message.type === 'user' ? 'white' : 'gray.800'}
                  >
                    <Text fontSize="sm" whiteSpace="pre-wrap">
                      {message.content}
                    </Text>
                    <Text
                      fontSize="xs"
                      color={message.type === 'user' ? 'blue.100' : 'gray.500'}
                      mt={1}
                    >
                      {message.timestamp.toLocaleTimeString('ar-SA')}
                    </Text>
                  </Box>
                </Box>
              ))}
            </VStack>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} style={{ width: '100%' }}>
              <HStack spacing={2}>
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  size="sm"
                />
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="sm"
                  disabled={!chatInput.trim()}
                >
                  إرسال
                </Button>
              </HStack>
            </form>
          </VStack>
        </Box>
      </Flex>

      {/* Create Environment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>إنشاء بيئة افتراضية جديدة</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>اسم البيئة</FormLabel>
                <Input
                  value={envName}
                  onChange={(e) => setEnvName(e.target.value)}
                  placeholder="مثال: speedy-van-dev"
                />
              </FormControl>

              <FormControl>
                <FormLabel>نوع البيئة</FormLabel>
                <Select
                  value={envType}
                  onChange={(e) => setEnvType(e.target.value as any)}
                >
                  <option value="python">Python 🐍</option>
                  <option value="node">Node.js 🟢</option>
                  <option value="docker">Docker 🐳</option>
                  <option value="custom">مخصص ⚙️</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>خيارات متقدمة</FormLabel>
                <Switch
                  isChecked={showAdvanced}
                  onChange={(e) => setShowAdvanced(e.target.checked)}
                />
              </FormControl>

              {showAdvanced && (
                <Alert status="info">
                  <AlertIcon />
                  الخيارات المتقدمة ستكون متاحة قريباً
                </Alert>
              )}

              <HStack spacing={3} w="full" justify="flex-end">
                <Button onClick={onClose}>إلغاء</Button>
                <Button
                  colorScheme="blue"
                  onClick={createVirtualEnv}
                  disabled={!envName.trim()}
                >
                  إنشاء البيئة
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
