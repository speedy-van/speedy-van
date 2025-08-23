import React from "react";
import { Box, Container, Flex, HStack, Spacer, Avatar, Text, Link as ChakraLink, IconButton, VStack, useDisclosure, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, Button } from "@chakra-ui/react";
import NextLink from "next/link";
import { requireDriverWithData } from "@/lib/auth";
import { redirect } from "next/navigation";
import dynamic from 'next/dynamic';
const DriverHeader = dynamic(() => import('@/components/Driver/DriverHeader'), { ssr: false });
import DriverSignOutButton from "@/components/Driver/DriverSignOutButton";

export default async function DriverPortalLayout({ children }: { children: React.ReactNode }) {
  const driverData = await requireDriverWithData();
  if (!driverData) redirect("/driver/login");

  const { session, driver } = driverData;

  return (
    <>
      <DriverHeader driverId={driver?.id} sessionUserName={session.user?.name ?? null} sessionUserEmail={session.user?.email ?? null} />
      <Container as="main" maxW="1200px" py={6}>
        {children}
      </Container>
    </>
  );
}
