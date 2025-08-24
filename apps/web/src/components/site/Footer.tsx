"use client";
import { Box, Container, HStack, Heading, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useConsent } from "@/components/Consent/ConsentProvider";
import React, { useState, useEffect } from "react";

export default function Footer() {
  const { openPreferences } = useConsent();
  const [currentYear, setCurrentYear] = useState('2024');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    setCurrentYear(new Date().getFullYear().toString());
  }, []);
  
  return (
    <Box
      as="footer"
      bg="gray.900"
      color="gray.300"
      borderTop="1px solid"
      borderColor="whiteAlpha.200"
    >
      <Container maxW="container.lg">
        <HStack align="start" spacing={{ base: 8, md: 16 }} wrap="wrap">
          <Box flex="1" minW="220px">
            <Heading size="sm" color="white" mb="3">Speedy Van</Heading>
            <Box fontSize="sm" lineHeight="tall">
              140 Charles Street, Glasgow City, G21 2QB<br/>
              +44 7901846297<br/>
              support@speedy-van.com
            </Box>
          </Box>

          <Box>
            <Heading size="sm" color="white" mb="3">Links</Heading>
            <Box as="ul" listStyleType="none" m="0" p="0" fontSize="sm">
              <Box as="li" mb="2"><NextLink href="/book">Book</NextLink></Box>
              <Box as="li" mb="2"><NextLink href="/track">Track</NextLink></Box>
              
              <Box as="li" mb="2"><NextLink href="/legal/privacy">Privacy</NextLink></Box>
              <Box as="li" mb="2"><NextLink href="/legal/cookies">Cookies</NextLink></Box>
              <Box as="li" mb="2">
                <button onClick={openPreferences} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit' }}>
                  Cookie settings
                </button>
              </Box>
            </Box>
          </Box>
        </HStack>

        <Box mt="8" pt="6" borderTop="1px solid" borderColor="whiteAlpha.200" fontSize="xs" color="gray.400">
          © {mounted ? currentYear : '2024'} Speedy Van. All rights reserved.
        </Box>
      </Container>
    </Box>
  );
}


