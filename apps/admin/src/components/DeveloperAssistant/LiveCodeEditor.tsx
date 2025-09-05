'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Spinner,
  Badge,
  IconButton,
  Tooltip,
  Textarea,
  Select
} from '@chakra-ui/react';
import { 
  PlayIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { AgentManager } from '../../agent/core/AgentManager';
import { LiveCodeAnalysis } from '../../agent/types';

interface LiveCodeEditorProps {
  filePath: string;
  agentManager: AgentManager | null;
}

/**
 * Live Code Editor - Provides code editing with live analysis
 * Integrates with the AI agent for real-time code suggestions
 */
export const LiveCodeEditor: React.FC<LiveCodeEditorProps> = ({
  filePath,
  agentManager
}) => {
  const [codeContent, setCodeContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<LiveCodeAnalysis | null>(null);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [language, setLanguage] = useState<string>('typescript');
  const [error, setError] = useState<string | null>(null);
  
  const toast = useToast();

  // Load file content when filePath changes
  useEffect(() => {
    if (filePath && agentManager) {
      loadFileContent();
    } else {
      setCodeContent('');
      setAnalysis(null);
      setError(null);
    }
  }, [filePath, agentManager]);

  // Detect language from file extension
  useEffect(() => {
    if (filePath) {
      const ext = filePath.split('.').pop()?.toLowerCase();
      const languageMap: Record<string, string> = {
        'ts': 'typescript',
        'tsx': 'typescript',
        'js': 'javascript',
        'jsx': 'javascript',
        'json': 'json',
        'css': 'css',
        'scss': 'scss',
        'html': 'html',
        'md': 'markdown',
        'sql': 'sql',
        'prisma': 'prisma'
      };
      setLanguage(languageMap[ext || ''] || 'typescript');
    }
  }, [filePath]);

  // Load file content
  const loadFileContent = async () => {
    if (!agentManager || !filePath) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Get file content from agent manager - using mock data for now
      const mockContent = `// Mock file content for ${filePath}
// This is a placeholder until server-side file operations are implemented

export default function MockComponent() {
  return (
    <div>
      <h1>Mock Component</h1>
      <p>File: ${filePath}</p>
    </div>
  );
}`;
      setCodeContent(mockContent);
      
      // Trigger live analysis
      await performLiveAnalysis();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load file');
      toast({
        title: 'File Load Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Perform live code analysis
  const performLiveAnalysis = async () => {
    if (!agentManager || !filePath) return;

    try {
      setIsAnalyzing(true);
      
      const analysisResult = await agentManager.getLiveCodeAnalysis(filePath);
      setAnalysis(analysisResult);
      
      toast({
        title: 'Analysis Complete',
        description: `Found ${analysisResult.issues.length} issues and ${analysisResult.suggestions.length} suggestions`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save file content
  const saveFile = async () => {
    if (!agentManager || !filePath) return;

    try {
      // Mock file write operation
      console.log(`Mock: Writing to ${filePath}:`, codeContent);
      
      toast({
        title: 'File Saved (Mock)',
        description: 'File content has been saved successfully (mock operation)',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Copy code to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      
      toast({
        title: 'Copied',
        description: 'Code copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy code to clipboard',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Format code
  const formatCode = async () => {
    if (!agentManager) return;

    try {
      // Use agent to format code
      const response = await agentManager.handleQuery(
        `Format this ${language} code: ${codeContent}`,
        'en'
      );
      
      if (response && response.response) {
        setCodeContent(response.response);
        
        toast({
          title: 'Code Formatted',
          description: 'Code has been formatted successfully',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Format Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Render line numbers
  const renderLineNumbers = () => {
    if (!showLineNumbers) return null;

    const lines = codeContent.split('\n');
    return (
      <Box
        position="absolute"
        left={0}
        top={0}
        w="50px"
        h="100%"
        bg="gray.100"
        borderRight="1px"
        borderColor="gray.200"
        fontSize="sm"
        color="gray.500"
        textAlign="right"
        pr={2}
        pt={2}
        userSelect="none"
        fontFamily="mono"
      >
        {lines.map((_, index) => (
          <Box key={index} py={0.5}>
            {index + 1}
          </Box>
        ))}
      </Box>
    );
  };

  // Render code with syntax highlighting
  const renderCode = () => {
    if (!codeContent) {
      return (
        <Box p={8} textAlign="center" color="gray.500">
          <Text>No file selected or file is empty</Text>
          <Text fontSize="sm" mt={2}>
            Select a file from the file explorer to start editing
          </Text>
        </Box>
      );
    }

    return (
      <Box position="relative" h="100%">
        {renderLineNumbers()}
        <Textarea
          value={codeContent}
          onChange={(e) => setCodeContent(e.target.value)}
          placeholder="Start typing your code..."
          size="sm"
          resize="none"
          h="100%"
          pl={showLineNumbers ? "60px" : "16px"}
          pr="16px"
          pt="8px"
          pb="16px"
          fontFamily="mono"
          fontSize="sm"
          lineHeight="1.5"
          border="none"
          _focus={{ boxShadow: 'none' }}
          bg="transparent"
          color="gray.800"
        />
      </Box>
    );
  };

  return (
    <Box h="100%" bg="white" border="1px" borderColor="gray.200" borderRadius="md">
      {/* Header */}
      <Box
        p={3}
        borderBottom="1px"
        borderColor="gray.200"
        bg="gray.50"
        borderTopRadius="md"
      >
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              {filePath ? `📄 ${filePath}` : 'No File Selected'}
            </Text>
            
            {language && (
              <Badge size="sm" colorScheme="blue" variant="subtle">
                {language.toUpperCase()}
              </Badge>
            )}
            
            {analysis && (
              <Badge
                size="sm"
                colorScheme={analysis.issues.length > 0 ? 'red' : 'green'}
                variant="subtle"
              >
                {analysis.issues.length} Issues
              </Badge>
            )}
          </HStack>

          <HStack spacing={2}>
            {/* Toggle Line Numbers */}
            <Tooltip label={showLineNumbers ? 'Hide Line Numbers' : 'Show Line Numbers'}>
              <IconButton
                size="sm"
                icon={showLineNumbers ? <EyeSlashIcon /> : <EyeIcon />}
                onClick={() => setShowLineNumbers(!showLineNumbers)}
                aria-label="Toggle line numbers"
                variant="ghost"
              />
            </Tooltip>

            {/* Refresh Analysis */}
            <Tooltip label="Refresh Analysis">
              <IconButton
                size="sm"
                icon={<ArrowPathIcon />}
                onClick={performLiveAnalysis}
                aria-label="Refresh analysis"
                variant="ghost"
                isLoading={isAnalyzing}
              />
            </Tooltip>

            {/* Format Code */}
            <Button
              size="sm"
              colorScheme="blue"
              variant="ghost"
              onClick={formatCode}
              isLoading={isAnalyzing}
            >
              Format
            </Button>

            {/* Copy Code */}
            <Tooltip label="Copy to Clipboard">
              <IconButton
                size="sm"
                icon={<DocumentDuplicateIcon />}
                onClick={copyToClipboard}
                aria-label="Copy code"
                variant="ghost"
              />
            </Tooltip>

            {/* Save File */}
            <Button
              size="sm"
              colorScheme="green"
              onClick={saveFile}
              isLoading={isLoading}
            >
              Save
            </Button>
          </HStack>
        </HStack>
      </Box>

      {/* Code Editor */}
      <Box flex={1} h="calc(100% - 60px)" position="relative" overflow="auto">
        {isLoading ? (
          <Box p={8} textAlign="center">
            <Spinner size="lg" color="blue.500" mb={4} />
            <Text>Loading file content...</Text>
          </Box>
        ) : error ? (
          <Box p={8} textAlign="center" color="red.500">
            <Text fontWeight="semibold" mb={2}>Error Loading File</Text>
            <Text fontSize="sm">{error}</Text>
            <Button
              mt={4}
              colorScheme="blue"
              size="sm"
              onClick={loadFileContent}
            >
              Retry
            </Button>
          </Box>
        ) : (
          renderCode()
        )}
      </Box>

      {/* Status Bar */}
      <Box
        p={2}
        borderTop="1px"
        borderColor="gray.200"
        bg="gray.50"
        borderBottomRadius="md"
        fontSize="xs"
        color="gray.500"
      >
        <HStack justify="space-between">
          <HStack spacing={4}>
            <Text>
              {codeContent ? `${codeContent.split('\n').length} lines` : '0 lines'}
            </Text>
            <Text>
              {codeContent ? `${codeContent.length} characters` : '0 characters'}
            </Text>
          </HStack>
          
          <HStack spacing={2}>
            {isAnalyzing && (
              <HStack spacing={1}>
                <Spinner size="xs" />
                <Text>Analyzing...</Text>
              </HStack>
            )}
            
            {analysis && (
              <Text>
                Last analyzed: {analysis.lastUpdated.toLocaleTimeString()}
              </Text>
            )}
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
};
