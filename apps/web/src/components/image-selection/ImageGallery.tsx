import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Badge,
  Flex,
  Spacer,
  IconButton,
  Tooltip,
  useDisclosure,
  Input,
  InputGroup,
  InputRightElement,
  useColorModeValue
} from '@chakra-ui/react';
import { FaSearch, FaFilter, FaTh, FaList, FaEye, FaEyeSlash } from 'react-icons/fa';
import { ImageGalleryProps, ImageSelection, ItemImage } from '../../types/image-selection';
import { getAllImages, getImagesByCategory, searchImages, getCategories } from '../../lib/image-selection/image-data';
import CategoryFilter from './CategoryFilter';
import SearchBar from './SearchBar';
import ImageGrid from './ImageGrid';
import SelectionPanel from './SelectionPanel';
import ImageModal from './ImageModal';
import UploadZone from './UploadZone';
import { 
  getAutocompleteSuggestions, 
  type AutocompleteSuggestion 
} from '../../lib/pricing/autocomplete';

const ImageGallery: React.FC<ImageGalleryProps> = ({
  onSelectionChange,
  initialSelections = new Map(),
  maxSelections,
  allowMultiple = true,
  showQuantity = true,
  showCustomNotes = false,
  className
}) => {
  const [selectedImages, setSelectedImages] = useState<Map<string, ImageSelection>>(initialSelections);
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageForModal, setSelectedImageForModal] = useState<ItemImage | null>(null);
  
  // Word autocomplete state
  const [smartNote, setSmartNote] = useState('');
  const [smartNoteSuggestions, setSmartNoteSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSmartNoteSuggestions, setShowSmartNoteSuggestions] = useState(false);
  const [isSmartNoteLoading, setIsSmartNoteLoading] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  
  // Common moving words for word-based autocomplete
  const commonMovingWords = [
    'sofa', 'couch', 'chair', 'table', 'bed', 'mattress', 'wardrobe', 'dresser',
    'fridge', 'freezer', 'washing machine', 'dryer', 'dishwasher', 'oven', 'microwave',
    'tv', 'television', 'computer', 'laptop', 'desk', 'bookshelf', 'cabinet',
    'boxes', 'containers', 'bags', 'suitcases', 'clothes', 'books', 'papers',
    'kitchen', 'bathroom', 'bedroom', 'living room', 'dining room', 'office',
    'heavy', 'light', 'fragile', 'large', 'small', 'medium', 'antique', 'modern',
    'electronics', 'appliances', 'furniture', 'clothing', 'documents', 'photos',
    'piano', 'guitar', 'artwork', 'mirror', 'lamp', 'rug', 'curtains', 'plants'
  ];
  
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
  
  const toast = useToast();

  // Get all available images and categories
  const allImages = useMemo(() => getAllImages(), []);
  const categories = useMemo(() => getCategories(), []);

  // Filter images based on current category and search query
  const filteredImages = useMemo(() => {
    let images = allImages;

    // Filter by category
    if (currentCategory !== 'all') {
      images = getImagesByCategory(currentCategory as any);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      images = searchImages(searchQuery, currentCategory as any);
    }

    return images;
  }, [allImages, currentCategory, searchQuery]);



  // Smart note autocomplete functionality
  const handleSmartNoteChange = async (value: string) => {
    setSmartNote(value);
    setActiveSuggestionIndex(-1);
    
    if (value.length < 1) {
      // Show popular words when input is empty
      const popularWords = commonMovingWords.slice(0, 6).map(word => ({
        id: `word-${word}`,
        canonicalName: word,
        category: 'common word',
        categoryName: 'Popular Word',
        categoryIcon: '🔥',
        categoryColor: 'orange',
        volumeFactor: 1,
        requiresTwoPerson: false,
        isFragile: false,
        requiresDisassembly: false,
        basePriceHint: 0,
        relevance: 0.9,
        matchType: 'popular' as any
      }));
      
      setSmartNoteSuggestions(popularWords);
      setShowSmartNoteSuggestions(true);
      return;
    }

    setIsSmartNoteLoading(true);
    try {
      // Get catalog suggestions
      const catalogSuggestions = await getAutocompleteSuggestions(value, { maxResults: 3 });
      
      // Get word-based suggestions
      const wordSuggestions = commonMovingWords
        .filter(word => word.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 3)
        .map(word => ({
          id: `word-${word}`,
          canonicalName: word,
          category: 'common word',
          categoryName: 'Common Word',
          categoryIcon: '💬',
          categoryColor: 'gray',
          volumeFactor: 1,
          requiresTwoPerson: false,
          isFragile: false,
          requiresDisassembly: false,
          basePriceHint: 0,
          relevance: 0.8,
          matchType: 'word' as any
        }));
      
      // Combine and deduplicate suggestions
      const allSuggestions = [...catalogSuggestions, ...wordSuggestions];
      const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) => 
        index === self.findIndex(s => s.canonicalName.toLowerCase() === suggestion.canonicalName.toLowerCase())
      );
      
      setSmartNoteSuggestions(uniqueSuggestions.slice(0, 6));
      setShowSmartNoteSuggestions(uniqueSuggestions.length > 0);
    } catch (error) {
      console.error('Error getting smart note suggestions:', error);
      // Fallback to word suggestions only
      const wordSuggestions = commonMovingWords
        .filter(word => word.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5)
        .map(word => ({
          id: `word-${word}`,
          canonicalName: word,
          category: 'common word',
          categoryName: 'Common Word',
          categoryIcon: '💬',
          categoryColor: 'gray',
          volumeFactor: 1,
          requiresTwoPerson: false,
          isFragile: false,
          requiresDisassembly: false,
          basePriceHint: 0,
          relevance: 0.8,
          matchType: 'word' as any
        }));
      
      setSmartNoteSuggestions(wordSuggestions);
      setShowSmartNoteSuggestions(wordSuggestions.length > 0);
    } finally {
      setIsSmartNoteLoading(false);
    }
  };

  const handleSmartNoteKeyDown = (e: React.KeyboardEvent) => {
    if (!showSmartNoteSuggestions || smartNoteSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < smartNoteSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : smartNoteSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestionIndex >= 0 && activeSuggestionIndex < smartNoteSuggestions.length) {
          handleSmartNoteSelect(smartNoteSuggestions[activeSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSmartNoteSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;
    }
  };

  const handleSmartNoteSelect = (suggestion: AutocompleteSuggestion) => {
    setSmartNote(suggestion.canonicalName);
    setShowSmartNoteSuggestions(false);
    
    // Add the selected item to the image selections
    const newSelection: ImageSelection = {
      itemId: suggestion.canonicalName,
      quantity: 1,
      customNotes: '',
      selectedAt: new Date()
    };
    
    const newSelections = new Map(selectedImages);
    newSelections.set(suggestion.canonicalName, newSelection);
    setSelectedImages(newSelections);
    
    // Update parent component
    onSelectionChange(newSelections);
    
    toast({
      title: 'Item Added',
      description: `${suggestion.canonicalName} has been added to your selection`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleSmartNoteFocus = () => {
    if (smartNote.length === 0) {
      // Show popular words when input is focused and empty
      const popularWords = commonMovingWords.slice(0, 6).map(word => ({
        id: `word-${word}`,
        canonicalName: word,
        category: 'common word',
        categoryName: 'Popular Word',
        categoryIcon: '🔥',
        categoryColor: 'orange',
        volumeFactor: 1,
        requiresTwoPerson: false,
        isFragile: false,
        requiresDisassembly: false,
        basePriceHint: 0,
        relevance: 0.9,
        matchType: 'popular' as any
      }));
      
      setSmartNoteSuggestions(popularWords);
      setShowSmartNoteSuggestions(true);
    }
  };

  // Handle image selection
  const handleImageSelect = useCallback((imageId: string, quantity: number = 1) => {
    if (!allowMultiple && selectedImages.size >= (maxSelections || 1)) {
      toast({
        title: 'Selection limit reached',
        description: `You can only select ${maxSelections || 1} item${maxSelections !== 1 ? 's' : ''}.`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newSelections = new Map(selectedImages);
    const existingSelection = newSelections.get(imageId);
    
    if (existingSelection) {
      // Update quantity if image is already selected
      newSelections.set(imageId, {
        ...existingSelection,
        quantity: quantity,
        selectedAt: new Date()
      });
    } else {
      // Add new selection
      newSelections.set(imageId, {
        itemId: imageId,
        quantity: quantity,
        selectedAt: new Date()
      });
    }

    setSelectedImages(newSelections);
    onSelectionChange(newSelections);
  }, [selectedImages, allowMultiple, maxSelections, onSelectionChange, toast]);

  // Handle image deselection
  const handleImageDeselect = useCallback((imageId: string) => {
    const newSelections = new Map(selectedImages);
    newSelections.delete(imageId);
    setSelectedImages(newSelections);
    onSelectionChange(newSelections);
  }, [selectedImages, onSelectionChange]);

  // Handle quantity change
  const handleQuantityChange = useCallback((imageId: string, quantity: number) => {
    const newSelections = new Map(selectedImages);
    const existingSelection = newSelections.get(imageId);
    
    if (existingSelection) {
      newSelections.set(imageId, {
        ...existingSelection,
        quantity: Math.max(1, quantity),
        selectedAt: new Date()
      });
      setSelectedImages(newSelections);
      onSelectionChange(newSelections);
    }
  }, [selectedImages, onSelectionChange]);

  // Handle custom notes change
  const handleCustomNotesChange = useCallback((imageId: string, notes: string) => {
    const newSelections = new Map(selectedImages);
    const existingSelection = newSelections.get(imageId);
    
    if (existingSelection) {
      newSelections.set(imageId, {
        ...existingSelection,
        customNotes: notes,
        selectedAt: new Date()
      });
      setSelectedImages(newSelections);
      onSelectionChange(newSelections);
    }
  }, [selectedImages, onSelectionChange]);

  // Handle image removal
  const handleImageRemove = useCallback((imageId: string) => {
    handleImageDeselect(imageId);
  }, [handleImageDeselect]);

  // Handle category change
  const handleCategoryChange = useCallback((category: string) => {
    setCurrentCategory(category);
    setSearchQuery(''); // Clear search when changing category
  }, []);

  // Handle search query change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Handle image modal
  const handleImageClick = useCallback((image: ItemImage) => {
    setSelectedImageForModal(image);
    onModalOpen();
  }, [onModalOpen]);

  // Handle image selection from modal
  const handleModalSelect = useCallback((imageId: string) => {
    handleImageSelect(imageId, 1);
    onModalClose();
  }, [handleImageSelect, onModalClose]);

  // Handle upload
  const handleUpload = useCallback((uploadData: any) => {
    // In a real app, this would upload to server
    console.log('Upload data:', uploadData);
    toast({
      title: 'Upload successful',
      description: 'Your custom image has been added.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onUploadClose();
  }, [toast, onUploadClose]);

  // Get selected images data
  const selectedImagesData = useMemo(() => {
    const imagesMap = new Map<string, ItemImage>();
    allImages.forEach(img => imagesMap.set(img.id, img));
    return imagesMap;
  }, [allImages]);

  return (
    <Box className={className}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="xl" fontWeight="bold">
                Select Items
              </Text>
              <Text fontSize="sm" color="gray.600">
                Choose the items you want to move
              </Text>
            </VStack>
            
            <HStack spacing={2}>
              <Badge colorScheme="blue" variant="subtle">
                {selectedImages.size} selected
              </Badge>
              
              <Tooltip label="Toggle view mode">
                <IconButton
                  aria-label="Toggle view mode"
                  icon={viewMode === 'grid' ? <FaList /> : <FaTh />}
                  size="sm"
                  variant="ghost"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                />
              </Tooltip>
              
              <Button
                leftIcon={<FaEye />}
                size="sm"
                variant="outline"
                onClick={onUploadOpen}
              >
                Upload Custom
              </Button>
            </HStack>
          </HStack>
          
          <Divider />
        </Box>



        {/* Filters and Search */}
        <HStack spacing={4} wrap="wrap">
          <CategoryFilter
            categories={categories}
            selectedCategory={currentCategory}
            onCategoryChange={handleCategoryChange}
            showCount={true}
          />
          
          <Spacer />
          
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search items..."
          />
        </HStack>

        {/* Error Display */}
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <Flex justify="center" py={8}>
            <Spinner size="lg" />
          </Flex>
        )}

        {/* Image Grid */}
        {!isLoading && (
          <Box>
            {filteredImages.length === 0 ? (
              <Box textAlign="center" py={12}>
                <Text fontSize="lg" color="gray.500" mb={2}>
                  No items found
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Try adjusting your search or category filter
                </Text>
              </Box>
            ) : (
              <ImageGrid
                images={filteredImages}
                selectedImages={selectedImages}
                onImageSelect={handleImageSelect}
                onImageDeselect={handleImageDeselect}
                onImageClick={handleImageClick}
                viewMode={viewMode}
                showQuantity={showQuantity}
                showCustomNotes={showCustomNotes}
                maxQuantity={10}
              />
            )}
          </Box>
        )}

        {/* Selection Panel */}
        {selectedImages.size > 0 && (
          <SelectionPanel
            selections={selectedImages}
            images={selectedImagesData}
            onQuantityChange={handleQuantityChange}
            onRemove={handleImageRemove}
            onCustomNotesChange={handleCustomNotesChange}
            showCustomNotes={showCustomNotes}
          />
        )}
      </VStack>

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={onModalClose}
        image={selectedImageForModal}
        onSelect={handleModalSelect}
        isSelected={selectedImageForModal ? selectedImages.has(selectedImageForModal.id) : false}
      />

      {/* Upload Modal */}
      <UploadZone
        isOpen={isUploadOpen}
        onClose={onUploadClose}
        onUpload={handleUpload}
        acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
        maxSize={5 * 1024 * 1024} // 5MB
        maxFiles={1}
        category={currentCategory !== 'all' ? currentCategory : undefined}
      />
    </Box>
  );
};

export default ImageGallery;
