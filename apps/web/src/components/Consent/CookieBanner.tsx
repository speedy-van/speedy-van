'use client';

import React from 'react';
import { Box, Button, Flex, Text, usePrefersReducedMotion, VStack, HStack, Icon, Badge } from '@chakra-ui/react';
import { FaCookieBite, FaShieldAlt, FaCog, FaTimes } from 'react-icons/fa';
import { useConsent } from './ConsentProvider';

export default function CookieBanner() {
	const { consent, acceptAll, rejectNonEssential, openPreferences } = useConsent();
	const hasMadeChoice = consent.timestamp && consent.timestamp > 0 && (consent.analytics || consent.marketing || consent.functional || consent.timestamp > 0);
	const reduceMotion = usePrefersReducedMotion();
	if (hasMadeChoice) return null;

	return (
		<Box 
			id="cookie-bar"
			position="sticky" 
			bottom={0} 
			left={0} 
			right={0} 
			bg="linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,0,0,0.98))"
			color="white"
			borderTop="2px solid"
			borderColor="neon.400"
			zIndex={1000} 
			boxShadow={reduceMotion ? undefined : '0 -8px 32px rgba(0,194,255,0.15)'}
			className="safe-area-bottom"
			pb={{ base: 'env(safe-area-inset-bottom)', md: 0 }}
			backdropFilter="blur(20px)"
			overflow="hidden"
			_before={{
				content: '""',
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				background: "radial-gradient(circle at 50% 0%, rgba(0,194,255,0.1) 0%, transparent 70%)",
				pointerEvents: "none"
			}}
		>
			<Box maxW="7xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 6, md: 5 }} position="relative" zIndex={1}>
				{/* Mobile Layout */}
				<VStack 
					display={{ base: 'flex', md: 'none' }} 
					spacing={6} 
					align="stretch"
				>
					{/* Header with Icon and Title */}
					<VStack spacing={3}>
						<HStack spacing={3} justify="center">
							<Box
								p={3}
								borderRadius="xl"
								bg="linear-gradient(135deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))"
								borderWidth="1px"
								borderColor="neon.400"
							>
								<Icon as={FaCookieBite} color="neon.400" boxSize={6} />
							</Box>
							<VStack spacing={1} align="center">
								<Text 
									fontSize="lg" 
									fontWeight="bold" 
									color="neon.300"
									textAlign="center"
								>
									🍪 Cookie Consent
								</Text>
								<Badge 
									colorScheme="neon" 
									variant="subtle" 
									size="sm"
									px={3}
									py={1}
									borderRadius="full"
									fontSize="xs"
									borderWidth="1px"
									borderColor="neon.400"
								>
									🔒 Privacy First
								</Badge>
							</VStack>
						</HStack>
						
						<Text 
							fontSize="sm" 
							lineHeight="1.6"
							textAlign="center"
							color="gray.200"
							maxW="450px"
							mx="auto"
						>
							We use cookies to run the site and improve your experience. 
							You can accept all, reject non-essential, or manage settings.
						</Text>
					</VStack>
					
					{/* Action Buttons */}
					<VStack spacing={3} align="stretch">
						<Button 
							variant="primary" 
							size="lg" 
							onClick={acceptAll}
							height="52px"
							fontSize="md"
							fontWeight="semibold"
							bg="linear-gradient(135deg, #00C2FF, #00D18F)"
							_hover={{
								transform: "translateY(-1px)",
								boxShadow: "0 6px 20px rgba(0,194,255,0.4)"
							}}
							transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
						>
							<Icon as={FaShieldAlt} mr={2} />
							Accept All Cookies
						</Button>
						<Button 
							variant="secondary" 
							size="lg" 
							onClick={rejectNonEssential}
							height="52px"
							fontSize="md"
							fontWeight="semibold"
							borderColor="neon.400"
							color="neon.300"
							_hover={{
								bg: "neon.400",
								color: "black",
								transform: "translateY(-1px)",
								boxShadow: "0 4px 12px rgba(0,194,255,0.3)"
							}}
							transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
						>
							<Icon as={FaTimes} mr={2} />
							Reject Non-Essential
						</Button>
						<Button 
							variant="ghost" 
							size="lg" 
							onClick={openPreferences}
							height="52px"
							fontSize="md"
							fontWeight="medium"
							color="gray.300"
							_hover={{
								bg: "rgba(0,194,255,0.1)",
								color: "neon.300",
								transform: "translateY(-1px)"
							}}
							transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
						>
							<Icon as={FaCog} mr={2} />
							Manage Settings
						</Button>
					</VStack>
					
					{/* Privacy Information */}
					<Box textAlign="center">
						<Text fontSize="xs" color="gray.400" mb={2}>
							Your privacy choices are respected and can be changed anytime
						</Text>
						<Badge 
							colorScheme="green" 
							variant="subtle" 
							size="sm"
							px={3}
							py={1}
							borderRadius="full"
							fontSize="xs"
							borderWidth="1px"
							borderColor="green.400"
						>
							✅ GDPR Compliant
						</Badge>
					</Box>
				</VStack>

				{/* Desktop Layout */}
				<Flex 
					display={{ base: 'none', md: 'flex' }} 
					direction="row" 
					align="center" 
					gap={6}
				>
					{/* Left Section with Icon and Text */}
					<HStack spacing={4} flex="1">
						<Box
							p={3}
							borderRadius="xl"
							bg="linear-gradient(135deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))"
							borderWidth="1px"
							borderColor="neon.400"
						>
							<Icon as={FaCookieBite} color="neon.400" boxSize={6} />
						</Box>
						<VStack align="start" spacing={2}>
							<HStack spacing={3}>
								<Text fontSize="lg" fontWeight="bold" color="neon.300">
									🍪 Cookie Consent
								</Text>
								<Badge 
									colorScheme="neon" 
									variant="subtle" 
									size="sm"
									px={2}
									py={1}
									borderRadius="full"
									fontSize="xs"
								>
									Privacy First
								</Badge>
								<Badge 
									colorScheme="green" 
									variant="subtle" 
									size="sm"
									px={2}
									py={1}
									borderRadius="full"
									fontSize="xs"
								>
									GDPR Compliant
								</Badge>
							</HStack>
							<Text fontSize="md" color="gray.300" maxW="600px">
								We use cookies to run the site and improve your experience. 
								You can accept all, reject non-essential, or manage settings.
							</Text>
						</VStack>
					</HStack>
					
					{/* Right Section with Buttons */}
					<HStack spacing={3}>
						<Button 
							variant="ghost" 
							size="md" 
							onClick={openPreferences}
							color="gray.300"
							_hover={{
								bg: "rgba(0,194,255,0.1)",
								color: "neon.300"
							}}
							transition="all 200ms"
						>
							<Icon as={FaCog} mr={2} />
							Settings
						</Button>
						<Button 
							variant="outline" 
							size="md" 
							onClick={rejectNonEssential}
							borderColor="neon.400"
							color="neon.300"
							_hover={{
								bg: "neon.400",
								color: "black",
								transform: "translateY(-1px)",
								boxShadow: "0 4px 12px rgba(0,194,255,0.3)"
							}}
							transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
						>
							<Icon as={FaTimes} mr={2} />
							Reject
						</Button>
						<Button 
							variant="primary" 
							size="md" 
							onClick={acceptAll}
							bg="linear-gradient(135deg, #00C2FF, #00D18F)"
							_hover={{
								transform: "translateY(-1px)",
								boxShadow: "0 6px 20px rgba(0,194,255,0.4)"
							}}
							transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
						>
							<Icon as={FaShieldAlt} mr={2} />
							Accept All
						</Button>
					</HStack>
				</Flex>
			</Box>
		</Box>
	);
}


