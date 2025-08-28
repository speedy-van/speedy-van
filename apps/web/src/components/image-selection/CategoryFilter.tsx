import React from 'react';
import {
  HStack,
  Button,
  Badge,
  Tooltip,
  useBreakpointValue
} from '@chakra-ui/react';
import { CategoryFilterProps } from '../../types/image-selection';

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  showCount = false
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleCategoryClick = (categoryName: string) => {
    onCategoryChange(categoryName);
  };

  return (
    <HStack spacing={2} wrap="wrap">
      {/* All Categories Button */}
      <Button
        size={isMobile ? 'sm' : 'md'}
        variant={selectedCategory === 'all' ? 'solid' : 'outline'}
        colorScheme={selectedCategory === 'all' ? 'blue' : 'gray'}
        onClick={() => handleCategoryClick('all')}
        borderRadius="full"
        px={4}
        _hover={{
          transform: 'translateY(-1px)',
          boxShadow: 'md'
        }}
        transition="all 0.2s"
      >
        All
        {showCount && (
          <Badge
            ml={2}
            colorScheme="blue"
            variant="subtle"
            borderRadius="full"
            fontSize="xs"
          >
            {categories.reduce((total, cat) => total + cat.count, 0)}
          </Badge>
        )}
      </Button>

      {/* Category Buttons */}
      {categories.map((category) => (
        <Tooltip
          key={category.name}
          label={category.description || category.displayName}
          placement="top"
          hasArrow
        >
          <Button
            size={isMobile ? 'sm' : 'md'}
            variant={selectedCategory === category.name ? 'solid' : 'outline'}
            colorScheme={selectedCategory === category.name ? 'blue' : 'gray'}
            onClick={() => handleCategoryClick(category.name)}
            borderRadius="full"
            px={4}
            _hover={{
              transform: 'translateY(-1px)',
              boxShadow: 'md',
              borderColor: category.color,
              color: category.color
            }}
            transition="all 0.2s"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: selectedCategory === category.name 
                ? `linear-gradient(135deg, ${category.color}20, ${category.color}10)`
                : 'transparent',
              transition: 'all 0.2s'
            }}
          >
            <HStack spacing={2}>
              <span style={{ fontSize: '1.2em' }}>{category.icon}</span>
              <span>{category.displayName}</span>
              {showCount && (
                <Badge
                  colorScheme="gray"
                  variant="subtle"
                  borderRadius="full"
                  fontSize="xs"
                  minW="20px"
                  textAlign="center"
                >
                  {category.count}
                </Badge>
              )}
            </HStack>
          </Button>
        </Tooltip>
      ))}
    </HStack>
  );
};

export default CategoryFilter;
