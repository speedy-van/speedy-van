'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Icon,
  IconButton,
  Badge,
  useColorModeValue,
  useDisclosure,
  Spacer,
  Divider,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { motionVariants, getMotionVariants } from '@/lib/motion';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  FiBell,
  FiSettings,
  FiLogOut,
  FiUser,
  FiPlus,
  FiWifi,
  FiWifiOff,
} from 'react-icons/fi';

import AdminNavigation from './AdminNavigation';
import { GlobalSearch } from './GlobalSearch';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { RealTimeToast, useToasts, toastUtils } from './RealTimeToast';

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

export function AdminShell({
  children,
  title,
  subtitle,
  actions,
  showCreateButton = false,
  onCreateClick,
}: AdminShellProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { toasts, addToast, dismissToast } = useToasts();

  // Use neon dark theme colors
  const bgColor = 'bg.surface';
  const borderColor = 'border.primary';
  const contentBg = 'bg.canvas';

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Monitor online status
  useEffect(() => {
    if (!mounted) return;

    const handleOnline = () => {
      setIsOnline(true);
      addToast(
        toastUtils.success('Connection restored', 'You are back online')
      );
    };

    const handleOffline = () => {
      setIsOnline(false);
      addToast(
        toastUtils.warning(
          'Connection lost',
          'Please check your internet connection'
        )
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addToast, mounted]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  const handleCreateClick = () => {
    if (onCreateClick) {
      onCreateClick();
    } else {
      router.push('/book');
    }
  };

  const MotionFlex = motion.create(Flex);
  const MotionBox = motion.create(Box);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Flex h="100vh" overflow="hidden" bg="bg.canvas">
        <Box
          bg={bgColor}
          borderRight="2px solid"
          borderColor={borderColor}
          h="100vh"
          position="sticky"
          top={0}
          left={0}
          zIndex={20}
          transition="width 0.2s"
          width="280px"
          overflow="hidden"
        />
        <Flex direction="column" flex={1} overflow="hidden">
          <Box
            bg={bgColor}
            borderBottom="2px solid"
            borderColor={borderColor}
            px={6}
            py={3}
            position="sticky"
            top={0}
            zIndex={10}
          />
          <Box flex={1} bg={contentBg} overflow="auto" p={6}>
            {children}
          </Box>
        </Flex>
      </Flex>
    );
  }

  return (
    <MotionFlex
      h="100vh"
      overflow="hidden"
      bg="bg.canvas"
      variants={getMotionVariants(motionVariants.fadeIn)}
      initial="initial"
      animate="animate"
    >
      {/* Sidebar */}
      <Box
        bg={bgColor}
        borderRight="2px solid"
        borderColor={borderColor}
        h="100vh"
        position="sticky"
        top={0}
        left={0}
        zIndex={20}
        transition="width 0.2s"
        width={isSidebarCollapsed ? '60px' : '280px'}
        overflow="hidden"
        boxShadow="xl"
      >
        <AdminNavigation isCollapsed={isSidebarCollapsed} />
      </Box>

      {/* Main content area */}
      <MotionFlex
        direction="column"
        flex={1}
        overflow="hidden"
        variants={getMotionVariants(motionVariants.fadeInLeft)}
        initial="initial"
        animate="animate"
      >
        {/* Topbar */}
        <Box
          bg={bgColor}
          borderBottom="2px solid"
          borderColor={borderColor}
          px={8}
          py={4}
          position="sticky"
          top={0}
          zIndex={10}
          boxShadow="lg"
        >
          <Flex align="center" gap={6}>
            {/* Left side - Title and breadcrumb */}
            <VStack align="start" spacing={1}>
              {title && (
                <Text fontSize="xl" fontWeight="bold" color="neon.500">
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text fontSize="md" color="text.tertiary">
                  {subtitle}
                </Text>
              )}
            </VStack>

            <Spacer />

            {/* Center - Global search */}
            <Box w="450px">
              <GlobalSearch />
            </Box>

            <Spacer />

            {/* Right side - Actions and user menu */}
            <HStack spacing={4}>
              {/* Connection status */}
              <HStack
                spacing={2}
                p={2}
                borderRadius="lg"
                bg={isOnline ? 'green.50' : 'red.50'}
                _dark={{ bg: isOnline ? 'green.900' : 'red.900' }}
                borderWidth="1px"
                borderColor={isOnline ? 'green.200' : 'red.200'}
              >
                <Icon
                  as={isOnline ? FiWifi : FiWifiOff}
                  color={isOnline ? 'success.500' : 'error.500'}
                  boxSize={4}
                />
                <Text
                  fontSize="xs"
                  color={isOnline ? 'success.500' : 'error.500'}
                  fontWeight="medium"
                >
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </HStack>

              {/* Notifications */}
              <IconButton
                size="md"
                variant="ghost"
                icon={<Icon as={FiBell} />}
                aria-label="Notifications"
                position="relative"
                color="text.secondary"
                _hover={{ bg: 'bg.surface.hover', color: 'neon.400' }}
                borderRadius="lg"
                transition="all 0.2s"
              >
                <Box
                  position="absolute"
                  top={1}
                  sx={{ right: '4px' }}
                >
                  <Badge
                    size="sm"
                    colorScheme="red"
                    borderRadius="full"
                    boxShadow="0 2px 8px rgba(239,68,68,0.3)"
                  >
                    3
                  </Badge>
                </Box>
              </IconButton>

              {/* Create button */}
              {showCreateButton && (
                <Button
                  size="md"
                  leftIcon={<Icon as={FiPlus} />}
                  onClick={handleCreateClick}
                  variant="primary"
                  bg="linear-gradient(135deg, #00C2FF, #00D18F)"
                  color="white"
                  _hover={{
                    bg: 'linear-gradient(135deg, #00D18F, #00C2FF)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 25px rgba(0,194,255,0.3)',
                  }}
                  _active={{
                    bg: 'linear-gradient(135deg, #00B8E6, #00C2FF)',
                  }}
                  transition="all 0.3s ease"
                  borderRadius="xl"
                >
                  Create
                </Button>
              )}

              {/* Custom actions */}
              {actions}

              {/* Keyboard shortcuts help */}
              <KeyboardShortcuts />

              {/* User menu */}
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  size="md"
                  px={3}
                  py={2}
                  color="text.secondary"
                  _hover={{ bg: 'bg.surface.hover', color: 'neon.400' }}
                  borderRadius="xl"
                  transition="all 0.2s"
                >
                  <HStack spacing={3}>
                    <Avatar
                      size="md"
                      name={session?.user?.name || 'User'}
                      src={undefined}
                      bg="neon.500"
                      color="dark.900"
                      boxShadow="0 4px 15px rgba(0,194,255,0.3)"
                    />
                    {!isSidebarCollapsed && (
                      <VStack align="start" spacing={0}>
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color="text.primary"
                        >
                          {session?.user?.name || 'Admin User'}
                        </Text>
                        <Text fontSize="xs" color="text.tertiary">
                          {session?.user?.email || 'admin@example.com'}
                        </Text>
                      </VStack>
                    )}
                  </HStack>
                </MenuButton>
                <MenuList
                  bg="bg.surface"
                  borderColor="border.primary"
                  borderWidth="2px"
                  borderRadius="xl"
                  boxShadow="xl"
                  py={2}
                >
                  <MenuItem
                    icon={<Icon as={FiUser} />}
                    color="text.secondary"
                    _hover={{ bg: 'bg.surface.hover', color: 'neon.400' }}
                    borderRadius="lg"
                    mx={2}
                    mb={1}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem
                    icon={<Icon as={FiSettings} />}
                    color="text.secondary"
                    _hover={{ bg: 'bg.surface.hover', color: 'neon.400' }}
                    borderRadius="lg"
                    mx={2}
                    mb={1}
                  >
                    Settings
                  </MenuItem>
                  <MenuDivider borderColor="border.primary" mx={2} />
                  <MenuItem
                    icon={<Icon as={FiLogOut} />}
                    onClick={handleSignOut}
                    color="text.secondary"
                    _hover={{ bg: 'bg.surface.hover', color: 'red.400' }}
                    borderRadius="lg"
                    mx={2}
                    mt={1}
                  >
                    Sign out
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
        </Box>

        {/* Content area */}
        <Box flex={1} overflow="auto" bg={contentBg} p={8} position="relative">
          {/* Background Pattern */}
          <Box
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            opacity={0.02}
            background="radial-gradient(circle at 20% 80%, rgba(0,194,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,209,143,0.1) 0%, transparent 50%)"
            pointerEvents="none"
          />
          <Box position="relative" zIndex={1}>
            {children}
          </Box>
        </Box>
      </MotionFlex>

      {/* Real-time toasts */}
      <RealTimeToast
        toasts={toasts}
        onDismiss={dismissToast}
        position="top-right"
        maxToasts={5}
      />
    </MotionFlex>
  );
}
