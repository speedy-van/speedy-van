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
  const { toasts, addToast, dismissToast } = useToasts();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const contentBg = useColorModeValue('gray.50', 'gray.900');

  // Monitor online status
  useEffect(() => {
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
  }, [addToast]);

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

  return (
    <MotionFlex 
      h="100vh" 
      overflow="hidden"
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
                <Text fontSize="lg" fontWeight="semibold">
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text fontSize="sm" color="gray.500">
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
                  color={isOnline ? 'green.500' : 'red.500'}
                  boxSize={4}
                />
                <Text fontSize="xs" color={isOnline ? 'green.500' : 'red.500'}>
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
                >
                  <HStack spacing={2}>
                    <Avatar
                      size="sm"
                      name={session?.user?.name || 'User'}
                      src={undefined}
                    />
                    {!isSidebarCollapsed && (
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium">
                          {session?.user?.name || 'Admin User'}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {session?.user?.email || 'admin@example.com'}
                        </Text>
                      </VStack>
                    )}
                  </HStack>
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<Icon as={FiUser} />}>
                    Profile
                  </MenuItem>
                  <MenuItem icon={<Icon as={FiSettings} />}>
                    Settings
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem icon={<Icon as={FiLogOut} />} onClick={handleSignOut}>
                    Sign out
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
        </Box>

        {/* Content area */}
        <MotionBox
          flex={1}
          bg={contentBg}
          overflow="auto"
          p={6}
          variants={getMotionVariants(motionVariants.fadeInUp)}
          initial="initial"
          animate="animate"
        >
          {children}
        </MotionBox>
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
