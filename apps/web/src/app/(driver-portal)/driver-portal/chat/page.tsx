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
  Badge
} from '@chakra-ui/react';
import { MessageCircleIcon, PlusIcon, TruckIcon } from 'lucide-react';
import ChatSessionList from '@/components/Chat/ChatSessionList';
import ChatInterface from '@/components/Chat/ChatInterface';
import { useChat } from '@/hooks/useChat';

export default function DriverChatPage() {
  const { data: session, status } = useSession();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
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
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading chat...</Text>
        </VStack>
      </Box>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
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
      type: 'driver_admin',
      title: 'Driver Support'
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
                Driver Chat
              </Text>
              <Text fontSize="sm" color="gray.500">
                Communicate with customers and support staff
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Button
                leftIcon={<PlusIcon size={16} />}
                colorScheme="blue"
                onClick={handleStartSupportChat}
                isLoading={isLoading}
              >
                Contact Support
              </Button>
              <Badge colorScheme="orange" size="lg">
                Driver
              </Badge>
            </HStack>
          </HStack>
        </Box>

        {/* Error Display */}
        {error && (
          <Box p={4} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="lg">
            <Text color="red.600" fontSize="sm">
              Error: {error}
            </Text>
          </Box>
        )}

        {/* Main Content */}
        <Grid templateColumns="400px 1fr" gap={6} minH="600px">
          {/* Chat Sessions List */}
          <GridItem>
            <Box bg={bgColor} borderRadius="lg" border="1px solid" borderColor={borderColor} overflow="hidden">
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
              <Box bg={bgColor} borderRadius="lg" border="1px solid" borderColor={borderColor} overflow="hidden">
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
                <TruckIcon size={64} color="gray" />
                <Text fontSize="lg" fontWeight="medium" mt={4} mb={2}>
                  Select a Conversation
                </Text>
                <Text fontSize="sm" color="gray.500" maxW="300px" mb={4}>
                  Choose a conversation from the list to start chatting with customers or support staff
                </Text>
                <Button
                  leftIcon={<PlusIcon size={16} />}
                  colorScheme="blue"
                  onClick={handleStartSupportChat}
                  isLoading={isLoading}
                >
                  Contact Support
                </Button>
              </Box>
            )}
          </GridItem>
        </Grid>

        {/* Help Section */}
        <Box bg={bgColor} p={6} borderRadius="lg" border="1px solid" borderColor={borderColor}>
          <VStack spacing={4} align="start">
            <Text fontSize="lg" fontWeight="medium">
              Driver Chat Features
            </Text>
            <Text fontSize="sm" color="gray.600">
              • <strong>Customer Chat:</strong> Communicate directly with customers during active bookings
            </Text>
            <Text fontSize="sm" color="gray.600">
              • <strong>Support Chat:</strong> Get help from our driver support team for any issues
            </Text>
            <Text fontSize="sm" color="gray.600">
              • <strong>Real-time Updates:</strong> All messages are delivered instantly with typing indicators
            </Text>
            <Text fontSize="sm" color="gray.600">
              • <strong>Message History:</strong> All conversations are saved and accessible anytime
            </Text>
            <Text fontSize="sm" color="gray.600">
              • <strong>Booking Context:</strong> Chat sessions are linked to specific bookings for easy reference
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
