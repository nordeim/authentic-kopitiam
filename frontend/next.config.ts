import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Experimental features for Next.js 15
  experimental: {
    typedRoutes: true,
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['localhost:8000']
      },
      optimizePackageImports: ['lucide-react']
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'morningbrew.sg',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080],
    imageSizes: [16, 32, 48],
    unoptimized: true,
    dangerouslyAllowSVG: true,
    minimumCacheTTL: 60
  },
  
  // Environment variables exposed to client
  env: {
    NEXT_PUBLIC_APP_NAME: 'Morning Brew Collective',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/:path*(\\?.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
