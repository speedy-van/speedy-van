'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

interface DriverData {
  id: string;
  status: string;
  onboardingStatus: string;
  // Add other driver fields as needed
}

interface DriverAuthGuardProps {
  children: React.ReactNode;
}

export default function DriverAuthGuard({ children }: DriverAuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [driverData, setDriverData] = useState<DriverData | null>(null);

  const fetchDriverData = async (userId: string) => {
    try {
      const response = await fetch(`/api/driver/profile?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setDriverData(data);
        setIsChecking(false);
      } else {
        console.error('Failed to fetch driver data');
        setIsChecking(false);
      }
    } catch (error) {
      console.error('Error fetching driver data:', error);
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      console.log('❌ Driver not authenticated, redirecting to login');
      router.replace('/driver/login');
      return;
    }

    if (session?.user && (session.user as any).role === 'driver') {
      console.log('✅ Driver authenticated:', { email: session.user.email, role: (session.user as any).role });
      
      // Fetch driver data
      if (!driverData) {
        fetchDriverData(session.user.id);
      } else {
        setIsChecking(false);
      }
    } else if (session?.user) {
      console.log('❌ User is not a driver:', { email: session.user.email, role: (session.user as any).role });
      router.replace('/');
    } else {
      console.log('❌ No session data');
      router.replace('/driver/login');
    }
  }, [session, status, router]);

  if (status === 'loading' || isChecking) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minH="100vh"
        bg="gray.50"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">Verifying driver access...</Text>
        </VStack>
      </Box>
    );
  }

  if (!session?.user || (session.user as any).role !== 'driver') {
    return null; // Will redirect
  }

  return <>{children}</>;
}
