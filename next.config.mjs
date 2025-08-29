/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Temporarily disable optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  // Suppress experimental features warnings
  experimental: {
    // suppressHydrationWarning is no longer needed in Next.js 15
  },
  // Suppress missing dependencies warnings
  webpack: (config, { isServer }) => {
    // Suppress warnings about missing dependencies
    config.ignoreWarnings = [
      { module: /node_modules\/@next\/font/ },
      { module: /node_modules\/next\/dist\/compiled\/webpack/ },
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Can't resolve 'encoding'/,
    ];
    
    return config;
  },
}

export default nextConfig
