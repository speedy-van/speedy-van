import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: false,
	},
	// Performance optimizations
	compiler: {
		// Remove console logs in production
		removeConsole: process.env.NODE_ENV === 'production',
	},
	// Enable experimental features for better performance
	experimental: {
		optimizeCss: true,
		optimizePackageImports: ['@chakra-ui/react', '@chakra-ui/icons', 'react-icons'],
	},
	// Rewrite rules for production
	async rewrites() {
		return [
			// Map numeric-leading file names at web root to /uploads/
			{
				source: '/:file((?:\\d|\\-)+-.+\\.(?:png|jpe?g|webp|gif))',
				destination: '/uploads/:file'
			},
			// Map driver application uploads
			{
				source: '/uploads/driver-applications/:file',
				destination: '/api/uploads/driver-applications/:file'
			}
		];
	},
	// Webpack configuration with performance optimizations
	webpack: (config, { isServer, dev }) => {
		config.resolve.alias = {
			...(config.resolve.alias || {}),
			'@': path.resolve(process.cwd(), 'src'),
		};
		
		// Exclude test files from production build
		if (!dev) {
			// Exclude test files and test utilities from production build
			config.resolve.alias['@/lib/test-utils'] = false;
			config.resolve.alias['@/lib/__tests__'] = false;
		}
		
		// Performance optimizations (client-side only)
		if (!isServer) {
			config.optimization = {
				...config.optimization,
				splitChunks: {
					chunks: 'all',
					cacheGroups: {
						vendor: {
							test: /[\\/]node_modules[\\/]/,
							name: 'vendors',
							chunks: 'all',
						},
						chakra: {
							test: /[\\/]node_modules[\\/]@chakra-ui[\\/]/,
							name: 'chakra',
							chunks: 'all',
							priority: 10,
						},
						react: {
							test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
							name: 'react',
							chunks: 'all',
							priority: 20,
						},
					},
				},
			};
		}
		
		return config;
	},
};

export default nextConfig;

