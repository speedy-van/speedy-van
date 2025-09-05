'use client';

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Tooltip,
  useToast,
  Spinner,
  Badge,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  Textarea,
  Select
} from '@chakra-ui/react';
import { 
  PlayIcon,
  DocumentPlusIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  RocketLaunchIcon,
  BeakerIcon,
  DatabaseIcon,
  CloudArrowUpIcon,
  CommandLineIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { AgentManager } from '../../agent/core/AgentManager';

interface QuickActionsProps {
  agentManager: AgentManager | null;
  onTestRunnerToggle: () => void;
  onDatabaseToggle: () => void;
}

/**
 * Quick Actions - Provides quick access to common development tasks
 * Includes shortcuts for testing, database operations, and code generation
 */
export const QuickActions: React.FC<QuickActionsProps> = ({
  agentManager,
  onTestRunnerToggle,
  onDatabaseToggle
}) => {
  const [isExecuting, setIsExecuting] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'search' | 'command'>('create');
  const [modalData, setModalData] = useState<any>({});
  
  const toast = useToast();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();

  // Quick action definitions
  const quickActions = [
    {
      id: 'run-tests',
      label: 'Run Tests',
      description: 'Execute all tests in the project',
      icon: BeakerIcon,
      color: 'green',
      action: () => executeAction('run-tests', 'Running tests...')
    },
    {
      id: 'create-component',
      label: 'Create Component',
      description: 'Generate a new React component',
      icon: DocumentPlusIcon,
      color: 'blue',
      action: () => openModal('create', { type: 'component' })
    },
    {
      id: 'search-code',
      label: 'Search Code',
      description: 'Search across all project files',
      icon: MagnifyingGlassIcon,
      color: 'purple',
      action: () => openModal('search', {})
    },
    {
      id: 'format-code',
      label: 'Format Code',
      description: 'Format all project files',
      icon: WrenchScrewdriverIcon,
      color: 'orange',
      action: () => executeAction('format-code', 'Formatting code...')
    },
    {
      id: 'build-project',
      label: 'Build Project',
      description: 'Build the project for production',
      icon: RocketLaunchIcon,
      color: 'teal',
      action: () => executeAction('build-project', 'Building project...')
    },
    {
      id: 'database-migrate',
      label: 'DB Migrate',
      description: 'Run database migrations',
      icon: DatabaseIcon,
      color: 'cyan',
      action: () => executeAction('database-migrate', 'Running migrations...')
    },
    {
      id: 'deploy',
      label: 'Deploy',
      description: 'Deploy to production',
      icon: CloudArrowUpIcon,
      color: 'red',
      action: () => executeAction('deploy', 'Deploying...')
    },
    {
      id: 'terminal',
      label: 'Terminal',
      description: 'Open integrated terminal',
      icon: CommandLineIcon,
      color: 'gray',
      action: () => executeAction('terminal', 'Opening terminal...')
    }
  ];

  // Execute quick action
  const executeAction = async (actionId: string, message: string) => {
    if (!agentManager) return;

    try {
      setIsExecuting(actionId);
      
      toast({
        title: 'Executing Action',
        description: message,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });

      // Execute action based on ID
      let response;
      switch (actionId) {
        case 'run-tests':
          response = await agentManager.handleQuery('Run all tests in the project', 'en');
          break;
        case 'format-code':
          response = await agentManager.handleQuery('Format all code files in the project', 'en');
          break;
        case 'build-project':
          response = await agentManager.handleQuery('Build the project for production', 'en');
          break;
        case 'database-migrate':
          response = await agentManager.handleQuery('Run database migrations', 'en');
          break;
        case 'deploy':
          response = await agentManager.handleQuery('Deploy the project to production', 'en');
          break;
        case 'terminal':
          // This would typically open a terminal component
          response = { response: 'Terminal opened' };
          break;
        default:
          response = await agentManager.handleQuery(`Execute action: ${actionId}`, 'en');
      }

      if (response && response.response) {
        toast({
          title: 'Action Completed',
          description: response.response,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Action Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsExecuting(null);
    }
  };

  // Open modal for complex actions
  const openModal = (type: 'create' | 'search' | 'command', data: any) => {
    setModalType(type);
    setModalData(data);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalData({});
  };

  // Handle modal form submission
  const handleModalSubmit = async () => {
    if (!agentManager) return;

    try {
      setIsExecuting(modalType);
      
      let query = '';
      switch (modalType) {
        case 'create':
          if (modalData.type === 'component') {
            query = `Create a new React component named "${modalData.name}" with TypeScript`;
            if (modalData.description) {
              query += ` for: ${modalData.description}`;
            }
          }
          break;
        case 'search':
          query = `Search for "${modalData.query}" in the project files`;
          break;
        case 'command':
          query = `Execute command: ${modalData.command}`;
          break;
      }

      if (query) {
        const response = await agentManager.handleQuery(query, 'en');
        
        if (response && response.response) {
          toast({
            title: 'Action Completed',
            description: response.response,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          
          closeModal();
        }
      }
    } catch (error) {
      toast({
        title: 'Action Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsExecuting(null);
    }
  };

  // Render quick action button
  const renderQuickAction = (action: any) => (
    <Tooltip key={action.id} label={action.description} placement="top">
      <IconButton
        aria-label={action.label}
        icon={<action.icon />}
        colorScheme={action.color}
        variant="outline"
        size="lg"
        onClick={action.action}
        isLoading={isExecuting === action.id}
        _hover={{ transform: 'scale(1.05)' }}
        transition="all 0.2s"
      />
    </Tooltip>
  );

  // Render modal content based on type
  const renderModalContent = () => {
    switch (modalType) {
      case 'create':
        return (
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              Create New {modalData.type === 'component' ? 'Component' : 'File'}
            </Text>
            
            <Input
              placeholder="Name"
              value={modalData.name || ''}
              onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
            />
            
            {modalData.type === 'component' && (
              <Textarea
                placeholder="Description (optional)"
                value={modalData.description || ''}
                onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                rows={3}
              />
            )}
            
            <Button
              colorScheme="blue"
              onClick={handleModalSubmit}
              isLoading={isExecuting === modalType}
            >
              Create
            </Button>
          </VStack>
        );
        
      case 'search':
        return (
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              Search Code
            </Text>
            
            <Input
              placeholder="Search query..."
              value={modalData.query || ''}
              onChange={(e) => setModalData({ ...modalData, query: e.target.value })}
            />
            
            <Button
              colorScheme="blue"
              onClick={handleModalSubmit}
              isLoading={isExecuting === modalType}
            >
              Search
            </Button>
          </VStack>
        );
        
      case 'command':
        return (
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              Execute Command
            </Text>
            
            <Input
              placeholder="Command to execute..."
              value={modalData.command || ''}
              onChange={(e) => setModalData({ ...modalData, command: e.target.value })}
            />
            
            <Button
              colorScheme="blue"
              onClick={handleModalSubmit}
              isLoading={isExecuting === modalType}
            >
              Execute
            </Button>
          </VStack>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box h="100%" overflow="auto">
      {/* Header */}
      <Box p={4} borderBottom="1px" borderColor="gray.200" bg="gray.50">
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <Icon as={CogIcon} boxSize={5} color="purple.500" />
            <Text fontSize="lg" fontWeight="semibold" color="gray.700">
              Quick Actions
            </Text>
          </HStack>
          
          <Badge size="sm" colorScheme="purple" variant="subtle">
            {quickActions.length} Actions
          </Badge>
        </HStack>
        
        <Text fontSize="xs" color="gray.500" mt={1}>
          Common development tasks and shortcuts
        </Text>
      </Box>

      {/* Quick Action Grid */}
      <Box p={4}>
        <VStack spacing={4} align="stretch">
          {/* Primary Actions */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>
              🚀 Primary Actions
            </Text>
            <HStack spacing={3} justify="center" flexWrap="wrap">
              {quickActions.slice(0, 4).map(renderQuickAction)}
            </HStack>
          </Box>
          
          <Divider />
          
          {/* Secondary Actions */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>
              🛠️ Development Tools
            </Text>
            <HStack spacing={3} justify="center" flexWrap="wrap">
              {quickActions.slice(4).map(renderQuickAction)}
            </HStack>
          </Box>
          
          <Divider />
          
          {/* Special Actions */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>
              🔧 Special Tools
            </Text>
            <HStack spacing={3} justify="center">
              <Button
                size="sm"
                colorScheme="green"
                variant="outline"
                onClick={onTestRunnerToggle}
                leftIcon={<BeakerIcon />}
              >
                Test Runner
              </Button>
              
              <Button
                size="sm"
                colorScheme="purple"
                variant="outline"
                onClick={onDatabaseToggle}
                leftIcon={<DatabaseIcon />}
              >
                Database
              </Button>
            </HStack>
          </Box>
        </VStack>
      </Box>

      {/* Modal for complex actions */}
      <Modal isOpen={isModalOpen} onClose={closeModal} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {modalType === 'create' && 'Create New'}
            {modalType === 'search' && 'Search Code'}
            {modalType === 'command' && 'Execute Command'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {renderModalContent()}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};
