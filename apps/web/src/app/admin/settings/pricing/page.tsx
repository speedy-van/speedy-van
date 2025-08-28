"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Heading, 
  Divider, 
  Spinner,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Badge,
  Icon
} from "@chakra-ui/react";
import { FaPoundSign, FaChartLine, FaUsers, FaSave } from "react-icons/fa";
import Button from "@/components/common/Button";

interface PricingSettings {
  id: string;
  customerPriceAdjustment: number;
  driverRateMultiplier: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PricingSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<PricingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  // Form state
  const [customerAdjustment, setCustomerAdjustment] = useState(0);
  const [driverMultiplier, setDriverMultiplier] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // Check admin access
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user || session.user.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You must be an admin to access pricing settings",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      router.push("/admin");
      return;
    }
  }, [session, status, router, toast]);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      loadSettings();
    }
  }, [session]);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings/pricing");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setCustomerAdjustment(data.customerPriceAdjustment * 100); // Convert to percentage
        setDriverMultiplier(data.driverRateMultiplier);
        setIsActive(data.isActive);
      }
    } catch (error) {
      console.error("Failed to load pricing settings:", error);
      toast({
        title: "Error",
        description: "Failed to load pricing settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerPriceAdjustment: customerAdjustment / 100, // Convert from percentage
          driverRateMultiplier: driverMultiplier,
          isActive,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Pricing settings saved successfully",
        });
        await loadSettings(); // Reload to get updated data
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save pricing settings:", error);
      toast({
        title: "Error",
        description: "Failed to save pricing settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <Box p={6}>
        <VStack spacing={6} align="center">
          <Spinner size="xl" />
          <Text>Loading...</Text>
        </VStack>
      </Box>
    );
  }

  // Show access denied if not admin
  if (!session?.user || session.user.role !== "admin") {
    return (
      <Box p={6}>
        <VStack spacing={6} align="center">
          <Alert status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                You must be an admin to access pricing settings. Redirecting...
              </AlertDescription>
            </Box>
          </Alert>
        </VStack>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box p={6}>
        <VStack spacing={6} align="center">
          <Spinner size="xl" />
          <Text>Loading pricing settings...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>Pricing Settings</Heading>
          <Text color="text.secondary">
            Manage customer pricing adjustments and driver rate multipliers
          </Text>
        </Box>

        <Divider />

        {/* Current Settings Display */}
        {settings && (
          <Box p={4} bg="bg.surface" borderRadius="lg" border="1px solid" borderColor="border.primary">
            <VStack align="start" spacing={3}>
              <Text fontWeight="bold">Current Settings</Text>
              <HStack spacing={6}>
                <Text>Customer Price Adjustment: <Badge colorScheme={settings.customerPriceAdjustment > 0 ? "green" : settings.customerPriceAdjustment < 0 ? "red" : "gray"}>
                  {settings.customerPriceAdjustment > 0 ? "+" : ""}{Math.round(settings.customerPriceAdjustment * 100)}%
                </Badge></Text>
                <Text>Driver Rate Multiplier: <Badge colorScheme="blue">{settings.driverRateMultiplier}x</Badge></Text>
                <Text>Status: <Badge colorScheme={settings.isActive ? "green" : "red"}>{settings.isActive ? "Active" : "Inactive"}</Badge></Text>
              </HStack>
              <Text fontSize="sm" color="text.tertiary">
                Last updated: {new Date(settings.updatedAt).toLocaleString()}
              </Text>
            </VStack>
          </Box>
        )}

        {/* Settings Form */}
        <Box p={6} bg="bg.surface" borderRadius="lg" border="1px solid" borderColor="border.primary">
          <VStack spacing={6} align="stretch">
            <Heading size="md">Adjust Pricing</Heading>
            
            {/* Customer Price Adjustment */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="medium">Customer Price Adjustment</Text>
                <Badge colorScheme={customerAdjustment > 0 ? "green" : customerAdjustment < 0 ? "red" : "gray"}>
                  {customerAdjustment > 0 ? "+" : ""}{customerAdjustment}%
                </Badge>
              </HStack>
              <Text fontSize="sm" color="text.secondary" mb={3}>
                Adjust customer pricing by percentage (-100% to +100%)
              </Text>
              <Slider
                value={customerAdjustment}
                onChange={setCustomerAdjustment}
                min={-100}
                max={100}
                step={1}
                colorScheme={customerAdjustment > 0 ? "green" : customerAdjustment < 0 ? "red" : "gray"}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>

            {/* Driver Rate Multiplier */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="medium">Driver Rate Multiplier</Text>
                <Badge colorScheme="blue">{driverMultiplier}x</Badge>
              </HStack>
              <Text fontSize="sm" color="text.secondary" mb={3}>
                Multiply driver earnings (0.5x to 2.0x)
              </Text>
              <Slider
                value={driverMultiplier}
                onChange={setDriverMultiplier}
                min={0.5}
                max={2.0}
                step={0.1}
                colorScheme="blue"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>

            {/* Active Status */}
            <Box>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">Active Status</Text>
                  <Text fontSize="sm" color="text.secondary">
                    Enable or disable these pricing settings
                  </Text>
                </VStack>
                <Switch
                  isChecked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  colorScheme="green"
                  size="lg"
                />
              </HStack>
            </Box>

            {/* Save Button */}
            <Button
              onClick={saveSettings}
              isLoading={saving}
              loadingText="Saving..."
              leftIcon={<FaSave />}
              colorScheme="blue"
              size="lg"
            >
              Save Pricing Settings
            </Button>
          </VStack>
        </Box>

        {/* Information */}
        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>Pricing Impact</AlertTitle>
            <AlertDescription>
              Changes to pricing settings will affect all new bookings. Customer prices and driver earnings will be adjusted according to these settings.
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    </Box>
  );
}
