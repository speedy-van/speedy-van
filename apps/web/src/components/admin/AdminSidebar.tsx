'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  IconButton,
  Collapse,
  useColorModeValue,
  Tooltip,
  Divider,
  Badge,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome,
  FiPackage,
  FiTruck,
  FiUsers,
  FiDollarSign,
  FiBarChart,
  FiSettings,
  FiFileText,
  FiActivity,
  FiChevronLeft,
  FiChevronRight,
  FiMap,
  FiUserCheck,
  FiCreditCard,
  FiGift,
  FiNavigation,
  FiShield,
} from 'react-icons/fi';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ElementType;
  shortcut?: string;
  badge?: string;
  children?: Omit<SidebarItem, 'children'>[];
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: FiHome,
    shortcut: 'G H',
  },
  {
    label: 'Operations',
    href: '/admin/orders',
    icon: FiPackage,
    shortcut: 'G O',
    children: [
      { label: 'Orders', href: '/admin/orders', icon: FiPackage },
      { label: 'Dispatch', href: '/admin/dispatch', icon: FiNavigation },
      { label: 'Live Map', href: '/admin/dispatch/map', icon: FiMap },
    ],
  },
  {
    label: 'People',
    href: '/admin/drivers',
    icon: FiUsers,
    shortcut: 'G P',
    children: [
      { label: 'Drivers', href: '/admin/drivers', icon: FiTruck },
      { label: 'Applications', href: '/admin/drivers/applications', icon: FiUserCheck, badge: 'New' },
      { label: 'Customers', href: '/admin/customers', icon: FiUsers },
      { label: 'Admin Users', href: '/admin/users', icon: FiShield },
    ],
  },
  {
    label: 'Finance',
    href: '/admin/finance',
    icon: FiDollarSign,
    shortcut: 'G F',
    children: [
      { label: 'Overview', href: '/admin/finance', icon: FiDollarSign },
      { label: 'Invoices', href: '/admin/finance/invoices', icon: FiFileText },
      { label: 'Refunds', href: '/admin/finance/refunds', icon: FiCreditCard },
      { label: 'Payouts', href: '/admin/finance/payouts', icon: FiDollarSign },
    ],
  },
  {
    label: 'Content',
    href: '/admin/content',
    icon: FiSettings,
    shortcut: 'G C',
    children: [
      { label: 'Overview', href: '/admin/content', icon: FiSettings },
      
      { label: 'Service Areas', href: '/admin/content/areas', icon: FiMap },
      { label: 'Promotions', href: '/admin/content/promos', icon: FiGift },
    ],
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: FiBarChart,
    shortcut: 'G A',
  },
  {
    label: 'Logs',
    href: '/admin/logs',
    icon: FiFileText,
    shortcut: 'G L',
  },
  {
    label: 'Health',
    href: '/admin/health',
    icon: FiActivity,
    shortcut: 'G H',
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: FiSettings,
    shortcut: 'G S',
    children: [
      { label: 'Team', href: '/admin/settings/team', icon: FiUsers },
      { label: 'Integrations', href: '/admin/settings/integrations', icon: FiSettings },
      { label: 'Security', href: '/admin/settings/security', icon: FiActivity },
      { label: 'Legal', href: '/admin/settings/legal', icon: FiFileText },
    ],
  },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ isCollapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Auto-expand items based on current path
  useEffect(() => {
    const newExpanded = new Set<string>();
    sidebarItems.forEach(item => {
      if (item.children) {
        const isActive = item.children.some(child => pathname.startsWith(child.href));
        if (isActive) {
          newExpanded.add(item.label);
        }
      }
    });
    setExpandedItems(newExpanded);
  }, [pathname]);

  const toggleExpanded = (label: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const renderItem = (item: SidebarItem, isChild = false) => {
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.label);

    return (
      <Box key={item.href}>
        <Tooltip
          label={isCollapsed ? `${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}` : ''}
          placement="right"
          isDisabled={!isCollapsed}
        >
          <Box>
            <NextLink href={item.href}>
              <HStack
                spacing={3}
                px={3}
                py={2}
                borderRadius="md"
                bg={active ? 'brand.500' : 'transparent'}
                color={active ? 'white' : 'inherit'}
                _hover={{
                  bg: active ? 'brand.600' : hoverBg,
                }}
                transition="all 0.2s"
                cursor="pointer"
                position="relative"
                onClick={hasChildren ? (e) => {
                  e.preventDefault();
                  toggleExpanded(item.label);
                } : undefined}
              >
                <Icon as={item.icon} boxSize={4} />
                {!isCollapsed && (
                  <>
                    <Text fontSize="sm" fontWeight={active ? 'semibold' : 'medium'} flex={1}>
                      {item.label}
                    </Text>
                    {item.badge && (
                      <Badge size="sm" colorScheme="red" variant="solid">
                        {item.badge}
                      </Badge>
                    )}
                    {item.shortcut && (
                      <Text fontSize="xs" opacity={0.6}>
                        {item.shortcut}
                      </Text>
                    )}
                  </>
                )}
              </HStack>
            </NextLink>
          </Box>
        </Tooltip>

        {hasChildren && !isCollapsed && (
          <Collapse in={isExpanded}>
            <VStack spacing={0} pl={6} mt={1}>
              {item.children!.map(child => renderItem(child, true))}
            </VStack>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box
      bg={bgColor}
      borderRight="1px solid"
      borderColor={borderColor}
      h="100vh"
      position="sticky"
      top={0}
      left={0}
      zIndex={20}
      transition="width 0.2s"
      width={isCollapsed ? '60px' : '280px'}
      overflow="hidden"
    >
      <VStack spacing={0} h="full">
        {/* Header */}
        <HStack
          px={3}
          py={4}
          borderBottom="1px solid"
          borderColor={borderColor}
          w="full"
          justify="space-between"
        >
          {!isCollapsed && (
            <Text fontSize="lg" fontWeight="bold" color="brand.500">
              Admin
            </Text>
          )}
          <IconButton
            size="sm"
            variant="ghost"
            icon={<Icon as={isCollapsed ? FiChevronRight : FiChevronLeft} />}
            onClick={onToggle}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          />
        </HStack>

        {/* Navigation */}
        <VStack spacing={1} flex={1} w="full" p={2} overflowY="auto">
          {sidebarItems.map(item => renderItem(item))}
        </VStack>

        {/* Footer */}
        {!isCollapsed && (
          <Box p={3} borderTop="1px solid" borderColor={borderColor} w="full">
            <Text fontSize="xs" color="gray.500" textAlign="center">
              Press ? for help
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
