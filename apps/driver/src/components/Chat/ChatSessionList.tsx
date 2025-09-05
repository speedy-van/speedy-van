'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Divider,
  useColorModeValue,
  Spinner,
  useToast,
  IconButton,
  Tooltip,
  Flex,
} from '@chakra-ui/react';
import {
  MessageCircleIcon,
  UserIcon,
  TruckIcon,
  ShieldIcon,
  ClockIcon,
  CheckCircleIcon,
} from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  type: string;
  status: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  metadata?: any;
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
  createdAt: string;
  updatedAt: string;
  participants: ChatParticipant[];
  messages: Message[];
  booking?: {
    id: string;
    reference: string;
    customerName: string;
    status: string;
  };
}

interface ChatSessionListProps {
  currentUserId: string;
  onSessionSelect: (sessionId: string) => void;
  selectedSessionId?: string;
}

export default function ChatSessionList({
  currentUserId,
  onSessionSelect,
  selectedSessionId,
}: ChatSessionListProps) {
  // All hooks must be called at the top level, in the same order every time
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // All useColorModeValue hooks must be called unconditionally
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const inactiveColor = useColorModeValue('gray.400', 'gray.500');
  const avatarBg = useColorModeValue('gray.100', 'gray.600');
  const avatarColor = useColorModeValue('gray.600', 'gray.300');

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'customer_driver':
        return <TruckIcon size={16} />;
      case 'customer_admin':
      case 'driver_admin':
        return <ShieldIcon size={16} />;
      case 'guest_admin':
        return <UserIcon size={16} />;
      case 'support':
        return <MessageCircleIcon size={16} />;
      default:
        return <MessageCircleIcon size={16} />;
    }
  };

  const getSessionTitle = (session: ChatSession) => {
    if (session.title) return session.title;

    const otherParticipants = session.participants.filter(
      p => p.userId !== currentUserId
    );

    switch (session.type) {
      case 'customer_driver':
        if (session.booking) {
          return `Booking ${session.booking.reference}`;
        }
        return 'Customer-Driver Chat';
      case 'customer_admin':
        return 'Customer Support';
      case 'driver_admin':
        return 'Driver Support';
      case 'guest_admin':
        const guest = otherParticipants.find(p => p.role === 'guest');
        return guest?.guestName || 'Guest Support';
      case 'support':
        return 'Support Chat';
      default:
        return 'Chat';
    }
  };

  const getSessionSubtitle = (session: ChatSession) => {
    const otherParticipants = session.participants.filter(
      p => p.userId !== currentUserId
    );

    switch (session.type) {
      case 'customer_driver':
        if (session.booking) {
          return `${session.booking.customerName} • ${session.booking.status}`;
        }
        return 'Booking-related chat';
      case 'customer_admin':
      case 'driver_admin':
        const admin = otherParticipants.find(p => p.role === 'admin');
        return admin?.user?.name || 'Admin Support';
      case 'guest_admin':
        const guest = otherParticipants.find(p => p.role === 'guest');
        return guest?.guestEmail || 'Guest user';
      case 'support':
        return 'Support conversation';
      default:
        return 'Chat conversation';
    }
  };

  const getLastMessage = (session: ChatSession) => {
    if (session.messages.length === 0) {
      return 'No messages yet';
    }

    const lastMessage = session.messages[0];
    let senderName = lastMessage.sender.name || lastMessage.sender.email;
    let isOwnMessage = lastMessage.sender.id === currentUserId;

    // Handle guest messages
    if (lastMessage.metadata?.isGuestMessage) {
      senderName = lastMessage.metadata.guestName || 'Guest';
      // Check if current user is a guest participant
      isOwnMessage = session.participants.some(
        p => p.guestEmail && p.guestEmail === lastMessage.metadata.guestEmail
      );
    }

    return `${isOwnMessage ? 'You' : senderName}: ${lastMessage.content}`;
  };

  const getUnreadCount = (session: ChatSession) => {
    const participant = session.participants.find(
      p => p.userId === currentUserId
    );
    if (!participant?.lastReadAt) {
      return session.messages.length;
    }

    const lastReadTime = new Date(participant.lastReadAt);
    return session.messages.filter(
      msg => new Date(msg.createdAt) > lastReadTime
    ).length;
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return format(date, 'MMM d');
    }
  };

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/chat/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else {
        throw new Error('Failed to load sessions');
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat sessions',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner />
        <Text mt={2} fontSize="sm" color="gray.500">
          Loading conversations...
        </Text>
      </Box>
    );
  }

  if (sessions.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <MessageCircleIcon size={48} color="gray" />
        <Text mt={2} fontSize="sm" color="gray.500">
          No conversations yet
        </Text>
        <Text fontSize="xs" color="gray.400">
          Start a conversation to begin chatting
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={0} align="stretch" maxH="600px" overflowY="auto">
      {sessions.map((session, index) => {
        const isSelected = session.id === selectedSessionId;
        const unreadCount = getUnreadCount(session);

        return (
          <React.Fragment key={session.id}>
            <Box
              p={4}
              cursor="pointer"
              bg={isSelected ? selectedBg : 'transparent'}
              _hover={{ bg: isSelected ? selectedBg : hoverBg }}
              onClick={() => onSessionSelect(session.id)}
              borderLeft={isSelected ? '3px solid' : 'none'}
              borderLeftColor={isSelected ? 'blue.500' : 'transparent'}
            >
              <HStack spacing={3} align="start">
                <Avatar
                  size="sm"
                  icon={getSessionIcon(session.type)}
                  bg={avatarBg}
                  color={avatarColor}
                />

                <Box flex={1} minW={0}>
                  <HStack justify="space-between" align="start" mb={1}>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      noOfLines={1}
                      color={unreadCount > 0 ? 'black' : 'gray.600'}
                    >
                      {getSessionTitle(session)}
                    </Text>
                    <HStack spacing={1}>
                      {unreadCount > 0 && (
                        <Badge colorScheme="blue" size="sm" borderRadius="full">
                          {unreadCount}
                        </Badge>
                      )}
                      <Text fontSize="xs" color="gray.400">
                        {formatLastActivity(session.updatedAt)}
                      </Text>
                    </HStack>
                  </HStack>

                  <Text fontSize="xs" color="gray.500" noOfLines={1} mb={1}>
                    {getSessionSubtitle(session)}
                  </Text>

                  <Text
                    fontSize="xs"
                    color={unreadCount > 0 ? 'gray.700' : 'gray.400'}
                    noOfLines={1}
                    fontWeight={unreadCount > 0 ? 'medium' : 'normal'}
                  >
                    {getLastMessage(session)}
                  </Text>
                </Box>
              </HStack>
            </Box>

            {index < sessions.length - 1 && (
              <Divider borderColor={borderColor} />
            )}
          </React.Fragment>
        );
      })}
    </VStack>
  );
}
