'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  Button,
  useToast,
  Spinner,
  Divider
} from '@chakra-ui/react';
import { 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon,
  BugIcon,
  ShieldExclamationIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { AgentManager } from '../../agent/core/AgentManager';
import { LiveCodeAnalysis, CodeIssue, CodeSuggestion, CodeMetrics } from '../../agent/types';

interface LiveAnalysisPanelProps {
  filePath: string;
  agentManager: AgentManager | null;
}

/**
 * Live Analysis Panel - Displays real-time code analysis results
 * Shows issues, suggestions, and code metrics
 */
export const LiveAnalysisPanel: React.FC<LiveAnalysisPanelProps> = ({
  filePath,
  agentManager
}) => {
  const [analysis, setAnalysis] = useState<LiveCodeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const toast = useToast();

  // Load analysis when filePath changes
  useEffect(() => {
    if (filePath && agentManager) {
      loadAnalysis();
    } else {
      setAnalysis(null);
      setError(null);
    }
  }, [filePath, agentManager]);

  // Load code analysis
  const loadAnalysis = async () => {
    if (!agentManager || !filePath) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const analysisResult = await agentManager.getLiveCodeAnalysis(filePath);
      setAnalysis(analysisResult);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load analysis');
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get issue icon based on type
  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return XCircleIcon;
      case 'warning':
        return ExclamationTriangleIcon;
      case 'info':
        return InformationCircleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  // Get issue color based on severity
  const getIssueColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'blue';
      default:
        return 'gray';
    }
  };

  // Get suggestion icon based on type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'improvement':
        return LightBulbIcon;
      case 'security':
        return ShieldExclamationIcon;
      case 'performance':
        return RocketLaunchIcon;
      case 'style':
        return CheckCircleIcon;
      case 'bug':
        return BugIcon;
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

  // Apply suggestion fix
  const applySuggestion = async (suggestion: CodeSuggestion) => {
    if (!agentManager || !filePath || !suggestion.fix) return;

    try {
      toast({
        title: 'Applying Fix',
        description: 'Applying suggestion to your code...',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });

      // Use agent to apply the fix
      const response = await agentManager.handleQuery(
        `Apply this fix to ${filePath}: ${suggestion.fix}`,
        'en'
      );

      if (response && response.response) {
        toast({
          title: 'Fix Applied',
          description: 'Suggestion has been applied successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Reload analysis to reflect changes
        await loadAnalysis();
      }
    } catch (error) {
      toast({
        title: 'Fix Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Render code metrics
  const renderMetrics = (metrics: CodeMetrics) => (
    <Box p={4} bg="gray.50" borderRadius="md" mb={4}>
      <Text fontSize="sm" fontWeight="semibold" mb={3} color="gray.700">
        📊 Code Metrics
      </Text>
      
      <VStack spacing={2} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="xs" color="gray.600">Lines of Code:</Text>
          <Badge size="sm" colorScheme="blue">{metrics.lines}</Badge>
        </HStack>
        
        <HStack justify="space-between">
          <Text fontSize="xs" color="gray.600">Complexity:</Text>
          <Badge 
            size="sm" 
            colorScheme={metrics.complexity > 10 ? 'red' : metrics.complexity > 5 ? 'yellow' : 'green'}
          >
            {metrics.complexity}
          </Badge>
        </HStack>
        
        <HStack justify="space-between">
          <Text fontSize="xs" color="gray.600">Maintainability:</Text>
          <Badge 
            size="sm" 
            colorScheme={metrics.maintainability < 50 ? 'red' : metrics.maintainability < 70 ? 'yellow' : 'green'}
          >
            {metrics.maintainability}
          </Badge>
        </HStack>
        
        {metrics.testCoverage !== undefined && (
          <HStack justify="space-between">
            <Text fontSize="xs" color="gray.600">Test Coverage:</Text>
            <Badge 
              size="sm" 
              colorScheme={metrics.testCoverage < 50 ? 'red' : metrics.testCoverage < 80 ? 'yellow' : 'green'}
            >
              {metrics.testCoverage}%
            </Badge>
          </HStack>
        )}
        
        {metrics.lastCommit && (
          <HStack justify="space-between">
            <Text fontSize="xs" color="gray.600">Last Commit:</Text>
            <Text fontSize="xs" color="gray.500" fontFamily="mono">
              {metrics.lastCommit.substring(0, 8)}
            </Text>
          </HStack>
        )}
      </VStack>
    </Box>
  );

  // Render code issues
  const renderIssues = (issues: CodeIssue[]) => {
    if (issues.length === 0) {
      return (
        <Box p={4} textAlign="center" color="green.500">
          <Icon as={CheckCircleIcon} boxSize={6} mb={2} />
          <Text fontSize="sm" fontWeight="semibold">No Issues Found</Text>
          <Text fontSize="xs" color="gray.500">Your code looks good!</Text>
        </Box>
      );
    }

    return (
      <Accordion allowMultiple>
        {issues.map((issue, index) => (
          <AccordionItem key={index} border="none">
            <AccordionButton p={3} _hover={{ bg: 'gray.50' }} borderRadius="md">
              <HStack spacing={3} flex={1} justify="flex-start">
                <Icon 
                  as={getIssueIcon(issue.type)} 
                  boxSize={4} 
                  color={`${getIssueColor(issue.severity)}.500`} 
                />
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  {issue.message}
                </Text>
                <Badge 
                  size="sm" 
                  colorScheme={getIssueColor(issue.severity)}
                  ml="auto"
                >
                  {issue.severity}
                </Badge>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            
            <AccordionPanel pb={3} px={3}>
              <VStack spacing={2} align="stretch">
                <HStack spacing={2} fontSize="xs" color="gray.500">
                  <Text>Line {issue.line}</Text>
                  {issue.column && <Text>Column {issue.column}</Text>}
                </HStack>
                
                {issue.fix && (
                  <Box p={3} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                    <Text fontSize="xs" fontWeight="semibold" color="blue.700" mb={2}>
                      Suggested Fix:
                    </Text>
                    <Text fontSize="xs" color="blue.600" fontFamily="mono">
                      {issue.fix}
                    </Text>
                  </Box>
                )}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  // Render code suggestions
  const renderSuggestions = (suggestions: CodeSuggestion[]) => {
    if (suggestions.length === 0) {
      return (
        <Box p={4} textAlign="center" color="gray.500">
          <Text fontSize="sm">No suggestions available</Text>
        </Box>
      );
    }

    return (
      <VStack spacing={2} align="stretch">
        {suggestions.map((suggestion, index) => (
          <Box 
            key={index} 
            p={3} 
            border="1px" 
            borderColor="gray.200" 
            borderRadius="md"
            bg="white"
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
                colorScheme={getIssueColor(suggestion.severity)}
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
            
            {suggestion.fix && (
              <Button
                size="sm"
                colorScheme="green"
                variant="outline"
                onClick={() => applySuggestion(suggestion)}
                w="100%"
              >
                Apply Fix
              </Button>
            )}
          </Box>
        ))}
      </VStack>
    );
  };

  if (!filePath) {
    return (
      <Box p={4} textAlign="center" color="gray.500">
        <Icon as={InformationCircleIcon} boxSize={8} mb={3} />
        <Text fontSize="sm" fontWeight="semibold">No File Selected</Text>
        <Text fontSize="xs" mt={1}>
          Select a file to see live analysis
        </Text>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="lg" color="blue.500" mb={4} />
        <Text fontSize="sm" color="gray.600">Analyzing code...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} textAlign="center" color="red.500">
        <Icon as={XCircleIcon} boxSize={8} mb={3} />
        <Text fontSize="sm" fontWeight="semibold">Analysis Failed</Text>
        <Text fontSize="xs" mt={1} color="gray.500">
          {error}
        </Text>
        <Button
          mt={3}
          size="sm"
          colorScheme="blue"
          onClick={loadAnalysis}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!analysis) {
    return (
      <Box p={4} textAlign="center" color="gray.500">
        <Text fontSize="sm">No analysis available</Text>
      </Box>
    );
  }

  return (
    <Box h="100%" overflow="auto">
      {/* Header */}
      <Box p={4} borderBottom="1px" borderColor="gray.200" bg="gray.50">
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="semibold" color="gray.700">
            Live Analysis
          </Text>
          <Button
            size="sm"
            colorScheme="blue"
            variant="ghost"
            onClick={loadAnalysis}
          >
            Refresh
          </Button>
        </HStack>
        
        <Text fontSize="xs" color="gray.500" mt={1}>
          Last updated: {analysis.lastUpdated.toLocaleTimeString()}
        </Text>
      </Box>

      {/* Content */}
      <Box p={4}>
        {/* Code Metrics */}
        {renderMetrics(analysis.metrics)}
        
        <Divider my={4} />
        
        {/* Issues Section */}
        <Box mb={4}>
          <HStack spacing={2} mb={3}>
            <Icon as={ExclamationTriangleIcon} boxSize={4} color="red.500" />
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              Issues ({analysis.issues.length})
            </Text>
          </HStack>
          {renderIssues(analysis.issues)}
        </Box>
        
        <Divider my={4} />
        
        {/* Suggestions Section */}
        <Box>
          <HStack spacing={2} mb={3}>
            <Icon as={LightBulbIcon} boxSize={4} color="blue.500" />
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              Suggestions ({analysis.suggestions.length})
            </Text>
          </HStack>
          {renderSuggestions(analysis.suggestions)}
        </Box>
      </Box>
    </Box>
  );
};
