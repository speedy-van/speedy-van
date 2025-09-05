'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  useToast,
  Badge,
  IconButton,
  Tooltip,
  Select,
  FormControl,
  FormLabel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Textarea,
  Alert,
  AlertIcon,
  Code,
  Divider,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import {
  PlayIcon,
  StopIcon,
  TrashIcon,
  Cog6ToothIcon,
  CommandLineIcon,
  FolderIcon,
  DocumentIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClipboardIcon,
} from '@heroicons/react/24/outline';

interface AdvancedTerminalProps {
  environment?: any;
  onCommandExecute?: (command: string, output: string) => void;
  className?: string;
}

interface TerminalCommand {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
  status: 'running' | 'completed' | 'error';
  environment: string;
  workingDirectory: string;
}

interface CommandHistory {
  commands: string[];
  currentIndex: number;
}

export default function AdvancedTerminal({ 
  environment, 
  onCommandExecute,
  className 
}: AdvancedTerminalProps) {
  // State management
  const [commands, setCommands] = useState<TerminalCommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [workingDirectory, setWorkingDirectory] = useState('/projects/speedy-van');
  const [commandHistory, setCommandHistory] = useState<CommandHistory>({
    commands: [],
    currentIndex: -1
  });
  const [terminalSettings, setTerminalSettings] = useState({
    fontSize: 14,
    theme: 'dark',
    autoScroll: true,
    showTimestamps: true,
    maxHistory: 1000,
  });

  // Refs
  const terminalRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Hooks
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Initialize with sample commands
  useEffect(() => {
    const sampleCommands: TerminalCommand[] = [
      {
        id: '1',
        command: 'pwd',
        output: workingDirectory,
        timestamp: new Date(),
        status: 'completed',
        environment: environment?.name || 'default',
        workingDirectory,
      },
      {
        id: '2',
        command: 'ls -la',
        output: `total 48\ndrwxr-xr-x  8 user  staff  256 Jan 15 10:30 .\ndrwxr-xr-x  3 user  staff   96 Jan 15 10:30 ..\ndrwxr-xr-x  8 user  staff  256 Jan 15 10:30 .git\ndrwxr-xr-x  8 user  staff  256 Jan 15 10:30 .next\ndrwxr-xr-x  8 user  staff  256 Jan 15 10:30 node_modules\ndrwxr-xr-x  8 user  staff  256 Jan 15 10:30 public\ndrwxr-xr-x  8 user  staff  256 Jan 15 10:30 src\n-rw-r--r--  1 user  staff  1024 Jan 15 10:30 package.json\n-rw-r--r--  1 user  staff   256 Jan 15 10:30 README.md\n-rw-r--r--  1 user  staff   128 Jan 15 10:30 .env.local`,
        timestamp: new Date(),
        status: 'completed',
        environment: environment?.name || 'default',
        workingDirectory,
      },
    ];

    setCommands(sampleCommands);
  }, [environment, workingDirectory]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current && terminalSettings.autoScroll) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands, terminalSettings.autoScroll]);

  // Focus command input
  useEffect(() => {
    if (commandInputRef.current && isActive) {
      commandInputRef.current.focus();
    }
  }, [isActive]);

  // Command execution
  const executeCommand = useCallback(async (command: string) => {
    if (!command.trim() || !isActive) return;

    const newCommand: TerminalCommand = {
      id: Date.now().toString(),
      command,
      output: '',
      timestamp: new Date(),
      status: 'running',
      environment: environment?.name || 'default',
      workingDirectory,
    };

    setCommands(prev => [...prev, newCommand]);
    setCurrentCommand('');

    // Add to command history
    setCommandHistory(prev => ({
      commands: [...prev.commands, command].slice(-terminalSettings.maxHistory),
      currentIndex: -1
    }));

    // Simulate command execution with realistic output
    setTimeout(() => {
      let output = '';
      let status: 'completed' | 'error' = 'completed';

      try {
        if (command === 'pwd') {
          output = workingDirectory;
        } else if (command === 'ls' || command === 'ls -la') {
          output = `total 48\ndrwxr-xr-x  8 user  staff  256 Jan 15 10:30 .\ndrwxr-xr-x  3 user  staff   96 Jan 15 10:30 ..\ndrwxr-xr-x  8 user  staff  256 Jan 15 10:30 .git\ndrwxr-xr-x  8 user  staff  256 Jan 15 10:30 .next\ndrwxr-xr-x  8 user  staff  256 Jan 15 10:30 node_modules\ndrwxr-xr-x  8 user  staff  256 Jan 15 10:30 public\ndrwxr-xr-x  8 user  staff  256 Jan 15 10:30 src\n-rw-r--r--  1 user  staff  1024 Jan 15 10:30 package.json\n-rw-r--r--  1 user  staff   256 Jan 15 10:30 README.md\n-rw-r--r--  1 user  staff   128 Jan 15 10:30 .env.local`;
        } else if (command.startsWith('cd ')) {
          const newPath = command.substring(3).trim();
          if (newPath === '..') {
            const pathParts = workingDirectory.split('/').slice(0, -1);
            setWorkingDirectory(pathParts.length > 1 ? pathParts.join('/') : '/');
            output = `Changed directory to: ${pathParts.length > 1 ? pathParts.join('/') : '/'}`;
          } else if (newPath === '~' || newPath === '') {
            setWorkingDirectory('/home/user');
            output = 'Changed directory to: /home/user';
          } else if (newPath.startsWith('/')) {
            setWorkingDirectory(newPath);
            output = `Changed directory to: ${newPath}`;
          } else {
            const newWorkingDir = `${workingDirectory}/${newPath}`;
            setWorkingDirectory(newWorkingDir);
            output = `Changed directory to: ${newWorkingDir}`;
          }
        } else if (command.startsWith('npm install')) {
          output = `npm WARN deprecated uuid@3.4.0: Please upgrade  to version 7 or higher\nnpm WARN deprecated request@2.88.2: request has been deprecated\nadded 1234 packages in 45.2s\n\n1234 packages are looking for funding\n  run \`npm fund\` for details\n\nfound 0 vulnerabilities`;
        } else if (command.startsWith('npm run')) {
          if (command.includes('dev')) {
            output = `> speedy-van@0.1.0 dev\n> next dev\n\nready - started server on 0.0.0.0:3000, url: http://localhost:3000\n✓ ready in 2.3s\n✓ compiling in 0.8s\n✓ compiled successfully`;
          } else if (command.includes('build')) {
            output = `> speedy-van@0.1.0 build\n> next build\n\n✓ Creating an optimized production build\n✓ Compiled successfully\n✓ Collecting page data\n✓ Generating static pages (0/0)\n✓ Finalizing page optimization\n\nRoute (app)                                Size     First Load JS\n┌ ○ /                                       5.2 kB         89 kB\n└ ○ /virtual-env                            4.8 kB         88 kB\n+ First Load JS shared by all               82 kB\n  ├ chunks/0-0.js                           82 kB\n  └ chunks/main.js                          82 kB\n\n✓ Built successfully`;
          } else {
            output = `> speedy-van@0.1.0 ${command.substring(8)}\n> next ${command.substring(8)}\n\nCommand executed successfully`;
          }
        } else if (command.startsWith('git')) {
          if (command.includes('status')) {
            output = `On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)\n        modified:   src/components/VirtualEnvironment/VirtualEnvironment.tsx\n\nno changes added to commit (use "git add" and/or "git commit -a")`;
          } else if (command.includes('add')) {
            output = 'Changes staged for commit';
          } else if (command.includes('commit')) {
            output = `[main abc1234] Update virtual environment component\n 1 file changed, 45 insertions(+), 12 deletions(-)`;
          } else if (command.includes('push')) {
            output = `Enumerating objects: 5, done.\nCounting objects: 100% (5/5), done.\nDelta compression using up to 8 threads\nCompressing objects: 100% (3/3), done.\nWriting objects: 100% (3/3), 456 bytes | 456.00 KiB/s, done.\nTotal 3 (delta 2), reused 0 (delta 0), pack-reused 0\nTo https://github.com/speedy-van/web.git\n   def5678..abc1234  main -> main`;
          } else {
            output = 'Git command executed successfully';
          }
        } else if (command.startsWith('python') || command.startsWith('node')) {
          output = 'Command executed successfully';
        } else if (command === 'clear') {
          setCommands([]);
          return;
        } else if (command === 'help') {
          output = `Available commands:
  pwd                    - Print working directory
  ls [options]          - List directory contents
  cd <directory>        - Change directory
  npm <command>         - Node.js package manager
  git <command>         - Git version control
  python <script>       - Run Python script
  node <script>         - Run Node.js script
  clear                 - Clear terminal
  help                  - Show this help
  history               - Show command history
  echo <text>           - Print text
  cat <file>            - Display file contents
  mkdir <directory>     - Create directory
  rm <file>             - Remove file
  cp <source> <dest>    - Copy file
  mv <source> <dest>    - Move/rename file`;
        } else if (command.startsWith('echo ')) {
          output = command.substring(5);
        } else if (command.startsWith('cat ')) {
          const filename = command.substring(4).trim();
          if (filename === 'package.json') {
            output = `{\n  "name": "speedy-van",\n  "version": "0.1.0",\n  "private": true,\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "start": "next start",\n    "lint": "next lint"\n  },\n  "dependencies": {\n    "next": "14.0.0",\n    "react": "18.2.0",\n    "react-dom": "18.2.0"\n  }\n}`;
          } else if (filename === 'README.md') {
            output = `# Speedy Van\n\nProfessional man and van moving services across the UK.\n\n## Getting Started\n\nRun the development server:\n\n\`\`\`bash\nnpm run dev\n\`\`\`\n\nOpen [http://localhost:3000](http://localhost:3000) with your browser.`;
          } else {
            output = `cat: ${filename}: No such file or directory`;
            status = 'error';
          }
        } else if (command.startsWith('mkdir ')) {
          const dirname = command.substring(6).trim();
          output = `Created directory: ${dirname}`;
        } else if (command.startsWith('rm ')) {
          const filename = command.substring(3).trim();
          output = `Removed file: ${filename}`;
        } else if (command === 'history') {
          output = commandHistory.commands.map((cmd, index) => `${index + 1}  ${cmd}`).join('\n');
        } else {
          output = `Command '${command}' not found. Type 'help' for available commands.`;
          status = 'error';
        }
      } catch (error) {
        output = `Error executing command: ${error}`;
        status = 'error';
      }

      setCommands(prev =>
        prev.map(cmd =>
          cmd.id === newCommand.id
            ? { ...cmd, output, status, workingDirectory }
            : cmd
        )
      );

      // Notify parent component
      if (onCommandExecute) {
        onCommandExecute(command, output);
      }

      // Show toast for errors
      if (status === 'error') {
        toast({
          title: 'خطأ في تنفيذ الأمر',
          description: `فشل في تنفيذ: ${command}`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }, 500);
  }, [isActive, workingDirectory, environment, commandHistory, terminalSettings.maxHistory, onCommandExecute, toast]);

  // Handle command submission
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(currentCommand);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.currentIndex < commandHistory.commands.length - 1) {
        const newIndex = commandHistory.currentIndex + 1;
        setCommandHistory(prev => ({ ...prev, currentIndex: newIndex }));
        setCurrentCommand(commandHistory.commands[commandHistory.commands.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistory.currentIndex > 0) {
        const newIndex = commandHistory.currentIndex - 1;
        setCommandHistory(prev => ({ ...prev, currentIndex: newIndex }));
        setCurrentCommand(commandHistory.commands[commandHistory.commands.length - 1 - newIndex]);
      } else if (commandHistory.currentIndex === 0) {
        setCommandHistory(prev => ({ ...prev, currentIndex: -1 }));
        setCurrentCommand('');
      }
    }
  };

  // Clear terminal
  const clearTerminal = () => {
    setCommands([]);
    toast({
      title: 'تم مسح التيرمينال',
      description: 'تم مسح جميع الأوامر السابقة',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  // Copy command output
  const copyOutput = (output: string) => {
    navigator.clipboard.writeText(output);
    toast({
      title: 'تم النسخ',
      description: 'تم نسخ النتيجة إلى الحافظة',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'yellow';
      case 'completed': return 'green';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  // Get status text in Arabic
  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'قيد التشغيل';
      case 'completed': return 'مكتمل';
      case 'error': return 'خطأ';
      default: return 'غير معروف';
    }
  };

  return (
    <Box className={className} h="full" bg="gray.900" borderRadius="md" overflow="hidden">
      {/* Terminal Header */}
      <Flex
        bg="gray.800"
        p={3}
        align="center"
        borderBottom="1px"
        borderColor="gray.700"
      >
        <HStack spacing={3}>
          <CommandLineIcon className="h-5 w-5 text-green-400" />
          <Text color="green.400" fontWeight="bold" fontSize="sm">
            Terminal - {environment?.name || 'Default'}
          </Text>
          <Badge colorScheme={isActive ? 'green' : 'gray'} size="sm">
            {isActive ? 'نشط' : 'متوقف'}
          </Badge>
        </HStack>
        
        <Spacer />
        
        <HStack spacing={2}>
          <Text fontSize="xs" color="gray.400" fontFamily="mono">
            {workingDirectory}
          </Text>
          <IconButton
            size="sm"
            aria-label="Terminal settings"
            icon={<Cog6ToothIcon className="h-4 w-4" />}
            onClick={onOpen}
            variant="ghost"
            colorScheme="gray"
          />
          <IconButton
            size="sm"
            aria-label="Clear terminal"
            icon={<TrashIcon className="h-4 w-4" />}
            onClick={clearTerminal}
            variant="ghost"
            colorScheme="red"
          />
        </HStack>
      </Flex>

      {/* Terminal Output */}
      <Box
        ref={terminalRef}
        flex="1"
        h="calc(100% - 120px)"
        p={4}
        overflowY="auto"
        fontFamily="mono"
        fontSize={`${terminalSettings.fontSize}px`}
      >
        {commands.map((cmd) => (
          <Box key={cmd.id} mb={4}>
            {/* Command Input */}
            <HStack spacing={2} mb={2} align="flex-start">
              <Text color="green.400" fontFamily="mono" fontSize="sm">
                {workingDirectory} $
              </Text>
              <Text color="white" fontFamily="mono" fontSize="sm">
                {cmd.command}
              </Text>
              <Badge
                size="xs"
                colorScheme={getStatusColor(cmd.status)}
                ml="auto"
              >
                {getStatusText(cmd.status)}
              </Badge>
            </HStack>

            {/* Command Output */}
            {cmd.output && (
              <Box ml={6} mb={2}>
                <HStack justify="space-between" mb={1}>
                  <Text color="gray.400" fontSize="xs">
                    Output:
                  </Text>
                  <IconButton
                    size="xs"
                    aria-label="Copy output"
                    icon={<ClipboardIcon className="h-3 w-3" />}
                    onClick={() => copyOutput(cmd.output)}
                    variant="ghost"
                    colorScheme="gray"
                  />
                </HStack>
                <Text
                  color="gray.300"
                  whiteSpace="pre-wrap"
                  fontFamily="mono"
                  fontSize="sm"
                  bg="gray.800"
                  p={2}
                  borderRadius="md"
                  border="1px"
                  borderColor="gray.700"
                >
                  {cmd.output}
                </Text>
              </Box>
            )}

            {/* Timestamp */}
            {terminalSettings.showTimestamps && (
              <Text color="gray.500" fontSize="xs" ml={6}>
                {cmd.timestamp.toLocaleTimeString('ar-SA')}
              </Text>
            )}

            <Divider borderColor="gray.700" mt={3} />
          </Box>
        ))}

        {/* Current Working Directory Display */}
        <HStack spacing={2} color="gray.400" fontSize="sm">
          <Text fontFamily="mono">{workingDirectory}</Text>
          <Text>$</Text>
        </HStack>
      </Box>

      {/* Command Input */}
      <Box p={4} borderTop="1px" borderColor="gray.700">
        <form onSubmit={handleCommandSubmit}>
          <HStack spacing={3}>
            <Text color="green.400" fontFamily="mono" fontSize="sm">
              {workingDirectory} $
            </Text>
            <Input
              ref={commandInputRef}
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="أدخل الأمر هنا..."
              bg="gray.800"
              borderColor="gray.600"
              color="white"
              fontFamily="mono"
              fontSize="sm"
              _placeholder={{ color: 'gray.400' }}
              _focus={{ borderColor: 'green.400' }}
              disabled={!isActive}
              flex="1"
            />
            <Button
              type="submit"
              colorScheme="green"
              size="sm"
              disabled={!isActive || !currentCommand.trim()}
            >
              تنفيذ
            </Button>
          </HStack>
        </form>
        
        {/* Command History Navigation */}
        <HStack spacing={2} mt={2} justify="center">
          <Text fontSize="xs" color="gray.500">
            استخدم ↑↓ للتنقل في الأوامر السابقة
          </Text>
        </HStack>
      </Box>

      {/* Terminal Settings Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>إعدادات التيرمينال</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>حجم الخط</FormLabel>
                <Select
                  value={terminalSettings.fontSize}
                  onChange={(e) => setTerminalSettings(prev => ({
                    ...prev,
                    fontSize: parseInt(e.target.value)
                  }))}
                >
                  <option value={12}>12px</option>
                  <option value={14}>14px</option>
                  <option value={16}>16px</option>
                  <option value={18}>18px</option>
                  <option value={20}>20px</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>المظهر</FormLabel>
                <Select
                  value={terminalSettings.theme}
                  onChange={(e) => setTerminalSettings(prev => ({
                    ...prev,
                    theme: e.target.value as 'dark' | 'light'
                  }))}
                >
                  <option value="dark">داكن</option>
                  <option value="light">فاتح</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>الحد الأقصى للأوامر</FormLabel>
                <Select
                  value={terminalSettings.maxHistory}
                  onChange={(e) => setTerminalSettings(prev => ({
                    ...prev,
                    maxHistory: parseInt(e.target.value)
                  }))}
                >
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                  <option value={5000}>5000</option>
                </Select>
              </FormControl>

              <Alert status="info">
                <AlertIcon />
                سيتم تطبيق التغييرات فوراً
              </Alert>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
