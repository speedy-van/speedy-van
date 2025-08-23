import { Metadata } from "next";
import LogoChakra from "@/components/brand/LogoChakra";
import Logo from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Logo System Test | Speedy Van",
  description: "Test page for Speedy Van brand logo system",
};

export default function LogoSystemTestPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Speedy Van Brand System</h1>
          <p className="text-gray-600">Professional logo system with automated dark/light mode switching</p>
        </div>

        <hr className="border-gray-300" />

        {/* Main Logo Variants */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Main Logo Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="font-bold">Auto Mode (Chakra)</p>
              <LogoChakra variant="logo" mode="auto" width={240} height={80} />
              <p className="text-sm text-gray-500">Switches based on color mode</p>
            </div>
            
            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="font-bold">Auto Mode (Standard)</p>
              <Logo variant="logo" mode="auto" width={240} height={80} />
              <p className="text-sm text-gray-500">Uses prefers-color-scheme</p>
            </div>
          </div>
        </div>

        {/* Dark/Light Mode Comparison */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Dark vs Light Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-gray-200 rounded-lg bg-gray-900">
              <p className="font-bold text-white">Dark Background</p>
              <LogoChakra variant="logo" mode="light" width={240} height={80} />
              <p className="text-sm text-gray-400">mode="light" on dark background</p>
            </div>
            
            <div className="p-6 border border-gray-200 rounded-lg bg-white">
              <p className="font-bold text-black">Light Background</p>
              <LogoChakra variant="logo" mode="dark" width={240} height={80} />
              <p className="text-sm text-gray-600">mode="dark" on light background</p>
            </div>
          </div>
        </div>

        {/* Icon Variants */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Icon Variants</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="font-bold text-sm">App Icon</p>
              <LogoChakra variant="icon" width={64} height={64} />
              <p className="text-xs text-gray-500">64×64px</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="font-bold text-sm">Minimal Icon</p>
              <LogoChakra variant="icon-min" width={48} height={48} />
              <p className="text-xs text-gray-500">48×48px</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="font-bold text-sm">Small Icon</p>
              <LogoChakra variant="icon-min" width={24} height={24} />
              <p className="text-xs text-gray-500">24×24px</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="font-bold text-sm">Tiny Icon</p>
              <LogoChakra variant="icon-min" width={16} height={16} />
              <p className="text-xs text-gray-500">16×16px</p>
            </div>
          </div>
        </div>

        {/* Wordmark */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Wordmark</h2>
          <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800">
            <LogoChakra variant="wordmark" width={300} />
            <p className="text-sm text-gray-500">Text-only logo with custom arrow-styled V</p>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Usage Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">✅ Do</h3>
              <p className="text-sm">• Use auto mode for responsive switching</p>
              <p className="text-sm">• Maintain 15% safe area around logos</p>
              <p className="text-sm">• Use appropriate variants for size</p>
              <p className="text-sm">• Ensure high contrast backgrounds</p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">❌ Don't</h3>
              <p className="text-sm">• Stretch or distort logos</p>
              <p className="text-sm">• Recolor gradients or effects</p>
              <p className="text-sm">• Use on low-contrast images</p>
              <p className="text-sm">• Add extra glow or effects</p>
            </div>
          </div>
        </div>

        {/* Technical Info */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Technical Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">File Structure</h3>
              <p className="text-sm">• 5 SVG variants</p>
              <p className="text-sm">• Machine-readable manifest</p>
              <p className="text-sm">• Automated optimization</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Accessibility</h3>
              <p className="text-sm">• Title and description tags</p>
              <p className="text-sm">• Proper ARIA labels</p>
              <p className="text-sm">• Screen reader compatible</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Performance</h3>
              <p className="text-sm">• SVGO optimized</p>
              <p className="text-sm">• Vector format (scalable)</p>
              <p className="text-sm">• Minimal file sizes</p>
            </div>
          </div>
        </div>

        <hr className="border-gray-300" />

        {/* Implementation Examples */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Implementation Examples</h2>
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="font-bold">React Component Usage:</p>
            <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded-md overflow-x-auto">
{`// Auto dark/light switching
<LogoChakra variant="logo" mode="auto" width={240} height={80} />

// Specific variants
<LogoChakra variant="wordmark" width={200} />
<LogoChakra variant="icon" width={64} height={64} />
<LogoChakra variant="icon-min" width={24} height={24} />

// Force specific mode
<LogoChakra variant="logo" mode="dark" width={240} height={80} />`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
