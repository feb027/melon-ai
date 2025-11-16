import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  // Turbopack configuration (empty to silence warning)
  turbopack: {},
  
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

// Configure PWA with next-pwa
// Note: next-pwa uses webpack, so we need to use webpack mode for builds
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  reloadOnOnline: true,
  fallbacks: {
    document: '/_offline',
  },
  disableDevLogs: true,
});

export default pwaConfig(nextConfig);
