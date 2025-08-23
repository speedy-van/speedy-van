'use client';

import React from 'react';
import { Box, Container, Flex, HStack, Spacer, Avatar, Text, Link as ChakraLink, Button } from '@chakra-ui/react';
import NextLink from 'next/link';
import NotificationBell from '@/components/Driver/NotificationBell';
import DriverSignOutButton from '@/components/Driver/DriverSignOutButton';

interface DriverHeaderProps {
	driverId?: string;
	sessionUserName?: string | null;
	sessionUserEmail?: string | null;
}

export default function DriverHeader({ driverId, sessionUserName, sessionUserEmail }: DriverHeaderProps) {
	return (
		<Box as="header" borderBottom="1px solid" borderColor="gray.100" bg="white" position="sticky" top={0} zIndex={10}>
			<Container maxW="1200px" py={2}>
				<Flex align="center" gap={4}>
					<HStack spacing={4}>
						<ChakraLink as={NextLink} href="/driver" fontWeight="bold" color="blue.600">Speedy Van Driver</ChakraLink>
						<ChakraLink as={NextLink} href="/driver" variant="nav">Dashboard</ChakraLink>
						<ChakraLink as={NextLink} href="/driver/jobs" variant="nav">Jobs</ChakraLink>
						<ChakraLink as={NextLink} href="/driver/jobs/available" variant="nav">Available Jobs</ChakraLink>
						<ChakraLink as={NextLink} href="/driver/jobs/active" variant="nav">Active Jobs</ChakraLink>
						<ChakraLink as={NextLink} href="/driver/schedule" variant="nav">Schedule</ChakraLink>
						<ChakraLink as={NextLink} href="/driver/earnings" variant="nav">Earnings</ChakraLink>
						<ChakraLink as={NextLink} href="/driver/payouts" variant="nav">Payouts</ChakraLink>
						<ChakraLink as={NextLink} href="/driver/documents" variant="nav">Documents</ChakraLink>
						<ChakraLink as={NextLink} href="/driver/performance" variant="nav">Performance</ChakraLink>
						<ChakraLink as={NextLink} href="/driver/notifications" variant="nav">Notifications</ChakraLink>
						<ChakraLink as={NextLink} href="/driver/settings" variant="nav">Settings</ChakraLink>
					</HStack>
					<Spacer />
					<HStack spacing={4}>
						{driverId && <NotificationBell driverId={driverId} />}
						<Avatar size="sm" name={sessionUserName ?? 'Driver'} />
						<Text fontSize="sm">{sessionUserEmail ?? ''}</Text>
						<DriverSignOutButton />
					</HStack>
				</Flex>
			</Container>
		</Box>
	);
}


