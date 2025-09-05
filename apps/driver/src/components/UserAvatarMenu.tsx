'use client';

import {
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';

export default function UserAvatarMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();

  if (!session?.user) {
    return null;
  }

  const user = session.user as any;
  const { name, email, role } = user;

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/');
    } catch (error) {
      toast({
        title: 'Sign out failed',
        description: 'An error occurred while signing out.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleSpecificMenuItems = () => {
    switch (role) {
      case 'customer':
        return (
          <>
            <MenuItem
              as={NextLink}
              href="/customer-portal"
              fontWeight="semibold"
              color="teal.600"
            >
              📋 My Orders
            </MenuItem>
            <MenuItem as={NextLink} href="/customer-portal/history">
              📚 Order History
            </MenuItem>
            <MenuItem as={NextLink} href="/customer-portal/settings">
              ⚙️ Settings
            </MenuItem>
            <MenuItem as={NextLink} href="/customer-portal/support">
              💬 Support
            </MenuItem>
          </>
        );
      case 'driver':
        return (
          <>
            <MenuItem
              as={NextLink}
              href="/driver/dashboard"
              fontWeight="semibold"
              color="teal.600"
            >
              🚗 Driver Dashboard
            </MenuItem>
            <MenuItem as={NextLink} href="/driver/jobs">
              📦 Available Jobs
            </MenuItem>
            <MenuItem as={NextLink} href="/driver/earnings">
              💰 Earnings
            </MenuItem>
            <MenuItem as={NextLink} href="/driver/schedule">
              📅 Schedule
            </MenuItem>
            <MenuItem as={NextLink} href="/driver/performance">
              📊 Performance
            </MenuItem>
            <MenuItem as={NextLink} href="/driver/payouts">
              💳 Payouts
            </MenuItem>
          </>
        );
      case 'admin':
        return (
          <>
            <MenuItem
              as={NextLink}
              href="/admin"
              fontWeight="semibold"
              color="teal.600"
            >
              🛠️ Admin Dashboard
            </MenuItem>
            <MenuItem as={NextLink} href="/admin/orders">
              📋 Orders
            </MenuItem>
            <MenuItem as={NextLink} href="/admin/drivers">
              👥 Drivers
            </MenuItem>
            <MenuItem as={NextLink} href="/admin/analytics">
              📈 Analytics
            </MenuItem>
            <MenuItem as={NextLink} href="/admin/payouts">
              💳 Payouts
            </MenuItem>
            <MenuItem as={NextLink} href="/admin/settings">
              ⚙️ Settings
            </MenuItem>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Menu>
      <MenuButton
        display="flex"
        alignItems="center"
        gap={2}
        px={3}
        py={2}
        borderRadius="md"
        _hover={{ bg: 'gray.100' }}
        _active={{ bg: 'gray.200' }}
        transition="all 0.2s"
      >
        <Avatar
          size="sm"
          name={name || email}
          src={user.image || undefined}
          bg="teal.500"
          color="white"
        >
          {getInitials(name || email)}
        </Avatar>
        <HStack spacing={1} display={{ base: 'none', md: 'flex' }}>
          <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
            {name || email}
          </Text>
          <ChevronDownIcon />
        </HStack>
      </MenuButton>
      <MenuList>
        <MenuItem as={NextLink} href="/portal">
          My Account
        </MenuItem>
        {getRoleSpecificMenuItems()}
        <MenuDivider />
        <MenuItem as={NextLink} href="/book" color="teal.600">
          🚚 Book a Van
        </MenuItem>
        <MenuItem as={NextLink} href="/track" color="teal.600">
          📍 Track Orders
        </MenuItem>
        <MenuDivider />
        <MenuItem onClick={handleSignOut} color="red.500">
          Sign out
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
