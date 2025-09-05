'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Avatar,
  Badge,
  IconButton,
  useToast,
  Spinner,
  Divider,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  SendIcon,
  PaperclipIcon,
  ImageIcon,
  MapPinIcon,
  CheckIcon,
  CheckCheckIcon,
  ClockIcon,
  XIcon,
  BotIcon,
  SparklesIcon,
} from 'lucide-react';
import Pusher from 'pusher-js';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'location' | 'system';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  metadata?: any;
  isPending?: boolean;
}

interface ChatParticipant {
  id: string;
  userId?: string;
  guestName?: string;
  guestEmail?: string;
  role: string;
  lastReadAt?: string;
  isTyping: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface ChatSession {
  id: string;
  type: string;
  title?: string;
  isActive: boolean;
  participants: ChatParticipant[];
  messages: Message[];
  booking?: {
    id: string;
    reference: string;
    customerName: string;
    status: string;
  };
}

interface ChatInterfaceProps {
  sessionId: string;
  currentUserId: string;
  onClose?: () => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
  enableAI?: boolean;
}

export default function ChatInterface({
  sessionId,
  currentUserId,
  onClose,
  isMinimized = false,
  onMinimize,
  enableAI = false,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiMode, setAiMode] = useState<'auto' | 'manual'>('auto');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [channel, setChannel] = useState<any>(null);

  // حفظ الرسائل في localStorage
  const saveMessagesToStorage = (messages: Message[]) => {
    try {
      localStorage.setItem(
        `chat_session_${sessionId}`,
        JSON.stringify({
          messages,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  };

  // تحميل الرسائل من localStorage
  const loadMessagesFromStorage = () => {
    try {
      const stored = localStorage.getItem(`chat_session_${sessionId}`);
      if (stored) {
        const data = JSON.parse(stored);
        // تحقق من أن البيانات حديثة (أقل من 24 ساعة)
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return data.messages;
        } else {
          // حذف البيانات القديمة
          localStorage.removeItem(`chat_session_${sessionId}`);
        }
      }
    } catch (error) {
      console.error('Error loading messages from localStorage:', error);
    }
    return [];
  };

  // تنظيف localStorage القديم
  const cleanupOldStorage = () => {
    try {
      const keys = Object.keys(localStorage);
      const chatKeys = keys.filter(
        key => key.startsWith('chat_session_') || key.startsWith('chat_')
      );

      chatKeys.forEach(key => {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const data = JSON.parse(stored);
            // حذف البيانات الأقدم من 24 ساعة
            if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // حذف البيانات التالفة
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error cleaning up localStorage:', error);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const messageBg = useColorModeValue('blue.50', 'blue.900');
  const otherMessageBg = useColorModeValue('gray.100', 'gray.700');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = useCallback(async () => {
    // تحميل الرسائل المحفوظة أولاً
    const cachedMessages = loadMessagesFromStorage();
    if (cachedMessages.length > 0) {
      setMessages(cachedMessages);
    }

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        saveMessagesToStorage(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        status: 'error',
        duration: 3000,
      });
    }
  }, [sessionId, toast]);

  const loadSession = useCallback(async () => {
    try {
      const response = await fetch(`/api/chat/sessions`);
      if (response.ok) {
        const sessions = await response.json();
        const currentSession = sessions.find(
          (s: ChatSession) => s.id === sessionId
        );
        if (currentSession) {
          setSession(currentSession);
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  }, [sessionId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending || isAIProcessing) return;

    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      content: newMessage.trim(),
      type: 'text',
      status: 'sent',
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUserId,
        name: 'You',
        email: '',
        role: 'user',
      },
      isPending: true,
    };

    // إضافة الرسالة مؤقتاً
    setMessages(prev => {
      const newMessages = [...prev, tempMessage];
      saveMessagesToStorage(newMessages);
      return newMessages;
    });

    const messageToSend = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageToSend,
          type: 'text',
        }),
      });

      if (response.ok) {
        const savedMessage = await response.json();
        // استبدال الرسالة المؤقتة بالرسالة المحفوظة
        setMessages(prev => {
          const updatedMessages = prev.map(msg =>
            msg.id === tempMessage.id ? savedMessage : msg
          );
          saveMessagesToStorage(updatedMessages);
          return updatedMessages;
        });

        // إذا كان AI مفعل، أرسل الرسالة إلى AI Agent
        if (enableAI && aiMode === 'auto') {
          await processWithAI(messageToSend);
        }

        // Stop typing indicator
        await fetch(`/api/chat/sessions/${sessionId}/typing`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isTyping: false }),
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // إزالة الرسالة المؤقتة في حالة الخطأ
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => msg.id !== tempMessage.id);
        saveMessagesToStorage(filteredMessages);
        return filteredMessages;
      });

      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = useCallback(
    async (isTyping: boolean) => {
      try {
        await fetch(`/api/chat/sessions/${sessionId}/typing`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isTyping }),
        });
      } catch (error) {
        console.error('Error updating typing status:', error);
      }
    },
    [sessionId]
  );

  // دالة معالجة الرسالة مع AI Agent
  const processWithAI = async (message: string) => {
    if (!enableAI) return;

    setIsAIProcessing(true);
    
    try {
      // إرسال الرسالة إلى AI Agent
      const aiResponse = await fetch('/api/ai-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId,
          customerId: currentUserId,
          context: 'customer_chat',
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        
        // إضافة رد AI Agent
        const aiMessage: Message = {
          id: `ai_${Date.now()}`,
          content: aiData.response || 'عذراً، لا يمكنني معالجة طلبك في الوقت الحالي.',
          type: 'text',
          status: 'delivered',
          createdAt: new Date().toISOString(),
          sender: {
            id: 'ai_agent',
            name: 'AI Assistant',
            email: '',
            role: 'ai',
          },
          metadata: {
            isAIMessage: true,
            confidence: aiData.metadata?.confidence,
            processingTime: aiData.metadata?.processingTime,
          },
        };

        setMessages(prev => {
          const newMessages = [...prev, aiMessage];
          saveMessagesToStorage(newMessages);
          return newMessages;
        });

        // حفظ رد AI في قاعدة البيانات
        await fetch(`/api/chat/sessions/${sessionId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: aiMessage.content,
            type: 'text',
            metadata: aiMessage.metadata,
          }),
        });
      }
    } catch (error) {
      console.error('Error processing with AI:', error);
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Start typing indicator
    handleTyping(true);

    // Stop typing indicator after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckIcon size={12} />;
      case 'delivered':
        return <CheckCheckIcon size={12} color="gray" />;
      case 'read':
        return <CheckCheckIcon size={12} color="blue" />;
      case 'failed':
        return <XIcon size={12} color="red" />;
      default:
        return <ClockIcon size={12} />;
    }
  };

  const formatMessageTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const isOwnMessage = (message: Message) => {
    // Check if it's the current user's message
    if (message.sender.id === currentUserId) return true;

    // Check if it's a guest message and the current user is a guest participant
    if (
      message.metadata?.isGuestMessage &&
      session?.participants.some(p => p.guestEmail)
    ) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    const initPusher = async () => {
      // Check if Pusher credentials are available
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
      const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

      if (!pusherKey || !pusherCluster) {
        console.warn(
          'Pusher credentials not found. Real-time features will be disabled.'
        );
        return;
      }

      try {
        const pusherInstance = new Pusher(pusherKey, {
          cluster: pusherCluster,
          authEndpoint: '/api/pusher/auth',
        });

        const channelInstance = pusherInstance.subscribe(
          `chat-session-${sessionId}`
        );

        channelInstance.bind('message:new', (message: Message) => {
          setMessages(prev => {
            const newMessages = [...prev, message];
            saveMessagesToStorage(newMessages);
            return newMessages;
          });
          scrollToBottom();
        });

        channelInstance.bind(
          'typing:update',
          (data: { userId: string; isTyping: boolean; userName: string }) => {
            if (data.userId !== currentUserId) {
              setTypingUsers(prev => {
                if (data.isTyping) {
                  return prev.includes(data.userId)
                    ? prev
                    : [...prev, data.userId];
                } else {
                  return prev.filter(id => id !== data.userId);
                }
              });
            }
          }
        );

        channelInstance.bind('session:closed', () => {
          toast({
            title: 'Chat Closed',
            description: 'This chat session has been closed',
            status: 'info',
            duration: 5000,
          });
        });

        setPusher(pusherInstance);
        setChannel(channelInstance);
      } catch (error) {
        console.error('Error initializing Pusher:', error);
      }
    };

    initPusher();

    return () => {
      if (pusher) {
        pusher.disconnect();
      }
    };
  }, [sessionId, currentUserId, toast]);

  useEffect(() => {
    cleanupOldStorage(); // تنظيف localStorage القديم
    loadSession();
    loadMessages().finally(() => setIsLoading(false));
  }, [loadSession, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (isMinimized) {
    return (
      <Box
        position="fixed"
        bottom={4}
        sx={{ right: '16px' }}
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        p={3}
        cursor="pointer"
        onClick={onMinimize}
        zIndex={1000}
      >
        <HStack spacing={2}>
          <Avatar size="sm" name={session?.title || 'Chat'} />
          <Text fontSize="sm" fontWeight="medium">
            {session?.title || 'Chat'}
          </Text>
          <Badge colorScheme="blue" size="sm">
            {messages.length}
          </Badge>
        </HStack>
      </Box>
    );
  }

  return (
    <Box
      position="fixed"
      bottom={4}
      sx={{ right: '16px' }}
      width="400px"
      height="600px"
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      display="flex"
      flexDirection="column"
      zIndex={1000}
      boxShadow="lg"
    >
      {/* Header */}
      <Flex
        p={4}
        borderBottom="1px solid"
        borderColor={borderColor}
        alignItems="center"
        justifyContent="space-between"
        bg={useColorModeValue('gray.50', 'gray.700')}
        borderTopRadius="lg"
      >
        <HStack spacing={3}>
          <Avatar size="sm" name={session?.title || 'Chat'} />
          <VStack align="start" spacing={0}>
            <Text fontWeight="medium" fontSize="sm">
              {session?.title || 'Chat'}
            </Text>
            {session?.booking && (
              <Text fontSize="xs" color="gray.500">
                Booking: {session.booking.reference}
              </Text>
            )}
          </VStack>
        </HStack>
        <HStack spacing={1}>
          {onMinimize && (
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Minimize"
              icon={<Text fontSize="sm">−</Text>}
              onClick={onMinimize}
            />
          )}
          {onClose && (
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Close"
              icon={<XIcon size={16} />}
              onClick={onClose}
            />
          )}
        </HStack>
      </Flex>

      {/* Messages */}
      <Box flex={1} overflow="hidden" position="relative">
        {isLoading ? (
          <Flex justify="center" align="center" height="100%">
            <Spinner />
          </Flex>
        ) : (
          <VStack
            spacing={2}
            p={4}
            height="100%"
            overflowY="auto"
            align="stretch"
          >
            {messages.map(message => (
              <Flex
                key={message.id}
                justify={isOwnMessage(message) ? 'flex-end' : 'flex-start'}
              >
                <Box
                  maxW="70%"
                  bg={isOwnMessage(message) ? messageBg : otherMessageBg}
                  p={3}
                  borderRadius="lg"
                  position="relative"
                >
                  {!isOwnMessage(message) && (
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      {message.metadata?.isAIMessage
                        ? '🤖 AI Assistant'
                        : message.metadata?.isGuestMessage
                        ? message.metadata.guestName || 'Guest'
                        : message.sender.name || message.sender.email}
                    </Text>
                  )}
                  <Text fontSize="sm">{message.content}</Text>
                  {message.isPending && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      (جاري الإرسال...)
                    </Text>
                  )}
                  {message.metadata?.isAIMessage && (
                    <HStack spacing={1} mt={1} justify="flex-start">
                      <Badge size="sm" colorScheme="green" variant="subtle">
                        AI
                      </Badge>
                      {message.metadata.confidence && (
                        <Text fontSize="xs" color="gray.500">
                          Confidence: {Math.round(message.metadata.confidence * 100)}%
                        </Text>
                      )}
                    </HStack>
                  )}
                  <HStack spacing={1} mt={2} justify="flex-end">
                    <Text fontSize="xs" color="gray.500">
                      {formatMessageTime(message.createdAt)}
                    </Text>
                    {isOwnMessage(message) && !message.isPending && (
                      <Box>{getMessageStatusIcon(message.status)}</Box>
                    )}
                  </HStack>
                </Box>
              </Flex>
            ))}

            {typingUsers.length > 0 && (
              <Flex justify="flex-start">
                <Box bg={otherMessageBg} p={3} borderRadius="lg" maxW="70%">
                  <HStack spacing={2}>
                    <Spinner size="xs" />
                    <Text fontSize="sm" color="gray.500">
                      {typingUsers.length === 1
                        ? 'Someone is typing...'
                        : 'Multiple people are typing...'}
                    </Text>
                  </HStack>
                </Box>
              </Flex>
            )}

            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>

      {/* Input */}
      <Box p={4} borderTop="1px solid" borderColor={borderColor}>
        {enableAI && (
          <HStack spacing={2} mb={3} justify="center">
            <Button
              size="sm"
              variant={aiMode === 'auto' ? 'solid' : 'outline'}
              colorScheme={aiMode === 'auto' ? 'green' : 'gray'}
              leftIcon={<BotIcon size={16} />}
              onClick={() => setAiMode(aiMode === 'auto' ? 'manual' : 'auto')}
            >
              {aiMode === 'auto' ? 'AI Auto' : 'AI Manual'}
            </Button>
            {aiMode === 'manual' && (
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                leftIcon={<SparklesIcon size={16} />}
                onClick={() => processWithAI(newMessage)}
                disabled={!newMessage.trim() || isAIProcessing}
                isLoading={isAIProcessing}
              >
                Ask AI
              </Button>
            )}
          </HStack>
        )}
        <Box
          sx={{
            '@media (max-width: 480px)': {
              display: 'block',
              width: '100%',
            },
          }}
        >
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={enableAI ? "Type your message or ask AI..." : "Type a message..."}
            size="sm"
            disabled={!session?.isActive || isAIProcessing}
            suppressHydrationWarning
            sx={{
              '@media (max-width: 480px)': {
                fontSize: '16px',
                minHeight: '46px',
                height: 'auto',
                padding: '10px 12px',
                borderRadius: '9999px',
                width: '100%',
                minWidth: '0',
                resize: 'none',
                wordBreak: 'normal',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap',
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
