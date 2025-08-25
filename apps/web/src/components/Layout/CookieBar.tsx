'use client';

import React from 'react';
import { Box, Button, Flex, Text, usePrefersReducedMotion, VStack, HStack } from '@chakra-ui/react';
import { useConsent } from '../Consent/ConsentProvider';

export default function CookieBar() {
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
			bg="gray.900" 
			color="gray.100"
			borderTop="1px solid" 
			borderColor="whiteAlpha.300"
			zIndex={1000} 
			boxShadow={reduceMotion ? undefined : '0 -4px 20px rgba(0,0,0,0.12)'}
			className="safe-area-bottom"
			pb={{ base: 'env(safe-area-inset-bottom)', md: 0 }}
		>
			<Box maxW="6xl" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 4, md: 3 }}>
				{/* Mobile Layout */}
				<VStack 
					display={{ base: 'flex', md: 'none' }} 
					spacing={4} 
					align="stretch"
				>
					<Text 
						fontSize={{ base: 'sm', sm: 'md' }} 
						lineHeight="1.5"
						textAlign="center"
					>
						We use cookies to improve performance, analytics, and experience.
					</Text>
					<HStack spacing={3} justify="center">
						<Button 
							size="md" 
							variant="outline" 
							onClick={rejectNonEssential}
							height="44px"
							fontSize="sm"
							fontWeight="medium"
							flex="1"
							maxW="120px"
						>
							Manage
						</Button>
						<Button 
							size="md" 
							colorScheme="green" 
							onClick={acceptAll}
							height="44px"
							fontSize="sm"
							fontWeight="semibold"
							flex="1"
							maxW="120px"
						>
							Accept all
						</Button>
					</HStack>
				</VStack>

				{/* Desktop Layout */}
				<Flex 
					display={{ base: 'none', md: 'flex' }} 
					direction="row" 
					align="center" 
					gap={4}
				>
					<Text flex="1" fontSize="sm">
						We use cookies to improve performance, analytics, and experience.
					</Text>
					<HStack spacing={3}>
						<Button size="sm" variant="outline" onClick={rejectNonEssential}>
							Manage
						</Button>
						<Button size="sm" colorScheme="green" onClick={acceptAll}>
							Accept all
						</Button>
					</HStack>
				</Flex>
			</Box>
		</Box>
	);
}
