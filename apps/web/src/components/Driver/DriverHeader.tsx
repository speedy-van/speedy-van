'use client';

import React from 'react';
import { Box, Container, Flex, HStack, Spacer, Avatar, Text, Link as ChakraLink } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useSession } from 'next-auth/react';
import NotificationBell from '@/components/Driver/NotificationBell';
import DriverSignOutButton from '@/components/Driver/DriverSignOutButton';
import HeaderButton from '@/components/common/HeaderButton';

interface DriverHeaderProps {
	driverId?: string;
	sessionUserName?: string | null;
	sessionUserEmail?: string | null;
}

export default function DriverHeader({ driverId, sessionUserName, sessionUserEmail }: DriverHeaderProps) {
	const { data: session } = useSession();
	
	// Use session data if available, fallback to props
	const userName = session?.user?.name || sessionUserName || 'Driver';
	const userEmail = session?.user?.email || sessionUserEmail || '';
	const userId = session?.user?.id || driverId;
	
	return (
		<Box as="header"
			data-glass="topbar"
			position="sticky" top="0" zIndex={20}
			bg="rgba(13,13,13,0.95)" backdropFilter="saturate(140%) blur(12px)"
			borderBottom="1px solid" borderColor="border.neon" h="64px"
			className="safe-area-top"
			sx={{
				// Prevent overlay from covering the whole page in prod
				'&[data-glass="topbar"]': {
					WebkitBackdropFilter: 'saturate(140%) blur(12px)',
					pointerEvents: 'auto'
				}
			}}
			_before={{
				content: '""',
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				background: 'linear-gradient(90deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))',
				pointerEvents: 'none',
				zIndex: -1,
			}}
		>
			<Container maxW="container.lg" h="full">
				<Flex align="center" justify="space-between" h="full">
					<HStack align="center" gap={2}>
						<NextLink href="/driver">
							<img 
								src="/logo/speedy-van-logo-dark.svg" 
								alt="Speedy Van Driver" 
								width="120" 
								height="40"
								style={{ height: '40px', width: 'auto' }}
							/>
						</NextLink>
					</HStack>

					{/* Desktop navigation */}
					<HStack as="nav" spacing={6} display={{ base: "none", md: "flex" }}>
						<ChakraLink as={NextLink} href="/driver" color="white" _hover={{ color: "neon.500" }}>
							Dashboard
						</ChakraLink>
						<ChakraLink as={NextLink} href="/driver/jobs" color="white" _hover={{ color: "neon.500" }}>
							Jobs
						</ChakraLink>
						<ChakraLink as={NextLink} href="/driver/jobs/available" color="white" _hover={{ color: "neon.500" }}>
							Available Jobs
						</ChakraLink>
						<ChakraLink as={NextLink} href="/driver/jobs/active" color="white" _hover={{ color: "neon.500" }}>
							Active Jobs
						</ChakraLink>
						<ChakraLink as={NextLink} href="/driver/schedule" color="white" _hover={{ color: "neon.500" }}>
							Schedule
						</ChakraLink>
						<ChakraLink as={NextLink} href="/driver/earnings" color="white" _hover={{ color: "neon.500" }}>
							Earnings
						</ChakraLink>
					</HStack>

					{/* Desktop actions */}
					<HStack spacing={3} display={{ base: "none", md: "flex" }}>
						{userId && <NotificationBell driverId={userId} />}
						<HeaderButton 
							href="/driver/documents" 
							label="Documents"
							size="sm"
						/>
						<HeaderButton 
							href="/driver/settings" 
							label="Settings"
							size="sm"
						/>
						<Avatar size="sm" name={userName} bg="neon.500" color="dark.900" />
						<Text fontSize="sm" color="white">{userEmail}</Text>
						<DriverSignOutButton />
					</HStack>

					{/* Mobile actions */}
					<HStack spacing={2} display={{ base: "flex", md: "none" }}>
						<HeaderButton 
							href="/driver/jobs/available" 
							label="Jobs"
							size="sm"
						/>
						<HeaderButton 
							href="/driver/earnings" 
							label="Earnings"
							size="sm"
						/>
					</HStack>
				</Flex>
			</Container>
		</Box>
	);
}


