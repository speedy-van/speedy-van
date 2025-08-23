'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  VStack,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  useDisclosure,
  Kbd,
  Divider,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import {
  FiHome,
  FiUsers,
  FiPackage,
  FiDollarSign,
  FiBarChart,
  FiFileText,
  FiHelpCircle,
  FiNavigation,
  FiSearch,
  FiSettings,
  FiX,
} from 'react-icons/fi';

interface Shortcut {
  key: string;
  description: string;
  icon: React.ElementType;
  action?: () => void;
  category: 'navigation' | 'search' | 'actions' | 'help';
}

interface KeyboardShortcutsProps {
  onNavigate?: (path: string) => void;
}

export function KeyboardShortcuts({ onNavigate }: KeyboardShortcutsProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [isMac, setIsMac] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      router.push(path);
    }
  };

  const shortcuts: Shortcut[] = [
    // Navigation shortcuts
    {
      key: isMac ? '⌘K' : 'Ctrl+K',
      description: 'Global search',
      icon: FiSearch,
      action: () => {
        // This would trigger the global search
        const event = new KeyboardEvent('keydown', {
          key: 'k',
          metaKey: isMac,
          ctrlKey: !isMac,
        });
        document.dispatchEvent(event);
      },
      category: 'search',
    },
    {
      key: 'G H',
      description: 'Go to Dashboard',
      icon: FiHome,
      action: () => handleNavigate('/admin/dashboard'),
      category: 'navigation',
    },
    {
      key: 'G O',
      description: 'Go to Orders',
      icon: FiPackage,
      action: () => handleNavigate('/admin/orders'),
      category: 'navigation',
    },
    {
      key: 'G P',
      description: 'Go to People',
      icon: FiUsers,
      action: () => handleNavigate('/admin/drivers'),
      category: 'navigation',
    },
    {
      key: 'G F',
      description: 'Go to Finance',
      icon: FiDollarSign,
      action: () => handleNavigate('/admin/finance'),
      category: 'navigation',
    },
    {
      key: 'G A',
      description: 'Go to Analytics',
      icon: FiBarChart,
      action: () => handleNavigate('/admin/analytics'),
      category: 'navigation',
    },
    {
      key: 'G C',
      description: 'Go to Content',
      icon: FiSettings,
      action: () => handleNavigate('/admin/content'),
      category: 'navigation',
    },
    {
      key: 'G L',
      description: 'Go to Logs',
      icon: FiFileText,
      action: () => handleNavigate('/admin/logs'),
      category: 'navigation',
    },
    {
      key: 'G H',
      description: 'Go to Health',
      icon: FiHelpCircle, // Assuming FiHelpCircle is the correct icon for health
      action: () => handleNavigate('/admin/health'),
      category: 'navigation',
    },
    // Action shortcuts
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      icon: FiHelpCircle,
      action: onOpen,
      category: 'help',
    },
    {
      key: 'Esc',
      description: 'Close modals / Cancel',
      icon: FiX,
      category: 'actions',
    },
  ];

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Help shortcut
      if (event.key === '?') {
        event.preventDefault();
        onOpen();
      }

      // Navigation shortcuts (G + letter)
      if (event.key.toLowerCase() === 'g') {
        const nextKey = event.key.toLowerCase();
        setTimeout(() => {
          const handleNextKey = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === nextKey) {
              const shortcut = shortcuts.find(s => s.key === `G ${nextKey.toUpperCase()}`);
              if (shortcut?.action) {
                shortcut.action();
              }
            }
            document.removeEventListener('keydown', handleNextKey);
          };
          document.addEventListener('keydown', handleNextKey);
        }, 100);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, onOpen]);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  const categoryLabels = {
    navigation: 'Navigation',
    search: 'Search',
    actions: 'Actions',
    help: 'Help',
  };

  const categoryIcons = {
    navigation: FiNavigation,
    search: FiSearch,
    actions: FiSettings,
    help: FiHelpCircle,
  };

  return (
    <>
      {/* Help button */}
      <Box
        as="button"
        onClick={onOpen}
        p={2}
        borderRadius="md"
        _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
        transition="background-color 0.2s"
        title="Keyboard shortcuts (?)"
      >
        <Icon as={FiHelpCircle} boxSize={4} />
      </Box>

      {/* Shortcuts modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg={bgColor} borderColor={borderColor}>
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={FiHelpCircle} color="brand.500" />
              <Text>Keyboard Shortcuts</Text>
            </HStack>
          </ModalHeader>
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <Box key={category}>
                  <HStack spacing={2} mb={3}>
                    <Icon as={categoryIcons[category as keyof typeof categoryIcons]} color="brand.500" />
                    <Text fontWeight="semibold" fontSize="lg">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </Text>
                  </HStack>
                  <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={3}>
                    {categoryShortcuts.map((shortcut) => (
                      <GridItem key={shortcut.key}>
                        <HStack
                          spacing={3}
                          p={3}
                          borderRadius="md"
                          bg={useColorModeValue('gray.50', 'gray.700')}
                          _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                          cursor={shortcut.action ? 'pointer' : 'default'}
                          onClick={shortcut.action}
                          transition="background-color 0.2s"
                        >
                          <Icon as={shortcut.icon} boxSize={4} color="gray.500" />
                          <Text fontSize="sm" flex={1}>
                            {shortcut.description}
                          </Text>
                          <Kbd fontSize="xs">{shortcut.key}</Kbd>
                        </HStack>
                      </GridItem>
                    ))}
                  </Grid>
                </Box>
              ))}
            </VStack>

            {/* Footer */}
            <Box mt={6} pt={4} borderTop="1px solid" borderColor={borderColor}>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Press ? anytime to show this help
              </Text>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
