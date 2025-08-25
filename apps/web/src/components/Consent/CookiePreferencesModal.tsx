'use client';

import React from 'react';
import { 
	Button, 
	Modal, 
	ModalBody, 
	ModalContent, 
	ModalFooter, 
	ModalHeader, 
	ModalOverlay, 
	Stack, 
	Switch, 
	Text,
	VStack,
	HStack,
	Box,
	Divider,
	useBreakpointValue
} from '@chakra-ui/react';
import { useConsent } from './ConsentProvider';

export default function CookiePreferencesModal() {
	const { consent, setConsent, isPreferencesOpen, closePreferences } = useConsent();
	const isMobile = useBreakpointValue({ base: true, md: false });
	
	return (
		<Modal 
			isOpen={isPreferencesOpen} 
			onClose={closePreferences} 
			isCentered 
			motionPreset='slideInBottom'
			size={{ base: 'full', md: 'md' }}
			scrollBehavior="inside"
		>
			<ModalOverlay />
			<ModalContent 
				margin={{ base: 0, md: 'auto' }}
				borderRadius={{ base: 0, md: 'md' }}
				maxH={{ base: '100vh', md: '90vh' }}
			>
				<ModalHeader 
					fontSize={{ base: 'lg', md: 'md' }}
					pb={{ base: 2, md: 4 }}
				>
					Cookie preferences
				</ModalHeader>
				<ModalBody pb={{ base: 4, md: 6 }}>
					<VStack spacing={{ base: 6, md: 4 }} align="stretch">
						<PreferenceRow 
							label="Functional" 
							description="Enhances features like saved addresses and maps." 
							value={consent.functional} 
							onChange={(v) => setConsent({ functional: v })} 
							isMobile={isMobile}
						/>
						<Divider />
						<PreferenceRow 
							label="Analytics" 
							description="Helps us understand usage to improve the product." 
							value={consent.analytics} 
							onChange={(v) => setConsent({ analytics: v })} 
							isMobile={isMobile}
						/>
						<Divider />
						<PreferenceRow 
							label="Marketing" 
							description="Used for ads measurement and personalization." 
							value={consent.marketing} 
							onChange={(v) => setConsent({ marketing: v })} 
							isMobile={isMobile}
						/>
						<Box pt={2}>
							<Text fontSize={{ base: 'sm', md: 'xs' }} color="fg.muted">
								See our <a href="/legal/cookies" style={{ textDecoration: 'underline' }}>Cookie Policy</a> for details.
							</Text>
						</Box>
					</VStack>
				</ModalBody>
				<ModalFooter 
					pt={{ base: 2, md: 4 }}
					pb={{ base: 6, md: 4 }}
				>
					<Button 
						onClick={closePreferences}
						size={{ base: 'lg', md: 'md' }}
						width={{ base: 'full', md: 'auto' }}
						height={{ base: '48px', md: 'auto' }}
					>
						Close
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

function PreferenceRow({ 
	label, 
	description, 
	value, 
	onChange, 
	isMobile 
}: { 
	label: string; 
	description: string; 
	value: boolean; 
	onChange: (v: boolean) => void; 
	isMobile?: boolean;
}) {
	return (
		<HStack 
			align="flex-start" 
			justify="space-between" 
			spacing={{ base: 4, md: 3 }}
		>
			<VStack 
				align="flex-start" 
				spacing={{ base: 1, md: 0 }}
				flex="1"
			>
				<Text 
					fontWeight="semibold" 
					fontSize={{ base: 'md', md: 'sm' }}
				>
					{label}
				</Text>
				<Text 
					fontSize={{ base: 'sm', md: 'xs' }} 
					color="fg.muted"
					lineHeight="1.4"
				>
					{description}
				</Text>
			</VStack>
			<Switch 
				isChecked={value} 
				onChange={(e) => onChange(e.target.checked)}
				size={isMobile ? 'lg' : 'md'}
				colorScheme="blue"
			/>
		</HStack>
	);
}


