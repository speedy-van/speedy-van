/**
 * Unified navigation component for Speedy Van
 */

'use client';

import { Box, Flex, HStack, Link, Text, IconButton, useDisclosure, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, VStack, Button, useBreakpointValue } from '@chakra-ui/react';
import { useColorModeValue } from '@chakra-ui/react';
import { ReactNode, useRef } from 'react';
import { ROUTES, type UserRole } from '@/lib/routing';
import { FiMenu } from 'react-icons/fi';

interface NavigationItem {
  label: string;
  href: string;
  icon?: ReactNode;
}

interface UnifiedNavigationProps {
  userRole?: UserRole;
  isAuthenticated?: boolean;
  children?: ReactNode;
  role?: string;
}

export function UnifiedNavigation({
  userRole,
  isAuthenticated = false,
  children,
  role
}: UnifiedNavigationProps) {
  // If role is passed, use it as userRole for backward compatibility
  const effectiveUserRole = userRole || (role as UserRole) || 'guest';
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const getNavigationItems = (): NavigationItem[] => {
    if (!isAuthenticated) {
      return [
        { label: 'Home', href: ROUTES.HOME },
        { label: 'Services', href: ROUTES.SERVICES },
        { label: 'Pricing', href: ROUTES.PRICING },
        { label: 'Apply to Drive', href: ROUTES.DRIVER_APPLICATION },
        { label: 'Contact', href: ROUTES.CONTACT },
      ];
    }

    switch (effectiveUserRole) {
      case 'admin':
        return [
          { label: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD },
          { label: 'Orders', href: ROUTES.ADMIN_ORDERS },
          { label: 'Drivers', href: ROUTES.ADMIN_DRIVERS },
          { label: 'Driver Applications', href: ROUTES.ADMIN_DRIVER_APPLICATIONS },
          { label: 'Driver Earnings', href: ROUTES.ADMIN_DRIVER_EARNINGS },
          { label: 'Customers', href: ROUTES.ADMIN_CUSTOMERS },
          { label: 'Dispatch', href: ROUTES.ADMIN_DISPATCH },
          { label: 'Analytics', href: ROUTES.ADMIN_ANALYTICS },
          { label: 'Finance', href: ROUTES.ADMIN_FINANCE },
          { label: 'Logs', href: ROUTES.ADMIN_LOGS },
          { label: 'Content', href: ROUTES.ADMIN_CONTENT },
          { label: 'Tracking', href: ROUTES.ADMIN_TRACKING },
          { label: 'Chat', href: ROUTES.ADMIN_CHAT },
          { label: 'Settings', href: ROUTES.ADMIN_SETTINGS },
        ];
      case 'driver':
        return [
          { label: 'Dashboard', href: ROUTES.DRIVER_DASHBOARD },
          { label: 'Jobs', href: ROUTES.DRIVER_JOBS },
          { label: 'Availability', href: ROUTES.DRIVER_AVAILABILITY },
          { label: 'Earnings', href: ROUTES.DRIVER_EARNINGS },
          { label: 'Profile', href: ROUTES.DRIVER_PROFILE },
          { label: 'Settings', href: ROUTES.DRIVER_SETTINGS },
        ];
      case 'customer':
        return [
          { label: 'Dashboard', href: ROUTES.CUSTOMER_DASHBOARD },
          { label: 'Orders', href: ROUTES.CUSTOMER_ORDERS },
          { label: 'Profile', href: ROUTES.CUSTOMER_PROFILE },
          { label: 'Settings', href: ROUTES.CUSTOMER_SETTINGS },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <Box
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      px={{ base: 3, md: 4 }}
      py={2}
    >
      <Flex justify="space-between" align="center">
        <Link href={ROUTES.HOME} _hover={{ textDecoration: 'none' }}>
          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="primary.500">
            Speedy Van
          </Text>
        </Link>
        
        {/* Desktop Navigation */}
        {!isMobile && (
          <HStack spacing={6}>
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                _hover={{ textDecoration: 'none', color: 'primary.500' }}
                fontWeight="medium"
                fontSize="sm"
              >
                {item.label}
              </Link>
            ))}
          </HStack>
        )}
        
        {/* Mobile Navigation Button */}
        {isMobile && (
          <IconButton
            ref={btnRef}
            aria-label="Open menu"
            icon={<FiMenu />}
            variant="ghost"
            onClick={onOpen}
            size="sm"
          />
        )}
      </Flex>
      
      {/* Mobile Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <Text fontSize="lg" fontWeight="bold" color="primary.500">
              Speedy Van
            </Text>
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  as={Link}
                  href={item.href}
                  variant="ghost"
                  justifyContent="flex-start"
                  size="lg"
                  onClick={onClose}
                >
                  {item.label}
                </Button>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      
      {children}
    </Box>
  );
}