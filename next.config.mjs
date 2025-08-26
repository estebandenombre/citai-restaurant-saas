/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
  // Suppress console warnings in production
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Suppress static optimization warnings
  trailingSlash: false,
  // Suppress image optimization warnings
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

export default nextConfig
