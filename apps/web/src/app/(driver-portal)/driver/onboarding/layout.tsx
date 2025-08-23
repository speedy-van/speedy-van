import React from "react";
import { Container } from "@chakra-ui/react";
import { requireDriver } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await requireDriver();
  if (!session) redirect("/driver/login");

  return (
    <Container maxW="4xl" py={8}>
      {children}
    </Container>
  );
}
