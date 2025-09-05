'use client';

import React from 'react';
import {
  Box,
  Container,
  Flex,
  HStack,
  Spacer,
  Avatar,
  Text,
  Link as ChakraLink,
  Icon,
  Badge,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useSession } from 'next-auth/react';
import NotificationBell from '@/components/Driver/NotificationBell';
import DriverSignOutButton from '@/components/Driver/DriverSignOutButton';
import HeaderButton from '@/components/common/HeaderButton';
import {
  FaTruck,
  FaHome,
  FaBriefcase,
  FaCalendarAlt,
  FaPoundSign,
  FaCog,
  FaFileAlt,
  FaBell,
  FaUser,
} from 'react-icons/fa';

interface DriverHeaderProps {
  driverId?: string;
  sessionUserName?: string | null;
  sessionUserEmail?: string | null;
}

export default function DriverHeader({
  driverId,
  sessionUserName,
  sessionUserEmail,
}: DriverHeaderProps) {
  const { data: session } = useSession();

  // Use session data if available, fallback to props
  const userName = session?.user?.name || sessionUserName || 'Driver';
  const userEmail = session?.user?.email || sessionUserEmail || '';
  const userId = session?.user?.id || driverId;

  const headerBg = useColorModeValue('rgba(13,13,13,0.95)', 'rgba(0,0,0,0.95)');

  return (
    <Box
      as="header"
      data-glass="topbar"
      position="sticky"
      top="0"
      zIndex={20}
      bg={headerBg}
      backdropFilter="saturate(140%) blur(12px)"
      borderBottom="2px solid"
      borderColor="neon.400"
      h="72px"
      className="safe-area-top"
      boxShadow="0 4px 20px rgba(0,194,255,0.1)"
      sx={{
        // Prevent overlay from covering the whole page in prod
        '&[data-glass="topbar"]': {
          WebkitBackdropFilter: 'saturate(140%) blur(12px)',
          pointerEvents: 'auto',
        },
      }}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          'linear-gradient(90deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      <Container maxW="7xl" h="full">
        <Flex align="center" justify="space-between" h="full">
          {/* Logo Section */}
          <HStack align="center" gap={3}>
            <NextLink href="/driver">
              <Box
                p={2}
                borderRadius="xl"
                bg="rgba(0,194,255,0.1)"
                borderWidth="1px"
                borderColor="neon.400"
                _hover={{
                  bg: 'rgba(0,194,255,0.2)',
                  transform: 'scale(1.05)',
                }}
                transition="all 0.2s"
              >
                <img
                  src="/logo/speedy-van-logo-dark.svg"
                  alt="Speedy Van Driver"
                  width="120"
                  height="40"
                  style={{ height: '40px', width: 'auto' }}
                />
              </Box>
            </NextLink>
            <Badge
              colorScheme="neon"
              variant="solid"
              size="sm"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="semibold"
              boxShadow="0 2px 8px rgba(0,194,255,0.3)"
            >
              <Icon as={FaTruck} mr={1} />
              DRIVER PORTAL
            </Badge>
          </HStack>

          {/* Desktop Navigation */}
          <HStack as="nav" spacing={8} display={{ base: 'none', lg: 'flex' }}>
            <ChakraLink
              as={NextLink}
              href="/driver"
              color="white"
              fontWeight="medium"
              _hover={{
                color: 'neon.400',
                transform: 'translateY(-1px)',
              }}
              transition="all 0.2s"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Icon as={FaHome} boxSize={4} />
              Dashboard
            </ChakraLink>
            <ChakraLink
              as={NextLink}
              href="/driver/jobs"
              color="white"
              fontWeight="medium"
              _hover={{
                color: 'neon.400',
                transform: 'translateY(-1px)',
              }}
              transition="all 0.2s"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Icon as={FaBriefcase} boxSize={4} />
              Jobs
            </ChakraLink>
            <ChakraLink
              as={NextLink}
              href="/driver/jobs/available"
              color="white"
              fontWeight="medium"
              _hover={{
                color: 'neon.400',
                transform: 'translateY(-1px)',
              }}
              transition="all 0.2s"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Icon as={FaBriefcase} boxSize={4} />
              Available Jobs
            </ChakraLink>
            <ChakraLink
              as={NextLink}
              href="/driver/jobs/active"
              color="white"
              fontWeight="medium"
              _hover={{
                color: 'neon.400',
                transform: 'translateY(-1px)',
              }}
              transition="all 0.2s"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Icon as={FaBriefcase} boxSize={4} />
              Active Jobs
            </ChakraLink>
            <ChakraLink
              as={NextLink}
              href="/driver/schedule"
              color="white"
              fontWeight="medium"
              _hover={{
                color: 'neon.400',
                transform: 'translateY(-1px)',
              }}
              transition="all 0.2s"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Icon as={FaCalendarAlt} boxSize={4} />
              Schedule
            </ChakraLink>
            <ChakraLink
              as={NextLink}
              href="/driver/earnings"
              color="white"
              fontWeight="medium"
              _hover={{
                color: 'neon.400',
                transform: 'translateY(-1px)',
              }}
              transition="all 0.2s"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Icon as={FaPoundSign} boxSize={4} />
              Earnings
            </ChakraLink>
          </HStack>

          {/* Desktop Actions */}
          <HStack spacing={4} display={{ base: 'none', lg: 'flex' }}>
            {userId && (
              <Box position="relative">
                <NotificationBell driverId={userId} />
              </Box>
            )}
            <HeaderButton
              href="/driver/documents"
              label="Documents"
              size="sm"
              leftIcon={<FaFileAlt />}
              variant="ghost"
              color="white"
              _hover={{
                bg: 'rgba(0,194,255,0.1)',
                color: 'neon.400',
              }}
            />
            <HeaderButton
              href="/driver/settings"
              label="Settings"
              size="sm"
              leftIcon={<FaCog />}
              variant="ghost"
              color="white"
              _hover={{
                bg: 'rgba(0,194,255,0.1)',
                color: 'neon.400',
              }}
            />

            {/* User Profile Section */}
            <HStack
              spacing={3}
              p={2}
              borderRadius="xl"
              bg="rgba(0,194,255,0.1)"
              borderWidth="1px"
              borderColor="neon.400"
              _hover={{
                bg: 'rgba(0,194,255,0.2)',
                transform: 'scale(1.02)',
              }}
              transition="all 0.2s"
            >
              <Avatar
                size="sm"
                name={userName}
                bg="neon.500"
                color="dark.900"
                boxShadow="0 2px 8px rgba(0,194,255,0.3)"
              />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" color="white" fontWeight="semibold">
                  {userName}
                </Text>
                <Text fontSize="xs" color="neon.300">
                  {userEmail}
                </Text>
              </VStack>
            </HStack>

            <DriverSignOutButton />
          </HStack>

          {/* Mobile Actions */}
          <HStack spacing={3} display={{ base: 'flex', lg: 'none' }}>
            <HeaderButton
              href="/driver/jobs/available"
              label="Jobs"
              size="sm"
              leftIcon={<FaBriefcase />}
              variant="ghost"
              color="white"
              _hover={{
                bg: 'rgba(0,194,255,0.1)',
                color: 'neon.400',
              }}
            />
            <HeaderButton
              href="/driver/earnings"
              label="Earnings"
              size="sm"
              leftIcon={<FaPoundSign />}
              variant="ghost"
              color="white"
              _hover={{
                bg: 'rgba(0,194,255,0.1)',
                color: 'neon.400',
              }}
            />
            <HeaderButton
              href="/driver/settings"
              label="Settings"
              size="sm"
              leftIcon={<FaCog />}
              variant="ghost"
              color="white"
              _hover={{
                bg: 'rgba(0,194,255,0.1)',
                color: 'neon.400',
              }}
            />
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
