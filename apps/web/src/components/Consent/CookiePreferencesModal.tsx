'use client';

import React from 'react';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Switch, Text } from '@chakra-ui/react';
import { useConsent } from './ConsentProvider';

export default function CookiePreferencesModal() {
	const { consent, setConsent, isPreferencesOpen, closePreferences } = useConsent();
	return (
		<Modal isOpen={isPreferencesOpen} onClose={closePreferences} isCentered motionPreset='none'>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Cookie preferences</ModalHeader>
				<ModalBody>
					<Stack spacing={4}>
						<PreferenceRow label="Functional" description="Enhances features like saved addresses and maps." value={consent.functional} onChange={(v) => setConsent({ functional: v })} />
						<PreferenceRow label="Analytics" description="Helps us understand usage to improve the product." value={consent.analytics} onChange={(v) => setConsent({ analytics: v })} />
						<PreferenceRow label="Marketing" description="Used for ads measurement and personalization." value={consent.marketing} onChange={(v) => setConsent({ marketing: v })} />
						<Text fontSize="sm">See our <a href="/legal/cookies">Cookie Policy</a> for details.</Text>
					</Stack>
				</ModalBody>
				<ModalFooter>
					<Button onClick={closePreferences}>Close</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

function PreferenceRow({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
	return (
		<Stack direction="row" align="center" justify="space-between">
			<Stack spacing={0}>
				<Text fontWeight="medium">{label}</Text>
				<Text fontSize="sm" color="fg.muted">{description}</Text>
			</Stack>
			<Switch isChecked={value} onChange={(e) => onChange(e.target.checked)} />
		</Stack>
	);
}


