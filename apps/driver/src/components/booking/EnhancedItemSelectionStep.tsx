import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton,
  Badge,
  Divider,
  Icon,
  useToast,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Flex,
  Spacer,
  Select,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  ListIcon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  Wrap,
  WrapItem,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import {
  FaBox,
  FaArrowRight,
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaSearch,
  FaFilter,
  FaUsers,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaTimes,
} from 'react-icons/fa';
import PricingDisplay from './PricingDisplay';
import BookingNavigationButtons from './BookingNavigationButtons';
import {
  getAutocompleteSuggestions,
  getPopularSuggestions,
  getQuickCategories,
  type AutocompleteSuggestion,
} from '../../lib/pricing/autocomplete';
import { smartNormalize } from '../../lib/pricing/normalizer';
import { type NormalizedItem } from '../../lib/pricing/types';

// Category Card Component
interface CategoryCardProps {
  category: {
    name: string;
    icon: string;
    count: number;
    image: string;
    displayName: string;
    group: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

function CategoryCard({ category, isSelected, onSelect }: CategoryCardProps) {
  return (
    <Card
      cursor="pointer"
      _hover={{
        shadow: 'xl',
        transform: 'translateY(-3px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        bg: 'blue.50',
        borderColor: 'blue.300',
      }}
      onClick={onSelect}
      border="2px solid"
      borderColor={isSelected ? 'blue.500' : 'gray.200'}
      bg={isSelected ? 'blue.50' : 'white'}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: isSelected
          ? 'linear-gradient(90deg, #3182ce, #63b3ed)'
          : 'linear-gradient(90deg, #e2e8f0, #cbd5e0)',
        transform: isSelected ? 'scaleX(1)' : 'scaleX(0)',
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      {isSelected && (
        <Box
          position="absolute"
          top={2}
          sx={{ right: '8px' }}
          width={3}
          height={3}
          borderRadius="full"
          bg="blue.500"
        />
      )}
      <CardBody textAlign="center" p={4}>
        <Box
          position="relative"
          width="60px"
          height="60px"
          mx="auto"
          mb={3}
          borderRadius="xl"
          overflow="hidden"
          bg="gray.50"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.100"
        >
          <Text fontSize="2xl" color="gray.400">
            {category.icon}
          </Text>
        </Box>
        <Text fontSize="sm" fontWeight="medium" noOfLines={2} mb={1}>
          {category.displayName}
        </Text>
        <Badge
          size="sm"
          colorScheme="gray"
          variant="subtle"
          borderRadius="full"
          px={2}
          py={1}
        >
          {category.count} items
        </Badge>
      </CardBody>
    </Card>
  );
}

// Image Gallery Modal Component
interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  images: string[];
  onImageSelect: (imagePath: string) => void;
}

function ImageGalleryModal({
  isOpen,
  onClose,
  category,
  images,
  onImageSelect,
}: ImageGalleryModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack justify="space-between">
            <Text>{category} Items</Text>
            <IconButton
              aria-label="Close gallery"
              icon={<FaTimes />}
              variant="ghost"
              onClick={onClose}
            />
          </HStack>
        </ModalHeader>
        <ModalBody>
          <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={4}>
            {images.map((imagePath, index) => (
              <GridItem key={index}>
                <Card
                  cursor="pointer"
                  _hover={{ shadow: 'lg', transform: 'scale(1.02)' }}
                  onClick={() => onImageSelect(imagePath)}
                >
                  <CardBody p={4}>
                    <Box
                      position="relative"
                      width="100%"
                      height="150px"
                      mb={3}
                      borderRadius="md"
                      overflow="hidden"
                      bg="gray.50"
                    >
                      <Image
                        src={imagePath}
                        alt={`${category} item ${index + 1}`}
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="200px"
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/items/placeholder.svg';
                        }}
                      />
                    </Box>
                    <Text fontSize="sm" textAlign="center" fontWeight="medium">
                      {imagePath
                        .split('/')
                        .pop()
                        ?.replace('.png', '')
                        .replace(/_/g, ' ')}
                    </Text>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

interface ItemSelectionStepProps {
  bookingData: any;
  updateBookingData: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

interface SelectedItem extends NormalizedItem {
  name: string;
  basePriceHint: number;
  image?: string;
}

export default function EnhancedItemSelectionStep({
  bookingData,
  updateBookingData,
  onNext,
  onBack,
}: ItemSelectionStepProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [popularItems, setPopularItems] = useState<AutocompleteSuggestion[]>(
    []
  );
  const [categories, setCategories] = useState<
    Array<{
      name: string;
      icon: string;
      count: number;
      image: string;
      displayName: string;
      group: string;
    }>
  >([]);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [customItemText, setCustomItemText] = useState('');
  const [customItemSuggestions, setCustomItemSuggestions] = useState<
    AutocompleteSuggestion[]
  >([]);
  const [customItemPreview, setCustomItemPreview] =
    useState<AutocompleteSuggestion | null>(null);
  const [isProcessingCustomItem, setIsProcessingCustomItem] = useState(false);
  const [galleryModal, setGalleryModal] = useState({
    isOpen: false,
    category: '',
    images: [] as string[],
  });
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Load popular items and categories on mount
  useEffect(() => {
    loadPopularItems();
    loadCategories();
  }, []);

  // Load existing items from booking data
  useEffect(() => {
    if (bookingData.items && Array.isArray(bookingData.items)) {
      setSelectedItems(bookingData.items);
    }
  }, [bookingData.items]);

  // Update booking data when selected items change
  useEffect(() => {
    if (selectedItems.length > 0) {
      updateBookingData({ items: selectedItems });
    }
  }, [selectedItems, updateBookingData]);

  const loadPopularItems = async () => {
    try {
      const popular = await getPopularSuggestions(8);
      setPopularItems(popular);
    } catch (error) {
      console.error('Failed to load popular items:', error);
    }
  };

  const loadCategories = async () => {
    try {
      // Use static categories that only use images from the items folder
      const staticCategories = [
        // Furniture
        {
          name: 'sofa',
          icon: '🛋️',
          count: 1,
          image: '/items/sofa.png',
          displayName: 'Sofa',
          group: 'furniture',
        },
        {
          name: 'bed',
          icon: '🛏️',
          count: 1,
          image: '/items/bed.png',
          displayName: 'Bed',
          group: 'furniture',
        },
        {
          name: 'table',
          icon: '🪑',
          count: 1,
          image: '/items/table.png',
          displayName: 'Table',
          group: 'furniture',
        },
        {
          name: 'chair',
          icon: '🪑',
          count: 1,
          image: '/items/chair.png',
          displayName: 'Chair',
          group: 'furniture',
        },
        {
          name: 'desk',
          icon: '🪑',
          count: 1,
          image: '/items/desk.png',
          displayName: 'Desk',
          group: 'furniture',
        },
        {
          name: 'coffee_table',
          icon: '🪑',
          count: 1,
          image: '/items/coffee_table.png',
          displayName: 'Coffee Table',
          group: 'furniture',
        },
        {
          name: 'dining_table',
          icon: '🪑',
          count: 1,
          image: '/items/dining_table.png',
          displayName: 'Dining Table',
          group: 'furniture',
        },
        {
          name: 'armchair',
          icon: '🪑',
          count: 1,
          image: '/items/armchair.png',
          displayName: 'Armchair',
          group: 'furniture',
        },
        {
          name: 'bed_frame',
          icon: '🛏️',
          count: 1,
          image: '/items/bed_frame.png',
          displayName: 'Bed Frame',
          group: 'furniture',
        },
        {
          name: 'mattress',
          icon: '🛏️',
          count: 1,
          image: '/items/mattress.png',
          displayName: 'Mattress',
          group: 'furniture',
        },
        {
          name: 'mirror',
          icon: '🪞',
          count: 1,
          image: '/items/mirror.png',
          displayName: 'Mirror',
          group: 'furniture',
        },
        {
          name: 'lamp',
          icon: '💡',
          count: 1,
          image: '/items/lamp.png',
          displayName: 'Lamp',
          group: 'furniture',
        },
        {
          name: 'painting_frame',
          icon: '🖼️',
          count: 1,
          image: '/items/painting_frame.png',
          displayName: 'Picture Frame',
          group: 'furniture',
        },

        // Appliances
        {
          name: 'refrigerator',
          icon: '❄️',
          count: 1,
          image: '/items/refrigerator.png',
          displayName: 'Refrigerator',
          group: 'appliances',
        },
        {
          name: 'washer',
          icon: '🧺',
          count: 1,
          image: '/items/washer.png',
          displayName: 'Washing Machine',
          group: 'appliances',
        },
        {
          name: 'dryer',
          icon: '🧺',
          count: 1,
          image: '/items/dryer.png',
          displayName: 'Dryer',
          group: 'appliances',
        },
        {
          name: 'dishwasher',
          icon: '🍽️',
          count: 1,
          image: '/items/dishwasher.png',
          displayName: 'Dishwasher',
          group: 'appliances',
        },
        {
          name: 'microwave',
          icon: '🍽️',
          count: 1,
          image: '/items/microwave.png',
          displayName: 'Microwave',
          group: 'appliances',
        },
        {
          name: 'oven',
          icon: '🍽️',
          count: 1,
          image: '/items/oven.png',
          displayName: 'Oven',
          group: 'appliances',
        },
        {
          name: 'stove',
          icon: '🔥',
          count: 1,
          image: '/items/stove.png',
          displayName: 'Stove',
          group: 'appliances',
        },
        {
          name: 'toaster',
          icon: '🍞',
          count: 1,
          image: '/items/toaster.png',
          displayName: 'Toaster',
          group: 'appliances',
        },
        {
          name: 'kettle',
          icon: '☕',
          count: 1,
          image: '/items/kettle.png',
          displayName: 'Kettle',
          group: 'appliances',
        },
        {
          name: 'air_conditioner',
          icon: '❄️',
          count: 1,
          image: '/items/air_conditioner.png',
          displayName: 'Air Conditioner',
          group: 'appliances',
        },
        {
          name: 'fan',
          icon: '💨',
          count: 1,
          image: '/items/fan.png',
          displayName: 'Fan',
          group: 'appliances',
        },
        {
          name: 'mini_fridge',
          icon: '❄️',
          count: 1,
          image: '/items/mini_fridge.png',
          displayName: 'Mini Fridge',
          group: 'appliances',
        },
        {
          name: 'fridge_freezer',
          icon: '❄️',
          count: 1,
          image: '/items/fridge_freezer.png',
          displayName: 'Fridge Freezer',
          group: 'appliances',
        },
        {
          name: 'vacuum_cleaner',
          icon: '🧹',
          count: 1,
          image: '/items/vacuum_cleaner.png',
          displayName: 'Vacuum Cleaner',
          group: 'appliances',
        },

        // Electronics
        {
          name: 'television',
          icon: '📺',
          count: 1,
          image: '/items/television.png',
          displayName: 'Television',
          group: 'electronics',
        },
        {
          name: 'tv',
          icon: '📺',
          count: 1,
          image: '/items/tv.png',
          displayName: 'TV',
          group: 'electronics',
        },
        {
          name: 'computer',
          icon: '💻',
          count: 1,
          image: '/items/computer.png',
          displayName: 'Computer',
          group: 'electronics',
        },
        {
          name: 'computer_monitor',
          icon: '🖥️',
          count: 1,
          image: '/items/computer_monitor.png',
          displayName: 'Computer Monitor',
          group: 'electronics',
        },
        {
          name: 'printer_scanner',
          icon: '🖨️',
          count: 1,
          image: '/items/printer_scanner.png',
          displayName: 'Printer Scanner',
          group: 'electronics',
        },

        // Storage & Boxes
        {
          name: 'wardrobe',
          icon: '🗄️',
          count: 1,
          image: '/items/wardrobe.png',
          displayName: 'Wardrobe',
          group: 'storage',
        },
        {
          name: 'bookshelf',
          icon: '📚',
          count: 1,
          image: '/items/bookshelf.png',
          displayName: 'Bookshelf',
          group: 'storage',
        },
        {
          name: 'book_shelf',
          icon: '📚',
          count: 1,
          image: '/items/book_shelf.png',
          displayName: 'Book Shelf',
          group: 'storage',
        },
        {
          name: 'filing_cabinet',
          icon: '🗄️',
          count: 1,
          image: '/items/filing_cabinet.png',
          displayName: 'Filing Cabinet',
          group: 'storage',
        },
        {
          name: 'boxes',
          icon: '📦',
          count: 1,
          image: '/items/boxes.png',
          displayName: 'Boxes',
          group: 'boxes',
        },
        {
          name: 'box',
          icon: '📦',
          count: 1,
          image: '/items/box.png',
          displayName: 'Box',
          group: 'boxes',
        },
        {
          name: 'small_box',
          icon: '📦',
          count: 1,
          image: '/items/small-box.png',
          displayName: 'Small Box',
          group: 'boxes',
        },
        {
          name: 'medium_box',
          icon: '📦',
          count: 1,
          image: '/items/medium-box.png',
          displayName: 'Medium Box',
          group: 'boxes',
        },
        {
          name: 'large_box',
          icon: '📦',
          count: 1,
          image: '/items/large-box.png',
          displayName: 'Large Box',
          group: 'boxes',
        },
        {
          name: 'plastic_bin',
          icon: '🗑️',
          count: 1,
          image: '/items/plastic_bin.png',
          displayName: 'Plastic Bin',
          group: 'boxes',
        },
        {
          name: 'suitcase',
          icon: '💼',
          count: 1,
          image: '/items/suitcase.png',
          displayName: 'Suitcase',
          group: 'boxes',
        },
        {
          name: 'wardrobe_box',
          icon: '📦',
          count: 1,
          image: '/items/wardrobe-box.png',
          displayName: 'Wardrobe Box',
          group: 'boxes',
        },

        // Outdoor & Sports
        {
          name: 'bicycle',
          icon: '🚲',
          count: 1,
          image: '/items/bicycle.png',
          displayName: 'Bicycle',
          group: 'outdoor',
        },
        {
          name: 'bbq_grill',
          icon: '🍖',
          count: 1,
          image: '/items/bbq_grill.png',
          displayName: 'BBQ Grill',
          group: 'outdoor',
        },
        {
          name: 'patio_chair',
          icon: '🪑',
          count: 1,
          image: '/items/patio_chair.png',
          displayName: 'Patio Chair',
          group: 'outdoor',
        },
        {
          name: 'garden_table',
          icon: '🪑',
          count: 1,
          image: '/items/garden_table.png',
          displayName: 'Garden Table',
          group: 'outdoor',
        },
        {
          name: 'lawn_mower',
          icon: '🌱',
          count: 1,
          image: '/items/lawn_mower.png',
          displayName: 'Lawn Mower',
          group: 'outdoor',
        },
        {
          name: 'sports',
          icon: '⚽',
          count: 1,
          image: '/items/sports.png',
          displayName: 'Sports Equipment',
          group: 'sports',
        },
        {
          name: 'gym_equipment',
          icon: '💪',
          count: 1,
          image: '/items/gym_equipment.png',
          displayName: 'Gym Equipment',
          group: 'sports',
        },
        {
          name: 'treadmill',
          icon: '🏃',
          count: 1,
          image: '/items/treadmill.png',
          displayName: 'Treadmill',
          group: 'sports',
        },

        // Decorative
        {
          name: 'plant_pot',
          icon: '🌱',
          count: 1,
          image: '/items/plant_pot.png',
          displayName: 'Plant Pot',
          group: 'decorative',
        },
        {
          name: 'piano',
          icon: '🎹',
          count: 1,
          image: '/items/piano.png',
          displayName: 'Piano',
          group: 'decorative',
        },
        {
          name: 'whiteboard',
          icon: '📝',
          count: 1,
          image: '/items/whiteboard.png',
          displayName: 'Whiteboard',
          group: 'decorative',
        },

        // Other
        {
          name: 'kitchen_cabinet',
          icon: '🍽️',
          count: 1,
          image: '/items/kitchen_cabinet.png',
          displayName: 'Kitchen Cabinet',
          group: 'furniture',
        },
        {
          name: 'kitchen',
          icon: '🍽️',
          count: 1,
          image: '/items/kitchen.png',
          displayName: 'Kitchen',
          group: 'furniture',
        },
        {
          name: 'living_room',
          icon: '🏠',
          count: 1,
          image: '/items/living_room.png',
          displayName: 'Living Room',
          group: 'furniture',
        },
        {
          name: 'outdoor',
          icon: '🌳',
          count: 1,
          image: '/items/outdoor.png',
          displayName: 'Outdoor',
          group: 'outdoor',
        },
        {
          name: 'furniture',
          icon: '🪑',
          count: 1,
          image: '/items/furniture.png',
          displayName: 'Furniture',
          group: 'furniture',
        },
        {
          name: 'electronics',
          icon: '📺',
          count: 1,
          image: '/items/electronics.png',
          displayName: 'Electronics',
          group: 'electronics',
        },
        {
          name: 'other',
          icon: '📦',
          count: 1,
          image: '/items/other.png',
          displayName: 'Other',
          group: 'storage',
        },
        {
          name: 'custom',
          icon: '🎯',
          count: 1,
          image: '/items/custom.png',
          displayName: 'Custom',
          group: 'storage',
        },
      ];

      setCategories(staticCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  // Debounced search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return async (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
          }

          setIsSearching(true);
          try {
            const results = await getAutocompleteSuggestions(query, {
              category: selectedCategory,
              recentItems: selectedItems.map(item => item.id),
            });
            setSuggestions(results);
            setShowSuggestions(true);
          } catch (error) {
            console.error('Search error:', error);
            setSuggestions([]);
          } finally {
            setIsSearching(false);
          }
        }, 300);
      };
    })(),
    [selectedCategory, selectedItems]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (!value) {
      setShowSuggestions(false);
    }
  };

  const handleItemSelect = (suggestion: AutocompleteSuggestion) => {
    const newItem: SelectedItem = {
      id: suggestion.id,
      canonicalName: suggestion.canonicalName,
      name: suggestion.canonicalName,
      quantity: itemQuantity,
      volumeFactor: suggestion.volumeFactor,
      requiresTwoPerson: suggestion.requiresTwoPerson,
      isFragile: suggestion.isFragile,
      requiresDisassembly: suggestion.requiresDisassembly,
      basePriceHint: suggestion.basePriceHint,
      image: suggestion.image,
    };

    // Check if item already exists
    const existingIndex = selectedItems.findIndex(
      item => item.id === newItem.id
    );
    if (existingIndex >= 0) {
      // Update quantity
      const updatedItems = [...selectedItems];
      updatedItems[existingIndex].quantity += itemQuantity;
      setSelectedItems(updatedItems);
      toast({
        title: 'Quantity updated',
        description: `${newItem.name} quantity increased to ${updatedItems[existingIndex].quantity}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } else {
      // Add new item
      setSelectedItems(prev => [...prev, newItem]);
      toast({
        title: 'Item added',
        description: `${newItem.name} added to your move`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }

    // Reset form
    setSearchTerm('');
    setItemQuantity(1);
    setShowSuggestions(false);
  };

  const handleQuickAdd = (suggestion: AutocompleteSuggestion) => {
    const newItem: SelectedItem = {
      id: suggestion.id,
      canonicalName: suggestion.canonicalName,
      name: suggestion.canonicalName,
      quantity: 1,
      volumeFactor: suggestion.volumeFactor,
      requiresTwoPerson: suggestion.requiresTwoPerson,
      isFragile: suggestion.isFragile,
      requiresDisassembly: suggestion.requiresDisassembly,
      basePriceHint: suggestion.basePriceHint,
      image: suggestion.image,
    };

    setSelectedItems(prev => [...prev, newItem]);
    toast({
      title: 'Item added',
      description: `${newItem.name} added to your move`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleCustomItemAdd = async () => {
    if (!customItemText.trim() || !customItemPreview) {
      toast({
        title: 'Please enter a valid item description',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsProcessingCustomItem(true);

    try {
      const newItem: SelectedItem = {
        id: customItemPreview.id,
        canonicalName: customItemPreview.canonicalName,
        name: customItemPreview.canonicalName,
        quantity: itemQuantity,
        volumeFactor: customItemPreview.volumeFactor,
        requiresTwoPerson: customItemPreview.requiresTwoPerson,
        isFragile: customItemPreview.isFragile,
        requiresDisassembly: customItemPreview.requiresDisassembly,
        basePriceHint: customItemPreview.basePriceHint,
        image: customItemPreview.image,
      };

      setSelectedItems(prev => [...prev, newItem]);
      setCustomItemText('');
      setItemQuantity(1);
      setCustomItemSuggestions([]);
      setCustomItemPreview(null);
      onClose();

      toast({
        title: 'Item added',
        description: `${newItem.name} added to your move`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error adding item',
        description: 'Please try again or use the search above',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsProcessingCustomItem(false);
    }
  };

  const handleItemRemove = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId));
    toast({
      title: 'Item removed',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleItemRemove(itemId);
      return;
    }

    setSelectedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (selectedItems.length === 0) {
      newErrors.items = 'Please add at least one item to move';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      // Update booking data with selected items
      updateBookingData({ items: selectedItems });
      onNext?.();
    } else {
      toast({
        title: 'Please add at least one item',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getTotalVolumeFactor = () => {
    return selectedItems.reduce(
      (total, item) => total + item.volumeFactor * item.quantity,
      0
    );
  };

  const getRequiresTwoPerson = () => {
    return selectedItems.some(item => item.requiresTwoPerson);
  };

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Debounced function to get custom item suggestions
  const debouncedGetCustomSuggestions = useCallback(
    debounce(async (text: string) => {
      if (text.trim().length < 2) {
        setCustomItemSuggestions([]);
        setCustomItemPreview(null);
        return;
      }

      try {
        const suggestions = await getAutocompleteSuggestions(text, {
          maxResults: 5,
        });
        setCustomItemSuggestions(suggestions);

        // Set preview to the first suggestion
        if (suggestions.length > 0) {
          setCustomItemPreview(suggestions[0]);
        } else {
          setCustomItemPreview(null);
        }
      } catch (error) {
        console.error('Error getting custom item suggestions:', error);
        setCustomItemSuggestions([]);
        setCustomItemPreview(null);
      }
    }, 300),
    []
  );

  // Handle custom item text change
  const handleCustomItemTextChange = (text: string) => {
    setCustomItemText(text);
    debouncedGetCustomSuggestions(text);
  };

  // Handle custom item suggestion selection
  const handleCustomSuggestionSelect = (suggestion: AutocompleteSuggestion) => {
    setCustomItemText(suggestion.canonicalName);
    setCustomItemSuggestions([]);
    setCustomItemPreview(suggestion);
  };

  // Handle category selection to open gallery
  const handleCategorySelect = (categoryName: string) => {
    // Get all images that match the category name or group
    const category = categories.find(cat => cat.name === categoryName);
    let matchingImages: string[] = [];

    if (category) {
      // Get all images from the same group
      matchingImages = categories
        .filter(cat => cat.group === category.group)
        .map(cat => cat.image);
    }

    if (matchingImages.length > 0) {
      setGalleryModal({
        isOpen: true,
        category: categoryName,
        images: matchingImages,
      });
    } else {
      // Fallback: show all images if no specific matches
      const allImages = categories.map(cat => cat.image);
      setGalleryModal({
        isOpen: true,
        category: categoryName,
        images: allImages,
      });
    }
  };

  // Handle image selection from gallery
  const handleImageSelect = (imagePath: string) => {
    const itemName = imagePath
      .split('/')
      .pop()
      ?.replace('.png', '')
      .replace(/_/g, ' ');
    if (itemName) {
      setSearchTerm(itemName);
      setGalleryModal({ isOpen: false, category: '', images: [] });
    }
  };

  // Handle section header click to show all items in that category
  const handleSectionClick = (groupName: string) => {
    const groupImages = categories
      .filter(cat => cat.group === groupName)
      .map(cat => cat.image);

    if (groupImages.length > 0) {
      setGalleryModal({
        isOpen: true,
        category: groupName,
        images: groupImages,
      });
    }
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="neon.500" mb={2}>
            What are you moving?
          </Text>
          <Text color="text.secondary">
            Search for items or browse popular categories
          </Text>
        </Box>

        {/* Search Section */}
        <Card>
          <CardBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Search for your item</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Type item name (e.g., 'sofa', 'bed', 'boxes')"
                    value={searchTerm}
                    onChange={e => handleSearchChange(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                  />
                </InputGroup>

                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <Box
                    position="absolute"
                    zIndex={10}
                    bg="white"
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    boxShadow="lg"
                    maxH="300px"
                    overflowY="auto"
                    w="full"
                  >
                    <List spacing={0}>
                      {suggestions.map(suggestion => (
                        <ListItem
                          key={suggestion.id}
                          p={3}
                          cursor="pointer"
                          _hover={{ bg: 'gray.50' }}
                          onClick={() => handleItemSelect(suggestion)}
                        >
                          <HStack>
                            <ListIcon as={FaBox} color="neon.500" />
                            <VStack align="start" spacing={1} flex={1}>
                              <Text fontWeight="medium">
                                {suggestion.canonicalName}
                              </Text>
                              <HStack spacing={2}>
                                <Badge size="sm" colorScheme="blue">
                                  {suggestion.category}
                                </Badge>
                                <Text fontSize="sm" color="text.secondary">
                                  £{suggestion.basePriceHint} base
                                </Text>
                                {suggestion.requiresTwoPerson && (
                                  <Badge size="sm" colorScheme="orange">
                                    <Icon as={FaUsers} mr={1} />
                                    2-person
                                  </Badge>
                                )}
                              </HStack>
                            </VStack>
                          </HStack>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </FormControl>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Quantity</FormLabel>
                  <NumberInput
                    min={1}
                    max={99}
                    value={itemQuantity}
                    onChange={(_, value) => setItemQuantity(value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <Button
                  leftIcon={<FaPlus />}
                  colorScheme="neon"
                  onClick={onOpen}
                  isDisabled={!customItemText.trim()}
                >
                  Add Custom Item
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Popular Items */}
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold">
              Popular Items
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              {popularItems.map(item => (
                <Card
                  key={item.id}
                  cursor="pointer"
                  _hover={{ shadow: 'md' }}
                  onClick={() => handleQuickAdd(item)}
                >
                  <CardBody textAlign="center" p={4}>
                    <Box
                      position="relative"
                      width="60px"
                      height="60px"
                      mx="auto"
                      mb={2}
                    >
                      <Image
                        src={item.image || '/items/placeholder.svg'}
                        alt={item.canonicalName}
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="60px"
                      />
                    </Box>
                    <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
                      {item.canonicalName}
                    </Text>
                    <Text fontSize="xs" color="text.secondary" mt={1}>
                      £{item.basePriceHint} base
                    </Text>
                    {item.requiresTwoPerson && (
                      <Badge size="xs" colorScheme="orange" mt={1}>
                        <Icon as={FaUsers} mr={1} />
                        2-person
                      </Badge>
                    )}
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Selected Items */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="semibold">
                Selected Items
              </Text>
              <HStack spacing={2}>
                <Text fontSize="sm" color="text.secondary">
                  Total Volume Factor: {getTotalVolumeFactor().toFixed(1)}
                </Text>
                {getRequiresTwoPerson() && (
                  <Badge colorScheme="orange">
                    <Icon as={FaUsers} mr={1} />
                    Helper Recommended
                  </Badge>
                )}
              </HStack>
            </HStack>
          </CardHeader>
          <CardBody>
            {selectedItems.length === 0 ? (
              <Text color="text.secondary" textAlign="center" py={8}>
                No items selected yet. Search above to add items to your move.
              </Text>
            ) : (
              <VStack spacing={3} align="stretch">
                {selectedItems.map(item => (
                  <Card key={item.id} variant="outline">
                    <CardBody>
                      <HStack justify="space-between" align="center">
                        <HStack spacing={3} flex={1}>
                          <Box
                            position="relative"
                            width="40px"
                            height="40px"
                            flexShrink={0}
                          >
                            <Image
                              src={item.image || '/items/placeholder.svg'}
                              alt={item.name}
                              fill
                              style={{ objectFit: 'contain' }}
                              sizes="40px"
                            />
                          </Box>
                          <VStack align="start" spacing={1} flex={1}>
                            <HStack>
                              <Text fontWeight="medium">{item.name}</Text>
                              <Badge size="sm" colorScheme="blue">
                                {item.volumeFactor.toFixed(1)} VF
                              </Badge>
                              {item.requiresTwoPerson && (
                                <Badge size="sm" colorScheme="orange">
                                  <Icon as={FaUsers} mr={1} />
                                  2-person
                                </Badge>
                              )}
                              {item.isFragile && (
                                <Badge size="sm" colorScheme="red">
                                  <Icon as={FaExclamationTriangle} mr={1} />
                                  Fragile
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="sm" color="text.secondary">
                              £{item.basePriceHint} base price
                            </Text>
                          </VStack>
                        </HStack>

                        <HStack spacing={3}>
                          <NumberInput
                            size="sm"
                            min={1}
                            max={99}
                            value={item.quantity}
                            onChange={(_, value) =>
                              handleQuantityChange(item.id, value)
                            }
                            w="80px"
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>

                          <IconButton
                            size="sm"
                            aria-label="Remove item"
                            icon={<FaTrash />}
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleItemRemove(item.id)}
                          />
                        </HStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Form Errors */}
        {errors.items && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{errors.items}</AlertDescription>
          </Alert>
        )}

        {/* Pricing Display */}
        {selectedItems.length > 0 && (
          <PricingDisplay
            bookingData={{
              ...bookingData,
              items: selectedItems,
            }}
            showBreakdown={true}
            compact={false}
          />
        )}

        {/* Navigation */}
        <BookingNavigationButtons
          onNext={handleNext}
          onBack={onBack}
          nextText="Continue to Date & Time"
          backText="Back to Property Details"
        />
      </VStack>

      {/* Custom Item Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Custom Item</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Item Description</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="e.g., '6 large boxes', 'corner sofa', 'american fridge'"
                    value={customItemText}
                    onChange={e => handleCustomItemTextChange(e.target.value)}
                  />
                </InputGroup>

                {customItemSuggestions.length > 0 && (
                  <Box mt={4}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Suggestions:
                    </Text>
                    <VStack align="start" spacing={1} w="full">
                      {customItemSuggestions.map(suggestion => (
                        <Button
                          key={suggestion.id}
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCustomSuggestionSelect(suggestion)
                          }
                          w="full"
                          textAlign="left"
                          justifyContent="flex-start"
                          _hover={{ bg: 'gray.100' }}
                        >
                          <HStack>
                            <ListIcon as={FaBox} color="neon.500" />
                            <VStack align="start" spacing={1} flex={1}>
                              <Text fontWeight="medium">
                                {suggestion.canonicalName}
                              </Text>
                              <HStack spacing={2}>
                                <Badge size="sm" colorScheme="blue">
                                  {suggestion.category}
                                </Badge>
                                <Text fontSize="sm" color="text.secondary">
                                  £{suggestion.basePriceHint} base
                                </Text>
                                {suggestion.requiresTwoPerson && (
                                  <Badge size="sm" colorScheme="orange">
                                    <Icon as={FaUsers} mr={1} />
                                    2-person
                                  </Badge>
                                )}
                              </HStack>
                            </VStack>
                          </HStack>
                        </Button>
                      ))}
                    </VStack>
                  </Box>
                )}

                {customItemPreview && (
                  <Box
                    mt={4}
                    p={4}
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    w="full"
                  >
                    <Text fontWeight="medium" mb={2}>
                      Preview:
                    </Text>
                    <HStack justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">
                          {customItemPreview.canonicalName}
                        </Text>
                        <HStack spacing={2}>
                          <Badge size="sm" colorScheme="blue">
                            {customItemPreview.category}
                          </Badge>
                          <Text fontSize="sm" color="text.secondary">
                            £{customItemPreview.basePriceHint} base
                          </Text>
                          {customItemPreview.requiresTwoPerson && (
                            <Badge size="sm" colorScheme="orange">
                              <Icon as={FaUsers} mr={1} />
                              2-person
                            </Badge>
                          )}
                        </HStack>
                      </VStack>
                      <Badge size="sm" colorScheme="green">
                        <Icon as={FaCheckCircle} mr={1} />
                        Recognized
                      </Badge>
                    </HStack>
                  </Box>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Quantity</FormLabel>
                <NumberInput
                  min={1}
                  max={99}
                  value={itemQuantity}
                  onChange={(_, value) => setItemQuantity(value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Smart Recognition</AlertTitle>
                  <AlertDescription>
                    Our system will automatically recognize items and apply the
                    correct pricing. Try describing the item naturally (e.g.,
                    "small sofa" or "6 large boxes").
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="neon"
              onClick={handleCustomItemAdd}
              isLoading={isProcessingCustomItem}
              loadingText="Adding..."
              isDisabled={!customItemText.trim() || !customItemPreview}
            >
              Add Item
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={galleryModal.isOpen}
        onClose={() =>
          setGalleryModal({ isOpen: false, category: '', images: [] })
        }
        category={galleryModal.category}
        images={galleryModal.images}
        onImageSelect={handleImageSelect}
      />
    </Box>
  );
}
