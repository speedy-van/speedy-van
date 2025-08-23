import fs from "node:fs/promises";
import path from "node:path";

// Simple glob alternative using fs
async function findFiles(dir, pattern) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.includes('api') && !entry.name.includes('.next') && !entry.name.includes('node_modules')) {
        files.push(...await findFiles(fullPath, pattern));
      }
    } else if (entry.name.match(pattern)) {
      files.push(fullPath);
    }
  }
  return files;
}

// Determine if running from root or apps/web  
const cwd = process.cwd();
// Check if we're in apps/web (either at the end or as part of the path)
const isInWebDir = cwd.includes('apps/web') || cwd.includes('apps\\web');
const basePath = isInWebDir ? './src/app' : 'apps/web/src/app';

let files = [];
try {
  const publicDir = `${basePath}/(public)`;
  const pageFiles = await findFiles(publicDir, /page\.tsx$/);
  files.push(...pageFiles);
} catch (e) {
  // Public directory not found, skip
}

try {
  const ukDir = `${basePath}/uk`;
  const ukFiles = await findFiles(ukDir, /page\.tsx$/);
  files.push(...ukFiles);
} catch (e) {
  // UK directory not found, skip
}

try {
  const layoutFiles = await findFiles(basePath, /layout\.tsx$/);
  files.push(...layoutFiles);
} catch (e) {
  // Layout files not found, skip
}

files = files.filter(f => 
  !f.includes('/api/') && !f.includes('opengraph-image')
);

let bad = [];
for (const f of files) {
  const s = await fs.readFile(f, "utf8");
  if (/\bexport\s+const\s+runtime\s*=\s*["']edge["']/.test(s)) bad.push(f);
  if (/\bexport\s+const\s+dynamic\s*=\s*["']force-dynamic["']/.test(s)) bad.push(f);
}
if (bad.length) {
  console.error("❌ Disallowed runtime/dynamic flags in public pages/layouts:\n" + bad.map(x => " - " + x).join("\n"));
  process.exit(1);
} else {
  console.log("✅ Public pages/layouts are Node.js SSG/ISR-safe.");
}
