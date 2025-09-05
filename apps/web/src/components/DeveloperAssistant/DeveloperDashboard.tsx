'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Flex, VStack, HStack, Text, Button, useToast, useDisclosure } from '@chakra-ui/react';
import { FileExplorer } from './FileExplorer';
import { LiveCodeEditor } from './LiveCodeEditor';
import { LiveAnalysisPanel } from './LiveAnalysisPanel';
import { CodeSuggestions } from './CodeSuggestions';
import { QuickActions } from './QuickActions';
import { Terminal } from './Terminal';
import { TestRunner } from './TestRunner';
import { DatabaseManager } from './DatabaseManager';
import { AgentManager } from '../../agent/core/AgentManager';
import { AgentMode, DeveloperContext } from '../../agent/types';

/**
 * Developer Dashboard - Advanced AI-powered development interface
 * Provides comprehensive development tools with live code analysis
 */
export const DeveloperDashboard: React.FC = () => {
  const [agentManager, setAgentManager] = useState<AgentManager | null>(null);
  const [currentMode, setCurrentMode] = useState<AgentMode>(AgentMode.CUSTOMER);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [projectStructure, setProjectStructure] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const toast = useToast();
  const { isOpen: isTerminalOpen, onToggle: onTerminalToggle } = useDisclosure();
  const { isOpen: isTestRunnerOpen, onToggle: onTestRunnerToggle } = useDisclosure();
  const { isOpen: isDatabaseOpen, onToggle: onDatabaseToggle } = useDisclosure();

  // Initialize agent manager
  useEffect(() => {
    const initializeAgent = async () => {
      try {
        setIsLoading(true);
        const manager = AgentManager.getInstance();
        
        // Initialize developer context
        const devContext: DeveloperContext = {
          projectPath: typeof window === 'undefined' ? process.cwd() : '/',
          environment: 'development',
          permissions: ['read', 'write', 'execute', 'admin']
        };

        // Switch to developer mode
        manager.switchMode(AgentMode.DEVELOPER, devContext);
        setCurrentMode(AgentMode.DEVELOPER);
        
        // Get project structure - using mock data for now
        const mockStructure = {
          root: {
            name: 'speedy-van',
            type: 'directory',
            children: [
              {
                name: 'src',
                type: 'directory',
                children: [
                  { name: 'components', type: 'directory', children: [] },
                  { name: 'agent', type: 'directory', children: [] },
                  { name: 'lib', type: 'directory', children: [] }
                ]
              },
              { name: 'package.json', type: 'file' },
              { name: 'README.md', type: 'file' }
            ]
          },
          totalFiles: 15,
          totalDirectories: 8,
          languages: ['TypeScript', 'JavaScript', 'CSS'],
          lastModified: new Date()
        };
        setProjectStructure(mockStructure);
        
        setAgentManager(manager);
        setIsLoading(false);
        
        toast({
          title: 'Developer Assistant Ready',
          description: 'Advanced development tools are now available',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to initialize');
        setIsLoading(false);
        
        toast({
          title: 'Initialization Failed',
          description: error instanceof Error ? error.message : 'Unknown error',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    initializeAgent();
  }, [toast]);

  // Handle file selection
  const handleFileSelect = useCallback((filePath: string) => {
    setCurrentFile(filePath);
  }, []);

  // Handle mode switching
  const handleModeSwitch = useCallback((mode: AgentMode) => {
    if (agentManager) {
      try {
        agentManager.switchMode(mode);
        setCurrentMode(mode);
        
        toast({
          title: 'Mode Switched',
          description: `Switched to ${mode} mode`,
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Mode Switch Failed',
          description: error instanceof Error ? error.message : 'Unknown error',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  }, [agentManager, toast]);

  if (isLoading) {
    return (
      <Box p={8} textAlign="center">
        <Text fontSize="xl" mb={4}>Initializing Developer Assistant...</Text>
        <Text color="gray.500">Loading advanced development tools...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8} textAlign="center">
        <Text fontSize="xl" color="red.500" mb={4}>Initialization Failed</Text>
        <Text color="gray.500" mb={4}>{error}</Text>
        <Button colorScheme="blue" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box h="100vh" bg="gray.50" overflow="hidden">
      {/* Header */}
      <Box bg="white" borderBottom="1px" borderColor="gray.200" p={4}>
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              Speedy Van Developer Assistant
            </Text>
            <Text fontSize="sm" color="gray.500">
              Mode: {currentMode}
            </Text>
          </HStack>
          
          <HStack spacing={3}>
            <Button
              size="sm"
              colorScheme={currentMode === AgentMode.CUSTOMER ? 'blue' : 'gray'}
              onClick={() => handleModeSwitch(AgentMode.CUSTOMER)}
            >
              Customer Mode
            </Button>
            <Button
              size="sm"
              colorScheme={currentMode === AgentMode.DEVELOPER ? 'blue' : 'gray'}
              onClick={() => handleModeSwitch(AgentMode.DEVELOPER)}
            >
              Developer Mode
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Main Content */}
      <Flex h="calc(100vh - 80px)">
        {/* Left Panel - File Explorer */}
        <Box w="300px" bg="white" borderRight="1px" borderColor="gray.200" overflow="auto">
          <FileExplorer
            projectStructure={projectStructure}
            onFileSelect={handleFileSelect}
            currentFile={currentFile}
          />
        </Box>

        {/* Center Panel - Code Editor & Terminal */}
        <VStack flex={1} spacing={0}>
          {/* Code Editor */}
          <Box flex={1} w="100%" bg="white">
            <LiveCodeEditor
              filePath={currentFile}
              agentManager={agentManager}
            />
          </Box>

          {/* Terminal Toggle */}
          <Box w="100%" bg="gray.100" p={2}>
            <Button
              size="sm"
              onClick={onTerminalToggle}
              colorScheme="gray"
              w="100%"
            >
              {isTerminalOpen ? 'Hide Terminal' : 'Show Terminal'}
            </Button>
          </Box>

          {/* Terminal */}
          {isTerminalOpen && (
            <Box h="200px" w="100%" bg="black" color="white">
              <Terminal />
            </Box>
          )}
        </VStack>

        {/* Right Panel - Analysis & Tools */}
        <Box w="400px" bg="white" borderLeft="1px" borderColor="gray.200" overflow="auto">
          <VStack spacing={0} h="100%">
            {/* Live Analysis */}
            <Box flex={1} w="100%" borderBottom="1px" borderColor="gray.200">
              <LiveAnalysisPanel
                filePath={currentFile}
                agentManager={agentManager}
              />
            </Box>

            {/* Code Suggestions */}
            <Box flex={1} w="100%" borderBottom="1px" borderColor="gray.200">
              <CodeSuggestions
                agentManager={agentManager}
                currentFile={currentFile}
              />
            </Box>

            {/* Quick Actions */}
            <Box flex={1} w="100%">
              <QuickActions
                agentManager={agentManager}
                onTestRunnerToggle={onTestRunnerToggle}
                onDatabaseToggle={onDatabaseToggle}
              />
            </Box>
          </VStack>
        </Box>
      </Flex>

      {/* Bottom Panel - Additional Tools */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg="white"
        borderTop="1px"
        borderColor="gray.200"
        p={2}
        zIndex={10}
      >
        <HStack spacing={4} justify="center">
          <Button
            size="sm"
            colorScheme="green"
            onClick={onTestRunnerToggle}
          >
            {isTestRunnerOpen ? 'Hide Test Runner' : 'Test Runner'}
          </Button>
          
          <Button
            size="sm"
            colorScheme="purple"
            onClick={onDatabaseToggle}
          >
            {isDatabaseOpen ? 'Hide Database' : 'Database Manager'}
          </Button>
        </HStack>
      </Box>

      {/* Overlay Panels */}
      {isTestRunnerOpen && (
        <Box
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="80%"
          h="70%"
          bg="white"
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="xl"
          zIndex={20}
          p={4}
        >
          <TestRunner
            agentManager={agentManager}
            onClose={onTestRunnerToggle}
          />
        </Box>
      )}

      {isDatabaseOpen && (
        <Box
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="80%"
          h="70%"
          bg="white"
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="xl"
          zIndex={20}
          p={4}
        >
          <DatabaseManager
            agentManager={agentManager}
            onClose={onDatabaseToggle}
          />
        </Box>
      )}
    </Box>
  );
};
