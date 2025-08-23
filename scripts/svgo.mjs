#!/usr/bin/env node

import { execSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const LOGO_DIR = 'apps/web/public/logo';

function optimizeSVGs() {
  try {
    console.log('🔧 Starting SVG optimization...');
    
    // Check if svgo is installed
    try {
      execSync('svgo --version', { stdio: 'pipe' });
    } catch (error) {
      console.log('📦 Installing svgo...');
      execSync('pnpm add -g svgo', { stdio: 'inherit' });
    }
    
    // Get all SVG files in the logo directory
    const svgFiles = [];
    
    function scanDirectory(dir) {
      try {
        const items = readdirSync(dir);
        for (const item of items) {
          const fullPath = join(dir, item);
          const stat = statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanDirectory(fullPath);
          } else if (item.endsWith('.svg')) {
            svgFiles.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`⚠️  Warning: Could not scan directory ${dir}:`, error.message);
      }
    }
    
    scanDirectory(LOGO_DIR);
    
    if (svgFiles.length === 0) {
      console.log('ℹ️  No SVG files found in logo directory');
      return;
    }
    
    console.log(`📁 Found ${svgFiles.length} SVG files to optimize`);
    
    // Optimize each SVG file
    for (const svgFile of svgFiles) {
      try {
        console.log(`🔧 Optimizing: ${svgFile}`);
        execSync(`svgo "${svgFile}" --multipass`, { stdio: 'inherit' });
        console.log(`✅ Optimized: ${svgFile}`);
      } catch (error) {
        console.error(`❌ Failed to optimize ${svgFile}:`, error.message);
      }
    }
    
    console.log('🎉 SVG optimization completed!');
    
  } catch (error) {
    console.error('❌ SVG optimization failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeSVGs();
}
