'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Button,
  useToast,
  Spinner,
  Textarea,
  Input,
  Select,
  Divider,
  Collapse,
  useDisclosure
} from '@chakra-ui/react';
import { 
  LightBulbIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  DocumentTextIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { AgentManager } from '../../agent/core/AgentManager';
import { CodeSuggestion } from '../../agent/types';

interface CodeSuggestionsProps {
  agentManager: AgentManager | null;
  currentFile: string;
}

/**
 * Code Suggestions - Displays AI-generated code suggestions and improvements
 * Allows developers to interact with AI for code enhancement
 */
export const CodeSuggestions: React.FC<CodeSuggestionsProps> = ({
  agentManager,
  currentFile
}) => {
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [queryType, setQueryType] = useState<'improve' | 'optimize' | 'refactor' | 'custom'>('improve');
  const [customQuery, setCustomQuery] = useState('');
  
  const toast = useToast();
  const { isOpen: isQueryOpen, onToggle: onQueryToggle } = useDisclosure();

  // Load suggestions when currentFile changes
  useEffect(() => {
    if (currentFile && agentManager) {
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [currentFile, agentManager]);

  // Load existing suggestions
  const loadSuggestions = async () => {
    if (!agentManager || !currentFile) return;

    try {
      setIsLoading(true);
      
      // Get suggestions from agent manager
      const response = await agentManager.handleQuery(
        `Analyze ${currentFile} and provide code suggestions`,
        'en'
      );
      
      if (response && response.suggestions) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      toast({
        title: 'Failed to Load Suggestions',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate new suggestions
  const generateSuggestions = async () => {
    if (!agentManager || !currentFile) return;

    try {
      setIsGenerating(true);
      
      let query = '';
      
      switch (queryType) {
        case 'improve':
          query = `Improve the code quality and readability of ${currentFile}`;
          break;
        case 'optimize':
          query = `Optimize the performance of ${currentFile}`;
          break;
        case 'refactor':
          query = `Refactor ${currentFile} to follow best practices`;
          break;
        case 'custom':
          query = customQuery;
          break;
      }
      
      if (!query.trim()) {
        toast({
          title: 'Query Required',
          description: 'Please enter a query for code suggestions',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      const response = await agentManager.handleQuery(query, 'en');
      
      if (response && response.suggestions) {
        setSuggestions(response.suggestions);
        
        toast({
          title: 'Suggestions Generated',
          description: `Generated ${response.suggestions.length} new suggestions`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Apply suggestion
  const applySuggestion = async (suggestion: CodeSuggestion) => {
    if (!agentManager || !currentFile) return;

    try {
      toast({
        title: 'Applying Suggestion',
        description: 'Applying suggestion to your code...',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });

      // Use agent to apply the suggestion
      const response = await agentManager.handleQuery(
        `Apply this suggestion to ${currentFile}: ${suggestion.message}`,
        'en'
      );

      if (response && response.response) {
        toast({
          title: 'Suggestion Applied',
          description: 'Suggestion has been applied successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Reload suggestions to reflect changes
        await loadSuggestions();
      }
    } catch (error) {
      toast({
        title: 'Application Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Get suggestion icon based on type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'improvement':
        return LightBulbIcon;
      case 'security':
        return SparklesIcon;
      case 'performance':
        return RocketLaunchIcon;
      case 'style':
        return DocumentTextIcon;
      case 'bug':
        return CodeBracketIcon;
      default:
        return LightBulbIcon;
    }
  };

  // Get suggestion color based on type
  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'improvement':
        return 'blue';
      case 'security':
        return 'red';
      case 'performance':
        return 'green';
      case 'style':
        return 'purple';
      case 'bug':
        return 'orange';
      default:
        return 'gray';
    }
  };

  // Render suggestion item
  const renderSuggestion = (suggestion: CodeSuggestion, index: number) => (
    <Box 
      key={index} 
      p={3} 
      border="1px" 
      borderColor="gray.200" 
      borderRadius="md"
      bg="white"
      _hover={{ borderColor: 'blue.300', boxShadow: 'sm' }}
    >
      <HStack spacing={3} mb={2}>
        <Icon 
          as={getSuggestionIcon(suggestion.type)} 
          boxSize={4} 
          color={`${getSuggestionColor(suggestion.type)}.500`} 
        />
        <Badge 
          size="sm" 
          colorScheme={getSuggestionColor(suggestion.type)}
          variant="subtle"
        >
          {suggestion.type}
        </Badge>
        <Badge 
          size="sm" 
          colorScheme={suggestion.severity === 'high' ? 'red' : suggestion.severity === 'medium' ? 'yellow' : 'blue'}
          variant="subtle"
        >
          {suggestion.severity}
        </Badge>
      </HStack>
      
      <Text fontSize="sm" color="gray.700" mb={2}>
        {suggestion.message}
      </Text>
      
      {suggestion.filePath && (
        <Text fontSize="xs" color="gray.500" mb={2}>
          File: {suggestion.filePath}
          {suggestion.lineNumber && ` (Line ${suggestion.lineNumber})`}
        </Text>
      )}
      
      {suggestion.code && (
        <Box p={2} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200" mb={2}>
          <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={1}>
            Code:
          </Text>
          <Text fontSize="xs" color="gray.600" fontFamily="mono">
            {suggestion.code}
          </Text>
        </Box>
      )}
      
      {suggestion.fix && (
        <Box p={2} bg="green.50" borderRadius="md" border="1px" borderColor="green.200" mb={2}>
          <Text fontSize="xs" fontWeight="semibold" color="green.700" mb={1}>
            Fix:
          </Text>
          <Text fontSize="xs" color="green.600" fontFamily="mono">
            {suggestion.fix}
          </Text>
        </Box>
      )}
      
      <HStack spacing={2}>
        {suggestion.fix && (
          <Button
            size="sm"
            colorScheme="green"
            variant="outline"
            onClick={() => applySuggestion(suggestion)}
            flex={1}
          >
            Apply Fix
          </Button>
        )}
        
        <Button
          size="sm"
          colorScheme="blue"
          variant="ghost"
          onClick={() => {
            // Copy suggestion to clipboard
            navigator.clipboard.writeText(suggestion.message);
            toast({
              title: 'Copied',
              description: 'Suggestion copied to clipboard',
              status: 'success',
              duration: 2000,
              isClosable: true,
            });
          }}
        >
          Copy
        </Button>
      </HStack>
    </Box>
  );

  // Render query form
  const renderQueryForm = () => (
    <Collapse in={isQueryOpen} animateOpacity>
      <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200" mb={4}>
        <VStack spacing={3} align="stretch">
          <Text fontSize="sm" fontWeight="semibold" color="blue.700">
            Generate New Suggestions
          </Text>
          
          <Select
            size="sm"
            value={queryType}
            onChange={(e) => setQueryType(e.target.value as any)}
          >
            <option value="improve">Improve Code Quality</option>
            <option value="optimize">Optimize Performance</option>
            <option value="refactor">Refactor Code</option>
            <option value="custom">Custom Query</option>
          </Select>
          
          {queryType === 'custom' && (
            <Textarea
              size="sm"
              placeholder="Enter your custom query for code suggestions..."
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              rows={3}
            />
          )}
          
          <Button
            size="sm"
            colorScheme="blue"
            onClick={generateSuggestions}
            isLoading={isGenerating}
            leftIcon={<SparklesIcon />}
          >
            Generate Suggestions
          </Button>
        </VStack>
      </Box>
    </Collapse>
  );

  if (!currentFile) {
    return (
      <Box p={4} textAlign="center" color="gray.500">
        <Icon as={ChatBubbleLeftRightIcon} boxSize={8} mb={3} />
        <Text fontSize="sm" fontWeight="semibold">No File Selected</Text>
        <Text fontSize="xs" mt={1}>
          Select a file to get AI code suggestions
        </Text>
      </Box>
    );
  }

  return (
    <Box h="100%" overflow="auto">
      {/* Header */}
      <Box p={4} borderBottom="1px" borderColor="gray.200" bg="gray.50">
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <Icon as={LightBulbIcon} boxSize={5} color="blue.500" />
            <Text fontSize="lg" fontWeight="semibold" color="gray.700">
              AI Code Suggestions
            </Text>
          </HStack>
          
          <Button
            size="sm"
            colorScheme="blue"
            variant="ghost"
            onClick={onQueryToggle}
            leftIcon={<PlusIcon />}
          >
            {isQueryOpen ? 'Hide' : 'New'}
          </Button>
        </HStack>
        
        <Text fontSize="xs" color="gray.500" mt={1}>
          Current file: {currentFile}
        </Text>
      </Box>

      {/* Query Form */}
      {renderQueryForm()}

      {/* Content */}
      <Box p={4}>
        {isLoading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="lg" color="blue.500" mb={4} />
            <Text fontSize="sm" color="gray.600">Loading suggestions...</Text>
          </Box>
        ) : suggestions.length === 0 ? (
          <Box textAlign="center" py={8} color="gray.500">
            <Icon as={LightBulbIcon} boxSize={8} mb={3} />
            <Text fontSize="sm" fontWeight="semibold">No Suggestions Yet</Text>
            <Text fontSize="xs" mt={1}>
              Generate suggestions to improve your code
            </Text>
            <Button
              mt={3}
              size="sm"
              colorScheme="blue"
              onClick={onQueryToggle}
            >
              Generate Suggestions
            </Button>
          </Box>
        ) : (
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between" align="center">
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                Suggestions ({suggestions.length})
              </Text>
              
              <Button
                size="sm"
                colorScheme="blue"
                variant="ghost"
                onClick={loadSuggestions}
                isLoading={isLoading}
              >
                Refresh
              </Button>
            </HStack>
            
            <Divider />
            
            {suggestions.map((suggestion, index) => renderSuggestion(suggestion, index))}
          </VStack>
        )}
      </Box>
    </Box>
  );
};
