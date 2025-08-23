import React from "react";
import { Container } from "@chakra-ui/react";
import dynamic from 'next/dynamic';

const DriverHeader = dynamic(() => import('@/components/Driver/DriverHeader'), { ssr: false });
const DriverAuthGuard = dynamic(() => import('@/components/Driver/DriverAuthGuard'), { ssr: false });

export default function DriverPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <DriverAuthGuard>
      <DriverHeader driverId={null} sessionUserName={null} sessionUserEmail={null} />
      <Container as="main" maxW="1200px" py={6}>
        {children}
      </Container>
    </DriverAuthGuard>
  );
}
