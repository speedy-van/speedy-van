/**
 * Smart Search Box Component
 * Advanced search with autocomplete, real-time suggestions, and +/- controls
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Flex,
  Badge,
  Portal,
  useOutsideClick,
  Icon,
  Divider
} from '@chakra-ui/react';
import { FaSearch, FaTimes, FaPlus, FaMinus, FaBrain } from 'react-icons/fa';
import { getAutocomplete, getSuggestions, type SearchSuggestion } from '../../../lib/search/smart-search';
import { isNaturalLanguageQuery, parseNaturalLanguage } from '../../../lib/search/natural-language-parser';
import { convertPopularToItem } from '../../../lib/items/popular-items';
import NLPResultsDisplay from './NLPResultsDisplay';
import type { Item } from '../hooks/useBookingForm';

interface SmartSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onItemAdd: (item: Item) => void;
  onItemUpdate: (itemId: string, quantity: number) => void;
  onAddItems: (items: Item[]) => void; // For bulk adding from NLP
  selectedItems: Item[];
  placeholder?: string;
}

export const SmartSearchBox: React.FC<SmartSearchBoxProps> = ({
  value,
  onChange,
  onItemAdd,
  onItemUpdate,
  onAddItems,
  selectedItems,
  placeholder = "Search for furniture, appliances, boxes... (e.g., 'sofa', 'heavy items', 'kitchen')"
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<SearchSuggestion[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inlineCompletion, setInlineCompletion] = useState('');
  const [showNLPAnalysis, setShowNLPAnalysis] = useState(true); // State to control NLP display
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Close suggestions when clicking outside
  useOutsideClick({
    ref: containerRef,
    handler: () => {
      // Add delay to prevent immediate closing when clicking inside suggestions
      setTimeout(() => {
        setIsFocused(false);
        setHighlightedIndex(-1);
      }, 100);
    }
  });

  // Handle keyboard events for better mobile experience
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsFocused(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const totalSuggestions = autocompleteSuggestions.length + suggestions.length;
      setHighlightedIndex(prev => Math.min(prev + 1, totalSuggestions - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      // Handle selection based on highlighted index
      if (highlightedIndex < autocompleteSuggestions.length) {
        const suggestion = autocompleteSuggestions[highlightedIndex];
        onChange(suggestion.text);
        setInlineCompletion('');
      } else {
        const suggestion = suggestions[highlightedIndex - autocompleteSuggestions.length];
        if (suggestion.item) {
          const item = convertCatalogToItem(suggestion.item);
          onItemAdd(item);
          onChange('');
        }
      }
      setIsFocused(false);
      setHighlightedIndex(-1);
    }
  }, [highlightedIndex, autocompleteSuggestions, suggestions, onChange, onItemAdd]);

  // Handle mobile keyboard behavior
  useEffect(() => {
    const handleResize = () => {
      // Recalculate position when viewport changes (keyboard open/close)
      if (isFocused && suggestionsRef.current) {
        const inputRect = inputRef.current?.getBoundingClientRect();
        if (inputRect) {
          const viewportHeight = window.innerHeight;
          const suggestionsHeight = 200;
          const spaceBelow = viewportHeight - inputRect.bottom;
          const spaceAbove = inputRect.top;
          
          if (spaceBelow < suggestionsHeight && spaceAbove > spaceBelow) {
            // Show above if keyboard is open and there's more space above
            suggestionsRef.current.style.top = `${Math.max(8, inputRect.top - suggestionsHeight - 4)}px`;
          } else {
            // Show below
            suggestionsRef.current.style.top = `${inputRect.bottom + 4}px`;
          }
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFocused]);

  // Reset NLP analysis visibility when value changes
  useEffect(() => {
    if (value && isNaturalLanguageQuery(value)) {
      setShowNLPAnalysis(true);
    }
  }, [value]);

  // Update suggestions when query changes
  useEffect(() => {
    const updateSuggestions = async () => {
      if (value.length >= 2) {
        const autocomplete = getAutocomplete(value, 6);
        const searchSuggestions = getSuggestions(value, 4);
        
        setAutocompleteSuggestions(autocomplete);
        setSuggestions(searchSuggestions);
        
        // Set inline completion for first exact match
        if (autocomplete.length > 0 && autocomplete[0].text.toLowerCase().startsWith(value.toLowerCase())) {
          const completion = autocomplete[0].text.substring(value.length);
          setInlineCompletion(completion);
        } else {
          setInlineCompletion('');
        }
      } else {
        setAutocompleteSuggestions([]);
        setSuggestions([]);
        setInlineCompletion('');
      }
    };

    const debounceTimer = setTimeout(updateSuggestions, 100);
    return () => clearTimeout(debounceTimer);
  }, [value]);


  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'item' && suggestion.item) {
      // Add item directly
      const item = convertCatalogToItem(suggestion.item);
      onItemAdd(item);
      // Keep suggestions open for more additions
      setTimeout(() => setIsFocused(true), 50);
    } else {
      // Update search query
      onChange(suggestion.text);
      setInlineCompletion('');
      // Keep focus on input
      setTimeout(() => {
        inputRef.current?.focus();
        setIsFocused(true);
      }, 50);
    }
  };

  // Handle mouse enter/leave to maintain focus
  const handleSuggestionsMouseEnter = () => {
    setIsFocused(true);
  };

  const handleSuggestionsMouseLeave = () => {
    // Don't close immediately, let user click
  };

  // Convert catalog item to Item format
  const convertCatalogToItem = (catalogItem: any): Item => {
    return {
      id: catalogItem.id,
      name: catalogItem.name,
      description: `${catalogItem.name} - ${catalogItem.keywords.split(',')[0]}`,
      category: catalogItem.category,
      size: catalogItem.volume > 1.5 ? 'large' : catalogItem.volume > 0.5 ? 'medium' : 'small',
      quantity: 1,
      unitPrice: Math.round(catalogItem.volume * 20 + catalogItem.weight * 0.5),
      totalPrice: Math.round(catalogItem.volume * 20 + catalogItem.weight * 0.5),
      weight: catalogItem.weight,
      volume: catalogItem.volume,
      image: `/items/${catalogItem.category}/${catalogItem.id}.png`,
    };
  };

  // Get current quantity for an item
  const getItemQuantity = (itemId: string): number => {
    return selectedItems.find(item => item.id === itemId)?.quantity || 0;
  };

  // Handle item quantity change
  const handleQuantityChange = (itemId: string, change: number) => {
    const currentQuantity = getItemQuantity(itemId);
    const newQuantity = Math.max(0, currentQuantity + change);
    onItemUpdate(itemId, newQuantity);
  };

  return (
    <Box ref={containerRef} position="relative" w="100%">
      {/* Search Input with Inline Completion */}
      <InputGroup size="lg">
        <Box position="relative" flex="1">
          {/* Background text for inline completion */}
          {inlineCompletion && (
            <Text
              position="absolute"
              left="16px" // No search icon, so adjust position
              top="50%"
              transform="translateY(-50%)"
              fontSize="md"
              color="gray.400"
              pointerEvents="none"
              zIndex={1}
              whiteSpace="nowrap"
            >
              {value + inlineCompletion}
            </Text>
          )}
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setInlineCompletion('');
            }}
            onFocus={() => {
              setIsFocused(true);
              setHighlightedIndex(-1);
            }}
            onBlur={(e) => {
              // Only close if not clicking inside suggestions
              if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
                setTimeout(() => setIsFocused(false), 150);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            bg="white"
            border="2px solid"
            borderColor={isFocused ? "blue.300" : "gray.200"}
            borderRadius="xl"
            fontSize="md"
            position="relative"
            zIndex={2}
            _hover={{ borderColor: "blue.200" }}
            _focus={{ 
              borderColor: "blue.400", 
              boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" 
            }}
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </Box>
        {value && (
          <InputRightElement>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Clear search"
              icon={<FaTimes />}
              onClick={() => {
                onChange('');
                setInlineCompletion('');
                inputRef.current?.focus();
              }}
              color="gray.400"
              _hover={{ color: "gray.600" }}
            />
          </InputRightElement>
        )}
      </InputGroup>

      {/* Search Suggestions Dropdown */}
      {isFocused && value.length >= 2 && (autocompleteSuggestions.length > 0 || suggestions.length > 0) && (
        <Portal>
          <Box
            ref={suggestionsRef}
            position="fixed"
            bg="white"
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.200"
            boxShadow="xl"
            zIndex={9999}
            maxH={{ base: "200px", md: "280px" }}
            overflowY="auto"
            w={{ base: "calc(100vw - 32px)", md: "90%" }}
            maxW={{ base: "343px", md: "600px" }}
            onMouseEnter={handleSuggestionsMouseEnter}
            onMouseLeave={handleSuggestionsMouseLeave}
            style={{
              top: inputRef.current ? (() => {
                const inputRect = inputRef.current.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const suggestionsHeight = 200; // Base height for mobile
                const spaceBelow = viewportHeight - inputRect.bottom;
                const spaceAbove = inputRect.top;
                
                // If there's enough space below, show below
                if (spaceBelow >= suggestionsHeight) {
                  return inputRect.bottom + window.scrollY + 4;
                }
                // If there's more space above, show above
                else if (spaceAbove > spaceBelow) {
                  return Math.max(8, inputRect.top + window.scrollY - suggestionsHeight - 4);
                }
                // Otherwise, show below but limit height
                else {
                  return inputRect.bottom + window.scrollY + 4;
                }
              })() : 0,
              left: inputRef.current ? (() => {
                const inputRect = inputRef.current.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const suggestionsWidth = Math.min(343, viewportWidth - 32);
                const leftPosition = inputRect.left + window.scrollX;
                
                // Center if possible, otherwise align to input
                if (leftPosition + suggestionsWidth > viewportWidth) {
                  return Math.max(16, viewportWidth - suggestionsWidth - 16) + window.scrollX;
                }
                return leftPosition;
              })() : 0,
            }}
          >
            {/* Autocomplete Suggestions */}
            {autocompleteSuggestions.length > 0 && (
              <VStack spacing={0} align="stretch">
                <Box p={2} bg="blue.50" borderTopRadius="lg">
                  <Text fontSize="xs" fontWeight="semibold" color="blue.600">
                    💡 Complete with Tab or Enter
                  </Text>
                </Box>
                {autocompleteSuggestions.slice(0, 3).map((suggestion, index) => (
                  <Box
                    key={suggestion.id}
                    p={2}
                    cursor="pointer"
                    bg={highlightedIndex === index ? "blue.50" : "white"}
                    _hover={{ bg: "blue.50" }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSuggestionClick(suggestion);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        {suggestion.text}
                      </Text>
                      {suggestion.item && (
                        <Badge size="sm" colorScheme="blue" variant="subtle">
                          {suggestion.item.category}
                        </Badge>
                      )}
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}

            {/* Search Results with +/- Controls */}
            {suggestions.length > 0 && (
              <VStack spacing={0} align="stretch">
                {autocompleteSuggestions.length > 0 && <Divider />}
                <Box p={2} bg="green.50" borderBottomRadius="lg">
                  <Text fontSize="xs" fontWeight="semibold" color="green.600">
                    ⚡ Quick Add Items
                  </Text>
                </Box>
                {suggestions.slice(0, 4).map((suggestion, index) => {
                  const adjustedIndex = index + autocompleteSuggestions.length;
                  const currentQuantity = suggestion.item ? getItemQuantity(suggestion.item.id) : 0;
                  
                  return (
                    <Box
                      key={suggestion.id}
                      p={2}
                      bg={highlightedIndex === adjustedIndex ? "green.50" : "white"}
                      _hover={{ bg: "green.50" }}
                      borderBottomRadius={index === Math.min(suggestions.length - 1, 3) ? "lg" : "none"}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <Flex justify="space-between" align="center">
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontSize="sm" fontWeight="medium" color="gray.800">
                            {suggestion.text}
                          </Text>
                          {suggestion.item && (
                            <HStack spacing={2}>
                              <Badge size="sm" colorScheme="green" variant="subtle">
                                {suggestion.item.category}
                              </Badge>
                              <Text fontSize="xs" color="gray.500">
                                {suggestion.item.weight}kg
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                        
                        {/* Compact Quantity Controls */}
                        {suggestion.item && (
                          <HStack spacing={1}>
                            {currentQuantity > 0 && (
                              <>
                                <IconButton
                                  size="xs"
                                  colorScheme="red"
                                  variant="ghost"
                                  aria-label="Decrease"
                                  icon={<FaMinus />}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleQuantityChange(suggestion.item!.id, -1);
                                  }}
                                  onMouseDown={(e) => e.preventDefault()}
                                />
                                <Text fontSize="xs" fontWeight="bold" color="blue.600" minW="16px" textAlign="center">
                                  {currentQuantity}
                                </Text>
                              </>
                            )}
                            
                            <IconButton
                              size="xs"
                              colorScheme="green"
                              variant="ghost"
                              aria-label="Add"
                              icon={<FaPlus />}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (currentQuantity === 0) {
                                  const item = convertCatalogToItem(suggestion.item!);
                                  onItemAdd(item);
                                } else {
                                  handleQuantityChange(suggestion.item!.id, 1);
                                }
                              }}
                              onMouseDown={(e) => e.preventDefault()}
                            />
                          </HStack>
                        )}
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </Box>
        </Portal>
      )}

      {/* Search Results Count */}
      {value && !isNaturalLanguageQuery(value) && (suggestions.length > 0 || autocompleteSuggestions.length > 0) && (
        <Text fontSize="xs" color="gray.600" mt={1} pl={2}>
          {suggestions.length + autocompleteSuggestions.length} suggestions found
        </Text>
      )}

      {/* Natural Language Processing Results */}
      {value && isNaturalLanguageQuery(value) && showNLPAnalysis && (
        <NLPResultsDisplay
          query={value}
          onAddItems={onAddItems}
          onAddSingleItem={onItemAdd}
          onClose={() => setShowNLPAnalysis(false)}
          selectedItems={selectedItems}
        />
      )}

      {/* Show button to reopen NLP analysis if hidden */}
      {value && isNaturalLanguageQuery(value) && !showNLPAnalysis && (
        <Box textAlign="center" mt={2}>
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            leftIcon={<Icon as={FaBrain} />}
            onClick={() => setShowNLPAnalysis(true)}
          >
            Show Smart Analysis
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SmartSearchBox;
