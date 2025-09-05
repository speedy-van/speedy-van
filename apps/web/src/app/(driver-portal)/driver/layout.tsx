import React from 'react';
import { Container, Box } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

const DriverHeader = dynamic(() => import('@/components/Driver/DriverHeader'), {
  ssr: false,
});
const DriverAuthGuard = dynamic(
  () => import('@/components/Driver/DriverAuthGuard'),
  { ssr: false }
);

export default function DriverPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DriverAuthGuard>
      <Box minH="100vh" bg="bg.canvas" position="relative" overflow="hidden">
        {/* Background Pattern */}
        <Box
          opacity={0.02}
          background="radial-gradient(circle at 20% 80%, rgba(0,194,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,209,143,0.1) 0%, transparent 50%)"
          pointerEvents="none"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        <DriverHeader
          driverId={null}
          sessionUserName={null}
          sessionUserEmail={null}
        />
        <Container
          as="main"
          maxW="7xl"
          py={{ base: 6, md: 8 }}
          px={{ base: 4, md: 6 }}
          position="relative"
          zIndex={1}
        >
          {children}
        </Container>
      </Box>
    </DriverAuthGuard>
  );
}
