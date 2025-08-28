import React, { useState, useRef, useEffect } from 'react';
import {
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Box,
  VStack,
  Text,
  List,
  ListItem,
  useOutsideClick,
  useColorModeValue
} from '@chakra-ui/react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { SearchBarProps } from '../../types/image-selection';

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  suggestions = [],
  onSuggestionSelect
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // Close suggestions when clicking outside
  useOutsideClick({
    ref: suggestionsRef,
    handler: () => setShowSuggestions(false)
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(newValue.length > 0 && suggestions.length > 0);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsFocused(true);
    if (value.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    onSuggestionSelect?.(suggestion);
    inputRef.current?.blur();
  };

  // Handle clear button click
  const handleClearClick = () => {
    onChange('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <Box position="relative" width="100%" maxW="400px">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <FaSearch color="gray.400" />
        </InputLeftElement>
        
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          borderRadius="full"
          borderWidth="2px"
          borderColor={isFocused ? 'blue.400' : borderColor}
          _focus={{
            borderColor: 'blue.400',
            boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)'
          }}
          _hover={{
            borderColor: 'gray.300'
          }}
          transition="all 0.2s"
          pr={value ? '40px' : undefined}
        />
        
        {value && (
          <InputRightElement>
            <IconButton
              aria-label="Clear search"
              icon={<FaTimes />}
              size="sm"
              variant="ghost"
              onClick={handleClearClick}
              color="gray.400"
              _hover={{ color: 'gray.600' }}
            />
          </InputRightElement>
        )}
      </InputGroup>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <Box
          ref={suggestionsRef}
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={1000}
          mt={1}
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="lg"
          boxShadow="lg"
          maxH="200px"
          overflowY="auto"
        >
          <List spacing={0}>
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={index}
                px={4}
                py={2}
                cursor="pointer"
                _hover={{ bg: hoverBg }}
                onClick={() => handleSuggestionClick(suggestion)}
                borderBottom={index < suggestions.length - 1 ? '1px solid' : 'none'}
                borderColor={borderColor}
                transition="background-color 0.2s"
              >
                <Text fontSize="sm" noOfLines={1}>
                  {suggestion}
                </Text>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default SearchBar;
