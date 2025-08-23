"use client";

import React from "react";
import { Button, useToast } from "@chakra-ui/react";
import { signOut } from "next-auth/react";
import { FiLogOut } from "react-icons/fi";

export default function DriverSignOutButton() {
  const toast = useToast();

  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: "/",
        redirect: true 
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error signing out",
        description: "Please try again",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Button
      leftIcon={<FiLogOut />}
      variant="outline"
      size="sm"
      colorScheme="red"
      onClick={handleSignOut}
      data-testid="driver-sign-out-button"
    >
      Sign Out
    </Button>
  );
}
