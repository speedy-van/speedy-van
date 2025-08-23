"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  GridItem,
  Textarea,
  Checkbox,
  Stack,
  Divider,
  Icon,
  Flex,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Code,
  Image,
  Switch,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { 
  FiUser, 
  FiShield, 
  FiFileText, 
  FiTruck, 
  FiCalendar, 
  FiLock, 
  FiDownload, 
  FiTrash2, 
  FiMapPin,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiCode
} from "react-icons/fi";

interface ProfileData {
  profile: {
    id: string;
    name: string;
    email: string;
    status: string;
    onboardingStatus: string;
    basePostcode: string;
    vehicleType: string;
    approvedAt: string | null;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    reg: string;
    weightClass: string;
    motExpiry: string | null;
  } | null;
  checks: {
    id: string;
    rtwMethod: string | null;
    rtwResultRef: string | null;
    rtwExpiresAt: string | null;
    dvlaCheckRef: string | null;
    licenceCategories: string[];
    points: number | null;
    licenceExpiry: string | null;
    dbsType: string | null;
    dbsCheckRef: string | null;
    dbsCheckedAt: string | null;
    dbsRetentionUntil: string | null;
    insurancePolicyNo: string | null;
    insurer: string | null;
    coverType: string | null;
    goodsInTransit: boolean | null;
    publicLiability: boolean | null;
    policyStart: string | null;
    policyEnd: string | null;
  } | null;
  documents: Array<{
    id: string;
    category: string;
    fileUrl: string;
    status: string;
    uploadedAt: string;
    expiresAt: string | null;
  }>;
}

interface TwoFactorData {
  enabled: boolean;
  secret?: string;
  qrCodeUrl?: string;
  backupCodesGenerated?: boolean;
}

interface DeletionRequest {
  hasPendingDeletion: boolean;
  deletionRequest?: {
    id: string;
    reason: string;
    requestedAt: string;
    scheduledFor: string;
  };
}

export default function SettingsPage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(null);
  const [deletionRequest, setDeletionRequest] = useState<DeletionRequest | null>(null);
  const [locationConsent, setLocationConsent] = useState(false);
  const toast = useToast();
  
  // Modal states
  const { isOpen: is2FAModalOpen, onOpen: on2FAModalOpen, onClose: on2FAModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isBackupCodesModalOpen, onOpen: onBackupCodesModalOpen, onClose: onBackupCodesModalClose } = useDisclosure();
  
  // Form states
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Form states for profile
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    basePostcode: "",
  });

  const [vehicleInfo, setVehicleInfo] = useState({
    make: "",
    model: "",
    reg: "",
    weightClass: "",
    motExpiry: "",
  });

  const [licenseInfo, setLicenseInfo] = useState({
    licenceCategories: [] as string[],
    points: "",
    licenceExpiry: "",
  });

  const [insuranceInfo, setInsuranceInfo] = useState({
    insurancePolicyNo: "",
    insurer: "",
    coverType: "",
    goodsInTransit: false,
    publicLiability: false,
    policyStart: "",
    policyEnd: "",
  });

  const [rtwInfo, setRtwInfo] = useState({
    rtwMethod: "",
    rtwResultRef: "",
    rtwExpiresAt: "",
  });

  const [dbsInfo, setDbsInfo] = useState({
    dbsType: "",
    dbsCheckRef: "",
    dbsCheckedAt: "",
    dbsRetentionUntil: "",
  });

  useEffect(() => {
    fetchProfileData();
    fetchTwoFactorData();
    fetchDeletionRequest();
    fetchLocationConsent();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch("/api/driver/profile");
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        
        // Populate form fields
        setPersonalInfo({
          name: data.profile.name || "",
          basePostcode: data.profile.basePostcode || "",
        });

        if (data.vehicle) {
          setVehicleInfo({
            make: data.vehicle.make || "",
            model: data.vehicle.model || "",
            reg: data.vehicle.reg || "",
            weightClass: data.vehicle.weightClass || "",
            motExpiry: data.vehicle.motExpiry ? new Date(data.vehicle.motExpiry).toISOString().split('T')[0] : "",
          });
        }

        if (data.checks) {
          setLicenseInfo({
            licenceCategories: data.checks.licenceCategories || [],
            points: data.checks.points?.toString() || "",
            licenceExpiry: data.checks.licenceExpiry ? new Date(data.checks.licenceExpiry).toISOString().split('T')[0] : "",
          });

          setInsuranceInfo({
            insurancePolicyNo: data.checks.insurancePolicyNo || "",
            insurer: data.checks.insurer || "",
            coverType: data.checks.coverType || "",
            goodsInTransit: data.checks.goodsInTransit || false,
            publicLiability: data.checks.publicLiability || false,
            policyStart: data.checks.policyStart ? new Date(data.checks.policyStart).toISOString().split('T')[0] : "",
            policyEnd: data.checks.policyEnd ? new Date(data.checks.policyEnd).toISOString().split('T')[0] : "",
          });

          setRtwInfo({
            rtwMethod: data.checks.rtwMethod || "",
            rtwResultRef: data.checks.rtwResultRef || "",
            rtwExpiresAt: data.checks.rtwExpiresAt ? new Date(data.checks.rtwExpiresAt).toISOString().split('T')[0] : "",
          });

          setDbsInfo({
            dbsType: data.checks.dbsType || "",
            dbsCheckRef: data.checks.dbsCheckRef || "",
            dbsCheckedAt: data.checks.dbsCheckedAt ? new Date(data.checks.dbsCheckedAt).toISOString().split('T')[0] : "",
            dbsRetentionUntil: data.checks.dbsRetentionUntil ? new Date(data.checks.dbsRetentionUntil).toISOString().split('T')[0] : "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTwoFactorData = async () => {
    try {
      const response = await fetch("/api/driver/security/2fa");
      if (response.ok) {
        const data = await response.json();
        setTwoFactorData(data);
      }
    } catch (error) {
      console.error("Error fetching 2FA data:", error);
    }
  };

  const fetchDeletionRequest = async () => {
    try {
      const response = await fetch("/api/driver/privacy/delete");
      if (response.ok) {
        const data = await response.json();
        setDeletionRequest(data);
      }
    } catch (error) {
      console.error("Error fetching deletion request:", error);
    }
  };

  const fetchLocationConsent = async () => {
    try {
      const response = await fetch("/api/driver/availability");
      if (response.ok) {
        const data = await response.json();
        setLocationConsent(data.locationConsent || false);
      }
    } catch (error) {
      console.error("Error fetching location consent:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/driver/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: personalInfo.name,
          basePostcode: personalInfo.basePostcode,
          vehicle: vehicleInfo,
          checks: {
            rtwMethod: rtwInfo.rtwMethod || null,
            rtwResultRef: rtwInfo.rtwResultRef || null,
            rtwExpiresAt: rtwInfo.rtwExpiresAt || null,
            dvlaCheckRef: null,
            licenceCategories: licenseInfo.licenceCategories,
            points: licenseInfo.points ? parseInt(licenseInfo.points) : null,
            licenceExpiry: licenseInfo.licenceExpiry || null,
            dbsType: dbsInfo.dbsType || null,
            dbsCheckRef: dbsInfo.dbsCheckRef || null,
            dbsCheckedAt: dbsInfo.dbsCheckedAt || null,
            dbsRetentionUntil: dbsInfo.dbsRetentionUntil || null,
            insurancePolicyNo: insuranceInfo.insurancePolicyNo || null,
            insurer: insuranceInfo.insurer || null,
            coverType: insuranceInfo.coverType || null,
            goodsInTransit: insuranceInfo.goodsInTransit,
            publicLiability: insuranceInfo.publicLiability,
            policyStart: insuranceInfo.policyStart || null,
            policyEnd: insuranceInfo.policyEnd || null,
          },
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        await fetchProfileData();
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTwoFactorAction = async (action: string) => {
    try {
      const response = await fetch("/api/driver/security/2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          token: twoFactorToken,
          secret: twoFactorData?.secret,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (action === "enable" && data.backupCodes) {
          setBackupCodes(data.backupCodes);
          onBackupCodesModalOpen();
        }
        
        toast({
          title: "Success",
          description: data.message,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        await fetchTwoFactorData();
        setTwoFactorToken("");
        on2FAModalClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (error) {
      console.error("2FA action error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to perform 2FA action",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDataExport = async () => {
    try {
      const response = await fetch("/api/driver/privacy/export", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create and download JSON file
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `speedy-van-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: "Data export downloaded successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error("Failed to export data");
      }
    } catch (error) {
      console.error("Data export error:", error);
      toast({
        title: "Error",
        description: "Failed to export data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/driver/privacy/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: deleteReason,
          password: deletePassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        await fetchDeletionRequest();
        setDeletePassword("");
        setDeleteReason("");
        onDeleteModalClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (error) {
      console.error("Delete account error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCancelDeletion = async () => {
    try {
      const response = await fetch("/api/driver/privacy/delete", {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        await fetchDeletionRequest();
      } else {
        throw new Error("Failed to cancel deletion");
      }
    } catch (error) {
      console.error("Cancel deletion error:", error);
      toast({
        title: "Error",
        description: "Failed to cancel deletion request",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleLocationConsentChange = async (enabled: boolean) => {
    try {
      const response = await fetch("/api/driver/availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationConsent: enabled,
        }),
      });

      if (response.ok) {
        setLocationConsent(enabled);
        toast({
          title: "Success",
          description: `Location sharing ${enabled ? "enabled" : "disabled"}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error("Failed to update location consent");
      }
    } catch (error) {
      console.error("Location consent error:", error);
      toast({
        title: "Error",
        description: "Failed to update location consent",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      applied: { color: "yellow", text: "Applied" },
      docs_pending: { color: "orange", text: "Documents Pending" },
      in_review: { color: "blue", text: "In Review" },
      approved: { color: "green", text: "Approved" },
      suspended: { color: "red", text: "Suspended" },
      removed: { color: "gray", text: "Removed" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: "gray", text: status };
    return <Badge colorScheme={config.color}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>Settings</Heading>
      
      {profileData && (
        <Alert status="info" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>Account Status</AlertTitle>
            <AlertDescription>
              Your current status: {getStatusBadge(profileData.profile.onboardingStatus)}
              {profileData.profile.approvedAt && (
                <Text mt={1}>Approved on: {new Date(profileData.profile.approvedAt).toLocaleDateString()}</Text>
              )}
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {deletionRequest?.hasPendingDeletion && (
        <Alert status="warning" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>Account Deletion Pending</AlertTitle>
            <AlertDescription>
              Your account is scheduled for deletion on {new Date(deletionRequest.deletionRequest!.scheduledFor).toLocaleDateString()}.
              <Button size="sm" ml={4} onClick={handleCancelDeletion}>
                Cancel Deletion
              </Button>
            </AlertDescription>
          </Box>
        </Alert>
      )}

      <Tabs index={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab>
            <Icon as={FiUser} mr={2} />
            Profile
          </Tab>
          <Tab>
            <Icon as={FiLock} mr={2} />
            Security
          </Tab>
          <Tab>
            <Icon as={FiMapPin} mr={2} />
            Privacy
          </Tab>
          <Tab>
            <Icon as={FiTruck} mr={2} />
            Vehicle
          </Tab>
          <Tab>
            <Icon as={FiShield} mr={2} />
            License & Insurance
          </Tab>
          <Tab>
            <Icon as={FiFileText} mr={2} />
            Right to Work
          </Tab>
          <Tab>
            <Icon as={FiCalendar} mr={2} />
            DBS Check
          </Tab>
        </TabList>

        <TabPanels>
          {/* Profile Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Personal Information</Heading>
                  
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Full Name</FormLabel>
                        <Input
                          value={personalInfo.name}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                          placeholder="Enter your full name"
                        />
                      </FormControl>
                    </GridItem>
                    
                    <GridItem>
                      <FormControl>
                        <FormLabel>Base Postcode</FormLabel>
                        <Input
                          value={personalInfo.basePostcode}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, basePostcode: e.target.value })}
                          placeholder="e.g., SW1A 1AA"
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <FormControl>
                    <FormLabel>Email Address</FormLabel>
                    <Input
                      value={profileData?.profile.email || ""}
                      isReadOnly
                      bg="gray.50"
                    />
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      Contact support to change your email address
                    </Text>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              {/* Two-Factor Authentication */}
              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Box>
                        <Heading size="md">Two-Factor Authentication</Heading>
                        <Text color="gray.600" mt={1}>
                          Add an extra layer of security to your account
                        </Text>
                      </Box>
                      <Badge colorScheme={twoFactorData?.enabled ? "green" : "gray"}>
                        {twoFactorData?.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </HStack>

                    {twoFactorData?.enabled ? (
                      <VStack spacing={3} align="stretch">
                        <Alert status="success">
                          <AlertIcon />
                          <Text>Two-factor authentication is enabled for your account.</Text>
                        </Alert>
                        <HStack>
                          <Button
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => {
                              setTwoFactorToken("");
                              on2FAModalOpen();
                            }}
                          >
                            Disable 2FA
                          </Button>
                          <Button
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => {
                              setTwoFactorToken("");
                              on2FAModalOpen();
                            }}
                          >
                            Regenerate Backup Codes
                          </Button>
                        </HStack>
                      </VStack>
                    ) : (
                      <VStack spacing={3} align="stretch">
                        <Alert status="info">
                          <AlertIcon />
                          <Text>Two-factor authentication adds an extra layer of security to your account.</Text>
                        </Alert>
                        <Button
                          colorScheme="blue"
                          onClick={() => {
                            setTwoFactorToken("");
                            on2FAModalOpen();
                          }}
                        >
                          Enable 2FA
                        </Button>
                      </VStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Password Change */}
              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">Password</Heading>
                    <Text color="gray.600">
                      Change your account password
                    </Text>
                    <Button colorScheme="blue" variant="outline">
                      Change Password
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Privacy Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              {/* Location Sharing */}
              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Box>
                        <Heading size="md">Location Sharing</Heading>
                        <Text color="gray.600" mt={1}>
                          Allow location tracking while online for job matching
                        </Text>
                      </Box>
                      <Switch
                        isChecked={locationConsent}
                        onChange={(e) => handleLocationConsentChange(e.target.checked)}
                        colorScheme="blue"
                      />
                    </HStack>
                    <Alert status="info">
                      <AlertIcon />
                      <Text>
                        Location sharing helps us match you with nearby jobs and provide accurate ETAs to customers.
                        Your location is only shared when you're online and actively looking for work.
                      </Text>
                    </Alert>
                  </VStack>
                </CardBody>
              </Card>

              {/* Data Export */}
              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Box>
                        <Heading size="md">Data Export</Heading>
                        <Text color="gray.600" mt={1}>
                          Download a copy of your personal data
                        </Text>
                      </Box>
                      <Button
                        leftIcon={<FiDownload />}
                        colorScheme="blue"
                        variant="outline"
                        onClick={handleDataExport}
                      >
                        Export Data
                      </Button>
                    </HStack>
                    <Alert status="info">
                      <AlertIcon />
                      <Text>
                        You can request a copy of all your personal data stored in our system.
                        The export will include your profile, job history, earnings, and other account information.
                      </Text>
                    </Alert>
                  </VStack>
                </CardBody>
              </Card>

              {/* Account Deletion */}
              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Box>
                        <Heading size="md">Delete Account</Heading>
                        <Text color="gray.600" mt={1}>
                          Permanently delete your account and all associated data
                        </Text>
                      </Box>
                      <Button
                        leftIcon={<FiTrash2 />}
                        colorScheme="red"
                        variant="outline"
                        onClick={onDeleteModalOpen}
                      >
                        Delete Account
                      </Button>
                    </HStack>
                    <Alert status="warning">
                      <AlertIcon />
                      <Text>
                        This action cannot be undone. Your account will be permanently deleted after 30 days.
                        You can cancel the deletion request at any time during this period.
                      </Text>
                    </Alert>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Vehicle Information Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Vehicle Information</Heading>
                  
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Vehicle Make</FormLabel>
                        <Input
                          value={vehicleInfo.make}
                          onChange={(e) => setVehicleInfo({ ...vehicleInfo, make: e.target.value })}
                          placeholder="e.g., Ford"
                        />
                      </FormControl>
                    </GridItem>
                    
                    <GridItem>
                      <FormControl>
                        <FormLabel>Vehicle Model</FormLabel>
                        <Input
                          value={vehicleInfo.model}
                          onChange={(e) => setVehicleInfo({ ...vehicleInfo, model: e.target.value })}
                          placeholder="e.g., Transit"
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Registration Number</FormLabel>
                        <Input
                          value={vehicleInfo.reg}
                          onChange={(e) => setVehicleInfo({ ...vehicleInfo, reg: e.target.value.toUpperCase() })}
                          placeholder="e.g., AB12 CDE"
                        />
                      </FormControl>
                    </GridItem>
                    
                    <GridItem>
                      <FormControl>
                        <FormLabel>Weight Class</FormLabel>
                        <Input
                          value={vehicleInfo.weightClass}
                          onChange={(e) => setVehicleInfo({ ...vehicleInfo, weightClass: e.target.value })}
                          placeholder="e.g., 3.5t"
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <FormControl>
                    <FormLabel>MOT Expiry Date</FormLabel>
                    <Input
                      type="date"
                      value={vehicleInfo.motExpiry}
                      onChange={(e) => setVehicleInfo({ ...vehicleInfo, motExpiry: e.target.value })}
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* License & Insurance Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Heading size="md">Driving License</Heading>
                  
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel>License Categories</FormLabel>
                        <Stack spacing={2}>
                          {['B', 'B+E', 'C1', 'C1+E', 'C', 'C+E'].map((category) => (
                            <Checkbox
                              key={category}
                              isChecked={licenseInfo.licenceCategories.includes(category)}
                              onChange={(e) => {
                                const newCategories = e.target.checked
                                  ? [...licenseInfo.licenceCategories, category]
                                  : licenseInfo.licenceCategories.filter(c => c !== category);
                                setLicenseInfo({ ...licenseInfo, licenceCategories: newCategories });
                              }}
                            >
                              Category {category}
                            </Checkbox>
                          ))}
                        </Stack>
                      </FormControl>
                    </GridItem>
                    
                    <GridItem>
                      <VStack spacing={4}>
                        <FormControl>
                          <FormLabel>Penalty Points</FormLabel>
                          <Input
                            type="number"
                            value={licenseInfo.points}
                            onChange={(e) => setLicenseInfo({ ...licenseInfo, points: e.target.value })}
                            placeholder="0"
                            min="0"
                            max="12"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>License Expiry Date</FormLabel>
                          <Input
                            type="date"
                            value={licenseInfo.licenceExpiry}
                            onChange={(e) => setLicenseInfo({ ...licenseInfo, licenceExpiry: e.target.value })}
                          />
                        </FormControl>
                      </VStack>
                    </GridItem>
                  </Grid>

                  <Divider />

                  <Heading size="md">Insurance Information</Heading>
                  
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Insurance Policy Number</FormLabel>
                        <Input
                          value={insuranceInfo.insurancePolicyNo}
                          onChange={(e) => setInsuranceInfo({ ...insuranceInfo, insurancePolicyNo: e.target.value })}
                          placeholder="Enter policy number"
                        />
                      </FormControl>
                    </GridItem>
                    
                    <GridItem>
                      <FormControl>
                        <FormLabel>Insurer</FormLabel>
                        <Input
                          value={insuranceInfo.insurer}
                          onChange={(e) => setInsuranceInfo({ ...insuranceInfo, insurer: e.target.value })}
                          placeholder="e.g., Admiral, Direct Line"
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Cover Type</FormLabel>
                        <Input
                          value={insuranceInfo.coverType}
                          onChange={(e) => setInsuranceInfo({ ...insuranceInfo, coverType: e.target.value })}
                          placeholder="e.g., Comprehensive"
                        />
                      </FormControl>
                    </GridItem>
                    
                    <GridItem>
                      <VStack spacing={4}>
                        <FormControl>
                          <FormLabel>Policy Start Date</FormLabel>
                          <Input
                            type="date"
                            value={insuranceInfo.policyStart}
                            onChange={(e) => setInsuranceInfo({ ...insuranceInfo, policyStart: e.target.value })}
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Policy End Date</FormLabel>
                          <Input
                            type="date"
                            value={insuranceInfo.policyEnd}
                            onChange={(e) => setInsuranceInfo({ ...insuranceInfo, policyEnd: e.target.value })}
                          />
                        </FormControl>
                      </VStack>
                    </GridItem>
                  </Grid>

                  <Stack spacing={4}>
                    <Checkbox
                      isChecked={insuranceInfo.goodsInTransit}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, goodsInTransit: e.target.checked })}
                    >
                      Goods in Transit cover included
                    </Checkbox>
                    
                    <Checkbox
                      isChecked={insuranceInfo.publicLiability}
                      onChange={(e) => setInsuranceInfo({ ...insuranceInfo, publicLiability: e.target.checked })}
                    >
                      Public Liability cover included
                    </Checkbox>
                  </Stack>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Right to Work Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Right to Work Verification</Heading>
                  
                  <FormControl>
                    <FormLabel>Verification Method</FormLabel>
                    <Input
                      value={rtwInfo.rtwMethod}
                      onChange={(e) => setRtwInfo({ ...rtwInfo, rtwMethod: e.target.value })}
                      placeholder="e.g., Manual Document Check"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Reference Number</FormLabel>
                    <Input
                      value={rtwInfo.rtwResultRef}
                      onChange={(e) => setRtwInfo({ ...rtwInfo, rtwResultRef: e.target.value })}
                      placeholder="Enter reference number (if applicable)"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Expiry Date</FormLabel>
                    <Input
                      type="date"
                      value={rtwInfo.rtwExpiresAt}
                      onChange={(e) => setRtwInfo({ ...rtwInfo, rtwExpiresAt: e.target.value })}
                    />
                  </FormControl>

                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Right to Work Check</AlertTitle>
                      <AlertDescription>
                        You must provide proof of your right to work in the UK. This can be done through document verification or online checks.
                      </AlertDescription>
                    </Box>
                  </Alert>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* DBS Check Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">DBS (Disclosure and Barring Service) Check</Heading>
                  
                  <FormControl>
                    <FormLabel>DBS Check Type</FormLabel>
                    <Input
                      value={dbsInfo.dbsType}
                      onChange={(e) => setDbsInfo({ ...dbsInfo, dbsType: e.target.value })}
                      placeholder="e.g., Basic DBS Check"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>DBS Reference Number</FormLabel>
                    <Input
                      value={dbsInfo.dbsCheckRef}
                      onChange={(e) => setDbsInfo({ ...dbsInfo, dbsCheckRef: e.target.value })}
                      placeholder="Enter DBS reference number"
                    />
                  </FormControl>

                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Check Date</FormLabel>
                        <Input
                          type="date"
                          value={dbsInfo.dbsCheckedAt}
                          onChange={(e) => setDbsInfo({ ...dbsInfo, dbsCheckedAt: e.target.value })}
                        />
                      </FormControl>
                    </GridItem>
                    
                    <GridItem>
                      <FormControl>
                        <FormLabel>Retention Until</FormLabel>
                        <Input
                          type="date"
                          value={dbsInfo.dbsRetentionUntil}
                          onChange={(e) => setDbsInfo({ ...dbsInfo, dbsRetentionUntil: e.target.value })}
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>DBS Check Information</AlertTitle>
                      <AlertDescription>
                        A Basic DBS check is required for all drivers. This check will be verified by our compliance team.
                      </AlertDescription>
                    </Box>
                  </Alert>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <HStack spacing={4} mt={6} justify="flex-end">
        <Button
          variant="outline"
          onClick={() => {
            fetchProfileData();
            setActiveTab(0);
          }}
        >
          Reset
        </Button>
        <Button
          colorScheme="blue"
          onClick={handleSave}
          isLoading={saving}
          loadingText="Saving..."
        >
          Save Changes
        </Button>
      </HStack>

      {/* 2FA Modal */}
      <Modal isOpen={is2FAModalOpen} onClose={on2FAModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {twoFactorData?.enabled ? "Disable Two-Factor Authentication" : "Enable Two-Factor Authentication"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!twoFactorData?.enabled && twoFactorData?.qrCodeUrl && (
              <VStack spacing={4} align="stretch">
                <Text>
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
                </Text>
                <Box textAlign="center">
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(twoFactorData.qrCodeUrl)}`}
                    alt="QR Code"
                    mx="auto"
                  />
                </Box>
                <Text fontSize="sm" color="gray.600">
                  Or manually enter this secret: <Code>{twoFactorData.secret}</Code>
                </Text>
              </VStack>
            )}
            <FormControl mt={4}>
              <FormLabel>Authentication Code</FormLabel>
              <Input
                value={twoFactorToken}
                onChange={(e) => setTwoFactorToken(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={on2FAModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => handleTwoFactorAction(twoFactorData?.enabled ? "disable" : "enable")}
              isDisabled={!twoFactorToken || twoFactorToken.length !== 6}
            >
              {twoFactorData?.enabled ? "Disable" : "Enable"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Backup Codes Modal */}
      <Modal isOpen={isBackupCodesModalOpen} onClose={onBackupCodesModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Backup Codes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning" mb={4}>
              <AlertIcon />
              <Text>
                Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
              </Text>
            </Alert>
            <Box>
              <Text fontWeight="bold" mb={2}>Your backup codes:</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                {backupCodes.map((code, index) => (
                  <Code key={index} p={2} display="block" textAlign="center">
                    {code}
                  </Code>
                ))}
              </Grid>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onBackupCodesModalClose}>
              I've Saved These Codes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Account Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="error" mb={4}>
              <AlertIcon />
              <Text>
                This action cannot be undone. Your account will be permanently deleted after 30 days.
              </Text>
            </Alert>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Reason for Deletion (Optional)</FormLabel>
                <Textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Please let us know why you're leaving..."
                />
              </FormControl>
              <FormControl>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password to confirm"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteAccount}
              isDisabled={!deletePassword}
            >
              Delete Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
