/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  transpilePackages: ['@speedy-van/shared', '@speedy-van/utils', '@speedy-van/pricing'],
  
  // Disable output file tracing on Windows to avoid file system issues
  ...(process.platform === 'win32' && {
    experimental: {
      outputFileTracingRoot: undefined,
    },
    // Disable build optimization to avoid file locking
    swcMinify: false,
    compress: false,
  }),
  
  // For non-Windows systems, use normal optimization
  ...(process.platform !== 'win32' && {
    experimental: {
      outputFileTracingExcludes: {
        '*': [
          'node_modules/@swc/core-*',
          'node_modules/@next/swc-*',
          'node_modules/@next/cache-*',
          'node_modules/.cache',
          'node_modules/.pnpm',
        ],
      },
    },
  }),
};

export default nextConfig;