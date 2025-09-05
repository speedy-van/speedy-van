'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
  Switch,
  Textarea,
  Badge,
  SimpleGrid,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import {
  FaMapMarkerAlt,
  FaHome,
  FaBuilding,
  FaWarehouse,
  FaPlus,
  FaMinus,
  FaInfoCircle,
  FaSearch,
  FaBoxes,
  FaCalendarAlt,
  FaClock,
  FaTruck,
  FaUser,
  FaStar,
  FaCheck,
} from 'react-icons/fa';
import {
  useUnifiedBooking,
  unifiedBookingSchema,
  UnifiedBookingData,
} from '@/lib/unified-booking-context';
import AddressAutocomplete, {
  AutocompleteSelection,
} from '@/components/AddressAutocomplete';
import { ITEM_CATALOG, ITEM_CATEGORIES } from '@/lib/pricing/item-catalog';
import { format, addDays, isWeekend, isAfter, startOfDay } from 'date-fns';

// Helper functions for date generation
const getNextAvailableDate = () => {
  const tomorrow = addDays(startOfDay(new Date()), 1);
  return format(tomorrow, 'yyyy-MM-dd');
};

const generateAvailableDates = () => {
  const dates = [];
  const today = startOfDay(new Date());

  for (let i = 1; i <= 30; i++) {
    const date = addDays(today, i);
    const isWeekendDay = isWeekend(date);
    const isAfterToday = isAfter(date, today);

    if (isAfterToday) {
      dates.push({
        date: format(date, 'yyyy-MM-dd'),
        label: format(date, 'EEE, MMM dd'),
        isWeekend: isWeekendDay,
        available: true,
      });
    }
  }

  return dates;
};

// Real furniture pricing catalog data
const CATALOG_ITEMS = ITEM_CATALOG.map(item => ({
  id: item.key,
  name: item.name,
  category: item.category,
  price: item.price,
  image: item.image,
  description: item.description || '',
  size: item.size,
  // Add tags based on category and properties for better search
  tags: [
    item.category,
    item.size,
    item.description
      ?.toLowerCase()
      .split(' ')
      .filter(word => word.length > 2) || [],
    // Add specific tags based on item type
    ...(item.name.toLowerCase().includes('bed') ? ['bedroom', 'sleeping'] : []),
    ...(item.name.toLowerCase().includes('sofa') ||
    item.name.toLowerCase().includes('chair')
      ? ['seating', 'living room']
      : []),
    ...(item.name.toLowerCase().includes('table') ? ['dining', 'kitchen'] : []),
    ...(item.name.toLowerCase().includes('cabinet')
      ? ['storage', 'kitchen']
      : []),
    ...(item.name.toLowerCase().includes('tv') ||
    item.name.toLowerCase().includes('computer')
      ? ['entertainment', 'technology']
      : []),
    ...(item.name.toLowerCase().includes('washer') ||
    item.name.toLowerCase().includes('refrigerator')
      ? ['appliance', 'white goods']
      : []),
    ...(item.name.toLowerCase().includes('box') ? ['packing', 'moving'] : []),
    ...(item.name.toLowerCase().includes('wardrobe')
      ? ['clothing', 'storage']
      : []),
  ]
    .flat()
    .filter(Boolean),
}));

// Enhanced AddressAutocomplete with current location
const EnhancedAddressAutocomplete: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSelect: (selection: AutocompleteSelection) => void;
  placeholder: string;
  error?: string;
}> = ({ value, onChange, onSelect, placeholder, error }) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Reverse geocode to get address using our API route
      const response = await fetch(
        `/api/geocoding/reverse?lat=${latitude}&lng=${longitude}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const address = feature.place_name;

          // Create a selection object
          const selection: AutocompleteSelection = {
            id: feature.id,
            label: address,
            address: {
              line1: address.split(',')[0] || '',
              city: '',
              postcode: '',
            },
            coords: { lat: latitude, lng: longitude },
            raw: feature,
          };

          onChange(address);
          onSelect(selection);
        }
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      alert(
        'Unable to get your current location. Please enter your address manually.'
      );
    } finally {
      setIsGettingLocation(false);
    }
  }, [onChange, onSelect]);

  return (
    <Box position="relative">
      <HStack spacing={2}>
        <Box flex={1}>
          <AddressAutocomplete
            value={value}
            onChange={onChange}
            onSelect={onSelect}
            placeholder={placeholder}
            error={error}
          />
        </Box>
        <Button
          size="lg"
          variant="outline"
          colorScheme="neon"
          onClick={handleCurrentLocation}
          isLoading={isGettingLocation}
          loadingText="Getting location..."
          title="Use current location"
        >
          <FaMapMarkerAlt />
        </Button>
      </HStack>
    </Box>
  );
};

// Item picker component
const ItemPicker: React.FC<{
  selectedItems: UnifiedBookingData['items'];
  onItemsChange: (items: UnifiedBookingData['items']) => void;
}> = ({ selectedItems, onItemsChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  const categories = ['all', ...ITEM_CATEGORIES.map(cat => cat.id)];

  // Enhanced search that looks through multiple fields
  const filteredItems = CATALOG_ITEMS.filter(item => {
    const searchLower = searchTerm.toLowerCase();

    // Search through name, category, tags, and properties
    const itemDescription =
      `${item.name} ${item.category} ${item.tags?.join(' ') || ''} ${item.size} ${item.description}`.toLowerCase();

    const matchesSearch =
      searchTerm === '' ||
      item.name.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower) ||
      (item.tags &&
        item.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
      itemDescription.includes(searchLower);

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort items: items with images first, then by name
  const sortedFilteredItems = [...filteredItems].sort((a, b) => {
    // First priority: items with images
    const aHasImage = a.image && a.image !== '/items/misc/add_custom.svg';
    const bHasImage = b.image && b.image !== '/items/misc/add_custom.svg';

    if (aHasImage && !bHasImage) return -1;
    if (!aHasImage && bHasImage) return 1;

    // Second priority: alphabetical by name
    return a.name.localeCompare(b.name);
  });

  // Generate search suggestions based on current input
  useEffect(() => {
    if (searchTerm.length > 0) {
      // Changed from > 1 to > 0 to show suggestions from first character
      const suggestions = new Set<string>();
      const itemSuggestions = new Set<string>();
      const wordCompletions = new Set<string>();

      CATALOG_ITEMS.forEach(item => {
        const itemNameLower = item.name.toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        // Add item names that match (highest priority)
        if (itemNameLower.includes(searchLower)) {
          itemSuggestions.add(item.name);

          // Add word completion suggestions
          if (itemNameLower.startsWith(searchLower)) {
            wordCompletions.add(item.name);
          }
        }

        // Add categories that match
        if (item.category.toLowerCase().includes(searchLower)) {
          const categoryName =
            ITEM_CATEGORIES.find(cat => cat.id === item.category)?.name ||
            item.category;
          suggestions.add(categoryName);

          // Add category completion
          if (categoryName.toLowerCase().startsWith(searchLower)) {
            wordCompletions.add(categoryName);
          }
        }

        // Add tags that match
        if (item.tags) {
          item.tags.forEach(tag => {
            if (tag.toLowerCase().includes(searchLower)) {
              suggestions.add(tag);

              // Add tag completion
              if (tag.toLowerCase().startsWith(searchLower)) {
                wordCompletions.add(tag);
              }
            }
          });
        }

        // Add sizes that match
        if (item.size.toLowerCase().includes(searchLower)) {
          const sizeText = `${item.size} items`;
          suggestions.add(sizeText);

          if (item.size.toLowerCase().startsWith(searchLower)) {
            wordCompletions.add(sizeText);
          }
        }

        // Add descriptions that match
        if (
          item.description &&
          item.description.toLowerCase().includes(searchLower)
        ) {
          suggestions.add(item.description);
        }
      });

      // Add smart suggestions for common patterns
      if (searchTerm.length === 1) {
        // Single character suggestions
        const firstChar = searchTerm.toLowerCase();
        if (firstChar === 's') {
          wordCompletions.add('Sofa');
          wordCompletions.add('Small items');
        } else if (firstChar === 'b') {
          wordCompletions.add('Bed');
          wordCompletions.add('Boxes');
          wordCompletions.add('Big items');
        } else if (firstChar === 't') {
          wordCompletions.add('Table');
          wordCompletions.add('TV');
        } else if (firstChar === 'c') {
          wordCompletions.add('Chair');
          wordCompletions.add('Cabinet');
        } else if (firstChar === 'f') {
          wordCompletions.add('Furniture');
          wordCompletions.add('Fridge');
        }

        // Arabic character suggestions (for Arabic keyboard users)
        if (firstChar === 'ا') {
          wordCompletions.add('Furniture');
          wordCompletions.add('Appliances');
        } else if (firstChar === 'س') {
          wordCompletions.add('Sofa');
          wordCompletions.add('Bed');
        } else if (firstChar === 'ط') {
          wordCompletions.add('Table');
          wordCompletions.add('TV');
        } else if (firstChar === 'ك') {
          wordCompletions.add('Chair');
          wordCompletions.add('Cabinet');
        } else if (firstChar === 'ب') {
          wordCompletions.add('Bed');
          wordCompletions.add('Boxes');
        }
      } else if (searchTerm.length === 2) {
        // Two character suggestions
        const twoChars = searchTerm.toLowerCase();
        if (twoChars === 'so') {
          wordCompletions.add('Sofa');
        } else if (twoChars === 'be') {
          wordCompletions.add('Bed');
        } else if (twoChars === 'ta') {
          wordCompletions.add('Table');
        } else if (twoChars === 'ch') {
          wordCompletions.add('Chair');
        } else if (twoChars === 'tv') {
          wordCompletions.add('TV');
        } else if (twoChars === 'fr') {
          wordCompletions.add('Fridge');
        } else if (twoChars === 'wa') {
          wordCompletions.add('Washing Machine');
        }
      }

      // Combine suggestions: word completions first, then item names, then other suggestions
      const allSuggestions = [
        ...wordCompletions,
        ...itemSuggestions,
        ...suggestions,
      ];
      setSearchSuggestions(allSuggestions.slice(0, 15)); // Increased to 15 to show more suggestions
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSearchSuggestions([]);
    }
  }, [searchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(value.length > 0); // Show suggestions from first character

    // Auto-focus suggestions when typing
    if (value.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Check if this suggestion is an item name from catalog
    const catalogItem = CATALOG_ITEMS.find(item => item.name === suggestion);

    if (catalogItem) {
      // If it's an item, add it directly to selected items
      addItem(catalogItem);
      setSearchTerm(''); // Clear search after adding

      // Show success message
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'item_added_from_search', {
          item_name: catalogItem.name,
          item_price: catalogItem.price,
          item_category: catalogItem.category,
        });
      }
    } else {
      // If it's a category or tag, set it as search term
      setSearchTerm(suggestion);
    }

    setShowSuggestions(false);
  };

  const addItem = (item: (typeof CATALOG_ITEMS)[0]) => {
    const existingItem = selectedItems.find(
      selected => selected.id === item.id
    );

    if (existingItem) {
      // Increase quantity
      const updatedItems = selectedItems.map(selected =>
        selected.id === item.id
          ? { ...selected, quantity: selected.quantity + 1 }
          : selected
      );
      onItemsChange(updatedItems);
    } else {
      // Add new item with catalog data
      const newItem: UnifiedBookingData['items'][0] = {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        image: item.image,
        description: item.description,
        size: item.size,
        tags: item.tags,
        quantity: 1,
      };
      onItemsChange([...selectedItems, newItem]);
    }
  };

  const removeItem = (itemId: string) => {
    const existingItem = selectedItems.find(item => item.id === itemId);

    if (existingItem && existingItem.quantity > 1) {
      // Decrease quantity
      const updatedItems = selectedItems.map(item =>
        item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
      );
      onItemsChange(updatedItems);
    } else {
      // Remove item completely
      onItemsChange(selectedItems.filter(item => item.id !== itemId));
    }
  };

  const getItemQuantity = (itemId: string) => {
    const item = selectedItems.find(item => item.id === itemId);
    return item?.quantity || 0;
  };

  const getTotalPrice = () => {
    return selectedItems.reduce(
      (total, item) => total + (item.price || 0) * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return selectedItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Search and filter */}
      <VStack spacing={2} align="stretch" w="full">
        {/* Search tips */}
        <Box
          p={2}
          bg="blue.50"
          borderRadius="md"
          borderWidth="1px"
          borderColor="blue.200"
        >
          <Text fontSize="xs" color="blue.700" textAlign="center">
            💡 Type any character to see instant suggestions! Items marked with
            ✨ are word completions
          </Text>
        </Box>

        <HStack spacing={4}>
          <Box flex={1} position="relative">
            <Input
              placeholder="Type to search what you're moving"
              value={searchTerm}
              onChange={e => handleSearchChange(e.target.value)}
              onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              size="lg"
              pl={4}
              pr={4}
              textAlign="left"
            />

            {/* Search suggestions dropdown */}
            {showSuggestions && (
              <Box
                position="absolute"
                top="100%"
                left="0"
                zIndex={10}
                bg="bg.card"
                borderWidth="1px"
                borderColor="border.primary"
                borderRadius="md"
                mt={1}
                maxH="300px"
                overflowY="auto"
                boxShadow="lg"
                width="100%"
              >
                {/* Show suggestions */}
                {searchSuggestions.length > 0 && (
                  <>
                    {searchSuggestions.map((suggestion, index) => {
                      // Check if this suggestion is an item name
                      const catalogItem = CATALOG_ITEMS.find(
                        item => item.name === suggestion
                      );
                      const isItemName = !!catalogItem;

                      // Check if this is a word completion (starts with search term)
                      const isWordCompletion = suggestion
                        .toLowerCase()
                        .startsWith(searchTerm.toLowerCase());

                      return (
                        <Box
                          key={index}
                          p={3}
                          cursor="pointer"
                          _hover={{ bg: 'bg.surface' }}
                          onClick={() => handleSuggestionClick(suggestion)}
                          borderBottomWidth={
                            index < searchSuggestions.length - 1 ? '1px' : '0'
                          }
                          borderBottomColor="border.primary"
                          position="relative"
                        >
                          {/* Word completion indicator */}
                          {isWordCompletion && (
                            <Box
                              position="absolute"
                              top="2"
                              sx={{ right: '8px' }}
                              zIndex={1}
                            >
                              <Badge
                                colorScheme="green"
                                size="xs"
                                variant="solid"
                              >
                                ✨
                              </Badge>
                            </Box>
                          )}

                          {isItemName ? (
                            // Show item with image, name, price, and size
                            <HStack spacing={3} align="center">
                              <Box
                                w="40px"
                                h="40px"
                                borderRadius="md"
                                overflow="hidden"
                                flexShrink={0}
                              >
                                {catalogItem.image &&
                                catalogItem.image !==
                                  '/items/misc/add_custom.svg' ? (
                                  <img
                                    src={catalogItem.image}
                                    alt={catalogItem.name}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                    }}
                                    onError={e => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling?.setAttribute(
                                        'style',
                                        'display: flex'
                                      );
                                    }}
                                  />
                                ) : null}
                                <Box
                                  display={
                                    catalogItem.image &&
                                    catalogItem.image !==
                                      '/items/misc/add_custom.svg'
                                      ? 'none'
                                      : 'flex'
                                  }
                                  w="full"
                                  h="full"
                                  bg="bg.surface"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <FaBoxes
                                    size={16}
                                    color="var(--chakra-colors-text-secondary)"
                                  />
                                </Box>
                              </Box>

                              <VStack spacing={1} align="start" flex={1}>
                                <Text
                                  fontSize="sm"
                                  fontWeight="medium"
                                  color="text.primary"
                                >
                                  {catalogItem.name}
                                </Text>
                                <HStack spacing={2}>
                                  <Text
                                    fontSize="xs"
                                    color="neon.400"
                                    fontWeight="bold"
                                  >
                                    £{catalogItem.price}
                                  </Text>
                                  <Badge
                                    size="xs"
                                    colorScheme={
                                      catalogItem.size === 'large'
                                        ? 'red'
                                        : catalogItem.size === 'medium'
                                          ? 'orange'
                                          : 'green'
                                    }
                                  >
                                    {catalogItem.size}
                                  </Badge>
                                </HStack>
                              </VStack>
                            </HStack>
                          ) : (
                            // Show regular suggestion with completion highlight
                            <HStack spacing={2} align="center">
                              {isWordCompletion && (
                                <Box color="green.400">
                                  <Text fontSize="sm">✨</Text>
                                </Box>
                              )}
                              <Text fontSize="sm" color="text.primary" flex={1}>
                                {suggestion}
                              </Text>
                              {isWordCompletion && (
                                <Text
                                  fontSize="xs"
                                  color="green.400"
                                  fontWeight="medium"
                                >
                                  Completion
                                </Text>
                              )}
                            </HStack>
                          )}
                        </Box>
                      );
                    })}

                    {/* Divider */}
                    <Divider />
                  </>
                )}

                {/* Quick add section for common items */}
                <Box p={3}>
                  <Text
                    fontSize="xs"
                    color="text.secondary"
                    mb={2}
                    fontWeight="medium"
                  >
                    💡 Quick Add Common Items:
                  </Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {[
                      'Sofa',
                      'Bed',
                      'Table',
                      'Chair',
                      'TV',
                      'Refrigerator',
                    ].map(commonItem => {
                      const catalogItem = CATALOG_ITEMS.find(item =>
                        item.name
                          .toLowerCase()
                          .includes(commonItem.toLowerCase())
                      );

                      if (catalogItem) {
                        return (
                          <Badge
                            key={commonItem}
                            cursor="pointer"
                            colorScheme="neon"
                            variant="outline"
                            size="sm"
                            _hover={{ bg: 'neon.500', color: 'white' }}
                            onClick={() =>
                              handleSuggestionClick(catalogItem.name)
                            }
                          >
                            {commonItem}
                          </Badge>
                        );
                      }
                      return null;
                    })}
                  </HStack>

                  {/* Word completion tips */}
                  {searchTerm.length > 0 && (
                    <Box
                      mt={3}
                      p={2}
                      bg="green.50"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="green.200"
                    >
                      <Text fontSize="xs" color="green.700" textAlign="center">
                        💡 Type any character to see instant suggestions. Items
                        marked with ✨ are word completions!
                      </Text>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>

          <Select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            size="lg"
            maxW="200px"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all'
                  ? 'All Categories'
                  : ITEM_CATEGORIES.find(cat => cat.id === category)?.name ||
                    category}
              </option>
            ))}
          </Select>
        </HStack>
      </VStack>

      {/* Items grid */}
      {filteredItems.length === 0 ? (
        <Box
          p={8}
          textAlign="center"
          borderRadius="xl"
          borderWidth="2px"
          borderColor="border.primary"
          bg="dark.700"
        >
          <VStack spacing={3}>
            <FaSearch size={32} color="var(--chakra-colors-text-secondary)" />
            <Text fontSize="lg" color="text.secondary">
              No items found
            </Text>
            <Text fontSize="sm" color="text.secondary">
              Try adjusting your search terms or category filter
            </Text>
          </VStack>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {sortedFilteredItems.map(item => {
            const quantity = getItemQuantity(item.id);
            const isSelected = quantity > 0;

            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Box
                  p={4}
                  borderRadius="xl"
                  borderWidth="2px"
                  borderColor={isSelected ? 'neon.400' : 'border.primary'}
                  bg={isSelected ? 'dark.800' : 'dark.700'}
                  cursor="pointer"
                  position="relative"
                  transition="all 200ms"
                  _hover={{
                    borderColor: 'neon.300',
                    boxShadow: '0 4px 12px rgba(0,194,255,0.2)',
                  }}
                >
                  {/* Item image */}
                  <Box
                    w="full"
                    h="120px"
                    bg="bg.surface"
                    borderRadius="lg"
                    mb={3}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    overflow="hidden"
                    position="relative"
                  >
                    {item.image &&
                    item.image !== '/items/misc/add_custom.svg' ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '8px',
                        }}
                        onError={e => {
                          // Fallback to icon if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.setAttribute(
                            'style',
                            'display: flex'
                          );
                        }}
                      />
                    ) : null}
                    <Box
                      display={
                        item.image &&
                        item.image !== '/items/misc/add_custom.svg'
                          ? 'none'
                          : 'flex'
                      }
                      alignItems="center"
                      justifyContent="center"
                      w="full"
                      h="full"
                      flexDirection="column"
                    >
                      <Box mb={2}>
                        <FaBoxes
                          size={24}
                          color="var(--chakra-colors-text-secondary)"
                        />
                      </Box>
                      <Text
                        fontSize="xs"
                        color="text.secondary"
                        textAlign="center"
                      >
                        Image not available
                      </Text>
                    </Box>

                    {/* Image indicator badge */}
                    {item.image &&
                      item.image !== '/items/misc/add_custom.svg' && (
                        <Badge
                          position="absolute"
                          top="2"
                          left="2"
                          colorScheme="green"
                          size="sm"
                          variant="solid"
                        >
                          📷
                        </Badge>
                      )}
                  </Box>

                  {/* Item details */}
                  <VStack spacing={2} align="start">
                    <Text fontWeight="bold" fontSize="md" noOfLines={1}>
                      {item.name}
                    </Text>

                    <HStack spacing={2}>
                      <Badge colorScheme="blue" size="sm">
                        {ITEM_CATEGORIES.find(cat => cat.id === item.category)
                          ?.name || item.category}
                      </Badge>
                      <Badge
                        colorScheme={
                          item.size === 'large'
                            ? 'red'
                            : item.size === 'medium'
                              ? 'orange'
                              : 'green'
                        }
                        size="sm"
                      >
                        {item.size}
                      </Badge>
                    </HStack>

                    <HStack spacing={4} fontSize="sm" color="text.secondary">
                      <Text fontWeight="bold" color="neon.400">
                        £{item.price}
                      </Text>
                      <Text>{item.size} size</Text>
                    </HStack>
                  </VStack>

                  {/* Quantity controls */}
                  {isSelected ? (
                    <Box
                      position="absolute"
                      top="2"
                      sx={{ right: '8px' }}
                      zIndex={1}
                    >
                      <HStack
                        bg="neon.500"
                        borderRadius="full"
                        p={1}
                        spacing={1}
                      >
                        <IconButton
                          aria-label="Decrease quantity"
                          icon={<FaMinus />}
                          size="xs"
                          variant="ghost"
                          color="white"
                          onClick={e => {
                            e.stopPropagation();
                            removeItem(item.id);
                          }}
                        />
                        <Text
                          color="white"
                          fontWeight="bold"
                          fontSize="sm"
                          minW="20px"
                          textAlign="center"
                        >
                          {quantity}
                        </Text>
                        <IconButton
                          aria-label="Increase quantity"
                          icon={<FaPlus />}
                          size="xs"
                          variant="ghost"
                          color="white"
                          onClick={e => {
                            e.stopPropagation();
                            addItem(item);
                          }}
                        />
                      </HStack>
                    </Box>
                  ) : (
                    <Box
                      position="absolute"
                      top="2"
                      sx={{ right: '8px' }}
                      zIndex={1}
                    >
                      <IconButton
                        aria-label="Add item"
                        icon={<FaPlus />}
                        size="sm"
                        colorScheme="neon"
                        borderRadius="full"
                        onClick={() => addItem(item)}
                      />
                    </Box>
                  )}
                </Box>
              </motion.div>
            );
          })}
        </SimpleGrid>
      )}

      {/* Summary */}
      {selectedItems.length > 0 && (
        <Box
          p={4}
          bg="bg.surface"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="border.primary"
        >
          <VStack spacing={3}>
            <HStack justify="space-between" w="full">
              <Text fontWeight="bold">Selected Items Summary</Text>
              <Badge colorScheme="neon" size="lg">
                {selectedItems.length} item
                {selectedItems.length !== 1 ? 's' : ''}
              </Badge>
            </HStack>

            <HStack justify="space-between" w="full">
              <Text>Total Items:</Text>
              <Text fontWeight="bold" color="neon.400">
                {getTotalItems()}
              </Text>
            </HStack>

            <HStack justify="space-between" w="full">
              <Text>Total Price:</Text>
              <Text fontWeight="bold" color="neon.400">
                £{getTotalPrice()}
              </Text>
            </HStack>
          </VStack>
        </Box>
      )}
    </VStack>
  );
};

// Main component
const WhereAndWhatStep: React.FC = () => {
  const { form, updateData, trackIncompleteBooking, trackVisitorActivity } =
    useUnifiedBooking();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const watchedItems = watch('items');

  // Set default values for service type, date, and time when component mounts
  useEffect(() => {
    const formData = form.getValues();

    // Set default service type if not already set
    if (!formData.serviceType) {
      setValue('serviceType', 'man-and-van');
      updateData({ serviceType: 'man-and-van' });
    }

    // Set default date if not already set
    if (!formData.date) {
      const defaultDate = getNextAvailableDate();
      setValue('date', defaultDate);
      updateData({ date: defaultDate });
    }

    // Set default time slot if not already set
    if (!formData.timeSlot) {
      setValue('timeSlot', '09:00');
      updateData({ timeSlot: '09:00' });
    }
  }, [form, setValue, updateData]);

  // Track incomplete booking when user leaves step 1
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentData = form.getValues();
      if (currentData.items && currentData.items.length > 0) {
        trackIncompleteBooking(1, 'User left step 1 with items selected');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form, trackIncompleteBooking]);

  // Track visitor activity when items are selected
  useEffect(() => {
    const watchedItems = form.watch('items');
    if (watchedItems && watchedItems.length > 0) {
      trackVisitorActivity('items_selected', {
        count: watchedItems.length,
        categories: watchedItems.map(item => item.category),
        step: 1,
      });
    }
  }, [form.watch('items'), trackVisitorActivity]);

  // Track when user starts booking process
  useEffect(() => {
    trackVisitorActivity('booking_started', { step: 1 });
  }, [trackVisitorActivity]);

  return (
    <Box p={{ base: 6, md: 8 }}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <VStack spacing={3} textAlign="center">
          <Heading size="lg" color="neon.500">
            Where are we moving from and to?
          </Heading>
          <Text color="text.secondary" fontSize="lg">
            Tell us your pickup and delivery addresses, plus what you're moving
          </Text>
        </VStack>

        {/* Addresses Section */}
        <VStack spacing={6} align="stretch">
          <Heading size="md" color="text.primary">
            📍 Addresses
          </Heading>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Pickup Address */}
            <VStack spacing={4} align="stretch">
              <HStack>
                <FaMapMarkerAlt color="var(--chakra-colors-neon-400)" />
                <Text fontWeight="bold" fontSize="lg">
                  Pickup Address
                </Text>
              </HStack>

              <Controller
                name="pickupAddress.line1"
                control={control}
                render={({ field }) => (
                  <FormControl isInvalid={!!errors.pickupAddress?.line1}>
                    <FormLabel>Address</FormLabel>
                    <EnhancedAddressAutocomplete
                      value={field.value || ''}
                      onChange={field.onChange}
                      onSelect={selection => {
                        // Update the form with the selected address data
                        setValue(
                          'pickupAddress.line1',
                          selection.address.line1
                        );
                        setValue(
                          'pickupAddress.city',
                          selection.address.city || ''
                        );
                        setValue(
                          'pickupAddress.postcode',
                          selection.address.postcode || ''
                        );
                        if (selection.coords) {
                          setValue(
                            'pickupAddress.coordinates',
                            selection.coords
                          );
                        }
                        // Also update the field value for the controller
                        field.onChange(selection.label);
                      }}
                      placeholder="Start typing your pickup address..."
                      error={errors.pickupAddress?.line1?.message}
                    />
                    <FormErrorMessage>
                      {errors.pickupAddress?.line1?.message}
                    </FormErrorMessage>
                  </FormControl>
                )}
              />

              {/* Property Details */}
              <SimpleGrid columns={2} spacing={3}>
                {/* City and Postcode */}
                <SimpleGrid columns={2} spacing={3}>
                  <Controller
                    name="pickupAddress.city"
                    control={control}
                    render={({ field }) => (
                      <FormControl>
                        <FormLabel fontSize="sm">City</FormLabel>
                        <Input {...field} size="md" placeholder="City" />
                      </FormControl>
                    )}
                  />
                  <Controller
                    name="pickupAddress.postcode"
                    control={control}
                    render={({ field }) => (
                      <FormControl>
                        <FormLabel fontSize="sm">Postcode</FormLabel>
                        <Input {...field} size="md" placeholder="Postcode" />
                      </FormControl>
                    )}
                  />
                </SimpleGrid>

                <Controller
                  name="pickupProperty.propertyType"
                  control={control}
                  render={({ field }) => (
                    <FormControl>
                      <FormLabel fontSize="sm">Property Type</FormLabel>
                      <Select {...field} size="md">
                        <option value="house">House</option>
                        <option value="flat">Flat</option>
                        <option value="office">Office</option>
                        <option value="storage">Storage</option>
                        <option value="other">Other</option>
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="pickupProperty.floor"
                  control={control}
                  render={({ field }) => (
                    <FormControl>
                      <FormLabel fontSize="sm">Floor</FormLabel>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        {...field}
                        onChange={e =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                  )}
                />
              </SimpleGrid>

              <Controller
                name="pickupProperty.hasLift"
                control={control}
                render={({ field }) => (
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="pickup-lift" mb="0" fontSize="sm">
                      Has lift/elevator?
                    </FormLabel>
                    <Switch
                      id="pickup-lift"
                      isChecked={field.value}
                      onChange={field.onChange}
                      colorScheme="neon"
                    />
                  </FormControl>
                )}
              />
            </VStack>

            {/* Dropoff Address */}
            <VStack spacing={4} align="stretch">
              <HStack>
                <FaMapMarkerAlt color="var(--chakra-colors-green-400)" />
                <Text fontWeight="bold" fontSize="lg">
                  Delivery Address
                </Text>
              </HStack>

              <Controller
                name="dropoffAddress.line1"
                control={control}
                render={({ field }) => (
                  <FormControl isInvalid={!!errors.dropoffAddress?.line1}>
                    <FormLabel>Address</FormLabel>
                    <EnhancedAddressAutocomplete
                      value={field.value || ''}
                      onChange={field.onChange}
                      onSelect={selection => {
                        // Update the form with the selected address data
                        setValue(
                          'dropoffAddress.line1',
                          selection.address.line1
                        );
                        setValue(
                          'dropoffAddress.city',
                          selection.address.city || ''
                        );
                        setValue(
                          'dropoffAddress.postcode',
                          selection.address.postcode || ''
                        );
                        if (selection.coords) {
                          setValue(
                            'dropoffAddress.coordinates',
                            selection.coords
                          );
                        }
                        // Also update the field value for the controller
                        field.onChange(selection.label);
                      }}
                      placeholder="Start typing your delivery address..."
                      error={errors.dropoffAddress?.line1?.message}
                    />
                    <FormErrorMessage>
                      {errors.dropoffAddress?.line1?.message}
                    </FormErrorMessage>
                  </FormControl>
                )}
              />

              {/* Property Details */}
              <SimpleGrid columns={2} spacing={3}>
                {/* City and Postcode */}
                <SimpleGrid columns={2} spacing={3}>
                  <Controller
                    name="dropoffAddress.city"
                    control={control}
                    render={({ field }) => (
                      <FormControl>
                        <FormLabel fontSize="sm">City</FormLabel>
                        <Input {...field} size="md" placeholder="City" />
                      </FormControl>
                    )}
                  />
                  <Controller
                    name="dropoffAddress.postcode"
                    control={control}
                    render={({ field }) => (
                      <FormControl>
                        <FormLabel fontSize="sm">Postcode</FormLabel>
                        <Input {...field} size="md" placeholder="Postcode" />
                      </FormControl>
                    )}
                  />
                </SimpleGrid>

                <Controller
                  name="dropoffProperty.propertyType"
                  control={control}
                  render={({ field }) => (
                    <FormControl>
                      <FormLabel fontSize="sm">Property Type</FormLabel>
                      <Select {...field} size="md">
                        <option value="house">House</option>
                        <option value="flat">Flat</option>
                        <option value="office">Office</option>
                        <option value="storage">Storage</option>
                        <option value="other">Other</option>
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="dropoffProperty.floor"
                  control={control}
                  render={({ field }) => (
                    <FormControl>
                      <FormLabel fontSize="sm">Floor</FormLabel>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        {...field}
                        onChange={e =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                  )}
                />
              </SimpleGrid>

              <Controller
                name="dropoffProperty.hasLift"
                control={control}
                render={({ field }) => (
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="dropoff-lift" mb="0" fontSize="sm">
                      Has lift/elevator?
                    </FormLabel>
                    <Switch
                      id="dropoff-lift"
                      isChecked={field.value}
                      onChange={field.onChange}
                      colorScheme="neon"
                    />
                  </FormControl>
                )}
              />
            </VStack>
          </SimpleGrid>
        </VStack>

        <Divider />

        {/* Items Section */}
        <VStack spacing={6} align="stretch">
          <VStack spacing={3} textAlign="center">
            <Heading size="md" color="text.primary">
              📦 What are you moving?
            </Heading>
            <Text color="text.secondary">
              Select the items you need to move. We'll automatically calculate
              the total price and size requirements.
            </Text>
            <Text fontSize="sm" color="neon.400" fontWeight="medium">
              💡 Tip: Use the search box to find items by name, category, or
              properties. Click on any suggestion to add it directly to your
              list!
            </Text>
          </VStack>

          <Controller
            name="items"
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.items}>
                <ItemPicker
                  selectedItems={field.value}
                  onItemsChange={field.onChange}
                />
                <FormErrorMessage>{errors.items?.message}</FormErrorMessage>
              </FormControl>
            )}
          />

          {/* Smart recommendations */}
          {watchedItems.length > 0 && (
            <Alert status="info" borderRadius="xl">
              <AlertIcon />
              <Box>
                <AlertTitle>Smart Recommendation</AlertTitle>
                <AlertDescription>
                  Based on your items, we recommend a{' '}
                  {watchedItems.reduce((sum, item) => {
                    const sizeValue =
                      item.size === 'large'
                        ? 3
                        : item.size === 'medium'
                          ? 2
                          : 1;
                    return sum + sizeValue * item.quantity;
                  }, 0) > 10
                    ? 'large van with 2 movers'
                    : 'standard van with 1 mover'}
                  . This will be automatically selected in the next step.
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </VStack>

        <Divider />

        {/* Service & Scheduling Section */}
        <VStack spacing={6} align="stretch">
          <VStack spacing={3} textAlign="center">
            <Heading size="md" color="text.primary">
              🚚 Service & Scheduling
            </Heading>
            <Text color="text.secondary">
              We'll automatically select the best service type and schedule for
              you
            </Text>
          </VStack>

          {/* Auto-selected Service Type */}
          <VStack spacing={4} align="stretch">
            <HStack>
              <FaTruck color="var(--chakra-colors-neon-400)" />
              <Text fontWeight="bold" fontSize="lg">
                Service Type (Auto-selected)
              </Text>
            </HStack>

            <Controller
              name="serviceType"
              control={control}
              render={({ field }) => (
                <FormControl>
                  <FormLabel>Service Type</FormLabel>
                  <Select
                    {...field}
                    value={field.value || 'man-and-van'}
                    onChange={e => {
                      field.onChange(e.target.value);
                      updateData({ serviceType: e.target.value as any });
                    }}
                    size="lg"
                    bg="white"
                    borderColor="border.primary"
                    _focus={{
                      borderColor: 'neon.400',
                      boxShadow: '0 0 0 1px var(--chakra-colors-neon-400)',
                    }}
                  >
                    <option value="man-and-van">
                      Man & Van - Professional crew with van
                    </option>
                    <option value="van-only">
                      Van Only - Van rental without crew
                    </option>
                    <option value="premium">
                      Premium Service - Luxury moving experience
                    </option>
                    <option value="express">
                      Express Service - Same-day delivery
                    </option>
                  </Select>
                  <Text fontSize="sm" color="text.tertiary" mt={2}>
                    💡 Based on your items, we recommend "Man & Van" for the
                    best service
                  </Text>
                </FormControl>
              )}
            />
          </VStack>

          {/* Auto-scheduled Date & Time */}
          <VStack spacing={4} align="stretch">
            <HStack>
              <FaCalendarAlt color="var(--chakra-colors-neon-400)" />
              <Text fontWeight="bold" fontSize="lg">
                Date & Time (Auto-scheduled)
              </Text>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <FormLabel>Preferred Date</FormLabel>
                    <Select
                      {...field}
                      value={field.value || getNextAvailableDate()}
                      onChange={e => {
                        field.onChange(e.target.value);
                        updateData({ date: e.target.value });
                      }}
                      size="lg"
                      bg="white"
                      borderColor="border.primary"
                      _focus={{
                        borderColor: 'neon.400',
                        boxShadow: '0 0 0 1px var(--chakra-colors-neon-400)',
                      }}
                    >
                      {generateAvailableDates().map(dateOption => (
                        <option key={dateOption.date} value={dateOption.date}>
                          {dateOption.label}{' '}
                          {dateOption.isWeekend && '(Weekend)'}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="timeSlot"
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <FormLabel>Preferred Time</FormLabel>
                    <Select
                      {...field}
                      value={field.value || '09:00'}
                      onChange={e => {
                        field.onChange(e.target.value);
                        updateData({ timeSlot: e.target.value });
                      }}
                      size="lg"
                      bg="white"
                      borderColor="border.primary"
                      _focus={{
                        borderColor: 'neon.400',
                        boxShadow: '0 0 0 1px var(--chakra-colors-neon-400)',
                      }}
                    >
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                    </Select>
                  </FormControl>
                )}
              />
            </SimpleGrid>

            <Text fontSize="sm" color="text.tertiary">
              💡 We recommend booking at least 24 hours in advance for the best
              availability
            </Text>
          </VStack>

          {/* Custom Requirements */}
          <VStack spacing={4} align="stretch">
            <HStack>
              <FaInfoCircle color="var(--chakra-colors-neon-400)" />
              <Text fontWeight="bold" fontSize="lg">
                Special Requirements (Optional)
              </Text>
            </HStack>

            <Controller
              name="customRequirements"
              control={control}
              render={({ field }) => (
                <FormControl>
                  <FormLabel>Additional Notes</FormLabel>
                  <Textarea
                    {...field}
                    placeholder="Any special instructions, fragile items, or specific requirements..."
                    size="lg"
                    rows={3}
                    bg="white"
                    borderColor="border.primary"
                    _focus={{
                      borderColor: 'neon.400',
                      boxShadow: '0 0 0 1px var(--chakra-colors-neon-400)',
                    }}
                  />
                  <Text fontSize="sm" color="text.tertiary">
                    Let us know about any special handling needs or specific
                    instructions
                  </Text>
                </FormControl>
              )}
            />
          </VStack>
        </VStack>
      </VStack>
    </Box>
  );
};

export default WhereAndWhatStep;
