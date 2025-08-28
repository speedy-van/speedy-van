import React from 'react';
import {
  SimpleGrid,
  VStack,
  HStack,
  Box,
  Text,
  Badge,
  IconButton,
  Tooltip,
  useBreakpointValue,
  Skeleton,
  SkeletonText
} from '@chakra-ui/react';
import { FaCheck, FaEye, FaPlus, FaMinus } from 'react-icons/fa';
import Image from 'next/image';
import { ItemImage, ImageSelection } from '../../types/image-selection';
import ImageCard from './ImageCard';

interface ImageGridProps {
  images: ItemImage[];
  selectedImages: Map<string, ImageSelection>;
  onImageSelect: (imageId: string, quantity?: number) => void;
  onImageDeselect: (imageId: string) => void;
  onImageClick: (image: ItemImage) => void;
  viewMode: 'grid' | 'list';
  showQuantity?: boolean;
  showCustomNotes?: boolean;
  maxQuantity?: number;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  selectedImages,
  onImageSelect,
  onImageDeselect,
  onImageClick,
  viewMode,
  showQuantity = true,
  showCustomNotes = false,
  maxQuantity = 10
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });

  // Determine grid columns based on screen size and view mode
  const getGridColumns = () => {
    if (viewMode === 'list') return 1;
    if (isMobile) return 2;
    if (isTablet) return 3;
    return 4;
  };

  const gridColumns = getGridColumns();

  const handleImageSelect = (imageId: string, quantity: number = 1) => {
    const isSelected = selectedImages.has(imageId);
    
    if (isSelected) {
      onImageDeselect(imageId);
    } else {
      onImageSelect(imageId, quantity);
    }
  };

  const handleQuantityChange = (imageId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      onImageDeselect(imageId);
    } else if (newQuantity <= maxQuantity) {
      onImageSelect(imageId, newQuantity);
    }
  };

  if (viewMode === 'list') {
    return (
      <VStack spacing={3} align="stretch">
        {images.map((image) => {
          const isSelected = selectedImages.has(image.id);
          const selection = selectedImages.get(image.id);
          
          return (
            <Box
              key={image.id}
              border="1px solid"
              borderColor={isSelected ? 'blue.200' : 'gray.200'}
              borderRadius="lg"
              p={4}
              bg={isSelected ? 'blue.50' : 'white'}
              _hover={{
                borderColor: isSelected ? 'blue.300' : 'gray.300',
                shadow: 'md',
                transform: 'translateY(-1px)'
              }}
              transition="all 0.2s"
              cursor="pointer"
              onClick={() => onImageClick(image)}
            >
              <HStack spacing={4} align="center">
                {/* Image */}
                <Box
                  position="relative"
                  width="80px"
                  height="80px"
                  borderRadius="md"
                  overflow="hidden"
                  flexShrink={0}
                >
                  <Image
                    src={image.path}
                    alt={image.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="80px"
                  />
                  {isSelected && (
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      bg="blue.500"
                      opacity={0.8}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                                             <FaCheck color="white" size={20} />
                    </Box>
                  )}
                </Box>

                {/* Content */}
                <VStack align="start" flex={1} spacing={1}>
                  <Text fontWeight="semibold" fontSize="md">
                    {image.name}
                  </Text>
                  {image.description && (
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      {image.description}
                    </Text>
                  )}
                  <HStack spacing={2}>
                    {image.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} size="sm" variant="subtle" colorScheme="gray">
                        {tag}
                      </Badge>
                    ))}
                  </HStack>
                </VStack>

                {/* Actions */}
                <VStack spacing={2} align="center">
                  {showQuantity && isSelected && (
                    <HStack spacing={1}>
                      <IconButton
                        aria-label="Decrease quantity"
                        icon={<FaMinus />}
                        size="xs"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuantityChange(image.id, (selection?.quantity || 1) - 1);
                        }}
                      />
                      <Text fontSize="sm" fontWeight="semibold" minW="20px" textAlign="center">
                        {selection?.quantity || 1}
                      </Text>
                      <IconButton
                        aria-label="Increase quantity"
                        icon={<FaPlus />}
                        size="xs"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuantityChange(image.id, (selection?.quantity || 1) + 1);
                        }}
                        isDisabled={(selection?.quantity || 1) >= maxQuantity}
                      />
                    </HStack>
                  )}
                  
                  <Tooltip label={isSelected ? 'Remove from selection' : 'Add to selection'}>
                    <IconButton
                      aria-label={isSelected ? 'Remove from selection' : 'Add to selection'}
                      icon={isSelected ? <FaMinus /> : <FaPlus />}
                      size="sm"
                      colorScheme={isSelected ? 'red' : 'blue'}
                      variant={isSelected ? 'solid' : 'outline'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageSelect(image.id);
                      }}
                    />
                  </Tooltip>
                </VStack>
              </HStack>
            </Box>
          );
        })}
      </VStack>
    );
  }

  return (
    <SimpleGrid columns={gridColumns} spacing={4}>
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          isSelected={selectedImages.has(image.id)}
          onSelect={handleImageSelect}
          onDeselect={onImageDeselect}
          showQuantity={showQuantity}
          showCustomNotes={showCustomNotes}
          maxQuantity={maxQuantity}
          onImageClick={onImageClick}
        />
      ))}
    </SimpleGrid>
  );
};

export default ImageGrid;
