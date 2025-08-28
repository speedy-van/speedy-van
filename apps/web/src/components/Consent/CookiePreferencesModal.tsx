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
	useBreakpointValue,
	Icon,
	Badge,
	Heading
} from '@chakra-ui/react';
import { FaCookieBite, FaShieldAlt, FaCog, FaChartBar, FaBullhorn, FaCheckCircle, FaTimes } from 'react-icons/fa';
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
			size={{ base: 'full', md: 'lg' }}
			scrollBehavior="inside"
		>
			<ModalOverlay 
				bg="rgba(0,0,0,0.8)"
				backdropFilter="blur(10px)"
			/>
			<ModalContent 
				margin={{ base: 0, md: 'auto' }}
				borderRadius={{ base: 0, md: '2xl' }}
				maxH={{ base: '100vh', md: '90vh' }}
				bg="linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,0,0,0.98))"
				borderWidth="2px"
				borderColor="neon.400"
				boxShadow="0 20px 60px rgba(0,194,255,0.2)"
				position="relative"
				overflow="hidden"
				_before={{
					content: '""',
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					borderRadius: "inherit",
					background: "radial-gradient(circle at 50% 0%, rgba(0,194,255,0.1) 0%, transparent 70%)",
					pointerEvents: "none"
				}}
			>
				<ModalHeader 
					fontSize={{ base: 'xl', md: 'lg' }}
					pb={{ base: 4, md: 6 }}
					textAlign="center"
					position="relative"
					zIndex={1}
				>
					<VStack spacing={3}>
						<Box
							p={4}
							borderRadius="xl"
							bg="linear-gradient(135deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))"
							borderWidth="1px"
							borderColor="neon.400"
						>
							<Icon as={FaCookieBite} color="neon.400" boxSize={8} />
						</Box>
						<Heading size="lg" color="neon.300">
							🍪 Cookie Preferences
						</Heading>
						<Text fontSize="sm" color="gray.400" fontWeight="normal">
							Customize your privacy settings
						</Text>
					</VStack>
				</ModalHeader>
				
				<ModalBody pb={{ base: 6, md: 8 }} position="relative" zIndex={1}>
					<VStack spacing={{ base: 8, md: 6 }} align="stretch">
						{/* Essential Cookies - Always Enabled */}
						<Box 
							p={4}
							borderRadius="xl"
							bg="linear-gradient(135deg, rgba(0,209,143,0.1), rgba(0,194,255,0.1))"
							borderWidth="1px"
							borderColor="green.400"
							position="relative"
						>
							<HStack spacing={3} mb={3}>
								<Icon as={FaShieldAlt} color="green.400" boxSize={5} />
								<Text fontWeight="bold" color="green.300" fontSize="md">
									Essential Cookies
								</Text>
								<Badge colorScheme="green" variant="solid" size="sm">
									Always Active
								</Badge>
							</HStack>
							<Text fontSize="sm" color="gray.300" lineHeight="1.5">
								These cookies are necessary for the website to function properly. 
								They cannot be disabled and are always active.
							</Text>
						</Box>

						{/* Functional Cookies */}
						<PreferenceRow 
							label="Functional Cookies" 
							description="Enhances features like saved addresses, maps, and user preferences." 
							value={consent.functional} 
							onChange={(v) => setConsent({ functional: v })} 
							isMobile={isMobile}
							icon={FaCog}
							color="blue"
						/>
						
						<Divider borderColor="border.primary" />
						
						{/* Analytics Cookies */}
						<PreferenceRow 
							label="Analytics Cookies" 
							description="Helps us understand usage patterns to improve the product and user experience." 
							value={consent.analytics} 
							onChange={(v) => setConsent({ analytics: v })} 
							isMobile={isMobile}
							icon={FaChartBar}
							color="purple"
						/>
						
						<Divider borderColor="border.primary" />
						
						{/* Marketing Cookies */}
						<PreferenceRow 
							label="Marketing Cookies" 
							description="Used for advertising measurement, personalization, and targeted content delivery." 
							value={consent.marketing} 
							onChange={(v) => setConsent({ marketing: v })} 
							isMobile={isMobile}
							icon={FaBullhorn}
							color="pink"
						/>
						
						{/* Privacy Information */}
						<Box 
							p={4}
							borderRadius="xl"
							bg="rgba(0,194,255,0.05)"
							borderWidth="1px"
							borderColor="neon.400"
							textAlign="center"
						>
							<Text fontSize="sm" color="neon.300" mb={2} fontWeight="medium">
								🔒 Your privacy is our priority
							</Text>
							<Text fontSize="xs" color="gray.400" lineHeight="1.4">
								See our <a href="/legal/cookies" style={{ textDecoration: 'underline', color: '#00C2FF' }}>Cookie Policy</a> for detailed information about how we use cookies and protect your data.
							</Text>
						</Box>
					</VStack>
				</ModalBody>
				
				<ModalFooter 
					pt={{ base: 4, md: 6 }}
					pb={{ base: 8, md: 6 }}
					position="relative"
					zIndex={1}
				>
					<Button 
						onClick={closePreferences}
						size={{ base: 'lg', md: 'md' }}
						width={{ base: 'full', md: 'auto' }}
						height={{ base: '52px', md: 'auto' }}
						bg="linear-gradient(135deg, #00C2FF, #00D18F)"
						_hover={{
							transform: "translateY(-1px)",
							boxShadow: "0 6px 20px rgba(0,194,255,0.4)"
						}}
						transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
					>
						<Icon as={FaCheckCircle} mr={2} />
						Save Preferences
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
	isMobile,
	icon: IconComponent,
	color
}: { 
	label: string; 
	description: string; 
	value: boolean; 
	onChange: (v: boolean) => void; 
	isMobile?: boolean;
	icon: any;
	color: string;
}) {
	return (
		<Box 
			p={4}
			borderRadius="xl"
			borderWidth="1px"
			borderColor={value ? `${color}.400` : 'border.primary'}
			bg={value ? `${color}.50` : 'dark.700'}
			transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
			_hover={{
				borderColor: `${color}.400`,
				transform: "translateY(-1px)",
				boxShadow: value ? `0 4px 20px rgba(0,0,0,0.2)` : "none"
			}}
		>
			<HStack 
				align="flex-start" 
				justify="space-between" 
				spacing={{ base: 4, md: 4 }}
			>
				<HStack spacing={3} flex="1">
					<Box
						p={2}
						borderRadius="lg"
						bg={value ? `${color}.500` : 'gray.600'}
						color="white"
						boxSize="40px"
						display="flex"
						alignItems="center"
						justifyContent="center"
						transition="all 200ms"
					>
						<Icon as={IconComponent} boxSize={5} />
					</Box>
					<VStack align="start" spacing={2} flex="1">
						<HStack spacing={2}>
							<Text 
								fontWeight="bold" 
								fontSize={{ base: 'md', md: 'sm' }}
								color={value ? `${color}.300` : 'text.primary'}
							>
								{label}
							</Text>
							{value && (
								<Badge colorScheme={color} variant="solid" size="sm">
									Active
								</Badge>
							)}
						</HStack>
						<Text 
							fontSize={{ base: 'sm', md: 'xs' }} 
							color={value ? `${color}.200` : 'text.secondary'}
							lineHeight="1.5"
						>
							{description}
						</Text>
					</VStack>
				</HStack>
				<Switch 
					isChecked={value} 
					onChange={(e) => onChange(e.target.checked)}
					size={isMobile ? 'lg' : 'md'}
					colorScheme={color}
					boxShadow={value ? `0 0 10px rgba(0,0,0,0.3)` : "none"}
				/>
			</HStack>
		</Box>
	);
}


