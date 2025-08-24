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

import { AdminSidebar } from './AdminSidebar';
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
      addToast(toastUtils.success('Connection restored', 'You are back online'));
    };

    const handleOffline = () => {
      setIsOnline(false);
      addToast(toastUtils.warning('Connection lost', 'Please check your internet connection'));
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
          borderRight="1px solid"
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
            borderBottom="1px solid"
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
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

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
          borderBottom="1px solid"
          borderColor={borderColor}
          px={6}
          py={3}
          position="sticky"
          top={0}
          zIndex={10}
        >
          <Flex align="center" gap={4}>
            {/* Left side - Title and breadcrumb */}
            <VStack align="start" spacing={0}>
              {title && (
                <Text fontSize="lg" fontWeight="semibold" color="text.primary">
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text fontSize="sm" color="text.tertiary">
                  {subtitle}
                </Text>
              )}
            </VStack>

            <Spacer />

            {/* Center - Global search */}
            <Box w="400px">
              <GlobalSearch />
            </Box>

            <Spacer />

            {/* Right side - Actions and user menu */}
            <HStack spacing={3}>
              {/* Connection status */}
              <HStack spacing={1}>
                <Icon
                  as={isOnline ? FiWifi : FiWifiOff}
                  color={isOnline ? 'success.500' : 'error.500'}
                  boxSize={4}
                />
                <Text fontSize="xs" color={isOnline ? 'success.500' : 'error.500'}>
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </HStack>

              {/* Notifications */}
              <IconButton
                size="sm"
                variant="ghost"
                icon={<Icon as={FiBell} />}
                aria-label="Notifications"
                position="relative"
                color="text.secondary"
                _hover={{ bg: 'bg.surface.hover', color: 'text.primary' }}
              >
                <Badge
                  position="absolute"
                  top={1}
                  right={1}
                  size="sm"
                  colorScheme="red"
                  borderRadius="full"
                >
                  3
                </Badge>
              </IconButton>

              {/* Create button */}
              {showCreateButton && (
                <Button
                  size="sm"
                  leftIcon={<Icon as={FiPlus} />}
                  onClick={handleCreateClick}
                  variant="primary"
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
                  size="sm"
                  px={2}
                  py={1}
                  color="text.secondary"
                  _hover={{ bg: 'bg.surface.hover', color: 'text.primary' }}
                >
                  <HStack spacing={2}>
                    <Avatar
                      size="sm"
                      name={session?.user?.name || 'User'}
                      src={undefined}
                      bg="neon.500"
                      color="dark.900"
                    />
                    {!isSidebarCollapsed && (
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium" color="text.primary">
                          {session?.user?.name || 'Admin User'}
                        </Text>
                        <Text fontSize="xs" color="text.tertiary">
                          {session?.user?.email || 'admin@example.com'}
                        </Text>
                      </VStack>
                    )}
                  </HStack>
                </MenuButton>
                <MenuList bg="bg.surface" borderColor="border.primary">
                  <MenuItem icon={<Icon as={FiUser} />} color="text.secondary" _hover={{ bg: 'bg.surface.hover', color: 'text.primary' }}>
                    Profile
                  </MenuItem>
                  <MenuItem icon={<Icon as={FiSettings} />} color="text.secondary" _hover={{ bg: 'bg.surface.hover', color: 'text.primary' }}>
                    Settings
                  </MenuItem>
                  <MenuDivider borderColor="border.primary" />
                  <MenuItem icon={<Icon as={FiLogOut} />} onClick={handleSignOut} color="text.secondary" _hover={{ bg: 'bg.surface.hover', color: 'text.primary' }}>
                    Sign out
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
        </Box>

        {/* Content area */}
        <Box
          flex={1}
          overflow="auto"
          bg={contentBg}
          p={6}
        >
          {children}
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
