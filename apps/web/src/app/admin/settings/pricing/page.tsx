"use client";

import { useState, useEffect } from "react";
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
  const [settings, setSettings] = useState<PricingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  // Form state
  const [customerAdjustment, setCustomerAdjustment] = useState(0);
  const [driverMultiplier, setDriverMultiplier] = useState(1);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

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

  const getCustomerAdjustmentLabel = (value: number) => {
    if (value === 0) return "No adjustment";
    if (value > 0) return `+${value}% increase`;
    return `${Math.abs(value)}% decrease`;
  };

  const getDriverMultiplierLabel = (value: number) => {
    if (value === 1) return "Standard rate";
    if (value > 1) return `${value}x multiplier`;
    return `${value}x multiplier`;
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minH="400px">
        <Spinner size="xl" color="neon.500" />
      </Box>
    );
  }

  return (
    <Box p={6} maxW="4xl" mx="auto">
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Pricing Settings</Heading>
          <Text color="gray.600">
            Adjust customer pricing and driver earnings rates dynamically.
          </Text>
        </Box>

        <VStack spacing={6} align="stretch">
          {/* Customer Pricing Adjustment */}
          <Box p={6} bg="white" borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
            <VStack spacing={4} align="stretch">
                             <HStack>
                 <Icon as={FaChartLine} color="neon.500" />
                 <Heading size="md">Customer Pricing Adjustment</Heading>
               </HStack>
              <Text color="gray.600">
                Increase or decrease all customer prices by a percentage. This affects the final quote calculation.
              </Text>
              
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="medium">Price Adjustment</Text>
                  <Badge 
                    colorScheme={customerAdjustment === 0 ? "gray" : customerAdjustment > 0 ? "green" : "red"}
                    variant="subtle"
                  >
                    {getCustomerAdjustmentLabel(customerAdjustment)}
                  </Badge>
                </HStack>
                
                <Slider
                  value={customerAdjustment}
                  onChange={setCustomerAdjustment}
                  min={-100}
                  max={100}
                  step={1}
                >
                  <SliderTrack>
                    <SliderFilledTrack bg="neon.500" />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                
                <HStack justify="space-between" fontSize="sm" color="gray.500">
                  <Text>-100% (Free)</Text>
                  <Text>0% (Standard)</Text>
                  <Text>+100% (Double)</Text>
                </HStack>
              </VStack>

              <Divider />

              <Box>
                <Text fontWeight="medium" mb={2}>Example Impact</Text>
                <VStack spacing={1} align="stretch" fontSize="sm" color="gray.600">
                  <Text>• A £100 booking with +20% adjustment = £120</Text>
                  <Text>• A £100 booking with -10% adjustment = £90</Text>
                  <Text>• Minimum and maximum price limits still apply</Text>
                </VStack>
              </Box>
            </VStack>
          </Box>

          {/* Driver Rate Multiplier */}
          <Box p={6} bg="white" borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
            <VStack spacing={4} align="stretch">
              <HStack>
                <Icon as={FaUsers} color="neon.500" />
                <Heading size="md">Driver Earnings Multiplier</Heading>
              </HStack>
              <Text color="gray.600">
                Adjust driver earnings by a multiplier. This affects the base rate calculation for all drivers.
              </Text>
              
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="medium">Rate Multiplier</Text>
                  <Badge 
                    colorScheme={driverMultiplier === 1 ? "gray" : driverMultiplier > 1 ? "green" : "red"}
                    variant="subtle"
                  >
                    {getDriverMultiplierLabel(driverMultiplier)}
                  </Badge>
                </HStack>
                
                <Slider
                  value={driverMultiplier}
                  onChange={setDriverMultiplier}
                  min={0.5}
                  max={2}
                  step={0.05}
                >
                  <SliderTrack>
                    <SliderFilledTrack bg="neon.500" />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                
                <HStack justify="space-between" fontSize="sm" color="gray.500">
                  <Text>0.5x (Half)</Text>
                  <Text>1x (Standard)</Text>
                  <Text>2x (Double)</Text>
                </HStack>
              </VStack>

              <Divider />

              <Box>
                <Text fontWeight="medium" mb={2}>Example Impact</Text>
                <VStack spacing={1} align="stretch" fontSize="sm" color="gray.600">
                  <Text>• Standard £2.50/mile with 1.2x multiplier = £3.00/mile</Text>
                  <Text>• Standard £25/hour with 0.8x multiplier = £20/hour</Text>
                  <Text>• Platform fees are calculated after the multiplier</Text>
                </VStack>
              </Box>
            </VStack>
          </Box>

          {/* Settings Status */}
          <Box p={6} bg="white" borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
            <VStack spacing={4} align="stretch">
              <Heading size="md">Settings Status</Heading>
              <Text color="gray.600">
                Control whether these pricing adjustments are active.
              </Text>
              
              <HStack>
                <Switch
                  isChecked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  colorScheme="neon"
                />
                <Text fontWeight="medium">
                  {isActive ? "Settings are active" : "Settings are inactive"}
                </Text>
              </HStack>
              
              {!isActive && (
                <Text fontSize="sm" color="gray.500">
                  When inactive, standard pricing rates will be used for all calculations.
                </Text>
              )}
            </VStack>
          </Box>

          {/* Save Button */}
          <HStack justify="flex-end">
            <Button 
              onClick={saveSettings} 
              disabled={saving}
                             leftIcon={<FaSave />}
              variant="primary"
              size="lg"
            >
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
}
