'use client';

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Collapse,
  useColorModeValue,
  Flex,
  Divider,
  Badge
} from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome,
  FiTruck,
  FiUsers,
  FiDollarSign,
  FiActivity,
  FiSettings,
  FiFileText,
  FiMapPin,
  FiShield,
  FiDatabase,
  FiBarChart,
  FiCalendar,
  FiMessageSquare,
  FiChevronDown,
  FiChevronRight,
  FiTag
} from 'react-icons/fi';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: FiHome
  },
  {
    label: 'Operations',
    href: '/admin/orders',
    icon: FiTruck,
    children: [
      { label: 'Orders', href: '/admin/orders', icon: FiFileText },
      { label: 'Dispatch', href: '/admin/dispatch', icon: FiMapPin },
      { label: 'Jobs', href: '/admin/jobs', icon: FiCalendar },
      { label: 'Tracking', href: '/admin/tracking', icon: FiBarChart }
    ]
  },
  {
    label: 'People',
    href: '/admin/drivers',
    icon: FiUsers,
    children: [
      { label: 'Drivers', href: '/admin/drivers', icon: FiUsers },
      { label: 'Driver Applications', href: '/admin/drivers/applications', icon: FiFileText },
      { label: 'Customers', href: '/admin/customers', icon: FiUsers },
      { label: 'Team & Roles', href: '/admin/users', icon: FiShield }
    ]
  },
  {
    label: 'Chat',
    href: '/admin/chat',
    icon: FiMessageSquare,
    badge: 'Live'
  },
  {
    label: 'Finance',
    href: '/admin/finance',
    icon: FiDollarSign,
    children: [
      { label: 'Overview', href: '/admin/finance', icon: FiDollarSign },
      { label: 'Payouts', href: '/admin/payouts', icon: FiDollarSign }
    ]
  },
  {
    label: 'Content',
    href: '/admin/content',
    icon: FiFileText,
    children: [
      { label: 'Service Areas', href: '/admin/content', icon: FiMapPin },
      { label: 'Promotions', href: '/admin/content/promotions', icon: FiTag }
    ]
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: FiBarChart
  },
  {
    label: 'Health',
    href: '/admin/health',
    icon: FiActivity
  },
  {
    label: 'Logs',
    href: '/admin/logs',
    icon: FiDatabase,
    children: [
      { label: 'Audit Logs', href: '/admin/audit', icon: FiDatabase },
      { label: 'System Logs', href: '/admin/logs', icon: FiDatabase },
      { label: 'Error Logs', href: '/admin/logs/errors', icon: FiMessageSquare }
    ]
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: FiSettings,
    children: [
      { label: 'General', href: '/admin/settings', icon: FiSettings },
      { label: 'Pricing', href: '/admin/settings/pricing', icon: FiDollarSign },
      { label: 'Integrations', href: '/admin/settings/integrations', icon: FiSettings },
      { label: 'Security', href: '/admin/settings/security', icon: FiShield },
      { label: 'Legal', href: '/admin/settings/legal', icon: FiFileText }
    ]
  }
];

interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: (href: string) => void;
  level?: number;
  pathname: string;
}

function NavItemComponent({ item, isActive, isExpanded, onToggle, level = 0, pathname }: NavItemComponentProps) {
  const [isOpen, setIsOpen] = useState(isExpanded);
  const hasChildren = item.children && item.children.length > 0;
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const activeBgColor = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.200');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const inactiveColor = useColorModeValue('gray.400', 'gray.500');

  const handleToggle = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
      onToggle(item.href);
    }
  };

  // Check if any child is active
  const hasActiveChild = hasChildren && item.children?.some(child => {
    return child.href === pathname;
  });

  const itemContent = (
    <HStack
      w="full"
      px={4}
      py={2}
      spacing={3}
      borderRadius="md"
      cursor={hasChildren ? 'pointer' : 'default'}
      bg={isActive || hasActiveChild ? activeBgColor : 'transparent'}
      color={isActive ? activeColor : hasActiveChild ? textColor : inactiveColor}
      _hover={{
        bg: isActive || hasActiveChild ? activeBgColor : bgColor
      }}
      transition="all 0.2s"
      pl={4 + level * 16}
    >
      <Icon 
        as={item.icon} 
        boxSize={4} 
        color={isActive ? activeColor : hasActiveChild ? textColor : inactiveColor}
      />
      <Text 
        fontSize="sm" 
        fontWeight={isActive ? 'semibold' : hasActiveChild ? 'medium' : 'normal'} 
        flex={1}
      >
        {item.label}
      </Text>
      {hasActiveChild && !isActive && (
        <Badge size="sm" colorScheme="blue" variant="subtle">
          Active
        </Badge>
      )}
      {item.badge && (
        <Badge size="sm" colorScheme="blue" variant="subtle">
          {item.badge}
        </Badge>
      )}
      {hasChildren && (
        <Icon
          as={isOpen ? FiChevronDown : FiChevronRight}
          boxSize={4}
          transition="transform 0.2s"
          color={isActive || hasActiveChild ? activeColor : inactiveColor}
        />
      )}
    </HStack>
  );

  return (
    <Box>
      {hasChildren ? (
        <Box onClick={handleToggle}>
          {itemContent}
        </Box>
      ) : (
        <Link href={item.href} style={{ textDecoration: 'none' }}>
          {itemContent}
        </Link>
      )}
      
             {hasChildren && (
         <Collapse in={isOpen} animateOpacity>
           <VStack spacing={1} mt={1} align="stretch">
             {item.children?.map((child) => {
               const childIsActive = child.href === pathname;
               return (
                 <NavItemComponent
                   key={child.href}
                   item={child}
                   isActive={childIsActive}
                   isExpanded={false}
                   onToggle={onToggle}
                   level={level + 1}
                   pathname={pathname}
                 />
               );
             })}
           </VStack>
         </Collapse>
       )}
    </Box>
  );
}

interface AdminNavigationProps {
  isCollapsed?: boolean;
}

export default function AdminNavigation({ isCollapsed = false }: AdminNavigationProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleToggle = (href: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(href)) {
      newExpanded.delete(href);
    } else {
      newExpanded.add(href);
    }
    setExpandedItems(newExpanded);
  };

  const isItemActive = (item: NavItem): boolean => {
    if (item.href === pathname) return true;
    if (item.children) {
      return item.children.some(child => child.href === pathname);
    }
    return false;
  };

  const isItemExpanded = (item: NavItem): boolean => {
    if (item.href === pathname) return true;
    if (item.children) {
      return item.children.some(child => child.href === pathname) || expandedItems.has(item.href);
    }
    return false;
  };

  const getCurrentPath = (): string[] => {
    const path: string[] = [];
    
    for (const item of navigationItems) {
      if (item.href === pathname) {
        path.push(item.label);
        break;
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.href === pathname) {
            path.push(item.label);
            path.push(child.label);
            break;
          }
        }
        if (path.length > 0) break;
      }
    }
    
    return path;
  };

  if (isCollapsed) {
    return (
      <VStack spacing={2} p={2}>
        {navigationItems.map((item) => (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <Box
              p={2}
              borderRadius="md"
              bg={isItemActive(item) ? 'blue.50' : 'transparent'}
              color={isItemActive(item) ? 'blue.600' : 'gray.600'}
              _hover={{ bg: 'gray.50' }}
              transition="all 0.2s"
            >
              <Icon as={item.icon} boxSize={5} />
            </Box>
          </Link>
        ))}
      </VStack>
    );
  }

  return (
    <VStack spacing={2} align="stretch" p={4} minW="250px">
      <Text fontSize="lg" fontWeight="bold" color="gray.700" mb={2}>
        Admin Panel
      </Text>
      
      <Divider />
      
      {/* Current Path Indicator */}
      {(() => {
        const currentPath = getCurrentPath();
        if (currentPath.length > 1) {
          return (
            <Box p={2} bg="blue.50" borderRadius="md" mb={2}>
              <Text fontSize="xs" color="blue.600" fontWeight="medium">
                Current: {currentPath.join(' > ')}
              </Text>
            </Box>
          );
        }
        return null;
      })()}
      
      <VStack spacing={1} align="stretch">
        {navigationItems.map((item) => (
          <NavItemComponent
            key={item.href}
            item={item}
            isActive={isItemActive(item)}
            isExpanded={isItemExpanded(item)}
            onToggle={handleToggle}
            pathname={pathname}
          />
        ))}
      </VStack>
    </VStack>
  );
}
