import { readFile, access } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, "..", "apps", "web", "public", "logo");

const required = [
  "speedy-van-logo-dark.svg",
  "speedy-van-logo-light.svg", 
  "speedy-van-wordmark.svg",
  "speedy-van-icon.svg",
  "speedy-van-icon-min.svg",
  "logo-manifest.json",
  "README.md"
];

async function checkFile(file) {
  try {
    await access(join(root, file));
    return true;
  } catch {
    return false;
  }
}

async function validateManifest() {
  try {
    const manifestPath = join(root, "logo-manifest.json");
    const manifestContent = await readFile(manifestPath, "utf8");
    const manifest = JSON.parse(manifestContent);
    
    // Validate required fields
    const requiredFields = ["brand", "variants", "dimensions", "minSizes", "palette"];
    for (const field of requiredFields) {
      if (!manifest[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Validate variant files exist
    const variantFiles = [
      manifest.variants.logo.dark,
      manifest.variants.logo.light,
      manifest.variants.wordmark,
      manifest.variants.icon.default,
      manifest.variants.icon.min
    ];
    
    for (const file of variantFiles) {
      if (!(await checkFile(file))) {
        throw new Error(`Variant file missing: ${file}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Manifest validation failed:", error.message);
    return false;
  }
}

async function validateSVG(file) {
  try {
    const content = await readFile(join(root, file), "utf8");
    
    // Check for required accessibility attributes
    const hasTitle = content.includes("<title");
    const hasDesc = content.includes("<desc");
    const hasRole = content.includes('role="img"');
    const hasViewBox = content.includes('viewBox');
    
    if (!hasTitle || !hasDesc || !hasRole || !hasViewBox) {
      console.warn(`⚠️  ${file}: Missing accessibility attributes`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ ${file}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🔍 Verifying brand assets...");
  
  // Check all required files exist
  const fileChecks = await Promise.all(required.map(async file => {
    const exists = await checkFile(file);
    if (!exists) {
      console.error(`❌ Missing: ${file}`);
    } else {
      console.log(`✅ Found: ${file}`);
    }
    return { file, exists };
  }));
  
  const missingFiles = fileChecks.filter(check => !check.exists);
  
  // Validate manifest
  const manifestValid = await validateManifest();
  
  // Validate SVG accessibility
  const svgFiles = required.filter(file => file.endsWith(".svg"));
  const svgValidations = await Promise.all(svgFiles.map(validateSVG));
  const allSvgsValid = svgValidations.every(valid => valid);
  
  // Summary
  console.log("\n📊 Summary:");
  console.log(`Files: ${fileChecks.filter(c => c.exists).length}/${required.length}`);
  console.log(`Manifest: ${manifestValid ? "✅ Valid" : "❌ Invalid"}`);
  console.log(`SVG Accessibility: ${allSvgsValid ? "✅ Valid" : "⚠️  Issues found"}`);
  
  if (missingFiles.length > 0 || !manifestValid || !allSvgsValid) {
    console.error("\n❌ Brand assets verification failed");
    process.exit(1);
  }
  
  console.log("\n✅ All brand assets verified successfully");
}

main().catch(error => {
  console.error("Verification script failed:", error);
  process.exit(1);
});
