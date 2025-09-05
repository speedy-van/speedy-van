'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Box, Container, Spinner, Text, VStack } from '@chakra-ui/react';
import AdminChatDashboard from '@/components/Chat/AdminChatDashboard';

export default function AdminChatPage() {
  const { data: session, status } = useSession();

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
          <Text>Loading admin panel...</Text>
        </VStack>
      </Box>
    );
  }

  if (
    status === 'unauthenticated' ||
    (session?.user as any)?.role !== 'admin'
  ) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="100vh"
      >
        <VStack spacing={4}>
          <Text fontSize="xl" fontWeight="bold">
            Access Denied
          </Text>
          <Text>You must be an admin to access this page.</Text>
        </VStack>
      </Box>
    );
  }

  const currentUserId = (session?.user as any)?.id;

  return (
    <Container maxW="100%" p={0}>
      <AdminChatDashboard currentUserId={currentUserId} />
    </Container>
  );
}
