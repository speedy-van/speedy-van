'use client';
import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  HStack,
  Checkbox,
  Textarea,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "@chakra-ui/react";
import AddressAutocomplete from "./AddressAutocomplete";

interface Address {
  label: string;
  line1: string;
  city: string;
  postcode: string;
  notes?: string;
  lift?: boolean;
  coords?: { lat: number; lng: number };
}

interface AddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pickup: Address, dropoff: Address) => void;
}

export default function AddressForm({ isOpen, onClose, onSave }: AddressFormProps) {
  const [pickup, setPickup] = useState<Address>({
    label: "",
    line1: "",
    city: "",
    postcode: "",
  });
  const [dropoff, setDropoff] = useState<Address>({
    label: "",
    line1: "",
    city: "",
    postcode: "",
  });
  const [pickupSearch, setPickupSearch] = useState("");
  const [dropoffSearch, setDropoffSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const useCurrentLocation = async (type: "pickup" | "dropoff") => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", status: "error" });
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `/api/places/reverse?lat=${latitude}&lng=${longitude}`
          );
          const data = await res.json();
          const label = data.label ?? `${latitude}, ${longitude}`;
          const addr: Address = {
            label,
            line1: data.address?.line1 ?? label,
            city: data.address?.city ?? "",
            postcode: data.address?.postcode ?? "",
            coords: { lat: latitude, lng: longitude },
          };
          if (type === "pickup") {
            setPickup(addr);
            setPickupSearch(label);
          } else {
            setDropoff(addr);
            setDropoffSearch(label);
          }
          toast({ title: "Location set successfully", status: "success" });
        } catch {
          toast({ title: "Failed to fetch address", status: "error" });
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        toast({ title: "Location access denied", status: "error" });
        setIsLoading(false);
      }
    );
  };

  const handleSubmit = () => {
    if (!pickup.line1 || !dropoff.line1) {
      toast({ title: "Both pickup and dropoff are required", status: "warning" });
      return;
    }
    onSave(pickup, dropoff);
    toast({ title: "Addresses saved", status: "success" });
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setPickup({ label: "", line1: "", city: "", postcode: "" });
    setDropoff({ label: "", line1: "", city: "", postcode: "" });
    setPickupSearch("");
    setDropoffSearch("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Enter Pickup & Dropoff Addresses</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Pickup Section */}
            <Box p={4} border="1px" borderColor="gray.200" borderRadius="lg">
              <FormLabel fontSize="lg" fontWeight="bold" color="blue.600">
                Pickup Address
              </FormLabel>
              <HStack mb={3}>
                <Button 
                  size="md" 
                  variant="secondary"
                  onClick={() => useCurrentLocation("pickup")}
                  isLoading={isLoading}
                >
                  📍 Use Current Location
                </Button>
              </HStack>
              <AddressAutocomplete
                value={pickupSearch}
                onChange={setPickupSearch}
                onSelect={(sel) => {
                  // Ensure we have proper address data
                  let line1 = sel.address.line1 || sel.label.split(',')[0] || sel.label;
                  let city = sel.address.city || "";
                  let postcode = sel.address.postcode || "";
                  
                  // If we don't have proper city/postcode, try to extract from label
                  if (!city || !postcode) {
                    const parts = sel.label.split(',');
                    if (parts.length > 1) {
                      // Last part is usually postcode
                      postcode = postcode || parts[parts.length - 1].trim();
                      // Middle parts are usually city
                      city = city || parts.slice(1, -1).join(',').trim();
                    }
                  }
                  
                  // Ensure line1 is not too short
                  if (!line1 || line1.length < 3) {
                    line1 = sel.label.split(',')[0] || sel.label;
                  }
                  
                  const pickupData = {
                    label: sel.label,
                    line1,
                    city,
                    postcode,
                    coords: sel.coords ?? undefined,
                  };
                  
                  // Debug logging
                  console.log('[AddressForm] Setting pickup data:', pickupData);
                  
                  setPickup(pickupData);
                  setPickupSearch(sel.label);
                }}
                placeholder="Enter pickup address..."
              />
              
              {/* Pickup Details */}
              <VStack spacing={3} mt={4}>
                <FormControl>
                  <FormLabel fontSize="sm">Address Line 1</FormLabel>
                  <Input
                    value={pickup.line1}
                    onChange={(e) => setPickup({ ...pickup, line1: e.target.value })}
                    placeholder="Street address"
                  />
                </FormControl>
                
                <HStack spacing={4} width="100%">
                  <FormControl>
                    <FormLabel fontSize="sm">City</FormLabel>
                    <Input
                      value={pickup.city}
                      onChange={(e) => setPickup({ ...pickup, city: e.target.value })}
                      placeholder="City"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">Postcode</FormLabel>
                    <Input
                      value={pickup.postcode}
                      onChange={(e) => setPickup({ ...pickup, postcode: e.target.value })}
                      placeholder="Postcode"
                    />
                  </FormControl>
                </HStack>
                
                <Checkbox
                  isChecked={pickup.lift ?? false}
                  onChange={(e) => setPickup({ ...pickup, lift: e.target.checked })}
                >
                  Lift available at pickup
                </Checkbox>
              </VStack>
            </Box>

            {/* Dropoff Section */}
            <Box p={4} border="1px" borderColor="gray.200" borderRadius="lg">
              <FormLabel fontSize="lg" fontWeight="bold" color="green.600">
                Dropoff Address
              </FormLabel>
              <HStack mb={3}>
                <Button 
                  size="md" 
                  variant="secondary"
                  onClick={() => useCurrentLocation("dropoff")}
                  isLoading={isLoading}
                >
                  📍 Use Current Location
                </Button>
              </HStack>
              <AddressAutocomplete
                value={dropoffSearch}
                onChange={setDropoffSearch}
                onSelect={(sel) => {
                  // Ensure we have proper address data
                  let line1 = sel.address.line1 || sel.label.split(',')[0] || sel.label;
                  let city = sel.address.city || "";
                  let postcode = sel.address.postcode || "";
                  
                  // If we don't have proper city/postcode, try to extract from label
                  if (!city || !postcode) {
                    const parts = sel.label.split(',');
                    if (parts.length > 1) {
                      // Last part is usually postcode
                      postcode = postcode || parts[parts.length - 1].trim();
                      // Middle parts are usually city
                      city = city || parts.slice(1, -1).join(',').trim();
                    }
                  }
                  
                  // Ensure line1 is not too short
                  if (!line1 || line1.length < 3) {
                    line1 = sel.label.split(',')[0] || sel.label;
                  }
                  
                  const dropoffData = {
                    label: sel.label,
                    line1,
                    city,
                    postcode,
                    coords: sel.coords ?? undefined,
                  };
                  
                  // Debug logging
                  console.log('[AddressForm] Setting dropoff data:', dropoffData);
                  
                  setDropoff(dropoffData);
                  setDropoffSearch(sel.label);
                }}
                placeholder="Enter dropoff address..."
              />
              
              {/* Dropoff Details */}
              <VStack spacing={3} mt={4}>
                <FormControl>
                  <FormLabel fontSize="sm">Address Line 1</FormLabel>
                  <Input
                    value={dropoff.line1}
                    onChange={(e) => setDropoff({ ...dropoff, line1: e.target.value })}
                    placeholder="Street address"
                  />
                </FormControl>
                
                <HStack spacing={4} width="100%">
                  <FormControl>
                    <FormLabel fontSize="sm">City</FormLabel>
                    <Input
                      value={dropoff.city}
                      onChange={(e) => setDropoff({ ...dropoff, city: e.target.value })}
                      placeholder="City"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">Postcode</FormLabel>
                    <Input
                      value={dropoff.postcode}
                      onChange={(e) => setDropoff({ ...dropoff, postcode: e.target.value })}
                      placeholder="Postcode"
                    />
                  </FormControl>
                </HStack>
                
                <Checkbox
                  isChecked={dropoff.lift ?? false}
                  onChange={(e) => setDropoff({ ...dropoff, lift: e.target.checked })}
                >
                  Lift available at dropoff
                </Checkbox>
              </VStack>
            </Box>

            {/* Additional Notes */}
            <FormControl>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <Textarea
                placeholder="Any special instructions for pickup or delivery..."
                value={pickup.notes ?? ""}
                onChange={(e) => setPickup({ ...pickup, notes: e.target.value })}
                rows={3}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSubmit}
              isDisabled={!pickup.line1 || !dropoff.line1}
            >
              Save Addresses
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
