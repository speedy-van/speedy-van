'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  VStack,
  HStack,
  Text,
  Icon,
  Badge,
  Divider,
  useColorModeValue,
  useDisclosure,
  Kbd,
  Spinner,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiX, FiPackage, FiTruck, FiUsers, FiDollarSign, FiMap } from 'react-icons/fi';

interface SearchResult {
  id: string;
  type: 'order' | 'driver' | 'customer' | 'invoice';
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface GlobalSearchProps {
  placeholder?: string;
}

export function GlobalSearch({ placeholder = "Search orders, drivers, customers..." }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Use neon dark theme colors
  const bgColor = 'bg.surface';
  const borderColor = 'border.primary';

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Real search implementation - calls API to search database
  const performSearch = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery.trim()) return [];

    try {
      const response = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Search request failed');
      }
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }, []);

  // Handle search
  useEffect(() => {
    if (!mounted) return;
    
    const searchTimeout = setTimeout(async () => {
      if (query.trim()) {
        setIsLoading(true);
        try {
          const searchResults = await performSearch(query);
          setResults(searchResults);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, performSearch, mounted]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!mounted) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onOpen();
        setTimeout(() => inputRef.current?.focus(), 100);
      }

      // Escape to close
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }

      // Arrow keys for navigation
      if (isOpen && results.length > 0) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (event.key === 'Enter') {
          event.preventDefault();
          const selectedResult = results[selectedIndex];
          if (selectedResult) {
            router.push(selectedResult.href);
            onClose();
            setQuery('');
            setSelectedIndex(0);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, router, onOpen, onClose, mounted]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Box>
        <InputGroup size="sm">
          <InputLeftElement>
            <Icon as={FiSearch} color="text.tertiary" />
          </InputLeftElement>
          <Input
            placeholder={placeholder}
            readOnly
            bg="bg.input"
            borderColor={borderColor}
            _hover={{ borderColor: 'neon.500' }}
            cursor="pointer"
            color="text.secondary"
            _placeholder={{ color: 'text.tertiary' }}
          />
          <InputRightElement>
            <Kbd fontSize="xs" bg="bg.surface.elevated" color="text.secondary" borderColor="border.primary">⌘K</Kbd>
          </InputRightElement>
        </InputGroup>
      </Box>
    );
  }

  const handleResultClick = (result: SearchResult) => {
    router.push(result.href);
    onClose();
    setQuery('');
    setSelectedIndex(0);
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'order': return 'blue';
      case 'driver': return 'green';
      case 'customer': return 'purple';
      case 'invoice': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <>
      {/* Search trigger */}
      <Box onClick={onOpen} cursor="pointer">
        <InputGroup size="sm">
          <InputLeftElement>
            <Icon as={FiSearch} color="text.tertiary" />
          </InputLeftElement>
          <Input
            placeholder={placeholder}
            readOnly
            bg="bg.input"
            borderColor={borderColor}
            _hover={{ borderColor: 'neon.500' }}
            cursor="pointer"
            color="text.secondary"
            _placeholder={{ color: 'text.tertiary' }}
          />
          <InputRightElement>
            <Kbd fontSize="xs" bg="bg.surface.elevated" color="text.secondary" borderColor="border.primary">⌘K</Kbd>
          </InputRightElement>
        </InputGroup>
      </Box>

      {/* Search modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg={bgColor} borderColor={borderColor}>
          <ModalBody p={0}>
            <VStack spacing={0}>
              {/* Search input */}
              <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={FiSearch} color="text.tertiary" />
                  </InputLeftElement>
                  <Input
                    ref={inputRef}
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    border="none"
                    _focus={{ boxShadow: 'none' }}
                    fontSize="lg"
                    bg="transparent"
                    color="text.primary"
                    _placeholder={{ color: 'text.tertiary' }}
                  />
                  <InputRightElement>
                    {isLoading ? (
                      <Spinner size="sm" color="neon.500" />
                    ) : (
                      <IconButton
                        size="sm"
                        variant="ghost"
                        icon={<Icon as={FiX} />}
                        onClick={() => setQuery('')}
                        aria-label="Clear search"
                        color="text.secondary"
                        _hover={{ bg: 'bg.surface.hover', color: 'text.primary' }}
                      />
                    )}
                  </InputRightElement>
                </InputGroup>
              </Box>

              {/* Results */}
              <Box w="full" maxH="400px" overflowY="auto">
                {results.length > 0 ? (
                  <VStack spacing={0} align="stretch">
                    {results.map((result, index) => (
                      <Box
                        key={result.id}
                        p={4}
                        cursor="pointer"
                        bg={selectedIndex === index ? 'bg.surface.hover' : 'transparent'}
                        _hover={{ bg: 'bg.surface.hover' }}
                        onClick={() => handleResultClick(result)}
                        transition="background-color 0.2s"
                      >
                        <HStack spacing={3}>
                          <Icon
                            as={result.icon}
                            boxSize={5}
                            color={`${getTypeColor(result.type)}.500`}
                          />
                          <VStack align="start" spacing={1} flex={1}>
                            <HStack spacing={2}>
                              <Text fontWeight="medium" color="text.primary">{result.title}</Text>
                              {result.badge && (
                                <Badge size="sm" colorScheme={getTypeColor(result.type)} variant="solid">
                                  {result.badge}
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="sm" color="text.secondary">
                              {result.subtitle}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                ) : query && !isLoading ? (
                  <Box p={4} textAlign="center">
                    <Text color="text.tertiary">No results found</Text>
                  </Box>
                ) : null}
              </Box>

              {/* Footer */}
              <Box p={3} borderTop="1px solid" borderColor={borderColor} bg="bg.surface.elevated">
                <HStack justify="space-between" fontSize="xs" color="text.tertiary">
                  <Text>Use ↑↓ to navigate, Enter to select</Text>
                  <Text>Esc to close</Text>
                </HStack>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
