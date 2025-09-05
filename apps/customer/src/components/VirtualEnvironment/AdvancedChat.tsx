'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  useToast,
  Badge,
  IconButton,
  Avatar,
  Divider,
  Flex,
  Spacer,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Select,
  FormControl,
  FormLabel,
  Switch,
  Alert,
  AlertIcon,
  Code,
  Textarea,
  Tooltip,
} from '@chakra-ui/react';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  Cog6ToothIcon,
  TrashIcon,
  ClipboardIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

interface AdvancedChatProps {
  agentManager?: any;
  environment?: any;
  onMessageSend?: (message: string) => void;
  className?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp: Date;
  metadata?: {
    environment?: string;
    command?: string;
    output?: string;
    language?: string;
    confidence?: number;
  };
}

interface ChatSettings {
  language: 'ar' | 'en' | 'auto';
  autoTranslate: boolean;
  showTimestamps: boolean;
  enableVoice: boolean;
  enableNotifications: boolean;
  maxMessages: number;
  theme: 'light' | 'dark' | 'auto';
}

export default function AdvancedChat({ 
  agentManager, 
  environment,
  onMessageSend,
  className 
}: AdvancedChatProps) {
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatSettings, setChatSettings] = useState<ChatSettings>({
    language: 'ar',
    autoTranslate: false,
    showTimestamps: true,
    enableVoice: false,
    enableNotifications: true,
    maxMessages: 100,
    theme: 'auto',
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Hooks
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Initialize with sample messages
  useEffect(() => {
    const sampleMessages: ChatMessage[] = [
      {
        id: '1',
        type: 'assistant',
        content: 'مرحباً! أنا مساعد Speedy Van الذكي. كيف يمكنني مساعدتك اليوم؟',
        timestamp: new Date(),
        metadata: {
          environment: environment?.name || 'default',
          language: 'ar',
          confidence: 0.95,
        },
      },
      {
        id: '2',
        type: 'user',
        content: 'أريد إنشاء بيئة افتراضية جديدة',
        timestamp: new Date(),
        metadata: {
          environment: environment?.name || 'default',
          language: 'ar',
        },
      },
      {
        id: '3',
        type: 'assistant',
        content: 'ممتاز! سأساعدك في إنشاء بيئة افتراضية جديدة. ما نوع البيئة التي تحتاجها؟\n\nالخيارات المتاحة:\n🐍 Python - للتطبيقات العلمية والذكاء الاصطناعي\n🟢 Node.js - لتطبيقات الويب والخدمات\n🐳 Docker - للحاويات والتطبيقات المعزولة\n⚙️ مخصصة - لإعدادات خاصة',
        timestamp: new Date(),
        metadata: {
          environment: environment?.name || 'default',
          language: 'ar',
          confidence: 0.92,
        },
      },
      {
        id: '4',
        type: 'user',
        content: 'أريد بيئة Python',
        timestamp: new Date(),
        metadata: {
          environment: environment?.name || 'default',
          language: 'ar',
        },
      },
      {
        id: '5',
        type: 'assistant',
        content: 'ممتاز! سأقوم بإنشاء بيئة Python لك. إليك الأوامر المطلوبة:\n\n```bash\n# إنشاء البيئة الافتراضية\npython -m venv speedy-van-python\n\n# تفعيل البيئة\n# على Windows:\nspeedy-van-python\\Scripts\\activate\n# على macOS/Linux:\nsource speedy-van-python/bin/activate\n\n# تثبيت الحزم الأساسية\npip install numpy pandas matplotlib jupyter\n\n# التحقق من التثبيت\npython --version\npip list\n```\n\nهل تريد مني تنفيذ هذه الأوامر تلقائياً؟',
        timestamp: new Date(),
        metadata: {
          environment: environment?.name || 'default',
          language: 'ar',
          confidence: 0.89,
        },
      },
    ];

    setMessages(sampleMessages);
  }, [environment]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
      metadata: {
        environment: environment?.name || 'default',
        language: chatSettings.language,
      },
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Notify parent component
    if (onMessageSend) {
      onMessageSend(message);
    }

    // Simulate AI response
    setTimeout(() => {
      let response = '';
      let responseType: 'assistant' | 'system' | 'error' = 'assistant';
      let metadata: any = {
        environment: environment?.name || 'default',
        language: chatSettings.language,
        confidence: 0.85 + Math.random() * 0.1,
      };

      try {
        if (message.includes('بيئة افتراضية') || message.includes('virtual environment')) {
          if (message.includes('Python') || message.includes('python')) {
            response = `ممتاز! سأقوم بإنشاء بيئة Python لك. إليك الأوامر المطلوبة:

\`\`\`bash
# إنشاء البيئة الافتراضية
python -m venv speedy-van-python

# تفعيل البيئة
# على Windows:
speedy-van-python\\Scripts\\activate
# على macOS/Linux:
source speedy-van-python/bin/activate

# تثبيت الحزم الأساسية
pip install numpy pandas matplotlib jupyter

# التحقق من التثبيت
python --version
pip list
\`\`\`

هل تريد مني تنفيذ هذه الأوامر تلقائياً؟`;
          } else if (message.includes('Node.js') || message.includes('node')) {
            response = `ممتاز! سأقوم بإنشاء بيئة Node.js لك. إليك الأوامر المطلوبة:

\`\`\`bash
# إنشاء مجلد المشروع
mkdir speedy-van-node
cd speedy-van-node

# تهيئة مشروع Node.js
npm init -y

# تثبيت الحزم الأساسية
npm install express cors dotenv

# تثبيت الحزم للتطوير
npm install --save-dev nodemon typescript @types/node

# إنشاء ملف التكوين
npx tsc --init

# تشغيل المشروع
npm run dev
\`\`\`

هل تريد مني إنشاء هذه الملفات تلقائياً؟`;
          } else {
            response = `أرى أنك تريد إنشاء بيئة افتراضية! يمكنني مساعدتك في ذلك. ما نوع البيئة التي تحتاجها؟

الخيارات المتاحة:
🐍 **Python** - للتطبيقات العلمية والذكاء الاصطناعي
🟢 **Node.js** - لتطبيقات الويب والخدمات  
🐳 **Docker** - للحاويات والتطبيقات المعزولة
⚙️ **مخصصة** - لإعدادات خاصة

أخبرني بالتفاصيل وسأساعدك في الإعداد!`;
          }
        } else if (message.includes('أمر') || message.includes('command')) {
          response = `يمكنك استخدام الأوامر التالية في التيرمينال:

**أوامر أساسية:**
\`\`\`bash
pwd                    # عرض المجلد الحالي
ls -la                 # عرض محتويات المجلد
cd <directory>         # تغيير المجلد
clear                  # مسح التيرمينال
help                   # عرض المساعدة
\`\`\`

**أوامر Node.js:**
\`\`\`bash
npm install            # تثبيت الحزم
npm run dev            # تشغيل الخادم
npm run build          # بناء المشروع
npm run test           # تشغيل الاختبارات
\`\`\`

**أوامر Git:**
\`\`\`bash
git status             # حالة المستودع
git add .              # إضافة التغييرات
git commit -m "msg"    # حفظ التغييرات
git push               # رفع التغييرات
\`\`\`

هل تريد مني شرح أي أمر بالتفصيل؟`;
        } else if (message.includes('مشكلة') || message.includes('problem') || message.includes('error')) {
          response = `أخبرني بالمشكلة التي تواجهها وسأساعدك في حلها. 

**أخبرني بـ:**
- رسالة الخطأ الكاملة
- ما كنت تحاول فعله
- نوع البيئة (Python, Node.js, Docker)
- نظام التشغيل

**أمثلة على المشاكل الشائعة:**
- مشاكل في تثبيت الحزم
- أخطاء في تشغيل الخادم
- مشاكل في قاعدة البيانات
- أخطاء في التجميع

أخبرني بالتفاصيل وسأقدم لك الحل المناسب!`;
        } else if (message.includes('npm') || message.includes('package')) {
          response = `أرى أنك تتعامل مع حزم npm! إليك الأوامر المفيدة:

**إدارة الحزم:**
\`\`\`bash
npm install            # تثبيت جميع الحزم
npm install <package>  # تثبيت حزمة محددة
npm uninstall <package> # إزالة حزمة
npm update             # تحديث الحزم
npm audit              # فحص الأمان
npm outdated           # عرض الحزم القديمة
\`\`\`

**إدارة المشروع:**
\`\`\`bash
npm run dev            # تشغيل الخادم
npm run build          # بناء المشروع
npm run start          # تشغيل الإنتاج
npm run test           # تشغيل الاختبارات
npm run lint           # فحص الكود
\`\`\`

**معلومات المشروع:**
\`\`\`bash
npm list               # عرض الحزم المثبتة
npm info <package>     # معلومات عن حزمة
npm search <keyword>   # البحث عن حزم
npm fund               # معلومات التمويل
\`\`\`

هل تحتاج مساعدة في أمر npm محدد؟`;
        } else if (message.includes('git') || message.includes('commit')) {
          response = `أرى أنك تتعامل مع Git! إليك الأوامر المفيدة:

**إدارة التغييرات:**
\`\`\`bash
git status             # حالة المستودع
git add .              # إضافة جميع التغييرات
git add <file>         # إضافة ملف محدد
git commit -m "msg"    # حفظ التغييرات
git commit --amend     # تعديل آخر commit
\`\`\`

**إدارة الفروع:**
\`\`\`bash
git branch             # عرض الفروع
git checkout <branch>  # الانتقال لفرع
git checkout -b <new>  # إنشاء فرع جديد
git merge <branch>     # دمج فرع
git branch -d <branch> # حذف فرع
\`\`\`

**التعامل مع Remote:**
\`\`\`bash
git remote -v          # عرض الروابط
git fetch              # جلب التحديثات
git pull               # جلب ودمج التحديثات
git push               # رفع التغييرات
git push origin <branch> # رفع فرع محدد
\`\`\`

**عرض التاريخ:**
\`\`\`bash
git log                # تاريخ التغييرات
git log --oneline      # تاريخ مختصر
git show <commit>      # تفاصيل commit
git diff               # عرض التغييرات
\`\`\`

هل تحتاج مساعدة في أمر Git محدد؟`;
        } else if (message.includes('python') || message.includes('pip')) {
          response = `أرى أنك تتعامل مع Python! إليك الأوامر المفيدة:

**إدارة البيئات:**
\`\`\`bash
python -m venv <name>  # إنشاء بيئة افتراضية
source <name>/bin/activate  # تفعيل البيئة (Linux/Mac)
<name>\\Scripts\\activate    # تفعيل البيئة (Windows)
deactivate             # إلغاء تفعيل البيئة
\`\`\`

**إدارة الحزم:**
\`\`\`bash
pip install <package>  # تثبيت حزمة
pip uninstall <package> # إزالة حزمة
pip list               # عرض الحزم المثبتة
pip freeze             # عرض الحزم مع الإصدارات
pip install -r requirements.txt # تثبيت من ملف
pip install --upgrade <package> # تحديث حزمة
\`\`\`

**تشغيل البرامج:**
\`\`\`bash
python <script.py>     # تشغيل سكريبت
python -m <module>     # تشغيل وحدة
python -c "code"       # تنفيذ كود مباشر
python -i <script.py>  # تشغيل تفاعلي
\`\`\`

**أدوات مفيدة:**
\`\`\`bash
pip install jupyter    # Jupyter Notebook
pip install ipython    # IPython shell محسن
pip install pytest     # إطار الاختبارات
pip install black      # تنسيق الكود
pip install flake8     # فحص الكود
\`\`\`

هل تحتاج مساعدة في أمر Python محدد؟`;
        } else if (message.includes('docker') || message.includes('container')) {
          response = `أرى أنك تتعامل مع Docker! إليك الأوامر المفيدة:

**إدارة الصور:**
\`\`\`bash
docker images           # عرض الصور
docker pull <image>     # جلب صورة
docker build -t <name> . # بناء صورة
docker rmi <image>      # حذف صورة
\`\`\`

**إدارة الحاويات:**
\`\`\`bash
docker ps               # عرض الحاويات النشطة
docker ps -a            # عرض جميع الحاويات
docker run <image>      # تشغيل حاوية
docker stop <container> # إيقاف حاوية
docker rm <container>   # حذف حاوية
\`\`\`

**إدارة الشبكات:**
\`\`\`bash
docker network ls        # عرض الشبكات
docker network create <name> # إنشاء شبكة
docker network connect <network> <container> # ربط حاوية بشبكة
\`\`\`

**إدارة البيانات:**
\`\`\`bash
docker volume ls         # عرض المجلدات
docker volume create <name> # إنشاء مجلد
docker run -v <host>:<container> <image> # ربط مجلد
\`\`\`

**أوامر مفيدة:**
\`\`\`bash
docker exec -it <container> bash # دخول حاوية
docker logs <container>    # عرض السجلات
docker stats               # إحصائيات الحاويات
docker system prune        # تنظيف النظام
\`\`\`

هل تحتاج مساعدة في أمر Docker محدد؟`;
        } else if (message.includes('help') || message.includes('مساعدة') || message.includes('مساعدة')) {
          response = `مرحباً! أنا مساعد Speedy Van الذكي. إليك كيف يمكنني مساعدتك:

**🖥️ البيئات الافتراضية:**
- إنشاء بيئات Python, Node.js, Docker
- إعداد وإدارة البيئات
- حل مشاكل البيئات

**💻 أوامر التيرمينال:**
- شرح الأوامر الأساسية
- مساعدة في npm, pip, git
- حل مشاكل الأوامر

**🔧 حل المشاكل:**
- أخطاء التثبيت والتشغيل
- مشاكل الحزم والتبعيات
- أخطاء قاعدة البيانات

**📚 التعلم:**
- شرح المفاهيم التقنية
- أمثلة عملية
- أفضل الممارسات

**💬 الدردشة:**
- دعم متعدد اللغات (العربية/الإنجليزية)
- ردود ذكية ومفصلة
- سياق المحادثة

**أمثلة على الأسئلة:**
- "أريد إنشاء بيئة Python جديدة"
- "كيف أستخدم أمر npm install؟"
- "أواجه مشكلة في Git"
- "اشرح لي Docker"

أخبرني بما تحتاج وسأساعدك! 🚀`;
        } else {
          response = `أفهم طلبك. هل يمكنك توضيح المزيد عن ما تحتاجه؟

يمكنني مساعدتك في:
- إنشاء وإدارة البيئات الافتراضية
- شرح أوامر التيرمينال
- حل المشاكل التقنية
- إعداد المشاريع
- شرح المفاهيم التقنية

أو يمكنك كتابة "مساعدة" للحصول على قائمة كاملة بالخدمات.`;
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: responseType,
          content: response,
          timestamp: new Date(),
          metadata,
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);

        // Show notification if enabled
        if (chatSettings.enableNotifications) {
          toast({
            title: 'رسالة جديدة',
            description: 'المساعد الذكي أرسل رداً',
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'error',
          content: `عذراً، حدث خطأ في معالجة رسالتك: ${error}`,
          timestamp: new Date(),
          metadata: {
            environment: environment?.name || 'default',
            language: chatSettings.language,
          },
        };

        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }
    }, 1000 + Math.random() * 2000); // Random delay for realistic feel
  }, [environment, chatSettings, onMessageSend, toast]);

  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
    toast({
      title: 'تم مسح المحادثة',
      description: 'تم مسح جميع الرسائل',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  // Copy message
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'تم النسخ',
      description: 'تم نسخ الرسالة إلى الحافظة',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Toggle voice recording
  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? 'تم إيقاف التسجيل' : 'تم بدء التسجيل',
      description: isRecording ? 'تم إيقاف تسجيل الصوت' : 'ابدأ بالتحدث الآن',
      status: isRecording ? 'info' : 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Get message type color
  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'user': return 'blue.500';
      case 'assistant': return 'green.500';
      case 'system': return 'purple.500';
      case 'error': return 'red.500';
      default: return 'gray.500';
    }
  };

  // Get message type text
  const getMessageTypeText = (type: string) => {
    switch (type) {
      case 'user': return 'أنت';
      case 'assistant': return 'المساعد الذكي';
      case 'system': return 'النظام';
      case 'error': return 'خطأ';
      default: return 'غير معروف';
    }
  };

  // Get message type icon
  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'user': return <UserIcon className="h-4 w-4" />;
      case 'assistant': return <ComputerDesktopIcon className="h-4 w-4" />;
      case 'system': return <Cog6ToothIcon className="h-4 w-4" />;
      case 'error': return <AlertIcon />;
      default: return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
    }
  };

  return (
    <Box className={className} h="full" bg="white" borderRadius="md" overflow="hidden">
      {/* Chat Header */}
      <Flex
        bg="blue.500"
        p={3}
        align="center"
        borderBottom="1px"
        borderColor="blue.600"
      >
        <HStack spacing={3}>
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
          <Text color="white" fontWeight="bold" fontSize="sm">
            المساعد الذكي - {environment?.name || 'Default'}
          </Text>
          <Badge colorScheme="green" size="sm">
            متصل
          </Badge>
        </HStack>
        
        <Spacer />
        
        <HStack spacing={2}>
          <IconButton
            size="sm"
            aria-label="Chat settings"
            icon={<Cog6ToothIcon className="h-4 w-4" />}
            onClick={onOpen}
            variant="ghost"
            colorScheme="whiteAlpha"
          />
          <IconButton
            size="sm"
            aria-label="Clear chat"
            icon={<TrashIcon className="h-4 w-4" />}
            onClick={clearChat}
            variant="ghost"
            colorScheme="whiteAlpha"
          />
        </HStack>
      </Flex>

      {/* Chat Messages */}
      <VStack
        ref={chatRef}
        flex="1"
        h="calc(100% - 140px)"
        p={4}
        overflowY="auto"
        spacing={3}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            mb={4}
            alignSelf={message.type === 'user' ? 'flex-end' : 'flex-start'}
          >
            {/* Message Header */}
            <HStack spacing={2} mb={2} justify={message.type === 'user' ? 'flex-end' : 'flex-start'}>
              <Avatar
                size="xs"
                bg={getMessageTypeColor(message.type)}
                icon={getMessageTypeIcon(message.type)}
              />
              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                {getMessageTypeText(message.type)}
              </Text>
              {message.metadata?.confidence && (
                <Badge size="xs" colorScheme="green">
                  {Math.round(message.metadata.confidence * 100)}%
                </Badge>
              )}
              {chatSettings.showTimestamps && (
                <Text fontSize="xs" color="gray.400">
                  {message.timestamp.toLocaleTimeString('ar-SA')}
                </Text>
              )}
            </HStack>

            {/* Message Content */}
            <Box
              maxW="85%"
              p={3}
              borderRadius="lg"
              bg={message.type === 'user' ? 'blue.500' : 'gray.100'}
              color={message.type === 'user' ? 'white' : 'gray.800'}
              border="1px"
              borderColor={message.type === 'user' ? 'blue.600' : 'gray.200'}
            >
              <Text fontSize="sm" whiteSpace="pre-wrap" lineHeight="1.5">
                {message.content}
              </Text>
            </Box>

            {/* Message Actions */}
            <HStack spacing={2} mt={2} justify={message.type === 'user' ? 'flex-end' : 'flex-start'}>
              <IconButton
                size="xs"
                aria-label="Copy message"
                icon={<ClipboardIcon className="h-3 w-3" />}
                onClick={() => copyMessage(message.content)}
                variant="ghost"
                colorScheme="gray"
              />
              {message.metadata?.command && (
                <Badge size="xs" colorScheme="blue">
                  أمر: {message.metadata.command}
                </Badge>
              )}
            </HStack>
          </Box>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <Box mb={4} alignSelf="flex-start">
            <HStack spacing={2} mb={2}>
              <Avatar size="xs" bg="green.500" icon={<ComputerDesktopIcon className="h-4 w-4" />} />
              <Text fontSize="xs" color="gray.500">
                المساعد الذكي يكتب...
              </Text>
            </HStack>
            <Box p={3} borderRadius="lg" bg="gray.100" maxW="200px">
              <HStack spacing={1}>
                <Box w="2" h="2" bg="gray.400" borderRadius="full" animation="bounce 1.4s infinite" />
                <Box w="2" h="2" bg="gray.400" borderRadius="full" animation="bounce 1.4s infinite 0.2s" />
                <Box w="2" h="2" bg="gray.400" borderRadius="full" animation="bounce 1.4s infinite 0.4s" />
              </HStack>
            </Box>
          </Box>
        )}
      </VStack>

      {/* Chat Input */}
      <Box p={4} borderTop="1px" borderColor="gray.200">
        <form onSubmit={handleSubmit}>
          <HStack spacing={3}>
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              size="md"
              flex="1"
              _focus={{ borderColor: 'blue.500' }}
            />
            
            <IconButton
              size="md"
              aria-label="Voice message"
              icon={<MicrophoneIcon className="h-4 w-4" />}
              onClick={toggleVoiceRecording}
              colorScheme={isRecording ? 'red' : 'gray'}
              variant={isRecording ? 'solid' : 'outline'}
              disabled={!chatSettings.enableVoice}
            />
            
            <Button
              type="submit"
              colorScheme="blue"
              size="md"
              disabled={!inputMessage.trim()}
              leftIcon={<PaperAirplaneIcon className="h-4 w-4" />}
            >
              إرسال
            </Button>
          </HStack>
        </form>
        
        {/* Input Hints */}
        <HStack spacing={2} mt={2} justify="center">
          <Text fontSize="xs" color="gray.500">
            اكتب "مساعدة" للحصول على قائمة الخدمات
          </Text>
        </HStack>
      </Box>

      {/* Chat Settings Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>إعدادات المحادثة</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>اللغة</FormLabel>
                <Select
                  value={chatSettings.language}
                  onChange={(e) => setChatSettings(prev => ({
                    ...prev,
                    language: e.target.value as 'ar' | 'en' | 'auto'
                  }))}
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                  <option value="auto">تلقائي</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>الترجمة التلقائية</FormLabel>
                <Switch
                  isChecked={chatSettings.autoTranslate}
                  onChange={(e) => setChatSettings(prev => ({
                    ...prev,
                    autoTranslate: e.target.checked
                  }))}
                />
              </FormControl>

              <FormControl>
                <FormLabel>إظهار الوقت</FormLabel>
                <Switch
                  isChecked={chatSettings.showTimestamps}
                  onChange={(e) => setChatSettings(prev => ({
                    ...prev,
                    showTimestamps: e.target.checked
                  }))}
                />
              </FormControl>

              <FormControl>
                <FormLabel>الرسائل الصوتية</FormLabel>
                <Switch
                  isChecked={chatSettings.enableVoice}
                  onChange={(e) => setChatSettings(prev => ({
                    ...prev,
                    enableVoice: e.target.checked
                  }))}
                />
              </FormControl>

              <FormControl>
                <FormLabel>الإشعارات</FormLabel>
                <Switch
                  isChecked={chatSettings.enableNotifications}
                  onChange={(e) => setChatSettings(prev => ({
                    ...prev,
                    enableNotifications: e.target.checked
                  }))}
                />
              </FormControl>

              <FormControl>
                <FormLabel>الحد الأقصى للرسائل</FormLabel>
                <Select
                  value={chatSettings.maxMessages}
                  onChange={(e) => setChatSettings(prev => ({
                    ...prev,
                    maxMessages: parseInt(e.target.value)
                  }))}
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                </Select>
              </FormControl>

              <Alert status="info">
                <AlertIcon />
                سيتم تطبيق التغييرات فوراً
              </Alert>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Hidden audio element for voice features */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </Box>
  );
}
