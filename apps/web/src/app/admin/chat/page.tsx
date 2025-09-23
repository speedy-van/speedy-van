'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Input,
  Button,
  Avatar,
  Badge,
  Flex,
  Divider,
  Textarea,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Grid,
} from '@chakra-ui/react';
import {
  FiMessageSquare,
  FiSend,
  FiUsers,
  FiUser,
  FiClock,
  FiCheck,
  FiX,
  FiEye,
  FiShield,
  FiTruck,
} from 'react-icons/fi';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface ChatConversation {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }>;
  lastMessage: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/admin/chat/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      } else {
        throw new Error('Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat conversations',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/admin/chat/conversations/${conversationId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleConversationSelect = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const response = await fetch(`/api/admin/chat/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        await fetchConversations(); // Refresh conversation list
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSending(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'driver':
        return 'blue';
      case 'customer':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return FiShield;
      case 'driver':
        return FiTruck;
      case 'customer':
        return FiUser;
      default:
        return FiUser;
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" />
        </Flex>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Chat Support</Heading>
            <Text color="text.secondary">
              Manage customer and driver communications
            </Text>
          </VStack>
        </Flex>

        <Grid templateColumns="1fr 2fr" gap={6} minH="600px">
          {/* Conversations List */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">Conversations</Heading>
                  <Badge colorScheme="blue">
                    {conversations.length} total
                  </Badge>
                </HStack>

                <VStack spacing={2} align="stretch" maxH="500px" overflowY="auto">
                  {conversations.map(conversation => (
                    <Card
                      key={conversation.id}
                      cursor="pointer"
                      onClick={() => handleConversationSelect(conversation)}
                      bg={selectedConversation?.id === conversation.id ? 'blue.50' : 'white'}
                      _hover={{ bg: 'gray.50' }}
                    >
                      <CardBody p={3}>
                        <VStack align="start" spacing={2}>
                          <HStack justify="space-between" w="full">
                            <HStack>
                              <Avatar size="sm" name={conversation.participants[0]?.name} />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="medium" fontSize="sm">
                                  {conversation.participants.map(p => p.name).join(', ')}
                                </Text>
                                <HStack>
                                  {conversation.participants.map((participant, index) => (
                                    <Badge key={index} size="sm" colorScheme={getRoleColor(participant.role)}>
                                      {participant.role}
                                    </Badge>
                                  ))}
                                </HStack>
                              </VStack>
                            </HStack>
                            {conversation.unreadCount > 0 && (
                              <Badge colorScheme="red" borderRadius="full">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </HStack>

                          <Text fontSize="sm" color="text.secondary" noOfLines={1}>
                            {conversation.lastMessage.message}
                          </Text>

                          <Text fontSize="xs" color="text.tertiary">
                            {new Date(conversation.updatedAt).toLocaleString()}
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}

                  {conversations.length === 0 && (
                    <VStack spacing={4} py={8}>
                      <Icon as={FiMessageSquare} size="48px" color="text.tertiary" />
                      <Text color="text.secondary">No conversations yet</Text>
                    </VStack>
                  )}
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Chat Area */}
          <Card>
            <CardBody>
              {selectedConversation ? (
                <VStack spacing={4} align="stretch" h="full">
                  {/* Chat Header */}
                  <HStack justify="space-between" pb={2} borderBottom="1px" borderColor="gray.200">
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Avatar size="sm" name={selectedConversation.participants[0]?.name} />
                        <Heading size="md">
                          {selectedConversation.participants.map(p => p.name).join(', ')}
                        </Heading>
                      </HStack>
                      <HStack>
                        {selectedConversation.participants.map((participant, index) => (
                          <Badge key={index} size="sm" colorScheme={getRoleColor(participant.role)}>
                            <Icon as={getRoleIcon(participant.role)} mr={1} />
                            {participant.role}
                          </Badge>
                        ))}
                      </HStack>
                    </VStack>
                  </HStack>

                  {/* Messages */}
                  <VStack
                    spacing={3}
                    align="stretch"
                    flex={1}
                    maxH="400px"
                    overflowY="auto"
                    p={2}
                  >
                    {messages.map(message => (
                      <HStack
                        key={message.id}
                        justify={message.senderRole === 'admin' ? 'flex-end' : 'flex-start'}
                        align="start"
                        spacing={2}
                      >
                        {message.senderRole !== 'admin' && (
                          <Avatar size="sm" name={message.senderName} />
                        )}

                        <VStack
                          align={message.senderRole === 'admin' ? 'flex-end' : 'flex-start'}
                          spacing={1}
                          maxW="70%"
                        >
                          <Card
                            bg={message.senderRole === 'admin' ? 'blue.500' : 'gray.100'}
                            color={message.senderRole === 'admin' ? 'white' : 'black'}
                          >
                            <CardBody p={3}>
                              <Text fontSize="sm">{message.message}</Text>
                            </CardBody>
                          </Card>

                          <HStack spacing={1}>
                            <Text fontSize="xs" color="text.tertiary">
                              {message.senderName}
                            </Text>
                            <Text fontSize="xs" color="text.tertiary">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </Text>
                            {message.read && (
                              <Icon as={FiCheck} size="12px" color="green.500" />
                            )}
                          </HStack>
                        </VStack>

                        {message.senderRole === 'admin' && (
                          <Avatar size="sm" name={message.senderName} />
                        )}
                      </HStack>
                    ))}

                    {messages.length === 0 && (
                      <VStack spacing={4} py={8}>
                        <Icon as={FiMessageSquare} size="48px" color="text.tertiary" />
                        <Text color="text.secondary">No messages in this conversation</Text>
                      </VStack>
                    )}
                  </VStack>

                  {/* Message Input */}
                  <HStack spacing={2}>
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyPress={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      resize="none"
                      rows={2}
                    />
                    <Button
                      leftIcon={<FiSend />}
                      colorScheme="blue"
                      onClick={handleSendMessage}
                      isLoading={sending}
                      loadingText="Sending..."
                      disabled={!newMessage.trim()}
                    >
                      Send
                    </Button>
                  </HStack>
                </VStack>
              ) : (
                <VStack spacing={6} justify="center" minH="400px">
                  <Icon as={FiMessageSquare} size="64px" color="text.tertiary" />
                  <VStack spacing={2}>
                    <Heading size="md" color="text.secondary">
                      Select a conversation
                    </Heading>
                    <Text color="text.tertiary" textAlign="center">
                      Choose a conversation from the list to start chatting
                    </Text>
                  </VStack>
                </VStack>
              )}
            </CardBody>
          </Card>
        </Grid>
      </VStack>
    </Box>
  );
}
