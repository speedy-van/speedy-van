import React from 'react';
import {
  HStack,
  IconButton,
  Tooltip,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Icon,
  VStack,
} from '@chakra-ui/react';
import {
  FiGrid,
  FiList,
  FiColumns,
  FiChevronDown,
  FiEye,
} from 'react-icons/fi';

export type ViewType = 'table' | 'card' | 'kanban';

interface ViewToggleProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const viewOptions = [
  {
    type: 'table' as ViewType,
    icon: FiList,
    label: 'Table View',
    description: 'Traditional list view',
  },
  {
    type: 'card' as ViewType,
    icon: FiGrid,
    label: 'Card View',
    description: 'Grid layout with cards',
  },
  {
    type: 'kanban' as ViewType,
    icon: FiColumns,
    label: 'Kanban View',
    description: 'Board with columns',
  },
];

export function ViewToggle({ view, onViewChange, showLabel = false, size = 'md' }: ViewToggleProps) {
  // Use neon dark theme colors
  const bgColor = 'bg.surface';
  const borderColor = 'border.primary';
  const activeBg = 'neon.500';
  const activeColor = 'dark.900';

  const currentView = viewOptions.find(v => v.type === view);

  if (showLabel) {
    return (
      <Menu>
        <MenuButton
          as={IconButton}
          icon={
            <HStack spacing={2}>
              <Icon as={currentView?.icon} color="text.secondary" />
              <Text fontSize="sm" color="text.secondary">{currentView?.label}</Text>
              <Icon as={FiChevronDown} color="text.secondary" />
            </HStack>
          }
          variant="outline"
          size={size}
          borderColor={borderColor}
          _hover={{ borderColor: 'neon.500' }}
          color="text.secondary"
        />
        <MenuList bg={bgColor} borderColor={borderColor}>
          {viewOptions.map((option) => (
            <MenuItem
              key={option.type}
              icon={<Icon as={option.icon} />}
              onClick={() => onViewChange(option.type)}
              bg={view === option.type ? activeBg : 'transparent'}
              color={view === option.type ? activeColor : 'text.secondary'}
              _hover={{ bg: view === option.type ? activeBg : 'bg.surface.hover', color: view === option.type ? activeColor : 'text.primary' }}
            >
              <VStack align="start" spacing={0}>
                <Text fontWeight="medium">{option.label}</Text>
                <Text fontSize="xs" color="text.tertiary">
                  {option.description}
                </Text>
              </VStack>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    );
  }

  return (
    <HStack spacing={1} bg={bgColor} border="1px solid" borderColor={borderColor} borderRadius="md" p={1}>
      {viewOptions.map((option) => (
        <Tooltip key={option.type} label={option.label}>
          <IconButton
            icon={<Icon as={option.icon} />}
            size={size}
            variant="ghost"
            onClick={() => onViewChange(option.type)}
            bg={view === option.type ? activeBg : 'transparent'}
            color={view === option.type ? activeColor : 'text.tertiary'}
            _hover={{
              bg: view === option.type ? activeBg : 'bg.surface.hover',
              color: view === option.type ? activeColor : 'text.primary',
            }}
            aria-label={option.label}
          />
        </Tooltip>
      ))}
    </HStack>
  );
}
