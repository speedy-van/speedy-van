'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  IconButton,
  Avatar,
  Badge,
  useColorModeValue,
  useToast,
  Collapse,
  Spinner,
  useBreakpointValue
} from '@chakra-ui/react';
import { 
  MessageCircleIcon, 
  XIcon, 
  MinimizeIcon,
  MaximizeIcon,
  SendIcon
} from 'lucide-react';
import Pusher from 'pusher-js';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isPending?: boolean;
}

interface CustomerChatWidgetProps {
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
}

export default function CustomerChatWidget({ 
  customerId, 
  customerName, 
  customerEmail 
}: CustomerChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const toast = useToast();

  // Mobile responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const chatWidth = useBreakpointValue({ base: 'calc(100vw - 32px)', md: '350px' });
  const chatHeight = useBreakpointValue({ base: 'calc(100vh - 120px)', md: '500px' });
  const chatPosition = useBreakpointValue({ 
    base: { bottom: 4, left: 4, right: 4 }, 
    md: { bottom: 4, right: 4 }
  });

  const bgColor = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const messageBg = useColorModeValue('blue.500', 'blue.400'); // Brighter blue for better visibility
  const otherMessageBg = useColorModeValue('gray.100', 'gray.800'); // Better contrast
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');

  // حفظ الرسائل في localStorage
  const saveMessagesToStorage = (messages: Message[]) => {
    try {
      const chatKey = customerId ? `customer_chat_${customerId}` : 'guest_chat';
      localStorage.setItem(chatKey, JSON.stringify({
        messages,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  };

  // تحميل الرسائل من localStorage
  const loadMessagesFromStorage = () => {
    try {
      const chatKey = customerId ? `customer_chat_${customerId}` : 'guest_chat';
      const stored = localStorage.getItem(chatKey);
      if (stored) {
        const data = JSON.parse(stored);
        // تحقق من أن البيانات حديثة (أقل من 24 ساعة)
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return data.messages;
        } else {
          // حذف البيانات القديمة
          localStorage.removeItem(chatKey);
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
      const chatKeys = keys.filter(key => 
        key.startsWith('customer_chat_') || 
        key.startsWith('guest_chat') ||
        key.startsWith('chat_')
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    cleanupOldStorage();
    
    // تحميل الرسائل المحفوظة أولاً
    const cachedMessages = loadMessagesFromStorage();
    if (cachedMessages.length > 0) {
      setMessages(cachedMessages);
      setUnreadCount(cachedMessages.filter(m => m.senderId !== 'user').length);
    }

    // تحميل الرسائل من الخادم إذا كان العميل مسجل دخول
    if (customerId) {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/chat/customer/${customerId}/messages`);
        if (response.ok) {
          const serverMessages = await response.json();
          setMessages(serverMessages);
          saveMessagesToStorage(serverMessages);
          setUnreadCount(serverMessages.filter(m => m.senderId !== 'user').length);
        }
      } catch (error) {
        console.error('Error loading messages from server:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const setupPusher = () => {
    try {
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
      const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

      if (!pusherKey || !pusherCluster) {
        console.warn('Pusher credentials not found. Real-time features will be disabled.');
        return;
      }

      const pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
        authEndpoint: '/api/pusher/auth',
      });

      const channelName = customerId ? `customer-${customerId}` : 'guest-chat';
      const channel = pusher.subscribe(channelName);

      channel.bind('chat:new', (message: Message) => {
        setMessages(prev => {
          const newMessages = [...prev, message];
          saveMessagesToStorage(newMessages);
          return newMessages;
        });
        
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
        
        scrollToBottom();
      });

      channel.bind('chat:typing', () => {
        setTyping(true);
        setTimeout(() => setTyping(false), 2000);
      });

      pusherRef.current = pusher;
    } catch (error) {
      console.error('Error setting up Pusher:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      content: newMessage.trim(),
      senderId: 'user',
      senderName: customerName || 'Guest',
      timestamp: new Date().toISOString(),
      isPending: true
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
      const endpoint = customerId 
        ? `/api/chat/customer/${customerId}/messages`
        : '/api/chat/guest/messages';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageToSend,
          customerName: customerName || 'Guest',
          customerEmail: customerEmail
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
        description: 'Failed to send message. Please try again.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  useEffect(() => {
    loadMessages();
    setupPusher();

    return () => {
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, [customerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isMinimized) {
    return (
      <Box
        position="fixed"
        bottom={4}
        right={4}
        zIndex={1000}
      >
        <IconButton
          aria-label="Maximize chat"
          icon={<MaximizeIcon size={isMobile ? 24 : 20} />}
          onClick={toggleMinimize}
          colorScheme="blue"
          size={isMobile ? "lg" : "lg"}
          borderRadius="full"
          boxShadow="lg"
          minH={isMobile ? "56px" : "48px"}
          minW={isMobile ? "56px" : "48px"}
        />
      </Box>
    );
  }

  return (
    <Box position="fixed" zIndex={1000} {...chatPosition}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Box position="relative">
          <IconButton
            aria-label="Open chat"
            icon={<MessageCircleIcon size={isMobile ? 24 : 20} />}
            onClick={toggleChat}
            colorScheme="blue"
            size={isMobile ? "lg" : "lg"}
            borderRadius="full"
            boxShadow="lg"
            minH={isMobile ? "56px" : "48px"}
            minW={isMobile ? "56px" : "48px"}
          />
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top={-2}
              right={-2}
              colorScheme="red"
              borderRadius="full"
              minW={isMobile ? "24px" : "20px"}
              h={isMobile ? "24px" : "20px"}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize={isMobile ? "sm" : "xs"}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Box>
      )}

      {/* Chat Window */}
      <Collapse in={isOpen} animateOpacity>
        <Box
          w={chatWidth}
          h={chatHeight}
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          borderRadius={isMobile ? "12px" : "lg"}
          boxShadow="xl"
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          {/* Header */}
          <HStack
            p={isMobile ? 3 : 2}
            bg={useColorModeValue('blue.500', 'blue.400')}
            color="white"
            justify="space-between"
            align="center"
            minH={isMobile ? "56px" : "auto"}
          >
            <HStack spacing={isMobile ? 2 : 1}>
              <Avatar size={isMobile ? "sm" : "sm"} name={customerName || 'Guest'} bg="white" color="blue.600" />
              <VStack align="start" spacing={0}>
                <Text fontWeight="semibold" fontSize={isMobile ? "sm" : "sm"}>
                  {customerName || 'Guest Support'}
                </Text>
                <Text fontSize={isMobile ? "xs" : "xs"} opacity={0.9}>
                  {customerId ? 'Customer Chat' : 'Guest Chat'}
                </Text>
              </VStack>
            </HStack>
            <HStack spacing={isMobile ? 1 : 1}>
              <IconButton
                size={isMobile ? "sm" : "sm"}
                variant="ghost"
                aria-label="Minimize"
                icon={<MinimizeIcon size={isMobile ? 16 : 14} />}
                onClick={toggleMinimize}
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                width={isMobile ? "32px" : "28px"}
                height={isMobile ? "32px" : "28px"}
              />
              <IconButton
                size={isMobile ? "sm" : "sm"}
                variant="ghost"
                aria-label="Close"
                icon={<XIcon size={isMobile ? 16 : 14} />}
                onClick={toggleChat}
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                width={isMobile ? "32px" : "28px"}
                height={isMobile ? "32px" : "28px"}
              />
            </HStack>
          </HStack>

          {/* Messages */}
          <VStack
            flex={1}
            p={isMobile ? 3 : 2}
            spacing={0}
            overflowY="auto"
            align="stretch"
            css={{
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: useColorModeValue('#CBD5E0', '#4A5568'),
                borderRadius: '2px',
              },
            }}
          >
            {isLoading ? (
              <Box textAlign="center" py={8}>
                <Spinner size={isMobile ? "xl" : "lg"} />
                <Text mt={2} fontSize={isMobile ? "md" : "sm"} color="gray.500">
                  Loading messages...
                </Text>
              </Box>
            ) : messages.length === 0 ? (
              <Box textAlign="center" py={8}>
                <MessageCircleIcon size={isMobile ? 64 : 48} color="#666" />
                <Text mt={2} fontSize={isMobile ? "md" : "sm"} color="gray.500">
                  Start a conversation with our support team
                </Text>
              </Box>
            ) : (
              messages.map((message) => (
                <Box
                  key={message.id}
                  alignSelf={message.senderId === 'user' ? 'flex-end' : 'flex-start'}
                  maxW={isMobile ? "85%" : "80%"}
                  mb={isMobile ? 3 : 2}
                  px={1}
                >
                  {/* Sender name for other messages */}
                  {message.senderId !== 'user' && (
                    <Text
                      fontSize="xs"
                      color={secondaryTextColor}
                      mb={1}
                      ml={1}
                      fontWeight="medium"
                    >
                      Support Team
                    </Text>
                  )}
                  
                  <Box
                    bg={message.senderId === 'user' ? messageBg : otherMessageBg}
                    p={isMobile ? 3 : 2}
                    borderRadius="16px"
                    position="relative"
                    opacity={message.isPending ? 0.7 : 1}
                    boxShadow="0 1px 3px rgba(0,0,0,0.1)"
                    border="1px solid"
                    borderColor={message.senderId === 'user' ? 'transparent' : useColorModeValue('gray.200', 'gray.600')}
                  >
                    <Text 
                      fontSize={isMobile ? "sm" : "sm"} 
                      lineHeight="1.5"
                      color={message.senderId === 'user' ? "white" : textColor}
                      fontWeight="normal"
                      wordBreak="break-word"
                    >
                      {message.content}
                    </Text>
                    {message.isPending && (
                      <Text fontSize="xs" color={message.senderId === 'user' ? "white" : secondaryTextColor} mt={1} opacity={0.8}>
                        (Sending...)
                      </Text>
                    )}
                    <Text 
                      fontSize="xs" 
                      color={message.senderId === 'user' ? "white" : secondaryTextColor} 
                      mt={1}
                      opacity={0.8}
                      textAlign={message.senderId === 'user' ? "right" : "left"}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </Box>
                </Box>
              ))
            )}
            
            {typing && (
              <Box alignSelf="flex-start" maxW={isMobile ? "85%" : "80%"} mb={isMobile ? 3 : 2} px={1}>
                <Text
                  fontSize="xs"
                  color={secondaryTextColor}
                  mb={1}
                  ml={1}
                  fontWeight="medium"
                >
                  Support Team
                </Text>
                <Box bg={otherMessageBg} p={isMobile ? 3 : 2} borderRadius="16px" border="1px solid" borderColor={useColorModeValue('gray.200', 'gray.600')}>
                  <HStack spacing={isMobile ? 2 : 1}>
                    <Spinner size={isMobile ? "xs" : "xs"} />
                    <Text fontSize={isMobile ? "sm" : "sm"} color={secondaryTextColor}>
                      Support is typing...
                    </Text>
                  </HStack>
                </Box>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </VStack>

          {/* Input */}
          <Box p={isMobile ? 3 : 2} borderTop="1px solid" borderColor={borderColor}>
            <HStack spacing={isMobile ? 2 : 1} align="center">
              <Box flex={1} position="relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  size={isMobile ? "md" : "sm"}
                  disabled={isSending}
                  suppressHydrationWarning
                  height={isMobile ? "44px" : "36px"}
                  fontSize={isMobile ? "sm" : "sm"}
                  borderRadius="22px"
                  bg={useColorModeValue('white', 'gray.800')}
                  border="1px solid"
                  borderColor={useColorModeValue('gray.300', 'gray.600')}
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                  }}
                  _placeholder={{
                    color: secondaryTextColor,
                  }}
                  pr="8"
                  sx={{
                    '&::placeholder': {
                      fontSize: 'sm',
                    }
                  }}
                />
              </Box>
              <Button
                size={isMobile ? "md" : "sm"}
                colorScheme="blue"
                onClick={sendMessage}
                disabled={!newMessage.trim() || isSending}
                isLoading={isSending}
                width={isMobile ? "44px" : "36px"}
                height={isMobile ? "44px" : "36px"}
                borderRadius="full"
                boxShadow="0 1px 3px rgba(59, 130, 246, 0.2)"
                _hover={{
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 6px rgba(59, 130, 246, 0.3)",
                }}
                _active={{
                  transform: "translateY(0)",
                }}
                _disabled={{
                  opacity: 0.5,
                  cursor: "not-allowed",
                  transform: "none",
                }}
                transition="all 0.2s"
              >
                <SendIcon size={isMobile ? 16 : 14} />
              </Button>
            </HStack>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
