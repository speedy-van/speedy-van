import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Badge,
  Divider,
  Icon,
  useToast,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  InputGroup,
  InputRightElement,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  List,
  ListItem,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import PricingDisplay from './PricingDisplay';
import BookingNavigationButtons from './BookingNavigationButtons';
import {
  getAutocompleteSuggestions,
  type AutocompleteSuggestion,
} from '../../lib/pricing/autocomplete';
import { ImageSelection } from '../../types/image-selection';
import ImageGallery from '../image-selection/ImageGallery';

interface EnhancedItemSelectionStepWithImagesProps {
  bookingData: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  isCurrentStep: boolean;
}

const EnhancedItemSelectionStepWithImages: React.FC<
  EnhancedItemSelectionStepWithImagesProps
> = ({ bookingData, onUpdate, onNext, onBack, isCurrentStep }) => {
  const [selectedImages, setSelectedImages] = useState<
    Map<string, ImageSelection>
  >(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Smart note autocomplete state
  const [smartNote, setSmartNote] = useState('');
  const [smartNoteSuggestions, setSmartNoteSuggestions] = useState<
    AutocompleteSuggestion[]
  >([]);
  const [showSmartNoteSuggestions, setShowSmartNoteSuggestions] =
    useState(false);
  const [isSmartNoteLoading, setIsSmartNoteLoading] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  // Common moving words for word-based autocomplete - memoize to prevent recreation
  const commonMovingWords = useMemo(
    () => [
      'sofa',
      'couch',
      'chair',
      'table',
      'bed',
      'mattress',
      'wardrobe',
      'dresser',
      'fridge',
      'freezer',
      'washing machine',
      'dryer',
      'dishwasher',
      'oven',
      'microwave',
      'tv',
      'television',
      'computer',
      'laptop',
      'desk',
      'bookshelf',
      'cabinet',
      'boxes',
      'containers',
      'bags',
      'suitcases',
      'clothes',
      'books',
      'papers',
      'kitchen',
      'bathroom',
      'bedroom',
      'living room',
      'dining room',
      'office',
      'heavy',
      'light',
      'fragile',
      'large',
      'small',
      'medium',
      'antique',
      'modern',
      'electronics',
      'appliances',
      'furniture',
      'clothing',
      'documents',
      'photos',
      'piano',
      'guitar',
      'artwork',
      'mirror',
      'lamp',
      'rug',
      'curtains',
      'plants',
    ],
    []
  );

  const {
    isOpen: isHelpOpen,
    onOpen: onHelpOpen,
    onClose: onHelpClose,
  } = useDisclosure();

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Memoize the onUpdate callback to prevent unnecessary re-renders
  const stableOnUpdate = useCallback(
    (updates: any) => {
      onUpdate(updates);
    },
    [onUpdate]
  );

  // Add a ref to track update cycles and prevent infinite loops
  const updateCycleRef = useRef(0);
  const lastUpdateRef = useRef<any>(null);

  // Initialize selected images from booking data if available
  useEffect(() => {
    if (bookingData.selectedImages) {
      const imageMap = new Map();
      Object.entries(bookingData.selectedImages).forEach(([key, value]) => {
        imageMap.set(key, value as ImageSelection);
      });
      setSelectedImages(imageMap);
    }
  }, [bookingData.selectedImages]);

  // Handle clicking outside smart note suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.smart-note-container')) {
        setShowSmartNoteSuggestions(false);
      }
    };

    if (showSmartNoteSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSmartNoteSuggestions]);

  // Smart note autocomplete functionality
  const handleSmartNoteChange = useCallback(
    async (value: string) => {
      console.log('🔍 Smart note change:', value); // Debug log
      setSmartNote(value);
      setActiveSuggestionIndex(-1);

      if (value.length < 1) {
        // Show popular words when input is empty
        const popularWords: AutocompleteSuggestion[] = commonMovingWords
          .slice(0, 6)
          .map(word => ({
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
            matchType: 'exact' as const,
          }));

        console.log('🔥 Setting popular words:', popularWords); // Debug log
        setSmartNoteSuggestions(popularWords);
        setShowSmartNoteSuggestions(true);
        return;
      }

      setIsSmartNoteLoading(true);
      try {
        // Get catalog suggestions
        const catalogSuggestions = await getAutocompleteSuggestions(value, {
          maxResults: 3,
        });

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
            matchType: 'word' as any,
          }));

        // Combine and deduplicate suggestions
        const allSuggestions = [...catalogSuggestions, ...wordSuggestions];
        const uniqueSuggestions = allSuggestions.filter(
          (suggestion, index, self) =>
            index ===
            self.findIndex(
              s =>
                s.canonicalName.toLowerCase() ===
                suggestion.canonicalName.toLowerCase()
            )
        );

        console.log(
          '📦 Setting catalog suggestions:',
          uniqueSuggestions.slice(0, 6)
        ); // Debug log
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
            matchType: 'word' as any,
          }));

        console.log('💬 Setting word suggestions:', wordSuggestions); // Debug log
        setSmartNoteSuggestions(wordSuggestions);
        setShowSmartNoteSuggestions(wordSuggestions.length > 0);
      } finally {
        setIsSmartNoteLoading(false);
      }
    },
    [commonMovingWords]
  );

  const handleSmartNoteKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSmartNoteSuggestions || smartNoteSuggestions.length === 0)
        return;

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
          if (
            activeSuggestionIndex >= 0 &&
            activeSuggestionIndex < smartNoteSuggestions.length
          ) {
            handleSmartNoteSelect(smartNoteSuggestions[activeSuggestionIndex]);
          }
          break;
        case 'Escape':
          setShowSmartNoteSuggestions(false);
          setActiveSuggestionIndex(-1);
          break;
      }
    },
    [showSmartNoteSuggestions, smartNoteSuggestions, activeSuggestionIndex]
  );

  const handleSmartNoteSelect = useCallback(
    (suggestion: AutocompleteSuggestion) => {
      setSmartNote(suggestion.canonicalName);
      setShowSmartNoteSuggestions(false);

      // Add the selected item to the image selections
      const newSelection: ImageSelection = {
        itemId: suggestion.canonicalName,
        quantity: 1,
        customNotes: '',
        selectedAt: new Date(),
      };

      const newSelections = new Map(selectedImages);
      newSelections.set(suggestion.canonicalName, newSelection);
      setSelectedImages(newSelections);

      // Update booking data with cycle protection
      const selectionsObject = Object.fromEntries(newSelections);
      const updateData = {
        selectedImages: selectionsObject,
        items: Object.values(selectionsObject).map(selection => ({
          name: selection.itemId,
          quantity: selection.quantity,
          notes: selection.customNotes,
        })),
      };

      // Prevent infinite update cycles
      const updateKey = JSON.stringify(updateData);
      if (lastUpdateRef.current !== updateKey) {
        lastUpdateRef.current = updateKey;
        updateCycleRef.current++;

        if (updateCycleRef.current < 10) {
          // Safety limit
          stableOnUpdate(updateData);
        } else {
          console.warn('Update cycle limit reached, preventing infinite loop');
          updateCycleRef.current = 0;
        }
      }

      toast({
        title: 'Item Added',
        description: `${suggestion.canonicalName} has been added to your selection`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    },
    [selectedImages, stableOnUpdate, toast]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: AutocompleteSuggestion) => {
      handleSmartNoteSelect(suggestion);
    },
    [handleSmartNoteSelect]
  );

  const handleSmartNoteFocus = useCallback(() => {
    console.log('🎯 Smart note focused, current length:', smartNote.length); // Debug log
    if (smartNote.length === 0) {
      // Show popular words when input is focused and empty
      const popularWords: AutocompleteSuggestion[] = commonMovingWords
        .slice(0, 6)
        .map(word => ({
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
          matchType: 'exact' as const,
        }));

      console.log('🔥 Focus: Setting popular words:', popularWords); // Debug log
      setSmartNoteSuggestions(popularWords);
      setShowSmartNoteSuggestions(true);
    }
  }, [smartNote.length, commonMovingWords]);

  // Handle image selection changes
  const handleImageSelectionChange = useCallback(
    (selections: Map<string, ImageSelection>) => {
      setSelectedImages(selections);

      // Convert Map to object for storage
      const selectionsObject = Object.fromEntries(selections);
      const updateData = {
        selectedImages: selectionsObject,
        items: Object.values(selectionsObject).map(selection => ({
          name: selection.itemId,
          quantity: selection.quantity,
          notes: selection.customNotes,
        })),
      };

      // Prevent infinite update cycles
      const updateKey = JSON.stringify(updateData);
      if (lastUpdateRef.current !== updateKey) {
        lastUpdateRef.current = updateKey;
        updateCycleRef.current++;

        if (updateCycleRef.current < 10) {
          // Safety limit
          stableOnUpdate(updateData);
        } else {
          console.warn('Update cycle limit reached, preventing infinite loop');
          updateCycleRef.current = 0;
        }
      }
    },
    [stableOnUpdate]
  );

  // Handle next step
  const handleNext = useCallback(() => {
    if (selectedImages.size === 0) {
      toast({
        title: 'No items selected',
        description: 'Please select at least one item to continue.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate selections
    const totalItems = Array.from(selectedImages.values()).reduce(
      (sum, selection) => sum + selection.quantity,
      0
    );
    if (totalItems === 0) {
      toast({
        title: 'Invalid selection',
        description:
          'Please select at least one item with quantity greater than 0.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onNext();
  }, [selectedImages, toast, onNext]);

  // Handle back step
  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  return (
    <Box
      p={6}
      borderWidth="2px"
      borderRadius="xl"
      bg="dark.900"
      borderColor="border.neon"
      boxShadow="neon.glow"
      className="booking-step-card"
      overflow="visible"
    >
      <VStack spacing={6} align="stretch" overflow="visible">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="neon.500">
                Step 3: Select Items
              </Text>
              <Text fontSize="md" color="text.secondary">
                Choose the items you want to move from our organized catalog
              </Text>
              <Text fontSize="sm" color="text.tertiary" mt={2}>
                💡 Tip: Use the search box below to quickly find items, or
                browse our visual catalog. Don't worry about being exact - we'll
                help you find the right items and calculate accurate pricing.
              </Text>
            </VStack>

            <HStack spacing={3}>
              <Badge
                colorScheme="neon"
                variant="solid"
                fontSize="md"
                px={3}
                py={1}
              >
                {selectedImages.size} items selected
              </Badge>

              <Tooltip label="View help">
                <IconButton
                  aria-label="Help"
                  icon={<FaInfoCircle />}
                  variant="ghost"
                  colorScheme="neon"
                  onClick={onHelpOpen}
                />
              </Tooltip>
            </HStack>
          </HStack>

          <Divider borderColor="border.primary" />
        </Box>

        {/* Smart Note Input with Autocomplete */}
        <Box
          overflow="visible"
          bg="dark.800"
          p={6}
          borderRadius="xl"
          borderWidth="2px"
          borderColor="border.neon"
          boxShadow="neon.glow"
          position="relative"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 'xl',
            background:
              'linear-gradient(135deg, rgba(0,194,255,0.05) 0%, rgba(0,209,143,0.05) 100%)',
            pointerEvents: 'none',
          }}
        >
          <VStack
            spacing={5}
            align="stretch"
            overflow="visible"
            position="relative"
            zIndex={1}
          >
            <Box textAlign="center">
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="neon.500"
                mb={3}
                textShadow="0 0 10px rgba(0,194,255,0.5)"
              >
                🔍 Quick Item Search
              </Text>
              <Text fontSize="md" color="text.secondary" mb={4}>
                Type what you're moving and we'll instantly suggest items from
                our catalog
              </Text>
            </Box>

            <Box
              position="relative"
              className="smart-note-container"
              overflow="visible"
            >
              <InputGroup>
                <Input
                  value={smartNote}
                  onChange={e => handleSmartNoteChange(e.target.value)}
                  onKeyDown={handleSmartNoteKeyDown}
                  onFocus={handleSmartNoteFocus}
                  placeholder="🔍 Type to search items or start with popular words like 'sofa', 'fridge', 'boxes'..."
                  size="lg"
                  borderRadius="xl"
                  borderColor="border.neon"
                  bg="dark.700"
                  color="text.primary"
                  _focus={{
                    borderColor: 'neon.400',
                    boxShadow: '0 0 0 3px rgba(0,194,255,0.3), neon.glow',
                    bg: 'dark.600',
                  }}
                  _hover={{
                    borderColor: 'neon.400',
                    bg: 'dark.600',
                  }}
                  _placeholder={{
                    color: 'text.tertiary',
                    fontWeight: 'medium',
                  }}
                />
                {isSmartNoteLoading && (
                  <InputRightElement>
                    <Spinner size="sm" color="neon.500" />
                  </InputRightElement>
                )}
              </InputGroup>

              {/* Enhanced Help Text */}
              <VStack spacing={3} mt={4}>
                <Text
                  fontSize="sm"
                  color="neon.400"
                  fontWeight="medium"
                  textAlign="center"
                >
                  💡 Start typing to see autocomplete suggestions!
                </Text>
                <HStack spacing={3} justify="center" flexWrap="wrap">
                  <Badge
                    colorScheme="neon"
                    variant="subtle"
                    fontSize="xs"
                    px={3}
                    py={1}
                    borderColor="border.neon"
                    _hover={{
                      bg: 'neon.500',
                      color: 'text.inverse',
                      transform: 'translateY(-1px)',
                      boxShadow: 'neon.glow',
                    }}
                    transition="all 0.2s"
                  >
                    Try: sofa
                  </Badge>
                  <Badge
                    colorScheme="neon"
                    variant="subtle"
                    fontSize="xs"
                    px={3}
                    py={1}
                    borderColor="border.neon"
                    _hover={{
                      bg: 'neon.500',
                      color: 'text.inverse',
                      transform: 'translateY(-1px)',
                      boxShadow: 'neon.glow',
                    }}
                    transition="all 0.2s"
                  >
                    Try: fridge
                  </Badge>
                  <Badge
                    colorScheme="neon"
                    variant="subtle"
                    fontSize="xs"
                    px={3}
                    py={1}
                    borderColor="border.neon"
                    _hover={{
                      bg: 'neon.500',
                      color: 'text.inverse',
                      transform: 'translateY(-1px)',
                      boxShadow: 'neon.glow',
                    }}
                    transition="all 0.2s"
                  >
                    Try: boxes
                  </Badge>
                  <Badge
                    colorScheme="neon"
                    variant="subtle"
                    fontSize="xs"
                    px={3}
                    py={1}
                    borderColor="border.neon"
                    _hover={{
                      bg: 'neon.500',
                      color: 'text.inverse',
                      transform: 'translateY(-1px)',
                      boxShadow: 'neon.glow',
                    }}
                    transition="all 0.2s"
                  >
                    Try: bed
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="text.tertiary" textAlign="center">
                  Popular items appear automatically when you focus the search
                  box
                </Text>
              </VStack>

              {/* Autocomplete Suggestions */}
              {showSmartNoteSuggestions && smartNoteSuggestions.length > 0 && (
                <Box
                  position="absolute"
                  top="100%"
                  left={0}
                  width="100%"
                  bg="dark.700"
                  border="2px solid"
                  borderColor="border.neon"
                  borderRadius="lg"
                  boxShadow="xl"
                  zIndex={9999}
                  maxH="250px"
                  overflowY="auto"
                  mt={2}
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: '-8px',
                    left: '20px',
                    width: '0',
                    height: '0',
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderBottom: '8px solid',
                    borderBottomColor: 'dark.700',
                  }}
                >
                  {smartNoteSuggestions.map((suggestion, index) => (
                    <Box
                      key={suggestion.canonicalName}
                      px={4}
                      py={3}
                      cursor="pointer"
                      _hover={{
                        bg: 'dark.600',
                        borderLeft: '3px solid',
                        borderLeftColor: 'neon.500',
                      }}
                      onClick={() => handleSmartNoteSelect(suggestion)}
                      borderBottom={
                        index < smartNoteSuggestions.length - 1
                          ? '1px solid'
                          : 'none'
                      }
                      borderColor="border.primary"
                      bg={
                        activeSuggestionIndex === index
                          ? 'dark.600'
                          : 'transparent'
                      }
                      transition="all 0.2s"
                    >
                      <HStack justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium" color="text.primary">
                            {suggestion.canonicalName}
                          </Text>
                          {suggestion.category &&
                            suggestion.category !== 'common word' && (
                              <Text fontSize="sm" color="text.tertiary">
                                {suggestion.category}
                              </Text>
                            )}
                        </VStack>
                        <HStack spacing={2}>
                          {suggestion.category === 'common word' ? (
                            suggestion.categoryName === 'Popular Word' ? (
                              <Badge
                                colorScheme="orange"
                                variant="subtle"
                                fontSize="xs"
                              >
                                🔥 Popular
                              </Badge>
                            ) : (
                              <Badge
                                colorScheme="gray"
                                variant="subtle"
                                fontSize="xs"
                              >
                                💬 Word
                              </Badge>
                            )
                          ) : (
                            <Badge
                              colorScheme="neon"
                              variant="subtle"
                              fontSize="xs"
                            >
                              📦 Item
                            </Badge>
                          )}
                          <Badge
                            colorScheme="brand"
                            variant="subtle"
                            fontSize="xs"
                          >
                            Add
                          </Badge>
                        </HStack>
                      </HStack>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </VStack>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Content - Always show Visual Selection */}
        <Box>
          <ImageGallery
            onSelectionChange={handleImageSelectionChange}
            initialSelections={selectedImages}
            allowMultiple={true}
            showQuantity={true}
            showCustomNotes={true}
            maxSelections={50}
          />
        </Box>

        {/* Selection Summary */}
        {selectedImages.size > 0 && (
          <Box
            border="1px solid"
            borderColor="border.neon"
            borderRadius="lg"
            bg="dark.800"
            p={4}
            boxShadow="neon.glow"
          >
            <VStack align="start" spacing={3}>
              <HStack>
                <Icon as={FaCheckCircle} color="neon.500" />
                <Text fontWeight="semibold" color="neon.400">
                  Selection Summary
                </Text>
              </HStack>

              <HStack spacing={4} wrap="wrap">
                <Badge colorScheme="neon" variant="solid">
                  {selectedImages.size} unique items
                </Badge>
                <Badge colorScheme="brand" variant="subtle">
                  {Array.from(selectedImages.values()).reduce(
                    (sum, selection) => sum + selection.quantity,
                    0
                  )}{' '}
                  total items
                </Badge>
                <Badge colorScheme="purple" variant="subtle">
                  {
                    Array.from(selectedImages.values()).filter(
                      selection => selection.customNotes
                    ).length
                  }{' '}
                  with notes
                </Badge>
              </HStack>

              <Text fontSize="sm" color="text.secondary">
                Your selections have been saved and will be used for pricing
                calculations.
              </Text>
            </VStack>
          </Box>
        )}

        {/* Pricing Display */}
        <PricingDisplay bookingData={bookingData} />

        {/* Navigation */}
        <BookingNavigationButtons
          onBack={handleBack}
          onNext={handleNext}
          nextDisabled={selectedImages.size === 0}
          nextText="Continue to Date & Time"
          backText="Back to Property Details"
        />
      </VStack>

      {/* Help Modal */}
      <Modal isOpen={isHelpOpen} onClose={onHelpClose} size="2xl">
        <ModalOverlay />
        <ModalContent bg="dark.900" borderColor="border.neon" borderWidth="1px">
          <ModalHeader color="neon.500">How to Select Items</ModalHeader>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="semibold" mb={2} color="text.primary">
                  Visual Selection
                </Text>
                <List spacing={2}>
                  <ListItem color="text.secondary">
                    • Browse items by category using the filter buttons
                  </ListItem>
                  <ListItem color="text.secondary">
                    • Search for specific items using the search bar
                  </ListItem>
                  <ListItem color="text.secondary">
                    • Click on items to view details and add to selection
                  </ListItem>
                  <ListItem color="text.secondary">
                    • Adjust quantities using the number inputs
                  </ListItem>
                  <ListItem color="text.secondary">
                    • Add custom notes for special handling instructions
                  </ListItem>
                </List>
              </Box>

              <Box>
                <Text fontWeight="semibold" mb={2} color="text.primary">
                  Quick Search
                </Text>
                <List spacing={2}>
                  <ListItem color="text.secondary">
                    • Type item names to see autocomplete suggestions
                  </ListItem>
                  <ListItem color="text.secondary">
                    • Select from the dropdown suggestions
                  </ListItem>
                  <ListItem color="text.secondary">
                    • Items are automatically added to your selection
                  </ListItem>
                  <ListItem color="text.secondary">
                    • Use natural language (e.g., "large sofa", "6 boxes")
                  </ListItem>
                </List>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="neon" onClick={onHelpClose}>
              Got it!
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EnhancedItemSelectionStepWithImages;
