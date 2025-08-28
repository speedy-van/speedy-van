'use client';

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Flex,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  Icon,
  Divider
} from '@chakra-ui/react';
import { FaUser, FaTruck, FaSignOutAlt, FaHome, FaCog } from 'react-icons/fa';
import { signOut, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

interface CustomerPortalLayoutProps {
  children: React.ReactNode;
}

export default function CustomerPortalLayout({ children }: CustomerPortalLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  if (!session?.user) {
    return <Box>{children}</Box>;
  }

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Header */}
      <Box
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
        px={6}
        py={4}
        shadow="sm"
      >
        <Flex justify="space-between" align="center" maxW="7xl" mx="auto">
          {/* Logo and Navigation */}
          <HStack spacing={8}>
            <HStack
              cursor="pointer"
              onClick={handleGoHome}
              _hover={{ opacity: 0.8 }}
            >
              <Icon as={FaTruck} color="blue.500" boxSize={6} />
              <Text fontSize="xl" fontWeight="bold" color="blue.600">
                Speedy Van
              </Text>
            </HStack>

            <HStack spacing={6}>
              <Button
                variant="ghost"
                leftIcon={<FaHome />}
                onClick={handleGoHome}
                size="sm"
              >
                Home
              </Button>
              <Button
                variant="ghost"
                leftIcon={<FaTruck />}
                onClick={handleGoToDashboard}
                size="sm"
                colorScheme={pathname === '/dashboard' ? 'blue' : 'gray'}
              >
                My Bookings
              </Button>
            </HStack>
          </HStack>

          {/* User Menu */}
          <HStack spacing={4}>
            <Text fontSize="sm" color="gray.600">
              Welcome, {session.user.name}
            </Text>
            
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                size="sm"
                leftIcon={<FaUser />}
                rightIcon={<Icon as={FaCog} boxSize={3} />}
              >
                Account
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FaUser />} onClick={handleGoToDashboard}>
                  My Bookings
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<FaSignOutAlt />} onClick={handleSignOut}>
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box maxW="7xl" mx="auto" px={6} py={8}>
        {children}
      </Box>
    </Box>
  );
}
