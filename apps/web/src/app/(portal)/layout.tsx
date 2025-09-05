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
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { requireRole } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole('customer');
  if (!session) {
    // Redirect to home page with auth modal trigger and returnTo parameter
    const returnTo = '/portal';
    redirect(`/?returnTo=${encodeURIComponent(returnTo)}&showAuth=true`);
  }

  return (
    <>
      <Box
        as="header"
        borderBottom="1px solid"
        borderColor="gray.100"
        bg="white"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container maxW="1200px" py={2}>
          <Flex align="center" gap={4}>
            <HStack spacing={6}>
              <ChakraLink
                as={NextLink}
                href="/portal"
                fontWeight="bold"
                fontSize="lg"
              >
                Speedy Van
              </ChakraLink>

              {/* Main Navigation */}
              <HStack spacing={6}>
                <ChakraLink as={NextLink} href="/portal" variant="nav">
                  Dashboard
                </ChakraLink>
                <ChakraLink as={NextLink} href="/portal/orders" variant="nav">
                  My Orders
                </ChakraLink>
                <ChakraLink as={NextLink} href="/portal/track" variant="nav">
                  Track
                </ChakraLink>
                <ChakraLink as={NextLink} href="/portal/invoices" variant="nav">
                  Invoices & Payments
                </ChakraLink>
                <ChakraLink
                  as={NextLink}
                  href="/portal/addresses"
                  variant="nav"
                >
                  Addresses & Contacts
                </ChakraLink>
                <ChakraLink as={NextLink} href="/portal/settings" variant="nav">
                  Settings
                </ChakraLink>
                <ChakraLink as={NextLink} href="/portal/support" variant="nav">
                  Support
                </ChakraLink>
              </HStack>
            </HStack>

            <Spacer />

            {/* User Menu */}
            <HStack spacing={4}>
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
                    <Text fontSize="sm" color="gray.600">
                      {session.user?.email}
                    </Text>
                  </Box>
                  <MenuDivider />
                  <MenuItem as={NextLink} href="/portal/settings">
                    Settings
                  </MenuItem>
                  <MenuItem as={NextLink} href="/portal/support">
                    Help & Support
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    color="red.600"
                  >
                    Sign out
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
        </Container>
      </Box>
      <Container as="main" maxW="1200px" py={6}>
        {children}
      </Container>
    </>
  );
}
