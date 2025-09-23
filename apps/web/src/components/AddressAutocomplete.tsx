'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
  Icon,
  Badge,
  Portal,
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaBuilding, FaArrowRight, FaStar, FaClock, FaHeart, FaTimes } from 'react-icons/fa';
import { addressAutocompleteService, type AddressSuggestion as MapboxSuggestion } from '../lib/location-services';

export type Coordinates = { lat: number; lng: number };

export type SelectedAddress = {
  address: string;
  city: string;
  postcode: string;
  coordinates: Coordinates;
  houseNumber?: string;
  flatNumber?: string;
  formatted_address: string;
  place_name: string;
};

interface AddressAutocompleteProps {
  value: string;
  onSelect: (address: SelectedAddress) => void;
  placeholder: string;
}

// Cache for address suggestions to improve performance
const addressCache = new Map<string, { suggestions: MapboxSuggestion[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Enhanced recent searches with metadata
interface RecentSearch {
  address: string;
  timestamp: number;
  type: 'pickup' | 'dropoff' | 'general';
  coordinates?: { lat: number; lng: number };
}

const AddressAutocomplete = ({ 
  value, 
  onSelect, 
  placeholder
}: AddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [favoriteAddresses, setFavoriteAddresses] = useState<RecentSearch[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent searches and favorites from localStorage
  useEffect(() => {
    const savedRecent = localStorage.getItem('speedy_van_recent_addresses');
    const savedFavorites = localStorage.getItem('speedy_van_favorite_addresses');
    
    if (savedRecent) {
      try {
        const recentData = JSON.parse(savedRecent);
        // Filter out old searches (older than 30 days)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const filteredRecent = recentData.filter((search: RecentSearch) => 
          search.timestamp > thirtyDaysAgo
        );
        setRecentSearches(filteredRecent);
      } catch (e) {
        console.warn('Failed to parse recent addresses:', e);
      }
    }
    
    if (savedFavorites) {
      try {
        setFavoriteAddresses(JSON.parse(savedFavorites));
      } catch (e) {
        console.warn('Failed to parse favorite addresses:', e);
      }
    }
  }, []);

  // Enhanced save recent search with metadata
  const saveRecentSearch = (address: string, coordinates?: { lat: number; lng: number }, type: 'pickup' | 'dropoff' | 'general' = 'general') => {
    const newSearch: RecentSearch = {
      address,
      timestamp: Date.now(),
      type,
      coordinates
    };
    
    const updated = [newSearch, ...recentSearches.filter(a => a.address !== address)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('speedy_van_recent_addresses', JSON.stringify(updated));
  };

  // Save favorite address
  const saveFavoriteAddress = (address: string, coordinates?: { lat: number; lng: number }, type: 'pickup' | 'dropoff' | 'general' = 'general') => {
    const newFavorite: RecentSearch = {
      address,
      timestamp: Date.now(),
      type,
      coordinates
    };
    
    const updated = [newFavorite, ...favoriteAddresses.filter(a => a.address !== address)].slice(0, 5);
    setFavoriteAddresses(updated);
    localStorage.setItem('speedy_van_favorite_addresses', JSON.stringify(updated));
  };

  // Remove from favorites
  const removeFavoriteAddress = (address: string) => {
    const updated = favoriteAddresses.filter(a => a.address !== address);
    setFavoriteAddresses(updated);
    localStorage.setItem('speedy_van_favorite_addresses', JSON.stringify(updated));
  };

  // Check cache for existing suggestions
  const getCachedSuggestions = (query: string): MapboxSuggestion[] | null => {
    const cached = addressCache.get(query.toLowerCase());
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.suggestions;
    }
    return null;
  };

  // Save suggestions to cache
  const saveToCache = (query: string, suggestions: MapboxSuggestion[]) => {
    addressCache.set(query.toLowerCase(), {
      suggestions,
      timestamp: Date.now()
    });
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setError(null); // Clear error immediately when user starts typing
    setSelectedIndex(-1);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (newValue.length > 2) {
      // Check cache first
      const cachedSuggestions = getCachedSuggestions(newValue);
      if (cachedSuggestions) {
        setSuggestions(cachedSuggestions);
        setShowSuggestions(true);
        setError(null); // Clear error when showing cached suggestions
        return;
      }

      setIsLoading(true);
      // Improved debounce - reduced from 300ms to 200ms
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await addressAutocompleteService.searchAddresses(newValue, {
            limit: 10, // Increased limit for better suggestions
            types: ['address', 'poi', 'place']
          });
          
          // Save to cache
          saveToCache(newValue, results);
          
          setSuggestions(results);
          setShowSuggestions(true);
          // Only set error if we have no results AND the input hasn't changed
          if (results.length === 0 && inputValue === newValue) {
            setError('No addresses found. Try being more specific or check spelling.');
          }
        } catch (error) {
          console.error('Address search error:', error);
          // Only set error if the input hasn't changed
          if (inputValue === newValue) {
            setError('Unable to search addresses. Please check your connection and try again.');
          }
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 200); // Improved debounce timing
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      setError(null); // Clear error when input is too short
      if (newValue.length > 0 && newValue.length < 3) {
        setError('Please enter at least 3 characters');
      }
    }
  };

  const handleSelectSuggestion = async (suggestion: MapboxSuggestion) => {
    try {
      setIsLoading(true);
      setError(null); // Clear any existing error immediately

      // Get detailed address information
      const details = await addressAutocompleteService.getAddressDetails(suggestion);

      const addressString = details.formatted;
      setInputValue(addressString);
      
      // Provide complete address structure for pricing calculation
      const addressData: SelectedAddress = {
        address: details.components.street || suggestion.text,
        city: details.components.city || 'Unknown City',
        postcode: details.components.postcode || '',
        coordinates: details.coordinates,
        houseNumber: details.components.houseNumber || '',
        flatNumber: '',
        formatted_address: addressString,
        place_name: suggestion.place_name,
      };
      
      // Save to recent searches with enhanced metadata
      saveRecentSearch(addressString, details.coordinates, 'general');
      
      console.log('📍 Address selected with coordinates:', {
        address: addressData.address,
        postcode: addressData.postcode,
        coordinates: addressData.coordinates,
        formatted_address: addressData.formatted_address
      });
      
      onSelect(addressData);

      setShowSuggestions(false);
      setSelectedIndex(-1);
      setError(null); // Ensure error is cleared after successful selection
    } catch (error) {
      console.error('Error selecting address:', error);
      setError('Unable to get address details. Please try another address.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Update position on scroll/resize
  useEffect(() => {
    const handleScroll = () => {
      if (showSuggestions && inputRef.current && suggestionsRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        suggestionsRef.current.style.top = `${rect.bottom + 8}px`;
        suggestionsRef.current.style.left = `${rect.left}px`;
        suggestionsRef.current.style.width = `${rect.width}px`;
      }
    };

    if (showSuggestions) {
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [showSuggestions]);

  return (
    <Box position="relative">
      <InputGroup>
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          onFocus={() => {
            if (suggestions.length > 0 || error) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => {
              setShowSuggestions(false);
              // Clear error when suggestions are hidden and we have valid input
              if (inputValue.length > 2 && suggestions.length > 0) {
                setError(null);
              }
            }, 200);
          }}
          borderColor={error ? "red.300" : "gray.200"}
          _hover={{
            borderColor: error ? "red.400" : "blue.300",
          }}
          _focus={{
            borderColor: error ? "red.500" : "blue.500",
            boxShadow: error ? "0 0 0 1px #E53E3E" : "0 0 0 1px #3182CE",
          }}
        />
        {isLoading && (
          <InputRightElement>
            <Spinner size="sm" color="blue.500" />
          </InputRightElement>
        )}
      </InputGroup>
      
      {error && (
        <Text color="red.500" fontSize="sm" mt={1}>
          {error}
        </Text>
      )}
      
      {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0 || favoriteAddresses.length > 0 || error) && (
        <Portal>
          <Box
            ref={suggestionsRef}
            position="fixed"
            bg="white"
            border="2px solid"
            borderColor="blue.200"
            borderRadius="xl"
            shadow="2xl"
            zIndex={99999}
            maxH="500px"
            overflowY="auto"
            p={3}
            _hover={{
              shadow: "xl"
            }}
            role="listbox"
            style={{
              top: inputRef.current ? inputRef.current.getBoundingClientRect().bottom + 8 : 0,
              left: inputRef.current ? inputRef.current.getBoundingClientRect().left : 0,
              width: inputRef.current ? inputRef.current.getBoundingClientRect().width : 'auto',
            }}
          >
            {/* Favorites Section */}
            {favoriteAddresses.length > 0 && inputValue.length <= 2 && (
              <VStack align="stretch" spacing={2} mb={4}>
                <HStack spacing={2} mb={2}>
                  <Icon as={FaStar} color="yellow.500" />
                  <Text fontSize="sm" fontWeight="bold" color="gray.700">
                    Favorite Addresses
                  </Text>
                </HStack>
                {favoriteAddresses.slice(0, 3).map((favorite, index) => (
                  <Box
                    key={`favorite-${index}`}
                    p={3}
                    cursor="pointer"
                    _hover={{ 
                      bg: 'yellow.50',
                      transform: 'scale(1.01)',
                      shadow: 'md'
                    }}
                    onClick={() => {
                      setInputValue(favorite.address);
                      setShowSuggestions(false);
                    }}
                    borderRadius="md"
                    bg="yellow.50"
                    border="1px solid"
                    borderColor="yellow.200"
                    transition="all 0.2s ease"
                  >
                    <HStack spacing={2} width="100%">
                      <Icon as={FaHeart} color="red.500" />
                      <Box flex={1}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                          {favorite.address}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {favorite.type === 'pickup' ? 'Pickup' : favorite.type === 'dropoff' ? 'Dropoff' : 'General'}
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}

            {/* Recent Searches Section */}
            {recentSearches.length > 0 && inputValue.length <= 2 && (
              <VStack align="stretch" spacing={2} mb={4}>
                <HStack spacing={2} mb={2}>
                  <Icon as={FaClock} color="blue.500" />
                  <Text fontSize="sm" fontWeight="bold" color="gray.700">
                    Recent Searches
                  </Text>
                </HStack>
                {recentSearches.slice(0, 3).map((recent, index) => (
                  <Box
                    key={`recent-${index}`}
                    p={3}
                    cursor="pointer"
                    _hover={{ 
                      bg: 'blue.50',
                      transform: 'scale(1.01)',
                      shadow: 'md'
                    }}
                    onClick={() => {
                      setInputValue(recent.address);
                      setShowSuggestions(false);
                    }}
                    borderRadius="md"
                    bg="blue.50"
                    border="1px solid"
                    borderColor="blue.200"
                    transition="all 0.2s ease"
                  >
                    <HStack spacing={2} width="100%">
                      <Icon as={FaClock} color="blue.500" />
                      <Box flex={1}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                          {recent.address}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {new Date(recent.timestamp).toLocaleDateString()}
                        </Text>
                      </Box>
                      <IconButton
                        aria-label="Add to favorites"
                        icon={<Icon as={FaStar} />}
                        size="xs"
                        colorScheme="yellow"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          saveFavoriteAddress(recent.address, recent.coordinates, recent.type);
                        }}
                      />
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}

            {/* Search Results Section */}
            {suggestions.length > 0 && (
              <VStack align="stretch" spacing={2}>
                <HStack spacing={2} mb={2}>
                  <Icon as={FaMapMarkerAlt} color="green.500" />
                  <Text fontSize="sm" fontWeight="bold" color="gray.700">
                    Search Results
                  </Text>
                </HStack>
                {suggestions.map((suggestion, index) => (
                  <Box
                    key={index}
                    p={3}
                    cursor="pointer"
                    _hover={{ 
                      bg: 'green.50',
                      transform: 'scale(1.01)',
                      shadow: 'md'
                    }}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    borderRadius="md"
                    mb={index < suggestions.length - 1 ? 2 : 0}
                    transition="all 0.2s ease"
                    bg="green.50"
                    border="1px solid"
                    borderColor="green.200"
                    role="option"
                    aria-selected={selectedIndex === index}
                  >
                    <VStack align="start" spacing={1.5}>
                      <HStack spacing={2} width="100%">
                        <Icon as={FaMapMarkerAlt} color="green.500" />
                        <Box flex={1}>
                          <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                            {suggestion.text}
                          </Text>
                          <HStack spacing={2} fontSize="xs" color="gray.600">
                            <Icon as={FaBuilding} />
                            <Text fontWeight="medium">{suggestion.place_name}</Text>
                          </HStack>
                        </Box>
                        <IconButton
                          aria-label="Select address"
                          icon={<Icon as={FaArrowRight} />}
                          size="sm"
                          colorScheme="green"
                          variant="ghost"
                          opacity={0}
                          _groupHover={{ opacity: 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSuggestion(suggestion);
                          }}
                        />
                      </HStack>
                      {suggestion.place_name && suggestion.place_name !== suggestion.text && (
                        <HStack spacing={2} fontSize="xs" color="gray.500">
                          <Icon as={FaMapMarkerAlt} boxSize="12px" />
                          <Text fontStyle="italic">{suggestion.place_name}</Text>
                        </HStack>
                      )}
                      <HStack spacing={2} fontSize="xs" color="gray.400">
                        <Icon as={FaMapMarkerAlt} boxSize="12px" />
                        <Text fontFamily="mono">
                          {suggestion.center[1].toFixed(4)}, {suggestion.center[0].toFixed(4)}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </Portal>
      )}
    </Box>
  );
};

export default AddressAutocomplete;
