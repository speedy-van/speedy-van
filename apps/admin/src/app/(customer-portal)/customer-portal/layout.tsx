import React from 'react';
import {
  Box,
  Container,
  Flex,
  HStack,
  Spacer,
  Avatar,
  Text,
  Link as ChakraLink,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  useDisclosure,
  Button,
  Divider,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { requireRole } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { signOut } from 'next-auth/react';
import SkipLink from '@/components/site/SkipLink';
import CustomerChatWidget from '@/components/Chat/CustomerChatWidget';

// Mobile Navigation Component
function MobileNav({ session }: { session: any }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const navItems = [
    { href: '/customer-portal', label: 'Dashboard' },
    { href: '/customer-portal/orders', label: 'My Orders' },
    { href: '/customer-portal/track', label: 'Track' },
    { href: '/customer-portal/invoices', label: 'Invoices & Payments' },
    { href: '/customer-portal/addresses', label: 'Addresses & Contacts' },
    { href: '/customer-portal/settings', label: 'Settings' },
    { href: '/customer-portal/support', label: 'Support' },
  ];

  return (
    <>
      <IconButton
        aria-label="Open navigation menu"
        icon={<span>☰</span>}
        variant="ghost"
        size="sm"
        display={{ base: 'inline-flex', lg: 'none' }}
        onClick={onOpen}
      />

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Text fontWeight="bold">Speedy Van</Text>
            <Text fontSize="sm" color="text.muted" mt={1}>
              {session.user?.name}
            </Text>
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch" mt={4}>
              {navItems.map(item => (
                <Button
                  key={item.href}
                  as={NextLink}
                  href={item.href}
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={onClose}
                  aria-label={`Navigate to ${item.label}`}
                >
                  {item.label}
                </Button>
              ))}

              <Divider my={4} />

              <Button
                onClick={() => {
                  onClose();
                  signOut({ callbackUrl: '/' });
                }}
                variant="ghost"
                color="danger"
                justifyContent="flex-start"
              >
                Sign out
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default async function CustomerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole('customer');
  if (!session) {
    // Redirect to home page with auth modal trigger and returnTo parameter
    const returnTo = '/customer-portal';
    redirect(`/?returnTo=${encodeURIComponent(returnTo)}&showAuth=true`);
  }

  return (
    <>
      <SkipLink />
      <Box
        as="header"
        borderBottom="1px solid"
        borderColor="border.header"
        bg="bg.header"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container maxW="1200px" py={2}>
          <Flex align="center" gap={4}>
            <HStack spacing={6}>
              <ChakraLink
                as={NextLink}
                href="/customer-portal"
                fontWeight="bold"
                fontSize="lg"
              >
                Speedy Van
              </ChakraLink>

              {/* Desktop Navigation */}
              <HStack
                spacing={6}
                as="nav"
                aria-label="Main navigation"
                display={{ base: 'none', lg: 'flex' }}
              >
                <ChakraLink as={NextLink} href="/customer-portal" variant="nav">
                  Dashboard
                </ChakraLink>
                <ChakraLink
                  as={NextLink}
                  href="/customer-portal/orders"
                  variant="nav"
                >
                  My Orders
                </ChakraLink>
                <ChakraLink
                  as={NextLink}
                  href="/customer-portal/track"
                  variant="nav"
                >
                  Track
                </ChakraLink>
                <ChakraLink
                  as={NextLink}
                  href="/customer-portal/invoices"
                  variant="nav"
                >
                  Invoices & Payments
                </ChakraLink>
                <ChakraLink
                  as={NextLink}
                  href="/customer-portal/addresses"
                  variant="nav"
                >
                  Addresses & Contacts
                </ChakraLink>
                <ChakraLink
                  as={NextLink}
                  href="/customer-portal/settings"
                  variant="nav"
                >
                  Settings
                </ChakraLink>
                <ChakraLink
                  as={NextLink}
                  href="/customer-portal/support"
                  variant="nav"
                >
                  Support
                </ChakraLink>
              </HStack>
            </HStack>

            <Spacer />

            {/* Mobile Navigation */}
            <MobileNav session={session} />

            {/* Desktop User Menu */}
            <HStack spacing={4} display={{ base: 'none', lg: 'flex' }}>
              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label="User menu"
                  icon={
                    <Avatar
                      size="sm"
                      name={session.user?.name ?? 'Customer'}
                      src={undefined}
                    />
                  }
                  variant="ghost"
                  size="sm"
                />
                <MenuList>
                  <Box px={3} py={2}>
                    <Text fontWeight="medium">
                      {session.user?.name ?? 'Customer'}
                    </Text>
                    <Text fontSize="sm" color="text.muted">
                      {session.user?.email}
                    </Text>
                  </Box>
                  <MenuDivider />
                  <MenuItem as={NextLink} href="/customer-portal/settings">
                    Settings
                  </MenuItem>
                  <MenuItem as={NextLink} href="/customer-portal/support">
                    Help & Support
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    color="danger"
                  >
                    Sign out
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
        </Container>
      </Box>
      <Container as="main" id="main" maxW="1200px" py={6}>
        {children}
      </Container>

      {/* Customer Chat Widget */}
      <CustomerChatWidget
        customerId={session.user?.id}
        customerName={session.user?.name}
        customerEmail={session.user?.email}
      />
    </>
  );
}
