'use client';

import React from 'react';
import { Box, Button, Flex, Text, usePrefersReducedMotion } from '@chakra-ui/react';
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
		>
			<Flex maxW="6xl" mx="auto" px={4} py={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }} gap={3}>
				<Text flex="1">We use cookies to run the site and improve your experience. You can accept all, reject non-essential, or manage settings.</Text>
				<Flex gap={2}>
					<Button variant="primary" size="md" onClick={acceptAll}>Accept all</Button>
					<Button variant="secondary" size="md" onClick={rejectNonEssential}>Reject non-essential</Button>
					<Button variant="ghost" size="md" onClick={openPreferences}>Manage settings</Button>
				</Flex>
			</Flex>
		</Box>
	);
}


