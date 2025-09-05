'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Collapse,
  useDisclosure,
  IconButton,
  Tooltip,
  Badge
} from '@chakra-ui/react';
import { 
  ChevronRightIcon, 
  ChevronDownIcon,
  FolderIcon,
  DocumentIcon,
  CodeBracketIcon,
  CogIcon,
  DocumentTextIcon,
  PhotoIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { FileNode } from '../../agent/types';

interface FileExplorerProps {
  projectStructure: any;
  onFileSelect: (filePath: string) => void;
  currentFile: string;
}

/**
 * File Explorer - Displays project structure in a tree view
 * Provides file navigation and selection for the developer assistant
 */
export const FileExplorer: React.FC<FileExplorerProps> = ({
  projectStructure,
  onFileSelect,
  currentFile
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['.']));

  // Toggle folder expansion
  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  // Get file icon based on file type
  const getFileIcon = (fileName: string, fileType: 'file' | 'directory') => {
    if (fileType === 'directory') {
      return FolderIcon;
    }

    const ext = fileName.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'ts':
      case 'tsx':
      case 'js':
      case 'jsx':
        return CodeBracketIcon;
      case 'json':
      case 'prisma':
        return CogIcon;
      case 'md':
      case 'txt':
        return DocumentTextIcon;
      case 'svg':
      case 'png':
      case 'jpg':
      case 'jpeg':
        return PhotoIcon;
      case 'zip':
      case 'tar':
      case 'gz':
        return ArchiveBoxIcon;
      default:
        return DocumentIcon;
    }
  };

  // Get file color based on type
  const getFileColor = (fileName: string, fileType: 'file' | 'directory') => {
    if (fileType === 'directory') {
      return 'blue.500';
    }

    const ext = fileName.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'blue.600';
      case 'js':
      case 'jsx':
        return 'yellow.600';
      case 'json':
        return 'green.600';
      case 'prisma':
        return 'purple.600';
      case 'md':
        return 'gray.600';
      case 'css':
      case 'scss':
        return 'pink.600';
      case 'html':
        return 'orange.600';
      default:
        return 'gray.500';
    }
  };

  // Render file node
  const renderFileNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = currentFile === node.path;
    const IconComponent = getFileIcon(node.name, node.type);
    const fileColor = getFileColor(node.name, node.type);

    return (
      <Box key={node.path}>
        <HStack
          spacing={2}
          py={1}
          px={level * 4 + 2}
          cursor="pointer"
          bg={isSelected ? 'blue.50' : 'transparent'}
          _hover={{ bg: isSelected ? 'blue.100' : 'gray.50' }}
          borderRadius="md"
          onClick={() => {
            if (node.type === 'directory') {
              toggleFolder(node.path);
            } else {
              onFileSelect(node.path);
            }
          }}
        >
          {/* Expand/Collapse Icon for directories */}
          {node.type === 'directory' && (
            <Icon
              as={isExpanded ? ChevronDownIcon : ChevronRightIcon}
              boxSize={4}
              color="gray.400"
              flexShrink={0}
            />
          )}
          
          {/* Spacer for files to align with folders */}
          {node.type === 'file' && (
            <Box w={4} flexShrink={0} />
          )}

          {/* File/Folder Icon */}
          <Icon
            as={IconComponent}
            boxSize={4}
            color={fileColor}
            flexShrink={0}
          />

          {/* File/Folder Name */}
          <Text
            fontSize="sm"
            fontWeight={node.type === 'directory' ? 'semibold' : 'normal'}
            color={isSelected ? 'blue.700' : 'gray.700'}
            flex={1}
            noOfLines={1}
          >
            {node.name}
          </Text>

          {/* File size badge for files */}
          {node.type === 'file' && node.size && (
            <Badge
              size="sm"
              colorScheme="gray"
              variant="subtle"
              fontSize="xs"
            >
              {formatFileSize(node.size)}
            </Badge>
          )}

          {/* Language badge for code files */}
          {node.type === 'file' && getFileLanguage(node.name) && (
            <Badge
              size="sm"
              colorScheme="blue"
              variant="subtle"
              fontSize="xs"
            >
              {getFileLanguage(node.name)}
            </Badge>
          )}
        </HStack>

        {/* Render children for directories */}
        {node.type === 'directory' && node.children && (
          <Collapse in={isExpanded} animateOpacity>
            <VStack spacing={0} align="stretch">
              {node.children.map(child => renderFileNode(child, level + 1))}
            </VStack>
          </Collapse>
        )}
      </Box>
    );
  };

  // Get programming language from file extension
  const getFileLanguage = (fileName: string): string | null => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'ts':
        return 'TS';
      case 'tsx':
        return 'TSX';
      case 'js':
        return 'JS';
      case 'jsx':
        return 'JSX';
      case 'json':
        return 'JSON';
      case 'prisma':
        return 'Prisma';
      case 'css':
        return 'CSS';
      case 'scss':
        return 'SCSS';
      case 'html':
        return 'HTML';
      case 'md':
        return 'MD';
      default:
        return null;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Project statistics
  const projectStats = useMemo(() => {
    if (!projectStructure) return null;

    const stats = {
      totalFiles: projectStructure.totalFiles || 0,
      totalDirectories: projectStructure.totalDirectories || 0,
      languages: projectStructure.languages || [],
      lastModified: projectStructure.lastModified
    };

    return stats;
  }, [projectStructure]);

  if (!projectStructure) {
    return (
      <Box p={4} textAlign="center">
        <Text color="gray.500" fontSize="sm">
          Loading project structure...
        </Text>
      </Box>
    );
  }

  return (
    <Box h="100%" overflow="auto">
      {/* Header */}
      <Box p={4} borderBottom="1px" borderColor="gray.200" bg="gray.50">
        <Text fontSize="lg" fontWeight="semibold" mb={2}>
          Project Files
        </Text>
        
        {projectStats && (
          <VStack spacing={1} align="stretch">
            <HStack justify="space-between" fontSize="xs">
              <Text color="gray.600">Files:</Text>
              <Badge size="sm" colorScheme="blue">{projectStats.totalFiles}</Badge>
            </HStack>
            <HStack justify="space-between" fontSize="xs">
              <Text color="gray.600">Folders:</Text>
              <Badge size="sm" colorScheme="green">{projectStats.totalDirectories}</Badge>
            </HStack>
            {projectStats.languages.length > 0 && (
              <HStack justify="space-between" fontSize="xs">
                <Text color="gray.600">Languages:</Text>
                <Badge size="sm" colorScheme="purple">{projectStats.languages.length}</Badge>
              </HStack>
            )}
          </VStack>
        )}
      </Box>

      {/* File Tree */}
      <Box p={2}>
        <VStack spacing={0} align="stretch">
          {renderFileNode(projectStructure.root)}
        </VStack>
      </Box>

      {/* Footer */}
      <Box p={4} borderTop="1px" borderColor="gray.200" bg="gray.50">
        <Text fontSize="xs" color="gray.500" textAlign="center">
          {currentFile ? `Selected: ${currentFile}` : 'No file selected'}
        </Text>
      </Box>
    </Box>
  );
};
