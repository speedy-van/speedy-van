/**
 * Reusable Autocomplete Input Component
 * Provides autocomplete functionality for addresses and items
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  List,
  ListItem,
  Text,
  Spinner,
  Icon,
  useColorModeValue,
  useOutsideClick,
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaSearch, FaTimes } from 'react-icons/fa';

export interface AutocompleteSuggestion {
  id: string;
  text: string;
  description?: string;
  metadata?: any;
}

interface AutocompleteInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: AutocompleteSuggestion) => void;
  searchFunction: (query: string) => Promise<AutocompleteSuggestion[]>;
  leftIcon?: React.ElementType;
  rightIcon?: React.ElementType;
  isInvalid?: boolean;
  isDisabled?: boolean;
  debounceMs?: number;
  minQueryLength?: number;
  maxSuggestions?: number;
  showClearButton?: boolean;
  loadingText?: string;
  noResultsText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  placeholder = 'Type to search...',
  value,
  onChange,
  onSelect,
  searchFunction,
  leftIcon = FaSearch,
  rightIcon,
  isInvalid = false,
  isDisabled = false,
  debounceMs = 300,
  minQueryLength = 2,
  maxSuggestions = 10,
  showClearButton = true,
  loadingText = 'Searching...',
  noResultsText = 'No results found',
  size = 'md',
}) => {
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const selectedBgColor = useColorModeValue('blue.50', 'blue.900');

  // Close dropdown when clicking outside
  useOutsideClick({
    ref: listRef,
    handler: () => setIsOpen(false),
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    async (query: string) => {
      if (query.length < minQueryLength) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchFunction(query);
        setSuggestions(results.slice(0, maxSuggestions));
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Autocomplete search error:', error);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    },
    [searchFunction, minQueryLength, maxSuggestions]
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      debouncedSearch(newValue);
    }, debounceMs);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: AutocompleteSuggestion) => {
    onChange(suggestion.text);
    onSelect?.(suggestion);
    setIsOpen(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Clear input
  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle input focus
  const handleFocus = () => {
    if (value.length >= minQueryLength && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <Box position="relative" w="full">
      <InputGroup size={size}>
        {leftIcon && (
          <InputLeftElement>
            <Icon as={leftIcon} color="gray.400" />
          </InputLeftElement>
        )}
        
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          isInvalid={isInvalid}
          isDisabled={isDisabled}
          autoComplete="off"
        />
        
        <InputRightElement>
          {isLoading ? (
            <Spinner size="sm" color="gray.400" />
          ) : showClearButton && value ? (
            <Icon
              as={FaTimes}
              color="gray.400"
              cursor="pointer"
              onClick={handleClear}
              _hover={{ color: 'gray.600' }}
            />
          ) : rightIcon ? (
            <Icon as={rightIcon} color="gray.400" />
          ) : null}
        </InputRightElement>
      </InputGroup>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <Box
          ref={listRef}
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={1000}
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          boxShadow="lg"
          maxH="300px"
          overflowY="auto"
          mt={1}
        >
          {isLoading ? (
            <Box p={4} textAlign="center">
              <Spinner size="sm" mr={2} />
              <Text fontSize="sm" color="gray.600">
                {loadingText}
              </Text>
            </Box>
          ) : suggestions.length > 0 ? (
            <List>
              {suggestions.map((suggestion, index) => (
                <ListItem
                  key={suggestion.id}
                  p={3}
                  cursor="pointer"
                  bg={index === selectedIndex ? selectedBgColor : 'transparent'}
                  _hover={{ bg: hoverBgColor }}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  borderBottom={index < suggestions.length - 1 ? '1px solid' : 'none'}
                  borderColor={borderColor}
                >
                  <Text fontSize="sm" fontWeight="medium">
                    {suggestion.text}
                  </Text>
                  {suggestion.description && (
                    <Text fontSize="xs" color="gray.600" mt={1}>
                      {suggestion.description}
                    </Text>
                  )}
                </ListItem>
              ))}
            </List>
          ) : value.length >= minQueryLength ? (
            <Box p={4} textAlign="center">
              <Text fontSize="sm" color="gray.600">
                {noResultsText}
              </Text>
            </Box>
          ) : null}
        </Box>
      )}
    </Box>
  );
};

export default AutocompleteInput;
