'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Divider,
  useColorModeValue,
  Spinner,
  useToast,
  IconButton,
  Tooltip,
  Flex,
  Select,
  Input,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react';
import { 
  MessageCircleIcon, 
  UserIcon, 
  TruckIcon, 
  ShieldIcon,
  SearchIcon,
  FilterIcon,
  XIcon,
  CheckCircleIcon,
  ClockIcon
} from 'lucide-react';
import ChatSessionList from './ChatSessionList';
import ChatInterface from './ChatInterface';

interface AdminChatDashboardProps {
  currentUserId: string;
}

export default function AdminChatDashboard({ currentUserId }: AdminChatDashboardProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const handleCloseChat = () => {
    setSelectedSessionId(null);
  };

  const handleMinimizeChat = () => {
    setIsMinimized(!isMinimized);
  };

  const getFilterOptions = () => [
    { value: 'all', label: 'All Conversations' },
    { value: 'guest_admin', label: 'Guest Support' },
    { value: 'customer_admin', label: 'Customer Support' },
    { value: 'driver_admin', label: 'Driver Support' },
    { value: 'customer_driver', label: 'Customer-Driver' },
    { value: 'support', label: 'General Support' }
  ];

  const getFilterIcon = (type: string) => {
    switch (type) {
      case 'guest_admin':
        return <UserIcon size={16} />;
      case 'customer_admin':
      case 'driver_admin':
        return <ShieldIcon size={16} />;
      case 'customer_driver':
        return <TruckIcon size={16} />;
      case 'support':
        return <MessageCircleIcon size={16} />;
      default:
        return <MessageCircleIcon size={16} />;
    }
  };

  return (
    <Box p={6} bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold">
                Chat Dashboard
              </Text>
              <Text fontSize="sm" color="gray.500">
                Manage customer and driver conversations
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Badge colorScheme="blue" size="lg">
                Admin Panel
              </Badge>
            </HStack>
          </HStack>
        </Box>

        {/* Filters and Search */}
        <Box bg={bgColor} p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
          <Grid templateColumns="1fr 1fr 1fr" gap={4}>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Filter by Type
              </Text>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                size="sm"
                suppressHydrationWarning
              >
                {getFilterOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Box>
            
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Search Conversations
              </Text>
              <InputGroup size="sm">
                <InputLeftElement>
                  <SearchIcon size={16} />
                </InputLeftElement>
                <Input
                  placeholder="Search by name, email, or message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Quick Actions
              </Text>
              <HStack spacing={2}>
                <Button size="sm" variant="outline" leftIcon={<FilterIcon size={16} />}>
                  Filters
                </Button>
                <Button size="sm" variant="outline" leftIcon={<ClockIcon size={16} />}>
                  Recent
                </Button>
              </HStack>
            </Box>
          </Grid>
        </Box>

        {/* Main Content */}
        <Grid templateColumns="400px 1fr" gap={6} flex={1}>
          {/* Chat Sessions List */}
          <GridItem>
            <Box bg={bgColor} borderRadius="lg" border="1px solid" borderColor={borderColor} overflow="hidden">
              <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
                <HStack justify="space-between" align="center">
                  <Text fontWeight="medium">Conversations</Text>
                  <Badge colorScheme="green" size="sm">
                    Active
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
                  onClose={handleCloseChat}
                  isMinimized={isMinimized}
                  onMinimize={handleMinimizeChat}
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
                <Text fontSize="sm" color="gray.500" maxW="300px">
                  Choose a conversation from the list to start chatting with customers or drivers
                </Text>
              </Box>
            )}
          </GridItem>
        </Grid>

        {/* Statistics */}
        <Box bg={bgColor} p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
          <Text fontSize="sm" fontWeight="medium" mb={3}>
            Chat Statistics
          </Text>
          <Grid templateColumns="repeat(4, 1fr)" gap={4}>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                12
              </Text>
              <Text fontSize="sm" color="gray.500">
                Active Chats
              </Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                8
              </Text>
              <Text fontSize="sm" color="gray.500">
                Resolved Today
              </Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                3
              </Text>
              <Text fontSize="sm" color="gray.500">
                Pending
              </Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                95%
              </Text>
              <Text fontSize="sm" color="gray.500">
                Satisfaction
              </Text>
            </Box>
          </Grid>
        </Box>
      </VStack>
    </Box>
  );
}
