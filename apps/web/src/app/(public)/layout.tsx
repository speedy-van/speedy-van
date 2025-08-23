import React from "react";
import { Box } from "@chakra-ui/react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import SkipLink from "@/components/site/SkipLink";
import CookieBar from "@/components/Layout/CookieBar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipLink />
      <Box
        minH="100dvh"
        display="flex"
        flexDirection="column"
        w="100%"
      >
        <Box
          as="header"
          position="sticky"
          top="0"
          zIndex="sticky"
          bg="rgba(11,18,32,0.92)"
          backdropFilter="saturate(140%) blur(8px)"
          borderBottom="1px solid"
          borderColor="whiteAlpha.200"
          h="64px"
          className="safe-area-top"
          flexShrink={0}
        >
          <Header />
        </Box>
        
        <Box
          as="main"
          flex="1"
          pb="env(safe-area-inset-bottom)"
          className="safe-area-bottom"
        >
          {children}
        </Box>
        
        <Box
          as="footer"
          flexShrink={0}
          mt="6"
          pt="6"
          pb="6"
          className="safe-area-bottom"
        >
          <Footer />
        </Box>
      </Box>
      
      {/* Cookie bar component rendered AFTER footer, sticky bottom */}
      <CookieBar />
    </>
  );
}


