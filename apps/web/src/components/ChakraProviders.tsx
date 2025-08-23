'use client';
import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import theme from "@/theme";
import React from "react";
import { AccessibilityProvider } from "./AccessibilityProvider";

export default function ChakraProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChakraProvider 
        theme={theme} 
        toastOptions={{ 
          defaultOptions: { 
            position: 'top',
            duration: 5000,
            isClosable: true,
            variant: 'solid',
            containerStyle: {
              zIndex: 9999,
            }
          } 
        }}
      >
        <AccessibilityProvider>
          {children}
        </AccessibilityProvider>
      </ChakraProvider>
    </SessionProvider>
  );
}


