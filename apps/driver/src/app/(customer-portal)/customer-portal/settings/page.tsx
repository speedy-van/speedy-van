'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Switch,
  Text,
  VStack,
  HStack,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  InputGroup,
  InputRightElement,
  IconButton,
  Badge,
  Link,
  List,
  ListItem,
  ListIcon,
  Code,
  useToast,
  Select,
  FormErrorMessage,
} from '@chakra-ui/react';
import {
  ViewIcon,
  ViewOffIcon,
  ExternalLinkIcon,
  DownloadIcon,
  DeleteIcon,
} from '@chakra-ui/icons';
import { CheckCircleIcon } from '@chakra-ui/icons';

interface Settings {
  profile: {
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: string;
  };
  security: {
    twoFactorEnabled: boolean;
    backupCodesGenerated: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy: {
    dataExportRequested: boolean;
    accountDeletionRequested: boolean;
  };
}

export default function CustomerSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const toast = useToast();
  const {
    isOpen: isPasswordOpen,
    onOpen: onPasswordOpen,
    onClose: onPasswordClose,
  } = useDisclosure();
  const {
    isOpen: is2FAOpen,
    onOpen: on2FAOpen,
    onClose: on2FAClose,
  } = useDisclosure();
  const {
    isOpen: isBackupOpen,
    onOpen: onBackupOpen,
    onClose: onBackupClose,
  } = useDisclosure();

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notificationForm, setNotificationForm] = useState({
    email: true,
    sms: true,
    push: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/customer/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setProfileForm({
          name: data.profile.name || '',
          email: data.profile.email || '',
        });
        setNotificationForm(data.notifications);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/customer/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: profileForm,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
          status: 'success',
          duration: 3000,
        });
        await loadSettings();
      } else {
        const error = await response.text();
        toast({
          title: 'Error',
          description: error,
          status: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/customer/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notifications: notificationForm,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Notification preferences updated',
          status: 'success',
          duration: 3000,
        });
        await loadSettings();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notifications',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Error',
        description: "New passwords don't match",
        status: 'error',
        duration: 5000,
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long',
        status: 'error',
        duration: 5000,
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/customer/settings/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Password changed successfully',
          status: 'success',
          duration: 3000,
        });
        onPasswordClose();
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const error = await response.text();
        toast({
          title: 'Error',
          description: error,
          status: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to change password',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const setup2FA = async () => {
    try {
      const response = await fetch('/api/customer/settings/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setup' }),
      });

      if (response.ok) {
        const data = await response.json();
        setQrCodeUrl(data.qrCodeUrl);
        on2FAOpen();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to setup 2FA',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const verify2FA = async () => {
    if (!twoFactorToken) {
      toast({
        title: 'Error',
        description: 'Please enter the verification code',
        status: 'error',
        duration: 5000,
      });
      return;
    }

    try {
      const response = await fetch('/api/customer/settings/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', token: twoFactorToken }),
      });

      if (response.ok) {
        const data = await response.json();
        setBackupCodes(data.backupCodes);
        on2FAClose();
        onBackupOpen();
        await loadSettings();
        toast({
          title: 'Success',
          description: '2FA enabled successfully',
          status: 'success',
          duration: 5000,
        });
      } else {
        const error = await response.text();
        toast({
          title: 'Error',
          description: error,
          status: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify 2FA',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const disable2FA = async () => {
    if (!twoFactorToken) {
      toast({
        title: 'Error',
        description: 'Please enter the verification code',
        status: 'error',
        duration: 5000,
      });
      return;
    }

    try {
      const response = await fetch('/api/customer/settings/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable', token: twoFactorToken }),
      });

      if (response.ok) {
        on2FAClose();
        await loadSettings();
        toast({
          title: 'Success',
          description: '2FA disabled successfully',
          status: 'success',
          duration: 3000,
        });
      } else {
        const error = await response.text();
        toast({
          title: 'Error',
          description: error,
          status: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disable 2FA',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const requestDataExport = async () => {
    try {
      const response = await fetch('/api/customer/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privacy: { dataExportRequested: true },
        }),
      });

      if (response.ok) {
        toast({
          title: 'Request Submitted',
          description:
            "Your data export request has been submitted. You'll receive an email when it's ready.",
          status: 'success',
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit data export request',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const requestAccountDeletion = async () => {
    try {
      const response = await fetch('/api/customer/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privacy: { accountDeletionRequested: true },
        }),
      });

      if (response.ok) {
        toast({
          title: 'Request Submitted',
          description:
            'Your account deletion request has been submitted. Our team will contact you within 30 days.',
          status: 'success',
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit account deletion request',
        status: 'error',
        duration: 5000,
      });
    }
  };

  if (loading) {
    return (
      <VStack spacing={6} align="stretch">
        <Heading size="md">Settings</Heading>
        <Text>Loading...</Text>
      </VStack>
    );
  }

  return (
    <VStack spacing={8} align="stretch">
      <Heading size="lg">Settings</Heading>

      {/* Profile Section */}
      <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
        <Heading size="md" mb={4}>
          Profile
        </Heading>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
          <FormControl>
            <FormLabel>Full Name</FormLabel>
            <Input
              value={profileForm.name}
              onChange={e =>
                setProfileForm({ ...profileForm, name: e.target.value })
              }
              placeholder="Enter your full name"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email Address</FormLabel>
            <Input
              type="email"
              value={profileForm.email}
              onChange={e =>
                setProfileForm({ ...profileForm, email: e.target.value })
              }
              placeholder="Enter your email"
            />
            {settings?.profile.emailVerified && (
              <HStack mt={2}>
                <CheckCircleIcon color="green.500" />
                <Text fontSize="sm" color="green.500">
                  Email verified
                </Text>
              </HStack>
            )}
          </FormControl>
        </Grid>
        <HStack mt={4}>
          <Button
            colorScheme="blue"
            onClick={saveProfile}
            isLoading={saving}
            loadingText="Saving..."
          >
            Save Profile
          </Button>
        </HStack>
      </Box>

      {/* Notifications Section */}
      <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
        <Heading size="md" mb={4}>
          Notifications
        </Heading>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium">Email Notifications</Text>
              <Text fontSize="sm" color="gray.600">
                Receive updates about your bookings via email
              </Text>
            </VStack>
            <Switch
              isChecked={notificationForm.email}
              onChange={e =>
                setNotificationForm({
                  ...notificationForm,
                  email: e.target.checked,
                })
              }
            />
          </HStack>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium">SMS Notifications</Text>
              <Text fontSize="sm" color="gray.600">
                Receive updates about your bookings via SMS
              </Text>
            </VStack>
            <Switch
              isChecked={notificationForm.sms}
              onChange={e =>
                setNotificationForm({
                  ...notificationForm,
                  sms: e.target.checked,
                })
              }
            />
          </HStack>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium">Push Notifications</Text>
              <Text fontSize="sm" color="gray.600">
                Receive real-time updates in your browser
              </Text>
            </VStack>
            <Switch
              isChecked={notificationForm.push}
              onChange={e =>
                setNotificationForm({
                  ...notificationForm,
                  push: e.target.checked,
                })
              }
            />
          </HStack>
          <Button
            colorScheme="blue"
            onClick={saveNotifications}
            isLoading={saving}
            loadingText="Saving..."
            alignSelf="start"
          >
            Save Notifications
          </Button>
        </VStack>
      </Box>

      {/* Security Section */}
      <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
        <Heading size="md" mb={4}>
          Security
        </Heading>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium">Password</Text>
              <Text fontSize="sm" color="gray.600">
                Change your account password
              </Text>
            </VStack>
            <Button size="sm" onClick={onPasswordOpen}>
              Change Password
            </Button>
          </HStack>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium">Two-Factor Authentication</Text>
              <Text fontSize="sm" color="gray.600">
                Add an extra layer of security to your account
              </Text>
              {settings?.security.twoFactorEnabled && (
                <Badge colorScheme="green">Enabled</Badge>
              )}
            </VStack>
            <Button
              size="sm"
              colorScheme={settings?.security.twoFactorEnabled ? 'red' : 'blue'}
              onClick={setup2FA}
            >
              {settings?.security.twoFactorEnabled
                ? 'Disable 2FA'
                : 'Enable 2FA'}
            </Button>
          </HStack>
        </VStack>
      </Box>

      {/* Privacy Section */}
      <Box borderWidth="1px" borderRadius="lg" p={6} bg="white">
        <Heading size="md" mb={4}>
          Privacy & Data
        </Heading>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium">Data Export</Text>
              <Text fontSize="sm" color="gray.600">
                Download a copy of your personal data
              </Text>
            </VStack>
            <Button
              size="sm"
              leftIcon={<DownloadIcon />}
              onClick={requestDataExport}
            >
              Request Export
            </Button>
          </HStack>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium">Account Deletion</Text>
              <Text fontSize="sm" color="gray.600">
                Permanently delete your account and data
              </Text>
            </VStack>
            <Button
              size="sm"
              colorScheme="red"
              leftIcon={<DeleteIcon />}
              onClick={requestAccountDeletion}
            >
              Request Deletion
            </Button>
          </HStack>
          <Link href="/privacy" isExternal color="blue.500" fontSize="sm">
            Privacy Policy <ExternalLinkIcon mx="2px" />
          </Link>
        </VStack>
      </Box>

      {/* Password Change Modal */}
      <Modal isOpen={isPasswordOpen} onClose={onPasswordClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Current Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={e =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Enter current password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={
                        showCurrentPassword ? 'Hide password' : 'Show password'
                      }
                      icon={
                        showCurrentPassword ? <ViewOffIcon /> : <ViewIcon />
                      }
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>New Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={e =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter new password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={
                        showNewPassword ? 'Hide password' : 'Show password'
                      }
                      icon={showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Confirm New Password</FormLabel>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm new password"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPasswordClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={changePassword}
              isLoading={saving}
              loadingText="Changing..."
            >
              Change Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 2FA Setup Modal */}
      <Modal isOpen={is2FAOpen} onClose={on2FAClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {settings?.security.twoFactorEnabled
              ? 'Disable Two-Factor Authentication'
              : 'Setup Two-Factor Authentication'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {!settings?.security.twoFactorEnabled && qrCodeUrl && (
                <>
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Setup Instructions</AlertTitle>
                      <AlertDescription>
                        Scan this QR code with your authenticator app (Google
                        Authenticator, Authy, etc.)
                      </AlertDescription>
                    </Box>
                  </Alert>
                  <Box textAlign="center">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      style={{ maxWidth: '200px' }}
                    />
                  </Box>
                </>
              )}
              <FormControl>
                <FormLabel>Verification Code</FormLabel>
                <Input
                  value={twoFactorToken}
                  onChange={e => setTwoFactorToken(e.target.value)}
                  placeholder="Enter 6-digit code from your app"
                  maxLength={6}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={on2FAClose}>
              Cancel
            </Button>
            <Button
              colorScheme={settings?.security.twoFactorEnabled ? 'red' : 'blue'}
              onClick={
                settings?.security.twoFactorEnabled ? disable2FA : verify2FA
              }
            >
              {settings?.security.twoFactorEnabled
                ? 'Disable 2FA'
                : 'Verify & Enable'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Backup Codes Modal */}
      <Modal isOpen={isBackupOpen} onClose={onBackupClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Backup Codes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>Important!</AlertTitle>
                <AlertDescription>
                  Save these backup codes in a secure location. You can use them
                  to access your account if you lose your authenticator device.
                </AlertDescription>
              </Box>
            </Alert>
            <Box
              borderWidth="1px"
              borderRadius="md"
              p={4}
              bg="gray.50"
              fontFamily="mono"
              fontSize="sm"
            >
              {backupCodes.map((code, index) => (
                <Text key={index} mb={1}>
                  {code}
                </Text>
              ))}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onBackupClose}>
              I've Saved My Codes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
