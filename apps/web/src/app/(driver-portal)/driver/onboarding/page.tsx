"use client";

import React, { useState } from "react";
import { Box, Container, VStack, Heading, Text, Button, Progress, Card, CardBody, useToast } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import OnboardingWizard from "@/components/Driver/OnboardingWizard";

export default function DriverOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const steps = [
    { title: "Personal Information", description: "Basic details about you" },
    { title: "Vehicle Details", description: "Information about your vehicle" },
    { title: "Documents", description: "Upload required documents" },
    { title: "Review", description: "Review and submit your application" }
  ];

  const handleComplete = async (formData: any) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/driver/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit onboarding");
      }

      toast({
        title: "Onboarding Complete",
        description: "Your application has been submitted for review.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      router.push("/driver");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit onboarding. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      <Box textAlign="center">
        <Heading size="lg" mb={2}>Driver Onboarding</Heading>
        <Text color="gray.600">Complete your profile to start accepting jobs</Text>
      </Box>

      <Card>
        <CardBody>
          <VStack spacing={6}>
            <Progress 
              value={(currentStep / (steps.length - 1)) * 100} 
              w="full" 
              colorScheme="blue" 
              size="lg" 
            />
            
            <Box textAlign="center">
              <Text fontWeight="bold" fontSize="lg">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </Text>
              <Text color="gray.600">{steps[currentStep].description}</Text>
            </Box>

            <OnboardingWizard
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              onComplete={handleComplete}
              isLoading={isLoading}
            />
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
