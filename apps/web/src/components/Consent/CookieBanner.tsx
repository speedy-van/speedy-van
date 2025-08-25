'use client';

import React from 'react';
import { Box, Button, Flex, Text, usePrefersReducedMotion, VStack, HStack } from '@chakra-ui/react';
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
			bg="bg.surface" 
			borderTop="1px solid" 
			borderColor="border.subtle" 
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
					<Text fontSize={{ base: 'sm', sm: 'md' }} lineHeight="1.5">
						We use cookies to run the site and improve your experience. You can accept all, reject non-essential, or manage settings.
					</Text>
					<VStack spacing={3} align="stretch">
						<Button 
							variant="primary" 
							size="lg" 
							onClick={acceptAll}
							height="48px"
							fontSize="md"
							fontWeight="semibold"
						>
							Accept all
						</Button>
						<Button 
							variant="secondary" 
							size="lg" 
							onClick={rejectNonEssential}
							height="48px"
							fontSize="md"
							fontWeight="semibold"
						>
							Reject non-essential
						</Button>
						<Button 
							variant="ghost" 
							size="lg" 
							onClick={openPreferences}
							height="48px"
							fontSize="md"
							fontWeight="medium"
						>
							Manage settings
						</Button>
					</VStack>
				</VStack>

				{/* Desktop Layout */}
				<Flex 
					display={{ base: 'none', md: 'flex' }} 
					direction="row" 
					align="center" 
					gap={4}
				>
					<Text flex="1" fontSize="md">
						We use cookies to run the site and improve your experience. You can accept all, reject non-essential, or manage settings.
					</Text>
					<HStack spacing={3}>
						<Button variant="primary" size="md" onClick={acceptAll}>
							Accept all
						</Button>
						<Button variant="secondary" size="md" onClick={rejectNonEssential}>
							Reject non-essential
						</Button>
						<Button variant="ghost" size="md" onClick={openPreferences}>
							Manage settings
						</Button>
					</HStack>
				</Flex>
			</Box>
		</Box>
	);
}


