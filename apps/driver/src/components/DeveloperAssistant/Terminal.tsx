'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Tooltip,
  useToast,
  Divider,
  Badge,
  Flex
} from '@chakra-ui/react';
import { 
  PlayIcon,
  TrashIcon,
  ArrowUpIcon,
  CommandLineIcon,
  FolderIcon,
  UserIcon
} from '@heroicons/react/24/outline';

/**
 * Terminal - Integrated terminal interface for developers
 * Provides command execution and output display
 */
export const Terminal: React.FC = () => {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandIndex, setCommandIndex] = useState(-1);
  const [output, setOutput] = useState<Array<{ type: 'input' | 'output' | 'error'; content: string; timestamp: Date }>>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentDirectory, setCurrentDirectory] = useState(process.cwd());
  const [user, setUser] = useState(process.env.USER || 'developer');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Add initial terminal welcome
  useEffect(() => {
    addOutput('output', `Welcome to Speedy Van Developer Terminal
Type 'help' for available commands
Current directory: ${currentDirectory}
User: ${user}

`);
  }, []);

  // Add output to terminal
  const addOutput = (type: 'input' | 'output' | 'error', content: string) => {
    setOutput(prev => [...prev, { type, content, timestamp: new Date() }]);
  };

  // Execute command
  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    try {
      setIsExecuting(true);
      
      // Add command to history
      setCommandHistory(prev => [...prev, command]);
      setCommandIndex(-1);
      
      // Display command input
      addOutput('input', `$ ${command}`);
      
      // Parse and execute command
      const result = await parseAndExecuteCommand(command);
      
      // Display result
      addOutput('output', result);
      
    } catch (error) {
      addOutput('error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
      setCurrentCommand('');
    }
  };

  // Parse and execute command
  const parseAndExecuteCommand = async (command: string): Promise<string> => {
    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        return `Available commands:
  help                    - Show this help message
  clear                   - Clear terminal output
  pwd                     - Show current directory
  ls [path]              - List directory contents
  cd [path]              - Change directory
  mkdir [name]           - Create directory
  touch [name]           - Create file
  cat [file]             - Show file contents
  echo [text]            - Print text
  date                    - Show current date/time
  whoami                  - Show current user
  history                 - Show command history
  clear-history           - Clear command history
  npm [args]             - Execute npm command
  pnpm [args]            - Execute pnpm command
  git [args]             - Execute git command
  exit                    - Close terminal

Examples:
  ls src/components
  cd apps/web
  mkdir new-folder
  npm run dev
  git status`;

      case 'clear':
        setOutput([]);
        return '';

      case 'pwd':
        return currentDirectory;

      case 'ls':
        try {
          const path = args[0] || '.';
          const fullPath = path.startsWith('/') ? path : `${currentDirectory}/${path}`;
          // This would typically use Node.js fs module
          return `Directory listing for: ${fullPath}
  📁 src/
  📁 public/
  📁 components/
  📄 package.json
  📄 README.md
  📄 .env.local`;
        } catch (error) {
          throw new Error(`Failed to list directory: ${error}`);
        }

      case 'cd':
        try {
          const path = args[0];
          if (!path) {
            return `Current directory: ${currentDirectory}`;
          }
          
          let newPath = path;
          if (path === '~') {
            newPath = process.env.HOME || process.env.USERPROFILE || '/';
          } else if (!path.startsWith('/')) {
            newPath = `${currentDirectory}/${path}`;
          }
          
          // This would typically validate the path exists
          setCurrentDirectory(newPath);
          return `Changed directory to: ${newPath}`;
        } catch (error) {
          throw new Error(`Failed to change directory: ${error}`);
        }

      case 'mkdir':
        try {
          const name = args[0];
          if (!name) {
            throw new Error('Directory name required');
          }
          
          const fullPath = `${currentDirectory}/${name}`;
          // This would typically use Node.js fs.mkdir
          return `Created directory: ${fullPath}`;
        } catch (error) {
          throw new Error(`Failed to create directory: ${error}`);
        }

      case 'touch':
        try {
          const name = args[0];
          if (!name) {
            throw new Error('File name required');
          }
          
          const fullPath = `${currentDirectory}/${name}`;
          // This would typically use Node.js fs.writeFile
          return `Created file: ${fullPath}`;
        } catch (error) {
          throw new Error(`Failed to create file: ${error}`);
        }

      case 'cat':
        try {
          const file = args[0];
          if (!file) {
            throw new Error('File name required');
          }
          
          const fullPath = file.startsWith('/') ? file : `${currentDirectory}/${file}`;
          // This would typically use Node.js fs.readFile
          return `File contents of: ${fullPath}
[File content would be displayed here]`;
        } catch (error) {
          throw new Error(`Failed to read file: ${error}`);
        }

      case 'echo':
        return args.join(' ');

      case 'date':
        return new Date().toLocaleString();

      case 'whoami':
        return user;

      case 'history':
        return commandHistory.map((cmd, index) => `${index + 1}: ${cmd}`).join('\n');

      case 'clear-history':
        setCommandHistory([]);
        return 'Command history cleared';

      case 'npm':
      case 'pnpm':
      case 'git':
        // These would typically execute the actual commands
        return `Executing: ${command}
[Command output would be displayed here]`;

      case 'exit':
        // This would typically close the terminal
        return 'Terminal closed';

      default:
        return `Command not found: ${cmd}. Type 'help' for available commands.`;
    }
  };

  // Handle command submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim() && !isExecuting) {
      executeCommand(currentCommand);
    }
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = Math.min(commandIndex + 1, commandHistory.length - 1);
        setCommandIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandIndex > 0) {
        const newIndex = commandIndex - 1;
        setCommandIndex(newIndex);
        setCurrentCommand(commandIndex === 0 ? '' : commandHistory[commandHistory.length - 1 - newIndex]);
      } else {
        setCommandIndex(-1);
        setCurrentCommand('');
      }
    }
  };

  // Clear terminal
  const clearTerminal = () => {
    setOutput([]);
    addOutput('output', `Terminal cleared at ${new Date().toLocaleTimeString()}\n`);
  };

  // Clear history
  const clearHistory = () => {
    setCommandHistory([]);
    toast({
      title: 'History Cleared',
      description: 'Command history has been cleared',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box h="100%" bg="black" color="green.400" fontFamily="mono" fontSize="sm" p={2}>
      {/* Terminal Header */}
      <HStack justify="space-between" mb={2} px={2}>
        <HStack spacing={2}>
          <Icon as={CommandLineIcon} boxSize={4} />
          <Text fontSize="xs" fontWeight="semibold">Speedy Van Terminal</Text>
        </HStack>
        
        <HStack spacing={2}>
          <Badge size="sm" colorScheme="green" variant="subtle">
            {user}@{currentDirectory.split('/').pop() || 'root'}
          </Badge>
          
          <Tooltip label="Clear Terminal">
            <IconButton
              size="xs"
              icon={<TrashIcon />}
              onClick={clearTerminal}
              aria-label="Clear terminal"
              variant="ghost"
              color="green.400"
              _hover={{ bg: 'green.900' }}
            />
          </Tooltip>
          
          <Tooltip label="Clear History">
            <IconButton
              size="xs"
              icon={<ArrowUpIcon />}
              onClick={clearHistory}
              aria-label="Clear history"
              variant="ghost"
              color="green.400"
              _hover={{ bg: 'green.900' }}
            />
          </Tooltip>
        </HStack>
      </HStack>

      <Divider borderColor="green.700" mb={2} />

      {/* Terminal Output */}
      <Box
        ref={outputRef}
        flex={1}
        h="calc(100% - 80px)"
        overflow="auto"
        mb={2}
        px={2}
      >
        {output.map((item, index) => (
          <Box key={index} mb={1}>
            {item.type === 'input' && (
              <Text color="green.400" fontWeight="semibold">
                {item.content}
              </Text>
            )}
            {item.type === 'output' && (
              <Text color="green.300" whiteSpace="pre-wrap">
                {item.content}
              </Text>
            )}
            {item.type === 'error' && (
              <Text color="red.400" fontWeight="semibold">
                {item.content}
              </Text>
            )}
          </Box>
        ))}
        
        {isExecuting && (
          <HStack spacing={2} color="yellow.400">
            <Text>⏳</Text>
            <Text>Executing command...</Text>
          </HStack>
        )}
      </Box>

      {/* Command Input */}
      <Box px={2}>
        <form onSubmit={handleSubmit}>
          <HStack spacing={2}>
            <HStack spacing={1} color="green.400" fontSize="xs">
              <Icon as={UserIcon} boxSize={3} />
              <Text>{user}</Text>
              <Text>@</Text>
              <Icon as={FolderIcon} boxSize={3} />
              <Text>{currentDirectory.split('/').pop() || 'root'}</Text>
            </HStack>
            
            <Text color="green.400">$</Text>
            
            <Input
              ref={inputRef}
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter command..."
              size="sm"
              bg="transparent"
              border="none"
              color="green.400"
              _focus={{ boxShadow: 'none' }}
              _placeholder={{ color: 'green.600' }}
              flex={1}
            />
            
            <Tooltip label="Execute Command">
              <IconButton
                size="sm"
                icon={<PlayIcon />}
                type="submit"
                aria-label="Execute command"
                variant="ghost"
                color="green.400"
                _hover={{ bg: 'green.900' }}
                isDisabled={!currentCommand.trim() || isExecuting}
              />
            </Tooltip>
          </HStack>
        </form>
      </Box>
    </Box>
  );
};
