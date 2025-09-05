'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Button,
  Spinner,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { MessageCircleIcon, PlusIcon } from 'lucide-react';
import ChatSessionList from '@/components/Chat/ChatSessionList';
import ChatInterface from '@/components/Chat/ChatInterface';
import { useChat } from '@/hooks/useChat';

export default function CustomerChatPage() {
  const { data: session, status } = useSession();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [isMinimized, setIsMinimized] = useState(false);

  const {
    sessions,
    currentSession,
    messages,
    isLoading,
    isSending,
    typingUsers,
    error,
    sendMessage,
    createSession,
    closeSession,
    selectSession,
    handleTyping,
  } = useChat();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (status === 'loading') {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="100vh"
      >
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading chat...</Text>
        </VStack>
      </Box>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="100vh"
      >
        <VStack spacing={4}>
          <Text fontSize="xl" fontWeight="bold">
            Please Sign In
          </Text>
          <Text>You must be signed in to access your chat conversations.</Text>
        </VStack>
      </Box>
    );
  }

  const currentUserId = (session?.user as any)?.id;

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    selectSession(sessionId);
  };

  const handleStartSupportChat = async () => {
    const newSession = await createSession({
      type: 'customer_admin',
      title: 'Customer Support',
    });

    if (newSession) {
      setSelectedSessionId(newSession.id);
      selectSession(newSession.id);
    }
  };

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold">
                Chat Conversations
              </Text>
              <Text fontSize="sm" color="gray.500">
                Communicate with drivers and support staff
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Button
                leftIcon={<PlusIcon size={16} />}
                colorScheme="blue"
                onClick={handleStartSupportChat}
                isLoading={isLoading}
              >
                Start Support Chat
              </Button>
              <Badge colorScheme="blue" size="lg">
                Customer
              </Badge>
            </HStack>
          </HStack>
        </Box>

        {/* Error Display */}
        {error && (
          <Box
            p={4}
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
            borderRadius="lg"
          >
            <Text color="red.600" fontSize="sm">
              Error: {error}
            </Text>
          </Box>
        )}

        {/* Main Content */}
        <Grid templateColumns="400px 1fr" gap={6} minH="600px">
          {/* Chat Sessions List */}
          <GridItem>
            <Box
              bg={bgColor}
              borderRadius="lg"
              border="1px solid"
              borderColor={borderColor}
              overflow="hidden"
            >
              <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
                <HStack justify="space-between" align="center">
                  <Text fontWeight="medium">Your Conversations</Text>
                  <Badge colorScheme="green" size="sm">
                    {sessions.length} Active
                  </Badge>
                </HStack>
              </Box>
              <ChatSessionList
                currentUserId={currentUserId}
                onSessionSelect={handleSessionSelect}
                selectedSessionId={selectedSessionId || undefined}
              />
            </Box>
          </GridItem>

          {/* Chat Interface */}
          <GridItem>
            {selectedSessionId ? (
              <Box
                bg={bgColor}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                overflow="hidden"
              >
                <ChatInterface
                  sessionId={selectedSessionId}
                  currentUserId={currentUserId}
                  onClose={() => setSelectedSessionId(null)}
                  isMinimized={isMinimized}
                  onMinimize={() => setIsMinimized(!isMinimized)}
                />
              </Box>
            ) : (
              <Box
                bg={bgColor}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                p={8}
                textAlign="center"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minH="400px"
              >
                <MessageCircleIcon size={64} color="gray" />
                <Text fontSize="lg" fontWeight="medium" mt={4} mb={2}>
                  Select a Conversation
                </Text>
                <Text fontSize="sm" color="gray.500" maxW="300px" mb={4}>
                  Choose a conversation from the list to start chatting with
                  drivers or support staff
                </Text>
                <Button
                  leftIcon={<PlusIcon size={16} />}
                  colorScheme="blue"
                  onClick={handleStartSupportChat}
                  isLoading={isLoading}
                >
                  Start Support Chat
                </Button>
              </Box>
            )}
          </GridItem>
        </Grid>

        {/* Help Section */}
        <Box
          bg={bgColor}
          p={6}
          borderRadius="lg"
          border="1px solid"
          borderColor={borderColor}
        >
          <VStack spacing={4} align="start">
            <Text fontSize="lg" fontWeight="medium">
              Need Help?
            </Text>
            <Text fontSize="sm" color="gray.600">
              • <strong>Driver Chat:</strong> Communicate directly with your
              assigned driver during active bookings
            </Text>
            <Text fontSize="sm" color="gray.600">
              • <strong>Support Chat:</strong> Get help from our customer
              support team for any questions or issues
            </Text>
            <Text fontSize="sm" color="gray.600">
              • <strong>Real-time Updates:</strong> All messages are delivered
              instantly with typing indicators
            </Text>
            <Text fontSize="sm" color="gray.600">
              • <strong>Message History:</strong> All conversations are saved
              and accessible anytime
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
