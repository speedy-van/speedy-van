'use client';

import { Box, Heading, Text, Stack, Button } from "@chakra-ui/react";
import NextLink from "next/link";
import { useSession } from "next-auth/react";
import HeaderButton from "./common/HeaderButton";

export default function RoleAwareHero() {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <Box as="section" py={16} textAlign="center">
      <Heading as="h1" size="2xl" color="text.primary">Move fast. Track live.</Heading>
      <Text mt={3} color="text.secondary">
        Book a professional van in minutes with real-time tracking.
      </Text>
      <Stack direction={{ base: "column", sm: "row" }} justify="center" mt={6} spacing={4}>
        {session?.user ? (
          // Role-aware CTAs for signed-in users
          <>
            {user?.role === 'driver' && (
              <>
                <HeaderButton href="/driver/dashboard" label="🚗 Driver Dashboard" size="lg" />
                <HeaderButton href="/driver/jobs" label="📦 View Jobs" size="lg" />
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <HeaderButton href="/admin" label="🛠️ Admin Dashboard" size="lg" />
                <HeaderButton href="/admin/orders" label="📋 Manage Orders" size="lg" />
              </>
            )}
            {user?.role === 'customer' && (
              <>
                <HeaderButton href="/customer-portal" label="📋 My Orders" size="lg" />
                <HeaderButton href="/book" label="🚚 Book Another" size="lg" />
              </>
            )}
          </>
        ) : (
          // Default CTAs for signed-out users
          <>
            <HeaderButton href="/book" label="Get a quote" size="lg" />
            <HeaderButton href="/track" label="Track a move" size="lg" />
          </>
        )}
      </Stack>
    </Box>
  );
}
