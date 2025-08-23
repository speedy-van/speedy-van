'use client';

import React from 'react';
import { Box, Button, Flex, Text, usePrefersReducedMotion } from '@chakra-ui/react';
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
		>
			<Flex maxW="6xl" mx="auto" px={4} py={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }} gap={3}>
				<Text flex="1" fontSize="sm">
					We use cookies to improve performance, analytics, and experience.
				</Text>
				<Flex gap={2}>
					<Button size="sm" variant="outline" onClick={rejectNonEssential}>
						Manage
					</Button>
					<Button size="sm" colorScheme="green" onClick={acceptAll}>
						Accept all
					</Button>
				</Flex>
			</Flex>
		</Box>
	);
}
