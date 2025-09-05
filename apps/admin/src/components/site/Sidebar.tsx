'use client';
import {
  useDisclosure,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  VStack,
  Link as ChakraLink,
  Button,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import HeaderButton from '@/components/common/HeaderButton';

function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 6h18M3 12h18M3 18h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Sidebar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathname = usePathname();
  useEffect(() => {
    onClose();
  }, [pathname]);

  return (
    <>
      <IconButton
        aria-label="Open menu"
        icon={<MenuIcon />}
        display={{ base: 'inline-flex', md: 'none' }}
        onClick={onOpen}
        variant="ghost"
      />
      <Drawer isOpen={isOpen} onClose={onClose} placement="left">
        <DrawerOverlay bg="rgba(0,0,0,0.35)" />
        <DrawerContent bg="bg.surface">
          <DrawerBody>
            <VStack align="start" spacing={4} mt={8}>
              <HeaderButton
                href="/book"
                label="Book"
                w="full"
                mb="3"
                size="sm"
              />
              <HeaderButton
                href="/track"
                label="Track"
                w="full"
                mb="3"
                size="sm"
              />
              <HeaderButton
                href="/ai-agent"
                label="AI Assistant"
                w="full"
                mb="3"
                size="sm"
              />

              <HeaderButton
                href="/driver/login"
                label="Driver Login"
                w="full"
                mb="3"
                size="sm"
              />

              {/* Mobile menu actions */}
              <HeaderButton
                href="/driver-application"
                label="Become a Driver"
                w="full"
                mb="3"
                size="sm"
              />
              <HeaderButton
                href="/book"
                label="Get a quote"
                w="full"
                mb="3"
                size="sm"
              />
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
