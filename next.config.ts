import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is the default bundler in Next.js 16
  // No additional configuration needed for basic setup
  
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,
  
  // Optimize package imports for better performance
  optimizePackageImports: [
    '@supabase/supabase-js',
    '@supabase/ssr',
    'ai',
    'recharts',
    'lucide-react',
  ],
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
