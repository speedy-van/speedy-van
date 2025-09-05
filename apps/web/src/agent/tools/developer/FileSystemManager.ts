import { FileNode, ProjectStructure, DeveloperAction } from '../../types';
import { Logger } from '../../../lib/logging/agent';
// Note: These imports are for server-side use only
// In Next.js, they should only be used in API routes or server components
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * File System Manager - Handles file system operations for developer assistant
 * Provides project structure analysis, file operations, and file system utilities
 */
export class FileSystemManager {
  private logger: Logger;
  private projectRoot: string;
  private isInitialized: boolean = false;
  private ignoredPatterns: string[] = [
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    'coverage',
    '.env*',
    '*.log'
  ];

  constructor() {
    this.logger = new Logger();
    this.projectRoot = process.cwd();
  }

  /**
   * Initialize the file system manager
   */
  public async initialize(context?: any): Promise<void> {
    try {
      this.logger.info('Initializing File System Manager', { projectRoot: this.projectRoot });
      
      // Validate project root exists
      await this.validateProjectRoot();
      
      // Set project root from context if provided
      if (context?.projectPath) {
        this.projectRoot = context.projectPath;
        await this.validateProjectRoot();
      }
      
      this.isInitialized = true;
      this.logger.info('File System Manager initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize File System Manager', { error });
      throw error;
    }
  }

  /**
   * Get complete project structure
   */
  public async getProjectStructure(): Promise<ProjectStructure> {
    try {
      if (!this.isInitialized) {
        throw new Error('File System Manager not initialized');
      }

      this.logger.info('Building project structure', { projectRoot: this.projectRoot });
      
      const root = await this.buildFileTree(this.projectRoot);
      const stats = await this.calculateProjectStats(root);
      
      const structure: ProjectStructure = {
        root,
        totalFiles: stats.totalFiles,
        totalDirectories: stats.totalDirectories,
        languages: stats.languages,
        lastModified: stats.lastModified
      };

      this.logger.info('Project structure built successfully', { 
        totalFiles: stats.totalFiles,
        totalDirectories: stats.totalDirectories
      });

      return structure;
    } catch (error) {
      this.logger.error('Failed to get project structure', { error });
      throw error;
    }
  }

  /**
   * Handle file operations based on intent
   */
  public async handleOperation(intent: any, context: any): Promise<DeveloperAction[]> {
    try {
      const actions: DeveloperAction[] = [];
      
      switch (intent.details.action) {
        case 'file_op':
          if (context?.filePath) {
            const fileInfo = await this.getFileInfo(context.filePath);
            actions.push({
              type: 'info',
              label: 'File Information',
              description: `Information about ${path.basename(context.filePath)}`,
              data: fileInfo,
              executable: false
            });
          }
          break;
          
        default:
          // Provide general file system information
          const structure = await this.getProjectStructure();
          actions.push({
            type: 'info',
            label: 'Project Structure',
            description: 'Current project file structure',
            data: structure,
            executable: false
          });
      }
      
      return actions;
    } catch (error) {
      this.logger.error('File operation handling failed', { error, intent });
      throw error;
    }
  }

  /**
   * Get file information
   */
  public async getFileInfo(filePath: string): Promise<{
    name: string;
    path: string;
    type: 'file' | 'directory';
    size: number;
    modified: Date;
    language?: string;
    lines?: number;
  }> {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.projectRoot, filePath);
      const stats = await fs.stat(fullPath);
      
      const fileInfo = {
        name: path.basename(fullPath),
        path: filePath,
        type: stats.isDirectory() ? 'directory' as const : 'file' as const,
        size: stats.size,
        modified: stats.mtime,
        language: this.detectLanguage(fullPath),
        lines: stats.isFile() ? await this.countLines(fullPath) : undefined
      };

      this.logger.info('File info retrieved', { filePath, fileInfo });
      return fileInfo;
    } catch (error) {
      this.logger.error('Failed to get file info', { error, filePath });
      throw error;
    }
  }

  /**
   * Read file content
   */
  public async readFile(filePath: string): Promise<string> {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.projectRoot, filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      
      this.logger.info('File read successfully', { filePath, contentLength: content.length });
      return content;
    } catch (error) {
      this.logger.error('Failed to read file', { error, filePath });
      throw error;
    }
  }

  /**
   * Write file content
   */
  public async writeFile(filePath: string, content: string): Promise<void> {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.projectRoot, filePath);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      
      await fs.writeFile(fullPath, content, 'utf-8');
      
      this.logger.info('File written successfully', { filePath, contentLength: content.length });
    } catch (error) {
      this.logger.error('Failed to write file', { error, filePath });
      throw error;
    }
  }

  /**
   * Create new file
   */
  public async createFile(filePath: string, content: string = ''): Promise<void> {
    try {
      await this.writeFile(filePath, content);
      
      this.logger.info('File created successfully', { filePath });
    } catch (error) {
      this.logger.error('Failed to create file', { error, filePath });
      throw error;
    }
  }

  /**
   * Delete file
   */
  public async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.projectRoot, filePath);
      await fs.unlink(fullPath);
      
      this.logger.info('File deleted successfully', { filePath });
    } catch (error) {
      this.logger.error('Failed to delete file', { error, filePath });
      throw error;
    }
  }

  /**
   * Health check for file system manager
   */
  public async healthCheck(): Promise<boolean> {
    try {
      // Check if project root is accessible
      await fs.access(this.projectRoot);
      
      // Check if we can read basic project files
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      await fs.access(packageJsonPath);
      
      return true;
    } catch (error) {
      this.logger.error('File System Manager health check failed', { error });
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    try {
      this.isInitialized = false;
      this.logger.info('File System Manager cleanup completed');
    } catch (error) {
      this.logger.error('File System Manager cleanup failed', { error });
    }
  }

  /**
   * Build file tree recursively
   */
  private async buildFileTree(dirPath: string, relativePath: string = ''): Promise<FileNode> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const children: FileNode[] = [];
      
      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);
        const entryRelativePath = path.join(relativePath, entry.name);
        
        // Skip ignored patterns
        if (this.shouldIgnore(entryRelativePath)) {
          continue;
        }
        
        if (entry.isDirectory()) {
          const childNode = await this.buildFileTree(entryPath, entryRelativePath);
          children.push(childNode);
        } else {
          const stats = await fs.stat(entryPath);
          children.push({
            name: entry.name,
            path: entryRelativePath,
            type: 'file',
            size: stats.size,
            modified: stats.mtime
          });
        }
      }
      
      const stats = await fs.stat(dirPath);
      return {
        name: path.basename(dirPath),
        path: relativePath || '.',
        type: 'directory',
        modified: stats.mtime,
        children: children.sort((a, b) => {
          // Directories first, then files
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        })
      };
    } catch (error) {
      this.logger.error('Failed to build file tree', { error, dirPath });
      throw error;
    }
  }

  /**
   * Calculate project statistics
   */
  private async calculateProjectStats(root: FileNode): Promise<{
    totalFiles: number;
    totalDirectories: number;
    languages: string[];
    lastModified: Date;
  }> {
    const stats = {
      totalFiles: 0,
      totalDirectories: 0,
      languages: new Set<string>(),
      lastModified: new Date(0)
    };

    const processNode = (node: FileNode) => {
      if (node.type === 'file') {
        stats.totalFiles++;
        if (node.modified && node.modified > stats.lastModified) {
          stats.lastModified = node.modified;
        }
        
        const language = this.detectLanguage(node.path);
        if (language) {
          stats.languages.add(language);
        }
      } else {
        stats.totalDirectories++;
        if (node.children) {
          node.children.forEach(processNode);
        }
      }
    };

    processNode(root);

    return {
      totalFiles: stats.totalFiles,
      totalDirectories: stats.totalDirectories,
      languages: Array.from(stats.languages).sort(),
      lastModified: stats.lastModified
    };
  }

  /**
   * Detect programming language from file extension
   */
  private detectLanguage(filePath: string): string | undefined {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap: Record<string, string> = {
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript React',
      '.js': 'JavaScript',
      '.jsx': 'JavaScript React',
      '.tsx': 'TypeScript React',
      '.json': 'JSON',
      '.css': 'CSS',
      '.scss': 'SCSS',
      '.html': 'HTML',
      '.md': 'Markdown',
      '.sql': 'SQL',
      '.prisma': 'Prisma',
      '.yaml': 'YAML',
      '.yml': 'YAML',
      '.env': 'Environment Variables'
    };
    
    return languageMap[ext];
  }

  /**
   * Count lines in a file
   */
  private async countLines(filePath: string): Promise<number> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content.split('\n').length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check if path should be ignored
   */
  private shouldIgnore(relativePath: string): boolean {
    return this.ignoredPatterns.some(pattern => 
      relativePath.includes(pattern) || 
      relativePath.startsWith(pattern) ||
      relativePath.endsWith(pattern)
    );
  }

  /**
   * Validate project root
   */
  private async validateProjectRoot(): Promise<void> {
    try {
      const stats = await fs.stat(this.projectRoot);
      if (!stats.isDirectory()) {
        throw new Error(`Project root is not a directory: ${this.projectRoot}`);
      }
      
      // Check for package.json to confirm it's a Node.js project
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      await fs.access(packageJsonPath);
      
      this.logger.info('Project root validated', { projectRoot: this.projectRoot });
    } catch (error) {
      throw new Error(`Invalid project root: ${this.projectRoot} - ${error.message}`);
    }
  }
}
